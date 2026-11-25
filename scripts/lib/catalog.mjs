/** 카탈로그 전용 TypeScript 읽기 분석. 다른 파이프라인에는 compiler API를 로드하지 않는다. */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { writeGenerated } from "./emit.mjs";

export const STARTER_CATALOG_BASELINE = "scripts/starter-catalog-baseline.json";
const behaviorHashKeys = ["codeHash", "cssHash", "dependencyHash"];
const hash = (value) => createHash("sha256").update(value).digest("hex");
const sorted = (items) => [...items].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
const oneLine = (text) => String(text).replace(/\s+/g, " ").trim();
const read = (path) => readFileSync(path, "utf8");
const local = (root, path) => path === root || path.startsWith(root + sep);
const slash = (path) => path.split(sep).join("/");
const digestFiles = (root, paths) => hash(JSON.stringify(sorted(paths).map((p) => [slash(relative(root, p)), read(p)])));

export async function loadCatalogTypescript() {
  try { return (await import("typescript")).default; }
  catch { throw new Error("Catalog step skipped: cannot load typescript. Check that the devDependencies are installed."); }
}

function readReviews(root) {
  const path = join(root, ".ds/catalog-review.json");
  if (!existsSync(path)) return {};
  let data;
  try { data = JSON.parse(read(path)); }
  catch { throw new Error("The human review file .ds/catalog-review.json is not valid JSON. The file was not changed."); }
  if (data.schemaVersion !== 1 || !data.components || Array.isArray(data.components) || typeof data.components !== "object") {
    throw new Error("The human review file needs schemaVersion: 1 and a components object.");
  }
  return data.components;
}

function readStarterBaseline(root) {
  const path = join(root, STARTER_CATALOG_BASELINE);
  if (!existsSync(path)) return {};
  let data;
  try { data = JSON.parse(read(path)); }
  catch { throw new Error(`The starter catalog baseline ${STARTER_CATALOG_BASELINE} is not valid JSON.`); }
  if (data.schemaVersion !== 1 || data.hashAlgorithm !== "catalog-v1" || !data.components || Array.isArray(data.components) || typeof data.components !== "object") {
    throw new Error(`The starter catalog baseline ${STARTER_CATALOG_BASELINE} needs schemaVersion: 1, hashAlgorithm: catalog-v1 and a components object.`);
  }
  for (const [name, versions] of Object.entries(data.components)) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name) || !versions || Array.isArray(versions) || typeof versions !== "object"
        || Object.keys(versions).length !== behaviorHashKeys.length || !behaviorHashKeys.every((key) => /^[a-f0-9]{64}$/.test(versions[key] ?? ""))) {
      throw new Error(`The starter catalog baseline entry for ${name} is invalid.`);
    }
  }
  return data.components;
}

function reviewState(row, record, starter) {
  const result = { status: "unverified", pageUse: false, scopeMode: "reviewed", scope: [], evidence: null, behavior: { status: "unverified" }, visual: { status: "unverified" }, reason: "No starter baseline or student review yet" };
  if (row.problems.length) return { ...result, status: "failed", behavior: { status: "failed" }, reason: "unsupported_api: " + row.problems.join("; ") };
  // An explicit student review always wins, including a rejection. The committed starter
  // baseline is only the fallback for a part that has no student review record.
  if (record === undefined && starter !== undefined) {
    const changed = behaviorHashKeys.filter((key) => starter[key] !== row.hashes[key]);
    if (!changed.length) return {
      ...result,
      status: "starter",
      pageUse: true,
      scopeMode: "public_api",
      evidence: { source: { kind: "starter", ref: STARTER_CATALOG_BASELINE } },
      behavior: { status: "starter" },
      visual: { status: "starter" },
      reason: "Starter part, unchanged",
    };
    return {
      ...result,
      status: "stale",
      behavior: { status: "stale" },
      visual: { status: "stale" },
      reason: `Starter part changed: ${changed.join(", ")}. The student must run pnpm ds:review ${row.name} in a terminal.`,
    };
  }
  if (record === undefined) return result;
  const text = (v) => typeof v === "string" && v.trim().length > 0;
  const validScope = (scope) => scope && !Array.isArray(scope) && typeof scope === "object"
    && scope.props && !Array.isArray(scope.props) && typeof scope.props === "object"
    && Object.entries(scope.props).every(([name, value]) => {
      const options = row.props.find((p) => p.name === name)?.options ?? row.nativeScopeOptions[name];
      return Array.isArray(options) && options.includes(value);
    })
    && Array.isArray(scope.states) && scope.states.length > 0 && scope.states.every(text);
  // 검수 범위가 나뉘기 전의 평면 기록은 두 검수 범위의 기존 근거로 읽으며 디스크에서 변환하지 않는다.
  const split = record?.reviewVersion === 2;
  const behavior = split ? record.behavior : record;
  const visual = split ? record.visual : record;
  if (!record || (record.reviewVersion !== undefined && !split) || !text(record.reviewer) || !text(record.evidenceId) || !text(record.reviewedAt)
      || !Number.isFinite(Date.parse(record.reviewedAt))
      || ![behavior, visual].every((part) => part && ["approved", "rejected"].includes(part.decision))
      || !record.source || !["figma", "spec"].includes(record.source.kind) || !text(record.source.ref)
      || !Array.isArray(record.scope) || !record.scope.length || !record.scope.every(validScope)
      || !["codeHash", "cssHash", "dependencyHash"].every((key) => /^[a-f0-9]{64}$/.test(behavior[key] ?? ""))
      || !/^[a-f0-9]{64}$/.test(visual.tokensHash ?? "")) {
    return { ...result, status: "failed", behavior: { status: "failed" }, visual: { status: "failed" }, reason: "Human review record is invalid: missing fields, props outside the public API, or a bad hash format" };
  }
  const evidence = { reviewer: record.reviewer, evidenceId: record.evidenceId, reviewedAt: record.reviewedAt, source: record.source };
  const changed = behaviorHashKeys.filter((key) => behavior[key] !== row.hashes[key]);
  const behavioral = behavior.decision === "rejected" ? { status: "failed", reason: "Human review rejected" }
    : changed.length ? { status: "stale", reason: "Changed since review: " + changed.join(", ") }
    : { status: "approved_scope", reason: "Can be used only within the reviewed scope" };
  const appearance = visual.decision === "rejected" ? { status: "failed", reason: "Visual review rejected" }
    : changed.length ? { status: "stale", reason: "Behavior/structure changed: review the visuals again too" }
    : visual.tokensHash !== row.hashes.tokensHash ? { status: "needs_review", reason: "Token values changed: check the visuals again" }
    : { status: "approved_scope", reason: "Matches the reviewed token values" };
  return { status: behavioral.status, pageUse: behavioral.status === "approved_scope", scopeMode: "reviewed", scope: behavioral.status === "approved_scope" ? record.scope : [], evidence,
    behavior: behavioral, visual: appearance, reason: behavioral.reason + (appearance.status === "needs_review" ? "; " + appearance.reason : "") };
}

/** 디스크 수정 없이 현재 공개 API와 검수 상태를 계산한다. */
export async function buildCatalog(root, { typescriptLoader = loadCatalogTypescript } = {}) {
  root = resolve(root);
  const ts = await typescriptLoader();
  const configFile = join(root, "ds.config.json");
  const config = existsSync(configFile) ? JSON.parse(read(configFile)) : {};
  const componentsDir = resolve(root, config.output?.componentsDir ?? "src/components");
  if (!local(root, componentsDir)) throw new Error("The catalog parts folder must be inside the project folder.");
  const dirs = existsSync(componentsDir) ? sorted(readdirSync(componentsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) : [];
  const indices = dirs.map((name) => join(componentsDir, name, "index.ts")).filter(existsSync);
  let options = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler, jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, noEmit: true };
  const tsconfig = join(root, "tsconfig.json");
  if (existsSync(tsconfig)) {
    const parsed = ts.readConfigFile(tsconfig, ts.sys.readFile);
    if (parsed.error) throw new Error("Catalog: cannot read tsconfig.json.");
    const result = ts.parseJsonConfigFileContent(parsed.config, ts.sys, root);
    if (result.errors.length) throw new Error("Catalog: tsconfig.json settings have errors.");
    options = { ...options, ...result.options, noEmit: true, incremental: false };
  }
  const program = ts.createProgram(indices, options);
  const checker = program.getTypeChecker();
  const printer = ts.createPrinter({ removeComments: true });
  const print = (node) => {
    const text = printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile());
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, text);
    let output = "";
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
      if ([ts.SyntaxKind.WhitespaceTrivia, ts.SyntaxKind.NewLineTrivia].includes(token)) {
        if (!output.endsWith(" ")) output += " ";
      } else output += scanner.getTokenText();
    }
    return output.trim(); // 리터럴 내부의 공백은 토큰 원문 그대로 보존한다.
  };
  const symbolAt = (node) => {
    let s = checker.getSymbolAtLocation(node);
    if (s?.flags & ts.SymbolFlags.Alias) s = checker.getAliasedSymbol(s);
    return s;
  };
  const resolveImport = (from, spec) => {
    const module = ts.resolveModuleName(spec, from, options, ts.sys).resolvedModule;
    if (module && local(root, module.resolvedFileName) && !module.resolvedFileName.includes(`${sep}node_modules${sep}`)) return module.resolvedFileName;
    const asset = resolve(dirname(from), spec);
    if ((spec.startsWith(".") || from.endsWith(".css")) && existsSync(asset) && local(root, asset)) return asset;
    return null;
  };
  const dependencies = (entry, extra) => {
    const files = new Set();
    const problems = [];
    const follow = (path, spec) => {
      const found = resolveImport(path, spec);
      if (found) visit(found);
      else if (spec.startsWith(".") || spec.startsWith("@/")) problems.push(`Cannot resolve imported file: ${slash(relative(root, path))} → ${spec}`);
    };
    const visit = (path) => {
      if (files.has(path)) return;
      files.add(path);
      if (path.endsWith(".css")) {
        for (const match of read(path).matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) follow(path, match[1]);
        return;
      }
      if (path.endsWith(".json")) return;
      const sf = program.getSourceFile(path) ?? ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true);
      const scan = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
          follow(path, node.moduleSpecifier.text);
        } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === "require"))) {
          if (node.arguments.length === 1 && ts.isStringLiteral(node.arguments[0])) follow(path, node.arguments[0].text);
          else problems.push(`Dynamic import paths are not supported: ${slash(relative(root, path))}`);
        }
        ts.forEachChild(node, scan);
      };
      scan(sf);
    };
    visit(entry);
    extra.forEach(visit);
    return { files, problems };
  };
  const tokenPaths = [config.output?.tokensCss ?? "src/tokens/tokens.css", config.output?.tokensJson ?? ".ds/tokens.json"].map((p) => resolve(root, p));
  if (tokenPaths.some((p) => !local(root, p))) throw new Error("The catalog token paths must be inside the project folder.");
  const tokensHash = digestFiles(root, tokenPaths.filter(existsSync));
  const reviews = readReviews(root);
  const starterBaseline = readStarterBaseline(root);
  const descriptionPath = resolve(root, config.output?.descriptions ?? ".ds/descriptions.json");
  if (!local(root, descriptionPath)) throw new Error("The catalog descriptions path must be inside the project folder.");
  const descriptions = existsSync(descriptionPath) ? JSON.parse(read(descriptionPath)) : {};
  const rows = [];
  for (const entry of indices) {
    const sf = program.getSourceFile(entry);
    const moduleSymbol = sf && checker.getSymbolAtLocation(sf);
    if (!moduleSymbol) throw new Error(`Catalog: cannot read the public exports of ${relative(root, entry)}`);
    for (const exported of checker.getExportsOfModule(moduleSymbol).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const value = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      if (!(value.flags & ts.SymbolFlags.Value) || (!/^[A-Z]/.test(exported.name) && exported.name !== "default")) continue;
      const declaration = value.valueDeclaration ?? value.declarations?.[0];
      const row = { name: exported.name === "default" ? dirname(entry).split(sep).pop() : exported.name, exportKind: exported.name === "default" ? "default" : "named", importPath: `@/${slash(relative(join(root, "src"), dirname(entry)))}`, source: slash(relative(root, entry)), role: "역할 미기록", notes: "", props: [], native: [], nativeScopeOptions: {}, shapes: [], problems: [], checks: { status: "not_run", results: [] } };
      const fail = (message) => { if (!row.problems.includes(message)) row.problems.push(message); };
      const typeFiles = new Set();
      const shapeNodes = new Map();
      const shapeAliases = new Map();
      const visited = new Set();
      const reactNames = new Set(["ReactNode", "ReactElement", "CSSProperties", "ChangeEvent", "MouseEvent", "KeyboardEvent", "FocusEvent", "FormEvent", "DragEvent", "Ref", "RefCallback", "RefObject"]);
      const globals = new Set(["Array", "ReadonlyArray", "Record", "Partial", "Required", "Readonly", "Pick", "Omit", "Exclude", "Extract", "NonNullable", "Promise", "Date", "File", "FileList", "Event", "HTMLElement", "HTMLInputElement", "HTMLButtonElement", "HTMLDivElement", "HTMLSpanElement", "HTMLAnchorElement", "HTMLTextAreaElement", "HTMLSelectElement", "HTMLUListElement", "SVGSVGElement"]);
      const reactDeclaration = (s) => s?.declarations?.some((d) => /[/\\]@types[/\\]react[/\\]/.test(d.getSourceFile().fileName));
      const inspectType = (node) => {
        if (!node) { fail("missing type annotation"); return; }
        if (ts.isConditionalTypeNode(node) || ts.isMappedTypeNode(node) || ts.isInferTypeNode(node) || ts.isTypeQueryNode(node) || ts.isImportTypeNode(node) || ts.isIndexedAccessTypeNode(node) || ts.isTemplateLiteralTypeNode(node) || ts.isConstructorTypeNode(node) || (ts.isTypeOperatorNode(node) && node.operator !== ts.SyntaxKind.ReadonlyKeyword)) {
          fail(`unsupported type syntax: ${print(node)}`); return;
        }
        if (node.kind === ts.SyntaxKind.AnyKeyword || node.kind === ts.SyntaxKind.UnknownKeyword) { fail(`type is too loose to pin down: ${print(node)}`); return; }
        if (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node)) {
          const target = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
          const name = target.getText().split(".").pop();
          const symbol = symbolAt(target);
          const declarations = symbol?.declarations ?? [];
          const defs = declarations.filter((d) => local(root, d.getSourceFile().fileName) && !d.getSourceFile().fileName.includes(`${sep}node_modules${sep}`));
          if (reactDeclaration(symbol) && (reactNames.has(name) || /^(?:\w*HTMLAttributes|HTMLAttributes|SVGProps)$/.test(name))) {
            // React의 네이티브 속성/이벤트는 공통 상속 계약으로 표시하고 확장하지 않는다.
          } else if (declarations.length && !defs.length && globals.has(name) && declarations.some((d) => /[/\\]typescript[/\\]lib[/\\]lib\./.test(d.getSourceFile().fileName))) {
            // 표준 라이브러리의 알려진 자료형/유틸리티만 허용한다.
          } else if (defs.length) {
            if (ts.isQualifiedName(target) || ts.isPropertyAccessExpression(target)) fail(`local namespace types are not supported: ${print(target)}`);
            for (const def of defs) {
              if (!ts.isTypeAliasDeclaration(def) && !ts.isInterfaceDeclaration(def)) { fail(`cannot read the type declaration: ${name}`); continue; }
              typeFiles.add(def.getSourceFile().fileName);
              if (def.typeParameters?.length) { fail(`custom generic types are not supported: ${name}`); continue; }
              const canonical = def.name.text;
              if (shapeNodes.has(canonical) && shapeNodes.get(canonical) !== def) fail(`two different types with the same name: ${canonical}`);
              shapeNodes.set(canonical, def);
              if (name !== canonical) {
                if (shapeAliases.has(name) && shapeAliases.get(name) !== canonical) fail(`type alias conflict: ${name}`);
                shapeAliases.set(name, canonical);
              }
              if (!visited.has(def)) {
                visited.add(def);
                if (ts.isTypeAliasDeclaration(def)) inspectType(def.type);
                else {
                  def.heritageClauses?.forEach((h) => h.types.forEach(inspectType));
                  def.members.forEach((m) => { if (ts.isPropertySignature(m) || ts.isMethodSignature(m)) inspectMember(m); else fail(`unsupported type member: ${print(m)}`); });
                }
              }
            }
          } else fail(`cannot resolve the referenced type: ${print(target)}`);
          node.typeArguments?.forEach(inspectType);
          return;
        }
        if (ts.isFunctionTypeNode(node)) {
          if (node.typeParameters?.length) fail(`generic callbacks are not supported: ${print(node)}`);
          node.parameters.forEach((p) => inspectType(p.type));
          inspectType(node.type); return;
        }
        if (ts.isTypeLiteralNode(node)) {
          node.members.forEach((m) => { if (ts.isPropertySignature(m) || ts.isMethodSignature(m)) inspectMember(m); else fail(`unsupported inline type member: ${print(m)}`); });
          return;
        }
        ts.forEachChild(node, (child) => { if (ts.isTypeNode(child)) inspectType(child); });
      };
      const inspectMember = (member) => {
        if (ts.isMethodSignature(member)) {
          if (member.typeParameters?.length) fail(`generic methods are not supported: ${print(member)}`);
          member.parameters.forEach((p) => inspectType(p.type)); inspectType(member.type);
        } else inspectType(member.type);
      };
      const propNodes = new Map();
      const collectProps = (node, seen = new Set()) => {
        if (!node) { fail("cannot find the public props type"); return; }
        if (ts.isIntersectionTypeNode(node)) { node.types.forEach((t) => collectProps(t, seen)); return; }
        if (ts.isTypeLiteralNode(node)) { node.members.forEach(addProp); return; }
        if (ts.isTypeReferenceNode(node) || ts.isExpressionWithTypeArguments(node)) {
          const target = ts.isTypeReferenceNode(node) ? node.typeName : node.expression;
          const name = target.getText().split(".").pop();
          if (["Omit", "Pick", "Partial", "Required", "Readonly"].includes(name)) {
            inspectType(node);
            const before = new Map(propNodes);
            const beforeNative = row.native.length;
            collectProps(node.typeArguments?.[0], seen);
            if (row.native.length > beforeNative) row.native.splice(beforeNative, row.native.length - beforeNative, print(node));
            const keysType = node.typeArguments?.[1];
            const keys = keysType ? checker.getTypeFromTypeNode(keysType) : null;
            const values = keys ? (keys.isUnion() ? keys.types : [keys]).map((t) => t.value) : [];
            for (const [key, val] of propNodes) {
              if (before.has(key)) continue;
              if ((name === "Omit" && values.includes(key)) || (name === "Pick" && !values.includes(key))) propNodes.delete(key);
              else if (name === "Partial" || name === "Required") propNodes.set(key, { ...val, required: name === "Required" });
            }
            return;
          }
          const symbol = symbolAt(target);
          if (reactDeclaration(symbol) && /^(?:\w*HTMLAttributes|HTMLAttributes|SVGProps)$/.test(name)) {
            row.native.push(print(node)); inspectType(node); return;
          }
          const def = symbol?.declarations?.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
          if (!def || !local(root, def.getSourceFile().fileName) || def.getSourceFile().fileName.includes(`${sep}node_modules${sep}`)) { fail(`unsupported props declaration: ${print(node)}`); return; }
          if (seen.has(def)) { fail("props inherit from each other in a loop"); return; }
          const next = new Set([...seen, def]);
          typeFiles.add(def.getSourceFile().fileName);
          if (def.typeParameters?.length) { fail(`generic props are not supported: ${def.name.text}`); return; }
          if (ts.isTypeAliasDeclaration(def)) collectProps(def.type, next);
          else {
            def.heritageClauses?.forEach((h) => h.types.forEach((t) => collectProps(t, next)));
            def.members.forEach(addProp);
          }
          return;
        }
        fail(`unsupported props syntax: ${print(node)}`);
      };
      const addProp = (member) => {
        if ((!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) || !member.name || ts.isComputedPropertyName(member.name)) { fail(`unsupported props member: ${print(member)}`); return; }
        inspectMember(member);
        const name = member.name.text;
        const type = ts.isMethodSignature(member) ? `(${member.parameters.map(print).join(", ")}) => ${member.type ? print(member.type) : "unknown"}` : member.type ? print(member.type) : "unknown";
        const resolved = member.type && checker.getTypeFromTypeNode(member.type);
        const parts = resolved?.isUnion() ? resolved.types : resolved ? [resolved] : [];
        const values = parts.map((t) => t.isLiteral?.() ? t.value : t.flags & ts.TypeFlags.BooleanLiteral ? t.intrinsicName === "true" : undefined);
        const options = values.length && values.every((v) => v !== undefined) ? values : null;
        const doc = ts.displayPartsToString(checker.getSymbolAtLocation(member.name)?.getDocumentationComment(checker) ?? []);
        propNodes.set(name, { name, type, required: !member.questionToken, default: "unknown", event: /^on[A-Z]/.test(name), ...(options ? { options } : {}), ...(doc ? { note: oneLine(doc) } : {}) });
      };
      let fn, propsType;
      if (declaration && ts.isVariableDeclaration(declaration) && declaration.initializer && ts.isCallExpression(declaration.initializer)) {
        const call = declaration.initializer;
        const callee = symbolAt(call.expression);
        if (callee?.name === "forwardRef" && reactDeclaration(callee)) {
          propsType = call.typeArguments?.[1];
          fn = call.arguments.find((a) => ts.isFunctionExpression(a) || ts.isArrowFunction(a));
        } else fail("wrappers other than forwardRef and dynamic component APIs are not supported");
      } else if (declaration && (ts.isFunctionDeclaration(declaration) || (ts.isVariableDeclaration(declaration) && declaration.initializer && ts.isArrowFunction(declaration.initializer)))) {
        fn = ts.isFunctionDeclaration(declaration) ? declaration : declaration.initializer;
        propsType = fn.parameters[0]?.type;
      } else fail("cannot read the public component declaration");
      if (fn?.typeParameters?.length) fail("generic components are not supported");
      if (!fn || fn.parameters.length) collectProps(propsType);
      // 리터럴 기본값만 확정한다. 함수 호출/locale/식의 결과를 실행하거나 추측하지 않는다.
      if (fn?.parameters[0] && ts.isObjectBindingPattern(fn.parameters[0].name)) {
        for (const binding of fn.parameters[0].name.elements) {
          if (!binding.initializer) continue;
          const name = binding.propertyName?.text ?? binding.name.text;
          const node = binding.initializer;
          const constant = ts.isStringLiteral(node) || ts.isNumericLiteral(node) || [ts.SyntaxKind.TrueKeyword, ts.SyntaxKind.FalseKeyword, ts.SyntaxKind.NullKeyword].includes(node.kind)
            || (ts.isPrefixUnaryExpression(node) && [ts.SyntaxKind.PlusToken, ts.SyntaxKind.MinusToken].includes(node.operator) && ts.isNumericLiteral(node.operand))
            || (ts.isArrayLiteralExpression(node) && node.elements.length === 0) || (ts.isObjectLiteralExpression(node) && node.properties.length === 0);
          if (propNodes.has(name)) propNodes.get(name).default = constant ? print(node) : "unknown (dynamic expression)";
          else if (row.native.length) row.nativeDefaults ??= {};
          if (!propNodes.has(name) && row.native.length && constant) row.nativeDefaults[name] = print(node);
        }
      }
      row.props = [...propNodes.values()];
      row.native = [...new Set(row.native)];
      if (propsType && row.native.length) {
        for (const prop of checker.getTypeFromTypeNode(propsType).getProperties()) {
          const type = checker.getTypeOfSymbolAtLocation(prop, propsType);
          const parts = (type.isUnion() ? type.types : [type]).filter((t) => !(t.flags & ts.TypeFlags.Undefined));
          const values = parts.map((t) => t.isLiteral?.() ? t.value : t.flags & ts.TypeFlags.BooleanLiteral ? t.intrinsicName === "true" : undefined);
          if (values.length && values.every((v) => v !== undefined)) row.nativeScopeOptions[prop.name] = values;
        }
      }
      row.shapes = sorted(shapeNodes.keys()).map((name) => ({ name, declaration: print(shapeNodes.get(name)) }));
      for (const name of sorted(shapeAliases.keys())) {
        if (shapeNodes.has(name)) fail(`a type alias and a type have the same name: ${name}`);
        row.shapes.push({ name, declaration: `type ${name} = ${shapeAliases.get(name)};` });
      }
      const doc = ts.displayPartsToString(value.getDocumentationComment(checker));
      if (doc) { row.role = oneLine(doc.split(/\n\s*\n/)[0]); row.notes = doc.trim(); }
      else if (["human", "figma"].includes(descriptions[row.name]?.source) && typeof descriptions[row.name]?.description === "string") row.role = oneLine(descriptions[row.name].description);
      if (declaration) {
        const ownSf = declaration.getSourceFile();
        const errors = [...program.getSyntacticDiagnostics(ownSf), ...program.getSemanticDiagnostics(ownSf)].filter((d) => d.category === ts.DiagnosticCategory.Error && d.code !== 2882);
        for (const d of errors) fail(`TypeScript ${d.code}: ${oneLine(ts.flattenDiagnosticMessageText(d.messageText, " "))}`);
      }
      const { files, problems } = dependencies(entry, [...typeFiles]);
      problems.forEach(fail);
      const ownDir = dirname(entry);
      const ownCode = [...files].filter((p) => local(ownDir, p) && !p.endsWith(".css"));
      const ownCss = [...files].filter((p) => local(ownDir, p) && p.endsWith(".css"));
      const other = [...files].filter((p) => !local(ownDir, p));
      // 외부 React/라이브러리 버전 변경도 기존 검수를 그대로 재사용하지 않는다.
      const lockfile = join(root, "pnpm-lock.yaml");
      if (existsSync(lockfile)) other.push(lockfile);
      row.dependencies = sorted(other.map((p) => slash(relative(root, p))));
      row.hashes = { codeHash: digestFiles(root, ownCode), cssHash: digestFiles(root, ownCss), dependencyHash: digestFiles(root, other), tokensHash };
      row.apiStatus = row.problems.length ? "unsupported_api" : "supported";
      row.review = reviewState(row, reviews[row.name], starterBaseline[row.name]);
      rows.push(row);
    }
  }
  rows.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  if (new Set(rows.map((r) => r.name)).size !== rows.length) throw new Error("The catalog has two public parts with the same name. Give the exports different names.");
  return { schemaVersion: 1, tokensHash, inventoryHash: hash(JSON.stringify(rows)), rows };
}

const code = (text) => "`" + String(text).replaceAll("`", "&#96;").replaceAll("\n", " ") + "`";
// "역할 미기록"은 docs.mjs가 비교하는 내부 표식이다. 값은 그대로 두고 출력에서만 영어로 보인다.
const roleText = (role) => role === "역할 미기록" ? "(no role written)" : role;
export function renderCatalogSection(row) {
  const statement = row.exportKind === "default" ? `import ${row.name} from "${row.importPath}"` : `import { ${row.name} } from "${row.importPath}"`;
  const pageUse = !row.review.pageUse ? "blocked" : row.review.scopeMode === "public_api" ? "full public API" : "reviewed scope only";
  const lines = [`## ${row.name}`, "", `Role: ${roleText(row.role)}`, `Import: ${code(statement)}`, `Source: ${code(row.source)}`, `Status: ${row.review.status}; API: ${row.apiStatus}; Page use: ${pageUse}; Auto checks: not_run`, `Reason: ${row.review.reason}`, "", "### Public props (! = required, ? = optional)"];
  row.props.forEach((p) => lines.push(`- ${code(p.name + (p.required ? "!" : "?") + ": " + p.type)}; default: ${code(p.default)}${p.event ? "; event" : ""}${p.note ? "; " + p.note : ""}`));
  lines.splice(7, 0, `Behavior/structure/API: ${row.review.status}; Visual: ${row.review.visual.status}${row.review.visual.status === "needs_review" ? " (check again)" : ""}`);
  if (row.native.length) lines.push("", `Native attributes: ${row.native.map(code).join("; ")}. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.`, ...(row.nativeDefaults ? [`Native defaults: ${code(JSON.stringify(row.nativeDefaults))}`] : []));
  if (row.shapes.length) lines.push("", "Types:", "````ts", ...row.shapes.map((s) => s.declaration), "````");
  if (row.notes) lines.push("", "Notes written in the code (not proof of review):", ...row.notes.split("\n").map((line) => "> " + line));
  lines.push("", "Review scope: " + code(row.review.scopeMode === "public_api" ? "full public API and shipped states" : JSON.stringify(row.review.scope)), "Review evidence: " + code(JSON.stringify(row.review.evidence)), "Versions: " + code(JSON.stringify(row.hashes)));
  if (row.dependencies.length) lines.push("Depends on: " + row.dependencies.map(code).join(", "));
  return lines.join("\n") + "\n";
}

export function renderCatalogList(catalog) {
  return catalog.rows.map((row) => `${row.name} | ${roleText(row.role)} | ${row.review.status}${row.apiStatus === "unsupported_api" ? "/unsupported_api" : ""} | visual: ${row.review.visual.status}`).join("\n") + (catalog.rows.length ? "\n" : "");
}

export function selectCatalog(catalog, names = []) {
  if (!names.length) return renderCatalogList(catalog);
  const selected = [...new Set(names)].map((name) => {
    const row = catalog.rows.find((r) => r.name === name);
    if (!row) throw new Error(`Part not in the catalog: ${name}`);
    return renderCatalogSection(row);
  });
  return selected.join("\n");
}

export function renderCatalog(catalog) {
  return ["# Parts catalog", "", `Schema: ${catalog.schemaVersion}; Inventory: ${catalog.inventoryHash}; Tokens: ${catalog.tokensHash}`, "", "Look up parts: pnpm ds:catalog [part names...]. The command only reads the current code, starter baseline and student review records and works out the latest state.", "An unchanged starter part can use its full public API and shipped states. A changed part is blocked until the student checks it with pnpm ds:review <Name>; that approval is valid only for the recorded props/states. If only token values change after a student review, behavior approval still counts and visuals become needs_review. Do not use failed, unreadable or stale parts.", "Native attributes show what the type allows. They are not permission to override a part's look on a page. Auto check results are not_run in this version.", "A default of unknown does not mean there is no value. Notes from the code do not replace usage examples or an accessibility review.", `Starter baseline: ${STARTER_CATALOG_BASELINE}. Release maintainers update it with pnpm ds:starter-baseline. Student review records: .ds/catalog-review.json (the generator only reads them).`, "", ...catalog.rows.map(renderCatalogSection)].join("\n");
}

export function starterCatalogBaseline(catalog) {
  const unsupported = catalog.rows.filter((row) => row.apiStatus !== "supported");
  if (unsupported.length) throw new Error(`Cannot update the starter baseline while public APIs are unsupported: ${unsupported.map((row) => row.name).join(", ")}`);
  return {
    schemaVersion: 1,
    hashAlgorithm: "catalog-v1",
    components: Object.fromEntries(catalog.rows.map((row) => [row.name, Object.fromEntries(behaviorHashKeys.map((key) => [key, row.hashes[key]]))])),
  };
}

export async function generateCatalog(root, options) {
  const catalog = await buildCatalog(root, options);
  const path = join(root, "src/docs/CATALOG.md");
  const result = writeGenerated(path, renderCatalog(catalog), "Made from the real public exports, starter baseline and student review versions");
  return { catalog, result, path };
}

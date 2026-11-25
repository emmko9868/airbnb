import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { buildCatalog, loadCatalogTypescript } from "./catalog.mjs";
import { assertPlanUnchanged } from "./component-plan.mjs";
import { eachImage, eachUse, findPagePlan, pageCss, pageEntry, readPagePlan } from "./page-plan.mjs";
import { readWebProject } from "./web-project.mjs";

function need(ok, message) { if (!ok) throw new Error(message); }
const json = (value) => JSON.stringify(value);
const deniedProps = new Set(["style", "className", "dangerouslySetInnerHTML", "ref", "key", "color"]);
function defaultValue(prop) {
  try { return JSON.parse(prop.default); } catch { return /^(['"]).*\1$/.test(prop.default ?? "") ? prop.default.slice(1, -1) : undefined; }
}

export async function pageCatalog(root, plan) {
  const catalog = await buildCatalog(root), selected = new Map();
  for (const page of plan.spec.pages) eachUse(page, (use) => {
    const row = catalog.rows.find((r) => r.name === use.component);
    need(row && row.apiStatus === "supported" && row.review.pageUse, `BLOCKED_CATALOG: ${use.component} needs a supported public API and either an unchanged starter baseline or the student's review of its current version.`);
    need(["codeHash", "cssHash", "dependencyHash"].every((key) => plan.spec.catalog[use.component][key] === row.hashes[key]), `BLOCKED_CATALOG: ${use.component} changed after the page plan was approved. Check the page plan again.`);
    const props = { ...use.props, ...Object.fromEntries(Object.keys(use.bindings ?? {}).map((p) => [p, undefined])) };
    for (const key of Object.keys(props)) {
      need(!deniedProps.has(key), `P06: ${use.component}.${key} cannot be used to override the part's look.`);
      need(row.props.some((p) => p.name === key) || row.native.length > 0, `P04: ${use.component}.${key} is not a public prop.`);
    }
    const options = row.props.filter((p) => p.options).map((p) => [p.name, p]);
    for (const [name, prop] of options) {
      if (Object.hasOwn(use.props, name)) need(prop.options.includes(use.props[name]), `P04: this ${use.component}.${name} value is not in the public API.`);
    }
    const scopeMatches = row.review.scopeMode === "public_api" || row.review.scope.some((scope) => {
      if (!use.states.every((s) => scope.states.includes(s))) return false;
      // scope.props={}는 기본값 조합만 뜻한다. 빠진 variant도 기본값을 검증한다.
      const scoped = new Set([...options.map(([name]) => name), ...Object.keys(scope.props), ...Object.keys(use.props).filter((name) => row.nativeScopeOptions[name])]);
      return [...scoped].every((name) => {
        if (Object.hasOwn(use.bindings ?? {}, name)) return false;
        const prop = row.props.find((p) => p.name === name) ?? { default: row.nativeDefaults?.[name] };
        const actual = Object.hasOwn(use.props, name) ? use.props[name] : defaultValue(prop);
        const expected = Object.hasOwn(scope.props, name) ? scope.props[name] : defaultValue(prop);
        return actual === expected && (actual !== undefined || !prop.required);
      });
    });
    need(scopeMatches, `BLOCKED_CATALOG: the props/states of ${use.component}/${use.id} are outside what the human review covered.`);
    if (typeof use.props.href === "string" && use.props.href.startsWith("/")) need(plan.spec.pages.some((p) => p.path === use.props.href), `P08: link path not in the plan: ${use.props.href}`);
    selected.set(row.name, row);
  });
  return selected;
}

function itemMarkup(page, use) {
  if (Object.hasOwn(use, "image")) return `<img key=${json(use.id)} className=${json(`page-${page.name}__${use.id}`)} src={imageUrl(${json(use.image)})} alt={${json(use.alt)}} />`;
  const attrs = [`key=${json(use.id)}`, ...Object.entries(use.props).map(([key, value]) => `${key}={${json(value)}}`), ...Object.entries(use.bindings ?? {}).map(([key, binding]) => `${key}={${binding.name}}`)];
  const children = (use.children ?? []).map((child) => typeof child === "string" ? `{${json(child)}}` : itemMarkup(page, child)).join("");
  return `<${use.component} ${attrs.join(" ")}>${children}</${use.component}>`;
}
export function pageMarkup(page) {
  return `<main className="page-${page.name}">${page.sections.map((s) => `<${s.tag ?? "section"} className="page-${page.name}__${s.id}" data-section="${s.id}"${Object.entries(s.bindings ?? {}).map(([prop, b]) => ` ${prop}={${b.name}}`).join("")}>${s.items.map((item) => itemMarkup(page, item)).join("")}</${s.tag ?? "section"}>`).join("")}</main>`;
}
function pageSource(root, plan, page, rows) {
  const names = new Set(), slots = new Map();
  let hasImages = false; eachImage(page, () => { hasImages = true; });
  eachUse(page, (use) => { names.add(use.component); for (const [prop, binding] of Object.entries(use.bindings ?? {})) {
    need(!names.has(binding.name), "A binding has the same name as a part.");
    const event = /^on[A-Z]/.test(prop);
    need(!slots.has(binding.name) || slots.get(binding.name) === event, "The same binding cannot be used for both an event and data."); slots.set(binding.name, event);
  } });
  for (const section of page.sections) for (const binding of Object.values(section.bindings ?? {})) {
    need(!slots.has(binding.name) || slots.get(binding.name) === true, "The same binding cannot be used for both an event and data."); slots.set(binding.name, true);
  }
  need(!hasImages || !slots.has("imageUrl"), "A page binding cannot use the reserved imageUrl name when the plan has an image.");
  const imports = [...names].sort().map((name) => { const row = rows.get(name); return row.exportKind === "default" ? `import ${name} from ${json(row.importPath)};` : `import { ${name} } from ${json(row.importPath)};`; });
  if (hasImages) imports.push('import { imageUrl } from "@/assets/images";');
  return `// ds-page-plan: ${relative(root, plan.path).split("\\").join("/")} ${plan.digest}\n${imports.join("\n")}\nimport "./${page.name}Page.css";\n\nexport default function ${page.name}Page() {\n${[...slots].map(([name, event]) => event ? `  const ${name} = () => { throw new Error("PAGE_SLOT:${name}"); };` : `  const ${name} = undefined; // PAGE_SLOT:${name}`).join("\n")}\n  return (${pageMarkup(page)});\n}\n`;
}

/** 기존 사용자 파일은 절대 덮어쓰지 않는다. 모든 검증·충돌 확인 후에만 쓴다. */
export async function generatePages(root, filename) {
  const plan = readPagePlan(root, filename), rows = await pageCatalog(root, plan);
  const files = new Map();
  const ts = await loadCatalogTypescript();
  for (const page of plan.spec.pages) {
    const source = pageSource(root, plan, page, rows);
    need(ts.createSourceFile("page.tsx", source, 99, true, ts.ScriptKind.TSX).parseDiagnostics.length === 0, "The binding/prop names do not make a valid TSX skeleton.");
    files.set(pageEntry(page.name), source);
    files.set(pageEntry(page.name).replace(/\.tsx$/, ".css"), pageCss(root, page));
  }
  const configPath = join(root, "web.config.json");
  try { need(!lstatSync(configPath).isSymbolicLink(), "Will not write web.config.json when it is a link."); } catch (error) { if (error.code !== "ENOENT") throw error; }
  const configBefore = existsSync(configPath) ? readFileSync(configPath, "utf8") : null;
  const current = configBefore === null ? null : JSON.parse(configBefore);
  need(!current || (current.schema_version === 1 && current.entry === null && !current.routes?.length && !current.title), "Web settings are already connected. They are not replaced automatically. Compare the plan with the current file yourself.");
  need(!current || Object.keys(current).every((key) => ["schema_version", "entry", "title", "locale", "routes"].includes(key)), "web.config.json has extra settings. It is not replaced automatically.");
  for (const path of files.keys()) {
    need(!existsSync(join(root, path)), `Keeping the existing file: ${path}`);
    // 디렉터리 링크를 따라 다른 위치에 생성하지 않는다.
    for (let parent = dirname(join(root, path)); parent !== resolve(root); parent = dirname(parent)) {
      if (existsSync(parent)) need(realpathSync(parent) === resolve(realpathSync(root), relative(root, parent)), "The page output path has a symbolic link.");
    }
  }
  assertPlanUnchanged(plan);
  const config = { schema_version: 2, title: plan.spec.title, locale: plan.spec.locale, pages: plan.spec.pages.map((p) => webPage(p)), routes: plan.spec.pages.map((p) => p.path) };
  const created = [];
  try {
    for (const [path, source] of files) { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), source, { flag: "wx" }); created.push(path); }
    assertPlanUnchanged(plan);
    need((existsSync(configPath) ? readFileSync(configPath, "utf8") : null) === configBefore, "The web settings changed while the pages were being made. Check that change.");
    writeFileSync(configPath, json(config) + "\n");
  } catch (error) { for (const path of created) rmSync(join(root, path)); throw error; }
  return { plan, files: [...files.keys()], visualReviewNeeded: [...rows.values()].filter((r) => !["approved_scope", "starter"].includes(r.review.visual.status)).map((r) => r.name) };
}

/** web.config.json 의 페이지 한 줄. 페이지 제목은 계획에 있을 때만 둔다. */
function webPage(page, entry = pageEntry(page.name)) {
  return { name: page.name, path: page.path, entry, ...(page.title === undefined ? {} : { title: page.title }) };
}

export async function checkPage(root, name, { typecheck = true } = {}) {
  const plan = findPagePlan(root, name), page = plan.spec.pages.find((p) => p.name === name), rows = await pageCatalog(root, plan);
  const ts = await loadCatalogTypescript(), filename = join(root, pageEntry(name));
  const web = readWebProject(root);
  need(web.schema_version === 2 && web.title === plan.spec.title && web.locale === plan.spec.locale && json(web.pages.map(({ name, path, entry, title }) => webPage({ name, path, title }, entry))) === json(plan.spec.pages.map((p) => webPage(p))), "The page list, paths, title or language differ from the approved plan.");
  need(existsSync(filename), `Page file not found: ${pageEntry(name)}`);
  need(realpathSync(filename) === resolve(realpathSync(root), pageEntry(name)), "The page file cannot be a symbolic link.");
  const source = readFileSync(filename, "utf8");
  const header = `// ds-page-plan: ${relative(root, plan.path).split("\\").join("/")} ${plan.digest}`;
  need(source.startsWith(header + "\n"), `The plan hash in the page differs from the approved plan. Compare the revision change with the file, then update the first line: ${header}`);
  need(!source.includes("PAGE_SLOT:"), "Some data/event slots are not connected yet. Connect only the behavior in the approved plan.");
  const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  need(sf.parseDiagnostics.length === 0, "The page TSX has a syntax error.");
  const used = new Set(); eachUse(page, (use) => used.add(use.component));
  let needsImageImport = false; eachImage(page, () => { needsImageImport = true; });
  let hasImageImport = false;
  const imports = new Set(), roots = [], jsxNodes = [];
  let pageFunction;
  for (const node of sf.statements) {
    if (ts.isImportDeclaration(node)) {
      const path = node.moduleSpecifier.text;
      if (path === `./${name}Page.css`) { need(!node.importClause, "Import the page CSS without names (side-effect import only)."); continue; }
      if (path === "@/assets/images") {
        const bindings = node.importClause?.namedBindings;
        need(needsImageImport && node.importClause && !node.importClause.isTypeOnly && !node.importClause.name && bindings && ts.isNamedImports(bindings) && bindings.elements.length === 1 && !bindings.elements[0].propertyName && bindings.elements[0].name.text === "imageUrl", "P03/P04: import only imageUrl from @/assets/images when the approved plan uses an image.");
        hasImageImport = true; continue;
      }
      if (path === "react") {
        const bindings = node.importClause?.namedBindings;
        const hooks = ["useState", "useReducer", "useEffect", "useMemo", "useCallback", "useRef", "useId"];
        const types = ["ChangeEvent", "FormEvent", "MouseEvent", "KeyboardEvent", "FocusEvent", "FormEventHandler", "ChangeEventHandler"];
        need(node.importClause && !node.importClause.name && bindings && ts.isNamedImports(bindings) && bindings.elements.every((e) => !e.propertyName && ((node.importClause.isTypeOnly || e.isTypeOnly) ? types : hooks).includes(e.name.text)), "From react, import only hooks for page state and event types."); continue;
      }
      const candidates = [...rows.values()].filter((r) => used.has(r.name) && r.importPath === path);
      const clause = node.importClause;
      need(clause && !clause.isTypeOnly && candidates.length > 0, `P04: import only from public catalog paths: ${path}`);
      if (clause.name) { const row = candidates.find((r) => r.exportKind === "default" && r.name === clause.name.text); need(row, "The name does not match the public default export."); imports.add(row.name); }
      if (clause.namedBindings) {
        need(ts.isNamedImports(clause.namedBindings), "Namespace or renamed imports are not supported.");
        for (const binding of clause.namedBindings.elements) { need(!binding.propertyName && candidates.some((r) => r.exportKind === "named" && r.name === binding.name.text), "Use the public export names as they are."); imports.add(binding.name.text); }
      }
    } else {
      need(ts.isFunctionDeclaration(node) && node.name?.text === `${name}Page` && node.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword) && !pageFunction, "The top level of a page may only have imports and the default page function.");
      pageFunction = node;
    }
  }
  need([...used].every((n) => imports.has(n)) && needsImageImport === hasImageImport && pageFunction?.body, "Needs imports for the plan's parts/images and a default page function.");
  const bindingNames = (name, found = new Set()) => {
    if (!name) return found;
    if (ts.isIdentifier(name)) found.add(name.text);
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) for (const element of name.elements) if (ts.isBindingElement(element)) bindingNames(element.name, found);
    return found;
  };
  const locals = new Set(pageFunction.parameters.flatMap((parameter) => [...bindingNames(parameter.name)]));
  for (const statement of pageFunction.body.statements) {
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) for (const local of bindingNames(declaration.name)) locals.add(local);
    else if ((ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) && statement.name) locals.add(statement.name.text);
  }
  need(!needsImageImport || !locals.has("imageUrl"), "P03/P04: imageUrl is reserved for the approved my-assets image import and cannot be replaced inside the page.");
  const scan = (node) => {
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) jsxNodes.push(node);
    if (ts.isReturnStatement(node) && node.parent === pageFunction.body) roots.push(node.expression);
    need(!ts.isAsExpression(node) && !ts.isTypeAssertionExpression(node) && !ts.isNonNullExpression(node), "P04: getting around types is not allowed.");
    if (ts.isIdentifier(node)) need(!["document", "eval", "Function"].includes(node.text), "P05: do not copy UI with direct DOM or dynamic code.");
    if (ts.isCallExpression(node)) need(node.expression.kind !== ts.SyntaxKind.ImportKeyword && !/(?:createElement|cloneElement|jsx|eval|Function|require|createPortal)$/.test(node.expression.getText(sf)), "P05: dynamic UI and getting around import paths are not allowed.");
    if (ts.isPropertyAccessExpression(node)) need(!["innerHTML", "outerHTML", "insertAdjacentHTML", "createElement", "write", "style", "className", "classList", "setAttribute"].includes(node.name.text), "P05: do not copy UI with the DOM or change part styles.");
    ts.forEachChild(node, scan);
  }; scan(pageFunction);
  need(roots.length === 1, "Return the one page structure from the plan. Put conditional UI in a separate plan.");
  // 문자열 리터럴·속성 순서를 정규화하고, 미계획 JSX/표현식/래퍼도 함께 대조한다.
  const shape = (node) => {
    if (ts.isParenthesizedExpression(node)) return shape(node.expression);
    if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return [ts.SyntaxKind[node.kind], node.text];
    if (ts.isJsxText(node)) return node.text.trim() ? ["text", node.text] : null;
    if (ts.isJsxAttributes(node)) return node.properties.map(shape).sort((a, b) => json(a).localeCompare(json(b)));
    if (ts.isJsxElement(node)) return ["element", shape(node.openingElement), node.children.map(shape).filter((x) => x !== null)];
    if (ts.isJsxSelfClosingElement(node)) return ["element", ["open", node.tagName.getText(), shape(node.attributes)], []];
    if (ts.isJsxOpeningElement(node)) return ["open", node.tagName.getText(), shape(node.attributes)];
    if (ts.isJsxAttribute(node)) return [node.name.getText(), node.initializer ? shape(node.initializer) : true];
    if (ts.isJsxExpression(node)) return node.expression ? ["expr", shape(node.expression)] : null;
    return node.getText().replace(/\s+/g, " ");
  };
  const expected = ts.createSourceFile("expected.tsx", `const view = ${pageMarkup(page)};`, 99, true, ts.ScriptKind.TSX).statements[0].declarationList.declarations[0].initializer;
  need(json(shape(roots[0])) === json(shape(expected)), "P03/P04/P12: sections, parts, props, text or connections differ from the approved plan.");
  const countJsx = (node) => { let count = 0; const visit = (n) => { if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) count++; ts.forEachChild(n, visit); }; visit(node); return count; };
  need(jsxNodes.length === countJsx(expected), "P05: there are JSX parts or copied UI that are not in the plan.");
  const cssPath = filename.replace(/\.tsx$/, ".css");
  need(existsSync(cssPath) && realpathSync(cssPath) === resolve(realpathSync(root), relative(root, cssPath)), "The page CSS is missing or is a link.");
  need(readFileSync(cssPath, "utf8").trim() === pageCss(root, page).trim(), "P06/P11: page CSS must match the approved layout and Layout tokens. Do not override ds-* or a part's own styles.");
  const configFile = ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile);
  need(!configFile.error, "Cannot read tsconfig.json.");
  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
  need(config.errors.length === 0, "tsconfig.json has errors.");
  if (typecheck) {
    const viteTypes = join(root, "src/vite-env.d.ts");
    const program = ts.createProgram([filename, ...(existsSync(viteTypes) ? [viteTypes] : [])], { ...config.options, noEmit: true, incremental: false });
    const errors = ts.getPreEmitDiagnostics(program).filter((d) => d.category === ts.DiagnosticCategory.Error && d.code !== 2882);
    need(!errors.length, "P04: type/API errors: " + errors.slice(0, 5).map((e) => ts.flattenDiagnosticMessageText(e.messageText, " ")).join(" / "));
  }
  assertPlanUnchanged(plan);
  return { name, plan, status: "READY_FOR_REVIEW", visualReviewNeeded: [...rows.values()].filter((r) => !["approved_scope", "starter"].includes(r.review.visual.status)).map((r) => r.name) };
}

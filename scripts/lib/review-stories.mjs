/** 검수 화면용 정적 CSF 분석. story 모듈·play·임의 함수/API는 실행하지 않는다. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { createHash } from "node:crypto";
import { csfStoryNames } from "./docs.mjs";
import { loadCatalogTypescript } from "./catalog.mjs";
import { planComponents, readApprovedComponentPlan, readPlanDocument } from "./component-plan.mjs";

const unknown = Symbol("정적으로 확인하지 못한 값");
const digest = (value) => createHash("sha256").update(value).digest("hex");
const bi = (ko, en) => `${ko} / ${en}`;

function reference(root, row) {
  const folder = join(root, "docs/plans/components");
  const plans = existsSync(folder) ? readdirSync(folder).filter((f) => f.endsWith(".md")).map((f) => readPlanDocument(root, `docs/plans/components/${f}`)).filter((p) => planComponents(p.metadata).includes(row.name)) : [];
  if (plans.length > 1) throw new Error(bi("부품 계획서가 여러 개입니다. 담당자에게 현재 계획서를 정리해 달라고 요청하세요.", "Multiple component plans found. Ask the maintainer to identify the current plan."));
  if (plans.length) {
    const p = readApprovedComponentPlan(root, plans[0].path, plans[0].metadata.source_url);
    const figma = (p.metadata.source_kind ?? "figma") === "figma";
    return { source: { kind: figma ? "figma" : "spec", ref: figma ? p.metadata.source_url : `${p.metadata.source_ref}#revision-${p.metadata.revision}` },
      label: figma ? `${row.name} — Figma (${p.metadata.source_url})` : bi(`${row.name} 스타터 명세, 버전 ${p.metadata.revision}`, `${row.name} starter specification, revision ${p.metadata.revision}`), hash: p.digest };
  }
  const path = join(root, "components.baseline.json");
  const baseline = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")).components?.find((c) => c.name === row.name) : null;
  if (!baseline) {
    const configFile = join(root, "ds.config.json"), config = existsSync(configFile) ? JSON.parse(readFileSync(configFile, "utf8")) : {};
    const sourceFile = resolve(root, config.output?.source ?? ".ds/source.json");
    const raw = existsSync(sourceFile) ? JSON.parse(readFileSync(sourceFile, "utf8")) : {};
    const data = raw.data ?? raw;
    const component = [...(data.components ?? []), ...(data.component_sets ?? [])].find((c) => c.name === row.name);
    const key = raw.file_key, node = component?.node_id ?? component?.id;
    if (key && /^\d+:\d+$/.test(node ?? "")) {
      const url = `https://www.figma.com/design/${key}/?node-id=${node.replace(":", "-")}`;
      return { source: { kind: "figma", ref: url }, label: bi(`${row.name} 저장된 Figma 원본 (${url})`, `${row.name} saved Figma source (${url})`), hash: digest(JSON.stringify(component) + key) };
    }
    throw new Error(bi("비교할 부품 계획서나 스타터 명세가 없습니다. 담당자에게 준비를 요청하세요.", "No component plan or starter specification was found. Ask the maintainer to prepare it."));
  }
  return { source: { kind: "spec", ref: `components.baseline.json#${row.name}` }, label: bi(`${row.name} 스타터 기본 명세`, `${row.name} starter specification`), hash: digest(JSON.stringify(baseline)) };
}

function parseFile(source, file, ts, row) {
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = new Map(), aliases = new Set([row.name]);
  let meta;
  for (const s of sf.statements) {
    if (ts.isVariableStatement(s)) for (const d of s.declarationList.declarations) if (ts.isIdentifier(d.name)) declarations.set(d.name.text, d.initializer);
    if (ts.isFunctionDeclaration(s) && s.name) declarations.set(s.name.text, s);
    if (ts.isExportAssignment(s)) meta = s.expression;
    if (ts.isImportDeclaration(s) && s.importClause?.namedBindings && ts.isNamedImports(s.importClause.namedBindings)) {
      for (const e of s.importClause.namedBindings.elements) if ((e.propertyName ?? e.name).text === row.name) aliases.add(e.name.text);
    }
  }
  const unwrap = (node) => {
    while (node && (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node))) node = node.expression;
    return node;
  };
  const callable = (node, env, args, depth) => {
    node = unwrap(node);
    if (ts.isIdentifier(node)) node = declarations.get(node.text);
    if (!node || ![ts.SyntaxKind.ArrowFunction, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.FunctionDeclaration, ts.SyntaxKind.MethodDeclaration].includes(node.kind)) return unknown;
    const local = { ...env };
    node.parameters.forEach((p, i) => { if (ts.isIdentifier(p.name)) local[p.name.text] = args[i]; });
    if (!ts.isBlock(node.body)) return evaluate(node.body, local, depth + 1);
    for (const statement of node.body.statements) {
      if (ts.isVariableStatement(statement)) for (const d of statement.declarationList.declarations) {
        if (ts.isIdentifier(d.name)) local[d.name.text] = evaluate(d.initializer, local, depth + 1);
      }
      else if (ts.isReturnStatement(statement)) return evaluate(statement.expression, local, depth + 1);
      else return unknown; // 분기·반복·호출의 실행 결과를 추측해서 승인 범위로 삼지 않는다.
    }
    return unknown;
  };
  const finite = new Map([...Object.entries(row.nativeScopeOptions), ...row.props.filter((p) => p.options).map((p) => [p.name, p.options])]);
  const defaults = {};
  for (const p of row.props) { try { defaults[p.name] = JSON.parse(p.default); } catch {} }
  for (const [key, value] of Object.entries(row.nativeDefaults ?? {})) { try { defaults[key] = JSON.parse(value); } catch {} }
  function evaluate(node, env = {}, depth = 0) {
    node = unwrap(node);
    if (!node) return undefined;
    if (depth > 60) return unknown;
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(node)) {
      if (node.text === "undefined") return undefined;
      if (Object.hasOwn(env, node.text)) return env[node.text];
      return declarations.has(node.text) ? evaluate(declarations.get(node.text), env, depth + 1) : unknown;
    }
    if (ts.isObjectLiteralExpression(node)) {
      const result = {};
      for (const p of node.properties) {
        if (ts.isSpreadAssignment(p)) { const value = evaluate(p.expression, env, depth + 1); if (value === unknown) return unknown; Object.assign(result, value); }
        else if (ts.isPropertyAssignment(p)) result[p.name.text] = evaluate(p.initializer, env, depth + 1);
        else if (ts.isShorthandPropertyAssignment(p)) result[p.name.text] = evaluate(p.name, env, depth + 1);
      }
      return result;
    }
    if (ts.isArrayLiteralExpression(node)) return node.elements.map((e) => evaluate(e, env, depth + 1));
    if (ts.isPropertyAccessExpression(node)) { const v = evaluate(node.expression, env, depth + 1); return v !== unknown && v != null ? v[node.name.text] : unknown; }
    if (ts.isConditionalExpression(node)) { const test = evaluate(node.condition, env, depth + 1); return test === unknown ? unknown : evaluate(test ? node.whenTrue : node.whenFalse, env, depth + 1); }
    if (ts.isBinaryExpression(node)) {
      const left = evaluate(node.left, env, depth + 1); if (left === unknown) return unknown;
      if (node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken) return left ?? evaluate(node.right, env, depth + 1);
      if (node.operatorToken.kind === ts.SyntaxKind.BarBarToken) return left || evaluate(node.right, env, depth + 1);
      if (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) return left && evaluate(node.right, env, depth + 1);
      return unknown;
    }
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text;
      for (const span of node.templateSpans) { const part = evaluate(span.expression, env, depth + 1); if (part === unknown) return unknown; value += String(part) + span.literal.text; }
      return value;
    }
    if (ts.isCallExpression(node)) {
      if (ts.isPropertyAccessExpression(node.expression) && ["map", "flatMap"].includes(node.expression.name.text)) {
        const values = evaluate(node.expression.expression, env, depth + 1);
        if (!Array.isArray(values) || values.includes(unknown)) return unknown;
        const results = values.map((v, i) => callable(node.arguments[0], env, [v, i], depth + 1));
        return node.expression.name.text === "flatMap" ? results.flat() : results;
      }
      return callable(node.expression, env, node.arguments.map((a) => evaluate(a, env, depth + 1)), depth + 1);
    }
    if (ts.isJsxExpression(node)) return evaluate(node.expression, env, depth + 1);
    if (ts.isJsxFragment(node)) return node.children.map((c) => evaluate(c, env, depth + 1));
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const opening = ts.isJsxElement(node) ? node.openingElement : node;
      const children = ts.isJsxElement(node) ? node.children.map((c) => evaluate(c, env, depth + 1)) : [];
      if (!aliases.has(opening.tagName.getText(sf))) {
        // icon={<Icon .../>} 같은 실제 조립도 본다. 임의의 함수는 실행하지 않는다.
        for (const attr of opening.attributes.properties) if (attr.initializer) {
          let jsx = false;
          const visit = (n) => { if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n)) jsx = true; ts.forEachChild(n, visit); };
          visit(attr.initializer);
          if (jsx) children.push(evaluate(attr.initializer, env, depth + 1));
        }
        return children;
      }
      const props = { ...defaults };
      for (const a of opening.attributes.properties) {
        if (ts.isJsxSpreadAttribute(a)) { const value = evaluate(a.expression, env, depth + 1); if (value === unknown) return unknown; Object.assign(props, value); }
        else props[a.name.text] = a.initializer ? evaluate(a.initializer, env, depth + 1) : true;
      }
      const selected = {};
      for (const [name, options] of finite) {
        if (!Object.hasOwn(props, name) || props[name] === undefined) continue;
        if (!options.includes(props[name])) return unknown;
        selected[name] = props[name];
      }
      return [{ reviewProps: selected }, ...children];
    }
    if (ts.isJsxText(node)) return [];
    return unknown;
  }
  const resolveObject = (node) => { node = unwrap(node); if (node && ts.isIdentifier(node)) return resolveObject(declarations.get(node.text)); return node; };
  const property = (node, key) => {
    const member = resolveObject(node)?.properties?.find((p) => p.name?.text === key);
    return member && ts.isMethodDeclaration(member) ? member : member?.initializer;
  };
  const metaArgs = evaluate(property(meta, "args")) ?? {};
  return csfStoryNames(source, ts, file).map((name) => {
    const node = resolveObject(declarations.get(name));
    const functionStory = node && (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node));
    if (!node || (!functionStory && (!ts.isObjectLiteralExpression(node) || node.properties.some((p) => ts.isSpreadAssignment(p) || ts.isGetAccessorDeclaration(p))))) return { name, label: name, scopes: [], unavailable: true };
    const ownArgs = evaluate(property(node, "args"));
    if (metaArgs === unknown || ownArgs === unknown) return { name, label: name, scopes: [], unavailable: true };
    const args = { ...metaArgs, ...ownArgs };
    const render = functionStory ? node : property(node, "render") ?? property(meta, "render");
    const label = evaluate(property(node, "name")) ?? name;
    let values;
    if (render) values = callable(render, {}, [args], 0);
    else {
      const selected = {}, all = { ...defaults, ...args };
      for (const [key, options] of finite) if (all[key] !== undefined) {
        if (!options.includes(all[key])) return { name, label, scopes: [], unavailable: true };
        selected[key] = all[key];
      }
      values = [{ reviewProps: selected }];
    }
    const flattened = [values].flat(Infinity);
    const scopes = [...new Map(flattened.filter((v) => v?.reviewProps).map((v) => [JSON.stringify(v.reviewProps), v.reviewProps])).values()];
    return { name, label: typeof label === "string" ? label : name, scopes, unavailable: !scopes.length || flattened.includes(unknown) };
  });
}

export async function reviewChoices(root, row) {
  const ts = await loadCatalogTypescript(), folder = dirname(resolve(root, row.source));
  const files = readdirSync(folder).filter((f) => /\.stories\.[jt]sx?$/.test(f)).sort();
  const ref = reference(root, row), choices = [], unavailable = [];
  const inputs = [ref.hash];
  const labels = { as: "글의 역할 / Text role", variant: "모양 / Style", size: "크기 / Size", tone: "색 역할 / Tone", name: "그림 / Glyph", decorative: "장식 / Decorative", disabled: "사용 불가 / Disabled", hasIcon: "아이콘 포함 / With icon", dismissible: "닫기 버튼 / Dismissible", checked: "선택됨 / Checked", readOnly: "읽기 전용 / Read only", invalid: "오류 표시 / Error state", dir: "글 방향 / Direction" };
  for (const file of files) {
    const source = readFileSync(join(folder, file), "utf8"); inputs.push(file, source);
    for (const story of parseFile(source, file, ts, row)) {
      if (story.unavailable) { unavailable.push(story.label); continue; }
      for (const props of story.scopes) {
        // DECISIONS의 강사 검수 보류 범위. 학생의 새 승인 계획은 이 기본 명세와 별개다.
        if (row.name === "Button" && ref.source.ref === "components.baseline.json#Button" && props.hasIcon === true) { unavailable.push(bi(`${story.label}: 아이콘 포함은 검수 보류`, `${story.label}: icon variant is on hold`)); continue; }
        choices.push({ story: story.name, file: relative(root, join(folder, file)), props,
        label: `${story.label}${Object.keys(props).length ? " — " + Object.entries(props).filter(([k]) => k !== "type").map(([k, v]) => `${labels[k] ?? k}: ${typeof v === "boolean" ? (v ? "예/Yes" : "아니요/No") : v}`).join(", ") : ""}` });
      }
    }
  }
  const code = readdirSync(folder).filter((f) => /\.(tsx?|css)$/.test(f) && !/\.(stories|figma)\./.test(f)).map((f) => readFileSync(join(folder, f), "utf8")).join("\n");
  return { ...ref, choices, unavailable, inputHash: digest(JSON.stringify(inputs)), pointer: /:(hover|active)\b/.test(code),
    dismissOnly: (code.match(/<button\b/g) ?? []).length === 1 && /dismissible\s*\?\s*\(?\s*<button/.test(code) && !/<(a|input|textarea|select)\b/.test(code),
    keyboard: /<(button|a|input|textarea|select)\b|:(focus-visible|focus-within)\b|on(KeyDown|ValueChange|CheckedChange)=/.test(code),
    hover: /:hover\b/.test(code), active: /:active\b/.test(code) };
}

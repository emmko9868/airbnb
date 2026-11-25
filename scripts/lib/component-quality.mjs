/** Figma 구현의 실행 가능한 계약. 타입 검사만으로는 빠지는 동작과 자산을 확인한다. */
import { requiredCssVars } from "./css.mjs";

/**
 * JSX 여는 태그(<names …>)의 이름·속성 문자열·위치(start 는 `<`, end 는 `>` 다음)·스스로 닫힘 여부.
 * `[^>]*` 로 자르면 `ref={(node) => …}` 의 `=>` 에서 태그가 끝났다고 보고 뒤쪽 onClick 을 놓친다.
 * 중괄호 깊이와 문자열(", ', `)을 따라가며 바깥의 `>` 에서만 끝낸다.
 * 이름 뒤에 공백·`/`·`>` 가 올 때만 태그로 본다 — `i<p.length` 같은 비교식을 <p> 로 읽지 않는다.
 */
export function jsxOpeningTags(source, names) {
  const text = String(source);
  const tags = [];
  for (const match of text.matchAll(new RegExp(`<(${names})(?=[\\s/>])`, "g"))) {
    const from = match.index + match[0].length;
    const open = []; // 열린 "{" 와 따옴표
    for (let i = from; i < text.length; i++) {
      const ch = text[i];
      const top = open.at(-1);
      if (top && top !== "{") {
        if (ch === "\\" && open.length > 1) i++; // JS 문자열의 이스케이프 (JSX 속성 문자열에는 없다)
        else if (ch === top) open.pop();
        else if (top === "`" && ch === "$" && text[i + 1] === "{") open.push(text[++i]);
      } else if (ch === '"' || ch === "'" || ch === "`" || ch === "{") open.push(ch);
      else if (ch === "}") open.pop();
      else if (ch === ">" && !open.length) {
        const attributes = text.slice(from, i);
        tags.push({ name: match[1], attributes, start: match.index, end: i + 1, selfClosing: /\/\s*$/.test(attributes) });
        break;
      }
    }
  }
  return tags;
}

/**
 * <button> 의 자식으로 들어간 블록 요소(div·p·section·ul·ol·li·h1~6, 중첩 button)의 여는 태그.
 * 여는 태그의 끝은 jsxOpeningTags 로 정한다 — 속성 안의 JSX(`icon={<div />}`)는 자식이 아니고,
 * 스스로 닫는 <button /> 에는 자식이 없다. 중첩 button 은 깊이로 센다.
 */
export function blockElementsInButtons(tsx) {
  const text = String(tsx);
  const events = [
    ...jsxOpeningTags(text, "button|div|p|section|ul|ol|li|h[1-6]"),
    ...[...text.matchAll(/<\/button\s*>/g)].map((match) => ({ close: true, start: match.index })),
  ].sort((a, b) => a.start - b.start);
  const found = [];
  let depth = 0;
  let attributesEnd = 0; // 직전 여는 태그의 속성이 끝나는 곳. 그 안의 태그는 자식이 아니다.
  for (const tag of events) {
    if (tag.start < attributesEnd) continue;
    if (tag.close) {
      depth = Math.max(0, depth - 1);
      continue;
    }
    if (depth > 0) found.push(tag);
    attributesEnd = tag.end;
    if (tag.name === "button" && !tag.selfClosing) depth++;
  }
  return found;
}

const paths = (svg) => jsxOpeningTags(svg, "path")
  .map((tag) => tag.attributes.match(/\bd="([^"]+)"/)?.[1])
  .filter(Boolean)
  .map((d) => d.replace(/\s+/g, " ").trim());

export function figmaIconPaths(assets = {}) {
  return Object.entries(assets)
    .filter(([name]) => !/separator|divider/i.test(name))
    .map(([name, svg]) => ({ name, paths: paths(svg) }))
    .filter((asset) => asset.paths.length);
}

function kitImports(tsx) {
  const imports = [];
  for (const match of String(tsx).matchAll(/import\s+(?!type\b)([\s\S]*?)\s+from\s+["']([^"']+)["'];?/g)) {
    const [, clause, source] = match;
    const component = source.match(/(?:^\.\.\/|^@\/components\/|^src\/components\/)([A-Z][A-Za-z0-9]*)(?:\/|$)/)?.[1];
    if (!component) continue;
    const locals = [];
    const defaultName = clause.trim().match(/^([A-Z][A-Za-z0-9]*)/)?.[1];
    if (defaultName) locals.push(defaultName);
    const named = clause.match(/{([\s\S]*?)}/)?.[1] || "";
    for (const item of named.split(",")) {
      const names = item.trim().match(/^([A-Z][A-Za-z0-9]*)(?:\s+as\s+([A-Z][A-Za-z0-9]*))?$/);
      if (names) locals.push(names[2] || names[1]);
    }
    imports.push({ component, locals: [...new Set(locals)] });
  }
  return imports;
}

const kebabName = (name) => String(name).replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const nestedTestIds = (component) => [...new Set([`ds-${String(component).toLowerCase()}`, `ds-${kebabName(component)}`])];
/** 하위 부품 계약의 키트 부품 이름. 만들고 있는 부품 자신은 하위 부품이 아니다(Q-66: 자기 참조 금지). */
const otherKitParts = (name, parts) => [...new Set(parts.map((part) => part.kitComponent).filter((component) => component && component !== name))];

/** 승인된 하위 키트 부품의 CSS/JSX 외관을 부모가 우회해서 바꾸는 패턴. */
export function nestedPartStyleProblems({ name, tsx = "", css = "", nestedParts = [] }) {
  // 자기 클래스(.ds-<self>, .ds-<self>__*)는 공유 스타일이 아니다.
  const required = otherKitParts(name, nestedParts);
  if (!required.length) return [];
  const problems = [];
  const selectors = [...String(css).replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim()).filter((selector) => selector && !selector.startsWith("@"));
  for (const component of required) {
    const prefixes = nestedTestIds(component);
    const hits = [...new Set(selectors.filter((selector) => prefixes.some((prefix) => new RegExp(`\\.${prefix}(?=$|[^a-z0-9-]|--|__)`, "i").test(selector))))];
    if (hits.length) {
      const shown = `${hits.slice(0, 20).join(", ")}${hits.length > 20 ? `, and ${hits.length - 20} more` : ""}`;
      problems.push(`- ${name}.css: selector${hits.length > 1 ? "s" : ""} ${shown} target the shared ${component} styles. A composite may style only its own .ds-${kebabName(name)}__* wrapper elements. To change a shared part, edit src/components/${component}/, check every consumer, and confirm the change scope first.`);
    }
    const imports = kitImports(tsx).filter((entry) => entry.component === component);
    const changedProps = [];
    for (const local of imports.flatMap((entry) => entry.locals)) {
      for (const tag of jsxOpeningTags(tsx, local)) {
        for (const prop of ["className", "style"]) if (new RegExp(`\\b${prop}\\s*=`).test(tag.attributes)) changedProps.push(`${local}.${prop}`);
      }
    }
    if (changedProps.length) {
      problems.push(`- ${name}.tsx: do not pass ${[...new Set(changedProps)].join(", ")} to the nested shared ${component} to change its appearance. Put layout on a .ds-${kebabName(name)}__* wrapper. To change the shared part, edit src/components/${component}/, check every consumer, and confirm the change scope first.`);
    }
  }
  return problems;
}

/** 브라우저에서 복합 루트 안에 실제 하위 원본 data-testid가 관찰됐는지 확인한다. */
export function nestedRenderProblems({ name, nestedParts = [], observedComponents = [] }) {
  const observed = new Set(observedComponents);
  return otherKitParts(name, nestedParts)
    .filter((component) => !observed.has(component))
    .map((component) => `- ${name}: no rendered ${nestedTestIds(component).map((id) => `[data-testid="${id}"]`).join(" or ")} was found inside the composite root in any story. Render the approved shared ${component} component; copied markup does not satisfy the Nested parts contract.`);
}

/** 클릭 가능한 하위 원본이 복합 콜백으로 이어지는 Storybook play 계약의 정적 최소 조건. */
export function nestedInteractionProblems({ name, stories = "", nestedParts = [] }) {
  const clickable = otherKitParts(name, nestedParts).filter((component) => ["Button", "IconButton"].includes(component));
  if (!clickable.length) return [];
  const callback = /expect\s*\(\s*args\.[A-Za-z][A-Za-z0-9]*\s*\)\s*\.\s*(?:not\s*\.)?toHaveBeenCalled(?:Times|With)?\s*\(/.test(stories);
  const click = /\buserEvent\.click\s*\(/.test(stories);
  const missingTargets = clickable.filter((component) => !nestedTestIds(component).some((id) => stories.includes(id)));
  if (click && callback && !missingTargets.length) return [];
  return [`- ${name}.stories.tsx: a play function must click each nested shared ${clickable.join(" and ")} by its data-testid and assert the composite callback on args. This proves the child action reaches the composite API; add the approved Tab order and disabled propagation checks only when the plan defines them.`];
}

export function nestedPartProblems({ name, tsx = "", nestedParts = [], figmaNestedParts = [] }) {
  // 자기 자신(name)을 가리키는 사실·계획 행은 이 부품의 안쪽 레이어라 요구하지 않는다(예전 캐시에 남은 행 포함).
  const facts = figmaNestedParts.filter((part) => part.kitComponent && part.kitComponent !== name);
  if (!nestedParts.length && !facts.length) return [];
  const problems = [];
  const required = new Set(otherKitParts(name, nestedParts));
  for (const fact of facts) {
    const instance = `${fact.layerName || "unknown layer"}${fact.nodeId ? ` (${fact.nodeId})` : ""}`;
    const planned = nestedParts.find((part) => part.instance === instance);
    if (!planned || planned.kitComponent !== fact.kitComponent) {
      problems.push(`- ${name}: Figma nested-instance facts require ${instance} to use ${fact.kitComponent}, but the approved Nested parts table ${planned ? `uses ${planned.kitComponent || "none"}` : "has no matching row"}. Keep the exact kit component established by the facts; none or a different component is not allowed.`);
    }
  }
  const imports = kitImports(tsx);
  for (const component of required) {
    const candidates = imports.filter((entry) => entry.component === component);
    const used = candidates.some((entry) => entry.locals.some((local) => new RegExp(`<${local}(?=[\\s/>])`).test(tsx)));
    if (!candidates.length || !used) {
      problems.push(`- ${name}.tsx: the approved Nested parts table requires ${component}, but the implementation does not import and render that kit component. Use the exact planned component; do not recreate it or choose by appearance.`);
    }
  }
  const replacements = [...new Set(imports.map((entry) => entry.component).filter((component) => component !== name && !required.has(component)))];
  if (replacements.length) {
    problems.push(`- ${name}.tsx: imports kit component${replacements.length > 1 ? "s" : ""} ${replacements.join(", ")} that are not in the approved Nested parts table. Do not replace a planned part with a visually similar component (for example, Button with IconButton). Update the plan and get approval if the source mapping changed.`);
  }
  return problems;
}

/**
 * 계획의 scope_nodes(Figma 변형 노드 id)로 미리 읽기 사실(last.json)을 그 변형에서 나온 것만 남긴다(Q-66 결정 2).
 * scopeNodes 가 없으면 그대로 돌려준다. 하위 부품·아이콘 원본 경로·상태(Focus 스토리 요구)·색 상태가 범위를 따른다.
 */
export function scopeFigmaFacts(figma, scopeNodes) {
  if (!figma || !scopeNodes?.length) return figma;
  const scope = new Set(scopeNodes);
  const inScope = (variants) => (variants || []).some((variant) => scope.has(variant?.id));
  const nestedParts = (figma.nestedParts || []).filter((part) => part.sourceVariants ? inScope(part.sourceVariants) : part.sourceVariant ? scope.has(part.sourceVariant.id) : true);
  const baseInScope = !figma.baseVariantId || scope.has(figma.baseVariantId);
  const iconPaths = figma.iconPathsByVariant
    ? [...new Map(Object.entries(figma.iconPathsByVariant).filter(([id]) => scope.has(id)).flatMap(([, assets]) => assets).map((asset) => [`${asset.name}|${asset.paths.join(" ")}`, asset])).values()]
    : baseInScope ? figma.iconPaths || [] : [];
  const variants = figma.variants?.length ? figma.variants.filter((variant) => scope.has(variant.id)) : null;
  // Figma 변형 이름 "Card type= Map Card" 의 라벨은 앞 공백을 가질 수 있어 다듬어 비교한다.
  const stateLabels = variants ? new Set(variants.map((variant) => String(variant.state).trim())) : null;
  const states = stateLabels ? (figma.states || []).filter((state) => stateLabels.has(String(state).trim())) : figma.states;
  const colorStates = stateLabels ? (figma.colorStates || []).filter((entry) => entry.state === "기본" ? baseInScope : stateLabels.has(String(entry.state).trim())) : figma.colorStates;
  return { ...figma, scopeNodes: [...scope], nestedParts, iconPaths, icons: iconPaths.length, states, colorStates };
}

export function componentQualityProblems({ name, tsx = "", css = "", stories = "", tokensCss = "", figma = null, nestedParts = [], figmaNestedParts = [] }) {
  const problems = [];
  problems.push(...nestedPartProblems({ name, tsx, nestedParts, figmaNestedParts }));
  problems.push(...nestedPartStyleProblems({ name, tsx, css, nestedParts }));
  problems.push(...nestedInteractionProblems({ name, stories, nestedParts }));
  const definitions = new Set([...tokensCss.matchAll(/(?:^|[;\s])(--[a-z0-9-]+)\s*:/gm)].map((match) => match[1]));
  // var(--x, 기본값) 은 정의가 없어도 동작한다 — 가드 G13 과 같은 기준(requiredCssVars).
  const unresolved = [...new Set(requiredCssVars(css).map((ref) => ref.name))].filter((token) => !definitions.has(token));
  if (unresolved.length) {
    problems.push(`- ${name}.css: uses variables ${unresolved.join(", ")} that are not in the generated src/tokens/tokens.css. If you changed .ds/semantic.json, run pnpm ds:tokens and check again.`);
  }

  const buttons = jsxOpeningTags(tsx, "button").map((tag) => tag.attributes);
  for (const [index, attributes] of buttons.entries()) {
    const click = /\bonClick\s*=/.test(attributes);
    const passedThrough = /\{\.\.\.[\w.]+\}/.test(attributes);
    const nativeFormAction = /\btype\s*=\s*["'](?:submit|reset)["']/.test(attributes);
    if (!click && !passedThrough && !nativeFormAction) {
      problems.push(`- ${name}.tsx: <button> #${index + 1} does nothing when clicked. Connect the onClick prop to the real button and check the call after a click in the Storybook play function.`);
    }
  }

  if (figma?.component === name) {
    for (const asset of figma.iconPaths || []) {
      for (const path of asset.paths) {
        if (!paths(tsx).includes(path)) {
          problems.push(`- ${name}.tsx: the original path of Figma icon ${asset.name} is missing. Copy the Figma SVG into JSX and do not replace it with another icon.`);
          break;
        }
      }
    }
    if (buttons.length && (!/\buserEvent\.click\s*\(/.test(stories) || !/\.toHaveBeenCalled(?:Times|With)?\s*\(/.test(stories))) {
      problems.push(`- ${name}.stories.tsx: no play check clicks the real button and confirms the callback was called. Add userEvent.click and toHaveBeenCalledTimes.`);
    }
    if (figma.states?.some((state) => /focus/i.test(state)) && !/export const Focus\w*: Story/.test(stories)) {
      problems.push(`- ${name}.stories.tsx: there is no Focus story that checks the Figma Focus state with the keyboard. Move focus with userEvent.tab and check the ring.`);
    }
  }
  return problems;
}

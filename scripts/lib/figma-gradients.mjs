/**
 * 부품 디자인 코드의 그라데이션 채우기 → layout 토큰 `--gradient-<부품>-<n>` (Q-70 결정 8). 의존성 0, 결정적.
 *
 * Figma MCP 의 get_variable_defs 는 그라데이션 스타일 값을 비워 준다(`Gradient 02: ""`, `Gradient 03: ","`).
 * 실제 값은 get_design_context 코드의 `style={{ backgroundImage: "…" }}` 에만 있다(인라인 SVG data URL 의 radialGradient,
 * linear-gradient(…) 등). 그 문자열을 **그대로** 토큰 값으로 쓴다 — 색·stop·형태를 바꾸거나 근사하지 않는다.
 *
 * 변형마다 코드가 `style={isDefaultAnd… ? { 기본 } : { 이 변형 }}` 처럼 기본 변형과 함께 오므로,
 * 조건이 이 변형 자신(`is<값들>`)이면 앞쪽, 아니면 뒤쪽을 이 변형의 값으로 본다. 조건이 없으면 그 객체다.
 * 번호는 Figma 변형 순서(get_metadata)에서 값이 처음 나온 순서이고, 값이 같으면 토큰 하나다.
 */
import { jsxOpeningTags } from "./component-quality.mjs";
import { kebab } from "./normalize.mjs";

/** 따옴표를 지키며 from 의 "{" 에 맞는 "}" 까지. [안쪽, 끝 위치] */
function balanced(source, from) {
  let depth = 0, quote = null;
  for (let index = from; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return [source.slice(from + 1, index), index + 1];
  }
  return [null, source.length];
}

/** JS 문자열 리터럴("…" 또는 '…')의 값. */
function stringValue(literal) {
  if (literal.startsWith('"')) { try { return JSON.parse(literal); } catch { return null; } }
  return literal.slice(1, -1).replace(/\\(.)/g, "$1");
}

const pascalWord = (value) => String(value).replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase());
/** "State=Hover, Size=Full Width, Icon=Off" → "isHoverAndFullWidthAndOff" (Figma 가 만드는 조건 변수 이름). */
export function variantCondition(name) {
  const values = String(name ?? "").split(/\s*,\s*/).map((part) => part.split("=").slice(1).join("=").trim()).filter(Boolean);
  return values.length ? `is${values.map(pascalWord).join("And")}` : null;
}

/** style={…} 식에서 이 변형에 해당하는 객체 글. */
function variantStyle(expression, own) {
  const text = expression.trim();
  if (text.startsWith("{")) return text;
  const ternary = text.match(/^(!?[\w.]+)\s*\?\s*/);
  if (!ternary) return null;
  const rest = text.slice(ternary[0].length);
  if (!rest.startsWith("{")) return null;
  const [first, end] = balanced(rest, 0);
  const after = rest.slice(end).match(/^\s*:\s*/);
  const second = after && rest.slice(end + after[0].length).trim().startsWith("{") ? balanced(rest.slice(end + after[0].length).trim(), 0)[0] : null;
  const self = ternary[1] === own;
  return self ? `{${first}}` : second === null ? null : `{${second}}`;
}

const GRADIENT = /(?:linear|radial|conic)-gradient\(|<(?:linear|radial)Gradient\b/i;

/** 디자인 코드 한 변형의 그라데이션 채우기 [{ layer, value }] (코드 순서). */
export function gradientFillsIn(design, variantName) {
  const own = variantCondition(variantName);
  const fills = [];
  for (const tag of jsxOpeningTags(String(design ?? ""), "[A-Za-z][A-Za-z0-9]*")) {
    const at = tag.attributes.search(/\bstyle\s*=\s*\{/);
    if (at < 0) continue;
    const [expression] = balanced(tag.attributes, tag.attributes.indexOf("{", at));
    const style = expression === null ? null : variantStyle(expression, own);
    if (!style) continue;
    for (const match of style.matchAll(/\bbackgroundImage\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g)) {
      const value = stringValue(match[1]);
      if (value && GRADIENT.test(value)) fills.push({ layer: tag.attributes.match(/\bdata-name="([^"]+)"/)?.[1] || "root", value: value.trim() });
    }
  }
  return fills;
}

/** 부품 이름의 kebab(토큰 이름에 쓴다). Figma 세트 이름을 먼저 쓴다 — 코드 이름이 나중에 정해져도 토큰 이름이 그대로다. */
export function gradientPart(facts) {
  return kebab(facts?.frameName || facts?.identity?.rawName || facts?.name || "part") || "part";
}

/**
 * 미리 읽기 사실(facts)의 그라데이션 토큰.
 * { part, tokens: [{ name: "primary-buttons-1", cssVar: "--gradient-primary-buttons-1", value, uses: [{ variantId, variant, layer }] }] }
 */
export function partGradientTokens(facts) {
  const part = gradientPart(facts);
  const details = new Map((facts?.variantDetails || []).map((variant) => [variant.id, variant]));
  const order = [...(facts?.variants || []).map((variant) => variant.id).filter((id) => details.has(id)), ...[...details.keys()].filter((id) => !(facts?.variants || []).some((variant) => variant.id === id))];
  const tokens = [];
  for (const id of order) {
    const variant = details.get(id);
    if (!variant?.read) continue;
    for (const fill of gradientFillsIn(variant.design, variant.name)) {
      let token = tokens.find((entry) => entry.value === fill.value);
      if (!token) {
        const name = `${part}-${tokens.length + 1}`;
        token = { name, cssVar: `--gradient-${name}`, value: fill.value, uses: [] };
        tokens.push(token);
      }
      token.uses.push({ variantId: id, variant: variant.name, layer: fill.layer });
    }
  }
  return { part, tokens };
}

/** 사실 파일·맥락에 쓰는 "변형 → 토큰" 줄. */
export function gradientLines(facts) {
  const { tokens } = partGradientTokens(facts);
  if (!tokens.length) return [];
  return [
    "## Gradient tokens (made by the kit from the Figma design, exact values)",
    "Use only `background-image: var(--gradient-…)` for these fills. Never write the gradient, color-mix() or a close color yourself.",
    ...tokens.flatMap((token) => token.uses.map((use) => `- ${use.variant} (${use.variantId}) · ${use.layer} → var(${token.cssVar})`)),
    `If tokens.css has no ${tokens[0].cssVar} yet, run \`pnpm ds:figma "<this link>"\` yourself first (it adds them).`,
  ];
}

/** get_variable_defs 의 값이 비었거나 해석할 수 없는 스타일(그라데이션 등)인가. "" · "," · ",," · 공백. */
export const isEmptyFigmaValue = (value) => typeof value === "string" && /^[\s,]*$/.test(value);

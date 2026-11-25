/**
 * 토큰 → Tailwind v4 `@theme` CSS.
 *
 * 카테고리 → CSS 변수 prefix 매핑은 ds
 * `backend/app/services/design_system_css.py:_CATEGORY_PREFIX` 와
 * DSP `packages/design-tokens/src/index.ts` 를 그대로 따른다.
 * 두 플랫폼이 소비하는 변수 이름과 동일해야 산출물을 서로 가져다 쓸 수 있다.
 */
const CATEGORY_PREFIX = {
  COLOR: "color",
  RADIUS: "radius",
  FONT_SIZE: "text",
  FONT_FAMILY: "font",
  FONT_WEIGHT: "font-weight",
  LINE_HEIGHT: "leading",
  LETTER_SPACING: "tracking",
  SHADOW: "shadow",
  BORDER_WIDTH: "border-width",
  Z_INDEX: "z",
  OPACITY: "opacity",
  BREAKPOINT: "breakpoint",
  DURATION: "duration",
  EASING: "ease",
  SPACING_UNIT: "spacing",
  // 부품 디자인의 그라데이션 채우기(Q-70 결정 8). Figma 값 그대로의 background-image 값이다.
  GRADIENT: "gradient",
};

/**
 * 간격 기본 단위의 이름. 이것만 Tailwind v4 의 `--spacing`(p-2 = 2 × 단위)이 되고,
 * 나머지 간격 토큰은 `--spacing-<이름>`(p-md)으로 나간다. 이름 없이 전부 `--spacing` 으로
 * 내보내면 Figma 의 간격 척도(xs·sm·md…)가 한 변수로 뭉개져 마지막 값만 남는다.
 */
const SPACING_BASE = new Set(["base", "unit", "default", "spacing"]);

/**
 * 이름이 카테고리 접두사로 시작하면 한 번 벗긴다.
 *
 * Figma 에서 `border/width/thin` 은 아주 흔한 이름인데, 그대로 두면
 * `--border-width-border-width-thin` 이 된다. `radius/md` → `--radius-radius-md`,
 * `color/primary` → `--color-color-primary` 도 마찬가지.
 * 토큰 이름과 alias 참조 양쪽에 같은 규칙을 써야 참조가 깨지지 않으므로
 * prefix 표 바로 옆에 둔다.
 */
export function stripCategoryPrefix(name, category) {
  const c = String(category ?? "").toUpperCase();
  const prefix = CATEGORY_PREFIX[c];
  if (!prefix) return name;
  const n = String(name ?? "");
  // 간격은 `space/md` 로도 흔히 쓴다.
  if (c === "SPACING_UNIT" && n.startsWith("space-")) return n.slice("space-".length);
  if (n === prefix) return n; // `--radius-radius` 보다는 그대로 두는 게 낫다
  return n.startsWith(`${prefix}-`) ? n.slice(prefix.length + 1) : n;
}

/**
 * 토큰 → CSS 변수 이름. **이 함수 하나만** 쓴다 — 생성·alias 참조·가드·문서가 같은 이름을
 * 봐야 참조가 깨지지 않는다(예전에는 같은 표가 네 군데 있었다).
 */
export function cssVarFor(category, name) {
  const c = String(category ?? "").toUpperCase();
  if (c === "SPACING_UNIT" && SPACING_BASE.has(String(name))) return "--spacing";
  const prefix = CATEGORY_PREFIX[c];
  if (!prefix) return `--${c.toLowerCase().replace(/_/g, "-")}-${name}`;
  return `--${prefix}-${name}`;
}

/**
 * 정의가 있어야 하는 var() 참조 [{ name, index }]. index 는 변수 이름의 위치다.
 * `var(--x, 기본값)` 은 정의가 없어도 기본값으로 동작하므로 뺀다(쉼표가 다음 줄에 있어도).
 * 가드 G13 과 ai:check 가 파일 전체 텍스트에 이 함수 하나로 같은 판정을 한다.
 */
export function requiredCssVars(text) {
  return [...String(text ?? "").matchAll(/var\(\s*(--[a-z0-9-]+)\s*(,?)/gi)]
    .filter((m) => !m[2])
    .map((m) => ({ name: m[1], index: m.index + m[0].indexOf(m[1]) }));
}

const LAYER_TITLE = {
  primitive: "Primitive — hexcode 에 이름을 붙인 층. 화면에서 직접 쓰지 않는다.",
  semantic: "Semantic — 역할. 컴포넌트는 이 층만 참조한다.",
  layout: "Layout — 간격·모서리·그림자·모션.",
  component: "Component — 컴포넌트 전용. semantic/layout 만 참조한다.",
};

const ORDER = ["primitive", "semantic", "layout", "component"];

function assertSafeDeclaration(token) {
  const name = cssVarFor(token.category, token.name);
  const value = String(token.value ?? "");
  const fail = () => { throw new Error(`CSS generation blocked: ${name} — the token value is not one safe CSS value. Check for semicolons, braces, line breaks, comments, escapes, unclosed brackets or quotes, or a raw Effect value.`); };
  // ; 는 따옴표 안(그라데이션 data URL 의 "image/svg+xml;utf8")에서만 허용한다. 따옴표 밖의 ; { } 는 선언을 끊는다.
  const outside = value.replace(/"[^"]*"|'[^']*'/g, "\"\"");
  if (!/^--[a-z0-9-]+$/.test(name) || !value.trim() || /[;{}]/.test(outside) || /[{}\\\u0000-\u001f\u007f\u2028\u2029]|\/\*|\*\/|\bEffect\s*\(/i.test(value) || !["string", "number"].includes(typeof token.value) || (typeof token.value === "number" && !Number.isFinite(token.value))) fail();
  const stack = [];
  let quote = "";
  for (const char of value) {
    if (quote) { if (char === quote) quote = ""; continue; }
    if (char === "'" || char === '"') quote = char;
    else if (char === "(" || char === "[") stack.push(char);
    else if (char === ")" || char === "]") {
      if (stack.pop() !== (char === ")" ? "(" : "[")) fail();
    }
  }
  if (quote || stack.length) fail();
}

export function compileCss(tokens, { header } = {}) {
  for (const token of tokens) assertSafeDeclaration(token);
  const lines = [];
  lines.push("/**");
  lines.push(" * 생성 파일 — 직접 고치지 마세요. `pnpm ds:tokens` 로 다시 만듭니다.");
  if (header) for (const h of String(header).replaceAll("*/", "* /").split("\n")) lines.push(` * ${h}`);
  lines.push(" */");
  lines.push("@import \"tailwindcss\";");
  lines.push("");
  lines.push("@theme {");
  for (const layer of ORDER) {
    const rows = tokens.filter((t) => t.layer === layer);
    if (!rows.length) continue;
    lines.push(`  /* ── ${LAYER_TITLE[layer]} ── */`);
    for (const t of sortTokens(rows)) {
      const v = cssVarFor(t.category, t.name);
      const note = t.source === "declared" ? "" : `  /* ${t.source} ${t.confidence?.toFixed?.(2) ?? ""} */`;
      lines.push(`  ${v}: ${t.value};${note}`);
    }
    lines.push("");
  }
  lines.push("}");
  lines.push("");
  return lines.join("\n");
}

function sortTokens(rows) {
  return [...rows].sort((a, b) => {
    if (a.category !== b.category) return a.category < b.category ? -1 : 1;
    const as = Number((a.name.match(/-(\d+)$/) || [])[1] ?? NaN);
    const bs = Number((b.name.match(/-(\d+)$/) || [])[1] ?? NaN);
    const af = a.name.replace(/-\d+$/, "");
    const bf = b.name.replace(/-\d+$/, "");
    if (af !== bf) return af < bf ? -1 : 1;
    if (Number.isFinite(as) && Number.isFinite(bs)) return as - bs;
    return a.name < b.name ? -1 : 1;
  });
}

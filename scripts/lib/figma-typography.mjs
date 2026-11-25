/** 글자 원본은 검토 자료로 보존한다. 기존 공용 글자 토큰에 자동으로 덮어쓰지 않는다. */
import { exactCssColor } from "./color.mjs";
import { nameFromPath } from "./normalize.mjs";
export function isTypographyDefinition(name, value) {
  return typeof value === "string" && !(/^(?:#|rgba?\()/i.test(value) && exactCssColor(value)) && (/^Font\(/.test(value) || /(?:^|[/_-])(?:font[-_]?family|font[-_]?size|font[-_]?weight|line[-_]?height|letter[-_]?spacing|typography)/i.test(name));
}

export function fontFields(raw) {
  const body = String(raw).match(/^Font\(([\s\S]*)\)$/)?.[1];
  if (body === undefined) return null;
  // _fontSize/0,875rem 같은 참조의 쉼표는 필드 경계가 아니다.
  return Object.fromEntries([...body.matchAll(/(?:^|,\s*)(\w+):\s*([\s\S]*?)(?=,\s*\w+:\s*|$)/g)].map((m) => [m[1], m[2].trim().replace(/^"([\s\S]*)"$/, "$1")]));
}

export function normalizeLineHeight(fields, styleName = "") {
  const raw = fields.lineHeight;
  const pending = (reason) => ({ status: "review-required", value: null, raw: raw ?? null, reason });
  const match = String(raw ?? "").trim().match(/^(\d+(?:\.\d+)?)\s*(%|px)?$/i);
  if (!match) return pending("줄높이 값/참조/auto의 단위를 확인하세요.");
  const n = Number(match[1]);
  if (!(n > 0 && Number.isFinite(n))) return pending("줄높이는 양수여야 합니다.");
  const unit = String(fields.lineHeightUnit ?? "").toUpperCase();
  const resolved = (value, sourceUnit, evidence) => ({ status: "normalized", value, raw, sourceUnit, evidence });
  if (match[2] && unit && !(match[2] === "%" ? ["PERCENT", "PERCENTAGE", "%"] : ["PIXELS", "PIXEL", "PX"]).includes(unit)) return pending("줄높이 값의 단위와 명시한 단위가 충돌합니다.");
  if (match[2] === "%" || ["PERCENT", "PERCENTAGE", "%"].includes(unit)) return resolved(n / 100, "percent", "줄높이의 명시적 퍼센트 단위");
  if (match[2]?.toLowerCase() === "px" || ["PIXELS", "PIXEL", "PX"].includes(unit)) {
    const size = Number(fields.size);
    return Number.isFinite(size) && size > 0 ? resolved(n / size, "px", "명시한 픽셀 줄높이 / 글자 크기") : pending("픽셀 줄높이를 나눌 글자 크기/참조를 확인하세요.");
  }
  if (["MULTIPLIER", "RATIO", "UNITLESS"].includes(unit)) return resolved(n, "multiplier", "명시적 배수 단위");
  if (unit) return pending("지원하지 않는 줄높이 단위입니다.");
  const percent = String(styleName).match(/(?:^|\/)\s*(\d+(?:\.\d+)?)%\s*$/)?.[1];
  if (percent) {
    const ratio = Number(percent) / 100;
    if (n === Number(percent) || Math.abs(n - ratio) < 1e-7) return resolved(n === Number(percent) ? ratio : n, "percent", "스타일 이름의 명시적 퍼센트와 원본 값 일치");
    return pending("스타일 이름의 퍼센트와 줄높이 값이 다릅니다.");
  }
  // get_variable_defs의 통상적인 단위 없는 배수 범위. 큰 숫자의 단위는 추정하지 않는다.
  if (n <= 3) return resolved(n, "multiplier", "단위 없는 배수 값(0 < 값 <= 3)");
  return pending("퍼센트인지 픽셀인지 확인할 단위가 없습니다. 값 크기만으로 추측하지 않습니다.");
}

export function typographyReview(entries) {
  const styles = entries.map(({ name, raw }) => {
    const fields = fontFields(raw), questions = [];
    if (!fields) return { name, raw, fields: null, questions: ["글자 변수/참조의 실제 값과 사용할 역할을 확인하세요."] };
    if (!fields.family || /^_?font[-_]?family(?:$|[/_-])|^var\(|^\{/i.test(fields.family)) questions.push(`글꼴 이름/참조 확인: ${fields.family || "없음"}`);
    if (!(Number(fields.size) > 0)) questions.push(`글자 크기/참조 확인: ${fields.size || "없음"}`);
    if (!(Number(fields.weight) > 0)) questions.push(`글자 굵기/참조 확인: ${fields.weight || "없음"}`);
    const lineHeight = normalizeLineHeight(fields, name);
    if (lineHeight.status !== "normalized") questions.push(`줄높이 확인: ${lineHeight.reason}`);
    return { name, raw, fields, lineHeight, questions };
  });
  return { status: entries.length ? "review-required" : "none", applied: false, families: [...new Set(styles.map((s) => s.fields?.family).filter(Boolean))].sort(), styles, questions: entries.length ? ["대표 글꼴과 기존 --font-sans·--text-*·--leading-*에 연결할 스타일을 학생이 선택하세요. 원본 값과 역할을 별도 글자 계획에서 승인받기 전에는 적용하지 않습니다."] : [] };
}

/**
 * 글자 크기 체계 이름. Figma 스타일 이름에서 겹치는 정보만 뗀다:
 * 앞의 글꼴 이름 · 괄호 속 크기 · 끝의 줄높이 % — "IBM Plex Sans/Body 1 (16px)/Medium/125%" → "body-1-medium".
 */
export function typeScaleName(styleName, family = "") {
  const parts = String(styleName).split("/").map((p) => p.replace(/\([^)]*\)/g, "").trim()).filter(Boolean);
  if (parts.length > 1 && family && parts[0].toLowerCase() === String(family).toLowerCase()) parts.shift();
  if (parts.length > 1 && /^\d+(?:\.\d+)?%$/.test(parts[parts.length - 1])) parts.pop();
  return nameFromPath(parts.join("/"));
}

/**
 * Figma 텍스트 스타일 → 글자 크기 체계 토큰. Figma 이름 그대로 가져오므로 해석이 없다(승인 불필요).
 *   --text-type-<이름> 크기 · --leading-type-<이름> 줄높이 · --font-weight-type-<이름> 굵기
 *   --font-type-<이름> 글꼴 · --tracking-type-<이름> 자간
 * 기존 글자 역할(--font-sans·--text-body-1 …)은 바꾸지 않는다 — 그것은 학생이 승인한 글자 계획으로만 바뀐다.
 */
export function typeScaleTokens(typography) {
  const tokens = [], review = [], seen = new Map();
  for (const style of typography?.styles ?? []) {
    const f = style.fields;
    const slug = typeScaleName(style.name, f?.family);
    if (!slug) continue;
    const name = `type-${slug}`;
    if (seen.has(name)) {
      if (seen.get(name) !== JSON.stringify(f)) review.push({ name, layer: "layout", confidence: 0.5, reason: `텍스트 스타일 "${style.name}" 이 다른 값으로 한 번 더 있습니다. 첫 값만 글자 체계에 넣었습니다.` });
      continue;
    }
    const size = Number(f?.size);
    if (!f || !(size > 0)) {
      review.push({ name, layer: "layout", confidence: 0, reason: `텍스트 스타일 "${style.name}" 의 글자 크기를 읽지 못해 글자 체계에 넣지 않았습니다.` });
      continue;
    }
    seen.set(name, JSON.stringify(f));
    const base = { layer: "layout", hex: null, ref: null, source: "declared", confidence: 1, reason: `Figma 텍스트 스타일 "${style.name}"`, typeScale: slug };
    tokens.push({ ...base, category: "FONT_SIZE", name, value: `${size}px` });
    if (Number(f.weight) > 0) tokens.push({ ...base, category: "FONT_WEIGHT", name, value: String(Number(f.weight)) });
    if (style.lineHeight?.status === "normalized") tokens.push({ ...base, category: "LINE_HEIGHT", name, value: String(Math.round(style.lineHeight.value * 1e4) / 1e4) });
    else review.push({ name, layer: "layout", confidence: 0.5, reason: `텍스트 스타일 "${style.name}" 의 줄높이 단위를 알 수 없어 줄높이는 넣지 않았습니다(${style.lineHeight?.reason ?? "값 없음"}).` });
    if (f.family && !/^_?font[-_]?family(?:$|[/_-])|^var\(|^\{/i.test(f.family) && !/["\;{}]/.test(f.family)) tokens.push({ ...base, category: "FONT_FAMILY", name, value: `"${f.family}", var(--font-sans)` });
    const spacing = String(f.letterSpacing ?? "").trim().match(/^(-?\d+(?:\.\d+)?)\s*(%|px)?$/i);
    if (spacing) tokens.push({ ...base, category: "LETTER_SPACING", name, value: spacing[2] === "%" ? `${Number(spacing[1]) / 100}em` : `${Number(spacing[1])}px` });
  }
  return { tokens, review };
}

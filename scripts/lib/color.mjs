/**
 * 색 원시 연산. 의존성 없음.
 *
 * `rgbToHls` / `hlsToRgb` 는 Python `colorsys` 를 그대로 옮긴 것이다.
 * ds `design_token_service.infer_color_roles` 가 colorsys 기준으로
 * 임계값을 잡고 있어서, 같은 수치를 쓰려면 같은 변환이어야 한다.
 */

/**
 * 색 문자열 → { rgb: [r,g,b] 0..1, alpha 0..1 }. 실패는 null.
 *
 * "#06f" "#0066FF" "#0066FF80" "rgba(0, 102, 255, 0.5)" "rgb(0 102 255 / 50%)" 를 받는다.
 * 알파를 버리면 반투명 검정 scrim 이 불투명 검정이 되어 본문색(text)으로 뽑히기까지 한다.
 */
export function parseColorA(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const hex = s.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((c) => c + c).join("");
    const ch = (i) => parseInt(h.slice(i, i + 2), 16) / 255;
    return { rgb: [ch(0), ch(2), ch(4)], alpha: h.length === 8 ? ch(6) : 1 };
  }
  const fn = s.match(/^rgba?\(([^)]+)\)$/i);
  if (fn) {
    // 쉼표 문법(rgba(r, g, b, a))과 공백 문법(rgb(r g b / a)) 둘 다.
    const [body, slash] = fn[1].split("/");
    const parts = body.split(/[\s,]+/).filter(Boolean);
    const alphaRaw = slash ?? parts[3];
    const nums = parts.slice(0, 3).map((p) => parseFloat(p));
    if (nums.length === 3 && nums.every((n) => Number.isFinite(n))) {
      let alpha = 1;
      if (alphaRaw !== undefined) {
        const a = parseFloat(alphaRaw);
        if (Number.isFinite(a)) alpha = String(alphaRaw).trim().endsWith("%") ? a / 100 : a;
      }
      return { rgb: [nums[0] / 255, nums[1] / 255, nums[2] / 255], alpha: Math.max(0, Math.min(1, alpha)) };
    }
  }
  return null;
}

/** 색 문자열 → [r,g,b] 0..1. 알파는 버린다 — 색상·명도 계산용. 실패는 null. */
export function parseColor(raw) {
  return parseColorA(raw)?.rgb ?? null;
}

/** 색 문자열 → 알파 0..1. 해석할 수 없으면 1. */
export function alphaOf(raw) {
  return parseColorA(raw)?.alpha ?? 1;
}

export function toHex([r, g, b], alpha = 1) {
  const ch = (c) =>
    Math.round(Math.max(0, Math.min(1, c)) * 255)
      .toString(16)
      .padStart(2, "0");
  // 불투명이면 6자리, 반투명이면 알파를 붙인 8자리(#RRGGBBAA).
  return "#" + (ch(r) + ch(g) + ch(b) + (alpha < 1 ? ch(alpha) : "")).toUpperCase();
}

/** 색 문자열 → 정규화된 hex. 반투명이면 알파를 유지한다. 실패는 null. */
export function toCssColor(raw) {
  const c = parseColorA(raw);
  return c ? toHex(c.rgb, c.alpha) : null;
}

/** 학생 입력은 rgba의 소수 alpha를 8비트 hex로 반올림하지 않는다. */
export function exactCssColor(raw) {
  if (!parseColorA(raw)) return null;
  const text = String(raw).trim();
  return /^rgba?\(/i.test(text) ? text : toCssColor(text);
}

/** Python colorsys.rgb_to_hls 이식. h 는 0..1. */
export function rgbToHls(r, g, b) {
  const maxc = Math.max(r, g, b);
  const minc = Math.min(r, g, b);
  const sumc = maxc + minc;
  const rangec = maxc - minc;
  const l = sumc / 2;
  if (minc === maxc) return [0, l, 0];
  const s = l <= 0.5 ? rangec / sumc : rangec / (2 - maxc - minc);
  const rc = (maxc - r) / rangec;
  const gc = (maxc - g) / rangec;
  const bc = (maxc - b) / rangec;
  let h;
  if (r === maxc) h = bc - gc;
  else if (g === maxc) h = 2 + rc - bc;
  else h = 4 + gc - rc;
  h = ((h / 6) % 1 + 1) % 1;
  return [h, l, s];
}

/** Python colorsys.hls_to_rgb 이식. */
export function hlsToRgb(h, l, s) {
  if (s === 0) return [l, l, l];
  const m2 = l <= 0.5 ? l * (1 + s) : l + s - l * s;
  const m1 = 2 * l - m2;
  const v = (hue) => {
    hue = ((hue % 1) + 1) % 1;
    if (hue < 1 / 6) return m1 + (m2 - m1) * hue * 6;
    if (hue < 0.5) return m2;
    if (hue < 2 / 3) return m1 + (m2 - m1) * (2 / 3 - hue) * 6;
    return m1;
  };
  return [v(h + 1 / 3), v(h), v(h - 1 / 3)];
}

/** 무채색 판정은 채도(s)보다 chroma 가 안정적 — ds 주석과 동일한 이유. */
export function chromaOf([r, g, b]) {
  return Math.max(r, g, b) - Math.min(r, g, b);
}

export const NEUTRAL_CHROMA = 0.18;

/** WCAG 상대 휘도. */
export function luminance([r, g, b]) {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

/** 대비비 1..21. 가드 G8(접근성)에서 쓴다. */
export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// hue(도) → 색 이름. L1(이름 없는 hex 무더기)에서 primitive 이름을 만든다.
const HUE_NAMES = [
  [345, 360, "red"], [0, 15, "red"],
  [15, 45, "orange"], [45, 70, "yellow"], [70, 90, "lime"],
  [90, 150, "green"], [150, 175, "teal"], [175, 195, "cyan"],
  [195, 240, "blue"], [240, 265, "indigo"], [265, 290, "violet"],
  [290, 310, "purple"], [310, 345, "pink"],
];

export function hueName(rgb) {
  if (chromaOf(rgb) < NEUTRAL_CHROMA) {
    const [, l] = rgbToHls(...rgb);
    return l > 0.55 ? "gray" : "slate";
  }
  const [h] = rgbToHls(...rgb);
  const deg = h * 360;
  for (const [lo, hi, name] of HUE_NAMES) {
    if (deg >= lo && deg < hi) return name;
  }
  return "gray";
}

// 명도 → 스텝. 밝을수록 작은 숫자(Tailwind/Radix 관례).
const STEP_LIGHTNESS = [
  [50, 0.97], [100, 0.94], [200, 0.86], [300, 0.75], [400, 0.63],
  [500, 0.5], [600, 0.42], [700, 0.34], [800, 0.26], [900, 0.17],
];

export function stepFor(rgb) {
  const [, l] = rgbToHls(...rgb);
  let best = STEP_LIGHTNESS[0];
  for (const row of STEP_LIGHTNESS) {
    if (Math.abs(row[1] - l) < Math.abs(best[1] - l)) best = row;
  }
  return best[0];
}

export { STEP_LIGHTNESS };

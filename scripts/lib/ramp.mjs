/**
 * Hexcode → Primitive 램프 생성 (사다리 L1/L0 에서 사용).
 *
 * DSP `generation._color_scale` 의 의도를 옮기되, 고정 명도 테이블 방식으로
 * 바꿨다. seed 의 명도에 따라 램프가 무너지지 않고, 같은 seed 면 언제나
 * 같은 결과가 나온다(결정론 — 가드/lock 비교의 전제).
 */
import { parseColor, toHex, rgbToHls, hlsToRgb, stepFor, STEP_LIGHTNESS } from "./color.mjs";

/** 양 끝으로 갈수록 채도를 낮춘다. 0.5 에서 1.0, 0/1 에서 0.55. */
function satCurve(base, lightness) {
  const drop = Math.abs(lightness - 0.5) * 2; // 0..1
  return Math.max(0.02, base * (1 - drop * 0.45));
}

/**
 * seed hex 로 10단계 램프를 만든다.
 * seed 와 명도가 가장 가까운 스텝은 seed 원본 hex 를 그대로 둔다 —
 * 브랜드 색이 반올림으로 미묘하게 달라지는 사고를 막는다.
 */
export function buildRamp(seedHex, name) {
  const rgb = parseColor(seedHex);
  if (!rgb) throw new Error(`Cannot read the seed color for the ramp: ${seedHex}`);
  const [h, , s] = rgbToHls(...rgb);
  const anchor = stepFor(rgb);
  const steps = STEP_LIGHTNESS.map(([step, l]) => ({
    step,
    value: step === anchor ? toHex(rgb) : toHex(hlsToRgb(h, l, satCurve(s, l))),
  }));
  return { name: name || "brand", seed: toHex(rgb), anchorStep: anchor, steps };
}

/** 같은 hue 를 아주 옅게 섞은 중성 램프. 순수 회색보다 화면이 덜 탁하다. */
export function buildNeutralRamp(seedHex, name = "gray") {
  const rgb = parseColor(seedHex);
  const [h] = rgb ? rgbToHls(...rgb) : [0];
  const steps = STEP_LIGHTNESS.map(([step, l]) => ({
    step,
    value: toHex(hlsToRgb(h, l, 0.04)),
  }));
  return { name, seed: null, anchorStep: null, steps };
}

/** 의미색(danger/success/warning/info) 기본 seed. L0 합성에서만 쓴다. */
export const STATUS_SEEDS = {
  danger: "#E5484D",
  warning: "#F5A524",
  success: "#30A46C",
  info: "#0091FF",
};

/** 램프 → primitive 토큰 목록. 이름은 `{ramp}-{step}`. */
export function rampToPrimitives(ramp, { source, confidence, reason }) {
  return ramp.steps.map((s) => ({
    layer: "primitive",
    category: "COLOR",
    name: `${ramp.name}-${s.step}`,
    value: s.value,
    hex: s.value,
    ref: null,
    source,
    confidence,
    reason,
  }));
}

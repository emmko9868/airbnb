/**
 * Primitive → Semantic 역할 추론 (사다리 L2a / L1 / L0).
 *
 * ds `design_token_service.infer_color_roles` 이식. 이름을 전혀 믿지 않고
 * **값(hex)** 만 보고 역할을 배정하는 것이 요점 — Figma 변수 이름이
 * "색상1/색상2" 여도 동작한다.
 *
 * 원본에서 고친 것:
 *  1. 무채색 판정을 **계열 단위**로 한다. 원본은 스와치별 chroma 로 판정해서
 *     blue-50 같은 컬러 램프의 밝은 끝이 무채색 풀에 섞이고, bg/border 가
 *     파랑·빨강 틴트로 새는 문제가 있었다.
 *  2. primary 를 의미색보다 **먼저** 고른다. 원본은 info 가 blue-500 을 먼저
 *     가져가서 primary 가 blue-600 으로 한 스텝 밀렸다.
 *  3. 의미색은 계열을 고른 뒤 그 계열의 **500 스텝**을 쓴다(관례).
 *  4. on-primary 를 대비비로 고른다(원본은 항상 가장 밝은 무채색).
 *  5. 모든 역할에 근거(reason)를 남긴다 — 추론은 리뷰 가능해야 한다.
 */
import { parseColorA, rgbToHls, chromaOf, contrast, hueName, NEUTRAL_CHROMA } from "./color.mjs";

/** 표준 semantic 역할 = semantic 계층의 계약. */
export const SEMANTIC_ROLES = [
  "bg", "surface", "surface-raised", "border", "border-strong",
  "text", "text-secondary", "text-disabled",
  "primary", "primary-hover", "primary-active", "on-primary",
  "danger", "success", "warning", "info",
];

function swatchesOf(primitives) {
  const out = [];
  for (const p of primitives) {
    const c = parseColorA(p.hex ?? p.value);
    // 반투명 색(scrim·overlay)은 역할 후보가 아니다. 뒤에 무엇이 깔리느냐로 색이 바뀌어
    // bg/text 로 쓰면 대비를 보장할 수 없다.
    if (!c || c.alpha < 1) continue;
    const { rgb } = c;
    const [h, l, s] = rgbToHls(...rgb);
    out.push({
      name: p.name,
      rgb,
      hue: h * 360,
      light: l,
      sat: s,
      chroma: chromaOf(rgb),
      nameFamily: p.name.replace(/-\d+$/, ""), // "blue-500" → "blue"
      step: Number((p.name.match(/-(\d+)$/) || [])[1] ?? NaN),
    });
  }
  return out;
}

/**
 * 이름에서 뽑은 계열을 **색상으로 검증**한다.
 *
 * `color-1 … color-9` 처럼 이름이 계열을 뜻하지 않는 경우, 이름만 믿으면
 * 전부 한 계열로 묶여 primary-hover/active 가 엉뚱한 색(빨강 등)으로 간다.
 * 유채색 구성원의 hue 가 흩어져 있으면 이름 계열을 버리고 hue 버킷으로 다시 묶는다.
 */
function deriveFamilies(sw) {
  const groups = new Map();
  for (const s of sw) {
    if (!groups.has(s.nameFamily)) groups.set(s.nameFamily, []);
    groups.get(s.nameFamily).push(s);
  }
  for (const [, members] of groups) {
    const chromatic = members.filter((m) => m.chroma >= NEUTRAL_CHROMA);
    let coherent = true;
    if (members.length < 2) {
      coherent = false; // 혼자면 계열이라 할 수 없다
    } else if (chromatic.length >= 2) {
      // 원형 평균의 결과 길이로 hue 산포를 본다 (0에서 360 경계 문제 없음).
      let x = 0;
      let y = 0;
      for (const m of chromatic) {
        const r = (m.hue * Math.PI) / 180;
        x += Math.cos(r);
        y += Math.sin(r);
      }
      const R = Math.hypot(x, y) / chromatic.length;
      coherent = R >= 0.85;
    }
    for (const m of members) m.family = coherent ? m.nameFamily : hueName(m.rgb);
  }
  return sw;
}

/**
 * 무채색/유채색을 **계열 단위**로 가른다.
 * 계열의 최대 chroma 가 임계 미만이면 그 계열 전체가 무채색이다.
 * 계열 구분이 없는 낱개 색만 있으면 스와치별 chroma 로 떨어진다.
 */
function splitByFamily(sw) {
  const families = new Map();
  for (const s of sw) {
    if (!families.has(s.family)) families.set(s.family, []);
    families.get(s.family).push(s);
  }
  const neutrals = [];
  const chromatics = [];
  let hasNeutralFamily = false;
  for (const [, members] of families) {
    const peak = Math.max(...members.map((m) => m.chroma));
    if (peak < NEUTRAL_CHROMA && members.length > 1) {
      hasNeutralFamily = true;
      neutrals.push(...members);
    } else if (members.length > 1) {
      chromatics.push(...members);
    } else {
      // 낱개 색은 계열로 판단할 수 없다 → 스와치 chroma 로.
      (members[0].chroma < NEUTRAL_CHROMA ? neutrals : chromatics).push(members[0]);
    }
  }
  if (!hasNeutralFamily && !neutrals.length) {
    // 무채색 계열이 아예 없으면 가장 chroma 낮은 색들을 빌려 쓴다.
    const sorted = [...sw].sort((a, b) => a.chroma - b.chroma);
    neutrals.push(...sorted.slice(0, Math.min(5, sorted.length)));
  }
  neutrals.sort((a, b) => a.light - b.light);
  return { neutrals, chromatics };
}

function nearestLight(pool, target) {
  if (!pool.length) return null;
  return pool.reduce((a, b) => {
    const da = Math.abs(a.light - target);
    const db = Math.abs(b.light - target);
    if (Math.abs(da - db) > 1e-6) return db < da ? b : a;
    return b.chroma < a.chroma ? b : a; // 동률이면 더 무채색인 쪽
  });
}

/** 계열 안에서 관례 스텝(500)에 가장 가까운 것. 스텝이 없으면 최고 채도. */
function canonicalOf(members) {
  const stepped = members.filter((m) => Number.isFinite(m.step));
  if (stepped.length) {
    return stepped.reduce((a, b) => (Math.abs(b.step - 500) < Math.abs(a.step - 500) ? b : a));
  }
  return members.reduce((a, b) => (b.sat > a.sat ? b : a));
}

/**
 * @param {Array} primitives  layer==="primitive" 인 COLOR 토큰
 * @param {object} opts  { prefer: { primary?: "blue" } } 이름 힌트(선택)
 * @returns {Array} semantic 토큰 (value = var(--color-{primitive}))
 */
export function inferSemanticRoles(primitives, opts = {}) {
  const sw = deriveFamilies(swatchesOf(primitives));
  if (!sw.length) return [];
  const { neutrals, chromatics } = splitByFamily(sw);

  const roles = {};
  const why = {};
  const put = (role, s, reason) => {
    if (!s || roles[role]) return;
    roles[role] = s;
    why[role] = reason;
  };

  // ── 무채색: 명도 순으로 배경/경계/본문 ──────────────────────────
  if (neutrals.length) {
    const lightest = neutrals[neutrals.length - 1];
    put("bg", lightest, "무채색 계열 중 가장 밝음");
    put("surface", lightest, "bg 와 동일 (분리된 표면 단계가 없음)");
    put("text", neutrals[0], "무채색 계열 중 가장 어두움");
    put("text-secondary", nearestLight(neutrals, 0.45), "명도 0.45 근처");
    put("text-disabled", nearestLight(neutrals, 0.65), "명도 0.65 근처");
    put("border", nearestLight(neutrals, 0.85), "명도 0.85 근처");
    put("border-strong", nearestLight(neutrals, 0.72), "명도 0.72 근처");
    const above = neutrals.filter((s) => s.light > lightest.light);
    put("surface-raised", above.length ? nearestLight(above, 1) : lightest,
      above.length ? "bg 보다 밝은 무채색" : "bg 보다 밝은 무채색이 없어 bg 와 동일");
  }

  // ── primary: 의미색보다 먼저 ────────────────────────────────────
  const hints = ["primary", "brand", "accent", "action", "main"];
  if (opts.prefer?.primary) hints.unshift(String(opts.prefer.primary).toLowerCase());
  const score = (s) => s.sat - Math.abs(s.light - 0.5);
  const named = chromatics.filter((s) => hints.some((h) => s.name.toLowerCase().includes(h)));
  const strong = named.filter((s) =>
    ["primary", "action-primary", "brand-primary", "color-primary"].includes(s.name.toLowerCase()),
  );
  const pool = strong.length ? strong : named;
  let prim = null;
  let primWhy = "";
  if (pool.length) {
    // 이름이 걸린 계열 안에서 관례 스텝을 고른다.
    const best = pool.reduce((a, b) => (score(b) > score(a) ? b : a));
    const family = chromatics.filter((s) => s.family === best.family);
    prim = family.length > 1 ? canonicalOf(family) : best;
    primWhy = `이름 힌트(${hints.find((h) => best.name.toLowerCase().includes(h))}) 계열의 기준 스텝`;
  } else if (chromatics.length) {
    const best = chromatics.reduce((a, b) => (score(b) > score(a) ? b : a));
    prim = best;
    primWhy = "이름 단서 없음 — 채도 높고 중간 밝기인 색";
  }

  const usedFamilies = new Set();
  if (prim) {
    put("primary", prim, primWhy);
    usedFamilies.add(prim.family);
    const family = chromatics
      .filter((s) => s.family === prim.family && Number.isFinite(s.step))
      .sort((a, b) => a.step - b.step);
    const idx = family.findIndex((s) => s.name === prim.name);
    if (idx >= 0 && family[idx + 1]) {
      put("primary-hover", family[idx + 1], "primary 램프의 한 단계 어두운 스텝");
      put("primary-active", family[idx + 2] ?? family[idx + 1], "primary 램프의 두 단계 어두운 스텝");
    } else {
      const darker = chromatics
        .filter((s) => s.family === prim.family && s.light < prim.light)
        .sort((a, b) => b.light - a.light);
      put("primary-hover", darker[0], "primary 보다 어두운 동일 계열");
      put("primary-active", darker[1] ?? darker[0], "primary 보다 더 어두운 동일 계열");
    }
    if (neutrals.length) {
      const best = neutrals.reduce((a, b) =>
        contrast(b.rgb, prim.rgb) > contrast(a.rgb, prim.rgb) ? b : a,
      );
      const ratio = contrast(best.rgb, prim.rgb);
      put("on-primary", best, `primary 대비 ${ratio.toFixed(1)}:1 로 최대`);
    }
  }

  // ── 의미색: hue 구간 → 계열 선택 → 그 계열의 기준 스텝 ──────────
  const pickHue = (lo, hi) => {
    const inRange = (s) => (lo <= hi ? s.hue >= lo && s.hue <= hi : s.hue >= lo || s.hue <= hi);
    const cand = chromatics.filter(inRange);
    if (!cand.length) return null;
    const byFamily = new Map();
    for (const s of cand) {
      if (!byFamily.has(s.family)) byFamily.set(s.family, []);
      byFamily.get(s.family).push(s);
    }
    // primary 계열이 아닌 계열을 먼저 본다. 없으면 primary 를 그대로 쓴다.
    const entries = [...byFamily.entries()];
    const fresh = entries.filter(([f]) => !usedFamilies.has(f));
    const from = fresh.length ? fresh : entries;
    const [family, members] = from.reduce((a, b) =>
      Math.max(...b[1].map((m) => m.sat)) > Math.max(...a[1].map((m) => m.sat)) ? b : a,
    );
    return { pick: canonicalOf(members), reused: usedFamilies.has(family) };
  };
  for (const [role, lo, hi, label] of [
    ["danger", 340, 20, "hue 340~20°"],
    ["warning", 30, 65, "hue 30~65°"],
    ["success", 90, 160, "hue 90~160°"],
    ["info", 190, 255, "hue 190~255°"],
  ]) {
    const got = pickHue(lo, hi);
    if (!got) continue;
    put(role, got.pick, got.reused
      ? `${label} 에 전용 계열이 없어 primary 계열 재사용`
      : `${label} 계열의 기준 스텝`);
    usedFamilies.add(got.pick.family);
  }

  return Object.entries(roles).map(([role, s]) => ({
    layer: "semantic",
    category: "COLOR",
    name: role,
    value: `var(--color-${s.name})`,
    hex: null,
    ref: s.name,
    source: "inferred",
    confidence: pool.length || role !== "primary" ? 0.55 : 0.4,
    reason: why[role],
  }));
}

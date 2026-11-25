/**
 * ★ Hexcode → Primitive → Semantic 3계층 사다리.
 *
 * 이 스타터킷의 핵심. 입력이 얼마나 갖춰졌든 **같은 모양의 산출물**을 낸다.
 *
 *   L3  hex + primitive + semantic 다 선언  → 추론 0. 선언 그대로.
 *   L2a hex + primitive 만                  → semantic 을 값 기반으로 추론
 *   L2b hex + semantic 만                   → primitive 를 역추출, semantic 을 alias 로 재작성
 *   L1  hex 만 (이름 없는 색 무더기)         → 이름 생성 → primitive → semantic 추론
 *   L0  아무것도 없음                        → seed 로 램프 합성 → primitive → semantic
 *
 * 모든 토큰은 `source`(declared/extracted/inferred/synthesized)와 `confidence`,
 * `reason` 을 달고 나온다. 추론이 섞였는지 리뷰어가 구분할 수 없으면
 * 다음 동기화에서 추측이 사람이 쓴 값을 덮어쓴다 — 그래서 출처는 선택이 아니다.
 */
import { parseColorA, toHex, toCssColor, hueName, stepFor, chromaOf, NEUTRAL_CHROMA } from "./color.mjs";
import { inferSemanticRoles, SEMANTIC_ROLES } from "./roles.mjs";
import { stripCategoryPrefix, cssVarFor } from "./css.mjs";
import { buildRamp, buildNeutralRamp, rampToPrimitives, STATUS_SEEDS } from "./ramp.mjs";

export const LEVELS = {
  L3: "L3 — 3계층 모두 선언됨 (추론 없음)",
  L2a: "L2a — primitive 까지 선언, semantic 을 추론",
  L2b: "L2b — semantic 만 선언, primitive 를 역추출",
  L1: "L1 — 이름 없는 hex 만 있어 전 계층을 생성",
  L0: "L0 — 입력 없음. seed 로 전체 합성",
};

// 컴포넌트 토큰임을 시사하는 이름 세그먼트. DSP `_COMPONENT_SEGMENTS` 를
// 기본값으로 두고, 실제 파일의 컴포넌트 이름으로 런타임 확장한다.
const BASE_COMPONENT_SEGMENTS = [
  "button", "card", "input", "badge", "modal", "nav", "chip", "tooltip",
  "dialog", "select", "tab", "table", "toast", "avatar", "checkbox", "switch",
];

const LAYOUT_RE =
  /(?:^|[/._-])(base|spacing|space|gap|radius|breakpoint|shadow|elevation|z-index|duration|easing)(?:$|[/._-])/;

function matchesTier(rule, variable) {
  if (!rule) return false;
  const cols = (rule.collections ?? []).map((c) => String(c).toLowerCase());
  if (cols.includes(String(variable.collection).toLowerCase())) return true;
  for (const pattern of rule.match ?? []) {
    try {
      if (new RegExp(pattern, "i").test(variable.path)) return true;
    } catch {
      /* 잘못된 정규식은 무시 — 설정 오타로 파이프라인이 죽으면 안 된다 */
    }
  }
  return false;
}

function hasComponentSegment(path, segments) {
  const parts = String(path ?? "").toLowerCase().split(/[/._\-\s]/);
  return parts.some((p) => segments.includes(p));
}

/** 이미 있는 이름이면 -2, -3 … 을 붙인다. */
function uniqueSuffix(base, taken) {
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** 이름 충돌 없이 primitive 이름을 짓는다: blue-500, 충돌 시 인접 스텝. */
function uniqueName(base, step, taken) {
  const candidate = `${base}-${step}`;
  if (!taken.has(candidate)) return candidate;
  for (const delta of [25, -25, 50, -50, 75, -75]) {
    const alt = `${base}-${step + delta}`;
    if (step + delta > 0 && !taken.has(alt)) return alt;
  }
  let n = 2;
  while (taken.has(`${base}-${step}-${n}`)) n += 1;
  return `${base}-${step}-${n}`;
}

/**
 * hex 목록 → 이름 붙은 primitive 토큰. 같은 색(알파 포함)은 하나로 묶는다.
 * 반투명 색은 이름에 알파를 붙인다: rgba(0,0,0,.5) → slate-900-a50.
 */
export function hexesToPrimitives(hexes, { source, confidence, reason }) {
  const taken = new Set();
  const byHex = new Map();
  const out = [];
  for (const raw of hexes) {
    const c = parseColorA(raw);
    if (!c) continue;
    const { rgb, alpha } = c;
    const hex = toHex(rgb, alpha);
    if (byHex.has(hex)) continue;
    const base = alpha < 1 ? `${hueName(rgb)}-${stepFor(rgb)}-a${Math.round(alpha * 100)}` : null;
    const name = base ? uniqueSuffix(base, taken) : uniqueName(hueName(rgb), stepFor(rgb), taken);
    taken.add(name);
    byHex.set(hex, name);
    out.push({
      layer: "primitive", category: "COLOR", name, value: hex, hex,
      ref: null, source, confidence, reason,
    });
  }
  return { primitives: out, byHex };
}

/** 표준 layout 세트. DSP `generation._deterministic_token_tiers` 의 layout 블록 이식. */
export function defaultLayoutTokens(reason) {
  const t = (category, name, value) => ({
    layer: "layout", category, name, value, hex: null, ref: null,
    source: "synthesized", confidence: 0.3, reason,
  });
  return [
    // 가림막(scrim). 불투명 색으로는 표현할 수 없어 primitive/semantic 계층에 넣지 못한다.
    // 리터럴이 있어야 할 곳은 컴포넌트 CSS 가 아니라 여기다(가드 G10).
    t("COLOR", "overlay", "rgb(0 0 0 / 45%)"),
    t("SPACING_UNIT", "base", "4px"),
    t("RADIUS", "sm", "4px"), t("RADIUS", "md", "8px"),
    t("RADIUS", "lg", "12px"), t("RADIUS", "full", "9999px"),
    t("BORDER_WIDTH", "thin", "1px"), t("BORDER_WIDTH", "thick", "2px"),
    t("SHADOW", "sm", "0 1px 2px rgba(0,0,0,.06)"),
    t("SHADOW", "md", "0 4px 12px rgba(0,0,0,.08)"),
    t("SHADOW", "lg", "0 12px 32px rgba(0,0,0,.12)"),
    t("DURATION", "fast", "150ms"), t("DURATION", "normal", "250ms"),
    t("EASING", "standard", "cubic-bezier(0.2, 0, 0, 1)"),
    t("FONT_FAMILY", "sans", "system-ui, -apple-system, 'Segoe UI', sans-serif"),
    t("FONT_SIZE", "body-2", "14px"), t("FONT_SIZE", "body-1", "16px"),
    t("FONT_SIZE", "title", "20px"),
    t("FONT_WEIGHT", "regular", "400"), t("FONT_WEIGHT", "medium", "500"),
    t("FONT_WEIGHT", "bold", "700"),
    t("LINE_HEIGHT", "tight", "1.25"), t("LINE_HEIGHT", "normal", "1.5"),
  ];
}

/**
 * 컴포넌트 계층 합성 (4번째 **선택** 계층).
 * semantic/layout 만 참조한다 — G1 가드가 이를 강제한다.
 */
export function synthesizeComponentTokens(componentNames, semanticNames, reason) {
  const has = (n) => semanticNames.has(n);
  const out = [];
  for (const raw of componentNames) {
    const c = String(raw).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!c) continue;
    const add = (category, name, value) =>
      out.push({
        layer: "component", category, name: `${c}-${name}`, value, hex: null,
        ref: null, source: "synthesized", confidence: 0.3, reason,
      });
    add("COLOR", "bg", has("primary") ? "var(--color-primary)" : "var(--color-surface)");
    add("COLOR", "fg", has("on-primary") ? "var(--color-on-primary)" : "var(--color-text)");
    add("COLOR", "border", "var(--color-border)");
    add("RADIUS", "radius", "var(--radius-md)");
  }
  return out;
}

/**
 * @param {object} model   normalize() 결과
 * @param {object} config  ds.config.json
 */
export function resolveLadder(model, config = {}) {
  const report = { level: null, notes: [], counts: {}, review: [] };
  const segments = [
    ...BASE_COMPONENT_SEGMENTS,
    ...(model.components ?? []).map((c) => String(c.name).toLowerCase()),
    ...(model.componentSets ?? []).map((c) => String(c.name).toLowerCase()),
  ].filter(Boolean);

  const vars = model.variables ?? [];
  const byName = new Map(vars.map((v) => [v.name, v]));
  const fanIn = new Map();
  for (const v of vars) {
    if (v.aliasOf) fanIn.set(v.aliasOf, (fanIn.get(v.aliasOf) ?? 0) + 1);
  }
  const depthOf = (v, seen = new Set()) => {
    if (!v?.aliasOf || seen.has(v.name)) return 0;
    seen.add(v.name);
    const next = byName.get(v.aliasOf);
    return next ? 1 + depthOf(next, seen) : 1;
  };

  // ── 1. 분류: 선언 → 구조(alias 그래프) → 이름 ──────────────────
  const classified = [];
  for (const v of vars) {
    if (!v.category) continue; // BOOLEAN 등 매핑 불가
    let layer = null;
    let source = "";
    let confidence = 0;
    let reason = "";

    for (const name of ["primitive", "semantic", "component"]) {
      if (matchesTier(config.tiers?.[name], v)) {
        layer = name;
        source = "declared";
        confidence = 1;
        reason = `ds.config.json tiers.${name} 에 선언된 컬렉션/패턴`;
        break;
      }
    }

    if (!layer) {
      const depth = depthOf(v);
      const referenced = (fanIn.get(v.name) ?? 0) > 0;
      if (depth >= 2) {
        layer = "component";
        source = "inferred";
        confidence = 0.7;
        reason = `alias 사슬 깊이 ${depth} — primitive→semantic→component 로 본다`;
      } else if (depth === 1) {
        layer = hasComponentSegment(v.path, segments) && !referenced ? "component" : "semantic";
        source = "inferred";
        confidence = 0.75;
        reason = `alias 이고 ${referenced ? "다른 변수가 참조함" : "참조되지 않음"}`;
      } else if (v.category !== "COLOR") {
        // primitive/semantic 구분은 색에만 의미가 있다. 간격·모서리·타이포·모션은
        // 값이 곧 역할이라 전부 layout 이다. (이름 regex 로 맞히려 하면
        // `Layout/border/width/thin` 처럼 흔한 이름을 놓친다.)
        layer = "layout";
        source = "inferred";
        confidence = LAYOUT_RE.test(v.path.toLowerCase()) ? 0.75 : 0.6;
        reason = "색이 아닌 카테고리는 layout 계층";
      } else if (hasComponentSegment(v.path, segments)) {
        layer = "component";
        source = "inferred";
        confidence = 0.6;
        reason = "이름에 컴포넌트 세그먼트";
      } else {
        layer = "primitive";
        source = "inferred";
        confidence = referenced ? 0.8 : 0.55;
        reason = referenced ? "원시값이고 다른 변수가 참조함" : "원시값이고 참조되지 않음";
      }
    }

    classified.push({
      layer,
      category: v.category,
      name: stripCategoryPrefix(v.name, v.category),
      value: v.aliasOf ? `var(${cssRef(v, byName)})` : formatValue(v),
      hex: v.category === "COLOR" && !v.aliasOf ? toHexSafe(v.value) : null,
      ref: v.aliasOf,
      source,
      confidence,
      reason,
      description: v.description,
      declaredTier: v.declaredTier,
      // 이름이 바뀌어도 같은 변수임을 알아보는 열쇠. tokenName 소유권이 쓴다.
      figmaId: v.id || undefined,
    });
  }

  let primitives = classified.filter((t) => t.layer === "primitive" && t.category === "COLOR");
  let semantics = classified.filter((t) => t.layer === "semantic" && t.category === "COLOR");
  const others = classified.filter(
    (t) => !(t.category === "COLOR" && (t.layer === "primitive" || t.layer === "semantic")),
  );
  const declaredSomething = classified.some((t) => t.source === "declared");

  // ── 2. 결손 보정 ────────────────────────────────────────────────
  let level;
  if (primitives.length && semantics.length) {
    level = declaredSomething ? "L3" : "L2a";
    report.notes.push(
      declaredSomething
        ? "primitive·semantic 이 모두 확인됨. 선언된 계층은 그대로 사용."
        : "primitive·semantic 을 alias 구조로 구분함(선언 없음). ds.config.json 에 컬렉션을 적으면 추론이 사라진다.",
    );
  } else if (primitives.length && !semantics.length) {
    level = "L2a";
    semantics = inferSemanticRoles(primitives, { prefer: config.prefer });
    report.notes.push(`semantic 계층이 없어 primitive ${primitives.length}개에서 역할 ${semantics.length}개를 추론함.`);
  } else if (!primitives.length && semantics.length) {
    level = "L2b";
    const extracted = extractPrimitivesFrom(semantics);
    primitives = extracted.primitives;
    semantics = extracted.semantics;
    report.notes.push(`primitive 계층이 없어 semantic 이 물고 있던 hex ${primitives.length}개를 primitive 로 역추출하고 semantic 을 alias 로 재작성함.`);
  } else {
    // 변수가 아예 없다 — 스타일/무더기 hex 를 본다.
    const loose = (model.paintStyles ?? []).map((s) => s.value).filter(Boolean);
    if (loose.length) {
      level = "L1";
      const built = hexesToPrimitives(loose, {
        source: "extracted", confidence: 0.5,
        reason: "Figma Paint Style 값에서 hue·명도로 이름을 생성",
      });
      primitives = built.primitives;
      semantics = inferSemanticRoles(primitives, { prefer: config.prefer });
      report.notes.push(`변수가 없어 Paint Style ${loose.length}개에서 primitive 를 만들고 semantic 을 추론함.`);
    } else {
      level = "L0";
      const seed = config.seed || "#0066FF";
      const why = `입력이 없어 seed ${seed} 로 합성`;
      primitives = [
        ...rampToPrimitives(buildRamp(seed, config.brandName || "brand"), { source: "synthesized", confidence: 0.3, reason: why }),
        ...rampToPrimitives(buildNeutralRamp(seed, "gray"), { source: "synthesized", confidence: 0.3, reason: why }),
      ];
      if (config.synthesize?.statusColors !== false) {
        for (const [role, hex] of Object.entries(STATUS_SEEDS)) {
          const name = { danger: "red", warning: "amber", success: "green", info: "sky" }[role];
          primitives.push(...rampToPrimitives(buildRamp(hex, name), { source: "synthesized", confidence: 0.3, reason: `${role} 기본 seed` }));
        }
      }
      semantics = inferSemanticRoles(primitives, { prefer: { primary: config.brandName || "brand" } });
      report.notes.push(`입력이 전혀 없어 seed 하나로 primitive ${primitives.length}개 + semantic ${semantics.length}개를 합성함.`);
    }
  }

  // ── 3. semantic 역할 구멍 메우기 ───────────────────────────────
  const haveRoles = new Set(semantics.map((s) => s.name));
  const missing = SEMANTIC_ROLES.filter((r) => !haveRoles.has(r));
  if (missing.length && config.synthesize?.missingRoles !== false) {
    const filled = inferSemanticRoles(primitives, { prefer: config.prefer }).filter((s) => missing.includes(s.name));
    for (const f of filled) semantics.push({ ...f, confidence: Math.min(f.confidence, 0.45), reason: `${f.reason} (누락 역할 보충)` });
    const still = missing.filter((m) => !filled.some((f) => f.name === m));
    if (still.length) report.notes.push(`채우지 못한 역할: ${still.join(", ")} — 원본에 해당 색이 없다.`);
  }

  // ── 4. layout / component 보충 ─────────────────────────────────
  const tokens = [...primitives, ...semantics, ...others];
  if (config.synthesize?.layout !== false) {
    // 전무할 때만 채우면 Figma 에 radius 몇 개만 있는 흔한 경우에 타이포·모션이
    // 비어, 생성된 컴포넌트 CSS 의 var(--font-sans) 등이 해석되지 않는다.
    // 그래서 '빠진 것만' 개별로 채운다.
    const have = new Set(tokens.map((t) => `${t.category}:${t.name}`));
    const filled = defaultLayoutTokens("기본 layout 세트에서 보충함")
      .filter((t) => !have.has(`${t.category}:${t.name}`));
    if (filled.length) {
      tokens.push(...filled);
      report.notes.push(`layout 계층에서 빠진 ${filled.length}개를 기본 세트로 보충함.`);
    }
  }
  const hasComponentLayer = tokens.some((t) => t.layer === "component");
  const componentNames = [...(model.componentSets ?? []), ...(model.components ?? [])]
    .filter((c) => !c.componentSetId)
    .map((c) => c.name);
  if (!hasComponentLayer && componentNames.length && config.synthesize?.componentTokens) {
    tokens.push(
      ...synthesizeComponentTokens(componentNames, new Set(semantics.map((s) => s.name)),
        "component 계층이 없어 컴포넌트 인벤토리에서 합성함"),
    );
    report.notes.push(`component 계층이 없어 컴포넌트 ${componentNames.length}개분 토큰을 합성함(검토 필요).`);
  }

  // ── 5. 리포트 ──────────────────────────────────────────────────
  report.level = level;
  report.levelLabel = LEVELS[level];
  summarizeReport(tokens, report, config);

  return { tokens, report };
}

/** 계층별 개수·출처별 개수·검토 목록. 소유권을 적용해 토큰이 바뀐 뒤 다시 센다. */
export function summarizeReport(tokens, report, config = {}) {
  report.counts = {};
  for (const t of tokens) report.counts[t.layer] = (report.counts[t.layer] ?? 0) + 1;
  const threshold = config.confidence?.review ?? 0.6;
  report.review = tokens
    .filter((t) => t.confidence < threshold)
    .map((t) => ({ name: t.name, layer: t.layer, confidence: t.confidence, reason: t.reason }));
  report.bySource = {};
  for (const t of tokens) report.bySource[t.source] = (report.bySource[t.source] ?? 0) + 1;
  return report;
}

// ── helpers ────────────────────────────────────────────────────────

/** 색 값 → 정규화된 hex. 반투명이면 #RRGGBBAA 로 알파를 유지한다. */
function toHexSafe(value) {
  return toCssColor(value);
}

function formatValue(v) {
  if (v.category === "COLOR") return toHexSafe(v.value) ?? String(v.value ?? "");
  if (typeof v.value === "number") {
    // FLOAT 은 카테고리별 단위를 붙인다. 무단위 카테고리는 그대로.
    if (["FONT_WEIGHT", "OPACITY", "LINE_HEIGHT", "Z_INDEX"].includes(v.category)) return String(v.value);
    if (v.category === "DURATION") return `${v.value}ms`;
    return `${v.value}px`;
  }
  return String(v.value ?? "");
}

function cssRef(v, byName) {
  const target = byName.get(v.aliasOf);
  const category = target?.category ?? v.category;
  return cssVarFor(category, stripCategoryPrefix(v.aliasOf, category));
}

/**
 * L2b: semantic 이 hex 를 직접 물고 있을 때 primitive 를 역추출한다.
 * 같은 hex 를 쓰는 여러 역할은 하나의 primitive 를 공유한다.
 */
function extractPrimitivesFrom(semantics) {
  const hexes = semantics.map((s) => s.hex).filter(Boolean);
  const { primitives, byHex } = hexesToPrimitives(hexes, {
    source: "extracted",
    confidence: 0.65,
    reason: "semantic 이 직접 물고 있던 hex 를 hue·명도로 이름 붙여 승격",
  });
  const rewritten = semantics.map((s) => {
    const target = s.hex ? byHex.get(s.hex) : null;
    if (!target) return s;
    return {
      ...s,
      value: `var(--color-${target})`,
      hex: null,
      ref: target,
      source: s.source === "declared" ? "declared" : s.source,
      reason: `${s.reason} → primitive(${target}) 참조로 재작성`,
    };
  });
  return { primitives, semantics: rewritten };
}

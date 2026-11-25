/**
 * 컴포넌트 기준선 — Figma 없이도 만들 수 있는 최소 집합.
 *
 * `components.baseline.json` 의 명세를 Figma 추출 결과와 **같은 모양**으로 바꾼다.
 * 그래야 story·Code Connect 생성기가 출처를 구분하지 않고 동작한다.
 *
 * 나중에 Figma 에 같은 이름의 Component Set 이 생기면 Figma 쪽이 이긴다
 * (ds.config.json 의 ownership.variantMatrix = "figma").
 */

const TIERS = ["core", "standard", "extended"];

function pascal(name) {
  return String(name ?? "").split(/[^A-Za-z0-9]+/).filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1)).join("") || "Component";
}

/** "primary" → "Primary", "sm" → "Sm". Figma 쪽 표기를 흉내 낸다. */
function figmaLabel(code) {
  return String(code).split("-").map((p) => (p.length <= 2 ? p.toUpperCase() : p[0].toUpperCase() + p.slice(1))).join(" ");
}

function toSpec(entry) {
  const props = [];
  for (const p of entry.props ?? []) {
    const figmaName = figmaLabel(p.name);
    if (p.kind === "enum") {
      const options = (p.values ?? []).map((v) => ({ figma: figmaLabel(v), code: v }));
      // size 는 첫 값이 아니라 중간(md)이 기본이다. 첫 값을 쓰면 전부 sm 으로 나온다.
      const mid = p.name === "size" ? options.find((o) => o.code === "md" || o.code === "m") : null;
      props.push({ kind: "enum", figmaName, codeName: p.name, options, defaultValue: (mid ?? options[0])?.code });
    } else if (p.kind === "boolean") {
      props.push({ kind: "boolean", figmaName, codeName: p.name, defaultValue: false });
    } else if (p.kind === "string") {
      props.push({ kind: "string", figmaName, codeName: p.name, defaultValue: "" });
    } else if (p.kind === "node") {
      props.push({ kind: "node", figmaName, codeName: p.name, defaultValue: null });
    }
  }
  // 상호작용 상태는 prop 이 아니라 CSS 의사클래스가 처리한다 (Figma 경로와 동일 규칙).
  const pseudoStates = (entry.states ?? []).filter((s) => s !== "disabled");
  return {
    name: entry.name,
    pascal: pascal(entry.name),
    nodeId: "",
    key: "",
    description: entry.note ?? "",
    pageName: "",
    fileKey: "",
    element: entry.element ?? "div",
    props: props.sort(order),
    pseudoStates,
    variantCount: 0,
    source: "baseline",
    tier: entry.tier,
    category: entry.category,
    a11y: entry.a11y ?? "",
    composite: Boolean(entry.composite),
    parts: entry.parts ?? [],
    pattern: entry.pattern ?? null,
    sampleArgs: entry.sampleArgs ?? null,
    portal: Boolean(entry.portal),
  };
}

const RANK = { variant: 0, tone: 0, type: 0, size: 1, children: 9 };
function order(a, b) {
  const ra = RANK[a.codeName] ?? 5;
  const rb = RANK[b.codeName] ?? 5;
  return ra !== rb ? ra - rb : a.codeName < b.codeName ? -1 : 1;
}

/**
 * @param {object} raw     components.baseline.json
 * @param {string[]} tiers 포함할 tier ("core" / "standard" / "extended")
 * @returns {Array} spec 목록
 */
export function baselineSpecs(raw, tiers = ["core"]) {
  const want = new Set(tiers.length ? tiers : ["core"]);
  return (raw?.components ?? [])
    .filter((e) => want.has(e.tier))
    .map(toSpec)
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

/**
 * Figma 에서 읽은 것과 기준선을 합친다. **Figma 가 이긴다.**
 * 같은 이름이 양쪽에 있으면 Figma 쪽 명세를 쓰고, 기준선은 빈 칸만 채운다.
 */
export function mergeWithFigma(figmaSpecs, baseSpecs) {
  const byName = new Map(figmaSpecs.map((s) => [s.name.toLowerCase(), s]));
  const merged = figmaSpecs.map((s) => {
    const base = baseSpecs.find((b) => b.name.toLowerCase() === s.name.toLowerCase());
    if (!base) return s;
    return {
      ...s,
      element: s.element ?? base.element,
      a11y: base.a11y,
      category: base.category,
      tier: base.tier,
      description: s.description || base.description,
      composite: base.composite,
      parts: base.parts,
      pattern: base.pattern,
      sampleArgs: base.sampleArgs,
      portal: base.portal,
    };
  });
  const added = baseSpecs.filter((b) => !byName.has(b.name.toLowerCase()));
  return { specs: [...merged, ...added].sort((a, b) => (a.name < b.name ? -1 : 1)), fromBaseline: added.length };
}

export { TIERS };

/**
 * Figma Component Set → 코드 컴포넌트 명세.
 *
 * 여기서 나오는 variant 행렬은 **결정적**이다. LLM 이 낄 자리가 없고,
 * 그래서 story/argTypes/Code Connect 를 100% 자동 생성할 수 있다.
 * (LLM 은 설명 문장에만 쓴다 — `enrich` 단계)
 */

/** Figma 는 비-variant 속성 이름에 "#12:34" 를 붙인다. 떼어낸다. */
export function cleanPropName(name) {
  return String(name ?? "").replace(/#[\d:]+$/, "").trim();
}

export function pascal(name) {
  return String(name ?? "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("") || "Component";
}

export function camel(name) {
  const p = pascal(name);
  const c = p[0].toLowerCase() + p.slice(1);
  // prop 이름은 변수 이름이 된다. "2 Col" 처럼 숫자로 시작하면 앞에 붙여 식별자로 만든다.
  return /^\d/.test(c) ? `prop${c}` : c;
}

/** Figma variant 값 → 코드 값. "Primary"→"primary", "L"→"l", "Extra Large"→"extra-large" */
export function codeValue(v) {
  return String(v ?? "")
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Figma 속성 이름 → 코드 prop 이름. 관례를 흡수한다.
const PROP_ALIASES = {
  type: "variant", variant: "variant", style: "variant", kind: "variant", appearance: "variant",
  size: "size", scale: "size",
  label: "children", text: "children", content: "children",
};

/**
 * State/Status 는 코드에서 CSS 의사클래스(:hover/:active/:focus)가 처리한다.
 * prop 으로 노출하면 실제 상호작용과 어긋난다 — DSP `Button.figma.tsx` 의 판단을 따른다.
 * 단 disabled 만은 진짜 prop 이다.
 */
const PSEUDO_PROPS = new Set(["state", "status", "interaction"]);

export function extractComponents(model) {
  const sets = [...(model.componentSets ?? [])];
  // set 은 id / node_id 어느 쪽으로도 참조될 수 있다. 조회용 맵을 따로 둔다.
  const lookup = new Map();
  for (const s of sets) {
    if (s.nodeId) lookup.set(s.nodeId, s);
    if (s.id) lookup.set(s.id, s);
  }

  const variantsBySet = new Map();
  const standalone = [];
  for (const c of model.components ?? []) {
    const parent = c.componentSetId ? lookup.get(c.componentSetId) : null;
    if (parent) {
      const key = parent.nodeId || parent.id;
      if (!variantsBySet.has(key)) variantsBySet.set(key, []);
      variantsBySet.get(key).push(c);
    } else if (c.componentSetId) {
      // 부모 set 이 수집되지 않음 — 이름("Button/Type=Primary")에서 복원한다.
      let orphan = lookup.get(c.componentSetId);
      if (!orphan) {
        orphan = {
          id: c.componentSetId,
          nodeId: c.componentSetId,
          name: c.name.includes("/") ? c.name.split("/")[0] : c.name.split(",")[0].split("=")[0].trim(),
          description: "",
          propertyDefinitions: {},
          pageName: c.pageName,
        };
        lookup.set(c.componentSetId, orphan);
        sets.push(orphan);
      }
      const key = orphan.nodeId;
      if (!variantsBySet.has(key)) variantsBySet.set(key, []);
      variantsBySet.get(key).push(c);
    } else {
      standalone.push(c);
    }
  }

  const out = [];
  for (const set of sets) out.push(buildSpec(set, variantsBySet.get(set.nodeId || set.id) ?? [], model));
  for (const c of standalone) out.push(buildSpec(c, [], model));
  return out.filter((c) => c.name).sort((a, b) => (a.name < b.name ? -1 : 1));
}

function buildSpec(set, variants, model) {
  const defs = set.propertyDefinitions ?? {};
  const props = [];
  const pseudoStates = [];

  // 1) COMPONENT_SET 의 property definitions
  for (const [rawName, def] of Object.entries(defs)) {
    const figmaName = cleanPropName(rawName);
    const key = figmaName.toLowerCase();
    const codeName = PROP_ALIASES[key] ?? camel(figmaName);
    if (def?.type === "VARIANT") {
      const options = (def.variantOptions ?? []).map((v) => ({ figma: v, code: codeValue(v) }));
      if (PSEUDO_PROPS.has(key)) {
        pseudoStates.push(...options.map((o) => o.code));
        continue;
      }
      props.push({
        kind: "enum", figmaName, codeName, options,
        defaultValue: def.defaultValue != null ? codeValue(def.defaultValue) : options[0]?.code,
      });
    } else if (def?.type === "BOOLEAN") {
      props.push({ kind: "boolean", figmaName, codeName, defaultValue: Boolean(def.defaultValue) });
    } else if (def?.type === "TEXT") {
      props.push({ kind: "string", figmaName, codeName, defaultValue: String(def.defaultValue ?? "") });
    } else if (def?.type === "INSTANCE_SWAP") {
      props.push({ kind: "node", figmaName, codeName, defaultValue: null });
    }
  }

  // 2) definitions 가 비었으면 variant 자식들의 실제 조합에서 복원한다.
  if (!props.length && variants.length) {
    const seen = new Map();
    for (const v of variants) {
      for (const [k, val] of Object.entries(v.variantProperties ?? {})) {
        if (!seen.has(k)) seen.set(k, new Set());
        seen.get(k).add(val);
      }
    }
    for (const [figmaName, values] of seen) {
      const key = figmaName.toLowerCase();
      const options = [...values].map((v) => ({ figma: v, code: codeValue(v) }));
      if (PSEUDO_PROPS.has(key)) {
        pseudoStates.push(...options.map((o) => o.code));
        continue;
      }
      props.push({
        kind: "boolean" === inferBooleanish(options) ? "boolean" : "enum",
        figmaName,
        codeName: PROP_ALIASES[key] ?? camel(figmaName),
        options,
        defaultValue: options[0]?.code,
      });
    }
  }

  const name = String(set.name ?? "").split("/").pop().trim();
  return {
    name,
    pascal: pascal(name),
    nodeId: set.nodeId ?? "",
    key: set.key ?? "",
    description: set.description ?? "",
    pageName: set.pageName ?? "",
    fileKey: model.fileKey ?? "",
    props: props.sort(propOrder),
    pseudoStates: [...new Set(pseudoStates)].filter((s) => s && s !== "default"),
    variantCount: variants.length,
  };
}

function inferBooleanish(options) {
  const codes = options.map((o) => o.code).sort();
  return codes.length === 2 && codes.join(",") === "false,true" ? "boolean" : "enum";
}

// variant → size → 나머지 → children 순. 스토리 argTypes 가 읽기 좋게.
const RANK = { variant: 0, size: 1, children: 9 };
function propOrder(a, b) {
  const ra = RANK[a.codeName] ?? 5;
  const rb = RANK[b.codeName] ?? 5;
  if (ra !== rb) return ra - rb;
  return a.codeName < b.codeName ? -1 : 1;
}

/** Figma 노드 URL. Code Connect 와 addon-designs 가 같은 주소를 쓴다. */
export function figmaUrl(spec) {
  if (!spec.fileKey || !spec.nodeId) return "";
  return `https://www.figma.com/design/${spec.fileKey}/?node-id=${String(spec.nodeId).replace(":", "-")}`;
}

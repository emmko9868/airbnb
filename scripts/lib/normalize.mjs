/**
 * `.ds/source.json` → 정규화 모델.
 *
 * 카테고리 추론은 DSP 의 Figma 수집 코드(`inferCategory`)와 같은 규칙이다.
 */

/** 임의 문자열 → kebab-case 토큰 이름. DSP `_kebab` 이식. */
export function kebab(text) {
  let s = String(text ?? "").trim();
  s = s.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "-").toLowerCase();
  s = s.replace(/[\s_/]+/g, "-").replace(/[^a-z0-9-]/g, "");
  return s.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/** "group/sub/name" → "group-sub-name". DSP `_name_from_path` 이식. */
export function nameFromPath(path) {
  return String(path ?? "")
    .split(/[/.]/)
    .map((p) => kebab(p))
    .filter(Boolean)
    .join("-");
}

export function inferCategory(type, namePath) {
  const path = String(namePath ?? "").toLowerCase();
  if (type === "COLOR") return "COLOR";
  if (type === "FLOAT") {
    if (/font.*size|text.*size/.test(path)) return "FONT_SIZE";
    if (/font.*weight/.test(path)) return "FONT_WEIGHT";
    if (/line.*height/.test(path)) return "LINE_HEIGHT";
    if (/letter.*spacing/.test(path)) return "LETTER_SPACING";
    if (/border.*width|stroke.*width/.test(path)) return "BORDER_WIDTH";
    if (/opacity/.test(path)) return "OPACITY";
    if (/z[-_/ ]?index/.test(path)) return "Z_INDEX";
    if (/duration/.test(path)) return "DURATION";
    if (/breakpoint/.test(path)) return "BREAKPOINT";
    if (/spacing|space|gap|padding/.test(path)) return "SPACING_UNIT";
    return "RADIUS";
  }
  if (type === "STRING") {
    if (/font.*family/.test(path)) return "FONT_FAMILY";
    if (/shadow|elevation/.test(path)) return "SHADOW";
    if (/easing|ease/.test(path)) return "EASING";
  }
  return "";
}

const EMPTY = {
  fileKey: "",
  fileName: "",
  variables: [],
  paintStyles: [],
  components: [],
  componentSets: [],
  warnings: [],
};

export function normalize(source) {
  if (!source || typeof source !== "object") return { ...EMPTY };
  const data = source.data ?? source;
  const variables = [];

  for (const collection of data.variables?.collections ?? []) {
    const modes = collection.modes ?? [];
    for (const v of collection.variables ?? []) {
      const path = `${collection.name}/${v.name}`;
      const raw = v.value;
      const isAlias = raw && typeof raw === "object" && raw.aliasOf;
      variables.push({
        id: v.id ?? "",
        collection: collection.name ?? "",
        path,
        name: nameFromPath(v.name),
        rawName: v.name ?? "",
        type: v.type ?? "",
        category: v.category || inferCategory(v.type, path),
        declaredTier: v.tier ?? null, // source.json 에 이미 들어 있던 추측 값 — 참고만 한다
        value: isAlias ? null : raw,
        aliasOf: isAlias ? nameFromPath(stripCollection(raw.aliasOf, data)) : null,
        description: v.description ?? "",
        modeCount: modes.length,
      });
    }
  }

  const paintStyles = (data.styles?.paint ?? [])
    .map((s) => ({ name: nameFromPath(s.name), value: s.value ?? s.hex ?? null, description: s.description ?? "" }))
    .filter((s) => s.value);

  const componentSets = [];
  const components = [];
  for (const c of data.components ?? []) {
    const entry = {
      id: c.id ?? c.node_id ?? "",
      name: c.name ?? "",
      key: c.key ?? "",
      nodeId: c.node_id ?? c.id ?? "",
      description: c.description ?? "",
      pageName: c.page_name ?? "",
      componentSetId: c.component_set_id ?? "",
      variantProperties: c.variant_properties ?? {},
      propertyDefinitions: c.property_definitions ?? {},
      type: c.type ?? "COMPONENT",
    };
    (entry.type === "COMPONENT_SET" ? componentSets : components).push(entry);
  }

  return {
    fileKey: source.file_key ?? "",
    fileName: source.file_name ?? "",
    variables,
    paintStyles,
    components,
    componentSets,
    warnings: data.warnings ?? [],
  };
}

/**
 * aliasOf 경로에서 선행 컬렉션 세그먼트를 벗긴다.
 * Figma 변수 이름("brand/500")에는 컬렉션이 없지만 alias 참조("Core/brand/500")에는
 * 붙어 온다. DSP 와 같은 처리.
 */
function stripCollection(refPath, data) {
  const names = new Set((data.variables?.collections ?? []).map((c) => kebab(c.name)));
  const parts = String(refPath ?? "").split(/[/.]/).filter(Boolean);
  if (parts.length > 1 && names.has(kebab(parts[0]))) parts.shift();
  return parts.join("/");
}

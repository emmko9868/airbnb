/** 학생 Figma를 가져온 뒤에는 색을 전면 교체한다. 비색상 layout만 병합한다. */
import { exactCssColor } from "./color.mjs";
import { isTypographyDefinition, typographyReview } from "./figma-typography.mjs";
import { isFigmaEffect, convertFigmaEffect } from "./figma-effects.mjs";
import { isEmptyFigmaValue } from "./figma-gradients.mjs";

export function mergeFigmaVariables(source, figma) {
  if (figma == null) return { source, summary: null };
  if (!Array.isArray(figma.collections)) throw new Error("The Figma import has no collections. Import it again.");
  const base = structuredClone(source ?? { data: { variables: { collections: [] } } });
  base.file_key = figma.file_key ?? "";
  base.file_name = figma.file_name ?? "학생 Figma";
  base.data ??= {};
  base.data.variables ??= {};
  base.data.variables.collections ??= [];
  const cols = base.data.variables.collections;
  const before = cols.flatMap((c) => c.variables ?? []).filter((v) => v.type === "COLOR");
  for (const c of cols) c.variables = (c.variables ?? []).filter((v) => v.type !== "COLOR" && v.category !== "SHADOW" && !/shadow|elevation/i.test(v.name));
  base.data.styles = { ...base.data.styles, paint: [], effect: [] };
  const colors = figma.collections.flatMap((c) => (c.variables ?? []).filter((v) => v.type === "COLOR"));
  const effects = { converted: [], review: [...(figma.effects?.review ?? [])] };
  const other = figma.collections.flatMap((c) => (c.variables ?? []).filter((v) => v.type !== "COLOR")).flatMap((v) => {
    if (!isFigmaEffect(v.value)) return [v];
    const result = convertFigmaEffect(v.value);
    if (!result.value) { effects.review.push({ name: v.name, raw: v.value, reason: result.reason }); return []; }
    effects.converted.push({ name: v.name, raw: v.value, value: result.value });
    return [{ ...v, category: "SHADOW", value: result.value }];
  });
  for (const c of figma.collections) {
    const variables = (c.variables ?? []).filter((v) => v.type === "COLOR");
    if (variables.length) cols.push({ ...c, variables: structuredClone(variables) });
  }
  const layout = cols.find((c) => /^layout$/i.test(c.name)) ?? { name: "Layout", variables: [] };
  if (!cols.includes(layout)) cols.push(layout);
  const overridden = [];
  for (const v of other) {
    const current = cols.flatMap((c) => c.variables ?? []).find((x) => x.type !== "COLOR" && x.name === v.name);
    if (current) { Object.assign(current, v); overridden.push(v.name); }
    else layout.variables.push(structuredClone(v));
  }
  return { source: base, summary: {
    mode: "replace", figmaColors: colors.length, figmaOther: other.length,
    figmaFamilies: [...new Set(colors.map((v) => String(v.name).split("/")[0]))],
    overriddenColors: colors.filter((v) => before.some((b) => b.name === v.name && b.value !== v.value)).map((v) => v.name),
    addedColors: colors.filter((v) => !before.some((b) => b.name === v.name)).map((v) => v.name),
    removedColors: before.filter((v) => !colors.some((c) => c.name === v.name)).map((v) => v.name),
    overriddenOurs: overridden, effects,
  } };
}

/** Figma 변수 이름 정리: "gray/gray-400 (#444444)" · "Gray/ 400" → "gray/400", "White (#FFFFFF)" → "white". */
export function cleanVariableName(raw) {
  const noHex = String(raw).replace(/\s*\(#[0-9a-fA-F]+\)\s*$/, "").trim();
  const parts = noHex.split("/").map((p) => p.trim().toLowerCase().replace(/\s+/g, "-")).filter(Boolean);
  if (parts.length >= 2) {
    const fam = parts[0];
    // "gray/gray-400" 처럼 계열 이름이 단계 앞에 반복되면 뺀다
    parts[parts.length - 1] = parts[parts.length - 1].replace(new RegExp(`^${fam}-`), "");
  }
  return parts.join("/");
}

/** get_variable_defs → 색·레이아웃 collections와 자동 적용하지 않는 글자 검토 자료. */
export function variableDefsToCollections(defs) {
  const colors = new Map();
  const layout = new Map();
  const conflicts = [];
  const typography = [];
  const effects = { converted: [], review: [] };
  // Figma 가 값을 비워 보낸 스타일(그라데이션 "" · "," 등). 토큰을 만들지 않고 이름만 보고한다(Q-70 결정 8①).
  const missing = [];
  const put = (map, name, v) => {
    const prev = map.get(name);
    if (prev && JSON.stringify(prev.value) !== JSON.stringify(v.value)) conflicts.push(`${name}: ${prev.value} ≠ ${v.value}`);
    if (!prev) map.set(name, v);
  };
  for (const [rawName, raw] of Object.entries(defs ?? {})) {
    if (raw && typeof raw === "object" && Array.isArray(raw.$typographyVariants)) {
      if (!raw.$typographyVariants.length || !raw.$typographyVariants.every((v) => isTypographyDefinition(rawName, v))) throw new Error(`BLOCKED_INPUT: Broken text style data: ${rawName}`);
      for (const variant of raw.$typographyVariants) typography.push({ name: rawName, raw: variant });
      continue;
    }
    const typed = raw && typeof raw === "object" && raw.type === "COLOR" ? raw : null;
    const value = typed ? typed.value : raw;
    if (!typed && isTypographyDefinition(rawName, value)) { typography.push({ name: rawName, raw: value }); continue; }
    // "400" 같은 글자 굵기/숫자를 #440000으로 읽지 않는다. 명시한 COLOR 타입은 예외다.
    const color = !typed && typeof value === "string" && /^\d+(?:\.\d+)?$/.test(value) ? null : exactCssColor(value);
    if (color || (typed && value?.aliasOf)) {
      const name = cleanVariableName(rawName);
      put(colors, `${typed?.collection ?? "Figma Colors"}/${name}`, { id: `figma-${name}`, name, type: "COLOR", value: color ?? value, figmaName: rawName, ...(typed?.collection ? { collection: typed.collection } : {}) });
      continue;
    }
    if (typeof value !== "string") continue;
    if (isEmptyFigmaValue(value)) { missing.push(rawName); continue; }
    if (/shadow|elevation/i.test(rawName) || isFigmaEffect(value)) {
      const name = cleanVariableName(rawName);
      const result = isFigmaEffect(value) ? convertFigmaEffect(value) : { value };
      if (!result.value) { effects.review.push({ name, raw: value, reason: result.reason }); continue; }
      if (isFigmaEffect(value)) effects.converted.push({ name, raw: value, value: result.value });
      put(layout, name, { id: `figma-${name}`, name, type: "STRING", category: "SHADOW", value: result.value, figmaName: rawName });
      continue;
    }
    const num = Number(value);
    if (!Number.isNaN(num)) {
      const name = cleanVariableName(rawName);
      put(layout, name, { id: `figma-${name}`, name, type: "FLOAT", value: num, figmaName: rawName });
    }
  }
  return {
    collections: [
      ...[...new Set([...colors.values()].map((v) => v.collection ?? "Figma Colors"))].map((name) => ({ name, modes: [{ id: "f1", name: "Mode 1" }], variables: [...colors.values()].filter((v) => (v.collection ?? "Figma Colors") === name) })),
      { name: "Figma Layout", modes: [{ id: "f2", name: "Mode 1" }], variables: [...layout.values()] },
    ].filter((c) => c.variables.length),
    conflicts, typography: typographyReview(typography), effects, missing,
  };
}

/**
 * 부품 디자인에서 만든 그라데이션 토큰(.ds/figma-variables.json 의 gradients)을 layout 변수로 붙인다(Q-70 결정 8②).
 * 값은 Figma 디자인 코드의 backgroundImage 그대로다. 같은 CSS 변수 이름은 하나만 둔다.
 */
export function withGradientVariables(collections, gradients) {
  const rows = (Array.isArray(gradients) ? gradients : []).filter((row) => row && typeof row.name === "string" && typeof row.value === "string");
  if (!rows.length) return collections;
  const next = structuredClone(collections ?? []);
  let layout = next.find((collection) => collection.name === "Figma Layout");
  if (!layout) next.push(layout = { name: "Figma Layout", modes: [{ id: "f2", name: "Mode 1" }], variables: [] });
  const seen = new Set();
  layout.variables = layout.variables.filter((v) => v.category !== "GRADIENT");
  for (const row of rows) {
    if (seen.has(row.name)) continue;
    seen.add(row.name);
    layout.variables.push({ id: `figma-gradient-${row.name}`, name: row.name, type: "STRING", category: "GRADIENT", value: row.value, figmaName: `Gradient fill of ${row.partName ?? row.part}` });
  }
  return next;
}

/** 여러 노드에서 이름이 같은 변수의 다른 값을 조용히 덮어쓰지 않는다. */
export function combineVariableDefs(previous, incoming) {
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) throw new Error("The Figma variable response is not an object.");
  const merged = { ...previous };
  for (const [name, value] of Object.entries(incoming)) {
    if (Object.hasOwn(previous, name) && JSON.stringify(previous[name]) !== JSON.stringify(value)) {
      const old = previous[name]?.$typographyVariants ?? [previous[name]];
      const next = value?.$typographyVariants ?? [value];
      if ([...old, ...next].every((v) => isTypographyDefinition(name, v))) {
        merged[name] = { $typographyVariants: [...new Map([...old, ...next].map((v) => [JSON.stringify(v), v])).values()] };
        continue;
      }
      throw new Error(`BLOCKED_INPUT: Variable value conflict between Figma nodes: ${name}`);
    }
    merged[name] = value;
  }
  return merged;
}

/**
 * 이미 가져온 학생 변수(raw)에 새로 읽은 변수를 이름 기준으로 합친다(Q-65).
 * 새 이름 = 추가, 같은 이름 다른 값 = Figma 가 주인이라 값 갱신, 이번에 안 보인 이름 = 유지.
 * 이름은 cleanVariableName 으로 맞춘다 — "Gray/400 (#444444)" 처럼 값이 이름 꼬리에 붙어도 같은 변수로 본다.
 */
export function mergeImportedDefs(previous, incoming) {
  const merged = { ...(previous ?? {}) };
  const byName = new Map();
  for (const key of Object.keys(merged)) {
    const name = cleanVariableName(key);
    byName.set(name, [...(byName.get(name) ?? []), key]);
  }
  const added = [], changed = [], same = [];
  const seen = new Set();
  for (const [key, value] of Object.entries(incoming ?? {})) {
    const name = cleanVariableName(key);
    seen.add(name);
    const oldKeys = byName.get(name) ?? [];
    if (!oldKeys.length) added.push(key);
    else {
      const before = merged[oldKeys[0]];
      if (oldKeys.length === 1 && oldKeys[0] === key && JSON.stringify(before) === JSON.stringify(value)) { same.push(key); continue; }
      if (JSON.stringify(before) === JSON.stringify(value)) same.push(key);
      else changed.push({ name: key, from: before, to: value });
      for (const old of oldKeys) delete merged[old];
    }
    merged[key] = value;
    byName.set(name, [key]);
  }
  const kept = [...byName.keys()].filter((name) => !seen.has(name)).length;
  return { defs: merged, added, changed, same, kept };
}

/** Changed 줄에 쓰는 짧은 값. */
export function shortDefValue(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 60 ? `${text.slice(0, 57)}…` : text;
}

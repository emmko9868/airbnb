/**
 * 소유권 표(ds.config.json 의 `ownership`)를 **실행한다.**
 *
 *   figma  Figma 가 이기고 코드를 덮어쓴다
 *   code   코드가 이기고 Figma 변경은 제안(G16)으로만 올라온다
 *   human  비어 있을 때만 채우고, 사람이 정한 것은 절대 덮어쓰지 않는다
 *
 * "코드 쪽의 현재 상태"는 필드마다 다르다 — 토큰은 직전 lock(마지막으로 받아들인 상태),
 * semantic 매핑은 사람이 쓰는 `.ds/semantic.json`, 컴포넌트 API·variant 는 구현 파일이다.
 * 이긴 쪽과 다른 Figma 변경은 버리지 않고 `proposals` 로 모아 G16 경고로 보인다
 * ("버리지 않고 격리"). 받아들이려면 `--accept` 로 한 번 돌리거나 소유자를 figma 로 바꾼다.
 *
 * 순수 모듈이다 — 파일을 읽고 쓰는 것은 ds.mjs 가 한다.
 */
import { cssVarFor } from "./css.mjs";
import { toCssColor } from "./color.mjs";

export const OWNERS = ["figma", "code", "human"];

export const OWNERSHIP_DEFAULTS = {
  tokenValue: "figma",
  tokenName: "figma",
  semanticMapping: "human",
  componentApi: "code",
  variantMatrix: "figma",
  description: "human",
  usageGuide: "human",
};

/** 필드마다 소유권이 실제로 적용되는 곳. 문서·AI 규칙이 이 표를 그대로 보여 준다. */
export const APPLIED_AT = {
  tokenValue: "tokens — 직전 lock 의 원시값(primitive·layout)과 비교",
  tokenName: "tokens — Figma 변수 id 로 이름 변경을 추적",
  semanticMapping: "tokens — .ds/semantic.json (사람이 쓰는 역할 → primitive)",
  componentApi: "gen — 구현 파일의 Props 인터페이스",
  variantMatrix: "gen — 구현 파일의 variant 타입",
  description: "gen·enrich — .ds/descriptions.json 의 human 항목",
  // 사용 가이드를 만드는 생성기가 없다. 덮어쓸 경로가 없으니 지킬 것도 없다 — 그렇게 적어 둔다.
  usageGuide: null,
};

/** APPLIED_AT 의 영어판 — Storybook 문서를 EN 으로 볼 때. */
export const APPLIED_AT_EN = {
  tokenValue: "tokens — compared with raw values (primitive, layout) in the previous lock",
  tokenName: "tokens — renames tracked by Figma variable id",
  semanticMapping: "tokens — .ds/semantic.json (role → primitive, written by people)",
  componentApi: "gen — the Props interface in the implementation file",
  variantMatrix: "gen — the variant types in the implementation file",
  description: "gen·enrich — human entries in .ds/descriptions.json",
  usageGuide: null,
};

export function ownerOf(config, key) {
  return config?.ownership?.[key] ?? OWNERSHIP_DEFAULTS[key];
}

/** 설정 오타는 조용히 기본값으로 떨어지면 안 된다 — G15 가 오류로 보인다. */
export function validateOwnership(config) {
  const issues = [];
  for (const [key, owner] of Object.entries(config?.ownership ?? {})) {
    if (!(key in OWNERSHIP_DEFAULTS)) {
      issues.push({ target: `ownership.${key}`, detail: `알 수 없는 필드다. ${Object.keys(OWNERSHIP_DEFAULTS).join(" / ")} 중 하나여야 한다.` });
    } else if (!OWNERS.includes(owner)) {
      issues.push({ target: `ownership.${key}`, detail: `"${owner}" 는 소유자가 아니다. figma / code / human 중 하나여야 한다.` });
    }
  }
  return issues;
}

const isAlias = (value) => /^var\(/.test(String(value ?? ""));
const keyOf = (t) => `${t.category}:${t.name}`;

// ── 토큰 값·이름 ────────────────────────────────────────────────────

/**
 * tokenName·tokenValue 를 적용한다.
 *
 * 직전 lock 이 없으면(첫 실행) 그것이 기준선이 되므로 아무것도 하지 않는다.
 * tokenValue 는 **원시값 토큰**(primitive·layout)에만 적용한다. alias 연결(semantic → primitive)은
 * semanticMapping 이 따로 다룬다 — 한 필드를 두 규칙이 다투지 않게.
 *
 * @param {Array} tokens    resolveLadder 결과 (figmaId 를 달고 있다)
 * @param {object|null} previous  직전 lock
 * @returns {{ tokens: Array, proposals: Array }}
 */
export function applyTokenOwnership(tokens, previous, config, { accept = false } = {}) {
  const proposals = [];
  if (!previous?.tokens || accept) return { tokens, proposals };
  let out = tokens.map((t) => ({ ...t }));

  // 1) 이름 — 같은 Figma 변수(id)가 다른 이름으로 오면 옛 이름을 지킨다.
  const nameOwner = ownerOf(config, "tokenName");
  if (nameOwner !== "figma") {
    const prevById = new Map();
    for (const [key, row] of Object.entries(previous.tokens)) if (row.id) prevById.set(row.id, key);
    const renames = new Map(); // 새 변수 → 옛 변수
    const names = new Map(); // "COLOR:새이름" → 옛 이름
    for (const t of out) {
      const prevKey = t.figmaId ? prevById.get(t.figmaId) : null;
      if (!prevKey) continue;
      const cut = prevKey.indexOf(":");
      const category = prevKey.slice(0, cut);
      const oldName = prevKey.slice(cut + 1);
      if (category !== t.category || oldName === t.name) continue;
      proposals.push({
        target: prevKey,
        detail: `Figma 에서 이름이 "${t.name}" 로 바뀌었다 — tokenName=${nameOwner} 라 "${oldName}" 을 유지한다.`,
      });
      renames.set(cssVarFor(t.category, t.name), cssVarFor(t.category, oldName));
      names.set(`${t.category}:${t.name}`, oldName);
      t.name = oldName;
    }
    // 이름을 되돌렸으면 그 이름을 가리키던 참조도 되돌린다. 안 그러면 G5 가 깨진다.
    if (renames.size) {
      for (const t of out) {
        t.value = String(t.value).replace(/var\((--[a-z0-9-]+)/gi, (m, v) => (renames.has(v) ? `var(${renames.get(v)}` : m));
        if (t.ref && names.has(`${t.category}:${t.ref}`)) t.ref = names.get(`${t.category}:${t.ref}`);
      }
    }
  }

  // 2) 값 — 원시값 토큰만. 바뀐 값·새 토큰·사라진 토큰을 소유자에 따라 다룬다.
  const valueOwner = ownerOf(config, "tokenValue");
  if (valueOwner !== "figma") {
    const drop = new Set();
    for (const t of out) {
      if (isAlias(t.value)) continue;
      const prev = previous.tokens[keyOf(t)];
      if (!prev) {
        // code: Figma 가 새로 만든 것도 제안일 뿐이다. human: 비어 있으니 채운다.
        if (valueOwner === "code") {
          drop.add(t);
          proposals.push({ target: keyOf(t), detail: `Figma 에 새로 생겼다(${t.value}) — tokenValue=code 라 추가하지 않는다.` });
        }
        continue;
      }
      if (isAlias(prev.value) || String(prev.value) === String(t.value)) continue;
      proposals.push({ target: keyOf(t), detail: `Figma 값 ${t.value} — tokenValue=${valueOwner} 라 ${prev.value} 을 유지한다.` });
      t.value = prev.value;
      if (t.category === "COLOR") t.hex = toCssColor(prev.value);
      t.reason = `${t.reason ?? ""} (tokenValue=${valueOwner}: 유지 중인 값)`.trim();
    }
    out = out.filter((t) => !drop.has(t));

    // Figma 에서 사라진 원시값 토큰은 지킨다 — 코드가 아직 쓰고 있을 수 있다.
    const have = new Set(out.map(keyOf));
    for (const [key, row] of Object.entries(previous.tokens)) {
      if (have.has(key) || isAlias(row.value)) continue;
      const cut = key.indexOf(":");
      const category = key.slice(0, cut);
      proposals.push({ target: key, detail: `Figma 에서 사라졌다 — tokenValue=${valueOwner} 라 유지한다.` });
      out.push({
        layer: row.layer, category, name: key.slice(cut + 1), value: row.value,
        hex: category === "COLOR" ? toCssColor(row.value) : null, ref: null,
        source: row.source, confidence: row.confidence, figmaId: row.id,
        reason: `Figma 에서 사라졌지만 tokenValue=${valueOwner} 라 유지`,
      });
    }
  }
  return { tokens: out, proposals };
}

// ── semantic 매핑 ──────────────────────────────────────────────────

/**
 * `.ds/semantic.json` 의 사람 지정(역할 → primitive 이름)을 적용한다.
 *
 *   human·code  지정이 Figma 선언과 추론보다 이긴다
 *   figma       Figma 가 선언한 역할은 Figma 가 이기고, 지정은 선언이 없는 역할만 채운다
 *
 * 파이프라인은 이 파일을 절대 쓰지 않는다 — 추론을 거기에 적는 순간 다음 실행에서
 * 그 추측을 "사람이 정한 것"으로 오인한다.
 *
 * @returns {{ tokens: Array, proposals: Array, issues: Array }}
 */
export function applySemanticOverrides(tokens, overrides, config) {
  const proposals = [];
  const issues = [];
  const entries = Object.entries(overrides ?? {}).filter(([k]) => !k.startsWith("$"));
  if (!entries.length) return { tokens, proposals, issues };

  const owner = ownerOf(config, "semanticMapping");
  const primitives = new Set(tokens.filter((t) => t.layer === "primitive" && t.category === "COLOR").map((t) => t.name));
  const out = [...tokens];
  for (const [role, raw] of entries) {
    // "blue-600" / "--color-blue-600" / "var(--color-blue-600)" 모두 받는다.
    const ref = String(raw).trim().replace(/^var\(/, "").replace(/\)$/, "").replace(/^--color-/, "");
    if (!primitives.has(ref)) {
      issues.push({ target: `.ds/semantic.json · ${role}`, detail: `"${ref}" 는 primitive 에 없다. 있는 이름: ${[...primitives].slice(0, 6).join(", ")}…` });
      continue;
    }
    const value = `var(--color-${ref})`;
    const i = out.findIndex((t) => t.layer === "semantic" && t.category === "COLOR" && t.name === role);
    const cur = i >= 0 ? out[i] : null;
    if (cur?.value === value) {
      out[i] = { ...cur, source: "human", confidence: 1, reason: ".ds/semantic.json 에서 사람이 지정(Figma·추론과 같음)" };
      continue;
    }
    if (cur?.source === "declared" && owner === "figma") {
      proposals.push({ target: role, detail: `사람 지정 ${ref} — semanticMapping=figma 라 Figma 선언 ${cur.value} 를 쓴다.` });
      continue;
    }
    if (cur?.source === "declared") {
      proposals.push({ target: role, detail: `Figma 선언 ${cur.value} — semanticMapping=${owner} 라 사람이 지정한 ${ref} 를 쓴다.` });
    }
    const token = {
      layer: "semantic", category: "COLOR", name: role, value, hex: null, ref,
      source: "human", confidence: 1,
      reason: `.ds/semantic.json 에서 사람이 지정${cur ? ` (${cur.source} ${cur.value} 대신)` : ""}`,
    };
    if (i >= 0) out[i] = token;
    else out.push(token);
  }
  return { tokens: out, proposals, issues };
}

// ── 컴포넌트 API·variant 행렬 ───────────────────────────────────────

/** 구현 파일에서 Props 인터페이스가 선언한 이름과 variant 문자열 타입을 읽는다. */
export function readImplementation(text, pascal) {
  const iface = String(text ?? "").match(new RegExp(`export interface ${pascal}Props\\b[^{]*\\{([\\s\\S]*?)\\n\\}`));
  const props = new Set();
  if (iface) for (const m of iface[1].matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:/gm)) props.add(m[1]);
  const unions = {};
  const re = new RegExp(`export type ${pascal}(\\w+)\\s*=\\s*((?:\\s*\\|?\\s*"[^"]*")+)\\s*;`, "g");
  for (const m of String(text ?? "").matchAll(re)) unions[m[1]] = [...m[2].matchAll(/"([^"]*)"/g)].map((x) => x[1]);
  return { found: Boolean(iface), props, unions };
}

const pascalOf = (s) => String(s).split(/[^A-Za-z0-9]+/).filter(Boolean).map((p) => p[0].toUpperCase() + p.slice(1)).join("");

/**
 * componentApi·variantMatrix 를 적용한다. **Figma 에서 온 컴포넌트에만** — 기준선 컴포넌트는
 * Figma 쪽이 없으니 다툴 것이 없다. 아직 골격(TODO(ds))이면 코드 API 가 없으므로 건너뛴다.
 *
 * @param {object} spec  story·Code Connect 에 쓸 명세 (props 는 이미 ownProps)
 * @returns {{ spec: object, proposals: Array }}
 */
export function applyComponentOwnership(spec, implText, config) {
  const proposals = [];
  if (!spec.nodeId || !implText || implText.includes("TODO(ds)")) return { spec, proposals };
  const impl = readImplementation(implText, spec.pascal);
  if (!impl.found) return { spec, proposals };

  const apiOwner = ownerOf(config, "componentApi");
  const matrixOwner = ownerOf(config, "variantMatrix");
  let props = spec.props;

  // API — 코드가 선언하지 않은 Figma 속성
  const undeclared = props.filter((p) => p.codeName !== "children" && !impl.props.has(p.codeName));
  for (const p of undeclared) {
    proposals.push({
      target: `${spec.name}.${p.codeName}`,
      detail: apiOwner === "figma"
        ? `Figma 속성 "${p.figmaName}" 가 구현에 없다 — componentApi=figma 라 구현에 추가해야 한다.`
        : `Figma 속성 "${p.figmaName}" 가 구현에 없다 — componentApi=${apiOwner} 라 story·Code Connect 에서 뺀다.`,
    });
  }
  if (apiOwner !== "figma") props = props.filter((p) => !undeclared.includes(p));

  // variant 행렬 — enum 값 목록
  props = props.map((p) => {
    if (p.kind !== "enum") return p;
    const union = impl.unions[pascalOf(p.codeName)];
    if (!union) return p;
    const figma = p.options.map((o) => o.code);
    const onlyFigma = figma.filter((c) => !union.includes(c));
    const onlyCode = union.filter((c) => !figma.includes(c));
    if (!onlyFigma.length && !onlyCode.length) return p;
    if (matrixOwner === "figma") {
      proposals.push({
        target: `${spec.name}.${p.codeName}`,
        detail: `구현 타입과 Figma variant 가 다르다(Figma 에만: ${onlyFigma.join(", ") || "-"} / 코드에만: ${onlyCode.join(", ") || "-"}) — variantMatrix=figma 라 구현을 Figma 에 맞춰야 한다.`,
      });
      return p;
    }
    proposals.push({
      target: `${spec.name}.${p.codeName}`,
      detail: `Figma 에만 있는 값 ${onlyFigma.join(", ") || "-"} — variantMatrix=${matrixOwner} 라 구현 타입(${union.join(" | ")})을 쓴다.`,
    });
    const options = union.map((code) => p.options.find((o) => o.code === code) ?? { figma: code, code });
    return { ...p, options, defaultValue: union.includes(p.defaultValue) ? p.defaultValue : union[0] };
  });

  return { spec: { ...spec, props }, proposals };
}

// ── 설명 ───────────────────────────────────────────────────────────

/** 설명 소유권: human·code 면 사람이 쓴 설명이 Figma 설명보다 이긴다. */
export function descriptionProposal(spec, descriptions, config) {
  const owner = ownerOf(config, "description");
  const d = descriptions?.[spec.name];
  if (owner === "figma" || d?.source !== "human" || !spec.description || spec.description === d.description) return null;
  return { target: `${spec.name} 설명`, detail: `Figma 설명이 다르다("${spec.description.slice(0, 40)}") — description=${owner} 라 사람이 쓴 설명을 쓴다.` };
}

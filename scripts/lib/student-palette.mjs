/** 학생 색: 역할을 추론하지 않고 Figma 선언과 승인된 매핑만 사용한다. */
import { createHash } from 'node:crypto';
import { normalize, nameFromPath } from './normalize.mjs';
import { defaultLayoutTokens, summarizeReport } from './ladder.mjs';
import { cssVarFor, stripCategoryPrefix } from './css.mjs';
import { exactCssColor } from './color.mjs';
import { SEMANTIC_ROLES } from './roles.mjs';

export function stableJson(value) {
  if (Array.isArray(value)) return '[' + value.map(stableJson).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + stableJson(value[key])).join(',') + '}';
  return JSON.stringify(value);
}
export const digest = (value) => createHash('sha256').update(typeof value === 'string' ? value : stableJson(value)).digest('hex');
const paletteColors = (figma) => (figma.collections ?? []).flatMap((c) => (c.variables ?? []).filter((v) => v.type === 'COLOR').map((v) => ({ collection: c.name, ...v }))).sort((a, b) => stableJson(a).localeCompare(stableJson(b)));
/**
 * 색 승인의 기준 해시: Figma 파일과 색 변수(이름·값·컬렉션)만 본다(Q-69 A).
 * 읽은 노드 목록(nodes)은 넣지 않는다 — 색이 그대로인데 다른 노드를 읽었다고 승인이 무효가 되면 안 된다.
 */
export function paletteHash(figma) {
  return digest({ file_key: figma.file_key ?? '', colors: paletteColors(figma) });
}
/** Q-69 이전 방식(nodes 포함). 이미 승인된 기록을 읽을 때만 쓴다. 새 승인은 paletteHash 로 쓴다. */
export function legacyPaletteHash(figma) {
  return digest({ file_key: figma.file_key ?? '', nodes: [...(figma.nodes ?? [])].sort(), colors: paletteColors(figma) });
}
/** 저장된 해시가 지금 색과 같은 팔레트인가. 새 방식 또는 예전 방식 중 하나와 같으면 유효하다. */
export function paletteHashMatches(stored, figma) {
  return typeof stored === 'string' && (stored === paletteHash(figma) || stored === legacyPaletteHash(figma));
}
/**
 * 승인된 역할이 가리키는 색이 그대로인가(Q-70 결정 7). 새 색이 추가만 됐으면 승인은 유지된다 — 추가된 색은 역할 없는 primitive 다.
 * mappings: { 역할: primitive 이름 }, approvedColors: { primitive 이름: 승인 때 값 }, tokens: 지금 학생 토큰.
 * 매핑된 primitive 가 하나라도 없거나 값이 다르거나 승인 때 값을 모르면 false.
 */
export function approvedColorsKept(mappings, approvedColors, tokens) {
  const roles = Object.entries(mappings ?? {}).filter(([key]) => !key.startsWith('$'));
  if (!roles.length || !approvedColors || typeof approvedColors !== 'object') return false;
  const now = new Map((tokens ?? []).filter((t) => t.layer === 'primitive' && t.category === 'COLOR').map((t) => [t.name, String(t.hex ?? t.value).toLowerCase()]));
  return roles.every(([, primitive]) => typeof approvedColors[primitive] === 'string' && now.get(primitive) === String(exactCssColor(approvedColors[primitive]) ?? approvedColors[primitive]).toLowerCase());
}

const rawRole = (v) => stripCategoryPrefix(nameFromPath(v.rawName.replace(/^(semantic|role)[/.-]/i, '')), 'COLOR');
const componentName = (v) => stripCategoryPrefix(nameFromPath(v.rawName.replace(/^(component|components|comp)[/.-]/i, '')), 'COLOR');

/**
 * 계층 선언: 컬렉션 이름 · 이름 앞부분(semantic/ · component/) · ds.config.json 의 tiers.<계층>.match.
 * Figma Desktop MCP 는 컬렉션과 alias 를 주지 않고 "이름: 최종 값"만 준다. 그래서 MCP 로 가져온 색은
 * 이름으로만 계층을 선언할 수 있다. match 는 Figma 이름(rawName)에도 대어 본다 — 경로(path)에는
 * 가져올 때 붙인 컬렉션 이름("Figma Colors/…")이 앞에 붙어 ^semantic/ 같은 패턴이 맞지 않는다.
 * 선언이 없으면 primitive 다. 이름이 역할처럼 보여도 역할로 정하지 않는다(hint 로만 알린다).
 */
const TIER_DEFAULTS = {
  component: { collections: ['Component', 'Components'], prefix: /^(component|components|comp)[/.-]/i },
  semantic: { collections: ['Semantic', 'Theme', 'Role', 'Alias'], prefix: /^(semantic|role)[/.-]/i },
};
export function declaredTier(v, config = {}) {
  for (const tier of ['component', 'semantic']) {
    const rule = config.tiers?.[tier] ?? {};
    const collections = [...(rule.collections ?? []), ...TIER_DEFAULTS[tier].collections];
    if (collections.some((name) => name.toLowerCase() === String(v.collection).toLowerCase())) return { tier, how: { ko: `Figma 컬렉션 "${v.collection}"`, en: `Figma collection "${v.collection}"` } };
    if (TIER_DEFAULTS[tier].prefix.test(v.rawName)) { const head = v.rawName.split(/[/.-]/)[0]; return { tier, how: { ko: `이름이 "${head}/" 로 시작`, en: `name starts with "${head}/"` } }; }
    const pattern = (rule.match ?? []).find((p) => { const re = new RegExp(p, 'i'); return re.test(v.rawName) || re.test(v.path); });
    if (pattern) return { tier, how: { ko: `ds.config.json tiers.${tier}.match ${pattern}`, en: `ds.config.json tiers.${tier}.match ${pattern}` } };
  }
  return null;
}
const semanticVariable = (v, config) => declaredTier(v, config)?.tier === 'semantic';
const componentVariable = (v, config) => declaredTier(v, config)?.tier === 'component';

// 역할처럼 보이는 이름 그룹. 선언으로 쓰지 않고, 선언하는 방법을 알려 주는 데만 쓴다.
const ROLE_GROUPS = /^(bg|background|surface|text|fg|foreground|border|stroke|outline|divider|icon|status|state|feedback|brand|action|interactive|link|focus|overlay|primary|secondary|tertiary|accent|success|warning|danger|error|info|positive|negative|neutral)$/i;
export function semanticHint(v) {
  const parts = String(v.rawName).split('/').map((p) => p.trim()).filter(Boolean);
  const first = parts[0] === 'color' || parts[0] === 'colors' ? parts[1] : parts[0];
  const steps = parts.length - (parts[0] === 'color' || parts[0] === 'colors' ? 1 : 0);
  return steps >= 2 && ROLE_GROUPS.test(first ?? '') && !/^\d+$/.test(parts[parts.length - 1] ?? '');
}

export function resolveStudentPalette(source, figma, config = {}) {
  if (figma.conflicts?.length) throw new Error('BLOCKED_INPUT: Fix the variable name or value conflicts in your Figma file.');
  const model = normalize({ data: { variables: { collections: figma.collections } } });
  const colors = model.variables.filter((v) => v.category === 'COLOR');
  const byName = new Map();
  for (const v of colors) {
    if (!v.name || byName.has(v.name)) throw new Error(`BLOCKED_INPUT: Duplicate or unclear variable name in your Figma file: ${v.name}`);
    byName.set(v.name, v);
  }
  const rootOf = (v, seen = new Set()) => {
    if (!v || seen.has(v.name)) throw new Error('BLOCKED_INPUT: A color alias in your Figma file points to nothing or loops back on itself.');
    if (!v.aliasOf) {
      if (!exactCssColor(v.value)) throw new Error(`BLOCKED_INPUT: The kit cannot read this color from your Figma file: ${v.name}`);
      return v;
    }
    return rootOf(byName.get(v.aliasOf), new Set([...seen, v.name]));
  };
  const primitive = [];
  const semantic = [];
  const nameOf = new Map();
  const roles = new Set(colors.filter((v) => semanticVariable(v, config)).map(rawRole));
  const addPrimitive = (name, value, v) => {
    if (primitive.some((p) => p.name === name) || roles.has(name)) throw new Error(`BLOCKED_INPUT: Two colors from your Figma file get the same CSS token name: ${name}`);
    const token = { layer: 'primitive', category: 'COLOR', name, value, hex: value, ref: null, source: 'declared', confidence: 1, reason: '학생 Figma의 정확한 원시 색', figmaId: v.id };
    primitive.push(token);
    return token;
  };
  for (const v of colors.filter((v) => !declaredTier(v, config))) {
    const canonical = stripCategoryPrefix(v.name, 'COLOR');
    const name = SEMANTIC_ROLES.includes(canonical) || roles.has(canonical) ? `palette-${canonical}` : canonical;
    const token = addPrimitive(name, exactCssColor(rootOf(v).value), v);
    nameOf.set(v.name, token.name);
  }
  for (const v of colors.filter((v) => semanticVariable(v, config))) {
    const role = rawRole(v);
    if (!role || semantic.some((t) => t.name === role)) throw new Error(`BLOCKED_INPUT: Role declared twice: ${role}`);
    const root = rootOf(v);
    let target = nameOf.get(root.name);
    if (!target) {
      const value = exactCssColor(root.value);
      target = primitive.find((p) => p.hex === value)?.name ?? addPrimitive(`figma-${role}`, value, root).name;
    }
    semantic.push({ layer: 'semantic', category: 'COLOR', name: role, value: `var(--color-${target})`, hex: null, ref: target, source: 'declared', confidence: 1, reason: '학생 Figma의 semantic 선언', figmaId: v.id });
  }
  // component: 학생이 선언한 부품 전용 색. semantic 을 거쳐야 하므로(G1) Figma alias 나 같은 값의 semantic 에 연결한다.
  const component = [];
  const extraReview = [];
  const hexOf = (t) => primitive.find((p) => p.name === t.ref)?.hex ?? null;
  const rank = (name) => { const i = SEMANTIC_ROLES.indexOf(name); return i < 0 ? SEMANTIC_ROLES.length : i; };
  for (const v of colors.filter((v) => componentVariable(v, config))) {
    const name = componentName(v);
    if (!name || component.some((t) => t.name === name) || primitive.some((t) => t.name === name) || semantic.some((t) => t.name === name)) throw new Error(`BLOCKED_INPUT: Duplicate or clashing component token name: ${name}`);
    const value = exactCssColor(rootOf(v).value);
    const target = v.aliasOf ? byName.get(v.aliasOf) : null;
    let ref = target && semanticVariable(target, config) ? rawRole(target) : null;
    let how = ref ? `Figma alias → ${ref}` : '';
    if (!ref) {
      const same = semantic.filter((t) => hexOf(t) === value).sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
      ref = same[0]?.name ?? null;
      how = ref ? `같은 값의 semantic ${ref}` : '';
      if (same.length > 1) extraReview.push({ name, layer: 'component', confidence: 0.5, reason: `같은 색의 semantic 이 여러 개입니다(${same.map((t) => t.name).join(', ')}). ${ref} 에 연결했습니다. Figma alias 를 확인하세요.` });
    }
    if (!ref) {
      extraReview.push({ name, layer: 'component', confidence: 0, reason: `같은 색(${value})의 semantic 이 없어 component 토큰을 만들지 않았습니다. Figma 에서 이 색이 semantic 변수를 거치게 하세요.` });
      continue;
    }
    component.push({ layer: 'component', category: 'COLOR', name, value: `var(--color-${ref})`, hex: null, ref, source: 'declared', confidence: 1, reason: `학생 Figma의 component 선언 — ${how}`, figmaId: v.id });
  }
  // 가져온 Figma 색마다 어느 계층이 되었고 왜인지 남긴다. Foundation 의 Figma import 화면이 보여 준다.
  const figmaNameOf = new Map((figma.collections ?? []).flatMap((c) => (c.variables ?? []).map((x) => [nameFromPath(x.name), x.figmaName ?? x.name])));
  const figmaTable = colors.map((v) => {
    const declared = declaredTier(v, config);
    const tier = declared?.tier ?? 'primitive';
    const token = tier === 'semantic' ? rawRole(v) : tier === 'component' ? componentName(v) : nameOf.get(v.name) ?? null;
    return {
      figma: figmaNameOf.get(v.name) ?? v.rawName, tier, token,
      applied: tier !== 'component' || component.some((t) => t.name === token),
      how: declared?.how ?? { ko: '계층 선언 없음 → primitive', en: 'no tier declared → primitive' },
      hint: !declared && semanticHint(v) ? { ko: '역할(semantic) 이름처럼 보이지만 적용하지 않았습니다', en: 'looks like a semantic name — not applied' } : null,
    };
  });
  const layoutVars = normalize(source).variables.filter((v) => v.category && v.category !== 'COLOR');
  const layout = layoutVars.map((v) => {
    const target = layoutVars.find((x) => x.name === v.aliasOf);
    const name = stripCategoryPrefix(v.name, v.category);
    const unit = ['FONT_WEIGHT', 'OPACITY', 'LINE_HEIGHT', 'Z_INDEX'].includes(v.category) ? '' : v.category === 'DURATION' ? 'ms' : 'px';
    const value = v.aliasOf ? `var(${cssVarFor(target?.category ?? v.category, stripCategoryPrefix(v.aliasOf, target?.category ?? v.category))})` : typeof v.value === 'number' ? `${v.value}${unit}` : String(v.value);
    return { layer: 'layout', category: v.category, name, value, hex: null, ref: v.aliasOf, source: 'declared', confidence: 1, reason: '기존/가져온 비색상 layout 값' };
  });
  // 기본 layout 세트(가림막 --color-overlay·그림자 --shadow-sm/md/lg 포함)를 학생 팔레트에서도 보충한다(Q-69 B).
  // 스타터 부품(ComboBox·Loading·Notification·Tile 등)이 쓰므로 빼면 가드 G13 이 난다.
  // Figma 에 같은 CSS 변수가 이미 있으면(같은 이름의 그림자·overlay 색) Figma 쪽을 쓰고 보충하지 않는다.
  if (config.synthesize?.layout !== false) {
    const taken = new Set([...primitive, ...semantic, ...component, ...layout].map((t) => cssVarFor(t.category, t.name)));
    layout.push(...defaultLayoutTokens('기본 layout 보충').filter((t) => !taken.has(cssVarFor(t.category, t.name))));
  }
  const tokens = [...primitive, ...semantic, ...component, ...layout];
  const report = { level: semantic.length ? 'L3' : 'L2a', levelLabel: '학생 팔레트: 선언/승인 역할만 적용', notes: ['샘플 색을 제거했습니다. 누락 역할은 학생 승인이 필요합니다.'], review: [], figma: figmaTable, extraReview };
  summarizeReport(tokens, report, config);
  return { tokens, report };
}
export function missingStudentRoles(tokens) {
  const have = new Set(tokens.filter((t) => t.layer === 'semantic' && t.category === 'COLOR').map((t) => t.name));
  return SEMANTIC_ROLES.filter((role) => !have.has(role));
}

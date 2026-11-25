/** Markdown 토큰 제안의 해시 고정/승인 검증. 승인 상태는 이 모듈이 만들지 않는다. */
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { approvedColorsKept, digest, paletteHash, paletteHashMatches, resolveStudentPalette, missingStudentRoles } from './student-palette.mjs';
import { mergeFigmaVariables } from './figma-merge.mjs';
import { applySemanticOverrides } from './ownership.mjs';
import { textContrasts } from './token-contrast.mjs';
import { cssVarFor } from './css.mjs';
import { exactCssColor } from './color.mjs';
import { figmaSourceIdentity } from './component-plan.mjs';
const fields = ['kind', 'revision', 'status', 'source_url', 'palette_hash', 'content_hash', 'open_questions'];
const typographyFields = ['kind', 'revision', 'status', 'source_url', 'typography_hash', 'base_hash', 'content_hash', 'open_questions', 'font_check'];
export const DEFAULT_TOKEN_PLAN = 'docs/plans/tokens.md';
export function parseTokenPlan(text, kind = 'tokens') {
  const expected = kind === 'typography' ? typographyFields : fields;
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error('The token plan has no metadata block (the --- lines at the top). Start from the template.');
  const metadata = Object.create(null);
  for (const [index, line] of match[1].split(/\r?\n/).entries()) {
    const entry = line.match(/^([a-z_]+):\s*(.*?)\s*$/);
    if (!entry) throw new Error(`Line ${index + 2} of the plan metadata has the wrong format: ${JSON.stringify(line)}. Write it as "key: value".`);
    if (!expected.includes(entry[1])) throw new Error(`Unknown plan metadata key "${entry[1]}". Allowed keys for a ${kind} plan: ${expected.join(', ')}.`);
    if (Object.hasOwn(metadata, entry[1])) throw new Error(`Plan metadata key "${entry[1]}" appears more than once. Write each key only once.`);
    metadata[entry[1]] = entry[2];
  }
  if (expected.some((key) => !Object.hasOwn(metadata, key)) || metadata.kind !== kind || !/^[1-9]\d*$/.test(metadata.revision) || !/^\d+$/.test(metadata.open_questions)) throw new Error('Check kind, revision and open_questions in the plan metadata. Every key must be there.');
  return { metadata, body: match[2] };
}
export function tokenPlanSourceIdentity(url, figma) {
  const nodes = (figma.nodes ?? []).filter((node) => /^\d+[:-]\d+$/.test(node)).map((node) => node.replace('-', ':'));
  const example = `https://www.figma.com/design/${figma.file_key || 'FILE_KEY'}/?node-id=${(nodes[0] ?? '0:1').replace(':', '-')}`;
  const guide = `Put the link of the imported Figma node in source_url (example: ${example}).`;
  let identity;
  try { identity = figmaSourceIdentity(url); }
  catch { throw new Error(`source_url is not a valid Figma node link, or it has no node-id. ${guide}`); }
  if (figma.file_key && !identity.startsWith(figma.file_key + ':')) throw new Error(`The Figma file in source_url is not the imported Figma file "${figma.file_key}". ${guide}`);
  if (nodes.length && !nodes.includes(identity.slice(identity.indexOf(':') + 1))) throw new Error(`The Figma node in source_url is not one of the imported nodes (${nodes.join(', ')}). ${guide}`);
  return identity;
}
export const tokenPlanHash = (plan) => digest({ metadata: Object.fromEntries(Object.entries(plan.metadata).filter(([key]) => !['status', 'content_hash'].includes(key))), body: plan.body });
export const serializeTokenPlan = (plan) => `---\n${(plan.metadata.kind === 'typography' ? typographyFields : fields).map((key) => `${key}: ${plan.metadata[key]}`).join('\n')}\n---\n${plan.body}`;
export function assertStudentPlanApproved(plan) {
  if (plan.metadata.status !== 'approved' || plan.metadata.open_questions !== '0' || /\|\s*(?:open|미답변|미확정)\s*\|/i.test(plan.body)) throw new Error('Only a plan the student approved, with 0 open questions, can be applied.');
  if (!/^[a-f0-9]{64}$/.test(plan.metadata.content_hash) || plan.metadata.content_hash !== tokenPlanHash(plan)) throw new Error('The plan content hash does not match. Review it as a new revision.');
}
export function tokenPlanPath(root, filename = DEFAULT_TOKEN_PLAN) {
  const base = realpathSync(root);
  const path = resolve(base, filename);
  const rel = relative(base, path);
  if (isAbsolute(rel) || rel.startsWith('..') || !/^docs\/plans\/[^\0]+\.md$/.test(rel.split('\\').join('/'))) throw new Error('The plan must be a Markdown file in docs/plans/.');
  const real = realpathSync(path);
  const actual = relative(base, real);
  if (isAbsolute(actual) || actual.startsWith('..')) throw new Error('A plan outside the project cannot be used.');
  return real;
}
export function readStudentTokenContext(root) {
  const config = JSON.parse(readFileSync(resolve(root, 'ds.config.json'), 'utf8'));
  if ((config.ownership?.semanticMapping ?? 'human') !== 'human' || ['tokenValue', 'tokenName'].some((key) => config.ownership?.[key] && config.ownership[key] !== 'figma')) throw new Error('BLOCKED_POLICY: this needs semanticMapping=human and tokenValue/tokenName=figma.');
  const sourcePath = resolve(root, config.output.source);
  const figmaPath = resolve(sourcePath, '..', 'figma-variables.json');
  if (!existsSync(figmaPath)) throw new Error('Import your Figma first with pnpm ds:figma.');
  const figma = JSON.parse(readFileSync(figmaPath, 'utf8'));
  if (!figma || !Array.isArray(figma.collections)) throw new Error('BLOCKED_INPUT: your Figma import has no collections.');
  const source = existsSync(sourcePath) ? JSON.parse(readFileSync(sourcePath, 'utf8')) : null;
  const merged = mergeFigmaVariables(source, figma);
  const resolved = resolveStudentPalette(merged.source, figma, config);
  return { config, figma, ...resolved, paletteHash: paletteHash(figma) };
}
function mappingsOf(plan, context) {
  tokenPlanSourceIdentity(plan.metadata.source_url, context.figma);
  const byName = new Map(context.tokens.filter((t) => t.layer === 'primitive' && t.category === 'COLOR').map((t) => [t.name, t]));
  const declared = new Set(context.tokens.filter((t) => t.layer === 'semantic').map((t) => t.name));
  const nodes = (context.figma.nodes ?? []).filter((node) => /^\d+[:-]\d+$/.test(node)).map((node) => node.replace('-', ':'));
  const rows = plan.body.match(/<!-- token-mappings:start -->\s*([\s\S]*?)\s*<!-- token-mappings:end -->/)?.[1];
  if (rows == null || /미확정|미답변|TODO|REPLACE|\bTBD\b/i.test(plan.body)) throw new Error('Check the plan for undecided items (TODO, REPLACE, TBD) and check the mapping table.');
  if ((plan.body.match(/<!-- token-mappings:start -->/g) ?? []).length !== 1 || (plan.body.match(/<!-- token-mappings:end -->/g) ?? []).length !== 1 || (plan.body.match(/<!-- token-contrast:start -->/g) ?? []).length !== 1 || (plan.body.match(/<!-- token-contrast:end -->/g) ?? []).length !== 1) throw new Error('The plan needs exactly one mapping block and exactly one contrast block.');
  const mappings = Object.create(null);
  const lines = rows.split(/\r?\n/).filter((line) => line.trim());
  for (const [index, line] of lines.entries()) {
    if (!/^\s*\|.*\|\s*$/.test(line)) throw new Error('The mapping table has an invalid row.');
    const cells = line.trim().split('|').slice(1, -1).map((s) => s.trim());
    if (cells.every((cell) => /^[-:]+$/.test(cell))) continue;
    if (index === 0 && lines[1]?.split('|').slice(1, -1).every((cell) => /^\s*[-:]+\s*$/.test(cell))) {
      if (cells.length !== 5) throw new Error('The mapping table header must have 5 columns.');
      continue;
    }
    if (cells.length !== 5) throw new Error('The mapping table must have 5 columns: role, primitive, Figma node, value, reason.');
    const [role, primitive, node, value, reason] = cells;
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(role) || Object.hasOwn(mappings, role) || declared.has(role)) throw new Error(`Duplicate, already declared, or invalid role: ${role}. Each row is one role. Colors without a role are not rows in this table — they are already usable as primitives.`);
    const token = byName.get(primitive);
    if (!token) throw new Error(`${role}: there is no primitive "${primitive}" in your Figma. Write one of the imported color primitive names: ${[...byName.keys()].join(', ')}`);
    if (token.value.toLowerCase() !== value.toLowerCase()) throw new Error(`${role}: the raw value "${value}" is not the value of primitive "${primitive}", which is "${token.value}". Copy the source value exactly.`);
    if (!/^\d+[:-]\d+$/.test(node) || (nodes.length && !nodes.includes(node.replace('-', ':')))) throw new Error(nodes.length
      ? `${role}: Figma node "${node}" is not one of the imported nodes (${nodes.join(', ')}). Write one of the nodes in figma-variables.json. Variable ids are not allowed.`
      : `${role}: Figma node "${node}" has the wrong format. Write an imported Figma node number (example: 0:1). Variable ids are not allowed.`);
    if (!reason) throw new Error(`${role}: the reason is empty. Write the source evidence that links the role to the primitive, or why the AI suggested it.`);
    mappings[role] = primitive;
  }
  return mappings;
}
export function validateTokenMappings(plan, context) {
  const mappings = mappingsOf(plan, context);
  const semantic = applySemanticOverrides(context.tokens, mappings, context.config);
  const missing = missingStudentRoles(semantic.tokens);
  if (semantic.issues.length || missing.length) throw new Error(`Missing or invalid roles: ${missing.join(', ')}. Add them in your Figma or fix the proposal.`);
  // 표준 역할과 같은 이름인 primitive 등 CSS 충돌도 적용 전에 막는다.
  const names = new Set();
  for (const t of semantic.tokens) {
    const key = cssVarFor(t.category, t.name);
    if (names.has(key)) throw new Error(`Two tokens would get the same name: ${key}`);
    names.add(key);
  }
  return { mappings, tokens: semantic.tokens, contrasts: textContrasts(semantic.tokens) };
}
function contrastBlock(rows) {
  return '<!-- token-contrast:start -->\nNormal text needs 4.5:1; disabled text is exempt. Colors are never adjusted automatically.\n| Text | Background | Contrast | Result |\n|---|---|---|---|\n' + rows.map((r) => `| ${r.foreground} | ${r.background} | ${r.ratio == null ? 'not checked' : r.ratio.toFixed(2) + ':1'} | ${r.status === 'exempt' ? 'disabled (exempt)' : r.status === 'pass' ? 'pass' : r.status === 'warn' ? 'warning' : 'not checked'} |`).join('\n') + '\n<!-- token-contrast:end -->';
}
export function prepareTokenPlan(text, context) {
  const plan = parseTokenPlan(text);
  if (plan.metadata.status !== 'review-required') throw new Error(plan.metadata.status === 'approved'
    ? 'Only a plan in review (status: review-required) can be prepared. This plan is approved, so --prepare does nothing. If the approved roles still work, there is nothing to approve — run pnpm ds:apply-token-plan without --prepare. To change a role: in one edit set status: review-required and raise revision by 1, then run --prepare, then ask the student to approve.'
    : 'Run --prepare only while status is review-required. Set status: review-required first (approval is never changed automatically).');
  const result = validateTokenMappings(plan, context);
  plan.metadata.palette_hash = context.paletteHash;
  const block = contrastBlock(result.contrasts);
  if (!/<!-- token-contrast:start -->[\s\S]*?<!-- token-contrast:end -->/.test(plan.body)) throw new Error('The plan has no contrast block. Start from the template.');
  plan.body = plan.body.replace(/<!-- token-contrast:start -->[\s\S]*?<!-- token-contrast:end -->/, block);
  plan.metadata.content_hash = tokenPlanHash(plan);
  return serializeTokenPlan(plan);
}
export const ROLE_COLOR_CHANGED = 'The palette hash does not match because a color that an approved role uses was changed or removed in Figma, so the roles need approval again. In one edit set status: review-required, raise revision by 1 and copy the new value into the table; run pnpm ds:apply-token-plan docs/plans/tokens.md --prepare; then ask the student to approve.';
export function validateApprovedTokenPlan(text, context) {
  const plan = parseTokenPlan(text);
  assertStudentPlanApproved(plan);
  // 색이 그대로면(노드만 늘어도) 승인은 유효하다. 예전 방식 해시도 받아 준다(Q-69 A).
  // 팔레트가 달라도 승인된 역할이 가리키는 색이 모두 그대로면(새 색이 추가만 됨) 승인은 유효하다(Q-70 결정 7).
  // 표의 원시 값은 content_hash 로 고정돼 있어, 아래 검사가 "매핑된 색의 값이 그대로인가"를 확인한다.
  if (paletteHashMatches(plan.metadata.palette_hash, context.figma)) return { ...validateTokenMappings(plan, context), metadata: plan.metadata };
  try {
    const validated = validateTokenMappings(plan, context);
    // context.tokens는 보통 같은 figma에서 계산되지만, 호출자가 캐시한 tokens와 새 figma를 함께 넘겨도
    // 팔레트 해시 우회가 되지 않게 현재 Figma collection 자체에서 승인된 primitive 값을 다시 본다.
    const approved = planTableColors(plan.body);
    const current = new Map((context.figma?.collections ?? []).flatMap((collection) => collection.variables ?? [])
      .filter((variable) => variable.type === 'COLOR')
      .map((variable) => [variable.name, String(exactCssColor(variable.value) ?? variable.value).toLowerCase()]));
    const kept = Object.values(validated.mappings).every((primitive) => typeof approved[primitive] === 'string'
      && current.get(primitive) === String(exactCssColor(approved[primitive]) ?? approved[primitive]).toLowerCase());
    if (!kept) throw new Error('an approved primitive changed or disappeared');
    return { ...validated, metadata: plan.metadata };
  } catch (error) {
    throw new Error(`${ROLE_COLOR_CHANGED} (${error.message})`);
  }
}

/** 승인된 색 계획 표의 { primitive: 원시 값 }. planHash 가 그 계획의 content_hash 와 같을 때만(예전 semantic.json 기록 호환, Q-70 결정 7). */
export function approvedPlanColors(root, planHash, filename = DEFAULT_TOKEN_PLAN) {
  try {
    const plan = parseTokenPlan(readFileSync(resolve(root, filename), 'utf8'));
    if (plan.metadata.status !== 'approved' || !planHash || plan.metadata.content_hash !== planHash || tokenPlanHash(plan) !== planHash) return null;
    return planTableColors(plan.body);
  } catch { return null; }
}
/** 표 행의 { primitive: 값 }. */
export function planTableColors(body) {
  const rows = String(body).match(/<!-- token-mappings:start -->\s*([\s\S]*?)\s*<!-- token-mappings:end -->/)?.[1] ?? '';
  const colors = {};
  for (const line of rows.split(/\r?\n/)) {
    const cells = line.trim().split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length === 5 && /^[a-z][a-z0-9-]*$/.test(cells[1]) && /^#[0-9a-f]{3,8}$/i.test(cells[3])) colors[cells[1]] = cells[3];
  }
  return colors;
}
/** semantic.json 의 매핑이 지금 팔레트에서 유효한가: 팔레트 해시가 같거나, 매핑된 색이 모두 그대로다. */
export function semanticMappingValid(overrides, figma, tokens, root) {
  if (paletteHashMatches(overrides?.$paletteHash, figma)) return true;
  const colors = overrides?.$colors && typeof overrides.$colors === 'object' ? overrides.$colors : approvedPlanColors(root, overrides?.$planHash);
  return approvedColorsKept(overrides, colors, tokens);
}

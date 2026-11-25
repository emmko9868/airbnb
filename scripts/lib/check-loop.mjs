/**
 * 같은 실패로 돌지 않게 하는 세션 기록 (Q-66 결정 3·4). 의존성 0.
 *
 * - 같은 세션에서 같은 부품(또는 페이지)의 자동 검사가 같은 종류의 문제로 3번 연속 실패하면
 *   멈춤 문장을 붙이고, 그 부품 파일·그 부품 계획 수정을 다음 학생 메시지(UserPromptSubmit)까지 막는다.
 * - 학생 메시지 하나 사이에 같은 계획의 revision 을 2번 넘게 올리면 막는다.
 * 기록은 node_modules/.cache/ds-figma/loop-<session>.json 에 둔다. 학생 메시지가 오면 지운다.
 * 문제 종류는 문장 그대로가 아니라 검사 항목 단위로 센다 — AI 가 문구를 조금씩 바꿔도 같은 종류다.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const REPEAT_LIMIT = 3;
/** 검사 목록을 보여 주는 상한(Q-70 결정 2). 넘으면 "and N more" 를 붙인다 — 개수 세기(problemSizes)도 이 꼬리를 읽는다. */
export const LIST_LIMIT = 20;
export const listUpTo = (items, limit = LIST_LIMIT, separator = ", ") => `${items.slice(0, limit).join(separator)}${items.length > limit ? `${separator}and ${items.length - limit} more` : ""}`;
export const REVISION_LIMIT = 2;

/** 멈춤 문장(오더 결정 3 원문). */
export const stopSentence = (kind) => `The same check failed 3 times: ${kind}. Stop now. Do not change the plan or the code again for this. Tell the student in one line what is done and say: "Please show this screen to the instructor."`;
/** revision 제한 문장(결정 4②, 결정 3 과 같은 뜻). */
export const revisionStopSentence = () => `The plan revision was already raised ${REVISION_LIMIT} times since the student's last message: plan-revision. Stop now. Do not change the plan or the code again for this. Tell the student in one line what is done and say: "Please show this screen to the instructor."`;

// 검사 항목 단위. 위에서부터 먼저 맞는 것 하나로 센다.
const KINDS = [
  ["plan-contract", /could not validate the approved Nested parts contract|scope_nodes/],
  ["shared-style", /target the shared \S+ styles|to the nested shared \S+ to change its appearance/],
  ["nested-part", /Nested parts|nested-instance|nested shared|inside the composite root/],
  ["icon-path", /original path of Figma icon|has an icon, but the component has no <svg>/],
  ["play-text", /play function looks for|no play check clicks|no Focus story|play function must click/],
  ["token", /uses variables .* not in the generated|color tokens .* not in the Figma color map|Guard error: .*(?:G1|G2|G5|G10|G13)\b/],
  ["px-literal", /px literals/],
  ["button-action", /does nothing when clicked|has no disabled attribute|<button> contains/],
  ["class-name", /never applies the CSS classes|className has classes|drops the base class|is not imported, so no styles apply|both buttons together|focus surrounds the whole group/i],
  ["state-prop", /the `state` prop/],
  ["svg-img", /SVG code string in <img src>/],
  ["testid", /needs data-testid/],
  ["guard", /Guard error/],
  ["type", /Type errors/],
];

/** 문제 줄들의 종류 목록(중복 없음). "- " 로 시작하지 않는 이어진 줄(타입 오류 본문 등)은 앞 줄에 속한다. */
export function problemKinds(problems, fallback = "other") {
  return Object.keys(problemSizes(problems, fallback));
}

/**
 * 종류마다 문제 개수(Q-70 결정 1). 한 줄에 "Card.css:12 16px" 같은 위치가 여럿이면 그 수를, "and N more" 가 있으면 N 을 더한다.
 * 위치가 없는 줄은 1개다. "- " 로 시작하지 않는 이어진 줄은 앞 줄의 종류에 1개씩 더한다(타입 오류 본문).
 */
export function problemSizes(problems, fallback = "other") {
  const sizes = {};
  let last = null;
  for (const line of problems.flatMap((problem) => String(problem).split("\n"))) {
    if (!line.trim()) continue;
    if (!/^\s*-\s/.test(line) && last) { sizes[last] += 1; continue; }
    const kind = KINDS.find(([, pattern]) => pattern.test(line))?.[0] || fallback;
    const places = (line.match(/[\w.-]+\.(?:css|tsx?|mdx?):\d+/g) || []).length;
    const more = Number(line.match(/\band (\d+) more\b/)?.[1] || 0);
    sizes[kind] = (sizes[kind] || 0) + Math.max(1, places + more);
    last = kind;
  }
  return sizes;
}

const safe = (value) => String(value || "").replace(/[^\w-]/g, "");
const stateFile = (cacheDir, session) => join(cacheDir, `loop-${safe(session)}.json`);
const CURRENT = "session-current.json";

function readState(cacheDir, session) {
  try {
    const state = JSON.parse(readFileSync(stateFile(cacheDir, session), "utf8"));
    return { counts: state.counts || {}, sizes: state.sizes || {}, locks: state.locks || {}, planBase: state.planBase || {}, notes: state.notes || {} };
  } catch {
    return { counts: {}, sizes: {}, locks: {}, planBase: {}, notes: {} };
  }
}

function writeState(cacheDir, session, state) {
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(stateFile(cacheDir, session), JSON.stringify(state));
  } catch {}
}

/** UserPromptSubmit: 학생이 새 메시지를 보냈다. 이 세션의 멈춤·횟수·revision 기준을 지우고 현재 세션으로 기록한다. */
export function studentMessage(cacheDir, session) {
  if (!safe(session)) return;
  try { rmSync(stateFile(cacheDir, session), { force: true }); } catch {}
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(join(cacheDir, CURRENT), JSON.stringify({ session: safe(session), at: Date.now() }));
  } catch {}
}

/** 셸에서 실행한 `pnpm ai:check` 는 세션 id 를 받지 못한다. 마지막 학생 메시지의 세션(12시간 안)을 쓴다. */
export function currentSession(cacheDir) {
  try {
    const current = JSON.parse(readFileSync(join(cacheDir, CURRENT), "utf8"));
    return Date.now() - Number(current.at) < 12 * 3600e3 ? safe(current.session) : "";
  } catch {
    return "";
  }
}

/**
 * 검사 한 번의 결과를 기록한다. key 는 "component:Card" · "page:Home".
 * 이번에 나온 종류는 1 늘리고, 나오지 않은 종류는 0 으로 되돌린다(종류가 바뀌면 다시 센다). 통과하면 모두 0.
 * 진전은 세지 않는다(Q-70 결정 1): 같은 (부품, 파일)의 같은 종류 문제 개수가 지난번보다 줄었으면 그 종류는 1 로 되돌린다.
 * 줄지 않았을 때(같거나 늘었을 때)만 +1 이다.
 * 어떤 종류가 3 에 닿으면 그 key 를 잠그고 종류를 돌려준다. 이미 잠겨 있으면 그 종류를 돌려준다.
 *
 * file(저장한 파일 경로)을 주면 그 파일을 저장한 검사끼리만 센다(Q-69 C②). 같은 부품의 다른 파일을 처음 저장한
 * 검사는 이 파일의 횟수에 더하지 않는다 — 새 부품 파일 3개(tsx·css·stories)를 차례로 처음 쓰는 동안에는 고칠 기회가
 * 없었기 때문이다. 같은 파일을 다시 저장해 같은 종류로 3번 실패하면 멈춘다. 잠금은 지금처럼 부품 단위다.
 * file 이 없으면(셸의 pnpm ai:check) 부품 단위로 매번 센다.
 */
export function recordCheck(cacheDir, session, key, problems, fallback, file) {
  if (!safe(session)) return null;
  const state = readState(cacheDir, session);
  if (state.locks[key]) return state.locks[key];
  const counter = file ? `${key}|${file}` : key;
  const sizes = problems.length ? problemSizes(problems, fallback) : {};
  const kinds = Object.keys(sizes);
  const previous = state.counts[counter] || {};
  const previousSizes = state.sizes[counter] || {};
  const progressed = (kind) => Number.isFinite(previousSizes[kind]) && sizes[kind] < previousSizes[kind];
  const counts = Object.fromEntries(kinds.map((kind) => [kind, progressed(kind) ? 1 : (previous[kind] || 0) + 1]));
  state.counts[counter] = counts;
  state.sizes[counter] = sizes;
  const hit = kinds.find((kind) => counts[kind] >= REPEAT_LIMIT) || null;
  if (hit) state.locks[key] = hit;
  writeState(cacheDir, session, state);
  return hit;
}

/** 잠긴 key 의 문제 종류, 없으면 null. */
export function lockedKind(cacheDir, session, key) {
  if (!safe(session)) return null;
  return readState(cacheDir, session).locks[key] || null;
}

/** 이 세션에서 잠긴 key 목록. */
export function lockedKeys(cacheDir, session) {
  if (!safe(session)) return {};
  return readState(cacheDir, session).locks;
}

/**
 * 계획 파일 편집 전에 부른다. 이 학생 메시지 동안 처음 본 revision 을 기준으로 두고,
 * 새 revision 이 기준보다 REVISION_LIMIT 넘게 올라가면 그 계획의 부품들을 잠그고 true 를 돌려준다.
 */
export function planRevisionExceeded(cacheDir, session, path, before, after, components = []) {
  if (!safe(session)) return false;
  const state = readState(cacheDir, session);
  const next = Number(after);
  const base = state.planBase[path] ?? (Number.isInteger(Number(before)) && before !== undefined && before !== null && before !== "" ? Number(before) : next);
  if (!Number.isInteger(base)) return false;
  if (state.planBase[path] === undefined) state.planBase[path] = base;
  const exceeded = Number.isInteger(next) && next - base > REVISION_LIMIT;
  if (exceeded) for (const component of components) state.locks[`component:${component}`] ||= "plan-revision";
  writeState(cacheDir, session, state);
  return exceeded;
}

/** 잠긴 종류에 맞는 멈춤 문장. */
export const lockSentence = (kind) => kind === "plan-revision" ? revisionStopSentence() : stopSentence(kind);

/** 다른 부품의 검사 오류 안내(Q-69 C①). 이 부품 몫이 아니므로 세지 않고, 학생 메시지 한 번 사이에 한 번만 붙인다. */
export const OTHER_PARTS_NOTE = "Other parts have check errors that are not yours — do not change them; tell the instructor if they stay.";
export function noteOnce(cacheDir, session, note) {
  if (!safe(session)) return true;
  const state = readState(cacheDir, session);
  if (state.notes[note]) return false;
  state.notes[note] = true;
  writeState(cacheDir, session, state);
  return true;
}

// ── 이 대화(session)가 다룬 부품(Q-70 결정 6) ─────────────────────────
// 학생 메시지가 와도 지우지 않는다. 같은 대화에 다른 부품 링크가 오면 새 대화를 권하는 데 쓴다.
const partsFile = (cacheDir, session) => join(cacheDir, `parts-${safe(session)}.json`);
const partKey = (name) => String(name ?? "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();

/** 이 대화가 계획하거나 고친 부품 { parts: [이름], nodes: ["238:2378"] }. */
export function sessionParts(cacheDir, session) {
  if (!safe(session)) return { parts: [], nodes: [] };
  try {
    const saved = JSON.parse(readFileSync(partsFile(cacheDir, session), "utf8"));
    return { parts: Array.isArray(saved.parts) ? saved.parts : [], nodes: Array.isArray(saved.nodes) ? saved.nodes : [] };
  } catch {
    return { parts: [], nodes: [] };
  }
}

/** 부품 계획·파일을 저장할 때 부른다. */
export function recordSessionPart(cacheDir, session, { parts = [], nodes = [] } = {}) {
  if (!safe(session)) return;
  const saved = sessionParts(cacheDir, session);
  const next = { parts: [...new Set([...saved.parts, ...parts.filter(Boolean)])], nodes: [...new Set([...saved.nodes, ...nodes.filter(Boolean)])] };
  if (next.parts.length === saved.parts.length && next.nodes.length === saved.nodes.length) return;
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(partsFile(cacheDir, session), JSON.stringify(next));
  } catch {}
}

/**
 * 새 링크의 부품이 이 대화가 이미 다룬 부품과 다른가. 다르면 이 대화가 다룬 부품 이름들, 같거나 모르면 null.
 * 같은 노드이거나 같은 이름(대소문자·공백 무시)이면 같은 부품이다. 한 계획의 components: 목록은 저장할 때 모두 기록된다.
 */
export function otherSessionParts(cacheDir, session, { names = [], node = null } = {}) {
  const saved = sessionParts(cacheDir, session);
  if (!saved.parts.length && !saved.nodes.length) return null;
  const keys = names.map(partKey).filter(Boolean);
  if (!keys.length && !node) return null;
  if (node && saved.nodes.includes(node)) return null;
  if (keys.some((key) => saved.parts.some((part) => partKey(part) === key))) return null;
  return saved.parts.length ? saved.parts : null;
}

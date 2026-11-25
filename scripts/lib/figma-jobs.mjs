import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import { cachedFigmaContext, figmaRequest } from "../figma-context.mjs";
import { cleanVariableName } from "./figma-merge.mjs";
import { parseColorA } from "./color.mjs";
import { FIGMA_NO_ANSWER_STUDENT, FIGMA_STILL_READING_STUDENT } from "./figma-messages.mjs";
import { partGradientTokens } from "./figma-gradients.mjs";

export const FIGMA_PENDING = `[Figma] The design is being read in the background. Do not guess the design or read the same node again. Tell the user: '${FIGMA_STILL_READING_STUDENT}' Then stop.`;
/**
 * 디자인을 읽지 못했을 때의 맥락(Q-69 E①). 시간 초과·끊김뿐 아니라 메타데이터만 읽고 디자인 코드를 못 읽은 경우도 이것이다.
 * 계획·MCP 직접 호출·아이콘 그리기·ds:figma 재실행을 막고, 학생이 같은 메시지를 다시 보내게 한다(그때 다시 읽는다).
 */
export const FIGMA_FAILED = `[Figma] Figma did not answer, so the design was not read. Do not write a plan. Do not call Figma MCP tools yourself and do not wait for them. Do not draw icons or guess the design. Do not run pnpm ds:figma to read the design (it reads only colors). Tell the student exactly: "${FIGMA_NO_ANSWER_STUDENT}" Then stop.`;
export const boundedMs = (value, fallback, max) => Number.isFinite(Number(value)) && Number(value) >= 0 && value !== "" && value !== undefined ? Math.min(max, Number(value)) : fallback;
export const jobPaths = (request) => ({ lock: join(request.cacheDir, `job-${request.key}.lock`), result: join(request.cacheDir, `job-${request.key}.json`) });
export function readOwner(lock) { try { return JSON.parse(readFileSync(join(lock, "owner.json"), "utf8")); } catch { return null; } }
export function writeOwner(lock, owner) {
  const temporary = join(lock, `owner-${randomUUID()}.tmp`);
  writeFileSync(temporary, JSON.stringify(owner));
  renameSync(temporary, join(lock, "owner.json"));
}
export function alive(pid) { if (!Number.isInteger(pid) || pid < 1) return false; try { process.kill(pid, 0); return true; } catch (error) { return error.code === "EPERM"; } }
export function releaseJob(lock, token) { if (readOwner(lock)?.token === token) rmSync(lock, { recursive: true, force: true }); }
export function finishJob(paths, token, value) {
  if (readOwner(paths.lock)?.token !== token) return;
  const temporary = `${paths.result}.${token}.tmp`;
  try {
    writeFileSync(temporary, JSON.stringify({ ...value, savedAt: Date.now() }));
    renameSync(temporary, paths.result);
    if (value.error) writeFileSync(`${paths.result}.failure.json`, JSON.stringify({ error: value.error, savedAt: Date.now() }));
  } finally {
    rmSync(temporary, { force: true });
    releaseJob(paths.lock, token);
  }
}
function takeResult(path) {
  const claimed = `${path}.${randomUUID()}.claimed`;
  try {
    // 두 hook이 동시에 같은 결과를 읽지 않게 rename으로 한 번만 가져온다.
    renameSync(path, claimed);
    const result = JSON.parse(readFileSync(claimed, "utf8"));
    return result.context || FIGMA_FAILED;
  } catch { return null; }
  finally { rmSync(claimed, { force: true }); }
}

/**
 * 읽기 결과가 "디자인을 못 읽음"이면 FIGMA_FAILED 로 바꾼다. 미리 읽기 사실이 있어도 기본 변형의 디자인 코드를
 * 못 읽었거나 어느 변형도 읽지 못했으면(메타데이터만 있음) 실패다. 일부 다른 변형만 못 읽었으면 사실을 그대로 준다
 * (그 변형을 계획 범위에 넣으면 승인 준비 검사가 막는다).
 */
export function designReadFailed(context, request) {
  if (context === FIGMA_FAILED || String(context).startsWith(FIGMA_FAILED)) return true;
  if (!/^\[Figma\] Pre-analysis/.test(String(context))) return false;
  try {
    const cached = JSON.parse(readFileSync(request.cacheFile, "utf8"));
    const details = cached.facts?.variantDetails;
    if (cached.complete === true || !Array.isArray(details) || !details.length) return false;
    return details[0].read !== true || details.every((variant) => variant.read !== true);
  } catch { return false; }
}

export async function figmaPromptContext(message, root) {
  const request = figmaRequest(message, root);
  if (!request) return null;
  const answer = (context) => context && designReadFailed(context, request) ? FIGMA_FAILED : context;
  // 지난 읽기의 실패 결과는 쓰지 않고 다시 읽는다 — 학생이 같은 메시지를 다시 보낸 것이 재시도다(Q-69 E①).
  const paths = jobPaths(request);
  const completed = takeResult(paths.result);
  if (completed && !designReadFailed(completed, request)) return completed;
  const cached = cachedFigmaContext(message, root);
  if (cached) return cached;
  mkdirSync(request.cacheDir, { recursive: true });
  let owner = readOwner(paths.lock);
  if (existsSync(paths.lock) && !owner) {
    // 다른 hook이 mkdir 직후 owner를 쓰는 짧은 구간에서는 작업을 빼앗지 않는다.
    if (Date.now() - statSync(paths.lock).mtimeMs > 2000) { rmSync(paths.lock, { recursive: true, force: true }); return FIGMA_FAILED; }
    return FIGMA_PENDING;
  }
  if (owner && !alive(owner.pid)) {
    finishJob(paths, owner.token, { context: FIGMA_FAILED, error: "The background process exited." });
    return answer(takeResult(paths.result)) || FIGMA_FAILED;
  }
  if (!owner) {
    try { mkdirSync(paths.lock); } catch (error) { if (error.code === "EEXIST") return FIGMA_PENDING; throw error; }
    const token = randomUUID();
    const startedAt = Date.now();
    owner = { token, pid: process.pid, startedAt };
    writeOwner(paths.lock, owner);
    try {
      const child = spawn(process.execPath, [fileURLToPath(new URL("../figma-worker.mjs", import.meta.url)), root, String(message), token, String(startedAt)], {
        cwd: root, env: { ...process.env }, detached: true, stdio: "ignore", windowsHide: true,
      });
      child.on("error", (error) => finishJob(paths, token, { context: FIGMA_FAILED, error: error.message }));
      if (child.pid && readOwner(paths.lock)?.token === token) writeOwner(paths.lock, { ...owner, pid: child.pid });
      child.unref();
    } catch (error) { finishJob(paths, token, { context: FIGMA_FAILED, error: error.message }); }
  }
  const wait = boundedMs(process.env.DS_FIGMA_HOOK_WAIT_MS, 45_000, 45_000);
  const deadline = Date.now() + wait;
  while (Date.now() < deadline) {
    const result = takeResult(paths.result);
    if (result) return answer(result);
    const current = readOwner(paths.lock);
    if (current && !alive(current.pid)) {
      finishJob(paths, current.token, { context: FIGMA_FAILED, error: "The background process exited." });
      return answer(takeResult(paths.result)) || FIGMA_FAILED;
    }
    // 다른 요청이 일회성 결과를 먼저 사용했어도 완성된 캐시는 바로 재사용한다.
    if (!current) return answer(takeResult(paths.result)) || cachedFigmaContext(message, root) || FIGMA_FAILED;
    await new Promise((resolve) => setTimeout(resolve, Math.min(50, Math.max(0, deadline - Date.now()))));
  }
  return answer(takeResult(paths.result)) || FIGMA_PENDING;
}

// ── Q-65: 부품 링크의 색이 아직 키트에 없으면 AI 가 먼저 ds:figma 를 실행한다 ─────────

/** 부품 미리 읽기 맨 앞에 붙는 문장(결정 6②). */
export const syncFirstLine = (link) => `First run \`pnpm ds:figma "${link}"\` yourself (the student approves it in the permission box), then continue.`;

/**
 * 이 링크로 ds:figma 를 먼저 돌려야 하는가.
 *   { reason: "sample" }                         아직 샘플 팔레트(.ds/figma-variables.json 없음)
 *   { reason: "new", added: [...], changed: [...] }  훅 캐시의 facts.variables 중 가져온 변수에 없는 색·값이 바뀐 색
 *   null                                         필요 없음(또는 판단할 캐시가 없음)
 */
export function figmaSyncNeeded(message, root) {
  const request = figmaRequest(message, root);
  if (!request) return null;
  let imported = null;
  try { imported = JSON.parse(readFileSync(join(root, ".ds", "figma-variables.json"), "utf8")); } catch {}
  if (!imported || !Array.isArray(imported.collections)) return { reason: "sample" };
  let variables, facts;
  try { facts = JSON.parse(readFileSync(request.cacheFile, "utf8")).facts; variables = facts?.variables; } catch { return null; }
  if (!variables || typeof variables !== "object" || Array.isArray(variables)) return null;
  // 이 부품 디자인의 그라데이션 토큰이 아직 가져온 파일에 없으면 ds:figma 가 만든다(Q-70 결정 8).
  const savedGradients = new Set((Array.isArray(imported.gradients) ? imported.gradients : []).map((row) => `${row.name}\n${row.value}`));
  const gradients = partGradientTokens(facts).tokens.filter((token) => !savedGradients.has(`${token.name}\n${token.value}`)).map((token) => token.cssVar);
  const known = new Map();
  for (const [name, value] of Object.entries(imported.raw && typeof imported.raw === "object" ? imported.raw : {})) known.set(cleanVariableName(name), JSON.stringify(value));
  // raw 가 없는 예전 파일은 정리된 collections 의 이름·값으로 비교한다.
  if (!known.size) for (const variable of imported.collections.flatMap((collection) => collection.variables ?? [])) known.set(cleanVariableName(variable.figmaName ?? variable.name), JSON.stringify(variable.value));
  const added = [], changed = [];
  for (const [name, value] of Object.entries(variables)) {
    if (typeof value !== "string" || !parseColorA(value)) continue;
    const key = cleanVariableName(name);
    if (!known.has(key)) added.push(name);
    else if (known.get(key) !== JSON.stringify(value)) changed.push(name);
  }
  return added.length || changed.length || gradients.length
    ? { reason: "new", added, changed, ...(gradients.length ? { gradients } : {}) }
    : null;
}

/** 미리 읽기 결과 앞에 붙일 안내. 필요 없으면 null. */
export function figmaSyncContext(message, root) {
  const need = figmaSyncNeeded(message, root);
  if (!need) return null;
  const link = String(message).match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)'"]+/i)?.[0];
  const why = need.reason === "sample"
    ? "Reason: the kit still has the sample colors."
    : need.added.length || need.changed.length
      ? `Reason: this part uses Figma colors the kit does not have yet${need.added.length ? ` (new: ${need.added.join(", ")})` : ""}${need.changed.length ? ` (changed in Figma: ${need.changed.join(", ")})` : ""}${need.gradients?.length ? ` and gradient fills (${need.gradients.join(", ")})` : ""}.`
      : `Reason: this part has gradient fills the kit turns into tokens (${need.gradients.join(", ")}).`;
  return `${syncFirstLine(link)} ${why} Tell the student the Added / Changed lines in one plain sentence. If it says "Your approved roles stay", there is nothing to approve: do not change docs/plans/tokens.md and go on with this part's plan. If roles are empty afterwards, do the color role plan first (one recommended table, one choice), then this part's plan.`;
}

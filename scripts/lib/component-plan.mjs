/** Markdown 계획의 대상·승인·내용과 계획 단계의 변경 범위를 확인한다. */
import { existsSync, lstatSync, readFileSync, readdirSync, readlinkSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { isAbsolute, join, relative, resolve } from "node:path";
import { assertStarterFixUnchanged, readStarterFixApproval, starterFixDeclaration, starterFixFileAllowed } from "./starter-fix.mjs";
import { alive, designReadFailed, jobPaths, readOwner } from "./figma-jobs.mjs";
import { figmaRequest } from "../figma-context.mjs";
import { FIGMA_NO_ANSWER_STUDENT, FIGMA_STILL_READING_STUDENT } from "./figma-messages.mjs";

const hash = (content) => createHash("sha256").update(content).digest("hex");
export const validComponentName = (name) => /^[A-Z][A-Za-z0-9]*$/.test(String(name));

/** 계획이 다루는 부품 이름들. `component: Button` 하나 또는 `components: [Button, Link]` 목록(둘 다 있으면 합친다). */
export function planComponents(metadata) {
  const names = [];
  if (metadata?.component) names.push(String(metadata.component).trim());
  if (metadata?.components) names.push(...String(metadata.components).trim().replace(/^\[|\]$/g, "").split(",").map((name) => name.trim().replace(/^(['"])(.*)\1$/, "$2")).filter(Boolean));
  return [...new Set(names)];
}

// 사용자 채택 범위(DECISIONS): 임의의 Figma 부품에 적용하지 않는다.
// 기본 명세는 해당 계획서 본문에 기록하고 승인 hash에 함께 묶는다.
const starterSpecs = new Map(["Text", "Icon"].map((name) => [name, `docs/plans/components/${name}.md`]));

export function figmaSourceIdentity(url) {
  const parsed = new URL(url);
  if (!/^https?:$/.test(parsed.protocol) || !/^(www\.)?figma\.com$/.test(parsed.hostname)) throw new Error("Give a Figma node URL.");
  const key = parsed.pathname.match(/^\/(?:design|file)\/([^/]+)/)?.[1];
  const node = parsed.searchParams.get("node-id");
  if (!key || !/^\d+[:-]\d+$/.test(node || "")) throw new Error("The plan needs a Figma URL with the node-id of the part to build.");
  return `${key}:${node.replace("-", ":")}`;
}

/**
 * content 를 주면 디스크의 파일 대신 그 내용(편집 뒤 내용)을 읽는다. 승인 편집 전 준비 검사(Q-69 D)가
 * 구현 전 검사와 같은 함수를 쓰게 하기 위해서다. 경로 검사는 그대로 한다.
 */
export function readPlanDocument(projectRoot, filename, folder = "components", content = undefined) {
  const base = resolve(projectRoot, `docs/plans/${folder}`);
  const path = resolve(projectRoot, filename);
  const rel = relative(base, path);
  if (!rel || isAbsolute(rel) || rel.startsWith("..") || !path.endsWith(".md")) throw new Error(`The plan must be a Markdown file inside docs/plans/${folder}/.`);
  if (!existsSync(path)) throw new Error(`Plan not found: ${filename}. Write the plan first.`);
  const realBase = realpathSync(base);
  const baseRel = relative(realpathSync(projectRoot), realBase);
  if (isAbsolute(baseRel) || baseRel.startsWith("..")) throw new Error("The plan folder cannot be a link to a place outside the project.");
  const realRel = relative(realBase, realpathSync(path));
  if (isAbsolute(realRel) || realRel.startsWith("..")) throw new Error("A file outside the project's plan folder cannot be used as an approved plan.");
  if (content === undefined) content = readFileSync(path, "utf8");
  const header = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!header) throw new Error("The plan is missing its required metadata. Use docs/templates/component-plan.md.");
  const metadata = {};
  for (const line of header.split(/\r?\n/)) {
    const match = line.match(/^([a-z_]+):\s*(.*?)\s*$/);
    if (!match) continue;
    if (Object.hasOwn(metadata, match[1])) throw new Error(`The plan metadata ${match[1]} appears more than once. Check the approval status.`);
    metadata[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  if (!/^[1-9]\d*$/.test(metadata.revision || "")) throw new Error("The plan's revision must be a whole number, 1 or more.");
  return { path, content, metadata, digest: hash(content) };
}

/** 머리말의 선택 항목 `scope_nodes: [238:2494, 238:2495]`. 없으면 null(모든 변형). 형식이 틀리면 오류. */
export function planScopeNodes(metadata) {
  if (!metadata || !Object.hasOwn(metadata, "scope_nodes")) return null;
  const raw = String(metadata.scope_nodes).trim();
  if (!/^\[.*\]$/.test(raw)) throw new Error("scope_nodes must be a list of Figma variant node IDs, for example scope_nodes: [238:2494].");
  const ids = raw.slice(1, -1).split(",").map((item) => item.trim().replace(/^(['"])(.*)\1$/, "$2")).filter(Boolean);
  if (!ids.length || !ids.every((id) => /^\d+[:-]\d+$/.test(id))) throw new Error("scope_nodes must list one or more Figma variant node IDs such as 238:2494. To build every variant, remove the scope_nodes line.");
  return [...new Set(ids.map((id) => id.replace("-", ":")))];
}

/** scope_nodes 의 id 가 그 계획 source_url 로 읽은 Figma 사실의 변형 id 인지 확인한다(캐시 나이와 무관하게 마지막으로 읽은 사실). */
function assertScopeNodes(projectRoot, metadata) {
  const scope = planScopeNodes(metadata);
  if (!scope) return;
  const identity = figmaSourceIdentity(metadata.source_url); // "<fileKey>:<node id>"
  const key = identity.slice(0, identity.indexOf(":")), node = identity.slice(identity.indexOf(":") + 1);
  const cacheFile = join(projectRoot, "node_modules/.cache/ds-figma", `ctx-${key}-${node.replace(":", "-")}.json`);
  let facts;
  try { facts = JSON.parse(readFileSync(cacheFile, "utf8")).facts; } catch {}
  // 사실이 없으면 그 노드의 읽기 기록부터 본다: 읽는 중·실패면 그 멈춤 문장(PL 검토 Q-69 E② 보강).
  if (!facts) throw new Error(figmaJobProblem(projectRoot, metadata.source_url, node) ?? "scope_nodes can only be checked against the Figma facts read for this plan's source_url, and none are saved. Send the part link again so the kit reads it, then check the plan.");
  const known = new Map([...(facts.variants || []), ...(facts.variantDetails || [])].filter((variant) => variant?.id).map((variant) => [variant.id, variant.name]));
  const unknown = scope.filter((id) => !known.has(id));
  if (unknown.length) throw new Error(`scope_nodes has ${unknown.join(", ")}, which ${unknown.length > 1 ? "are not variants" : "is not a variant"} of this Figma part. Use only these variant IDs: ${[...known].map(([id, name]) => `${id} (${name})`).join(", ")}.`);
}

export function readComponentPlan(projectRoot, filename, sourceUrl, content = undefined) {
  const plan = readPlanDocument(projectRoot, filename, "components", content);
  const { path, metadata } = plan;
  const names = planComponents(metadata);
  if (metadata.kind !== "component" || !names.length || !names.every(validComponentName)) throw new Error("Check the plan's kind and component name (component: Name, or components: [Name, Other] for one plan that covers several parts).");
  const sourceKind = metadata.source_kind ?? "figma";
  if (sourceKind !== "figma" && Object.hasOwn(metadata, "scope_nodes")) throw new Error("scope_nodes is only for a Figma plan (variant node IDs of source_url).");
  if (sourceKind !== "figma" && (metadata.components || names.length !== 1)) throw new Error("starter-spec and starter-fix plans cover exactly one part with component: Name. Only a Figma plan may list several parts with components:.");
  if (sourceKind === "starter-spec") {
    const expected = starterSpecs.get(metadata.component);
    if (!expected) throw new Error("starter-spec is only allowed for the chosen basic parts Text and Icon. Other parts need a Figma plan.");
    if (metadata.source_url || sourceUrl) throw new Error("starter-spec uses source_ref instead of a Figma URL. A Figma request cannot be swapped for the starter spec.");
    if (metadata.source_ref !== expected || path !== resolve(projectRoot, expected) || realpathSync(path) !== resolve(realpathSync(projectRoot), expected)) throw new Error("For starter-spec, source_ref and the plan path must both be docs/plans/components/<Name>.md of that basic part. Symbolic links are not allowed.");
  } else if (sourceKind === "starter-fix") {
    starterFixDeclaration(projectRoot, plan, sourceUrl);
  } else if (sourceKind === "figma") {
    if (metadata.source_ref) throw new Error("A Figma plan uses source_url instead of source_ref.");
    if (figmaSourceIdentity(metadata.source_url) !== figmaSourceIdentity(sourceUrl)) throw new Error("The Figma file/node in the plan is different from the one in the request. Check the plan for this part.");
    assertScopeNodes(projectRoot, metadata);
  } else {
    throw new Error("The plan's source_kind must be figma, starter-spec, or starter-fix (instructor only).");
  }
  return plan;
}

export function readApprovedComponentPlan(projectRoot, filename, sourceUrl) {
  const plan = readComponentPlan(projectRoot, filename, sourceUrl);
  requirePlanApproval(plan, projectRoot);
  if (plan.metadata.source_kind === "starter-fix") {
    plan.starterFix = readStarterFixApproval(projectRoot, plan);
    plan.projectRoot = projectRoot;
  }
  return plan;
}

export function requirePlanApproval(plan, projectRoot = undefined) {
  if (plan.metadata.status !== "approved") throw new Error("Only a plan the user approved can be built. Summarize the plan in the chat and ask the user to approve it with a choice (Approve revision N / Change something); set status: approved only after they choose it.");
  const problems = planReadinessProblems(plan, projectRoot);
  if (problems.length) throw new Error(problems.join(" "));
  return plan;
}

/** 표의 아직 답하지 않은 칸(ask · open · 미답변 · 미확정). */
const UNANSWERED_CELL = /\|\s*(?:ask|open|미답변|미확정)(?:\s+—\s+[^|\r\n]+)?\s*(?=\|)/i;

export { FIGMA_NO_ANSWER_STUDENT, FIGMA_STILL_READING_STUDENT, isFigmaStop } from "./figma-messages.mjs";

/**
 * 계획의 Figma 디자인을 실제로 읽었는가(Q-69 E②). 훅이 저장한 사실(ctx-<file>-<node>.json)에서
 * scope_nodes(없으면 모든 변형)의 변형이 모두 읽혔는지 본다. 메타데이터만 읽은 변형은 사실이 아니다.
 * 사실 파일이 없으면(설치를 다시 해서 캐시가 지워짐 등) 판단하지 않는다.
 */
export function figmaDesignReadProblem(projectRoot, metadata) {
  if (!projectRoot || (metadata.source_kind ?? "figma") !== "figma") return null;
  let identity;
  try { identity = figmaSourceIdentity(metadata.source_url); } catch { return null; }
  const key = identity.slice(0, identity.indexOf(":")), node = identity.slice(identity.indexOf(":") + 1);
  let cached;
  try { cached = JSON.parse(readFileSync(join(projectRoot, "node_modules/.cache/ds-figma", `ctx-${key}-${node.replace(":", "-")}.json`), "utf8")); } catch { return figmaJobProblem(projectRoot, metadata.source_url, node); }
  const details = cached?.facts?.variantDetails;
  if (!Array.isArray(details) || !details.length) return null;
  let scope = null;
  try { scope = planScopeNodes(metadata); } catch { return null; }
  const wanted = scope ? details.filter((variant) => scope.includes(variant.id)) : details;
  const unread = wanted.filter((variant) => variant.read !== true);
  if (scope && wanted.length < scope.length) unread.push(...scope.filter((id) => !details.some((variant) => variant.id === id)).map((id) => ({ id, name: "not read" })));
  if (!unread.length) return null;
  return `The Figma design of ${unread.map((variant) => `${variant.id} (${variant.name})`).join(", ")} was not read — only its outline. A plan cannot be complete or approved from the outline alone. Do not call Figma tools yourself and do not draw icons. Tell the student: "${FIGMA_NO_ANSWER_STUDENT}" Then stop.`;
}

/**
 * 사실 캐시(ctx)가 없을 때만 부른다(PL 검토 Q-69 E② 보강). 완료된 ctx 가 있으면 그쪽이 우선이고 이 함수는 쓰지 않는다.
 * 그 노드의 백그라운드 읽기 기록을 figma-jobs 의 key(jobPaths)로 본다. scope_nodes 와 무관하다(노드 하나의 읽기 상태).
 *   읽는 중(lock 이 살아 있음)  → "Still reading …" 멈춤 문장
 *   마지막 결과가 실패          → "Figma did not answer …" 멈춤 문장
 *   기록 없음                  → null (지금처럼 판단하지 않음)
 */
function figmaJobProblem(projectRoot, sourceUrl, node) {
  let request;
  try { request = figmaRequest(sourceUrl, projectRoot); } catch { return null; }
  if (!request) return null;
  const paths = jobPaths(request);
  if (existsSync(paths.lock)) {
    const owner = readOwner(paths.lock);
    let fresh = false;
    try { fresh = !owner && Date.now() - lstatSync(paths.lock).mtimeMs <= 2000; } catch {}
    if ((owner && alive(owner.pid)) || fresh) return `The Figma design of ${node} is still being read in the background — nothing was read yet. Do not approve, plan or build from guesses, and do not call Figma tools yourself. Tell the student: "${FIGMA_STILL_READING_STUDENT}" Then stop.`;
  }
  const failedText = `The Figma design of ${node} was not read — the last read failed. A plan cannot be complete or approved without it. Do not call Figma tools yourself and do not draw icons. Tell the student: "${FIGMA_NO_ANSWER_STUDENT}" Then stop.`;
  // 마지막 결과: 아직 훅이 가져가지 않은 job-*.json, 이미 가져갔으면 실패 기록(job-*.json.failure.json).
  if (existsSync(paths.result)) {
    try {
      const result = JSON.parse(readFileSync(paths.result, "utf8"));
      return result.error || !result.context || designReadFailed(result.context, request) ? failedText : null;
    } catch { return failedText; }
  }
  return existsSync(`${paths.result}.failure.json`) ? failedText : null;
}

/**
 * 계획을 승인할 수 있는 상태인지(Q-69 D). 승인 줄 편집 전(PreToolUse)과 구현 전 검사가 같은 함수를 쓴다 —
 * 승인된 뒤에 같은 이유로 구현이 막히지 않게. 남은 것을 모두 알려 준다(첫 문장은 예전 문구 그대로).
 */
export function planReadinessProblems(plan, projectRoot = undefined) {
  const problems = [];
  const { metadata } = plan;
  if (metadata.facts_complete !== "true" || metadata.open_questions !== "0") problems.push(`Some facts are not checked or some Q&A is not answered. Answer the questions in the plan and check the facts first (now facts_complete: ${metadata.facts_complete ?? "missing"}, open_questions: ${metadata.open_questions ?? "missing"}).`);
  const open = String(plan.content).split(/\r?\n/).filter((line) => /^\s*\|/.test(line) && UNANSWERED_CELL.test(line));
  if (open.length) problems.push(`A table in the plan still has unanswered or undecided items. Changing the numbers in the metadata is not enough to approve it. Rows: ${open.slice(0, 5).map((line) => line.trim().slice(0, 120)).join(" / ")}${open.length > 5 ? ` / … ${open.length - 5} more` : ""}.`);
  try { nestedPartsFromPlan(plan, { validate: true }); } catch (error) { problems.push(error.message); }
  const design = figmaDesignReadProblem(projectRoot, metadata);
  if (design) problems.push(design);
  return problems;
}

/**
 * 승인 줄 편집(status: approved) 직전의 준비 검사. content 는 편집 뒤 계획 전체.
 * 구현 전 검사(readComponentPlan + requirePlanApproval)와 같은 검사를 status 만 빼고 한다. 문제 목록, 없으면 [].
 */
export function componentPlanApprovalProblems(projectRoot, filename, content) {
  let plan;
  try {
    const url = String(content).match(/^source_url:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
    plan = readComponentPlan(projectRoot, filename, url, content);
  } catch (error) { return [error.message]; }
  return planReadinessProblems(plan, projectRoot);
}

const tableCells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());

/** 승인 계획의 영어 Nested parts 표를 기계 검사가 쓸 수 있는 최소 계약으로 읽는다. */
export function nestedPartsFromPlan(plan, { validate = false } = {}) {
  const content = String(plan.content);
  const heading = /^##\s+\d+\.\s+Nested parts\s*$/m.exec(content);
  if (!heading) return [];
  const rest = content.slice(heading.index + heading[0].length);
  const next = rest.search(/^##\s+\d+\./m);
  const section = next < 0 ? rest : rest.slice(0, next);
  const lines = section.split(/\r?\n/).filter((line) => /^\s*\|/.test(line));
  if (lines.length < 2) return [];
  const headers = tableCells(lines[0]).map((cell) => cell.toLowerCase());
  const kitIndex = headers.indexOf("kit component and props");
  const instanceIndex = headers.indexOf("figma instance");
  const statusIndex = headers.indexOf("status");
  if (kitIndex < 0 || instanceIndex < 0 || statusIndex < 0) {
    if (validate) throw new Error("The Nested parts table must keep the columns Figma instance, Kit component and props, and Status from docs/templates/component-plan.md.");
    return [];
  }
  const rows = [];
  for (const line of lines.slice(2)) {
    const cells = tableCells(line);
    if (!cells.some(Boolean)) continue;
    const status = (cells[statusIndex] || "").toLowerCase();
    if (status !== "confirmed") {
      if (validate) throw new Error("Every Nested parts row must be confirmed by the user before implementation; unresolved rows stay ask.");
      continue;
    }
    const kit = (cells[kitIndex] || "").replace(/`/g, "").trim();
    const component = kit.match(/^([A-Z][A-Za-z0-9]*)\b/)?.[1];
    const none = /^none\s+—\s+\S/i.test(kit);
    if (!component && !none) {
      if (validate) throw new Error("Each confirmed Nested parts row must start Kit component and props with one exact kit component name, or use none — <how this part is made> when no kit import is required.");
      continue;
    }
    rows.push({ instance: cells[instanceIndex], kitComponent: component || null, kit, status });
  }
  return rows;
}

/** 머리말의 component/components 줄만 읽어 그 계획이 다루는 부품 이름을 돌려준다(본문 표의 같은 낱말은 보지 않는다). */
export function planComponentNames(content) {
  const header = String(content).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
  const field = (key) => header.match(new RegExp(`^${key}:\\s*([^\\r\\n]+)$`, "m"))?.[1]?.trim().replace(/^(['"])(.*)\1$/, "$2");
  return planComponents({ component: field("component"), components: field("components") });
}

function componentPlanCandidates(projectRoot, component) {
  const dir = join(projectRoot, "docs/plans/components");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((filename) => filename.endsWith(".md"))
    .map((filename) => ({ filename: join(dir, filename), stat: lstatSync(join(dir, filename)) }))
    .filter(({ stat }) => stat.isFile())
    .map(({ filename, stat }) => ({ filename, modified: stat.mtimeMs, content: readFileSync(filename, "utf8") }))
    .filter(({ content }) => planComponentNames(content).includes(component))
    .sort((a, b) => b.modified - a.modified);
}

export function currentApprovedComponentPlan(projectRoot, component) {
  const selected = componentPlanCandidates(projectRoot, component)[0];
  if (!selected) return null;
  const url = selected.content.match(/^source_url:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  return readApprovedComponentPlan(projectRoot, selected.filename, url);
}

export function currentComponentPlan(projectRoot, component) {
  const selected = componentPlanCandidates(projectRoot, component)[0];
  if (!selected) return null;
  const url = selected.content.match(/^source_url:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
  return readComponentPlan(projectRoot, selected.filename, url);
}

export function assertPlanUnchanged(plan) {
  if (!existsSync(plan.path) || hash(readFileSync(plan.path)) !== plan.digest) throw new Error("The approved plan changed while the work was running. The work cannot finish until the new revision is checked.");
  if (plan.starterFix) assertStarterFixUnchanged(plan.projectRoot, plan);
}

export function readImplementationResult(plan, filename, runId) {
  if (!existsSync(filename)) throw new Error("There is no build result status. Check for open questions or whether the build was stopped.");
  const result = JSON.parse(readFileSync(filename, "utf8"));
  if (result.run_id !== runId || result.plan_hash !== plan.digest || String(result.revision) !== plan.metadata.revision) throw new Error("The build result does not match the current approved plan or run.");
  if (result.status !== "ready-for-review" || result.open_questions !== 0) throw new Error(`The build is blocked: ${result.status || "unknown"}. ${result.reason || "Answer the open Q&A."}`);
  return result;
}

export function componentPendingReason(projectRoot, component, editedPath) {
  const matches = componentPlanCandidates(projectRoot, component);
  if (!matches.length) return "This part has no MD plan. Even for an existing part, check a plan for this change first.";
  const selected = matches[0];
  try {
    const url = selected.content.match(/^source_url:\s*(.+)$/m)?.[1]?.trim().replace(/^['"]|['"]$/g, "");
    const plan = readApprovedComponentPlan(projectRoot, selected.filename, url);
    if (plan.starterFix && editedPath && !starterFixFileAllowed(component, editedPath)) return "starter-fix can only change that part's TSX, stories and test. Changing CSS, public exports or visuals is not allowed.";
    const resultPath = selected.filename.replace(/\.md$/, ".result.json");
    if (existsSync(resultPath)) {
      const result = JSON.parse(readFileSync(resultPath, "utf8"));
      if (result.plan_hash === plan.digest && String(result.revision) === plan.metadata.revision && /^blocked-/.test(result.status || "")) return `There is open Q&A or a blocked result: ${result.reason || result.status}`;
    }
    return null;
  } catch (error) { return error.message; }
}

export function snapshotImplementationFiles(projectRoot) {
  const files = new Map();
  const visit = (path) => {
    if (!existsSync(path)) return;
    const stat = lstatSync(path);
    if (stat.isSymbolicLink()) files.set(relative(projectRoot, path), hash(readlinkSync(path)));
    else if (stat.isDirectory()) for (const entry of readdirSync(path)) visit(join(path, entry));
    else if (stat.isFile()) files.set(relative(projectRoot, path), hash(readFileSync(path)));
  };
  for (const name of ["src", ".ds", ".storybook", "scripts", "package.json", "pnpm-lock.yaml", "ds.config.json", "components.baseline.json", ".qwen", "QWEN.md", ".mcp.json", "AGENTS.md", "CLAUDE.md"]) visit(join(projectRoot, name));
  return files;
}

export function implementationChanges(before, after) {
  return [...new Set([...before.keys(), ...after.keys()])].filter((path) => before.get(path) !== after.get(path));
}

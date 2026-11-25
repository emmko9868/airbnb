/**
 * Claude Code · Qwen Code hook — AI 가 파일을 고칠 때 규칙을 기계적으로 집행한다.
 *
 *   node scripts/ai-check.mjs pre    PreToolUse: 생성물 수정·가짜 생성 표시를 막는다. 막을 때 AI 가 실행할 키트 명령을 알려 준다.
 *                                    키트 파일(scripts/·QWEN.md·.qwen/·docs/ai/·docs/templates/ 등) 수정과
 *                                    계획 파일의 스스로 승인(새 approved 파일, 다른 줄과 함께 approved, 승인 뒤 내용 수정)을 막는다
 *                                    셸 명령(run_shell_command 의 tool_input.command)은 Vercel 토큰 읽기·환경 변수 전체 출력을 막는다
 *                                    Qwen 훅 승인(qwen-hooks-approve·hookApprovals.json)은 셸·파일 쓰기 모두 막는다(Q-67)
 *   node scripts/ai-check.mjs post   PostToolUse: 컴포넌트를 고친 뒤 가드·타입·흔한 실수를 검사한다
 *   node scripts/ai-check.mjs prompt UserPromptSubmit: 요청의 Figma 링크를 미리 읽어 붙인다 (figma-context.mjs).
 *                                    매번 맥락 맨 뒤에 "[Kit checks on]" 을 붙인다(훅이 켜져 있다는 표시, Q-68). 진단용으로 hooks-alive.json 에 { at } 도 쓴다
 *                                    맨 앞이 아닌 /my-* 명령은 본문을 대신 붙인다 (lib/qwen-commands.mjs)
 *                                    /my-website 메시지의 Figma 링크는 페이지 화면이라 부품 분석을 하지 않는다
 *                                    말로 한 색 요청은 부품 분석 대신 ds:figma → 색 역할 묶음 승인 길을 붙인다.
 *                                    샘플 팔레트이거나 새 색이 있는 부품 링크는 맨 앞에 "먼저 ds:figma" 를 붙인다.
 *                                    ~/.qwen/mcpApprovals.json 에서 figma-desktop 이 승인되지 않았으면 /mcp 안내만 붙인다
 *   node scripts/ai-check.mjs stop   Stop: 끝내기 전에 이번에 바뀐 컴포넌트를 다시 검사하고, 문제가 남으면 계속 고치게 한다
 *   node scripts/ai-check.mjs answer PostToolUse(ask_user_question·AskUserQuestion): 학생이 고른 "Approve revision N" 을
 *                                    그때 계획 내용 해시와 함께 기록한다(Q-72, lib/plan-approvals.mjs). 학생 메시지의 같은 문장은 prompt 가 기록한다.
 *                                    pre 는 이 기록이 없으면 status: approved 편집을 막는다 — 승인 모드(default·auto)와 상관없이 선택은 학생이 한다.
 *
 * 반복 실패 멈춤(Q-66, lib/check-loop.mjs): post·check 에서 같은 부품(페이지)이 같은 종류의 문제로 3번 연속 실패하면
 * 멈춤 문장을 붙이고 그 부품 파일·계획 수정을 pre 에서 막는다. 학생 메시지 한 번 사이에 같은 계획의 revision 을
 * 2번 넘게 올리는 편집도 막는다. prompt(학생의 새 메시지)가 오면 풀린다. 계획의 scope_nodes 밖 변형의 사실은 검사하지 않는다.
 *
 * 문제가 있으면 stderr 에 고칠 방법을 쓰고 exit 2 로 끝낸다. Claude Code 는 이 내용을 모델에게 돌려준다.
 * 단, Qwen(훅 환경에 QWEN_PROJECT_DIR 이 있음)의 post 실패는 exit 0 + stdout JSON(decision·reason·additionalContext)으로 낸다(Q-69 F).
 * VS Code(ACP) 0.27.1 의 PostToolUse 는 exit 2 가 만드는 차단 결정을 버리고 additionalContext 만 AI 에게 붙이기 때문이다.
 * 작은 무료 모델은 긴 규칙을 끝까지 지키지 못하므로, 지시가 아니라 검사로 되돌려 준다.
 *
 * 계획 승인 편집(status: approved 한 줄)은 구현 전 검사와 같은 준비 검사(lib/component-plan.mjs planReadinessProblems)를
 * 통과해야 한다(Q-69 D). Figma 디자인을 읽지 못한 변형이 범위에 있으면 승인·구현을 막는다(Q-69 E).
 * 저장 뒤 검사는 이 부품 파일의 문제만 세고, 저장한 파일마다 센다 — 다른 파일을 처음 저장한 검사는 더하지 않는다(Q-69 C).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { blockElementsInButtons, componentQualityProblems, scopeFigmaFacts } from "./lib/component-quality.mjs";
import { componentPendingReason, componentPlanApprovalProblems, currentApprovedComponentPlan, currentComponentPlan, nestedPartsFromPlan, planComponentNames, planScopeNodes } from "./lib/component-plan.mjs";
import { isFigmaStop, isKitStop, newChatSentence } from "./lib/figma-messages.mjs";
import { LIST_LIMIT, OTHER_PARTS_NOTE, currentSession, listUpTo, lockSentence, otherSessionParts, recordSessionPart, lockedKeys, lockedKind, noteOnce, planRevisionExceeded, recordCheck, studentMessage } from "./lib/check-loop.mjs";
import { PAGES_DIR, pageEntry, pagePendingReason } from "./lib/page-plan.mjs";
import { chosenRevisions, notChosenSentence, recordApprovals, studentApproved, typedRevisions } from "./lib/plan-approvals.mjs";
import { budgetRun, hookDeadline, incompleteMessage, sharedChecks } from "./lib/hook-budget.mjs";
import { RUN_IT_YOURSELF } from "./lib/qwen-commands.mjs";
import { figmaNodeId, figmaRequest } from "./figma-context.mjs";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const mode = process.argv[2];
const cacheDir = join(root, "node_modules", ".cache", "ds-figma");
const deadline = mode === "check" ? Infinity : hookDeadline();

let input = {};
if (mode !== "check") {
  try {
    input = JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    process.exit(0);
  }
}
// UserPromptSubmit: 요청에 Figma 링크가 있으면 디자인을 미리 읽어 붙인다. 맨 앞이 아닌 /my-* 명령은 본문을, 말로 한 요청은 맞는 지시문 안내를 붙인다.
// 프롬프트 훅이 매 메시지에 붙이는 표시. QWEN.md·work-card 가 같은 문자열을 찾는다.
const KIT_CHECKS_ON = "[Kit checks on]";
if (mode === "prompt") {
  const { figmaPromptContext, figmaSyncContext, FIGMA_FAILED } = await import("./lib/figma-jobs.mjs");
  const { colorRequestContext, figmaApprovalContext, intentCommandContext, isColorRequest, isCommandPrompt, sharedPartPromptContext, strayCommandContext } = await import("./lib/qwen-commands.mjs");
  const prompt = input.prompt || "";
  // 훅이 살아 있다는 진단용 기록(Q-67). AI 판단은 이 파일의 시각이 아니라 맥락의 KIT_CHECKS_ON 표시로 한다(Q-68: AI 가 UTC 날짜를 어제로 읽고 멈춤).
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(join(cacheDir, "hooks-alive.json"), JSON.stringify({ at: new Date().toISOString() }));
  } catch {}
  // 학생의 새 메시지: 반복 실패 멈춤과 revision 기준을 푼다(Q-66 결정 3·4).
  studentMessage(cacheDir, input.session_id);
  // 학생이 직접 쓴 "Approve revision N" 은 질문 도구의 선택과 같은 승인이다(Q-72).
  try { recordApprovals(root, cacheDir, typedRevisions(prompt), { source: "prompt", session: String(input.session_id || "") }); } catch {}
  const stray = (() => { try { return strayCommandContext(prompt, root); } catch { return null; } })();
  // 말로 한 요청: 명령이 없을 때만 의도 낱말로 /my-* 지시문을 잇는다(조건문이라 AI 가 판단한다).
  const website = isCommandPrompt(prompt, "my-website", root);
  const spoken = stray || ["my-docs", "my-assets", "my-website", "my-deploy"].some((name) => isCommandPrompt(prompt, name, root))
    ? null
    : (() => { try { return intentCommandContext(prompt, root); } catch { return null; } })();
  const command = stray || spoken;
  const sharedPart = (() => { try { return sharedPartPromptContext(prompt, root); } catch { return null; } })();
  // 말로 한 색 요청(색 가져와·Figma 연결 확인)은 부품 미리 읽기 대신 색 가져오기 길을 붙인다(/my-website 처럼 부품 분석을 건너뛴다).
  const colors = !website && !stray && isColorRequest(prompt) ? colorRequestContext(prompt) : null;
  const hasFigmaLink = /https?:\/\/(?:www\.)?figma\.com\//i.test(prompt);
  // Figma 도구가 이 폴더에서 승인되지 않았으면 그 안내만 붙이고 Figma 를 읽지 않는다(호출 아끼기).
  const approval = hasFigmaLink || colors ? (() => { try { return figmaApprovalContext(root); } catch { return null; } })() : null;
  // /my-website 의 Figma 링크는 페이지 화면이다. 부품용 분석은 MCP 를 쓰고 "부품 링크를 보내라"며 멈추게 하므로 건너뛴다(사진은 pnpm web:figma).
  let figma = website || colors || approval ? null : await figmaPromptContext(prompt, root).catch((error) => `${FIGMA_FAILED}\nCause: ${error.message}`);
  // 부품 미리 읽기가 끝났는데 아직 샘플 팔레트이거나 새 색이 있으면 맨 앞에 ds:figma 를 먼저 하라고 붙인다.
  if (figma && /^\[Figma\] (?:Pre-analysis|\(Data read at)/.test(figma)) {
    const sync = (() => { try { return figmaSyncContext(prompt, root); } catch { return null; } })();
    if (sync) figma = `${sync}\n\n${figma}`;
  }
  // 이 대화가 이미 다른 부품을 계획·수정했는데 새 부품 링크가 오면 새 대화를 권하고 멈추게 한다(Q-70 결정 6).
  // Figma 미리 읽기는 위에서 이미 해 두었으므로 새 대화에서 바로 쓴다.
  const newChat = figma && /^(?:First run|\[Figma\] (?:Pre-analysis|\(Data read at))/.test(figma) ? (() => { try { return newChatContext(prompt, input.session_id); } catch { return null; } })() : null;
  if (newChat) {
    process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: [approval, newChat, KIT_CHECKS_ON].filter(Boolean).join("\n\n") } }));
    process.exit(0);
  }
  // 편집기에 열린 다른 부품 파일이 @경로로 붙어 와도 그 부품을 고치라는 뜻이 아니다(결정 6).
  const attached = figma ? attachedOtherPartNote(prompt) : null;
  // 매 메시지 맨 뒤에 키트 검사가 켜져 있다는 표시를 붙인다(맨 앞 "먼저 ds:figma" 순서는 그대로). 훅이 꺼지면 이 줄이 없어서 AI 가 멈춘다(QWEN.md).
  const context = [approval, command, colors, sharedPart, attached, figma, KIT_CHECKS_ON].filter(Boolean).join("\n\n");
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "UserPromptSubmit", additionalContext: context } }));
  process.exit(0);
}

/** 새 링크의 부품 이름(미리 읽기 캐시의 코드 이름·Figma 세트 이름)과 노드. */
function linkedPart(prompt) {
  const request = figmaRequest(prompt, root);
  if (!request) return null;
  let facts = null;
  try { facts = JSON.parse(readFileSync(request.cacheFile, "utf8")).facts; } catch {}
  return { names: [facts?.name, facts?.identity?.name, facts?.frameName].filter(Boolean), node: request.nodeId, label: facts?.frameName || facts?.name || null };
}

/** 이 대화가 다른 부품을 이미 다뤘으면 새 대화 안내 맥락, 아니면 null. */
function newChatContext(prompt, session) {
  const part = linkedPart(prompt);
  if (!part) return null;
  const others = otherSessionParts(cacheDir, session, part);
  if (!others) return null;
  return `[Kit] This chat already worked on ${others.join(", ")}. The new link is another part${part.label ? ` (${part.label})` : ""}. Do not plan, read files or build anything for it here. Tell the student exactly: "${newChatSentence(others.join(", "))}" Then stop. (The kit already read this Figma design, so the new chat can use it right away.)`;
}

/** 메시지 앞에 @src/components/<다른 부품>/… 이 붙어 있으면 한 줄 안내. */
function attachedOtherPartNote(prompt) {
  const part = linkedPart(prompt);
  const key = (name) => String(name ?? "").replace(/[^A-Za-z0-9]/g, "").toLowerCase();
  const mine = new Set((part?.names || []).map(key));
  const attached = [...new Set([...String(prompt).matchAll(/@src\/components\/([A-Za-z0-9]+)\//g)].map((match) => match[1]))].filter((name) => !mine.has(key(name)));
  if (!attached.length) return null;
  return `The ${attached.map((name) => `@src/components/${name}/…`).join(", ")} file in this message is only the file open in the editor. It is not a request to change ${attached.join(", ")}; do not edit it.`;
}

// Stop: 작은 모델은 검사 지적이 남은 채로 "완료" 라고 끝내곤 한다. 이번에 바뀐 컴포넌트를 다시 검사한다.
if (mode === "stop") {
  const sessionId = String(input.session_id || "").replace(/[^\w-]/g, "");
  if (!sessionId) process.exit(0);
  // AI 가 키트가 시킨 문장으로 올바르게 멈췄거나(강사 문장·Figma 응답 없음·새 대화 안내 등) 이미 Stop 훅이 한 번 되돌린 뒤면
  // 다시 일을 시키지 않는다(Q-70 결정 9). 남은 문제는 학생에게 systemMessage 로만 보인다.
  const mayBlock = input.stop_hook_active !== true && !isKitStop(input.last_assistant_message);
  // 반복 실패로 멈춘 세션은 "계속 고쳐라"로 되돌리지 않는다. 멈춤 문장을 다시 알리고 끝낸다.
  const locks = Object.entries(lockedKeys(cacheDir, sessionId));
  if (locks.length) {
    process.stdout.write(JSON.stringify({ systemMessage: [...new Set(locks.map(([, kind]) => lockSentence(kind)))].join("\n") }));
    process.exit(0);
  }
  let names = [];
  try { names = JSON.parse(readFileSync(join(cacheDir, `edited-${sessionId}.json`), "utf8")); } catch {}
  let pages = [];
  try { pages = JSON.parse(readFileSync(join(cacheDir, `edited-pages-${sessionId}.json`), "utf8")); } catch {}
  const pending = [...names.map((name) => ({ name, reason: componentPendingReason(root, name) })), ...pages.map((name) => ({ name, reason: pagePendingReason(root, name) }))].filter((entry) => entry.reason);
  if (pending.length) {
    process.stdout.write(JSON.stringify({ systemMessage: `The work is not finished. Ask the open Q&A questions with ask_user_question choices, summarize the plan in the chat (never ask the user to open the plan file), ask for approval with a choice, and stop. Do not retry automatic fixes. ${pending.map((entry) => `${entry.name}: ${entry.reason}`).join(" / ")}` }));
    process.exit(0);
  }
  if (!names.length && !pages.length) process.exit(0);
  const reports = [];
  let incomplete = false;
  for (const path of [...names.filter((name) => existsSync(join(root, `src/components/${name}/${name}.tsx`))).map((name) => `src/components/${name}/${name}.tsx`), ...pages.map((name) => pageEntry(name))]) {
    const result = budgetRun(process.execPath, [fileURLToPath(import.meta.url), "inspect"], {
      cwd: root, encoding: "utf8", env: { ...process.env, DS_ROOT: root }, input: JSON.stringify({ tool_input: { file_path: path } }),
    }, deadline);
    if (result.status === 2) reports.push(result.stderr.trim());
    incomplete ||= result.incomplete || ![0, 2].includes(result.status);
    if (incomplete) break;
  }
  const shared = sharedChecks(root, names, pages, deadline);
  reports.push(...shared.problems);
  if (incomplete || shared.incomplete) {
    process.stdout.write(JSON.stringify({ systemMessage: [incompleteMessage(names, pages), ...reports].join("\n") }));
    process.exit(0);
  }
  if (!reports.length) process.exit(0);
  // 같은 세션에서 최대 3번까지만 되돌린다. 그 뒤에는 사용자에게 남은 문제를 알리고 끝낸다.
  const counterFile = join(cacheDir, `stop-${sessionId}.json`);
  let count = 0;
  try {
    count = JSON.parse(readFileSync(counterFile, "utf8")).count || 0;
  } catch {}
  if (!mayBlock) {
    process.stdout.write(JSON.stringify({ systemMessage: ["Some automatic checks still show problems. The AI stopped as the kit asked, so they were not sent back to it:", ...reports].join("\n") }));
    process.exit(0);
  }
  if (count >= 3) {
    process.stdout.write(JSON.stringify({ systemMessage: "Some problems from the automatic checks are still not fixed. Ask the AI in your own words to run the checks again (it runs pnpm ds:guard), and look at the screen." }));
    process.exit(0);
  }
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(counterFile, JSON.stringify({ count: count + 1 }));
  } catch {}
  process.stderr.write(["[Finish check] Not done yet. Fix every problem below before you finish.", ...reports].join("\n") + "\n");
  process.exit(2);
}

// 질문 도구의 답: 학생이 고른 "Approve revision N" 을 기록한다(Q-72). 아무것도 막거나 덧붙이지 않는다.
if (mode === "answer") {
  try { recordApprovals(root, cacheDir, chosenRevisions(input.tool_response), { source: String(input.tool_name || "answer"), session: String(input.session_id || "") }); } catch {}
  process.exit(0);
}

// 셸 명령: 저장된 Vercel 토큰과 환경 변수는 AI 가 보지 않는다. 배포 자체는 node scripts/deploy.mjs 가 토큰을 다룬다.
if (mode === "pre" && typeof input.tool_input?.command === "string" && !input.tool_input.file_path) {
  const reason = shellCommandProblem(input.tool_input.command);
  if (reason) fail([`Blocked: ${reason}`]);
  process.exit(0);
}

const target = mode === "check" && process.argv[3]
  ? `src/components/${process.argv[3]}/${process.argv[3]}.tsx`
  : input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (!target) process.exit(0);
// Qwen 훅 승인 기록(~/.qwen/hookApprovals.json)은 AI 가 쓰지 않는다(Q-67). 프로젝트 밖 파일이라 아래 검사보다 먼저 본다.
if (mode === "pre" && /(?:^|[\\/])hookApprovals\.json$/i.test(String(target))) {
  fail(["Blocked: only the student turns on the kit's checks, by running the install command again. The AI never approves its own hooks."]);
}
const rel = relative(root, resolve(root, target)).split("\\").join("/");
if (rel.startsWith("..")) process.exit(0);

/** 스타터 프로젝트의 최상위 폴더. 이 밖의 새 최상위 폴더는 AI 가 만들지 못한다. */
const KNOWN_TOP_DIRS = new Set(["src", "my-website", "my-docs", "my-assets", "docs", "scripts", "prompts", "public", ".storybook", ".ds", ".claude", ".qwen", ".vscode"]);

function pageFileName(path) {
  return path.startsWith(`${PAGES_DIR}/`) ? path.slice(PAGES_DIR.length + 1).match(/^([A-Z][A-Za-z0-9]*)Page\.(?:tsx|css)$/)?.[1] : undefined;
}

/** 막아야 할 셸 명령이면 한 줄 이유, 아니면 null. */
function shellCommandProblem(command) {
  const text = String(command);
  if (/\.ds-starter|vercel-token/i.test(text)) {
    return "the saved Vercel token stays private. Do not open, read, copy or delete it with a shell command. To delete it, run node scripts/deploy.mjs forget-token.";
  }
  if (/\.qwen[\\/]+\.env\b|(?:~|\$HOME|\$\{HOME\}|%USERPROFILE%|\$env:USERPROFILE|[A-Za-z]:[\\/]Users[\\/][^\\/]+|\/Users\/[^/]+|\/home\/[^/]+)[\\/]+\.qwen[\\/]+(?:settings\.json|oauth_creds\.json)\b|(?:BAILIAN_TOKEN_PLAN_API_KEY|DASHSCOPE_API_KEY|OPENAI_API_KEY|QWEN_API_KEY)|sk-sp-/i.test(text)) {
    return "the student's API key stays private. Do not open, read, copy, print or save it. The student connects it with /auth.";
  }
  if (/qwen-hooks-approve|hookApprovals|QWEN_CODE_HOOK_APPROVALS_PATH/i.test(text)) {
    return "only the student turns on the kit's checks, by running the install command again. The AI never approves its own hooks.";
  }
  // 계획 승인은 학생이 고른 뒤 파일 편집 도구로 status 한 줄만 바꾼다. 셸로 바꾸면 pre 의 승인 검사를 건너뛴다(Q-72).
  if (/docs[\\/]+plans[\\/]/i.test(text) && /\bapproved\b/i.test(text)
    && /\bsed\b[^\n|;&]*\s-[a-zA-Z]*i|\bperl\b[^\n|;&]*\s-[a-zA-Z]*i|>|\btee\b|writeFile|write_text|\.write\(|Set-Content|Out-File|\bmv\b|\bcp\b/i.test(text)) {
    return "a plan's status changes only with the file edit tool, and only after the student chooses \"Approve revision N\". Never approve a plan with a shell command.";
  }
  if (/VERCEL_TOKEN/i.test(text)) return "do not read or set VERCEL_TOKEN. node scripts/deploy.mjs finds the token itself.";
  if (/(?:^|\s)--token(?:[=\s]|$)/.test(text)) return "never put a token on the command line. node scripts/deploy.mjs finds the token itself.";
  const parts = text.split(/\r?\n|&&|\|\||[;|&]/).map((part) => part.trim().replace(/^[({\s]+|[)}\s]+$/g, ""));
  if (parts.some((part) => /^(?:env|printenv|set|export\s+-p|declare\s+-x|typeset\s+-x)$/i.test(part))
    || /\b(?:get-childitem|gci|dir|ls|get-item|gi)\s+env:/i.test(text)) {
    return "do not print all environment variables. They can hold secrets such as tokens.";
  }
  return null;
}

/** Claude Code 의 쓰기 도구. 키트 유지보수자가 쓰므로 키트 파일 차단에서 뺀다. Qwen 은 write_file·edit 이다. */
const MAINTAINER_TOOLS = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
const KIT_FILE_MESSAGE = "This is a kit file. If a kit command fails with an error you cannot fix by following its message, stop and tell the student to show the error to the instructor.";
/** AI 가 고치지 않는 키트 파일(Q-65 결정 9). */
const KIT_FILE_PATTERNS = [
  /^scripts\//, /^QWEN\.md$/, /^AGENTS\.md$/, /^CLAUDE\.md$/, /^\.qwen\//, /^docs\/ai\//, /^docs\/templates\//,
  /^ds\.config\.json$/, /^figma\.config\.json$/, /^package\.json$/, /^pnpm-lock\.yaml$/, /^setup-local\.[^/]+$/, /^deploy\.[^/]+$/,
];
/** Qwen 자체 임시 폴더(질문 카드의 side task 등이 쓴다, Q-70 결정 10). 키트 파일이 아니다. */
const QWEN_TEMP = /^\.qwen\/tmp\//;
const isKitFile = (path) => !QWEN_TEMP.test(path) && KIT_FILE_PATTERNS.some((pattern) => pattern.test(path));

const PLAN_APPROVAL_HINT = "Ask the student to approve with the choice, then change only the status line.";

function planHeader(text) {
  const header = String(text ?? "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (header === undefined) return null;
  const field = (key) => header.match(new RegExp(`^${key}:[ \\t]*(.*?)[ \\t]*$`, "m"))?.[1]?.replace(/^(['"])(.*)\1$/, "$2");
  return { status: field("status"), revision: field("revision") };
}

/** Qwen edit/Claude Edit 의 바꾼 뒤 내용. 바꿀 글이 없으면 null(도구가 스스로 실패한다). */
function editedContent(before, toolInput) {
  if (typeof toolInput.content === "string") return toolInput.content;
  const oldText = toolInput.old_string, newText = toolInput.new_string;
  if (typeof oldText !== "string" || typeof newText !== "string") return null;
  if (oldText === "") return before === "" ? newText : null;
  if (!before.includes(oldText)) return null;
  const all = toolInput.replace_all === true || Number(toolInput.expected_replacements) > 1;
  return all ? before.split(oldText).join(newText) : before.replace(oldText, () => newText);
}

/** docs/plans/**.md 를 쓰는 도구가 스스로 승인하면 이유, 아니면 null (Q-65 결정 8). */
function planApprovalProblem(path, toolName, toolInput) {
  if (!/^docs\/plans\/.+\.md$/.test(path)) return null;
  const file = resolve(root, path);
  const exists = existsSync(file);
  const before = exists ? readFileSync(file, "utf8") : "";
  const after = editedContent(before, toolInput);
  if (after === null) return null;
  const next = planHeader(after);
  if (!exists) {
    return next?.status === "approved" ? "a new plan cannot start as approved. Write it with status: review-required (or draft), summarize it in the chat and ask for approval with a choice." : null;
  }
  if (after === before) return null;
  const previous = planHeader(before);
  if (previous?.status === "approved") {
    const bumped = /^\d+$/.test(next?.revision ?? "") && /^\d+$/.test(previous.revision ?? "") && Number(next.revision) > Number(previous.revision);
    if (next?.status === "approved" || !bumped) return "this plan is already approved. To change it, set status: review-required and raise revision by 1 in the same edit, then ask for approval again.";
    return null;
  }
  if (next?.status !== "approved") return null;
  // 승인으로 바꾸는 편집은 status 한 줄만 바꿀 때만 허용한다.
  const a = before.split(/\r?\n/), b = after.split(/\r?\n/);
  const changed = a.length === b.length ? a.map((line, index) => line === b[index] ? -1 : index).filter((index) => index >= 0) : null;
  if (!changed || changed.length !== 1 || !/^status:/.test(b[changed[0]])) return "approving a plan may change only the status: line. Make other changes first, show them in the chat, and approve in a separate edit.";
  // 구현 전 검사와 같은 준비 검사를 승인 전에 한다(Q-69 D). 승인된 뒤에야 막혀 다시 승인받는 일을 없앤다.
  if (/^docs\/plans\/components\/[^/]+\.md$/.test(path)) {
    const problems = componentPlanApprovalProblems(root, file, after);
    // Figma 디자인을 못 읽었거나 아직 읽는 중이면 계획을 고칠 일이 아니다: 학생에게 말하고 멈춘다(Q-69 E). 다른 항목과 섞지 않는다.
    const design = problems.find(isFigmaStop);
    if (design) return `this plan is not ready to approve. ${design} ${NOT_READY_TAIL}`;
    if (problems.length) return `this plan is not ready to approve. ${problems.map((problem, index) => `(${index + 1}) ${problem}`).join(" ")} Fix only what is true: answer open items by asking the student with choices, and never mark a fact as confirmed without reading it. ${NOT_READY_TAIL}`;
  }
  // 학생이 지금 내용 그대로의 이 revision 을 골랐는지 본다(Q-72). auto 모드에서도 선택은 학생이 한다.
  if (!studentApproved(cacheDir, path, next.revision, before)) return notChosenSentence(next.revision);
  return null;
}
const NOT_READY_TAIL = "Do not ask the student to approve until this passes.";

/** 계획 저장 뒤 준비 맥락(Q-70 결정 4). Figma 디자인을 못 읽었으면 그 멈춤 문장만 준다. */
function planReadinessContext(problems, revision) {
  const design = problems.find(isFigmaStop);
  if (design) return `Not ready to approve yet: ${design}`;
  if (problems.length) return `Not ready to approve yet: ${problems.map((problem, index) => `(${index + 1}) ${problem}`).join(" ")} Fix these by asking the student; never mark an AI interpretation as confirmed yourself. Do not ask for approval until this says ready.`;
  return `Ready: summarize in the chat and ask 'Approve revision ${/^\d+$/.test(String(revision ?? "")) ? revision : "N"}'.`;
}

/** pre: 잠긴 부품·페이지·계획이면 멈춤 문장, 계획 revision 을 한 메시지 사이에 2번 넘게 올리면 revision 문장. */
function loopLockProblem(path, hookInput) {
  const session = String(hookInput.session_id || "").replace(/[^\w-]/g, "");
  if (!session) return null;
  const component = path.match(/^src\/components\/([^/]+)\//)?.[1];
  const page = pageFileName(path);
  const keys = [];
  if (component) keys.push(`component:${component}`);
  if (page) keys.push(`page:${page}`);
  let plan = null;
  if (/^docs\/plans\/components\/.+\.md$/.test(path)) {
    const file = resolve(root, path);
    const before = existsSync(file) ? readFileSync(file, "utf8") : "";
    const after = editedContent(before, hookInput.tool_input || {}) ?? before;
    const names = [...new Set([...planComponentNames(before), ...planComponentNames(after)])];
    keys.push(...names.map((name) => `component:${name}`));
    plan = { before: planHeader(before)?.revision, after: planHeader(after)?.revision, names };
  }
  for (const key of keys) {
    const kind = lockedKind(cacheDir, session, key);
    if (kind) return lockSentence(kind);
  }
  if (plan && planRevisionExceeded(cacheDir, session, path, plan.before, plan.after, plan.names)) return lockSentence("plan-revision");
  return null;
}

function fail(lines) {
  process.stderr.write(lines.join("\n") + "\n");
  process.exit(2);
}

/** Qwen Code 의 훅인가. 0.27.1 의 훅 실행기는 환경에 QWEN_PROJECT_DIR 을 넣는다(Claude Code 는 넣지 않는다). */
const IN_QWEN = Boolean(process.env.QWEN_PROJECT_DIR);
/** Qwen 0.27.1 은 additionalContext 의 < > 를 &lt; &gt; 로 바꾼다. 꺾쇠는 ‹ › 로 적는다. */
const qwenText = (text) => String(text).replace(/</g, "‹").replace(/>/g, "›");
/**
 * post(저장 뒤 검사)의 결과를 AI 에게 돌려준다(Q-69 F).
 * Claude Code: 실패는 stderr + exit 2(지금 그대로). Qwen: exit 0 + stdout JSON — ACP 는 additionalContext 만 도구 응답에 붙인다.
 */
function postFail(lines) {
  if (mode !== "post" || !IN_QWEN) fail(lines);
  const body = lines.join("\n");
  process.stdout.write(JSON.stringify({ decision: "block", reason: body, hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: qwenText(body) } }));
  process.exit(0);
}
/** post 의 실패가 아닌 알림(검사가 시간 안에 못 끝남 등). Qwen ACP 는 systemMessage 를 AI 에게 주지 않으므로 additionalContext 로도 붙인다. */
function postNotice(text) {
  const out = { systemMessage: text };
  if (mode === "post" && IN_QWEN) out.hookSpecificOutput = { hookEventName: "PostToolUse", additionalContext: qwenText(text) };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
/** 문제는 없고 AI 에게 한 줄만 알릴 때(다른 부품의 오류). Claude Code·Qwen 모두 additionalContext 를 도구 결과에 붙인다. */
function postContext(text) {
  if (mode === "post") process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: IN_QWEN ? qwenText(text) : text } }));
  else if (mode === "check") process.stderr.write(text + "\n");
  process.exit(0);
}

if (mode === "pre") {
  // 색·역할·글자가 들어오는 키트의 길. 생성물을 막을 때 AI 가 바로 실행할 명령을 알려 준다(Q-65 결정 7).
  const colorPath = `Colors come in with \`pnpm ds:figma "<link>"\`; roles are set by \`docs/plans/tokens.md\` + \`pnpm ds:apply-token-plan\` after the student approves; text by the typography plan. ${RUN_IT_YOURSELF}`;
  const generated = [
    [/^scripts\/starter-catalog-baseline\.json$/, "The starter catalog baseline is release data. Only a maintainer updates it with `pnpm ds:starter-baseline` in an interactive terminal."],
    [/^src\/tokens\//, `Token CSS is generated by \`pnpm ds:tokens\`. ${colorPath}`],
    [/^src\/docs\//, "Storybook docs are generated by `pnpm ds:docs`."],
    [/^\.ds\/semantic\.json$/, `.ds/semantic.json is written by \`pnpm ds:apply-token-plan\` after approval. ${colorPath}`],
    [/^\.ds\//, `.ds/ is pipeline data. ${colorPath}`],
    [/^\.claude\/rules\//, ".claude/rules is generated by `pnpm ds:docs`."],
    [/^my-assets\//, "my-assets/ holds the student's icons, pictures and font files. AI may only read it — `pnpm assets` sorts them; if a file is missing, ask the student to add it."],
    [/^my-docs\/inbox\//, "my-docs/inbox/ holds the student's original documents. AI may only read it — write the results to my-docs/specs/."],
  ];
  const hit = generated.find(([pattern]) => pattern.test(rel));
  if (hit) {
    fail([
      `Blocked: do not edit ${rel}. ${hit[1]}`,
      "If a color or spacing you need has no exact mapping, do not swap in an approximate token. Write the open items and the inputs you need in the plan and resolve them through Q&A. If the approved plan conflicts with the current ownership rules, report BLOCKED_POLICY.",
    ]);
  }
  // 키트 파일은 학생의 AI 가 고치지 않는다(결정 9). Claude Code(유지보수자)의 Write/Edit 는 막지 않는다.
  if (isKitFile(rel) && !MAINTAINER_TOOLS.has(String(input.tool_name || ""))) {
    fail([`Blocked: do not edit ${rel}. ${KIT_FILE_MESSAGE}`]);
  }
  // 반복 실패로 멈춘 부품(페이지)의 파일·계획은 다음 학생 메시지까지 고치지 않는다(Q-66 결정 3·4).
  const loopProblem = loopLockProblem(rel, input);
  if (loopProblem) fail([`Blocked: ${rel} — ${loopProblem}`]);
  // 계획 파일의 스스로 승인을 막는다(결정 8).
  const planProblem = planApprovalProblem(rel, input.tool_name, input.tool_input || {});
  if (planProblem) fail([`Blocked: ${rel} — ${planProblem}`, ...(planProblem.endsWith(NOT_READY_TAIL) ? [] : [PLAN_APPROVAL_HINT])]);
  // 웹사이트를 새 폴더·새 앱으로 따로 만들지 않는다. 학생 폴더 구조(my-docs·my-assets·my-website)를 지킨다.
  if (!existsSync(resolve(root, rel))) {
    const top = rel.split("/")[0];
    if (rel.includes("/") && !KNOWN_TOP_DIRS.has(top) && !existsSync(resolve(root, top))) {
      fail([
        `Blocked: ${rel} — do not create the new top-level folder ${top}/.`,
        `The website lives in ${PAGES_DIR}/ (made by \`pnpm ds:page\` from an approved page plan). Student documents are in my-docs/, icons and fonts in my-assets/, parts in src/components/.`,
      ]);
    }
    if (rel.includes("/") && /(?:^|\/)(?:package\.json|vite\.config\.[cm]?[jt]s|index\.html|tsconfig[^/]*\.json)$/.test(rel)) {
      fail([
        `Blocked: ${rel} — do not scaffold a second app inside the project.`,
        `This project already is the React app. Build pages in ${PAGES_DIR}/ with \`pnpm ds:page\`.`,
      ]);
    }
  }
  const component = rel.match(/^src\/components\/([^/]+)\//)?.[1];
  const pending = component && componentPendingReason(root, component, rel);
  // 디자인을 못 읽은 계획: 멈춤 문장만 준다(계획을 다시 쓰라는 안내와 섞지 않는다, Q-69 E②).
  if (isFigmaStop(pending)) fail([`Blocked: ${rel} — ${pending.slice(pending.indexOf("The Figma design of"))}`]);
  if (pending) fail([`Blocked: ${rel} cannot be changed without an approved plan.`, pending, "Write the plan with docs/templates/component-plan.md first and record the user's decisions and Q&A. One plan may cover several parts with components: [Name, Other].", RUN_IT_YOURSELF]);
  if (/^docs\/plans\/starter-fixes\//.test(rel)) fail(["Blocked: AI does not edit instructor approval records. The instructor runs approve-starter-fix.mjs by hand in an interactive terminal."]);
  if (rel.startsWith(`${PAGES_DIR}/`)) {
    const page = pageFileName(rel);
    const reason = page ? pagePendingReason(root, page) : "Only <Name>Page.tsx/.css from an approved plan are supported. Do not create helper UI files outside the page.";
    if (reason) fail([`Blocked: ${rel} cannot be changed without an approved page plan.`, reason, "Write the site plan and Q&A with docs/templates/page-plan.md and get the user's approval.", RUN_IT_YOURSELF]);
  }
  const content = input.tool_input?.content ?? input.tool_input?.new_string ?? input.tool_input?.new_source ?? "";
  if (/@ds-generated/.test(content) && !existsSync(resolve(root, rel))) {
    fail([
      "Blocked: do not write the `@ds-generated` mark in a new file. Only files made by the generator carry it.",
      "Remove that comment block and write the file again.",
    ]);
  }
  process.exit(0);
}

if (!["post", "check", "inspect"].includes(mode)) process.exit(0);
/** 기록할 세션: 훅 입력의 session_id, 셸에서 실행한 ai:check 는 마지막 학생 메시지의 세션. inspect(Stop 재검사)는 세지 않는다. */
function checkSession() {
  return String(input.session_id || process.env.DS_SESSION_ID || (mode === "check" ? currentSession(cacheDir) : "")).replace(/[^\w-]/g, "");
}
// 부품 계획을 저장할 때마다 준비 검사 결과를 AI 에게 준다(Q-70 결정 4). 승인을 묻기 전에 무엇이 남았는지 알게 한다. 세지 않고 잠그지 않는다.
if (mode === "post" && /^docs\/plans\/components\/[^/]+\.md$/.test(rel)) {
  const file = resolve(root, rel);
  const text = existsSync(file) ? readFileSync(file, "utf8") : "";
  const header = planHeader(text);
  recordSessionPart(cacheDir, input.session_id, { parts: planComponentNames(text), nodes: [figmaNodeId(text.match(/^source_url:\s*(.+)$/m)?.[1] ?? "")] });
  if (!text) process.exit(0);
  postContext(planReadinessContext(componentPlanApprovalProblems(root, file, text), header?.revision));
}
const pageName = pageFileName(rel);
if (pageName) {
  const session = String(input.session_id || "").replace(/[^\w-]/g, "");
  if (session) {
    const path = join(cacheDir, `edited-pages-${session}.json`);
    let edited = []; try { edited = JSON.parse(readFileSync(path, "utf8")); } catch {}
    mkdirSync(cacheDir, { recursive: true }); writeFileSync(path, JSON.stringify([...new Set([...edited, pageName])]));
  }
  const pageProblems = [];
  try { const { checkPage } = await import("./lib/page-flow.mjs"); await checkPage(root, pageName, { typecheck: false }); }
  catch (error) { pageProblems.push(`- [Page auto check] ${pageName}: ${error.message}`); }
  if (mode !== "inspect" && !pageProblems.length) {
    const shared = sharedChecks(root, [], [pageName], deadline);
    if (shared.incomplete) postNotice(incompleteMessage([], [pageName]));
    pageProblems.push(...shared.problems);
  }
  const stopped = mode === "inspect" ? null : recordCheck(cacheDir, checkSession(), `page:${pageName}`, pageProblems, "page-check", mode === "post" ? rel : undefined);
  if (pageProblems.length) postFail([...pageProblems.map((line) => line.replace(/^- \[Page auto check\]/, "[Page auto check]")), ...(stopped ? [lockSentence(stopped)] : [])]);
  process.exit(0);
}
const match = rel.match(/^src\/components\/([^/]+)\//);
if (!match || !/\.(tsx?|css)$/.test(rel)) process.exit(0);

const name = match[1];
const dir = join(root, "src", "components", name);
const cssLength = (px) => Number(px) === 2 ? "var(--border-width-thick)" : Number(px) === 1 ? "var(--border-width-thin)" : Number(px) < 2 ? `${Number(px)}px` : `calc(var(--spacing) * ${Number(px) / 4})`;
const sessionId = String(input.session_id || "").replace(/[^\w-]/g, "");
if (sessionId) {
  const editedFile = join(cacheDir, `edited-${sessionId}.json`);
  let edited = [];
  try { edited = JSON.parse(readFileSync(editedFile, "utf8")); } catch {}
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(editedFile, JSON.stringify([...new Set([...edited, name])]));
  } catch {}
  // 이 대화가 다룬 부품(Q-70 결정 6). 계획이 있으면 그 Figma 노드도 같은 부품으로 기록한다.
  if (mode === "post") {
    let node = null;
    try { node = figmaNodeId(currentComponentPlan(root, name)?.metadata?.source_url ?? ""); } catch {}
    recordSessionPart(cacheDir, sessionId, { parts: [name], nodes: [node] });
  }
}
const read = (file) => (existsSync(join(dir, file)) ? readFileSync(join(dir, file), "utf8") : "");
const tsx = read(`${name}.tsx`);
const css = readdirSync(dir).filter((file) => file.endsWith(".css")).map((file) => read(file)).join("\n");
const kebab = name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const problems = [];
let figmaFacts = null;
try { figmaFacts = JSON.parse(readFileSync(join(cacheDir, "last.json"), "utf8")); } catch {}
let nestedParts = [];
let nestedContractApproved = false;
try {
  const latestPlan = currentComponentPlan(root, name);
  // 계획의 scope_nodes: 그 변형에서 나온 미리 읽기 사실만 검사한다(Q-66 결정 2). 없으면 모든 변형.
  const scope = latestPlan ? planScopeNodes(latestPlan.metadata) : null;
  if (scope && figmaFacts?.component === name) figmaFacts = scopeFigmaFacts(figmaFacts, scope);
  // During plan review the pre-write hook already blocks implementation edits. A
  // standalone ai:check should still run its ordinary checks and skip this contract.
  if (latestPlan?.metadata.status === "approved") {
    const plan = currentApprovedComponentPlan(root, name);
    if (plan) {
      nestedParts = nestedPartsFromPlan(plan, { validate: true });
      nestedContractApproved = true;
    }
  }
} catch (error) {
  problems.push(`- ${name}: could not validate the approved Nested parts contract. ${error.message}`);
}
problems.push(...componentQualityProblems({
  name, tsx, css, stories: read(`${name}.stories.tsx`),
  tokensCss: readFileSync(join(root, "src", "tokens", "tokens.css"), "utf8"),
  figma: figmaFacts, nestedParts,
  figmaNestedParts: nestedContractApproved && figmaFacts?.component === name ? figmaFacts.nestedParts || [] : [],
}));

// 1) Figma 의 State variant 를 prop 으로 옮기는 실수
const stateProp = tsx.match(/\bstate\??\s*:\s*([^;\n]+)/);
if (stateProp && /hover|click|press|active|focus/i.test(tsx.slice(0, 4000))) {
  problems.push(
    `- ${name}.tsx: the \`state\` prop picks hover, click or focus. A Figma State variant is not a prop. ` +
      "Remove the prop and handle it in CSS with :hover, :active, :focus-visible and :disabled (or the disabled attribute). Check stories by actually hovering or pressing."
  );
}

// 2) CSS 에 있는데 컴포넌트가 붙이지 않는 클래스
const tsxCode = tsx.replace(/data-testid=["'][^"']*["']/g, "");
if (tsx && css) {
  const builds = /--\$\{/.test(tsxCode);
  const unused = [...new Set([...css.matchAll(/\.(ds-[a-z0-9-]+)/g)].map((m) => m[1]))].filter(
    // ds-split-button__left 안의 "ds-split-button" 을 같은 클래스로 착각하지 않게 단어 단위로 찾는다.
    (cls) => !new RegExp(`(?<![\\w-])${cls}(?![\\w-])`).test(tsxCode) && !(builds && cls.includes("--"))
  );
  if (unused.length) {
    problems.push(
      `- ${name}: the component never applies the CSS classes ${listUpTo(unused.map((c) => `.${c}`))}. ` +
        "Make className match the CSS selector names (convention: ds-<name>, ds-<name>--<variant>)."
    );
  }
}

// 2-1) 이 프로젝트(css 스택)에는 Tailwind 가 없다. Figma 참고 코드의 유틸리티 클래스를 베끼면 아무 효과가 없다.
let styling = "css";
try {
  styling = JSON.parse(readFileSync(join(root, "ds.config.json"), "utf8")).stack?.styling || "css";
} catch {}
if (styling === "css") {
  const literals = [...tsxCode.matchAll(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g)].map((m) => (m[1] ?? m[2]).replace(/\$\{[^}]*\}/g, " "));
  const foreign = [...new Set(literals.flatMap((s) => s.split(/\s+/)).filter((t) => t && !t.startsWith("ds-")))];
  if (foreign.length) {
    problems.push(
      `- ${name}.tsx: className has classes that do nothing in this project: ${listUpTo(foreign, LIST_LIMIT, " ")}. Tailwind is not used. ` +
        `Use only ds-${kebab}, ds-${kebab}__part and ds-${kebab}--variant classes, and put layout, size and color in ${name}.css with tokens. The top element needs class "ds-${kebab}" for the CSS to apply.`
    );
  }
}

// 2-1b) className 을 넘기면 기본 클래스가 사라지는 실수
if (/className=\{\s*className\s*(\|\||\?\?)\s*["'`]ds-/.test(tsx)) {
  problems.push(`- ${name}.tsx: className={className || "ds-..."} drops the base class when a className is passed, which breaks the styles. Combine them like ["ds-${kebab}", className].filter(Boolean).join(" ").`);
}

// 2-2) Figma 색 대응표에 없는 색 토큰 (요청할 때 figma-context 가 저장해 둔 대응표와 비교)
const figmaCache = join(root, "node_modules", ".cache", "ds-figma", "last.json");
if (existsSync(figmaCache) && css) {
  try {
    const cache = JSON.parse(readFileSync(figmaCache, "utf8"));
    if (cache.component === name && cache.tokenMappingApproved === true && cache.tokens?.length) {
      const used = [...new Set([...css.matchAll(/var\((--color-[a-z0-9-]+)\)/g)].map((m) => m[1]))];
      const off = used.filter((token) => !cache.tokens.includes(token));
      if (cache.icons > 0 && tsx && !/<svg\b/.test(tsx)) {
        problems.push(`- ${name}.tsx: the Figma design has an icon, but the component has no <svg>. Build the icon into the component instead of passing it from the story (use the icon SVG attached to the request).`);
      }
      if (cache.groupFocus && !new RegExp(`\\.ds-${kebab}:(has\\(:focus-visible\\)|focus-within)`).test(css)) {
        const g = cache.groupFocus;
        problems.push(
          `- ${name}.css: in Figma, Focus surrounds the whole group, not one button. ` +
            `Use .ds-${kebab}:has(:focus-visible) { outline: ${cssLength(g.width)} solid var(${g.token}); outline-offset: ${cssLength(g.offset)}; } and set each button's :focus-visible outline to none.`
        );
      }
      if (off.length) {
        problems.push(
          `- ${name}.css: uses color tokens ${off.join(", ")} that are not in the Figma color map, so the color will differ from the design. ` +
            `Compare value and role with the approved plan's tokens (${cache.tokens.join(", ")}). If there is no exact mapping, do not substitute one; resolve it through Q&A.`
        );
      }
    }
  } catch {}
}

// 3) SVG 문자열을 <img src> 에 넣는 실수
if (/<img[\s\S]*?src=\{/.test(tsx) && /`\s*(<\?xml|<svg)/.test(tsx)) {
  problems.push(
    `- ${name}.tsx: putting an SVG code string in <img src> breaks the image. Write the <svg> directly as JSX and set its color with fill="currentColor".`
  );
}

// 3-1) <button> 안에는 글자·아이콘(span, svg)만 들어간다. 어느 요소인지 짚어 줘야 작은 모델이 고친다.
// 속성 안의 JSX·스스로 닫는 <button />·중첩 button 은 blockElementsInButtons 가 가린다.
const blockInButton = blockElementsInButtons(tsx).map((inner) => {
  const cls = inner.attributes.match(/className=["'{`]+([^"'}`]+)/)?.[1];
  return `<${inner.name}${cls ? ` className="${cls}"` : ""}>`;
});
if (blockInButton.length) {
  problems.push(
    `- ${name}.tsx: <button> contains ${[...new Set(blockInButton)].join(", ")}. Only <span> and <svg> go inside a <button> — change these elements to <span> (use display: inline-flex in CSS if needed). ` +
      "If they are separate click targets, split them into independent <button>s and wrap them in <div role=\"group\">."
  );
}

// 3-1b) 버튼이 둘 이상인데 묶음 전체의 :hover/:active 로 칠하면 양쪽이 같이 바뀐다
if ((tsx.match(/<button\b/g) || []).length >= 2) {
  const groupState = [...css.matchAll(new RegExp(`\\.ds-${kebab}:(hover|active)\\s*[> ]`, "g"))].map((m) => m[0].trim());
  if (groupState.length) {
    problems.push(
      `- ${name}.css: with ${[...new Set(groupState)].join(", ")} …, hovering anywhere on the group changes both buttons together. ` +
        `Put the state on each button instead — for example: .ds-${kebab}__left:hover:not(:disabled) { … }, .ds-${kebab}__right:active:not(:disabled) { … }`
    );
  }
}

// 3-2) CSS 를 만들었는데 컴포넌트가 불러오지 않으면 스타일이 하나도 적용되지 않는다
const cssFiles = readdirSync(dir).filter((file) => file.endsWith(".css") && !file.endsWith(".module.css"));
const missingImport = cssFiles.filter((file) => tsx && !new RegExp(`import\\s+["']\\./${file.replace(".", "\\.")}["']`).test(tsx));
if (missingImport.length) {
  problems.push(`- ${name}.tsx: ${missingImport.join(", ")} is not imported, so no styles apply. Add import "./${missingImport[0]}"; at the top of the file.`);
}

// 3-3) 새로 만든 CSS 의 px 리터럴 (테두리용 1·2px 은 허용)
const isNew = (file) => spawnSync("git", ["ls-files", "--error-unmatch", join(dir, file)], { cwd: root, timeout: Math.max(1, Math.min(2000, deadline - Date.now())), killSignal: "SIGKILL" }).status !== 0;
const pxHits = cssFiles.filter(isNew).flatMap((file) =>
  read(file).split("\n").flatMap((line, i) =>
    [...line.replace(/\/\*.*?\*\//g, "").matchAll(/(?<![\w.-])(\d+(?:\.\d+)?)px\b/g)]
      .filter((m) => Number(m[1]) > 2)
      .map((m) => `${file}:${i + 1} ${m[0]}`)
  )
);
if (pxHits.length) {
  problems.push(
    `- px literals ${listUpTo(pxHits)} → fix every one listed here in one edit. Write spacing and sizes as multiples of --spacing (4px). For example: 8px = calc(var(--spacing) * 2), 12px = calc(var(--spacing) * 3), 40px = calc(var(--spacing) * 10). Use tokens like --text-body-1 for font size, and the svg width/height attributes for icon size.`
  );
}

// 3-4) 스토리에서 disabled 를 쓰는데 컴포넌트가 <button> 에 넘기지 않는 실수
const stories = read(`${name}.stories.tsx`);
if (/disabled\s*:\s*true/.test(stories) && /<button\b/.test(tsx) && !/\bdisabled\b/.test(tsx)) {
  problems.push(`- ${name}.tsx: the story uses disabled, but the <button> has no disabled attribute. Take disabled from props and pass it to every <button disabled={disabled}>.`);
}

// 3-5) play 함수가 이름으로 찾는 요소가 실제로 있는지 (없으면 Storybook 이 컴포넌트 위에 오류 화면을 덮는다)
// 스토리마다 따로 본다. 다른 스토리의 args 에 있는 이름은 이 스토리에서는 렌더되지 않는다.
const missingNames = [];
for (const block of stories.split(/(?=export const \w+)/)) {
  const playAt = block.search(/\bplay\s*[:(]/);
  if (playAt < 0) continue;
  const before = block.slice(0, playAt);
  const body = block.slice(playAt);
  const names = [
    ...[...body.matchAll(/getBy(?:Role|AllByRole)\([^)]*?name:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
    ...[...body.matchAll(/getBy(?:Text|LabelText|Title)\(\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]),
  ];
  for (const label of names) if (!tsx.includes(label) && !before.includes(label) && !missingNames.includes(label)) missingNames.push(label);
}
if (missingNames.length) {
  problems.push(
    `- ${name}.stories.tsx: the play function looks for ${missingNames.map((n) => `"${n}"`).join(", ")}, which the component does not have. As is, Storybook shows an error screen. ` +
      `In the play function, check by testid like canvas.getByTestId("${tsx.match(/data-testid="(ds-[^"]+)"/)?.[1] || `ds-${name.toLowerCase()}`}"), or use exactly the same name as the component's aria-label.`
  );
}

// 4) play 함수가 찾는 testid (생성기 규약 ds-textinput, 하이픈 형식 ds-text-input 모두 인정)
const testIds = [`ds-${name.toLowerCase()}`, `ds-${kebab}`];
if (tsx && !testIds.some((id) => tsx.includes(`data-testid="${id}"`))) {
  problems.push(`- ${name}.tsx: the top element needs data-testid="${testIds[0]}".`);
}

// Stop은 각 부품의 로컬 검사 뒤 공통 가드·타입 검사를 한 번만 실행한다.
let othersNote = null;
if (mode !== "inspect") {
  const shared = sharedChecks(root, [name], [], deadline);
  problems.push(...shared.problems);
  if (shared.incomplete) postNotice([incompleteMessage([name]), ...problems].join("\n"));
  // 다른 부품의 가드·타입 오류는 이 부품 문제가 아니다. 세지 않고, 학생 메시지 한 번 사이에 한 줄만 알린다(Q-69 C①).
  if (shared.others && noteOnce(cacheDir, checkSession(), OTHER_PARTS_NOTE)) othersNote = OTHER_PARTS_NOTE;
}

// post 는 저장한 파일(rel)을 넘긴다: 그 파일을 다시 저장한 검사끼리만 센다(Q-69 C②). 셸의 ai:check 는 부품 단위로 매번 센다.
const stopped = mode === "inspect" ? null : recordCheck(cacheDir, checkSession(), `component:${name}`, problems, undefined, mode === "post" ? rel : undefined);
if (problems.length) {
  // 멈췄으면 "고쳐서 다시 저장하라"는 머리말을 쓰지 않는다(같은 실패로 돌지 않게).
  const header = stopped ? `[Auto check] Found problems in ${name} after saving ${basename(rel)}.` : `[Auto check] Found problems in ${name} after saving ${basename(rel)}. Fix the items below and save again.`;
  postFail([header, ...problems, ...(othersNote ? [othersNote] : []), ...(stopped ? [lockSentence(stopped)] : [])]);
}
if (othersNote) postContext(othersNote);

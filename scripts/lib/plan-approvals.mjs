/**
 * 학생이 실제로 고른 계획 승인 기록 (Q-72). 의존성 0.
 *
 * AI 가 계획의 `status:` 를 approved 로 바꾸려면, 그 계획이 지금 내용 그대로일 때 학생이
 * "Approve revision N" 을 고른(ask_user_question 답) 기록이나 직접 써 보낸(학생 메시지) 기록이 있어야 한다.
 * 승인 모드(default·auto 등)와 상관없다 — auto 는 도구 실행만 자동으로 하고, 선택은 학생이 한다.
 *
 * 기록할 때 승인 대기 중(approved 가 아님)이고 revision 이 N 인 계획들의 내용 해시를 함께 남긴다.
 * 그 뒤 계획 내용이 한 글자라도 바뀌면 해시가 달라져서 다시 물어야 한다(Card 시험: 역할 질문의 답을 승인으로 보고
 * Q&A 를 적은 뒤 revision 2 를 스스로 approved 로 바꾼 일).
 * 기록은 node_modules/.cache/ds-figma/plan-approvals.json 에 최근 KEEP 개만 둔다.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const FILE = "plan-approvals.json";
const KEEP = 50;
const PLANS_DIR = "docs/plans";
/** 강사 승인 기록 폴더. 학생 승인과 상관없다. */
const SKIP_DIRS = new Set(["starter-fixes"]);

const normal = (text) => String(text ?? "").replace(/\r\n/g, "\n");
export const planContentHash = (text) => createHash("sha256").update(normal(text)).digest("hex");

/** 계획 머리말의 status·revision. 머리말이 없으면 null. */
export function planStatus(text) {
  const header = normal(text).match(/^---\n([\s\S]*?)\n---(?:\n|$)/)?.[1];
  if (header === undefined) return null;
  const field = (key) => header.match(new RegExp(`^${key}:[ \\t]*(.*?)[ \\t]*$`, "m"))?.[1]?.replace(/^(['"])(.*)\1$/, "$2");
  return { status: field("status"), revision: field("revision") };
}

/** 답 하나가 "Approve revision N" 선택이면 N, 아니면 null. 선택지 이름 뒤 "(…)" 같은 꼬리는 허용한다. */
function approvalRevision(answer) {
  const match = String(answer ?? "").trim().replace(/^["'`*]+/, "").match(/^approve\s+revision\s+(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

/**
 * ask_user_question(Qwen)·AskUserQuestion(Claude Code) 결과에서 학생이 고르거나 쓴 답만 꺼낸다.
 * 질문 문장·선택지 목록은 읽지 않는다 — "Approve revision 1?" 이라는 질문을 승인으로 오해하지 않게.
 * - Qwen VS Code(daemon): "User provided the following answers:  <질문>\nSelected <id>: <label>\nCustom answer: <글>"
 * - Qwen 터미널: "User has provided the following answers:\n\n**<머리말>**: <답>"
 * - Claude Code: { answers: { "<질문>": "<답>" } }
 */
export function answerTexts(toolResponse) {
  if (toolResponse && typeof toolResponse === "object" && !Array.isArray(toolResponse) && toolResponse.answers && typeof toolResponse.answers === "object") {
    return Object.values(toolResponse.answers).flatMap((value) => Array.isArray(value) ? value : [value]).map(String);
  }
  const content = toolResponse && typeof toolResponse === "object" && !Array.isArray(toolResponse)
    ? toolResponse.llmContent ?? toolResponse.output ?? toolResponse.content ?? ""
    : toolResponse;
  const text = Array.isArray(content) ? content.map((part) => typeof part === "string" ? part : part?.text ?? "").join("\n") : String(content ?? "");
  const answers = [];
  for (const line of normal(text).split("\n")) {
    const answer = line.match(/^\s*Selected\s+[^:\n]*:\s*(.+)$/)?.[1]
      ?? line.match(/^\s*Custom answer:\s*(.+)$/)?.[1]
      ?? line.match(/^\s*(?:[-*]\s+)?\*\*[^*\n]+\*\*:\s*(.+)$/)?.[1];
    if (answer !== undefined) answers.push(answer.trim());
  }
  return answers;
}

/** 질문 도구 결과에서 학생이 고른 승인 revision 번호들. */
export const chosenRevisions = (toolResponse) => [...new Set(answerTexts(toolResponse).map(approvalRevision).filter((n) => n !== null))];

/** 학생 메시지에서 직접 쓴 승인 revision 번호들. 줄 맨 앞의 "Approve revision N" 이나 "revision N 승인" 만 센다. */
export function typedRevisions(prompt) {
  const text = normal(prompt);
  const english = [...text.matchAll(/^\s*approve\s+revision\s+(\d+)\b/gim)].map((match) => Number(match[1]));
  const korean = [...text.matchAll(/^\s*(?:revision|리비전)\s*(\d+)\s*(?:을|를)?\s*승인/gim)].map((match) => Number(match[1]));
  return [...new Set([...english, ...korean])];
}

/** docs/plans/ 아래 계획 Markdown 파일(프로젝트 기준 경로). */
function planFiles(root) {
  const base = join(root, PLANS_DIR);
  if (!existsSync(base)) return [];
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(relative(root, join(dir, entry.name)).split("\\").join("/"));
      }
    }
  };
  walk(base);
  return files;
}

function readState(cacheDir) {
  try {
    const state = JSON.parse(readFileSync(join(cacheDir, FILE), "utf8"));
    if (Array.isArray(state.entries)) return state;
  } catch {}
  return { entries: [] };
}

/**
 * 학생의 승인 선택을 기록한다. 승인 대기 중이고 revision 이 고른 번호와 같은 계획마다 지금 내용의 해시를 남긴다.
 * 기록한 계획 경로 목록을 돌려준다(없으면 빈 배열).
 */
export function recordApprovals(root, cacheDir, revisions, { source = "", session = "" } = {}) {
  if (!revisions.length) return [];
  const plans = {};
  for (const rel of planFiles(root)) {
    let text;
    try { text = readFileSync(join(root, rel), "utf8"); } catch { continue; }
    const header = planStatus(text);
    if (!header || header.status === "approved" || !/^\d+$/.test(header.revision ?? "")) continue;
    const revision = Number(header.revision);
    if (revisions.includes(revision)) plans[rel] = { revision, hash: planContentHash(text) };
  }
  if (!Object.keys(plans).length) return [];
  const state = readState(cacheDir);
  state.entries = [...state.entries, { at: new Date().toISOString(), source, session, plans }].slice(-KEEP);
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(join(cacheDir, FILE), JSON.stringify(state, null, 2));
  } catch {
    return [];
  }
  return Object.keys(plans);
}

/** 이 계획이 지금 내용(before) 그대로일 때 학생이 이 revision 을 승인했으면 true. */
export function studentApproved(cacheDir, rel, revision, before) {
  if (!/^\d+$/.test(String(revision ?? ""))) return false;
  const hash = planContentHash(before);
  return readState(cacheDir).entries.some((entry) => entry.plans?.[rel]?.revision === Number(revision) && entry.plans[rel].hash === hash);
}

/** 승인 기록이 없을 때 AI 에게 줄 문장. */
export const notChosenSentence = (revision) => {
  const n = /^\d+$/.test(String(revision ?? "")) ? revision : "N";
  return `the student has not chosen "Approve revision ${n}" for this plan as it is now. Approval modes (default or auto) only decide whether tools run without asking; every choice still belongs to the student. Summarize the plan in the chat and ask with ask_user_question: "Approve revision ${n}" / "Change something". Change the status line only after the student picks "Approve revision ${n}". If the plan changed after the student chose, ask again. Never approve for the student.`;
};

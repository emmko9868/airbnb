/**
 * my-docs Spec Kit 검사의 순수 함수. AI 를 부르지 않는다.
 *
 * - inbox: 학생이 넣은 원본. 지문(sha256 앞 12자리)으로 지난 정리 뒤 새로 들어오거나 바뀐 파일을 찾는다.
 * - specs: /my-docs 가 쓰는 결과. 필수 섹션과 남은 [NEEDS CLARIFICATION] 을 센다.
 */
import { createHash } from "node:crypto";

/** 결과 파일과 필수 섹션(## 또는 ### 제목의 앞부분, 대소문자 무시). 템플릿: docs/templates/spec-kit/ */
export const SPEC_FILES = {
  "constitution.md": ["Project", "Audience", "Principles", "Voice and tone", "Look and feel", "Out of scope"],
  "spec.md": ["User stories", "Edge cases", "Functional requirements", "Key entities", "Success criteria", "Clarifications"],
  "plan.md": ["Design system", "Brand", "Token intent", "Parts", "Website", "Pages", "Sections and copy"],
  "tasks.md": ["Before you start", "Design system", "Website"],
};

/** 섹션 말고도 있어야 하는 내용. [이유, 정규식] */
const SPEC_CONTENT = {
  "spec.md": [
    ["a P1 user story", /\(Priority:\s*P1\)/i],
    ["an acceptance scenario (Given … When … Then …)", /\bGiven\b[^\n]*\bwhen\b[^\n]*\bthen\b/i],
    ["a functional requirement (FR-001)", /\bFR-\d{3}\b/],
    // 문서에 목표가 없으면 템플릿대로 질문 한 줄만 둔다. 그 질문은 열린 질문으로 세므로 빠진 것으로 보지 않는다.
    ["a success criterion (SC-001)", /\bSC-\d{3}\b|^#{2,3}\s+Success criteria[^\n]*\n(?:[ \t]*\n)*[ \t]*-\s*\[NEEDS CLARIFICATION/im],
  ],
  "tasks.md": [["a task checkbox (- [ ] …)", /^\s*- \[[ x]\] /im]],
};

/** 정리 기록 파일. pnpm specs --record 만 쓴다. */
export const SOURCES_FILE = "sources.md";

/** inbox 에서 원본으로 보지 않는 파일. */
export const IGNORED_FILES = new Set(["README.md", ".DS_Store", "Thumbs.db", "desktop.ini", ".gitkeep"]);

const TEXT = new Set([".md", ".markdown", ".txt", ".csv", ".tsv", ".json", ".yaml", ".yml", ".html", ".htm", ".svg"]);
const IMAGE = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"]);
const UNREADABLE = new Set([".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".hwp", ".hwpx", ".key", ".pages", ".numbers", ".zip", ".fig"]);

/** Qwen Code read_file 기준 분류. text: 그대로 읽음 / pdf·image: 모델이 지원할 때만 / unreadable: 이진 파일로 건너뜀. */
export function fileKind(name) {
  const ext = (name.match(/\.[^./\\]+$/)?.[0] ?? "").toLowerCase();
  if (TEXT.has(ext)) return "text";
  if (ext === ".pdf") return "pdf";
  if (IMAGE.has(ext)) return "image";
  if (UNREADABLE.has(ext)) return "unreadable";
  return "unknown";
}

export function fingerprint(content) {
  return createHash("sha256").update(content).digest("hex").slice(0, 12);
}

/** sources.md 의 `| 파일 | 지문 |` 줄을 읽는다. */
export function parseSources(text) {
  const recorded = new Map();
  for (const match of String(text ?? "").matchAll(/^\|\s*([^|]+?)\s*\|\s*([0-9a-f]{12})\s*\|\s*$/gm)) recorded.set(match[1], match[2]);
  return recorded;
}

export function sourcesFile(files) {
  return [
    "# Sources read by /my-docs",
    "",
    "<!-- Written by `pnpm specs --record` after /my-docs tidies your inbox. Do not edit. -->",
    "",
    "| File | Fingerprint |",
    "|---|---|",
    ...[...files].sort((a, b) => a.file.localeCompare(b.file)).map(({ file, hash }) => `| ${file} | ${hash} |`),
    "",
  ].join("\n");
}

/** 현재 inbox 파일([{file, hash}])을 지난 기록과 비교한다. */
export function inboxStatus(files, recorded) {
  const rows = files.map(({ file, hash }) => ({ file, hash, kind: fileKind(file), status: !recorded.has(file) ? "new" : recorded.get(file) === hash ? "same" : "changed" }));
  const present = new Set(files.map(({ file }) => file));
  for (const file of recorded.keys()) if (!present.has(file)) rows.push({ file, kind: fileKind(file), status: "removed" });
  return rows.sort((a, b) => a.file.localeCompare(b.file));
}

/** 줄 수를 지키면서 HTML 주석을 지운다. 템플릿 안내 문장의 표시는 세지 않는다. */
function stripComments(text) {
  return String(text).replace(/<!--[\s\S]*?-->/g, (comment) => comment.replace(/[^\n]/g, ""));
}

/** 남은 [NEEDS CLARIFICATION: …] 표시. [{line, question}] */
export function clarifications(text) {
  const found = [];
  stripComments(text).split("\n").forEach((line, index) => {
    for (const match of line.matchAll(/\[NEEDS CLARIFICATION:?\s*([^\]]*)\]/gi)) found.push({ line: index + 1, question: match[1].trim() || "(no question written)" });
  });
  return found;
}

/** 같은 질문을 한 번호로 묶는다. 학생이 "1. …" 로 답하면 그 위치 전부에 적용된다. [{question, places}] */
export function groupQuestions(items) {
  const groups = new Map();
  items.forEach(({ name, line, question }, index) => {
    const key = question === "(no question written)" ? `#${index}` : question.toLowerCase().replace(/\s+/g, " ");
    if (!groups.has(key)) groups.set(key, { question, places: [] });
    groups.get(key).places.push(`${name}:${line}`);
  });
  return [...groups.values()];
}

/** 칸 수가 머리줄과 다른 표 줄. 글 안의 | 가 칸을 나누면 /my-website 가 표를 잘못 읽는다. [{line, cells, expected}] */
export function tableProblems(text) {
  const problems = [];
  let expected = 0;
  stripComments(text).split("\n").forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) { expected = 0; return; }
    const cells = trimmed.replace(/^\|/, "").replace(/(?<!\\)\|$/, "").split(/(?<!\\)\|/).length;
    if (!expected) expected = cells;
    else if (cells !== expected) problems.push({ line: index + 1, cells, expected });
  });
  return problems;
}

/** 빠진 필수 섹션과 내용. */
export function missingParts(name, text) {
  const body = stripComments(text);
  const headings = [...body.matchAll(/^#{2,4}\s+(.+?)\s*$/gm)].map((match) => match[1].toLowerCase());
  const sections = (SPEC_FILES[name] ?? []).filter((section) => !headings.some((heading) => heading.startsWith(section.toLowerCase())));
  const content = (SPEC_CONTENT[name] ?? []).filter(([, pattern]) => !pattern.test(body)).map(([label]) => label);
  return { sections, content };
}

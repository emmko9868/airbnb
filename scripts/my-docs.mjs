#!/usr/bin/env node
/**
 * my-docs Spec Kit 상태 보기. AI 를 부르지 않는다 (크레딧 0).
 *
 *   pnpm specs            inbox 의 새·바뀐 파일, specs 의 빠진 섹션, 남은 [NEEDS CLARIFICATION] 을 보여 준다
 *   pnpm specs --check    위와 같고, inbox 가 비었거나 지난 정리 뒤 바뀌었거나, specs 가 덜 됐거나 질문이 남으면 종료 코드 1
 *   pnpm specs --record   지금 inbox 파일의 지문을 my-docs/specs/sources.md 에 적는다 (/my-docs 가 정리를 끝낸 뒤)
 *
 * Qwen 의 /my-docs 명령이 이 출력을 읽고 새·바뀐 파일만 읽는다.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { IGNORED_FILES, SOURCES_FILE, SPEC_FILES, clarifications, fingerprint, groupQuestions, inboxStatus, missingParts, parseSources, sourcesFile, tableProblems } from "./lib/my-docs.mjs";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const inboxDir = join(root, "my-docs", "inbox");
const specsDir = join(root, "my-docs", "specs");
const args = new Set(process.argv.slice(2));
const out = (line = "") => process.stdout.write(`${line}\n`);

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => !IGNORED_FILES.has(name) && !name.startsWith(".")).sort().flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(inboxDir).map((path) => ({ file: relative(inboxDir, path).split("\\").join("/"), hash: fingerprint(readFileSync(path)) }));

if (args.has("--record")) {
  mkdirSync(specsDir, { recursive: true });
  writeFileSync(join(specsDir, SOURCES_FILE), sourcesFile(files));
  out(`Recorded ${files.length} inbox file(s) in my-docs/specs/${SOURCES_FILE}.`);
  process.exit(0);
}

const recorded = existsSync(join(specsDir, SOURCES_FILE)) ? parseSources(readFileSync(join(specsDir, SOURCES_FILE), "utf8")) : new Map();
const rows = inboxStatus(files, recorded);
const MARK = { new: "+ new    ", changed: "~ changed", same: "= same   ", removed: "- removed" };
const NOTE = {
  pdf: "PDF: works only if your AI model can read PDFs. If the AI says it can't, copy the text into a .md file.",
  image: "Picture: works only if your AI model can see images. If the AI says it can't, describe it in a .md file.",
  unreadable: "The AI can't read this file type. Save it as .md or .txt, or copy the text into a .md file.",
  unknown: "Unknown file type. If the AI can't read it, save it as .md or .txt.",
};

out(`Inbox (my-docs/inbox) — ${files.length} file(s)`);
for (const row of rows) out(`  ${MARK[row.status]}  ${row.file}${row.status !== "removed" && NOTE[row.kind] ? `  ! ${NOTE[row.kind]}` : ""}`);
if (!rows.length) out("  (empty — put your plan, PRD, user stories or notes here, or fill in inbox/brief.md)");

out("");
out("Specs (my-docs/specs)");
let incomplete = 0;
const questions = [];
for (const name of Object.keys(SPEC_FILES)) {
  const path = join(specsDir, name);
  if (!existsSync(path)) { incomplete++; out(`  · ${name} — not written yet`); continue; }
  const text = readFileSync(path, "utf8");
  const { sections, content } = missingParts(name, text);
  for (const item of clarifications(text)) questions.push({ name, ...item });
  const tables = tableProblems(text);
  if (sections.length || content.length || tables.length) incomplete++;
  if (sections.length || content.length) out(`  ✗ ${name} — missing ${[...sections.map((section) => `section "${section}"`), ...content].join(", ")}`);
  for (const { line, cells, expected } of tables) out(`  ✗ ${name}:${line} — this table row has ${cells} cells, the header has ${expected}. Write a | inside text as \\|.`);
  if (!sections.length && !content.length && !tables.length) out(`  ✓ ${name}`);
}

out("");
const groups = groupQuestions(questions);
out(`Open questions [NEEDS CLARIFICATION]: ${groups.length}`);
groups.forEach(({ question, places }, index) => out(`  ${index + 1}. ${question}  (${places.join(", ")})`));

const changed = rows.filter((row) => row.status !== "same").length;
out("");
if (!files.length) out("Next: add documents to my-docs/inbox, then ask the AI in your own words to organize them into specs.");
else if (incomplete || changed) out(`Next: ask the AI in your own words to organize your documents into specs${changed ? ` (${changed} inbox file(s) new, changed or removed since the last tidy)` : ""}.`);
else if (groups.length) out("Next: the AI asks these with choices in the Qwen chat; pick an answer or type your own. No choices? Answer with the same numbers (1. … 2. …).");
else out("Specs are ready. Next: ask the AI in your own words to make your website from these specs.");
if (args.has("--check")) process.exitCode = !files.length || incomplete || changed || questions.length ? 1 : 0;

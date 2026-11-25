/**
 * 맨 앞이 아닌 곳에 쓴 학생용 Qwen 명령(/my-docs · /my-assets · /my-website · /my-deploy)을 찾아 본문을 붙인다.
 *
 * VS Code Qwen 확장(0.26.1)은 열린 파일을 메시지 앞에 `@경로 ` 로 붙인다. 기본으로 켜져 있고 끄는 설정이 없다.
 * 그러면 `/my-docs` 가 맨 앞이 아니게 되어 Qwen 이 명령을 펼치지 않고 보통 글로 보낸다.
 * UserPromptSubmit 훅(ai-check prompt)이 이 경우에만 명령 본문을 붙인다. 맨 앞이면 Qwen 이 직접 펼치므로 아무것도 하지 않는다.
 */
import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { currentApprovedComponentPlan, nestedPartsFromPlan, planComponentNames } from "./component-plan.mjs";
import { eachUse, readPagePlan } from "./page-plan.mjs";

export const COMMANDS_DIR = ".qwen/commands";

/** 맨 앞이 아닌 첫 명령. 없거나 맨 앞이면 null. { name, args } */
export function strayCommand(prompt, names) {
  const text = String(prompt ?? "").trimStart();
  const match = [...text.matchAll(/(^|\s)\/(my-[a-z-]+)(?=\s|$)/g)].find((found) => names.includes(found[2]));
  if (!match || match.index === 0) return null;
  return { name: match[2], args: text.slice(match.index + match[0].length).trim() };
}

/**
 * 메시지가 이 명령인가 — 맨 앞이든, 앞에 `@파일` 이 붙었든.
 * root 를 주면 Qwen 이 명령을 본문으로 펼쳐 보낸 경우(본문 첫 두 줄이 그대로 들어 있음)도 그 명령으로 본다.
 */
export function isCommandPrompt(prompt, name, root) {
  const text = String(prompt ?? "").trimStart();
  if (new RegExp(`^/${name}(?=\\s|$)`).test(text) || strayCommand(text, [name])?.name === name) return true;
  if (!root) return false;
  try {
    const opening = commandText(readFileSync(join(root, COMMANDS_DIR, `${name}.md`), "utf8"), "").split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 2);
    return opening.length === 2 && opening.every((line) => text.includes(line));
  } catch { return false; }
}

/** 명령 파일 본문: 머리말을 빼고 {{args}} 를 채운다. */
export function commandText(body, args) {
  return String(body).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").replaceAll("{{args}}", args).trim();
}

/** UserPromptSubmit 에 붙일 문장. 명령이 없거나 맨 앞이면 null. */
export function strayCommandContext(prompt, root) {
  const dir = join(root, COMMANDS_DIR);
  if (!existsSync(dir)) return null;
  const names = readdirSync(dir).filter((file) => /^my-[a-z-]+\.md$/.test(file)).map((file) => file.slice(0, -3));
  const found = strayCommand(prompt, names);
  if (!found) return null;
  const body = readFileSync(join(dir, `${found.name}.md`), "utf8");
  return `My message has /${found.name}, but not at its start (VS Code may put the open file in front), so Qwen did not run the command. This is that command. Follow it now:\n\n${commandText(body, found.args)}`;
}

const exactName = (text, name) => new RegExp(`(?<![A-Za-z0-9_])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_])`, "i").test(text);

/** 승인된 Nested parts에 등장하는 공용 부품 이름을 후속 수정 요청의 대상으로 고정한다. */
export function sharedPartPromptContext(prompt, root) {
  const consumers = new Map();
  const componentsDir = join(root, "docs/plans/components");
  const names = new Set();
  for (const file of existsSync(componentsDir) ? readdirSync(componentsDir).filter((entry) => entry.endsWith(".md")) : []) {
    const content = readFileSync(join(componentsDir, file), "utf8");
    for (const name of planComponentNames(content)) if (/^[A-Z][A-Za-z0-9]*$/.test(name)) names.add(name);
  }
  for (const name of names) {
    try {
      const plan = currentApprovedComponentPlan(root, name);
      for (const part of nestedPartsFromPlan(plan, { validate: true })) {
        if (!part.kitComponent) continue;
        const entry = consumers.get(part.kitComponent) || { components: new Set(), pages: new Set() };
        entry.components.add(name); consumers.set(part.kitComponent, entry);
      }
    } catch {}
  }
  if (!consumers.size) return null;
  const pagesDir = join(root, "docs/plans/pages");
  for (const file of existsSync(pagesDir) ? readdirSync(pagesDir).filter((entry) => entry.endsWith(".md")) : []) {
    try {
      const plan = readPagePlan(root, join(pagesDir, file));
      for (const page of plan.spec.pages) eachUse(page, (use) => {
        const entry = consumers.get(use.component);
        if (entry) entry.pages.add(page.name);
      });
    } catch {}
  }
  const matched = [...consumers].filter(([part]) => exactName(String(prompt), part));
  if (!matched.length) return null;
  return matched.map(([part, uses]) => `Shared part target: ${part} means src/components/${part}/. Approved composite consumers: ${[...uses.components].sort().join(", ") || "none"}. Approved page consumers: ${[...uses.pages].sort().join(", ") || "none"}. A change affects every consumer, so confirm the intended scope before editing the shared part; do not redirect it to a parent or a similar part.`).join("\n");
}

/**
 * 말로 한 요청의 의도 낱말. 영어는 낱말 경계, 한국어는 포함으로 맞춘다(대소문자 무시).
 * 명사 하나와 동작 낱말 하나가 함께 있어야 맞는다. deploy 는 동작 낱말이 없어도 맞는다.
 */
export const INTENT_WORDS = {
  website: {
    about: "my website or its pages",
    nouns: ["website", "web site", "site", "homepage", "home page", "landing page", "web page", "웹사이트", "사이트", "홈페이지", "웹페이지", "랜딩 페이지"],
    verbs: ["make", "build", "create", "plan", "start", "change", "add", "fix", "update", "만들", "제작", "짜 줘", "짜줘", "계획", "바꿔", "고쳐", "추가", "부탁"],
  },
  docs: {
    about: "my documents (Spec Kit)",
    nouns: ["my-docs", "PRD", "spec", "specs", "spec kit", "brief", "inbox", "기획서", "기획 문서", "요구사항", "스펙", "메모"],
    verbs: ["organize", "turn", "update", "write", "make", "read", "check", "정리", "만들", "업데이트", "반영", "읽", "확인"],
  },
  assets: {
    about: "sorting my files in my-assets",
    // my-assets·에셋은 아무 동작 낱말과, 아이콘·그림·글꼴은 정리하는 낱말과만 맞는다("아이콘 붙은 버튼 만들어 줘"는 아니다).
    nouns: ["my-assets", "asset", "assets", "에셋"],
    verbs: "any",
    fileNouns: ["icon", "icons", "image", "images", "picture", "pictures", "font", "fonts", "아이콘", "그림", "이미지", "글꼴", "폰트"],
    fileVerbs: ["sort", "organize", "move", "정리", "분류", "옮겨"],
  },
  deploy: {
    about: "checking or deploying my site",
    nouns: ["deploy", "publish", "vercel", "go online", "put … online", "배포", "인터넷에 올", "온라인에 올", "사이트 올려", "사이트를 올려"],
    verbs: null,
  },
};

const ALL_VERBS = [...new Set(Object.values(INTENT_WORDS).flatMap((intent) => [...(Array.isArray(intent.verbs) ? intent.verbs : []), ...(intent.fileVerbs || [])]))];

function hasWord(text, word) {
  if (/[가-힣]/.test(word)) return text.includes(word.toLowerCase());
  const pattern = word.toLowerCase().split(" … ").map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+")).join("\\b.*\\b");
  return new RegExp(`(?<![a-z0-9_-])${pattern}(?![a-z0-9_-])`).test(text);
}
const hasAny = (text, words) => words.some((word) => hasWord(text, word));

/** 맞추기 전에 링크와 `@경로`(VS Code 가 붙이는 열린 파일)를 지운다 — 그 속 낱말로 걸리지 않게. */
export function plainWords(prompt) {
  return String(prompt ?? "")
    .replace(/(?:https?:\/\/|www\.)\S+/gi, " ")
    .replace(/(?<![\w@])[\w-]+(?:\.[\w-]+)+\/\S*/g, " ")
    .replace(/(^|\s)@\S+/g, " ")
    .toLowerCase();
}

/** 말로 한 요청이 가리킬 수 있는 학생 명령들(website → docs → assets → deploy 순). */
export function promptIntents(prompt) {
  const text = plainWords(prompt);
  return Object.entries(INTENT_WORDS).filter(([, intent]) => {
    if (intent.fileNouns && hasAny(text, intent.fileNouns) && hasAny(text, intent.fileVerbs)) return true;
    if (!hasAny(text, intent.nouns)) return false;
    if (intent.verbs === null) return true;
    return hasAny(text, intent.verbs === "any" ? ALL_VERBS : intent.verbs);
  }).map(([name]) => name);
}

/** 말로 한 요청을 `/my-*` 지시문에 잇는 조건문. 맞는 의도가 없으면 null. */
export function intentCommandContext(prompt, root) {
  const lines = promptIntents(prompt)
    .filter((name) => !root || existsSync(join(root, COMMANDS_DIR, `my-${name}.md`)))
    .map((name) => `[Kit] My message may ask for ${INTENT_WORDS[name].about}. If it does, read \`${COMMANDS_DIR}/my-${name}.md\` now and follow it with my message as its input. Run the kit commands it names yourself (I approve them); never ask me to type a slash command.`);
  return lines.length ? lines.join("\n") : null;
}

// ── Q-65: 색 요청 라우팅 · Figma 도구 승인 안내 ─────────────────────────────

/** AI 가 막혔을 때 갈 길의 마지막 문장. 차단 문구·훅 안내가 같이 쓴다. */
export const RUN_IT_YOURSELF = "Run the kit command yourself; never ask the student to edit files, type commands or turn off protections.";

const COLOR_NOUNS = ["color", "colors", "colour", "colours", "palette", "색", "색상", "컬러", "팔레트"];
const COLOR_VERBS = ["import", "bring", "sync", "pull", "load", "get", "update", "refresh", "가져", "불러", "동기화", "반영", "업데이트"];
const CONNECTION = { figma: ["figma", "피그마"], nouns: ["connection", "connected", "connect", "mcp", "연결"], verbs: ["check", "test", "working", "work", "확인", "됐", "되는", "테스트"] };

/** 말로 한 색 가져오기 요청이나 Figma 연결 확인 요청인가. 링크·@파일 속 낱말은 보지 않는다. */
export function isColorRequest(prompt) {
  const text = plainWords(prompt);
  if (hasAny(text, COLOR_NOUNS) && hasAny(text, COLOR_VERBS)) return true;
  return hasAny(text, CONNECTION.figma) && hasAny(text, CONNECTION.nouns) && hasAny(text, CONNECTION.verbs);
}

const firstFigmaLink = (prompt) => String(prompt ?? "").match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)'"]+/i)?.[0] ?? null;

/** 색 요청에 붙이는 짧은 안내(결정 2·5). 부품 미리 읽기 대신 붙는다. */
export function colorRequestContext(prompt) {
  const link = firstFigmaLink(prompt);
  return [
    "[Kit] This is a color request (or a Figma connection check), not a part. Do not write a component plan now.",
    link
      ? `1. Run \`pnpm ds:figma "${link}"\` yourself now (the student approves it in the permission box). It merges with colors imported before and prints Added / Changed / Kept; tell the student that in one or two plain lines.`
      : "1. If I gave no Figma link: for a connection check, run `pnpm mcp:setup` yourself and tell me the result. To import colors, ask me in one line for the Figma link of a frame or part that uses my colors, then run `pnpm ds:figma \"<that link>\"` yourself.",
    "2. If the output says roles are empty (BLOCKED_INPUT: Your palette needs review), write `docs/plans/tokens.md` from `docs/templates/token-plan.md` with your recommended roles, show the table (role → color, why) in the chat, and ask ONE `ask_user_question`: \"Use these roles (Recommended)\" / \"Change some roles\" (if I change some, ask only those roles). Record it in the plan Q&A as \"AI proposal, chosen in chat\". Then run `pnpm ds:apply-token-plan docs/plans/tokens.md --prepare`, ask \"Approve revision N\" / \"Change something\", change only the `status:` line, and run `pnpm ds:apply-token-plan docs/plans/tokens.md`.",
    "3. If no role is empty, say the colors are in and go on with what I asked.",
    `${RUN_IT_YOURSELF} If the same step is blocked twice, stop, tell me in one line what is done, and say: "Please show this screen to the instructor."`,
  ].join("\n");
}

/** 결정 11: Figma 도구가 이 폴더에서 승인되지 않았을 때의 안내. */
export const FIGMA_TOOLS_NOT_APPROVED = "[Figma] The Figma tools (figma-desktop) are not approved in this project folder yet. Do not go on with the sample colors and do not offer that as a choice. Tell the student exactly: \"Type `/mcp` in the chat, approve `figma-desktop`, then start a new chat.\" Then stop.";

/** Qwen 이 MCP 서버 승인을 적어 두는 파일. 테스트는 DS_QWEN_MCP_APPROVALS 로 바꾼다. */
export const mcpApprovalsFile = () => process.env.DS_QWEN_MCP_APPROVALS || join(homedir(), ".qwen", "mcpApprovals.json");

/**
 * ~/.qwen/mcpApprovals.json (Qwen Code 0.26.9 에서 확인한 형식):
 *   { "<프로젝트 절대 경로>": { "figma-desktop": { "hash": "…", "status": "approved" } } }
 * 이 프로젝트의 figma-desktop 이 approved 가 아니면 안내 문장, 승인됐거나 파일이 없거나 형식이 다르면 null.
 */
export function figmaApprovalContext(root, file = mcpApprovalsFile()) {
  let data;
  try { data = JSON.parse(readFileSync(file, "utf8")); } catch { return null; }
  const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  if (!isObject(data) || !Object.values(data).every(isObject)) return null;
  const paths = new Set([resolve(root)]);
  try { paths.add(realpathSync(root)); } catch {}
  const windows = process.platform === "win32";
  const same = (a, b) => windows ? a.replace(/[\\/]+$/, "").toLowerCase() === b.replace(/[\\/]+$/, "").toLowerCase() : a.replace(/\/+$/, "") === b;
  const entry = Object.entries(data).find(([path]) => [...paths].some((own) => same(path, own)))?.[1];
  if (entry && entry["figma-desktop"] !== undefined && !isObject(entry["figma-desktop"])) return null;
  return entry?.["figma-desktop"]?.status === "approved" ? null : FIGMA_TOOLS_NOT_APPROVED;
}

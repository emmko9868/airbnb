/**
 * 설치 스크립트 전용 — 키트의 Qwen 프로젝트 훅을 이 폴더에 승인으로 등록한다(Q-67).
 *
 *   node scripts/qwen-hooks-approve.mjs
 *
 * Qwen Code 0.27.x 는 VS Code 에서 신뢰한 폴더에 훅 승인 카드를 띄우지 않는다. 그런데 승인 기록이 없으면
 * 프로젝트 훅을 켜지 않아 키트 검사가 영영 꺼진다. 그래서 학생이 직접 실행하는 설치 명령이 Qwen 과 같은 지문으로
 * `~/.qwen/hookApprovals.json`(QWEN_CODE_HOOK_APPROVALS_PATH 가 있으면 그 경로)에 `approved` 를 쓴다.
 *
 * 지문은 Qwen 0.27.1 의 hashProjectHooks 와 같다:
 *   sha256(JSON.stringify({ hooks, env }, 객체 키 정렬 replacer))
 *   hooks = 프로젝트 .qwen/settings.json 의 원래 hooks 객체
 *   env   = { files: readProjectEnvFiles(...), settings: settings.json 의 env ?? null }
 * 루트 키는 normalizeProjectRoot = path.resolve(root), Windows 면 소문자.
 *
 * 학생이 같은 지문으로 거절(rejected)했으면 덮지 않는다. AI 는 이 스크립트를 실행하지 않는다(훅이 셸 명령을 막는다).
 * 의존성 0.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync, chmodSync } from "node:fs";
import { homedir, platform } from "node:os";
import { dirname, join, normalize, relative, resolve, basename, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

export const MESSAGES = {
  approved: "The kit's checks are turned on for this folder (Qwen hooks approved).",
  rejected: "You chose Keep disabled for the kit's checks. Turn them on in Qwen (Approve hooks) or tell the instructor.",
  failed: "Could not turn on the kit's checks automatically. Please show this screen to the instructor.",
};

const QWEN_DIR = ".qwen";

/** Qwen normalizeProjectRoot: path.resolve, Windows 면 소문자. */
export function normalizeProjectRoot(projectRoot, os = platform()) {
  const resolved = resolve(projectRoot);
  return os === "win32" ? resolved.toLowerCase() : resolved;
}

/** Qwen hashProjectHooks 와 같은 지문. 객체 키는 깊이까지 정렬, 배열 순서 유지, 공백 없음. */
export function hashProjectHooks({ hooks, env }) {
  const stable = JSON.stringify({ hooks, env }, (_key, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const sorted = Object.create(null);
      for (const k of Object.keys(value).sort()) sorted[k] = value[k];
      return sorted;
    }
    return value;
  });
  return createHash("sha256").update(stable).digest("hex");
}

// dotenv(Qwen 0.27.1 에 묶인 판) 의 parse 와 같은 규칙.
const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

/** dotenv.parse 와 같은 결과. */
export function parseDotenv(src) {
  const obj = {};
  const lines = String(src).replace(/\r\n?/mg, "\n");
  LINE.lastIndex = 0;
  let match;
  while ((match = LINE.exec(lines)) != null) {
    const key = match[1];
    let value = (match[2] || "").trim();
    const maybeQuote = value[0];
    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
    if (maybeQuote === '"') value = value.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    obj[key] = value;
  }
  return obj;
}

/** Qwen Storage.getGlobalQwenDir: QWEN_HOME 이 있으면 그 폴더, 아니면 ~/.qwen. */
export function globalQwenDir(env = process.env, home = homedir()) {
  const dir = env.QWEN_HOME;
  if (dir) {
    const expanded = dir === "~" ? home : dir.startsWith("~/") || dir.startsWith("~\\") ? join(home, dir.slice(2)) : dir;
    return resolve(expanded);
  }
  return join(home, QWEN_DIR);
}

/** Qwen getHookApprovalsPath. */
export function hookApprovalsPath(env = process.env, home = homedir()) {
  return env.QWEN_CODE_HOOK_APPROVALS_PATH || join(globalQwenDir(env, home), "hookApprovals.json");
}

function realOr(path) {
  try { return realpathSync(path); } catch { return null; }
}

function isWithinRoot(path, root) {
  const rel = relative(root, path);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

/**
 * Qwen readProjectEnvFiles(신뢰한 폴더) 와 같은 결과.
 * findEnvFiles 는 루트에서 위로 올라가며 폴더마다 `.qwen/.env` → `.env` 순서로 찾고, 처음 찾은 한 파일에서 멈춘다.
 * readProjectEnvFiles 는 그중 사용자 단위 경로(~/.env, ~/.qwen/.env, QWEN_HOME/.env)와 프로젝트 밖(실제 경로 기준) 파일을 뺀다.
 * 그래서 남는 것은 `<루트>/.qwen/.env` 또는 `<루트>/.env` 하나뿐이다. 읽지 못하면 값은 null.
 * 키는 실제 경로(realpath) 루트에 붙인 경로 문자열이다.
 */
export function readProjectEnvFiles(root, { env = process.env, home = homedir() } = {}) {
  const realRoot = realOr(resolve(root)) ?? resolve(root);
  const userLevel = new Set([
    normalize(join(home, ".env")),
    normalize(join(globalQwenDir(env, home), ".env")),
    normalize(join(home, QWEN_DIR, ".env")),
  ]);
  const files = {};
  // 루트가 홈 폴더면 Qwen 은 홈 후보(사용자 단위)만 본다 → 프로젝트 파일 없음.
  if (resolve(root) === resolve(home)) return files;
  let current = realRoot;
  const realHome = resolve(home);
  while (true) {
    if (current === realHome) return files;
    for (const candidate of [join(current, QWEN_DIR, ".env"), join(current, ".env")]) {
      if (!existsSync(candidate)) continue;
      // 처음 찾은 파일에서 멈춘다(밖의 파일이라 버려져도 더 찾지 않는다).
      if (userLevel.has(normalize(candidate))) return files;
      const real = realOr(candidate);
      if (!real || !isWithinRoot(real, realRoot)) return files;
      try { files[candidate] = parseDotenv(readFileSync(candidate, "utf-8")); } catch { files[candidate] = null; }
      return files;
    }
    const parent = dirname(current);
    if (parent === current || !parent) return files;
    current = parent;
  }
}

/** 키트 루트의 지문 재료. */
export function projectHooksApproval(root, options = {}) {
  const settings = JSON.parse(readFileSync(join(root, QWEN_DIR, "settings.json"), "utf8"));
  const hooks = settings?.hooks;
  if (!hooks || typeof hooks !== "object" || Array.isArray(hooks) || !Object.keys(hooks).length) {
    throw new Error("the kit's .qwen/settings.json has no hooks");
  }
  return { root, hooks, env: { files: readProjectEnvFiles(root, options), settings: settings.env ?? null } };
}

/** 승인 파일을 읽는다. 없으면 빈 객체, 깨졌으면 오류(덮어쓰지 않는다). */
function readApprovals(file) {
  if (!existsSync(file)) return Object.create(null);
  const parsed = JSON.parse(readFileSync(file, "utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(`${file} is not a JSON object`);
  return Object.assign(Object.create(null), parsed);
}

function writeAtomic(file, text) {
  mkdirSync(dirname(file), { recursive: true });
  const tmp = join(dirname(file), `.${basename(file)}.${process.pid}.${Date.now()}.tmp`);
  try {
    writeFileSync(tmp, text, { mode: 0o600 });
    try { chmodSync(tmp, 0o600); } catch {}
    renameSync(tmp, file);
  } catch (error) {
    rmSync(tmp, { force: true });
    throw error;
  }
}

/**
 * 이 키트 루트를 승인으로 등록한다.
 * 결과: "approved"(새로 썼거나 이미 승인) | "rejected"(같은 지문의 거절을 존중).
 */
export function approveProjectHooks(root, { env = process.env, home = homedir(), os = platform(), aliases = [] } = {}) {
  const approval = projectHooksApproval(root, { env, home });
  const hash = hashProjectHooks(approval);
  const file = hookApprovalsPath(env, home);
  const config = readApprovals(file);
  // 설치는 VS Code 와 같은 경로로 열린 폴더에서 돈다. 실제 경로가 다르면(심볼릭 링크) 두 키 모두 등록한다.
  const realRoot = realOr(root);
  const sameFolder = (path) => realRoot && realOr(path) === realRoot;
  const keys = [...new Set([root, realRoot, ...aliases.filter(sameFolder)].filter(Boolean).map((path) => normalizeProjectRoot(path, os)))];
  const record = (key) => config[key];
  if (keys.some((key) => record(key)?.hash === hash && record(key)?.status === "rejected")) {
    return { status: "rejected", hash, file, keys };
  }
  if (keys.every((key) => record(key)?.hash === hash && record(key)?.status === "approved")) {
    return { status: "approved", hash, file, keys, changed: false };
  }
  for (const key of keys) {
    Object.defineProperty(config, key, { value: { hash, status: "approved" }, enumerable: true, configurable: true, writable: true });
  }
  writeAtomic(file, JSON.stringify(config, null, 2));
  return { status: "approved", hash, file, keys, changed: true };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  // 설치 스크립트는 키트 폴더로 cd 한 뒤 부른다. 셸의 PWD(심볼릭 링크 경로일 수 있음)도 같은 폴더면 함께 등록한다.
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : resolve(process.cwd());
  try {
    const result = approveProjectHooks(root, { aliases: process.env.PWD ? [process.env.PWD] : [] });
    console.log(MESSAGES[result.status]);
    process.exit(0);
  } catch (error) {
    // 실패 안내 문장(MESSAGES.failed)은 설치 스크립트가 출력한다. 여기서는 원인만 남긴다.
    console.error(`Cause: ${error.message}`);
    process.exit(1);
  }
}

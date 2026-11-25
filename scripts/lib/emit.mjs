/**
 * 파일 생성 + **수동 수정 보호**.
 *
 * DSP 의 `comparison_output_hash` 모델을 파일 단위로 내린 것.
 *   - 생성 파일에는 `@ds-generated <hash>` 헤더가 붙는다.
 *   - 다시 생성할 때 현재 내용의 해시가 헤더와 다르면 **사람이 고친 것** →
 *     덮어쓰지 않고 충돌로 보고한다. "버리지 않고 격리" 원칙.
 *   - 컴포넌트 구현(.tsx/.css)은 애초에 한 번만 만들고 다시 건드리지 않는다.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const MARK = "@ds-generated";

export function bodyHash(body) {
  return createHash("sha256").update(body, "utf8").digest("hex").slice(0, 16);
}

/** 확장자에 맞는 주석 문법. .md 에 C 스타일 주석을 넣으면 본문으로 렌더된다. */
function commentFor(path) {
  return /\.(md|markdown|html)$/i.test(path ?? "")
    ? (text) => `<!-- ${text} -->`
    : (text) => `/* ${text} */`;
}

export function withHeader(body, note, path) {
  const h = bodyHash(body);
  const wrap = commentFor(path);
  const text = [
    `${MARK} ${h} — \`pnpm ds:gen\` 이 만든 파일입니다.`,
    `   ${note}`,
    "   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다.",
  ].join("\n");
  return `${wrap(text)}\n${body}`;
}

function readRecorded(text) {
  const m = text.match(new RegExp(`${MARK} ([0-9a-f]{16})`));
  if (!m) return null;
  const close = text.startsWith("<!--") ? "-->" : "*/";
  const idx = text.indexOf(close);
  if (idx < 0) return null;
  return { hash: m[1], body: text.slice(idx + close.length + 1) };
}

/**
 * @returns {"created"|"updated"|"unchanged"|"conflict"|"kept"}
 */
export function writeGenerated(path, body, note) {
  const next = withHeader(body, note, path);
  if (!existsSync(path)) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, next, "utf8");
    return "created";
  }
  const current = readFileSync(path, "utf8");
  const rec = readRecorded(current);
  if (!rec) return "conflict"; // 생성 표식이 없음 = 사람이 만든 파일
  if (bodyHash(rec.body) !== rec.hash) return "conflict"; // 생성 후 수정됨
  if (rec.body === body) return "unchanged";
  writeFileSync(path, next, "utf8");
  return "updated";
}

/** 없을 때만 만든다. 구현 파일용. */
export function writeOnce(path, body) {
  if (existsSync(path)) return "kept";
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body, "utf8");
  return "created";
}

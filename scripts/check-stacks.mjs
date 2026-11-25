#!/usr/bin/env node
/**
 * 네 스택이 전부 타입 검사를 통과하는지 확인한다.
 *
 * **왜 스크립트로 만들었나**: 이 검사는 `src/components` 를 지우고 다시 생성한다.
 * 손으로 `rm -rf src/components` 를 돌리다 사람이 구현한 컴포넌트를 통째로 날린 적이 있다.
 * 그래서 반드시 git 으로 되돌린다 — 커밋되지 않은 변경이 있으면 아예 실행하지 않는다.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: "utf8", stdio: "pipe", ...opts });

if (!existsSync(resolve(ROOT, ".git"))) {
  console.error("This is not a git repository. This check needs git to undo its changes, so it cannot run.");
  process.exit(1);
}

const dirty = run("git", ["status", "--porcelain", "src", "components.baseline.json"]).trim();
if (dirty) {
  console.error("You have uncommitted changes. Commit or stash them first — this check deletes src/.\n");
  console.error(dirty);
  process.exit(1);
}

const STACKS = ["css", "css-modules", "tailwind", "shadcn"];
let failed = 0;

for (const stack of STACKS) {
  // src/tests 는 사람이 구현한 컴포넌트를 쓰는 회귀 검사라 생성 직후의 골격과는 맞지 않는다 — 함께 치운다.
  // src/lib 은 통째로 지우지 않는다. utils.ts 만 생성물(shadcn 스택)이고, i18n.tsx·refs.ts 는
  // 문서(docs)와 Storybook 설정이 쓰는 사람 파일이다.
  run("rm", ["-rf", "src/components", "src/lib/utils.ts", "src/tests", "src/css-modules.d.ts"]);
  run(process.execPath, ["scripts/ds.mjs", "baseline", `--stack=${stack}`]);
  let errors = 0;
  try {
    run("pnpm", ["exec", "tsc", "--noEmit"]);
  } catch (e) {
    errors = String(e.stdout ?? "").split("\n").filter((l) => l.includes("error TS")).length;
  }
  if (errors) failed += 1;
  console.log(`  ${errors ? "✖" : "✔"} ${stack.padEnd(12)} type errors ${errors}`);
}

// 어떤 경우에도 원래 상태로 되돌린다.
run("git", ["checkout", "--", "src"]);
run("git", ["clean", "-fdq", "src"]);
console.log(`\n${failed ? `${STACKS.length - failed}/${STACKS.length} passed` : `${STACKS.length}/${STACKS.length} passed`} · src/ restored`);
process.exit(failed ? 1 : 0);

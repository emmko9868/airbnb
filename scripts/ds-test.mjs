#!/usr/bin/env node
/**
 * 단위 테스트 실행 (`pnpm ds:test`). 테스트는 팀 저장소에만 있다 — 학생 키트(ZIP)에는 넣지 않는다(.gitattributes).
 * 테스트 폴더가 없으면 실패하지 않고 안내만 한다.
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const dir = fileURLToPath(new URL("./tests", import.meta.url));
const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".test.mjs")).sort().map((f) => join(dir, f)) : [];
if (!files.length) {
  console.log("Unit tests live in the team repository; the student kit doesn't include them. Nothing to run.");
  process.exit(0);
}
const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(result.status ?? 1);

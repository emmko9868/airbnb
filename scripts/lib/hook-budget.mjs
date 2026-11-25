import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { boundedMs } from "./figma-jobs.mjs";
import { PAGES_DIR } from "./site-paths.mjs";

export function hookDeadline() { return Date.now() + boundedMs(process.env.DS_AI_HOOK_BUDGET_MS, 50_000, 50_000); }
export function budgetRun(command, args, options, deadline) {
  const remaining = deadline - Date.now();
  if (remaining < 10) return { status: null, stdout: "", stderr: "", incomplete: true };
  const result = spawnSync(command, args, { ...options, timeout: Number.isFinite(remaining) ? remaining : undefined, killSignal: "SIGKILL" });
  return { ...result, incomplete: Boolean(result.error) || result.signal != null };
}
export function incompleteMessage(names, pages = []) {
  const commands = [...names.map((name) => `pnpm ai:check ${name}`), ...pages.map((name) => `pnpm ai:check-page ${name}`)];
  return `Some checks did not run in time — run ${commands.length ? commands.join(" / ") : "pnpm typecheck and pnpm ds:guard"} again yourself with the shell tool now. Only if that also does not finish in time, tell the user which checks are left and ask them to run that command in a VS Code terminal. Do not report that every check passed.`;
}
export function sharedChecks(root, names, pages, deadline) {
  const paths = [...names.map((name) => `src/components/${name}/`), ...pages.map((name) => `${PAGES_DIR}/${name}Page`)];
  const options = { cwd: root, encoding: "utf8", env: { ...process.env, DS_ROOT: root } };
  const guard = budgetRun(process.execPath, [join(root, "scripts/ds.mjs"), "guard"], options, deadline);
  const problems = [];
  // 이 부품(페이지) 파일의 줄만 문제로 넣는다. 다른 부품의 오류 줄은 others 로만 알린다(Q-69 C①: 이 부품 몫으로 세지 않는다).
  let others = false;
  let inError = false;
  for (const raw of `${guard.stdout || ""}${guard.stderr || ""}`.replace(/\x1b\[[0-9;]*m/g, "").split("\n")) {
    const line = raw.trim(), header = line.match(/^(오류|경고|Error|Warning) G\d+/);
    if (header) inError = header[1] === "오류" || header[1] === "Error";
    else if (/^\s{2}\S/.test(raw)) inError = false; // 요약 줄(Errors 5 · Warnings 20 등). 항목 줄은 더 들여 쓴다.
    else if (inError && paths.some((path) => line.startsWith(path))) problems.push(`- Guard error: ${line}`);
    else if (inError && line) others = true;
  }
  const tsc = budgetRun(process.execPath, [join(root, "node_modules/typescript/bin/tsc"), "--noEmit"], options, deadline);
  const tscLines = `${tsc.stdout || ""}${tsc.stderr || ""}`.split("\n");
  const errors = tscLines.filter((line) => paths.some((path) => line.split("\\").join("/").includes(path)) || (pages.length && /error TS\d+:/.test(line)));
  if (errors.length) problems.push("- Type errors:", ...errors.slice(0, 20), ...(errors.length > 20 ? [`  … and ${errors.length - 20} more`] : []));
  if (!pages.length && tscLines.some((line) => /error TS\d+:/.test(line) && !paths.some((path) => line.split("\\").join("/").includes(path)))) others = true;
  return { problems, others, incomplete: guard.incomplete || tsc.incomplete };
}

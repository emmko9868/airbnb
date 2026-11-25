/** hook이 끝난 뒤에도 자료를 완성하는 단일 프로세스. 자식 프로세스는 만들지 않는다. */
import { figmaContext, figmaRequest } from "./figma-context.mjs";
import { boundedMs, FIGMA_FAILED, finishJob, jobPaths, readOwner, writeOwner } from "./lib/figma-jobs.mjs";

const [root, message, token, start] = process.argv.slice(2);
const request = figmaRequest(message, root);
if (!request) process.exit(1);
const paths = jobPaths(request);
const owner = readOwner(paths.lock);
if (owner?.token !== token) process.exit(0);
writeOwner(paths.lock, { ...owner, pid: process.pid });
const budget = boundedMs(process.env.DS_FIGMA_JOB_TIMEOUT_MS, 300_000, 300_000);
let finished = false;
function finish(context, error) {
  if (finished) return;
  finished = true;
  try { finishJob(paths, token, { context, ...(error ? { error } : {}) }); } finally { process.exit(error ? 1 : 0); }
}
// 전체 상한이 지나면 진행 중 fetch도 프로세스 종료로 정리된다.
const timer = setTimeout(() => finish(FIGMA_FAILED, "The background read timed out"), Math.max(1, budget - (Date.now() - Number(start))));
process.on("SIGTERM", () => finish(FIGMA_FAILED, "The background read was stopped"));
process.on("SIGINT", () => finish(FIGMA_FAILED, "The background read was stopped"));
try { const context = await figmaContext(message, root); clearTimeout(timer); finish(context || FIGMA_FAILED); }
catch (error) { clearTimeout(timer); finish(FIGMA_FAILED, error.message); }

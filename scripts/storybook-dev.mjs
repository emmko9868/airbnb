#!/usr/bin/env node
/**
 * pnpm storybook — 이 폴더의 Storybook 을 하나만 띄운다 (Q-73). 의존성 0.
 *
 *   node scripts/storybook-dev.mjs [-p 6006] [storybook dev 의 다른 인자]
 *
 * 설치(setup-local) 마지막이 6006 에 Storybook 을 띄워 두는데, AI 가 "보여 주겠다"며 pnpm storybook 을 백그라운드로
 * 또 실행하면 포트가 겹쳐 6007 에 두 번째 Storybook 이 생겼다(2026-11-15 Card·Button 시험). 그 백그라운드 프로세스가
 * 나중에 꺼지면 Qwen 이 "끝났다" 알림을 옛 대화에 넣고, 캐시가 사라진 그 대화가 정가로 한 번 더 답한다.
 *
 * 그래서 새로 띄우기 전에 본다.
 *  1. 이 스크립트가 띄운 기록(node_modules/.cache/ds-storybook.json: pid·port·root)의 pid 가 살아 있고 그 포트가 열려 있으면
 *     → 이 폴더의 Storybook 이다. 주소만 알리고 0 으로 끝낸다.
 *  2. 기록이 없어도 요청한 포트가 이미 열려 있으면 새로 띄우지 않는다. 그 포트를 쓰는 프로세스의 폴더를 알 수 있으면(lsof)
 *     이 폴더인지 알려 주고, 모르면 "이 프로젝트가 아니면 그 창을 닫고 다시 실행" 을 덧붙인다. 0 으로 끝낸다.
 *  3. 아니면 storybook dev 를 띄우고 기록을 남긴다. Storybook 이 끝나면 기록을 지운다.
 * 테스트는 DS_STORYBOOK_BIN 으로 가짜 storybook 을 넣는다.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { connect } from "node:net";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const cacheDir = join(root, "node_modules", ".cache");
const recordFile = join(cacheDir, "ds-storybook.json");
export const DEFAULT_PORT = 6006;

/** -p/--port 를 꺼내고 나머지 인자는 그대로 둔다. */
export function parseArgs(argv) {
  const rest = [];
  let port = DEFAULT_PORT;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const inline = arg.match(/^(?:-p|--port)=(\d+)$/);
    if (inline) { port = Number(inline[1]); continue; }
    if ((arg === "-p" || arg === "--port") && /^\d+$/.test(argv[i + 1] ?? "")) { port = Number(argv[i + 1]); i += 1; continue; }
    rest.push(arg);
  }
  return { port, rest };
}

const alive = (pid) => {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); return true; } catch (error) { return error.code === "EPERM"; }
};

/** 그 포트에 무엇이 듣고 있으면 true (IPv4·IPv6 둘 다 본다). */
function portOpen(port, timeoutMs = 700) {
  const tryHost = (host) => new Promise((done) => {
    const socket = connect({ host, port });
    const finish = (open) => { socket.destroy(); done(open); };
    socket.setTimeout(timeoutMs, () => finish(false));
    socket.once("connect", () => finish(true));
    socket.once("error", () => finish(false));
  });
  return tryHost("127.0.0.1").then((open) => open || tryHost("::1"));
}

function readRecord() {
  try { return JSON.parse(readFileSync(recordFile, "utf8")); } catch { return null; }
}

const same = (a, b) => {
  try { return realpathSync(a) === realpathSync(b); } catch { return resolve(a) === resolve(b); }
};

/** macOS·Linux: 그 포트를 듣는 프로세스의 작업 폴더. 알 수 없으면 null(Windows·lsof 없음). */
function listenerFolder(port) {
  if (process.platform === "win32") return null;
  const pids = spawnSync("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"], { encoding: "utf8" });
  const pid = pids.status === 0 ? pids.stdout.trim().split(/\s+/)[0] : "";
  if (!pid) return null;
  const cwd = spawnSync("lsof", ["-a", "-p", pid, "-d", "cwd", "-Fn"], { encoding: "utf8" });
  return cwd.stdout?.split("\n").find((line) => line.startsWith("n"))?.slice(1) || null;
}

const address = (port) => `http://localhost:${port}/`;
export const RUNNING = (port) => `Storybook is already running for this project at ${address(port)} — nothing new was started. Open that address. Do not start another Storybook or change its port.`;
export const PORT_BUSY = (port, folder) => folder
  ? `Port ${port} is already used by a Storybook from another folder (${folder}), so nothing was started. Close that terminal (Ctrl+C), then run pnpm storybook again.`
  : `Port ${port} is already in use (usually the Storybook from the install terminal), so nothing new was started. Open ${address(port)}. If it is not this project, close that terminal (Ctrl+C) and run pnpm storybook again.`;

async function main() {
  const { port, rest } = parseArgs(process.argv.slice(2));
  const record = readRecord();
  if (record && same(record.root ?? "", root) && alive(record.pid) && await portOpen(record.port)) {
    console.log(RUNNING(record.port));
    return 0;
  }
  if (await portOpen(port)) {
    const folder = listenerFolder(port);
    console.log(folder && same(folder, root) ? RUNNING(port) : PORT_BUSY(port, folder));
    return 0;
  }
  const bin = process.env.DS_STORYBOOK_BIN || join(root, "node_modules", "storybook", "bin", "index.cjs");
  if (!existsSync(bin)) {
    console.error("Storybook is not installed in this folder. Run the install command (setup-local) first.");
    return 1;
  }
  // 기록은 띄우기 전에 남긴다(이 스크립트의 pid 라 미리 안다). 그 사이에 다시 실행해도 같은 판단을 한다.
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(recordFile, JSON.stringify({ pid: process.pid, port, root, startedAt: new Date().toISOString() }));
  } catch {}
  const forget = () => {
    if (readRecord()?.pid === process.pid) rmSync(recordFile, { force: true });
  };
  const child = spawn(process.execPath, [bin, "dev", "-p", String(port), ...rest], { cwd: root, stdio: "inherit" });
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) process.on(signal, () => { child.kill(signal); });
  return new Promise((done) => {
    child.once("error", (error) => { forget(); console.error(error.message); done(1); });
    child.once("exit", (code, signal) => { forget(); done(code ?? (signal ? 1 : 0)); });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => process.exit(code), (error) => { console.error(error.message); process.exit(1); });
}

#!/usr/bin/env node
/** Qwen Code · Claude Code의 Figma Desktop MCP 설정과 로컬 HTTP 연결을 확인한다. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const serverName = "figma-desktop";
const desktopUrl = "http://127.0.0.1:3845/mcp";
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function ensureFigmaMcpConfig(projectRoot) {
  const updates = [];
  for (const filename of [".qwen/settings.json", ".mcp.json"]) {
    const path = join(projectRoot, filename);
    let config = {};
    if (existsSync(path)) {
      try { config = JSON.parse(readFileSync(path, "utf8")); }
      catch { throw new Error(`${filename} is not valid JSON. Fix it and try again. Your existing settings were not changed.`); }
    }
    if (!isObject(config) || (config.mcpServers !== undefined && !isObject(config.mcpServers))) {
      throw new Error(`mcpServers in ${filename} must be a JSON object. Your existing settings were not changed.`);
    }
    const previous = config.mcpServers?.[serverName];
    if (previous !== undefined && !isObject(previous)) {
      throw new Error(`${serverName} in ${filename} must be a JSON object. Your existing settings were not changed.`);
    }
    const qwen = filename === ".qwen/settings.json";
    // 이전 버전이 잘못 등록한 기본 HTTP 설정만 옮긴다. 주소·인증·추가 옵션은 보존한다.
    const migrate = qwen && previous?.type === "http" && previous.url === desktopUrl && !Object.hasOwn(previous, "httpUrl");
    if (previous !== undefined && !migrate) continue;
    config.mcpServers ??= {};
    if (migrate) {
      const { type, url, ...options } = previous;
      config.mcpServers[serverName] = { ...options, httpUrl: url };
    } else {
      config.mcpServers[serverName] = qwen ? { httpUrl: desktopUrl } : { type: "http", url: desktopUrl };
    }
    updates.push({ path, config, filename });
  }
  // 두 파일을 모두 읽고 검증한 뒤에 저장한다. 잘못된 JSON 때문에 한 파일만 바뀌지 않게 한다.
  for (const { path, config } of updates) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(config, null, 2) + "\n");
  }
  return updates.map(({ filename }) => filename);
}

async function initializeResponse(response) {
  if (!response.headers.get("content-type")?.includes("text/event-stream")) return JSON.parse(await response.text());
  // SSE 연결이 열린 채 유지되어도 initialize 응답을 받으면 즉시 반환한다.
  const reader = response.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1024 * 1024) throw new Error("MCP response too large");
      buffer += decoder.decode(value, { stream: true });
      let match;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        const block = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        const data = block.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).replace(/^ /, "")).join("\n");
        if (!data) continue;
        const event = JSON.parse(data);
        if (event?.id === 1) return event;
      }
    }
    return null;
  } finally { await reader.cancel().catch(() => {}); }
}

export async function checkFigmaMcpConnection({ fetch: request = globalThis.fetch, timeoutMs = 5_000 } = {}) {
  try {
    const response = await request(desktopUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {
        protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "ds-starter-connection-check", version: "1" },
      } }),
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "error",
    });
    if (!response.ok) { await response.body?.cancel(); return false; }
    const event = await initializeResponse(response);
    return event?.jsonrpc === "2.0" && event.id === 1 && !event.error &&
      typeof event.result?.protocolVersion === "string" && isObject(event.result.capabilities) &&
      typeof event.result.serverInfo?.name === "string" && typeof event.result.serverInfo?.version === "string";
  } catch { return false; }
}

export async function setupFigmaMcp(projectRoot = root, { fetch, log = console.log, platform = process.platform, timeoutMs } = {}) {
  const changed = ensureFigmaMcpConfig(projectRoot);
  log(changed.length ? `Figma MCP settings added: ${changed.join(" · ")}` : "Figma MCP settings: already set up.");
  if (!existsSync(join(projectRoot, "node_modules"))) {
    log(platform === "win32"
      ? "Project packages are not installed yet. For the first install, run powershell -NoProfile -ExecutionPolicy Bypass -File .\\setup-local.ps1"
      : "Project packages are not installed yet. For the first install, run bash setup-local.sh in this folder.");
  }
  const connected = await checkFigmaMcpConnection({ fetch, timeoutMs });
  if (connected) log("Figma MCP connection: figma-desktop connected");
  else {
    log("Figma MCP settings are ready, but the server did not answer. Storybook still starts.");
    log("In Figma Desktop, open a design file and turn on Shift+D → Enable desktop MCP server.");
    log("After turning it on, ask the AI in the Qwen chat to check the Figma connection again (it runs pnpm mcp:setup).");
  }
  return { changed, connected };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await setupFigmaMcp(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

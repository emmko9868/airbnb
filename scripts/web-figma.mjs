/**
 * Figma 화면(프레임) 하나의 사진을 Figma Desktop MCP 로 받아 웹사이트 비교용으로 저장한다. (의존성 0)
 *
 *   pnpm web:figma [<Page>] "<Figma 링크>" [--replace]
 *
 * 학생이 치는 명령이 아니다. /my-website 를 따르는 AI 가 셸 도구로 실행한다(학생은 허락만 한다).
 * <Page> 를 빼면 Figma 프레임 이름에서 만든다(menu page → Menu).
 *
 * 1. MCP 연결과 도구(get_screenshot·get_metadata)부터 확인한다.
 * 2. 도구는 2번만 부른다: get_metadata(크기·이름) → get_screenshot(사진).
 *    대화창 훅이 같은 링크를 큰 프레임으로 막으며 30분 안에 저장한 metadata(var/figma-screens)가 있으면 get_metadata 를 다시 부르지 않는다.
 * 3. my-website/figma/<Page>.png · .json(기록) · .layers.xml(구조 참고)을 저장한다.
 *
 * 이 사진은 완성된 사이트와 눈으로 비교하는 증거다(pnpm web:compare). 페이지에 넣는 그림이 아니다.
 * MCP 를 쓸 수 없을 때의 예비책으로만 학생이 Figma 에서 직접 PNG(1x)로 내보내 같은 이름으로 넣는다.
 */
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { figmaNodeId, rpc, RATE_LIMIT_TERMINAL, screenMetadataFile } from "./figma-context.mjs";

export const FIGMA_DIR = "my-website/figma";
export const PAGE_NAME = /^[A-Z][A-Za-z0-9]*$/;
export const pageNameProblem = (name) => !PAGE_NAME.test(String(name ?? ""))
  ? `The page name must be one word that starts with a capital letter, like Home or Menu. You wrote: ${name ?? "(nothing)"}`
  : /Page$/.test(name) ? `Leave out "Page" at the end: write ${name.replace(/Page$/, "") || "Home"}, the same name as in your page plan.` : null;

/** Figma 프레임 이름 → 페이지 이름. 영문·숫자 단어를 PascalCase 로 잇고 앞 숫자와 끝 "Page" 를 뺀다. 못 만들면 null. */
export function pageNameFromFrame(frameName) {
  const words = String(frameName ?? "").match(/[A-Za-z0-9]+/g) || [];
  while (words.length && /^\d/.test(words[0])) words.shift();
  let name = words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
  name = name.replace(/Page$/, "");
  return PAGE_NAME.test(name) ? name : null;
}

/** 훅이 저장한 metadata 를 다시 쓰는 시간 */
export const SCREEN_METADATA_MINUTES = 30;

/** 같은 링크의 훅 metadata 가 30분 안에 저장됐으면 그 내용. 없거나 오래됐거나 읽을 수 없으면 null. */
export function recentScreenMetadata(root, fileKey, nodeId, now = Date.now()) {
  try {
    const file = screenMetadataFile(root, fileKey, nodeId);
    if (now - statSync(file).mtimeMs > SCREEN_METADATA_MINUTES * 60_000) return null;
    const text = readFileSync(file, "utf8");
    return text.trim() ? text : null;
  } catch { return null; }
}

const isFigmaLink = (arg) => /figma\.com\//i.test(String(arg ?? ""));

const NO_PICTURE = (page) => `The Figma MCP did not return a picture. In Figma, select the frame, choose Export → PNG (1x), and save it as ${FIGMA_DIR}/${page}.png.`;
const NOT_CONNECTED = "Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server.";

/** PNG 머리(IHDR)에서 픽셀 크기를 읽는다. PNG 가 아니면 null. */
export function pngSize(buffer) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!buffer || buffer.length < 24 || signature.some((byte, index) => buffer[index] !== byte) || buffer.toString("latin1", 12, 16) !== "IHDR") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

/** get_metadata 결과에서 요청한 노드의 종류·이름·크기. 못 찾으면 첫 요소. */
export function frameFacts(metadata, nodeId) {
  const tags = [...String(metadata).matchAll(/<([a-zA-Z_-]+)\b([^>]*?)\/?>/g)];
  const attrs = (tag) => Object.fromEntries([...tag[2].matchAll(/([\w-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
  const tag = tags.find((item) => attrs(item).id === nodeId) || tags[0];
  if (!tag) return { nodeName: null, nodeType: null, frameWidth: null, frameHeight: null };
  const found = attrs(tag);
  const number = (value) => Number.isFinite(Number(value)) && Number(value) > 0 ? Math.round(Number(value)) : null;
  return { nodeName: found.name ?? null, nodeType: tag[1], frameWidth: number(found.width), frameHeight: number(found.height) };
}

/** get_screenshot 결과에서 그림 하나를 꺼낸다. 응답 모양이 확인되지 않아 image·resource(blob) 둘 다 받는다. */
export function screenshotImage(result) {
  for (const item of result?.content || []) {
    const data = item?.type === "image" ? item.data : item?.type === "resource" && /^image\//.test(item.resource?.mimeType || "") ? item.resource.blob : null;
    if (typeof data !== "string" || !data) continue;
    const buffer = Buffer.from(data, "base64");
    return { buffer, mimeType: item.mimeType || item.resource?.mimeType || null, size: pngSize(buffer) };
  }
  return null;
}

class Stop extends Error {}

/** 실제 동작. 로그는 log/err 로 내보내고, 실패하면 Stop 을 던진다(종료 코드는 호출한 쪽이 정한다). */
export async function saveFigmaScreen(root, args, { log = console.log } = {}) {
  const replace = args.includes("--replace");
  const rest = args.filter((arg) => arg !== "--replace");
  const named = !(rest.length === 1 && isFigmaLink(rest[0]));
  let [page, link] = named ? rest : [null, rest[0]];
  if ((named && !page) || !link || rest.length > 2) throw new Stop('Usage: pnpm web:figma [<Page>] "<Figma link>" [--replace]   Example: pnpm web:figma Home "https://www.figma.com/design/…?node-id=1-2"');
  const nameProblem = named ? pageNameProblem(page) : null;
  if (nameProblem) throw new Stop(nameProblem);
  const nodeId = figmaNodeId(link);
  const fileKey = String(link).match(/figma\.com\/(?:design|file)\/([^/?\s]+)/i)?.[1] || null;
  if (!nodeId || !fileKey) throw new Stop("The link has no node-id. In Figma, select the page frame, choose Copy link to selection, and use that link.");
  const filesOf = (name) => ({ png: `${FIGMA_DIR}/${name}.png`, json: `${FIGMA_DIR}/${name}.json`, layers: `${FIGMA_DIR}/${name}.layers.xml` });
  // 이름을 줬으면 MCP 전에, 프레임 이름으로 만들었으면 get_metadata 뒤·get_screenshot 전에 검사한다.
  const refuseOverwrite = (name) => {
    const existing = Object.values(filesOf(name)).filter((file) => existsSync(join(root, file)));
    if (existing.length && !replace) throw new Stop(`Already saved: ${existing.join(", ")}. To read the screen again and replace it, run: pnpm web:figma ${name} "${link}" --replace`);
  };
  if (named) refuseOverwrite(page);

  let session, tools;
  try {
    session = (await rpc(1, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "ds-starter", version: "1" } })).session;
    tools = (await rpc(2, "tools/list", {}, session)).result.tools || [];
  } catch (error) {
    throw new Stop(/rate limit/i.test(error.message) ? RATE_LIMIT_TERMINAL : `${NOT_CONNECTED} (${error.message})`);
  }
  const names = new Set(tools.map((tool) => tool?.name));
  const missing = ["get_metadata", "get_screenshot"].filter((name) => !names.has(name));
  if (missing.length) throw new Stop(`The Figma MCP is running, but it has no ${missing.join(" or ")} tool. Update the Figma desktop app, turn on Dev Mode → Enable desktop MCP server, then try again.`);
  log("Figma MCP: connected.");

  const call = async (id, name, timeoutMs) => {
    try { return await rpc(id, "tools/call", { name, arguments: { nodeId, clientLanguages: "typescript,css", clientFrameworks: "react" } }, session, timeoutMs); }
    catch (error) { throw new Stop(/rate limit/i.test(error.message) ? RATE_LIMIT_TERMINAL : `Figma MCP error: ${error.message}`); }
  };
  const reused = recentScreenMetadata(root, fileKey, nodeId);
  if (reused) log("Figma frame details: reused from the chat check a moment ago.");
  const metadata = reused ?? (await call(3, "get_metadata", 15_000)).text;
  const frame = frameFacts(metadata, nodeId);
  log(`Frame: ${frame.nodeName ?? "(no name)"} (${frame.nodeType ?? "unknown type"}) · ${frame.frameWidth ?? "?"} × ${frame.frameHeight ?? "?"}`);
  if (!named) {
    page = pageNameFromFrame(frame.nodeName);
    if (!page) throw new Stop(`Could not make a page name from the Figma frame name "${frame.nodeName ?? ""}". Add the page name: pnpm web:figma <Page> "${link}"`);
    log(`Page name: ${page} (from the Figma frame "${frame.nodeName}")`);
    refuseOverwrite(page);
  }
  const files = filesOf(page);
  // 큰 화면은 그림을 만드는 데 오래 걸릴 수 있다.
  const image = screenshotImage((await call(4, "get_screenshot", 60_000)).result);
  if (!image?.size) throw new Stop(NO_PICTURE(page) + (image ? ` (The answer was ${image.mimeType || "not a PNG"}, not a PNG picture.)` : ""));

  mkdirSync(join(root, FIGMA_DIR), { recursive: true });
  writeFileSync(join(root, files.png), image.buffer);
  writeFileSync(join(root, files.layers), String(metadata).endsWith("\n") ? String(metadata) : `${metadata}\n`);
  const record = { link, fileKey, nodeId, nodeName: frame.nodeName, frameWidth: frame.frameWidth, frameHeight: frame.frameHeight, pngWidth: image.size.width, pngHeight: image.size.height, savedAt: new Date().toISOString() };
  writeFileSync(join(root, files.json), `${JSON.stringify(record, null, 2)}\n`);
  log(`Saved: ${files.png} (${image.size.width} × ${image.size.height} px)`);
  if (frame.frameWidth && image.size.width !== frame.frameWidth) log(`The picture is ${image.size.width} px wide and the frame is ${frame.frameWidth} px wide. web:compare uses the frame width.`);
  log(`Saved: ${files.json}`);
  log(`Saved: ${files.layers} (layer names and sizes, for reading the structure)`);
  log(`This picture is only for comparing. It is not a picture for the page. After the page is made, the AI runs: pnpm web:compare ${page}`);
  return record;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
  try { await saveFigmaScreen(root, process.argv.slice(2)); }
  catch (error) {
    console.error(error instanceof Stop ? error.message : `web:figma failed: ${error.message}`);
    process.exit(1);
  }
}

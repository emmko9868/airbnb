/**
 * 완성된 사이트를 Figma 화면 사진 옆에 나란히 놓는 비교 페이지를 만든다. (의존성 0 — 이미 있는 vite·playwright 만 쓴다)
 *
 *   pnpm web:compare [<Page>...] [--width <px>]
 *
 * 1. web.config.json 의 승인된 페이지(schema 2)에서 이름 → 주소를 찾는다. 인자가 없으면 my-website/figma/<Page>.png 가 있는 모든 페이지.
 * 2. vite build → dist 를 127.0.0.1 임의 포트로 열고, Chromium 으로 Figma 화면 너비에서 전체 페이지를 찍는다.
 * 3. var/compare/<Page>/figma.png · site.png · index.html(나란히 + 겹쳐 보기)을 만든다.
 *
 * 사실만 알린다. 픽셀 비교·일치율·통과/실패 판정은 하지 않는다(.claude/rules/sync-policy.md "픽셀 비교 금지").
 * 글꼴·브라우저 차이 때문에 완전히 같을 수 없으므로 판단은 사람이 눈으로 한다.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { escapeHtml, readWebProject } from "./lib/web-project.mjs";
import { FIGMA_DIR, pngSize } from "./web-figma.mjs";

export const COMPARE_DIR = "var/compare";
export const NO_SCORE = (page) => `Open ${COMPARE_DIR}/${page}/index.html and compare them with your own eyes. There is no automatic match score.`;
const VIEWPORT_HEIGHT = 900;
const NO_PAGES = "No approved pages are connected yet. Pages and their addresses are made from your approved plan: the AI runs pnpm ds:page docs/plans/pages/<Site>.md first.";
const noPicture = (page) => `No Figma picture for ${page}. The AI saves it from the Figma screen link with pnpm web:figma ${page} "<Figma link>". If the Figma MCP does not work, in Figma select the frame, choose Export → PNG (1x), and save it as ${FIGMA_DIR}/${page}.png.`;

class Stop extends Error {}

/** 승인된 페이지와 사진을 맞춰 비교할 목록을 정한다. 브라우저·빌드는 부르지 않는다. */
export function comparePlan(root, args) {
  const widthAt = args.indexOf("--width");
  let forcedWidth = null;
  if (widthAt >= 0) {
    forcedWidth = Number(args[widthAt + 1]);
    if (!Number.isInteger(forcedWidth) || forcedWidth < 200 || forcedWidth > 5000) throw new Stop("--width needs a whole number of CSS pixels between 200 and 5000. Example: --width 1440");
  }
  const names = args.filter((_, index) => widthAt < 0 || (index !== widthAt && index !== widthAt + 1));
  let web;
  try { web = readWebProject(root); }
  catch (error) { throw new Stop(/No web page is connected yet/.test(error.message) ? NO_PAGES : error.message); }
  if (web.schema_version !== 2) throw new Stop(NO_PAGES);
  const byName = new Map(web.pages.map((page) => [page.name, page]));
  const notes = [];
  let selected;
  if (names.length) {
    const unknown = names.filter((name) => !byName.has(name));
    if (unknown.length) throw new Stop(`No approved page named ${unknown.join(", ")} in web.config.json. Pages: ${[...byName.keys()].join(", ")}.`);
    const missing = names.filter((name) => !existsSync(join(root, FIGMA_DIR, `${name}.png`)));
    if (missing.length) throw new Stop(missing.map(noPicture).join("\n"));
    selected = names.map((name) => byName.get(name));
  } else {
    selected = web.pages.filter((page) => existsSync(join(root, FIGMA_DIR, `${page.name}.png`)));
    for (const page of web.pages.filter((item) => !selected.includes(item))) notes.push(`Skipped ${page.name}: ${noPicture(page.name)}`);
    const pictures = existsSync(join(root, FIGMA_DIR)) ? readdirSync(join(root, FIGMA_DIR)).filter((file) => /^[A-Z][A-Za-z0-9]*\.png$/.test(file)) : [];
    for (const file of pictures.filter((item) => !byName.has(item.slice(0, -4)))) notes.push(`Skipped ${FIGMA_DIR}/${file}: there is no approved page named ${file.slice(0, -4)} yet. Make it with pnpm ds:page first.`);
    if (!selected.length) throw new Stop([...notes, "Nothing to compare yet."].join("\n"));
  }
  const pages = selected.map((page) => {
    const png = join(root, FIGMA_DIR, `${page.name}.png`);
    const size = pngSize(readFileSync(png));
    if (!size) throw new Stop(`${FIGMA_DIR}/${page.name}.png is not a PNG picture. Export the frame again as PNG (1x).`);
    let record = {};
    try { record = JSON.parse(readFileSync(join(root, FIGMA_DIR, `${page.name}.json`), "utf8")); } catch {}
    const [width, widthFrom] = forcedWidth ? [forcedWidth, "--width"]
      : Number.isInteger(record.frameWidth) && record.frameWidth > 0 ? [record.frameWidth, `${page.name}.json frameWidth`]
      : [size.width, "picture width, read as 1x"];
    return { name: page.name, path: page.path, png, figma: size, width, widthFrom };
  });
  return { web, pages, notes };
}

/** 나란히 보기 + 겹쳐 보기(투명도 슬라이더). 외부 자원 없음, 점수 없음. */
export function compareHtml({ name, path, width, figma, site }) {
  const figmaHeight = Math.round(figma.height * width / figma.width);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(name)} — Figma and site</title>
<style>
  body { margin: 0; font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; background: #f4f4f5; color: #18181b; }
  header { position: sticky; top: 0; z-index: 2; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #d4d4d8; }
  h1 { margin: 0 0 4px; font-size: 18px; }
  p { margin: 0; }
  nav { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 8px; }
  button { font: inherit; padding: 4px 12px; border: 1px solid #a1a1aa; border-radius: 6px; background: #ffffff; cursor: pointer; }
  button[aria-pressed="true"] { background: #18181b; color: #ffffff; }
  main { padding: 16px; overflow-x: auto; }
  .side { display: flex; gap: 24px; align-items: flex-start; width: max-content; }
  figure { margin: 0; }
  figcaption { font-weight: 600; margin-bottom: 4px; }
  img { display: block; outline: 1px solid #a1a1aa; background: #ffffff; }
  .overlay { position: relative; width: ${width}px; }
  .overlay .top { position: absolute; top: 0; left: 0; }
  [hidden] { display: none !important; }
</style>
</head>
<body>
<header>
  <h1>${escapeHtml(name)} · ${escapeHtml(path)}</h1>
  <p>Figma picture ${figma.width} × ${figma.height} px, shown ${width} px wide · Site screenshot ${site.width} × ${site.height} px at a ${width} px wide window.</p>
  <p>Look for differences in sections, order, words, colors, spacing, pictures and missing parts. Fonts and browsers draw a little differently, so small differences are normal. There is no automatic match score.</p>
  <nav>
    <button type="button" id="show-side" aria-pressed="true">Side by side</button>
    <button type="button" id="show-overlay" aria-pressed="false">Overlay</button>
    <label id="opacity-label" hidden>Site opacity <input type="range" id="opacity" min="0" max="100" value="50"> <output id="opacity-value">50%</output></label>
  </nav>
</header>
<main>
  <div class="side" id="side">
    <figure><figcaption>Figma</figcaption><img src="figma.png" alt="Figma screen for ${escapeHtml(name)}" width="${width}" height="${figmaHeight}"></figure>
    <figure><figcaption>Site</figcaption><img src="site.png" alt="Website screenshot of ${escapeHtml(path)}" width="${site.width}" height="${site.height}"></figure>
  </div>
  <div class="overlay" id="overlay" hidden>
    <img src="figma.png" alt="Figma screen for ${escapeHtml(name)}" width="${width}" height="${figmaHeight}">
    <img class="top" id="overlay-site" src="site.png" alt="Website screenshot of ${escapeHtml(path)}" width="${site.width}" height="${site.height}" style="opacity: 0.5">
  </div>
</main>
<script>
  const side = document.getElementById("side"), overlay = document.getElementById("overlay"), label = document.getElementById("opacity-label");
  const sideButton = document.getElementById("show-side"), overlayButton = document.getElementById("show-overlay");
  function show(mode) {
    side.hidden = mode !== "side"; overlay.hidden = label.hidden = mode !== "overlay";
    sideButton.setAttribute("aria-pressed", String(mode === "side")); overlayButton.setAttribute("aria-pressed", String(mode === "overlay"));
  }
  sideButton.addEventListener("click", () => show("side"));
  overlayButton.addEventListener("click", () => show("overlay"));
  document.getElementById("opacity").addEventListener("input", (event) => {
    document.getElementById("overlay-site").style.opacity = String(event.target.value / 100);
    document.getElementById("opacity-value").textContent = event.target.value + "%";
  });
</script>
</body>
</html>
`;
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".json": "application/json", ".ico": "image/x-icon" };

/** dist 를 연다. 설정된 주소는 index.html, 나머지는 dist 안의 파일만. */
export function serveDist(dist, routes) {
  const paths = new Set(routes.map((route) => route.replace(/\/+$/, "") || "/"));
  const server = createServer((request, response) => {
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname); } catch { response.writeHead(400); response.end(); return; }
    const route = pathname.replace(/\/+$/, "") || "/";
    const file = paths.has(route) ? join(dist, "index.html") : resolve(dist, `.${pathname}`);
    const inside = relative(dist, file);
    if (inside.startsWith("..") || isAbsolute(inside) || !existsSync(file) || !extname(file)) { response.writeHead(404); response.end(); return; }
    response.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" });
    response.end(readFileSync(file));
  });
  return new Promise((ready) => server.listen(0, "127.0.0.1", () => ready(server)));
}

export async function runCompare(root, args, { log = console.log } = {}) {
  const { web, pages, notes } = comparePlan(root, args);
  notes.forEach((note) => log(note));

  let chromium;
  try { ({ chromium } = await import("playwright")); } catch {}
  if (!chromium || !existsSync(chromium.executablePath())) throw new Stop("The Playwright browser is not installed. In a terminal, run: pnpm exec playwright install chromium");

  log("Building the website (vite build)…");
  const viteDir = join(root, "node_modules/vite");
  if (!existsSync(join(viteDir, "package.json"))) throw new Stop("Project packages are not installed yet. Run the setup script first.");
  const viteBin = join(viteDir, JSON.parse(readFileSync(join(viteDir, "package.json"), "utf8")).bin.vite);
  const build = spawnSync(process.execPath, [viteBin, "build"], { cwd: root, encoding: "utf8", timeout: 180_000 });
  if (build.status !== 0) throw new Stop(`The website build failed, so there is nothing to compare. Fix this first (pnpm web:build shows the same):\n${String(build.stderr || build.stdout || build.error?.message || "").trim().split("\n").slice(-15).join("\n")}`);

  const server = await serveDist(join(root, "dist"), web.routes);
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const page of pages) {
      const tab = await browser.newPage({ viewport: { width: page.width, height: VIEWPORT_HEIGHT }, deviceScaleFactor: 1 });
      const errors = [];
      tab.on("pageerror", (error) => errors.push(error.message));
      await tab.goto(`http://127.0.0.1:${server.address().port}${page.path}`, { waitUntil: "networkidle" });
      await tab.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((img) => img.complete ? null : new Promise((done) => { img.onload = img.onerror = done; }))); });
      const out = join(root, COMPARE_DIR, page.name);
      mkdirSync(out, { recursive: true });
      const sitePng = await tab.screenshot({ path: join(out, "site.png"), fullPage: true });
      await tab.close();
      copyFileSync(page.png, join(out, "figma.png"));
      const site = pngSize(sitePng);
      writeFileSync(join(out, "index.html"), compareHtml({ name: page.name, path: page.path, width: page.width, figma: page.figma, site }));
      log(`${page.name} · ${page.path} · window ${page.width} × ${VIEWPORT_HEIGHT} (width from ${page.widthFrom})`);
      log(`  Figma picture: ${page.figma.width} × ${page.figma.height} px · Site screenshot: ${site.width} × ${site.height} px`);
      for (const file of ["figma.png", "site.png", "index.html"]) log(`  ${COMPARE_DIR}/${page.name}/${file}`);
      if (errors.length) log(`  The page had ${errors.length} script error(s) in the browser: ${errors.slice(0, 3).join(" / ")}`);
      log(NO_SCORE(page.name));
      results.push({ ...page, site, errors });
    }
  } finally {
    await browser.close();
    await new Promise((done) => server.close(done));
  }
  return results;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
  try { await runCompare(root, process.argv.slice(2)); }
  catch (error) {
    console.error(error instanceof Stop ? error.message : `web:compare failed: ${error.message}`);
    process.exit(1);
  }
}

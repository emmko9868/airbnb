#!/usr/bin/env node
/**
 * my-assets 분류·검사·정리. AI 를 부르지 않는다 (크레딧 0).
 *
 *   pnpm assets                                   my-assets/ 바로 아래 파일을 icons·images·typo 로 나누고 이름 정리·검사
 *   pnpm assets --to <icons|images|typo> <파일>…    애매해서 남은 파일을 학생이 고른 폴더로 옮긴다(my-assets 안의 경로)
 *
 * 아이콘 이름 정리·SVG 안전성·viewBox 보충, 그림 이름 정리, 글꼴 이름(Family-Weight) 정리, Figma 글꼴과 대조,
 * 글자 토큰이 쓰는 글꼴을 보여 준다. 예전 my-assets/fonts 의 파일은 typo 로 옮긴다.
 *
 * 쓸 수 없는 파일(위험한 SVG·알 수 없는 형식·이름 충돌)이 있으면 종료 코드 1. 애매한 파일만 남으면 0 이고 목록으로 묻는다.
 * 학생 파일을 지우거나 내용을 바꾸지 않는다 — 옮기고 이름만 바꾼다(아이콘 viewBox 보충만 예외).
 * Qwen 의 /my-assets 명령이 이 출력을 읽고 설명한다.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ASSET_DIRS, FONT_EXT, IMAGE_EXT, LEGACY_FONT_DIR, SVG_EXT,
  checkSvg, classifySvg, fitsFolder, fontKey, fontPlan, iconFileName, isIgnored, kebabFileName, sizeText, sortTarget, svgDangers,
} from "./lib/assets.mjs";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const assetsDir = join(root, "my-assets");
const dirOf = (folder) => join(assetsDir, folder);
const out = (line = "") => process.stdout.write(`${line}\n`);
const rel = (path) => relative(assetsDir, path).split(sep).join("/");
const list = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => !isIgnored(f)).sort() : []);
const isDir = (path) => statSync(path).isDirectory();
const quote = (text) => `"${text}"`;

let problems = 0;
const problem = (label, why) => { problems++; out(`  ✗ ${label} — ${why}`); };
const waiting = [];
const BIG_PICTURE = 2 * 1024 * 1024;

const USAGE = [
  "Usage:",
  "  pnpm assets                                    sort and check everything in my-assets",
  "  pnpm assets --to <icons|images|typo> \"<file>\"   move a file you chose (its path inside my-assets)",
  "Windows: use pnpm.cmd instead of pnpm.",
].join("\n");

// ── 옵션 ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
let to = null;
const chosen = [];
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--help" || arg === "-h") { out(USAGE); process.exit(0); }
  else if (arg === "--to") to = args[++i] ?? "";
  else if (arg.startsWith("--to=")) to = arg.slice("--to=".length);
  else if (arg.startsWith("-")) { out(`Unknown option ${arg}.`); out(USAGE); process.exit(1); }
  else chosen.push(arg);
}
if (to !== null && !ASSET_DIRS.includes(to)) { out(`--to must be icons, images or typo (you wrote "${to}").`); out(USAGE); process.exit(1); }
if ((to === null) !== (chosen.length === 0)) { out(to === null ? "Say where the files go with --to icons, --to images or --to typo." : "Name at least one file after --to."); out(USAGE); process.exit(1); }

// Figma 텍스트 스타일이 쓰는 글꼴. 글꼴 파일 이름을 Figma 철자에 맞추고, 없는 글꼴을 알려 준다.
let figmaFamilies = [];
try { figmaFamilies = JSON.parse(readFileSync(join(root, ".ds", "figma-variables.json"), "utf8")).typography?.families ?? []; } catch {}

// ── 옮기기 ────────────────────────────────────────────────────────────

/** 대소문자만 다른 같은 파일인가 (macOS·Windows 는 Cart.svg 와 cart.svg 를 같은 파일로 본다). */
function caseOnlyRename(from, target) {
  if (from === target || from.toLowerCase() !== target.toLowerCase()) return false;
  try { const a = statSync(from), b = statSync(target); return a.ino === b.ino && a.dev === b.dev; } catch { return false; }
}

/** 폴더에 맞는 정리된 이름. 못 정하면 { problem }. */
function nameFor(folder, file, bytes) {
  if (folder === "typo") {
    const plan = fontPlan(file, bytes, figmaFamilies);
    return plan.problem ? { problem: plan.problem } : { name: plan.name, note: plan.from === "inside" ? "name read from the font file" : "" };
  }
  const name = folder === "icons" ? iconFileName(file) : kebabFileName(file);
  return name ? { name } : { problem: `Give the file a name with English letters or numbers, like ${folder === "icons" ? "arrow-right.svg" : "hero-photo.png"}.` };
}

/** 파일을 folder 로 옮기고 이름을 정리한다. 같은 이름이 이미 있으면 옮기지 않는다. 성공하면 새 경로. */
function place(from, folder, note = "", arrow = "→") {
  const n = nameFor(folder, basename(from), readFileSync(from));
  if (n.problem) { problem(rel(from), n.problem); return null; }
  const target = join(dirOf(folder), n.name);
  if (target === from) return target;
  if (existsSync(target) && !caseOnlyRename(from, target)) {
    problem(rel(from), `my-assets/${folder}/${n.name} already exists. Rename one of them, or remove the copy you don't need.`);
    return null;
  }
  mkdirSync(dirOf(folder), { recursive: true });
  const label = rel(from);
  renameSync(from, target);
  const why = [note, n.note].filter(Boolean).join(", ");
  out(`  ${arrow} ${label} → ${arrow === "↻" ? n.name : `${folder}/${n.name}`}${why ? ` (${why})` : ""}`);
  return target;
}

// ── 1. 학생이 고른 파일 (--to) ─────────────────────────────────────────
if (to) {
  out(`Your choice → my-assets/${to}`);
  for (const arg of chosen) {
    const inside = arg.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^my-assets\//, "");
    const path = resolve(assetsDir, inside);
    const back = relative(assetsDir, path);
    if (!back || back.startsWith("..") || isAbsolute(back)) { problem(arg, "Only files inside my-assets can be moved."); continue; }
    if (!existsSync(path) || isDir(path)) { problem(arg, "There is no such file in my-assets. Copy the exact name from the list."); continue; }
    if (!fitsFolder(to, basename(path))) {
      problem(arg, { typo: "Only font files (.woff2 .woff .ttf .otf) go in typo.", icons: "Only .svg files go in icons.", images: "Only pictures (.png .jpg .jpeg .webp .gif .avif .svg) go in images." }[to]);
      continue;
    }
    if (SVG_EXT.test(path)) {
      const dangers = svgDangers(readFileSync(path, "utf8"));
      if (dangers.length) { problem(arg, dangers.join(" ")); continue; }
    }
    place(path, to, "your choice");
  }
  out("");
}

// ── 2. 나누기: my-assets 바로 아래 · 예전 fonts 폴더 · 다른 폴더에 잘못 들어간 파일 ──
out("Sorting (my-assets)");
const loose = [];
for (const file of list(assetsDir)) {
  const path = join(assetsDir, file);
  if (!isDir(path)) { loose.push(path); continue; }
  if (ASSET_DIRS.includes(file) || file === LEGACY_FONT_DIR) continue;
  problem(`${file}/`, "Folders inside my-assets aren't sorted. Move the files out of this folder into my-assets, then ask the AI to sort my-assets again (it runs pnpm assets).");
}
const legacyDir = dirOf(LEGACY_FONT_DIR);
const legacy = existsSync(legacyDir) && isDir(legacyDir);
if (legacy) {
  for (const file of list(legacyDir)) {
    const path = join(legacyDir, file);
    if (isDir(path)) problem(`${LEGACY_FONT_DIR}/${file}/`, "Move the font files out of this folder into my-assets, then ask the AI to sort my-assets again (it runs pnpm assets).");
    else loose.push(path);
  }
}
const belongs = { icons: (f) => SVG_EXT.test(f), images: (f) => IMAGE_EXT.test(f) || SVG_EXT.test(f), typo: (f) => FONT_EXT.test(f) };
for (const folder of ASSET_DIRS) {
  for (const file of list(dirOf(folder))) {
    const path = join(dirOf(folder), file);
    if (isDir(path) || belongs[folder](file)) continue;
    if (FONT_EXT.test(file) || IMAGE_EXT.test(file) || SVG_EXT.test(file)) loose.push(path); // 형식이 분명하면 맞는 폴더로 옮긴다
  }
}
const handled = new Set(); // 이미 보고한 파일(애매·문제). 폴더별 검사에서 다시 세지 않는다.
for (const path of loose) {
  const file = basename(path);
  const target = sortTarget(file, readFileSync(path));
  if (target.folder && place(path, target.folder, SVG_EXT.test(file) ? target.why : "")) continue;
  handled.add(path);
  if (target.ask) waiting.push({ path, why: target.ask });
  else if (!target.folder) problem(rel(path), target.problem);
}
if (!loose.length) out("  Nothing new. Drop new files straight into my-assets and run this again.");
if (legacy) out(`  ! my-assets/${LEGACY_FONT_DIR} is the old folder name. Fonts now live in my-assets/typo — you can delete the ${LEGACY_FONT_DIR} folder.`);

if (waiting.length) {
  out("");
  out("Waiting for you (not moved — choose where each file goes)");
  for (const { path, why } of waiting) {
    out(`  ? ${rel(path)} — ${why}`);
    out(`      icon:    pnpm assets --to icons ${quote(rel(path))}`);
    out(`      picture: pnpm assets --to images ${quote(rel(path))}`);
  }
}

// ── 3. 아이콘 ──────────────────────────────────────────────────────────
out("");
out("Icons (my-assets/icons)");
const icons = [];
for (const file of list(dirOf("icons"))) {
  let path = join(dirOf("icons"), file);
  if (handled.has(path)) continue;
  if (isDir(path)) { problem(`icons/${file}/`, "Put icons directly in my-assets/icons, not in sub-folders."); continue; }
  if (!SVG_EXT.test(file)) { problem(`icons/${file}`, "This kind of file isn't used here. Icons are .svg files exported from Figma."); continue; }
  path = place(path, "icons", "", "↻");
  if (!path) continue;
  const name = basename(path);
  const text = readFileSync(path, "utf8");
  const result = checkSvg(text);
  if (result.problems.length) { for (const why of result.problems) problem(`icons/${name}`, why); continue; }
  if (result.fixed) writeFileSync(path, result.fixed);
  for (const note of result.notes) out(`  ↻ ${name} — ${note}`);
  const colors = result.colors.length === 0 ? "follows the text color" : result.colors.length === 1 ? `1 color ${result.colors[0]}` : `${result.colors.length} colors`;
  icons.push(name);
  out(`  ✓ ${name.replace(/\.svg$/, "")} (${colors})`);
  const looks = classifySvg(text);
  if (looks.kind === "images") out(`  ! ${name} looks like a picture (${looks.why}). If it is: pnpm assets --to images ${quote(`icons/${name}`)}`);
}
if (!list(dirOf("icons")).length) out("  (none yet — export SVG icons from Figma and drop them into my-assets)");

// ── 4. 그림 ────────────────────────────────────────────────────────────
out("");
out("Images (my-assets/images)");
const images = [];
for (const file of list(dirOf("images"))) {
  let path = join(dirOf("images"), file);
  if (handled.has(path)) continue;
  if (isDir(path)) { problem(`images/${file}/`, "Put pictures directly in my-assets/images, not in sub-folders."); continue; }
  if (!belongs.images(file)) { problem(`images/${file}`, "This kind of file isn't used here. Pictures are .png .jpg .jpeg .webp .gif .avif or .svg."); continue; }
  if (SVG_EXT.test(file)) {
    const dangers = svgDangers(readFileSync(path, "utf8"));
    if (dangers.length) { for (const why of dangers) problem(`images/${file}`, why); continue; }
  }
  if (!statSync(path).size) { problem(`images/${file}`, "The file is empty. Export the picture again."); continue; }
  path = place(path, "images", "", "↻");
  if (!path) continue;
  const name = basename(path);
  const bytes = statSync(path).size;
  const size = SVG_EXT.test(name) ? classifySvg(readFileSync(path, "utf8")).size : null;
  const big = bytes > BIG_PICTURE ? " — big; a smaller WebP or JPG makes pages load faster" : "";
  images.push(name);
  out(`  ✓ ${name} (${size ? `${size.width} × ${size.height}, ` : ""}${sizeText(bytes)}${big})`);
}
if (!list(dirOf("images")).length) out("  (none yet — drop pictures (.png .jpg .webp .svg …) into my-assets)");

// ── 5. 글꼴 ────────────────────────────────────────────────────────────
out("");
out("Fonts (my-assets/typo)");
const fonts = [];
for (const file of list(dirOf("typo"))) {
  let path = join(dirOf("typo"), file);
  if (handled.has(path)) continue;
  if (isDir(path)) { problem(`typo/${file}/`, "Put font files directly in my-assets/typo, not in sub-folders."); continue; }
  if (!FONT_EXT.test(file)) { problem(`typo/${file}`, "This kind of file isn't used here. Fonts are .woff2 .woff .ttf or .otf files."); continue; }
  path = place(path, "typo", "", "↻");
  if (!path) continue;
  const plan = fontPlan(basename(path), readFileSync(path), figmaFamilies);
  fonts.push({ file: basename(path), ...plan });
}
const weightOrder = (font) => (font.variable ? 1000 : Number(font.weight)) + (font.style === "italic" ? 0.5 : 0);
fonts.sort((a, b) => a.family.localeCompare(b.family) || weightOrder(a) - weightOrder(b));
const families = new Map();
for (const font of fonts) {
  const key = fontKey(font.family);
  if (!families.has(key)) families.set(key, { family: font.family, faces: new Map() });
  const face = `${font.variable ? "variable 100–900" : font.weight}${font.style === "italic" ? " italic" : ""}`;
  const faces = families.get(key).faces;
  faces.set(face, [...(faces.get(face) ?? []), font.file]);
}
for (const { family, faces } of families.values()) {
  out(`  ✓ ${family}: ${[...faces.keys()].join(", ")}`);
  for (const [face, files] of faces) if (files.length > 1) out(`  ! ${family} ${face} is here ${files.length} times (${files.join(", ")}). Keep one — .woff2 is the smallest.`);
}
if (!list(dirOf("typo")).length) out("  (none yet — parts and pages use your computer's system font)");

// Figma 텍스트 스타일이 쓰는 글꼴과 대조한다. 없는 글꼴은 브라우저가 다른 글꼴로 대신 보여 준다.
if (figmaFamilies.length) {
  out("");
  out("Fonts used by your Figma text styles");
  for (const family of figmaFamilies) {
    if (families.has(fontKey(family))) out(`  ✓ ${family} — font file found`);
    else out(`  ! ${family} — no font file yet. Add ${family.replace(/\s+/g, "_")}-Regular.woff2 (and other weights) to my-assets, or text shows in a fallback font.`);
  }
}

// ── 6. 글자 토큰이 쓰는 글꼴 ───────────────────────────────────────────
let fontTokens = [];
try { fontTokens = (JSON.parse(readFileSync(join(root, ".ds", "foundation.json"), "utf8")).tokens ?? []).filter((t) => t.category === "FONT_FAMILY"); } catch {}
/** 글꼴 목록 값의 첫 글꼴 이름. 시스템 글꼴이면 null. */
const firstFamily = (value) => {
  const first = String(value ?? "").split(",")[0].trim().replace(/^["']|["']$/g, "");
  return !first || /^(?:system-ui|-apple-system|blinkmacsystemfont|sans-serif|serif|monospace|ui-[a-z-]+|var\(.*)$/i.test(first) ? null : first;
};
const fileStatus = (family) => (families.has(fontKey(family)) ? "✓ font file" : "! no font file — shows in a fallback font");
const sans = fontTokens.find((t) => t.cssVar === "--font-sans");
const sansFamily = sans ? firstFamily(sans.value) : null;
if (fontTokens.length) {
  out("");
  out("Which font each text token uses");
  if (sans) out(`  --font-sans (all parts and pages): ${sansFamily ? `${sansFamily} ${fileStatus(sansFamily)}` : "your computer's system font"}`);
  const byFamily = new Map();
  for (const t of fontTokens.filter((t) => t.typeScale)) {
    const family = firstFamily(t.value);
    if (family) byFamily.set(family, (byFamily.get(family) ?? 0) + 1);
  }
  if (byFamily.size) out(`  --font-type-* (your Figma text styles): ${[...byFamily].map(([family, n]) => `${family} ${fileStatus(family)} (${n} style${n > 1 ? "s" : ""})`).join(" · ")}`);
}

// 새 글꼴을 부품·페이지에 쓰려면 글자 계획이 필요하다. 글꼴 값은 Figma 가 정하므로 Figma 에 없는 글꼴은 고를 수 없다.
const unused = [...families.values()].filter(({ family }) => !sansFamily || fontKey(sansFamily) !== fontKey(family));
if (unused.length) {
  out("");
  out("Next step for fonts (optional)");
  for (const { family } of unused) {
    if (figmaFamilies.some((f) => fontKey(f) === fontKey(family))) {
      out(`  • ${family} is ready, but parts and pages use ${sansFamily ?? "the system font"} (--font-sans). To switch, make a text plan:`);
      out("    docs/templates/typography-plan.md → docs/plans/typography.md → pnpm ds:apply-token-plan docs/plans/typography.md --prepare");
      out("    → you choose \"Approve revision N\" in the chat → the AI runs the same command without --prepare.");
    } else if (!figmaFamilies.length) {
      out(`  • ${family}: import your Figma text styles first (pnpm ds:figma "<Figma node link>"). A text plan picks fonts from them.`);
    } else {
      out(`  • ${family} is not in your Figma text styles. A text plan only uses fonts from Figma: use ${family} in a Figma text style, then import again (pnpm ds:figma "<Figma node link>").`);
    }
  }
}

// ── 요약 ───────────────────────────────────────────────────────────────
out("");
// 글꼴 파일은 쓰지 않아도 빌드에 들어가 인터넷에 올라간다. 라이선스는 추측하지 않고 경고만 한다(막지 않는다).
if (fonts.length) {
  out("! Fonts in my-assets/typo go online with your website and Storybook, so anyone can download them.");
  out("  Keep only fonts whose license allows use on websites.");
}
const counts = `Icons: ${icons.length} · Images: ${images.length} · Fonts: ${fonts.length} file(s)`;
const wait = waiting.length ? ` ${waiting.length} file(s) wait for your choice (see "Waiting for you").` : "";
if (problems) out(`${problems} file(s) need fixing.${wait} ${counts}.`);
else if (waiting.length) out(`${wait.trim()} ${counts}.`);
else out(`All good. ${counts}. See Storybook → Foundation → Icons / Images / Typography.`);
process.exitCode = problems ? 1 : 0;

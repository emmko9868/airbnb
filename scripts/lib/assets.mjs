/**
 * my-assets 분류·검사 규칙 (의존성 0, AI 호출 없음).
 *
 * 학생은 아무 파일이나 my-assets/ 바로 아래에 둔다. 이 규칙이 확장자와 SVG 의 단순한 특징으로
 * icons/ · images/ · typo/ 중 하나를 고른다. 애매하면 고르지 않는다(ask) — 학생이 정한다.
 *
 * 아이콘은 학생이 Figma 에서 내보낸 SVG 원본이다. 안전한 벡터인지 보고 이름만 정리한다 — 모양은 바꾸지 않는다.
 * 글꼴은 파일 안의 이름표(name·OS/2·fvar 테이블)를 먼저 읽고, 못 읽으면 파일 이름(Family-Weight)을 쓴다.
 * src/assets/fonts.ts 는 정리된 파일 이름으로 같은 규칙(parseFontFile)을 써서 글꼴을 등록한다.
 */
import { brotliDecompressSync, inflateSync } from "node:zlib";

export const ASSET_DIRS = ["icons", "images", "typo"];
/** 예전 글꼴 폴더 이름. 안에 파일이 있으면 typo/ 로 옮긴다. */
export const LEGACY_FONT_DIR = "fonts";

const WEIGHTS = {
  thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300,
  regular: 400, normal: 400, book: 400, medium: 500, semibold: 600, demibold: 600,
  bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900,
};
const WEIGHT_NAMES = { 100: "Thin", 200: "ExtraLight", 300: "Light", 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold", 800: "ExtraBold", 900: "Black" };
export const FONT_EXT = /\.(woff2|woff|ttf|otf)$/i;
export const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
export const SVG_EXT = /\.svg$/i;
/** 그림이지만 웹에서 바로 못 쓰는 형식. 다시 내보내라고 안내한다. */
const OTHER_PICTURE_EXT = /\.(heic|heif|bmp|tiff?|psd|ai|eps|pdf|sketch|fig|xd|raw|cr2|nef|ico)$/i;
const FORMAT = { woff2: "woff2", woff: "woff", ttf: "truetype", otf: "opentype" };
export const IGNORED_FILES = new Set(["README.md", ".gitkeep", ".DS_Store", "Thumbs.db", "desktop.ini"]);
/** 정리 대상에서 빼는 파일: 안내 파일과 운영체제가 만드는 숨김 파일. */
export const isIgnored = (file) => IGNORED_FILES.has(file) || String(file).startsWith(".");

/** 아이콘으로 보는 최대 크기와 그림으로 보는 최소 크기. README 와 출력 문구가 이 숫자를 그대로 쓴다. */
export const ICON_MAX = 64;
export const PICTURE_MIN = 256;

/**
 * "Pretendard-Bold.woff2" → { family: "Pretendard", weight: 700, style: "normal" }. 글꼴 파일이 아니면 null.
 * `_`·공백·`-` 는 모두 구분자다. 마지막 조각만 굵기·기울임으로 읽는다("Noto_Sans_KR-Bold" → "Noto Sans KR").
 * Google Fonts 의 "Inter-VariableFont_opsz,wght.ttf" 처럼 VariableFont 뒤는 축 이름이라 버린다.
 */
export function parseFontFile(file) {
  const ext = String(file).match(FONT_EXT);
  if (!ext) return null;
  let parts = file.slice(0, -ext[0].length).split(/[-_ ]+/).filter(Boolean);
  let style = "normal", weight = 400, variable = false;
  const vf = parts.findIndex((p, i) => i > 0 && /^variablefont$/i.test(p));
  if (vf > 0) { variable = true; parts = parts.slice(0, vf); }
  let family = parts;
  if (parts.length > 1) {
    let tail = parts[parts.length - 1].toLowerCase();
    if (tail.endsWith("italic")) { style = "italic"; tail = tail.slice(0, -"italic".length); }
    if (tail === "variable" || tail === "vf") { variable = true; family = parts.slice(0, -1); }
    else if (Object.hasOwn(WEIGHTS, tail)) { weight = WEIGHTS[tail]; family = parts.slice(0, -1); }
    else if (/^[1-9]\d\d$/.test(tail)) { weight = Number(tail); family = parts.slice(0, -1); }
    else if (tail === "") family = parts.slice(0, -1);
  }
  return { file, family: family.join(" "), weight: variable ? "100 900" : weight, style, variable, format: FORMAT[ext[1].toLowerCase()] };
}

/** 글꼴 이름 비교용: "Noto Sans KR" 과 "NotoSansKR" 을 같은 글꼴로 본다. */
export const fontKey = (family) => String(family).toLowerCase().replace(/[^a-z0-9]/g, "");

/** "Arrow Right_24.svg" → "arrow-right-24.svg", "Hero Photo.PNG" → "hero-photo.png". 이름으로 쓸 글자가 없으면 null. */
export function kebabFileName(file) {
  const ext = String(file).match(/\.([a-z0-9]+)$/i);
  if (!ext) return null;
  const base = String(file).slice(0, -ext[0].length);
  const kebab = base.toLowerCase().replace(/[\s_.]+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return kebab ? `${kebab}.${ext[1].toLowerCase()}` : null;
}

/** 아이콘 파일 이름. kebabFileName 과 같고 확장자는 .svg 로 고정한다. */
export function iconFileName(file) {
  return kebabFileName(String(file).replace(/\.svg$/i, "") + ".svg");
}

/**
 * 글꼴 정보 → 정리된 파일 이름 "Family-Weight.ext". 글꼴 이름의 공백은 `_` 로 바꾼다
 * ("Noto Sans KR" 700 → "Noto_Sans_KR-Bold.woff2"). parseFontFile 로 다시 읽으면 같은 글꼴 이름·굵기가 나온다.
 */
export function fontFileName({ family, weight, style, variable }, ext) {
  const name = String(family ?? "").normalize("NFKD").replace(/[^A-Za-z0-9 ]+/g, " ").trim().split(/\s+/).filter(Boolean).join("_");
  if (!name || !/[A-Za-z]/.test(name)) return null;
  let tail = variable ? "Variable" : WEIGHT_NAMES[weight] ?? String(weight);
  if (style === "italic") tail = tail === "Regular" ? "Italic" : `${tail}Italic`;
  return `${name}-${tail}.${String(ext).replace(/^\./, "").toLowerCase()}`;
}

// ── 글꼴 파일 안의 이름표 ─────────────────────────────────────────────

/** WOFF2 가 이름 대신 번호로 적는 테이블 63개 (WOFF2 명세 표 순서). */
const WOFF2_TAGS = ["cmap", "head", "hhea", "hmtx", "maxp", "name", "OS/2", "post", "cvt ", "fpgm", "glyf", "loca", "prep", "CFF ", "VORG", "EBDT", "EBLC", "gasp", "hdmx", "kern", "LTSH", "PCLT", "VDMX", "vhea", "vmtx", "BASE", "GDEF", "GPOS", "GSUB", "EBSC", "JSTF", "MATH", "CBDT", "CBLC", "COLR", "CPAL", "SVG ", "sbix", "acnt", "avar", "bdat", "bloc", "bsln", "cvar", "fdsc", "feat", "fmtx", "fvar", "gvar", "hsty", "just", "lcar", "mort", "morx", "opbd", "prop", "trak", "Zapf", "Silf", "Glat", "Gloc", "Feat", "Sill"];
const WANTED = new Set(["name", "OS/2", "fvar", "head"]);

/** 파일 앞 4바이트로 글꼴 종류를 본다. 글꼴이 아니면 null. */
export function fontSignature(bytes) {
  if (!bytes || bytes.length < 12) return null;
  const sig = bytes.toString("latin1", 0, 4);
  if (sig === "wOF2") return "woff2";
  if (sig === "wOFF") return "woff";
  if (sig === "OTTO") return "otf";
  if (sig === "true" || bytes.readUInt32BE(0) === 0x00010000) return "ttf";
  if (sig === "ttcf") return "collection";
  return null;
}

function sfntTables(bytes) {
  const tables = new Map();
  const count = bytes.readUInt16BE(4);
  for (let i = 0; i < count; i++) {
    const at = 12 + 16 * i;
    const tag = bytes.toString("latin1", at, at + 4);
    if (!WANTED.has(tag)) continue;
    const offset = bytes.readUInt32BE(at + 8), length = bytes.readUInt32BE(at + 12);
    if (offset + length <= bytes.length) tables.set(tag, bytes.subarray(offset, offset + length));
  }
  return tables;
}

function woffTables(bytes) {
  const tables = new Map();
  const count = bytes.readUInt16BE(12);
  for (let i = 0; i < count; i++) {
    const at = 44 + 20 * i;
    const tag = bytes.toString("latin1", at, at + 4);
    if (!WANTED.has(tag)) continue;
    const offset = bytes.readUInt32BE(at + 4), compLength = bytes.readUInt32BE(at + 8), origLength = bytes.readUInt32BE(at + 12);
    const data = bytes.subarray(offset, offset + compLength);
    tables.set(tag, compLength < origLength ? inflateSync(data) : data);
  }
  return tables;
}

function woff2Tables(bytes) {
  let pos = 48;
  const base128 = () => {
    let value = 0;
    for (let i = 0; i < 5; i++) {
      const b = bytes[pos++];
      if (b === undefined || (i === 0 && b === 0x80) || value > 0x1ffffff) throw new Error("bad UIntBase128");
      value = value * 128 + (b & 0x7f);
      if (!(b & 0x80)) return value;
    }
    throw new Error("bad UIntBase128");
  };
  if (bytes.toString("latin1", 4, 8) === "ttcf") return new Map(); // 글꼴 모음은 읽지 않는다(파일 이름을 쓴다).
  const count = bytes.readUInt16BE(12), compressed = bytes.readUInt32BE(20);
  const entries = [];
  let offset = 0;
  for (let i = 0; i < count; i++) {
    const flags = bytes[pos++];
    let tag = WOFF2_TAGS[flags & 0x3f];
    if ((flags & 0x3f) === 0x3f) { tag = bytes.toString("latin1", pos, pos + 4); pos += 4; }
    const version = (flags >> 6) & 3;
    let length = base128();
    const transformed = tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    if (transformed) length = base128();
    entries.push({ tag, offset, length });
    offset += length;
  }
  const data = brotliDecompressSync(bytes.subarray(pos, pos + compressed));
  const tables = new Map();
  for (const e of entries) if (WANTED.has(e.tag) && e.offset + e.length <= data.length) tables.set(e.tag, data.subarray(e.offset, e.offset + e.length));
  return tables;
}

function nameRecords(table) {
  const count = table.readUInt16BE(2), strings = table.readUInt16BE(4);
  const records = [];
  for (let i = 0; i < count; i++) {
    const at = 6 + 12 * i;
    if (at + 12 > table.length) break;
    const [platform, encoding, language, id, length, offset] = [0, 2, 4, 6, 8, 10].map((o) => table.readUInt16BE(at + o));
    const raw = table.subarray(strings + offset, strings + offset + length);
    if (raw.length !== length) continue;
    let text;
    if (platform === 1 && encoding === 0) text = raw.toString("latin1");
    else if (platform === 0 || platform === 3) text = Buffer.from(raw.subarray(0, length - (length % 2))).swap16().toString("utf16le");
    else continue;
    records.push({ platform, language, id, text: text.replace(/\0/g, "").trim() });
  }
  // 영어 Windows 이름 → 다른 Windows 이름 → Mac 영어 → 유니코드 순으로 고른다.
  const rank = (r) => (r.platform === 3 && r.language === 0x409 ? 0 : r.platform === 3 ? 1 : r.platform === 1 && r.language === 0 ? 2 : 3);
  return (id) => records.filter((r) => r.id === id && r.text).sort((a, b) => rank(a) - rank(b))[0]?.text ?? "";
}

/**
 * 글꼴 파일 안의 글꼴 이름·굵기·기울임·가변 여부. Figma 가 보여 주는 글꼴 이름도 이 이름표에서 온다.
 * 읽지 못하면 null — 호출하는 쪽이 파일 이름으로 대신 읽는다.
 */
export function readFontMeta(bytes) {
  try {
    const kind = fontSignature(bytes);
    if (!kind || kind === "collection") return null;
    const tables = kind === "woff2" ? woff2Tables(bytes) : kind === "woff" ? woffTables(bytes) : sfntTables(bytes);
    const nameTable = tables.get("name");
    if (!nameTable || nameTable.length < 6) return null;
    const name = nameRecords(nameTable);
    const os2 = tables.get("OS/2"), head = tables.get("head"), fvar = tables.get("fvar");
    let weight = os2 && os2.length >= 6 ? os2.readUInt16BE(4) : 400;
    if (weight >= 1 && weight <= 9) weight *= 100;
    if (!(weight >= 1 && weight <= 1000)) weight = 400;
    const subfamily = name(17) || name(2);
    const italic = (os2 && os2.length >= 64 && (os2.readUInt16BE(62) & 0x201) !== 0)
      || (head && head.length >= 46 && (head.readUInt16BE(44) & 0x2) !== 0)
      || /italic|oblique/i.test(subfamily);
    let variable = false;
    if (fvar && fvar.length >= 16) {
      const axes = fvar.readUInt16BE(4), axisCount = fvar.readUInt16BE(8), axisSize = fvar.readUInt16BE(10);
      for (let i = 0; i < axisCount; i++) if (fvar.toString("latin1", axes + i * axisSize, axes + i * axisSize + 4) === "wght") variable = true;
    }
    // Figma 처럼 "대표 글꼴 이름(16)" → "글꼴 이름(1)" 순으로 쓴다. "Arial Black" 같은 별도 글꼴을 자르지 않는다.
    const typographic = name(16);
    const family = (typographic || name(1)).trim();
    if (!family) return null;
    // 대표 이름이 없는 옛 글꼴은 "Pretendard SemiBold" 처럼 이름에 굵기가 붙어 있다. 굵기 숫자와 맞으면
    // 뗀 이름(baseFamily)도 알려 준다 — Figma 글꼴 이름과 맞을 때만 쓴다(fontPlan).
    let baseFamily = null;
    if (!typographic) {
      const words = family.split(/\s+/);
      for (const n of [2, 1]) {
        if (words.length > n && WEIGHTS[words.slice(-n).join("").toLowerCase()] === weight) { baseFamily = words.slice(0, -n).join(" "); break; }
      }
    }
    return { family, baseFamily, weight: variable ? "100 900" : weight, style: italic ? "italic" : "normal", variable };
  } catch {
    return null;
  }
}

/**
 * 글꼴 하나의 정리 결과. 파일 안 이름표 → 파일 이름 순으로 읽고, Figma 텍스트 스타일에 같은 글꼴이 있으면
 * Figma 철자를 따른다(브라우저는 글꼴 이름이 글자 그대로 같아야 같은 글꼴로 본다).
 */
export function fontPlan(file, bytes, figmaFamilies = []) {
  const ext = String(file).match(FONT_EXT)?.[1];
  if (!ext) return { problem: "Only .woff2, .woff, .ttf or .otf font files go in my-assets/typo." };
  const kind = fontSignature(bytes);
  if (!kind) return { problem: "This is not a font file, or it is damaged. Download the font again." };
  if (kind === "collection") return { problem: "This is a font collection (several fonts in one file). Download the single font files (.woff2, .ttf or .otf) instead." };
  const meta = readFontMeta(bytes);
  const info = meta ?? parseFontFile(file);
  const match = (family) => (family ? figmaFamilies.find((f) => fontKey(f) === fontKey(family)) : undefined);
  const figma = match(info.family) ?? match(meta?.baseFamily);
  const family = figma ?? info.family;
  const name = fontFileName({ ...info, family }, ext);
  if (!name) return { problem: "Cannot tell the font's name. Rename the file like Pretendard-Bold.woff2 (English letters)." };
  return { name, family, weight: info.weight, style: info.style, variable: info.variable, from: meta ? "inside" : "name" };
}

// ── SVG ───────────────────────────────────────────────────────────────

/** 실행되거나 밖으로 연결되는 부분. 아이콘·그림 모두 이것이 있으면 쓰지 않는다. */
export function svgDangers(svg) {
  const problems = [];
  if (/<script\b|\son[a-z]+\s*=|javascript:|<foreignObject\b/i.test(svg)) problems.push("It contains code (script or event handlers). Export it again from Figma.");
  if (/\b(?:xlink:)?href\s*=\s*["']\s*(?:https?:)?\/\/|url\(\s*["']?\s*(?:https?:)?\/\/|@import\b/i.test(svg)) problems.push("It links to a file on the internet. Export it again from Figma.");
  return problems;
}

/** 칠한 색 목록(none·currentColor·그라디언트 참조는 색으로 세지 않는다). */
function svgColors(svg) {
  const found = [...svg.matchAll(/\b(?:fill|stroke|stop-color)\s*[=:]\s*["']?\s*(#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|[a-z]+)/gi)].map((m) => m[1].toLowerCase());
  return [...new Set(found.filter((c) => !["none", "currentcolor", "transparent", "inherit", "url"].includes(c)))];
}

/** SVG 의 크기(viewBox 우선, 없으면 width·height). 모르면 null. */
function svgSize(open) {
  const box = open.match(/\sviewBox\s*=\s*["']\s*([-0-9.e]+)[\s,]+([-0-9.e]+)[\s,]+([0-9.e]+)[\s,]+([0-9.e]+)\s*["']/i);
  if (box && Number(box[3]) > 0 && Number(box[4]) > 0) return { width: Number(box[3]), height: Number(box[4]) };
  const size = (attr) => Number(open.match(new RegExp(`\\s${attr}\\s*=\\s*["']?([0-9.]+)(?:px)?["']?(?=[\\s/>])`, "i"))?.[1]);
  const w = size("width"), h = size("height");
  return w > 0 && h > 0 ? { width: w, height: h } : null;
}

/**
 * 학생이 my-assets/ 에 둔 SVG 가 아이콘인지 그림인지 단순 규칙으로 고른다.
 *   그림: 안에 사진(비트맵)이 있다 · 긴 변이 256 보다 크다 · 64 보다 크면서 (한 변이 다른 변의 2배 이상 · 색 3개 이상 · 그라디언트/효과)
 *   아이콘: 긴 변 64 이하 · 정사각형(짧은 변이 긴 변의 90% 이상) · 색 2개 이하 · 그라디언트/효과/사진 없음
 *   그 밖은 kind: null(애매) — 옮기지 않고 학생에게 묻는다.
 */
export function classifySvg(text) {
  const svg = String(text);
  const open = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!open) return { kind: null, problems: ["This is not an SVG file. Export it again from Figma as SVG."], why: "" };
  const problems = svgDangers(svg);
  if (problems.length) return { kind: null, problems, why: "" };
  const size = svgSize(open);
  const colors = svgColors(svg);
  const bitmap = /<image\b/i.test(svg);
  const effects = /<(?:linearGradient|radialGradient|pattern|filter)\b/i.test(svg);
  const colorText = colors.length === 0 ? "follows the text color" : colors.length === 1 ? "1 color" : `${colors.length} colors`;
  if (bitmap) return { kind: "images", problems, why: "has a picture inside", size, colors };
  if (!size) return { kind: null, problems, why: "can't tell its size (no viewBox or width/height)", size, colors };
  const long = Math.max(size.width, size.height), ratio = Math.min(size.width, size.height) / long;
  const dims = `${size.width} × ${size.height}`;
  if (long > PICTURE_MIN) return { kind: "images", problems, why: `${dims}, bigger than ${PICTURE_MIN}`, size, colors };
  if (long > ICON_MAX && (ratio < 0.5 || colors.length >= 3 || effects)) {
    const reason = ratio < 0.5 ? "wide or tall" : effects ? "gradients or effects" : colorText;
    return { kind: "images", problems, why: `${dims}, ${reason}`, size, colors };
  }
  if (long <= ICON_MAX && ratio >= 0.9 && colors.length <= 2 && !effects) return { kind: "icons", problems, why: `${dims}, ${colorText}`, size, colors };
  const doubt = long > ICON_MAX ? `${dims}: bigger than an icon (${ICON_MAX}) but not clearly a picture`
    : ratio < 0.9 ? `${dims}: small but not square`
    : effects ? `${dims}: small and square, but has gradients or effects`
    : `${dims}: small and square, but ${colorText}`;
  return { kind: null, problems, why: doubt, size, colors };
}

/**
 * 아이콘 SVG 검사. problems 가 있으면 쓰지 않는다. viewBox 가 없고 width·height 가 숫자면 viewBox 만 보충한다(fixed).
 * 색은 바꾸지 않고 보고만 한다.
 */
export function checkSvg(text) {
  const svg = String(text);
  const notes = [];
  let fixed = null;
  const open = svg.match(/<svg\b[^>]*>/i)?.[0];
  if (!open) return { problems: ["This is not an SVG file. Export the icon from Figma as SVG."], notes, fixed, colors: [] };
  const problems = svgDangers(svg);
  if (/<image\b/i.test(svg)) problems.push("It contains a picture (bitmap), not a vector shape. Select the vector icon in Figma and export again.");
  if (!/\sviewBox\s*=/i.test(open)) {
    const size = (attr) => Number(open.match(new RegExp(`\\s${attr}\\s*=\\s*["']?([0-9.]+)(?:px)?["']?`, "i"))?.[1]);
    const w = size("width"), h = size("height");
    if (w > 0 && h > 0) {
      fixed = svg.replace(open, open.replace(/<svg\b/i, `<svg viewBox="0 0 ${w} ${h}"`));
      notes.push(`Added viewBox="0 0 ${w} ${h}" so it can resize.`);
    } else problems.push("It has no viewBox and no width/height. Export the icon's frame from Figma.");
  }
  return { problems, notes, fixed, colors: svgColors(svg) };
}

// ── 파일 하나의 행선지 ─────────────────────────────────────────────────

export const UNKNOWN_FILE = "This kind of file isn't used in my-assets. It takes icons (.svg), pictures (.png .jpg .webp .gif .avif .svg) and fonts (.woff2 .woff .ttf .otf). Move it out of my-assets.";

/**
 * 파일 이름과 내용으로 행선지를 고른다.
 *   { folder: "icons" | "images" | "typo", why }  — 옮긴다
 *   { folder: null, ask }                         — 애매하다. 옮기지 않고 학생에게 묻는다
 *   { folder: null, problem }                     — 쓸 수 없는 파일. 옮기지 않고 종료 코드 1
 */
export function sortTarget(file, bytes) {
  const name = String(file);
  if (FONT_EXT.test(name)) {
    const kind = fontSignature(bytes);
    if (kind === "collection") return { folder: null, problem: "This is a font collection (several fonts in one file). Download the single font files (.woff2, .ttf or .otf) instead." };
    return kind ? { folder: "typo", why: "font" } : { folder: null, problem: "This is not a font file, or it is damaged. Download the font again." };
  }
  if (IMAGE_EXT.test(name)) return bytes?.length ? { folder: "images", why: "picture" } : { folder: null, problem: "The file is empty. Export the picture again." };
  if (SVG_EXT.test(name)) {
    const result = classifySvg(bytes ? bytes.toString("utf8") : "");
    if (result.problems.length) return { folder: null, problem: result.problems.join(" ") };
    return result.kind ? { folder: result.kind, why: result.why } : { folder: null, ask: result.why };
  }
  if (OTHER_PICTURE_EXT.test(name)) return { folder: null, problem: "Websites can't show this format. Export it again from Figma (or your picture app) as PNG, JPG, WebP or SVG." };
  return { folder: null, problem: UNKNOWN_FILE };
}

/** 이 폴더에 둘 수 있는 파일인가 (--to 로 학생이 고를 때). */
export function fitsFolder(folder, file) {
  if (folder === "typo") return FONT_EXT.test(file);
  if (folder === "images") return IMAGE_EXT.test(file) || SVG_EXT.test(file);
  if (folder === "icons") return SVG_EXT.test(file);
  return false;
}

/** 파일 크기를 사람이 읽는 글자로. */
export function sizeText(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

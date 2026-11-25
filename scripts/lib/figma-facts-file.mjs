/**
 * 미리 읽기 결과의 작은 사실 파일(Q-70 결정 5). 의존성 0, 결정적.
 *
 * ctx-<file>-<node>.json 은 변형마다 디자인 코드·메타데이터·SVG 원문을 모두 담아 60~130KB 다. AI 가 이것을 통째로 읽으면
 * 요청 하나의 입력이 수만 토큰 늘어난다. 그래서 프롬프트 훅이 계획·구현에 필요한 사실만 골라
 *   facts-<file>-<node>.md           변형별 크기·색·글자 스타일·아이콘/그림 원본·하위 부품·그라데이션 토큰·기본 변형 코드 (목표 8KB 안팎)
 *   facts-<file>-<node>-<변형>.tsx   다른 변형의 디자인 코드(필요한 변형 하나만 읽는다)
 * 로 쓴다. 맥락은 ctx-*.json 대신 이 파일을 가리킨다.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gradientLines, partGradientTokens } from "./figma-gradients.mjs";

/** 사실 파일 크기 상한. 넘으면 뒤쪽(기본 변형 코드)을 줄인다. */
export const FACTS_LIMIT = 10_000;
/** 사실 파일에 그대로 넣는 SVG 원문의 합계 상한. 넘는 것은 원본 URL 만 적는다. */
const SVG_BUDGET = 2_500;

export const factsFileName = (key) => `facts-${key}.md`;
export const variantCodeFileName = (key, variantId) => `facts-${key}-${String(variantId).replace(/[^\w-]/g, "-")}.tsx`;

const KIND_LABEL = { "배경": "background", "글자·아이콘": "text/icon", "테두리": "border" };
const shownState = (state) => (state === "기본" ? "base" : state);
const shownAt = (at) => (at === "(안쪽 요소)" ? "inner element" : at || "root");

/**
 * Figma 가 디자인 코드 뒤에 붙이는 안내문(SUPER CRITICAL …)을 떼고, 그라데이션 data URL 을 토큰 이름으로 바꾼다.
 * 값은 토큰에 그대로 있으므로 AI 가 다시 옮겨 적을 필요가 없다.
 */
export function compactDesign(design, gradients = []) {
  let code = String(design ?? "").split(/\n\s*SUPER CRITICAL:/)[0].trimEnd();
  for (const token of gradients) {
    const literal = JSON.stringify(token.value);
    code = code.split(literal).join(`"var(${token.cssVar})" /* kit gradient token */`);
  }
  // 토큰이 되지 않은 긴 data URL(그림 등)은 줄여 쓴다.
  return code.replace(/data:image\/[^"'`)]{200,}/g, (url) => `${url.slice(0, 60)}… (cut)`);
}

/** 디자인 코드의 이미지·아이콘 원본 상수(const imgX = "http://localhost:3845/assets/…"). */
const assetConstants = (design) => [...String(design ?? "").matchAll(/const (\w+) = "(https?:\/\/(?:localhost|127\.0\.0\.1):3845\/assets\/[^"]+)"/g)].map((match) => ({ name: match[1], url: match[2] }));

/** 사실 파일 본문. facts 는 normalizeFigmaIdentity 를 거친 미리 읽기 사실. */
export function factsMarkdown(facts, { key = "", codeFiles = {} } = {}) {
  // 기본 변형 코드를 먼저 지킨다. 크기 상한을 넘으면 SVG 원문을 줄이고, 그래도 넘을 때만 코드를 자른다.
  for (const svgBudget of [SVG_BUDGET, 1_000, 0]) {
    const text = factsText(facts, { key, codeFiles, svgBudget, cut: false });
    if (Buffer.byteLength(text) <= FACTS_LIMIT) return text;
  }
  return factsText(facts, { key, codeFiles, svgBudget: 0, cut: true });
}

function factsText(facts, { key, codeFiles, svgBudget, cut }) {
  // 변형 코드 파일은 프로젝트 기준 짧은 경로로 보인다.
  const gradients = partGradientTokens(facts).tokens;
  const details = facts.variantDetails || [];
  const lines = [
    `# Figma facts: ${facts.frameName || "unknown"}${facts.name ? ` (code name ${facts.name})` : ""}`,
    "Made by the kit from the Figma read. Use these facts for the plan and the code. Do not read ctx-*.json, .ds/*.json, other parts' plans or generated docs; the token list is src/tokens/tokens.css.",
    `Source: ${facts.figmaUrl || "unknown"} · Part node: ${facts.identity?.nodeId || "unknown"} · Base size: ${facts.base?.w || "?"}×${facts.base?.h || "?"}`,
    "",
    "## Variants (size · read)",
    ...details.map((variant, index) => `- ${variant.id} ${variant.name} · ${variant.w || "?"}×${variant.h || "?"} · ${variant.read ? "read" : "NOT read"}${index === 0 ? " · base (code below)" : codeFiles[variant.id] ? ` · code: ${codeFiles[variant.id]}` : ""}`),
  ];
  if ((facts.variants || []).length > details.length) lines.push(...(facts.variants || []).filter((variant) => !details.some((detail) => detail.id === variant.id)).map((variant) => `- ${variant.id} ${variant.name} · not read`));
  lines.push("", "## Colors by state (exact RGB/alpha)");
  for (const entry of facts.colorEntries || []) lines.push(`- ${shownState(entry.state)} · ${shownAt(entry.at)} · ${KIND_LABEL[entry.kind] ?? entry.kind}: ${entry.hex}`);
  const variables = Object.entries(facts.variables || {});
  const colors = variables.filter(([, value]) => typeof value === "string" && /^#|^rgba?\(/i.test(value));
  const fonts = variables.filter(([, value]) => typeof value === "string" && /^Font\(/.test(value));
  const others = variables.filter(([name, value]) => !colors.some(([n]) => n === name) && !fonts.some(([n]) => n === name) && typeof value === "string");
  if (colors.length) lines.push("", "## Figma color variables", ...colors.map(([name, value]) => `- ${name}: ${value}`));
  if (fonts.length) lines.push("", "## Text styles", ...fonts.map(([name, value]) => `- ${name}: ${value.replace(/^Font\((.*)\)$/, "$1")}`));
  if (others.length) lines.push("", "## Other styles", ...others.map(([name, value]) => `- ${name}: ${value.trim() && !/^[\s,]*$/.test(value) ? value : "(Figma did not send the value)"}`));
  const gradient = gradientLines(facts);
  if (gradient.length) lines.push("", ...gradient);
  // 아이콘·그림: 원본 URL 마다 한 줄(어느 변형에 있는지). 작은 SVG 는 원문을 그대로 넣는다(Figma 원본 path 를 그대로 옮겨야 한다).
  const assets = new Map();
  for (const variant of details) {
    const svgs = facts.assetVariants?.[variant.id] || {};
    for (const asset of assetConstants(variant.design)) {
      const row = assets.get(asset.url) || { names: new Set(), variants: [], svg: null };
      row.names.add(asset.name);
      if (!row.variants.includes(variant.id)) row.variants.push(variant.id);
      row.svg ||= svgs[asset.name] || null;
      assets.set(asset.url, row);
    }
  }
  let budget = svgBudget;
  const assetRows = [...assets].map(([url, row]) => {
    const where = row.variants.length === details.length && details.length > 1 ? "all variants" : row.variants.join(", ");
    const head = `- ${[...row.names].join(", ")} · ${where}: ${url}`;
    if (row.svg && row.svg.length <= budget) {
      budget -= row.svg.length;
      return `${head}\n\n\`\`\`svg\n${row.svg.trim()}\n\`\`\``;
    }
    return `${head}${/\.svg$/i.test(url) ? "" : " (picture)"}`;
  });
  if (assetRows.length) lines.push("", "## Icons and pictures (original Figma sources)", "An SVG not copied below: download it with curl -s from its URL while Figma is open, and copy its paths as they are.", ...assetRows);
  if (facts.nestedParts?.length) lines.push("", "## Nested parts", ...facts.nestedParts.map((part) => `- ${part.layerName || "unknown layer"}${part.nodeId ? ` (${part.nodeId})` : ""}: ${part.originalName || "unknown"} → ${part.kitComponent || part.nonKitImplementation || "ask"} · ${part.status}`));
  if (facts.innerLayers?.length) lines.push("", "## Inner layers (drawn inside this part, not nested parts)", ...[...new Set(facts.innerLayers.map((layer) => `- ${layer.layerName || "unknown layer"}${layer.nodeId ? ` (${layer.nodeId})` : ""}`))]);
  const head = lines.join("\n");
  const base = details[0];
  if (!base) return `${head}\n`;
  let code = compactDesign(base.design, gradients);
  const room = FACTS_LIMIT - Buffer.byteLength(head) - 300;
  if (cut && code.length > room) code = `${code.slice(0, Math.max(0, room))}\n… (cut: read node_modules/.cache/ds-figma/${key ? variantCodeFileName(key, base.id) : "the base code file"} for the rest)`;
  return `${head}\n\n## Base variant code (${base.id} ${base.name}; Tailwind classes are Figma's values — convert them to tokens in CSS)\n\n\`\`\`tsx\n${code}\n\`\`\`\n`;
}

/** 사실 파일과 변형별 코드 파일을 쓴다. { path, size, codeFiles } 를 돌려준다. */
export function writeFactsFiles(cacheDir, key, facts) {
  mkdirSync(cacheDir, { recursive: true });
  const gradients = partGradientTokens(facts).tokens;
  const codeFiles = {};
  for (const [index, variant] of (facts.variantDetails || []).entries()) {
    if (!variant.read) continue;
    const file = variantCodeFileName(key, variant.id);
    const code = compactDesign(variant.design, gradients);
    // 기본 변형 코드가 사실 파일에 다 들어가면 따로 쓰지 않아도 되지만, 잘릴 때를 위해 항상 쓴다.
    writeFileSync(join(cacheDir, file), `// Figma design code of ${variant.id} ${variant.name} (kit facts, Q-70)\n${code}\n`);
    if (index > 0) codeFiles[variant.id] = `node_modules/.cache/ds-figma/${file}`;
  }
  const text = factsMarkdown(facts, { key, codeFiles });
  const path = join(cacheDir, factsFileName(key));
  // 맥락에는 프로젝트 기준 경로를 쓴다(짧고, 학생 컴퓨터의 개인 경로가 대화에 반복되지 않는다).
  writeFileSync(path, text);
  return { path, shown: `node_modules/.cache/ds-figma/${factsFileName(key)}`, size: Buffer.byteLength(text), codeFiles };
}

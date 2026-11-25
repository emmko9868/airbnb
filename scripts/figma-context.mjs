/**
 * 요청 문장에 Figma 노드 링크가 있으면 Figma Desktop MCP 에서 디자인을 읽어
 * 작은 모델이 바로 쓸 수 있는 형태로 정리한다. (의존성 0)
 *
 * 작은 무료 모델은 Figma 도구를 부를지 스스로 판단하게 두면 건너뛰고 추측한다.
 * 그래서 요청을 받는 순간 hook 이 대신 읽어서 붙인다.
 *
 * 두 단계로 나뉜다.
 *   분석  Figma 를 불러 사실만 모은다 — 상태별로 어느 요소의 색이 어떤 값인지, 그 상태에만 생기는 레이어,
 *         아이콘, 기본 상태 코드, Figma 변수 이름. 이 사실만 캐시한다.
 *   출력  사실 + 정확히 같은 색 후보를 계획 자료로 만든다. 역할과 구현은 승인 계획에서 확정한다.
 *         토큰이 바뀌어도(예: Figma 변수를 가져온 뒤) Figma 를 다시 부르지 않고 새로 대응한다.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { figmaIconPaths, jsxOpeningTags } from "./lib/component-quality.mjs";
import { parseColorA, toCssColor } from "./lib/color.mjs";
import { writeFactsFiles } from "./lib/figma-facts-file.mjs";
import { gradientLines } from "./lib/figma-gradients.mjs";

const MCP_URL = process.env.FIGMA_MCP_URL || "http://127.0.0.1:3845/mcp";
const HEADERS = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };

// Figma 데스크톱 MCP 는 글 응답 끝에 원격 서버를 권하는 문장을 한 줄 붙인다(2026-11 확인).
// 데이터가 아니므로 떼어 낸다. 그대로 두면 get_variable_defs 의 JSON 을 읽지 못한다.
const FIGMA_PROMO = /\s*Figma recommends using the remote MCP server[^\n]*\s*$/;

/** MCP 글 응답에서 Figma 가 덧붙인 안내 문장을 뗀다. */
export function cleanMcpText(text) {
  return String(text ?? "").replace(FIGMA_PROMO, "");
}

/** 맨 앞 JSON 값({…} 또는 […])이 끝나는 위치. 끝나지 않으면(잘린 응답) -1. */
function jsonPrefixEnd(text) {
  if (text[0] !== "{" && text[0] !== "[") return -1;
  let depth = 0, inString = false, escaped = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}

/** MCP 글 응답을 JSON 으로 읽는다. 뒤에 붙은 안내 문장은 무시하고, 잘린 응답은 오류로 둔다. */
export function parseMcpJson(text) {
  const cleaned = cleanMcpText(text).trim();
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const end = jsonPrefixEnd(cleaned);
    if (end > 0) return JSON.parse(cleaned.slice(0, end));
    throw error;
  }
}

export async function rpc(id, method, params, session, timeoutMs = 15_000) {
  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: session ? { ...HEADERS, "Mcp-Session-Id": session } : HEADERS,
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(response.status === 429 ? "Figma MCP rate limit (429)" : `Figma MCP request failed (${response.status})`);
  const raw = await response.text();
  const lines = raw.includes("data: ")
    ? raw.split("\n").filter((line) => line.startsWith("data: ")).map((line) => line.slice(6))
    : [raw];
  const event = lines.map((line) => { try { return JSON.parse(line); } catch { return null; } }).find((item) => item?.id === id);
  if (!event) throw new Error("Could not read the Figma MCP response.");
  if (event.error) throw new Error(`Figma MCP: ${event.error.message}`);
  const text = cleanMcpText((event.result?.content || []).filter((item) => item.type === "text").map((item) => item.text).join("\n"));
  if (event.result?.isError) throw new Error(`Figma MCP: ${text.slice(0, 300)}`);
  // result 는 그림(content[].type === "image")이나 tools/list 처럼 글이 아닌 응답을 읽을 때 쓴다.
  return { session: response.headers.get("mcp-session-id"), text, result: event.result || {} };
}

/** 터미널 명령(ds:figma·web:figma)이 Figma MCP 한도에 걸렸을 때 학생에게 보여 주는 문장. */
export const RATE_LIMIT_TERMINAL = "You have used up your Figma MCP limit. Starter plans and View or Collab seats get up to 20 calls a month. Professional Full or Dev seats and the Education plan get up to 200 calls a day. Run this again after the limit resets.";

export function figmaNodeId(message) {
  const url = String(message).match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)'"]+/i)?.[0];
  if (!url) return null;
  try {
    const id = new URL(url).searchParams.get("node-id");
    return id && /^\d+[:-]\d+$/.test(id) ? id.replace("-", ":") : null;
  } catch {
    return null;
  }
}

const norm = (value) => /^rgba?\(/i.test(String(value)) ? String(value) : toCssColor(value);
const pascal = (name) => name.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^./, (c) => c.toUpperCase());

const decodeXml = (value) => String(value).replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

function metadataTree(metadata) {
  const stack = [], nodes = [];
  for (const match of String(metadata).matchAll(/<(\/?)([a-zA-Z_-]+)\b([^>]*?)(\/?)>/g)) {
    if (match[1]) { if (stack.at(-1)?.type === match[2]) stack.pop(); continue; }
    const attrs = Object.fromEntries([...match[3].matchAll(/([\w-]+)="([^"]*)"/g)].map((item) => [item[1], decodeXml(item[2])]));
    const node = { type: match[2], id: attrs.id, name: attrs.name, attrs, parent: stack.at(-1) || null, children: [], depth: stack.length };
    node.parent?.children.push(node); nodes.push(node);
    if (!match[4]) stack.push(node);
  }
  return nodes;
}

/** 부모 프레임·참고 코드 함수명이 아닌 실제 대상/variant 소유자를 판정한다. */
export function componentIdentity(metadata, requestedId, root) {
  const nodes = metadataTree(metadata);
  const unresolved = (reason, node = null) => ({ status: "unresolved", name: null, rawName: node?.name ?? null, nodeId: node?.id ?? null, reason });
  const targets = nodes.filter((n) => n.id === String(requestedId).replace("-", ":"));
  if (targets.length !== 1) return unresolved("Could not find exactly one node for the requested link. In the plan, ask the user which part it is and what to call it.");
  const target = targets[0];
  let candidate;
  if (["component-set", "component_set", "component", "symbol"].includes(target.type)) candidate = target;
  else if (target.type === "frame") {
    // Desktop MCP는 Component Set도 frame으로 반환한다. 직접 variant를 소유한 묶음만 쓴다.
    const groups = [];
    const walk = (n) => {
      const symbols = n.children.filter((c) => c.type === "symbol" || c.type === "component");
      if (["component-set", "component_set"].includes(n.type) || (n.type === "frame" && symbols.length && symbols.every((c) => /=/.test(c.name ?? "") || /^(?:default|hover|focus|disabled|active|click)(?:\b|$)/i.test(c.name ?? "")))) groups.push(n);
      else n.children.forEach(walk);
    }; walk(target);
    if (groups.length !== 1) return unresolved("The frame has no component group, or more than one. Do not guess from the parent frame name. Ask in the plan.");
    candidate = groups[0];
  } else return unresolved("The node is not a Component Set or Component. Ask for the part name in the plan.", target);
  if (!candidate.name || /=/.test(candidate.name)) return unresolved("A variant property name cannot be used as the part name. Check the Component Set and the code name.", candidate);
  const components = join(root, "src/components");
  const names = existsSync(components) ? readdirSync(components, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
  const matches = names.filter((name) => pascal(name) === pascal(candidate.name.trim()));
  if (matches.length !== 1) return unresolved("The Figma name does not match exactly one existing component. Ask about a new name or mapping in the plan.", candidate);
  return { status: "resolved", name: matches[0], rawName: candidate.name, nodeId: candidate.id, reason: "The requested part (or the only group that owns the variants) matches an existing component name." };
}

function balancedBlock(source, from) {
  let depth = 0, quote = null;
  for (let index = from; index < source.length; index++) {
    const char = source[index];
    if (quote) {
      if (char === "\\") index++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") quote = char;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) return source.slice(from + 1, index);
  }
  return "";
}

function functionBlocks(source) {
  const blocks = [];
  for (const match of String(source).matchAll(/\bfunction\s+([A-Z][A-Za-z0-9]*)\s*\(/g)) {
    const parametersOpen = match.index + match[0].length - 1;
    let depth = 0, quote = null, parametersClose = -1;
    for (let index = parametersOpen; index < source.length; index++) {
      const char = source[index];
      if (quote) {
        if (char === "\\") index++;
        else if (char === quote) quote = null;
      } else if (char === '"' || char === "'" || char === "`") quote = char;
      else if (char === "(") depth++;
      else if (char === ")" && --depth === 0) { parametersClose = index; break; }
    }
    const open = parametersClose >= 0 ? source.indexOf("{", parametersClose + 1) : -1;
    if (open >= 0) blocks.push({ name: match[1], signature: source.slice(match.index, open), body: balancedBlock(source, open) });
  }
  return blocks;
}

const staticJsxProps = (attributes) => Object.fromEntries([
  ...[...String(attributes).matchAll(/\b([a-zA-Z][\w-]*)\s*=\s*["']([^"']*)["']/g)].map((match) => [match[1], match[2]]),
  ...[...String(attributes).matchAll(/\b([a-zA-Z][\w-]*)\s*=\s*\{\s*(true|false|["'][^"']*["'])\s*\}/g)].map((match) => [match[1], match[2].replace(/^["']|["']$/g, "")]),
]);

function generatedVariantProps(source, component, attributes) {
  const props = staticJsxProps(attributes);
  const typeBody = String(source).match(new RegExp(`type\\s+${component}Props\\s*=\\s*{([\\s\\S]*?)};`))?.[1] || "";
  const variantKeys = new Set([...typeBody.matchAll(/^\s*([a-zA-Z][\w-]*)\??\s*:\s*([^;]+);/gm)]
    .filter(([, , type]) => /["']|\bboolean\b/.test(type))
    .map((match) => match[1]));
  return Object.fromEntries(Object.entries(props).filter(([key]) => variantKeys.has(key)));
}

function kitApi(root, component) {
  const filename = join(root, "src/components", component, `${component}.tsx`);
  if (!existsSync(filename)) return null;
  const source = readFileSync(filename, "utf8");
  const body = source.match(new RegExp(`interface\\s+${component}Props[^\\{]*{([\\s\\S]*?)}`))?.[1] || "";
  const props = new Map();
  for (const match of body.matchAll(/(?:\/\*\*\s*Figma:\s*([^*]+?)\s*\*\/\s*)?([a-zA-Z][\w-]*)\??\s*:\s*([^;]+);/g)) {
    const [, figmaName, prop, type] = match;
    let allowed = null;
    const alias = type.trim().match(/^([A-Z][A-Za-z0-9]*)$/)?.[1];
    const valueType = alias ? source.match(new RegExp(`type\\s+${alias}\\s*=\\s*([^;]+);`))?.[1] : type;
    if (valueType && /["']/.test(valueType)) allowed = [...valueType.matchAll(/["']([^"']+)["']/g)].map((item) => item[1]);
    else if (/\bboolean\b/.test(valueType || "")) allowed = ["true", "false"];
    props.set((figmaName || prop).trim().toLowerCase(), { prop, allowed });
  }
  return { component, props };
}

function metadataVariantsFromName(name) {
  return Object.fromEntries(String(name || "").split(/\s*,\s*/).map((part) => part.match(/^([^=]+)=(.+)$/)).filter(Boolean).map((match) => [match[1].trim(), match[2].trim()]));
}

const svgOnlyTags = new Set(["svg", "path", "g", "defs", "clipPath", "mask", "use", "symbol", "title", "desc", "circle", "ellipse", "line", "polyline", "polygon", "rect", "linearGradient", "radialGradient", "stop", "pattern", "filter", "feBlend", "feColorMatrix", "feGaussianBlur", "feOffset"]);

function drawsOnlyFigmaSvg(blocks, component) {
  const body = blocks.find((block) => block.name === component)?.body || "";
  const tags = jsxOpeningTags(body, "[A-Za-z][A-Za-z0-9]*").map((tag) => tag.name);
  return tags.includes("svg") && tags.every((tag) => svgOnlyTags.has(tag));
}

/** 노드 id 가 코드에 `data-node-id="1:2"` 나 `node-1_2`(id 속성, 식 안 포함)로 나오는지. */
const mentionsNode = (source, id) => {
  const escaped = String(id).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`data-node-id=["']${escaped}["']|node-${escaped.replace(":", "_")}(?![\\d_])`).test(String(source));
};

/**
 * get_metadata의 하위 instance/symbol과 get_design_context의 컴포넌트 호출을 결정적으로 연결한다.
 * selfNames: 만들고 있는 부품 자신의 이름(코드 이름·Figma 세트 이름). 하위 인스턴스가 자신으로 판정되면
 * 하위 부품이 아니라 이 부품의 안쪽 레이어다(Q-66: Card 의 변형 안 gradient 가 Card 를 요구하던 버그).
 */
export function nestedInstanceFacts(metadata, design, root, sourceVariant = null, { selfNames = [] } = {}) {
  const nodes = metadataTree(metadata);
  const rootNode = nodes[0];
  if (!rootNode) return [];
  // An instance inside another direct child belongs to that child component. Only the
  // requested node's immediate instance children are contracts of the requested part.
  const instances = nodes.filter((node) => node.parent === rootNode && (node.type === "instance" || node.type === "symbol"));
  if (!instances.length) return [];
  const blocks = functionBlocks(String(design));
  const declared = new Set(blocks.map((block) => block.name));
  const defaultName = String(design).match(/export\s+default\s+function\s+([A-Z][A-Za-z0-9]*)/)?.[1];
  const defaultBody = blocks.find((block) => block.name === defaultName)?.body || "";
  // 자기 자신: 이 변형(루트 노드)을 그리는 함수, 기본 내보내기 함수, 그리고 부품 자신의 이름과 같은 함수.
  // get_design_context 는 변형 하나를 `function Card(...)` 처럼 세트 이름의 함수로 돌려준다.
  const selfKeys = new Set(selfNames.filter(Boolean).map((name) => pascal(String(name).trim())));
  const selfBlocks = new Set(blocks.filter((block) => block.name === defaultName || selfKeys.has(block.name) || (rootNode.id && mentionsNode(block.body, rootNode.id))).map((block) => block.name));
  const isSelf = (name) => Boolean(name) && (selfBlocks.has(name) || selfKeys.has(pascal(name)));
  const callsIn = (source) => jsxOpeningTags(source, "[A-Z][A-Za-z0-9]*")
    .filter((tag) => declared.has(tag.name))
    .map((tag) => ({ ...tag, props: staticJsxProps(tag.attributes), nodeId: staticJsxProps(tag.attributes)["data-node-id"] || null }));
  const directCalls = callsIn(design);
  const rootCalls = defaultBody ? callsIn(defaultBody) : [];
  const assigned = new Map();
  const innerLayers = new Set();
  for (const instance of instances) {
    const direct = directCalls.filter((call) => call.nodeId === instance.id);
    if (direct.length === 1) assigned.set(instance, direct[0]);
    else {
      const owner = blocks.filter((block) => mentionsNode(block.body, instance.id));
      // 그 노드를 감싼 함수가 이 부품 자신(변형을 그리는 함수)뿐이면, 인스턴스는 자신의 안쪽에 그려진 레이어다.
      // 예전에는 감싼 함수 이름(Card)을 원래 컴포넌트로 읽어 "Card 가 Card 를 써야 한다"는 사실을 만들었다.
      const others = owner.filter((block) => !isSelf(block.name));
      if (owner.length && !others.length) innerLayers.add(instance);
      else if (others.length === 1) assigned.set(instance, { name: others[0].name, attributes: others[0].signature, props: {}, nodeId: instance.id });
    }
  }
  for (const [instance, call] of assigned) if (isSelf(call.name)) { assigned.delete(instance); innerLayers.add(instance); }
  const unassigned = instances.filter((instance) => !assigned.has(instance) && !innerLayers.has(instance));
  const assignedNodeIds = new Set([...assigned.values()].map((call) => call.nodeId).filter(Boolean));
  const unusedCalls = rootCalls.filter((call) => (!call.nodeId || !assignedNodeIds.has(call.nodeId)) && !isSelf(call.name));
  if (unassigned.length && unassigned.length === unusedCalls.length) unassigned.forEach((instance, index) => assigned.set(instance, unusedCalls[index]));

  const componentDirs = existsSync(join(root, "src/components"))
    ? readdirSync(join(root, "src/components"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : [];
  return instances.map((instance) => {
    // 이 부품 자신으로 판정된 인스턴스: 하위 부품 행을 요구하지 않는다(normalizeFigmaIdentity 가 따로 모은다).
    if (innerLayers.has(instance)) return { nodeId: instance.id || null, layerName: instance.name || null, innerLayer: true, sourceVariant };
    const call = assigned.get(instance);
    const originalName = call?.name || null;
    const kitMatches = componentDirs.filter((name) => name === originalName);
    const kitComponent = kitMatches.length === 1 ? kitMatches[0] : null;
    const inlineFigmaSvg = Boolean(originalName && !kitComponent && drawsOnlyFigmaSvg(blocks, originalName));
    const namedVariants = metadataVariantsFromName(instance.name);
    const generatedVariants = call ? generatedVariantProps(design, originalName, call.attributes) : {};
    const variants = Object.keys(namedVariants).length ? namedVariants : generatedVariants;
    const api = kitComponent && kitApi(root, kitComponent);
    const props = {}, unresolvedProps = [];
    for (const [figmaProp, value] of Object.entries(variants)) {
      if (inlineFigmaSvg) continue;
      const mapping = api?.props.get(figmaProp.toLowerCase());
      if (!mapping || (mapping.allowed && !mapping.allowed.includes(String(value)))) unresolvedProps.push(`${figmaProp}=${value}`);
      else props[mapping.prop] = value === "true" ? true : value === "false" ? false : value;
    }
    const reasons = [];
    if (!originalName) reasons.push("The original component/set name is not exposed unambiguously by the metadata and generated code.");
    else if (!kitComponent && !inlineFigmaSvg) reasons.push(`The original name ${originalName} does not exactly match one kit component.`);
    if (unresolvedProps.length) {
      reasons.push(`No exact existing Figma-to-prop/value mapping for ${unresolvedProps.join(", ")}.`);
      if (kitComponent) reasons.push(`Choose one next step: update the shared ${kitComponent} from its own Figma component to implement this variant, then plan this composite again; or tell me the exact existing prop/value mapping. Do not substitute another kit component.`);
    }
    return {
      nodeId: instance.id || null,
      layerName: instance.name || null,
      originalName,
      variant: Object.entries(variants).map(([key, value]) => `${key}=${value}`).join(", ") || null,
      kitComponent,
      props: Object.keys(props).length ? props : {},
      status: reasons.length ? "ask" : "confirmed",
      reason: reasons.join(" "),
      nonKitImplementation: inlineFigmaSvg ? "drawn inside this part from the Figma SVG" : null,
      sourceVariant,
    };
  });
}

export function normalizeFigmaIdentity(facts, root) {
  const identity = componentIdentity(facts.metadata, figmaNodeId(facts.figmaUrl), root);
  const merged = new Map();
  const innerLayers = [];
  // 만들고 있는 부품 자신의 이름. 코드 이름이 아직 없어도(unresolved) Figma 세트 이름으로 자기 참조를 막는다.
  // 캐시의 예전 facts.name 은 틀렸을 수 있어(Search→Toggle 교정) 쓰지 않는다.
  const selfNames = [identity.name, identity.rawName].filter(Boolean);
  for (const variant of facts.variantDetails || []) {
    const sourceVariant = { id: variant.id, name: variant.name };
    const occurrences = new Map();
    for (const part of nestedInstanceFacts(variant.metadata, variant.design, root, sourceVariant, { selfNames })) {
      if (part.innerLayer) { innerLayers.push({ nodeId: part.nodeId, layerName: part.layerName, sourceVariant }); continue; }
      const baseKey = JSON.stringify([part.layerName, part.originalName, part.variant]);
      const occurrence = occurrences.get(baseKey) || 0;
      occurrences.set(baseKey, occurrence + 1);
      const key = `${baseKey}:${occurrence}`;
      const previous = merged.get(key);
      if (previous) previous.sourceVariants.push(sourceVariant);
      else merged.set(key, { ...part, sourceVariants: [sourceVariant] });
    }
  }
  const nestedParts = [...merged.values()];
  return { ...facts, version: 6, name: identity.name, frameName: identity.rawName, kebab: identity.name?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() ?? null, identity, nestedParts, innerLayers };
}

/** Semantic 후보는 정확한 RGB·alpha가 같은 경우만 반환한다. 역할은 계획에서 확정한다. */
export function exactColorCandidates(value, tokens) {
  const source = parseColorA(value);
  if (!source) return [];
  return tokens.filter((token) => {
    const target = parseColorA(token.value ?? token.hex);
    return target && source.alpha === target.alpha && source.rgb.every((channel, index) => channel === target.rgb[index]);
  });
}

function semanticColors(root) {
  const css = readFileSync(join(root, "src/tokens/tokens.css"), "utf8");
  const raw = new Map([...css.matchAll(/(--color-[a-z0-9-]+):\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
  const resolveColor = (value, seen = new Set()) => {
    const ref = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
    if (ref) {
      if (seen.has(ref) || !raw.has(ref)) return null;
      return resolveColor(raw.get(ref), new Set([...seen, ref]));
    }
    return parseColorA(value) ? value : null;
  };
  let semanticNames;
  try {
    const model = JSON.parse(readFileSync(join(root, ".ds/tokens.json"), "utf8"));
    semanticNames = new Set(model.tokens.filter((token) => token.layer === "semantic" && token.category === "COLOR").map((token) => `--color-${token.name}`));
  } catch {}
  return [...raw].filter(([name, value]) => semanticNames ? semanticNames.has(name) : /^var\(/.test(value))
    .map(([name, value]) => ({ name, value: resolveColor(value), ref: value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1] || null }))
    .filter((token) => token.value);
}

export function stateSelector(state, at, kind, { kebab, split, leftPart, rightPart }) {
  const k = `.ds-${kebab}`;
  const side = /\bleft\b/i.test(state) ? "__left" : /\bright\b/i.test(state) ? "__right" : "";
  const part = split ? at === leftPart ? "__left" : at === rightPart ? "__right" : null : null;
  if (state === "기본") return !split || at === null ? k : part ? k + part : kind === "글자·아이콘" ? k : null;
  if (/hover/i.test(state)) return `${k}${side || part || ""}:hover:not(:disabled)`;
  if (/click|press|active/i.test(state)) return `${k}${side || part || ""}:active:not(:disabled)`;
  if (/focus/i.test(state)) return split && !side ? `${k}:has(:focus-visible)` : `${k}${side || part || ""}:focus-visible`;
  if (/disabled/i.test(state)) {
    if (!split) return `${k}:disabled`;
    if (side || part) return `${k}${side || part}:disabled`;
    return at === null && kind === "배경" ? `${k}:has(:disabled)` : `${k} button:disabled`;
  }
  return null;
}

// 캐시에 저장된 분류 값(기본·배경·글자·아이콘·테두리·안쪽 요소)은 그대로 두고, AI 에게 보여 줄 때만 영어로 바꾼다.
const KIND_LABEL = { "배경": "background", "글자·아이콘": "text/icon", "테두리": "border" };
const shownState = (state) => state === "기본" ? "base" : state;
const shownAt = (at) => at === "(안쪽 요소)" ? "(inner element)" : at || "root";

/**  계획에 필요한 확인값만 전달한다. 역할 해석·선택자·구현 코드·근사 토큰을 확정하지 않는다. */
export function renderFigmaFacts(facts, root, cacheDir) {
  facts = normalizeFigmaIdentity(facts, root);
  const tokens = semanticColors(root);
  const variants = facts.variants || [];
  // 작은 사실 파일(Q-70 결정 5). AI 는 ctx-*.json(60~130KB) 대신 이 파일만 읽는다.
  const key = String(facts.cacheFilename || "").match(/^ctx-(.+)\.json$/)?.[1];
  let factsFile = null;
  if (key) { try { factsFile = writeFactsFiles(cacheDir, key, facts).shown; } catch {} }
  const lines = [
    "[Figma] Pre-analysis for writing the plan. Keep measured values apart from your own interpretation. Do not treat this as an approved implementation contract.",
    "Follow docs/ai-component-workflow.md: write the Markdown plan first. Do not change implementation files before the user approves the plan.",
    "Reuse what has already been read. Only read missing states, missing assets or changed data. Do not assume that the roles of the values below, or all the details, are settled.",
    `## Target: ${facts.frameName || "unknown"} · ${facts.name ? `code name ${facts.name}` : "name not decided"}`,
    `Name check: ${facts.identity.reason} · Part node: ${facts.identity.nodeId || "unknown"}`,
    `Source: ${facts.figmaUrl || "unknown"} · Base size: ${facts.base.w || "unknown"}×${facts.base.h || "unknown"}`,
    factsFile
      ? `For sizes, text styles, icons, gradient tokens and the base code, read only this small facts file: ${factsFile}. Do not read ctx-*.json, .ds/*.json or other parts' plans.`
      : "The facts file could not be saved. Do not read ctx-*.json; ask the student to send the same message again.",
    "## Variants in Figma",
    ...(variants.length ? variants.map((variant) => `- ${variant.id}: ${variant.name}`) : facts.states.map((state) => `- ${state} (node ID unknown)`)),
    "## What was read for each state, and its size",
    ...(facts.variantDetails || []).map((variant) => `- ${variant.id}: ${variant.name} · ${variant.w || "unknown"}×${variant.h || "unknown"} · details ${variant.read ? "read" : "not read / failed"}`),
    "## Colors that differ from the base state (RGB and alpha kept as-is)",
  ];
  for (const entry of facts.colorEntries) {
    const candidates = exactColorCandidates(entry.hex, tokens);
    lines.push(`- ${shownState(entry.state)} · ${shownAt(entry.at)} · ${KIND_LABEL[entry.kind] ?? entry.kind}: ${entry.hex} → semantic tokens with exactly the same value: ${candidates.length ? candidates.map((token) => `${token.name} (${token.value}, ref=${token.ref})`).join(" / ") : "none — needs a mapping and Q&A"}`);
  }
  lines.push("Even if a candidate has the same color, check separately that its role is the same. If there is no candidate, do not use a close color. Decide in the plan where each color is used, its role and its value.");
  lines.push(...gradientLines(facts));
  if (facts.split) lines.push("## Possible structure", `Variant names contain Left/Right, so this may be a split part. The role of each side, and whether each side works on its own, are not confirmed. Check the layer candidates ${facts.leftPart} / ${facts.rightPart} against the source and what the user wants.`);
  if (facts.extraLayers.length) lines.push("## Extra layers that appear in a state", ...facts.extraLayers.map((layer) => `- ${layer.state}: ${layer.name} (${layer.type}) · ${layer.w}×${layer.h} · position ${layer.x},${layer.y} · surrounds the part=${layer.surrounds} · stroke=${layer.strokeHex || "unknown"}. Confirm in the plan what it means for focus and what it covers.`));
  lines.push("## Source assets read", ...Object.keys(facts.assets || {}).map((name) => `- ${name}: SVG from the base variant. Do not assume it appears in other states, or has the same size or color there.`));
  if (facts.assetVariants) lines.push("## SVGs found in each state", ...Object.entries(facts.assetVariants).map(([id, assets]) => `- ${id}: ${Object.keys(assets).join(", ") || "no SVG found (this does not prove there is no icon)"}. The facts file has the original source; check when it actually shows.`));
  if (facts.nestedParts?.length) {
    lines.push(
      "## Nested instance facts",
      "Use the original component/set name below, not appearance, dimensions, or whether the layer contains only an icon. Copy these rows into the plan's Nested parts table and get the user's approval.",
      "| Figma instance | Original component / set | Figma variant | Found in requested variants | Kit component and props | Status |",
      "|---|---|---|---|---|---|",
      ...facts.nestedParts.map((part) => {
        const instance = `${part.layerName || "unknown layer"}${part.nodeId ? ` (${part.nodeId})` : ""}`;
        const props = Object.entries(part.props || {}).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(", ");
        const kit = part.kitComponent ? `${part.kitComponent}${props ? ` { ${props} }` : ""}` : part.nonKitImplementation ? `none — ${part.nonKitImplementation}` : "ask";
        const foundIn = (part.sourceVariants || []).map((variant) => `${variant.name || "unknown"}${variant.id ? ` (${variant.id})` : ""}`).join(", ") || "unknown";
        return `| ${instance} | ${part.originalName || "unknown"} | ${part.variant || "none confirmed"} | ${foundIn} | ${kit} | ${part.status}${part.reason ? ` — ${part.reason}` : ""} |`;
      }),
      "A row marked ask is unresolved input. Do not substitute a visually similar kit part or approve the plan until the user resolves it.",
      "If the student chose only some variants, write their node IDs in the plan header as scope_nodes: [<id>] and copy only the rows found in those variants. The checks then skip the other variants.",
    );
  }
  if (facts.innerLayers?.length) lines.push(
    "## Inner layers of this part (not nested parts)",
    ...facts.innerLayers.map((layer) => `- ${layer.layerName || "unknown layer"}${layer.nodeId ? ` (${layer.nodeId})` : ""} in ${layer.sourceVariant?.name || "unknown"}${layer.sourceVariant?.id ? ` (${layer.sourceVariant.id})` : ""}: drawn inside this part's own code. It does not need a Nested parts row and this part never imports itself.`),
  );
  if (facts.unreadVariants?.length || facts.failedReads?.length) lines.push("## Missing input", ...(facts.unreadVariants || []).map((variant) => `- Unread variant ${variant.id}: ${variant.name}`), ...(facts.failedReads || []).map((error) => `- Read failed: ${error}`));
  lines.push("## Questions the plan must record", "- Do not decide this part's real role, what a click does or how the keyboard works from the picture alone.", "- Check background transparency and the parent canvas, the icon in each state, API and token roles, and any combinations that were not read.", "- Automatic extraction does not replace the full design contract. Read what is missing, or ask the user.");
  mkdirSync(cacheDir, { recursive: true });
  // variants·iconPathsByVariant 는 계획의 scope_nodes 로 검사 범위를 좁힐 때 쓴다(Q-66).
  const iconPathsByVariant = Object.fromEntries(Object.entries(facts.assetVariants || {}).map(([id, assets]) => [id, figmaIconPaths(assets)]));
  writeFileSync(join(cacheDir, "last.json"), JSON.stringify({ component: facts.name, componentIdentity: facts.identity, sourceUrl: facts.figmaUrl, states: facts.states, variants: variants.map((variant) => ({ id: variant.id, name: variant.name, state: label(variant) })), baseVariantId: facts.variantDetails?.[0]?.id ?? null, nestedParts: facts.nestedParts || [], innerLayers: facts.innerLayers || [], colorStates: facts.colorEntries.filter((entry) => entry.kind === "배경").map(({ state, hex, at }) => ({ state, hex, at })), tokens: [], tokenMappingApproved: false, icons: Object.keys(facts.assets || {}).length, iconPaths: figmaIconPaths(facts.assets), iconPathsByVariant, groupFocus: null }));
  return lines.join("\n");
}

// ── 분석 ─────────────────────────────────────────────────────────

const label = (v) => v.name.replace(/^[^=]+=/, "").replace(/\)\)+$/, ")");
/** Component Set의 바깥 symbol만 variant 후보로 읽고 내부 아이콘/부품 symbol을 제외한다. */
export function metadataVariants(metadata) {
  const stack = [];
  const symbols = [];
  for (const match of String(metadata).matchAll(/<(\/?)([a-zA-Z_-]+)\b([^>]*?)(\/?)>/g)) {
    if (match[1]) { stack.pop(); continue; }
    if (match[2] === "symbol") {
      const id = match[3].match(/\bid="([^"]+)"/)?.[1];
      const name = match[3].match(/\bname="([^"]+)"/)?.[1];
      if (id && name) symbols.push({ id, name, depth: stack.length });
    }
    if (!match[4]) stack.push(match[2]);
  }
  const depth = Math.min(...symbols.map((symbol) => symbol.depth));
  return symbols.filter((symbol) => symbol.depth === depth).map(({ id, name }) => ({ id, name }));
}
const layersOf = (meta) => {
  const own = meta.match(/<(?:symbol|frame|instance|component)\b[^>]*>/)?.[0] || "";
  const ownWidth = Number(own.match(/\bwidth="([\d.]+)"/)?.[1] || 0);
  const ownHeight = Number(own.match(/\bheight="([\d.]+)"/)?.[1] || 0);
  const layers = [...meta.matchAll(/^(\s+)<(\w+) id="[^"]+" name="([^"]+)" x="([-\d.]+)" y="([-\d.]+)" width="([\d.]+)" height="([\d.]+)"/gm)].map((m) => ({
    depth: m[1].length, type: m[2], name: m[3], x: +m[4], y: +m[5], w: +m[6], h: +m[7],
  }));
  const top = Math.min(...layers.map((l) => l.depth));
  return { w: ownWidth, h: ownHeight, layers, top: layers.filter((l) => l.depth === top) };
};
// 코드 한 줄마다 색 클래스를 찾고, 그 줄의 data-name 으로 어느 요소인지 정한다.
export const colorsIn = (code) => {
  const out = [];
  for (const line of String(code).split("\n")) {
    const isRoot = /className=\{className \|\|/.test(line);
    const layer = isRoot ? null : line.match(/data-name="([^"]+)"/)?.[1] ?? "(안쪽 요소)";
    for (const [prefix, kind] of [["bg", "배경"], ["text", "글자·아이콘"], ["border|outline|ring", "테두리"]]) {
      for (const match of line.matchAll(new RegExp(`\\b(?:${prefix})-\\[([^\\]]+)\\](?:/(\\d+(?:\\.\\d+)?))?`, "g"))) {
        const value = match[1].match(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b|rgba?\([^)]*\)/)?.[0]?.replace(/_/g, " ");
        const parsed = value && parseColorA(value);
        if (parsed) {
          const color = match[2] === undefined ? norm(value) : `rgba(${parsed.rgb.map((channel) => channel * 255).join(", ")}, ${parsed.alpha * Number(match[2]) / 100})`;
          out.push({ kind, hex: color, at: layer });
        }
      }
    }
    if (/\btext-white\b/.test(line)) out.push({ kind: "글자·아이콘", hex: "#FFFFFF", at: layer });
    if (/\bbg-transparent\b/.test(line)) out.push({ kind: "배경", hex: "rgba(0, 0, 0, 0)", at: layer });
  }
  return out;
};

async function analyze(message, nodeId, call, root) {
  let rateLimited = false;
  const failedReads = [];
  const soft = (promise, fallback) =>
    promise.catch((error) => {
      if (/rate limit/i.test(error.message)) rateLimited = true;
      failedReads.push(error.message);
      return typeof fallback === "function" ? fallback(error) : fallback;
    });
  // 큰 프레임이면 get_metadata 한 번으로 멈춘다. get_variable_defs 는 부품으로 읽을 때만 부른다(Figma 호출 한도).
  const metadata = await soft(call("get_metadata", { nodeId }), "");
  if (rateLimited) return { rateLimited };
  const requestedTag = String(metadata).match(new RegExp(`<([\\w-]+)\\b[^>]*\\bid="${nodeId}"[^>]*>`))?.[0] || "";
  const variantCount = metadataVariants(metadata).length;
  const identity = componentIdentity(metadata, nodeId, root);
  if (/^<(?:canvas|page)\b/.test(requestedTag) || (/^<frame\b/.test(requestedTag) && (variantCount === 0 || variantCount > 64 || (identity.nodeId && identity.nodeId !== nodeId)))) {
    return { metadata, blocked: "[Figma] The link points to a big frame or a whole screen, not one part. Do not read its child nodes or guess the design. If the user wants a website or a page from this screen, read `.qwen/commands/my-website.md` now and follow it with this link as its input; do not ask the user to type a command. If the user wants one part, tell them: 'This link is a big frame or a whole page. Please send the link to the one part you want to build.' Then stop." };
  }
  const variables = await soft(call("get_variable_defs", { nodeId }), "{}");
  if (rateLimited) return { rateLimited };
  const frameName = identity.rawName;
  const variants = metadataVariants(metadata);
  const base = variants.find((v) => /default/i.test(v.name)) || variants[0];
  const [design, baseMetadata] = await Promise.all([
    soft(call("get_design_context", { nodeId: base?.id || nodeId, artifactType: "REUSABLE_COMPONENT", taskType: "CREATE_ARTIFACT", excludeScreenshot: true }), (e) => `(Could not read the design code: ${e.message})`),
    base ? soft(call("get_metadata", { nodeId: base.id }), "") : Promise.resolve(metadata),
  ]);
  if (rateLimited) return { rateLimited };

  const name = identity.name;
  const baseMeta = layersOf(baseMetadata);
  const variantDetails = [{ id: base?.id || nodeId, name: base?.name || frameName, w: baseMeta.w, h: baseMeta.h, read: Boolean(baseMetadata) && !/Could not read the design code/.test(String(design)), design: String(design), metadata: baseMetadata }];
  if (rateLimited) return { rateLimited };
  const frames = baseMeta.top.filter((l) => l.type === "frame" || l.type === "instance").sort((a, b) => a.x - b.x);
  const split = variants.some((v) => /\b(left|right)\b/i.test(label(v)));
  const baseColors = colorsIn(design);
  const key = (c) => `${c.kind}|${c.hex}|${c.at}`;
  const seen = new Set();
  const colorEntries = [];
  for (const c of baseColors) if (!seen.has(key(c))) (seen.add(key(c)), colorEntries.push({ state: "기본", ...c }));
  const baseKeys = new Set(baseColors.map(key));
  const rank = (n) => [/default/i, /hover/i, /click|press|active/i, /focus/i, /disabled/i].findIndex((r) => r.test(n));
  const others = variants.filter((v) => v !== base).sort((a, b) => ((rank(a.name) + 9) % 9) - ((rank(b.name) + 9) % 9));
  const usedHex = new Set(baseColors.map((c) => c.hex));
  const extraLayers = [];
  // Independent source reads are bounded to four variants per batch.
  const otherReads = [];
  for (let start = 0; start < others.length && !rateLimited; start += 4) {
    const rows = await Promise.all(others.slice(start, start + 4).map(async (variant) => {
      const [code, variantMetadata] = await Promise.all([
        soft(call("get_design_context", { nodeId: variant.id, excludeScreenshot: true }), ""),
        soft(call("get_metadata", { nodeId: variant.id }), ""),
      ]);
      return { variant, code, variantMetadata };
    }));
    otherReads.push(...rows);
  }
  if (rateLimited) return { rateLimited };
  const assetCache = new Map();
  const readSvg = (url, assetName) => {
    if (!assetCache.has(url)) assetCache.set(url, fetch(url, { signal: AbortSignal.timeout(10_000) }).then(async (response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const svg = await response.text();
      if (!/<svg\b/.test(svg)) throw new Error("not an SVG response");
      return svg;
    }).catch((error) => { failedReads.push(`asset ${assetName}: ${error.message}`); return ""; }));
    return assetCache.get(url);
  };
  for (const { variant: v, code, variantMetadata } of otherReads) {
    const meta = layersOf(variantMetadata);
    variantDetails.push({ id: v.id, name: v.name, w: meta.w, h: meta.h, read: Boolean(code && variantMetadata), design: String(code), metadata: variantMetadata });
    if (rateLimited) return { rateLimited };
    const state = label(v);
    const stateSeen = new Set();
    for (const c of colorsIn(code)) {
      if (baseKeys.has(key(c)) || stateSeen.has(key(c))) continue;
      stateSeen.add(key(c));
      usedHex.add(c.hex);
      colorEntries.push({ state, ...c });
    }
    const baseNames = new Set(baseMeta.layers.map((l) => l.name));
    for (const layer of meta.layers.filter((l) => !baseNames.has(l.name))) {
      const at = String(code).indexOf(`data-name="${layer.name}"`);
      const constName = at >= 0 ? String(code).slice(at).match(/src=\{(\w+)\}/)?.[1] : null;
      const url = constName ? String(code).match(new RegExp(`const ${constName} = "([^"]+)"`))?.[1] : null;
      const svg = url ? await readSvg(url, constName) : "";
      const stroke = svg.match(/stroke="(#[0-9a-fA-F]{3,8})"/)?.[1];
      const strokeWidth = +(svg.match(/stroke-width="([\d.]+)"/)?.[1] || 0);
      const svgW = +(svg.match(/<svg[^>]*width="([\d.]+)"/)?.[1] || 0);
      const surrounds = layer.x < 0 && layer.y < 0 && layer.x + layer.w > meta.w && layer.y + layer.h > meta.h;
      if (stroke) usedHex.add(norm(stroke));
      extraLayers.push({
        state, name: layer.name, type: layer.type, w: layer.w, h: layer.h, x: layer.x, y: layer.y, surrounds,
        strokeHex: stroke ? norm(stroke) : null, strokeWidth,
        offsetCandidate: svgW && meta.w ? Math.max(0, (svgW - meta.w) / 2 - strokeWidth) : -layer.x,
      });
    }
  }
  let palette = {};
  try {
    palette = parseMcpJson(variables);
  } catch {}
  const paletteHex = Object.fromEntries(Object.entries(palette).filter(([, v]) => typeof v === "string" && parseColorA(v)).map(([n, v]) => [n, norm(v)]));
  const leftovers = [...new Set(Object.values(paletteHex))].filter((hex) => !usedHex.has(hex));

  const assetVariants = {};
  for (const variant of variantDetails) {
    assetVariants[variant.id] = {};
    for (const [, constName, url] of String(variant.design).matchAll(/const (\w+) = "(http:\/\/(?:localhost|127\.0\.0\.1):3845\/assets\/[^"]+\.svg)"/g)) {
      const svg = await readSvg(url, constName);
      if (svg) assetVariants[variant.id][constName] = svg;
    }
  }
  const assets = assetVariants[base?.id || nodeId] || {};
  return {
    facts: {
      version: 6, identity,
      variants, variantDetails, unreadVariants: variantDetails.filter((variant) => !variant.read), failedReads,
      frameName, name, kebab: name?.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() ?? null,
      states: variants.map(label), split,
      leftPart: split ? frames[0]?.name : null,
      rightPart: split && frames.length > 1 ? frames[frames.length - 1].name : null,
      base: { w: baseMeta.w, h: baseMeta.h },
      colorEntries, extraLayers, leftovers, palette: paletteHex, variables: palette,
      design: String(design), metadata,
      assets, assetVariants,
      figmaUrl: (String(message).match(/https?:\/\/(?:www\.)?figma\.com\/[^\s)'"]+/i)?.[0] || "").replace(/&m=dev$/, ""),
    },
    complete: variantDetails.length > 0 && variantDetails.every((variant) => variant.read) && failedReads.length === 0,
  };
}

// Figma MCP 는 플랜·좌석별 한도가 있다 (Starter 또는 View/Collab 는 월 최대 20회,
// Professional Full/Dev 와 Education 은 하루 최대 200회). 실제 한도는 Figma 정책을 확인한다.
// 같은 링크는 한 번 읽은 결과를 7일 동안 다시 쓴다. 새로 읽으려면 node_modules/.cache/ds-figma 를 지운다.
const CACHE_DAYS = 7;
const RATE_LIMIT = [
  "[Figma] Could not read the design because the Figma MCP usage limit was reached.",
  "Do not guess the design. Do not create files. Tell the user exactly this, then stop:",
  "'You have reached the Figma MCP usage limit. Starter plans and View or Collab seats can read up to 20 times a month. Professional Full or Dev seats and the Education plan can read up to 200 times a day. Ask again after the limit resets, or ask your teacher for Figma data that was already read.'",
].join("\n");

/** 큰 프레임으로 막을 때 받은 get_metadata 를 두는 곳. web:figma 가 30분 안이면 다시 부르지 않고 쓴다. */
export const FIGMA_SCREENS_DIR = "var/figma-screens";
export const screenMetadataFile = (root, fileKey, nodeId) => join(root, FIGMA_SCREENS_DIR, `${fileKey}-${String(nodeId).replaceAll(":", "-")}.xml`);

export function figmaRequest(message, root) {
  const nodeId = figmaNodeId(message);
  if (!nodeId) return null;
  const fileKey = String(message).match(/figma\.com\/(?:design|file)\/([^/?\s]+)/i)?.[1] || "file";
  if (!/^[A-Za-z0-9_-]+$/.test(fileKey)) return null;
  const cacheDir = join(root, "node_modules", ".cache", "ds-figma");
  const key = `${fileKey}-${nodeId.replace(":", "-")}`;
  return { nodeId, fileKey, cacheDir, key, cacheFile: join(cacheDir, `ctx-${key}.json`) };
}

export function cachedFigmaContext(message, root) {
  const request = figmaRequest(message, root);
  if (!request) return null;
  const { cacheDir, cacheFile, key } = request;
  if (existsSync(cacheFile) && Date.now() - statSync(cacheFile).mtimeMs < CACHE_DAYS * 864e5) {
    try {
      const cached = JSON.parse(readFileSync(cacheFile, "utf8"));
      if ([3, 4, 5, 6].includes(cached.facts?.version) && cached.complete === true) {
        const cacheStat = statSync(cacheFile);
        cached.facts = normalizeFigmaIdentity(cached.facts, root);
        // 기존 캐시 이름을 원본 metadata로 재판정하며 조회 시각은 유지한다.
        writeFileSync(cacheFile, JSON.stringify(cached));
        utimesSync(cacheFile, cacheStat.atime, cacheStat.mtime);
        return `[Figma] (Data read at ${String(cached.savedAt).slice(0, 16).replace("T", " ")}. The Figma file may have changed since then; check separately.)\n` + renderFigmaFacts({ ...cached.facts, cacheFilename: `ctx-${key}.json` }, root, cacheDir);
      }
    } catch {}
  }
  return null;
}

export async function figmaContext(message, root) {
  const request = figmaRequest(message, root);
  if (!request) return null;
  const cached = cachedFigmaContext(message, root);
  if (cached) return cached;
  const { nodeId, fileKey, cacheDir, cacheFile, key } = request;

  let session;
  try {
    session = (await rpc(1, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "ds-starter", version: "1" } })).session;
  } catch (error) {
    return [
      "[Figma] The request has a Figma link, but could not connect to the Figma Desktop MCP server.",
      `Cause: ${error.message}`,
      "Do not guess the design. Tell the user: 'Open the file in the Figma desktop app, turn on Dev Mode → Enable desktop MCP server, then ask again.' Then stop.",
    ].join("\n");
  }
  let id = 2;
  const call = (name, extra) => rpc(id++, "tools/call", { name, arguments: { clientLanguages: "typescript,css", clientFrameworks: "react", ...extra } }, session).then((r) => r.text);
  const result = await analyze(message, nodeId, call, root);
  if (result.rateLimited) return RATE_LIMIT;
  if (result.blocked) {
    try {
      if (result.metadata && fileKey !== "file") {
        mkdirSync(join(root, FIGMA_SCREENS_DIR), { recursive: true });
        writeFileSync(screenMetadataFile(root, fileKey, nodeId), String(result.metadata));
      }
    } catch {}
    return result.blocked;
  }
  // 부분 조회도 분석 근거로 저장하지만, 다음 요청의 완전한 캐시로 재사용하지 않는다.
  let cacheFilename;
  if (result.facts) {
    try {
      mkdirSync(cacheDir, { recursive: true });
      writeFileSync(cacheFile, JSON.stringify({ savedAt: new Date().toISOString(), complete: result.complete, facts: result.facts }));
      cacheFilename = `ctx-${key}.json`;
    } catch {}
  }
  return renderFigmaFacts({ ...result.facts, cacheFilename }, root, cacheDir);
}

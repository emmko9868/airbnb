/**
 * Figma 변수를 MCP 로 가져와 .ds/figma-variables.json 에 저장한다. (의존성 0)
 *
 *   node scripts/figma-tokens.mjs <Figma 노드 링크> [<링크> …]   그 노드들이 쓰는 변수
 *   node scripts/figma-tokens.mjs <Figma 파일 링크> --all-pages   파일의 모든 페이지가 쓰는 변수 (가장 많이 가져온다)
 *   node scripts/figma-tokens.mjs --from <get_variable_defs 결과.json>   MCP 없이 저장해 둔 결과로
 *   --replace  이미 가져온 변수와 합치지 않고 처음부터 다시 받는다 (강사용)
 *   --fresh    프롬프트 훅이 10분 안에 읽어 둔 같은 노드의 변수를 쓰지 않고 Figma 를 다시 부른다
 *
 * 처음 가져올 때(.ds/figma-variables.json 이 없을 때)는 샘플 색을 학생 색으로 전면 교체한다.
 * 이미 가져온 학생 변수가 있으면 덮어쓰지 않고 이름 기준으로 합친다(Q-65): 새 이름 = 추가,
 * 같은 이름 다른 값 = Figma 값으로 갱신(역할 매핑은 이름을 따라간다), 이번에 안 보인 이름 = 유지.
 * 색 역할은 Figma 선언 또는 학생 승인 계획만 적용하고, 비색상 layout만 보충한다 (scripts/lib/figma-merge.mjs).
 * Figma MCP 는 호출 한도가 작다 — 훅이 방금 읽은 노드는 캐시를 써서 0회로 끝낸다.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { rpc, figmaNodeId, figmaRequest, parseMcpJson, RATE_LIMIT_TERMINAL } from "./figma-context.mjs";
import { variableDefsToCollections, combineVariableDefs, mergeImportedDefs, shortDefValue, withGradientVariables } from "./lib/figma-merge.mjs";
import { partGradientTokens } from "./lib/figma-gradients.mjs";
import { toEnglish } from "./lib/i18n.mjs";
import { ROLE_COLOR_CHANGED, readStudentTokenContext, semanticMappingValid } from "./lib/token-plan.mjs";

const root = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2);
const out = join(root, ".ds", "figma-variables.json");
const fromAt = args.indexOf("--from");
const allPages = args.includes("--all-pages");
const replace = args.includes("--replace");
const fresh = args.includes("--fresh");
const links = args.filter((a, i) => /figma\.com/.test(a) && args[i - 1] !== "--from");
/** 프롬프트 훅이 읽어 둔 노드 캐시를 다시 쓰는 시간. 그보다 오래되면 Figma 가 바뀌었을 수 있어 다시 부른다. */
export const CACHED_READ_MS = 10 * 60 * 1000;

/** 훅 캐시(ctx-<file>-<node>.json)의 facts.variables. 10분 안이고 --fresh 가 아닐 때만. */
function cachedVariables(link) {
  if (fresh) return null;
  const request = figmaRequest(link, root);
  if (!request || !existsSync(request.cacheFile)) return null;
  try {
    const cached = JSON.parse(readFileSync(request.cacheFile, "utf8"));
    const savedAt = Date.parse(cached.savedAt);
    const age = Date.now() - (Number.isFinite(savedAt) ? savedAt : statSync(request.cacheFile).mtimeMs);
    const variables = cached.facts?.variables;
    if (!(age >= 0 && age <= CACHED_READ_MS) || !variables || typeof variables !== "object" || Array.isArray(variables)) return null;
    if (cached.complete !== true && !Object.keys(variables).length) return null;
    return variables;
  } catch {
    return null;
  }
}

/**
 * 프롬프트 훅이 읽어 둔 부품 캐시(ctx-<file>-<node>.json)의 디자인 코드에서 그라데이션 토큰을 만든다(Q-70 결정 8).
 * 변수(get_variable_defs)는 그라데이션 값을 비워 주므로 디자인 코드가 유일한 원본이다. 캐시 나이는 따지지 않는다(값이 디자인 그대로).
 */
function cachedGradients(link) {
  const request = link ? figmaRequest(link, root) : null;
  if (!request || !existsSync(request.cacheFile)) return null;
  try {
    const facts = JSON.parse(readFileSync(request.cacheFile, "utf8")).facts;
    if (!facts?.variantDetails?.length) return null;
    const { part, tokens } = partGradientTokens(facts);
    return { part, partName: facts.frameName || facts.name || part, node: request.nodeId, tokens };
  } catch {
    return null;
  }
}

let defs = {};
const nodes = [];
const gradientReads = [];
if (fromAt >= 0) {
  try { defs = combineVariableDefs({}, JSON.parse(readFileSync(args[fromAt + 1], "utf8"))); }
  catch (error) { fail(error); }
  nodes.push(`file:${args[fromAt + 1]}`);
} else {
  if (!links.length) {
    console.error("Usage: node scripts/figma-tokens.mjs <Figma link> [--all-pages]  ·  node scripts/figma-tokens.mjs --from <defs.json>");
    process.exit(2);
  }
  const targets = links.map((link) => ({ link, nodeId: figmaNodeId(link) })).filter((target) => target.nodeId);
  let session = null, id = 2;
  const base = { clientLanguages: "typescript,css", clientFrameworks: "react" };
  const call = async (name, extra) => {
    if (!session) {
      try {
        session = (await rpc(1, "initialize", { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "ds-starter", version: "1" } })).session ?? "";
      } catch (error) {
        console.error(`Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server. (${error.message})`);
        process.exit(1);
      }
    }
    return rpc(id++, "tools/call", { name, arguments: { ...base, ...extra } }, session || undefined).then((r) => r.text);
  };
  let figmaCalls = 0;
  if (allPages) {
    figmaCalls++;
    // nodeId 없이 부르면 (선택이 없을 때) 페이지 목록을 준다
    const pages = await call("get_metadata", {}).catch((e) => fail(e));
    for (const m of String(pages).matchAll(/(?:id|guid)="?([0-9]+:[0-9]+)"?/g)) if (!targets.some((target) => target.nodeId === m[1])) targets.push({ link: null, nodeId: m[1] });
  }
  if (!targets.length) {
    console.error("The link has no node-id. Use a link to a node, or add --all-pages.");
    process.exit(2);
  }
  for (const { link, nodeId } of targets) {
    const cached = link ? cachedVariables(link) : null;
    let incoming;
    if (cached) incoming = cached;
    else {
      const text = await call("get_variable_defs", { nodeId }).catch((e) => fail(e));
      figmaCalls++;
      try { incoming = parseMcpJson(text); }
      catch { fail(new Error(`BLOCKED_INPUT: The variable response for ${nodeId} is broken or cut off.`)); }
    }
    try { defs = combineVariableDefs(defs, incoming); }
    catch (error) { fail(error); }
    nodes.push(nodeId);
    const gradients = cachedGradients(link);
    if (gradients) gradientReads.push(gradients);
    console.log(`  ${nodeId}: ${Object.keys(incoming).length} variables${cached ? " — from the cached read, 0 Figma calls" : ""}`);
  }
  if (!figmaCalls) console.log("Figma calls: 0 (the kit read this node in the last 10 minutes; add --fresh to read it again).");
}

function fail(error) {
  if (/rate limit/i.test(error.message)) {
    console.error(RATE_LIMIT_TERMINAL);
  } else console.error(`Figma MCP error: ${error.message}`);
  process.exit(1);
}

// 한 응답(이번에 읽은 노드들) 안의 이름·값 충돌은 합치기 전에 막는다. 저장된 파일은 그대로 둔다.
let incomingCheck;
try { incomingCheck = variableDefsToCollections(defs); } catch (error) { fail(error); }
if (incomingCheck.conflicts.length) { console.error(`BLOCKED_INPUT: Variable name or value conflicts: ${incomingCheck.conflicts.join("; ")}`); process.exit(1); }

// 이미 가져온 학생 변수(raw)가 있으면 덮어쓰지 않고 합친다. 처음이거나 --replace 면 지금처럼 새로 쓴다.
let previous = null;
if (existsSync(out)) {
  try {
    const saved = JSON.parse(readFileSync(out, "utf8"));
    if (saved?.raw && typeof saved.raw === "object" && !Array.isArray(saved.raw) && Object.keys(saved.raw).length) previous = saved;
  } catch {}
}
const merge = previous && !replace ? mergeImportedDefs(previous.raw, defs) : null;
const finalDefs = merge ? merge.defs : defs;
let converted;
try { converted = variableDefsToCollections(finalDefs); } catch (error) { fail(error); }
const { conflicts, typography, effects, missing } = converted;
// 그라데이션: 이번에 읽은 부품의 것으로 바꾸고, 다른 부품의 것은 그대로 둔다(같은 입력 → 같은 이름·값).
const readParts = new Set(gradientReads.map((read) => read.part));
const gradients = [
  ...(merge && Array.isArray(previous.gradients) ? previous.gradients.filter((row) => !readParts.has(row.part)) : []),
  ...gradientReads.flatMap((read) => read.tokens.map((token) => ({ name: token.name, part: read.part, partName: read.partName, node: read.node, value: token.value, uses: token.uses.map((use) => `${use.variant} (${use.variantId}) · ${use.layer}`) }))),
];
const collections = withGradientVariables(converted.collections, gradients);
if (conflicts.length) { console.error(`BLOCKED_INPUT: Variable name or value conflicts: ${conflicts.join("; ")}`); process.exit(1); }
mkdirSync(join(root, ".ds"), { recursive: true });
const fileKey = (links[0] || "").match(/figma\.com\/(?:design|file)\/([^/?\s]+)/i)?.[1] || "";
const savedNodes = merge ? [...new Set([...(Array.isArray(previous.nodes) ? previous.nodes : []), ...nodes])] : nodes;
writeFileSync(
  out,
  JSON.stringify({ $comment: "scripts/figma-tokens.mjs 가 Figma MCP 로 가져온 변수. 손으로 고치지 말고 다시 가져온다. 우리 쪽 정의는 .ds/source.json.", schema_version: "1.0", file_key: fileKey || (merge ? previous.file_key || "" : ""), imported_at: new Date().toISOString(), nodes: savedNodes, collections, conflicts, typography, effects, gradients, raw: finalDefs }, null, 2) + "\n"
);
if (merge) {
  console.log("Merged with the variables imported before (Figma wins on values; role choices follow the names):");
  console.log(`Added: ${merge.added.length ? merge.added.join(", ") : "none"}`);
  if (merge.changed.length) for (const row of merge.changed) console.log(`Changed: ${row.name} ${shortDefValue(row.from)} → ${shortDefValue(row.to)}`);
  else console.log("Changed: none");
  console.log(`Kept: ${merge.kept}`);
  if (fileKey && previous.file_key && fileKey !== previous.file_key) console.log(`Note: this link is from another Figma file (${fileKey}) than the earlier import (${previous.file_key}). Both are kept.`);
} else if (previous) {
  console.log("Replaced: the earlier import was not kept (--replace).");
} else {
  console.log("First import: your Figma colors replace the sample colors.");
}
const count = (type) => collections.flatMap((c) => c.variables).filter((v) => (type === "COLOR" ? v.type === "COLOR" : v.type !== "COLOR")).length;
console.log(`Saved: .ds/figma-variables.json — ${count("COLOR")} colors, ${count("OTHER")} non-color layout values`);
for (const row of effects.converted) console.log(`Shadow converted: ${row.name} → ${row.value}`);
for (const name of missing) console.log(`Figma did not send the value of ${name}. No token was made for it.${/gradient/i.test(name) ? " Gradients come from the part's design instead (Gradient converted lines)." : ""}`);
for (const read of gradientReads) for (const token of read.tokens) console.log(`Gradient converted: --gradient-${token.name} ← ${token.uses.map((use) => use.variant).join(" / ")} (Figma value as is)`);
for (const row of effects.review) console.log(`Shadow needs review: ${row.name} — ${toEnglish(row.reason) ?? row.reason} It was left out of the tokens. The original value is kept in raw.`);
if (typography.styles.length) {
  console.log(`Type scale: ${typography.styles.length} text styles become --text-type-* tokens. The existing text roles (--text-body-1 and the rest) stay the same. See them in Storybook → Foundation → Typography.`);
  console.log(existsSync(join(root, ".ds/typography.json")) ? "Text: you already have an approved text choice. ds:tokens checks the source and default token hashes again." : "Text: the starter defaults stay. If you do not change them, you need no text plan and no extra steps.");
  console.log("Only if you want to change them: docs/templates/typography-plan.md → docs/plans/typography.md → the AI runs pnpm ds:apply-token-plan docs/plans/typography.md --prepare → once you approve, the AI runs the same command without --prepare.");
  console.log("The original text styles are kept under typography in .ds/figma-variables.json. If you have an approved choice, ds:tokens checks the source hash again.");
}
// 새 색이 추가만 됐고 승인된 역할의 색이 그대로면 승인은 유지된다(Q-70 결정 7). AI 가 색 계획을 다시 만들지 않게 분명히 말한다.
if (merge && existsSync(join(root, ".ds", "semantic.json"))) {
  try {
    const overrides = JSON.parse(readFileSync(join(root, ".ds", "semantic.json"), "utf8"));
    if (Object.keys(overrides).some((key) => !key.startsWith("$"))) {
      const context = readStudentTokenContext(root);
      if (semanticMappingValid(overrides, context.figma, context.tokens, root)) {
        if (merge.added.length && !merge.changed.length) console.log("New colors were added as primitives. Your approved roles stay — nothing to approve. Do not change docs/plans/tokens.md.");
        else if (merge.added.length || merge.changed.length) console.log("Only colors outside the approved roles changed. Your approved roles stay — nothing to approve. Do not change docs/plans/tokens.md.");
      } else console.log(`Roles: ${ROLE_COLOR_CHANGED}`);
    }
  } catch {}
}
if (fromAt >= 0) {
  console.log("Next: the AI runs pnpm ds:tokens. If roles are missing, the AI proposes them in docs/plans/tokens.md, and once you approve it, the AI runs pnpm ds:apply-token-plan.");
} else {
  // Figma 링크로 가져왔으면 토큰까지 바로 다시 만든다. Storybook 의 Foundation 은 토큰 파일을 읽으므로 곧바로 바뀐다.
  console.log("\nRebuilding the tokens (pnpm ds:tokens)…");
  const tokens = spawnSync(process.execPath, [fileURLToPath(new URL("./ds.mjs", import.meta.url)), "tokens"], { cwd: root, stdio: "inherit", env: { ...process.env, DS_ROOT: root } });
  console.log(tokens.status === 0
    ? "Done: the Foundation pages in Storybook switch to the new tokens right away."
    : "The import is done. Next (AI): propose the empty roles in docs/plans/tokens.md as one recommended table and ask one bundled choice; after the student approves, run pnpm ds:apply-token-plan yourself. Never ask the student to type commands or edit files. Foundation already shows the imported colors.");
}

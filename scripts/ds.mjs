#!/usr/bin/env node
/**
 * ds — Figma → 3계층 토큰 → Storybook 파이프라인.
 *
 * 의존성 0. `node scripts/ds.mjs <명령>` 으로 바로 돈다.
 *
 *   init    ds.config.json 의 seed 만으로 source 없이 시작 (L0)
 *   tokens  source.json → 3계층 해석 → tokens.css / tokens.json / provenance
 *   enrich  설명 없는 컴포넌트의 설명을 LLM 으로 채움 (선택, ai.enabled)
 *   gen     컴포넌트 → story · Code Connect · 구현 스캐폴드 (Figma + 기준선)
 *   baseline  기준선만 생성. --tier=core,standard --stack=shadcn
 *   diff    직전 lock 과 비교 (필드별 이전/현재)
 *   guard   정책 규칙 G1~G16
 *   docs    Storybook 문서 페이지 (계층·카탈로그·정책)
 *   all     tokens → gen → diff → guard
 */
import { resolveStudentPalette, missingStudentRoles } from "./lib/student-palette.mjs";
import { semanticMappingValid } from "./lib/token-plan.mjs";
import { mergeFigmaVariables } from "./lib/figma-merge.mjs";
import { typeScaleTokens } from "./lib/figma-typography.mjs";
import { applyTypographyOverrides, TYPOGRAPHY_FILE } from "./lib/typography-plan.mjs";
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { normalize } from "./lib/normalize.mjs";
import { resolveLadder, summarizeReport } from "./lib/ladder.mjs";
import { applyComponentOwnership, applySemanticOverrides, applyTokenOwnership, descriptionProposal } from "./lib/ownership.mjs";
import { compileCss } from "./lib/css.mjs";
import { extractComponents } from "./lib/components.mjs";
import { storyFile, codeConnectFile, indexFile, UNCONTROLLED } from "./lib/templates.mjs";
import { buildComponent, cnHelperFile, cssModulesDtsFile, isReexport, ownProps, STACK_IDS, STACK_INFO } from "./lib/stacks.mjs";
import { baselineSpecs, mergeWithFigma, TIERS } from "./lib/baseline.mjs";
import { writeGenerated, writeOnce } from "./lib/emit.mjs";
import { buildLock, diffLock, formatDiff, hashOf } from "./lib/diff.mjs";
import { runGuards } from "./lib/guard.mjs";
import { enrichDescriptions, resolveDescription } from "./lib/ai.mjs";
import { chromeFile } from "./lib/chrome.mjs";
import { foundationData, foundationFiles, overviewFile, policyFile } from "./lib/docs.mjs";
import { RULES } from "./lib/guard.mjs";
import { buildTaxonomy, coverage as taxonomyCoverage } from "./lib/taxonomy.mjs";
import { designTokensRule, componentWorkRule, syncRule } from "./lib/rules.mjs";
import { toEnglish } from "./lib/i18n.mjs";

// DS_ROOT 로 작업 폴더를 바꿀 수 있다 — 테스트가 저장소 파일을 건드리지 않고 임시 복사본에서 돌린다.
const ROOT = process.env.DS_ROOT ? resolve(process.env.DS_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...s) => join(ROOT, ...s);

const C = { dim: "\x1b[2m", b: "\x1b[1m", g: "\x1b[32m", y: "\x1b[33m", r: "\x1b[31m", c: "\x1b[36m", x: "\x1b[0m" };
const say = (...a) => console.log(...a);
const head = (t) => say(`\n${C.b}${t}${C.x}`);
// 문서에도 쓰이는 메시지(근거·기록·가드 결과)는 한국어 원문을 두고, 터미널에는 영어로 찍는다.
const en = (text) => toEnglish(text) ?? text;

const FOUNDATION_DATA = ".ds/foundation.json";

function loadConfig() {
  const path = p("ds.config.json");
  if (!existsSync(path)) throw new Error("ds.config.json is missing.");
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return strip(raw);
}
/** "$note"/"$comment" 같은 설명 키는 로직에서 제외한다. */
function strip(v) {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === "object") {
    return Object.fromEntries(Object.entries(v).filter(([k]) => !k.startsWith("$")).map(([k, x]) => [k, strip(x)]));
  }
  return v;
}

function loadSource(config) {
  const path = p(config.output.source);
  // Figma MCP 로 가져온 변수 (scripts/figma-tokens.mjs). 있으면 우리 쪽 정의와 합친다.
  const figmaPath = join(dirname(path), "figma-variables.json");
  const figmaText = existsSync(figmaPath) ? readFileSync(figmaPath, "utf8") : "";
  if (!existsSync(path) && !figmaText) return { source: null, hash: "none" };
  const text = existsSync(path) ? readFileSync(path, "utf8") : "";
  if (!figmaText) return { source: JSON.parse(text), hash: hashOf(text) };
  const figma = JSON.parse(figmaText);
  if (!figma || !Array.isArray(figma.collections)) throw new Error("BLOCKED_INPUT: Import the collections from your Figma file again. The kit will not fall back to the sample.");
  const { source, summary } = mergeFigmaVariables(text ? JSON.parse(text) : null, figma);
  const typographyText = existsSync(p(TYPOGRAPHY_FILE)) ? readFileSync(p(TYPOGRAPHY_FILE), "utf8") : "";
  return { source, hash: hashOf(text + figmaText + typographyText), figmaSummary: summary, figma };
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/**
 * generatedAt 만 다르면 다시 쓰지 않는다. 내용이 같은데 시각만 바뀌면 실행할 때마다
 * lock·provenance 가 바뀌어 커밋 잡음이 되고 "같은 입력 → 같은 출력"이 깨진다.
 * @returns {boolean} 실제로 썼는지
 */
function writeJsonStable(path, value) {
  if (existsSync(path)) {
    try {
      const { generatedAt: _a, ...prev } = JSON.parse(readFileSync(path, "utf8"));
      const { generatedAt: _b, ...next } = value;
      if (JSON.stringify(prev) === JSON.stringify(next)) return false;
    } catch {
      /* 깨진 파일은 새로 쓴다 */
    }
  }
  writeJson(path, value);
  return true;
}

// ── tokens ──────────────────────────────────────────────────────────
/** 사람이 쓰는 semantic 매핑. 파이프라인은 읽기만 한다. */
function loadSemanticOverrides(config) {
  const path = p(config.output.semantic ?? ".ds/semantic.json");
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

function loadLock(config) {
  const path = p(config.output.lock);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
}

function cmdTokens(config, { write = true } = {}) {
  const { source, hash, figmaSummary, figma } = loadSource(config);
  const studentPalette = Boolean(figma);
  const model = normalize(source);
  const resolved = studentPalette ? resolveStudentPalette(source, figma, config) : resolveLadder(model, config);
  if (existsSync(p(TYPOGRAPHY_FILE))) resolved.tokens = applyTypographyOverrides(resolved.tokens, figma, config, JSON.parse(readFileSync(p(TYPOGRAPHY_FILE), "utf8")));
  // Figma 텍스트 스타일을 글자 크기 체계(--text-type-* …)로 가져온다. 기존 글자 역할은 바꾸지 않는다.
  if (figma?.typography?.styles?.length) {
    const scale = typeScaleTokens(figma.typography);
    resolved.tokens = [...resolved.tokens.filter((t) => !t.typeScale), ...scale.tokens];
    resolved.report.extraReview = [...(resolved.report.extraReview ?? []), ...scale.review];
  }
  const { report } = resolved;

  // 소유권 표를 실행한다 — semantic 매핑(사람 지정) → 토큰 이름·값(직전 lock 기준).
  const overrides = loadSemanticOverrides(config);
  const studentIssues = [];
  if (studentPalette && ["tokenValue", "tokenName"].some((key) => config.ownership?.[key] && config.ownership[key] !== "figma")) studentIssues.push({ target: "ownership", detail: "BLOCKED_POLICY: 학생 색 교체는 tokenValue/tokenName=figma가 필요합니다." });
  const hasMappings = Object.keys(overrides).some((key) => !key.startsWith("$"));
  // 색 값이 그대로면 읽은 노드가 늘어도 같은 팔레트다(Q-69 A). 예전 방식(nodes 포함) 해시로 승인된 기록도 유효하다.
  // 새 색이 추가만 됐으면(승인된 역할이 가리키는 색이 모두 그대로) 승인은 유효하다(Q-70 결정 7).
  const stale = studentPalette && hasMappings && !semanticMappingValid(overrides, figma, resolved.tokens, ROOT);
  if (stale) studentIssues.push({ target: ".ds/semantic.json", detail: "BLOCKED_INPUT: 다른 팔레트의 매핑입니다. docs/plans/tokens.md를 재승인하세요." });
  const usableOverrides = { ...overrides };
  if (studentPalette) for (const role of Object.keys(usableOverrides).filter((key) => !key.startsWith("$"))) {
    const declared = resolved.tokens.find((t) => t.layer === "semantic" && t.name === role);
    if (declared) {
      studentIssues.push({ target: role, detail: "BLOCKED_POLICY: 학생 Figma 선언 역할과 이전 사람 매핑이 충돌합니다. 토큰 계획을 다시 검토하세요." });
      delete usableOverrides[role];
    }
  }
  const semantic = applySemanticOverrides(resolved.tokens, stale ? {} : usableOverrides, config);
  let previous = loadLock(config);
  if (studentPalette && previous?.tokens) previous = { ...previous, tokens: Object.fromEntries(Object.entries(previous.tokens).filter(([key]) => !key.startsWith("COLOR:"))) };
  const owned = applyTokenOwnership(semantic.tokens, previous, config, { accept: config.accept });
  const tokens = owned.tokens;
  const proposals = [...semantic.proposals, ...owned.proposals];
  summarizeReport(tokens, report, config);
  // 학생 팔레트가 만들지 못했거나 모호하게 연결한 component 색 (student-palette.mjs)
  for (const row of report.extraReview ?? []) report.review.push(row);
  for (const row of figmaSummary?.effects?.review ?? []) {
    report.review.push({ name: row.name, layer: "layout", confidence: 0, reason: row.reason, raw: row.raw });
    say(`Shadow needs review: ${row.name} — ${en(row.reason)} It was left out of the tokens. Check the original value.`);
  }
  for (const row of figmaSummary?.effects?.converted ?? []) say(`Shadow converted: ${row.name} → ${row.value}`);

  head("Token tiers");
  say(`  Input     ${source ? `${config.output.source} (${model.variables.length} variables, ${model.paintStyles.length} styles)` : `${C.dim}none — built from the seed color${C.x}`}`);
  if (figmaSummary) say(`  Figma     ${figmaSummary.figmaColors} colors · ${figmaSummary.figmaOther} font/layout values imported through MCP${figmaSummary.overriddenColors.length ? ` — values replaced: ${figmaSummary.overriddenColors.join(", ")}` : ""}${figmaSummary.addedColors.length ? ` · added: ${figmaSummary.addedColors.join(", ")}` : ""}`);
  say(`  Level     ${C.c}${en(report.levelLabel)}${C.x}`);
  say(`  Tiers     ${Object.entries(report.counts).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  say(`  Sources   ${Object.entries(report.bySource).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
  for (const n of report.notes) say(`  ${C.dim}·${C.x} ${en(n)}`);
  if (report.review.length) say(`  ${C.y}${report.review.length} to review${C.x} ${C.dim}(confidence < ${config.confidence.review})${C.x}`);
  if (proposals.length) say(`  ${C.y}${proposals.length} proposals${C.x} ${C.dim}— Figma changes not applied because of ownership (G16; add --accept to take them)${C.x}`);
  if (config.accept) say(`  ${C.y}--accept${C.x} ${C.dim}— this run takes token names and values from Figma as they are.${C.x}`);

  if (write) {
    const css = compileCss(tokens, {
      header: `${report.levelLabel}\nFigma: ${model.fileName || "(없음)"} / source ${hash}`,
    });
    const cssPath = p(config.output.tokensCss);
    mkdirSync(dirname(cssPath), { recursive: true });
    writeFileSync(cssPath, css, "utf8");
    // figma: 가져온 Figma 색마다 정해진 계층과 이유 — Foundation 의 Figma import 화면이 읽는다.
    writeJson(p(config.output.tokensJson), { level: report.level, tokens, ...(report.figma ? { figma: report.figma } : {}) });
    writeJsonStable(p(config.output.provenance), {
      level: report.level,
      sourceHash: hash,
      generatedAt: new Date().toISOString(),
      ownership: config.ownership,
      notes: report.notes,
      review: report.review,
      tokens: Object.fromEntries(tokens.map((t) => [`${t.category}:${t.name}`, {
        source: t.source, confidence: t.confidence, reason: t.reason,
      }])),
    });
    // Foundation 화면이 읽는 데이터. 바뀔 때만 써서 Storybook 이 쓸데없이 다시 그리지 않게 한다.
    const docsData = JSON.stringify(foundationData(tokens, report, { reviewThreshold: config.confidence?.review ?? 0.6, figma, studentPalette }), null, 2) + "\n";
    const docsPath = p(FOUNDATION_DATA);
    if (!existsSync(docsPath) || readFileSync(docsPath, "utf8") !== docsData) writeFileSync(docsPath, docsData, "utf8");
    say(`  ${C.g}✓${C.x} ${config.output.tokensCss} · ${config.output.tokensJson} · ${config.output.provenance} · ${FOUNDATION_DATA}`);
  } else say(`  ${C.dim}Check only — no files written${C.x}`);
  const missing = studentPalette ? missingStudentRoles(tokens) : [];
  if (studentPalette && write && (missing.length || semantic.issues.length || studentIssues.length)) throw new Error(`BLOCKED_INPUT: Your palette needs review. Missing roles: ${missing.join(", ") || "none"}. ${[...semantic.issues, ...studentIssues].map((i) => en(i.detail)).join(" ")} After docs/plans/tokens.md is approved, run pnpm ds:apply-token-plan.`);
  return { tokens, report, model, hash, proposals, studentPalette, ownershipIssues: [...semantic.issues, ...studentIssues] };
}

// ── gen ─────────────────────────────────────────────────────────────
function loadDescriptions(config) {
  const path = p(config.output.descriptions);
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
}

async function cmdEnrich(config, ctx) {
  head("Descriptions");
  const specs = extractComponents(ctx.model);
  const existing = loadDescriptions(config);
  const { descriptions, calls, notes } = await enrichDescriptions(specs, existing, config);
  writeJson(p(config.output.descriptions), descriptions);
  const bySource = {};
  for (const d of Object.values(descriptions)) bySource[d.source] = (bySource[d.source] ?? 0) + 1;
  say(`  Sources   ${Object.entries(bySource).map(([k, v]) => `${k} ${v}`).join(" · ") || "(none)"}`);
  if (calls) say(`  LLM calls ${calls} (${config.ai.model})`);
  for (const n of notes) say(`  ${C.dim}·${C.x} ${n}`);
  say(`  ${C.g}✓${C.x} ${config.output.descriptions}`);
  return descriptions;
}

function loadBaseline(config) {
  const path = p("components.baseline.json");
  if (!existsSync(path) || config.baseline?.enabled === false) return [];
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const tiers = (config.baseline?.tiers ?? ["core"]).filter((t) => TIERS.includes(t));
  return baselineSpecs(raw, tiers);
}

/**
 * Figma + 기준선을 합친 spec 목록. gen·guard·docs·diff 가 **같은 목록**을 봐야
 * 문서의 커버리지와 실제 생성물이 어긋나지 않는다.
 */
function resolveSpecs(config, model) {
  const fromFigma = extractComponents(model);
  const base = loadBaseline(config);
  const merged = mergeWithFigma(fromFigma, base);
  return {
    specs: merged.specs.filter((s) => !(config.generate?.skip ?? []).includes(s.name)),
    fromFigma: fromFigma.length,
    fromBaseline: merged.fromBaseline,
  };
}

function cmdGen(config, ctx) {
  const { model, tokens } = ctx;
  const descriptions = loadDescriptions(config);
  const stack = config.stack?.styling ?? "css";
  if (!STACK_IDS.includes(stack)) throw new Error(`stack.styling must be one of ${STACK_IDS.join(" / ")} (got: ${stack}).`);

  const resolved = resolveSpecs(config, model);
  const { specs } = resolved;
  const merged = resolved;
  const fromFigma = { length: resolved.fromFigma };

  head("Components");
  say(`  Stack     ${C.c}${STACK_INFO[stack].label}${C.x} ${C.dim}— ${STACK_INFO[stack].note}${C.x}`);
  if (STACK_INFO[stack].deps.length) say(`  Packages  ${C.dim}${STACK_INFO[stack].deps.join(" ")}${C.x}`);
  say(`  Sources   Figma ${fromFigma.length} · baseline ${merged.fromBaseline}${config.baseline?.tiers ? ` (${config.baseline.tiers.join(",")})` : ""}`);
  if (!specs.length) {
    say(`  ${C.dim}No components. Only tokens are made.${C.x}`);
    return { specs: [], files: [], proposals: [] };
  }
  const hasComponentTokens = tokens.some((t) => t.layer === "component");
  const results = { created: 0, updated: 0, unchanged: 0, conflict: [], kept: 0 };
  const proposals = [];
  const files = [];
  const skipped = [];
  const pending = [];  // 아직 골격인 복합 컴포넌트. 구현된 것까지 세면 잘못된 보고가 된다.

  for (const spec of specs) {
    const dir = p(config.output.componentsDir, spec.pascal);
    const note = spec.nodeId ? `Figma: ${spec.name} (${spec.nodeId})` : `기준선: ${spec.name} (${spec.tier})`;
    // Radix 재내보내기는 props 인터페이스가 없어 story 를 만들 수 없다.
    const reexport = isReexport(spec, stack);
    const { visible, stillSkeleton, proposals: own } = viewOf(config, spec, descriptions);
    proposals.push(...own);
    if (spec.composite && stillSkeleton) pending.push(spec.pascal);

    if (config.generate.componentScaffold) {
      for (const f of buildComponent(spec, stack, { hasComponentTokens })) {
        if (writeOnce(join(dir, f.name), f.body) === "created") results.created += 1;
        else results.kept += 1;
      }
      writeOnce(join(dir, "index.ts"), indexFile(spec, { reexport }));
    }
    if (config.generate.stories && !reexport) {
      const resolved = resolveDescription(spec, descriptions, config);
      const r = writeGenerated(
        join(dir, `${spec.pascal}.stories.tsx`),
        storyFile(visible, { description: resolved.text }),
        resolved.source === "ai-inferred" ? `${note}\n   설명은 AI 추측입니다 — 사람이 고치면 이후 덮어쓰지 않습니다.` : note,
      );
      tally(results, r, `${spec.pascal}.stories.tsx`);
    }
    if (reexport) skipped.push(spec.pascal);
    if (config.generate.codeConnect && spec.nodeId && !reexport) {
      const r = writeGenerated(join(dir, `${spec.pascal}.figma.tsx`), codeConnectFile(visible), note);
      tally(results, r, `${spec.pascal}.figma.tsx`);
    }
    const mark = spec.composite ? `${C.y}${"composite".padEnd(9)}${C.x}` : `${C.dim}${"simple".padEnd(9)}${C.x}`;
    const src = spec.source === "baseline" ? `${C.dim}baseline${C.x}` : `${C.c}${"Figma".padEnd(8)}${C.x}`;
    say(`  ${C.dim}·${C.x} ${spec.pascal.padEnd(16)} ${mark} ${src} ${C.dim}·${C.x} ${spec.props.map((x) => x.codeName).join(", ") || "-"}`);
  }

  // 스택별 보조 파일. 없으면 타입 검사가 막힌다.
  if (stack === "shadcn") writeOnce(p("src/lib/utils.ts"), cnHelperFile());
  if (stack === "css-modules") writeOnce(p("src/css-modules.d.ts"), cssModulesDtsFile());
  const composites = specs.filter((s) => s.composite);
  const done = composites.length - pending.length;
  say(`  ${C.g}✓${C.x} created ${results.created} · updated ${results.updated} · unchanged ${results.unchanged} · kept ${results.kept}`);
  if (skipped.length) {
    say(`  ${C.dim}Skipped stories and Code Connect for ${skipped.length} Radix re-exports (no props interface): ${skipped.join(", ")}${C.x}`);
  }
  if (composites.length) {
    say(`  ${composites.length} composite — ${C.g}${done} built${C.x} · ${C.y}${pending.length} skeleton${C.x}`);
    if (pending.length) {
      say(`      ${C.y}${pending.join(", ")}${C.x}`);
      say(`      ${C.dim}These are not generated automatically: several parts must keep their ARIA state in sync.${C.x}`);
      say(`      ${C.dim}Give prompts/generate-component.md to the AI to fill them in.${C.x}`);
    }
  }
  if (results.conflict.length) {
    say(`  ${C.y}${results.conflict.length} conflicts — a person edited these files, so they were not overwritten:${C.x}`);
    for (const f of results.conflict) say(`      ${f}`);
  }
  for (const f of walk(p(config.output.componentsDir))) {
    files.push({ path: f.replace(`${ROOT}/`, ""), text: readFileSync(f, "utf8") });
  }
  if (proposals.length) say(`  ${C.y}${proposals.length} proposals${C.x} ${C.dim}— Figma changes left out of stories and Code Connect because the implementation (code) wins (G16)${C.x}`);
  return { specs, files, proposals };
}

/**
 * story·Code Connect 에 쓸 명세. 구현 파일을 읽어 골격 여부·비제어형 prop·소유권
 * (componentApi·variantMatrix·description)을 반영한다. gen 과 guard·docs 가 같은 것을 본다.
 */
function viewOf(config, spec, descriptions) {
  const implFile = p(config.output.componentsDir, spec.pascal, `${spec.pascal}.tsx`);
  const implText = existsSync(implFile) ? readFileSync(implFile, "utf8") : "";
  // sampleArgs(items·page 등)는 **구현된** API 를 가리킨다. 골격은 아직 그 prop 이
  // 없으므로 story 에 넣으면 타입이 깨진다. 골격에 남는 `TODO(ds)` 표식으로 구분한다.
  const stillSkeleton = !implText || implText.includes("TODO(ds)");
  const base = {
    ...spec,
    // story·Code Connect 는 컴포넌트가 **실제로 선언한** prop 만 다뤄야 한다.
    // 네이티브로 흘려보내는 것(disabled 등)을 args 에 넣으면 타입이 깨진다.
    props: ownProps(spec),
    sampleArgs: stillSkeleton ? null : spec.sampleArgs,
    // 구현이 비제어형 짝(defaultOpen 등)을 선언한 제어형 prop 만. story 가 그쪽으로 상태를 준다.
    uncontrolled: Object.fromEntries(
      Object.entries(UNCONTROLLED).filter(([, d]) => new RegExp(`\\b${d}\\??:`).test(implText)),
    ),
  };
  const owned = applyComponentOwnership(base, implText, config);
  const proposals = [...owned.proposals];
  const desc = descriptionProposal(spec, descriptions, config);
  if (desc) proposals.push(desc);
  return { visible: owned.spec, stillSkeleton, proposals };
}

/** guard·docs 처럼 gen 을 돌리지 않는 명령도 같은 제안을 보도록. */
function componentProposals(config, specs) {
  const descriptions = loadDescriptions(config);
  return specs.flatMap((s) => viewOf(config, s, descriptions).proposals);
}

function tally(results, r, name) {
  if (r === "conflict") results.conflict.push(name);
  else results[r] = (results[r] ?? 0) + 1;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// ── diff ────────────────────────────────────────────────────────────
function cmdDiff(config, ctx, { write }) {
  head("Changes");
  const lockPath = p(config.output.lock);
  const previous = existsSync(lockPath) ? JSON.parse(readFileSync(lockPath, "utf8")) : null;
  const next = buildLock({
    tokens: ctx.tokens, components: ctx.specs ?? [], level: ctx.report.level, sourceHash: ctx.hash,
  });
  const d = diffLock(previous, next);
  say(previous ? formatDiff(d).split("\n").map((l) => `  ${l}`).join("\n") : `  ${C.dim}No previous lock — this run becomes the baseline.${C.x}`);
  if (write) {
    const wrote = writeJsonStable(lockPath, next);
    say(wrote ? `  ${C.g}✓${C.x} ${config.output.lock} updated` : `  ${C.dim}${config.output.lock} unchanged — not rewritten${C.x}`);
  }
  return d;
}

// ── guard ───────────────────────────────────────────────────────────
function cmdGuard(config, ctx) {
  head("Guard checks");
  const result = runGuards({
    tokens: ctx.tokens, components: ctx.specs ?? [], files: ctx.files ?? [], config,
    proposals: ctx.proposals ?? [], ownershipIssues: ctx.ownershipIssues ?? [], studentPalette: ctx.studentPalette,
  });
  const byRule = new Map();
  for (const f of result.findings) {
    if (!byRule.has(f.id)) byRule.set(f.id, []);
    byRule.get(f.id).push(f);
  }
  if (!result.findings.length) say(`  ${C.g}✓ All passed${C.x}`);
  for (const [id, rows] of byRule) {
    // "Error G10 …" / "Warning G6 …" — hook-budget.mjs 가 이 머리 모양(단어 G번호)을 읽는다.
    const sev = rows[0].severity === "error" ? `${C.r}Error${C.x}` : `${C.y}Warning${C.x}`;
    const title = RULES.find((rule) => rule.id === id)?.titleEn ?? rows[0].title;
    say(`  ${sev} ${C.b}${id}${C.x} ${title} ${C.dim}(${rows.length})${C.x}`);
    // 목록 상한은 저장 뒤 검사와 같은 20개다(Q-70 결정 2) — 6~8개만 보이면 AI 가 매번 몇 개씩만 고친다.
    for (const r of rows.slice(0, 20)) say(`      ${en(r.target)} — ${en(r.detail)}`);
    if (rows.length > 20) say(`      ${C.dim}… and ${rows.length - 20} more${C.x}`);
  }
  say(`  Errors ${result.errors} · Warnings ${result.warnings}`);
  // 오류는 항상 실패다(배포 빌드가 `ds:guard` 로 막는다). --strict 는 경고까지 실패로 올린다.
  if (result.errors) {
    say(`  ${C.r}The guard found errors, so this run fails. Generated files were kept — fix the items above.${C.x}`);
    process.exitCode = 1;
  } else if (config.strict && result.warnings) {
    say(`  ${C.r}strict mode — there are warnings, so this run fails.${C.x}`);
    process.exitCode = 1;
  }
  return result;
}

// ── docs ────────────────────────────────────────────────────────────
function loadTaxonomy() {
  const path = p("taxonomy.json");
  if (!existsSync(path)) return [];
  return buildTaxonomy(JSON.parse(readFileSync(path, "utf8")));
}

async function cmdDocs(config, ctx, guardResult) {
  head("Docs pages");
  const dir = p("src/docs");
  const descriptions = loadDescriptions(config);
  const specs = ctx.specs ?? [];
  const cats = loadTaxonomy();
  const cov = taxonomyCoverage(specs, cats);
  const results = [];
  // compiler API는 이 단계에서만 동적으로 불러온다. 누락/충돌 시 다른 문서 생성은 계속한다.
  let publicCatalog;
  try {
    const { generateCatalog } = await import("./lib/catalog.mjs");
    const catalog = await generateCatalog(ROOT);
    publicCatalog = catalog.catalog;
    results.push(["CATALOG.md", catalog.result]);
    if (catalog.result === "conflict") process.exitCode = 1;
  } catch (error) {
    say(`  ${C.r}Catalog failed:${C.x} ${error.message}`);
    process.exitCode = 1;
  }
  results.push(["chrome.tsx", writeGenerated(join(dir, "chrome.tsx"), chromeFile(), "문서 공용 UI 조각")]);
  // Foundation 은 .ds/foundation.json 을 실행 중에 읽는 화면들이다. 예전 한 장짜리 생성 파일은 지운다.
  for (const [file, body] of foundationFiles()) results.push([`foundation/${file}`, writeGenerated(join(dir, "foundation", file), body, "Foundation — .ds/foundation.json 을 읽는 화면")]);
  const legacy = join(dir, "Foundation.stories.tsx");
  if (existsSync(legacy) && readFileSync(legacy, "utf8").includes("@ds-generated")) unlinkSync(legacy);
  results.push(["Overview.stories.tsx", writeGenerated(join(dir, "Overview.stories.tsx"), await overviewFile(specs, {
    descriptions, level: ctx.report.level, tokenCount: ctx.tokens.length, coverage: cov, config, root: ROOT, catalog: publicCatalog,
  }), "컴포넌트 카탈로그 · 분류 커버리지")]);
  results.push(["Policy.stories.tsx", writeGenerated(join(dir, "Policy.stories.tsx"), policyFile(config, RULES, guardResult, { level: ctx.report.level }), "소유권·가드·동기화 정책")]);

  // 같은 정책 원본에서 AI 가 읽는 규칙도 뽑는다 — 손으로 쓴 규칙은 토큰이
  // 바뀌는 순간 거짓말이 된다.
  if (config.generate?.claudeRules !== false) {
    const rdir = p(".claude/rules");
    results.push(["rules/design-tokens.md", writeGenerated(join(rdir, "design-tokens.md"), designTokensRule(ctx.tokens, ctx.report, config), "ds.config.json + 실제 토큰에서 생성")]);
    results.push(["rules/component-work.md", writeGenerated(join(rdir, "component-work.md"), componentWorkRule(specs, config, cov), "컴포넌트 인벤토리에서 생성")]);
    results.push(["rules/sync-policy.md", writeGenerated(join(rdir, "sync-policy.md"), syncRule(config, RULES, ctx.report), "소유권 표 + 가드 규칙에서 생성")]);
  }

  const conflicts = results.filter(([, r]) => r === "conflict").map(([f]) => f);
  const counts = {};
  for (const [, r] of results) counts[r] = (counts[r] ?? 0) + 1;
  say(`  ${C.g}✓${C.x} ` + Object.entries(counts).map(([k, v]) => `${k} ${v}`).join(" · "));
  say(`  ${C.dim}Storybook: Overview · Foundation (Overview·Color·Typography·Spacing·Elevation·Motion·Icons·Images) · Policy${C.x}`);
  say(`  ${C.dim}Taxonomy: ${cov.totals.have}/${cov.totals.items} items · ${cov.totals.categoriesWithAny}/${cov.totals.categories} categories${cov.unclassified.length ? ` · ${cov.unclassified.length} unclassified` : ""}${C.x}`);
  if (config.generate?.claudeRules !== false) say(`  ${C.dim}AI rules: .claude/rules/{design-tokens,component-work,sync-policy}.md${C.x}`);
  if (conflicts.length) say(`  ${C.y}Conflicts: ${conflicts.join(", ")} — a person edited these files, so they were not overwritten.${C.x}`);
}

// ── main ────────────────────────────────────────────────────────────
const [, , cmd = "all", ...rest] = process.argv;
const config = loadConfig();
if (rest.includes("--strict")) config.strict = true;
// 소유권 때문에 제안(G16)으로 남은 토큰 이름·값 변경을 이번 실행에서 받아들인다.
if (rest.includes("--accept")) config.accept = true;
const seedArg = rest.find((a) => a.startsWith("--seed="));
if (seedArg) config.seed = seedArg.slice("--seed=".length);

try {
  if (cmd === "init") {
    head("Init");
    say(`  No source: building all three tiers from the seed color ${C.c}${config.seed}${C.x}.`);
    const ctx = cmdTokens(config);
    cmdDiff(config, { ...ctx, specs: [] }, { write: true });
    cmdGuard(config, { ...ctx, specs: [], files: [] });
  } else if (cmd === "tokens") {
    cmdTokens(config);
  } else if (cmd === "gen") {
    const ctx = cmdTokens(config);
    cmdGen(config, ctx);
  } else if (cmd === "enrich") {
    const ctx = cmdTokens(config);
    await cmdEnrich(config, ctx);
  } else if (cmd === "diff") {
    const ctx = cmdTokens(config);
    const { specs } = resolveSpecs(config, ctx.model);
    cmdDiff(config, { ...ctx, specs }, { write: rest.includes("--write") });
  } else if (cmd === "guard") {
    const ctx = cmdTokens(config, { write: false });
    const { specs } = resolveSpecs(config, ctx.model);
    const files = walk(p(config.output.componentsDir)).map((f) => ({ path: f.replace(`${ROOT}/`, ""), text: readFileSync(f, "utf8") }));
    cmdGuard(config, { ...ctx, specs, files, proposals: [...ctx.proposals, ...componentProposals(config, specs)] });
  } else if (cmd === "baseline") {
    const tierArg = rest.find((a) => a.startsWith("--tier="));
    if (tierArg) config.baseline = { ...config.baseline, tiers: tierArg.slice("--tier=".length).split(",").map((t) => t.trim()) };
    const stackArg = rest.find((a) => a.startsWith("--stack="));
    if (stackArg) config.stack = { ...config.stack, styling: stackArg.slice("--stack=".length) };
    const ctx = cmdTokens(config);
    cmdGen(config, ctx);
  } else if (cmd === "docs") {
    const ctx = cmdTokens(config);
    const { specs } = resolveSpecs(config, ctx.model);
    const files = walk(p(config.output.componentsDir)).map((f) => ({ path: f.replace(`${ROOT}/`, ""), text: readFileSync(f, "utf8") }));
    const proposals = [...ctx.proposals, ...componentProposals(config, specs)];
    const guardResult = runGuards({ ...ctx, specs, files, config, proposals });
    await cmdDocs(config, { ...ctx, specs, files }, guardResult);
  } else if (cmd === "all") {
    const ctx = cmdTokens(config);
    if (config.ai?.enabled) await cmdEnrich(config, ctx);
    const gen = cmdGen(config, ctx);
    cmdDiff(config, { ...ctx, ...gen }, { write: true });
    // gen 의 proposals 가 tokens 의 것을 덮지 않게 합친다.
    const proposals = [...ctx.proposals, ...gen.proposals];
    const guardResult = cmdGuard(config, { ...ctx, ...gen, proposals });
    await cmdDocs(config, { ...ctx, ...gen }, guardResult);
    say("");
  } else {
    say(`Unknown command: ${cmd}\nUsage: node scripts/ds.mjs [init|tokens|enrich|gen|baseline|diff|guard|docs|all] [--strict] [--write] [--accept] [--seed=#RRGGBB]`);
    process.exitCode = 1;
  }
} catch (error) {
  say(`${C.r}Failed:${C.x} ${en(String(error?.message ?? error))}`);
  if (process.env.DS_DEBUG) console.error(error);
  process.exitCode = 1;
}

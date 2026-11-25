/**
 * 문서 페이지 생성 — Carbon Design System 처럼 **계층 · 컴포넌트 · 정책**을
 * 디자인 시스템 안에서 본다.
 *
 * 셋 다 생성물이다. 데이터를 페이지에 박아 넣으므로 `ds:gen` 을 돌리면
 * 언제나 현재 상태와 일치한다. 손으로 고친 문서가 실제와 어긋나는 일이 없다.
 *
 * 문구는 한국어·영어 둘 다 넣는다 — Storybook 헤더에서 고른 언어로 보인다(`L(ko, en)`).
 * 파이프라인이 만든 메시지(추론 근거·생성 기록·가드 결과)는 i18n.mjs 가 옮긴 영어판을 함께 싣는다.
 */

import { resolveDescription } from "./ai.mjs";
import { APPLIED_AT, APPLIED_AT_EN } from "./ownership.mjs";
import { bilingual, hasHangul } from "./i18n.mjs";
import { cssVarFor } from "./css.mjs";
import { SEMANTIC_ROLES } from "./roles.mjs";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog, loadCatalogTypescript } from "./catalog.mjs";
import { buildTaxonomy, coverage as taxonomyCoverage } from "./taxonomy.mjs";

const j = (v) => JSON.stringify(v);

// ── Foundation (계층) ───────────────────────────────────────────────

/**
 * Foundation 화면이 읽는 데이터(.ds/foundation.json). `pnpm ds:tokens` 가 토큰을 쓸 때마다 함께 쓴다.
 * 화면(src/docs/foundation/*.stories.tsx)은 이 파일을 실행 중에 읽으므로, Figma 가져오기·색 계획 적용·글자 되돌리기
 * 어느 경로로 토큰이 바뀌어도 `pnpm ds:docs` 없이 Storybook 이 바로 갱신된다.
 */
export function foundationData(tokens, report, { reviewThreshold = 0.6, figma = null, studentPalette = false } = {}) {
  const colors = new Map(tokens.filter((t) => t.category === "COLOR").map((t) => [t.name, t]));
  const hexOf = (t, depth = 0) => (!t || depth > 8 ? null : t.hex ?? (t.ref ? hexOf(colors.get(t.ref), depth + 1) : null));
  const semantic = new Set(tokens.filter((t) => t.layer === "semantic" && t.category === "COLOR").map((t) => t.name));
  return {
    schema: 1,
    level: report.level,
    levelLabel: bilingual(report.levelLabel ?? ""),
    notes: (report.notes ?? []).map(bilingual),
    counts: report.counts ?? {},
    bySource: report.bySource ?? {},
    reviewThreshold,
    review: (report.review ?? []).map((r) => ({ name: r.name, layer: r.layer, confidence: r.confidence, reason: bilingual(r.reason ?? "") })),
    studentPalette,
    missingRoles: SEMANTIC_ROLES.filter((role) => !semantic.has(role)),
    figma: figma ? {
      fileKey: figma.file_key ?? "",
      importedAt: figma.imported_at ?? null,
      variables: report.figma ?? [],
      families: figma.typography?.families ?? [],
    } : null,
    tokens: tokens.map((t) => ({
      layer: t.layer, category: t.category, name: t.name, cssVar: cssVarFor(t.category, t.name),
      value: String(t.value ?? ""), hex: t.category === "COLOR" ? hexOf(t) : null, ref: t.ref ?? null,
      source: t.source, confidence: t.confidence, reason: bilingual(t.reason ?? ""),
      ...(t.typeScale ? { typeScale: t.typeScale } : {}),
    })),
  };
}

/**
 * Foundation 화면 파일. scripts/lib/foundation/ 의 원본을 src/docs/foundation/ 으로 생성한다.
 * 데이터는 화면이 .ds/foundation.json 에서 읽으므로 파일 내용은 토큰과 상관없이 늘 같다.
 */
const FOUNDATION_DIR = join(dirname(fileURLToPath(import.meta.url)), "foundation");
export function foundationFiles() {
  return readdirSync(FOUNDATION_DIR).filter((f) => /\.tsx?$/.test(f)).sort().map((file) => [file, readFileSync(join(FOUNDATION_DIR, file), "utf8")]);
}

// ── Overview (컴포넌트 카탈로그) ────────────────────────────────────

/** 모듈을 실행하지 않고 CSF의 실제 named export와 include/excludeStories를 센다. */
export function csfStoryNames(source, ts, filename = "stories.tsx") {
  const sf = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  if (sf.parseDiagnostics.length) throw new Error(`CSF 구문 오류: ${filename}`);
  const bindings = new Map();
  const exports = new Set();
  let meta;
  const exported = (node) => node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  for (const statement of sf.statements) {
    if (ts.isVariableStatement(statement)) for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue;
      bindings.set(declaration.name.text, declaration.initializer);
      if (exported(statement)) exports.add(declaration.name.text);
    }
    if (ts.isFunctionDeclaration(statement) && exported(statement) && statement.name && !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) exports.add(statement.name.text);
    if (ts.isExportDeclaration(statement) && !statement.isTypeOnly && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) if (!element.isTypeOnly && element.name.text !== "default") exports.add(element.name.text);
    }
    if (ts.isExportAssignment(statement) && !statement.isExportEquals) meta = statement.expression;
  }
  const unwrap = (node, seen = new Set()) => {
    if (!node) return node;
    if (ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isParenthesizedExpression(node)) return unwrap(node.expression, seen);
    if (ts.isIdentifier(node) && bindings.has(node.text) && !seen.has(node.text)) return unwrap(bindings.get(node.text), new Set([...seen, node.text]));
    return node;
  };
  meta = unwrap(meta);
  if (!meta) return [];
  if (!ts.isObjectLiteralExpression(meta)) throw new Error(`CSF meta를 정적으로 읽을 수 없습니다: ${filename}`);
  const filters = {};
  for (const property of meta.properties) {
    if (ts.isSpreadAssignment(property)) throw new Error(`CSF meta spread를 정적으로 읽을 수 없습니다: ${filename}`);
    const key = property.name?.text;
    if (!["includeStories", "excludeStories"].includes(key)) continue;
    const value = unwrap(ts.isShorthandPropertyAssignment(property) ? property.name : property.initializer);
    if (value && ts.isArrayLiteralExpression(value) && value.elements.every(ts.isStringLiteral)) filters[key] = value.elements.map((v) => v.text);
    else if (value?.kind === ts.SyntaxKind.RegularExpressionLiteral) {
      const match = value.text.match(/^\/(.*)\/([a-z]*)$/s);
      filters[key] = new RegExp(match[1], match[2]);
    } else throw new Error(`CSF ${key}를 정적으로 읽을 수 없습니다: ${filename}`);
  }
  const matches = (filter, name) => {
    if (Array.isArray(filter)) return filter.includes(name);
    filter.lastIndex = 0;
    return filter.test(name);
  };
  return [...exports].filter((name) => name !== "__esModule" && name !== "__namedExportsOrder"
    && (!filters.includeStories || matches(filters.includeStories, name))
    && (!filters.excludeStories || !matches(filters.excludeStories, name)));
}

export function countCsfStories(source, ts, filename) {
  return csfStoryNames(source, ts, filename).length;
}

export async function overviewRows(root, specs, { descriptions = {}, config = {}, catalog } = {}) {
  const ts = await loadCatalogTypescript();
  catalog ??= await buildCatalog(root);
  const directory = resolve(root, config.output?.componentsDir ?? "src/components");
  if (relative(root, directory).startsWith("..")) throw new Error("Overview 컴포넌트 경로는 작업 폴더 안에 있어야 합니다.");
  const dirs = existsSync(directory) ? readdirSync(directory, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
  return dirs.filter((name) => existsSync(join(directory, name, "index.ts")) || existsSync(join(directory, name, `${name}.tsx`))).map((name) => {
    const s = specs.find((s) => s.pascal === name || s.name === name);
    const actual = catalog.rows.find((r) => dirname(resolve(root, r.source)) === join(directory, name) && r.name === name)
      ?? catalog.rows.find((r) => dirname(resolve(root, r.source)) === join(directory, name));
    // 설명 소유권(ownership.description)을 story 와 같은 규칙으로 따른다.
    const resolved = resolveDescription(s ?? { name, description: "" }, descriptions, config);
    if (!resolved.text && actual?.role && actual.role !== "역할 미기록") { resolved.text = actual.role; resolved.source = "code"; }
    const files = readdirSync(join(directory, name));
    return {
      name,
      pascal: name,
      nodeId: s?.nodeId ?? "",
      page: s?.pageName ?? "",
      description: resolved.text,
      // 설명은 Figma·사람이 쓴 원문이다. 번역하지 않고 언어만 표시한다.
      descriptionLang: hasHangul(resolved.text) ? "ko" : "en",
      descriptionSource: resolved.source,
      variantCount: s?.variantCount ?? 0,
      props: actual ? actual.props.map((p) => ({ name: p.name, kind: p.type, options: (p.options ?? []).map(String) }))
        : (s?.props ?? []).map((p) => ({ name: p.codeName, kind: p.kind, options: (p.options ?? []).map((o) => o.code) })),
      states: s?.pseudoStates ?? [],
      storyCount: files.filter((f) => /\.stories\.[jt]sx?$/.test(f)).reduce((sum, file) => sum + countCsfStories(readFileSync(join(directory, name, file), "utf8"), ts, file), 0),
      hasCodeConnect: files.some((f) => /\.figma\.[jt]sx?$/.test(f)),
    };
  });
}

export async function overviewFile(specs, { descriptions, level, tokenCount, coverage: previousCoverage, config, root = resolve(dirname(fileURLToPath(import.meta.url)), "../.."), catalog }) {
  const rows = await overviewRows(root, specs, { descriptions, config, catalog });
  const taxonomy = join(root, "taxonomy.json");
  const coverage = existsSync(taxonomy) ? taxonomyCoverage(rows, buildTaxonomy(JSON.parse(readFileSync(taxonomy, "utf8")))) : previousCoverage;

  return `import type { Meta, StoryObj } from "@storybook/react";
import { C, MONO, Shell, H3, Pill, Table, Td, Note, SourceBadge, useL } from "./chrome";

type Row = {
  name: string; pascal: string; nodeId: string; page: string;
  description: string; descriptionLang: string; descriptionSource: string;
  variantCount: number;
  props: { name: string; kind: string; options: string[] }[];
  states: string[]; storyCount: number; hasCodeConnect: boolean;
};

const ROWS = ${j(rows)} as Row[];
const LEVEL = ${j(level)};
const TOKEN_COUNT = ${tokenCount};
const COVERAGE = ${j(coverage)} as {
  rows: { category: string; total: number; haveCount: number; have: { item: string; name: string; exact: boolean }[]; missing: string[] }[];
  unclassified: string[];
  totals: { items: number; have: number; categoriesWithAny: number; categories: number };
};

const meta = {
  title: "Overview/컴포넌트",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Stat = ({ label, value, sub }: { label: string; value: string | number; sub?: string }) => (
  <div style={{ border: "1px solid " + C.line, borderRadius: 8, padding: "12px 16px", minWidth: 128 }}>
    <div style={{ color: C.faint, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    {sub ? <div style={{ color: C.dim, fontSize: 11 }}>{sub}</div> : null}
  </div>
);

function CatalogPage() {
  const L = useL();
  const cats = COVERAGE.totals.categoriesWithAny + "/" + COVERAGE.totals.categories;
  return (
    <Shell
      title={L("컴포넌트", "Components")}
      desc={L("실제 src/components 목록과 공개 API·CSF 스토리에서 생성한 목록입니다. 등록과 사람 검수는 별개입니다.", "Generated from actual src/components, public APIs and CSF stories. Listing is separate from human review.")}
    >
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <Stat label={L("컴포넌트", "Components")} value={ROWS.length} />
        <Stat label={L("variant 조합", "Variant combinations")} value={ROWS.reduce((n, r) => n + r.variantCount, 0)} />
        <Stat label={L("토큰", "Tokens")} value={TOKEN_COUNT} sub={LEVEL} />
        <Stat label="Code Connect" value={ROWS.filter((r) => r.hasCodeConnect).length + "/" + ROWS.length} sub={L("Figma↔코드 앵커", "Figma↔code anchor")} />
        <Stat label={L("설명", "Descriptions")} value={ROWS.filter((r) => r.description).length + "/" + ROWS.length} sub={L("Figma 또는 사람", "Figma or a person")} />
        <Stat label={L("분류 커버리지", "Taxonomy coverage")} value={COVERAGE.totals.have + "/" + COVERAGE.totals.items} sub={L(cats + " 카테고리", cats + " categories")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12, marginTop: 20 }}>
        {ROWS.map((r) => (
          <div key={r.name} style={{ border: "1px solid " + C.line, borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</div>
              <span style={{ fontFamily: MONO, fontSize: 10, color: C.faint }}>{r.nodeId}</span>
            </div>

            {r.description
              ? <div lang={r.descriptionLang} style={{ color: C.dim, minHeight: 34 }}>{r.description}</div>
              : <div style={{ color: C.faint, minHeight: 34, fontStyle: "italic" }}>{L(<>설명 없음 — Figma 의 컴포넌트 description 을 채우거나 <code>ds:enrich</code> 를 켜세요.</>, <>No description — fill in the component description in Figma or enable <code>ds:enrich</code>.</>)}</div>}

            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <SourceBadge source={r.descriptionSource} />
              <Pill tone={r.hasCodeConnect ? "ok" : "warn"}>{r.hasCodeConnect ? "Code Connect" : L("Code Connect 없음", "No Code Connect")}</Pill>
              <Pill>variant {r.variantCount}</Pill>
              <Pill>story {r.storyCount}</Pill>
            </div>

            {r.props.length ? (
              <div style={{ borderTop: "1px solid " + C.line, paddingTop: 8, fontSize: 11 }}>
                {r.props.map((p) => (
                  <div key={p.name} style={{ display: "flex", gap: 8, padding: "1px 0" }}>
                    <span style={{ fontFamily: MONO, fontWeight: 600, minWidth: 74 }}>{p.name}</span>
                    <span style={{ color: C.dim }}>{p.options.length ? p.options.join(" · ") : p.kind}</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ borderTop: "1px solid " + C.line, paddingTop: 8, fontSize: 11, color: C.faint }}>{L("속성 없음", "No properties")}</div>}

            {r.states.length ? (
              <div style={{ fontSize: 11, color: C.faint }}>
                {L("상태", "States")} <span style={{ fontFamily: MONO }}>{r.states.join(", ")}</span> — {L("prop 이 아니라 CSS 의사클래스가 처리", "handled by CSS pseudo-classes, not props")}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <H3>{L("분류 커버리지", "Taxonomy coverage")}</H3>
      <p style={{ color: C.dim, margin: "0 0 10px", maxWidth: 760 }}>
        {L(
          <>목록을 나열하는 것과 <strong>분류 체계 안에서 빈 칸을 보는 것</strong>은 다릅니다. 기준은 Apple HIG · Material · NN/g · WAI-ARIA 이며 <span style={{ fontFamily: MONO }}>taxonomy.json</span> 을 팀 목록으로 통째로 바꿔도 표가 그대로 따라옵니다.</>,
          <>Listing components is different from <strong>seeing the gaps within a taxonomy</strong>. The reference is Apple HIG · Material · NN/g · WAI-ARIA; replace <span style={{ fontFamily: MONO }}>taxonomy.json</span> with your team's list and the table follows.</>,
        )}
      </p>
      <Table head={[L("카테고리", "Category"), L("보유", "Have"), L("있는 것", "Present"), L("다음 후보", "Next candidates")]}>
        {COVERAGE.rows.map((r) => (
          <tr key={r.category}>
            <Td bold width={160}>{r.category}</Td>
            <Td width={90}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 44, height: 5, borderRadius: 3, background: C.line, overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: Math.round((r.haveCount / r.total) * 100) + "%", background: r.haveCount ? C.fg : "transparent" }} />
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 11, color: C.dim }}>{r.haveCount}/{r.total}</span>
              </div>
            </Td>
            <Td>
              {r.have.length
                ? <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{r.have.map((h) => (
                    <Pill key={h.item} tone="ok">{h.item}{h.exact ? "" : " (" + h.name + ")"}</Pill>
                  ))}</span>
                : <span style={{ color: C.faint }}>{L("없음", "None")}</span>}
            </Td>
            <Td dim>{r.missing.slice(0, 6).join(" · ")}{r.missing.length > 6 ? L(" … 외 " + (r.missing.length - 6), " … and " + (r.missing.length - 6) + " more") : ""}</Td>
          </tr>
        ))}
      </Table>
      {COVERAGE.unclassified.length ? (
        <Note tone="warn">
          {L(
            <>분류하지 못한 컴포넌트 {COVERAGE.unclassified.length}개: <span style={{ fontFamily: MONO }}>{COVERAGE.unclassified.join(", ")}</span> — 이름이 표준 어휘와 다르거나 이 프로젝트 고유 컴포넌트입니다. <span style={{ fontFamily: MONO }}>taxonomy.json</span> 에 추가하세요.</>,
            <>{COVERAGE.unclassified.length} components could not be classified: <span style={{ fontFamily: MONO }}>{COVERAGE.unclassified.join(", ")}</span> — their names differ from the standard vocabulary or they are specific to this project. Add them to <span style={{ fontFamily: MONO }}>taxonomy.json</span>.</>,
          )}
        </Note>
      ) : null}

      <H3>{L("이 표가 비어 보인다면", "If this page looks empty")}</H3>
      <Table head={[L("증상", "Symptom"), L("원인", "Cause"), L("할 일", "What to do")]} width={840}>
        <tr><Td bold>{L("컴포넌트 0개", "0 components")}</Td><Td dim>{L("Figma 파일에 Component Set 이 없거나 범위를 좁게 읽음", "The Figma file has no Component Sets, or a narrow scope was read")}</Td><Td dim>{L("Figma 링크를 주고 AI에게 컴포넌트를 만들어 달라고 요청", "Give the AI a Figma link and ask it to build the component")}</Td></tr>
        <tr><Td bold>{L("variant 0", "0 variants")}</Td><Td dim>{L("Component Set 없이 낱개 Component 만 있음", "Only standalone components, no Component Sets")}</Td><Td dim>{L("Figma 에서 variant 로 묶기", "Combine them as variants in Figma")}</Td></tr>
        <tr><Td bold>{L("설명 없음", "No description")}</Td><Td dim>{L("Figma 컴포넌트 description 이 비어 있음", "The Figma component description is empty")}</Td><Td dim>{L(<>Figma 에서 채우거나 <span style={{ fontFamily: MONO }}>ai.enabled</span> 켜기</>, <>Fill it in Figma or turn on <span style={{ fontFamily: MONO }}>ai.enabled</span></>)}</Td></tr>
      </Table>

      <Note tone="info">
        {L(
          <>컴포넌트 구현 파일(<span style={{ fontFamily: MONO }}>.tsx</span> / <span style={{ fontFamily: MONO }}>.css</span>)은 <strong>한 번만</strong> 생성되고 이후 사람 소유입니다. story 와 Code Connect 는 매번 재생성되지만, 손댄 파일은 충돌로 보고만 하고 덮어쓰지 않습니다.</>,
          <>Component implementation files (<span style={{ fontFamily: MONO }}>.tsx</span> / <span style={{ fontFamily: MONO }}>.css</span>) are generated <strong>only once</strong> and then belong to people. Stories and Code Connect are regenerated every time, but edited files are only reported as conflicts and never overwritten.</>,
        )}
      </Note>
    </Shell>
  );
}

export const Catalog: Story = {
  name: "카탈로그",
  render: () => <CatalogPage />,
};
`;
}

// ── Policy (정책) ───────────────────────────────────────────────────

const OWNERSHIP_LABEL = {
  tokenValue: [["토큰 값", "Token value"], "blue-500 = #0066FF"],
  tokenName: [["토큰 이름", "Token name"], "blue-500"],
  semanticMapping: [["semantic 매핑", "Semantic mapping"], "primary → blue-500"],
  componentApi: [["컴포넌트 API", "Component API"], ["props 이름·타입", "prop names and types"]],
  variantMatrix: [["variant 행렬", "Variant matrix"], ["Type × Size 조합", "Type × Size combinations"]],
  description: [["설명", "Description"], ["컴포넌트 문서 문장", "component doc sentences"]],
  usageGuide: [["사용 가이드", "Usage guide"], ["언제 쓰는지, do/don't", "when to use, do/don't"]],
};

const OWNER_TONE = { figma: "info", code: "ok", human: "warn" };
const OWNER_MEAN = {
  figma: ["Figma 가 이기고 코드를 덮어씀", "Figma wins and overwrites code"],
  code: ["코드가 이기고 Figma 변경은 제안만", "Code wins; Figma changes are proposals only"],
  human: ["비어 있을 때만 채우고 절대 덮어쓰지 않음", "Filled only when empty, never overwritten"],
};

const pair = (v) => (Array.isArray(v) ? { ko: v[0], en: v[1] } : { ko: v, en: v });

export function policyFile(config, rules, guardResult, { level }) {
  const ownership = Object.entries(config.ownership ?? {}).map(([key, owner]) => ({
    key,
    label: pair(OWNERSHIP_LABEL[key]?.[0] ?? key),
    example: pair(OWNERSHIP_LABEL[key]?.[1] ?? ""),
    owner,
    tone: OWNER_TONE[owner] ?? "panel",
    meaning: pair(OWNER_MEAN[owner] ?? ""),
    // 이 소유권이 실제로 어디서 집행되는가. 없으면 없다고 적는다 — 표가 약속만 하면 안 된다.
    applied: {
      ko: APPLIED_AT[key] ?? "생성하는 경로가 없다 — 덮어쓸 일이 없어 지킬 것도 없다",
      en: APPLIED_AT_EN[key] ?? "No path generates it — nothing to overwrite, so nothing to protect",
    },
  }));

  const byRule = new Map();
  for (const f of guardResult.findings) {
    if (!byRule.has(f.id)) byRule.set(f.id, []);
    byRule.get(f.id).push({ target: bilingual(f.target), detail: bilingual(f.detail) });
  }
  const guards = rules.map((r) => ({
    id: r.id, title: { ko: r.title, en: r.titleEn ?? r.title }, severity: r.severity,
    findings: (byRule.get(r.id) ?? []).slice(0, 12),
    total: (byRule.get(r.id) ?? []).length,
  }));

  return `import type { Meta, StoryObj } from "@storybook/react";
import { C, MONO, Shell, H3, Pill, Table, Td, Note, Msg, useL } from "./chrome";

type M = { ko: string; en: string; missing?: boolean };
const OWNERSHIP = ${j(ownership)} as { key: string; label: M; example: M; owner: string; tone: "ok" | "warn" | "bad" | "info" | "panel"; meaning: M; applied: M }[];
const GUARDS = ${j(guards)} as { id: string; title: M; severity: string; findings: { target: M; detail: M }[]; total: number }[];
const TIERS = ${j(config.tiers ?? {})} as Record<string, { collections?: string[]; match?: string[] }>;
const CONF = ${j(config.confidence ?? {})} as Record<string, number>;
const SYNTH = ${j(config.synthesize ?? {})} as Record<string, boolean>;
const LEVEL = ${j(level)};
const STRICT = ${Boolean(config.strict)};
const AI = ${j({ enabled: Boolean(config.ai?.enabled), model: config.ai?.model ?? "" })};

const meta = {
  title: "Policy/정책",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function OwnershipPage() {
  const L = useL();
  const generator = L("생성기", "Generator");
  return (
    <Shell
      title={L("소유권", "Ownership")}
      desc={L("필드마다 누가 SSOT 인지 정한 표. 이걸 정하지 않으면 다음 동기화가 사람 작업을 덮어쓴다 — 이런 프로젝트가 실패하는 1번 원인이다.", "Who is the single source of truth for each field. Without this, the next sync overwrites people's work — the number one reason projects like this fail.")}
    >
      <Table head={[L("필드", "Field"), L("예", "Example"), L("소유", "Owner"), L("뜻", "Meaning"), L("적용되는 곳", "Where it is enforced")]} width={1080}>
        {OWNERSHIP.map((o) => (
          <tr key={o.key}>
            <Td bold><Msg m={o.label} /></Td>
            <Td mono dim><Msg m={o.example} /></Td>
            <Td><Pill tone={o.tone}>{o.owner}</Pill></Td>
            <Td dim><Msg m={o.meaning} /></Td>
            <Td dim><Msg m={o.applied} /></Td>
          </tr>
        ))}
      </Table>

      <Note tone="info">
        {L(
          <>소유자가 figma 가 아닌 필드에서 Figma 가 바뀌면 반영하지 않고 <strong>제안(G16)</strong>으로 올린다. 받아들이려면 <code>node scripts/ds.mjs all --accept</code> 로 한 번 돌리거나 소유자를 figma 로 바꾼다. semantic 매핑은 <code>.ds/semantic.json</code> 에 역할 → primitive 로 적는다(파이프라인은 이 파일을 쓰지 않는다).</>,
          <>When Figma changes a field whose owner is not figma, the change is not applied; it is raised as a <strong>proposal (G16)</strong>. To accept it, run <code>node scripts/ds.mjs all --accept</code> once or change the owner to figma. Semantic mappings are written as role → primitive in <code>.ds/semantic.json</code> (the pipeline never writes this file).</>,
        )}
      </Note>

      <H3>{L("파일 단위에도 같은 원칙이 적용된다", "The same principle applies per file")}</H3>
      <Table head={[L("파일", "File"), L("소유", "Owner"), L("재생성", "Regeneration")]} width={760}>
        <tr><Td mono>{"<Name>.stories.tsx"}</Td><Td><Pill tone="info">{generator}</Pill></Td><Td dim>{L("매번 — 단 사람이 고쳤으면 충돌 보고 후 보존", "Every time — but if a person edited it, a conflict is reported and the file is kept")}</Td></tr>
        <tr><Td mono>{"<Name>.figma.tsx"}</Td><Td><Pill tone="info">{generator}</Pill></Td><Td dim>{L("위와 같음", "Same as above")}</Td></tr>
        <tr><Td mono>{"<Name>.tsx / .css"}</Td><Td><Pill tone="warn">{L("사람", "Person")}</Pill></Td><Td dim>{L("없을 때 한 번만 만들고 이후 안 건드림", "Created once if missing, never touched again")}</Td></tr>
        <tr><Td mono>tokens.css</Td><Td><Pill tone="info">{generator}</Pill></Td><Td dim>{L("매번 전체 재작성", "Fully rewritten every time")}</Td></tr>
      </Table>

      <Note tone="warn">
        {L(
          <>추측은 <strong>Figma 로 역주입하지 않는다.</strong> 한 번이라도 넣으면 다음 읽기에서 자기 추측을 “사람이 쓴 설명”으로 오인해 자기 강화 루프에 빠진다.</>,
          <>Guesses are <strong>never written back to Figma.</strong> Once they are, the next read mistakes the tool's own guess for “a human-written description” and falls into a self-reinforcing loop.</>,
        )}
      </Note>
    </Shell>
  );
}

export const Ownership: Story = {
  name: "소유권",
  render: () => <OwnershipPage />,
};

function GuardsPage() {
  const L = useL();
  const errors = GUARDS.filter((g) => g.severity === "error" && g.total > 0);
  const warns = GUARDS.filter((g) => g.severity === "warn" && g.total > 0);
  return (
    <Shell
      title={L("가드 규칙", "Guard rules")}
      desc={L(
        <>순수 모듈 + 규칙별 테스트. <strong>“버리지 않고 격리”</strong> — 위반이 생성을 막지 않는다. 산출물은 나오되 검토 목록으로 분리된다.</>,
        <>A pure module with a test per rule. <strong>“Quarantine, don't discard”</strong> — violations don't block generation. Outputs are still produced but separated into a review list.</>,
      )}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <Pill tone={errors.length ? "bad" : "ok"}>{L("오류", "Errors")} {errors.reduce((n, g) => n + g.total, 0)}</Pill>
        <Pill tone={warns.length ? "warn" : "ok"}>{L("경고", "Warnings")} {warns.reduce((n, g) => n + g.total, 0)}</Pill>
        <Pill tone={STRICT ? "bad" : "panel"}>{STRICT ? L("strict — 경고도 실패", "strict — fails on warnings too") : L("strict 꺼짐 — 오류만 실패", "strict off — fails on errors only")}</Pill>
      </div>

      {GUARDS.map((g) => (
        <div key={g.id} style={{ borderBottom: "1px solid " + C.line, padding: "10px 0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Pill tone={g.total === 0 ? "ok" : g.severity === "error" ? "bad" : "warn"}>
              {g.total === 0 ? L("통과", "Pass") : L(g.total + "건", String(g.total))}
            </Pill>
            <span style={{ fontFamily: MONO, fontWeight: 700 }}>{g.id}</span>
            <span><Msg m={g.title} /></span>
            <span style={{ marginLeft: "auto", color: C.faint, fontSize: 11 }}>{g.severity === "error" ? L("오류", "Error") : L("경고", "Warning")}</span>
          </div>
          {g.findings.length ? (
            <div style={{ marginTop: 6, paddingLeft: 12, borderLeft: "2px solid " + C.line }}>
              {g.findings.map((f, i) => (
                <div key={i} style={{ fontSize: 11, color: C.dim, padding: "1px 0" }}>
                  <span style={{ fontFamily: MONO, color: C.fg }}><Msg m={f.target} /></span> — <Msg m={f.detail} />
                </div>
              ))}
              {g.total > g.findings.length ? <div style={{ fontSize: 11, color: C.faint }}>{L("… 외 " + (g.total - g.findings.length) + "건", "… and " + (g.total - g.findings.length) + " more")}</div> : null}
            </div>
          ) : null}
        </div>
      ))}
    </Shell>
  );
}

export const Guards: Story = {
  name: "가드 규칙",
  render: () => <GuardsPage />,
};

const SYNTH_MEANING: Record<string, [string, string]> = {
  layout: ["간격·모서리·타이포·모션 기본 세트에서 빠진 것 보충", "Fill missing spacing, radius, type and motion from the default set"],
  statusColors: ["danger/warning/success/info 기본 seed 로 램프 생성", "Build ramps from the default danger/warning/success/info seeds"],
  missingRoles: ["semantic 역할 중 비어 있는 것 추론으로 보충", "Infer empty semantic roles"],
  componentTokens: ["컴포넌트 인벤토리에서 component 계층 합성", "Synthesize a component tier from the component inventory"],
};

function SyncPage() {
  const L = useL();
  return (
    <Shell
      title={L("동기화 정책", "Sync policy")}
      desc={L("계층을 어떻게 판정하고, 무엇을 자동으로 만들고, 어디서 사람을 부르는지.", "How tiers are decided, what is generated automatically, and where a person is called in.")}
    >
      <H3>{L("계층 선언 — 적으면 추론이 사라진다", "Tier declarations — declare them and inference disappears")}</H3>
      <Table head={[L("계층", "Tier"), L("컬렉션 이름", "Collection names"), L("이름 패턴", "Name patterns")]} width={760}>
        {Object.entries(TIERS).map(([tier, rule]) => (
          <tr key={tier}>
            <Td bold>{tier}</Td>
            <Td mono dim>{(rule.collections ?? []).join(", ") || "—"}</Td>
            <Td mono dim>{(rule.match ?? []).join(", ") || "—"}</Td>
          </tr>
        ))}
      </Table>
      <div style={{ marginTop: 8, color: C.dim }}>
        {L(
          <>현재 해석 결과: <strong style={{ color: C.fg }}>{LEVEL}</strong>. Figma 컬렉션 이름이 위와 다르면 <span style={{ fontFamily: MONO }}>ds.config.json</span> 의 <span style={{ fontFamily: MONO }}>tiers</span> 에 추가하세요.</>,
          <>Current result: <strong style={{ color: C.fg }}>{LEVEL}</strong>. If your Figma collection names differ from the above, add them to <span style={{ fontFamily: MONO }}>tiers</span> in <span style={{ fontFamily: MONO }}>ds.config.json</span>.</>,
        )}
      </div>

      <H3>{L("신뢰도 기준", "Confidence thresholds")}</H3>
      <Table head={[L("기준", "Threshold"), L("값", "Value"), L("뜻", "Meaning")]} width={700}>
        <tr><Td bold>review</Td><Td mono>{CONF.review}</Td><Td dim>{L("이 값 미만은 자동 적용하지 않고 검토 목록(G6)으로", "Below this, values are not applied automatically and go to the review list (G6)")}</Td></tr>
        <tr><Td bold>autoApply</Td><Td mono>{CONF.autoApply}</Td><Td dim>{L("이 값 이상만 조용히 반영", "Only values at or above this are applied silently")}</Td></tr>
      </Table>

      <H3>{L("빠진 계층을 만들어낼지", "Whether to generate missing tiers")}</H3>
      <Table head={[L("항목", "Item"), L("설정", "Setting"), L("뜻", "Meaning")]} width={760}>
        {Object.entries(SYNTH).map(([k, v]) => (
          <tr key={k}>
            <Td bold mono>{k}</Td>
            <Td><Pill tone={v ? "info" : "panel"}>{v ? L("생성", "Generate") : L("안 함", "Off")}</Pill></Td>
            <Td dim>{SYNTH_MEANING[k] ? L(...SYNTH_MEANING[k]) : ""}</Td>
          </tr>
        ))}
      </Table>

      <H3>AI</H3>
      <div style={{ color: C.dim }}>
        <Pill tone={AI.enabled ? "info" : "panel"}>{AI.enabled ? L("켜짐 · ", "On · ") + AI.model : L("꺼짐", "Off")}</Pill>
        {" "}
        {L(
          <>LLM 은 <strong style={{ color: C.fg }}>컴포넌트 설명 문장</strong> 한 곳에만 쓰입니다. 계층 판정 · variant 행렬 · diff · 가드는 전부 결정적 코드입니다 — 같은 입력에 다른 답이 나오면 lock 비교가 무의미해지기 때문입니다.</>,
          <>The LLM is used in exactly one place: <strong style={{ color: C.fg }}>component description sentences</strong>. Tier decisions, the variant matrix, diff and guards are all deterministic code — if the same input could give different answers, lock comparison would be meaningless.</>,
        )}
      </div>

      <Note tone="info">
        {L(
          <>비교는 픽셀이 아니라 <strong>구조·값</strong>입니다. Figma 렌더와 브라우저 렌더를 픽셀로 맞추는 것은 폰트 래스터화·서브픽셀 때문에 영구 false positive 가 됩니다. 픽셀 비교가 유효한 곳은 Storybook↔Storybook(시간축)뿐입니다.</>,
          <>Comparison is by <strong>structure and value</strong>, not pixels. Matching Figma renders to browser renders pixel by pixel produces permanent false positives from font rasterization and subpixels. Pixel comparison only makes sense Storybook↔Storybook (over time).</>,
        )}
      </Note>
    </Shell>
  );
}

export const Sync: Story = {
  name: "동기화 정책",
  render: () => <SyncPage />,
};
`;
}

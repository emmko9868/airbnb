/* @ds-generated 58f00b3b68716a18 — `pnpm ds:gen` 이 만든 파일입니다.
   소유권·가드·동기화 정책
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { C, MONO, Shell, H3, Pill, Table, Td, Note, Msg, useL } from "./chrome";

type M = { ko: string; en: string; missing?: boolean };
const OWNERSHIP = [{"key":"tokenValue","label":{"ko":"토큰 값","en":"Token value"},"example":{"ko":"blue-500 = #0066FF","en":"blue-500 = #0066FF"},"owner":"figma","tone":"info","meaning":{"ko":"Figma 가 이기고 코드를 덮어씀","en":"Figma wins and overwrites code"},"applied":{"ko":"tokens — 직전 lock 의 원시값(primitive·layout)과 비교","en":"tokens — compared with raw values (primitive, layout) in the previous lock"}},{"key":"tokenName","label":{"ko":"토큰 이름","en":"Token name"},"example":{"ko":"blue-500","en":"blue-500"},"owner":"figma","tone":"info","meaning":{"ko":"Figma 가 이기고 코드를 덮어씀","en":"Figma wins and overwrites code"},"applied":{"ko":"tokens — Figma 변수 id 로 이름 변경을 추적","en":"tokens — renames tracked by Figma variable id"}},{"key":"semanticMapping","label":{"ko":"semantic 매핑","en":"Semantic mapping"},"example":{"ko":"primary → blue-500","en":"primary → blue-500"},"owner":"human","tone":"warn","meaning":{"ko":"비어 있을 때만 채우고 절대 덮어쓰지 않음","en":"Filled only when empty, never overwritten"},"applied":{"ko":"tokens — .ds/semantic.json (사람이 쓰는 역할 → primitive)","en":"tokens — .ds/semantic.json (role → primitive, written by people)"}},{"key":"componentApi","label":{"ko":"컴포넌트 API","en":"Component API"},"example":{"ko":"props 이름·타입","en":"prop names and types"},"owner":"code","tone":"ok","meaning":{"ko":"코드가 이기고 Figma 변경은 제안만","en":"Code wins; Figma changes are proposals only"},"applied":{"ko":"gen — 구현 파일의 Props 인터페이스","en":"gen — the Props interface in the implementation file"}},{"key":"variantMatrix","label":{"ko":"variant 행렬","en":"Variant matrix"},"example":{"ko":"Type × Size 조합","en":"Type × Size combinations"},"owner":"figma","tone":"info","meaning":{"ko":"Figma 가 이기고 코드를 덮어씀","en":"Figma wins and overwrites code"},"applied":{"ko":"gen — 구현 파일의 variant 타입","en":"gen — the variant types in the implementation file"}},{"key":"description","label":{"ko":"설명","en":"Description"},"example":{"ko":"컴포넌트 문서 문장","en":"component doc sentences"},"owner":"human","tone":"warn","meaning":{"ko":"비어 있을 때만 채우고 절대 덮어쓰지 않음","en":"Filled only when empty, never overwritten"},"applied":{"ko":"gen·enrich — .ds/descriptions.json 의 human 항목","en":"gen·enrich — human entries in .ds/descriptions.json"}},{"key":"usageGuide","label":{"ko":"사용 가이드","en":"Usage guide"},"example":{"ko":"언제 쓰는지, do/don't","en":"when to use, do/don't"},"owner":"human","tone":"warn","meaning":{"ko":"비어 있을 때만 채우고 절대 덮어쓰지 않음","en":"Filled only when empty, never overwritten"},"applied":{"ko":"생성하는 경로가 없다 — 덮어쓸 일이 없어 지킬 것도 없다","en":"No path generates it — nothing to overwrite, so nothing to protect"}}] as { key: string; label: M; example: M; owner: string; tone: "ok" | "warn" | "bad" | "info" | "panel"; meaning: M; applied: M }[];
const GUARDS = [{"id":"G1","title":{"ko":"component 토큰은 primitive 를 직접 참조하지 않는다","en":"Component tokens do not reference primitives directly"},"severity":"error","findings":[],"total":0},{"id":"G2","title":{"ko":"semantic 토큰은 alias 여야 한다 (원시 hex 금지)","en":"Semantic tokens are aliases (no raw hex)"},"severity":"error","findings":[],"total":0},{"id":"G3","title":{"ko":"primitive 토큰은 원시값이어야 한다 (alias 금지)","en":"Primitive tokens hold raw values (no aliases)"},"severity":"error","findings":[],"total":0},{"id":"G4","title":{"ko":"alias 순환 참조가 없다","en":"No circular alias references"},"severity":"error","findings":[],"total":0},{"id":"G5","title":{"ko":"가리키는 토큰이 실제로 존재한다","en":"Referenced tokens exist"},"severity":"error","findings":[],"total":0},{"id":"G6","title":{"ko":"신뢰도가 낮은 토큰은 사람이 검토한다","en":"Low-confidence tokens are reviewed by a person"},"severity":"warn","findings":[{"target":{"ko":"bg","en":"bg"},"detail":{"ko":"inferred / 0.55 — 무채색 계열 중 가장 밝음","en":"inferred / 0.55 — Lightest in the neutral family"}},{"target":{"ko":"surface","en":"surface"},"detail":{"ko":"inferred / 0.55 — bg 와 동일 (분리된 표면 단계가 없음)","en":"inferred / 0.55 — Same as bg (no separate surface step)"}},{"target":{"ko":"text","en":"text"},"detail":{"ko":"inferred / 0.55 — 무채색 계열 중 가장 어두움","en":"inferred / 0.55 — Darkest in the neutral family"}},{"target":{"ko":"text-secondary","en":"text-secondary"},"detail":{"ko":"inferred / 0.55 — 명도 0.45 근처","en":"inferred / 0.55 — Nearest to lightness 0.45"}},{"target":{"ko":"text-disabled","en":"text-disabled"},"detail":{"ko":"inferred / 0.55 — 명도 0.65 근처","en":"inferred / 0.55 — Nearest to lightness 0.65"}},{"target":{"ko":"border","en":"border"},"detail":{"ko":"inferred / 0.55 — 명도 0.85 근처","en":"inferred / 0.55 — Nearest to lightness 0.85"}},{"target":{"ko":"border-strong","en":"border-strong"},"detail":{"ko":"inferred / 0.55 — 명도 0.72 근처","en":"inferred / 0.55 — Nearest to lightness 0.72"}},{"target":{"ko":"surface-raised","en":"surface-raised"},"detail":{"ko":"inferred / 0.55 — bg 보다 밝은 무채색이 없어 bg 와 동일","en":"inferred / 0.55 — Same as bg (no neutral lighter than bg)"}},{"target":{"ko":"primary","en":"primary"},"detail":{"ko":"inferred / 0.40 — 이름 단서 없음 — 채도 높고 중간 밝기인 색","en":"inferred / 0.40 — No name hint — the most saturated mid-lightness color"}},{"target":{"ko":"primary-hover","en":"primary-hover"},"detail":{"ko":"inferred / 0.55 — primary 램프의 한 단계 어두운 스텝","en":"inferred / 0.55 — One step darker in the primary ramp"}},{"target":{"ko":"primary-active","en":"primary-active"},"detail":{"ko":"inferred / 0.55 — primary 램프의 두 단계 어두운 스텝","en":"inferred / 0.55 — Two steps darker in the primary ramp"}},{"target":{"ko":"on-primary","en":"on-primary"},"detail":{"ko":"inferred / 0.55 — primary 대비 4.6:1 로 최대","en":"inferred / 0.55 — Highest contrast against primary (4.6:1)"}}],"total":35},{"id":"G7","title":{"ko":"필수 semantic 역할이 빠지지 않았다","en":"No required semantic role is missing"},"severity":"error","findings":[],"total":0},{"id":"G8","title":{"ko":"on-primary 와 primary 의 대비가 4.5:1 이상이다","en":"on-primary vs primary contrast is at least 4.5:1"},"severity":"warn","findings":[],"total":0},{"id":"G9","title":{"ko":"토큰 이름은 kebab-case 다","en":"Token names are kebab-case"},"severity":"warn","findings":[],"total":0},{"id":"G10","title":{"ko":"컴포넌트 CSS 에 하드코딩된 색이 없다","en":"No hard-coded colors in component CSS"},"severity":"error","findings":[],"total":0},{"id":"G11","title":{"ko":"컴포넌트마다 Code Connect 파일이 있다","en":"Every component has a Code Connect file"},"severity":"warn","findings":[],"total":0},{"id":"G12","title":{"ko":"story 에 autodocs 태그와 play 함수가 있다","en":"Stories have the autodocs tag and a play function"},"severity":"warn","findings":[],"total":0},{"id":"G13","title":{"ko":"컴포넌트 CSS 가 쓰는 토큰이 전부 정의돼 있다","en":"Every token used in component CSS is defined"},"severity":"error","findings":[],"total":0},{"id":"G14","title":{"ko":"CSS 변수 이름이 겹치지 않는다","en":"CSS variable names do not collide"},"severity":"error","findings":[],"total":0},{"id":"G15","title":{"ko":"소유권 설정과 사람 지정이 올바르다","en":"Ownership settings and human overrides are valid"},"severity":"error","findings":[],"total":0},{"id":"G16","title":{"ko":"소유권 때문에 반영하지 않은 Figma 변경(제안)","en":"Figma changes not applied because of ownership (proposals)"},"severity":"warn","findings":[],"total":0}] as { id: string; title: M; severity: string; findings: { target: M; detail: M }[]; total: number }[];
const TIERS = {"primitive":{"collections":["Primitive","Core","Palette","Primitives"],"match":["^palette/","^primitive/"]},"semantic":{"collections":["Semantic","Theme","Role","Alias"],"match":["^semantic/","^role/"]},"component":{"collections":["Component","Components"],"match":["^component/"]}} as Record<string, { collections?: string[]; match?: string[] }>;
const CONF = {"review":0.6,"autoApply":0.8} as Record<string, number>;
const SYNTH = {"layout":true,"statusColors":true,"missingRoles":true,"componentTokens":false} as Record<string, boolean>;
const LEVEL = "L2a";
const STRICT = false;
const AI = {"enabled":false,"model":""};

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

/* @ds-generated 404f2332a551a9a7 — `pnpm ds:gen` 이 만든 파일입니다.
   Foundation — .ds/foundation.json 을 읽는 화면
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Msg, Note, Pill, Shell, SourceBadge, Table, Td, useL } from "../chrome";
import { DATA, ROLE_GROUPS, ROLE_LABEL, STANDARD_ROLES, TIER_LABEL, findColor, rampOf, tokensOf } from "./data";
import type { Token } from "./data";
import { Code, Say, Small, Swatch } from "./ui";

const meta = {
  title: "Foundation/Color",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// ── 1. Primitive ─────────────────────────────────────────────────────

function PrimitivePage() {
  const L = useL();
  const primitives = tokensOf("primitive", "COLOR");
  const families = new Map<string, Token[]>();
  for (const t of primitives) {
    const { family } = rampOf(t.name);
    families.set(family, [...(families.get(family) ?? []), t]);
  }
  return (
    <Shell
      title={L("1 · Primitive — 색상표", "1 · Primitive — palette")}
      desc={L(
        "색 하나하나에 이름을 붙인 층이에요. 부품은 이 색을 직접 쓰지 않고, 역할(Semantic)을 거쳐서 써요.",
        "Each color gets a name here. Parts never use these directly — they go through a role (Semantic).",
      )}
    >
      {primitives.length === 0 ? <Note tone="warn">{L("아직 색이 없어요. Figma에서 색을 가져오세요.", "No colors yet. Import your colors from Figma.")}</Note> : null}
      {[...families.entries()].map(([family, list]) => (
        <div key={family} style={{ marginBottom: 18 }}>
          <H3>{family}</H3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {[...list].sort((a, b) => (rampOf(a.name).step ?? 0) - (rampOf(b.name).step ?? 0)).map((t) => (
              <div key={t.name} style={{ width: 96 }}>
                <Swatch hex={t.hex} size={96} />
                <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, wordBreak: "break-all" }}>{t.name}</div>
                <Small>{t.hex ?? t.value}</Small>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Small>{L("CSS 이름은 --color-<이름> 이에요. 예: ", "CSS names are --color-<name>. Example: ")}<Code>{primitives[0]?.cssVar ?? "--color-blue-500"}</Code></Small>
    </Shell>
  );
}

// ── 2. Semantic ──────────────────────────────────────────────────────

function RoleRow({ role }: { role: string }) {
  const L = useL();
  const token = tokensOf("semantic", "COLOR").find((t) => t.name === role) ?? null;
  const target = findColor(token?.ref ?? null);
  const label = ROLE_LABEL[role];
  return (
    <tr>
      <Td width={64}><Swatch hex={token?.hex ?? null} size={40} dashed={!token} /></Td>
      <Td>
        <div style={{ fontWeight: 600 }}>{role}</div>
        <Small>{label ? L(label[0], label[1]) : ""}</Small>
      </Td>
      <Td mono>{token ? token.cssVar : "—"}</Td>
      <Td>
        {token ? (
          <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
            <span style={{ color: C.dim }}>→</span>
            <Swatch hex={target?.hex ?? token.hex} size={20} />
            <Code>{token.ref ?? token.value}</Code>
            <span style={{ color: C.dim, fontSize: 11 }}>{token.hex}</span>
          </span>
        ) : (
          <Pill tone="warn">{L("아직 없음", "Not set yet")}</Pill>
        )}
      </Td>
      <Td>{token ? <SourceBadge source={token.source} /> : null}</Td>
    </tr>
  );
}

function SemanticPage() {
  const L = useL();
  const extra = tokensOf("semantic", "COLOR").filter((t) => !STANDARD_ROLES.includes(t.name));
  const head = ["", L("역할", "Role"), L("CSS 이름", "CSS name"), L("가리키는 색 (Primitive)", "Points to (Primitive)"), L("출처", "Source")];
  return (
    <Shell
      title={L("2 · Semantic — 색의 역할", "2 · Semantic — color roles")}
      desc={L(
        "어디에 쓰는 색인지 정한 층이에요. 스타터 부품은 아래 16개 역할 이름만 보고 칠해요. 역할은 Figma 선언이나 내가 승인한 색 역할 계획으로만 정해져요.",
        "What each color is for. The starter's parts paint with these 16 role names only. Roles come only from Figma declarations or a color role plan you approved.",
      )}
    >
      {ROLE_GROUPS.map((g) => (
        <div key={g.title[1]}>
          <H3>{L(g.title[0], g.title[1])}</H3>
          <Table head={head}>{g.roles.map((r) => <RoleRow key={r} role={r} />)}</Table>
        </div>
      ))}
      {extra.length ? (
        <>
          <H3>{L("내 Figma의 다른 역할", "Other roles from your Figma")}</H3>
          <Small>{L("스타터 부품은 쓰지 않지만, 내가 만드는 부품과 페이지에서 쓸 수 있어요.", "The starter's parts don't use these, but your own parts and pages can.")}</Small>
          <Table head={head}>{extra.map((t) => <RoleRow key={t.name} role={t.name} />)}</Table>
        </>
      ) : null}
      {DATA?.studentPalette && DATA.missingRoles.length ? (
        <Note tone="warn">
          {L(
            `색이 없는 역할 ${DATA.missingRoles.length}개가 있어요. AI에게 "내 Figma 색으로 색 역할 계획을 만들어 줘"라고 부탁하고, 내가 승인한 뒤 AI 가 적용 명령(pnpm ds:apply-token-plan)으로 적용하세요.`,
            `${DATA.missingRoles.length} roles have no color. Ask the AI "Make a color role plan with my Figma colors", approve it yourself, then ask the AI to apply it (it runs pnpm ds:apply-token-plan).`,
          )}
        </Note>
      ) : null}
    </Shell>
  );
}

// ── 3. Component ─────────────────────────────────────────────────────

function ComponentPage() {
  const L = useL();
  const list = tokensOf("component", "COLOR");
  return (
    <Shell
      title={L("3 · Component — 부품 전용 색", "3 · Component — part-only colors")}
      desc={L(
        "한 부품만 쓰는 색이에요(예: button-bg). 없어도 괜찮아요. 항상 역할(Semantic)을 가리켜요 — 색상표를 바로 가리키지 않아요.",
        "Colors only one part uses (for example button-bg). Optional. They always point to a role (Semantic), never straight to the palette.",
      )}
    >
      {list.length ? (
        <Table head={["", L("이름", "Name"), L("CSS 이름", "CSS name"), L("가리키는 역할", "Points to role"), L("근거", "Why")]}>
          {list.map((t) => (
            <tr key={t.name}>
              <Td width={64}><Swatch hex={t.hex} size={40} /></Td>
              <Td bold>{t.name}</Td>
              <Td mono>{t.cssVar}</Td>
              <Td><span style={{ color: C.dim }}>→ </span><Code>{t.ref ?? "—"}</Code></Td>
              <Td><Msg m={t.reason} /></Td>
            </tr>
          ))}
        </Table>
      ) : (
        <Note>
          {L("아직 부품 전용 색이 없어요. 쓰고 싶다면 Figma 변수 이름을 component/<부품>/<이름> 으로 지으세요. 예: ", "No part-only colors yet. To add some, name the Figma variables component/<part>/<name>. Example: ")}
          <Code>component/button/bg</Code>
        </Note>
      )}
    </Shell>
  );
}

// ── Figma 가져오기 ───────────────────────────────────────────────────

function FigmaImportPage() {
  const L = useL();
  const rows = DATA?.figma?.variables ?? [];
  const tierTone = { primitive: "panel", semantic: "info", component: "ok" } as const;
  const count = (tier: string) => rows.filter((r) => r.tier === tier).length;
  return (
    <Shell
      title={L("Figma 가져오기 — 어느 계층이 됐나요?", "Figma import — which tier did each color become?")}
      desc={L(
        "Figma에서 가져온 색마다 정해진 계층과 이유예요. 내 Figma의 3계층이 제대로 들어왔는지 여기서 확인해요.",
        "The tier each imported Figma color became, and why. Check here that your Figma's three tiers came in correctly.",
      )}
    >
      <Note tone="info">
        <b>{L("알아 둘 것", "Good to know")}</b>
        <div style={{ marginTop: 4 }}>
          {L(
            "Figma 데스크톱 연결(MCP)은 변수의 이름과 최종 색 값만 보내 줘요. 컬렉션 이름이나 어떤 변수를 가리키는지는 오지 않아요. 그래서 이름으로 계층을 찾아요:",
            "The Figma desktop connection (MCP) only sends each variable's name and final color — not its collection or which variable it points to. So tiers are found from names:",
          )}
        </div>
        <ul style={{ margin: "6px 0 0 18px", padding: 0 }}>
          <li><Code>semantic/…</Code> · <Code>role/…</Code> → Semantic</li>
          <li><Code>component/…</Code> → Component</li>
          <li>{L("그 밖의 이름 → Primitive", "Any other name → Primitive")}</li>
        </ul>
        <div style={{ marginTop: 6 }}>
          {L(
            "팁: Figma 변수 패널에서 역할 색은 semantic 그룹, 부품 전용 색은 component 그룹에 넣으세요. 그룹 이름이 변수 이름 앞에 붙어요. 강사는 ds.config.json 의 tiers.semantic.match 에 이름 패턴(예: ^status/)을 더할 수도 있어요.",
            "Tip: in Figma's Variables panel, put role colors in a group named semantic and part-only colors in a group named component. The group name becomes the start of the variable name. Your instructor can also add name patterns to tiers.semantic.match in ds.config.json (for example ^status/).",
          )}
        </div>
      </Note>
      {rows.length === 0 ? (
        <>
          <H3>{L("아직 가져오지 않았어요", "Nothing imported yet")}</H3>
          <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("내 Figma 파일에서 색을 가져와 줘 <Figma 링크>", "Bring in the colors from my Figma file <Figma link>.")} note={L("AI 가 가져오기 명령(pnpm ds:figma)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the import command (pnpm ds:figma). Permission prompt → Yes, allow once")} />
        </>
      ) : (
        <>
          <H3>{L(`가져온 색 ${rows.length}개`, `${rows.length} imported colors`)}</H3>
          <Small>Primitive {count("primitive")} · Semantic {count("semantic")} · Component {count("component")}</Small>
          <div style={{ height: 8 }} />
          <Table head={[L("Figma 이름", "Figma name"), L("계층", "Tier"), L("토큰", "Token"), L("이유", "Why")]} width={1100}>
            {rows.map((r, i) => {
              const token = r.token ? findColor(r.token) : null;
              const label = TIER_LABEL[r.tier];
              return (
                <tr key={i}>
                  <Td mono>{r.figma}</Td>
                  <Td><Pill tone={tierTone[r.tier as keyof typeof tierTone] ?? "panel"}>{label ? L(label[0], label[1]) : r.tier}</Pill></Td>
                  <Td>
                    {r.applied && token ? (
                      <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Swatch hex={token.hex} size={18} /><Code>{token.cssVar}</Code></span>
                    ) : <Pill tone="warn">{L("만들지 않음", "Not created")}</Pill>}
                  </Td>
                  <Td>
                    <Msg m={r.how} />
                    {r.hint ? <div style={{ color: C.warn, fontSize: 12 }}><Msg m={r.hint} /></div> : null}
                  </Td>
                </tr>
              );
            })}
          </Table>
        </>
      )}
    </Shell>
  );
}

export const Primitive: Story = { name: "Primitive", render: () => <PrimitivePage /> };
export const Semantic: Story = { name: "Semantic", render: () => <SemanticPage /> };
export const Component: Story = { name: "Component", render: () => <ComponentPage /> };
export const FigmaImport: Story = { name: "Figma import", render: () => <FigmaImportPage /> };


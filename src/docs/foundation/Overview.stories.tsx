/* @ds-generated 39ad50c82f606ed7 — `pnpm ds:gen` 이 만든 파일입니다.
   Foundation — .ds/foundation.json 을 읽는 화면
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Msg, Note, Pill, Shell, Table, Td, useL } from "../chrome";
import { DATA, TOKENS, findColor, tokensOf, typeScale, ROLE_LABEL } from "./data";
import type { FoundationData } from "./data";
import { Card, Code, Say, Small, Swatch } from "./ui";

const meta = {
  title: "Foundation/Overview",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function TierBox({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  return (
    <Card style={{ flex: "1 1 200px", minWidth: 200 }}>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, margin: "4px 0" }}>{count}</div>
      <Small>{children}</Small>
    </Card>
  );
}

function OverviewPage() {
  const L = useL();
  if (!DATA) {
    return (
      <Shell title="Foundation" desc={L("아직 토큰 데이터가 없어요.", "There is no token data yet.")}>
        <Note tone="warn"><Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("내 토큰 다시 만들어 줘", "Rebuild my tokens.")} note={L("AI 가 토큰 명령(pnpm ds:tokens)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the token command (pnpm ds:tokens). Permission prompt → Yes, allow once")} /></Note>
      </Shell>
    );
  }
  const semantic = tokensOf("semantic", "COLOR");
  const example = semantic.find((t) => t.name === "primary") ?? semantic[0] ?? null;
  const examplePrimitive = findColor(example?.ref ?? null);
  const exampleComponent = tokensOf("component", "COLOR").find((t) => t.ref === example?.name) ?? null;
  const styles = typeScale().length;
  return (
    <Shell
      title={L("Foundation — 모든 부품의 기초 값", "Foundation — the base values of every part")}
      desc={L(
        "색·글자·간격·그림자·움직임·아이콘처럼 부품이 공통으로 쓰는 값이에요. Figma에서 가져오거나 계획을 적용하면 이 화면이 저절로 바뀝니다.",
        "Colors, text, spacing, shadows, motion and icons that all parts share. This page updates by itself when you import from Figma or apply a plan.",
      )}
    >
      <H3>{L("색의 3계층", "The three color tiers")}</H3>
      <div style={{ display: "flex", gap: 12, alignItems: "stretch", flexWrap: "wrap", maxWidth: 1100 }}>
        <TierBox title="1 · Primitive" count={tokensOf("primitive", "COLOR").length}>
          {L("색상표. 색에 이름을 붙인 것(blue-500). 부품은 직접 쓰지 않아요.", "Your palette: colors with names (blue-500). Parts never use these directly.")}
        </TierBox>
        <TierBox title="2 · Semantic" count={semantic.length}>
          {L("역할. 어디에 쓰는 색인지(primary, text). 부품은 이 층만 써요.", "Roles: what a color is for (primary, text). Parts use only this tier.")}
        </TierBox>
        <TierBox title="3 · Component" count={tokensOf("component", "COLOR").length}>
          {L("부품 전용 색(button-bg). 없어도 돼요. semantic 을 가리켜요.", "Part-only colors (button-bg). Optional. They point to a semantic color.")}
        </TierBox>
      </div>
      {example ? (
        <Card style={{ marginTop: 12, maxWidth: 1100, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Swatch hex={example.hex} size={40} />
          <Code>{examplePrimitive?.name ?? "—"}</Code>
          <span style={{ color: C.dim }}>→</span>
          <Code>{example.name}</Code>
          {exampleComponent ? (<><span style={{ color: C.dim }}>→</span><Code>{exampleComponent.name}</Code></>) : null}
          <Small>{L("예: 이 색은 색상표의 이름을 갖고, 역할을 맡아 부품에 쓰여요.", "Example: this color has a palette name, takes a role, and is used by parts.")}</Small>
        </Card>
      ) : null}

      <H3>{L("그 밖의 기초 값", "Other base values")}</H3>
      <Small>
        {L("글자 크기 체계", "Type scale")} {styles} · {L("간격", "Spacing")} {TOKENS.filter((t) => t.category === "SPACING_UNIT").length} · {L("모서리", "Radius")} {TOKENS.filter((t) => t.category === "RADIUS").length} · {L("그림자", "Shadow")} {TOKENS.filter((t) => t.category === "SHADOW").length} · {L("움직임", "Motion")} {TOKENS.filter((t) => t.category === "DURATION" || t.category === "EASING").length}
      </Small>

      <H3>{L("지금 상태", "Current status")}</H3>
      <div><Msg m={DATA.levelLabel} /></div>
      {DATA.notes.map((n, i) => <Small key={i}><Msg m={n} /></Small>)}

      {DATA.studentPalette && DATA.missingRoles.length ? (
        <Note tone="warn">
          <b>{L(`아직 색이 없는 역할 ${DATA.missingRoles.length}개`, `${DATA.missingRoles.length} roles have no color yet`)}</b>
          <div style={{ margin: "6px 0" }}>{DATA.missingRoles.map((r) => <span key={r} style={{ marginRight: 6 }}><Pill tone="warn">{r}</Pill></span>)}</div>
          {L(
            "부품은 이 역할 이름으로 색을 찾아요. AI에게 색 역할 계획(docs/plans/tokens.md)을 부탁하고, 내가 승인한 뒤 AI 가 적용 명령(pnpm ds:apply-token-plan)을 실행하면 채워져요.",
            "Parts look up colors by these role names. Ask the AI for a color role plan (docs/plans/tokens.md), approve it yourself, then the AI applies it (it runs pnpm ds:apply-token-plan).",
          )}
        </Note>
      ) : null}

      {DATA.review.length ? (() => {
        // 색 계층 항목은 바로 보이고, 기본값으로 채운 layout 항목은 접어 둔다.
        const colorRows = DATA.review.filter((r) => r.layer !== "layout");
        const layoutRows = DATA.review.filter((r) => r.layer === "layout");
        const rows = (list: FoundationData["review"]) => (
          <Table head={[L("이름", "Name"), L("계층", "Tier"), L("이유", "Why")]}>
            {list.map((r, i) => (
              <tr key={i}>
                <Td mono>{r.name}</Td>
                <Td dim>{r.layer}</Td>
                <Td><Msg m={r.reason} /></Td>
              </tr>
            ))}
          </Table>
        );
        return (
          <>
            <H3>{L(`확인할 것 ${DATA.review.length}건`, `${DATA.review.length} items to check`)}</H3>
            {colorRows.length ? rows(colorRows) : null}
            {layoutRows.length ? (
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: "pointer", color: C.dim }}>{L(`간격·글자 등 기본값으로 채운 항목 ${layoutRows.length}건`, `${layoutRows.length} spacing/text items filled with defaults`)}</summary>
                {rows(layoutRows)}
              </details>
            ) : null}
          </>
        );
      })() : null}

      <H3>{L("다시 가져오기", "Import again")}</H3>
      <Small>{L("Figma 데스크톱 앱에서 파일을 열고 MCP를 켠 뒤, 색이 있는 노드 링크와 함께 AI 에게 부탁해요. 토큰까지 다시 만들어져 이 화면이 바로 바뀌어요.", "Open the file in the Figma desktop app with MCP on, then ask the AI with the node link that holds your colors. Tokens are rebuilt and this page updates right away.")}</Small>
      <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("내 Figma 파일에서 색을 가져와 줘 <Figma 링크>", "Bring in the colors from my Figma file <Figma link>.")} note={L("AI 가 가져오기 명령(pnpm ds:figma)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the import command (pnpm ds:figma). Permission prompt → Yes, allow once")} />
      {DATA.figma ? <Small>{L("마지막으로 가져온 때", "Last import")}: {DATA.figma.importedAt ?? "—"}</Small> : null}
      <Small>{L("역할 이름 뜻", "Role names")}: {Object.entries(ROLE_LABEL).slice(0, 4).map(([k, v]) => `${k} = ${L(v[0], v[1])}`).join(" · ")} …</Small>
    </Shell>
  );
}

export const Overview: Story = { name: "Overview", render: () => <OverviewPage /> };

import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Note, Shell, useL } from "../chrome";
import { userIcons } from "../../assets/icons";
import { Icon } from "../../components/Icon/Icon";
import { Card, Code, Say, Grid, Small } from "./ui";

const meta = {
  title: "Foundation/Icons",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function IconsPage() {
  const L = useL();
  return (
    <Shell
      title={L("Icons — 아이콘", "Icons")}
      desc={L("my-assets/icons 에 넣은 SVG 아이콘이에요. 부품을 만들 때 AI에게 쓸 파일을 알려 주면 그 모양을 그대로 옮겨요.", "SVG icons you put in my-assets/icons. When you build a part, tell the AI which file to use and it copies the exact shape.")}
    >
      <H3>{L(`내 아이콘 ${userIcons.length}개`, `My icons (${userIcons.length})`)}</H3>
      {userIcons.length === 0 ? (
        <Note>
          {L("아직 아이콘이 없어요. Figma에서 아이콘(프레임)을 고르고 Export → SVG 로 my-assets 에 저장한 뒤 정리하세요. 작고 정사각형인 SVG 는 my-assets/icons 로 옮겨져요:", "No icons yet. In Figma, select the icon (its frame), use Export → SVG, save it into my-assets, then sort it. Small, square SVGs move to my-assets/icons:")}
          <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("my-assets 에 넣은 파일 정리해 줘", "Sort the files I put in my-assets.")} note={L("AI 가 정리 명령(pnpm assets)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the sorting command (pnpm assets). Permission prompt → Yes, allow once")} />
        </Note>
      ) : (
        <Grid min={150}>
          {userIcons.map((icon) => (
            <Card key={icon.file} style={{ textAlign: "center" }}>
              <div style={{ height: 56, display: "grid", placeItems: "center", color: C.fg }}>
                <span style={{ width: 40, height: 40, display: "inline-block" }} dangerouslySetInnerHTML={{ __html: icon.svg.replace(/<svg\b/i, '<svg width="40" height="40"') }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{icon.name}</div>
              <Small>{icon.file}</Small>
            </Card>
          ))}
        </Grid>
      )}
      <Small>{L("AI에게 이렇게 말해요: ", "Tell the AI: ")}<Code>Use my-assets/icons/{userIcons[0]?.name ?? "cart"}.svg for the button icon.</Code></Small>

      <H3>{L("스타터 기본 아이콘", "Starter icons")}</H3>
      <Grid min={150}>
        {(["add", "close", "search"] as const).map((name) => (
          <Card key={name} style={{ textAlign: "center" }}>
            <div style={{ height: 56, display: "grid", placeItems: "center", color: C.fg }}><Icon name={name} size="lg" /></div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{name}</div>
            <Small>src/components/Icon</Small>
          </Card>
        ))}
      </Grid>
    </Shell>
  );
}

export const Icons: Story = { name: "Icons", render: () => <IconsPage /> };

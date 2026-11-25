import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Note, Shell, useL } from "../chrome";
import { userImages } from "../../assets/images";
import { Card, Code, Say, Grid, Small } from "./ui";

const meta = {
  title: "Foundation/Images",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

// 투명한 그림도 보이도록 바둑판 위에 그린다(Color 화면의 색 칩과 같은 무늬).
const CHECKER = "repeating-conic-gradient(#3f3f46 0% 25%, #18181b 0% 50%) 0 0 / 12px 12px";

function ImagesPage() {
  const L = useL();
  const example = userImages[0] ? `${userImages[0].name}.${userImages[0].ext}` : "hero-photo.png";
  return (
    <Shell
      title={L("Images — 그림", "Images")}
      desc={L(
        "my-assets/images 의 그림(PNG·JPG·WebP·GIF·AVIF·SVG)이에요. 사진·일러스트·로고처럼 모양 그대로 보여 주는 것이고, 웹사이트 페이지도 같은 파일을 써요.",
        "Pictures in my-assets/images (PNG, JPG, WebP, GIF, AVIF, SVG): photos, illustrations and logos that are shown as they are. Your website pages use the same files.",
      )}
    >
      <H3>{L(`내 그림 ${userImages.length}개`, `My images (${userImages.length})`)}</H3>
      {userImages.length === 0 ? (
        <Note>
          {L("아직 그림이 없어요. 그림 파일을 my-assets 에 넣고 AI 에게 정리를 부탁하세요:", "No pictures yet. Drop picture files into my-assets and ask the AI to sort them:")}
          <Say label={L("AI 에게 이렇게 말해요", "Tell the AI")} text={L("my-assets 에 넣은 파일 정리해 줘", "Sort the files I put in my-assets.")} note={L("AI 가 정리 명령(pnpm assets)을 실행해요. 허락 창 → Yes, allow once", "The AI runs the sorting command (pnpm assets). Permission prompt → Yes, allow once")} />
        </Note>
      ) : (
        <Grid min={200}>
          {userImages.map((image) => (
            <Card key={image.file}>
              <div style={{ height: 140, borderRadius: 8, background: CHECKER, display: "grid", placeItems: "center", overflow: "hidden" }}>
                <img src={image.url} alt={image.name} loading="lazy" style={{ maxWidth: "100%", maxHeight: 140, objectFit: "contain", display: "block" }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>{image.name}</div>
              <Small>{image.file}</Small>
            </Card>
          ))}
        </Grid>
      )}
      <div style={{ marginTop: 12 }}>
        <Small>
          {L("페이지를 계획할 때 AI에게 쓸 파일을 알려 줘요: ", "When you plan a page, tell the AI which file to use: ")}
          <Code>Use my-assets/images/{example} for the hero picture.</Code>
        </Small>
      </div>
      <Note>
        <span style={{ color: C.fg, fontWeight: 600 }}>{L("아이콘과 그림", "Icons and pictures")}</span>
        <div style={{ marginTop: 4 }}>
          {L(
            "작고 정사각형이며 색이 1~2개인 SVG 는 아이콘(Foundation → Icons)으로, 크거나 색이 많은 SVG 와 사진은 그림으로 정리돼요. 애매한 파일은 정리 명령(AI 가 실행하는 pnpm assets)이 옮기지 않고 어디로 보낼지 물어요.",
            "Small, square SVGs with 1–2 colors are sorted as icons (Foundation → Icons); big or colorful SVGs and photos become pictures. If a file is unclear, the sorting command (pnpm assets, run by the AI) leaves it where it is and asks where it goes.",
          )}
        </div>
      </Note>
    </Shell>
  );
}

export const Images: Story = { name: "Images", render: () => <ImagesPage /> };

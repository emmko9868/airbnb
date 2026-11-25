import type { Meta, StoryObj } from "@storybook/react";
import { H3, Note, Shell, useL } from "../chrome";
import { TOKENS } from "./data";
import { Code, Small } from "./ui";

const meta = {
  title: "Foundation/Elevation",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function ElevationPage() {
  const L = useL();
  const shadows = TOKENS.filter((t) => t.category === "SHADOW");
  return (
    <Shell
      title={L("Elevation — 그림자", "Elevation — shadows")}
      desc={L("떠 있는 정도를 나타내는 그림자예요. 아래 상자는 디자인의 배경색 위에 그렸어요.", "Shadows show how high something floats. The boxes below sit on your design's background color.")}
    >
      {shadows.length === 0 ? <Note>{L("그림자 토큰이 없어요.", "No shadow tokens.")}</Note> : null}
      <H3>{L("그림자", "Shadows")}</H3>
      <div style={{ display: "flex", gap: 28, flexWrap: "wrap", background: "var(--color-bg)", padding: 28, borderRadius: 12, maxWidth: 1100 }}>
        {shadows.map((t) => (
          <div key={t.name} style={{ width: 180 }}>
            <div style={{ height: 100, borderRadius: 12, background: "var(--color-surface-raised, var(--color-bg))", boxShadow: `var(${t.cssVar})` }} />
            <div style={{ marginTop: 10, color: "var(--color-text)", fontSize: 13, fontWeight: 600 }}>{t.name}</div>
            <div style={{ color: "var(--color-text-secondary)", fontSize: 11, wordBreak: "break-all" }}>{t.value}</div>
          </div>
        ))}
      </div>
      <Small>{L("CSS 예: ", "CSS example: ")}<Code>box-shadow: var({shadows[0]?.cssVar ?? "--shadow-md"})</Code></Small>
    </Shell>
  );
}

export const Elevation: Story = { name: "Elevation", render: () => <ElevationPage /> };

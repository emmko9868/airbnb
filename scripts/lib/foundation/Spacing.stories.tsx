import type { Meta, StoryObj } from "@storybook/react";
import { C, H3, Note, Shell, useL } from "../chrome";
import { TOKENS } from "./data";
import { Code, Small } from "./ui";

const meta = {
  title: "Foundation/Spacing",
  parameters: { layout: "fullscreen", options: { showPanel: false } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function SpacingPage() {
  const L = useL();
  const spacing = TOKENS.filter((t) => t.category === "SPACING_UNIT");
  const radius = TOKENS.filter((t) => t.category === "RADIUS");
  const borders = TOKENS.filter((t) => t.category === "BORDER_WIDTH");
  return (
    <Shell
      title={L("Spacing — 간격·모서리·테두리", "Spacing — space, corners and borders")}
      desc={L("부품 안팎의 간격, 모서리 둥글기, 테두리 두께예요. 부품은 숫자 대신 이 이름을 써요.", "Space inside and around parts, corner roundness and border thickness. Parts use these names instead of numbers.")}
    >
      <H3>{L("간격", "Spacing")}</H3>
      {spacing.length === 0 ? <Note>{L("간격 토큰이 없어요.", "No spacing tokens.")}</Note> : null}
      {spacing.map((t) => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "6px 0", borderBottom: `1px solid ${C.line}`, maxWidth: 900 }}>
          <span style={{ width: 160 }}><Code>{t.cssVar}</Code></span>
          <span style={{ display: "inline-block", height: 16, width: `var(${t.cssVar})`, minWidth: 2, background: "#2E81FF", borderRadius: 3 }} />
          <Small>{t.value}</Small>
        </div>
      ))}
      <Small>{L("--spacing 은 기본 단위예요. 부품 CSS 는 calc(var(--spacing) * 4) 처럼 배수로 써요.", "--spacing is the base unit. Part CSS uses multiples like calc(var(--spacing) * 4).")}</Small>

      <H3>{L("모서리 둥글기", "Corner radius")}</H3>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {radius.map((t) => (
          <div key={t.name} style={{ width: 110 }}>
            <div style={{ width: 96, height: 64, background: C.panel, border: `2px solid ${C.faint}`, borderRadius: `var(${t.cssVar})` }} />
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{t.name}</div>
            <Small>{t.value}</Small>
          </div>
        ))}
      </div>

      <H3>{L("테두리 두께", "Border width")}</H3>
      {borders.map((t) => (
        <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0", maxWidth: 900 }}>
          <span style={{ width: 200 }}><Code>{t.cssVar}</Code></span>
          <span style={{ display: "inline-block", width: 160, borderTop: `var(${t.cssVar}) solid ${C.fg}` }} />
          <Small>{t.value}</Small>
        </div>
      ))}
    </Shell>
  );
}

export const Spacing: Story = { name: "Spacing", render: () => <SpacingPage /> };

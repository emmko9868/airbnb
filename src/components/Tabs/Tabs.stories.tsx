/* @ds-generated 7f8139407268b086 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Tabs (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Tabs } from "./Tabs";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { items: [{"id":"overview","label":"Overview","content":"One panel per tab. Use the arrow keys to move between tabs."},{"id":"tokens","label":"Tokens","content":"References semantic tokens only."},{"id":"policy","label":"Policy","content":"Guards G1–G16 check this."}], variant: "line", size: "md", orientation: "horizontal" },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "contained"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: { variant: "line" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-tabs")).toBeInTheDocument();
  },
};

export const Contained: Story = {
  args: { variant: "contained" },
};

/** Every Figma variant side by side, to compare with Figma — Variant × Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["line","contained"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["sm","md"] as const).map((size) => (
            <Tabs key={size} {...args} variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, selected)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

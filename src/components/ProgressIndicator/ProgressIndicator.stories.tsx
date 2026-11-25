/* @ds-generated 9acf2cb69dbb0101 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: ProgressIndicator (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { ProgressIndicator } from "./ProgressIndicator";

const meta = {
  title: "Components/ProgressIndicator",
  component: ProgressIndicator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { current: 1, steps: [{"id":"read","label":"Read Figma","description":"Collected via MCP"},{"id":"resolve","label":"Resolve three tiers","description":"L2a — semantic inferred"},{"id":"review","label":"Review","description":"35 inferred"},{"id":"apply","label":"Apply"}], size: "md", orientation: "horizontal" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-progressindicator")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

/** Every Figma variant side by side, to compare with Figma — Size × Orientation. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["horizontal","vertical"] as const).map((orientation) => (
            <ProgressIndicator key={orientation} {...args} size={size} orientation={orientation} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(complete, current, incomplete, error)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

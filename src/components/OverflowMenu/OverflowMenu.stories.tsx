/* @ds-generated d53aa0d736c050b5 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: OverflowMenu (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { OverflowMenu } from "./OverflowMenu";

const meta = {
  title: "Components/OverflowMenu",
  component: OverflowMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 440 } },
  },
  args: { items: [{"id":"regen","label":"Regenerate"},{"id":"diff","label":"Compare changes"},{"id":"remove","label":"Delete component","danger":true}], size: "md", align: "start", flipped: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    flipped: { control: "boolean" },
  },
} satisfies Meta<typeof OverflowMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    // document.body 로 렌더되므로 canvasElement 안에서는 찾을 수 없다.
    const canvas = within(document.body);
    void canvasElement;
    await expect(canvas.getByTestId("ds-overflowmenu")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

export const Lg: Story = {
  args: { size: "lg" },
};

export const Flipped: Story = { args: { flipped: true } };

/** Every Figma variant side by side, to compare with Figma — Size × Align. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md","lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["start","end"] as const).map((align) => (
            <OverflowMenu key={align} {...args} size={size} align={align} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, active, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

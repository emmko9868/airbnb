/* @ds-generated 6051faf7272ce1d3 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: RadioButton (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { RadioButton } from "./RadioButton";

const meta = {
  title: "Components/RadioButton",
  component: RadioButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Stack to generate", items: [{"value":"css","label":"Plain CSS"},{"value":"css-modules","label":"CSS Modules"},{"value":"tailwind","label":"Tailwind"},{"value":"shadcn","label":"shadcn/ui"}], defaultSelected: "css", orientation: "horizontal" },
  argTypes: {
    label: { control: "text" },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-radiobutton")).toBeInTheDocument();
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
};

/** Every Figma variant side by side, to compare with Figma — Orientation. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["horizontal","vertical"] as const).map((orientation) => (
        <div key={orientation} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <RadioButton {...args} orientation={orientation} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

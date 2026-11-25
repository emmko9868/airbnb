/* @ds-generated 1ca81258cb91ba3a — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Tile (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Tile } from "./Tile";

const meta = {
  title: "Components/Tile",
  component: Tile,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { children: "16 semantic tokens", details: "Role tokens that point to primitives. Components reference only this tier.", variant: "base", disabled: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["base", "clickable", "selectable", "expandable"] },
    disabled: { control: "boolean" },
    selected: { control: "boolean" },
  },
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: { variant: "base" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-tile")).toBeInTheDocument();
  },
};

export const Clickable: Story = {
  args: { variant: "clickable" },
};

export const Selectable: Story = {
  args: { variant: "selectable" },
};

export const Expandable: Story = {
  args: { variant: "expandable" },
};

export const Disabled: Story = { args: { disabled: true } };

export const Selected: Story = { args: { defaultSelected: true } };

/** Every Figma variant side by side, to compare with Figma — Variant. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["base","clickable","selectable","expandable"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Tile {...args} variant={variant} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, active, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

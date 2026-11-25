/* @ds-generated 753c06ee7d6672af — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Popover (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Popover } from "./Popover";

const meta = {
  title: "Components/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 360 } },
  },
  args: { trigger: "Token info", children: "This value was inferred. Reason: highest contrast against primary (4.6:1).", align: "top", caret: false },
  argTypes: {
    align: { control: "inline-radio", options: ["top", "bottom", "left", "right"] },
    caret: { control: "boolean" },
    open: { control: "boolean" },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  args: { align: "top" },
  play: async ({ canvasElement }) => {
    // document.body 로 렌더되므로 canvasElement 안에서는 찾을 수 없다.
    const canvas = within(document.body);
    void canvasElement;
    await expect(canvas.getByTestId("ds-popover")).toBeInTheDocument();
  },
};

export const Bottom: Story = {
  args: { align: "bottom" },
};

export const Left: Story = {
  args: { align: "left" },
};

export const Right: Story = {
  args: { align: "right" },
};

export const Caret: Story = { args: { caret: true } };

export const Open: Story = { args: { defaultOpen: true } };

/** Every Figma variant side by side, to compare with Figma — Align. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["top","bottom","left","right"] as const).map((align) => (
        <div key={align} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Popover {...args} align={align} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(open)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

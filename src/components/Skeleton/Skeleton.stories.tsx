/* @ds-generated 957fa44657d898c0 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Skeleton (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Skeleton } from "./Skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { lines: 3, variant: "text", animated: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "placeholder", "icon"] },
    animated: { control: "boolean" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { variant: "text" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-skeleton")).toBeInTheDocument();
  },
};

export const Placeholder: Story = {
  args: { variant: "placeholder" },
};

export const Icon: Story = {
  args: { variant: "icon" },
};

export const Animated: Story = { args: { animated: true } };

/** Every Figma variant side by side, to compare with Figma — Variant. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["text","placeholder","icon"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Skeleton {...args} variant={variant} />
        </div>
      ))}
    </div>
  ),
};

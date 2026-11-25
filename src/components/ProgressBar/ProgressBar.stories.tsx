/* @ds-generated 40a87c219f746a1b — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: ProgressBar (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { ProgressBar } from "./ProgressBar";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Token resolution", value: 68, size: "md", indeterminate: false, status: "active" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    indeterminate: { control: "boolean" },
    status: { control: "inline-radio", options: ["active", "finished", "error"] },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-progressbar")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

export const Indeterminate: Story = { args: { indeterminate: true } };

/** Every Figma variant side by side, to compare with Figma — Size × Status. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["active","finished","error"] as const).map((status) => (
            <ProgressBar key={status} {...args} size={size} status={status} />
          ))}
        </div>
      ))}
    </div>
  ),
};

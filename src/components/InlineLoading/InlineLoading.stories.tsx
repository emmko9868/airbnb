/* @ds-generated 6906053965b1598c — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: InlineLoading (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { InlineLoading } from "./InlineLoading";

const meta = {
  title: "Components/InlineLoading",
  component: InlineLoading,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { description: "Reading Figma", status: "active" },
  argTypes: {
    description: { control: "text" },
    status: { control: "inline-radio", options: ["active", "finished", "error", "inactive"] },
  },
} satisfies Meta<typeof InlineLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: { status: "active" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-inlineloading")).toBeInTheDocument();
  },
};

export const Finished: Story = {
  args: { status: "finished" },
};

export const Error: Story = {
  args: { status: "error" },
};

export const Inactive: Story = {
  args: { status: "inactive" },
};

/** Every Figma variant side by side, to compare with Figma — Status. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["active","finished","error","inactive"] as const).map((status) => (
        <div key={status} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <InlineLoading {...args} status={status} />
        </div>
      ))}
    </div>
  ),
};

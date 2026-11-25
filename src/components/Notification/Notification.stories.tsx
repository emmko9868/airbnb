/* @ds-generated 1057141c8ab395c1 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Notification (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Notification } from "./Notification";

const meta = {
  title: "Components/Notification",
  component: Notification,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { title: "19 tokens updated", children: "4 items need review.", tone: "info", variant: "inline", dismissible: false },
  argTypes: {
    tone: { control: "inline-radio", options: ["info", "success", "warning", "danger"] },
    variant: { control: "inline-radio", options: ["inline", "toast"] },
    dismissible: { control: "boolean" },
    title: { control: "text" },
  },
} satisfies Meta<typeof Notification>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { tone: "info" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-notification")).toBeInTheDocument();
  },
};

export const Success: Story = {
  args: { tone: "success" },
};

export const Warning: Story = {
  args: { tone: "warning" },
};

export const Danger: Story = {
  args: { tone: "danger" },
};

export const Dismissible: Story = { args: { dismissible: true } };

/** Every Figma variant side by side, to compare with Figma — Tone × Variant. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["info","success","warning","danger"] as const).map((tone) => (
        <div key={tone} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["inline","toast"] as const).map((variant) => (
            <Notification key={variant} {...args} tone={tone} variant={variant} />
          ))}
        </div>
      ))}
    </div>
  ),
};

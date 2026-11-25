/* @ds-generated f00b19f5a71f5e2b — `pnpm ds:gen` 이 만든 파일입니다.
   Figma: Badge (0:5200)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Badge } from "./Badge";

const FIGMA_URL =
  "https://www.figma.com/design/SAMPLEKEY123/?node-id=0-5200";

const meta = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
  },
  args: { tone: "neutral", children: "Badge" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "info", "success", "warning", "danger"] },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {
  args: { tone: "neutral" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-badge")).toBeInTheDocument();
  },
};

export const Info: Story = {
  args: { tone: "info" },
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

/** Every Figma variant side by side, to compare with Figma — Tone. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["neutral","info","success","warning","danger"] as const).map((tone) => (
        <div key={tone} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge {...args} tone={tone} />
        </div>
      ))}
    </div>
  ),
};

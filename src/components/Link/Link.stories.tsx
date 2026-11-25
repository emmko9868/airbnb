/* @ds-generated bdf1c6cef5079ffb — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Link (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Link } from "./Link";

const meta = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { href: "#", children: "Learn more about token tiers", variant: "default", size: "md", disabled: false, external: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "inline"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    disabled: { control: "boolean" },
    external: { control: "boolean" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-link")).toBeInTheDocument();
  },
};

export const Inline: Story = {
  args: { variant: "inline" },
};

export const Disabled: Story = { args: { disabled: true } };

export const External: Story = { args: { external: true } };

/** Every Figma variant side by side, to compare with Figma — Variant × Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["default","inline"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["sm","md"] as const).map((size) => (
            <Link key={size} {...args} variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, active, focus, visited)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

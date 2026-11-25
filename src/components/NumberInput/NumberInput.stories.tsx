/* @ds-generated b82d1be1356b501e — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: NumberInput (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { NumberInput } from "./NumberInput";

const meta = {
  title: "Components/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Items per page", defaultValue: 20, size: "md", hideSteppers: false, invalid: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    hideSteppers: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof NumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-numberinput")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

export const Lg: Story = {
  args: { size: "lg" },
};

export const HideSteppers: Story = { args: { hideSteppers: true } };

export const Invalid: Story = { args: { invalid: true } };

/** Every Figma variant side by side, to compare with Figma — Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md","lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <NumberInput {...args} size={size} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, invalid, readOnly)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

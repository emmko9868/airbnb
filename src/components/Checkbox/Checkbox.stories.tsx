/* @ds-generated 1cd6efc8d8c89bbb — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Checkbox (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Apply reviewed tokens only", indeterminate: false, invalid: false },
  argTypes: {
    indeterminate: { control: "boolean" },
    invalid: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-checkbox")).toBeInTheDocument();
  },
};

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Invalid: Story = { args: { invalid: true } };

/* Figma 의 State variant(hover, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

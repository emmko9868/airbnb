/* @ds-generated 1fa31eae0df2ff1e — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Slider (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Slider } from "./Slider";

const meta = {
  title: "Components/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Confidence threshold", min: 0, max: 100, defaultValue: 60, helperText: "Anything below this goes to review", disabled: false, hideTextInput: false, invalid: false },
  argTypes: {
    disabled: { control: "boolean" },
    hideTextInput: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-slider")).toBeInTheDocument();
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const HideTextInput: Story = { args: { hideTextInput: true } };

export const Invalid: Story = { args: { invalid: true } };

/* Figma 의 State variant(hover, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

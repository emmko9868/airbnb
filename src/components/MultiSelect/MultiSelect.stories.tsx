/* @ds-generated 5957fd91b10aef9f — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: MultiSelect (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { MultiSelect } from "./MultiSelect";

const meta = {
  title: "Components/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 560 } },
  },
  args: { label: "Tiers to generate", items: [{"value":"core","label":"core (20)"},{"value":"standard","label":"standard (20)"},{"value":"extended","label":"extended (19)"}], defaultValue: ["core"], type: "default", size: "md", disabled: false, invalid: false },
  argTypes: {
    type: { control: "inline-radio", options: ["default", "inline"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
  },
} satisfies Meta<typeof MultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { type: "default" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-multiselect")).toBeInTheDocument();
  },
};

export const Inline: Story = {
  args: { type: "inline" },
};

export const Disabled: Story = { args: { disabled: true } };

export const Invalid: Story = { args: { invalid: true } };

/** Every Figma variant side by side, to compare with Figma — Type × Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["default","inline"] as const).map((type) => (
        <div key={type} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["sm","md","lg"] as const).map((size) => (
            <MultiSelect key={size} {...args} type={type} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, invalid, readOnly)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

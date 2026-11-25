/* @ds-generated bd32508c5638c60b — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: CodeSnippet (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { CodeSnippet } from "./CodeSnippet";

const meta = {
  title: "Components/CodeSnippet",
  component: CodeSnippet,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { code: "--color-primary: var(--color-blue-500);\n--color-on-primary: var(--color-gray-50);", type: "single", disabled: false, wrapText: false },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multi", "inline"] },
    disabled: { control: "boolean" },
    wrapText: { control: "boolean" },
  },
} satisfies Meta<typeof CodeSnippet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  args: { type: "single" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-codesnippet")).toBeInTheDocument();
  },
};

export const Multi: Story = {
  args: { type: "multi" },
};

export const Inline: Story = {
  args: { type: "inline" },
};

export const Disabled: Story = { args: { disabled: true } };

export const WrapText: Story = { args: { wrapText: true } };

/** Every Figma variant side by side, to compare with Figma — Type. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["single","multi","inline"] as const).map((type) => (
        <div key={type} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <CodeSnippet {...args} type={type} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, expanded)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

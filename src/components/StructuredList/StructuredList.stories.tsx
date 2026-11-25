/* @ds-generated 4ccee6b4c1f65224 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: StructuredList (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { StructuredList } from "./StructuredList";

const meta = {
  title: "Components/StructuredList",
  component: StructuredList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { headers: ["Tokens","Source","Confidence"], rows: [{"id":"a","cells":["--color-primary","Inferred","0.40"]},{"id":"b","cells":["--color-bg","Inferred","0.55"]},{"id":"c","cells":["--color-blue-500","Declared","1.00"]}], label: "Token list", condensed: false, selectable: false },
  argTypes: {
    condensed: { control: "boolean" },
    selectable: { control: "boolean" },
  },
} satisfies Meta<typeof StructuredList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-structuredlist")).toBeInTheDocument();
  },
};

export const Condensed: Story = { args: { condensed: true } };

export const Selectable: Story = { args: { selectable: true } };

/* Figma 의 State variant(hover, focus, selected)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

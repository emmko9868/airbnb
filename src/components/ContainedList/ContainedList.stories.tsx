/* @ds-generated 564ca857c956e304 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: ContainedList (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { ContainedList } from "./ContainedList";

const meta = {
  title: "Components/ContainedList",
  component: ContainedList,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { title: "Needs review", items: [{"id":"1","label":"--color-primary","meta":"Inferred 0.40"},{"id":"2","label":"--color-on-primary","meta":"Inferred 0.55"},{"id":"3","label":"--color-overlay","meta":"Synthesized 0.30"}], variant: "on-page", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["on-page", "disclosed"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof ContainedList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnPage: Story = {
  args: { variant: "on-page" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-containedlist")).toBeInTheDocument();
  },
};

export const Disclosed: Story = {
  args: { variant: "disclosed" },
};

/** Every Figma variant side by side, to compare with Figma — Variant × Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["on-page","disclosed"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["sm","md","lg"] as const).map((size) => (
            <ContainedList key={size} {...args} variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

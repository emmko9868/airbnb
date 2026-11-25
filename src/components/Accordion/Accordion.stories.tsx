/* @ds-generated dae051d58547f532 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Accordion (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Accordion } from "./Accordion";

const meta = {
  title: "Components/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { items: [{"id":"a","title":"What are the three tiers?","content":"Hexcode → Primitive → Semantic. Developers use Semantic only."},{"id":"b","title":"When a tier is missing","content":"Whatever exists is used; missing tiers are generated."},{"id":"c","title":"How are guesses marked?","content":"Every value carries its source, confidence and reason.","disabled":true}], size: "md", align: "start", disabled: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    align: { control: "inline-radio", options: ["start", "end"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-accordion")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

export const Lg: Story = {
  args: { size: "lg" },
};

export const Disabled: Story = { args: { disabled: true } };

/** Every Figma variant side by side, to compare with Figma — Size × Align. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md","lg"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["start","end"] as const).map((align) => (
            <Accordion key={align} {...args} size={size} align={align} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, expanded)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

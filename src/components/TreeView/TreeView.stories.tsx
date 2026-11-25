/* @ds-generated 270d728ce9617676 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: TreeView (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { TreeView } from "./TreeView";

const meta = {
  title: "Components/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { label: "Token tiers", defaultExpanded: ["primitive"], nodes: [{"id":"primitive","label":"Primitive (29)","children":[{"id":"blue","label":"blue-50 … blue-900"},{"id":"gray","label":"gray-50 … gray-900"}]},{"id":"semantic","label":"Semantic (16)","children":[{"id":"primary","label":"primary"}]},{"id":"layout","label":"Layout (24)"}], size: "md", hideLabel: false, multiselect: false },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    hideLabel: { control: "boolean" },
    multiselect: { control: "boolean" },
  },
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sm: Story = {
  args: { size: "sm" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-treeview")).toBeInTheDocument();
  },
};

export const Md: Story = {
  args: { size: "md" },
};

export const HideLabel: Story = { args: { hideLabel: true } };

export const Multiselect: Story = { args: { multiselect: true } };

/** Every Figma variant side by side, to compare with Figma — Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["sm","md"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <TreeView {...args} size={size} />
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, selected, expanded)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

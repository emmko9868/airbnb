/* @ds-generated c2f979e60cb390c4 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: Modal (core)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Modal } from "./Modal";

const meta = {
  title: "Components/Modal",
  component: Modal,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { story: { inline: false, iframeHeight: 480 } },
  },
  args: { title: "Apply these changes?", children: "19 tokens will change. You can undo this.", defaultOpen: true, trigger: "Apply changes", variant: "default", size: "md" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "danger"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    open: { control: "boolean" },
    title: { control: "text" },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { variant: "default" },
  play: async ({ canvasElement }) => {
    // document.body 로 렌더되므로 canvasElement 안에서는 찾을 수 없다.
    const canvas = within(document.body);
    void canvasElement;
    await expect(canvas.getByTestId("ds-modal")).toBeInTheDocument();
  },
};

export const Danger: Story = {
  args: { variant: "danger" },
};

export const Open: Story = { args: { defaultOpen: true } };

/* Figma 의 State variant(open)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

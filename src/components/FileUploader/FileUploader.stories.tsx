/* @ds-generated 7a6837b15cc1cb06 — `pnpm ds:gen` 이 만든 파일입니다.
   기준선: FileUploader (standard)
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { FileUploader } from "./FileUploader";

const meta = {
  title: "Components/FileUploader",
  component: FileUploader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { variant: "dropArea", label: "Choose ds-source.json", helperText: "Design data exported from Figma", defaultFiles: [{"id":"1","name":"ds-source.json","size":48213,"status":"done"}], size: "md", disabled: false, multiple: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["button", "dropArea"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    multiple: { control: "boolean" },
  },
} satisfies Meta<typeof FileUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Button: Story = {
  args: { variant: "button" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-fileuploader")).toBeInTheDocument();
  },
};

export const DropArea: Story = {
  args: { variant: "dropArea" },
};

export const Disabled: Story = { args: { disabled: true } };

export const Multiple: Story = { args: { multiple: true } };

/** Every Figma variant side by side, to compare with Figma — Variant × Size. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["button","dropArea"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {(["sm","md","lg"] as const).map((size) => (
            <FileUploader key={size} {...args} variant={variant} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* Figma 의 State variant(hover, focus, invalid, readOnly)는 prop 이 아니다.
   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.
   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */

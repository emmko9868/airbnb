import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Button } from "./Button";

const FIGMA_URL =
  "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/?node-id=238-2188";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: { description: { component: "A button that runs the main action or command when clicked." } },
  },
  args: { variant: "primary", size: "large", children: "Button", onClick: fn() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "tertiary", "link"] },
    size: { control: "inline-radio", options: ["large", "small"] },
    isLoading: { control: "boolean" },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-button"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: { variant: "secondary" },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-button"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** Camera icon from Figma */
const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 10.1333C9.17821 10.1333 10.1333 9.17821 10.1333 8C10.1333 6.82179 9.17821 5.86667 8 5.86667C6.82179 5.86667 5.86667 6.82179 5.86667 8C5.86667 9.17821 6.82179 10.1333 8 10.1333Z" fill="currentColor"/>
    <path d="M6 1.33333L4.78 2.66667H2.66667C1.93333 2.66667 1.33333 3.26667 1.33333 4V12C1.33333 12.7333 1.93333 13.3333 2.66667 13.3333H13.3333C14.0667 13.3333 14.6667 12.7333 14.6667 12V4C14.6667 3.26667 14.0667 2.66667 13.3333 2.66667H11.22L10 1.33333H6ZM8 11.3333C6.16 11.3333 4.66667 9.84 4.66667 8C4.66667 6.16 6.16 4.66667 8 4.66667C9.84 4.66667 11.3333 6.16 11.3333 8C11.3333 9.84 9.84 11.3333 8 11.3333Z" fill="currentColor"/>
  </svg>
);

export const SecondaryWithIcon: Story = {
  args: { variant: "secondary", icon: <CameraIcon /> },
};

/** All Secondary states */
export const SecondaryStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button variant="secondary">Default</Button>
      <Button variant="secondary" icon={<CameraIcon />}>With Icon</Button>
      <Button variant="secondary" isLoading>Loading</Button>
      <Button variant="secondary" disabled>Disabled</Button>
    </div>
  ),
};

export const Tertiary: Story = {
  args: { variant: "tertiary" },
};

export const Link: Story = {
  args: { variant: "link" },
};

export const Small: Story = {
  args: { size: "small" },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-button"));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const FullWidth: Story = {
  args: { fullWidth: true },
  parameters: { layout: "padded" },
};

/** All variants side by side for comparison with Figma */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/** All sizes side by side */
export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button size="large">Large</Button>
      <Button size="small">Small</Button>
    </div>
  ),
};

/** All states for primary variant */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <Button>Default</Button>
      <Button isLoading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};

/** Primary variant — all Figma states for both sizes */
export const PrimaryStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, marginBottom: 8, color: "#666" }}>Full Width (large)</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Button variant="primary" size="large">Default</Button>
          <Button variant="primary" size="large" isLoading>Loading</Button>
          <Button variant="primary" size="large" disabled>Disabled</Button>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, marginBottom: 8, color: "#666" }}>Small</p>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Button variant="primary" size="small">Default</Button>
          <Button variant="primary" size="small" isLoading>Loading</Button>
          <Button variant="primary" size="small" disabled>Disabled</Button>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#999" }}>Hover, Pressed, Focus states require pointer/keyboard interaction</p>
    </div>
  ),
};

/** Full matrix: variants × sizes */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "grid", gap: 16 }}>
      {(["primary", "secondary", "tertiary", "link"] as const).map((variant) => (
        <div key={variant} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ width: 80, fontSize: 12 }}>{variant}</span>
          <Button variant={variant} size="large">Large</Button>
          <Button variant={variant} size="small">Small</Button>
        </div>
      ))}
    </div>
  ),
};

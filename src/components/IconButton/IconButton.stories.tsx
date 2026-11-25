import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { IconButton, ProfileIcon, SearchIcon, MenuIcon, NextIcon, PreviousIcon, RedirectIcon } from "./IconButton";

const FIGMA_URL =
  "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/?node-id=414-1896";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: { description: { component: "A round icon-only button for actions." } },
  },
  args: {
    label: "Profile",
    icon: <ProfileIcon />,
    variant: "primary",
    size: "L",
    onClick: fn(),
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary"] },
    size: { control: "inline-radio", options: ["L", "S"] },
    icon: { control: false },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", icon: <ProfileIcon /> },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-iconbutton"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Secondary: Story = {
  args: { variant: "secondary", icon: <ProfileIcon /> },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-iconbutton"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: { variant: "primary", disabled: true, icon: <ProfileIcon /> },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-iconbutton"));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** All icon types with Primary variant */
export const IconTypes: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
      <IconButton variant="primary" size="L" label="Profile" icon={<ProfileIcon />} />
      <IconButton variant="primary" size="L" label="Search" icon={<SearchIcon />} />
      <IconButton variant="primary" size="L" label="Menu" icon={<MenuIcon />} />
      <IconButton variant="primary" size="L" label="Next" icon={<NextIcon />} />
      <IconButton variant="primary" size="L" label="Previous" icon={<PreviousIcon />} />
      <IconButton variant="primary" size="L" label="Redirect" icon={<RedirectIcon />} />
    </div>
  ),
};

/** All states for Primary variant (5 Figma designs) */
export const PrimaryStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <IconButton variant="primary" size="L" label="Default" icon={<ProfileIcon />} />
        <div style={{ fontSize: 10, marginTop: 8 }}>Default</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <IconButton variant="primary" size="L" label="Hover" icon={<ProfileIcon />} className="hover-state" />
        <div style={{ fontSize: 10, marginTop: 8 }}>Hover</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <IconButton variant="primary" size="L" label="Pressed" icon={<ProfileIcon />} className="active-state" />
        <div style={{ fontSize: 10, marginTop: 8 }}>Pressed</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <IconButton variant="primary" size="L" label="Focus" icon={<ProfileIcon />} className="focus-state" />
        <div style={{ fontSize: 10, marginTop: 8 }}>Focus</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <IconButton variant="primary" size="L" label="Disabled" icon={<ProfileIcon />} disabled />
        <div style={{ fontSize: 10, marginTop: 8 }}>Disabled</div>
      </div>
    </div>
  ),
};

/** Focus state: Tab to the button and check the focus ring */
export const Focus: Story = {
  args: { variant: "primary", icon: <ProfileIcon /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId("ds-iconbutton");
    button.focus();
    await expect(button).toHaveFocus();
    await expect(button).toBeInTheDocument();
  },
};

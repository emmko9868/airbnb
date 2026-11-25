import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Navigation } from "./Navigation";

const FIGMA_URL =
  "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/?node-id=418-8282";

const meta = {
  title: "Components/Navigation",
  component: Navigation,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    design: { type: "figma", url: FIGMA_URL },
    docs: {
      description: {
        component:
          "An Airbnb-style search navigation bar with clickable sections and a search button.",
      },
    },
  },
  args: {
    onSectionClick: fn(),
    onSearch: fn(),
  },
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const whereSection = canvas.getByTestId("ds-navigation-section-where");
    await userEvent.click(whereSection);
    await expect(args.onSectionClick).toHaveBeenCalledWith("where");
  },
};

export const WithActiveSection: Story = {
  args: {
    activeSection: "checkin",
  },
};

export const SearchClick: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const searchBtn = canvas.getByTestId("ds-navigation-search");
    await userEvent.click(searchBtn);
    await expect(args.onSearch).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const whereSection = canvas.getByTestId("ds-navigation-section-where");
    await userEvent.click(whereSection);
    await expect(args.onSectionClick).not.toHaveBeenCalled();
  },
};

export const AllSections: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Navigation />,
};

export const TabNavigation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByTestId("ds-navigation");
    const buttons = navigation.querySelectorAll("button");

    await userEvent.tab();
    await expect(document.activeElement).toBe(buttons[0]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(buttons[1]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(buttons[2]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(buttons[3]);

    await userEvent.tab();
    await expect(document.activeElement).toBe(buttons[4]);
  },
};

import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { ServiceTab } from "./ServiceTab";

import iconAll from "../../../my-assets/icons/Service icons/Type=All.png";
import iconHomes from "../../../my-assets/icons/Service icons/Type=Homes.png";
import iconHotels from "../../../my-assets/icons/Service icons/Type=Hotels.png";
import iconExperiences from "../../../my-assets/icons/Service icons/Type=Experiences.png";
import iconServices from "../../../my-assets/icons/Service icons/Type=Services.png";

const FIGMA_URL =
  "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/Airbnb-UI-Kit--Community-?node-id=418-3150";

const meta = {
  title: "Components/ServiceTab",
  component: ServiceTab,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: { description: { component: "A selectable category tab — icon above label, Airbnb-style." } },
  },
  args: {
    label: "All",
    icon: iconAll,
    onClick: fn(),
  },
  argTypes: {
    icon: { control: false },
  },
} satisfies Meta<typeof ServiceTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "All", icon: iconAll },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-servicetab"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Selected: Story = {
  args: { label: "All", icon: iconAll, selected: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-servicetab"));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  args: { label: "All", icon: iconAll, disabled: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("ds-servicetab"));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** All 5 service categories */
export const AllCategories: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <ServiceTab label="All" icon={iconAll} selected />
      <ServiceTab label="Homes" icon={iconHomes} />
      <ServiceTab label="Hotels" icon={iconHotels} />
      <ServiceTab label="Experiences" icon={iconExperiences} />
      <ServiceTab label="Services" icon={iconServices} />
    </div>
  ),
};

/** States matrix: Default, Hover, Selected — on a dark background to match Figma */
export const StatesMatrix: Story = {
  parameters: {
    controls: { disable: true },
    backgrounds: { default: "dark" },
  },
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", padding: 24, background: "#222" }}>
      <div style={{ textAlign: "center" }}>
        <ServiceTab label="All" icon={iconAll} />
        <div style={{ fontSize: 10, marginTop: 8, color: "#aaa" }}>Default</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ServiceTab label="Homes" icon={iconHomes} className="hover-state" />
        <div style={{ fontSize: 10, marginTop: 8, color: "#aaa" }}>Hover</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <ServiceTab label="Hotels" icon={iconHotels} selected />
        <div style={{ fontSize: 10, marginTop: 8, color: "#aaa" }}>Selected</div>
      </div>
    </div>
  ),
};

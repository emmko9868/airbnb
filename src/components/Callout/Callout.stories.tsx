import type { Meta, StoryObj } from "@storybook/react";
import { expect, within } from "@storybook/test";
import { Callout } from "./Callout";

const meta = {
  title: "Components/Callout",
  component: Callout,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    variant: "propertyHighlight",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["propertyHighlight", "cancelation"] },
  },
} satisfies Meta<typeof Callout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PropertyHighlight: Story = {
  args: {
    variant: "propertyHighlight",
    children: (
      <>
        <strong>This is a rare find.</strong> Hope's place on Airbnb is usually fully booked.
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-callout")).toBeInTheDocument();
  },
};

export const Cancelation: Story = {
  args: {
    variant: "cancelation",
    title: "Your reservation",
    statusLabel: "CANCELED",
    propertyName: "tiny house, tiny farm",
    reservationCode: "Reservation code: XMPQKAPZ6D",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-callout")).toBeInTheDocument();
  },
};

export const CancelationWithImage: Story = {
  args: {
    variant: "cancelation",
    title: "Your reservation",
    statusLabel: "CANCELED",
    propertyName: "tiny house, tiny farm",
    reservationCode: "Reservation code: XMPQKAPZ6D",
    imagePlaceholder: (
      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='108' height='72' viewBox='0 0 108 72'%3E%3Crect fill='%23ddd' width='108' height='72'/%3E%3Ctext x='54' y='36' text-anchor='middle' dy='.3em' fill='%23717171' font-size='12'%3EImage%3C/text%3E%3C/svg%3E"
        alt="Property"
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
  },
};

/** Both Figma variants side by side for comparison. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Callout variant="propertyHighlight">
        <strong>This is a rare find.</strong> Hope's place on Airbnb is usually fully booked.
      </Callout>
      <Callout
        variant="cancelation"
        title="Your reservation"
        statusLabel="CANCELED"
        propertyName="tiny house, tiny farm"
        reservationCode="Reservation code: XMPQKAPZ6D"
      />
    </div>
  ),
};

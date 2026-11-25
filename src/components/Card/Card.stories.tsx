/* @ds-generated 4650abfccde1267b — `pnpm ds:gen` that made this file.
   Figma: Card (238:2378)
   Do not edit directly; edits will be overwritten on next generate. */
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, within, userEvent } from "@storybook/test";
import { Card } from "./Card";

const FIGMA_URL =
  "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=238-2378";

const meta = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    design: { type: "figma", url: FIGMA_URL },
    docs: { description: { component: "Property listing card with 6 variants from Figma." } },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    cardType: "default",
    title: "Groveland, California",
    subtitle: "Yosemite National Park",
    dates: "Oct 23 - 28",
    price: "289",
    rating: 4.91,
    isFavorite: false,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await expect(heartButton).toBeInTheDocument();
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

export const DefaultFavorite: Story = {
  args: {
    cardType: "default",
    title: "Groveland, California",
    subtitle: "Yosemite National Park",
    dates: "Oct 23 - 28",
    price: "289",
    rating: 4.91,
    isFavorite: true,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /remove from favorites/i });
    await expect(heartButton).toBeInTheDocument();
    await expect(heartButton).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

export const Sleep: Story = {
  args: {
    cardType: "sleep",
    title: "Bedroom 2",
    subtitle: "2 single beds",
    isFavorite: false,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

export const Reservation: Story = {
  args: {
    cardType: "reservation",
    title: "500 x 5 nights",
    subtitle: "Long stay discount",
    dates: "2/6/2023 - 2/11/2023",
    price: "440",
    originalPrice: "500",
    rating: 4.99,
    reviews: 337,
    guests: "1 guest",
    breakdownItems: [
      { label: "500 x 5 nights", value: "$2,500" },
      { label: "Long stay discount", value: "-$300", isSuccess: true },
      { label: "Cleaning fee", value: "$200" },
      { label: "Service fee", value: "$0" },
    ],
    total: "2,400",
    onReserveClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const reserveButton = canvas.getByRole("button", { name: /reserve/i });
    await expect(reserveButton).toBeInTheDocument();
    await userEvent.click(reserveButton);
    await expect(args.onReserveClick).toHaveBeenCalledTimes(1);
  },
};

export const Confirmation: Story = {
  args: {
    cardType: "confirmation",
    title: "Glacier Pines Cabin (New Hot Tub Installed!)",
    subtitle: "Entire cabin",
    price: "2,400",
    rating: 4.66,
    reviews: 110,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    await expect(canvas.getByText(/price details/i)).toBeInTheDocument();
    await expect(canvas.getByText(/your booking is protected/i)).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

export const Discount: Story = {
  args: {
    cardType: "discount",
    title: "Private room in San Francisco",
    subtitle: "Private Room & Balcony-Connected...",
    dates: "Oct 23 - 28",
    price: "120",
    originalPrice: "289",
    rating: 4.91,
    reviews: 484,
    isFavorite: false,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    await expect(canvas.getByText(/superhost/i)).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

export const Map: Story = {
  args: {
    cardType: "map",
    title: "Groveland, California",
    dates: "Apr 17-22",
    price: "289",
    rating: 4.91,
    isFavorite: false,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
  },
};

/* ── Interaction stories with spies ── */
export const WithCallbacks: Story = {
  args: {
    cardType: "default",
    title: "Groveland, California",
    subtitle: "Yosemite National Park",
    dates: "Oct 23 - 28",
    price: "289",
    rating: 4.91,
    isFavorite: false,
    onFavoriteClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const heartButton = canvas.getByRole("button", { name: /add to favorites/i });
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(1);
    await userEvent.click(heartButton);
    await expect(args.onFavoriteClick).toHaveBeenCalledTimes(2);
  },
};

export const ReservationWithCallbacks: Story = {
  args: {
    cardType: "reservation",
    title: "500 x 5 nights",
    subtitle: "Long stay discount",
    dates: "2/6/2023 - 2/11/2023",
    price: "440",
    originalPrice: "500",
    rating: 4.99,
    reviews: 337,
    guests: "1 guest",
    breakdownItems: [
      { label: "500 x 5 nights", value: "$2,500" },
      { label: "Long stay discount", value: "-$300", isSuccess: true },
      { label: "Cleaning fee", value: "$200" },
      { label: "Service fee", value: "$0" },
    ],
    total: "2,400",
    onReserveClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("ds-card")).toBeInTheDocument();
    const reserveButton = canvas.getByRole("button", { name: /reserve/i });
    await userEvent.click(reserveButton);
    await expect(args.onReserveClick).toHaveBeenCalledTimes(1);
  },
};

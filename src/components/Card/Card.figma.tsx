/* @ds-generated — Code Connect for Figma. Do not edit directly. */
import figma from "@figma/code-connect";
import { Card } from "./Card";

figma.connect(Card, "https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=238-2378", {
  props: {
    cardType: figma.enum("Card type", {
      "Default Card": "default",
      "Sleep Card": "sleep",
      "Reservation Card": "reservation",
      "Reservation Confirmation Card": "confirmation",
      "Discount Card": "discount",
      "Map Card": "map",
    }),
    title: figma.string("title"),
    subtitle: figma.string("subtitle"),
    dates: figma.string("dates"),
    price: figma.string("price"),
    originalPrice: figma.string("originalPrice"),
    isFavorite: figma.boolean("isFavorite"),
  },
  example: ({ cardType, title, subtitle, dates, price, originalPrice, isFavorite }) => (
    <Card
      cardType={cardType}
      title={title}
      subtitle={subtitle}
      dates={dates}
      price={price}
      originalPrice={originalPrice}
      isFavorite={isFavorite}
    />
  ),
});

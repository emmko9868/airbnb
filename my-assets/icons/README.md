# icons

Icons exported from Figma, **one SVG file per icon**. You can save them straight into `my-assets/` — `pnpm assets` moves small, square SVGs here. You can also save them here directly.

How to export from Figma

1. Select the icon (its frame, for example the 24×24 box — so every icon keeps the same size).
2. In the right panel, find **Export**, press **+**, and choose **SVG**.
3. Press **Export** and save the file into `my-assets/` (or this folder), then run `pnpm assets`.

Names

- Use lowercase words with dashes: `arrow-right.svg`, `cart.svg`. `pnpm assets` fixes names for you.

Using an icon

- Tell the AI which file to use, for example: *"Use my-assets/icons/cart.svg for the cart button."*
- The AI copies the exact shape from the file. It never draws an icon that isn't here.

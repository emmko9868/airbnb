# images

Pictures for your website: photos, illustrations and logos. `.png` `.jpg` `.jpeg` `.webp` `.gif` `.avif`, and SVGs that are not icons.

Save them straight into `my-assets/` and run `pnpm assets` — it moves pictures here. You can also save them here directly.

Names

- Lowercase words with dashes: `hero-photo.png`, `team-01.jpg`. `pnpm assets` fixes names for you.

Tips

- Big files make pages slow. If a picture is over 2 MB, export a smaller one (WebP or JPG).
- Only use pictures you are allowed to use.

Using a picture

- When you plan a page, tell the AI which file to use, for example: *"Use my-assets/images/hero-photo.png for the hero picture."*
- See them in Storybook under **Foundation → Images**.

# my-website/figma — pictures of your Figma screens

This folder keeps one picture of each Figma screen, so you can put your finished website next to it and compare.

**This is not a picture for your page.** Pictures that appear on the website go in `my-assets/images/`.

## Names

Use the same page name as in your page plan: one word that starts with a capital letter, without `Page` at the end.

| Page in the plan | Picture |
|---|---|
| Home | `Home.png` |
| Menu | `Menu.png` |

## The AI saves it (Figma MCP)

1. Open your file in the Figma desktop app and turn on **Dev Mode → Enable desktop MCP server**.
2. In Figma, select the screen frame and choose **Copy link to selection**.
3. In the Qwen chat, send the links and ask in your own words, for example **"Make my website from these Figma screens. Home: <link> Menu: <link>"**.
4. The AI checks the Figma connection first and saves the picture. When the approval box appears, choose **Yes, allow once**. If it works, the AI shows `Figma MCP: connected.` and `Saved: my-website/figma/Home.png`.

   It saves three files for each screen:

   - `Home.png` — the picture
   - `Home.json` — where it came from and its size
   - `Home.layers.xml` — layer names and sizes (the AI reads it to understand the structure)

   It never replaces a saved picture by itself.

Each screen uses 2 Figma MCP calls. Starter plans can use 20 calls a month.

## If the AI can't get the picture

First check the Figma connection (manual, chapter 4) and send the same message again. If it still does not work, export the picture yourself:

1. In Figma, select the screen frame.
2. In the right panel, under **Export**, choose **PNG** and **1x**, then click **Export**.
3. Save the file here with the page name, for example `my-website/figma/Home.png`.

## Compare when the website is done

When your website is done, the AI runs the compare step itself. It builds the website, takes a screenshot of each page at the Figma screen width, and makes `var/compare/<Page>/index.html`. The AI tells you that path. Open that file in your browser. You see Figma on the left and your site on the right, and you can lay one over the other.

There is no score. You decide with your own eyes. Fonts and browsers draw a little differently, so small differences are normal.

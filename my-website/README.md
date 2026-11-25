# my-website — your website

Your website is built here from eligible Storybook parts. Unchanged starter parts are ready to use. If you change a part, check it yourself with `pnpm ds:review <Name>` in a terminal before using that version on a page — it records that *you* checked it, so the AI must not do it for you.

Ask the AI in your own words. When it runs a kit command, an approval box appears: read it and choose **Yes, allow once**.

1. Finish your plan in `my-docs/specs/` — ask the AI "Are there any open questions left?" and it shows 0.
2. In the Qwen chat, say **"Make my website from my specs."** If you have Figma screens, send their links, for example **"Make my website from these Figma screens. Home: <link> Menu: <link>"**. The AI first checks the Figma connection and saves a picture of each screen (choose **Yes, allow once** when it asks). If it works, it shows `Figma MCP: connected.` See [`figma/README.md`](figma/README.md).
3. The AI writes a page plan, asks its questions with choices, and shows you a short summary in the chat. You don't open the plan file.
4. After you pick **"Approve revision N"** in the chat, the AI makes the pages (choose **Yes, allow once**). They appear in `my-website/pages/`, and their addresses (like `/` and `/menu`) go into `web.config.json`.
5. The AI fills in what each part shows and does, and runs the checks. Then say **"Open my site."** The AI starts it in the background and tells you the address. If that doesn't work, run `pnpm web:dev` in a terminal yourself.

6. If there are Figma pictures, the AI compares your site with them at the end and tells you the compare page (`var/compare/<Page>/index.html`). Open it in your browser and compare with your own eyes. There is no score. Small differences from fonts and browsers are normal.

Good to know

- This project already is your React app, and it already moves between page addresses (a router). The page command the AI runs connects the pages and addresses, and the build and deploying use them. The AI is not allowed to install a router, make a second app or a new folder — everything goes in `my-website/pages/`.
- If the AI does something else, say it again more clearly. Shortcut if that still fails: start your message with `/my-website`.
- Pages use unchanged starter parts or the exact changed versions you reviewed in Storybook. If a part or variant is missing, finish that component flow first.
- The pictures in `my-website/figma/` are only for comparing. Pictures that appear on your pages go in `my-assets/images/`.

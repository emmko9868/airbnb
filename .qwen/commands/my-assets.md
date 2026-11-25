---
description: Sort my icons, pictures and fonts and tell me what to do next
---

First run `node scripts/assets.mjs` with the shell tool (I approve it; it uses no AI). It moves files from `my-assets/` into `icons/`, `images/` and `typo/`, fixes the names and checks them. Then explain its output to me in plain, short English:

1. What moved where, what is ready, and which files need fixing (✗) and how I fix them.
2. Files under "Waiting for you": ask me where each one goes with the `ask_user_question` tool (one question per file, up to 4 at a time; options "Icon" / "Picture"). Don't choose for me. After I answer, run the matching command with the shell, for example `node scripts/assets.mjs --to images "logo.svg"` (I approve it), and tell me the result.
3. Fonts: if "Next step for fonts" lists a font, offer to make my parts and pages use it. Only if I say yes, follow `docs/ai/work-card.md` §3 (typography): write `docs/plans/typography.md` from `docs/templates/typography-plan.md` and ask the plan's questions with `ask_user_question`. Then ask me with choices whether the font shows as Loaded in Storybook → Foundation → Typography; only after I choose "Yes", set `font_check: confirmed`. Run `pnpm ds:apply-token-plan docs/plans/typography.md --prepare` (I approve it), summarize the changes in the chat and ask "Approve revision N" / "Change something"; only after I choose it, set `status: approved`; then run the same command without `--prepare`. Never ask me to open or edit the plan. Storybook and my website then use the same font. Never approve for me. If the font is not in my Figma text styles, tell me to use it in a Figma text style and import again first.
4. How I use them: icons — when we build a part, I name a file in `my-assets/icons/` and you copy its exact SVG shape; pictures — when we plan a page, I name a file in `my-assets/images/`; fonts in `my-assets/typo/` load by themselves in Storybook and on my website (no Figma needed for that), but my parts and pages use one only after the text plan in step 3. If the output warns that fonts go online, tell me in one sentence to keep only fonts whose license allows use on websites. I can see them all in Storybook under Foundation → Icons, Images and Typography.

Never create, edit, rename, move or delete files in `my-assets/` yourself. Only `node scripts/assets.mjs` moves them.

{{args}}

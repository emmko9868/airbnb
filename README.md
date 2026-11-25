# DS Starter — build your own design system

Turn your Figma design into a design system (colors, text, parts) with an AI helper, see it in Storybook, and build a website from it.

**Step-by-step guide (slides):** <https://blah-01.tail46233e.ts.net/manual/en> · 한국어: <https://blah-01.tail46233e.ts.net/manual/ko>

## 1. Install (once)

Before you start: VS Code 1.96 or newer, and the **Qwen Code Companion** extension (by qwenlm) connected to your Token Plan key — in the Qwen chat type `/auth` → **Token Plan** → **Singapore (International)** → paste your key. Details are in Part 2 of the guide.

Open this folder in VS Code, choose **Trust**, open **Terminal → New Terminal**, and run one line:

```bash
bash setup-local.sh
```

Windows:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1
```

Storybook opens at <http://localhost:6006>. Another day, tell the AI **"Open Storybook."** It starts Storybook in the background and tells you the address. If that doesn't work, run `pnpm storybook` in a terminal yourself (Windows: `pnpm.cmd storybook`) and keep that terminal open.

## 2. Your folders

| Folder | What goes in |
|---|---|
| [`my-docs/inbox/`](my-docs/inbox/) | Your notes about what you want to build — or fill in `inbox/brief.md`. The AI turns them into a short plan in `my-docs/specs/` and asks about anything missing |
| [`my-assets/`](my-assets/) | Drop icons, pictures and fonts here. They get sorted into `icons/`, `images/` and `typo/` |
| [`my-website/`](my-website/) | Your website pages, built by the AI from the plan you approve |


## 3. Working with the AI

Ask the AI in your own words in the Qwen Code chat. The AI runs the kit's commands for you. Each time, an approval box appears: read it and choose **Yes, allow once**.

| What you want | Say to the AI, for example |
|---|---|
| Turn your notes in `my-docs/inbox/` into a short plan (4 files in `my-docs/specs/`) | "Organize my documents into specs." |
| Answer its questions (same numbers) | "1. No pre-order for now. 2. Our Menu" |
| Check that no questions are left | "Are there any open questions left?" |
| Sort what you dropped in `my-assets/` | "Sort the files in my-assets." |
| Plan your website from `my-docs/specs/`, then fill in the pages | "Make my website from my specs." |

The AI doesn't guess: a missing fact becomes a question. If the AI does something else, say it again more clearly. Shortcut if that still fails: type `/my-docs`, `/my-assets`, `/my-website` or `/my-deploy` at the start of your message.

To build a part, send one line and a Figma link:

```
Build this Figma node as a Storybook component in this project.
https://www.figma.com/design/...?node-id=...
```

The AI writes a plan first and waits. Read it, then approve it yourself: **"Approve revision 1. Go ahead with this plan."**

To use your Figma colors and text styles, send your Figma link and say: **"Bring in the colors from this Figma file."** The AI runs the command (choose **Yes, allow once**). Storybook's **Foundation** pages update right away.

For the website: approve the page plan in the chat. The AI makes the pages, fills them in and runs the checks. Then say **"Open my site."** and the AI tells you the address (if that doesn't work, run `pnpm web:dev` in a terminal yourself). If you have Figma screens, send their links, for example **"Make my website from these Figma screens. Home: <link> Menu: <link>"**: the AI saves the screen pictures first and compares your site with them at the end (see `my-website/figma/README.md`). The starter parts can go on your pages right away. If you change a part, check it in Storybook and run `pnpm ds:review <Name>` in a terminal yourself before using it on a page — it records that *you* checked it, so the AI must not do it for you.

## 4. Put your website online (Vercel)

Deploying means putting your site on the internet, so anyone with the link can open it. We do it together in class. **The class uses way 2.** Way 1 is a choice for students who want it:

- **Way 2 — Vercel only (in class):** less to set up. You need a Vercel token (a secret key, like a password): Vercel → Account Settings → Tokens → Create, with Expiration around the day the class ends.
- **Way 1 — GitHub (optional):** your code also goes to your own GitHub repository (an online storage room for code), so every change is kept there. You set up GitHub in class. The only thing you type yourself is the one-time GitHub sign-in: `gh auth login`, then `gh auth setup-git`.

In the Qwen chat, say **"Put my site online."** (or `/my-deploy`). The AI runs every deploy command for you:

1. The first time, answer its choice questions (way, website or Storybook, project name).
2. Click **Yes, allow once** in each approval window.
3. Way 2, first time only: a browser window opens. Paste your Vercel token there and press **Save**. This computer remembers it. **Never paste the token into the AI chat.** If you did, delete it in Vercel and make a new one.
4. Check the **Preview** address the AI shows. Then choose **Put it online for everyone (Production)** to get your real address.

A deploy can take up to about 9 minutes. Fonts in `my-assets/typo` go online too, so use only fonts you may publish. To remove the saved token, say **"Forget my Vercel token"**.

More in [docs/vercel-deployment.md](docs/vercel-deployment.md) (Korean) and Part 6-3 of the guide. Ask the AI "Check if my site is ready to deploy." any time to see your setup.

## When you're stuck

- Part 9 of the guide, or [docs/manual/troubleshooting.en.md](docs/manual/troubleshooting.en.md)
- Ask your instructor with: your computer (Mac/Windows), what you asked the AI (or the exact command), and a screenshot of the whole error. Hide your API key.

## Files you don't need to open

`QWEN.md`, `AGENTS.md`, `CLAUDE.md`, `docs/ai/`, `docs/templates/`, `prompts/`, `.claude/`, `.qwen/`, `.ds/`, `src/docs/` and `scripts/` are used by the AI and the starter kit. Your parts live in `src/components/` — the AI edits them for you. `scripts/approve-starter-fix.mjs` and `pnpm ds:starter-baseline` are for instructors.

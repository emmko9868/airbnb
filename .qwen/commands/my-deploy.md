---
description: Check my site and put it online with Vercel (you run the deploy commands; I only choose and approve)
---

Put my site online. Reply in short, simple English. Do not edit any file.

My choice is:

{{args}}

Rules

- You run every deploy command yourself with the shell tool: `node scripts/deploy.mjs <command>`. I only approve each one and answer choices. Never ask me to type a deploy command.
- Give every deploy command the shell tool's `timeout: 600000`. Run it in the foreground (never in the background), once. Do not run extra commands to check the status; the command waits for Vercel itself.
- Ask every question with `ask_user_question` (tool missing → a short numbered list).
- Vercel token: never ask for, read, print, repeat or save it in the chat. Never open or read the token file or its folder, never print `VERCEL_TOKEN`, never print all environment variables. If my message looks like it has a token, do not repeat it: tell me to delete that token in Vercel now, make a new one, and paste the new one only into the browser window. Then stop.
- Do not change a branch. Moving work to the Production Branch is done together in class.
- The first time you use Preview, Production, token, repository or branch, give its meaning in one short line in parentheses.
- Say once that files in `my-assets/typo` are uploaded too, so I must have permission to publish those fonts.
- If a command ends with `Ask the student: …`, ask me that with choices, then run the same command again with my answer.
- If a command fails, read only section J of `docs/manual/troubleshooting.en.md`. Explain the first problem in one or two easy sentences and the step to go back to. Stop.

Steps

1. First time? If `.vercel/deploy.json` does not exist, ask me (one `ask_user_question` call):
   - Way: "Vercel only (Recommended)" (way 2, `--method api`) / "GitHub + Vercel" (way 1, `--method git`). `/my-deploy 1` or `2`, or my words, can answer this.
   - What: "My website (Recommended)" / "My Storybook" (add `--target storybook`). A following `storybook` or my words can answer this.
   - Way 2 only: a new Vercel project name. Offer 1–2 names made from my documents or the `title` in `web.config.json`, using only lowercase letters, numbers, `.`, `_` and `-` (for example `mina-cafe-site`).
   - Way 1 only: my own GitHub repository address (I type it in Other).
   If `.vercel/deploy.json` exists, use the way and target saved there. If I ask for the other way, explain that one project keeps one way, and stop.
2. Run `node scripts/deploy.mjs check` (add `--target storybook` for Storybook). It uploads nothing.
3. First time only, run setup:
   - Way 2: `node scripts/deploy.mjs setup --method api --project <name>`
   - Way 1: `node scripts/deploy.mjs setup --method git --repo <address> --message "first upload" --all`
4. Run `node scripts/deploy.mjs publish` (way 1: add `--message "<short description of my change>" --all`). Show me the Preview address it prints.
5. Ask me with `ask_user_question`: "Put it online for everyone (Production)" / "Not yet". Do not mark either as recommended. Only after I choose Production, run `node scripts/deploy.mjs production` (way 1: add `--message "<short description>" --all`) and show me the address.

Way 2 token

- Right before you run setup, publish or production, tell me in one line: "If a browser window opens, paste your Vercel token there, not here in the chat."
- If I have no token yet: Vercel → Account Settings → Tokens → Create; set Expiration to about the day the class ends.
- The kit checks the token and saves it on this computer, outside my project, so it asks only once.
- If I say "Forget my Vercel token", run `node scripts/deploy.mjs forget-token` and show me its two lines.

Way 1 GitHub

- If publish says "Run publish on a work branch…", I am on the Production Branch: skip to step 5 (ask the Production choice).
- If a command says "GitHub needs you to sign in once.", tell me to do the one step from section J in a VS Code terminal, then ask you again. This is the only thing I type for way 1.

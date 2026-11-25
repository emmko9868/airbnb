# Troubleshooting Guide — When You See These Messages

> The "message" lines are the real sentences in the starter kit's code (parts in `< >` change with the situation). Only the review command (`ds:review`, section G) still prints some messages in **Korean**, often followed by ` / ` and the English. Where a message is Korean only, the English meaning follows it. Qwen Code panel errors come from Alibaba's official FAQ.

## Read this first

### First, find where the error came from

| Where | What it looks like |
|---|---|
| A. Install script | The terminal where you ran `setup-local` the first time |
| B. Storybook | The `localhost:6006` page in your browser, or its terminal |
| C. Qwen Code panel | The AI chat in VS Code |
| D. Figma connection · colours and text | The Figma connection check (the AI runs `pnpm mcp:setup`), the `/mcp` screen, importing Figma colours (the AI runs `pnpm ds:figma`), applying colour/text plans (`ds:apply-token-plan`), making tokens (`ds:tokens`) |
| E. The AI's "Blocked:" messages | A sentence starting with "Blocked:" in the AI chat |
| F. Check commands | The terminal where you ran `ai:check` · `ai:verify` · `ds:guard` |
| G. Review command | The terminal where you ran `ds:review` |
| H. Catalog "page use blocked" | The parts list (catalog) or a page check result |
| I. Building pages | `ds:page` · `ai:check-page` · `web:build` · `web:figma` · `web:compare` |
| J. Deploying | "Put my site online" (the AI runs `node scripts/deploy.mjs`), or the browser page "Paste your Vercel token" |
| K. Your plan | "Organize my documents into specs" (the AI runs `pnpm specs`) |
| L. Icons, pictures and fonts | "Sort the files in my-assets" (the AI runs `pnpm assets`) |

### If it still doesn't work, send this

1. Your computer: Mac / Windows
2. The exact command you ran (or what you asked the AI)
3. A screenshot of the **whole** error screen (don't crop it)
4. **If your API key or Vercel token is visible, hide it**

### For instructors — 4 things to check first when a student asks

1. **Folder:** Is the folder open in VS Code `DS-Starter`, with `package.json` right there on the left? (If not, most commands fail.) Is that folder **outside OneDrive or any other sync folder** (for example Windows `C:\DS-Starter`, Mac `~/DS-Starter`)?
2. **pnpm version:** In a new terminal, does `pnpm --version` (Windows `pnpm.cmd --version`) show **`10.27.0`**? If not, see the `ERR_PNPM_BAD_PM_VERSION` item in A below.
3. **Where the error came from:** Which of A–L above? Start by telling apart the terminal, the AI chat and the browser.
4. **AI connection and credits:** If it's about the AI, does Qwen Code answer "Hi", and are credits left in Model Studio **Token Plan → My Subscriptions**?

> On Windows, type `pnpm.cmd` instead of `pnpm` in the commands below.

---

## A. Install script

**Message:** `The code command is missing. …`
- **Meaning:** The terminal can't find VS Code's `code` command, so it couldn't install the Qwen Code extension for you. It's not an error; the rest of the install keeps going.
- **Try:** Install `Qwen Code Companion` (by qwenlm) yourself from the VS Code Extensions view. On a Mac you can also run `⌘ + Shift + P` → `Shell Command: Install 'code' command in PATH`, then run the install again in a new terminal.

**Message:** `No working Node.js 22 or later was found. …` (Mac) / `Node.js 22 or later is required. Run this script again in a new terminal.` · `Node.js was just installed. Run this script again in a new terminal.` (Windows)
- **Meaning:** Node.js (the base program the tools run on) isn't ready yet. Often it was just installed and this terminal doesn't know about it.
- **Try:** Open a new terminal with the **+** at the top right and run the same install command again. If it still appears, quit VS Code completely, reopen it and try again.

**Message:** `npm prefix -g failed. …` (Windows: `npm.cmd prefix -g failed. …`)
- **Meaning:** npm (the install tool that comes with Node.js) isn't ready, or the terminal doesn't know where it is.
- **Try:** Run it again in a new terminal. If that fails, follow "After installing, a new terminal can't find a program" in [section 8 of the student manual](student-manual.en.md#8-faq--where-people-get-stuck).

### pnpm version

This project uses pnpm **10.27.0** (`packageManager` in `package.json`). The install script checks the version and installs this one if it differs.

**Message (a notice):** `Installing pnpm 10.27.0 (current: <old version, or none or failed to run>)` → `pnpm 10.27.0 OK (matches package.json)`
- **Meaning:** It installed the pnpm version the project needs and checked it. That's good.

**Message:** `ERR_PNPM_BAD_PM_VERSION` … `configured to use v10.27.0` … `current pnpm is v9.0.0` (the last version number differs per computer)
- **Meaning:** An older pnpm (for example 9.0.0) is already on the computer, so it stopped because it doesn't match the 10.27.0 this project requires. This happens when pnpm from an older starter kit or another class is still installed.
- **Try:**
  1. In a new terminal, run — Windows `npm.cmd install -g pnpm@10.27.0`, Mac `npm install -g pnpm@10.27.0`
  2. Open a **new terminal** and check that `pnpm --version` (Windows `pnpm.cmd --version`) shows `10.27.0`.
  3. If it does, run the install script again.
  4. If it still shows the old version, take a screenshot of `where.exe pnpm` (Windows) or `type -a pnpm` (Mac) and send it to your instructor. **Don't delete any other pnpm yourself.**

**Message:** `pnpm install failed. Run npm.cmd install -g pnpm@10.27.0, then run this script again.` (Mac: `npm install -g pnpm@10.27.0`)
- **Try:** Run the command it shows yourself in a new terminal, then run the install script again. If you get a permission error (EACCES), don't add `sudo`; take a screenshot and send it to your instructor.

**Message:** `pnpm version mismatch: need 10.27.0 / current <version>` + `pnpm in use: …` + a list of paths + `Make sure the npm global folder … comes before the paths above in PATH, then run this script again in a new terminal. Do not delete the other pnpm installs.`
- **Meaning:** 10.27.0 was installed, but the computer still finds an older pnpm somewhere else first (a path conflict). The install stopped.
- **Try:** Take a screenshot of the whole screen (especially the list of paths) and send it to your instructor. Don't delete any other pnpm.

**Message:** `Could not read packageManager in package.json. Unzip the project again and run this script again.`
- **Meaning:** The project files are damaged, or it was run from another folder.
- **Try:** Download the ZIP again, unzip it outside sync folders, and run it from that folder.

### OneDrive and sync folders

**Message (a warning; the install continues):** `Warning: OneDrive sync can slow the install down or lock files. Move the project to a folder outside OneDrive (for example C:\DS-Starter) if you can. The install continues.` (on Mac the example is `~/DS-Starter`)
- **Meaning:** The project is inside OneDrive. Syncing can make the install slow, or lock files so it fails.
- **Try:** If it finished fine you can keep using it, but if problems appear, stop Storybook (`Ctrl + C`), move the folder to `C:\DS-Starter` (Mac `~/DS-Starter`), reopen it in VS Code and run the install script again.

**Message (Windows):** `WinGet was not found. Install App Installer from the Microsoft Store, then run this script again.`
- **Try:** Install "App Installer" from the Microsoft Store, then run again.

**Message (Windows):** `<program> install failed. Check whether you need administrator rights or a restart, then run the same script again.`
- **Try:** If Windows asks "Do you want to allow this app to make changes…", click "Yes". If it asks you to restart, restart and run again.

**Message:** `Project package install failed.` / `Chromium (used for checks) failed to install. Check your network, then run the same script again.`
- **Meaning:** It couldn't download what it needs.
- **Try:** Check your internet and run the same command again. It reuses what it already has.

**Message:** `This script is for macOS. On Windows, run setup-local.ps1 instead.`
- **Try:** Run `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1`.

### Qwen Code for the terminal (CLI)

Class uses the VS Code extension by default, so even with the problems below **the rest of the install and the class go ahead as normal.** For using it in the terminal, see [student manual 3-1](student-manual.en.md#3-1-using-qwen-code-in-the-terminal-instead-of-the-extension-optional).

**Message (a notice):** `Qwen Code CLI is already installed. Skipping it and keeping your version.`
- **Meaning:** It's already installed, so it wasn't installed again. Not an error.

**Message:** `Qwen Code CLI install failed. The rest of the install continues.` + `Manual install: npm install -g @qwen-code/qwen-code@0.25.1` (Windows: `npm.cmd install -g …`)
- **Meaning:** It couldn't download Qwen Code for the terminal (maybe an internet or permission problem).
- **Try:** After setup finishes, run the manual install command it shows in a new terminal. If you get a permission error (EACCES), don't add `sudo`; take a screenshot and send it to your instructor.

**Message:** `Qwen Code CLI did not run. Check your PATH in a new terminal. The rest of the install continues.` + `Manual install: npm install -g @qwen-code/qwen-code@0.25.1`
- **Meaning:** It may be installed, but this terminal doesn't know where the `qwen` command is.
- **Try:** Open a new terminal and run `qwen --version` (if Windows blocks it, `qwen.cmd --version`). If it still isn't found, follow "After installing, a new terminal can't find a program" in [section 8 of the student manual](student-manual.en.md#8-faq--where-people-get-stuck), then run the manual install command.

**Message (a notice):** `Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops.`
- **Meaning:** A reminder shown at the end of every install. Don't call the AI automatically with `qwen -p`, scripts or loops; use it only when you chat with it yourself.

---

## B. Storybook

**What you see:** Storybook doesn't open in the browser.
- **Try:** Type `http://localhost:6006` in the address bar. If it's not running, ask the AI: "Open Storybook." The AI starts it in the background and tells you the address (unverified). If that doesn't work, open a new terminal in the `DS-Starter` folder and run `pnpm storybook` as a backup.

**Message:** `Project packages are not installed yet. For the first install, run bash setup-local.sh in this folder.` (Windows mentions `setup-local.ps1`)
- **Try:** Run the install command it shows first.

**What you see:** A pnpm error saying a command (like `mcp:setup` or `storybook`) can't be found.
- **Meaning:** The terminal opened somewhere other than the `DS-Starter` folder.
- **Try:** In VS Code, use **File → Open Folder** to open `DS-Starter`, then try again in a new terminal.

---

## C. Qwen Code panel (AI chat)

**Message:** `401` … `InvalidApiKey` / `invalid access token`
- **Meaning:** The API key or connection address is wrong.
- **Try:** Type `/auth` in the chat and check that you chose **Token Plan** (not Coding Plan or Standard API Key), the region is **Singapore (International)**, and you pasted the whole key without spaces before or after it.

**Message:** `429` … `insufficient_quota`
- **Meaning:** You used all this month's credits. The AI stops until the next month starts.
- **Try:** Check credits in Model Studio **Token Plan → My Subscriptions** and tell your instructor.

### The kit's checks are off

**What you see:** The AI says `The kit's checks are off. Run the install command again (it turns them on), reload VS Code, then start a new chat.` and stops. Or you typed `/hooks` in the Qwen chat and see `disabled (not approved)` next to the kit's checks.
- **Meaning:** The kit's checks (hooks) are off. If the AI works without them it can skip the rules, so it stops first.
- **Try:**
  1. In a new VS Code terminal, run the install command again (Mac `bash setup-local.sh`, Windows `powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1`). `The kit's checks are turned on for this folder (Qwen hooks approved).` means it worked.
  2. Run **Developer: Reload Window** from the Command Palette.
  3. Open a **new chat** in Qwen. If Qwen asks "This project wants to run hooks", click **Approve hooks**.
  4. Type `/hooks` again and check that it says `approved`.
- If the install says `You chose Keep disabled for the kit's checks. …`, you picked **Keep disabled** before. Pick **Approve hooks** in Qwen, or tell your instructor.
- If the install says `Could not turn on the kit's checks automatically. …`, take a screenshot and send it to your instructor.
- (For instructors) Cause: the Qwen Code 0.27.x extension shows no hook approval card for a folder trusted in VS Code, and without an approval record (`~/.qwen/hookApprovals.json`) it never turns the hooks on. So the install script registers the approval with the same fingerprint (`scripts/qwen-hooks-approve.mjs`). The AI is blocked from running that script.

### Other AI errors

**Message:** `504` / something like `overloaded`, or the answer takes very long
- **Meaning:** The server is busy. It's not your fault.
- **Try:** Wait about a minute and send it again. **Don't send the same request many times in a row** — each one uses credits. If it stays stuck, open a new chat.

**Message:** `404 model_not_found` / `403`
- **Meaning:** The model name is wrong, or your key can't use that model.
- **Try:** Pick another model from the `/model` list. If that doesn't help, tell your instructor.

**Message:** `Request timed out waiting for hook-execution-response`
- **Meaning:** You may have an older starter kit. The latest one shows the "Still reading the Figma design" or "Some checks did not run" notices instead of this error when reading Figma or checking takes long ([E](#figma-reading-and-check-time-notices-not-errors)).
- **Try:** Check when you downloaded the ZIP. If it was before the version date on the pre-class page, download the latest ZIP again (<https://github.com/DearKim/DS-Starter-Kit/releases/latest/download/DS-Starter.zip>), unzip it in a new folder and install. If you still see it on the latest version, take a screenshot and send it to your instructor.

**What you see:** You ask in your language, but it **answers in Chinese or another language.**
- **Meaning:** Nothing is broken. Qwen Code's **reply language** is set to another language. The reply language is separate from the UI language (the words on menus), and changing the UI language can change it too. Korean isn't in the UI language list.
- **Try:**
  1. In the chat box, type `/language output auto` (answers in the language you typed) or `/language output English` / `/language output Korean` (always that language).
  2. Open a **new chat** and ask again.
  3. If you changed the UI language, do steps 1–2 again.
  4. If the command doesn't work in the extension chat, run `qwen` yourself in a new terminal in the `DS-Starter` folder, type the same command, close Qwen in the terminal, and reopen the extension panel ([student manual 2-7](student-manual.en.md#2-7-when-qwen-answers-in-chinese-or-another-language)).
  - The confirmation shown after the command is unverified.

**What you see:** You asked in your own words (for example "Organize my documents into specs"), but the AI **does something else or skips its steps**: it doesn't check the status first, or it writes from what it remembers.
- **Meaning:** The kit tells the AI which steps to follow when your message sounds like one of the kit's jobs, but the AI decides in the end. When a file is open, VS Code also puts it in front of your message (for example `@my-docs/specs/tasks.md`).
- **Try:** Open a **new chat**, so the AI reads your files again instead of remembering old ones, and say it again more plainly. If it still does something else, use the shortcut command for that job ([student manual 3-2](student-manual.en.md#3-2-your-3-folders-and-what-to-tell-the-ai)). If a file is open, click its name next to the chat box so it turns grey (**Excluded**), or close the file.

**Message:** `Shell command failed: POST /session/:id/shell: Direct session shell is disabled for this daemon`
- **Meaning:** You sent a chat message that starts with `!` (for example `!pnpm ds:page …`). The Qwen Code extension in VS Code doesn't run `!` commands from the chat box, and no setting turns this on. Nothing was run.
- **Try:** Don't use `!`. Ask the AI in your own words instead (for example "I approve the page plan. Make my pages."). The AI runs the command itself and you click `Yes, allow once` in the permission prompt. Since nothing ran, you can simply ask again.

**What you see:** The AI asks a question, but **no choices appear** — it only writes the question as text.
- **Meaning:** The AI should ask with choices (a short list of answers to pick from), but sometimes it doesn't, or the choice tool isn't working. Nothing is broken. (unverified: how the choices look in the Qwen extension)
- **Try:** Tell the AI: **"Ask me with choices."** If it still doesn't show any, answer in the chat with the question numbers, for example `1. Leave it out for now 2. Our Menu`. To approve a plan without choices, write: **"Approve revision 1. Go ahead with this plan."** You never need to open the plan file.

---

## D. Figma connection

**Message:** `Figma MCP settings are ready, but the server did not answer. Storybook still starts.` + `In Figma Desktop, open a design file and turn on Shift+D → Enable desktop MCP server.`
- **Try:** ① Open a design file in the Figma **desktop app** ② Press `Shift + D` for Dev Mode ③ Turn on **Enable desktop MCP server** ④ Ask the AI: "Check the Figma connection." (the AI runs `pnpm mcp:setup`; permission prompt → `Yes, allow once`)
- **It worked if** you see `Figma MCP connection: figma-desktop connected`.

**Message:** `Type /mcp in the chat, approve figma-desktop, then start a new chat.` (said by the AI)
- **Meaning:** The Figma connection isn't allowed in this folder yet, so the AI stopped instead of reading Figma. It doesn't carry on with the sample colours.
- **Try:** Type `/mcp` in the chat, approve `figma-desktop`, then open a new chat and send the same request again.

**Message:** `You have used up your Figma MCP limit. …`
- **Meaning:** Figma's limit on how often the AI reads your design was reached. Starter plans and View or Collab seats get 20 reads a month; the Education plan and Professional Full or Dev seats get 200 a day.
- **Try:** Wait until the limit resets, or tell your instructor. We recommend the Education plan (student verification).

**What you see:** In Qwen Code's `/mcp`, `figma-desktop` says **"Needs approval"**.
- **Meaning:** The first time, a person has to allow the connection.
- **Try:** Select figma-desktop in the list and approve it. Then open a new chat.

**Message:** `<file> is not valid JSON. Fix it and try again. Your existing settings were not changed.`
- **Meaning:** A settings file (`.qwen/settings.json` or `.mcp.json`) got garbled.
- **Try:** Don't edit it yourself. Take a screenshot and send it to your instructor.

### Importing Figma colours (the AI runs `pnpm ds:figma`)

When you send your first Figma link, a part link with new colours, or say "Import my Figma colours.", the AI runs this command **itself**. You only press the permission prompt ([student manual 5-0](student-manual.en.md#5-0-bringing-in-your-figma-colours--the-ai-does-it-first)).

**Message (a notice, not an error):** `First import: your Figma colors replace the sample colors.`
- **Meaning:** This was the first import. The sample colours were replaced with your Figma colours.

**Message (a notice, not an error):** `Merged with the variables imported before …` followed by `Added: <names>` · `Changed: <name> <old value> → <new value>` · `Kept: <number>`
- **Meaning:** The colours were **merged** with the ones you brought in before. `Added` = new colours, `Changed` = colours whose value changed in Figma (the role stays), `Kept` = how many colours weren't in this link but were kept. `none` means nothing.

**Message (a notice, not an error):** `<node>: <number> variables — from the cached read, 0 Figma calls`
- **Meaning:** The design read a moment ago (within 10 minutes) was reused, so **no Figma calls were used.**

**Message:** `BLOCKED_INPUT: Variable name or value conflicts: …`
- **Meaning:** In what was just read from Figma, two colours have the same name but different values. Your saved colours were not changed.
- **Try:** In Figma, tidy the clashing variable names into one, then ask the AI to import again. If you're unsure, take a screenshot and show your instructor.

**Message (a notice, not an error):** `Text: the starter defaults stay. If you do not change them, you need no text plan and no extra steps.` — followed by `Only if you want to change them: …` and `The original text styles are kept under typography in .ds/figma-variables.json. …`
- **Meaning:** **The colours were imported, and text keeps the starter defaults.** Figma's text settings (font, size, line spacing) aren't changed automatically. Nothing is broken and there's nothing to do.
- **Try:** Leave it and continue with colours by following the `Next: the AI runs pnpm ds:tokens …` line. Only if you want your Figma text styles, follow [section 5-2 of the student manual](student-manual.en.md#5-2-changing-text-styles-font-size-line-spacing--optional).

**Message (a notice):** `Text: you already have an approved text choice. ds:tokens checks the source and default token hashes again.`
- **Meaning:** You changed text before, so the next `pnpm ds:tokens` checks whether the Figma original is still the same. If it changed, it stops with a "text plan" message below.

**Message (a notice, not an error):** `Shadow converted: <name> → <value>` (from `pnpm ds:figma` and `pnpm ds:tokens`)
- **Meaning:** A Figma shadow (Effect) was turned into a shadow value the web can use. That's good.

**Message (a notice):** `Shadow needs review: <name> — <reason> It was left out of the tokens. The original value is kept in raw.` (in `ds:tokens` it ends with `Check the original value.`)
- **Meaning:** One shadow couldn't be converted automatically, so **only that shadow was left out** and everything else went ahead. The reason is `<type>: This Effect cannot be read. Check the original value.` or `Check the Effect's offset, blur and spread numbers. Blur cannot be negative.` Colour work isn't blocked.
- **Try:** If you really need that shadow, check its settings in Figma (blur isn't negative, it's a normal shadow type) and tell your instructor. If you won't use it, leave it.

**Message:** `Failed: CSS generation blocked: <variable> — the token value is not one safe CSS value. …` (from `pnpm ds:tokens`)
- **Meaning:** A token value wasn't safe to put into the web style file (CSS), so it stopped without making tokens.
- **Try:** Don't fix it yourself. Take a screenshot of the whole screen and send it to your instructor.

### Colour and text plans — the header and `source_url`

The colour role plan (`docs/plans/tokens.md`) and the text plan (`docs/plans/typography.md`) have a fixed header at the top (between the `---` lines). Errors from `pnpm ds:apply-token-plan` all start with `Token plan rejected: `.

**Message:** `Token plan rejected: Unknown plan metadata key "<field>". Allowed keys for a <kind> plan: …`
- **Meaning:** The header has a field this plan doesn't use — for example `source_kind` or `source_ref`, which belong to component plans.
- **Try:** Ask the AI to delete that line and keep only the allowed keys listed in the message, then prepare the plan again (it runs `--prepare`).

**Message:** `Token plan rejected: Line <n> of the plan metadata has the wrong format: "<line>". Write it as "key: value".` / `Token plan rejected: Plan metadata key "<field>" appears more than once. Write each key only once.`
- **Try:** Ask the AI to fix the line the message points to as `key: value`, or to keep only one of the repeated field.

**Message:** `Token plan rejected: The token plan has no metadata block (the --- lines at the top). Start from the template.` / `Token plan rejected: Check kind, revision and open_questions in the plan metadata. Every key must be there.`
- **Meaning:** The header is missing, or `kind`, `revision` or `open_questions` is missing or not a number.
- **Try:** Ask the AI to fix it to the template format (`docs/templates/token-plan.md` or `typography-plan.md`).

**Message:** `Token plan rejected: source_url is not a valid Figma node link, or it has no node-id. Put the link of the imported Figma node in source_url (example: …).`
- **Meaning:** `source_url` has only a Figma **file** link, or the link is malformed. It needs **the node link you imported with** (an address containing `node-id=`).
- **Try:** Ask the AI to put the address shown in `(example: …)` at the end of the message into `source_url`. It's built from the file and node you actually imported.

**Message:** `Token plan rejected: The Figma file in source_url is not the imported Figma file "<file key>". …` / `Token plan rejected: The Figma node in source_url is not one of the imported nodes (<numbers>). …`
- **Meaning:** The Figma link in the plan doesn't match the file or node you imported with `pnpm ds:figma`.
- **Try:** Ask the AI to use the example address at the end of the message. If you meant a different file, send that file's link and ask the AI to import it first.

### Colour role plan (`pnpm ds:apply-token-plan` · `docs/plans/tokens.md`)

If the colour plan's table (role · student primitive · imported Figma node number · raw value · reason) has a problem, the message tells you **which role and which cell**.

**Message:** `Token plan rejected: <role>: there is no primitive "<name>" in your Figma. Write one of the imported color primitive names: …`
- **Meaning:** The colour name in the table isn't in the colours you imported.
- **Try:** Show the message to the AI. It asks you with choices from the list in the message; pick the right name.

**Message:** `Token plan rejected: <role>: the raw value "<value>" is not the value of primitive "<name>", which is "<actual>". Copy the source value exactly.`
- **Try:** Ask the AI to change the raw value to the actual value in the message.

**Message:** `Token plan rejected: <role>: Figma node "<value>" is not one of the imported nodes (<numbers>). Write one of the nodes in figma-variables.json. Variable ids are not allowed.` (or `… has the wrong format. Write an imported Figma node number (example: 0:1). …`)
- **Meaning:** The node cell has a variable name like `figma-white`, or a node number you didn't import.
- **Try:** Ask the AI to use one of the node numbers in the message (for example `0:1`).

**Message:** `Token plan rejected: <role>: the reason is empty. Write the source evidence that links the role to the primitive, or why the AI suggested it.`
- **Try:** Ask the AI to fill in the reason. You should be able to understand from its summary why that role uses that colour.

**Message:** `Token plan rejected: Duplicate, already declared, or invalid role: <role>` / `Token plan rejected: Check the plan for undecided items (TODO, REPLACE, TBD) and check the mapping table.`
- **Meaning:** The same role is written twice, a role already in Figma is written again, or blanks like `TODO`, `REPLACE` or `TBD` (or the Korean `미확정` / `미답변`) remain.
- **Try:** Ask the AI to tidy the table and prepare the plan again (it runs `--prepare`).

> If the AI proposed colour roles that aren't declared by name in Figma, the first draft of the colour plan should normally have at least one question (`open_questions: 1` or more). If the AI wrote `open_questions: 0` with no questions, don't just trust it — check the roles and reasons in the AI's summary one by one ([student manual 2-6](student-manual.en.md#2-6-the-permission-prompt-for-edits-and-commands)).

### Text plan (`pnpm ds:apply-token-plan docs/plans/typography.md` · `pnpm ds:tokens`)

Errors from `ds:apply-token-plan` start with `Token plan rejected: `, and errors from `ds:tokens` start with `Failed: `. Text plan problems then add `Text style plan: …`. Header and `source_url` errors are the same as in "Colour and text plans" above.

**Message:** `Failed: Text style plan: The source or base tokens behind the saved text style choices changed. Approve the text style plan again.`
- **Meaning:** You imported Figma again after changing text, so the original no longer matches the old approval. Nothing is broken.
- **Try:** Tell the AI: "Approve the text plan again." The AI makes a new revision and prepares it again (`--prepare`) → you pick **"Approve revision N"** → the AI applies it. To go back to the default text styles, run `pnpm ds:reset-typography` yourself (see "Resetting text" below).

**Message:** `Token plan rejected: Text style plan: The student must check that the font is installed, and know that the browser shows a fallback font if it is not.`
- **Try:** Check that the font shows as **Loaded** in Storybook → Foundation → Typography (its file is in `my-assets/typo/`) or is your computer's system font. Then tell the AI "The font shows as Loaded." (or pick **Yes** when it asks with choices), and ask it to run it again.

**Message:** `Token plan rejected: Text style plan: Only a plan in review (status: review-required) can be prepared. It is never approved automatically.`
- **Meaning:** The plan was already approved, so it can't be prepared again as it is.
- **Try:** If you want to change it, tell the AI what to change. It makes a new revision and prepares it again.

**Message:** `Token plan rejected: Only a plan the student approved, with 0 open questions, can be applied.` / `Token plan rejected: The plan content hash does not match. Review it as a new revision.`
- **Meaning:** You haven't picked "Approve revision N" yet, or questions remain. Or the plan changed after it was prepared.
- **Try:** Answer every question, ask the AI to prepare it again, read its summary, pick **"Approve revision N"**, and ask the AI to apply it.

**Message:** `Token plan rejected: Text style plan: The text style source or base token hash does not match. Review it as a new revision.`
- **Meaning:** The Figma original or the colour tokens changed after you prepared it.
- **Try:** Ask the AI to make a new revision and start again from prepare. Then approve it again with the choice.

**Message:** `Token plan rejected: Text style plan: Answer the plan's questions and check the source values first.` / `… List at least one existing token to change. If you change nothing, you don't need a plan.` / `… Unknown, new, or duplicate token, or the wrong field for it: <token>` / `… Check the real font name. A reference name or custom CSS is not a font.` / `… A line height with an unknown unit needs the unit the student checked (percent, px or multiplier) and a reason.`
- **Meaning:** The plan's table isn't filled in, names a text token that can't be changed, or the font name or line-height unit isn't confirmed.
- **Try:** Show the message to the AI and fix the plan together. Only existing text token values can change. If you're not changing text, you don't need a plan.

**Message:** `Token plan rejected: Text style plan: Import your Figma first.`
- **Try:** Import Figma first. Send your Figma link and ask the AI: "Bring in my Figma colours." (the AI runs `pnpm ds:figma`)

### Resetting text (`pnpm ds:reset-typography`)

This command puts the text styles you changed back to the starter defaults ([student manual 5-2](student-manual.en.md#5-2-changing-text-styles-font-size-line-spacing--optional)). **Run it yourself in the terminal** and type the confirmation phrase `reset text styles`. Errors start with `Text style reset stopped: `.

**Message:** `Text style reset stopped: The student must run this themselves in an interactive terminal. Text style reset is refused from an AI shell, a pipe or a redirect.`
- **Meaning:** The AI ran it for you, or it was run in a way you can't type into.
- **Try:** Open VS Code's **terminal** yourself and type the command. Don't ask the AI.

**Message:** `Text style reset stopped: Usage: pnpm ds:reset-typography (no auto-approve options)`
- **Meaning:** You added something after the command. It takes nothing after it.
- **Try:** Type just `pnpm ds:reset-typography`.

**Message (a notice):** `Text style reset canceled. Nothing was changed.`
- **Meaning:** You typed something other than `reset text styles` at the confirmation (it must match exactly, including the spaces). Nothing changed.
- **Try:** If you really want to reset, run it again and type `reset text styles` exactly.

**Message (a notice):** `Text styles already use the defaults. Nothing was changed.`
- **Meaning:** You haven't changed the text, so there's nothing to do. Not an error.

**Message:** `Text style reset stopped: The Figma source is missing, so we cannot check that your colors are kept. Restore the source and run this again.`
- **Meaning:** The imported Figma file is missing, so it stopped rather than risk your colours.
- **Try:** Ask the AI to import Figma again ("Bring in my Figma colours again." with your link; the AI runs `pnpm ds:figma`), then run the reset yourself again. If unsure, tell your instructor.

**Message:** `Text style reset stopped: Another text style reset is running, or an old lock file was left behind. Existing files are kept.` / `Text style reset stopped: Inputs, choices or generated files changed while you were confirming. Review again.`
- **Meaning:** Another task (including the AI) was writing the same files. Nothing was changed.
- **Try:** Stop the other terminal or AI work and run it again. If the lock message keeps appearing, take a screenshot and send it to your instructor.

**Message:** `Text style reset stopped: Token regeneration failed: …` / `Text style reset stopped: Token inputs changed during regeneration.`
- **Meaning:** Something went wrong while rebuilding with the defaults, so **it put everything back the way it was.**
- **Try:** Take a screenshot of the whole screen and send it to your instructor.

**Message:** `Text style reset stopped: Text style reset needs tokenValue/tokenName=figma ownership.` / other messages about reset paths (for example `… Reset paths must be inside the project.`)
- **Meaning:** The project settings aren't what this command expects.
- **Try:** Don't fix it yourself. Take a screenshot and send it to your instructor.

**Message:** `Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server. …`
- **Try:** Follow the Figma connection order above (desktop app → open the file → Dev Mode → turn on MCP), then ask the AI to try again.

**Message:** `The link has no node-id. Use a link to a node, or add --all-pages.`
- **Meaning:** The Figma link points to the whole file. It needs a link to a specific part (a node).
- **Try:** In Figma, select the frame, use **Copy link**, and use that address (it contains `node-id=`).

**Message:** `You have used up your Figma MCP limit. …`
- **Meaning:** You've used up Figma's daily (or monthly) number of requests.
- **Try:** Wait until the limit resets, then ask the AI again. Don't repeat the request.

**Message:** `BLOCKED_INPUT: Variable name or value conflicts: …`
- **Meaning:** Figma has colour variables with the same name but different values.
- **Try:** Take a screenshot and send it to your instructor. The variable names in Figma may need tidying.

---

## E. "Blocked:" messages in the AI chat

These are **safety guards, not breakdowns.** They stop the AI when it tries to do something it shouldn't.

> Guard messages also name the **kit command the AI runs itself** (for example `pnpm ds:figma` for colours, `pnpm ds:apply-token-plan` for colour roles after you approve). The AI runs it and you only press the permission prompt. If the AI asks you to type a command, edit a file or turn off a protection, don't — tell your instructor.

**Message:** `Blocked: do not edit <file>. This is a kit file. If a kit command fails with an error you cannot fix by following its message, stop and tell the student to show the error to the instructor.`
- **Meaning:** The AI tried to change the kit itself (check programs, AI instructions, settings) and was stopped. The kit isn't changed.
- **Try:** If the AI stops and shows an error, take a screenshot and show your instructor.

**Message:** `Blocked: docs/plans/… — a new plan cannot start as approved. …` / `… approving a plan may change only the status: line. …` / `… this plan is already approved. To change it, set status: review-required and raise revision by 1 …`
- **Meaning:** The AI tried to mark a plan as approved without your approval. You approve with the choice.
- **Try:** Read the AI's summary and, if it's right, pick **"Approve revision N"**. If an approved plan changes, the AI summarizes the new revision and asks again.

**Message:** `Blocked: <file> cannot be changed without an approved plan.` + `There is no MD plan. …`
- **Meaning:** Before changing a part, the AI must write a plan and get your OK.
- **Try:** Answer the AI's questions (pick a choice, or type your own in Other), read its short summary in the chat, and if it's right pick **"Approve revision N"**. You don't open the plan file.

**Message:** `Blocked: <file> cannot be changed without an approved page plan.`
- **Meaning:** Pages also need an approved page plan first.
- **Try:** Answer the questions and approve with the choice, as above.

**Message:** `Blocked: do not edit <file>. Token CSS is generated by pnpm ds:tokens.` (or the same sentence about Storybook docs, `.ds/` or `.claude/rules`)
- **Try:** Tell the AI "Don't edit generated files; follow the normal steps." If it keeps trying, tell it to stop and let your instructor know.

**Message:** `The work is not finished. Ask the open Q&A questions with ask_user_question choices, summarize the plan in the chat (never ask the user to open the plan file), ask for approval with a choice, and stop. …`
- **Meaning:** The plan still has unanswered questions, or you haven't approved it yet.
- **Try:** Answer the AI's questions (pick a choice, or type your own in Other). Then read its summary and pick **"Approve revision N"**.

**Message:** `The same check failed 3 times: <kind>. Stop now. Do not change the plan or the code again for this. Tell the student in one line what is done and say: "Please show this screen to the instructor."` (`<kind>` is a check name such as `nested-part`, `shared-style`, `px-literal`, `icon-path` or `play-text`) — or `The plan revision was already raised 2 times since the student's last message: plan-revision. Stop now. …`
- **Meaning:** The same check failed 3 times in a row (or the AI changed its plan again and again), so the kit stopped the AI on purpose. Until you send a new message, the AI can't change that part or its plan. Nothing is broken, and the AI isn't going round in circles using up credits.
- **Try:** Take a screenshot and **show it to your instructor.** Don't approve a new plan revision just to make the check pass. After the instructor has looked, send a new message (for example "Try again.") and the AI can try again.

**Message:** `Some problems from the automatic checks are still not fixed. Ask the AI in your own words to run the checks again (it runs pnpm ds:guard), and look at the screen.`
- **Try:** Don't repeat the same request. Ask the AI: "Run the design rule check again and show me the result." Take a screenshot of the result and send it to your instructor.

**Message:** `Please start a new chat (+) for this part. This chat already worked on <Part>, so every step here would cost much more.`
- **Try:** Press `+`, open a new chat, and send the same new part request again. The kit already read its Figma design.

### Figma reading and check time notices (not errors)

Qwen Code has to finish reading Figma and running automatic checks within a minute. When time runs out, the AI tells you one of the messages below and stops. **These aren't errors.** It stops on purpose so it doesn't guess the design.

**Message:** `Still reading the Figma design. Send the same request again in 1–2 minutes.`
- **Meaning:** It's still reading Figma in the background.
- **Try:** Wait 1–2 minutes and send **exactly the same request (same link)** again. Don't change the request or the link. When you resend it, it uses what it already read and doesn't read Figma again.

**Message:** `Figma did not answer. Make sure the Figma desktop app is open with this file, then send the same message again.`
- **Meaning:** Figma didn't send the design, so the AI stopped. It doesn't write a plan or draw icons without the design.
- **Try:** ① Open the Figma **desktop app** with this file (Dev Mode → **Enable desktop MCP server** is on) ② Send **exactly the same message (same link)** again — it reads Figma again. Still the same? Ask the AI "Check the Figma connection." and see `figma-desktop connected` ([D. Figma connection](#d-figma-connection)).

**Message:** `This link is a big frame or a whole page. Please send the link to the one part you want to build.`
- **Meaning:** The link you sent points to a whole screen or a big frame. To build a part, you need the link of that one part.
- **Try:** If you want a **website**, say so with the link, for example "Make my website from this Figma screen. Home: <link>" — the AI checks the Figma connection and saves the screen picture by itself ([I](#i-building-pages-dspage--aicheck-page--webbuild)). If it is a **part**, select the part (component set) you want to build in Figma, use **Copy link**, and send that address.

**Message (to the AI):** `Some checks did not run in time — run pnpm ai:check <Name> … again yourself with the shell tool now. Only if that also does not finish in time, tell the user which checks are left and ask them to run that command in a VS Code terminal. Do not report that every check passed.`
- **Meaning:** It couldn't finish all checks in time. It's not "checks passed" yet.
- **Try:** First the AI runs the same check again itself (permission prompt → `Yes, allow once`). Only if that also doesn't finish, the AI tells you which checks are left — then type the command it gives you (for example `pnpm ai:check Button`, or `pnpm ai:check-page <Name>` for a page) in a VS Code terminal and look at the result ([F](#f-check-and-usage-commands-aicheck--aiverify--dsguard--aiusage)). How long the AI's shell can run a command is unverified.

> If the AI marks its own plan as "approved" or changes files without your OK, **tell it to stop** and let us know in the channel.

---

## F. Check and usage commands (`ai:check` · `ai:verify` · `ds:guard` · `ai:usage`)

The AI runs these commands itself (permission prompt → `Yes, allow once`) and shows you the result. To run one, ask in your own words, for example "Check Button again." or "Show me my usage table."

**`pnpm ai:check <Part>`**
- **If it passes:** it finishes without printing any problems.
- **Message:** `[Auto check] Found problems in <Part> after saving <file>. Fix the items below and save again.` followed by lines starting with `- `
- **Meaning:** The part's code breaks a rule (for example a colour typed in directly instead of a set colour, or a type error).
- **Try:** Show that list to the AI as it is and ask "Fix only these problems."

**`pnpm ai:verify <Part>`**
- **If it passes:** `Storybook render/play passed: Components/<Part> …`
- **Message:** `Usage: pnpm ai:verify <ComponentName>` — the part name was left out. Ask the AI with the name, for example "Verify Button."
- **Message:** `There are no Components/<Part> stories. …` / `<story>: Storybook render/play failed: …` / `… background does not change on hover …`
- **Meaning:** When opened in a real browser, the part didn't draw, or didn't react when pressed.
- **Try:** Show the message to the AI and ask it to fix it. If you see `Storybook failed to start` / `Storybook took too long to start`, check whether another Storybook is already running and try again.

**`pnpm ds:guard`**
- **Message:** `Errors <number> · Warnings <number>`
- **Meaning:** The design rule check result. **Errors must be 0.** Warnings are things to look at.
- **Try:** If there are errors, screenshot the whole screen and show it to the AI or send it to your instructor.

**`pnpm ai:usage`** (the usage table on your computer)
- **Message (a notice, not an error):** `<model>: did not add <n> session summaries (<n> requests) whose session ID is different from the request log, because they may be duplicates. Each model is counted once per request ID. Missing requests are not restored.`
- **Meaning:** To avoid counting the same usage twice, records that might overlap were left out. Nothing to do. Use the console for credits left.

---

## G. Review command (`ds:review`)

You run `pnpm ds:review <Name>` yourself when you changed a starter part, or built a part with the AI, and want to use it on a page ([student manual 6-1](student-manual.en.md#6-1-rules-to-keep)). Every error starts with `학생 검수 중단 / Student review stopped: `. Instructors: see the instructor review guide (not in the student kit).

**Message:** `학생 검수 중단 / Student review stopped: 사람이 직접 연결한 대화형 TTY에서만 검수 기록을 만들 수 있습니다. AI 셸·파이프·리다이렉션에서는 거부합니다. 사람이 터미널에서 직접 실행하세요.` — *"Review stopped: records can only be made in an interactive terminal a person is typing in. Refused from an AI shell, pipe or redirection. Run it yourself in a terminal."*
- **Meaning:** An AI ran it for you, or it was run in a way a person can't type into.
- **Try:** Open VS Code's **terminal** yourself and type the command. Don't ask the AI to do it.

**Message:** `학생 검수 중단 / Student review stopped: 사용법 / Usage: pnpm ds:review <Name> | pnpm ds:review --list (run it yourself; decision flags and piped input are not supported)`
- **Meaning:** You left out the part name, or the format is wrong.
- **Try:** Add exactly one part name starting with a capital letter. Example: `pnpm ds:review Button`

**Message:** `학생 검수 중단 / Student review stopped: 카탈로그에 없는 부품: <name>` — *"No such part in the catalog."*
- **Try:** Check the spelling (including capitals). `pnpm ds:review --list` shows all names.

**Message:** `입력을 취소했습니다. 검수 기록은 변경하지 않았습니다.` — *"Input cancelled. The review record wasn't changed."* / `… / Cancelled. No review record was changed.`
- **Meaning:** You sent an empty answer, or answered `no` to the final `Save the selected scope and answers?`. Nothing changed.
- **Try:** Just run it again.

**Message:** `… / Invalid choice: …` (for example `Select numbers from the list.`, `Choose 1 or 2.`, `Choose yes or no.`)
- **Meaning:** The answer isn't in the right format. It asks the same question again.

**Message (a notice):** `… / At least one check failed. This review will be rejected.`
- **Meaning:** You answered `no` to one of the questions, so it's recorded as rejected. The same happens if the part has a technical problem. It's not an error.
- **Try:** Write what went wrong in the `Notes:` that follows. If you answered by mistake, answer `no` to the final save question to cancel, and run it again.

**Message:** `학생 검수 중단 / Student review stopped: … / No reviewable examples were found. Ask the maintainer to connect Storybook examples.`
- **Meaning:** This part doesn't have Storybook examples that can be picked by number yet.
- **Try:** Tell the person in charge. This part can't be recorded right now.

**Message:** `학생 검수 중단 / Student review stopped: … / Multiple component plans found. Ask the maintainer to identify the current plan.` · `… / No component plan or starter specification was found. Ask the maintainer to prepare it.`
- **Meaning:** What the part should be compared with (the reference) isn't sorted out.
- **Try:** Tell the person in charge.

**Message:** `입력 중 코드·CSS·의존·토큰이 바뀌었습니다. 검수 기록을 저장하지 않았습니다.` / `입력 중 기존 검수 기록이 바뀌었습니다. 덮어쓰지 않았습니다. 다시 검수하세요.` / `… / The reference or examples changed during review. Review again.` — *"The part, the record, or the reference changed while you were answering. Nothing was saved."*
- **Meaning:** Something changed while you answered (maybe the AI was working).
- **Try:** Stop the AI's work, look at the screen again, and review from the start.

**Message:** `검수 기록은 저장됐지만 CATALOG.md의 수동 수정과 충돌했습니다. 문서를 덮어쓰지 않았습니다.` — *"The record was saved, but the parts list document was edited by hand, so it wasn't overwritten."*
- **Try:** Take a screenshot and send it to your instructor or the person in charge.

---

## H. Catalog "page use blocked"

**Message (good news, not an error):** In the catalog, `Status: starter; API: supported; Page use: full public API; …` with `Reason: Starter part, unchanged`
- **Meaning:** This is a starter part you haven't changed. Pages can use it right away. Nothing to do.

**Message:** In the catalog, `Status: stale; … Page use: blocked; …` with `Reason: Starter part changed: <what changed>. The student must run pnpm ds:review <Name> in a terminal.`
- **Meaning:** You (or the AI) changed this starter part's code, CSS or what it depends on. The changed version can't go on a page until you check it.
- **Try:** Look at the part in Storybook, then run `pnpm ds:review <Name>` **yourself** in a new terminal ([student manual 6-1](student-manual.en.md#6-1-rules-to-keep), section G). Afterwards the catalog shows `approved_scope` and `Page use: reviewed scope only`.

**Message:** In the catalog, `Page use: blocked` with `Reason:` `No starter baseline or student review yet` · `Human review rejected` · `Changed since review: …`
- **Meaning:** This part can't be used on pages yet: it's a new part with no review, the review was rejected, or it changed after the review.
- **Try:** Check the part in Storybook and run `pnpm ds:review <Name>` yourself. If it's `stale` (changed), review it again.

**Message:** `BLOCKED_CATALOG: <Part> needs a supported public API and either an unchanged starter baseline or the student's review of its current version.`
- **Meaning:** The page plan uses a part that you changed (or made) but haven't reviewed yet.
- **Try:** Run `pnpm ds:review <Part>` yourself first, or change the plan to use an unchanged starter part.

**Message:** `BLOCKED_CATALOG: the props/states of <Part>/<id> are outside what the human review covered.`
- **Meaning:** The part was reviewed, but the page tries to use a look that wasn't checked (for example Button with an icon).
- **Try:** Change the plan to use only reviewed looks, or review that look too.

**Message:** `BLOCKED_CATALOG: <Part> changed after the page plan was approved. Check the page plan again.`
- **Try:** Check and approve the page plan again with the AI. If the part is `stale`, review the part again too.

**Message (a notice, not an error):** In the catalog, `Visual: needs_review (check again)` / `Reason: … Token values changed: check the visuals again`
- **Meaning:** Design values such as colours (tokens) changed after the review — for example, replaced with the student's Figma colours. **The behaviour review and page use stay as they are**; just look at the colours and shapes once more.
- **Try:** Look at the part again in Storybook when you have time. You can keep working on pages.

**Message:** In the catalog, `Visual: failed` / `Visual: stale` (in `pnpm ds:review --list`: `visual: failed` / `visual: stale`)
- **Meaning:** The visual review was rejected (`failed`), or the part's code changed so the visuals need reviewing again (`stale`).
- **Try:** Review the part again.

---

## I. Building pages (`ds:page` · `ai:check-page` · `web:build`)

Errors from `ds:page` and `ai:check-page` all start with `Page work blocked: `.

**Message:** `Page work blocked: Usage: pnpm ds:page docs/plans/pages/<Site>.md / pnpm ai:check-page <Name>`
- **Try:** The AI left out the plan path (`ds:page`) or the page name (`ai:check-page`). Tell the AI the plan or page name, for example "Check the Home page."

**Message:** `Page work blocked: Page plan: …` (for example `Needs exactly one page-spec JSON block.` / `Set the title and the language (ko or en).`)
- **Meaning:** The page plan is missing something.
- **Try:** Show the message to the AI and fill in the plan together. If the plan changes, approve it again.

**Message:** `Page work blocked: Web settings are already connected. They are not replaced automatically. Compare the plan with the current file yourself.` (or `Page work blocked: Keeping the existing file: <path>`)
- **Meaning:** `pnpm ds:page …` ran again, but the pages for this plan are already made. The AI probably already ran it after you approved (you allowed it in the permission prompt). `ds:page` never replaces pages or the site settings (`web.config.json`) that already exist, so nothing was changed.
- **Try:** Look in `my-website/pages/`. If the `<Name>Page.tsx` files are there, `ds:page` doesn't need to run again. Go on to the next step: ask the AI "Fill the blanks in my pages and check them." (the AI fills `PAGE_SLOT` and runs `pnpm ai:check-page <PageName>`) ([student manual 6-2](student-manual.en.md#6-2-steps)).
  - If you changed the plan and approved a new revision, `ds:page` doesn't remake the pages. Ask the AI to compare the pages and `web.config.json` with the approved plan and fix only the differences, then check every page (the AI runs `pnpm ai:check-page <PageName>`).

**Message:** `… Some data/event slots are not connected yet. Connect only the behavior in the approved plan.`
- **Meaning:** Something like "what happens when this button is pressed" is still empty.

**Message:** `… P03/P04/P12: sections, parts, props, text or connections differ from the approved plan.` / `… P05: there are JSX parts or copied UI that are not in the plan.` / `… P06/P11: page CSS must match the approved layout and Layout tokens. …`
- **Try:** Tell the AI "Build only exactly what the approved plan says" and show it the message.

**Message (pass):** `<Name>: static check passed, … A person must still check the real screen, events and responsive layout, and compare it with the original.`
- **Meaning:** The automatic check passed. Now it's your turn to check the screen **with your own eyes**.

**Message (a notice, not an error):** `Check the visuals again (the behavior review and page use still count): <part names>`
- **Meaning:** Some parts on the page had design values such as colours changed after they were reviewed. **You can still build and use the page.** It's just worth looking at their colours and shapes again.
- **Try:** Keep working on the page, and look at those parts in Storybook again when you have time (same meaning as `needs_review` in section H).

**From `pnpm web:build`:** `No web page is connected yet. …` / `Set title in web.config.json to the website title the user confirmed.` / `pages in web.config.json needs a page with the / path.`
- **Meaning:** The website settings file (`web.config.json`) doesn't have the pages, title, or first page (`/`) connected yet. The kit already knows how to go from one page address to another: `pnpm ds:page` writes your pages and their addresses into `web.config.json`.
- **Try:** Approve the page plan in the chat first, so the AI makes the pages (it runs `pnpm ds:page docs/plans/pages/<SiteName>.md`), then show the message to the AI to fix the settings. If the AI says "there is no router" and wants to install one or make a new app, say no.

The AI runs the Figma screen picture and the compare step itself when you ask for your website (`pnpm web:figma`, `pnpm web:compare`). The messages below are for **when the AI shows you one of them**. You don't need to type the commands yourself.

**When the AI shows:** `Could not connect to the Figma Desktop MCP server. Open your file in the Figma app and turn on Dev Mode → Enable desktop MCP server. (…)`
- **Meaning:** The kit couldn't talk to the Figma desktop app, so it didn't save a picture. (When it works, the AI shows `Figma MCP: connected.`)
- **Try:** Open the file in the Figma desktop app, turn on Dev Mode → Enable desktop MCP server, then send the same message to the AI again ([D. Figma connection](#d-figma-connection)). Still no luck? Export the picture yourself as a backup (next message).

**When the AI shows:** `The Figma MCP did not return a picture. In Figma, select the frame, choose Export → PNG (1x), and save it as my-website/figma/<Page>.png.`
- **Meaning:** Figma answered, but without a picture.
- **Try (backup):** In Figma, select the screen frame → in the right panel, **Export** → **PNG**, **1x** → **Export**. Save it with the page name, for example `my-website/figma/Home.png`. Then tell the AI "I saved the picture".

**When the AI shows:** `Add the page name: pnpm web:figma <Page> "<link>"`
- **Meaning:** It couldn't make a page name from the Figma frame name (for example, a name with no English letters).
- **Try:** Send the message again with the page name, for example "Make my website from this Figma screen. Home: <link>".

**When the AI shows:** `Already saved: my-website/figma/<Page>.png, …. To read the screen again and replace it, run: pnpm web:figma <Page> "<link>" --replace`
- **Meaning:** That page already has a picture. It is never replaced by itself.
- **Try:** Only if the Figma screen changed, tell the AI "Save the Home screen picture again." Each screen uses 2 Figma MCP calls.

**When the AI shows:** `No Figma picture for <Page>. …` (or `No approved pages are connected yet. …`)
- **Meaning:** There is nothing to compare for that page yet: no Figma picture, or no pages made yet.
- **Try:** If the picture is missing, send that screen's Figma link to the AI (or use the backup above). If there are no pages, approve the page plan first so the AI makes them (it runs `pnpm ds:page …`). When it works, the AI tells you the path `var/compare/<Page>/index.html` — open that file and compare. There is no score. Small differences from fonts and browsers are normal.

---

## J. Deploying (`deploy.sh` / `deploy.ps1`)

There are two ways to deploy: way 2, Vercel only, which the class uses, and way 1, GitHub + Vercel, for students who choose it ([student manual 6-3](student-manual.en.md#6-3-putting-it-on-the-internet-deploying)). In the Qwen chat, say "Put my site online." (or `/my-deploy`).

- **The AI runs every deploy command itself** (`node scripts/deploy.mjs …`). You never type a deploy command.
- **You only click and choose:** click `Yes, allow once` when the AI asks, and answer its questions by picking a choice.
- **Your Vercel token goes only into the browser window** titled "Paste your Vercel token". Never paste it into the AI chat.
- Way 1 has one thing you type yourself: signing in to GitHub once (see "GitHub needs you to sign in once" below).
- If a command fails, the AI reads this section and explains it. You can also find the message here yourself.

### Normal messages (not errors)

**Message:** `Ask the student: …` (for example `Ask the student: which way to deploy — …`, `Ask the student: a new Vercel project name …`, `Ask the student: the address of their own GitHub repository. …`)
- **Meaning:** This is normal. The command needs one answer from you, so it stopped before changing anything.
- **Try:** The AI asks you with choices. Pick one (or choose Other and type your own). The AI then runs the command again.

**Message:** `Deployment method: not selected. Run setup --method git or setup --method api.` (from `check`)
- **Meaning:** This is normal the first time. You haven't chosen a way yet.
- **Try:** Nothing. The AI asks you the way with choices and sets it up.

**Message:** `A browser window opened. Paste your Vercel token there, not in the chat. Waiting…`
- **Meaning:** Way 2 needs your Vercel token, and the page "Paste your Vercel token" opened in your browser.
- **Try:** Paste your token in that page and press **Save**. No token yet? In Vercel, open Account Settings → Tokens → Create, and set Expiration to about the day the class ends.

**Message:** `Saved. Go back to VS Code.` (on the page) / `Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. To remove it, ask the AI: "Forget my Vercel token".`
- **Meaning:** Done. Vercel accepted your token. Next time nobody asks for it.
- **Try:** Go back to VS Code. The AI keeps deploying.

### The Vercel token (way 2)

**What you see:** The browser window did not open. The output says `The browser did not open by itself. Open this address in your browser: http://127.0.0.1:<port>/<long code>`
- **Meaning:** Your computer did not open the browser by itself.
- **Try:** Copy the whole address and open it in your browser. Then paste your token there and press **Save**. The address works only on this computer and only once. If the page does not open or says `Not found`, ask the AI to deploy again to get a new address.

**Message (on the page):** `This token does not work. Make a new one in Vercel and paste it again.`
- **Meaning:** Vercel said no to this token. It may be wrong, cut short, expired or deleted.
- **Try:** In Vercel, open Account Settings → Tokens → Create and make a new token. Paste the new one in the same page and press **Save** again.

**Message (on the page):** `Paste one Vercel token without spaces.` (also `Enter one Vercel token without spaces.`)
- **Meaning:** The box was empty, or the token had a space in it.
- **Try:** Copy only the token again and paste it. Then press **Save**.

**Message (on the page):** `Could not reach Vercel. Check the internet, then press Save again.`
- **Try:** Check your internet connection, then press **Save** again.

**Message:** `The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.`
- **Meaning:** The token you saved before expired or was deleted in Vercel. The kit removed it, and the browser window opens again.
- **Try:** Make a new token in Vercel (Account Settings → Tokens → Create) and paste it in the browser window that opened.

**Message:** `No token was entered. Ask the AI to deploy again.`
- **Meaning:** 8 minutes passed and no token was saved in the browser window, so the command stopped. Nothing was uploaded.
- **Try:** Have your token ready, then ask the AI to deploy again. Paste it as soon as the window opens.

**What you see:** You pasted your Vercel token into the AI chat.
- **Meaning:** Your token is no longer secret. Someone could use it to change your Vercel projects.
- **Try:** In Vercel, open Account Settings → Tokens and **delete that token now**. Make a new one. Then ask the AI to deploy again and paste the new token **only in the browser window**.

**What you want:** Remove the saved token from this computer.
- **Try:** Say "Forget my Vercel token" to the AI. It shows `Your saved Vercel token was deleted from this computer.` (or `There is no saved Vercel token on this computer.`) and `If you don't need it anymore, also delete it in Vercel → Account Settings → Tokens.`

**Message:** `Vercel API request failed: <reason>`
- **Meaning:** Vercel said no. The part after the colon is Vercel's own reason. If your token appears in it, it is shown as `[hidden]`. Common causes: the token is wrong or expired, or the project name is already used.
- **Try:** If the reason is about the project name, ask the AI to set up again with a new project name. If it is about the token, make a new token in Vercel and ask the AI to deploy again, then paste the new token in the browser window. If it keeps failing, send your instructor a screenshot (check that no token is visible).

**Message:** `Could not reach the Vercel API. Check the network and try again.`
- **Try:** Check your internet connection, then ask the AI to deploy again.

**Message:** `Use a lowercase Vercel project name with letters, numbers, dot, underscore or hyphen.`
- **Meaning:** The project name has capital letters, spaces or other signs.
- **Try:** Ask the AI to set up again with a new project name like `my-cafe-site` (lowercase letters, numbers, `.`, `_`, `-`).

**Message:** `--project does not match the locally connected Vercel project. Check .vercel/project.json yourself.` / `Check the project and account info in .vercel/project.json.` / `Could not read the project and account IDs from Vercel.`
- **Meaning:** This folder is already connected to a different Vercel project (for example from the GitHub way), or the saved project info is broken.
- **Try:** Don't edit `.vercel/` yourself. Take a screenshot and ask your instructor. Way 2 needs a new Vercel project.

### GitHub needs you to sign in once (way 1)

**Message:** `GitHub needs you to sign in once. In VS Code, open Terminal → New Terminal and run gh auth login, then gh auth setup-git (troubleshooting J, "GitHub needs you to sign in once"). Then ask the AI to deploy again.`
- **Meaning:** GitHub needs to know it is you before your work can be uploaded. This is the **only** thing you type yourself in way 1, and only once.
- **Try:**
  1. In VS Code, open **Terminal → New Terminal**.
  2. Type `gh auth login` and press Enter. Choose `GitHub.com`, then `HTTPS`, then `Yes`, then `Login with a web browser`. Copy the code it shows, press Enter, and sign in to GitHub in the browser.
  3. Type `gh auth setup-git` and press Enter.
  4. Ask the AI to deploy again.
  - If it says `gh` is not found, install GitHub CLI first, then open a new terminal and start again from step 2. Mac: `brew install gh`. Windows: `winget install --id GitHub.cli --exact --source winget`.

### The GitHub way (way 1)

**Message:** `Enter the HTTPS or SSH address of your own GitHub repository.` / `This will not push to the instructor's starter repository. …`
- **Meaning:** The repository address was empty or wrong, or it was the instructor's starter repository.
- **Try:** Ask the AI to set up again. When it asks, choose Other and type the address of **your own** GitHub repository.

**Message:** `Run publish on a work branch so Vercel creates a Preview. Use production on the Production Branch.`
- **Meaning:** You are on your Production Branch. A Preview (a test address) can only be made from a work branch. The script never switches branches.
- **Try:** Don't switch branches alone. Ask your instructor. We move between branches together in class.

**Message:** `Run production on the Vercel Production Branch. The branch is not switched automatically.`
- **Meaning:** You chose Production while on a work branch. The script never switches branches for you.
- **Try:** First bring the checked changes to your Production Branch (we do this together in class). Then ask the AI to put it online for everyone (Production) again. If unsure, ask your instructor.

**Message:** `Set the Vercel Production Branch.`
- **Meaning:** Your Vercel project has no Production Branch yet.
- **Try:** In your Vercel project, open Settings → Environments → Production → Branch Tracking and choose the branch. Then ask the AI to deploy again.

**Message:** `GitHub has newer changes or a conflict. Sync first. This script never force-pushes.` / `Fix the Git conflicts first.`
- **Meaning:** GitHub has changes your computer doesn't, or there's a conflict.
- **Try:** Don't try to fix it alone. Take a screenshot and send it to your instructor.

### Both ways

**Message:** `Choose a deploy command: check, setup, publish, production or forget-token.`
- **Meaning:** The AI ran the deploy script without a correct command name. Nothing changed.
- **Try:** Say "Put my site online." to the AI again.

**Message:** `No deploy method is selected. Run setup first.` / `No Vercel project is connected. Run setup first.`
- **Meaning:** Your way is not set up yet, or the setup did not finish.
- **Try:** Ask the AI to deploy again. It asks you the way with choices and sets it up first.

**Message:** `The deploy method must be git or api.` / `Use --method, --project and --repo only with setup.`
- **Meaning:** The AI wrote the command a little wrong. Nothing changed.
- **Try:** Ask the AI to deploy again. If it asks, choose "Vercel only" or "GitHub + Vercel".

**Message:** `This project is set up for <target>. Run setup --method <method> --target <target> first.`
- **Meaning:** You set up one thing (your website or your Storybook), but asked to deploy the other one.
- **Try:** Ask the AI to deploy the one you set up. If you want to switch, ask your instructor first.

**Message:** `Build output not found: …/index.html` / `Node.js 20 or newer is needed.`
- **Meaning:** The website build didn't finish, or Node.js is too old.
- **Try:** Fix the `web:build` errors in section I first. For Node, run the install script again.

**Message:** `Vercel deploy failed: <state>. Check the build log under Deployments in your Vercel project.`
- **Try:** On the Vercel website, open your project → **Deployments**, open the failed one, and send a screenshot of its log to your instructor.

**Message:** `Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.`
- **Meaning:** A deploy command can run for about 10 minutes at most. Vercel was still working when that time ran out. It is not a success yet.
- **Try:** On the Vercel website, open your project → **Deployments** and see if it becomes **Ready**. If it stays stuck or fails, ask the AI to deploy again. If it fails again, send a screenshot of its log.

**Message:** `<command> <step> failed: <reason>` (for example `git push failed: …` or `vercel link failed: …`)
- **Meaning:** A program the deploy script uses (Git or Vercel) stopped with an error.
- **Try:** Take a screenshot of the whole message (check that no token is visible) and send it to your instructor.

---

## K. Your plan (the AI runs `pnpm specs`)

When you ask "Organize my documents into specs" or "Are there questions left?", the AI runs `pnpm specs` (permission prompt → `Yes, allow once`) and shows you how your plan in `my-docs/` is doing. The script itself doesn't call the AI, but the AI's turn that runs and explains it uses credits like one chat. It never stops with an error. Its last line tells you the next step ([student manual 3-2](student-manual.en.md#3-2-your-3-folders-and-what-to-tell-the-ai)).

**Message:** `Open questions [NEEDS CLARIFICATION]: <n>` followed by a numbered list like `1. <question>  (spec.md:12, plan.md:30)`, and `Next: the AI asks these with choices in the Qwen chat; pick an answer or type your own. No choices? Answer with the same numbers (1. … 2. …).`
- **Meaning:** These facts are not in your notes. The AI asks instead of making them up. The part in brackets shows where each question is (file and line).
- **Try:** When the AI asks with choices, pick an answer (or choose Other and type your own). No choices? Answer in the Qwen chat with the same numbers, for example `1. Our Menu 2. Find us`. Then ask the AI "Are there questions left?" until it shows `0`.

**Message:** `· <file> — not written yet` / `✗ <file> — missing section "<name>"` + `Next: ask the AI in your own words to organize your documents into specs …`
- **Meaning:** A spec file in `my-docs/specs/` doesn't exist yet, or a required part is missing.
- **Try:** Ask the AI: "Organize my documents into specs." If you deleted a section by mistake, ask it to add the section back.

**Message:** `✗ plan.md:34 — this table row has 6 cells, the header has 5. Write a | inside text as \|.`
- **Meaning:** A `|` inside your words (for example the page title `Menu | Bean There`) splits a table cell in two, so the website step would read the table wrong.
- **Try:** Open the file at that line and write `\|` instead of `|` inside the words. Or ask the AI "Organize my documents into specs" and it fixes it.

**Message:** `~ changed  <file>` / `- removed  <file>` + `Next: ask the AI in your own words to organize your documents into specs (<n> inbox file(s) new, changed or removed since the last tidy).`
- **Meaning:** You added, changed or removed documents in `my-docs/inbox/` after the AI last organized them.
- **Try:** Ask the AI again: "Organize my documents into specs." It reads only the new or changed files and keeps your edits in `specs/`.

**Message:** `(empty — put your plan, PRD, user stories or notes here, or fill in inbox/brief.md)` + `Next: add documents to my-docs/inbox, then ask the AI in your own words to organize them into specs.`
- **Try:** Put your documents in `my-docs/inbox/`, or fill in `my-docs/inbox/brief.md`.

**Message:** `! The AI can't read this file type. Save it as .md or .txt, or copy the text into a .md file.` (or the same kind of note for a PDF or a picture)
- **Meaning:** Word, PowerPoint, Excel and HWP files can't be read. PDFs and pictures work only if your AI model can read them.
- **Try:** Save the file as `.md` or `.txt` in `my-docs/inbox/`, or copy its text into a `.md` file.

**Message (good news):** `Specs are ready. Next: ask the AI in your own words to make your website from these specs.`
- **Meaning:** No open questions are left. You can plan your website ([student manual 6-2](student-manual.en.md#6-2-steps)).

---

## L. Icons, pictures and fonts (the AI runs `pnpm assets`)

When you ask "Sort the files in my-assets", the AI runs `pnpm assets` (permission prompt → `Yes, allow once`). It sorts what you dropped in `my-assets/` into `icons/`, `images/` and `typo/`; the script itself doesn't call the AI. It never deletes your files. A file with a problem stays where it is and is listed with `✗` ([student manual 3-2](student-manual.en.md#3-2-your-3-folders-and-what-to-tell-the-ai)).

**Message (not an error):** `Waiting for you (not moved — choose where each file goes)` + `? <file> — <size>: bigger than an icon (64) but not clearly a picture` (or another reason) + `icon:    pnpm assets --to icons "<file>"` / `picture: pnpm assets --to images "<file>"`
- **Meaning:** It can't tell if this SVG is an icon or a picture, so it lets you choose.
- **Try:** Answer the AI's question in your own words, for example "logo.svg is an icon." The AI runs the matching command.

**Message:** `✗ <file> — This kind of file isn't used in my-assets. It takes icons (.svg), pictures (.png .jpg .webp .gif .avif .svg) and fonts (.woff2 .woff .ttf .otf). Move it out of my-assets.`
- **Meaning:** The file type isn't an icon, picture or font (for example a `.txt` or `.docx`).
- **Try:** Move the file out of `my-assets/`. Plan documents go in `my-docs/inbox/`.

**Message:** `✗ <file> — Websites can't show this format. Export it again from Figma (or your picture app) as PNG, JPG, WebP or SVG.`
- **Try:** Export it again in one of those formats, put the new file in `my-assets/`, and delete the old one.

**Message:** `✗ <file> — my-assets/<folder>/<name> already exists. Rename one of them, or remove the copy you don't need.`
- **Meaning:** A file with the same name is already in that folder, so nothing was moved.
- **Try:** Rename the new file (for example `cart-2.svg`) or delete the copy you don't need, then ask the AI to sort my-assets again.

**Message:** `✗ <file> — Give the file a name with English letters or numbers, like arrow-right.svg.` (for pictures, `like hero-photo.png`)
- **Try:** Rename the file using English letters or numbers, then ask the AI to sort my-assets again.

**Message:** `✗ <folder>/ — Folders inside my-assets aren't sorted. Move the files out of this folder into my-assets, then ask the AI to sort my-assets again (it runs pnpm assets).`
- **Try:** Move the files straight into `my-assets/`, then ask the AI to sort my-assets again.

**Message:** `✗ <file> — This is not a font file, or it is damaged. Download the font again.` / `✗ <file> — This is a font collection (several fonts in one file). Download the single font files (.woff2, .ttf or .otf) instead.`
- **Try:** Download the font again, as single `.woff2`, `.ttf` or `.otf` files.

**Message:** `<n> file(s) need fixing. … Icons: <n> · Images: <n> · Fonts: <n> file(s).`
- **Meaning:** The summary. Fix each `✗` line above it, then ask the AI to sort my-assets again until it says `All good.`

---

Related: [Student manual](student-manual.en.md) · instructor review guide (instructors only — not in the student kit) · [Deploying (Korean)](../vercel-deployment.md)

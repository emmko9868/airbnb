# Student Manual — Build Your Design System and Website

> Slide version with pictures: <https://blah-01.tail46233e.ts.net/manual/en> · Terms such as credit limits can change, so check the console again. `(unverified)` marks screen text we haven't checked ourselves yet.

Follow this manual from top to bottom. Each step has **"It worked if…"**. When you see that, go to the next step.

The big picture

1. Get an API key from the Token Plan you subscribed to
2. Install the Qwen Code extension in VS Code and connect your key
3. Download and install the starter kit
4. Connect Figma to the AI (Figma MCP)
5. Build your design system (tokens + components) with the AI
6. Build 3–4 website pages with those parts
7. Put it on the internet (deploy)

---

## 0. What you need

| What | Notes |
|---|---|
| Your own computer (Mac or Windows) | School or work computers may block installs. You need your computer password (admin rights). |
| Figma account + student verification (Education plan) | Approval can take a few days. Apply first. |
| GitHub account | **Not needed before class.** Only if you pick deploy way 1 (GitHub) in 6-3. Then we set it up together in class. |
| Vercel account | **Sign up before class.** Vercel puts your website online. You can sign up with your email: Vercel sends a 6-digit one-time code. The free Hobby plan is enough. |
| VS Code | Version 1.96.0 or newer. |
| **The Alibaba Cloud Model Studio Token Plan, Personal, Standard (international) you've already subscribed to** | Each student has their own subscribed account. Read the list below. |

### What to know about Token Plan

- You have **45,000 credits a month**. Every time the AI works for you, credits go down.
- **One month = 30 days from the day you subscribed** (not the 1st of the calendar month). Your credits refill at the start of each new month.
- **Unused credits do not carry over** to the next month.
- **When your credits run out, the AI stops.** You won't be charged extra by surprise. You'll have to wait until your next month starts, so tell your instructor if you get stuck.
- You can run 3–4 AI jobs (agents) at the same time. In class we use **only one at a time**.
- **One subscription per person. Never share your account or API key with friends.** Sharing can get your subscription suspended or your key blocked.
- **Only for a person chatting with the AI directly.** Using a script to call the AI automatically or in bulk breaks the rules.

> **Goal of this manual:** finish your design system and 3–4 pages within one month of Standard credits. Please follow [7. Save credits](#7-save-credits).

### Words you'll see first

| Word | What it means |
|---|---|
| agent (AI agent) | An AI that does work, not only answers. It reads your files, changes them and runs commands. Qwen Code is an AI agent. So it asks you first with a permission prompt (2-6). |
| MCP | Model Context Protocol. An agreement on how an AI talks to other programs, like one plug shape that fits many devices. In this class we use only Figma MCP: it lets the AI read your Figma design (section 4). |
| model | The kind of AI brain. Some are light and quick, some are bigger. You switch with `/model` (2-4). |
| Thinking | The AI thinks longer before it answers. Thinking costs credits too (2-5). |
| credit | Your monthly AI allowance in Token Plan. It goes down each time the AI works for you. |
| token | It has three meanings. **Design token:** a name tag for a color or size, like `primary`. **AI token:** a small piece of text the AI reads or writes; more tokens use more credits. **Vercel token:** a password for a program. When you deploy, you paste it once into a browser window that opens by itself (6-3). Never paste it into the AI chat. |

---

## 1. Get an API key from the Token Plan you subscribed to

You've already subscribed to Token Plan. Here you only copy the **API key** that connects Qwen Code to it.

1. Log in to Alibaba Cloud international (alibabacloud.com) with the account you subscribed with.
2. In the Model Studio console, open **Token Plan → My Subscriptions** — [Open My Subscriptions to copy your Token Plan API key](https://modelstudio.console.alibabacloud.com/ap-southeast-1/subscription/token-plan). In the middle you'll see **Standard Plan (Active)** and **Plan Quota** (this month's usage).
3. In the **Plan-Specific API Key** box on the right, **copy the key.** It starts with `sk-sp-` and is partly hidden on screen. If the box is empty on a newly subscribed account, follow the instructions on the screen (unverified).
4. Keep the key somewhere safe (like a password manager).

You don't need the Plan Exclusive Base URL or Quick Access to AI Tools (Qwen Code, etc.) below it for now. You connect the key with `/auth` in 2-3.

**It worked if** the My Subscriptions page shows your Standard Plan and the days left, and you have your API key saved.

Rules

- ⚠️ **Don't press Reset in the API key box.** It makes your current key stop working right away, and the connected Qwen Code stops. Press it **only if your key has leaked**, then connect the new key again with `/auth` in Qwen Code (2-3).
- This is a **Token Plan key** (`sk-sp-…`). It is different from a normal Model Studio API key, and the two can't be swapped. Use the key exactly as you copied it.
- **Don't let the full key show in screenshots or chats.** Never post it in chat, in screenshots, or on GitHub, and hide it when you take screenshots for submission.
- It's OK to use the same key on more than one of your own computers (home and school).

---

## 2. Install VS Code + the Qwen Code extension and connect

### 2-1. Install VS Code

Download it from <https://code.visualstudio.com/> and install it. If you already have it, update to the latest version (1.96.0 or newer is required).

**It worked if** VS Code opens, and **Code (Help on Windows) → About** shows version 1.96 or newer.

### 2-2. Install the Qwen Code extension

1. Click the **Extensions** icon on the left side of VS Code.
2. Search for `Qwen Code Companion`. Install the one published by **qwenlm**.
   (Marketplace page: <https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion>)
3. Qwen Code comes inside the extension, so **there is nothing else to install.**
4. The install script in section 3 also tries to install this extension. On computers where the terminal can't use the `code` command, it only tells you to install it from the Extensions view. So installing it yourself here is the surest way.
5. **Don't install any Figma extension for VS Code (for example "Figma MCP Server").** We use the MCP built into the Figma desktop app (section 4). More extensions give the AI more tools, and every request costs more credits.

**It worked if** a Qwen icon appears in the VS Code side bar, and clicking it opens the Qwen Code chat panel.

### 2-3. Connect your Token Plan key

> You set up the key only in the VS Code extension. The starter kit's install script never asks for or saves your key.

**Main way — connect with `/auth` in the chat**

1. The first time you open the Qwen Code panel, a setup window appears. If not, type `/auth` in the chat box.
2. From the options (Coding Plan · Token Plan · Standard API Key …), choose **Token Plan**. Not Coding Plan, not Standard API Key.
3. If it asks for a region, choose **Singapore (International)**.
4. Paste the API key you saved in step 1.
5. When it asks which models to add, pick the ones from [section 7](#7-save-credits) (one light model + one main model).

**It worked if** you send `Hi!` in the Qwen Code chat and get an answer.

**Backup way — write the settings file yourself**

Use this only if `/auth` doesn't work. Put Alibaba's official example into your **user settings file**.

| OS | File location |
|---|---|
| Mac | `~/.qwen/settings.json` |
| Windows | `C:\Users\<your user name>\.qwen\settings.json` |

Alibaba's official Token Plan Personal example (shortened to two models). Replace `YOUR_API_KEY` with your key.

```json
{
  "env": {
    "BAILIAN_TOKEN_PLAN_API_KEY": "YOUR_API_KEY"
  },
  "modelProviders": {
    "openai": [
      {
        "id": "qwen3.8-flash",
        "name": "[Token Plan Personal] qwen3.8-flash",
        "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "envKey": "BAILIAN_TOKEN_PLAN_API_KEY",
        "generationConfig": { "extra_body": { "enable_thinking": true } }
      },
      {
        "id": "qwen3.8-max",
        "name": "[Token Plan Personal] qwen3.8-max",
        "baseUrl": "https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
        "envKey": "BAILIAN_TOKEN_PLAN_API_KEY",
        "generationConfig": { "extra_body": { "enable_thinking": true } }
      }
    ]
  },
  "security": { "auth": { "selectedType": "openai" } },
  "tokenPlan": { "region": "global" },
  "model": { "name": "qwen3.8-flash" },
  "$version": 3
}
```

- Put your key **only in the user settings file (`~/.qwen/settings.json`)**. Never put it in the `.qwen/settings.json` inside the project folder. The project folder goes to GitHub.
- `ap-southeast-1` in the address means Singapore (international). Mixing it with the China address (`cn-beijing`) gives a `401` error.

**It worked if** you send `Hi!` in the Qwen Code chat and get an answer. Usage under **Token Plan → My Subscriptions** in the console also goes above 0 (it may take a while to update, unverified).

### 2-4. Switch models

A model is the kind of AI brain. Some models are light and quick. Some are bigger.

Type `/model` in the chat box to open the model picker. Choose one of the Token Plan models (for example `qwen3.7-plus`, `qwen3.6-plus`, `qwen3.7-max`, `qwen3.8-max`, `qwen3.6-flash`, `deepseek-v4-pro`). We'll tell you which model to use for which job after we measure usage (your instructor will tell you in class).

**It worked if** the model name you picked shows in the chat panel. (Where it shows: unverified)

### 2-5. Approval mode and Thinking

Below the chat box you'll see the **approval mode** and **Thinking**.

Why: Qwen Code is an AI agent. It can change files and run commands, so you choose how much it may do without asking.

- **Approval mode:** the starter kit sets it to **Ask Approval (default)** from the start (it asks you before running commands or changing files). We recommend this mode in class. The approval mode menu has 4 modes (table below).
  - `Shift + Tab` switches the mode. If it changed, switch back to **Ask Approval (default)**.
- **Thinking:** when it's on, the AI thinks longer before answering. **Thinking tokens cost credits too.** We'll tell you when to turn it on or off after we measure usage (your instructor will tell you in class).
  - Other AI tools have a similar setting called "Effort": how deeply the AI thinks.
- The starter kit turns off Qwen's background features (memory clean-up, skill review), so credits aren't spent on work you didn't ask for. Don't turn them back on.

| Approval mode (menu name) | What it does | In class |
|---|---|---|
| **Ask Approval (default)** | Asks you before it runs commands, changes files or uses outside resources. | **Recommended.** The kit starts in this mode. |
| Auto Edit (auto-edit) | Changes files without asking. It still asks before running commands and other risky actions. | Not recommended. Plans and code change before you read them. |
| Classifier Approval (auto) | Another AI judges the risk. It does safe-looking actions right away and asks about risky ones. | Not recommended. It calls an extra AI to judge, so it **uses more credits.** |
| Full Access (yolo) | Does everything without asking (in trusted folders). | **Don't use it.** Changes and commands you didn't want go through without asking. |

- In every mode, **you make the choices in questions and the plan approval ("Approve revision N") yourself.** The approval mode only decides whether commands and file changes ask first. If the AI tries to approve a plan without your choice, the kit blocks it and the AI asks you again.

**It worked if** the approval mode menu shows a ✓ next to **Ask Approval (default)**.

### 2-6. The permission prompt for edits and commands

Because the approval mode is default, a **permission prompt** appears in the Qwen Code panel every time the AI wants to write or change a file or run a command. It has three buttons.

| Button | When to press it |
|---|---|
| **`Yes, allow once`** | When the AI wants to write a file or run a command, **check that the file name or command looks right, then press this.** It allows this one time only. For a plan you don't read the file: the AI shows you a short summary in the chat. |
| `Allow All Edits` | **Don't press this.** It lets the AI make every later change in that chat without asking. Not recommended in class. |
| `Reject` | Press this if something looks wrong. Then write in the chat what was wrong. |

Keep these apart

- **"Allowing" in the prompt is not "approving" a plan.** Pressing `Yes, allow once` so the AI can write a plan file does **not approve the plan.** It only lets it write the file.
- **The AI asks you with choices.** When it has a question, a short list of answers appears in the chat (unverified: how it looks in the Qwen extension). Pick one. If none fits, choose **Other** and type your own answer. Up to 4 questions come at a time; the rest come next.
- **You approve with a choice too.** Before it builds anything, the AI writes a short summary in the chat: what it makes, the values it chose (for example colour role → colour), what it leaves out, and that no questions are left. Read it, then pick **"Approve revision N"** (N is the version number). To change something, pick **"Change something"** and say what in the chat. This works the same for parts, colour plans, text plans and pages. You never open the plan file; the AI writes it for you.
- No choices on the screen? Write the sentence instead: **"Approve revision 1. Go ahead with this plan."**
- Saying nothing, "nice" or "OK" is not an approval. Even if the AI says no questions are left, **don't just trust it.** Read each role and reason in the summary, and ask about anything you don't understand.

**It worked if** a permission prompt appears before every file the AI writes, and nothing happens until you press `Yes, allow once`. Before building, the AI shows a summary and the choice **"Approve revision N"**.

### 2-7. When Qwen answers in Chinese or another language

Qwen Code has a **UI language** (the words on menus and buttons) and a **reply language** (the language the AI answers in), and they're separate. Korean isn't in the UI language list, so the UI may show in English or another language, but you can set the reply language separately.

If you ask in your language and it answers in Chinese or another language:

1. Type one of these in the Qwen chat box.
   - `/language output auto` — it answers **in the language you typed** (ask in English, it answers in English).
   - `/language output English` — it **always** answers in English (or `/language output Korean` for Korean).
2. Open a **new chat** and ask again.

**It worked if** it answers in the language you asked in. (The confirmation shown after the command is unverified.)

- **After changing the UI language** (for example with `/language ui …`), the reply language may change with it. If so, do steps 1–2 again.
- If the command doesn't work in the extension chat, open the `DS-Starter` folder in VS Code, run `qwen` yourself in a new terminal (3-1), type the same command, then close Qwen in the terminal and reopen the extension panel. This setting is saved in the user settings that the extension and the terminal share.
- This setting applies to your whole computer. The project settings can't always override it, so you set it yourself.

### Mac vs Windows

- Installing and using the extension is the same.
- **Mac: let the terminal use the `code` command.** On a Mac, VS Code's `code` command may not work in the terminal at first. In VS Code, press `⌘ + Shift + P` to open the Command Palette and run `Shell Command: Install 'code' command in PATH`. Then the install script in section 3 can install the Qwen Code extension for you too. If you already installed the extension in 2-2, you can skip this.
  - **It worked if** `code --version` in a new terminal shows a version number.
- What differs is the user settings file location (table above) and the few commands you type yourself in a terminal. On Windows, if a command like `pnpm` is blocked with "running scripts is disabled", add `.cmd`, like `pnpm.cmd`.

---

## 3. Get the starter kit and install it

Install VS Code first (2-1). The install script doesn't install VS Code.

1. Download the starter kit ZIP: <https://github.com/DearKim/DS-Starter-Kit/releases/latest/download/DS-Starter.zip>
2. Unzip it and move the `DS-Starter` folder **outside OneDrive, iCloud or any other sync folder**. Inside a sync folder (for example Desktop or Documents inside OneDrive), the install can be slow or fail because files get locked.
   - Mac: In Finder, press `⌘ + Shift + H` to open your home folder, and drag it in → `~/DS-Starter`
   - Windows: Type `%USERPROFILE%` in File Explorer's address bar to open your home folder, and drag the **inner** `DS-Starter` folder in → `C:\Users\<your name>\DS-Starter`. Right under your home folder is outside OneDrive. `C:\DS-Starter` is fine too. Don't put it in the `OneDrive` folder inside your home folder, or in a Desktop or Documents folder that OneDrive syncs.
   - If you install inside a sync folder, you'll see `Warning: OneDrive sync can slow the install down or lock files. …` (see [troubleshooting guide A](troubleshooting.en.md)).
3. In VS Code, use **File → Open Folder** to open `DS-Starter`.
   - **It worked if** you see `package.json` and `setup-local.sh` right away in the Explorer on the left.
   - If VS Code asks "Do you trust the authors of the files in this folder?", click **Trust**. You need to trust the folder here for the project's Qwen Code settings (rule checks, Figma connection, approval mode) to apply.
4. Open **Terminal → New Terminal**, paste the command for your computer, and press Enter.

   Mac:

   ```bash
   bash setup-local.sh
   ```

   Windows:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\setup-local.ps1
   ```

5. What the install script does for you. Programs you already have are not installed again. The terminal shows step numbers (Mac `[1/6]`–`[6/6]`, Windows `[1/5]`–`[5/5]`).

   | Mac | Windows | What it does |
   |---|---|---|
   | `[1/6] Installing Homebrew` (only if missing) | — | The Mac install tool |
   | `[2/6] Node.js · pnpm` | `[1/5] Git · Node.js · pnpm` | Node.js 22 or newer and **pnpm 10.27.0** (Windows also installs Git if missing). If the version differs you'll see `Installing pnpm 10.27.0 (current: …)`, and **`pnpm 10.27.0 OK (matches package.json)`** at the end means it's fine. If it stops, see [pnpm version in troubleshooting guide A](troubleshooting.en.md) |
   | `[3/6] Qwen Code CLI` | `[2/5] Qwen Code CLI` | Installs Qwen Code for the terminal (`@qwen-code/qwen-code@0.25.1`). If it's already there: `Qwen Code CLI is already installed. Skipping it and keeping your version.` |
   | `[4/6] Figma Desktop · Qwen Code extension` | `[3/5] Figma Desktop · Qwen Code extension` | The Figma desktop app (if missing) and the Qwen Code extension (only when the `code` command works; otherwise it tells you to install it by hand → 2-2) |
   | `[5/6] Project packages · Chromium for checks` | `[4/5] …` | Project packages and the check browser |
   | `[6/6] Figma MCP · starting Storybook` | `[5/5] …` | Figma MCP settings, the `qwen --version` check, and opening Storybook |

6. A Mac may ask for your password — nothing shows up while you type, and that's normal. On Windows, if it asks "Do you want to allow this app to make changes to your device?", click "Yes".
7. The script **never asks for or saves your Token Plan key.** You connect the key in the VS Code extension in 2-3.
8. The last step checks the terminal Qwen Code version. `Qwen Code CLI version OK. Run qwen yourself, by hand, in this project folder.` means it's fine.
   - **If the CLI install fails, the rest still continues.** If you see `Qwen Code CLI install failed. The rest of the install continues.` or `Qwen Code CLI did not run. Check your PATH in a new terminal. …`, install it yourself in a new terminal after setup finishes.
     - Mac: `npm install -g @qwen-code/qwen-code@0.25.1`
     - Windows: `npm.cmd install -g @qwen-code/qwen-code@0.25.1`
   - Class uses the **VS Code extension** by default, so you can do the class without the CLI.
9. In the last step, the install **turns on the kit's checks (hooks).** They are automatic checks that help the AI follow the rules.
   - `The kit's checks are turned on for this folder (Qwen hooks approved).` means it's fine.
   - If Qwen asks **"This project wants to run hooks"**, click **Approve hooks**. Don't pick **Keep disabled**.
   - To check: type `/hooks` in the Qwen chat. If you see `approved` next to the kit's checks, they're on. If you see `disabled (not approved)`, see ["The kit's checks are off" in troubleshooting guide C](troubleshooting.en.md#the-kits-checks-are-off).
   - If you download the starter kit again or the kit changes, **run the install command again**. It turns them back on.

**It worked if** Storybook opens in your browser. If it doesn't, type `http://localhost:6006` in the address bar. At the end of setup you'll also see `In Qwen Code, type /auth and connect your Token Plan API key.` and `Qwen uses your own Token Plan credits — chat by hand, never from scripts or loops.`

- Don't close the terminal running Storybook. For other commands, open a new terminal with the **+** button at the top right of the terminal.
- If it stopped partway, run the same command again. It reuses what's installed and continues.
- To open Storybook again another day, open the `DS-Starter` folder in VS Code and tell the AI: **"Open Storybook."** The AI starts it in the background and tells you the address (unverified). If that doesn't work, run this in a new terminal as a backup: Mac `pnpm storybook`, Windows `pnpm.cmd storybook` (`Ctrl + C` in that terminal stops it).

### 3-1. Using Qwen Code in the terminal instead of the extension (optional)

**Class uses the VS Code extension (section 2) by default.** Use this only if you prefer the terminal. It uses the same Token Plan credits.

> ⚠️ **Calling Qwen automatically with `qwen -p` or a script is forbidden by the Token Plan terms.** Use it only when you chat with it yourself in the terminal. Breaking this can get your subscription suspended.

1. **Check it's installed.** Open the `DS-Starter` folder in VS Code and run this in a new terminal.

   ```bash
   qwen --version
   ```

   **It worked if** you see a version number (for example `0.25.1`). If the command isn't found, run the manual install command from step 8 above and open a new terminal.
2. **Run it yourself.** In the same project folder, type `qwen` (if Windows blocks it, `qwen.cmd`). A chat screen opens inside the terminal (screen wording unverified).
3. **Connect the key.** Same as 2-3: in the chat box, `/auth` → **Token Plan** → if it asks for a region, **Singapore (International)** → the key you copied in section 1. If you already connected it in the extension, it may not be needed again because both use the same user settings (`~/.qwen/settings.json`) (unverified).
4. **Check folder trust, hooks and MCP.**
   - If it asks whether to trust this folder, choose **Trust**, so the project rule checks (hooks) and Figma connection settings apply (that screen is unverified).
   - Type `/mcp`, and approve `figma-desktop` if it says **"Needs approval"** (section 4).
5. **Keep the approval mode on default.** The project settings use default (asks before changing things). Allow edits and commands the same way as in 2-6: read what it shows and allow once; don't pick the option that allows every change automatically (the CLI's button and option names are unverified).
6. The order plan → questions and answers → **"Approve revision N"** → build → check is the same as section 5.

### 3-2. Your 3 folders and what to tell the AI

You only use the folders whose names start with `my-`. Each one has a short `README.md` in English.

| Folder | What goes in | Tell the AI, for example |
|---|---|---|
| `my-docs/inbox/` | Your plan: PRD, user stories, notes. No documents? Fill in `my-docs/inbox/brief.md`. The AI tidies them into `my-docs/specs/`. | "Organize my PRD into specs." |
| `my-assets/` | Drop icons, pictures and fonts here. The AI sorts them into `icons/`, `images/` and `typo/`. | "Sort the files I put in my-assets." |
| `my-website/` | Your website pages (`my-website/pages/`), made from the page plan you approve ([section 6](#6-build-34-pages)). | "Make my website from my specs." |

- **Just say it in your own words.** You don't type commands. The AI runs the kit's commands for you.
- **Every time the AI runs a command, a permission prompt appears** → read what it will run, then press `Yes, allow once` (2-6).
- **Shortcut:** if you asked in your own words and the AI does something else, type the chat command at the very start of the message instead: `/my-docs`, `/my-assets`, `/my-website` or `/my-deploy` (for example `/my-docs 1. Yes`). It makes the AI follow the kit's steps exactly.
- The AI only reads `my-docs/inbox/` and `my-assets/`. It never changes your original files there.

**Your plan (`my-docs`)**

Why: the AI builds only what is written down. When a fact is missing, it doesn't make it up. It asks you.

A **PRD** (Product Requirements Document) says what you make, who it's for, and why. In the kit, `my-docs/inbox/brief.md` is **your PRD draft**. `my-docs/specs/` is **the PRD the AI tidies** for you. If you already have your own PRD, put it in `my-docs/inbox/`.

```
your notes (inbox/) → the AI writes 4 plan files (specs/) → missing facts become questions → you answer → 0 questions left → next step
```

1. Put your notes in `my-docs/inbox/`. `.md` or `.txt` work best. The AI can't read Word, PowerPoint, Excel or HWP files, so save them as `.md` or `.txt`. PDFs and pictures work only if your AI model can read them. No notes? Fill in `my-docs/inbox/brief.md`.
2. Tell the AI: **"Organize my PRD into specs."** The AI runs the kit's command (permission prompt → `Yes, allow once`) and writes four files in `my-docs/specs/`: `constitution.md`, `spec.md`, `plan.md` and `tasks.md`. Then it asks about everything missing **with choices** in the chat, up to 4 at a time. In the files, the AI marks each missing fact as `[NEEDS CLARIFICATION: …]`.
3. Pick an answer for each question. If none fits, choose **Other** and type your own. The AI writes your answers into the files. To change something in `specs/`, just tell the AI, for example: "Change the menu page title to Our Drinks." No choices on the screen? Answer with the same numbers, for example `1. No pre-order for now. 2. Our Menu`.
4. Ask the AI: **"Any questions left?"** The AI runs the check (`pnpm specs`, permission prompt → `Yes, allow once`) and shows new or changed inbox files and the questions left.

**It worked if** the AI shows `Open questions [NEEDS CLARIFICATION]: 0` and `Specs are ready. Next: ask the AI in your own words to make your website from these specs.`

- Added or changed a note later? Say **"Organize my PRD into specs"** again. It reads only the new or changed files.

A small example (a made-up café; the AI's real questions will use other words):

1. You write two lines in `my-docs/inbox/notes.md`:

   ```
   Bean There is a small café. Visitors should see our menu and find us.
   Maybe online pre-order later?
   ```

2. You say: "Organize my notes into specs." The AI writes the 4 files and asks with choices, for example: `Online pre-order: build it now, or leave it out?` (choices `Leave it out for now` / `Build it now`) and `What is the exact title of the menu page?`
3. You pick `Leave it out for now`, and for the title you choose **Other** and type `Our Menu`. The AI puts the answers in the files and lists them in `spec.md` under "Clarifications".

Who writes user stories and policies? The AI writes the first draft. You decide.

- A **user story** says who wants what, and why, in one sentence. For example: "As a visitor, I want to see the menu with prices so that I know what to order." P1, P2 and P3 show the order of importance.
- A **policy** is a rule of your service, like a rule for cancelling a booking. It goes into `spec.md` as a requirement (`FR-001` …). Write your rules in your notes.
- If something is missing, the AI doesn't make it up. It writes `[NEEDS CLARIFICATION: …]` and asks you. You answer.

Words you'll see in `my-docs`:

| Word | What it means |
|---|---|
| PRD | Product Requirements Document: what you make, who it's for, and why. `inbox/brief.md` is your draft; `specs/` is the PRD the AI tidies. |
| Spec Kit | The short plan the AI writes for you. It is 4 files in `my-docs/specs/`. |
| inbox | `my-docs/inbox/`, your notes. The AI reads them but never changes them. |
| specs | `my-docs/specs/`, the tidy plan. The AI writes it. To change it, tell the AI. |
| `constitution.md` | The rules for every step: goals, users, principles, tone, look and feel, and what is out of scope (not part of this project). |
| `spec.md` | **What** the site does and **why**: user stories, requirements and success criteria. |
| `plan.md` | **How** to build it: the Storybook parts, then the 3–4 pages with their addresses and exact words. |
| `tasks.md` | Your steps, in order. When you finish one, ask the AI to tick its box. |
| user story | One thing a visitor wants, in one sentence: "As a USER, I want TO DO SOMETHING so that REASON." |
| P1 / P2 / P3 | How important a story is. P1 = must have. P2 and P3 are less important, in that order. |
| requirement (`FR-001`) | A rule the site must follow, like "The site MUST …". FR means "functional requirement". |
| policy | A rule of your service, like a rule for cancelling a booking. It becomes a requirement (`FR-…`) in `spec.md`. |
| success criteria (`SC-001`) | How you will know the site works. Only goals from your notes, written so you can check them. |
| edge case | What happens when something goes wrong or is empty. |
| Given / When / Then | A short test for a story: Given a starting point, When the visitor does something, Then this happens. |
| `[NEEDS CLARIFICATION: …]` | A question for you. The AI writes it where a fact is missing, instead of guessing. |
| Clarifications | A list at the end of `spec.md`. Each answered question is added there as `Q: … → A: …`. |
| `sources.md` | The list of inbox files the AI already read. The kit writes it when the AI tidies your specs. Don't edit it. |

**Icons, pictures and fonts (`my-assets`)**

1. Save the files straight into `my-assets/`, not into a sub-folder. Icons: export them from Figma as SVG. Pictures: `.png` `.jpg` `.webp` `.gif` `.avif` or `.svg`. Fonts: `.woff2` `.woff` `.ttf` or `.otf`.
2. Tell the AI: **"Sort the files I put in my-assets."** The AI runs the kit's sorting command (`pnpm assets`, permission prompt → `Yes, allow once`). It moves each file into `icons/`, `images/` or `typo/` and fixes the name (for example `Hero Photo.PNG` → `hero-photo.png`). It never deletes your files.
3. If it can't tell whether an SVG is an icon or a picture, the file stays where it is and the AI asks you. Answer in words, for example: **"logo.svg is an icon."** The AI moves it (permission prompt → `Yes, allow once`).

**It worked if** the AI shows the last line `All good. Icons: <n> · Images: <n> · Fonts: <n> file(s). See Storybook → Foundation → Icons / Images / Typography.`, and you see your files in Storybook under **Foundation → Icons**, **Foundation → Images** and **Foundation → Typography**.

- A file marked `✗` needs fixing. The same line says how ([troubleshooting guide L](troubleshooting.en.md)).
- To use an icon, name the file when you build a part, for example "Use my-assets/icons/cart.svg". Pictures are optional: to use one, name a file in `my-assets/images/` when you plan a page, and give a short description of it (alt text). With no picture, the page is planned without one.
- Fonts in `my-assets/typo/` load by themselves in Storybook and on your website. To make your parts use one, see [5-2](#5-2-changing-text-styles-font-size-line-spacing--optional).
- ⚠️ Font files in `my-assets/typo/` go online with your website and Storybook, even ones you don't use. Anyone who knows the address can download them. Put a font there only if its license allows use on websites. If you aren't sure, leave it out. When you have fonts, the sorting result reminds you: `! Fonts in my-assets/typo go online with your website and Storybook, so anyone can download them.`

---

## 4. Connect Figma MCP

Figma MCP is a bridge that lets the AI read your Figma design. **Order matters.** If you change the order, the AI can't read Figma.

1. **Open your file in the Figma desktop app.** Figma in a web browser won't work. Log in with your verified student account and open the file with your design.
2. **Switch to Dev Mode.** Press `Shift + D`.
3. **Turn on MCP.** In the MCP server area of the right-hand panel, turn on **Enable desktop MCP server**.
4. **Check the connection.**
   - Tell the AI: **"Check the Figma connection."** The AI runs the check (`pnpm mcp:setup`, permission prompt → `Yes, allow once`).
   - **It worked if** the AI shows `figma-desktop connected`.
5. **Approve it once in Qwen Code.** Type `/mcp` in the chat box. At first `figma-desktop` shows **"Needs approval"**. Select it and approve. You only do this once.
   - **It worked if** `figma-desktop` no longer says "Needs approval" and shows as connected. (Wording after connecting: unverified)
6. **Now start talking to the AI.** If you opened a chat before turning Figma on, open a **new chat**. If that still doesn't work, quit and reopen VS Code (unverified).

**Keep the Figma file open** while you work. Don't install any Figma extension in VS Code (2-2).

---

## 5. How to work with the AI

The AI never builds right away. It always **asks its questions with choices, shows you a short summary in the chat, and only builds after you pick "Approve revision N".**

### 5-0. Bringing in your Figma colours — the AI does it first

When you send your first Figma link, the AI **brings in your colours before it builds any part.** You can send a part link, or say "Import my Figma colours." with a link. You don't type any command.

| Step | What you do | It worked if |
|---|---|---|
| ① Send a link | Send a Figma link and a one-line request. | The AI says something like "I'll bring in your colours first." |
| ② Allow | When the permission prompt appears, press `Yes, allow once`. The AI runs the colour import command. | The AI tells you in a line or two what came in (for example, colours added or changed). |
| ③ Pick colour roles at once | If roles (background, text, main colour and so on) are empty, the AI shows a **recommended table** (role → colour, why) and asks once. If it looks fine, pick **"Use these roles (Recommended)"**. To change some, pick **"Change some roles"**; the AI asks only about those roles. | The AI shows a short summary. |
| ④ Approve | If the summary is right, pick **"Approve revision N"**. Press `Yes, allow once` if a prompt appears. | The AI applies the colours and moves on to the part plan. |

- **You can send a part link with new colours later.** The AI brings the colours in again and tells you briefly what is different (colours added, values changed). Colours you brought in before are not deleted.
- **If you changed a colour value in Figma,** send a part link that uses it, or say "Import my Figma colours again." with a link. The roles stay; only the values change.
- **If the AI asks you to type a command, edit a file or turn off a protection, don't.** The AI either does it itself or it isn't allowed. Take a screenshot and show your instructor.
- If the AI says `Type /mcp in the chat, approve figma-desktop, then start a new chat.`, type `/mcp` in the chat, approve `figma-desktop`, and open a **new chat** (section 4).

### 5-1. Building a part, step by step

Open a **new chat for each part**. The plan file keeps your decisions, and a short chat uses far fewer credits.

| Step | What you do | It worked if |
|---|---|---|
| ① Ask | Send a one-line request and a Figma link in the chat. | The AI starts reading Figma. |
| ② Get questions | Wait. | The AI shows its questions as choices in the chat. |
| ③ Answer | Pick an answer for each question (none fits? choose Other and type your own). Tell it in words if anything is wrong. | The questions are gone and the AI shows a short summary in the chat. |
| ④ Approve | Read the summary. If it looks right, pick **"Approve revision N"**. (No choices? Write: "Approve revision 1. Go ahead with this plan.") `Yes, allow once` in the permission prompt is not an approval (2-6). | The AI starts creating files. |
| ⑤ Checks | The AI runs the checks itself (`pnpm ai:check <Name>`, `pnpm ai:verify <Name>`; permission prompt → `Yes, allow once`). If it doesn't, say "Run the checks." Look at the results together. | The AI shows a "passed" message. |
| ⑥ Check with your own eyes | In Storybook, compare how it looks and moves with Figma. If something's off, ask again. | It looks the same as Figma. |

Example request

```
Build this Figma node as a Storybook component in this project.
https://www.figma.com/design/...?node-id=...
```

Watch out

- We recommend the **default** approval mode (it asks before changing things). Switching to an auto-approve mode can let unwanted changes in or use more credits (2-5).
- Order: **tokens first** (colors, text, spacing) → then **components** (button, input, …) one at a time.
- Want only some of the types in a Figma part? Say so with the link, for example "Only the Default Card type for now." The AI builds only those types.

**If the AI says this (Figma reading and check time notices)**

Qwen Code has to finish reading Figma or running checks within a minute. If it takes longer, the AI tells you one of the messages below and stops. **These aren't errors.**

| What the AI says | Meaning | What you do |
|---|---|---|
| `Still reading the Figma design. Send the same request again in 1–2 minutes.` | It's still reading Figma in the background. | Wait 1–2 minutes and send **exactly the same request (same link)** again. Don't change the request or the link. When you resend it, it uses what it already read and doesn't read Figma again. |
| `Figma did not answer. Make sure the Figma desktop app is open with this file, then send the same message again.` | Figma didn't send the design, so the AI stopped (no plan, no drawn icons). | Open this file in the Figma desktop app (MCP on), then send **exactly the same message** again — it reads Figma again. Still the same? Ask the AI "Check the Figma connection." → `figma-desktop connected` (section 4). |
| `This link is a big frame or a whole page. Please send the link to the one part you want to build.` | The link points to a whole screen or a big frame. | For a **website**, say so with the link, for example "Make my website from this Figma screen Home: <link>". The AI saves the picture by itself (6-2). For a **part**, select the part (component set) you want to build in Figma, use **Copy link**, and send that address. |
| `Some checks did not run in time — run pnpm ai:check <Name> … again yourself with the shell tool now. …` | It couldn't finish all checks in time. It's not "checks passed" yet. | The AI runs the same check again by itself (permission prompt → `Yes, allow once`). Only if that also doesn't finish does the AI ask you to type the command in a new terminal (for example `pnpm ai:check Button`, or `pnpm ai:check-page <Name>` for a page). Then look at the result. |

- If you see `Request timed out waiting for hook-execution-response`, you may have an older starter kit. If you downloaded the ZIP before the version date on the pre-class page, download the latest ZIP again with the link in section 3 ([troubleshooting guide C](troubleshooting.en.md#c-qwen-code-panel-ai-chat)).

### 5-2. Changing text styles (font, size, line spacing) — optional

**By default you don't change them.** Text uses the starter kit's defaults. There's nothing to do and it costs no credits. When the AI imports your Figma colours (it runs `pnpm ds:figma`) and shows the line below, just leave it as it is.

```text
Text: the starter defaults stay. If you do not change them, you need no text plan and no extra steps.
```

**Only if you want your Figma text styles**, follow these steps.

1. **Finish applying the colour roles first.** Approve and apply your colour plan (`docs/plans/tokens.md`) before this.
2. Ask the AI for a text plan. For example: "I want to use my Figma text styles. Please make a text plan (`docs/plans/typography.md`)." The AI writes it using the `docs/templates/typography-plan.md` template. When the permission prompt appears for that file, press `Yes, allow once` (2-6).
3. Answer the AI's questions by picking a choice (or type your own in Other). For example: one **main font** out of several, and the **unit of a line height** that has none (percent, px or multiplier). Don't guess the unit from the number; check it in the Figma original.
4. **Check the font you chose.** In Storybook → Foundation → Typography it should show as **Loaded** (its file is in `my-assets/typo/`, see [3-2](#3-2-your-3-folders-and-what-to-tell-the-ai)), or it should be your computer's system font. When the AI asks with choices whether the font shows as Loaded, pick **Yes**. (The prepare command only passes after this.)
5. The AI prepares the plan. If it doesn't, tell it: **"Prepare the text plan."** The AI runs the prepare command (`pnpm ds:apply-token-plan docs/plans/typography.md --prepare`, permission prompt → `Yes, allow once`). It doesn't approve anything; it only shows the values that will change.

   **It worked if** the AI shows `Updated the text style plan's source, base token and content hashes. status is review-required. Summarize the changes for the student in the chat and ask them to approve with a choice (Approve revision N / Change something).` and a list of tokens that will change (lines like `--font-sans → …`).
6. The AI shows the values that will change in the chat. If they look right, pick **"Approve revision N"**. If something needs fixing, pick **"Change something"** and say what; the AI fixes the plan and starts again from step 5.
7. After you approve, the AI runs the same command without `--prepare` (permission prompt → `Yes, allow once`). If it stops before that, say: **"Apply the text plan."**

   **It worked if** the AI shows `Applied the approved text style plan and regenerated with ds:tokens. Tokens changed: <n>. All other tokens stay the same.`
8. Look at the text in Storybook, and **redo the visual review** for any part whose look changed because of the text.

Good to know

- You can only change **text tokens that already exist**: the font (`--font-sans`), text sizes (`--text-body-2`, `--text-body-1`, `--text-title`), weights (`--font-weight-*`) and line spacing (`--leading-tight`, `--leading-normal`). No new text names are created.
- To use your own font file, drop it into `my-assets/` and ask the AI to sort my-assets (3-2). It then loads by itself in Storybook and on your website. If a font has no file in `my-assets/typo/` and isn't on the computer, the browser **shows a different font instead.**
- Use only a font whose license allows use on websites. Its file goes online and anyone can download it (3-2).
- **When you need to approve again:** if the AI imports Figma again after you changed text, the token step (`pnpm ds:tokens`, run by the AI) may stop with `Text style plan: The source or base tokens behind the saved text style choices changed. Approve the text style plan again.` Nothing is broken. Tell the AI: **"Approve the text plan again."** It makes a new revision, and you redo steps 5–7 (prepare → pick "Approve revision N" → apply). Do the same if applying shows `The text style source or base token hash does not match. Review it as a new revision.`
- **To go back to the default text styles,** run the command below in the terminal **yourself**. It removes choices you approved, so you confirm it with your own hands. ⚠️ **Don't ask the AI to do it** — running it from the AI's shell or a pipe is refused.

  ```bash
  pnpm ds:reset-typography
  ```

  1. It explains what it will do: `This removes all approved text style choices and regenerates the project's default font, sizes, weights and line heights.` / `Color roles, the Figma source and existing plans are kept. …`
  2. At `If you checked this yourself and agree, type "reset text styles" (anything else cancels):`, type **`reset text styles`** exactly and press Enter. Anything else shows `Text style reset canceled. Nothing was changed.` and nothing changes.

  **It worked if** you see `The student confirmed. Text styles are back to the defaults and were regenerated with ds:tokens.` / `The old text style plan was kept. …`
  - **Colour roles, the Figma original and your plans (including `docs/plans/typography.md`) stay as they are.** Only the text tokens change.
  - Afterwards, look at the screen in Storybook and redo the visual review for any part whose look changed because of the text.
  - If you were already on the defaults, you'll see `Text styles already use the defaults. Nothing was changed.` Nothing to do.
  - To switch to your own text styles again, redo steps 1–8 above (the AI makes a new revision and starts from prepare).

---

## 6. Build 3–4 pages

Pages work like parts: **plan → questions and answers → you approve → build → check → look with your own eyes**. The difference is that the page skeleton is made by **a kit command that the AI runs (`pnpm ds:page`)**, not written by the AI, so it uses fewer credits.

### 6-1. Rules to keep

- Pages are built **only from parts in the parts list.** Don't make new buttons or new styles inside a page.
- **Starter parts you haven't changed can go on a page right away.** Ask the AI: **"Check if I can use Button on a page."** The AI looks it up in the parts list (`pnpm ds:catalog Button`, permission prompt → `Yes, allow once`) and shows `Status: starter`, `Page use: full public API` and `Reason: Starter part, unchanged`.
- **A part you changed or built with the AI is blocked until you check it yourself.** The parts list then shows `Page use: blocked`, for example with `Reason: Starter part changed: …`.
  1. Look at the part in Storybook: every look, hover, press, Tab and disabled.
  2. In a new terminal, run `pnpm ds:review <Name>` **yourself** (for example `pnpm ds:review Button`). It records that you checked it with your own eyes, so the AI must not do it for you — it is refused from the AI's shell.
  3. Answer the questions: your name, which numbered examples you checked, and yes or no for each check. At `Save the selected scope and answers?`, answer `yes`.
  - **It worked if** you see `Review saved: <Name> (approved)`. Pages can then use only the looks and states you checked. If you answer `no` to a check, the review is saved as `rejected` and the part stays blocked.
- Trying to use a blocked part, or a look you didn't check (for example Button with an icon), stops with `BLOCKED_CATALOG: …` ([troubleshooting guide H](troubleshooting.en.md)).
- Don't put real names, phone numbers or other personal details. Once deployed, anyone with the link can see them.

### 6-2. Steps

1. **Finish your plan first.** Ask the AI **"Any questions left?"** It should show no open questions ([3-2](#3-2-your-3-folders-and-what-to-tell-the-ai)).
2. **Ask the AI for your website. If you have Figma screens, send their links with it.** For each page, in Figma select the screen frame and choose **Copy link to selection**. For example: **"Make my website from these Figma screens. Home: <link> Menu: <link>"**. You don't type any command — the AI first checks the Figma connection and saves a picture of each screen (permission prompt → `Yes, allow once`).

   **It worked if** the AI shows `Figma MCP: connected.` and `Saved: my-website/figma/Home.png`. This picture is only for comparing at the end. It is not a picture for your page. Each screen uses 2 Figma MCP calls (Starter: 20 a month).
   - If the AI says it could not connect, check the connection first ([chapter 4](#4-connect-figma-mcp)): open the file in the Figma app, turn on Dev Mode → Enable desktop MCP server, then send the same message again.
   - If it still doesn't work, export the picture yourself as a backup: select the frame → in the right panel, **Export** → **PNG**, **1x** → **Export**, and save it as `my-website/figma/Home.png` ([troubleshooting guide I](troubleshooting.en.md#i-building-pages-dspage--aicheck-page--webbuild)).
3. **The AI writes the page plan.** It reads `my-docs/specs/plan.md` and `my-docs/specs/spec.md`, looks up only the parts it needs, and writes an English page plan `docs/plans/pages/<SiteName>.md` from the `docs/templates/page-plan.md` template (permission prompt when it writes the file → `Yes, allow once`, 2-6). Then it asks its questions with choices and waits for you.
   - If your plan still has open questions, it asks you to finish your specs first (3-2).
   - The plan covers the site title and language, the list of pages and their addresses (the first page is `/`), for each page its sections → parts → text, links between pages, and layout for screen sizes. The AI tells you these in its summary.
4. **Answer the questions and ask it to fix anything wrong.** Pick a choice for each question (or type your own in Other). You decide the text, links and layout. Until every question is answered, it can't be approved.
5. **Approve.** Read the AI's short summary in the chat (pages, addresses, words, what is left out, 0 questions left). If it's right, pick **"Approve revision N"**. (No choices? Write: "Approve revision 1. Go ahead with this plan.")
6. **The AI makes the page skeletons.** After you approve, the AI runs the kit's page command (`pnpm ds:page`, permission prompt → `Yes, allow once`).

   **It worked if** the AI shows `Made the page skeleton from the approved plan: <files>. Connect the data/event slots you declared, then check with ai:check-page. The human review is a separate step.` `my-website/pages/<Name>Page.tsx` and `.css` files and the site settings (`web.config.json`) are created. Existing files are never overwritten.
7. **The AI fills the blanks.** The skeleton has blanks (`PAGE_SLOT`) such as what happens when a button is pressed. The AI fills only the behaviour decided in the plan. If it stops before this, say: **"Fill the blanks in my pages, only what the plan says."**
8. **The AI checks each page.** It runs the page check for every page, then the type, rule and build checks (`pnpm ai:check-page`, `pnpm typecheck`, `pnpm ds:guard`, `pnpm web:build`; permission prompt → `Yes, allow once` each time) and shows you the results.

   **It worked if** the AI shows `<Name>: static check passed, READY_FOR_REVIEW. A person must still check the real screen, events and responsive layout, and compare it with the original.` for each page. If you see errors, see [troubleshooting guide I](troubleshooting.en.md).
   - If `Check the visuals again (the behavior review and page use still count): …` also appears, it's a notice, not an error. Keep building, and look at that part's colours and shapes again later.
9. **Look with your own eyes.** Tell the AI: **"Open my site."** The AI starts it in the background and tells you the address (unverified). If that doesn't work, run `pnpm web:dev` in a new terminal as a backup (Windows: `pnpm.cmd web:dev`). Type each page's address into the browser yourself (for example `/` and `/menu`) and reload. Check links, the back and forward buttons, buttons and inputs, and the layout when the window is narrow. **Passing the check (READY_FOR_REVIEW) doesn't mean a person has checked it.**
   - If there are Figma pictures, the AI runs `pnpm web:compare` at the end and tells you the compare page path (`var/compare/<Page>/index.html`) (permission prompt → `Yes, allow once`). Open that file in your browser: Figma is on the left and your site is on the right, and **Overlay** lays one over the other. Look at sections, order, words, colours, spacing, pictures and missing parts. There is no score. To fix a difference, ask the AI for a plan revision.
   - It doesn't have to be exactly the same. Fonts and browsers draw a little differently, so small differences are normal.

- To change the plan, tell the AI what to change. It makes a new revision, shows you the summary again, and you approve again. Pages you already made aren't changed automatically, so compare them with the plan and fix them with the AI.

### 6-3. Putting it on the internet (deploying)

Why: right now your site opens only on your computer. Deploying puts it on the internet, so anyone with the link can open it. We do it together in class. More details are in the [deploy guide (Korean)](../vercel-deployment.md).

Words you'll see:

- **Preview** — a test address. Check your site there first.
- **Production** — the real address that anyone can open.
- **token** — a secret key, like a password for a program. Vercel gives it to you (way 2 only).
- **repository** — a project folder stored on GitHub (way 1 only).
- **commit** — a saved snapshot of your changes, with a short message (way 1 only).
- **branch** — a separate line of work in your repository (way 1 only).
- **Production Branch** — the one branch that Vercel puts on the real address (way 1 only).

**The class uses way 2**

**In class we use way 2 (Vercel only).** Way 1 (GitHub) is a choice for students who want it. It is at the end of this section: "Optional: way 1 — GitHub".

You pick one way the first time. Both give you the same website. One project keeps one way.

| | Way 1 — GitHub | Way 2 — Vercel only |
|---|---|---|
| The AI's choice | "GitHub + Vercel" | "Vercel only (Recommended)" |
| You need | A GitHub account, your own repository, GitHub sign-in on your computer, and Vercel connected to that repository | Only your Vercel account and a Vercel token |
| Good | Every change you upload is kept on GitHub | Less to set up. You paste the token once, and this computer remembers it |
| Not so good | More to set up in class. You sign in to GitHub once in a terminal | You make a token in Vercel first |
| Preview | Made on a work branch | Made right away |
| Production | Made on the Production Branch (we move there together in class) | Made after you choose it |

Not sure? Pick **way 2**. You already signed up for Vercel before class, so you can start right away.

**Before you start**

- Your pages must be made and connected first (6-2).
- The fonts in `my-assets/typo/` go online too. Keep only fonts you have permission to publish on a website (3-2).
- Way 2: make a Vercel token. In Vercel, open **Account Settings → Tokens → Create**. Set **Expiration** to about the day the class ends. Copy the token and keep it like a password. You will paste it into a browser window later, never into the chat.

**Way 2 — Vercel only (the class way)**

1. Tell the AI: **"Put my site online."** (Shortcut: type `/my-deploy`.)
2. The first time, the AI asks you with choices. Click your answers:
   - Way: **Vercel only (Recommended)**.
   - What: **My website (Recommended)**, or **My Storybook** to put Storybook online.
   - Project name: pick one of the names the AI suggests, or type your own in **Other**. Use only lowercase letters, numbers, `.`, `_` or `-`. Use a **new** name. Don't reuse a Vercel project that is connected to GitHub.

   Next time, the AI uses the same answers and doesn't ask again.
3. An approval window appears for each step. Read it and click **Yes, allow once**. The AI runs the deploy commands itself. You don't type anything in a terminal.
   - First the AI checks your site on your computer. This uploads nothing. **It worked if** you see `Local deploy check passed: web → dist/. Check the screen and behavior separately.` If there is a problem, the AI explains it in plain words and tells you which step to go back to.
4. The first time only, a browser window opens by itself. Its title is **"Paste your Vercel token"**. Paste your token there and press **Save**.
   - `Saved. Go back to VS Code.` means it worked. Go back to VS Code. The chat shows `Your Vercel token works. It is saved on this computer, outside your project, so you will not be asked again. …`
   - `This token does not work. Make a new one in Vercel and paste it again.` means the token is wrong. Make a new token in Vercel and paste the new one.
   - No window? The chat shows `The browser did not open by itself. Open this address in your browser: http://127.0.0.1:…`. Copy that address into your browser. It works only on this computer and only once.
   - Paste it within 8 minutes. If not, you see `No token was entered. Ask the AI to deploy again.`
5. The AI shows the **Preview** address (`Vercel Preview deploy Ready: https://…`). Open it. Check every page: reload, fonts, icons, clicks and typing.
6. The AI asks: **Put it online for everyone (Production)** or **Not yet**. Choose Production only when the Preview looks right.
7. **It worked if** the AI shows `Vercel Production deploy Ready: https://…`. That is your real address. Open it and check it again.

Next time you change your site, just say **"Put my site online."** again. No token question this time.

Token rules

- ⚠️ **Never paste the token into the AI chat.** Paste it only into the browser window that the kit opens.
- If you pasted it into the chat by mistake: delete that token in Vercel now (**Account Settings → Tokens**). Make a new one. Paste the new one only into the browser window.
- Never put the token in a file, a screenshot or GitHub.
- If the saved token stops working (it expired, or you deleted it in Vercel), you see `The Vercel token saved on this computer does not work anymore (it may have expired). Make a new one in Vercel.` The browser window opens again. Make a new token and paste it there.
- To remove the token from this computer (for example after the class ends), tell the AI: **"Forget my Vercel token"**. You see `Your saved Vercel token was deleted from this computer.` (or `There is no saved Vercel token on this computer.`). If you don't need it anymore, also delete it in Vercel → Account Settings → Tokens.

Both ways (way 2 and way 1)

- A deploy can take up to about 9 minutes. Wait for it. If Vercel is slow, you see `Vercel is still working. Check the Deployments page in Vercel, or ask the AI to deploy again.` Open your project in Vercel → **Deployments** and see if it becomes **Ready**.
- If you see a line that starts with `Ask the student: …`, that's normal. The AI asks you with choices and runs it again.
- Ask the AI to check again any time ("Check if my site is ready to deploy."). It only checks and uploads nothing. The first line of the result shows your setup, for example `Deployment method: Vercel REST API · target: web`.
- Uploading isn't the end. Wait for **Ready**. Then open the address and check every page yourself: reload, fonts, icons, clicks and typing.
- If you see an error, see [troubleshooting guide J](troubleshooting.en.md).

**Optional: way 1 — GitHub**

Do this only if you chose way 1 instead of way 2.

Getting ready (in class, together): sign up at GitHub. Make your own empty repository there (not the instructor's). Set your name and email in Git. Let Vercel use your GitHub repository.

Sign in to GitHub once. **This is the only thing you type yourself for way 1.** In VS Code, open **Terminal → New Terminal** and run these two commands, one at a time:

```bash
gh auth login
gh auth setup-git
```

1. Tell the AI: **"Put my site online."** The first time, choose **GitHub + Vercel**. Then choose what to put online. Type your own GitHub repository address in **Other** (for example `https://github.com/<your-id>/<your-repo>.git`).
2. Click **Yes, allow once** for each step. The AI connects once. It may open the Vercel login page in your browser (unverified). **It worked if** you see `Connected. Current branch: <branch>; production branch: <branch>. …`
3. Preview: do this on a work branch, not the Production Branch. The AI makes a commit, uploads it to your GitHub repository and waits for Vercel. **It worked if** you see `Vercel Preview deploy Ready: https://…`
4. Production: first check the Preview. Then bring the changes to your Production Branch (we do this together in class). On that branch, choose **Put it online for everyone (Production)**. **It worked if** you see `Vercel Production deploy Ready: https://…`

- If you see `GitHub needs you to sign in once. …`, do the sign-in above. Then ask the AI to deploy again ([troubleshooting guide J](troubleshooting.en.md)).
- The kit never switches branches and never force-pushes (overwrites GitHub). Preview stops on the Production Branch. Production stops on any other branch.

---

## 7. Save credits

Every time you send a request, the AI also receives **hidden basics (rules, tool descriptions, about 20,000 tokens) plus the whole chat so far.** So the longer the chat and the more requests you send, the faster your credits go.

1. **Start with a light model.** For simple questions, explanations and small fixes, use a light model (for example `qwen3.8-flash`, `qwen3.6-flash`). Switch with `/model`. We'll tell you which model to use for which job after we measure usage. (your instructor will tell you in class)
2. **Thinking only when needed.** Thinking tokens cost credits too (2-5). Recommended setting: (your instructor will tell you in class).
3. **Keep the approval mode on Ask Approval (default).** Classifier Approval (auto) mode calls an extra AI to decide, which uses more credits (2-5).
4. **Long chat? Start a new one.** When you finish a component, open a new chat. The plan (MD file) keeps what you decided, so you can continue in the new chat.
5. **Don't repeat the same request.** Even if the answer is slow, don't send the same request again and again. Each one costs credits.
6. **One at a time.** Don't run several chats (sessions) at once. Keep only the VS Code extensions you need (no Figma extension, 2-2).
7. **Keep the default text styles.** If you don't change text (font, size), there's nothing to do and no credits are used (5-2).
8. **Check your usage** under **Token Plan → My Subscriptions** in the Model Studio console: <https://modelstudio.console.alibabacloud.com/ap-southeast-1/subscription/token-plan>
   - **My Subscriptions → Plan Quota → Monthly Usage** shows this month's usage as **a percentage of your monthly credits (45,000)**. **1% ≈ 450 credits, 0.01% ≈ 4.5 credits.** It only shows two decimal places, so very small changes don't show.
   - Write down the percentage before and after a task to see what it cost. For example, 0.20% → 0.57% is 0.37 points ≈ 167 credits.
   - On your computer, tell the AI: **"Show my usage table."** The AI runs the usage command (`pnpm ai:usage`, permission prompt → `Yes, allow once`) and shows a table of requests and tokens by date, chat and model. You can add a date: "Show my usage table since 2026-11-01."
   - The token numbers in that table are different from console credits (the token-to-credit rate isn't public). A problem where the same requests were counted twice has been fixed; in our measurement the table now comes close to the console's tokens. Records that may be duplicates aren't added and are reported as a warning ([troubleshooting guide F](troubleshooting.en.md)). **For credits left, the console is the accurate one.**
9. **Get a feel for the cost.** We measured this once on 2026-10-19, in the same order a student would (model `qwen3.7-plus`, a single sample, so treat it as a guide).

   | What was done | Credits used | Share of a month |
   |---|---|---|
   | **Kit commands the AI runs** such as importing Figma colours or making tokens | The command itself uses no AI, but the AI running it and explaining the result costs about one chat request | not measured yet |
   | **Colour role plan**: make → questions and answers → one error fixed → approve and apply | about 27 | about 0.06% |
   | **One complex part** (Pagination): plan → questions and answers → approve → build → checks passed | about 167 | about 0.4% |
   | Building pages | not measured yet | — |

   - At about 0.4% per part, there's room to finish your design system and pages within a month even with a few extra fixes. Still, repeating the same request many times adds up quickly.
   - Look at the console percentage once a week, and tell your instructor if it's rising faster than expected.

---

## 8. FAQ — where people get stuck

> For error messages not listed here, see the [troubleshooting guide](troubleshooting.en.md). It collects the real messages from install, Storybook, the AI, Figma, checks, reviews, pages and deploying, grouped by where they come from.

### The AI takes too long, or shows an error (`429`, 504, …)

At busy times requests may wait in line. Wait about a minute and send it again. **Don't send the same request many times in a row** — each one costs credits. If it still seems stuck, open a **new chat** in the Qwen Code panel and start again.

- If you see `429 insufficient_quota`, you've used up this month's credits. Check the console and let us know in the channel.

### The AI can't read my Figma design

Order matters.

1. In the Figma desktop app, open the file that contains the node you linked.
2. Press `Shift + D` to switch to Dev Mode and turn on **Enable desktop MCP server**.
3. Tell the AI **"Check the Figma connection."** and check that it shows `figma-desktop connected` (permission prompt → `Yes, allow once`).
4. Type `/mcp` in the Qwen Code chat. If `figma-desktop` says **"Needs approval"**, approve it.
5. Then open a **new chat** and send your request with the link.

If your chat was opened before you turned Figma on, open a new chat. Keep the Figma file open while you work.

### The AI tells me to type `/mcp`

If the AI says `Type /mcp in the chat, approve figma-desktop, then start a new chat.`, you haven't allowed the Figma connection in this folder yet. Type `/mcp` in the chat, select `figma-desktop`, approve it, then open a **new chat** and send the same request again. Until then the AI does not carry on with the sample colours.

### I'm worried about the Figma call limit

Figma limits how often the AI can read your design. Starter plans and View or Collab seats get **20 reads a month**; the Education plan and Professional Full or Dev seats get **200 reads a day**. That's why we recommend the **Education plan (student verification)** (section 0). If you send the same link again within a few minutes, the AI reuses what it already read and doesn't call Figma again. Don't send the same request over and over.

### The AI says "The kit's checks are off."

The kit's checks (hooks) are off, so the AI stopped. Run the install command again, run **Developer: Reload Window** in VS Code, then open a **new chat** ([troubleshooting guide C](troubleshooting.en.md#the-kits-checks-are-off)).

### The AI says "Please show this screen to the instructor."

A kit command stopped with an error, or the AI got blocked twice at the same step, or the same check failed 3 times (`The same check failed 3 times: …`). The AI stops instead of trying other ways. After your instructor has looked, send a new message and the AI can try again. **Take a screenshot and show your instructor.** Don't type commands or edit files yourself.

### The AI asks me to type a command, edit a file or turn off a protection

Don't. The AI runs kit commands itself and you only press the permission prompt. The `.ds` folder, token files and kit files are not yours to edit. Take a screenshot and show your instructor.

### I get a `401` error (InvalidApiKey, invalid access token)

- Check that you're using your Token Plan key. A normal Model Studio key (made on a different page) won't work.
- Check that the address is Singapore (`token-plan.ap-southeast-1...`).
- When you paste the key again, make sure there are no spaces before or after it.

### I get `404 model_not_found` or `403 AccessDenied.Unpurchased`

The model name is wrong, or the model isn't available on Token Plan Personal. Switch to a model in the `/model` list.

### Usage in the console stays at 0

Either you haven't used it yet, or you're connected with a key that isn't your Token Plan key. A different key can be **billed separately from your subscription**. Go back and check step 2-3 right away.

### After installing, a new terminal can't find a program (`command not found`, "is not recognized")

The program is installed, but the new terminal doesn't know where it is.

1. First, run the same install command again (section 3, step 4).
2. Check versions in a new terminal. If every line shows a number, skip step 3.
   - Mac: `node --version`, `pnpm --version`
   - Windows: `node --version`, `pnpm.cmd --version`
3. Only if pnpm isn't found, register the npm global path.
   - Mac (run only once):

     ```bash
     cat >> ~/.zshrc <<'EOF'

     # DS-Starter: Homebrew and npm paths
     if [ -x /opt/homebrew/bin/brew ]; then
       eval "$(/opt/homebrew/bin/brew shellenv)"
     elif [ -x /usr/local/bin/brew ]; then
       eval "$(/usr/local/bin/brew shellenv)"
     fi

     if command -v npm >/dev/null 2>&1; then
       if ds_npm_prefix="$(npm prefix -g 2>/dev/null)" && [ -n "$ds_npm_prefix" ]; then
         export PATH="$ds_npm_prefix/bin:$PATH"
       fi
       unset ds_npm_prefix
     fi
     EOF

     source ~/.zshrc
     ```

   - Windows (PowerShell):

     ```powershell
     $dsMachinePath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
     $dsUserPath = [Environment]::GetEnvironmentVariable('Path', 'User')
     $env:Path = "$dsMachinePath;$dsUserPath;$env:Path"

     $dsNpmPrefix = npm.cmd prefix -g
     if ($LASTEXITCODE -ne 0 -or -not $dsNpmPrefix) {
         throw 'Could not find the npm folder. Check that Node.js and npm are installed correctly.'
     }
     $dsNpmPrefix = $dsNpmPrefix.Trim()

     if (($dsUserPath -split ';') -notcontains $dsNpmPrefix) {
         [Environment]::SetEnvironmentVariable(
             'Path', "$dsNpmPrefix;$dsUserPath", 'User'
         )
     }

     $env:Path = "$dsNpmPrefix;$env:Path"
     ```

4. If it still fails, quit VS Code completely, open it again, and repeat step 2. If it still doesn't work, take a screenshot of the whole error and ask in the channel.

### The install script says it needs "Node.js 22" or newer

Right after Node.js is installed, you may need a new terminal. Run the same install command again in a new terminal.

### The install script says "The code command is missing"

That's not an error. Install `Qwen Code Companion` (by qwenlm) yourself from the VS Code Extensions view (2-2). The rest of the install keeps going. On a Mac, you can also run `Shell Command: Install 'code' command in PATH` (see "Mac vs Windows" in section 2), then run the install command again in a new terminal.

### Windows: "running scripts is disabled on this system"

Add `.cmd` to the end of the command name. For example: `pnpm` → `pnpm.cmd`

### My Figma student verification isn't done yet

Approval can take a few days. Do the other installs first, and do section 4 (Figma MCP) once you're approved.

### Dev Mode works, but I don't see Enable desktop MCP server

Check that ① you're in the Figma desktop app, not a browser, and ② the app is up to date. If it's still missing, it may be because of your account type. Take a screenshot and ask in the channel.

---

## Sources

- Token Plan overview (international): <https://www.alibabacloud.com/help/en/model-studio/token-plan-overview>
- Token Plan Personal quick start (international): <https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-quick-start>
- Token Plan Personal FAQ (international): <https://www.alibabacloud.com/help/en/model-studio/token-plan-personal-faq>
- Token Plan Personal overview (China site, English): <https://help.aliyun.com/en/model-studio/token-plan-personal-overview>
- Token Plan Personal FAQ (China site, English): <https://help.aliyun.com/en/model-studio/token-plan-personal-faq>
- Qwen Code setup (Alibaba): <https://www.alibabacloud.com/help/en/model-studio/qwen-code>
- Qwen Code VS Code extension: <https://qwenlm.github.io/qwen-code-docs/en/users/integration-vscode/>, <https://marketplace.visualstudio.com/items?itemName=qwenlm.qwen-code-vscode-ide-companion>
- Qwen Code settings: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/settings/>
- Qwen Code authentication: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/auth/>
- Qwen Code MCP: <https://qwenlm.github.io/qwen-code-docs/en/users/features/mcp/>
- Qwen Code trusted folders: <https://qwenlm.github.io/qwen-code-docs/en/users/configuration/trusted-folders/>

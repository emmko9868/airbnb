# my-docs — your plan

This folder holds your plan: **what you want to build**. The AI reads it and writes a short plan called a "Spec Kit". Your Storybook parts and your website follow that plan.

Why? The AI builds only what is written down. When something is missing, it doesn't make it up. It asks you.

## The big picture

```
your notes (inbox/) → the AI writes 4 plan files (specs/) → missing facts become questions → you answer → 0 questions left → next step
```

| Folder | Who writes | What's in it |
|---|---|---|
| [`inbox/`](inbox/) | You | Your notes and documents: a plan, a PRD (a document that lists what a product must do), user stories, meeting notes, links. The AI only reads them. |
| [`specs/`](specs/) | The AI (you tell it what to change) | The tidy plan: `constitution.md`, `spec.md`, `plan.md` and `tasks.md`. |

## How to use it

1. **Put your notes in `inbox/`.** No documents? Fill in [`inbox/brief.md`](inbox/brief.md). Short notes are fine.
2. **Ask the AI in the Qwen chat:** "Organize my documents into specs." The AI runs the kit's command (an approval box appears: choose **Yes, allow once**) and writes the files in `specs/`. Then it asks about everything missing **with choices** in the chat, up to 4 at a time.
3. **Answer the questions** by picking a choice. If none fits, choose **Other** and type your own answer. The AI writes your answers into `specs/`. No choices on the screen? Answer in the chat with the same numbers: `1. … 2. …`.
4. **Ask the AI:** "Are there any open questions left?" It runs the check and shows how many questions are left.
5. **Go on when no questions are left.** Follow `specs/tasks.md`: bring in your Figma colors, build your parts, then ask the AI: "Make my website from my specs."

It worked if the AI shows `Open questions [NEEDS CLARIFICATION]: 0` and `Specs are ready. Next: ask the AI in your own words to make your website from these specs.`

Added or changed a note later? Ask again: "I changed my documents. Update my specs." The AI reads only the new or changed files. To change a line in `specs/`, just tell the AI what to change.

If the AI does something else, say it again more clearly. Shortcut if that still fails: start your message with `/my-docs`.

## A small example

This is a made-up café. The AI's real questions will use other words.

1. You write two lines in `inbox/notes.md`:

   ```
   Bean There is a small café. Visitors should see our menu and find us.
   Maybe online pre-order later?
   ```

2. You say "Organize my documents into specs." The AI writes the 4 files and asks with choices, for example:

   ```
   Online pre-order: build it now, or leave it out?
     ( ) Leave it out for now   ( ) Build it now   ( ) Other
   What is the exact title of the menu page?
   ```

3. You pick **Leave it out for now**, and for the title you choose **Other** and type `Our Menu`. (The real screen may look a little different; unverified.)

The AI puts your answers in the files. It also writes them down in `spec.md` under "Clarifications".

## Words you'll see

| Word | What it means |
|---|---|
| Spec Kit | The short plan the AI writes for you. It is 4 files in `specs/`. |
| `inbox/` | Your notes. The AI reads them but never changes them. |
| `specs/` | The tidy plan. The AI writes it. To change it, tell the AI. |
| `constitution.md` | The rules for every step: goals, users, principles, tone, look and feel, and what is out of scope (not part of this project). |
| `spec.md` | **What** the site does and **why**: user stories, requirements and success criteria. |
| `plan.md` | **How** to build it: the Storybook parts, then the 3–4 pages with their addresses and exact words. |
| `tasks.md` | Your steps, in order. When you finish one, ask the AI to tick its box. |
| user story | One thing a visitor wants, in one sentence: "As a USER, I want TO DO SOMETHING so that REASON." |
| P1 / P2 / P3 | How important a story is. P1 = must have. P2 and P3 are less important, in that order. |
| requirement (`FR-001`) | A rule the site must follow, like "The site MUST …". FR means "functional requirement". |
| success criteria (`SC-001`) | How you will know the site works. Only goals from your notes, written so you can check them. |
| edge case | What happens when something goes wrong or is empty. |
| Given / When / Then | A short test for a story: Given a starting point, When the visitor does something, Then this happens. |
| `[NEEDS CLARIFICATION: …]` | A question for you. The AI writes it where a fact is missing, instead of guessing. |
| Clarifications | A list at the end of `spec.md`. Each answered question is added there as `Q: … → A: …`. |
| `sources.md` | The list of inbox files the AI already read. The kit writes it when the AI finishes. Don't edit it. |

## File types

- **Best: `.md` or `.txt`.** The AI reads them fully and cheaply.
- PDF and pictures (`.png`, `.jpg`): only if your AI model can read them. If the AI says it can't, copy the text into a `.md` file, or describe the picture in words.
- Word, PowerPoint, Excel, HWP: the AI can't read them. Save as `.md` or `.txt`, or copy the text into a `.md` file.

## Good to know

- The AI only uses what is written here or what you tell it. If something is missing, it asks you. It doesn't make things up.
- Don't put real names, phone numbers or passwords here. Your website can become public.

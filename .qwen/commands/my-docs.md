---
description: Turn my-docs/inbox into a Spec Kit in my-docs/specs and ask what is missing
---

Turn my project documents into a Spec Kit. Reply in English.

First run `node scripts/my-docs.mjs` with the shell tool (I approve it; it uses no AI). Its output is "the status": which inbox files are new or changed, which spec sections are missing, and the numbered open questions.

Rules

- `my-docs/inbox/` holds my original documents. Read only: never edit, move or delete them.
- Write only `my-docs/specs/constitution.md`, `spec.md`, `plan.md` and `tasks.md`. Change no other file. Don't write a page plan or code.
- Work from the files as they are now; earlier messages in this chat may be out of date.
- Use only facts from my documents, the Clarifications in `spec.md`, or this chat. Never invent names, users, pages, features, copy, colors or numbers. If a fact is missing or two documents disagree, write `[NEEDS CLARIFICATION: short question]` in that place. Use the exact same words when one question is needed in several places.
- Templates' comments show the format only. Never copy their examples as facts.
- Success criteria, page titles, headings, labels and any other page copy come only from my documents or this chat; otherwise ask.
- A feature my documents leave undecided ("maybe", "not sure") gets one question under "Out of scope" and nothing else: no story, requirement, page or part until I answer.
- Parts: run `node scripts/catalog-cli.mjs` once with the shell tool (I approve it; it uses no AI) and pick kit parts by their role. A part that the kit doesn't have becomes a question, not a plan to build it.
- Short, simple English. Keep my exact words for names and page copy. In a table cell, write a `|` inside text as `\|`.
- Save credits: read only the files these steps name.

Steps

1. Read the inbox files marked `+ new` or `~ changed` in the status. If any of the four spec files is missing, read every inbox file. Skip `= same` files. If a file can't be read, add a question asking me to paste its text into a `.md` file.
2. For each spec file: if it exists, read it, update it and fix every problem the status lists for it. My edits win — keep every line I wrote; change a line only when a new or changed document or my answer below says so. If a document disagrees with a line, keep the line and add a question. For `- removed` files, keep their facts and ask if they still apply. If it doesn't exist, read its template in `docs/templates/spec-kit/` and fill it.
   - `constitution.md`: project, audience, principles, voice and tone, look and feel, out of scope.
   - `spec.md`: user stories by priority (P1 = must have) with Given/When/Then scenarios, edge cases, FR-001…, key entities, SC-001….
   - `plan.md`: design system (brand, token intent in words, parts) and website (3–4 pages with routes, sections, exact copy, data and actions). Every page serves a story; every P1 story has a page.
   - `tasks.md`: the template's steps in order. Making the website covers all pages at once (the AI runs `pnpm ds:page`), so it stays one step. Keep the "Build PART" step only for a new part I agreed to (one line per part); otherwise delete it.
3. For each answer I gave (chosen in `ask_user_question`, or in my message below), replace that `[NEEDS CLARIFICATION: …]` with the answer and add `- Q: … → A: … (chosen in chat)` under today's session in `spec.md` → "Clarifications". Numbers in my message follow the numbered list in the status.
4. Run `node scripts/my-docs.mjs --record` so next time only new or changed files are read.
5. Reply with one line per changed file. Then ask the open questions with the `ask_user_question` tool, up to 4 at a time, in file order (constitution, spec, plan, tasks; top to bottom), each question once even if it appears in several places — the same order `pnpm specs` shows. Give each question 2–4 short options taken only from my documents, or neutral ones like "Leave it out for now"; put a recommended option first with "(Recommended)" only when my documents support it. I type any other answer in Other. Record my answers as in step 3, then ask the next 4. If the tool is missing or fails, list them in ONE numbered list and I answer in the chat with the same numbers (for example `1. … 2. …`). Never ask me to open or edit the files in `my-docs/specs/`; if I want a change, I tell you in the chat. When no questions are left, say the next steps in plain words: send my Figma file link and ask you to bring in its colors (you run `pnpm ds:figma`), build parts from Figma links, and ask you to make my website. Then stop.

My message (answers or notes, may be empty):

{{args}}

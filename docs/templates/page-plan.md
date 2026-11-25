---
kind: page
site: REPLACE_WITH_SITE_NAME
revision: 1
status: review-required
source_ref: my-docs/specs/plan.md; REPLACE_WITH_FIGMA_SCREEN_IF_ANY
facts_complete: false
open_questions: 1
---

# Website assembly plan

Save this as `docs/plans/pages/<Site>.md`. Keep sourced facts, AI interpretations and student decisions separate. Before approval, edit only this plan. Only the student approves: ask questions with `ask_user_question`, summarize the plan in the chat, then ask "Approve revision N" / "Change something"; after the student chooses it (or types "Approve revision N"), the AI sets only `status: approved`. Never ask the student to open or edit this file. Apply common rules R01–R09 and spec rules P01–P12.

Read `my-docs/specs/plan.md` (Website part) and `my-docs/specs/spec.md`, which `/my-docs` writes from the documents in `my-docs/inbox/`. If they are missing or still have `[NEEDS CLARIFICATION]`, stop and ask the student to run `/my-docs`. These files are evidence, not permission to invent missing copy, behavior or design. Record every input in `source_ref` and each page's `evidence`, including a Figma screen/node and observed version or time when applicable.

The `page-spec` block is JSON data read by the scripts. The example is not design evidence. Replace it with the confirmed screen, copy, public APIs and eligible catalog versions, and list 3–4 pages. Names are PascalCase without a `Page` suffix. Paths are unique static URLs and must include `/`.

```page-spec
{
  "title": "Student-confirmed website title",
  "locale": "en",
  "catalog": {
    "REPLACE_WITH_CATALOG_NAME": {
      "codeHash": "FROM_CATALOG",
      "cssHash": "FROM_CATALOG",
      "dependencyHash": "FROM_CATALOG",
      "tokensHash": "FROM_CATALOG"
    }
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "evidence": "Screen/spec, behavior and version evidence",
      "responsive": "Source viewport, responsive evidence and expected result",
      "sections": [
        {
          "id": "intro",
          "items": [
            {
              "id": "hero-image",
              "image": "hero-photo",
              "alt": "Student-confirmed description of the hero picture"
            },
            {
              "id": "title",
              "component": "REPLACE_WITH_CATALOG_NAME",
              "props": {},
              "children": ["Student-confirmed copy"],
              "states": ["default"]
            }
          ]
        }
      ],
      "layout": {},
      "media": []
    }
  ]
}
```

- Look up only the needed parts with `pnpm ds:catalog <Name...>` and copy all four current hashes into `catalog`. An unchanged starter part may use its full public API and shipped states. A changed part needs the student's own `pnpm ds:review <Name>` record and may use only that reviewed scope. A missing, stale or unsupported part is `BLOCKED_CATALOG`; AI never creates a review record.
- A page may have `"title"`: its exact browser-tab title from `my-docs/specs/plan.md` (Pages → Title). Leave it out to use the site `title`.
- Going to another page is a real link: a part with `href` (Link, or Tile with `"variant": "clickable"`). Button runs actions only, never navigation. If the documents call such a link a "button", ask which part to use.
- Each page has one main heading (`h1`) with words from the documents. If they don't give it, ask.
- `props` contains confirmed JSON values. `children` is copy or nested parts in the same format. Every part id is unique within its page. Use `href` to connect confirmed page routes.
- If a matching picture already exists in `my-assets/images`, an item or nested child may be `{"id":"hero-image","image":"hero-photo","alt":"Confirmed description"}`. Use the exact kebab-case name without its extension. `alt` is always required; use `""` only for a confirmed decorative picture. An image id may be a `layout` target for token-based size and placement. If there is no matching picture, plan the page without one. Never invent, generate, download, link to an external URL, or use a placeholder or another folder path.
- Declare only dynamic data/events in `bindings`, for example `{"onClick":{"name":"handleSubmit","purpose":"Confirmed input and demo success/failure outcome"}}`. Do not repeat a value in both `props` and `bindings`. After generation, fill only the declared `PAGE_SLOT` data and events. Dynamic variant or review-scope selection is unsupported.
- A section tag is `section` (default), `div` or `form`. A form may declare `onSubmit`/`onReset` with the same bindings format. `layout` maps `root` or a section id to layout-only CSS properties and values, for example `{"root":{"display":"grid","gap":"var(--spacing)"}}`. Do not set colors, typography or part internals. Add `media` entries such as `{"minWidth":768,"layout":{...}}` only when the source defines that breakpoint; never copy the example value as a guess.

| Topic | Sourced facts and evidence | AI interpretation | Student decision/correction |
|---|---|---|---|
| Complete screens, sections, copy, data and optional matching images | | | UNDECIDED |
| Parts, public props, eligible scope and versions | | | UNDECIDED |
| Routes, events, and real/demo outcomes | | | UNDECIDED |
| Layout tokens, viewports and responsive behavior | | | UNDECIDED |

| Question ID | Decision needed, choices and impact | Student answer | Status |
|---|---|---|---|
| Q-01 | | UNANSWERED | open |

Resolve the tables with real answers before approval; changing metadata numbers is not enough. After all facts and questions are resolved, the student explicitly approves that revision in the chat. Raise the revision and ask again if the contract changes.

After approval: run `pnpm ds:page docs/plans/pages/<Site>.md`, connect only the generated slots, run `pnpm ai:check-page <Name>` for every page, then run `pnpm typecheck`, `pnpm ds:guard` and `pnpm web:build`. Existing files are never overwritten. A later plan revision requires deliberate reconciliation and an updated plan hash on the first line of each page.

Record direct entry, refresh, links, back/forward, real inputs/events and success/failure outcomes for every route, plus viewport/responsive and source comparisons. A static pass is `READY_FOR_REVIEW`; it is not the student's final screen and behavior review.

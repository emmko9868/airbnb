---
kind: component
component: Navigation
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=418-8282
facts_complete: true
open_questions: 0
---

# Navigation — Component Implementation Plan

## 1. Request and rules

- Request: Implement the Airbnb-style search Navigation bar from Figma (node 418:8282). A horizontal pill-shaped bar with 4 clickable sections (Where, Check-in, Check-out, Who) separated by vertical dividers, plus a search button.
- Read common rules: `docs/ai-component-workflow.md` v1.0 §§1-5
- Read spec: `docs/ai-design-system-spec.md` v1.1 §§2-6,9
- Figma file · node · read time · cache: zrqq2F92iVtCoxKzj4b8Pm · 418:8282 · 2026-11-16 12:50 · cached
- Target code/token baseline: tokens.css (current), Button pattern as reference

## 2. Component role and AI interpretation

| Item | Confirmed facts (source) | AI interpretation | User decision |
|---|---|---|---|
| Component role | Horizontal search bar with 4 sections + search button; Figma base 1280×62 | Composite navigation/search bar; each section is a clickable trigger for a dropdown/popover | Confirmed: opens dropdown/popover |
| Clickable areas | 4 section areas (Where, Check-in, Check-out, Who) + 1 search button | Each section triggers its own popover; search button fires a search action | Confirmed |
| Click/select/open behavior | Not shown in static Figma | Each section click opens a dropdown/popover (content not part of this component); search button calls onSearch | Confirmed: dropdown/popover |
| Keyboard/focus scope | Not shown in Figma | Tab navigates through sections and search button; each section is a `<button>` with proper ARIA | Proposed: each section = `<button>`, search = `<button>` |
| Disabled behavior | Not in Figma | Support `disabled` prop on the whole bar (disables all sections + search) | Proposed |

## 3. Existing components and change scope

- Same-role existing component: none — this is a new composite component
- Existing imports/consumers: none yet
- Reason for new component: no existing Navigation component in the kit
- Files to create:
  - `src/components/Navigation/Navigation.tsx`
  - `src/components/Navigation/Navigation.css`
  - `src/components/Navigation/Navigation.stories.tsx`
  - `src/components/Navigation/index.ts`
- Impact on existing consumers: none (new component)

## 4. Nested parts

No Figma instances of other kit components were found inside this Navigation node. The section areas and search button are inner layers of this component, not instances of other kit parts.

The search icon (magnifying glass inside pink circle) is drawn as inline SVG from the Figma SVG asset `imgGroup2`.

- Confirmed absence of nested instances: the Figma facts show only inner `<div>` layers and SVG assets, no component instances.

## 5. Figma states and sizes — full list

| Figma node / combo | Read basis | Event or persistent state | Apply area | Different from base | Icons | Code API/CSS link | Status |
|---|---|---|---|---|---|---|---|
| 418:8282 · Navigation · 1280×62 | facts file · base | Default (idle) state | Root container | — | imgLine11 (divider), imgGroup2 (search icon) | Default render | confirmed |

- Focus ring: not shown in Figma; propose standard 2px outline using `--color-primary` (consistent with Button pattern)
- Figma states not present: hover, active, focus, disabled — only base state was read
- Missing reads: no other variants were in scope; only one base state

## 6. Color · alpha · design token mapping

| Element / state | Figma value / variable | primitive | semantic / role | CSS value | Value/role match | Notes |
|---|---|---|---|---|---|---|
| Root background | #FFFFFF / Shade 01 | --color-shade-01 | --color-bg | var(--color-bg) | ✓ exact | |
| Root border | #D3D3D3 / Neutral 04 | --color-neutral-04 | (no exact semantic) | var(--color-neutral-04) | ✓ value match | User chose primitive directly; no semantic match |
| Section label text | #222222 / Shade 02 | --color-shade-02 | --color-text | var(--color-text) | ✓ exact | |
| Section subtitle text | #717171 / Neutral 07 | --color-neutral-07 | --color-text-secondary | var(--color-text-secondary) | ✓ exact | |
| Divider line | #D3D3D3 / Neutral 04 | --color-neutral-04 | (same as border) | var(--color-neutral-04) | ✓ exact | Same value as root border |
| Search button bg | #FF385C / Primary 02 | --color-primary-02 | --color-primary | var(--color-primary) | ✓ exact | |
| Search icon stroke/fill | #FFFFFF / Shade 01 | --color-shade-01 | --color-on-primary | var(--color-on-primary) | ✓ exact | |

- Component fill vs parent background: root bg is white (#FFFFFF), same as page surface. Border is distinct (#D3D3D3).
- No new tokens needed — all colors map to existing primitives/semantics.

## 7. Source icons and assets

| Asset / Figma node | Source vector path | Size · color · stroke · rotation | Appears in | Confirmed |
|---|---|---|---|---|
| imgLine11 (divider) | SVG: `<line x1="0" y1="0.5" x2="25" y2="0.5" stroke="#D3D3D3"/>` | 25×1, stroke #D3D3D3, rotated 90° in layout | base | ✓ |
| imgGroup2 (search icon) | SVG: circle r=24 fill #FF385C + inner circle r≈6 stroke white 2.97 + line stroke white 2.97 | 48×48, multicolor (pink bg + white icon) | base | ✓ |

- The divider is rendered as an inline SVG `<line>` element (25×1, rotated 90° to become vertical).
- The search button is a 48×48 inline SVG with the pink circle background and white magnifying glass paths baked in.

## 8. Public API and real behavior

| prop / event | Rationale | Default · allowed | Real behavior | Keyboard / disabled | User confirmed |
|---|---|---|---|---|---|
| `sections` | Configure the 4 section labels/subtitles | `[{label:"Where",placeholder:"Search destinations"}, …]` | Renders section content | — | Proposed (AI) |
| `activeSection` | Which section is currently active/expanded | `undefined` · `string \| undefined` | Highlights the active section | — | Proposed (AI) |
| `onSectionClick` | Section click handler | `undefined` · `(sectionId: string) => void` | Calls parent to open popover | Enter/Space on focused button | Proposed (AI) |
| `onSearch` | Search button click | `undefined` · `() => void` | Fires search action | Enter/Space on focused button | Confirmed |
| `disabled` | Disable entire bar | `false` · `boolean` | All buttons get `disabled` attr | Tab skips disabled buttons | Proposed (AI) |
| `className` | Extra CSS class | `undefined` · `string` | Appended to root | — | Standard pattern |

## 9. Q&A and user decisions

| Q ID | Item | Choices / impact | User answer | Status |
|---|---|---|---|---|
| Q-01 | Click action for sections | Opens dropdown/popover · Tab switcher · Visual only | Opens a dropdown/popover (chosen in chat) | resolved |
| Q-02 | Border token for #D3D3D3 | Use --color-neutral-04 directly · Use --color-border · New semantic token | Use --color-neutral-04 directly (chosen in chat) | resolved |
| Q-03 | Search button action | Triggers onSearch callback · Visual only | Triggers a search callback (chosen in chat) | resolved |

## 10. Verification plan

| Check | Expected | Method | Evidence |
|---|---|---|---|
| Default state and canvas bg | White bg, #D3D3D3 border, pill shape, 1280×62 | Storybook render + computed style | Screenshot + DOM |
| All sections render | 4 sections with correct labels/subtitles | Storybook render | DOM check |
| Dividers between sections | 3 vertical lines, 25px height, #D3D3D3 | DOM + computed style | Screenshot |
| Search button | 48×48 pink circle with white magnifying glass | DOM + computed style | Screenshot |
| Section click | Calls onSectionClick with section id | Storybook play with fn() | Test assertion |
| Search click | Calls onSearch | Storybook play with fn() | Test assertion |
| Tab/focus | Tab navigates through sections + search; focus-visible ring | Playwright Tab + focus check | Test output |
| Disabled | All buttons disabled, no callbacks fire | Storybook play | Test assertion |
| Common rules | Type, token, regression checks | `pnpm ai:check Navigation`, `pnpm ai:verify Navigation`, `pnpm typecheck`, `pnpm ds:guard` | Command output |

## 11. User review

- User decisions on plan content:
  - Q-01: Sections open dropdown/popover
  - Q-02: Use --color-neutral-04 directly for border
  - Q-03: Search button triggers onSearch callback
- Approved revision: —
- Conditions before implementation: plan approval

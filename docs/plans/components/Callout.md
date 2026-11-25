---
kind: component
component: Callout
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=235-2641
facts_complete: true
open_questions: 0
---

# Callout Component Implementation Plan

> Facts / interpretations / questions are separated. No implementation files are modified before user approval.

## 1. Request and Applied Rules

- Requested work: Implement the Callout component from Figma and add it to Storybook
- Common rules read: `docs/ai-component-workflow.md` v1.0 / R01~R09
- Spec read: `docs/ai-design-system-spec.md` v1.1
- Figma file/node/query time/cache: 235:2641, cached within 10 min
- Target code/token baseline version: current tokens.css

## 2. Component Role and AI Interpretation

| Item | Confirmed facts and source | AI interpretation | User confirmation |
|---|---|---|---|
| Component role | Informational callout box with two variants: "Property Highlight" (promotional message with icon) and "Cancelation" (reservation status with image placeholder) | Display-only informational content; not interactive | TBD |
| Clickable area | No clickable elements in Figma | Not clickable; static informational component | TBD |
| Click/select/open behavior | No interactive states in Figma | None | TBD |
| Keyboard/focus scope | No focusable elements | No keyboard interaction needed | TBD |
| Disabled behavior | No disabled state in Figma | Not applicable | TBD |

## 3. Existing Components and Change Scope

- Same-role existing component: None (new component)
- Existing props/stories support: N/A
- Reason for new component: This is a new informational callout component not in the current kit
- Files to change:
  - `src/components/Callout/Callout.tsx` (new)
  - `src/components/Callout/Callout.css` (new)
  - `src/components/Callout/Callout.stories.tsx` (new)
  - `src/components/Callout/index.ts` (new)
- Impact on existing consumers: None (new component)

## 4. Nested Parts

No nested Figma instances detected. The "Callout Icons" layer (235:2614) is an inner layer drawn inside this part's own code, not a nested component instance.

- Confirmed absence of nested instances: The icon is drawn inline from the Figma SVG asset

## 5. Figma States/Sizes Complete List

| Figma node ID / combination | Read basis | Event or persistent state | Applied area | Different values from base | Icon presence | Code API/CSS connection | Confirmed |
|---|---|---|---|---|---|---|---|
| 235:2640 Property Highlight | Facts file read | Variant (persistent) | Root container | 349×86, gap 8px | imgGroup1 present | `variant="propertyHighlight"` | ✓ |
| 235:2639 Cancelation | Facts file read | Variant (persistent) | Root container | 361×165, no gap, different content | No icon | `variant="cancelation"` | ✓ |

- Focus ring scope: Not applicable (no focusable elements)
- States not in Figma: hover, active, focus, disabled — none defined
- Missing/failed reads: None

## 6. Color/Alpha/Design Token Mapping

| Element / state | Figma original value / variable | primitive | semantic / role | CSS interpreted value | Value/role match | TBD or new mapping needed |
|---|---|---|---|---|---|---|
| Root border | #DDDDDD | neutral-03 | --color-border | var(--color-border) | ✓ | — |
| Main text | #222222 | shade-02 | --color-text | var(--color-text) | ✓ | — |
| Gray box background (Cancelation) | #DDDDDD | neutral-03 | --color-border | var(--color-border) | ✓ (same value, image placeholder role) | — |
| "CANCELED" text | #C13515 | error-02 | --color-danger | var(--color-danger) | ✓ | — |
| Icon fill | #F6D7DF | accent-01 | — | var(--color-accent-01) | ✓ | — |
| Icon stroke | #D03660 | accent-02 | — | var(--color-accent-02) | ✓ | — |

- Component fill vs Figma parent background: Root background is white (#FFFFFF) → --color-bg
- Same value candidates: #DDDDDD used for both border and gray box; same token --color-border is appropriate
- New tokens needed: None
- Token generation path: Use existing semantic tokens

## 7. Original Icons/Assets

| Asset / Figma node | Original file/vector path or hash | Size/color/stroke/rotation | States where it appears | States where it doesn't | Confirmed |
|---|---|---|---|---|---|
| imgGroup1 | SVG from facts file | 30.88×30.39, fill #F6D7DF, stroke #D03660 | Property Highlight only | Cancelation | ✓ |

## 8. Public API and Actual Functionality

| prop / event | Basis | Default / allowed values | Actual behavior / result | Keyboard/disabled handling | User confirmed |
|---|---|---|---|---|---|
| variant | Figma Property 1 | "propertyHighlight" (default), "cancelation" | Switches content layout and icon | N/A | TBD |
| className | Standard HTML | string | Additional CSS classes | N/A | TBD |
| children | Property Highlight text content | ReactNode | Main message text | N/A | TBD |
| title | Cancelation header | string | "Your reservation" header text | N/A | TBD |
| statusLabel | Cancelation status | string | "CANCELED" text with danger color | N/A | TBD |
| propertyName | Cancelation property name | string | "tiny house, tiny farm" text | N/A | TBD |
| reservationCode | Cancelation code | string | "Reservation code: XMPQKAPZ6D" | N/A | TBD |
| imagePlaceholder | Cancelation image area | ReactNode | 108×72 gray box (optional custom content) | N/A | TBD |

## 9. Q&A and User Decisions

| Question ID | TBD item and basis | Options / impact of each | User answer | Resolution status |
|---|---|---|---|---|
| Q-01 | Component name: Figma uses "Callouts" (plural). Standard convention is singular. | "Callout" (singular, recommended) vs "Callouts" (keep Figma name) | Callout (chosen in chat) | resolved |
| Q-02 | The Cancelation variant has a gray box (108×72) that appears to be an image placeholder. Should this be a configurable slot for an actual image, or always a solid gray box? | Configurable image slot (recommended) vs Fixed gray box | Configurable image slot (chosen in chat) | resolved |

## 10. Verification Plan

| Check target | Expected result from original | Test method | Completion evidence |
|---|---|---|---|
| Base state and canvas background | White background, #DDDDDD border | iframe computed style | Screenshot + style check |
| All variants | Property Highlight: 349×86 with icon; Cancelation: 361×165 with gray box | Original comparison + DOM | Render check |
| Icon and exposure conditions | imgGroup1 only in Property Highlight | SVG DOM check | ✓ in correct variant only |
| Text content and styles | SF Pro font, correct sizes/weights | Computed style check | Font/size verification |
| Colors and tokens | All colors match semantic tokens | Computed style vs tokens | Token mapping verified |
| Common rules and existing consumers | No regressions | typecheck, ds:guard | Pass |

Required commands: `pnpm ai:check Callout`, `pnpm ai:verify Callout`, `pnpm typecheck`, `pnpm ds:guard`

## 11. User Review

- User modifications/decisions on plan content: Pending
- Approved revision: —
- Conditions before implementation: Q-01 and Q-02 answered

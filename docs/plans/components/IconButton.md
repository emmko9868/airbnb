---
kind: component
component: IconButton
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/Airbnb-UI-Kit--Community-?node-id=393-9507&m=dev
facts_complete: true
open_questions: 0
---

# IconButton Component Implementation Plan

> AI separates confirmed facts, interpretations, and questions. No implementation files modified before user approval.

## 1. Request and Application Rules

- Requested work: Implement IconButton component from Figma design (node 393:9507) with Storybook stories
- Read common rules: `docs/ai-component-workflow.md` v1.0
- Read spec: `docs/ai-design-system-spec.md` v1.1
- Figma file·node·read time·cache: File zrqq2F92iVtCoxKzj4b8Pm, node 393:9507, read 2026-11-15, cached (facts file: facts-zrqq2F92iVtCoxKzj4b8Pm-393-9507.md)
- Target code·token baseline version: tokens.css with gradient-icon-button-1 through gradient-icon-button-4

## 2. Component Role and AI Interpretation

| Item | Confirmed facts and source | AI interpretation | User confirmation |
|---|---|---|---|
| Component role | Figma "Icon button" component set (393:9507) | Round icon-only button for actions like profile, navigation | Pending |
| Clickable area | L: 40×40, S: 28×28 (base dimensions) | Full round area is clickable | Pending |
| Click/selection/open action | Not specified in Figma | onClick callback passed as prop | Pending |
| Keyboard·focus scope | Focus state exists (393:9502, 414:1924, 402:81) with outer ring | Tab-focusable, focus-visible ring (2px #222222 border) | Pending |
| Disabled action | Disabled state exists (393:9503, 414:1917, 402:87) | Native disabled attribute, no click events | Pending |

## 3. Existing Components and Change Scope

- Same-role existing component: None (new component)
- Existing props·stories support: N/A
- Reason for new component: Icon-only button is a distinct component from text Button
- Files to change:
  - Create: `src/components/IconButton/IconButton.tsx`
  - Create: `src/components/IconButton/IconButton.css`
  - Create: `src/components/IconButton/IconButton.stories.tsx`
  - Create: `src/components/IconButton/index.ts`
- Approved changes affecting existing consumers: None (new component)

## 4. Nested Parts

| Figma instance | Original component / set | Figma variant | Found in requested variants | Kit component and props | Status |
|---|---|---|---|---|---|
| (none) | N/A | N/A | N/A | N/A | N/A |

- Confirmed absence of nested instances: The IconButton contains only internal layers (Background, Text, Container, icon SVG), not Figma component instances.

## 5. Figma States and Sizes Complete List

| Figma node ID / combination | Read basis | Event or persistent state | Application area | Values different from default | Icon presence | Code API/CSS connection | Confirmed |
|---|---|---|---|---|---|---|---|
| 393:9506 · Secondary · L · Default | facts file | default | root bg: #DDDDDD, Text bg: #EBEBEB | yes | imgGroup (person icon) | variant="secondary" size="L" | confirmed |
| 414:1896 · Primary · L · Default | facts file | default | Text bg: gradient-icon-button-1 | yes | imgGroup1 | variant="primary" size="L" | confirmed |
| 402:69 · Secondary · S · Default | facts file | default | 28×28, Text bg: gradient-icon-button-1 | yes | imgGroup + chevron | variant="secondary" size="S" | confirmed |
| 393:9504 · Secondary · L · Hover | facts file | :hover | root bg: #D3D3D3, Text bg: #D3D3D3 | yes | imgGroup | CSS :hover | confirmed |
| 414:1903 · Primary · L · Hover | facts file | :hover | root+Text bg: gradient-icon-button-2 | yes | imgGroup | CSS :hover | confirmed |
| 402:73 · Secondary · S · Hover | facts file | :hover | Text bg: gradient-icon-button-1 | yes | imgGroup + chevron | CSS :hover | confirmed |
| 393:9505 · Secondary · L · Pressed | facts file | :active | root bg: #C2C2C2, Text bg: #C2C2C2 | yes | imgGroup | CSS :active | confirmed |
| 414:1910 · Primary · L · Pressed | facts file | :active | root+Text bg: gradient-icon-button-3 | yes | imgGroup | CSS :active | confirmed |
| 402:77 · Secondary · S · Pressed | facts file | :active | Text bg: gradient-icon-button-1 | yes | imgGroup + chevron | CSS :active | confirmed |
| 393:9502 · Secondary · L · Focus | facts file | :focus-visible | 44×44, border: #222222 | yes | imgGroup | CSS :focus-visible | confirmed |
| 414:1924 · Primary · L · Focus | facts file | :focus-visible | 44×44, border: #222222, Text bg: gradient-icon-button-4 | yes | imgGroup | CSS :focus-visible | confirmed |
| 402:81 · Secondary · S · Focus | facts file | :focus-visible | border: #222222, Text bg: gradient-icon-button-1 | yes | imgGroup + chevron | CSS :focus-visible | confirmed |
| 393:9503 · Secondary · L · Disabled | facts file | disabled | root bg: #F7F7F7, Text bg: #F2F2F2 | yes | imgGroup | disabled attr | confirmed |
| 414:1917 · Primary · L · Disabled | facts file | disabled | root bg: #F7F7F7, Text bg: #F2F2F2 | yes | imgGroup | disabled attr | confirmed |
| 402:87 · Secondary · S · Disabled | facts file | disabled | Text bg: gradient-icon-button-1 | yes | imgGroup + chevron | disabled attr | confirmed |

- Focus ring scope: 2px outside button edge (44×44 outer for L size, created by 2px border on each side of 40×40 button)
- States not in Figma: Loading state (not shown in any variant)
- Unread/failed/truncated responses: None

## 6. Color, Alpha, and Design Token Mapping

| Element / state | Figma original value·alpha | primitive | semantic / role | CSS interpretation | Value·role match | Unconfirmed or new mapping needed |
|---|---|---|---|---|---|---|
| Secondary root bg (Default) | #DDDDDD | neutral-03 | border | var(--color-border) | match | confirmed |
| Secondary Text bg (Default) | #EBEBEB | neutral-02 | (icon button icon bg) | var(--color-neutral-02) | match | AI proposal |
| Secondary root bg (Hover) | #D3D3D3 | neutral-04 | (icon button hover) | var(--color-neutral-04) | match | AI proposal |
| Secondary Text bg (Hover) | #D3D3D3 | neutral-04 | (icon button hover) | var(--color-neutral-04) | match | AI proposal |
| Secondary root bg (Pressed) | #C2C2C2 | neutral-05 | text-disabled | var(--color-text-disabled) | match | confirmed |
| Secondary Text bg (Pressed) | #C2C2C2 | neutral-05 | text-disabled | var(--color-text-disabled) | match | confirmed |
| Focus border (both types) | #222222 | shade-02 | text | var(--color-text) | match | confirmed |
| Disabled root bg (both types) | #F7F7F7 | neutral-01 | (disabled surface) | var(--color-neutral-01) | match | AI proposal |
| Disabled Text bg (both types) | #F2F2F2 | (between neutral-01/02) | (disabled icon bg) | TBD | no exact match | needs decision |
| Primary Default Text bg | gradient | — | — | var(--gradient-icon-button-1) | gradient token | confirmed |
| Primary Hover root+Text bg | gradient | — | — | var(--gradient-icon-button-2) | gradient token | confirmed |
| Primary Pressed root+Text bg | gradient | — | — | var(--gradient-icon-button-3) | gradient token | confirmed |
| Primary Focus Text bg | gradient | — | — | var(--gradient-icon-button-4) | gradient token | confirmed |
| Secondary all states Text bg | gradient | — | — | var(--gradient-icon-button-1) | gradient token | confirmed |

- Component fill vs Figma parent background: Separated. IconButton bg is component-specific.
- Multiple candidates with same value: neutral palette used consistently.
- New token usage: Disabled Text bg #F2F2F2 needs mapping decision (Q-01).
- Token creation path·validation: Use existing semantic tokens + neutral primitives where approved.

## 7. Original Icons and Assets

| asset / Figma node | Original file/vector path or hash | Size·color·stroke·rotation | States where appears | States where absent | Confirmed |
|---|---|---|---|---|---|
| imgGroup (person icon) | f867f5199e189f3eed80de0769197dc2dd518fad.svg | 19×19, stroke #222222 1.5px | L all states | S variants (uses chevron) | confirmed |
| imgGroup1 (alt icon) | 85470359181b74c8d193af53565927cb43ebd814.svg | varies | Primary L states | Secondary L, all S | confirmed |
| Chevron left (S size) | 0ceafff654399e2c2c0a4896fbfea4d7806057d5.svg (and state variants) | 12×12 | S all states | L variants | confirmed |

- Icon is a prop: Consumer provides the icon SVG; Figma shows example icons (person, chevron)
- Icon container: 20×20 for L, centered; proportional for S

## 8. Public API and Actual Functionality

| prop / event | Basis | Default·allowed values | Actual behavior / result | Keyboard·disabled handling | User confirmation |
|---|---|---|---|---|---|
| size | Figma Size variants | "L" (default), "S" | Changes dimensions (40×40 vs 28×28) | N/A | Pending |
| variant | Figma Type variants | "secondary" (default), "primary" | Changes visual style and gradient usage | N/A | Pending |
| icon | Figma icon layer | ReactNode (required) | Icon SVG rendered in button center | N/A | Pending |
| disabled | Figma Disabled state | false (default), true | Native disabled, no events | Not focusable when disabled | Pending |
| onClick | Standard button behavior | () => void | Triggers callback | Triggered by Enter/Space | Pending |
| className | Standard React prop | string | Additional CSS classes | N/A | Pending |
| type | HTML button type | "button" (default), "submit", "reset" | Form behavior | N/A | Pending |

## 9. Q&A and User Decisions

| Question ID | Unconfirmed item and basis | Options / impact of each choice | User answer | Resolution status |
|---|---|---|---|---|
| Q-01 | Disabled Text bg #F2F2F2 has no exact token. Options: use --color-neutral-02 (#EBEBEB, closest existing) or create new token | Use neutral-02 (simpler, no new token) / Create new semantic token (exact match but adds token) | Use neutral-02 (chosen in chat) | resolved |
| Q-02 | Hover colors #D3D3D3 → --color-neutral-04 is exact match but role is "neutral" not "interactive hover". Accept this mapping? | Use neutral-04 directly (exact value match) / Create new hover-specific token (more semantic but adds token) | Use neutral-04 directly (chosen in chat) | resolved |

## 10. Verification Plan

| Check target | Expected result from original | Test method | Completion evidence |
|---|---|---|---|
| Default state and canvas background | Match Figma colors/spacing | Computed style comparison | Screenshot + style match |
| All states·sizes | 2 types × 2 sizes × 5 states = 20 combinations | Storybook matrix | All render correctly |
| Icons and exposure conditions | Icon centered, correct size per variant | DOM inspection | Icon visible and centered |
| Click·input·selection etc. functions | onClick fires | Play function with fn() | Callback asserted |
| disabled / Tab / Focus | Focus ring visible (2px #222222), disabled not focusable | Keyboard navigation | Tab order correct |
| Gradient tokens | Primary uses gradient-icon-button-1/2/3/4 correctly | Computed style | Gradient visible |
| Nested parts identity | N/A (no nested kit parts) | N/A | N/A |
| Nested part → composite callback | N/A | N/A | N/A |
| Common rules and existing consumers | No regressions | pnpm typecheck, pnpm ds:guard | Pass |

Required commands: `pnpm ai:check IconButton`, `pnpm ai:verify IconButton`, `pnpm typecheck`, `pnpm ds:guard`

## 11. User Review

- User modifications·decisions on plan content: Pending approval
- Approved revision: Pending
- Conditions before implementation: User approval of this plan

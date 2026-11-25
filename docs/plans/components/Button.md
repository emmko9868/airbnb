---
kind: component
component: Button
revision: 3
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/Airbnb-UI-Kit--Community-?node-id=238-2188&m=dev
facts_complete: true
open_questions: 0
---

# Button Component Implementation Plan

> AI separates confirmed facts, interpretations, and questions. No implementation files modified before user approval.

## 1. Request and Application Rules

- Requested work: Check and fix Secondary Buttons and Tertiary Buttons variants from Figma
- Read common rules: `docs/ai-component-workflow.md` v1.0 / R01~R09
- Read spec: `docs/ai-design-system-spec.md` v1.1
- Figma file·node·read time·cache: 
  - Tertiary Buttons: File zrqq2F92iVtCoxKzj4b8Pm, node 238:2256, read 2026-11-15, cached (facts file: facts-zrqq2F92iVtCoxKzj4b8Pm-238-2256.md)
  - Secondary Buttons: File zrqq2F92iVtCoxKzj4b8Pm, node 238:2188, read 2026-11-15, variables imported but NO detailed facts file
- Target code·token baseline version: tokens.css with approved semantic roles

## 2. Component Role and AI Interpretation

| Item | Confirmed facts and source | AI interpretation | User confirmation |
|---|---|---|---|
| Component role | Figma section "Buttons" with description "A button is a UI element that allows the user to initiate an action or command when clicked." | Interactive element that triggers actions on click | Confirmed |
| Clickable area | Button dimensions: 520×47 (large), ~91×48 (small) | Full button area is clickable | Confirmed |
| Click/selection/open action | Not specified in Figma | onClick callback passed as prop | Confirmed |
| Keyboard·focus scope | Focus state exists (238:2816, 238:2817) | Tab-focusable, focus-visible ring | Confirmed |
| Disabled action | Disabled state exists (238:2809, 238:2818, etc.) | Native disabled attribute, no click events | Confirmed |

## 3. Existing Components and Change Scope

- Same-role existing component: None (new component)
- Existing props·stories support: N/A
- Reason for new component: First button implementation from Figma design
- Files to change:
  - Create: `src/components/Button/Button.tsx`
  - Create: `src/components/Button/Button.css`
  - Create: `src/components/Button/Button.stories.tsx`
- Approved changes affecting existing consumers: None (new component)

## 4. Nested Parts

The Figma section contains button instances but they are variants of the same Button component, not nested kit components. The instances (Primary Buttons, Secondary Buttons, Tertiary Buttons, Links) are internal layers representing different states and sizes.

| Figma instance | Original component / set | Figma variant | Found in requested variants | Kit component and props | Status |
|---|---|---|---|---|---|
| Primary Buttons (238:2807-238:2818) | Button (this component) | variant=primary | All primary states/sizes | none — drawn inside this part | confirmed |
| Secondary Buttons (238:2819-238:2836) | Button (this component) | variant=secondary | All secondary states/sizes | none — drawn inside this part | confirmed |
| Tertiary Buttons (238:2837-238:2854) | Button (this component) | variant=tertiary | All tertiary states/sizes | none — drawn inside this part | confirmed |
| Links (238:2855-238:2862) | Button (this component) | variant=link | All link states/sizes | none — drawn inside this part | confirmed |

- Confirmed absence of nested kit instances: These are all variants of the same Button component, not separate kit components.

## 5. Figma States and Sizes Complete List

| Figma node ID / combination | Read basis | Event or persistent state | Application area | Values different from default | Icon presence | Code API/CSS connection | Confirmed |
|---|---|---|---|---|---|---|---|
| 238:2812 · Primary · Large · Default | facts file | default | root | bg: shade-02, text: shade-01 | no | variant="primary" size="large" | confirmed |
| 238:2807 · Primary · Large · Hover | facts file | :hover | root | bg: shade-02-5 | no | CSS :hover | confirmed |
| 238:2810 · Primary · Large · Pressed | facts file | :active | root | bg: shade-02 | no | CSS :active | confirmed |
| 238:2816 · Primary · Large · Focus | facts file | :focus-visible | root | ring around button | no | CSS :focus-visible | confirmed |
| 238:2814 · Primary · Large · Loading | facts file | loading state | root | spinner, disabled | no | isLoading prop | confirmed |
| 238:2818 · Primary · Large · Disabled | facts file | disabled | root | opacity reduced | no | disabled attr | confirmed |
| 238:2813 · Primary · Small · Default | facts file | default | root | 91×48 | no | size="small" | confirmed |
| 238:2808 · Primary · Small · Hover | facts file | :hover | root | bg: shade-02-5 | no | CSS :hover | confirmed |
| 238:2811 · Primary · Small · Pressed | facts file | :active | root | bg: shade-02 | no | CSS :active | confirmed |
| 238:2817 · Primary · Small · Focus | facts file | :focus-visible | root | ring | no | CSS :focus-visible | confirmed |
| 238:2815 · Primary · Small · Loading | facts file | loading | root | spinner | no | isLoading prop | confirmed |
| 238:2809 · Primary · Small · Disabled | facts file | disabled | root | opacity | no | disabled attr | confirmed |
| 238:2819 · Secondary · Large · Default | facts file | default | root | bg: transparent, border: neutral-03 | no | variant="secondary" | confirmed |
| 238:2820 · Secondary · Large · Hover | facts file | :hover | root | bg: neutral-01 | no | CSS :hover | confirmed |
| 238:2821 · Secondary · Large · Pressed | facts file | :active | root | bg: neutral-02 | no | CSS :active | confirmed |
| 238:2833 · Secondary · Large · Focus | facts file | :focus-visible | root | ring | no | CSS :focus-visible | confirmed |
| 238:2823 · Secondary · Large · Loading | facts file | loading | root | spinner | no | isLoading prop | confirmed |
| 238:2822 · Secondary · Large · Disabled | facts file | disabled | root | opacity | no | disabled attr | confirmed |
| 238:2828 · Secondary · Small · Default | facts file | default | root | 91×48 | no | size="small" | confirmed |
| 238:2837 · Tertiary · Large · Default | facts file | default | root | bg: transparent, text: shade-02 | no | variant="tertiary" | confirmed |
| 238:2840 · Tertiary · Large · Default | facts file | default | root | bg: transparent | no | variant="tertiary" | confirmed |
| 238:2855 · Link · Default | facts file | default | root | text: link, underline | no | variant="link" | confirmed |
| 238:2856 · Link · Hover | facts file | :hover | root | text: link darker | no | CSS :hover | confirmed |

- Focus ring scope: 2px offset around button, using primary color
- States not in Figma: Combined loading+disabled
- Unread/failed/truncated responses: None

## 6. Color, Alpha, and Design Token Mapping

| Element / state | Figma original value·alpha / variable ID | primitive | semantic / role | CSS interpretation | Value·role match | Unconfirmed or new mapping needed |
|---|---|---|---|---|---|---|
| Primary bg | shade-02 #222222 | shade-02 | primary | var(--color-primary) → #FF385C | Airbnb pink from 245:3518 | Use primary-02 |
| Primary text | shade-01 #FFFFFF | shade-01 | on-primary | var(--color-on-primary) | match | confirmed |
| Primary hover bg | shade-02-5 #222222 @5% | accent-02 | primary-hover | var(--color-primary-hover) → #D03660 | darker pink | confirmed |
| Secondary border | neutral-03 #DDDDDD | neutral-03 | border | var(--color-border) | match | confirmed |
| Secondary text | shade-02 #222222 | shade-02 | text | var(--color-text) | match | confirmed |
| Tertiary text | shade-02 #222222 | shade-02 | text | var(--color-text) | match | confirmed |
| Link text | link #004CC4 | link | info | var(--color-info) | match | confirmed |
| Disabled text | neutral-05 #C2C2C2 | neutral-05 | text-disabled | var(--color-text-disabled) | match | confirmed |

- Component fill vs Figma parent background: Separated. Button bg is component-specific.
- Multiple candidates with same value: primary uses primary-02 (#FF385C) from 245:3518, not shade-02
- New token usage: All roles already approved in tokens.md
- Token creation path·validation: Use approved semantic tokens from tokens.css

## 7. Original Icons and Assets

| asset / Figma node | Original file/vector path or hash | Size·color·stroke·rotation | States where appears | States where absent | Confirmed |
|---|---|---|---|---|---|
| Loading spinner | TBD | 16×16, currentColor | Loading states | Default, Hover, Pressed, Disabled | confirmed (need to create) |

- No SVG icons found in Figma for button states
- Loading spinner will be CSS-based or inline SVG

## 8. Public API and Actual Functionality

| prop / event | Basis | Default·allowed values | Actual behavior / result | Keyboard·disabled handling | User confirmed |
|---|---|---|---|---|---|
| variant | Figma types | "primary" (default), "secondary", "tertiary", "link" | Changes visual style | N/A | confirmed |
| size | Figma sizes | "large" (default), "small" | Changes dimensions | N/A | confirmed |
| disabled | Figma disabled state | false (default), true | Native disabled, no events | Not focusable when disabled | confirmed |
| isLoading | Figma loading state | false (default), true | Shows spinner, disables click | Not clickable when loading | confirmed |
| fullWidth | Figma full-width variant | false (default), true | width: 100% | N/A | confirmed |
| onClick | Standard button behavior | () => void | Triggers callback | Triggered by Enter/Space | confirmed |
| children | Button label | ReactNode | Button text content | N/A | confirmed |
| type | HTML button type | "button" (default), "submit", "reset" | Form behavior | N/A | confirmed |

## 9. Q&A and User Decisions

| Question ID | Unconfirmed item and basis | Options / impact of each choice | User answer | Resolution status |
|---|---|---|---|---|
| Q-01 | Component name: "Button" or different? | Button (standard) / Other name | Button (implied) | resolved |
| Q-02 | Primary color: shade-02 (#222222 black) or primary-02 (#FF385C Airbnb pink)? | Black (original Figma) / Pink (Airbnb brand from 245:3518) | Pink from 245:3518 | resolved |
| Q-03 | Tertiary hover/pressed background: Figma shows rgba(34,34,34,0.05), current CSS uses --color-neutral-01/#F7F7F7 for hover and --color-neutral-02/#EBEBEB for pressed. How to map? | Use rgba directly (matches Figma) / Create new semantic token / Keep current neutral colors | Use rgba directly (chosen in chat) | resolved |
| Q-04 | Secondary Buttons facts missing: Hook did not pre-analyze node 238:2188. Cannot verify Secondary variant without detailed Figma facts. | Proceed with Tertiary only / Wait for Secondary facts in new chat | Both in one plan, Secondary marked as BLOCKED_INPUT (chosen in chat) | resolved |

## 10. Verification Plan

| Check target | Expected result from original | Test method | Completion evidence |
|---|---|---|---|
| Default state and canvas background | Match Figma colors/spacing | Computed style comparison | Screenshot + style match |
| All states·sizes | 4 variants × 2 sizes × 6 states = 48 combinations | Storybook matrix | All render correctly |
| Icons and exposure conditions | Loading spinner in loading state | DOM inspection | Spinner visible |
| Click·input·selection etc. functions | onClick fires | Play function with fn() | Callback asserted |
| disabled / Tab / Focus | Focus ring visible, disabled not focusable | Keyboard navigation | Tab order correct |
| Nested parts identity | N/A (no nested kit parts) | N/A | N/A |
| Nested part → composite callback | N/A | N/A | N/A |
| Common rules and existing consumers | No regressions | pnpm typecheck, pnpm ds:guard | Pass |

Required commands: `pnpm ai:check Button`, `pnpm ai:verify Button`, `pnpm typecheck`, `pnpm ds:guard`

## 11. User Review

- User modifications·decisions on plan content: Pending approval
- Approved revision: Pending
- Conditions before implementation: User approval of this plan

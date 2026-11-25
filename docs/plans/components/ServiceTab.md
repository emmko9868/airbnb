---
kind: component
component: ServiceTab
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/Airbnb-UI-Kit--Community-?node-id=418-3150
facts_complete: true
open_questions: 0
---

# ServiceTab — Implementation Plan

## 1. Request and rules

- Requested work: Import the "Service tab" component from Figma into Storybook with 3 states (Default, Hover, Selected), using student-provided PNG icons from `my-assets/icons/Service icons/`.
- Rules read: `docs/ai-component-workflow.md` v1.0, R01–R09
- Spec read: `docs/ai-design-system-spec.md` v1.1
- Figma file · node 418:3150 · read 2026-11-15 · cache fresh
- Token baseline: `src/tokens/tokens.css` (current)

## 2. Component role and AI interpretation

| Item | Confirmed facts (source) | AI interpretation | User decision |
|---|---|---|---|
| Component role | Figma: vertical icon+label tab, 3 status variants | A selectable category tab for service navigation (e.g. Airbnb-style: All, Homes, Hotels…) | Confirmed |
| Clickable area | Root is 60×93, icon item is 62×62 | Entire root (icon + label) is the clickable button area | Confirmed |
| Click/select behavior | Figma has "Selected" persistent state | `selected` boolean prop; parent controls which tab is active; onClick callback | Confirmed |
| Keyboard/focus | Native button element | Tab-focusable; Enter/Space trigger onClick; :focus-visible ring | Confirmed |
| Hover | CSS :hover on root | Icon container bg changes to #FCEDED; transient CSS state, not a prop | Confirmed |

## 3. Existing components and change scope

- No existing `ServiceTab` component; no existing component with the same role (icon-above-label category tab).
- New component: `src/components/ServiceTab/ServiceTab.tsx`, `.css`, `.stories.tsx`
- No changes to existing components.

## 4. Nested parts

No Figma instances found inside the ServiceTab node. The "Service Icon" is a layer (not an instance) containing a raster image. The student provides PNG icons as the icon source.

Confirmed absence of nested instances.

## 5. Figma states — full list

| Node ID / combo | Evidence | Event or persistent state | Target | Differs from Default | Icon | CSS/API | Confirmed |
|---|---|---|---|---|---|---|---|
| 418:3148 Default | facts read | — | Root + Icon item + label | Base state | PNG image, no border/overlay | bg-white icon container, Regular label | yes |
| 418:3147 Hover | facts read | CSS :hover | Icon item bg | bg: #FCEDED | PNG image, no border/overlay | bg: --color-surface-hover | yes |
| 418:3149 Selected | facts read | Persistent `selected` prop | Icon container + label | border #C72D65 1.5px, overlay rgba(241,164,164,0.2), Semibold label | PNG image + border + overlay | border: --color-selected-border, overlay: --color-selected-overlay, font-weight: 590 | yes |

Focus ring: wraps the root button element (entire 60×93 area).
Not in Figma: Focus state (no Figma node); Disabled state (no Figma node).

## 6. Color · alpha · token mapping

| Element / state | Figma value | Primitive | Semantic / role | CSS value | Match | Notes |
|---|---|---|---|---|---|---|
| Label text (all states) | #FFFFFF | --color-shade-01 | --color-on-primary | var(--color-on-primary) | ✓ exact | White text on dark parent |
| Icon item bg (Default) | #FFFFFF | --color-shade-01 | --color-bg | var(--color-bg) | ✓ exact | White icon container |
| Icon item bg (Hover) | #FCEDED | NEW --color-accent-03 | NEW --color-surface-hover | var(--color-surface-hover) | ✓ exact | Light pink hover bg |
| Service Icon border (Selected) | #C72D65 | NEW --color-accent-04 | NEW --color-selected-border | var(--color-selected-border) | ✓ exact | Deep pink border |
| Service Icon overlay bg (Selected) | rgba(241,164,164,0.2) | NEW --color-accent-05 | NEW --color-selected-overlay | var(--color-selected-overlay) | ✓ exact | Translucent pink overlay |

New tokens to add to `src/tokens/tokens.css`:
- Primitive layer:
  - `--color-accent-03: #FCEDED;`
  - `--color-accent-04: #C72D65;`
  - `--color-accent-05: rgba(241,164,164,0.2);`
- Semantic layer:
  - `--color-surface-hover: var(--color-accent-03);`
  - `--color-selected-border: var(--color-accent-04);`
  - `--color-selected-overlay: var(--color-accent-05);`

## 7. Icons and assets

| Asset | Source file | Size | States | Notes |
|---|---|---|---|---|
| Type=All.png | my-assets/icons/Service icons/Type=All.png | 48×48 (rendered) | All | Default "All" category icon |
| Type=Homes.png | my-assets/icons/Service icons/Type=Homes.png | 48×48 | All | "Homes" category |
| Type=Hotels.png | my-assets/icons/Service icons/Type=Hotels.png | 48×48 | All | "Hotels" category |
| Type=Experiences.png | my-assets/icons/Service icons/Type=Experiences.png | 48×48 | All | "Experiences" category |
| Type=Services.png | my-assets/icons/Service icons/Type=Services.png | 48×48 | All | "Services" category |

Icons are PNG raster images (not SVG). They are rendered at 48×48 inside the icon container. In the Selected state, the icon gets a 1.5px border + rounded-6px + translucent overlay on top.

## 8. Public API

| Prop / event | Rationale | Default / allowed | Behavior | Keyboard/disabled | Confirmed |
|---|---|---|---|---|---|
| `label` | Text below icon | required, string | Rendered as button text content | — | yes |
| `icon` | Icon image source | required, `string` (src path) | Rendered as `<img>` at 48×48 | — | yes |
| `selected` | Persistent selected state | default `false`, boolean | Toggles border + overlay + semibold label | — | yes |
| `onClick` | Tab selection callback | optional, `() => void` | Called on click/Enter/Space | Native button | yes |
| `className` | Layout escape hatch | optional, string | Appended to root class | — | yes |
| `disabled` | Disabled state | default `false`, boolean | Native disabled, reduced opacity, no click | Native disabled, not focusable | yes (not in Figma but standard) |

## 9. Q&A

| QID | Item | Choice / impact | Answer | Status |
|---|---|---|---|---|
| Q-01 | Component name | ServiceTab / CategoryTab / ServiceIcon | ServiceTab (chosen in chat) | resolved |
| Q-02 | Color role mapping for 3 unmapped colors | Use proposed roles / Change some | Use these roles (chosen in chat) | resolved |

## 10. Verification plan

| Check | Expected | Method | Evidence |
|---|---|---|---|
| Default state visuals | White icon bg, Regular label, white text | `pnpm ai:check ServiceTab` + computed style | ai:check pass |
| Hover state | Icon bg #FCEDED | `pnpm ai:verify ServiceTab` (real pointer hover) | ai:verify pass |
| Selected state | Border #C72D65, overlay rgba(241,164,164,0.2), Semibold label | `pnpm ai:verify ServiceTab` DOM + computed style | ai:verify pass |
| All 5 icons render | Each PNG visible at 48×48 | Storybook render | visual |
| Click behavior | onClick fires, selected toggles | Storybook play with fn() | play pass |
| Keyboard: Tab + Enter | Focusable, Enter/Space triggers onClick | Storybook play with Tab + keyboard | play pass |
| Type check | No TS errors | `pnpm typecheck` | pass |
| Guard | No token/pattern violations | `pnpm ds:guard` | pass |

## 11. Files to create/modify

- **New**: `src/components/ServiceTab/ServiceTab.tsx`
- **New**: `src/components/ServiceTab/ServiceTab.css`
- **New**: `src/components/ServiceTab/ServiceTab.stories.tsx`
- **Modify**: `src/tokens/tokens.css` (add 3 primitives + 3 semantic tokens)

## 12. User review

- Plan decisions: name=ServiceTab, color roles as proposed
- Approved revision: —
- Conditions before implementation: user approval of this plan

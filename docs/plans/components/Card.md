---
kind: component
component: Card
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=238-2378
facts_complete: true
open_questions: 0
---

# Card Component Implementation Plan

## 1. Request and Rules

- Requested work: Implement Card component from Figma with 6 variants (Default, Sleep, Reservation, Reservation Confirmation, Discount, Map) and update Storybook
- Read common rules: `docs/ai-component-workflow.md` v1.0
- Read spec: `docs/ai-design-system-spec.md` v1.1
- Figma file/node/read time: testing-Airbnb-UI-Kit / 238:2378 / 2026-11-15 / cached (0 Figma calls)
- Target code/token version: tokens.css with 18 semantic tokens (including new image-placeholder, text-tertiary)

## 2. Component Role and AI Interpretation

| Item | Confirmed facts and source | AI interpretation | User confirmation |
|---|---|---|---|
| Component role | 6 Figma variants show property listing cards with different content layouts | Display card for property/room listings with variant-specific content | TBD |
| Clickable areas | Heart icon visible in all variants; "Reserve" button in Reservation Card | Heart toggles favorite; Reserve triggers booking action | TBD |
| Click/Select/Open actions | Heart icon, Reserve button (Reservation Card only) | onFavoriteClick callback; onReserveClick callback | TBD |
| Keyboard/Focus scope | Card is a container; interactive elements inside | Tab navigates to interactive children (heart, Reserve button); card itself not focusable unless specified | TBD |
| Disabled behavior | No disabled state in Figma | Not implemented unless specified | TBD |

## 3. Existing Component and Change Scope

- Existing Card component: `src/components/Card/Card.tsx` — simple generic container with `children` prop
- Existing stories: `src/components/Card/Card.stories.tsx` — basic autodocs story
- Reason for modification: Current Card is a starter placeholder; needs complete redesign for Figma variants
- Files to change: `Card.tsx`, `Card.css`, `Card.stories.tsx`, `Card.figma.tsx`
- Impact on existing consumers: Breaking change — API completely different (variant-based vs children-based)

## 4. Nested Parts

No nested Figma instances that match existing kit components. All elements (heart icon, star icon, ellipses, gradient button) are drawn inside this part from Figma SVG assets.

| Figma instance | Original component / set | Figma variant | Found in requested variants | Kit component and props | Status |
|---|---|---|---|---|---|
| — | — | — | — | none — all elements drawn inside this part | confirmed |

- Confirmed absence: No nested kit component instances found in the Card variants.

## 5. Figma States and Sizes

| Figma node / combination | Read basis | Events or persistent state | Apply area | Different from base | Icons | Code API/CSS | Confirmed |
|---|---|---|---|---|---|---|---|
| 238:2494 Default Card · 303×387 | facts file | none | base variant | — | imgHeart, imgStar1, imgGroup1 | cardType="default" | ✓ |
| 238:2379 Sleep Card · 319×268 | facts file | none | image + bedroom info | smaller height, different text | imgHeart, imgStar1, imgGroup1 | cardType="sleep" | ✓ |
| 238:2383 Reservation Card · 373×532 | facts file | Reserve button click | price breakdown layout | tallest, has gradient button | imgHeart, imgStar1, imgLine16, imgEllipse16, imgRectangle2, imgLine17 | cardType="reservation" | ✓ |
| 238:2420 Reservation Confirmation · 477×509 | facts file | none | booking confirmation | widest, has price details | imgHeart, imgStar1, imgLine20, img56683A2F..., imgEllipse16, imgImage7 | cardType="confirmation" | ✓ |
| 238:2461 Discount Card · 324×429 | facts file | none | discount pricing | strikethrough price, superhost | imgHeart, imgStar1, imgLine16, imgEllipse16, imgGroup1 | cardType="discount" | ✓ |
| 238:2517 Map Card · 327×289 | facts file | none | map view layout | bottom info panel, map icon | imgHeart, imgStar1, imgGroup1, imgEllipse16, imgGroup12, imgClear | cardType="map" | ✓ |

- Focus ring: Not specified in Figma; card itself not focusable, interactive children get focus
- States not in Figma: hover, active, disabled, loading
- No failed/truncated reads

## 6. Color/Alpha/Token Mapping

| Element / state | Figma value / alpha | primitive | semantic / role | CSS value | Match | Notes |
|---|---|---|---|---|---|---|
| Image background (all) | #B0B0B0 | neutral-06 | --color-image-placeholder | var(--color-image-placeholder) | ✓ | New token |
| Primary text (titles, prices) | #222222 | shade-02 | --color-text | var(--color-text) | ✓ | |
| Secondary text (location subtitle, dates) | #5E5E5E | neutral-08 | --color-text-tertiary | var(--color-text-tertiary) | ✓ | New token |
| Borders (Reservation, Confirmation) | #DDDDDD | neutral-03 | --color-border | var(--color-border) | ✓ | |
| Success/discount text | #008A05 | discounts | --color-success | var(--color-success) | ✓ | |
| Strong borders, secondary text | #717171 | neutral-07 | --color-text-secondary / --color-border-strong | var(--color-text-secondary) | ✓ | |
| Text on gradient | #FFFFFF | shade-01 | --color-on-primary | var(--color-on-primary) | ✓ | |
| Card surface (Reservation, Confirmation) | #FFFFFF | shade-01 | --color-surface | var(--color-surface) | ✓ | |
| Gradient (Reservation Card) | var(--gradient-card-1) | — | --gradient-card-1 | background-image: var(--gradient-card-1) | ✓ | Exact token |

- Image placeholder is not a real image; it's a gray rectangle representing where images go
- Gradient is only in Reservation Card for the "Reserve" button

## 7. Source Icons and Assets

| Asset / Figma node | Source path | Size/color/stroke | Appears in | Confirmed |
|---|---|---|---|---|
| imgHeart | f68c3df52dc504b479625514aee4ee6773879446.svg | 24×24, #222222 @30%, stroke white | all variants | ✓ |
| imgStar1 | 962426c60ef26d3a0050f76ef60ea8600ce77668.svg | 16×16 (inside container) | all variants | ✓ |
| imgGroup1 (ellipses) | bee15707a33baeb59ed668c3828c0fbd19361b39.svg | 49×6 | Default, Sleep, Discount, Map | ✓ |
| imgLine16 (strikethrough) | 75493c863c97e48efd17086c5a518a40d8233066.svg | 57×2, stroke #717171 | Reservation, Discount | ✓ |
| imgEllipse16 (dot separator) | 4a6bfa6b84af14643393f1da04b632b4ecc87c9a.svg | 2×2 | Reservation, Confirmation, Discount, Map | ✓ |
| imgRectangle2 | 34c6ec9b9c7d1bbe644d4ff12980189c84117317.svg | 325×56 | Reservation only | ✓ |
| imgLine17 (divider) | 25cd2d4f43ccb3858c58164572716bc126de9279.svg | 325×2 | Reservation only | ✓ |
| imgLine20 (divider) | 2b5ddf5365508c33c489cbf34d49bbbbcb632ec4.svg | 429×2 | Confirmation only | ✓ |
| img56683A2F... (badge) | 77042ce24ffec8526c1509f128ef91d5c0b950a1.svg | 67×14 | Confirmation only | ✓ |
| imgImage7 (superhost) | d1b1939c7d9ccce921e24fbb54de821331a7b322.png | 16×16 | Confirmation only | ✓ |
| imgClear | 016289f79d5e44f6c13c8268982132b764063c75.svg | 12×12 | Map only | ✓ |
| imgGroup12 (map icon) | fd9e4b421a500f73acd129aa587bcd4406582f21.svg | 24×24 | Map only | ✓ |

## 8. Public API

| prop / event | Reason | Default / allowed | Real behavior | Keyboard/disabled | User confirmed |
|---|---|---|---|---|---|
| cardType | Select variant layout | "default" / "sleep" / "reservation" / "confirmation" / "discount" / "map" | Renders variant-specific content | — | TBD |
| title | Main text (location, room name) | string | Displayed as primary text | — | TBD |
| subtitle | Secondary text (park, room type) | string? | Displayed below title | — | TBD |
| dates | Date range text | string? | Displayed in info section | — | TBD |
| price | Price display | string | Displayed with "$" prefix | — | TBD |
| originalPrice | Strikethrough price (Discount) | string? | Shown with line-through | — | TBD |
| rating | Star rating value | number? | Displayed with star icon | — | TBD |
| reviews | Review count | number? | Displayed next to rating | — | TBD |
| imageSrc | Image URL | string? | Future: real image; now placeholder | — | TBD |
| isFavorite | Heart state | boolean | Filled/outlined heart | — | TBD |
| onFavoriteClick | Heart click callback | () => void | Toggles favorite | Space/Enter when focused | TBD |
| onReserveClick | Reserve button click (reservation only) | () => void | Triggers booking | Space/Enter when focused | TBD |
| className | Custom styles | string? | Appended to root | — | TBD |

## 9. Q&A and User Decisions

| Question ID | Unconfirmed item | Options / impact | User answer | Status |
|---|---|---|---|---|
| Q-01 | What does clicking the Card do? Is it a link or button? | 1) Nothing — display only (Recommended), 2) Clickable — navigates to detail page, 3) Clickable — triggers callback | Display only — no click action on the card itself (chosen in chat) | resolved |
| Q-02 | Should the heart icon be a toggle with filled/outlined states? | 1) Yes — boolean isFavorite prop (Recommended), 2) No — always show outlined heart | Yes — boolean isFavorite prop with onFavoriteClick callback (chosen in chat) | resolved |
| Q-03 | Should the component accept children for custom content? | 1) No — fixed props only (Recommended), 2) Yes — allow children in addition to props | No — fixed props only, no children (chosen in chat) | resolved |

## 10. Verification Plan

| Check | Expected result | Method | Evidence |
|---|---|---|---|
| All 6 variants render at correct sizes | Match Figma dimensions | Storybook stories + ai:verify | TBD |
| Colors match tokens | Computed styles match token values | ai:check + computed style | TBD |
| Icons appear in correct variants | Match Figma asset list | Visual inspection + DOM check | TBD |
| Heart click fires callback | fn() called | Storybook play function | TBD |
| Reserve button click (reservation) | fn() called | Storybook play function | TBD |
| Gradient token used correctly | var(--gradient-card-1) in CSS | Source inspection | TBD |
| Type check passes | No TypeScript errors | pnpm typecheck | TBD |
| Guard passes | G1-G16 checks | pnpm ds:guard | TBD |

Required commands: `pnpm ai:check Card`, `pnpm ai:verify Card`, `pnpm typecheck`, `pnpm ds:guard`

## 11. User Review

- User decisions on plan content: TBD
- Approved revision: —
- Conditions before implementation: Answer Q-01, Q-02, Q-03

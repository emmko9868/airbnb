<!-- @ds-generated 0966d1ac487d6b21 — `pnpm ds:gen` 이 만든 파일입니다.
   Made from the real public exports, starter baseline and student review versions
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. -->
# Parts catalog

Schema: 1; Inventory: 170854f3e5e5ca55d9ee93d471d96a4b745e89aaaa2cc2cc8991401a69522591; Tokens: bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a

Look up parts: pnpm ds:catalog [part names...]. The command only reads the current code, starter baseline and student review records and works out the latest state.
An unchanged starter part can use its full public API and shipped states. A changed part is blocked until the student checks it with pnpm ds:review <Name>; that approval is valid only for the recorded props/states. If only token values change after a student review, behavior approval still counts and visuals become needs_review. Do not use failed, unreadable or stale parts.
Native attributes show what the type allows. They are not permission to override a part's look on a page. Auto check results are not_run in this version.
A default of unknown does not mean there is no value. Notes from the code do not replace usage examples or an accessibility review.
Starter baseline: scripts/starter-catalog-baseline.json. Release maintainers update it with pnpm ds:starter-baseline. Student review records: .ds/catalog-review.json (the generator only reads them).

## Accordion

Role: A stack of titled sections that open and close.
Import: `import { Accordion } from "@/components/Accordion"`
Source: `src/components/Accordion/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: AccordionSize`; default: `"md"`; Figma: Size
- `align?: AccordionAlign`; default: `"end"`; Figma: Align — whether the expand marker goes before or after the title.
- `disabled?: boolean`; default: `false`; Figma: Disabled — turns off the whole accordion. To turn off just one item, use item.disabled.
- `items?: AccordionItem[]`; default: `[]`
- `single?: boolean`; default: `false`; Whether only one item can be open at a time. By default, several can be open at once.
- `defaultOpen?: string[]`; default: `[]`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type AccordionAlign = "start" | "end";
export interface AccordionItem { id: string; title: string; content: ReactNode; disabled?: boolean; }
export type AccordionSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A stack of titled sections that open and close.
> 
> Follows the WAI-ARIA accordion pattern. Each title is a **button**, so Enter and Space just work;
> only moving between titles is added on top (↑↓ Home End).
> `aria-expanded` and `aria-controls` tie each title to its panel.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"28e0f1fad8b614f12934b4fe481fc3213efadd00806c3769381463a77e199d0f","cssHash":"e5c96b95941b5e9e61d46e150e41eee69f01a24df4c0791aa0512144ae875689","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Badge

Role: (no role written)
Import: `import { Badge } from "@/components/Badge"`
Source: `src/components/Badge/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `tone?: BadgeTone`; default: `"neutral"`; Figma: Tone
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";
````

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"bd4b1f60d93a1493a1e93452adce5d856eb57eb30a10759a5b7e71fc2bff6dd2","cssHash":"0a37288200cbb51f69f1b15709d6a9dd9c010208494a2c701c87f682786837e4","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Breadcrumb

Role: A trail of links showing where the current page sits in the site.
Import: `import { Breadcrumb } from "@/components/Breadcrumb"`
Source: `src/components/Breadcrumb/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: BreadcrumbSize`; default: `"md"`; Figma: Size
- `noTrailingSlash?: boolean`; default: `false`; Figma: NoTrailingSlash
- `items?: BreadcrumbItem[]`; default: `[]`
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface BreadcrumbItem { label: string; href?: string; onSelect?: () => void; }
export type BreadcrumbSize = "sm" | "md";
````

Notes written in the code (not proof of review):
> A trail of links showing where the current page sits in the site.
> 
> The last item is the **current page**, so it is not a link — it gets `aria-current="page"` and
> stays as plain text. A link that leads to the page you are already on confuses people.
> The separators are `aria-hidden`, so screen readers don't read out "slash".

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"baf7bb186c95d58e12abe25962c7906bc6a8679f721e4e337f33e8399c01f395","cssHash":"2b0963be8538847af24477ff79379f4b3b7f7a7874e58eb8d864ad806017b09d","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Button

Role: A button that runs the main action. Use only one Primary button per screen.
Import: `import { Button } from "@/components/Button"`
Source: `src/components/Button/index.ts`
Status: approved_scope; API: supported; Page use: reviewed scope only; Auto checks: not_run
Reason: Can be used only within the reviewed scope
Behavior/structure/API: approved_scope; Visual: approved_scope

### Public props (! = required, ? = optional)
- `variant?: ButtonVariant`; default: `"primary"`; Visual style variant
- `size?: ButtonSize`; default: `"large"`; Button size
- `isLoading?: boolean`; default: `false`; Shows loading spinner and disables interaction
- `fullWidth?: boolean`; default: `false`; Makes button full width of container
- `icon?: ReactNode`; default: `unknown`; Optional leading icon
- `children?: ReactNode`; default: `unknown`

Native attributes: `ButtonHTMLAttributes<HTMLButtonElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.
Native defaults: `{"type":"\"button\""}`

Types:
````ts
export type ButtonSize = "large" | "small";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link";
````

Review scope: `[{"props":{"variant":"primary","size":"large","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"secondary","size":"large","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"secondary","size":"large","isLoading":true,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"secondary","size":"large","isLoading":false,"fullWidth":false,"disabled":true,"type":"button"},"states":["default","disabled"]},{"props":{"variant":"tertiary","size":"large","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"link","size":"large","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"primary","size":"small","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"primary","size":"large","isLoading":true,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"primary","size":"large","isLoading":false,"fullWidth":false,"disabled":true,"type":"button"},"states":["default","disabled"]},{"props":{"variant":"primary","size":"large","isLoading":false,"fullWidth":true,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"primary","size":"small","isLoading":true,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"primary","size":"small","isLoading":false,"fullWidth":false,"disabled":true,"type":"button"},"states":["default","disabled"]},{"props":{"variant":"secondary","size":"small","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"tertiary","size":"small","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]},{"props":{"variant":"link","size":"small","isLoading":false,"fullWidth":false,"type":"button"},"states":["default","hover","active","focus"]}]`
Review evidence: `{"reviewer":"엠마","evidenceId":"Storybook: Primary, Secondary, SecondaryWithIcon, SecondaryStates, SecondaryStates, SecondaryStates, Tertiary, Link, Small, Loading, Disabled, FullWidth, Variants, Variants, Variants, Variants, Sizes, Sizes, States, States, States, PrimaryStates, PrimaryStates, PrimaryStates, PrimaryStates, PrimaryStates, PrimaryStates, Matrix, Matrix, Matrix, Matrix, Matrix, Matrix, Matrix, Matrix; appearance:true, pointer:true, keyboard:true, disabled:true; 예","reviewedAt":"2026-11-18T10:51:28.758Z","source":{"kind":"figma","ref":"https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/Airbnb-UI-Kit--Community-?node-id=238-2188&m=dev"}}`
Versions: `{"codeHash":"dbcfb61736274cb53ac8cf094759b3b79e10dbc20a79a9a039f42e1a61242ac3","cssHash":"c8edb182b6dbabafa6474b3fb47637a8aae1541d09fc4bec2c4cc95913f031af","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Callout

Role: (no role written)
Import: `import { Callout } from "@/components/Callout"`
Source: `src/components/Callout/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)
- `variant?: CalloutVariant`; default: `"propertyHighlight"`; Figma: Property 1
- `children?: ReactNode`; default: `unknown`; Property Highlight: main message text
- `title?: ReactNode`; default: `unknown`; Cancelation: section header (e.g., "Your reservation")
- `statusLabel?: ReactNode`; default: `unknown`; Cancelation: status label (e.g., "CANCELED")
- `propertyName?: ReactNode`; default: `unknown`; Cancelation: property name (e.g., "tiny house, tiny farm")
- `reservationCode?: ReactNode`; default: `unknown`; Cancelation: reservation code (e.g., "Reservation code: XMPQKAPZ6D")
- `imagePlaceholder?: ReactNode`; default: `unknown`; Cancelation: image area content (default: gray placeholder)

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "title">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type CalloutVariant = "propertyHighlight" | "cancelation";
````

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"fb8658a0f5b9419c64caeeffa95385d508c9c881b2e8e9a3935e5b80fb6401f9","cssHash":"3308cd8a5bc35182481cb6a4af11ece1ce72a41d6ccdff19d0d835557a826a54","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Card

Role: A surface that groups related content.
Import: `import { Card } from "@/components/Card"`
Source: `src/components/Card/index.ts`
Status: approved_scope; API: supported; Page use: reviewed scope only; Auto checks: not_run
Reason: Can be used only within the reviewed scope
Behavior/structure/API: approved_scope; Visual: approved_scope

### Public props (! = required, ? = optional)
- `cardType?: CardType`; default: `"default"`
- `title?: string`; default: `""`
- `subtitle?: string`; default: `unknown`
- `dates?: string`; default: `unknown`
- `price?: string`; default: `unknown`
- `originalPrice?: string`; default: `unknown`
- `rating?: number`; default: `unknown`
- `reviews?: number`; default: `unknown`
- `imageSrc?: string`; default: `unknown`
- `isFavorite?: boolean`; default: `false`
- `onFavoriteClick?: () => void`; default: `unknown`; event
- `onReserveClick?: () => void`; default: `unknown`; event
- `guests?: string`; default: `unknown`
- `breakdownItems?: BreakdownItem[]`; default: `unknown`
- `totalLabel?: string`; default: `unknown`
- `total?: string`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "title">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface BreakdownItem { label: string; value: string; isSuccess?: boolean; }
export type CardType = "default" | "sleep" | "reservation" | "confirmation" | "discount" | "map";
````

Review scope: `[{"props":{"cardType":"default","isFavorite":false},"states":["default","focus"]},{"props":{"cardType":"default","isFavorite":true},"states":["default","focus"]},{"props":{"cardType":"sleep","isFavorite":false},"states":["default","focus"]},{"props":{"cardType":"reservation","isFavorite":false},"states":["default","focus"]},{"props":{"cardType":"confirmation","isFavorite":false},"states":["default","focus"]},{"props":{"cardType":"discount","isFavorite":false},"states":["default","focus"]},{"props":{"cardType":"map","isFavorite":false},"states":["default","focus"]}]`
Review evidence: `{"reviewer":"엠마","evidenceId":"Storybook: Default, DefaultFavorite, Sleep, Reservation, Confirmation, Discount, Map, WithCallbacks, ReservationWithCallbacks; appearance:true, keyboard:true; 예","reviewedAt":"2026-11-18T10:52:07.811Z","source":{"kind":"figma","ref":"https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=238-2378"}}`
Versions: `{"codeHash":"e4ad6979546eefb9140a1cd3d8bdf96feef99d167a8b7229bd978c96d329278f","cssHash":"7b3f1b6e47ed077d13ab83ab98f66abab5ad087eb4c82e0f1773c83f0ac98f12","dependencyHash":"f101720fc98b0fada89e4605bba45ddb548ca8cdee6ca4be2cbf1049edf0d780","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/components/Button/Button.css`, `src/components/Button/Button.tsx`

## Checkbox

Role: A checkbox for turning one option on or off.
Import: `import { Checkbox } from "@/components/Checkbox"`
Source: `src/components/Checkbox/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `indeterminate?: boolean`; default: `false`; Figma: Indeterminate
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`; The text shown next to the box. If it is not given, children is used instead.
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<InputHTMLAttributes<HTMLInputElement>, "type">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Notes written in the code (not proof of review):
> A checkbox for turning one option on or off.
> 
> Uses the native `input[type=checkbox]` — the browser takes care of the keyboard (Space), form submission and what screen readers announce.
> The ref points to the input (so a form library's register attaches to it directly).
> `indeterminate` is a DOM property, not an HTML attribute, so it is set in an effect.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"cebad761ee6e1943f8a63d7c8fe173ff985d838487eca3dcbc709d4d0ff6cdf1","cssHash":"f7deaba28bc662bc3c36203e2aff3313b42890337b157d45803c66d69ddc2bf9","dependencyHash":"d28f3440f310183a819dc02ba031561c15cf17c21b06138662b5b7e16f187b0b","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/refs.ts`

## CodeSnippet

Role: A piece of code to show and copy.
Import: `import { CodeSnippet } from "@/components/CodeSnippet"`
Source: `src/components/CodeSnippet/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `type?: CodeSnippetType`; default: `"single"`; Figma: Type
- `wrapText?: boolean`; default: `false`; Figma: WrapText
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `code?: string`; default: `""`
- `collapsedLines?: number`; default: `15`; How many lines to show when a multi snippet is collapsed.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type CodeSnippetType = "single" | "multi" | "inline";
````

Notes written in the code (not proof of review):
> A piece of code to show and copy.
> 
> A successful copy is announced **in words** — if only the icon changes, screen reader users can't tell whether it was copied.
> The result is written into an `aria-live="polite"` region.
> `inline` renders only `code`, with no button.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"a188a92d0825333c840f18901b46b1ee49f111b911356eb21564cce68b8eef23","cssHash":"b047eeb58d7fd729b299cd09a2a3a4a233ee0c2b07488308c51d1c9555c38c70","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## ComboBox

Role: Combo box — a choice you narrow down by typing.
Import: `import { ComboBox } from "@/components/ComboBox"`
Source: `src/components/ComboBox/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: ComboBoxSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `items?: ComboBoxOption[]`; default: `[]`
- `value?: string`; default: `unknown`
- `defaultValue?: string`; default: `unknown`
- `placeholder?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `onValueChange?: (value: string) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface ComboBoxOption { value: string; label: string; disabled?: boolean; }
export type ComboBoxSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> Combo box — a choice you narrow down by typing.
> 
> How it differs from Dropdown: the trigger is a **text input**, so you narrow the list by typing.
> `aria-autocomplete="list"` tells screen readers that "typing narrows the list".
> The number of results is read out through `aria-live` — seeing the list shrink must not be the only way to notice it.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"7750d91fae3bb2072b8919b5c7f449eafcdfbbf0760d01487f04052c9040f083","cssHash":"84560471f12dce2da4fc80c1ab675cf9f59e26a9151a70038a84c97772dba238","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## ContainedList

Role: A list with a title.
Import: `import { ContainedList } from "@/components/ContainedList"`
Source: `src/components/ContainedList/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: ContainedListSize`; default: `"md"`; Figma: Size
- `variant?: ContainedListVariant`; default: `"on-page"`; Figma: Variant
- `title?: string`; default: `unknown`
- `items?: ContainedListEntry[]`; default: `[]`
- `action?: ReactNode`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface ContainedListEntry { id: string; label: string; meta?: string; onSelect?: () => void; disabled?: boolean; }
export type ContainedListSize = "sm" | "md" | "lg";
export type ContainedListVariant = "on-page" | "disclosed";
````

Notes written in the code (not proof of review):
> A list with a title.
> 
> The title and the list are tied together with `aria-labelledby`, so screen readers first say "what this is a list of".
> If items can be clicked, use a `button` — an `li` with only onClick can't be pressed with the keyboard.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"0bfbf246f54e8cd0c9f970715e9561d1224381d5110e5c4a61b129e91f8ebac1","cssHash":"d9fc49c4cbada1df460e528b32cb77400e5341529bd4bbafba0fa58602d2347b","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## ContentSwitcher

Role: A row of options that switches the content shown in one place.
Import: `import { ContentSwitcher } from "@/components/ContentSwitcher"`
Source: `src/components/ContentSwitcher/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: ContentSwitcherSize`; default: `"md"`; Figma: Size
- `items?: ContentSwitcherOption[]`; default: `[]`
- `value?: string`; default: `unknown`
- `defaultValue?: string`; default: `unknown`
- `onValueChange?: (id: string) => void`; default: `unknown`; event
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface ContentSwitcherOption { id: string; label: string; disabled?: boolean; }
export type ContentSwitcherSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A row of options that switches the content shown in one place.
> 
> Unlike Tabs, it does not hold the panels itself — it is a **selection tool** that changes what is shown in the same spot.
> That is why `role="radiogroup"` is the right fit. With tablist, screen readers would go looking for panels.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"41705509cd468a7fa0deb72d7fb7e96b207faefad3ed3b75af47203588a6be89","cssHash":"af2f361d71149a8cce3c381ae42e4571194ce4aa550682d094522398793a775c","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## DatePicker

Role: A date input with a pop-up calendar.
Import: `import { DatePicker } from "@/components/DatePicker"`
Source: `src/components/DatePicker/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `type?: DatePickerType`; default: `"single"`; Figma: Type
- `size?: DatePickerSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `value?: string`; default: `unknown`; YYYY-MM-DD. For range, "start/end".
- `defaultValue?: string`; default: `unknown`
- `onValueChange?: (value: string) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerType = "single" | "range";
````

Notes written in the code (not proof of review):
> A date input with a pop-up calendar.
> 
> **The text input is always there too.** With only a calendar, entering "1987-03-02" would mean
> pressing the previous-month button hundreds of times. The calendar is a helper.
> 
> The calendar is a `role="grid"` and the keyboard is essential.
>   ←→↑↓ one day / one week  ·  PageUp/Down one month  ·  Home/End start/end of the week  ·  Esc close
> Today is marked with `aria-current="date"`, and the chosen day with `aria-selected`.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"f8d44980c7c85f442acb9b15d217dddbdeb125ad385e95f94cbb3fbff9929dff","cssHash":"ec5614ed566fd36a95df8506a29ba747ad072df296b81e8a4e2ccccf193fb40f","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Dropdown

Role: A custom-built dropdown for picking one option.
Import: `import { Dropdown } from "@/components/Dropdown"`
Source: `src/components/Dropdown/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `type?: DropdownType`; default: `"default"`; Figma: Type
- `size?: DropdownSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `items?: DropdownOption[]`; default: `[]`
- `value?: string`; default: `unknown`
- `defaultValue?: string`; default: `unknown`
- `placeholder?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `onValueChange?: (value: string) => void`; default: `unknown`; event; Not named onSelect, because onSelect is already a native DOM event and can't be used.
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface DropdownOption { value: string; label: string; disabled?: boolean; }
export type DropdownSize = "sm" | "md" | "lg";
export type DropdownType = "default" | "inline";
````

Notes written in the code (not proof of review):
> A custom-built dropdown for picking one option.
> 
> Follows the WAI-ARIA combobox + listbox pattern. If a native `select` can do the job, use `Select` —
> the native one works much better on mobile. Use this one only when the options need formatting.
> 
> Focus stays on the trigger, and `aria-activedescendant` points to the active option.
> If focus moved to each option, screen readers would announce it as if you had left the list.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"a1fe73fe17ac429245a5e9c42cae86c24415f5d532e42ca9827ba39772dcbaad","cssHash":"02a67f3d2fa085685d21510a8cd90adb7403fc83d33d42cd1a8605b4fdaba629","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## FileUploader

Role: A control for choosing and uploading files.
Import: `import { FileUploader } from "@/components/FileUploader"`
Source: `src/components/FileUploader/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: FileUploaderSize`; default: `"md"`; Figma: Size
- `variant?: FileUploaderVariant`; default: `"button"`; Figma: Variant
- `multiple?: boolean`; default: `false`; Figma: Multiple
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `accept?: string`; default: `unknown`
- `files?: UploadedFile[]`; default: `unknown`; The file list (controlled). If you pass it, you must update it yourself in onFilesAdd and onFileRemove.
- `defaultFiles?: UploadedFile[]`; default: `[]`; The starting file list (uncontrolled). Chosen files are added as "Done" and removed with ×.
- `onFilesAdd?: (files: File[]) => void`; default: `unknown`; event
- `onFileRemove?: (id: string) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type FileUploaderSize = "sm" | "md" | "lg";
export type FileUploaderVariant = "button" | "dropArea";
export interface UploadedFile { id: string; name: string; size?: number; status?: "uploading" | "done" | "error"; message?: string; }
````

Notes written in the code (not proof of review):
> A control for choosing and uploading files.
> 
> **A drop area on its own is not enough.** Dragging only works with a mouse, so keyboard users could not add files.
> That is why the dropArea variant also has a real `label`+`input[type=file]` button inside it.
> Progress and failure are read out through `aria-live` — a color change in the list alone does not get the message across.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"f34b8e3319a54cce41176d13b97d8f919632cc566eab57c1f8e6a4757b10ee25","cssHash":"7cac4b5c4bab50e768446ccd277a1416dd79e231f58ab155b24582d47efcab0b","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Icon

Role: A single-color SVG icon. Clicks and navigation belong to the parent Button/IconButton/Link.
Import: `import { Icon } from "@/components/Icon"`
Source: `src/components/Icon/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `name!: IconName`; default: `unknown`; One name from a fixed list of icons whose source has been checked.
- `size?: IconSize`; default: `"md"`; Size when the icon is shown on its own. Inside an IconButton, it follows the parent slot's size.
- `tone?: IconTone`; default: `"inherit"`; With inherit, the icon follows the parent's semantic color.
- `decorative?: boolean`; default: `true`; Decorative icons are hidden from screen readers; meaningful mode (false) requires a label.
- `label?: string`; default: `unknown`; The accessible name in meaningful mode. Do not provide it in decorative mode.

Types:
````ts
export type IconName = "add" | "close" | "search";
export type IconSize = "sm" | "md" | "lg";
export type IconTone = "inherit" | "default" | "secondary";
````

Notes written in the code (not proof of review):
> A single-color SVG icon. Clicks and navigation belong to the parent Button/IconButton/Link.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"b1dea3d1ba435fed9971acfdfcfabc13406de26beaf0b48f038178cceeb3a525","cssHash":"90618475f26ad96e8828c508cc9ea804b463da82c89814896a777d24834fe580","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## IconButton

Role: A round icon-only button. `label` is its accessible name.
Import: `import { IconButton } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: stale; API: supported; Page use: blocked; Auto checks: not_run
Reason: Starter part changed: codeHash, cssHash. The student must run pnpm ds:review IconButton in a terminal.
Behavior/structure/API: stale; Visual: stale

### Public props (! = required, ? = optional)
- `size?: IconButtonSize`; default: `"L"`; Button size (Figma: Size)
- `variant?: IconButtonVariant`; default: `"secondary"`; Visual style variant (Figma: Type)
- `icon?: ReactNode`; default: `unknown`; Icon SVG to render
- `label!: string`; default: `unknown`; Accessible name for the button. Becomes aria-label and title. Required because the button has no visible text.
- `children?: ReactNode`; default: `unknown`

Native attributes: `ButtonHTMLAttributes<HTMLButtonElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.
Native defaults: `{"type":"\"button\""}`

Types:
````ts
export type IconButtonSize = "L" | "S";
export type IconButtonVariant = "primary" | "secondary";
````

Notes written in the code (not proof of review):
> A round icon-only button. `label` is its accessible name.

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## InlineLoading

Role: A small progress indicator that sits next to a button or form. It shows the status with both an icon shape (spinner, check mark, exclamation mark) and text — never by color alone.
Import: `import { InlineLoading } from "@/components/InlineLoading"`
Source: `src/components/InlineLoading/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `status?: InlineLoadingStatus`; default: `"active"`; Figma: Status
- `description?: string`; default: `unknown`; Text shown next to the status. For example: "Saving", "Saved".
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type InlineLoadingStatus = "active" | "finished" | "error" | "inactive";
````

Notes written in the code (not proof of review):
> A small progress indicator that sits next to a button or form.
> It shows the status with both an icon shape (spinner, check mark, exclamation mark) and text — never by color alone.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"d444571e4de760a7b01673eadf3f556ce57d45b464505bf0ab7806cb0a463281","cssHash":"56fbdf93cc9ec238b090aaf67e3794769b41e231e669ad4f3f914332b951f1f3","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Link

Role: A text link. Use it only to go to another page — to run an action, use Button.
Import: `import { Link } from "@/components/Link"`
Source: `src/components/Link/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: LinkVariant`; default: `"default"`; Figma: Variant — `inline` is a link inside a sentence (always underlined).
- `size?: LinkSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled — removes `href` so the link does not go anywhere.
- `external?: boolean`; default: `false`; Figma: External — opens in a new window and tells screen readers that it does.
- `children?: ReactNode`; default: `unknown`

Native attributes: `AnchorHTMLAttributes<HTMLAnchorElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type LinkSize = "sm" | "md";
export type LinkVariant = "default" | "inline";
````

Notes written in the code (not proof of review):
> A text link. Use it only to go to another page — to run an action, use Button.
> 
> When disabled, it removes `href` and adds `aria-disabled`. `<a>` has no disabled attribute, so
> changing only the class would still take you to the page when clicked.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"9f173f62eeda46e00879a04169e253ca60ed733bdb9a40abd07a84319c6b7206","cssHash":"b366b4d82603603d34e33c7733be2185ef0f163c1b6da7f22616a14a7a9b48bc","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Loading

Role: A loading indicator (spinner).
Import: `import { Loading } from "@/components/Loading"`
Source: `src/components/Loading/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: LoadingSize`; default: `"md"`; Figma: Size
- `overlay?: boolean`; default: `false`; Figma: Overlay — covers the whole screen and shows the spinner in the middle.
- `label?: string`; default: `unknown`; Text read out by screen readers. It is not shown on screen.
- `children?: ReactNode`; default: `unknown`; Text shown below the spinner.

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type LoadingSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A loading indicator (spinner).
> 
> It has `role=status`, so screen readers read the label. The spinner is only decoration, so it is hidden from them.
> For users who have turned on reduced motion, the spinning stops (CSS).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"137028d82fd6a575a34e7f829617636d61273d440f3056136885425f24f1372c","cssHash":"983697dab7b8aa98ebf1ecd035acacf80c899c4b3a9c15e9a194d18221a2a6ed","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## MenuIcon

Role: Menu icon — from my-assets/icons/Button Icon/Type=Menu.svg
Import: `import { MenuIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Menu icon — from my-assets/icons/Button Icon/Type=Menu.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Modal

Role: A dialog that opens on top of the page.
Import: `import { Modal } from "@/components/Modal"`
Source: `src/components/Modal/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: ModalVariant`; default: `"default"`; Figma: Variant
- `size?: ModalSize`; default: `"md"`; Figma: Size
- `open?: boolean`; default: `unknown`; Figma: Open — controlled mode. If you pass it, the modal closes only when you set it to `false` in `onClose`.
- `defaultOpen?: boolean`; default: `false`; Whether it starts open, when the modal manages its own state (uncontrolled).
- `trigger?: ReactNode`; default: `unknown`; If given, draws a button with this text (or element) that opens the modal. Use it in uncontrolled mode.
- `title?: string`; default: `unknown`
- `onClose?: () => void`; default: `unknown`; event
- `footer?: ReactNode`; default: `unknown`
- `dismissOnOverlay?: boolean`; default: `true`; Whether clicking the background closes the modal. Set it to `false` if there is unsaved input.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type ModalSize = "sm" | "md" | "lg";
export type ModalVariant = "default" | "danger";
````

Notes written in the code (not proof of review):
> A dialog that opens on top of the page.
> 
> It always does three things — if any one is missing, keyboard users get stuck or lost.
>   1. Focus trap: Tab never moves outside the modal
>   2. Esc closes it
>   3. When it closes, **focus goes back to where it was before it opened**
> 
> It is attached to body with `createPortal`. This is the only way to keep it from being
> cut off by a parent's `overflow: hidden` or `transform`.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"ed4690ac9e1773c3a8855177a1deae76d152dfa26afe2aa90bd26d881496d72d","cssHash":"163f3645a1594ce790877aaa6ab7e58de946f499112b72148f06499f8799b15a","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## MultiSelect

Role: A dropdown for choosing several options.
Import: `import { MultiSelect } from "@/components/MultiSelect"`
Source: `src/components/MultiSelect/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: MultiSelectSize`; default: `"md"`; Figma: Size
- `type?: MultiSelectType`; default: `"default"`; Figma: Type
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `items?: MultiSelectOption[]`; default: `[]`
- `value?: string[]`; default: `unknown`
- `defaultValue?: string[]`; default: `unknown`
- `placeholder?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `onValueChange?: (values: string[]) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface MultiSelectOption { value: string; label: string; disabled?: boolean; }
export type MultiSelectSize = "sm" | "md" | "lg";
export type MultiSelectType = "default" | "inline";
````

Notes written in the code (not proof of review):
> A dropdown for choosing several options.
> 
> The list has `aria-multiselectable="true"`, and each option's `aria-selected` tells whether it is chosen.
> The number of chosen options is read out with `aria-live` — a count badge alone can only be seen, not heard.
> The list **stays open** after you choose an option (because the point is to choose several).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"ca58f60baa3fb52a2fb380f1afd6859712dfca3483e43c253ec876c7fdfc3434","cssHash":"21eb19ad6dbced5f9331e435c4440dbe87efc69518e18aa03f23baef85d4b879","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Navigation

Role: (no role written)
Import: `import { Navigation } from "@/components/Navigation"`
Source: `src/components/Navigation/index.ts`
Status: approved_scope; API: supported; Page use: reviewed scope only; Auto checks: not_run
Reason: Can be used only within the reviewed scope
Behavior/structure/API: approved_scope; Visual: approved_scope

### Public props (! = required, ? = optional)
- `sections?: NavigationSection[]`; default: `unknown (dynamic expression)`
- `activeSection?: string`; default: `unknown`
- `onSectionClick?: (sectionId: string) => void`; default: `unknown`; event
- `onSearch?: () => void`; default: `unknown`; event
- `disabled?: boolean`; default: `false`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface NavigationSection { id: string; label: string; placeholder: string; }
````

Review scope: `[{"props":{"disabled":false},"states":["default","hover","focus"]},{"props":{"disabled":true},"states":["default","disabled"]}]`
Review evidence: `{"reviewer":"Emma","evidenceId":"Storybook: Default, WithActiveSection, SearchClick, Disabled, AllSections, TabNavigation; appearance:true, pointer:true, keyboard:true, disabled:true; ","reviewedAt":"2026-11-18T10:32:12.870Z","source":{"kind":"figma","ref":"https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=418-8282"}}`
Versions: `{"codeHash":"7d6716518f4ece5c158ca5ddde746c09a19dcdacdde2e953985a1f72b040dcd8","cssHash":"cf68331ec0fb13ec07f49a09c4a254167fc29da2858f096138f76e68d8757042","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## NextIcon

Role: Next icon — from my-assets/icons/Button Icon/Type=Next.svg
Import: `import { NextIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Next icon — from my-assets/icons/Button Icon/Type=Next.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Notification

Role: A notification message.
Import: `import { Notification } from "@/components/Notification"`
Source: `src/components/Notification/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `tone?: NotificationTone`; default: `"info"`; Figma: Tone
- `variant?: NotificationVariant`; default: `"inline"`; Figma: Variant
- `dismissible?: boolean`; default: `false`; Figma: Dismissible
- `title?: string`; default: `unknown`
- `onDismiss?: () => void`; default: `unknown`; event; Called when the close button is clicked. Only matters when `dismissible` is on.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type NotificationTone = "info" | "success" | "warning" | "danger";
export type NotificationVariant = "inline" | "toast";
````

Notes written in the code (not proof of review):
> A notification message.
> 
> `danger` uses `role="alert"`, so the screen reader **interrupts** what it is saying to read it. The others use `role="status"`
> and are read after the screen reader finishes what it is saying — an informational message should not interrupt the user's work.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"607644b9d1d8046a98bd09bbd1c84fc499a8c8519470466b7c6758b6bab07c81","cssHash":"233165b0121b7565ac55180ff6f1b30207a97b75fd12d422f158ff9c34c480ff","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## NumberInput

Role: A field for entering a number.
Import: `import { NumberInput } from "@/components/NumberInput"`
Source: `src/components/NumberInput/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: NumberInputSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `hideSteppers?: boolean`; default: `false`; Figma: HideSteppers
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `value?: number`; default: `unknown`
- `defaultValue?: number`; default: `unknown`
- `min?: number`; default: `unknown`
- `max?: number`; default: `unknown`
- `step?: number`; default: `1`
- `onValueChange?: (value: number) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type NumberInputSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A field for entering a number.
> 
> It uses `input[type=number]` but adds its own up/down buttons — the browser's built-in spinner
> is too small to press easily and cannot be given an `aria-label`.
> The Up/Down arrow keys are handled here instead of by the browser, so the value stays within `min` and `max`.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"720b6c2f8e3963d21b4d1f94fe70702408be626baaeea87044698882d1d52514","cssHash":"fbcb4dbaea41732febcc45537c5e4183ce0f28eeb9da556d1e310837fa2cdc66","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## OverflowMenu

Role: A "more actions" menu behind a three-dot button.
Import: `import { OverflowMenu } from "@/components/OverflowMenu"`
Source: `src/components/OverflowMenu/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: OverflowMenuSize`; default: `"md"`; Figma: Size
- `align?: OverflowMenuAlign`; default: `"end"`; Figma: Align
- `flipped?: boolean`; default: `false`; Figma: Flipped — opens upward.
- `items?: OverflowMenuEntry[]`; default: `[]`
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type OverflowMenuAlign = "start" | "end";
export interface OverflowMenuEntry { id: string; label: string; onSelect?: () => void; disabled?: boolean; danger?: boolean; }
export type OverflowMenuSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A "more actions" menu behind a three-dot button.
> 
> Inside `role="menu"` you move with the **arrow keys, not Tab** (the WAI-ARIA menu pattern).
> That is why items have tabIndex -1 and the code moves focus itself.
> The trigger has `aria-haspopup="menu"` so screen readers announce that it opens a menu.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"b759d04f52c5e9264e2fde55eb88ea857dedb0b8c09723849551baa55dd74c6f","cssHash":"3dc00f43723cc226c69d0cc73e4f4bfd46bef4c997932197f0bca96e3d4763a7","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Pagination

Role: Controls for moving between pages.
Import: `import { Pagination } from "@/components/Pagination"`
Source: `src/components/Pagination/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: PaginationVariant`; default: `"default"`; Figma: Variant
- `size?: PaginationSize`; default: `"md"`; Figma: Size
- `page?: number`; default: `unknown`; The current page, counting from 1 (controlled). If you pass it, you must update it yourself in `onPageChange`.
- `defaultPage?: number`; default: `1`; The page shown first (uncontrolled).
- `pageCount?: number`; default: `1`
- `onPageChange?: (page: number) => void`; default: `unknown`; event; Called with the new page number. (It is not named `onChange` because that is already a native DOM event.)
- `siblings?: number`; default: `1`; How many page numbers to show on each side of the current page.
- `label?: string`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type PaginationSize = "sm" | "md" | "lg";
export type PaginationVariant = "default" | "compact";
````

Notes written in the code (not proof of review):
> Controls for moving between pages.
> 
> `nav` + `aria-label` give the area a name, and the current page gets `aria-current="page"`.
> The ellipsis is an `aria-hidden` mark, not a button, so it is not in the Tab order.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"1b6e093a25077dee04b114fb9906609b32fcb32cd4fe4aeff79cb91c38f95892","cssHash":"82c55c9353ce2d24c1d97bf63b7dca51c3a871f464a09bbf701ef971de2bfea7","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Popover

Role: A small pop-up panel that opens next to a button.
Import: `import { Popover } from "@/components/Popover"`
Source: `src/components/Popover/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `align?: PopoverAlign`; default: `"bottom"`; Figma: Align
- `caret?: boolean`; default: `true`; Figma: Caret
- `open?: boolean`; default: `unknown`; Figma: Open — to control it yourself, use it together with `onOpenChange`.
- `defaultOpen?: boolean`; default: `false`
- `onOpenChange?: (open: boolean) => void`; default: `unknown`; event
- `trigger?: ReactNode`; default: `unknown`; What is shown on the button that opens the popover (text or an icon). It is already inside a button, so the keyboard can open it — don't pass another button.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type PopoverAlign = "top" | "bottom" | "left" | "right";
````

Notes written in the code (not proof of review):
> A small pop-up panel that opens next to a button.
> 
> It is different from Tooltip — **it can contain buttons and links.** So it opens on click, not on
> hover (if it opened on hover, it would close while you move the mouse, and you could not click inside).
> When it opens, focus moves to the first element inside; when it closes, focus goes back to the trigger.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"24a5dd8ca7a291e2c36f909d7e5266887237fed8a575ef15bd4989be9e856c76","cssHash":"09eaf97bf3d7669864f61df00e7e5c2ee9c091b08ec47e60adf3fc635ae22646","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## PreviousIcon

Role: Previous icon — from my-assets/icons/Button Icon/Type=Previous.svg
Import: `import { PreviousIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Previous icon — from my-assets/icons/Button Icon/Type=Previous.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## ProfileIcon

Role: Profile icon — from my-assets/icons/Button Icon/Type=Profile.svg
Import: `import { ProfileIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Profile icon — from my-assets/icons/Button Icon/Type=Profile.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## ProgressBar

Role: A bar that shows how far a task has progressed.
Import: `import { ProgressBar } from "@/components/ProgressBar"`
Source: `src/components/ProgressBar/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: ProgressBarSize`; default: `"md"`; Figma: Size
- `status?: ProgressBarStatus`; default: `"active"`; Figma: Status
- `indeterminate?: boolean`; default: `false`; Figma: Indeterminate — for a task whose end is unknown.
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `value?: number`; default: `0`
- `max?: number`; default: `100`
- `hideValue?: boolean`; default: `false`; Whether to hide the percentage shown next to the label.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type ProgressBarSize = "sm" | "md";
export type ProgressBarStatus = "active" | "finished" | "error";
````

Notes written in the code (not proof of review):
> A bar that shows how far a task has progressed.
> 
> `role="progressbar"` + `aria-valuenow/min/max`. **When indeterminate, valuenow must be left out** —
> if the value is unknown and you put 0, screen readers wrongly read "0%".
> Finished and failed are not shown by color alone; they are also written as text.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"80b08f987bc4847f7771a2c098f906b8a4521a3b5c2d47c59dd83c93eaf710fa","cssHash":"7070bf09e46496d1b963470405fb45d9ca4cacf2586c4b55e537f9cda07d0a1a","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## ProgressIndicator

Role: A step-by-step progress tracker.
Import: `import { ProgressIndicator } from "@/components/ProgressIndicator"`
Source: `src/components/ProgressIndicator/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `orientation?: ProgressIndicatorOrientation`; default: `"horizontal"`; Figma: Orientation
- `size?: ProgressIndicatorSize`; default: `"md"`; Figma: Size
- `steps?: ProgressStep[]`; default: `[]`
- `current?: number`; default: `0`; The current step, counting from 0.
- `interactive?: boolean`; default: `false`; Whether users can click a step to go to it. Turn it off if the flow cannot go back.
- `onStepChange?: (index: number) => void`; default: `unknown`; event
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type ProgressIndicatorOrientation = "horizontal" | "vertical";
export type ProgressIndicatorSize = "sm" | "md";
export interface ProgressStep { id: string; label: string; description?: string; error?: boolean; disabled?: boolean; }
````

Notes written in the code (not proof of review):
> A step-by-step progress tracker.
> 
> The current step gets `aria-current="step"`. Complete / current / upcoming are not told apart **by color alone**;
> a symbol (✓ · ! · number) is shown too — color-blind users also need to see how far they have come.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"7c3f04bb0401515f0aafdd152ec75e698b67d7734a4fc68a3ba4c281fec7d15d","cssHash":"5d29ea5bb0ee9de5fff22fe41af2ebfc1cb1c89e20fe2c6030fa11afbf7dc9e2","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## RadioButton

Role: A radio button for choosing one option from a set.
Import: `import { RadioButton } from "@/components/RadioButton"`
Source: `src/components/RadioButton/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `orientation?: RadioButtonOrientation`; default: `"horizontal"`; Figma: Orientation — the layout direction when used as a group (`items`).
- `label?: string`; default: `unknown`; For a single radio button, the text next to it; for a group, the group's title (legend).
- `items?: RadioButtonOption[]`; default: `unknown`; If given, draws a group of radio buttons (radiogroup). A single radio button gives nothing to choose between, so you usually use this.
- `selected?: string`; default: `unknown`; The selected value of the group (controlled).
- `defaultSelected?: string`; default: `unknown`; The value selected at first in the group (uncontrolled).
- `onSelectedChange?: (value: string) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<InputHTMLAttributes<HTMLInputElement>, "type">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface RadioButtonOption { value: string; label: string; disabled?: boolean; }
export type RadioButtonOrientation = "horizontal" | "vertical";
````

Notes written in the code (not proof of review):
> A radio button for choosing one option from a set.
> 
> Without `items`, it draws one native `input[type=radio]` (group several by giving them the same name).
> With `items`, it draws a group with fieldset + legend — moving with the arrow keys is handled by
> the native radios that share the same name. ref points to the input for a single radio, or to the first input for a group.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"ee5ee3f7c7df2dc195275c28ed8dd3362d881e0b747ef648a32e658f8560b53b","cssHash":"c90a941dc80141a4087e87014e83aff99869ce726e870b0f5cd5592cbdff3fec","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## RedirectIcon

Role: Redirect icon — from my-assets/icons/Button Icon/Type=Redirect.svg
Import: `import { RedirectIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Redirect icon — from my-assets/icons/Button Icon/Type=Redirect.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Search

Role: Search field.
Import: `import { Search } from "@/components/Search"`
Source: `src/components/Search/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: SearchSize`; default: `"md"`; Figma: Size
- `expandable?: boolean`; default: `false`; Figma: Expandable — while the field is empty, only the magnifying-glass button is shown.
- `label?: string`; default: `unknown`; Accessible name (what screen readers announce). It is not shown on screen (the placeholder does not count as a name).
- `onClear?: () => void`; default: `unknown`; event; Called when the field is emptied with the clear button or the Esc key. onChange is also called, with an empty value.
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type SearchSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> Search field.
> 
> `input[type=search]` + a magnifying-glass icon + a clear button. The outer wrapper is a `role=search` landmark.
> The clear button appears once there is a value, and Esc also clears it. The ref points to the input.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"3585ebc4d94cf7b76f9482c4572b3b841e078b7f97db9d48947d18b17240eb39","cssHash":"5310513f302f1713ef92aef04c8ca68982d09bd07d96bf9a38725cf8ec05da77","dependencyHash":"0778067baa81a2b6b636b15bcb6f7db028bd535a783ef1ededc6fbf5c9485e3a","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`, `src/lib/refs.ts`

## SearchIcon

Role: Search icon — from my-assets/icons/Button Icon/Type=Search.svg
Import: `import { SearchIcon } from "@/components/IconButton"`
Source: `src/components/IconButton/index.ts`
Status: unverified; API: supported; Page use: blocked; Auto checks: not_run
Reason: No starter baseline or student review yet
Behavior/structure/API: unverified; Visual: unverified

### Public props (! = required, ? = optional)

Notes written in the code (not proof of review):
> Search icon — from my-assets/icons/Button Icon/Type=Search.svg

Review scope: `[]`
Review evidence: `null`
Versions: `{"codeHash":"ad1610ff5702cbe0e2eedecda5aa9def65774e5849246e6e069e4c977b12b46d","cssHash":"599bcc8d4a5f060c72bec9e291bf5f4c82695ad1812fcca912c3188eb43fd299","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Select

Role: Native select box. On mobile the phone's own picker opens, and the browser handles keyboard and screen-reader support. Use Dropdown only when the options need custom formatting. The ref points to the `<select>`.
Import: `import { Select } from "@/components/Select"`
Source: `src/components/Select/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: SelectSize`; default: `"md"`; Figma: Size
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `items?: SelectOption[]`; default: `unknown`; The choices. If omitted, the `<option>` elements in children are used as they are.
- `placeholder?: string`; default: `unknown`; Hint text shown while nothing is chosen. If given, an empty first option is added.
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface SelectOption { value: string; label: string; disabled?: boolean; }
export type SelectSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> Native select box. On mobile the phone's own picker opens, and the browser handles keyboard and screen-reader support.
> Use Dropdown only when the options need custom formatting. The ref points to the `<select>`.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"3008687e41858a183159a28175415767cf8b48e09041d302d39641785134965c","cssHash":"f2fef4fdb86774cd1490e70a3c992329e0d93752ba4f079dc39cca7af268c9cd","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Skeleton

Role: Loading placeholder.
Import: `import { Skeleton } from "@/components/Skeleton"`
Source: `src/components/Skeleton/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: SkeletonVariant`; default: `"text"`; Figma: Variant — text (lines of text) · placeholder (space for an image or card) · icon (small square)
- `animated?: boolean`; default: `false`; Figma: Animated — a moving shimmer effect. It stops when the user's "reduce motion" setting is on.
- `lines?: number`; default: `1`; Number of lines when the variant is text. The last line is drawn shorter.
- `children?: ReactNode`; default: `unknown`; A skeleton never shows content. Children are accepted but ignored.

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type SkeletonVariant = "text" | "placeholder" | "icon";
````

Notes written in the code (not proof of review):
> Loading placeholder.
> 
> The skeleton itself carries no meaning, so it is `aria-hidden`. To announce "loading", put
> `aria-busy` on the surrounding area or use Loading. Override the size with style/className.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"c53f17b413736b6d58840a25c427c2324a2347cfae49c58f363958a359f1efaf","cssHash":"3540007f15a9577ea45ee51e4fbb1cf4f6a90584b8d7be349f3bedf4182ef15e","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Slider

Role: A slider for picking a number by dragging a handle along a track.
Import: `import { Slider } from "@/components/Slider"`
Source: `src/components/Slider/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `hideTextInput?: boolean`; default: `false`; Figma: HideTextInput
- `label?: string`; default: `unknown`
- `min?: number`; default: `0`
- `max?: number`; default: `100`
- `step?: number`; default: `1`
- `value?: number`; default: `unknown`
- `defaultValue?: number`; default: `unknown`
- `onValueChange?: (value: number) => void`; default: `unknown`; event
- `helperText?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Notes written in the code (not proof of review):
> A slider for picking a number by dragging a handle along a track.
> 
> Uses the native `input[type=range]`, because the browser already handles the arrow, Home, End
> and PageUp/Down keys and `aria-valuenow` correctly.
> Building it by hand means re-implementing all of that, and something usually gets missed.
> 
> The number box beside it is **a second control for the same value**, so screen readers
> are shown it as one thing (the box is not `aria-hidden`; it shares the slider's label instead).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"212a2d65986501efa780e2d1b8b11034b35712f0d6d7ac29089daf2807f0404c","cssHash":"da542604799594aef7db6d4296c03f03980c89f0275dc9742dd9fb764b9e18fb","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## StructuredList

Role: A list laid out in rows and columns, like a simple table.
Import: `import { StructuredList } from "@/components/StructuredList"`
Source: `src/components/StructuredList/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `selectable?: boolean`; default: `false`; Figma: Selectable
- `condensed?: boolean`; default: `false`; Figma: Condensed
- `headers?: string[]`; default: `[]`
- `rows?: StructuredRow[]`; default: `[]`
- `value?: string`; default: `unknown`
- `defaultValue?: string`; default: `unknown`
- `onValueChange?: (id: string) => void`; default: `unknown`; event
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface StructuredRow { id: string; cells: ReactNode[]; disabled?: boolean; }
````

Notes written in the code (not proof of review):
> A list laid out in rows and columns, like a simple table.
> 
> Lighter than DataTable, and meant for choosing **only one** row.
> When selectable, each row gets a real `radio` — with `aria-selected` alone, rows can't be picked with the keyboard.
> When not selectable, it still uses a table (instead of `dl`) rather than a meaningless grid with no `role="table"`.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"11f2c03b1ebfec9adbc383fd2634e909762deff099dddeb8da5ca05d9ff2aae5","cssHash":"3e37e77b59716514f16b4a9cfbc9c29765f7b29c31edb1e52e21c4ffac29ce4b","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Tabs

Role: A row of tabs that switches between panels of content.
Import: `import { Tabs } from "@/components/Tabs"`
Source: `src/components/Tabs/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: TabsVariant`; default: `"line"`; Figma: Variant
- `size?: TabsSize`; default: `"md"`; Figma: Size
- `orientation?: TabsOrientation`; default: `"horizontal"`; Figma: Orientation
- `items?: TabItem[]`; default: `[]`
- `defaultTab?: string`; default: `unknown`
- `onTabChange?: (id: string) => void`; default: `unknown`; event; Called with the tab's id when the selected tab changes. It isn't named onChange because that name belongs to the native DOM event.
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface TabItem { id: string; label: string; content: ReactNode; disabled?: boolean; }
export type TabsOrientation = "horizontal" | "vertical";
export type TabsSize = "sm" | "md";
export type TabsVariant = "line" | "contained";
````

Notes written in the code (not proof of review):
> A row of tabs that switches between panels of content.
> 
> Follows the WAI-ARIA tabs pattern and uses a **roving tabindex**: one press of the Tab key moves
> into the whole tab list, and inside it the arrow keys move between tabs. With 10 tabs, nobody has to press Tab 10 times.
> The arrow direction follows orientation (←→ when horizontal, ↑↓ when vertical).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"17af55844dab84a292b5a4b3ea3587668bca8655d20a3e1cb3856d96a4963ba4","cssHash":"0a09328c73b881c3275b61a03e9b0608101c65241adda164c5ffa3901f110398","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Tag

Role: Category or filter label. If it can be removed (dismissible), a × button follows the text. Only the ×, not the whole tag, is a button, so pressing the tag and removing it never get mixed up.
Import: `import { Tag } from "@/components/Tag"`
Source: `src/components/Tag/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `tone?: TagTone`; default: `"neutral"`; Figma: Tone
- `size?: TagSize`; default: `"md"`; Figma: Size
- `dismissible?: boolean`; default: `false`; Figma: Dismissible — adds a remove button.
- `icon?: ReactNode`; default: `unknown`; Figma: Icon
- `onDismiss?: () => void`; default: `unknown`; event; Called when the remove button is pressed. After it is called, the tag removes itself.
- `dismissLabel?: string`; default: `unknown`; Accessible name of the remove button (what screen readers announce). Defaults to "Remove <text>".
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLSpanElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TagSize = "sm" | "md";
export type TagTone = "neutral" | "info" | "success" | "warning" | "danger";
````

Notes written in the code (not proof of review):
> Category or filter label. If it can be removed (dismissible), a × button follows the text.
> Only the ×, not the whole tag, is a button, so pressing the tag and removing it never get mixed up.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"6942312f4c3e594dccfb359cd3a1a35588dcb9cd3817995dc4db473ba9b3a74b","cssHash":"a409b276e70a6b728991eadcc194764fd530b1abfbb1002bad4971885d816292","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Text

Role: Single source for static text and native headings. Starter spec Text revision 2.
Import: `import { Text } from "@/components/Text"`
Source: `src/components/Text/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `children!: ReactNode`; default: `unknown`; The text to show. Give headings meaningful text.
- `as?: TextAs`; default: `"span"`; Meaning in the document (which HTML tag is used, such as a paragraph or a heading). Independent of the visual preset.
- `variant?: TextVariant`; default: `"body"`; An approved combination of typography tokens.
- `tone?: TextTone`; default: `"default"`; Semantic color of the text.
- `id?: string`; default: `unknown`
- `lang?: string`; default: `unknown`
- `dir?: "ltr" | "rtl" | "auto"`; default: `unknown`

Types:
````ts
export type TextAs = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextTone = "default" | "secondary";
export type TextVariant = "body" | "body-sm" | "title";
````

Notes written in the code (not proof of review):
> Single source for static text and native headings. Starter spec Text revision 2.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"6a4988876058e71f062874b336212e9d0be9833fcec2949a77409f5818013fd7","cssHash":"3324044cee78fc329d9cb2df9e9a6eeb153eef8c25f168a79ff797f875a43b5d","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## TextInput

Role: Single-line text input.
Import: `import { TextInput } from "@/components/TextInput"`
Source: `src/components/TextInput/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: TextInputSize`; default: `"md"`; Figma: Size
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `helperText?: string`; default: `unknown`
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<InputHTMLAttributes<HTMLInputElement>, "size">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TextInputSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> Single-line text input.
> 
> The ref points to the `<input>`, so form libraries (register) and focus() work as they are.
> `className` goes on the outer wrapper, which also holds the label and helper text.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"ea7aa66f550dfb462c51c3a8bba93d44925e424fd360d5579c01af4550d4561d","cssHash":"390cc18d732cd02b6ca7808d86443abf2c24fc98af785fbd95a03823aeab00b2","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Textarea

Role: Multi-line text input. The ref points to the `<textarea>`. `children` goes below the helper text, not inside the textarea (set the textarea's value with value/defaultValue).
Import: `import { Textarea } from "@/components/Textarea"`
Source: `src/components/Textarea/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: TextareaSize`; default: `"md"`; Figma: Size
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `helperText?: string`; default: `unknown`
- `label?: string`; default: `unknown`
- `children?: ReactNode`; default: `unknown`

Native attributes: `TextareaHTMLAttributes<HTMLTextAreaElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TextareaSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> Multi-line text input. The ref points to the `<textarea>`.
> `children` goes below the helper text, not inside the textarea (set the textarea's value with value/defaultValue).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"91301d80b2d0852fa2c45fd0ef289786dcc5ac3222bffceba4a8f54098b02941","cssHash":"819344f50c97e1eaba57920cb604c8fa45293b57e079bb14127f95d2d2df62f9","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Tile

Role: Tile — a surface that holds content. Each variant behaves differently.
Import: `import { Tile } from "@/components/Tile"`
Source: `src/components/Tile/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `variant?: TileVariant`; default: `"base"`; Figma: Variant
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `selected?: boolean`; default: `unknown`; Figma: Selected — whether a selectable tile is selected (controlled).
- `defaultSelected?: boolean`; default: `false`; Whether a selectable tile starts out selected (uncontrolled).
- `onSelectedChange?: (selected: boolean) => void`; default: `unknown`; event
- `href?: string`; default: `unknown`; Set this when a clickable tile goes to another page. If set, the tile is drawn as an `<a>` link.
- `details?: ReactNode`; default: `unknown`; Content shown when an expandable tile is opened.
- `defaultExpanded?: boolean`; default: `false`
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TileVariant = "base" | "clickable" | "selectable" | "expandable";
````

Notes written in the code (not proof of review):
> Tile — a surface that holds content. Each variant behaves differently.
> 
>   base        plain surface
>   clickable   the whole tile is one link/button (`<a>` if href is set, otherwise role=button)
>   selectable  role=checkbox — click to select; Space also toggles it
>   expandable  a title button (aria-expanded) opens the details

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"e24b336b4990f4656b9fedfa1383c65fbcc844a9fb4b6c9576c814876150ec51","cssHash":"8f1cc36dcd38fcae79b9245961b46325495f46df43e1f0fd7792fb79f8e33140","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## TimePicker

Role: A field for entering a time.
Import: `import { TimePicker } from "@/components/TimePicker"`
Source: `src/components/TimePicker/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: TimePickerSize`; default: `"md"`; Figma: Size
- `disabled?: boolean`; default: `false`; Figma: Disabled
- `invalid?: boolean`; default: `false`; Figma: Invalid
- `label?: string`; default: `unknown`
- `helperText?: string`; default: `unknown`
- `hour24?: boolean`; default: `false`; Whether to use the 24-hour clock. The default is the 12-hour clock with AM/PM.
- `value?: string`; default: `unknown`; "HH:MM" (always written in 24-hour time).
- `defaultValue?: string`; default: `unknown`
- `onValueChange?: (value: string) => void`; default: `unknown`; event
- `minuteStep?: number`; default: `5`; Gap between minute choices. With 5, the choices are 00·05·10…
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<HTMLAttributes<HTMLDivElement>, "defaultValue">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TimePickerSize = "sm" | "md" | "lg";
````

Notes written in the code (not proof of review):
> A field for entering a time.
> 
> Hours and minutes are **each a separate `select`**. A free-text box would have to accept "9 o'clock",
> "09:00", "9 AM" and so on, so checking the input would never end; native selects are also much better on mobile.
> 
> The 12/24-hour format is shown on screen — if only "9:00" is visible, you can't tell whether it is AM or PM.
> The three boxes make up one value, so they are grouped with `fieldset`+`legend` and screen readers read the name only once.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"80e06abe08360521c78a331673155e933fac888ed6a3cb07d80fddf3ef31b08c","cssHash":"a1ce6889c7d97ffd68855973fe43ee8b95b5ce1a0a921f69db693867d4fd413a","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Toggle

Role: On/off switch.
Import: `import { Toggle } from "@/components/Toggle"`
Source: `src/components/Toggle/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: ToggleSize`; default: `"md"`; Figma: Size
- `checked?: boolean`; default: `unknown`; Figma: Checked — controlled. If you pass it, you must update it yourself in onCheckedChange.
- `defaultChecked?: boolean`; default: `false`; Starting state when uncontrolled.
- `onCheckedChange?: (checked: boolean) => void`; default: `unknown`; event
- `label?: string`; default: `unknown`; Text next to the switch. If omitted, children is used. If both are missing, give it an aria-label.
- `children?: ReactNode`; default: `unknown`

Native attributes: `Omit<ButtonHTMLAttributes<HTMLButtonElement>, "defaultChecked">`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.
Native defaults: `{"type":"\"button\""}`

Types:
````ts
export type ToggleSize = "sm" | "md";
````

Notes written in the code (not proof of review):
> On/off switch.
> 
> WAI-ARIA switch pattern — a `button[role=switch]` with `aria-checked`. The text sits inside the button, so it
> becomes the accessible name, and clicking the text also switches it. Use it only for settings that apply right away (use Checkbox if a form must be submitted).

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"136dfd34cfc64f81ba0731332fe90ab2060279496980c1ed79be76ff65a5c197","cssHash":"2381be07c87ac877ea3f4b997e61e94cb7c1f074f29d228a544b2a40174c7698","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## Toggletip

Role: A small help bubble that opens when you click an info button.
Import: `import { Toggletip } from "@/components/Toggletip"`
Source: `src/components/Toggletip/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `align?: ToggletipAlign`; default: `"bottom"`; Figma: Align
- `label?: string`; default: `unknown`; Name for the trigger button. The button shows only an icon, so it must have one.
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type ToggletipAlign = "top" | "bottom" | "left" | "right";
````

Notes written in the code (not proof of review):
> A small help bubble that opens when you click an info button.
> 
> Sits between Tooltip and Popover. It **opens on click** and can hold links, but unlike Popover it
> does not move focus inside — instead it reads the content aloud through `aria-live`.
> This is the toggletip approach WAI-ARIA recommends.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"fe9198a413e8265aa558f2639b3e02af894397e739a6aa5cad2dccf423ee6cd7","cssHash":"d0679a0b489a6b1d9032f3a0d8628ca74621174a798b2aa5bd601ac8a64e3fd7","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

## Tooltip

Role: A short hint that appears when you hover over or focus an element.
Import: `import { Tooltip } from "@/components/Tooltip"`
Source: `src/components/Tooltip/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `align?: TooltipAlign`; default: `"top"`; Figma: Align
- `label?: string`; default: `unknown`; The description shown in the bubble.
- `children?: ReactNode`; default: `unknown`; The element the description belongs to.

Native attributes: `HTMLAttributes<HTMLSpanElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export type TooltipAlign = "top" | "bottom" | "left" | "right";
````

Notes written in the code (not proof of review):
> A short hint that appears when you hover over or focus an element.
> 
> If it opened only on `hover`, keyboard users could never see it, so it also opens on `focus`.
> Don't put buttons or links inside. If people need to interact with it, use Toggletip or Popover.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"6715a4132c0538bf4e9516394f52cef17c8e1515c898dba59312741c192ef66d","cssHash":"2f7fa4e6b9fd261c3edbd45b96b38a7b6c1955c31b55964f2bf5bd5eee45d001","dependencyHash":"46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`

## TreeView

Role: A list of items nested in folders that open and close.
Import: `import { TreeView } from "@/components/TreeView"`
Source: `src/components/TreeView/index.ts`
Status: starter; API: supported; Page use: full public API; Auto checks: not_run
Reason: Starter part, unchanged
Behavior/structure/API: starter; Visual: starter

### Public props (! = required, ? = optional)
- `size?: TreeViewSize`; default: `"md"`; Figma: Size
- `multiselect?: boolean`; default: `false`; Figma: Multiselect
- `hideLabel?: boolean`; default: `false`; Figma: HideLabel
- `nodes?: TreeNode[]`; default: `[]`
- `label?: string`; default: `unknown`
- `defaultExpanded?: string[]`; default: `[]`
- `onNodeSelect?: (ids: string[]) => void`; default: `unknown`; event
- `children?: ReactNode`; default: `unknown`

Native attributes: `HTMLAttributes<HTMLDivElement>`. Not every event or ARIA attribute is listed here. Check the code or the review notes to see where they are passed.

Types:
````ts
export interface TreeNode { id: string; label: string; children?: TreeNode[]; disabled?: boolean; }
export type TreeViewSize = "sm" | "md";
````

Notes written in the code (not proof of review):
> A list of items nested in folders that open and close.
> 
> WAI-ARIA tree pattern. The arrow keys mean something different than in a list.
>   →  expands a collapsed branch; if it is already expanded, moves to its first child
>   ←  collapses an expanded branch; if it is already collapsed, moves to its parent
>   ↑↓ moves between visible items (children of collapsed branches are skipped)
> 
> One press of Tab moves into the whole tree (roving tabindex), and inside it the arrow keys move.

Review scope: `full public API and shipped states`
Review evidence: `{"source":{"kind":"starter","ref":"scripts/starter-catalog-baseline.json"}}`
Versions: `{"codeHash":"b7e4d4d42f11888ad7fdd69c8b6039988948c661ae19e67a39862b823711ed3d","cssHash":"dd1edf1ddf942ae54026d0b510206370ea4c88a1e5f3ab267cc037010920f5d5","dependencyHash":"dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894","tokensHash":"bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"}`
Depends on: `pnpm-lock.yaml`, `src/lib/i18n.tsx`

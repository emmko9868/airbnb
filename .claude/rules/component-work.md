<!-- @ds-generated 5d03a5d99bf48337 — `pnpm ds:gen` 이 만든 파일입니다.
   컴포넌트 인벤토리에서 생성
   직접 고치면 다음 생성 때 충돌로 보고되고 덮어쓰지 않습니다. -->
# 컴포넌트 작업 (MUST)

> 어떤 파일이 생성물이고 어떤 파일이 사람 것인지.
>
> 이 파일은 `ds.config.json` 과 실제 토큰에서 생성됩니다. 손으로 쓴 규칙은 토큰 이름이 바뀌는 순간 거짓말이 되기 때문입니다.

## 파일 소유권

| 파일 | 소유 | 고쳐도 되나 |
|---|---|---|
| `<Name>.tsx` / `.css` | **사람** | 고친다. 생성기가 다시 건드리지 않는다. |
| `<Name>.stories.tsx` | 생성기 | 고치면 충돌로 보고되고 **보존**된다. 되도록 Figma 를 고칠 것. |
| `<Name>.figma.tsx` | 생성기 | 위와 같음 |
| `src/tokens/tokens.css` | 생성기 | **고치지 말 것.** 매번 전체 재작성된다. |
| `src/docs/*` | 생성기 | 위와 같음 |

## 새 컴포넌트를 만들기 전에

1. 기존 컴포넌트로 되는지 먼저 본다. 중복 생성 금지.
2. Figma 에 Component Set 이 있으면 **손으로 만들지 말고** `pnpm ds:gen` 을 돌린다.
3. Figma 에 없으면 사용자에게 Figma 에 먼저 만들지 물어본다 — 코드가 먼저 생기면 동기화가 깨진다.

## 규칙

- 클래스는 `ds-<name>` / `ds-<name>--<variant>` 규약을 따른다.
- Figma 의 `State` variant 는 prop 이 아니다. `:hover` / `:active` / `:focus-visible` / `disabled` 가 처리한다.
- 모든 컴포넌트는 `data-testid="ds-<name>"` 을 갖는다 (story 의 play 함수가 쓴다).
- story 는 `tags: ["autodocs"]` 와 play 함수를 최소 하나 갖는다.

## 현재 있는 컴포넌트

| 이름 | props | variant | 설명 |
|---|---|---|---|
| Accordion | size, align, disabled | 0 | — |
| Badge | tone, children | 5 | — |
| Breadcrumb | size, noTrailingSlash | 0 | — |
| Button | variant, size, hasIcon, children | 48 | A button that runs the main action. Use only one Primary but |
| Card | — | 0 | A surface that groups related content. |
| Checkbox | checked, disabled, indeterminate, invalid, label | 0 | — |
| CodeSnippet | type, disabled, wrapText | 0 | — |
| ComboBox | size, disabled, invalid, label | 0 | — |
| ContainedList | variant, size | 0 | — |
| ContentSwitcher | size | 0 | — |
| DatePicker | type, size, disabled, invalid | 0 | — |
| Dropdown | type, size, disabled, invalid, label | 0 | — |
| FileUploader | variant, size, disabled, multiple | 0 | — |
| IconButton | variant, size, disabled, icon | 0 | — |
| InlineLoading | description, status | 0 | — |
| Link | variant, size, disabled, external | 0 | — |
| Loading | size, label, overlay | 0 | — |
| Modal | variant, size, open, title | 0 | — |
| MultiSelect | type, size, disabled, invalid | 0 | — |
| Notification | tone, variant, dismissible, title | 0 | — |
| NumberInput | size, disabled, hideSteppers, invalid | 0 | — |
| OverflowMenu | size, align, flipped | 0 | — |
| Pagination | variant, size | 0 | — |
| Popover | align, caret, open | 0 | — |
| ProgressBar | size, indeterminate, status | 0 | — |
| ProgressIndicator | size, orientation | 0 | — |
| RadioButton | checked, disabled, label, orientation | 0 | — |
| Search | size, disabled, expandable, placeholder | 0 | — |
| Select | size, disabled, invalid, label | 0 | — |
| Skeleton | variant, animated | 0 | — |
| Slider | disabled, hideTextInput, invalid | 0 | — |
| StructuredList | condensed, selectable | 0 | — |
| Tabs | variant, size, orientation | 0 | — |
| Tag | tone, size, dismissible, icon | 0 | — |
| TextInput | size, disabled, helperText, invalid, label, placeholder, readOnly | 0 | — |
| Textarea | size, disabled, helperText, invalid, label | 0 | — |
| Tile | variant, disabled, selected | 0 | — |
| TimePicker | size, disabled, invalid | 0 | — |
| Toggle | size, checked, disabled, label | 0 | — |
| Toggletip | align | 0 | — |
| Tooltip | align, label | 0 | — |
| TreeView | size, hideLabel, multiselect | 0 | — |

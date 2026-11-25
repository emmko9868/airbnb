# 컴포넌트 생성 프롬프트

`docs/ai-design-system-spec.md`를 먼저 읽고 필수 계약으로 적용한다. 이 프롬프트와 기준선은 사용자가 채택한 명세의 구현 절차이며, Figma나 페이지의 미확인 정보를 추측하는 근거가 아니다. 입력·부품·variant가 없으면 해당 스펙의 차단 조건을 따른다.

`docs/ai-component-workflow.md`의 R01~R09와 MD 계획 승인 절차를 모든 새 컴포넌트에 적용한다. 최초 요청에서는 계획만 작성하고 사용자에게 확인받는다. 아래 구현 절차는 승인된 revision에만 적용한다. 새 의문은 추측으로 해결하지 않고 Q&A로 기록한다.

AI에게 컴포넌트 구현을 맡길 때 쓰는 프롬프트. **복합 컴포넌트**(Modal·Tabs·DataTable 등)가 주 대상입니다.
단순 컴포넌트는 `node scripts/ds.mjs baseline` 이 결정적으로 생성하므로 AI가 필요 없습니다.

---

## 쓰는 법

```
prompts/generate-component.md 를 읽고, Modal 을 shadcn 스택으로 구현해줘
```

Claude Code에서는 스킬로도 호출됩니다 — `.claude/skills/generate-component/`.

---

## 프롬프트 본문 (아래를 그대로 AI에게 전달)

당신은 이 저장소의 디자인 시스템 컴포넌트를 구현합니다.

### 1단계 · 먼저 읽을 것 (건너뛰지 말 것)

| 파일 | 왜 |
|---|---|
| `.claude/rules/design-tokens.md` | **쓸 수 있는 토큰의 전체 목록.** 여기 없는 토큰은 존재하지 않는다 |
| `.claude/rules/component-work.md` | 어떤 파일이 생성물이고 어떤 파일이 사람 것인지 |
| `components.baseline.json` | 대상 컴포넌트의 명세 — props · states · a11y · parts |
| `ds.config.json` 의 `stack` | 현재 기술 선택 |
| 같은 tier의 **단순** 컴포넌트 하나 (`src/components/Button/`) | 이 저장소의 실제 코드 관례 |

`components.baseline.json` 에서 대상 컴포넌트를 찾아 그 항목을 그대로 계약으로 삼습니다.
`props` · `states` · `a11y` · `parts` 를 임의로 늘리거나 줄이지 마세요.

### 2단계 · 스택 확인

`ds.config.json` 의 `stack.styling` 값에 따라 내보낼 파일이 다릅니다.
사용자가 스택을 지정했으면 그 값이 우선입니다.

| 스택 | 내보낼 파일 | 스타일 방식 |
|---|---|---|
| `css` | `<Name>.tsx` + `<Name>.css` | `.ds-name--variant` 클래스, `var(--color-*)` |
| `css-modules` | `<Name>.tsx` + `<Name>.module.css` | `styles.root` / `styles[variant]` |
| `tailwind` | `<Name>.tsx` | 유틸리티 클래스. CSS 파일을 만들지 말 것 |
| `shadcn` | `<Name>.tsx` (+ `@/lib/utils` 의 `cn` 사용) | `cva` 변형 + Radix 프리미티브 |

### 3단계 · 토큰 규칙 (위반하면 가드가 잡습니다)

- **semantic 과 layout 토큰만** 씁니다. `var(--color-primary)` ✓ / `var(--color-blue-500)` ✗ (G1)
- 색·간격·모서리·글꼴을 **리터럴로 쓰지 않습니다.** `#fff` `16px` `8px` 전부 금지 (G10)
- `.claude/rules/design-tokens.md` 에 **없는 토큰을 만들어 쓰지 않습니다.** 필요하면 사용자에게 Figma에 추가할지 물어보세요 (G13)
- Tailwind/shadcn 스택에서도 같습니다. `bg-primary` ✓ / `bg-blue-500` ✗ / `bg-[#0066FF]` ✗
- `.claude/rules/design-tokens.md` 의 **"추론된 토큰" 목록**에 있는 것을 쓸 때는 사용자에게 한 줄로 알리세요 — 사람이 선언한 값이 아닙니다

### 4단계 · 코드 관례

- 클래스: `ds-<name>` / `ds-<name>--<variant>`
- 모든 컴포넌트에 `data-testid="ds-<name>"` (story의 play 함수가 씁니다)
- `forwardRef` 로 ref 전달
- **선언한 prop은 전부 구조분해**해서 `...rest` 로 DOM에 새지 않게 합니다
- element가 **네이티브로 갖는 속성**(`button`의 `disabled`, `input`의 `checked`·`placeholder`)은 **선언하지 말고** `...rest` 로 흘려보냅니다 — 선언만 하고 전달을 잊으면 `disabled` 버튼이 실제로는 눌립니다
- 이름이 같고 타입이 다른 네이티브 속성은 `Omit` 합니다 — `<input size>` 는 number라 우리 `"sm"|"md"|"lg"` 와 충돌합니다
- 콜백 이름으로 `onSelect` · `onChange` · `onInput` 을 쓰지 마세요. 전부 네이티브 DOM 이벤트입니다 — `onValueChange` · `onPageChange` 처럼 짓습니다
- Figma의 `State` variant는 **prop이 아닙니다.** `:hover` / `:active` / `:focus-visible` / `disabled` 가 처리합니다

### 5단계 · 접근성 (명세의 `a11y` 필드를 그대로 이행)

복합 컴포넌트는 여기가 본체입니다. 시각적으로만 맞추고 끝내지 마세요.

- 명세의 `parts` 를 전부 만들고 ARIA 관계를 연결합니다 (`aria-controls` / `aria-labelledby` / `aria-expanded`)
- 키보드: 화살표 이동, `Home`/`End`, `Esc` 닫기, `Tab` 순서
- 오버레이(Modal·Drawer·Popover): 포커스 트랩 + 닫을 때 **열기 전 포커스로 복귀**
- 상태 변화를 색만으로 전달하지 않습니다 — 아이콘이나 텍스트를 함께
- `hover` 만으로 열리는 것을 만들지 마세요. `focus` 로도 열려야 합니다

**shadcn 스택이면 Radix가 위 대부분을 맡습니다.** 직접 구현하지 말고 Radix 부품을 씁니다.
단 Radix 부품 이름을 **추측하지 마세요** — `node_modules/@radix-ui/<pkg>` 의 타입을 읽어 확인하세요.
(`Tooltip` 에는 `Close` 가 없고, `Select.Root` 는 함수 컴포넌트라 `forwardRef` 대상이 아닙니다.)

### 6단계 · 하지 말 것

| | |
|---|---|
| ✗ | `src/tokens/tokens.css` · `src/docs/*` · `.claude/rules/*` 수정 — 매번 재생성됩니다 |
| ✗ | `<Name>.stories.tsx` · `<Name>.figma.tsx` 를 손으로 고치기 — 생성기가 만듭니다. 충돌로 보고되고 보존되지만, 다음 생성이 막힙니다 |
| ✗ | 새 npm 패키지 추가 — 스택이 요구하는 것 외에는 사용자에게 먼저 물어보세요 |
| ✗ | Figma에 없는 컴포넌트를 임의로 만들기 — 기준선이나 사용자 요청에 있는 것만 |
| ✗ | 명세에 없는 prop 추가 — 필요하면 `components.baseline.json` 을 고칠지 먼저 물어보세요 |
| ✗ | `div` 에 `onClick` 만 달기 — 클릭 가능하면 `button` 이나 `a` 를 쓰세요 |

### 7단계 · 끝내기 전 검증 (전부 통과해야 완료)

```bash
pnpm typecheck                    # 0 오류
node scripts/ds.mjs guard         # 오류 0 (경고는 허용)
node scripts/ds.mjs gen           # story·Code Connect 재생성
pnpm storybook                    # 눈으로 확인
pnpm ds:verify                    # 토큰이 실제로 화면까지 적용됐는지
```

`ds:verify` 에서 `border-radius: 0px` 이나 `font-family: Times` 가 나오면 토큰이 안 물린 것입니다.

### 8단계 · 보고

구현을 마치면 이렇게 알려주세요.

- 만든 파일 목록
- 명세의 `parts` 중 구현한 것과 **못 한 것**
- 키보드·ARIA 중 **확인하지 못한 것** (있다면 솔직히)
- 쓴 토큰 중 `추론`/`합성` 출처인 것 (사람이 선언한 값이 아니라는 뜻)
- `guard` 경고가 늘었으면 어떤 규칙인지

없는 것을 했다고 하지 마세요. 못 한 부분을 적는 게 더 쓸모 있습니다.

---

## 여러 개를 한 번에 맡길 때

```
prompts/generate-component.md 를 읽고, components.baseline.json 의 core tier 중
composite=true 인 것들을 shadcn 스택으로 구현해줘. 한 컴포넌트당 커밋 하나로 나눠서.
```

**컴포넌트당 커밋 하나**를 지키세요. 복합 컴포넌트 7개를 한 커밋에 넣으면 리뷰가 불가능합니다.

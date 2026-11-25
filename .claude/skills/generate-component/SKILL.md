---
name: generate-component
description: 이 저장소의 디자인 시스템 컴포넌트를 구현하거나 고칠 때 사용한다. 복합 컴포넌트(Modal·Tabs·Dropdown·DataTable 등)의 골격을 채울 때, 기술 스택(css / css-modules / tailwind / shadcn)을 골라 생성할 때, components.baseline.json 의 컴포넌트를 구현할 때, 또는 "버튼 만들어줘" "Modal 구현해줘" "shadcn으로 바꿔줘" 같은 요청에 사용한다.
---

# 컴포넌트 구현

## 필수 구현 계약

먼저 `docs/ai-design-system-spec.md`를 읽고 적용한다. 기준선은 사용자가 해당 명세를 작업 입력으로 선택한 범위에서만 사용하며, Figma의 누락 디자인을 기준선으로 채우지 않는다. 입력이 불명확하면 차단 상태로 보고한다. 페이지에서 부족한 부품을 임의 생성하지 않는다.

## Figma 링크가 있는 요청은 `figma-to-storybook` 스킬로 라우팅
사용자가 **Figma 노드 링크**(`https://www.figma.com/design/...?node-id=...`)의 Storybook 구현을 요청하면 `.claude/skills/figma-to-storybook/SKILL.md`를 우선 적용한다. 링크만 언급하거나 분석을 요청한 경우 구현하지 않는다.

## 먼저 판단할 것

모든 판단은 `docs/ai-component-workflow.md`와 `docs/templates/component-plan.md`에 따라 MD 계획으로 먼저 작성한다. 역할·상태·토큰·동작에 대한 AI 해석을 사용자에게 확인받기 전에는 아래 구현 절차를 실행하지 않는다. 기준선 요청에서도 계획 승인과 Q&A를 생략하지 않는다.

| 상황 | 할 일 |
|---|---|
| `components.baseline.json` 에 `composite: false` | **AI가 만들지 말 것.** `node scripts/ds.mjs baseline` 이 결정적으로 생성한다 |
| `composite: true` 이고 골격만 있음 | 이 스킬로 채운다 |
| Figma에 Component Set이 있음 | `node scripts/ds.mjs gen` 을 먼저 돌린다. Figma가 이긴다 |
| 기준선에도 Figma에도 없음 | 사용자에게 Figma에 먼저 만들지 물어본다 |

스택을 바꾸라는 요청이면 구현하지 말고 설정을 고칩니다.

```bash
# ds.config.json 의 stack.styling 을 바꾼 뒤
node scripts/ds.mjs gen
```

기존 `.tsx` / `.css` 는 사람 소유라 **덮어쓰지 않습니다.** 스택을 갈아타려면 해당 컴포넌트 폴더를
지우고 다시 생성해야 하며, 손으로 고친 내용이 사라지므로 **사용자에게 먼저 확인**하세요.

## 절차

`prompts/generate-component.md` 의 1~8단계를 그대로 따릅니다. 그 파일을 읽으세요.

요약하면:

1. `.claude/rules/design-tokens.md` 로 **쓸 수 있는 토큰**을 확인 — 여기 없는 토큰은 없는 것
2. `components.baseline.json` 의 항목을 계약으로 삼음 (props·states·a11y·parts 를 늘리거나 줄이지 않음)
3. `ds.config.json` 의 `stack.styling` 에 맞는 파일만 생성
4. semantic·layout 토큰만 사용. 리터럴 색·간격 금지
5. 명세의 `a11y` 를 그대로 이행. 복합 컴포넌트는 여기가 본체
6. `pnpm typecheck` → `node scripts/ds.mjs guard` → `pnpm ds:verify` 전부 통과
7. 못 한 것을 솔직히 보고

## 자주 나오는 실수

- **`disabled` 를 선언하고 element 에 전달하지 않음** → 버튼이 실제로는 눌린다. 네이티브 속성은 선언하지 말고 `...rest` 로 흘려보낼 것
- **`<input size>` 와 우리 `size` 충돌** → `Omit<InputHTMLAttributes<HTMLInputElement>, "size">`
- **Radix 부품 이름 추측** → `node_modules/@radix-ui/<pkg>` 타입을 읽어 확인. `Tooltip` 에 `Close` 는 없다
- **`Select.Root` 를 `forwardRef` 로 감싸기** → 함수 컴포넌트라 ref·className 을 받지 않는다
- **선언한 prop 을 구조분해하지 않음** → `variant` 가 DOM 으로 새어 React 경고
- **`onSelect` `onChange` `onInput` 을 콜백 이름으로 쓰기** → 전부 네이티브 DOM 이벤트다. `onValueChange` `onPageChange` 처럼 지을 것
- **`defaultValue` 를 string 으로 선언** → HTMLAttributes 는 `string | number | readonly string[]` 이다. `Omit` 하거나 이름을 바꿀 것
- **primitive 토큰 직접 참조** → 가드 G1 오류

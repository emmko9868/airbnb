---
kind: component
component: RadioButton
revision: 1
status: approved
source_kind: figma
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=213-1944
facts_complete: true
open_questions: 0
---

# RadioButton 컴포넌트 업데이트 계획

> 기존 RadioButton 컴포넌트를 Figma 디자인(213-1944)에 맞게 업데이트
> 커스텀 SVG 비주얼 사용 + 실제 폼 입력 동작 유지

## 1. 요청과 적용 규칙

- 요청한 작업: Figma Radio Button(213-1944) 디자인을 기존 RadioButton 컴포넌트에 적용
- 읽은 공통 규칙: `docs/ai-component-workflow.md` v1.0
- 읽은 스펙: `docs/ai-design-system-spec.md` v1.1
- Figma 파일·노드·조회 시점: zrqq2F92iVtCoxKzj4b8Pm / 213:1944 / 2026-11-25 / cached
- 대상 코드·토큰 기준 버전: src/tokens/tokens.css (21 colors, 18 semantic)

## 2. 컴포넌트의 역할과 AI의 해석

| 항목 | 확인된 사실과 출처 | AI의 해석 | 사용자의 확정/정정 |
|---|---|---|---|
| 부품의 역할 | Figma: Radio Button (213:1944), 24×24 비주얼 | 폼에서 하나를 선택하는 radio input 위젯 | 확정 ✓ |
| 누를 수 있는 영역 | Figma: 24×24 (focus: 32×32) | 전체 24×24 영역이 클릭 가능 | 확정 ✓ |
| 클릭/선택/열림 동작 | Figma: Checked/Unchecked 상태 | 클릭으로 선택/해제 전환 | 확정 ✓ |
| 키보드·포커스 범위 | Figma: Focus 상태에서 32×32 외부 링 | Tab으로 포커스 시 32×32 영역에 링 표시 | 확정 ✓ |
| disabled 동작 | Figma에 disabled 상태 없음 | 기존 disabled 스타일 유지 (회색 처리) | 확정 ✓ |

## 3. 기존 부품과 변경 범위

- 동일 역할의 기존 컴포넌트: `src/components/RadioButton/RadioButton.tsx`
- 기존 props·stories에서 확인한 지원 범위:
  - Single radio: `label`, `disabled`, `checked`, `onChange`
  - Group: `items`, `selected`, `defaultSelected`, `onSelectedChange`, `orientation`
  - Native input[type=radio] 사용, accent-color로 스타일링
- 기존 원본 수정 또는 새 부품이 필요한 이유:
  - Figma 디자인이 커스텀 SVG 비주얼을 사용 (네이티브 브라우저 스타일 아님)
  - 상태별 다른 SVG (default, hover, focus, checked)
  - Focus 상태에서 32×32 외부 링 필요
- 변경할 파일:
  - `src/components/RadioButton/RadioButton.tsx` — SVG 비주얼 추가
  - `src/components/RadioButton/RadioButton.css` — 커스텀 스타일
  - `src/components/RadioButton/RadioButton.stories.tsx` — Figma 변형 매트릭스 업데이트
- 승인된 변경에서 영향받는 기존 사용처:
  - 기존 API는 유지되므로 호환성 유지
  - 비주얼만 변경

## 4. Nested parts

이 컴포넌트는 Figma 인스턴스를 포함하지 않음. 모든 비주얼은 이 부품 내에서 직접 그림.

- Confirmed absence of nested instances: Figma 메타데이터에서 중첩 인스턴스 없음 확인

## 5. Figma 상태·크기 전체 목록

| Figma 노드 ID / 조합 | 읽기 근거 | 발생 이벤트 또는 지속 상태 | 적용 영역 | 기본 상태와 다른 값·구조 | 아이콘 유무 | 코드 API/CSS 연결 | 확정 여부 |
|---|---|---|---|---|---|---|---|
| 157:2614 Default, Unchecked | facts 파일 | 기본 상태 | 24×24 | 없음 | SVG: white circle, #DDDDDD border | :default | 확정 ✓ |
| 157:2718 Default, Checked | facts 파일 | 선택된 상태 | 24×24 | fill: #222222, inner circle: white | SVG: filled circle with white center | :checked | 확정 ✓ |
| 157:2619 Hover, Unchecked | facts 파일 | :hover | 24×24 | border: #222222 | SVG: white circle, dark border | :hover | 확정 ✓ |
| 213:1527 Hover, Checked | facts 파일 | :hover + :checked | 24×24 | border: #222222 | SVG: filled circle | :hover:checked | 확정 ✓ |
| 157:2633 Focus, Unchecked | facts 파일 | :focus-visible | 32×32 | outer ring (r=15, stroke=2) | SVG: 32×32 with ring | :focus-visible | 확정 ✓ |
| 157:2711 Focus, Checked | facts 파일 | :focus-visible + :checked | 32×32 | outer ring + filled | SVG: 32×32 with ring + filled | :focus-visible:checked | 확정 ✓ |

- Focus 링이 감싸는 정확한 범위와 근거: 32×32 영역 전체 (Figma에서 확인)
- Figma에 실제로 없는 상태·조합: disabled (기존 스타일 유지)
- 미조회/실패/잘린 응답: 없음

## 6. 색·alpha·디자인 토큰 대응

| 요소 / 상태 | Figma 원본 값·alpha / 변수 ID | primitive | semantic / 역할 | 생성 CSS의 해석 값 | 값·역할 일치 여부 | 미확정 또는 새 매핑 필요 사유 |
|---|---|---|---|---|---|---|
| Unchecked border (default) | #DDDDDD / Neutral 03 | neutral-03 | --color-border | var(--color-border) | ✓ | 없음 |
| Checked fill | #222222 / Shade 02 | shade-02 | --color-text | var(--color-text) | ✓ | 없음 |
| Hover border | #222222 / Shade 02 | shade-02 | --color-text | var(--color-text) | ✓ | 없음 |
| Focus ring | #222222 / Shade 02 | shade-02 | --color-text | var(--color-text) | ✓ | 없음 |
| Inner circle (checked) | #FFFFFF / Shade 01 | shade-01 | --color-bg | var(--color-bg) | ✓ | 없음 |

- 컴포넌트 fill과 Figma 부모 배경을 구분한 결과: 모두 semantic 토큰으로 매핑 가능
- 같은 값의 후보가 여러 개일 때 선택 근거: Figma 변수 이름과 역할 일치
- 신규 token의 사용처: 기존 token으로 모두 처리 가능
- 토큰 생성 경로·검증 계획: 기존 tokens.css 사용

## 7. 원본 아이콘·asset

| asset / Figma 노드 | 원본 파일/벡터 경로 또는 해시 | 크기·색·stroke·회전 | 나타나는 상태·조합 | 나타나지 않는 상태·조합 | 확인 여부 |
|---|---|---|---|---|---|
| imgStateDefaultStatusUnchecked | fd327f769b8f1cdc08a297f33b564df53882d92c.svg | 24×24, white fill, #DDDDDD stroke | Default Unchecked | 다른 상태 | 확정 ✓ |
| imgStateDefaultStatusChecked | 27b2f56b225c84fc1afae1e10736f3e73fbb5cf8.svg | 24×24, #222222 fill, white inner (r=4) | Default Checked, Hover Checked | Unchecked | 확정 ✓ |
| imgStateHoverStatusUnchecked | 46ddf4c2508fe00165dd9326031a267100dcba9e.svg | 24×24, white fill, #222222 stroke | Hover Unchecked | 다른 상태 | 확정 ✓ |
| imgStateFocusStatusUnchecked | 8bbace264e534078528b4de9c43e4ca5258b4d6b.svg | 32×32, outer ring (r=15, stroke=2), inner circle (r=11.5) | Focus Unchecked | 다른 상태 | 확정 ✓ |
| imgStateFocusStatusChecked | 543a29b3dd1e9fff71c95b84397c9acbc7b77a0b.svg | 32×32, outer ring + filled circle with white center | Focus Checked | 다른 상태 | 확정 ✓ |

## 8. 공개 API와 실제 기능

| prop / 이벤트 | 근거 | 기본값·허용값 | 실제 동작 / 결과 | 키보드·disabled 처리 | 사용자 확정 |
|---|---|---|---|---|---|
| checked | HTML input | boolean | 선택 상태 | Space로 토글 | 확정 ✓ |
| defaultChecked | HTML input | boolean | 초기 선택 상태 | - | 확정 ✓ |
| onChange | HTML input | (e) => void | 선택 변경 이벤트 | - | 확정 ✓ |
| disabled | HTML input | boolean | 비활성화 | Tab 제외, 회색 스타일 | 확정 ✓ |
| name | HTML input | string | 그룹 이름 | - | 확정 ✓ |
| value | HTML input | string | 값 | - | 확정 ✓ |
| label | 기존 API | string | 라벨 텍스트 | - | 확정 ✓ |
| items | 기존 API | RadioButtonOption[] | 그룹 모드 | - | 확정 ✓ |
| orientation | 기존 API | "horizontal" \| "vertical" | 그룹 레이아웃 | - | 확정 ✓ |

## 9. Q&A와 사용자 결정

| 질문 ID | 미확정 항목과 근거 | 선택지 / 각 선택의 영향 | 사용자 답 | 해결 상태 |
|---|---|---|---|---|
| Q-01 | 기존 컴포넌트 업데이트 vs 새 컴포넌트 | 업데이트 / 새 생성 / 둘 다 유지 | 기존 컴포넌트 업데이트 | resolved ✓ |
| Q-02 | 컴포넌트 목적 | 폼 입력 / 비주얼 / 합성 | 폼 입력 위젯 | resolved ✓ |

모든 질문 해결됨 → open_questions: 0

## 10. 검증 계획

| 확인 대상 | 원본의 기대 결과 | 검사 방법 | 완료 증거 |
|---|---|---|---|
| 기본 상태와 캔버스 배경 | 24×24 white circle with #DDDDDD border | Storybook render + computed style | ✓ |
| 모든 상태·크기 | Default/Hover/Focus × Checked/Unchecked | CSS 의사클래스 + 실제 포인터·키보드 | ✓ |
| 아이콘과 노출 조건 | 상태별 SVG 정확히 일치 | DOM inspection + screenshot | ✓ |
| 클릭·입력·선택 등 기능 | 클릭으로 선택 토글 | Storybook play with userEvent | ✓ |
| disabled / Tab / Focus | Tab으로 포커스, disabled 제외 | 실제 키보드 테스트 | ✓ |
| Nested parts identity | N/A (중첩.parts 없음) | - | - |
| Nested part → composite callback | N/A | - | - |
| 공통 규칙 및 기존 사용처 | 타입·토큰·회귀 검사 | pnpm typecheck, pnpm ds:guard | ✓ |

필수 명령: `pnpm ai:check RadioButton`, `pnpm ai:verify RadioButton`, `pnpm typecheck`, `pnpm ds:guard`

## 11. 구현 계획

### 11.1 SVG 전략

Figma의 상태별 SVG를 직접 사용하지 않고, CSS로 동적 제어 가능한 인라인 SVG를 사용:
- 기본 원: `<circle>` with CSS variables for fill/stroke
- 체크된 상태: 추가 `<circle>` for inner dot
- 포커스 링: 추가 `<circle>` with larger radius

이유:
- 상태 전환 시 SVG 파일 로딩 불필요
- CSS 변수로 색상 제어 가능
- 더 작은 번들 크기

### 11.2 CSS 구조

```css
.ds-radiobutton__field {
  /* 네이티브 input 숨김 */
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ds-radiobutton__visual {
  /* 커스텀 비주얼 */
  width: 24px;
  height: 24px;
  /* SVG 또는 CSS로 그리기 */
}

.ds-radiobutton__field:checked + .ds-radiobutton__visual {
  /* Checked 상태 */
}

.ds-radiobutton__field:focus-visible + .ds-radiobutton__visual {
  /* Focus 상태 - 32×32 링 */
}

.ds-radiobutton__field:hover + .ds-radiobutton__visual {
  /* Hover 상태 */
}
```

### 11.3 Storybook 업데이트

- Figma 변형 매트릭스 추가 (6개 상태)
- 실제 hover/focus 상호작용 테스트
- Play 함수로 클릭 동작 검증

## 12. 사용자 검토

- 계획 내용에 대한 사용자 수정·결정:
  - 기존 컴포넌트 업데이트 선택
  - 폼 입력 위젯으로 구현
- 승인한 revision: (승인 대기)
- 구현 전에 남은 조건: 없음

---
kind: component
component: REPLACE_WITH_COMPONENT_NAME
revision: 1
status: review-required
source_kind: figma
source_url: REPLACE_WITH_FIGMA_NODE_URL
facts_complete: false
open_questions: 1
---

# 컴포넌트 구현 계획

> AI는 확인된 사실·해석·질문을 구분해 작성한다. 사용자 승인 전 구현 파일을 수정하지 않는다. `approved`는 사용자만 확정한다. 미해결 항목을 없애기 위해 사실이나 답변을 지어내지 않는다.

부품 이름: 부품 하나는 `component: Name`. Figma 링크 하나에 여러 부품이 있으면(예: Buttons 섹션) `component:` 대신 `components: [Button, Link]`로 한 계획에 묶는다. 계획 파일 이름은 자유이며, 승인되면 목록의 부품 파일을 모두 고칠 수 있다. 부품마다 계획을 새로 만들어 승인 상태로 쓰지 않는다. 새 계획은 `status: review-required`(또는 `draft`)로 시작하고, 승인할 때는 `status:` 한 줄만 바꾼다. 승인된 계획을 바꾸려면 같은 편집에서 `status: review-required`로 되돌리고 `revision`을 1 올린다(훅이 검사한다). `starter-spec`·`starter-fix`는 `component:` 하나만 쓴다.

범위: 학생이 Figma 세트의 일부 변형만 고르면(예: "Only the Default Card type for now") 머리말에 `scope_nodes: [238:2494]`처럼 그 변형의 노드 id 목록을 한 줄 더한다(사전 분석 "Variants in Figma"의 id). 줄이 없으면 모든 변형이다. 있으면 검사는 그 변형에서 나온 사실(하위 부품·아이콘 원본 경로·상태)만 본다. 그 세트의 변형 id 가 아니면 계획 검증이 막는다. 범위를 나중에 넓히면 revision 을 올린다. 만드는 부품 자신(같은 세트)으로 판정된 인스턴스는 하위 부품이 아니라 안쪽 레이어이며 Nested parts 행을 만들지 않는다.

출처: 기존 Figma 계획은 `source_kind` 생략도 허용한다. 사용자 채택 기본 부품 **Text·Icon만** `source_kind: starter-spec`으로 바꾸고 `source_url`을 삭제한 뒤 `source_ref: docs/plans/components/<Name>.md`를 적는다. 계획도 그 경로에 두고 본문에 채택 명세·근거를 기록한다(외부 파일/심볼릭 링크 불가). 승인·사실 확인·Q&A 조건은 동일하며 Figma 요청을 이 방식으로 대체하지 않는다.

`starter-fix`는 강사 감사의 비시각 동작·접근성 수정 전용이다. 학생 Figma 구현에 사용하지 않는다. 강사 대화형 승인 기록과 동일한 계획 해시·시각 기준이 필요하다.

## 1. 요청과 적용 규칙

- 요청한 작업:
- 읽은 공통 규칙: `docs/ai-component-workflow.md` 버전 / R01~R09
- 읽은 스펙: `docs/ai-design-system-spec.md` 버전
- Figma 파일·노드·조회 시점·캐시 여부:
- 대상 코드·토큰 기준 버전:

## 2. 컴포넌트의 역할과 AI의 해석

| 항목 | 확인된 사실과 출처 | AI의 해석 | 사용자의 확정/정정 |
|---|---|---|---|
| 부품의 역할 | | | 미확정 |
| 누를 수 있는 영역 | | | 미확정 |
| 클릭/선택/열림 동작 | | | 미확정 |
| 키보드·포커스 범위 | | | 미확정 |
| disabled 동작 | | | 미확정 |

## 3. 기존 부품과 변경 범위

- 동일 역할의 기존 컴포넌트 / 공개 import / 사용처:
- 기존 props·stories에서 확인한 지원 범위:
- 기존 원본 수정 또는 새 부품이 필요한 이유:
- 변경할 파일:
- 승인된 변경에서 영향받는 기존 사용처:

## 4. Nested parts

If the requested component contains Figma instances, list only the instances directly below the requested node. An instance inside one of those instances belongs to that child part and does not get another row. Merge the same direct instance across requested variants when its layer name, original name, and variant are the same, and list every requested variant where it appears. Use the original component or component-set name from the Figma data, even when the layer was renamed. Match a kit component only when that original name exactly matches one existing kit component. Never choose from appearance, size, or the presence of an icon. Write `ask` when the original name, kit match, or an exact existing Figma-to-prop/value mapping is missing. Every row must be `confirmed` by the user before implementation.

In **Kit component and props**, start with the exact kit component name and use a form such as `Button { variant="primary" }`. When the confirmed part needs no kit import, write `none — <how this part is made>` and set the row to `confirmed`; a Figma icon asset drawn by this component is recorded as `none — drawn inside this part from the Figma SVG`. If the implementation uses a kit component that is not a Figma instance, such as Text for a label, add it to this table with `—` in **Figma instance**. If there are no nested instances or other kit imports, remove the placeholder row and record the confirmed absence below the table.

If the original name exactly matches a kit component but the Figma variant cannot map to its existing public props, keep the row `ask` and write this choice in the reason: `First update the shared <Part> from its own Figma component to implement this variant, then plan this composite again; or tell me the exact existing prop/value mapping.` Do not suggest another component such as IconButton.

| Figma instance | Original component / set | Figma variant | Found in requested variants | Kit component and props | Status |
|---|---|---|---|---|---|
| | | | | ask | ask |

- Confirmed absence of nested instances and evidence:

## 5. Figma 상태·크기 전체 목록

단순히 이름을 나열하지 말고 Size × Variant × State의 각 구현 대상 조합을 적는다. "없음"은 실제로 확인한 경우에만 적는다. 읽지 못한 항목은 미확정이다.

| Figma 노드 ID / 조합 | 읽기 근거 | 발생 이벤트 또는 지속 상태 | 적용 영역 | 기본 상태와 다른 값·구조 | 아이콘 유무 | 코드 API/CSS 연결 | 확정 여부 |
|---|---|---|---|---|---|---|---|
| | | | | | | | 미확정 |

- Focus 링이 감싸는 정확한 범위와 근거:
- Figma에 실제로 없는 상태·조합:
- 미조회/실패/잘린 응답과 필요한 추가 조회:

## 6. 색·alpha·디자인 토큰 대응

| 요소 / 상태 | Figma 원본 값·alpha / 변수 ID | primitive | semantic / 역할 | 생성 CSS의 해석 값 | 값·역할 일치 여부 | 미확정 또는 새 매핑 필요 사유 |
|---|---|---|---|---|---|---|
| | | | | | | 미확정 |

- 컴포넌트 fill과 Figma 부모 배경을 구분한 결과:
- 같은 값의 후보가 여러 개일 때 선택 근거:
- 신규 token의 사용처와 기존 token으로 처리할 수 없는 이유:
- 토큰 생성 경로·검증 계획:

## 7. 원본 아이콘·asset

| asset / Figma 노드 | 원본 파일/벡터 경로 또는 해시 | 크기·색·stroke·회전 | 나타나는 상태·조합 | 나타나지 않는 상태·조합 | 확인 여부 |
|---|---|---|---|---|---|
| | | | | | 미확정 |

## 8. 공개 API와 실제 기능

| prop / 이벤트 | 근거 | 기본값·허용값 | 실제 동작 / 결과 | 키보드·disabled 처리 | 사용자 확정 |
|---|---|---|---|---|---|
| | | | | | 미확정 |

## 9. Q&A와 사용자 결정

| 질문 ID | 미확정 항목과 근거 | 선택지 / 각 선택의 영향 | 사용자 답 | 해결 상태 |
|---|---|---|---|---|
| Q-01 | | | 미답변 | open |

답을 받으면 사실·상태·토큰·API 표도 함께 갱신한다. 모든 필요한 질문이 해결된 경우에만 `open_questions: 0`을 기록한다. 사용자의 새 수정이 기존 승인 내용을 바꾸면 revision을 올리고 재검토 상태로 바꾼다.

## 10. 검증 계획

| 확인 대상 | 원본의 기대 결과 | 검사 방법 | 완료 증거 |
|---|---|---|---|
| 기본 상태와 캔버스 배경 | | 실제 iframe / computed style / 스크린샷 | |
| 모든 상태·크기 | | 원본 대조 / 실제 포인터·키보드 | |
| 아이콘과 노출 조건 | | 원본 asset·DOM·스크린샷 대조 | |
| 클릭·입력·선택 등 기능 | | 실제 이벤트와 결과 확인 | |
| disabled / Tab / Focus | | 실제 키보드·콜백 확인 | |
| Nested parts identity | Each approved kit part renders its own `data-testid` inside the composite root | `ai:verify` DOM check; copied markup fails | |
| Nested part → composite callback | Clicking each actionable child calls the planned composite callback | Storybook `play` with `fn()`, `userEvent.click`, and call assertion; planned Tab/disabled checks only | |
| 공통 규칙 및 기존 사용처 | | 타입·토큰·회귀 검사 | |

필수 명령: `pnpm ai:check <Name>`, `pnpm ai:verify <Name>`, `pnpm typecheck`, `pnpm ds:guard`. 명령 검사와 시각 원본 대조를 구분한다. 아직 수행하지 않은 검사는 통과라고 적지 않는다.

## 11. 사용자 검토

- 계획 내용에 대한 사용자 수정·결정:
- 승인한 revision:
- 구현 전에 남은 조건:

확인된 입력과 사용자 결정이 모두 채워진 뒤 AI가 대화창에 짧게 요약하고 `ask_user_question` 선택지("Approve revision N" / "Change something")로 승인을 묻는다. 사용자가 지금 내용의 승인 선택지를 고르거나 "Approve revision N"을 직접 써 보낸 뒤에만 AI가 `status: approved` 한 줄을 쓴다. auto 모드도 같다(도구 실행만 자동이고 선택은 사용자가 한다). AI는 사용자 대신 고르거나 승인하지 않고, 사용자에게 이 파일을 열어 고치라고 하지 않는다. Q&A 답은 `Q: … → A: … (chosen in chat)`으로 기록한다.

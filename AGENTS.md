# AGENTS.md

Qwen Code 등 AI 도구가 참고하는 진입점이다. Qwen Code의 자동 맥락 파일은 `QWEN.md`다. 규칙의 원본은 아래 파일들이다.
작업을 시작하기 전에 반드시 읽고 따를 것.

| 파일 | 내용 |
|---|---|
| `docs/ai-component-workflow.md` | **모든 컴포넌트의 공통 규칙 R01~R09와 MD 계획 → 사용자 확인 → 구현 → Q&A 절차** |
| `docs/ai-design-system-spec.md` | **컴포넌트 생성·페이지 조립의 필수 계약.** 입력 근거·추측 금지·카탈로그 재사용·차단/완료 조건 |
| `CLAUDE.md` | 이 저장소에서 하지 말 것, 명령, 구조 |
| `.claude/rules/design-tokens.md` | 쓸 수 있는 토큰 **전체 목록**과 금지 사항 |
| `.claude/rules/component-work.md` | 어떤 파일이 생성물이고 어떤 파일이 사람 것인지 |
| `.claude/rules/sync-policy.md` | 필드별 소유권, 가드 규칙 G1~G16 |

## 컴포넌트와 페이지의 필수 계약

모든 컴포넌트·페이지 작업 전에 `docs/ai-design-system-spec.md`를 읽고 적용한다. Storybook은 부품 카탈로그이며 페이지는 검수된 기존 부품의 공개 API로만 조립한다. 페이지에서 UI 부품을 재정의하거나 내부 스타일을 덮어쓰지 않는다. 입력·부품·variant·검수 근거가 없으면 추측 구현하지 않고 스펙의 차단 상태로 보고한다. 배치용 컨테이너와 명시된 페이지 데이터·이벤트 연결은 허용한다. 기존 스킬·기준선·검사 메시지를 누락 디자인의 대체 근거로 사용하지 않는다.

## 최초 요청은 Markdown 계획부터

`docs/ai-component-workflow.md`를 모든 새 요청에서 읽고 적용한다. `docs/templates/component-plan.md`로 `docs/plans/components/<Name>.md`만 작성하고, 사실·역할/state 해석·token/asset 매핑·미해결 Q&A를 기록하고, 질문은 `ask_user_question` 선택지로 묻고, 대화창에 짧게 요약한 뒤 멈춘다(학생에게 계획서 파일을 열거나 고치라고 하지 않는다). 사용자 확인 전 구현 파일을 수정하지 않는다. 사용자가 승인 선택지 "Approve revision N"을 고르거나 "이 계획대로 진행해"라고 명시한 버전만 구현하고, 그 뒤에만 AI가 `status: approved` 한 줄을 쓴다. 구현 중 새 의문은 질문하며, AI가 MD를 승인하거나 답변을 지어내지 않는다. 공통 정정을 특정 컴포넌트 한 곳에만 적용하지 않는다.

## 🔴 Figma 노드 구현 요청 → `figma-to-storybook` 스킬 우선 로드
사용자가 **Figma 노드 링크**(`https://www.figma.com/design/...?node-id=...`)를 주고 Storybook 컴포넌트 **구현을 요청하면** `.claude/skills/figma-to-storybook/SKILL.md`를 먼저 읽고 적용한다. 링크만 언급하거나 분석을 요청한 경우 구현하지 않는다. 사용자는 구현 요청과 링크만 입력하면 된다. 구조·상태·변수·아이콘 읽기, 기존 컴포넌트 재사용, 실제 동작, 토큰, Storybook play, `pnpm ai:check`·`pnpm ai:verify`는 스킬이 처리한다.

## 컴포넌트 작업 체크리스트 (반드시)

1. **State 는 prop 이 아니다.** Figma 의 `State=Hover / Click / Focus / Disabled` 같은 variant 는 CSS `:hover`·`:active`·`:focus-visible` 과 `disabled` 속성으로 구현한다. `state="hover"` 같은 prop 을 만들지 않는다. Figma에 없는 시각 상태나 중복 스토리는 만들지 않는다.
2. **토큰만 쓴다.** 색·간격·모서리·폰트 리터럴(`#fff`, `rgba(…)`, `16px`) 금지. 색상 거리만 보고 근사 토큰·`color-mix`로 대체하지 않는다. Figma 변수는 `pnpm ds:figma`로 가져오고, 변수에 연결되지 않은 원시 색은 근거를 기록해 `.ds/source.json` primitive와 `.ds/semantic.json` 매핑으로 올린 뒤 `pnpm ds:tokens`를 실행한다. 다른 컴포넌트가 쓰는 semantic 역할을 임의로 바꾸지 않는다.
3. **생성물은 고치지 않는다.** `src/tokens/`, `src/docs/`, `.ds/tokens.json`, `.ds/provenance.json`, `.ds/figma-variables.json`, `.claude/rules/`. `@ds-generated` 표시를 직접 쓰지 않는다.
4. **누르는 부분은 실제 동작하는 `<button>`** 으로 만든다. 클릭 콜백, Tab 포커스, disabled 전달을 확인한다. 이동하는 요소는 실제 `href`가 있는 `<a>`를 사용한다. 아이콘은 `<svg>` JSX 에 `fill="currentColor"`. SVG 문자열을 `<img src>` 에 넣지 않는다.
5. **새 컴포넌트는 `src/components/<Name>/`** 에 `<Name>.tsx` · `<Name>.css` · `<Name>.stories.tsx` 세 파일로 만든다. 클래스는 `ds-<name>` · `ds-<name>--<variant>`, 최상위 요소에 `data-testid="ds-<name>"`.
6. **끝나면 확인한다.** `pnpm ai:check <Name>`과 `pnpm ai:verify <Name>`을 실행해 Figma SVG·버튼 이벤트·Storybook play·토큰 CSS·타입·가드를 확인한다. Claude Code 에서는 파일을 저장할 때마다 자동 검사 결과가 돌아온다 — 그 지적부터 고친다.
7. **실제 화면을 Figma와 대조한다.** 컴포넌트의 투명한 fill과 Figma 부모 프레임 배경을 구분한다. Storybook **캔버스 전체**를 원본과 같은 배경·문구·크기로 렌더하고, 기본·hover·click·focus 등 실제 상태의 색·치수·아이콘·가시성을 브라우저에서 확인한다. Matrix의 상태 이름과 화면이 일치해야 한다. `ai:verify`로 모든 스토리의 렌더·`play` 오류를 확인하고, 실제 포인터 상태의 색은 별도로 검사한다.

## 큰 요청은 단계로 나눈다 (Figma → 컴포넌트)

요청에 붙은 `[Figma]`는 계획에 사용할 사전 분석 자료다. 역할·CSS 선택자·token 후보·코드 초안을 사용자 승인으로 취급하지 않는다. 승인된 계획이 확보된 뒤에만 기존 원본을 수정하거나 새 부품을 구현한다.

아래 구현 순서는 승인된 계획에만 적용한다. 승인 전에는 계획 작성·Q&A 단계에서 멈춘다.

1. Figma 노드를 읽고 **구조 · 색 · 상태 목록을 먼저 짧게 정리**한다. 각 색이 어떤 기존 토큰에 대응하는지 함께 적는다.
2. **기본 상태 하나만** 구현한다.
3. Figma에 그려진 hover · active · focus · disabled 상태만 **CSS 의사 클래스로** 더한다. 버튼의 기본 Tab 접근성과 disabled 속성은 시각 variant 유무와 별도로 지킨다.
4. Figma에 정의된 상태의 스토리와 `play`를 쓴다. 상태별 모양을 prop 으로 고르는 스토리를 만들지 않는다. 버튼이면 `fn()` 콜백을 props 로 주고 `userEvent.click` 후 호출을 검증한다. 분할 버튼은 양쪽을 각각 누르고 Tab 포커스를 확인한다. Disabled 스토리는 Figma에 있을 때만 만든다.
5. 검사 결과가 깨끗해질 때까지 고친다.

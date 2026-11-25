# ds-starter

Figma → Hexcode·Primitive·Semantic 3계층 토큰 → Storybook 자동화 스타터킷.

## 컴포넌트와 페이지의 필수 계약

모든 컴포넌트·페이지 작업 전에 `docs/ai-design-system-spec.md`를 읽고 적용한다. 확인된 입력만 구현하며, 페이지는 검수된 Storybook 부품의 공개 API로만 조립한다. 페이지에 별도 UI 부품·복제 스타일·지원하지 않는 variant를 만들지 않는다. 필수 정보나 부품이 없으면 추측하지 않고 스펙의 차단 상태로 보고한다. 기본 스킬·기준선·검사 메시지가 이를 완화하는 근거가 될 수 없다. 검사 통과와 인간 검수 완료를 구분한다.

## 최초 요청은 Markdown 계획부터

모든 새 컴포넌트에서 `docs/ai-component-workflow.md`의 R01~R09를 읽는다. `docs/templates/component-plan.md`로 `docs/plans/components/<Name>.md`에 사실·AI의 역할/state 해석·정확한 token/asset 매핑·Q&A를 작성하고 사용자 확인 전 구현을 멈춘다. 사용자가 승인한 버전만 구현한다. 새 의문은 질문으로 해결하고 계약이 바뀌면 계획 revision을 갱신해 확인받는다. AI의 자체 승인, 근사 색, 없는 state/아이콘, 특정 컴포넌트에만 공통 규칙을 적용하는 행동을 금지한다.

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

`[Figma]` 사전 분석·token 후보·구현 초안은 승인된 계약이 아니다. 먼저 MD 계획에서 역할·상태·값과 미확정 질문을 확인한다. 승인 계획이 확보된 뒤에만 기존 원본을 수정하거나 새 부품을 구현한다.

아래 구현 순서는 승인된 계획에만 적용한다. 승인 전에는 계획 작성·Q&A 단계에서 멈춘다.

1. Figma 노드를 읽고 **구조 · 색 · 상태 목록을 먼저 짧게 정리**한다. 각 색이 어떤 기존 토큰에 대응하는지 함께 적는다.
2. **기본 상태 하나만** 구현한다.
3. Figma에 그려진 hover · active · focus · disabled 상태만 **CSS 의사 클래스로** 더한다. 버튼의 기본 Tab 접근성과 disabled 속성은 시각 variant 유무와 별도로 지킨다.
4. Figma에 정의된 상태의 스토리와 `play`를 쓴다. 상태별 모양을 prop 으로 고르는 스토리를 만들지 않는다. 버튼이면 `fn()` 콜백을 props 로 주고 `userEvent.click` 후 호출을 검증한다. 분할 버튼은 양쪽을 각각 누르고 Tab 포커스를 확인한다. Disabled 스토리는 Figma에 있을 때만 만든다.
5. 검사 결과가 깨끗해질 때까지 고친다.

## 세션 시작 시 반드시 읽을 것

| 파일 | 내용 |
|---|---|
| `docs/ai-component-workflow.md` | 모든 컴포넌트에 적용할 공통 규칙과 MD 계획 승인·Q&A 절차 |
| `docs/ai-design-system-spec.md` | 컴포넌트·페이지의 입력 계약, 추측 금지, 카탈로그 사용 자격, 검증·차단 조건 |
| `.claude/rules/design-tokens.md` | 쓸 수 있는 토큰 **전체 목록**과 금지 사항 |
| `.claude/rules/component-work.md` | 어떤 파일이 생성물이고 어떤 파일이 사람 것인지 |
| `.claude/rules/sync-policy.md` | 필드별 소유권, 가드 규칙 G1~G16 |

`.claude/rules/`의 세 파일은 **생성물**이다. `ds.config.json` 과 실제 토큰에서 `pnpm ds:docs` 가 만든다.
직접 고치지 말고, 규칙을 바꾸려면 `ds.config.json` 이나 `scripts/lib/guard.mjs` 를 고친 뒤 다시 생성한다.

## 하지 말 것

- `src/tokens/tokens.css` 와 `src/docs/*` 직접 수정 — 매번 전체 재작성된다.
- 색상·간격·모서리·폰트 리터럴 사용 — 가드 G10 이 잡는다.
- Figma 에 없는 컴포넌트를 코드에 먼저 만들기 — 동기화가 깨진다. 사용자에게 먼저 물어볼 것.
- 추측을 Figma 로 되돌려 쓰기 — 자기 강화 루프에 빠진다.
- `.ds/semantic.json` 을 추측으로 채우기 — 사람이 정한 매핑만 적는 파일이다. 다음 실행에서 추측이 사람 결정으로 오인된다.

## 명령

```bash
# VS Code에서 Qwen Code 확장을 열고 Figma 링크와 함께 계획 작성을 요청한다.
# Token Plan은 사람이 공식 도구에서 대화형으로만 사용한다. 무인 모델 호출 금지.
pnpm mcp:setup              # Figma Desktop MCP 설정 · 로컬 HTTP 연결 확인
pnpm ai:usage               # 로컬 Qwen 사용량 집계
node scripts/ds.mjs all     # 토큰 → 컴포넌트 → diff → 가드 → 문서 → AI 규칙
node scripts/ds.mjs guard   # 정책 검사만
pnpm ds:test                # 사다리·가드·파일 보호 단위 테스트
pnpm storybook              # 문서 확인
pnpm ds:verify              # 렌더 검증 (storybook 이 떠 있어야 함)
```

## 구조

- 파이프라인(`scripts/`)은 **의존성 0**. `node` 만으로 돈다.
- LLM 은 `scripts/lib/ai.mjs`(컴포넌트 설명 문장) 한 곳에만 쓰인다. 기본 꺼짐.
  계층 판정·variant 행렬·diff·가드는 전부 결정적 — 같은 입력에 다른 답이 나오면 lock 비교가 무의미해진다.

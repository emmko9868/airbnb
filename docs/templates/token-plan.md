---
kind: tokens
revision: 1
status: review-required
source_url: REPLACE_WITH_FIGMA_NODE_URL
palette_hash: pending
content_hash: pending
open_questions: 1
---
# 학생 색 역할 제안

색·글자 계획에는 부품 계획용 `source_kind`·`source_ref`를 추가하지 않는다. 머리말은 이 템플릿의 항목만 쓴다. `source_url`에는 가져온 노드 링크(`.ds/figma-variables.json`의 `nodes` 중 하나, 예: `?node-id=0-1`)를 적는다. 파일 링크만 적지 않는다.

글자는 기본값을 유지한다. 바꿀 때만 `docs/templates/typography-plan.md`를 사용한다. 글자 질문은 색 계획의 미해결 수에 섞지 않는다.

학생 Figma 파일/노드·조회 시점:
역할 선택의 근거와 학생이 결정할 질문:

Figma에 이미 선언된 semantic 역할은 아래 표에 중복 지정하지 않는다.
표의 primitive 이름과 값은 학생 토큰 계산 결과에서 가져온다. 여러 역할에 같은 primitive를 쓰려면 각각 이유를 제시한다.
노드 칸에는 가져온 Figma 노드 번호(예: `0:1`, `.ds/figma-variables.json`의 `nodes` 중 하나)를 적는다. `figma-white` 같은 변수 id를 적지 않는다.
Figma에 같은 이름의 semantic 역할로 선언되지 않은 매핑은 AI의 제안이다. 첫 초안은 `open_questions: 1` 이상으로 둔다. 역할마다 따로 묻지 않는다. Figma 이름·용도로 만든 추천 표(역할 → 색, 이유)를 대화창에 보여 주고 `ask_user_question` 한 번으로 "Use these roles (Recommended)" / "Change some roles"를 묻는다. 바꾸겠다고 하면 그 역할만 선택지로 다시 묻는다. 답은 `Q: … → A: … (AI proposal, chosen in chat)`으로 기록한다. 사실과 다르게 "추론 없음"이라고 쓰지 않는다.

색은 AI가 `pnpm ds:figma "<링크>"`로 직접 가져온다(학생은 허락 창만 누른다). 이미 가져온 색에 합쳐지고 Added / Changed / Kept 줄이 나온다.

<!-- token-mappings:start -->
| 역할 | 학생 primitive | 가져온 Figma 노드 번호 (예: 0:1) | 원시 값 | 근거 |
|---|---|---|---|---|
| REPLACE_ROLE | REPLACE_PRIMITIVE | REPLACE_IMPORTED_NODE_NUMBER | REPLACE_VALUE | REPLACE_REASON |
<!-- token-mappings:end -->

<!-- token-contrast:start -->
<!-- 준비 명령이 실제 계산 결과로 채운다. -->
<!-- token-contrast:end -->

## 학생 검토

- 질문에 대한 학생 결정과 선택 이유:
- 학생의 실제 대화 답변과 해당 역할을 기록하고 반영한 뒤에만 open_questions를 0으로 줄인다. AI가 스스로 답하거나 질문을 없애지 않는다.
- `pnpm ds:apply-token-plan --prepare`로 대비표와 해시를 고정한다. 이 명령은 승인하지 않는다.
- 질문은 `ask_user_question` 선택지로 묻고 답은 AI가 여기에 `Q: … → A: … (chosen in chat)`으로 기록한다. 준비 뒤 AI가 역할→색을 대화창에 짧게 요약하고 "Approve revision N" / "Change something"으로 승인을 묻는다. 학생이 승인을 고른 뒤에만 AI가 `status: approved` 한 줄을 쓰고 `pnpm ds:apply-token-plan`을 실행한다. 학생에게 이 파일을 열어 고치라고 하지 않는다. JSON을 직접 편집하지 않는다.
- 승인 후 내용 변경은 새 revision과 재검토가 필요하다. AI는 학생의 승인 선택 없이 approved를 쓰지 않는다.

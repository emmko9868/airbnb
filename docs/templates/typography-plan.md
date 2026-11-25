---
kind: typography
revision: 1
status: review-required
source_url: REPLACE_WITH_FIGMA_NODE_URL
typography_hash: pending
base_hash: pending
content_hash: pending
open_questions: 1
font_check: pending
---
# 선택 사항: 학생 글자 변경 계획

색·글자 계획에는 부품 계획용 `source_kind`·`source_ref`를 추가하지 않는다. 머리말은 이 템플릿의 항목만 쓴다. `source_url`에는 가져온 노드 링크(`.ds/figma-variables.json`의 `nodes` 중 하나, 예: `?node-id=0-1`)를 적는다. 파일 링크만 적지 않는다.

기본값을 그대로 쓸 때는 이 계획을 만들지 않는다. 바꾸고 싶을 때만 `docs/plans/typography.md`에 작성한다. AI는 사실·해석·질문을 구분하고, 질문은 `ask_user_question` 선택지로 묻고, 학생의 승인 선택 없이 approved를 쓰지 않는다. 학생에게 이 파일을 열어 고치라고 하지 않는다.

Figma 파일/노드·조회 시점·원본 근거:
학생이 선택한 대표 글꼴/역할과 이유:

가져온 파일의 `typography.styles`와 `raw`에서 원본을 확인한다. 아래 표에는 **바꿀 기존 토큰만** 한 번씩 적는다. 나머지는 유지한다. 지원 이름: `--font-sans` 하나, `--text-body-2`·`--text-body-1`·`--text-title`, 현재 존재하는 `--font-weight-*`, `--leading-tight`·`--leading-normal`. 새로운 이름이 필요하면 별도 질문으로 확인한다.

<!-- typography-mappings:start -->
| 기존 CSS 토큰 | Figma 스타일 이름 | 필드 | 원본 값 | 단위/참조 확인 | 근거 |
|---|---|---|---|---|---|
| REPLACE_TOKEN | REPLACE_STYLE | REPLACE_FIELD | REPLACE_RAW | REPLACE_CONFIRMATION | REPLACE_REASON |
<!-- typography-mappings:end -->

- 필드: 글꼴 family / 크기 size / 굵기 weight / 줄높이 lineHeight. 원본 값은 해당 스타일 필드의 실제 값 그대로 적는다.
- 직접 값과 이미 단위가 확인된 줄높이는 확인 칸에 `-`. `fontFamily` 등 참조는 가져온 `raw`에서 실제 값을 확인해 적는다(예: Roboto). 참조가 없거나 모호하면 먼저 질문한다.
- 단위가 없는 줄높이는 학생이 원본에서 확인한 `percent`·`px`·`multiplier`와 근거를 적는다. 픽셀은 원본 글자 크기로 나눈다. 숫자 크기만 보고 단위를 추측하지 않는다.
- 여러 글꼴 중 대표 하나를 학생이 고른다. 이름이 fontFamily인 참조를 실제 글꼴로 단정하지 않는다. 크기/굵기 참조도 실제 원본과 확인한다.

| 질문 | 선택지·영향 | 학생 답 | 상태 |
|---|---|---|---|
| 대표 글꼴·역할·줄높이 단위 | | 미답변 | open |

학생 확인: 선택한 글꼴이 Storybook → Foundation → Typography 에서 `Loaded` 로 보이거나(파일은 `my-assets/typo/`) 컴퓨터 기본 글꼴이다. 둘 다 아니면 브라우저와 웹사이트 방문자에게 대체 글꼴로 보인다는 점을 이해했다. AI가 "Storybook → Foundation → Typography 에서 그 글꼴이 Loaded 로 보이나요?"를 선택지로 묻고, 학생이 "예"를 고른 뒤에만 AI가 `font_check: confirmed`로 바꾼다.

질문에 실제 답을 반영한 뒤 `open_questions: 0`으로 갱신한다. 색 역할 적용을 먼저 끝내고 `pnpm ds:apply-token-plan docs/plans/typography.md --prepare`로 원본·기본 토큰·내용 해시와 변경 값을 확인한다. 이 명령은 승인하지 않는다. 준비 뒤 AI가 바뀔 값을 대화창에 요약하고 "Approve revision N" / "Change something"으로 묻는다. 학생이 승인을 고른 뒤에만 AI가 `status: approved` 한 줄을 쓰고 같은 명령에서 `--prepare`를 빼고 적용한다. 승인 후 수정은 revision을 올려 다시 검토한다.

적용 시 `.ds/typography.json`에 선택 근거가 저장되고 `ds:tokens`가 CSS를 재생성한다. 직접 JSON/CSS를 고치지 않는다. 실제 브라우저의 글꼴·줄높이·레이아웃을 확인하고 영향을 받는 부품은 다시 검수한다.

기본값 복원: 학생이 터미널에서 직접 `pnpm ds:reset-typography`를 실행하고 범위를 확인한 뒤 `reset text styles`를 입력한다(예전 문구 `글자 기본값 복원`도 받는다). AI 대신 실행·자동 승인·파이프 입력은 금지한다. 재생성 실패 시 기존 선택과 산출물을 보존한다. 기존 계획은 남으며 복원 후 실제 화면과 부품 검수를 다시 확인한다.

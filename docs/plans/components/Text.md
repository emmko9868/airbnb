---
kind: component
component: Text
revision: 2
status: approved
source_kind: starter-spec
source_ref: docs/plans/components/Text.md
facts_complete: true
open_questions: 0
user_open_questions: 0
pl_followups: 0
---

- Text 하나로 본문과 제목을 표시하며, 별도 Heading 부품은 만들지 않습니다.
- as(span/p/h1~h6)는 의미를, variant(body/body-sm/title)는 모양을 정합니다.
- 글꼴·크기·굵기·줄높이는 기존 타이포 토큰, 색은 text/text-secondary semantic을 씁니다.
- 학생 Figma 스타일을 확인·승인해 같은 역할의 토큰을 갱신하고, 필요하면 기존 Text를 수정합니다.
- 권고안 A를 반영한 revision 2 검토 단계이며, 사용자 승인과 실행 세션 A의 검사기 보완 전에는 구현하지 않습니다.

# Text 컴포넌트 구현 계획

> 결과 상태: 승인됨(revision 2). 사용자 최종 승인 2026-10-17, PL 기록. Q-P01 은 Q-13(3eb3560)의 starter-spec 승인 지원으로 해결됐다.

## 1. 요청과 적용 규칙

- 요청: 팀 작업 지시서 Q-12에 따라 팀 작업 지시서 Q-11의 스타터 기본 부품 계획을 revision 2로 갱신. 2026-10-17 사용자 결정은 “기본 부품 제공”과 “색·글꼴 값은 토큰 사용, 학생 Figma로 교체 가능”이다. 추가 결정: 팀 결정 기록의 2026-10-17 기록과 팀 작업 지시서 Q-12 1절에 따라 Q-T01·Q-T02·Q-I01·Q-I02는 모두 권고안 A. 사용자 원문은 “권고안 A로 일단 진행”. 이 답을 반영해 revision 2를 작성하며 이 revision의 구현 승인은 별도로 기다린다.
- 공통 규칙: `docs/ai-component-workflow.md` v1.0 R01~R09 전체. 필수 스펙: `docs/ai-design-system-spec.md` v1.1, 특히 G02~G07·C03~C12·4절·P04~P07·P11·V01~V05.
- 템플릿: `docs/templates/component-plan.md`. 이 문서는 사실·AI 제안·사용자 결정을 구별하며 구현 승인 상태를 스스로 기록하지 않는다.
- Figma 파일·노드·조회: 해당 없음. 사용자가 Figma 없는 스타터 기본 부품에 기존 토큰·기준선·페이지 스펙을 근거로 채택하라고 명시했다. Figma 조회 실패나 학생 디자인 검수 완료를 뜻하지 않는다. MCP·외부 아이콘 조회·모델 자동 호출 없음.
- 기준: 팀 작업 폴더, 브랜치 `edu/ds`, HEAD `46e7262`, revision 2 재확인일 2026-10-17. revision 1 조사 기준은 `3b2e755`. 시작 시 git 변경 없음.
- 현재 토큰 파일 SHA-256: `9b85bf54f47bd7ce7beaf39d332efbdc00ee7cf4e565147a68e8445deb8f8bfa` (`src/tokens/tokens.css`). 구현 전 변경 여부를 재확인하고 Q-10 병합 후 역할·값을 다시 대조한다.
- 이번 Q-12 변경은 Text.md·Icon.md와 `var/reports/Q-12.md`뿐이다. 아래 코드 경로·스토리·명령은 **후속 승인 구현의 계획**이며 이번에 생성·수정·실행하지 않는다.

## 2. 컴포넌트의 역할과 AI의 해석

| 항목 | 확인된 사실과 출처 | AI의 해석 | 사용자의 확정/정정 |
|---|---|---|---|
| 부품의 역할 | Q-11은 기본 Typography 제공 결정. 스펙 P11 및 5절은 페이지 제목·문구에도 검수된 부품 요구 | `Text` 하나로 일반 글자와 제목을 출력. `as`는 의미, `variant`는 시각 스타일. 별도 Heading은 첫 버전에서 만들지 않음(A 선택 반영) | Q-T01 A: Text 단일·의미/시각 분리 선택 완료, rev2 검토 대기 |
| 제목/글자 구분 | `taxonomy.json:7-18`은 Text·Heading을 별도 어휘로 분류. `components.baseline.json:2515-2534`은 extended Heading과 “시각 크기와 heading 레벨 분리”를 명시 | 이름 분리는 가능한 대안이나 현재 크기 토큰이 세 개라 6단계 시각 크기를 발명하지 않음 | Q-T01 A: 별도 Heading 없음, rev2 검토 대기 |
| 누를 수 있는 영역 | 새 부품은 텍스트 표시 역할. 기존 Button·Link 원본 존재 | 자체 클릭 영역·onClick·href·state·disabled prop 없음. 동작은 Button, 이동은 Link가 소유 | A 세부안 반영·rev2 검토 대기 |
| 클릭/선택/열림 동작 | 추가 동작 입력 없음 | 문구 렌더와 네이티브 태그의 문서 의미만 수행 | A 세부안 반영·rev2 검토 대기 |
| 키보드·포커스 범위 | 정적 문구·제목에는 입력/조작 계약 없음 | tabindex/링을 만들지 않음. 페이지의 h1~h6 구조는 페이지 입력에서 정함 | A 세부안 반영·rev2 검토 대기 |
| disabled 동작 | 정적 텍스트의 비활성 상호작용 없음 | 비활성 글자 색을 상태처럼 임의 노출하지 않음 | A 세부안 반영·rev2 검토 대기 |

## 3. 기존 부품과 변경 범위

- `src/components/Text`, `Heading`, `Typography`는 현재 없음. `Link`는 이동 부품이며 일반 문구 대체가 아니다. Modal 등의 내부 제목 스타일은 원본 소유이므로 이번에 끌어내거나 덮어쓰지 않는다.
- 현재 기준선에는 extended Heading이 있으나 `ds.config.json:79-82`는 core·standard만 사용한다. 그 size 1~6을 여섯 개 글자 크기의 근거로 쓰지 않는다. 나중에 extended를 켤 때 같은 역할의 Heading이 중복 생성되지 않도록 별도 등록 정책을 확인한다. 이 계획은 설정/기준선을 수정하지 않는다.
- A 선택을 반영한 공개 경로(미구현): `import { Text } from "@/components/Text"`. 한정된 as 유니온과 단순 interface로 기존 카탈로그가 읽을 수 있도록 한다. 임의 ElementType 제네릭이나 루트 props 유니온은 피한다(`scripts/lib/catalog.mjs:158-167`, `:221-253`).
- 후속 승인 구현 파일(이번 변경 아님): `src/components/Text/Text.tsx`, `Text.css`, `Text.stories.tsx`, `index.ts`. 클래스 `ds-text`, `ds-text--body/body-sm/title`, `ds-text--default/secondary`, 최상위 `data-testid="ds-text"`.
- 기존 Button·Link·Modal·기준선·페이지를 자동 수정하지 않는다. 기존 제목/문구 소비처 전환은 별도 계획이다. Q-T01 A에 따라 별도 Heading 파일은 범위에 넣지 않는다. 나중에 분리 요구가 생기면 새 revision에서 파일 범위와 API를 다시 확인한다.

## 4. Figma 상태·크기 전체 목록

Figma 노드는 해당 없음. 아래는 기존 토큰/Modal 제목 선언을 근거로 제안했던 조합을 Q-T02 A 답변에 따라 채택한 스타터 정적 조합이다. 선택은 확정됐지만 revision 2의 구현 승인·화면 검수는 아직 아니다. 별도 size/weight prop 없이 세 preset으로 제한한다.

| preset / variant | font-size | font-weight | line-height | 근거와 상태 |
|---|---|---|---|---|
| body | --text-body-1 | --font-weight-regular | --leading-normal | 생성 CSS에 존재. Q-T02 A 선택 완료 |
| body-sm | --text-body-2 | --font-weight-regular | --leading-normal | 생성 CSS에 존재. Q-T02 A 선택 완료 |
| title | --text-title | --font-weight-medium | --leading-tight | `src/components/Modal/Modal.css:44-48`과 같은 조합을 Q-T02 A로 채택 |

모든 조합은 static 상태다. 각각의 font-family는 --font-sans이며 tone default는 --color-text, secondary는 --color-text-secondary다. 검수할 구체적인 48개 조합을 아래에 열거한다.

| 태그 / variant / tone | 읽기 근거 | 이벤트·지속 상태 | 적용 영역 | 값·구조 | 아이콘 | API/CSS 연결 | 확정 여부 |
|---|---|---|---|---|---|---|---|
| span / body / default | 위 preset·semantic 표 | static | 최상위 span | body 값, default 색 | 없음(A 선택 범위) | as=span, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| span / body / secondary | 위 preset·semantic 표 | static | 최상위 span | body 값, secondary 색 | 없음(A 선택 범위) | as=span, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| span / body-sm / default | 위 preset·semantic 표 | static | 최상위 span | body-sm 값, default 색 | 없음(A 선택 범위) | as=span, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| span / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 span | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=span, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| span / title / default | 위 preset·semantic 표 | static | 최상위 span | title 값, default 색 | 없음(A 선택 범위) | as=span, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| span / title / secondary | 위 preset·semantic 표 | static | 최상위 span | title 값, secondary 색 | 없음(A 선택 범위) | as=span, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| p / body / default | 위 preset·semantic 표 | static | 최상위 p | body 값, default 색 | 없음(A 선택 범위) | as=p, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| p / body / secondary | 위 preset·semantic 표 | static | 최상위 p | body 값, secondary 색 | 없음(A 선택 범위) | as=p, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| p / body-sm / default | 위 preset·semantic 표 | static | 최상위 p | body-sm 값, default 색 | 없음(A 선택 범위) | as=p, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| p / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 p | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=p, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| p / title / default | 위 preset·semantic 표 | static | 최상위 p | title 값, default 색 | 없음(A 선택 범위) | as=p, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| p / title / secondary | 위 preset·semantic 표 | static | 최상위 p | title 값, secondary 색 | 없음(A 선택 범위) | as=p, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h1 / body / default | 위 preset·semantic 표 | static | 최상위 h1 | body 값, default 색 | 없음(A 선택 범위) | as=h1, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h1 / body / secondary | 위 preset·semantic 표 | static | 최상위 h1 | body 값, secondary 색 | 없음(A 선택 범위) | as=h1, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h1 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h1 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h1, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h1 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h1 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h1, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h1 / title / default | 위 preset·semantic 표 | static | 최상위 h1 | title 값, default 색 | 없음(A 선택 범위) | as=h1, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h1 / title / secondary | 위 preset·semantic 표 | static | 최상위 h1 | title 값, secondary 색 | 없음(A 선택 범위) | as=h1, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h2 / body / default | 위 preset·semantic 표 | static | 최상위 h2 | body 값, default 색 | 없음(A 선택 범위) | as=h2, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h2 / body / secondary | 위 preset·semantic 표 | static | 최상위 h2 | body 값, secondary 색 | 없음(A 선택 범위) | as=h2, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h2 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h2 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h2, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h2 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h2 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h2, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h2 / title / default | 위 preset·semantic 표 | static | 최상위 h2 | title 값, default 색 | 없음(A 선택 범위) | as=h2, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h2 / title / secondary | 위 preset·semantic 표 | static | 최상위 h2 | title 값, secondary 색 | 없음(A 선택 범위) | as=h2, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h3 / body / default | 위 preset·semantic 표 | static | 최상위 h3 | body 값, default 색 | 없음(A 선택 범위) | as=h3, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h3 / body / secondary | 위 preset·semantic 표 | static | 최상위 h3 | body 값, secondary 색 | 없음(A 선택 범위) | as=h3, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h3 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h3 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h3, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h3 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h3 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h3, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h3 / title / default | 위 preset·semantic 표 | static | 최상위 h3 | title 값, default 색 | 없음(A 선택 범위) | as=h3, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h3 / title / secondary | 위 preset·semantic 표 | static | 최상위 h3 | title 값, secondary 색 | 없음(A 선택 범위) | as=h3, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h4 / body / default | 위 preset·semantic 표 | static | 최상위 h4 | body 값, default 색 | 없음(A 선택 범위) | as=h4, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h4 / body / secondary | 위 preset·semantic 표 | static | 최상위 h4 | body 값, secondary 색 | 없음(A 선택 범위) | as=h4, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h4 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h4 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h4, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h4 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h4 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h4, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h4 / title / default | 위 preset·semantic 표 | static | 최상위 h4 | title 값, default 색 | 없음(A 선택 범위) | as=h4, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h4 / title / secondary | 위 preset·semantic 표 | static | 최상위 h4 | title 값, secondary 색 | 없음(A 선택 범위) | as=h4, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h5 / body / default | 위 preset·semantic 표 | static | 최상위 h5 | body 값, default 색 | 없음(A 선택 범위) | as=h5, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h5 / body / secondary | 위 preset·semantic 표 | static | 최상위 h5 | body 값, secondary 색 | 없음(A 선택 범위) | as=h5, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h5 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h5 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h5, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h5 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h5 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h5, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h5 / title / default | 위 preset·semantic 표 | static | 최상위 h5 | title 값, default 색 | 없음(A 선택 범위) | as=h5, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h5 / title / secondary | 위 preset·semantic 표 | static | 최상위 h5 | title 값, secondary 색 | 없음(A 선택 범위) | as=h5, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h6 / body / default | 위 preset·semantic 표 | static | 최상위 h6 | body 값, default 색 | 없음(A 선택 범위) | as=h6, variant=body, tone=default | A 선택 확정·rev2 검토 대기 |
| h6 / body / secondary | 위 preset·semantic 표 | static | 최상위 h6 | body 값, secondary 색 | 없음(A 선택 범위) | as=h6, variant=body, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h6 / body-sm / default | 위 preset·semantic 표 | static | 최상위 h6 | body-sm 값, default 색 | 없음(A 선택 범위) | as=h6, variant=body-sm, tone=default | A 선택 확정·rev2 검토 대기 |
| h6 / body-sm / secondary | 위 preset·semantic 표 | static | 최상위 h6 | body-sm 값, secondary 색 | 없음(A 선택 범위) | as=h6, variant=body-sm, tone=secondary | A 선택 확정·rev2 검토 대기 |
| h6 / title / default | 위 preset·semantic 표 | static | 최상위 h6 | title 값, default 색 | 없음(A 선택 범위) | as=h6, variant=title, tone=default | A 선택 확정·rev2 검토 대기 |
| h6 / title / secondary | 위 preset·semantic 표 | static | 최상위 h6 | title 값, secondary 색 | 없음(A 선택 범위) | as=h6, variant=title, tone=secondary | A 선택 확정·rev2 검토 대기 |

- Focus 링 범위: A 선택안대로 없음. Text 자체를 클릭/Tab 대상으로 만들지 않는다.
- Figma에 실제로 없는 상태: 노드가 없으므로 판정 대상 아님. A로 채택한 스타터 범위에는 hover/active/focus/disabled/selected·반응형 크기·ellipsis·애니메이션을 넣지 않는다.
- 미조회/실패: Figma 조회를 요청하거나 시도하지 않음. 향후 학생 변형은 실제 입력 범위를 새 revision에 기록한다.
- as로 block/inline 문서 흐름은 달라질 수 있지만 글꼴 값은 variant가 정한다. h1이라고 자동 title, title이라고 자동 h1이 되지 않는다.

## 5. 색·alpha·디자인 토큰 대응

아래 수치는 현재 생성 CSS의 **조사값**이며 후속 컴포넌트 CSS에 리터럴로 복사할 값이 아니다. semantic은 추론 출처, 타이포 토큰은 synthesized 출처이므로 자동으로 사용자 결정이 되지 않는다. Q-T02 A 답변을 근거로 이 역할 조합을 채택했으며 현재값·학생 교체값의 실제 렌더 검수는 별개다.

| 요소 / 상태 | 원본·변수 | primitive | semantic/layout 역할 | 현재 해석 값 | 값·역할 일치 여부 | 결정 반영·후속 확인 |
|---|---|---|---|---|---|---|
| 전체 family | Figma 변수 없음; tokens.css:65 | 해당 없음 | --font-sans | system-ui 및 기존 폴백 목록 | 토큰 존재 확인 | 학생 family와의 대응은 학생 입력 시 확인 |
| body 크기 | tokens.css:66 | 해당 없음 | --text-body-1 | 16px | 토큰 존재 확인 | 역할 조합 Q-T02 A 선택 완료 |
| body-sm 크기 | tokens.css:67 | 해당 없음 | --text-body-2 | 14px | 토큰 존재 확인 | 역할 조합 Q-T02 A 선택 완료 |
| title 크기 | tokens.css:68 | 해당 없음 | --text-title | 20px | 토큰 존재 확인 | 역할 조합 Q-T02 A 선택 완료 |
| 본문 굵기·줄높이 | tokens.css:71-72 | 해당 없음 | --font-weight-regular / --leading-normal | 400 / 1.5(단위 없는 비율) | 토큰 존재 확인 | 역할 조합 Q-T02 A 선택 완료 |
| 제목 굵기·줄높이 | tokens.css:70,73 | 해당 없음 | --font-weight-medium / --leading-tight | 500 / 1.25(단위 없는 비율) | 기존 Modal 조합 확인 | 역할 조합 Q-T02 A 선택 완료 |
| default 색 | tokens.css:53,32 | gray-900 | --color-text | #18181B, alpha 1 | 일반 글자 역할: Q-T02 A | Q-T02 A 선택 완료; 실제 배경 대비 검수 미실행 |
| secondary 색 | tokens.css:55,28 | gray-500 | --color-text-secondary | #71717A, alpha 1 | 보조 글자 역할: Q-T02 A | Q-T02 A 선택 완료; 실제 배경 대비 검수 미실행 |

- 배경 fill은 만들지 않고 부모의 승인된 배경에서 렌더한다. 스타터 검수 캔버스는 --color-bg/--color-surface가 현재 #FAFAFA임을 대조한다. 향후 학생 Figma 부모 배경이 다르면 새 검수 배경을 기록한다.
- 같은 RGB여도 역할이 다르면 합치지 않는다. 첫 버전에 primary/on-primary/disabled/success 등의 색 preset은 추가하지 않는다. 밝은/어두운 부모에 따라 색을 임의 자동 반전하지 않는다.
- 글꼴 속성은 위 토큰만 사용. 네이티브 p/h1~h6의 기본 margin은 A 선택안대로 0으로 정규화하며 새 숫자 간격·폰트 크기를 하드코딩하지 않는다. 미정 letter-spacing/가변형 scale은 발명하지 않는다.
- 신규 토큰 제안 없음. 공용 --font-weight-bold는 존재하지만 별도 강조 역할 입력이 없으므로 억지로 variant를 늘리지 않는다. 생성물은 수정하지 않는다.
- 경로: 확인된 Figma/승인 입력 → 정해진 토큰 생성 경로 → 생성 CSS 참조 → computed style 대조. Q-10 새 경로는 병합 후 실제 계약을 확인한다.

## 6. 원본 아이콘·asset

| asset / Figma 노드 | 원본 파일/벡터 경로 또는 해시 | 크기·색·stroke·회전 | 나타나는 상태·조합 | 나타나지 않는 상태·조합 | 확인 여부 |
|---|---|---|---|---|---|
| Text 자체 icon/image | 해당 없음 | 해당 없음 | 없음(A 선택 범위) | 48개 정적 조합 전부 | A 선택안의 Text에는 asset을 추가하지 않음 |

텍스트 옆의 그림은 별도 Icon을 조립한다. Text가 임의 glyph·이미지·아이콘을 생성하지 않는다. font-sans는 현재 시스템 폰트 토큰이라 새 폰트 파일을 다운로드/추가하지 않는다. 학생 커스텀 폰트의 파일·로드 근거가 없으면 원본 일치 판정을 보류한다.

## 7. 공개 API와 실제 기능

아래 API는 Q-T01·Q-T02 A 선택을 반영한 revision 2의 계약이다. 현재 지원되는 구현 API나 revision 2의 구현 승인으로 오인하지 않는다.

| prop / 이벤트 | 근거 | 기본값·허용값 | 실제 동작 / 결과 | 키보드·disabled 처리 | 사용자 확정 |
|---|---|---|---|---|---|
| children | 페이지 문구 입력 계약 | 필수 ReactNode | 명시된 문구를 렌더. 비어 있는 heading이나 잘못된 block 중첩을 승인된 사용 예로 만들지 않음 | 자체 이벤트 없음 | A 세부안 반영·rev2 검토 대기 |
| as | 기준선의 의미·시각 분리 요구 | span 기본; span, p, h1~h6 | 실제 네이티브 태그. h1~h6 수준은 페이지 정보 구조로 결정; role/aria-level로 위장하지 않음 | tabIndex 없음 | Q-T01 A 선택 완료·rev2 검토 대기 |
| variant | 기존 세 크기 토큰 | body 기본; body, body-sm, title | 4절 preset 적용, 의미 태그와 독립 | 상태 prop 아님 | Q-T02 A 선택 완료·rev2 검토 대기 |
| tone | 기존 글자 semantic | default 기본; default, secondary | 해당 semantic 색만 사용 | disabled tone 아님 | Q-T02 A 선택 완료·rev2 검토 대기 |
| id / lang / dir | 앵커·언어·쓰기 방향 연결 | id·lang 선택 string; dir은 ltr/rtl/auto 선택 | 최상위 요소에 전달 | 포커스 생성 없음 | A 세부안 반영·rev2 검토 대기 |
| ref | 기존 forwardRef 부품과 같은 방향 | HTMLElement ref(A 선택안) | 실제 최상위 span/p/heading 참조 | 노드 참조를 Tab 가능성으로 해석하지 않음 | A 세부안 반영·rev2 검토 대기 |
| 이벤트·외관 우회 | 스펙 P04~P07 | onClick/href/tabIndex/style/className/임의 as는 첫 API에서 제공하지 않음 | 이벤트가 필요한 곳은 기존 Button/Link; 배치는 외부 컨테이너 | false button/임의 focus 없음 | A 세부안 반영·rev2 검토 대기 |

단순 `TextProps` interface와 리터럴 유니온을 사용한다. 태그 유니온은 `span | p | h1 | h2 | h3 | h4 | h5 | h6`로 닫는다. 사용 형태 예시는 `<Text as="h1" variant="title">페이지 제목</Text>`이며 예시 문구를 학생 페이지 데이터로 확정한 것은 아니다. 시각 크기와 태그가 독립이라 body 스타일의 h2, title 스타일의 span도 A 선택안에서 의도적으로 지원한다. h1~h6가 모두 같은 title 크기일 수 있으며 페이지 제목 수준으로 여섯 가지 폰트 크기를 발명하지 않는다. 의미 있는 heading은 가시 문구를 제공하고 문서의 계층은 페이지 검수에서 확인한다.

카탈로그 반영(후속 구현): index.ts에서 Text·TextProps 공개 → `pnpm ds:docs`가 실제 디렉터리/API를 발견 → `pnpm ds:catalog Text`로 경로·유니온·기본값 확인 → 사람의 source.kind=spec, ref=이 계획 revision/내용 해시 검수 기록. 자동 생성·타입 검사만으로 승인하지 않는다. 최초에는 unverified, 승인된 범위만 approved_scope. 토큰/코드 변경 시 stale 여부와 재검수를 확인한다. CATALOG.md·실제 catalog-review.json을 AI가 직접 수정하지 않는다. 자동 검사 결과는 현재 카탈로그에서 not_run이므로 결과를 별도 증거로 연결한다.

### 학생 Figma로 교체하는 순서

1. 자기 화면의 본문·보조문구·제목 스타일과 정확한 Figma 파일/노드·조회 시각을 받는다. 기존 Text 역할과 대응표를 만들고, 노드 이름이 Typography/Heading이라고 새 원본을 복제하지 않는다.
2. 크기뿐 아니라 family·weight·line-height와 단위·letter-spacing·색·alpha·부모 배경을 실제로 읽는다. 지원할 모든 조합을 현재 preset과 비교하여 새 revision에 사실·차이를 기록한다. 읽지 못한 값이나 폰트 파일은 미검증/입력 부족으로 남긴다.
3. 변수/텍스트 스타일을 `pnpm ds:figma` 경로로 읽고, 승인된 역할을 기존 `--text-body-1/2`, `--text-title`, `--font-sans`, `--font-weight-*`, `--leading-*`에 정확히 연결할 수 있는지 확인한다. `scripts/lib/figma-merge.mjs:93-109`은 정해진 이름/Font(...) 형식·한 family 경로를 사용하므로 임의의 텍스트 스타일이 전부 자동 매핑된다고 보장하지 않는다. 여러 family 충돌, 이름 불일치, 픽셀/비율 line-height는 결과와 원본을 대조한다.
4. 같은 역할의 같은 토큰 이름이 학생 값으로 갱신되면 Text는 CSS 참조를 유지한 채 바뀐다. 값이 근사치만 맞거나 기존 토큰으로 표현할 수 없으면 새 원본 값·사용처·역할을 계획하고 승인받는다. 특히 공용 font-sans/leading 변경은 다른 부품도 바꾸므로 해당 소비 부품의 영향과 재검수 범위를 보고한다. 단일 Text를 맞추려고 공용 의미를 몰래 바꾸지 않는다.
5. 색은 Q-10의 학생 팔레트 전면 교체와 사람 승인 역할 매핑 절차를 사용한다. 현재 HEAD에서 Q-10은 진행 중이므로 그 새 명령이 이미 동작한다고 가정하지 않는다. 병합 후 실제 명령/토큰 계획을 확인한다. 누락 역할을 샘플 색이나 근사 회색으로 채우지 않는다.
6. 학생이 변경 계획을 확인·승인한 뒤 입력/정해진 스크립트 경로로 토큰을 재생성하고 필요할 때 Text 원본을 수정한다. `src/tokens/`와 `.ds/` 생성물·사람 소유 매핑을 AI가 직접 덮어쓰지 않는다. 토큰만 바뀌면 기본적으로 Text 원본 코드를 다시 생성할 이유가 없다.
7. 학생 Figma와 전체 캔버스·computed style·해당 상태/태그를 대조하고 타입/가드/play 검사 후 인간 검수를 받는다. `pnpm ds:docs`로 카탈로그를 갱신하고, 현재 해시의 검수 범위만 페이지에서 사용한다. 글꼴 파일/사용 환경이 없으면 폴백이 원본과 같다고 보고하지 않는다.

## 8. Q&A와 사용자 결정

확정된 사용자 결정: 기본 Typography·Icon 제공·토큰 사용·학생 Figma 교체 원칙에 더해, 2026-10-17 Q-T01·Q-T02 모두 A 선택. 근거는 팀 결정 기록와 팀 작업 지시서 Q-12 1절이며 사용자 원문은 “권고안 A로 일단 진행”.

| 질문 ID | 당시 미확정 항목 | 결정 반영 및 영향 | 사용자 답 / PL 지시 | 해결 상태 |
|---|---|---|---|---|
| Q-T01 | Text/Heading 구조 | A: Text 하나, as와 variant 분리. 별도 Heading·추가 원본/스토리는 만들지 않음 | 사용자 “권고안 A로 일단 진행” (2026-10-17, DECISIONS.md·Q-12 1절) | 해결(A) |
| Q-T02 | 글자 preset·semantic 색·기본값 | A: body/body-sm/title과 default/secondary를 4·5절 매핑대로 채택; 기본값 span/body/default. 48개 조합을 같은 범위로 검증 | 사용자 “권고안 A로 일단 진행” (2026-10-17, DECISIONS.md·Q-12 1절) | 해결(A) |
| Q-P01 (공통·사용자 질문 아님) | Figma 노드 URL 전용 승인 검사기는 채택 명세 경로를 아직 처리하지 못함(`scripts/lib/component-plan.mjs:9-15`, `:41`, `:77-78`) | starter/adopted-spec 출처와 승인·해시 검증의 지원을 별도 작업에서 보완·검증. 이 오더에서는 검사기 수정·가짜 Figma URL·hook 우회 없음 | PL 지시: Q-10 뒤 실행 세션 A에게 별도 배정(팀 작업 지시서 Q-12 1절) | 해결 — Q-13(3eb3560): `source_kind: starter-spec`, `source_ref` 지원·테스트 |
사용자 결정 질문과 PL 후속(Q-P01)이 모두 해결되어 `open_questions: 0`, `facts_complete: true` 다. 출처는 Figma 가 아니라 사용자가 채택한 스타터 명세이며 `source_kind: starter-spec`, `source_ref` 로 표시한다.

2026-10-17 사용자 원문 “권고안 A로 일단 진행”은 revision 1의 네 질문에 대한 A 선택 근거다. 팀 작업 지시서 Q-12 2·3절에 따라 **revision 2의 구현 승인은 아직 아니다**. 답변 표와 아래 검증 범위를 함께 갱신했으며 사용자에게 같은 결정을 다시 묻지 않는다.

## 9. 검증 계획

Q-T01 A의 Text 단일 원본과 Q-T02 A의 span/body/default 기본값·48개 조합이 검증 대상이다. 선택 완료를 검사 통과로 표시하지 않으며 아래 완료 증거는 모두 미실행으로 유지한다.

| 확인 대상 | 원본의 기대 결과(A 선택 반영·구현/검수 미실행) | 검사 방법 | 완료 증거 |
|---|---|---|---|
| 기본 상태와 캔버스 배경 | span/body/default, 실제 배경과 alpha 구별 | iframe 전체 배경·computed font/color·DOM 태그 측정 | 미실행 |
| 모든 상태·크기 | 48개 정적 조합의 preset 일치, as 변경에 임의 폰트 변화 없음 | 48조합 Matrix + preset별 stories; play에서 실제 태그·문구·props 적용 검사 | 미실행 |
| 제목 접근성 | h1~h6는 해당 수준의 heading, span/p는 heading 역할 없음 | play getByRole heading의 level/name, DOM 검사; 페이지 계층 별도 검수 | 미실행 |
| 문구·데이터 연결 | children·id/lang/dir 변경이 실제 노드에 반영 | controls/args 변경 후 문구·속성 확인; 타입으로 잘못된 as·prop 거절 | 미실행 |
| disabled / Tab / Focus | Text는 Tab 대상 아님; 시각 상태 스토리 추가 안 함 | 실제 키보드로 주변 기존 부품 사이 Tab 이동·불필요한 tabindex 부재 검사 | 미실행 |
| 공통 규칙 및 기존 사용처 | 토큰 참조만 사용, 기존 부품 파일 불변 | 타입·가드·소스 범위 확인, token computed value/사용처 영향 대조 | 미실행 |
| 학생 토큰 교체 | 이름 유지 시 실제 글꼴·크기·색이 승인 값으로 갱신 | 원본 및 재생성 CSS·computed style 대조, 영향 부품 재검수 | 미실행 |
| 카탈로그 | 실제 import/API 추출 성공, 근거 없는 approved_scope 없음 | ds:docs·ds:catalog Text, 해시/검수 scope 대조 | 미실행 |

`Text.stories.tsx`는 `Components/Text`, autodocs, 기본/preset·heading 의미·전체 Matrix를 구성한다. 같은 조합의 중복 스토리를 늘리지 않고 play가 단순 존재 확인에서 끝나지 않게 한다. 기본값 자체가 정적이라 가짜 hover/click/disabled stories와 fn() 클릭 콜백을 만들지 않는다.

후속 승인 구현의 필수 명령: `pnpm ai:check Text`, `pnpm ai:verify Text`, `pnpm typecheck`, `pnpm ds:guard`. 추가로 `pnpm ds:docs`, `pnpm ds:catalog Text`. Storybook play·정적 검사와 실제 화면/폰트 대조·인간 검수를 구별한다. 이번 계획 단계에서는 실행하지 않았다.

## 10. 사용자 검토

- revision 2 작성 근거: Q-12 및 DECISIONS.md의 네 질문 모두 A 답변. Text에서는 Q-T01·Q-T02가 해결됐다. 사용자 결정은 0개 남음.
- 현재 상태: `approved`, revision 2. 사용자가 이 revision 의 최종 승인을 명시했고 PL 이 그 말을 기록했다(아래 승인 기록).
- 구현 전제 해결: Q-P01 은 Q-13(3eb3560)에서 해결됐다. 구현 직전 최신 토큰·원본 자산의 동일성은 구현 세션이 다시 확인한다.
- 구현 전 조건: 사용자의 revision 2 명시적 승인, 실행 세션 A의 채택 명세 승인 검사기 보완·검증 완료, 실제 구현 직전 최신 토큰/원본의 동일성 재확인. 기존 토큰/자산 해시는 이번 revision 작성 시 다시 확인했다.
- 스타터 명세 선택과 실제 화면·동작 검수는 별개다. 가짜 Figma URL·Code Connect를 만들거나 hook을 우회하지 않는다. 이번 오더에서는 계획서와 보고서만 수정했다.

## 11. 승인 기록

- 2026-10-17 사용자 결정: Q-T01·Q-T02·Q-I01·Q-I02 모두 권고안 A — "권고안 A로 일단 진행".
- 2026-10-17 사용자 최종 승인(revision 2): "최종 승인은 일단 너의 추천으로 진행해도 될 것 같아".
- 기록자: PL 세션(사용자 말을 옮겨 적음. AI 자체 승인이 아니다). 근거: 팀 결정 기록.

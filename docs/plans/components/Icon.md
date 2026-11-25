---
kind: component
component: Icon
revision: 2
status: approved
source_kind: starter-spec
source_ref: docs/plans/components/Icon.md
facts_complete: true
open_questions: 0
user_open_questions: 0
pl_followups: 0
---

- 기존 저장소 원본 add/close/search 세 가지를 기본 단색 SVG 아이콘으로 제공합니다.
- name으로 선택하고 sm/md/lg 크기, inherit/default/secondary 색과 장식·의미 모드를 구분합니다.
- 크기는 spacing 토큰의 3/4/5배, 색은 부모 semantic/currentColor 또는 text/text-secondary를 씁니다.
- 장식은 aria-hidden, 의미 있는 아이콘은 label을 쓰며, 학생 Figma 원본 확인·승인 후 기존 registry를 교체합니다.
- 권고안 A를 반영한 revision 2 검토 단계이며, 사용자 승인과 실행 세션 A의 검사기 보완 전에는 구현하지 않습니다.

# Icon 컴포넌트 구현 계획

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
| 부품의 역할 | Q-11은 기본 Icon 제공을 결정; taxonomy.json:48-54에 Icon 어휘 존재 | 인라인 SVG 표시 원본. name으로 출처가 확인된 add/close/search만 선택(A 선택 반영) | Q-I01 A 선택 완료·rev2 검토 대기 |
| 누를 수 있는 영역 | 기존 IconButton이 button과 label·onClick 소유(`IconButton.tsx:8-19`, `:33-36`) | Icon 자체는 버튼/링크가 아니고 표시만 한다 | Q-I02 A 선택 완료·rev2 검토 대기 |
| 클릭/선택/열림 동작 | 그림 자체의 동작 입력 없음 | 없음. 동작은 기존 Button/IconButton, 이동은 Link가 소유 | A 세부안 반영·rev2 검토 대기 |
| 키보드·포커스 범위 | IconButton에 네이티브 Tab/disabled 경로 존재 | SVG에 focusable=false, tabIndex 없음. 장식 그림은 aria-hidden, 의미 그림은 이름 있는 img | A 세부안 반영·rev2 검토 대기 |
| disabled 동작 | 아이콘 단독 비활성 입력 없음 | disabled/hover/selected prop을 만들지 않음. 부모 버튼이 상태·색을 소유 | A 세부안 반영·rev2 검토 대기 |

## 3. 기존 부품과 변경 범위

- `src/components/Icon`은 현재 없다. 기존 IconButton·Search·Modal·Link에는 인라인 SVG가 있지만 공개 Icon registry는 없다. 파일형 `.svg` 자산도 조사 범위에서 발견되지 않았다.
- 기존 IconButton 공개 경로는 `@/components/IconButton`, icon은 ReactNode, label은 필수 string이며 기존 callback/disabled를 유지한다. Icon은 그 부품을 대체하는 새 버튼이 아니다.
- A 선택을 반영한 공개 경로(미구현): `import { Icon } from "@/components/Icon"`. 단순 interface·리터럴 name/size/tone 유니온을 사용하고 런타임에서 이름/접근성 조합을 검증한다. 루트 판별 유니온/제네릭은 현재 카탈로그 지원 한계가 있으므로 먼저 쓰지 않는다(`scripts/lib/catalog.mjs:158-167`, `:221-253`).
- 후속 승인 구현 파일(이번 변경 아님): `src/components/Icon/Icon.tsx`, `Icon.css`, `Icon.stories.tsx`, `index.ts`. 자산 registry는 A 선택안대로 우선 Icon.tsx 안에서 실제 SVG JSX로 관리한다(소규모·의존성 없는 닫힌 목록). 학생 자산이 많아 파일을 나누면 같은 폴더의 명시적 정적 import로 연결하고 해당 변경 범위를 다시 기록한다.
- 클래스 `ds-icon`, `ds-icon--sm/md/lg`, `ds-icon--inherit/default/secondary`, 최상위 SVG `data-testid="ds-icon"`.
- 기존 inline SVG를 일괄 Icon 호출로 바꾸는 변경은 이번 범위에 없다. 스타터 코드가 추측으로 다른 부품을 바꾸지 않는다. 자산/접근성 계약은 A로 선택됐으며 후속 구현 승인 후에도 이 목록 밖의 stories용 임의 glyph는 만들지 않는다.

## 4. Figma 상태·크기 전체 목록

Figma 원본 없음은 사용자에게 명시적으로 채택된 스타터 조건이다. 아래는 Q-I01·Q-I02 A 답변으로 선택된 기존 자산·layout 토큰 조합이다. 계약 선택은 완료됐지만 revision 2 구현 승인과 실제 화면 검수는 대기한다.

- 크기(A 선택): sm=`calc(var(--spacing) * 3)`, md=`calc(var(--spacing) * 4)`, lg=`calc(var(--spacing) * 5)`. 현재 --spacing=4px에서 12/16/20px지만 CSS는 토큰 식만 사용한다. 기존 Link SVG의 12px(`Link.tsx:58`), IconButton 슬롯의 spacing×4 및 큰 슬롯×5(`IconButton.css:18-26`, `:58`)를 채택 근거로 기록한다.
- tone(A 선택): inherit(기본)은 부모의 semantic 색/currentColor를 따름, default는 --color-text, secondary는 --color-text-secondary. 비토큰 부모 색을 승인하는 수단으로 inherit를 쓰지 않는다.
- 접근성 두 모드: 장식(decorative=true, 기본), 의미(decorative=false와 필수 유효 label). 시각 glyph가 바뀌는 state variant가 아니며 두 모드 모두 동일한 geometry를 표시한다.
- 채택 이름 3 × size 3 × tone 3 × 접근성 모드 2 = 54개 정적 조합. 아래 각 행은 장식/의미 두 계약을 모두 검증하며 전체 54조합을 명시한다.

| 채택 이름 / 크기 / 색 | 읽기 근거 | 상태/이벤트 | 적용 영역 | 기본과 다른 값·구조 | 아이콘 유무 | API/CSS 연결 | 확정 여부 |
|---|---|---|---|---|---|---|---|
| add / sm / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, inherit 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / sm / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, default 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / sm / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, secondary 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / md / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, inherit 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / md / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, default 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / md / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, secondary 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / lg / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, inherit 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / lg / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, default 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| add / lg / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, secondary 색; 모드별 ARIA | add 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / sm / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, inherit 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / sm / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, default 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / sm / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, secondary 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / md / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, inherit 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / md / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, default 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / md / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, secondary 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / lg / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, inherit 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / lg / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, default 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| close / lg / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, secondary 색; 모드별 ARIA | close 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / sm / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, inherit 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / sm / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, default 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / sm / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | sm 렌더 치수, secondary 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / md / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, inherit 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / md / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, default 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / md / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | md 렌더 치수, secondary 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / lg / inherit | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, inherit 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / lg / default | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, default 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |
| search / lg / secondary | 5·6절 자산/토큰 표 | static; 장식 및 의미 각 1조합 | root SVG | lg 렌더 치수, secondary 색; 모드별 ARIA | search 원본만 | name/size/tone + decorative/label | A 선택 확정·rev2 검토 대기 |

- Focus 링 범위: Icon에는 없음. 부모 Button/IconButton의 링을 복제하지 않는다.
- 없는 상태 판단: Figma 조회 대상이 없어 판정 대상 아님. 초기 Icon에는 hover/active/focus/disabled·자동 회전·애니메이션을 추가하지 않는다.
- 미조회/실패: Figma 조회 없음. 학생이 제공한 자산은 해당 파일/노드·모든 필요한 상태를 읽은 범위만 갱신한다.

## 5. 색·alpha·디자인 토큰 대응

| 요소 / 상태 | 원본/현재 토큰 | primitive | semantic/layout 역할 | 현재 해석 값 | 값·역할 일치 여부 | 결정 반영·후속 확인 |
|---|---|---|---|---|---|---|
| sm / md / lg | tokens.css:81 | 해당 없음 | --spacing × 3 / 4 / 5 | 12 / 16 / 20px | 계산 근거 확인 | Q-I02 A 크기 선택 완료 |
| inherit 색 | 기존 SVG의 currentColor와 부모 계약 | 직접 참조 안 함 | 승인된 부모 semantic 색을 상속 | 부모별로 결정 | 부모가 semantic을 쓰는지 별도 대조 | Q-I02 A 선택 완료; 원시 색 부모 허용 아님 |
| default 색 | tokens.css:53 | gray-900 | --color-text | #18181B, alpha 1 | 기본 글자/그림 역할: A 선택 | Q-I02 A 선택 완료; 실제 배경 검수 미실행 |
| secondary 색 | tokens.css:55 | gray-500 | --color-text-secondary | #71717A, alpha 1 | 보조 그림 역할: A 선택 | Q-I02 A 선택 완료; 실제 배경 검수 미실행 |

- 기본 root SVG는 fill=currentColor, 선형 자산의 원본 stroke는 currentColor를 사용하고 해당 path/circle의 fill=none을 보존한다. fill=none은 그림 채움 없음이며 새 원시 색이 아니다. 원래의 strokeWidth/viewBox/path/회전은 자산의 기하 정보이므로 임의로 균일화하지 않는다.
- 렌더 width/height는 CSS layout 토큰 식이다. viewBox의 0 0 16 16·좌표·원본 strokeWidth 수치를 폰트/색상 리터럴처럼 토큰 값으로 바꾸어 그림을 왜곡하지 않는다.
- Icon 자체 배경 fill/테두리/그림자는 없음. 실제 부모 배경과 투명 영역을 구분한다. 그림 가시성은 원본/부모 semantic/캔버스에서 확인하고 읽기 어려우면 자동 반전·색 혼합으로 고치지 않는다.
- 자체 font-size/family는 필요 없음. 새 icon 전용 size/color 토큰을 미리 만들지 않는다. 학생 크기가 spacing 배수로 정확히 표현되지 않으면 새 근거/계획 없이 반올림하지 않는다.
- 현재 text semantic은 추론 출처이며 Q-I02 A 답변으로 이 역할 조합을 채택했다. 실제 렌더 검수·revision 2 구현 승인은 별개이며 학생 색 교체는 Q-10의 승인 매핑을 따른다. Q-10은 이 HEAD에서 진행 중이므로 병합 후 실제 경로를 확인한다.

## 6. 원본 아이콘·asset

이 표는 **기존 코드에서 원본을 확인하고 Q-I01 A로 기본 세트에 채택한 자산**이다. 학생 Figma에서 가져온 아이콘이라고 주장하지 않는다. 이번에는 실제 SVG 파일/컴포넌트를 만들지 않고 revision 2 구현 승인·검수를 기다린다.

| asset / Figma 노드 | 원본 파일/벡터 경로 또는 해시 | 크기·색·stroke·회전 | 나타나는 상태·조합 | 나타나지 않는 상태·조합 | 확인 여부 |
|---|---|---|---|---|---|
| add / 노드 없음 | `src/components/IconButton/IconButton.stories.tsx:15`; path `M8 3v10M3 8h10` | viewBox 0 0 16 16; 선 currentColor/1.6/round; fill none; 회전 없음 | add 조합만(A 선택) | 다른 name/미지원 상태에서 대체하지 않음 | 원본 확인·Q-I01 A 선택 완료; 구현/시각 검수 미실행 |
| close / 노드 없음 | `src/components/Modal/Modal.tsx:150-151`; path `M4 4l8 8M12 4l-8 8` | viewBox 0 0 16 16; 선 currentColor/1.5/round; fill none; 회전 없음 | close 조합만(A 선택) | 다른 name/미지원 상태에서 대체하지 않음 | 원본 확인·Q-I01 A 선택 완료; 구현/시각 검수 미실행 |
| search / 노드 없음 | `src/components/Search/Search.tsx:89-93`; circle cx=7,cy=7,r=4.5; path `M10.5 10.5L14 14` | viewBox 0 0 16 16; 선 currentColor/1.5; path round; 회전 없음 | search 조합만(A 선택) | 다른 name/미지원 상태에서 대체하지 않음 | 원본 확인·Q-I01 A 선택 완료; 구현/시각 검수 미실행 |

파일 SHA-256(상위 파일 원본 추적, 자산 단독 해시라고 주장하지 않음):
- IconButton.stories.tsx: `e37a84148676b3f1b76fbe251ff7a80ddd6e261fd3c34fcefb6c04cc0799a963`.
- Modal.tsx: `b4af1eeafa48c7e3f51dd6fa79b764c432c914057b321d60ca9c7b19354aa2c9`.
- Search.tsx: `ffc03a2e549843c0475d9bb8df06e2994b44a118270544cc9e7c8c773fc28e3b`.

원본 정책(Q-I01·Q-I02 A 반영):

1. Q-I01 A에 따라 후속 구현 승인 후 위 정확한 geometry의 add/close/search만 스타터 자산으로 등록한다. 원본 출처를 JSDoc/계획·검수 증거에 남긴다. 기존 기준선 SVG이지 학생 Figma/공식 외부 세트 검수물이 아니다. AI가 “검색이면 보통 이런 그림”으로 새 path를 작성하지 않는다.
2. 학생 Figma에 같은 역할이 있으면 실제 원본 SVG/벡터·viewBox·stroke/fill·투명도·회전·state를 읽어 대응 asset을 교체한다. 이름만 같은 유사 아이콘·외부 라이브러리로 대체하지 않는다.
3. 새로운 name은 실제 원본을 확보하고 새 revision에 자산·API·노출 조건을 기록해 승인받은 뒤만 추가한다. 읽기 실패/없는 name은 차단하고 placeholder, 가장 가까운 glyph, 이모지로 메우지 않는다.
4. 외부 SVG 세트는 사용자가 출처/사용 조건을 확인해 명시적으로 채택한 경우에 별도 계획으로 검토한다. 이번 계획은 외부 패키지·아이콘 다운로드를 요구하지 않는다.
5. SVG 문자열을 img src나 dangerouslySetInnerHTML에 넣지 않고 확인된 벡터를 JSX로 옮긴다. script/onload 등 실행 요소·불필요한 export metadata를 표시 자산으로 가져오지 않는다. 원본 그림이 바뀌는 단순화/최적화는 별도 확인한다.
6. Q-I02 A로 채택한 범위는 단색 자산만이다. 학생 원본이 다색/gradient/image/mask라서 currentColor 규칙으로 보존할 수 없으면 **BLOCKED_INPUT/BLOCKED_POLICY**로 색 역할·표현 방식의 결정을 받는다. 단색으로 임의 변환하지 않는다.

## 7. 공개 API와 실제 기능

| prop / 이벤트 | 근거 | 기본값·허용값 | 실제 동작 / 결과 | 키보드·disabled 처리 | 사용자 확정 |
|---|---|---|---|---|---|
| name | 출처를 가진 닫힌 registry | 필수; 채택된 add/close/search. 기본 glyph 없음 | 승인 자산만 렌더. 잘못된 런타임 값은 명확한 오류로 차단; 조용한 대체 없음 | 조작 동작 없음 | Q-I01 A 선택 완료·rev2 검토 대기 |
| size | 4·5절 채택 layout 매핑 | md 기본; sm/md/lg | 단독 표시의 토큰 치수 적용 | 상태 아님 | Q-I02 A 선택 완료·rev2 검토 대기 |
| tone | 5절 채택 semantic 매핑 | inherit 기본; inherit/default/secondary | root의 currentColor 원천 선택 | 부모의 상태 색은 부모 계약 | Q-I02 A 선택 완료·rev2 검토 대기 |
| decorative | 장식/의미 구별 | true 기본 | true면 aria-hidden=true, role/aria-label 없음; false면 role=img와 label 이름 | 항상 focusable=false, tabIndex 없음 | Q-I02 A 선택 완료·rev2 검토 대기 |
| label | 의미 있는 그림의 이름 | decorative=false일 때 비어 있지 않은 string 필수; true일 때 제공하지 않음 | aria-label로 접근 이름 전달. 의미 모드의 빈 label 또는 장식 모드의 label은 A 선택안대로 런타임 오류로 명확히 차단 | label이 클릭 기능을 만들지 않음 | Q-I02 A 선택 완료·rev2 검토 대기 |
| ref | 실제 SVG 참조 | SVGSVGElement ref(A 선택안) | root SVG 참조 | 포커스 대상이 되는 API 아님 | A 세부안 반영·rev2 검토 대기 |
| children/이벤트/외관 우회 | registry·페이지 재사용 계약 | children·path/d·rawSVG·onClick·href·tabIndex·style·className은 첫 공개 API에서 제공하지 않음 | 페이지에서 임의 그림/동작을 재정의하지 않음 | 클릭은 Button/IconButton에 연결 | Q-I02 A 선택 완료·rev2 검토 대기 |

단순 IconProps interface로 public name/size/tone/label/decorative를 노출하고, 조건부 label 계약은 런타임에서도 검사한다. 타입으로 완전하게 강제하려고 카탈로그가 해석하지 못하는 props 루트 판별 유니온을 몰래 도입하지 않는다. 후속 구현 시 카탈로그가 실제 API를 지원하지 못하면 unsupported_api를 해결할 때까지 사용 자격을 부여하지 않는다.

조립 정책(Q-I02 A 반영):
- 단독 의미 그림은 `<Icon name="search" decorative={false} label="검색" />`처럼 이름을 제공한다. 이는 API 예시이며 학생 페이지에 검색 기능을 발명한 것이 아니다.
- IconButton 안에서는 `<Icon name="search" />`를 장식으로 두고 **IconButton label/onClick/disabled**가 이름·기능을 소유한다. 이름을 두 번 읽히게 하지 않는다. Link/문구 옆 중복 설명 그림도 장식으로 사용한다.
- `IconButton.css:24-26`, `:58`은 자식 SVG 렌더 크기를 슬롯에서 정한다. 이 조립에서는 IconButton.size가 실제 크기를 소유하므로 Icon.size로 슬롯을 덮어쓰지 않는다. 색도 inherit로 부모의 승인 semantic을 따른다. 실제 computed size/color로 확인한다.
- 부모가 Button/IconButton이면 네이티브 클릭·Tab·disabled를 검증하고, Icon에 클릭 handler를 달아 가짜 버튼을 만들지 않는다. 기존 부품의 공개 API로 되는 예만 사용한다.

카탈로그 반영(후속 구현): index.ts에서 Icon·IconProps 공개 → ds:docs의 실제 export/타입/정적 의존 파일 추출 → ds:catalog Icon → 사람의 source.kind=spec 검수 기록. 예시/자산명·size/tone/decorative scope와 label 조건·geometry 비교 증거를 연결한다. label 같은 무한 문자열은 현 review scope.props에 못 넣으므로 evidenceId 증거에 적는다(`.ds/catalog-review.example.json`). 최초 unverified, 실제 검수 후 approved_scope; 자산/코드/토큰 변경은 stale/재검수 대상이다. 별도 자산 파일로 나누면 정적 import 그래프에 포함되는지 확인한다. CATALOG.md·사람 검수 기록은 AI가 직접 수정하지 않는다.

### 학생 Figma 아이콘으로 교체하는 순서

1. 학생 화면에서 필요한 아이콘 역할과 현재 name의 대응표를 만든다. 기본 세트가 학생 디자인과 같다고 가정하지 않는다. 기존 name을 보존할지 이름/API를 변경할지 새 계획에서 명시한다.
2. 정확한 Figma 파일/노드와 SVG 원본을 읽고 vector·viewBox·색/alpha·strokeWidth·회전·크기·노출 상태를 기록한다. 실패·누락 상태는 질문으로 남기고 대체 그림을 생성하지 않는다.
3. 단색이면 semantic→currentColor 연결을 확인한다. 다색이거나 새 치수가 현재 size 토큰식과 다르면 단색화/근사치로 구현하지 않고 해당 API/토큰 결정을 사용자에게 받는다. 명시적으로 승인된 초기 치수를 학생의 실제 크기 계약으로 갱신한다.
4. 학생이 수정 계획을 승인한 뒤 기존 Icon 원본/registry에 실제 자산을 JSX로 교체하고 필요한 실제 name/props 유니온·stories·출처를 함께 갱신한다. 새 Icon2·페이지 전용 SVG 복제를 만들지 않는다. 이번 오더에서 기존 Modal/Search 등의 inline 자산을 전부 바꾸지는 않는다.
5. glyph 의미·parent 배경·크기·ARIA·기존 IconButton 클릭/Tab/disabled를 실제 렌더로 검수한다. `pnpm ai:check Icon`, `pnpm ai:verify Icon`, 타입·가드를 통과한 후 사람이 자산/상태 범위를 검수한다.
6. `pnpm ds:docs`와 `pnpm ds:catalog Icon`으로 새 코드·의존·토큰 해시를 확인하고 사람 검수 기록을 새 버전으로 갱신한다. 원본 파일만 교체하고 기존 approved_scope를 유지하지 않는다. glyph의 변경은 색 토큰 교체만으로 자동 처리되지 않으며 이 별도 절차를 따른다.

## 8. Q&A와 사용자 결정

2026-10-17 사용자 결정: 기본 Icon 제공·토큰 사용·학생 Figma 교체 원칙에 더해 Q-I01·Q-I02 모두 A 선택. add/close/search 저장소 원본과 아래 단색·접근성·토큰 계약을 채택했다. 근거는 팀 결정 기록와 팀 작업 지시서 Q-12 1절, 사용자 원문 “권고안 A로 일단 진행”이다.

| 질문 ID | 당시 미확정 항목 | 결정 반영 및 영향 | 사용자 답 / PL 지시 | 해결 상태 |
|---|---|---|---|---|
| Q-I01 | 기본 배포 자산 | A: 저장소의 정확한 add/close/search 3개를 starter 기본 자산으로 채택. 학생 자산만 받는 B는 이번 범위에서 선택하지 않음 | 사용자 “권고안 A로 일단 진행” (2026-10-17, DECISIONS.md·Q-12 1절) | 해결(A) |
| Q-I02 | 첫 API·크기·색·표현 범위 | A: name registry, sm/md/lg=spacing×3/4/5, inherit/default/secondary, 단색·장식/의미 label 검증 계약 채택. 다색·임의 SVG children·추가 치수는 제외 | 사용자 “권고안 A로 일단 진행” (2026-10-17, DECISIONS.md·Q-12 1절) | 해결(A) |
| Q-P01 (공통·사용자 질문 아님) | Figma 노드 URL 전용 승인 검사기는 채택 명세 경로를 아직 처리하지 못함(`scripts/lib/component-plan.mjs:9-15`, `:41`, `:77-78`) | starter/adopted-spec 출처와 승인·해시 검증의 지원을 별도 작업에서 보완·검증. 이 오더에서는 검사기 수정·가짜 Figma URL·hook 우회 없음 | PL 지시: Q-10 뒤 실행 세션 A에게 별도 배정(팀 작업 지시서 Q-12 1절) | 해결 — Q-13(3eb3560): `source_kind: starter-spec`, `source_ref` 지원·테스트 |
사용자 결정 질문과 PL 후속(Q-P01)이 모두 해결되어 `open_questions: 0`, `facts_complete: true` 다. 출처는 Figma 가 아니라 사용자가 채택한 스타터 명세이며 `source_kind: starter-spec`, `source_ref` 로 표시한다.

2026-10-17 사용자 원문 “권고안 A로 일단 진행”은 revision 1의 네 질문에 대한 A 선택 근거다. 팀 작업 지시서 Q-12 2·3절에 따라 **revision 2의 구현 승인은 아직 아니다**. 답변 표와 아래 검증 범위를 함께 갱신했으며 사용자에게 같은 결정을 다시 묻지 않는다.

## 9. 검증 계획

Q-I01 A의 add/close/search 정확한 원본과 Q-I02 A의 md/inherit/decorative=true 기본값·54개 조합이 대상이다. 세 name 모두 개별 story/geometry 검사에 포함하고, 선택 완료를 구현/접근성 검사 통과로 표시하지 않는다.

| 확인 대상 | 원본의 기대 결과(A 선택 반영·구현/검수 미실행) | 검사 방법 | 완료 증거 |
|---|---|---|---|
| 기본 상태와 캔버스 배경 | 필수 name add/close/search 각각, md/inherit/장식; 투명 fill/부모 색 구분 | 전체 iframe computed size/color/background, vector/source 대조 | 미실행 |
| 모든 상태·크기 | 54개 정적 조합; 정확한 12/16/20은 현재 spacing에서만, 토큰 변경 시 식과 일치 | Assets/Sizes/Tones/Meaningful/Matrix stories의 실제 props·computed style 검사 | 미실행 |
| 아이콘과 노출 조건 | 원본 path·circle·strokeWidth·회전·viewBox 보존; 다른 name 대체 없음 | DOM geometry/해시·스크린샷·원본 코드/승인 자산 대조 | 미실행 |
| 접근 이름 | 장식은 aria-hidden=true, meaningful은 img 역할+label; 이름 중복 없음 | play에서 getByRole/queryByRole 및 aria-hidden/aria-label/focusable 검사 | 미실행 |
| 잘못된 입력 | 미등록 name·의미 모드 빈 label·장식 모드 label을 차단 | 타입/격리된 오류 검증으로 명확한 실패 확인. 정상 story에 예기치 않은 렌더 오류를 남기지 않음 | 미실행 |
| 클릭·disabled·Tab | Icon 자체 정적; 기존 IconButton의 callback 호출 및 disabled 미호출, Tab 한 번 | 통합 play에 기존 IconButton label+fn 콜백을 주고 click/Tab 검사. CSS 상태는 실제 포인터 별도 확인 | 미실행 |
| IconButton 조립 | 부모 슬롯 치수/semantic을 따르고 SVG가 클릭 역할을 소유하지 않음 | 부모 size별 computed width/height/color와 실제 접근 이름 대조 | 미실행 |
| 공통 규칙·사용처 | 토큰/자산 경계 준수, 생성물 직접 편집·기존 inline SVG 일괄 변경 없음 | 타입·가드·diff·출처 대조 | 미실행 |
| 카탈로그 | 실제 name union·접근성 제약·해시·검수 범위 연결 | ds:docs·ds:catalog Icon, 최초 unverified와 변경 후 stale 대조 | 미실행 |

`Icon.stories.tsx`는 Components/Icon, autodocs, 실제 기본 세트와 확정된 size/tone/접근성 조합만 사용한다. 이들은 Figma Hover 시각 변형이 아니라 채택 명세의 정적/의미 계약이다. 미승인 자산을 story에 새로 그리지 않는다. Icon 자체 클릭 fn은 없고 통합 예에서 부모 IconButton의 실제 클릭을 검증한다. 기존 IconButton의 시각 변경을 추가하지 않는다.

후속 승인 구현의 필수 명령: `pnpm ai:check Icon`, `pnpm ai:verify Icon`, `pnpm typecheck`, `pnpm ds:guard`. 추가로 `pnpm ds:docs`, `pnpm ds:catalog Icon`. 실제 원본 대조·키보드·인간 검수는 명령 통과와 별개다. 이번 계획 단계에서는 실행하지 않았다.

## 10. 사용자 검토

- revision 2 작성 근거: Q-12 및 DECISIONS.md의 네 질문 모두 A 답변. Icon에서는 Q-I01·Q-I02가 해결됐고 기본 glyph·크기·색·접근성 계약이 결정됐다. 사용자 결정은 0개 남음.
- 현재 상태: `approved`, revision 2. 사용자가 이 revision 의 최종 승인을 명시했고 PL 이 그 말을 기록했다(아래 승인 기록).
- 구현 전제 해결: Q-P01 은 Q-13(3eb3560)에서 해결됐다. 구현 직전 최신 토큰·원본 자산의 동일성은 구현 세션이 다시 확인한다.
- 구현 전 조건: 사용자의 revision 2 명시적 승인, 실행 세션 A의 채택 명세 승인 검사기 보완·검증 완료, 실제 구현 직전 최신 원본/토큰의 동일성 재확인. 기존 세 자산과 토큰 해시는 이번 revision 작성 시 다시 확인했다.
- 학생 Figma 자산만 기다리는 대안은 Q-I01 A로 선택되지 않았으므로 기본 세트에 대한 입력 누락 질문은 닫는다. 실제 학생 교체에서 새 원본이 누락되면 그 작업만 별도 입력 차단으로 처리한다. 현재 Q-P01은 BLOCKED_POLICY이며 이 오더에서 우회·수정하지 않는다.

## 11. 승인 기록

- 2026-10-17 사용자 결정: Q-T01·Q-T02·Q-I01·Q-I02 모두 권고안 A — "권고안 A로 일단 진행".
- 2026-10-17 사용자 최종 승인(revision 2): "최종 승인은 일단 너의 추천으로 진행해도 될 것 같아".
- 기록자: PL 세션(사용자 말을 옮겨 적음. AI 자체 승인이 아니다). 근거: 팀 결정 기록.

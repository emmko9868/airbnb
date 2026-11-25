import { isValidElement } from "react";
import type { Locale } from "../lib/i18n";

/**
 * story 예시 데이터의 한국어판.
 *
 * 예시 데이터(components.baseline.json 의 sampleArgs)는 영어로 적혀 있다 — 학생 기본 언어가 영어라서
 * Controls 패널에도 영어가 보여야 한다. 언어를 KO 로 바꾸면 Storybook decorator 가 args 안의 문자열을
 * 이 표로 바꿔 그린다. 표에 없는 글자(사용자가 Controls 에서 직접 고친 값 등)는 그대로 둔다 — 사람이 친
 * 글자를 바꾸면 안 된다.
 *
 * sampleArgs 에 새 문장을 넣으면 여기에도 한 줄 넣는다. 빠뜨리면 KO 화면에 영어가 남고,
 * 한국어 이름으로 찾는 `pnpm ds:verify-interact` 검사가 잡는다.
 */
export const SAMPLE_KO: Record<string, string> = {
  "Add": "추가",
  "Learn more about token tiers": "토큰 계층 자세히 보기",
  "Token name": "토큰 이름",
  "e.g. color-primary": "예: color-primary",
  "Use kebab-case": "kebab-case 로 적습니다",
  "Reason for change": "변경 사유",
  "A note for reviewers": "리뷰어가 읽을 설명",
  "Saved together with the lock diff": "lock 비교 결과와 함께 남습니다",
  "Apply reviewed tokens only": "검토가 끝난 토큰만 반영",
  "Stack to generate": "생성할 스택",
  "Plain CSS": "순수 CSS",
  "Stack": "스택",
  "Design system": "디자인 시스템",
  "Design tokens": "디자인 토큰",
  "AI descriptions": "AI 설명 보강",
  "16 semantic tokens": "Semantic 토큰 16개",
  "Role tokens that point to primitives. Components reference only this tier.": "primitive 를 가리키는 역할 토큰입니다. 컴포넌트는 이 층만 참조합니다.",
  "Apply these changes?": "변경 사항을 적용할까요?",
  "19 tokens will change. You can undo this.": "토큰 19개가 바뀝니다. 되돌릴 수 있습니다.",
  "Apply changes": "변경 사항 적용",
  "19 tokens updated": "토큰 19개가 갱신됐습니다",
  "4 items need review.": "검토 필요 항목이 4건 있습니다.",
  "Resolving tokens": "토큰을 해석하는 중",
  "Overview": "개요",
  "One panel per tab. Use the arrow keys to move between tabs.": "탭 하나당 패널 하나. 화살표 키로 이동합니다.",
  "Tokens": "토큰",
  "References semantic tokens only.": "semantic 토큰만 참조합니다.",
  "Policy": "정책",
  "Guards G1–G16 check this.": "가드 G1~G16 가 검사합니다.",
  "What are the three tiers?": "3계층이란",
  "Hexcode → Primitive → Semantic. Developers use Semantic only.": "Hexcode → Primitive → Semantic. 개발자는 Semantic 만 씁니다.",
  "When a tier is missing": "계층이 없으면",
  "Whatever exists is used; missing tiers are generated.": "있는 만큼 쓰고 없는 층은 만들어 냅니다.",
  "How are guesses marked?": "추측은 어떻게 표시되나",
  "Every value carries its source, confidence and reason.": "모든 값에 출처·신뢰도·근거가 붙습니다.",
  "Only semantic tokens may be referenced": "semantic 토큰만 참조할 수 있습니다",
  "Token rules": "토큰 규칙",
  "Search tokens": "토큰 검색",
  "Search by token name": "토큰 이름으로 검색",
  "Tiers to generate": "생성할 tier",
  "Items per page": "페이지당 항목",
  "Publish date": "발행일",
  "Sync time": "동기화 시각",
  "Match the library publish time": "라이브러리 발행 시점에 맞추세요",
  "Choose ds-source.json": "ds-source.json 선택",
  "Design data exported from Figma": "Figma에서 내보낸 디자인 데이터",
  "Confidence threshold": "신뢰도 기준",
  "Anything below this goes to review": "이 값 미만은 검토 목록으로",
  "Token resolution": "토큰 해석",
  "Read Figma": "Figma 읽기",
  "Collected via MCP": "MCP로 수집",
  "Resolve three tiers": "3계층 해석",
  "L2a — semantic inferred": "L2a — semantic 추론",
  "Review": "검토",
  "35 inferred": "추론 35건",
  "Apply": "반영",
  "Reading Figma": "Figma 를 읽는 중",
  "Components": "컴포넌트",
  "Regenerate": "다시 생성",
  "Compare changes": "변경 비교",
  "Delete component": "컴포넌트 삭제",
  "Token info": "토큰 정보",
  "This value was inferred. Reason: highest contrast against primary (4.6:1).": "이 값은 추론된 것입니다. 근거: primary 대비 4.6:1 로 최대",
  "About token tiers": "토큰 계층 도움말",
  "Components may reference only semantic and layout tokens.": "컴포넌트는 semantic 과 layout 토큰만 참조할 수 있습니다.",
  "Source": "출처",
  "Confidence": "신뢰도",
  "Inferred": "추론",
  "Declared": "선언",
  "Token list": "토큰 목록",
  "Needs review": "검토 필요",
  "Inferred 0.40": "추론 0.40",
  "Inferred 0.55": "추론 0.55",
  "Synthesized 0.30": "합성 0.30",
  "Token tiers": "토큰 계층",
};

/** args 안의 문자열을 깊이 바꾼다. React 요소(아이콘 등)와 함수는 건드리지 않는다. */
export function translateArgs<T>(value: T, locale: Locale): T {
  if (locale !== "ko") return value;
  const walk = (v: unknown): unknown => {
    if (typeof v === "string") return SAMPLE_KO[v] ?? v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object" && !isValidElement(v) && Object.getPrototypeOf(v) === Object.prototype) {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
    }
    return v;
  };
  return walk(value) as T;
}

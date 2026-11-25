/**
 * 사이드바 이름의 영어판. Storybook 의 title·story 이름은 파일에 고정되어 있어
 * 언어를 바꾸면 manager(.storybook/manager.ts)가 이 표로 바꿔 보여 준다.
 *
 * React 를 쓰지 않는다 — manager 번들에서도 그대로 불러 쓴다.
 */
export const SIDEBAR_EN: Record<string, string> = {
  "컴포넌트": "Components",
  "카탈로그": "Catalog",
  "토큰 계층": "Token tiers",
  "처음 보기": "Start here",
  "토큰의 3계층": "The three token tiers",
  "Figma에서 가져오기": "Import from Figma",
  "색상표": "Palette",
  "색의 역할": "Color roles",
  "크기와 간격": "Size and spacing",
  "확인할 것": "Needs review",
  "정책": "Policy",
  "소유권": "Ownership",
  "가드 규칙": "Guard rules",
  "동기화 정책": "Sync policy",
  "포커스 유지": "Focus retention",
};

/** 영어로 지은 title·story 이름(Foundation 화면)의 한국어판. */
export const SIDEBAR_KO: Record<string, string> = {
  "Overview": "개요",
  "Color": "색",
  "Primitive": "Primitive (색상표)",
  "Semantic": "Semantic (역할)",
  "Component": "Component (부품 전용)",
  "Figma import": "Figma 가져오기",
  "Typography": "글자",
  "Spacing": "간격",
  "Elevation": "그림자",
  "Motion": "움직임",
  "Icons": "아이콘",
};

export function sidebarLabel(name: string, locale: string): string {
  return locale === "en" ? (SIDEBAR_EN[name] ?? name) : (SIDEBAR_KO[name] ?? name);
}

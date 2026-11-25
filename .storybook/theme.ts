import { create } from "storybook/internal/theming/create";

/**
 * Storybook 화면(사이드바·툴바·문서 페이지)을 검정 바탕으로 칠한다.
 * 부품 미리보기는 이 테마가 아니라 디자인의 배경색(--color-bg)을 따른다 — docs.css 참고.
 * 검정 위에 그리면 어두운 글자를 쓰는 부품이 보이지 않아 검수할 수 없다.
 */
export const dsTheme = create({
  base: "dark",
  brandTitle: "DS Starter",
  colorPrimary: "#2E81FF",
  colorSecondary: "#2E81FF",
  appBg: "#000000",
  appContentBg: "#0A0A0A",
  appPreviewBg: "#000000",
  appBorderColor: "#27272A",
  appBorderRadius: 8,
  barBg: "#000000",
  barTextColor: "#A1A1AA",
  barSelectedColor: "#FAFAFA",
  barHoverColor: "#FAFAFA",
  textColor: "#FAFAFA",
  textInverseColor: "#18181B",
  textMutedColor: "#A1A1AA",
  inputBg: "#18181B",
  inputBorder: "#3F3F46",
  inputTextColor: "#FAFAFA",
  inputBorderRadius: 6,
  fontBase: "system-ui, -apple-system, 'Segoe UI', sans-serif",
});

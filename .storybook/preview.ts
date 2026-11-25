import { createElement } from "react";
import type { Preview } from "@storybook/react";
import { addons } from "storybook/internal/preview-api";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { DsLocaleProvider, setLocale } from "../src/lib/i18n";
import type { Locale } from "../src/lib/i18n";
import { translateArgs } from "../src/i18n/samples";
import "../src/tokens/tokens.css"; // `pnpm ds:tokens` 산출물
import "./docs.css";
import { dsTheme } from "./theme";
import { registerFonts } from "../src/assets/fonts";

// my-assets/typo 의 글꼴을 등록한다. 웹사이트(src/main.tsx)도 같은 함수로 등록한다.
registerFonts();

// 기본 언어는 영어다. 헤더에서 KO 를 고르면 한국어로 바뀐다.
const localeOf = (value: unknown): Locale => (value === "ko" ? "ko" : "en");

// decorator 를 거치지 않는 문서도 언어를 따르도록, 툴바에서 바꾼 언어를 채널에서
// 받아 전역 값에 넣어 둔다(useLocale 은 Provider 가 없으면 이 값을 쓴다).
// preview 가 보낸 이벤트도 같은 채널의 리스너에게 전달되므로 처음 값(SET_GLOBALS)도 받는다.
const channel = addons.getChannel();
const applyGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
  if (!globals || !("locale" in globals)) return;
  const locale = localeOf(globals.locale);
  setLocale(locale);
  document.documentElement.lang = locale; // 낭독기가 올바른 언어로 읽도록
};
channel.on(SET_GLOBALS, applyGlobals);
channel.on(GLOBALS_UPDATED, applyGlobals);

const preview: Preview = {
  // 헤더(툴바)의 언어 선택. 고른 값은 URL(`globals=locale:en`)에 남아 링크로 공유된다.
  globalTypes: {
    locale: {
      description: "Language · 언어",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "en", right: "EN", title: "English" },
          { value: "ko", right: "KO", title: "한국어" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: "en" },
  decorators: [
    // story 는 Provider 로 감싸 컴포넌트 문구를 맞추고, 예시 데이터(args)도 같은 언어로 바꾼다.
    (Story, context) => {
      const locale = localeOf(context.globals.locale);
      return createElement(DsLocaleProvider, { locale }, createElement(Story, { args: translateArgs(context.args, locale) }));
    },
  ],
  parameters: {
    docs: { theme: dsTheme },
    controls: { matchers: { color: /(background|color)$/i } },
    options: {
      // Figma 계층과 같은 순서로 보이게 한다.
      storySort: {
        order: [
          "Overview",
          "Foundation",
          ["Overview", "Color", ["Primitive", "Semantic", "Component", "Figma import"], "Typography", "Spacing", "Elevation", "Motion", "Icons"],
          "Components",
          "Policy",
        ],
      },
    },
  },
};

export default preview;

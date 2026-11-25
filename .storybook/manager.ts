import { addons } from "storybook/internal/manager-api";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { sidebarLabel } from "../src/i18n/sidebar";
import { dsTheme } from "./theme";

/**
 * 사이드바 이름을 헤더에서 고른 언어(globals.locale)에 맞춘다.
 *
 * title·story 이름은 파일에 고정되어 있어 표(src/i18n/sidebar.ts)로 바꿔 보여 준다.
 * renderLabel 은 브라우저 탭 제목에도 쓰이므로 문자열을 돌려준다.
 */

// 처음 값: 매니저 URL 의 `globals=locale:ko`. 없으면 영어이고, preview 가 SET_GLOBALS 로 알려 준다.
const fromUrl = new URLSearchParams(window.location.search).get("globals") ?? "";
let locale = /(?:^|;)locale:(en|ko)(?:;|$)/.exec(fromUrl)?.[1] ?? "en";

addons.setConfig({
  theme: dsTheme,
  sidebar: {
    renderLabel: (item) => sidebarLabel(item.name, locale),
  },
});

addons.register("ds-starter/locale", (api) => {
  const update = ({ globals }: { globals?: Record<string, unknown> }) => {
    const next = globals?.locale === "en" ? "en" : globals?.locale === "ko" ? "ko" : null;
    if (!next || next === locale) return;
    locale = next;
    // 사이드바는 인덱스가 바뀔 때만 다시 그려진다. 항상 참인 필터를 새로 걸어 다시 그리게 한다.
    api.experimental_setFilter("ds-starter/locale", () => true);
  };
  api.on(SET_GLOBALS, update);
  api.on(GLOBALS_UPDATED, update);
});

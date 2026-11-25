import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DsLocaleProvider } from "./lib/i18n";
import config from "../web.config.json";
import "./tokens/tokens.css";
import { registerFonts } from "./assets/fonts";

// 웹사이트는 실제로 쓰는 글꼴만 브라우저가 내려받는다.
registerFonts({ preload: false });

const root = document.getElementById("root");
if (!root) throw new Error("웹 앱 root 요소를 찾을 수 없습니다.");

createRoot(root).render(
  <StrictMode>
    <DsLocaleProvider locale={config.locale === "ko" ? "ko" : "en"}>
      <App />
    </DsLocaleProvider>
  </StrictMode>,
);

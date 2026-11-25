import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { escapeHtml, readWebProject, webPageModule } from "./scripts/lib/web-project.mjs";

export default defineConfig(({ isPreview }) => {
  const root = fileURLToPath(new URL(".", import.meta.url));
  // preview는 이미 만들어진 dist만 제공한다. dev/build에서는 실제 페이지를 확인한다.
  const web = isPreview ? null : readWebProject(root);
  return {
    appType: "spa",
    plugins: [
      tailwindcss(),
      {
        name: "approved-page-entry",
        resolveId(id) { if (id === "virtual:ds-page") return "\0virtual:ds-page"; },
        load(id) {
          if (id === "\0virtual:ds-page" && web) return webPageModule(web);
        },
        transformIndexHtml(html) {
          if (!web) return html;
          return html.replaceAll("__WEB_TITLE__", escapeHtml(web.title)).replaceAll("__WEB_LOCALE__", web.locale);
        },
      },
    ],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    build: { outDir: "dist", emptyOutDir: true },
    server: { host: "127.0.0.1" },
    preview: { host: "127.0.0.1" },
  };
});

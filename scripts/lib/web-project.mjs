import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { PAGES_DIR, pageEntry } from "./site-paths.mjs";

export function readWebProject(root) {
  let config;
  try { config = JSON.parse(readFileSync(resolve(root, "web.config.json"), "utf8")); }
  catch { throw new Error("Cannot read web.config.json. Check the website settings."); }
  if (![1, 2].includes(config.schema_version)) throw new Error("schema_version in web.config.json must be 1 or 2.");
  if (config.schema_version === 2) {
    if (!Array.isArray(config.pages) || !config.pages.length) throw new Error("List the approved pages under pages in web.config.json.");
    const names = new Set(), paths = new Set();
    const pages = config.pages.map((page) => {
      if (!page || !/^[A-Z][A-Za-z0-9]*$/.test(page.name) || names.has(page.name) || typeof page.path !== "string" || !/^\/(?:[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)?$/.test(page.path) || paths.has(page.path) || page.entry !== pageEntry(page.name)) throw new Error("A page under pages in web.config.json has a wrong or repeated name, path or entry.");
      if (page.title !== undefined && (typeof page.title !== "string" || !page.title.trim() || /[\u0000-\u001f]/.test(page.title))) throw new Error(`The title of ${page.name} in web.config.json must be the page title the user confirmed, or left out.`);
      names.add(page.name); paths.add(page.path);
      return { ...page, entryPath: checkedEntry(root, page.entry) };
    });
    if (!paths.has("/")) throw new Error("pages in web.config.json needs a page with the / path.");
    if (config.routes !== undefined && (!Array.isArray(config.routes) || JSON.stringify([...new Set(config.routes)].sort()) !== JSON.stringify([...paths].sort()))) throw new Error("routes and the paths under pages in web.config.json must match.");
    checkedSite(config);
    return { ...config, pages, routes: [...paths] };
  }
  const entry = checkedEntry(root, config.entry);
  checkedSite(config);
  const routes = config.routes ?? [];
  if (!Array.isArray(routes) || routes.some((route) => typeof route !== "string" || !/^\/(?:[A-Za-z0-9_:-]+(?:\/[A-Za-z0-9_:-]+)*\/?)?$/.test(route))) throw new Error("routes in web.config.json must be a list of URL paths the user confirmed. Example: [\"/login\"].");
  return { ...config, routes: [...new Set(routes)], entryPath: entry };
}

function checkedEntry(root, entryName) {
  const config = { entry: entryName };
  if (typeof config.entry !== "string" || !new RegExp(`^${PAGES_DIR}/(?:[A-Za-z0-9_.-]+/)*[A-Za-z0-9_.-]+\\.tsx$`).test(config.entry) || config.entry.endsWith(".stories.tsx") || config.entry.split("/").some((part) => part === "." || part === "..")) {
    throw new Error("No web page is connected yet. This kit already has page addresses (routes): pnpm ds:page docs/plans/pages/<Site>.md makes the pages and their addresses from your approved page plan. Do not add a router or a second app.");
  }
  const entry = resolve(root, config.entry);
  if (!existsSync(entry)) throw new Error(`Web page file not found: ${config.entry}`);
  const pages = resolve(root, PAGES_DIR);
  if (realpathSync(pages) !== resolve(realpathSync(root), PAGES_DIR)) throw new Error(`${PAGES_DIR} must be a real folder inside the project.`);
  const inside = relative(realpathSync(pages), realpathSync(entry));
  if (isAbsolute(inside) || inside === ".." || inside.startsWith(`..${sep}`) || dirname(entry) === root) {
    throw new Error(`The web page must be a real file inside ${PAGES_DIR}.`);
  }
  return entry;
}

function checkedSite(config) {
  if (typeof config.title !== "string" || !config.title.trim() || /[\u0000-\u001f]/.test(config.title)) {
    throw new Error("Set title in web.config.json to the website title the user confirmed.");
  }
  if (!["ko", "en"].includes(config.locale)) throw new Error("Set locale in web.config.json to ko or en.");
}

export function webPageModule(web) {
  if (web.schema_version === 1) return `export { default } from ${JSON.stringify(web.entryPath)};`;
  return `import { createElement } from "react";\n${web.pages.map((p, i) => `import Page${i} from ${JSON.stringify(p.entryPath)};`).join("\n")}\nconst pages = {${web.pages.map((p, i) => `${JSON.stringify(p.path)}: Page${i}`).join(",")}};\nconst titles = ${JSON.stringify(Object.fromEntries(web.pages.filter((p) => p.title !== undefined).map((p) => [p.path, p.title])))};\nexport default function SitePages() { const path = window.location.pathname.replace(/\\/+$/, "") || "/"; if (Object.hasOwn(titles, path)) document.title = titles[path]; const Page = Object.hasOwn(pages, path) ? pages[path] : null; return Page ? createElement(Page) : null; }`;
}

export const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

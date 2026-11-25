/** 사이트 계획의 결정적 계약. JSON 블록은 실행 코드가 아니라 승인할 데이터다. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { readPlanDocument, requirePlanApproval, validComponentName } from "./component-plan.mjs";

const text = (x) => typeof x === "string" && x.trim().length > 0;
const object = (x) => x && typeof x === "object" && !Array.isArray(x);
const id = (x) => /^[a-z][a-z0-9-]*$/.test(x);
const imageName = (x) => typeof x === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
const imageFile = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.(?:png|jpe?g|webp|gif|avif|svg)$/i;
export { PAGES_DIR, pageEntry } from "./site-paths.mjs";
import { pageEntry } from "./site-paths.mjs";
export const staticRoute = (path) => typeof path === "string" && /^\/(?:[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*)?$/.test(path);
function need(ok, message) { if (!ok) throw new Error(`Page plan: ${message}`); }
function keys(value, allowed) { need(object(value) && Object.keys(value).every((key) => allowed.includes(key)), `Unsupported fields: ${Object.keys(value ?? {}).filter((key) => !allowed.includes(key)).join(", ")}`); }
function requirePagePlanApproval(plan) {
  need(!/\|\s*(?:unanswered|undecided|open|미답변|미확정)\s*(?=\|)/im.test(plan.content), "A table still has an unanswered or undecided item. Changing metadata alone is not approval.");
  return requirePlanApproval(plan);
}
export function eachUse(page, visit) {
  const walk = (use) => {
    if (Object.hasOwn(use, "image")) return;
    visit(use);
    for (const child of use.children ?? []) if (typeof child !== "string") walk(child);
  };
  for (const section of page.sections) section.items.forEach(walk);
}

export function eachImage(page, visit) {
  const walk = (item) => {
    if (Object.hasOwn(item, "image")) { visit(item); return; }
    for (const child of item.children ?? []) if (typeof child !== "string") walk(child);
  };
  for (const section of page.sections) section.items.forEach(walk);
}

function availableImages(root) {
  const dir = join(root, "my-assets/images");
  const names = new Set();
  for (const entry of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
    const match = entry.isFile() && entry.name.match(imageFile);
    if (match) names.add(match[1]);
  }
  return names;
}

export function readPagePlan(root, filename, { approved = true } = {}) {
  const plan = readPlanDocument(root, filename, "pages");
  need(plan.metadata.kind === "page" && validComponentName(plan.metadata.site), "Needs kind: page and a PascalCase site name.");
  need(relative(root, plan.path).split("\\").join("/") === `docs/plans/pages/${plan.metadata.site}.md`, "The plan path must be docs/plans/pages/<Site>.md.");
  need(text(plan.metadata.source_ref), "Write the source in source_ref: a Figma screen or the chosen screen spec.");
  const blocks = [...plan.content.matchAll(/^```page-spec\r?\n([\s\S]*?)^```\s*$/gm)];
  need(blocks.length === 1, "Needs exactly one page-spec JSON block.");
  let spec;
  try { spec = JSON.parse(blocks[0][1]); } catch { throw new Error("Page plan: cannot read the page-spec JSON."); }
  keys(spec, ["title", "locale", "catalog", "pages"]);
  need(text(spec.title) && !/[\u0000-\u001f]/.test(spec.title) && ["ko", "en"].includes(spec.locale), "Set the title and the language (ko or en).");
  need(Array.isArray(spec.pages) && spec.pages.length > 0, "Needs a list of pages.");
  need(object(spec.catalog), "In catalog, write the current version hashes of the parts you use.");
  const images = availableImages(root);
  for (const [name, hashes] of Object.entries(spec.catalog)) {
    keys(hashes, ["codeHash", "cssHash", "dependencyHash", "tokensHash"]);
    need(validComponentName(name) && ["codeHash", "cssHash", "dependencyHash", "tokensHash"].every((key) => /^[a-f0-9]{64}$/.test(hashes[key] ?? "")), "catalog needs the 4 version hashes from the real catalog.");
  }
  const names = new Set(), paths = new Set();
  for (const page of spec.pages) {
    keys(page, ["name", "path", "title", "evidence", "responsive", "sections", "layout", "media"]);
    need(page.title === undefined || (text(page.title) && !/[\u0000-\u001f]/.test(page.title)), "A page title (title) must be the exact browser-tab text, or leave it out to use the site title.");
    need(validComponentName(page.name) && !page.name.endsWith("Page") && !names.has(page.name), "Each page needs its own name, without the word Page at the end."); names.add(page.name);
    need(staticRoute(page.path) && !paths.has(page.path), "Each page needs its own fixed URL path. Dynamic parameters and a slash at the end are not supported."); paths.add(page.path);
    need(text(page.evidence) && text(page.responsive), "Fill in the screen/behavior source (evidence) and the responsive note.");
    need(Array.isArray(page.sections) && page.sections.length > 0, "Needs a list of sections.");
    const sections = new Set(), items = new Set(), imageIds = new Set();
    for (const section of page.sections) {
      keys(section, ["id", "tag", "items", "bindings"]);
      need(id(section.id) && !sections.has(section.id) && section.id !== "root", "Each section needs its own id, and it cannot be root."); sections.add(section.id);
      need([undefined, "section", "div", "form"].includes(section.tag) && Array.isArray(section.items) && section.items.length > 0, "Check the section tag/items.");
      if (section.bindings !== undefined) {
        need(section.tag === "form" && object(section.bindings), "Section events work only on a form: onSubmit/onReset.");
        for (const [prop, binding] of Object.entries(section.bindings)) {
          keys(binding, ["name", "purpose"]);
          need(["onSubmit", "onReset"].includes(prop) && /^[a-z][A-Za-z0-9]*$/.test(binding.name) && text(binding.purpose), "Write the name and purpose of each form binding.");
        }
      }
    }
    const validateItem = (item) => {
      need(object(item), "Each section item and nested child must be text, a catalog part, or an image.");
      if (Object.hasOwn(item, "image")) {
        keys(item, ["id", "image", "alt"]);
        need(id(item.id) && item.id !== "root" && !sections.has(item.id) && !items.has(item.id), "Each image needs its own kebab-case id, different from root and section ids."); items.add(item.id); imageIds.add(item.id);
        need(imageName(item.image), "Image names must be kebab-case names from my-assets/images, not URLs or file paths.");
        need(images.has(item.image), `Image "${item.image}" was not found in my-assets/images. Run pnpm assets and use the exact name, or remove the image from the plan.`);
        need(typeof item.alt === "string" && (item.alt === "" || text(item.alt)) && !/[\u0000-\u001f]/.test(item.alt), `Image "${item.image}" needs an explicit alt string. Use meaningful text, or "" only when the image is decorative.`);
        return;
      }
      keys(item, ["id", "component", "props", "bindings", "children", "states"]);
      need(id(item.id) && !items.has(item.id) && validComponentName(item.component), "Each part needs its own id and a catalog name."); items.add(item.id);
      need(Object.hasOwn(spec.catalog, item.component), `No catalog version for ${item.component}.`);
      need(object(item.props) && (item.bindings === undefined || object(item.bindings)), "props must be a JSON object. bindings is an optional object.");
      need([...Object.keys(item.props), ...Object.keys(item.bindings ?? {})].every((key) => /^[A-Za-z][A-Za-z0-9-]*$/.test(key)), "Prop names must be public JSX attribute names.");
      for (const [prop, binding] of Object.entries(item.bindings ?? {})) {
        keys(binding, ["name", "purpose"]);
        need(/^[a-z][A-Za-z0-9]*$/.test(binding.name) && text(binding.purpose) && !Object.hasOwn(item.props, prop), "Each binding needs a name and a purpose (what it does or what data it holds).");
      }
      need(item.children === undefined || Array.isArray(item.children), "children must be a list of text, nested parts or images.");
      need(!(Object.hasOwn(item.props, "children") || Object.hasOwn(item.bindings ?? {}, "children")) || !item.children?.length, "Pass children only one way.");
      need(Array.isArray(item.states) && item.states.length > 0 && item.states.every(text), "Needs a list of states to review.");
      for (const child of item.children ?? []) {
        need(typeof child === "string" || object(child), "Each child must be text, a catalog part, or an image.");
        if (typeof child !== "string") validateItem(child);
      }
    };
    for (const section of page.sections) for (const item of section.items) validateItem(item);
    need(page.media === undefined || Array.isArray(page.media), "media must be a list of breakpoints.");
    for (const media of page.media ?? []) { keys(media, ["minWidth", "layout"]); need(Number.isInteger(media.minWidth) && media.minWidth > 0 && media.minWidth < 10000, "Give a valid breakpoint (minWidth)."); }
    page.layout ??= {};
    for (const layout of [page.layout, ...(page.media ?? []).map((m) => m.layout)]) {
      need(object(layout) && Object.keys(layout).every((s) => s === "root" || sections.has(s) || imageIds.has(s)), "layout can only name root, sections or image ids from the plan.");
    }
  }
  need(paths.has("/"), "The site needs a / page.");
  if (approved) requirePagePlanApproval(plan);
  return { ...plan, spec };
}

export function findPagePlan(root, name, { approved = true } = {}) {
  need(validComponentName(name), "Check the page name.");
  const dir = join(root, "docs/plans/pages");
  const matches = [], matchingErrors = [];
  for (const file of existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".md")) : []) {
    // 형식이 깨진 계획은 승인 근거로 사용하지 않는다.
    const path = join(dir, file);
    try { const plan = readPagePlan(root, path, { approved: false }); if (plan.spec.pages.some((p) => p.name === name)) matches.push(plan); }
    catch (error) {
      // 대상 페이지가 든 계획이라면 "계획 없음"으로 숨기지 말고 실제 검증 오류를 돌려준다.
      try {
        const block = [...readFileSync(path, "utf8").matchAll(/^```page-spec\r?\n([\s\S]*?)^```\s*$/gm)];
        const spec = block.length === 1 ? JSON.parse(block[0][1]) : null;
        if (spec?.pages?.some((page) => page?.name === name)) matchingErrors.push(error);
      } catch {}
    }
  }
  if (matches.length === 0 && matchingErrors.length === 1) throw matchingErrors[0];
  need(matches.length === 1, `${name} has no page plan, or more than one. Use docs/templates/page-plan.md to check the target and Q&A.`);
  if (approved) requirePagePlanApproval(matches[0]);
  return matches[0];
}

export function pagePendingReason(root, name) {
  try { findPagePlan(root, name); return null; } catch (error) { return error.message; }
}

const layoutProperties = new Set(["display", "grid-template-columns", "grid-template-rows", "grid-auto-flow", "grid-column", "grid-row", "flex-direction", "flex-wrap", "flex", "flex-grow", "flex-shrink", "align-items", "align-content", "align-self", "justify-content", "justify-items", "gap", "row-gap", "column-gap", "padding", "padding-inline", "padding-block", "margin", "margin-inline", "margin-block", "width", "min-width", "max-width", "height", "min-height", "max-height", "overflow", "position", "inset", "top", "right", "bottom", "left", "order"]);
export function pageCss(root, page) {
  const tokens = new Set([...readFileSync(join(root, "src/tokens/tokens.css"), "utf8").matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const render = (layout) => Object.entries(layout).map(([section, declarations]) => {
    need(object(declarations), "Layout must be an object of CSS properties and values.");
    const rows = Object.entries(declarations).map(([property, value]) => {
      need(layoutProperties.has(property) && typeof value === "string" && /^[\w\s().,%*/+\-]+$/.test(value), `Only layout properties/values are allowed: ${property}`);
      need(!/\b(?:\d*\.)?\d+(?:px|rem|em|vh|vw|vmin|vmax|pt|cm|mm)\b/i.test(value), `${property}: use a Layout token for lengths.`);
      if (/^(?:gap|row-gap|column-gap|padding(?:-.*)?|margin(?:-.*)?|inset|top|right|bottom|left)$/.test(property)) {
        need(!value.includes("%") && (!/\d/.test(value) || /var\(/.test(value) || /^0(?:\s+0)*$/.test(value)), `${property}: use a Layout token instead of a spacing value.`);
      }
      need(!/\b(?:rgb|hsl|url|expression|color-mix)\s*\(/i.test(value), "Colors and outside files cannot be used in page layout.");
      for (const match of value.matchAll(/var\(\s*(--[\w-]+)/g)) need(tokens.has(match[1]) && !match[1].startsWith("--color-"), `Layout token not found: ${match[1]}`);
      need(!/!important|ds-|\/\*/.test(value), "Getting around part styles is not allowed.");
      return `  ${property}: ${value};`;
    });
    return `.page-${page.name}${section === "root" ? "" : `__${section}`} {\n${rows.join("\n")}\n}`;
  }).join("\n");
  return [render(page.layout), ...(page.media ?? []).map((m) => `@media (min-width: ${m.minWidth}px) {\n${render(m.layout)}\n}`)].filter(Boolean).join("\n") + "\n";
}

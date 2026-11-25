/**
 * Figma 기본 상태 코드(React + Tailwind) → 이 프로젝트 규칙에 맞는 구현 초안(TSX · CSS · 스토리). (의존성 0)
 *
 * 작은 무료 모델은 Tailwind 를 토큰 CSS 로 옮기면서 크기·간격·구조를 매번 다르게 틀린다
 * (버튼 크기, 여백, 아이콘 누락, 구분선, 회전). 그래서 결정적으로 바꿔서 초안으로 준다.
 * 지원 범위: 최상위 요소 + 그 아래 이름 붙은 부분(data-name) + 아이콘(img) + 글자(p).
 */

/** JSX 문자열을 아주 단순한 트리로 바꾼다. Figma 가 만드는 모양만 다룬다. */
function parseJsx(code) {
  const body = code.slice(code.indexOf("return ("), code.lastIndexOf(");"));
  const root = { tag: "#root", attrs: "", children: [] };
  const stack = [root];
  const re = /<(\/?)([a-zA-Z][\w.]*)((?:[^>"'{]|"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\})*?)(\/?)>|([^<]+)/g;
  for (const m of body.matchAll(re)) {
    const top = stack[stack.length - 1];
    if (m[5] !== undefined) {
      const text = m[5].trim();
      if (text && !/^[{}()]+$/.test(text) && !text.startsWith("return")) top.children.push({ tag: "#text", text });
      continue;
    }
    if (m[1]) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node = { tag: m[2], attrs: m[3] || "", children: [] };
    top.children.push(node);
    if (!m[4] && m[2] !== "img") stack.push(node);
  }
  return root.children.find((n) => n.tag !== "#text");
}

const classOf = (node) => {
  const a = node.attrs;
  return (
    a.match(/className="([^"]*)"/)?.[1] ??
    a.match(/className=\{className \|\| "([^"]*)"\}/)?.[1] ??
    a.match(/className=\{className \|\| `([^`]*)`\}/)?.[1]?.replace(/\$\{[^}]*\}/g, " ") ??
    ""
  ).split(/\s+/).filter(Boolean);
};
const nameOf = (node) => node.attrs.match(/data-name="([^"]+)"/)?.[1] || null;
const srcOf = (node) => node.attrs.match(/src=\{(\w+)\}/)?.[1] || null;
const kebabCase = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();

/** px 값을 토큰 식으로. 4px 배수는 --spacing, 1·2px 은 테두리용으로 그대로. */
const space = (px) => {
  const n = Number(px);
  if (n === 0) return "0";
  if (n <= 2) return `${n}px`;
  const k = n / 4;
  return `calc(var(--spacing) * ${Number.isInteger(k) ? k : +k.toFixed(2)})`;
};
const radius = (px) => {
  const n = Number(px);
  if (n >= 999) return "var(--radius-full)";
  return [[4, "var(--radius-sm)"], [8, "var(--radius-md)"], [12, "var(--radius-lg)"]].sort((a, b) => Math.abs(a[0] - n) - Math.abs(b[0] - n))[0][1];
};
const fontSize = (px) => [[14, "var(--text-body-2)"], [16, "var(--text-body-1)"], [20, "var(--text-title)"]].sort((a, b) => Math.abs(a[0] - px) - Math.abs(b[0] - px))[0][1];

let layoutTokens = new Set();

/** Tailwind 클래스 → CSS 선언 (Figma 가 쓰는 범위만). */
function tailwindToCss(classes) {
  const out = new Map();
  for (const c of classes) {
    let m;
    if (c === "flex" || c === "content-stretch") out.set("display", "inline-flex");
    else if (c === "items-center") out.set("align-items", "center");
    else if (c === "justify-center") out.set("justify-content", "center");
    else if (c === "overflow-clip" || c === "overflow-hidden") out.set("overflow", "hidden");
    else if (c === "shrink-0") out.set("flex-shrink", "0");
    else if (c === "whitespace-nowrap") out.set("white-space", "nowrap");
    else if (c === "font-semibold") out.set("font-weight", layoutTokens.has("--font-weight-semibold") ? "var(--font-weight-semibold)" : "var(--font-weight-bold)");
    else if (c === "font-bold") out.set("font-weight", "var(--font-weight-bold)");
    else if (c === "font-medium") out.set("font-weight", "var(--font-weight-medium)");
    else if ((m = c.match(/^gap-\[(\d+(?:\.\d+)?)px\]$/))) out.set("gap", space(m[1]));
    else if ((m = c.match(/^h-\[(\d+(?:\.\d+)?)px\]$/))) out.set("height", space(m[1]));
    else if ((m = c.match(/^w-\[(\d+(?:\.\d+)?)px\]$/))) out.set("width", space(m[1]));
    else if ((m = c.match(/^px-\[(\d+(?:\.\d+)?)px\]$/))) out.set("--px", space(m[1]));
    else if ((m = c.match(/^py-\[(\d+(?:\.\d+)?)px\]$/))) out.set("--py", space(m[1]));
    else if ((m = c.match(/^rounded-\[(\d+(?:\.\d+)?)px\]$/))) out.set("border-radius", radius(m[1]));
    else if ((m = c.match(/^text-\[(\d+(?:\.\d+)?)px\]$/))) out.set("font-size", fontSize(Number(m[1])));
    else if ((m = c.match(/^leading-\[(\d+(?:\.\d+)?)\]$/))) out.set("line-height", Number(m[1]) <= 1.3 ? "var(--leading-tight)" : "var(--leading-normal)");
  }
  if (out.has("--px") || out.has("--py")) {
    out.set("padding", `${out.get("--py") || "0"} ${out.get("--px") || "0"}`);
    out.delete("--px");
    out.delete("--py");
  }
  return out;
}

/** Figma 에셋 SVG → JSX. 색은 currentColor, JSX 에 맞지 않는 속성은 바꾸거나 뺀다. */
function svgToJsx(svg, className, indent, size) {
  let s = svg
    .replace(/<\?xml[^>]*>/, "")
    .replace(/\s(style|preserveAspectRatio|overflow|id|data-[\w-]+)="[^"]*"/g, "")
    .replace(/<defs>[\s\S]*?<\/defs>/g, "")
    .replace(/\sclip-path="[^"]*"/g, "")
    .replace(/\s(fill|stroke)="(?!none)[^"]*"/g, ' $1="currentColor"')
    .replace(/\s([a-z]+)-([a-z]+)="/g, (_, a, b) => ` ${a}${b[0].toUpperCase()}${b.slice(1)}="`)
    .replace(/<g>\s*<\/g>/g, "")
    .replace(/\s+/g, " ")
    .replace(/<svg /, `<svg className="${className}" aria-hidden="true" `)
    .trim();
  // 루트 svg 의 fill="currentColor" 는 none 으로 되돌린다 (path 가 색을 가진다)
  s = s.replace(/^(<svg[^>]*?)fill="currentColor"/, '$1fill="none"');
  if (size) s = s.replace(/<svg\s+([^>]*)>/, (_, attrs) => `<svg ${attrs.replace(/\s(?:width|height)="[^"]*"/g, "")} width="${size}" height="${size}">`);
  return indent + s;
}

/** 부분(data-name) 안에서 아이콘과 글자를 순서대로 찾는다. 감싸는 div 는 걷어낸다. */
function contentsOf(node, inherited = {}) {
  const items = [];
  const classes = classOf(node);
  const rotate = classes.map((c) => c.match(/^(-?)rotate-(\d+)$/)).find(Boolean);
  const size = classes.map((c) => c.match(/^size-\[(\d+)px\]$/)).find(Boolean);
  const ctx = {
    rotate: rotate ? `${rotate[1]}${rotate[2]}` : inherited.rotate,
    size: size ? Number(size[1]) : inherited.size,
  };
  for (const child of node.children) {
    if (child.tag === "#text") items.push({ kind: "text", text: child.text, classes });
    else if (child.tag === "img") items.push({ kind: "icon", src: srcOf(child), ...ctx });
    else if (child.tag === "p" || child.tag === "span") {
      const text = child.children.filter((c) => c.tag === "#text").map((c) => c.text).join(" ");
      if (text) items.push({ kind: "text", text, classes: classOf(child) });
      if (child.children.some((c) => c.tag !== "#text")) items.push(...contentsOf(child, ctx));
    } else items.push(...contentsOf(child, ctx));
  }
  return items;
}

/**
 * @param o.design      Figma 기본 상태 코드
 * @param o.assets      { 상수 이름: SVG 문자열 }
 * @param o.name        PascalCase 이름, o.kebab ds- 뒤에 붙는 이름
 * @param o.split       Left/Right 로 나뉘는 컴포넌트인지, o.leftPart/o.rightPart 그 레이어 이름
 * @param o.rules       [[선택자, [[속성, 값]...]]...] 상태별 색 규칙
 * @param o.tokenFor    hex → { name } (가장 가까운 semantic 토큰)
 * @param o.figmaUrl    스토리의 design 링크
 */
export function figmaScaffold(o) {
  layoutTokens = o.layoutTokens || new Set();
  const tree = parseJsx(o.design || "");
  if (!tree) return null;
  // 이름과 마크업 모두 버튼임을 가리키지 않으면 임의의 카드·배지를 버튼으로 만들지 않는다.
  if (!o.split && !(/button|버튼/i.test(`${o.name} ${o.frameName || ""}`) || tree.tag === "button" || /\brole="button"/.test(tree.attrs))) return null;
  const k = `ds-${o.kebab}`;
  const parts = tree.children.filter((n) => n.tag !== "#text");
  const css = [];
  const decl = (sel, map) => map.size && css.push(`${sel} {\n${[...map].map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`);

  // 최상위
  const rootCss = tailwindToCss(classOf(tree));
  rootCss.set("display", "inline-flex");
  rootCss.set("position", "relative");
  rootCss.set("font-family", "var(--font-sans)");
  if (!o.split) {
    rootCss.set("box-sizing", "border-box");
    rootCss.set("appearance", "none");
    rootCss.set("border", "none");
    rootCss.set("cursor", "pointer");
  }
  for (const [sel, decls] of o.rules || []) if (sel === `.${k}`) for (const [p, v] of decls) rootCss.set(p, v);
  decl(`.${k}`, rootCss);
  if (!o.split) css.push(`.${k}:disabled {\n  cursor: not-allowed;\n}`);

  const jsx = [];
  const buttons = [];
  let iconCount = 0;
  let contentCount = 0;
  let hasVisibleText = false;
  let leftHasText = false;
  for (const child of tree.children.filter((n) => n.tag === "#text")) {
    jsx.push(`      <span className="${k}__label">{children}</span>`);
    contentCount += 1;
    hasVisibleText = true;
  }
  for (const part of parts) {
    const pname = nameOf(part) || "part";
    const classes = classOf(part);
    const isSeparator = /separator|divider/i.test(pname) || classes.includes("w-0");
    if (isSeparator) {
      const svg = o.assets[contentsOf(part).find((i) => i.kind === "icon")?.src] || "";
      const stroke = svg.match(/stroke="(#[0-9a-fA-F]{3,6})"/)?.[1];
      const h = classes.map((c) => c.match(/^h-\[(\d+)px\]$/)).find(Boolean)?.[1];
      const sepCss = new Map([
        ["flex-shrink", "0"],
        ["width", "var(--border-width-thin)"],
        // Figma 의 구분선은 폭 0 인 선이다. 1px 이 전체 폭에 더해지지 않게 양쪽으로 반씩 당긴다.
        ["margin-inline", "calc(var(--border-width-thin) / -2)"],
        ["position", "relative"],
        ["z-index", "1"],
        ["height", h ? space(h) : "auto"],
      ]);
      if (stroke) sepCss.set("background", `var(${o.tokenFor(stroke)?.name || "--color-border"})`);
      decl(`.${k}__separator`, sepCss);
      jsx.push(`      <span className="${k}__separator" aria-hidden="true" />`);
      continue;
    }
    const side = o.split ? (pname === o.leftPart ? "left" : pname === o.rightPart ? "right" : null) : null;
    const cls = side ? `${k}__${side}` : `${k}__${kebabCase(pname)}`;
    const items = part.tag === "img" ? [{ kind: "icon", src: srcOf(part) }] : contentsOf(part);
    const hasText = items.some((i) => i.kind === "text");
    if (side === "left") leftHasText = hasText;
    if (hasText) hasVisibleText = true;
    const partCss = tailwindToCss(classes);
    if (side) {
      // 버튼 기본 모양을 지운다 (테두리·배경·글꼴은 부모를 따른다)
      for (const [p, v] of [["box-sizing", "border-box"], ["border", "none"], ["background", "transparent"], ["color", "inherit"], ["font", "inherit"], ["cursor", "pointer"], ["display", "inline-flex"], ["align-items", "center"]]) if (!partCss.has(p) || p === "display") partCss.set(p, v);
      partCss.set("transition", "background var(--duration-fast) var(--ease-standard)");
    }
    decl(`.${cls}`, partCss);
    if (side) css.push(`.${cls}:disabled {\n  cursor: not-allowed;\n}`);

    const tag = side ? "button" : "span";
    const inner = [];
    for (const item of items) {
      if (item.kind === "icon") {
        const svg = o.assets[item.src];
        if (!svg) continue;
        iconCount += 1;
        const iconCls = `${cls}-icon`;
        const iconCss = new Map([["display", "block"], ["flex-shrink", "0"]]);
        if (item.rotate) iconCss.set("transform", `rotate(${item.rotate}deg)`);
        decl(`.${iconCls}`, iconCss);
        inner.push(svgToJsx(svg, iconCls, "        ", item.size));
      } else if (item.kind === "text" && item.text) {
        const labelCss = tailwindToCss(item.classes);
        decl(`.${k}__label`, labelCss);
        inner.push(`        <span className="${k}__label">{children}</span>`);
      }
    }
    const attrs = side
      ? ` type="button" className="${cls}" disabled={disabled}${!hasText ? ` aria-label={${side === "right" ? "menuLabel" : "label"}}` : ""} onClick={${side === "left" ? "onClick" : "onMenuClick"}}`
      : ` className="${cls}"`;
    jsx.push(`      <${tag}${attrs}>`, ...inner, `      </${tag}>`);
    contentCount += inner.length;
    if (side) buttons.push(side);
  }

  // 상태별 색 규칙 (최상위 규칙은 위에서 합쳤다)
  for (const [sel, decls] of o.rules || []) {
    if (sel === `.${k}`) continue;
    css.push(`${sel} {\n${decls.map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}`);
  }

  // 분할 버튼으로 판별됐는데 두 조작 영역을 못 찾았다면 잘못된 초안을 내지 않는다.
  if (o.split && !(buttons.includes("left") && buttons.includes("right"))) return null;
  if (!contentCount) return null;
  const split = Boolean(o.split);
  const needsLeftLabel = split && !leftHasText;
  const states = o.states || [];
  const hasSingleFocus = states.some((s) => /^focus$/i.test(s)) &&
    !states.some((s) => /focus.*left/i.test(s)) &&
    !states.some((s) => /focus.*right/i.test(s));
  const focusStoryCount = hasSingleFocus && split ? 1 : (split && /focus/i.test(states.join(" ")) ? 2 : (/focus/i.test(states.join(" ")) ? 1 : 0));
  const tsx = [
    `import { forwardRef, type ${split ? "HTMLAttributes" : "ButtonHTMLAttributes"}, type ReactNode } from "react";`,
    `import "./${o.name}.css";`,
    ``,
    `export interface ${o.name}Props extends ${split ? 'Omit<HTMLAttributes<HTMLDivElement>, "onClick">' : 'ButtonHTMLAttributes<HTMLButtonElement>'} {`,
    `  /** Label text (Figma default: "Button") */`,
    `  children?: ReactNode;`,
    `  disabled?: boolean;`,
    ...(split
      ? [`  /** Called when the left button is pressed */`, `  onClick: () => void;`, `  /** Called when the right (menu) button is pressed */`, `  onMenuClick: () => void;`, ...(needsLeftLabel ? [`  /** Accessible name for the icon-only left button */`, `  label?: string;`] : []), `  /** Accessible name for the right icon button */`, `  menuLabel?: string;`]
      : [`  /** Accessible name for an icon-only button */`, `  label?: string;`]),
    `}`,
    ``,
    `export const ${o.name} = forwardRef<${split ? "HTMLDivElement" : "HTMLButtonElement"}, ${o.name}Props>(function ${o.name}(`,
    `  { children = "Button", disabled = false, onClick, ${split ? `onMenuClick, ${needsLeftLabel ? `label = ${JSON.stringify(o.name)}, ` : ""}menuLabel = "More options", ` : `label = ${JSON.stringify(o.name)}, type = "button", `}className, ...rest },`,
    `  ref,`,
    `) {`,
    `  return (`,
    `    <${split ? "div" : "button"}`,
    `      ref={ref}`,
    ...(split ? [`      role="group"`] : [`      type={type}`, `      disabled={disabled}`, `      onClick={onClick}`, ...(!hasVisibleText ? [`      aria-label={label}`] : [])]),
    `      className={["${k}", className].filter(Boolean).join(" ")}`,
    `      data-testid="${k}"`,
    `      {...rest}`,
    `    >`,
    ...jsx,
    `    </${split ? "div" : "button"}>`,
    `  );`,
    `});`,
  ].join("\n");

  const stories = [
    `import type { Meta, StoryObj } from "@storybook/react";`,
    `import { expect, fn, userEvent, within } from "@storybook/test";`,
    `import { ${o.name} } from "./${o.name}";`,
    ``,
    `const meta = {`,
    `  title: "Components/${o.name}",`,
    `  component: ${o.name},`,
    `  tags: ["autodocs"],`,
    `  parameters: {`,
    `    layout: "centered",`,
    ...(o.figmaUrl ? [`    design: { type: "figma", url: ${JSON.stringify(o.figmaUrl)} },`] : []),
    `  },`,
    `  args: { children: "Button" },`,
    `} satisfies Meta<typeof ${o.name}>;`,
    ``,
    `export default meta;`,
    `type Story = StoryObj<typeof meta>;`,
    ``,
    `export const Default: Story = {`,
    `  args: { onClick: fn()${split ? ", onMenuClick: fn()" : ""} },`,
    `  play: async ({ canvasElement, args }) => {`,
    `    await expect(within(canvasElement).getByTestId("${k}")).toBeInTheDocument();`,
    ...(split ? [
      `    const buttons = within(canvasElement).getAllByRole("button");`,
      `    for (const button of buttons) await expect(button).toBeEnabled();`,
      `    await userEvent.click(buttons[0]!);`,
      `    await expect(args.onClick).toHaveBeenCalledTimes(1);`,
      `    await userEvent.click(buttons[1]!);`,
      `    await expect(args.onMenuClick).toHaveBeenCalledTimes(1);`,
      `    buttons[1]!.blur();`,
    ] : [
      `    const button = within(canvasElement).getByRole("button");`,
      `    await expect(button).toBeEnabled();`,
      `    await userEvent.click(button);`,
      `    await expect(args.onClick).toHaveBeenCalledTimes(1);`,
      `    button.blur();`,
    ]),
    `  },`,
    `};`,
    ``,
    `export const Disabled: Story = {`,
    `  args: { disabled: true, onClick: fn()${split ? ", onMenuClick: fn()" : ""} },`,
    `  play: async ({ canvasElement, args }) => {`,
    `    await expect(within(canvasElement).getByTestId("${k}")).toBeInTheDocument();`,
    ...(split ? [
      `    const buttons = within(canvasElement).getAllByRole("button");`,
      `    for (const button of buttons) await expect(button).toBeDisabled();`,
      `    await userEvent.click(buttons[0]!);`,
      `    await userEvent.click(buttons[1]!);`,
      `    await expect(args.onClick).toHaveBeenCalledTimes(0);`,
      `    await expect(args.onMenuClick).toHaveBeenCalledTimes(0);`,
    ] : [
      `    const button = within(canvasElement).getByRole("button");`,
      `    await expect(button).toBeDisabled();`,
      `    await userEvent.click(button);`,
      `    await expect(args.onClick).toHaveBeenCalledTimes(0);`,
    ]),
    `  },`,
    `};`,
    ...(hasSingleFocus && split ? [
      ``,
      `export const Focus: Story = {`,
      `  args: { onClick: fn()${split ? ", onMenuClick: fn()" : ""} },`,
      `  play: async ({ canvasElement }) => {`,
      `    const buttons = within(canvasElement).getAllByRole("button");`,
      `    // Tab to left button`,
      `    await userEvent.tab();`,
      `    await expect(buttons[0]).toHaveFocus();`,
      `    await expect(within(canvasElement).getByTestId("${k}")).toHaveStyle({ outlineStyle: "solid" });`,
      `    // Tab to right button - same group focus ring should remain`,
      `    await userEvent.tab();`,
      `    await expect(buttons[1]).toHaveFocus();`,
      `    await expect(within(canvasElement).getByTestId("${k}")).toHaveStyle({ outlineStyle: "solid" });`,
      `  },`,
      `};`,
    ] : (/focus/i.test(states.join(" ")) ? (split ? ["Left", "Right"] : [""]).flatMap((side, index) => [
      ``,
      `export const Focus${side}: Story = {`,
      `  args: { onClick: fn()${split ? ", onMenuClick: fn()" : ""} },`,
      `  play: async ({ canvasElement }) => {`,
      ...Array.from({ length: index + 1 }, () => `    await userEvent.tab();`),
      `    const buttons = within(canvasElement).getAllByRole("button");`,
      `    await expect(buttons[${index}]).toHaveFocus();`,
      `    await expect(within(canvasElement).getByTestId("${k}")).toHaveStyle({ outlineStyle: "solid" });`,
      `  },`,
      `};`,
    ]) : [])),
  ].join("\n");

  return { tsx, css: `/* ${o.name} — draft computed from Figma. Uses only semantic and layout tokens. */\n\n` + css.join("\n\n") + "\n", stories, iconCount };
}

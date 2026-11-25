/**
 * 기술 스택별 컴포넌트 생성.
 *
 * 스택은 **스타일을 어디에 쓰는가**로 갈린다. 토큰 계층은 어느 스택에서도 같다 —
 * semantic/layout 토큰만 참조하고 primitive 를 직접 쓰지 않는다(가드 G1).
 *
 *   css          .css 파일 + `ds-button--primary` 클래스        (기본)
 *   css-modules  .module.css + styles.primary
 *   tailwind      유틸리티 클래스. Tailwind v4 가 @theme 토큰에서 유틸을 만든다
 *   shadcn        Radix + cva + cn. shadcn/ui 관례
 *
 * Tailwind v4 는 `@theme` 의 변수 이름에서 유틸을 생성한다:
 *   --color-primary      → bg-primary / text-primary / border-primary
 *   --radius-md          → rounded-md
 *   --text-body-1        → text-body-1
 *   --font-weight-medium → font-medium
 *   --spacing            → p-2 = calc(var(--spacing) * 2)
 * 그래서 tailwind/shadcn 스택도 같은 토큰을 쓴다. 하드코딩된 색이 들어갈 자리가 없다.
 */

export const STACK_IDS = ["css", "css-modules", "tailwind", "shadcn"];

export const STACK_INFO = {
  css: {
    label: "Plain CSS",
    deps: [],
    note: "No dependencies. The safest choice if you switch frameworks later.",
  },
  "css-modules": {
    label: "CSS Modules",
    deps: [],
    note: "Class names never clash. Your build tool must support .module.css.",
  },
  tailwind: {
    label: "Tailwind utilities",
    deps: ["tailwindcss", "@tailwindcss/vite"],
    note: "No CSS files. Class lists get long, but a value that skips the tokens is easy to spot.",
  },
  shadcn: {
    label: "shadcn/ui (Radix + cva)",
    deps: ["class-variance-authority", "clsx", "tailwind-merge", "@radix-ui/react-slot"],
    note: "Radix handles accessibility behavior. This matters most for composite components (Dialog, Select, Tabs).",
  },
};

/** Radix 프리미티브가 실제로 값을 하는 컴포넌트. shadcn 스택에서 import 를 붙인다. */
const RADIX = {
  Modal: "@radix-ui/react-dialog",
  Dialog: "@radix-ui/react-dialog",
  Tooltip: "@radix-ui/react-tooltip",
  Popover: "@radix-ui/react-popover",
  Toggletip: "@radix-ui/react-popover",
  Tabs: "@radix-ui/react-tabs",
  Accordion: "@radix-ui/react-accordion",
  Checkbox: "@radix-ui/react-checkbox",
  RadioButton: "@radix-ui/react-radio-group",
  Select: "@radix-ui/react-select",
  Dropdown: "@radix-ui/react-select",
  Toggle: "@radix-ui/react-switch",
  Slider: "@radix-ui/react-slider",
  ProgressBar: "@radix-ui/react-progress",
  OverflowMenu: "@radix-ui/react-dropdown-menu",
  Menu: "@radix-ui/react-dropdown-menu",
  MenuButton: "@radix-ui/react-dropdown-menu",
  ContextMenu: "@radix-ui/react-context-menu",
  ContentSwitcher: "@radix-ui/react-toggle-group",
  SidePanel: "@radix-ui/react-dialog",
  Tearsheet: "@radix-ui/react-dialog",
  AspectRatio: "@radix-ui/react-aspect-ratio",
  TreeView: "@radix-ui/react-accordion",
};

/**
 * Radix 프리미티브 경로. **복합 컴포넌트에만** 쓴다.
 *
 * 단순 컴포넌트에 Radix Root 를 씌우려 하면 깨진다 — `Select.Root` 는 함수
 * 컴포넌트라 forwardRef 대상이 아니고 className 도 받지 않는다.
 * 그리고 부품 이름은 컴포넌트마다 다르다(Tooltip 에는 Close 가 없다).
 * 그래서 부품을 **코드로 내보내지 않고** 네임스페이스만 내보낸다 —
 * 네임스페이스는 언제나 존재하므로 틀릴 수가 없다.
 */
export function radixFor(name, { composite = false } = {}) {
  return composite ? RADIX[name] ?? null : null;
}

/**
 * Radix 부품을 그대로 내보내는 형태인가.
 * 이 경우 컴포넌트에 props 인터페이스가 없어 story·Code Connect 를 생성할 수 없다
 * (Dialog.Root 는 DOM 을 렌더하지 않으므로 getByTestId 가 실패한다).
 */
export function isReexport(spec, stack) {
  return Boolean(spec.composite && stack === "shadcn" && radixFor(spec.name, { composite: true }));
}

const q = (s) => JSON.stringify(String(s ?? ""));

/**
 * 해당 element 가 **네이티브로 갖는** 속성. 이건 직접 선언하지 않고
 * `...rest` 로 흘려보낸다.
 *
 * 선언해서 구조분해로 빼내면 변수로만 쓰이고 element 에 전달되지 않아
 * `disabled` 버튼이 실제로는 눌리는 버그가 된다. 확장하는 HTML 속성 인터페이스가
 * 이미 타입을 갖고 있으므로 다시 선언할 이유도 없다.
 */
const NATIVE = {
  button: ["disabled", "type"],
  a: ["href", "target", "rel"],
  input: ["disabled", "checked", "readonly", "readOnly", "multiple", "placeholder", "required", "value"],
  textarea: ["disabled", "readonly", "readOnly", "placeholder", "required", "value"],
  select: ["disabled", "multiple", "required", "value"],
};

function nativeSet(elem) {
  return new Set(NATIVE[elem] ?? []);
}

/**
 * 네이티브 속성과 **이름은 같고 타입이 다른** 것. 확장하면 TS2430 이 난다.
 * 예: `<input size>` 는 number 인데 우리 size 는 "sm"|"md"|"lg" 다.
 * 이런 이름은 확장 인터페이스에서 Omit 한다.
 */
const CONFLICT = {
  input: ["size", "width", "height"],
  select: ["size"],
  textarea: ["rows", "cols"],
  img: ["width", "height"],
};

function conflictsFor(spec, elem) {
  const ours = new Set(spec.props.map((p) => p.codeName));
  return (CONFLICT[elem] ?? []).filter((n) => ours.has(n));
}

/** 네이티브가 아닌 상태 prop 은 aria 로 내보낸다. */
const ARIA = { invalid: "aria-invalid", disabled: "aria-disabled", checked: "aria-checked", expanded: "aria-expanded", selected: "aria-selected", open: "aria-expanded" };

/** semantic 토큰 → Tailwind 유틸리티. variant 이름의 의미로 고른다. */
function tailwindVariant(code) {
  if (/^(danger|destructive|error|critical)/.test(code)) return "bg-danger text-on-primary";
  if (/^(success|positive|ok)/.test(code)) return "bg-success text-on-primary";
  if (/^(warning|caution|alert)/.test(code)) return "bg-warning text-on-primary";
  if (/^(info|accent|brand)/.test(code)) return "bg-info text-on-primary";
  if (/primary|default|solid|filled/.test(code)) return "bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active";
  if (/outline/.test(code)) return "bg-transparent text-text border-border-strong";
  if (/ghost|tertiary|text|link|plain/.test(code)) return "bg-transparent text-text border-transparent";
  return "bg-surface-raised text-text border-border";
}

const TW_SIZE = { l: "min-h-10 px-5", lg: "min-h-10 px-5", m: "min-h-8 px-4", md: "min-h-8 px-4", s: "min-h-7 px-3", sm: "min-h-7 px-3", xs: "min-h-6 px-2", xl: "min-h-12 px-6" };
function tailwindSize(code) {
  return TW_SIZE[code] ?? "min-h-8 px-4";
}

const TW_BASE =
  "inline-flex items-center justify-center gap-2 border border-transparent rounded-md " +
  "font-sans text-body-1 font-medium leading-normal transition-colors duration-fast ease-standard " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
  "disabled:text-text-disabled disabled:cursor-not-allowed";

/** css-modules 스택에 필요한 앰비언트 선언. 없으면 TS2307. */
export function cssModulesDtsFile() {
  return `// css-modules 스택용 앰비언트 선언. 없으면 .module.css import 가 TS2307 로 막힌다.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
`;
}

/** 공용 헬퍼 파일 (shadcn 스택에서만 필요). */
export function cnHelperFile() {
  return `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn 관례의 클래스 병합 헬퍼. 뒤에 온 유틸이 이긴다. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
}

// ── 스택별 컴포넌트 본문 ────────────────────────────────────────────

function reactShell(spec, { imports, typeLines, destructure, classExpr, body, elem, elemType, attrType }) {
  const P = spec.pascal;
  return `${imports.join("\n")}

${typeLines.join("\n")}

export const ${P} = forwardRef<${elemType}, ${P}Props>(function ${P}(
  { ${destructure} },
  ref,
) {
${classExpr}

  return (
${VOID.has(elem)
    ? `    <${elem} ref={ref} className={classes} data-testid=${q(testId(spec))}${ariaAttrs(spec)} {...rest} />`
    : `    <${elem} ref={ref} className={classes} data-testid=${q(testId(spec))}${ariaAttrs(spec)} {...rest}>\n${body}\n    </${elem}>`}
  );
});
`;
}

/**
 * 폼 요소는 래퍼가 필요하다.
 *
 * `<input>` 은 void 요소라 children 을 못 갖고, 라벨을 밖에서 `htmlFor` 로 이어야 한다.
 * 라벨이 연결되지 않은 입력은 화면 낭독기에서 이름 없는 입력칸으로 읽힌다 — 접근성 실패다.
 * 도움말은 `aria-describedby`, 오류는 `aria-invalid` 로 잇는다.
 */
function fieldComponent(spec, { stack, imports }) {
  const P = spec.pascal;
  const cls = testId(spec);
  const [elem, elemType] = elementOf(spec);
  const isModule = stack === "css-modules";
  const k = (n) => (isModule ? `{styles.${n}}` : `"${cls}__${n}"`);
  const enums = spec.props.filter((p) => p.kind === "enum");
  const own = ownProps(spec);
  const hasHelp = own.some((p) => p.codeName === "helperText");
  const hasInvalid = own.some((p) => p.codeName === "invalid");
  const selfClosing = VOID.has(elem) || elem === "textarea";
  // 체크박스·라디오는 type 을 빠뜨리면 글자 입력칸이 된다. 라벨은 표식 뒤에 온다.
  const choice = choiceType(spec);

  const rootClass = [
    isModule ? "styles.root" : `"${cls}"`,
    ...enums.map((p) => (isModule ? `styles[${p.codeName}]` : `\`${cls}--\${${p.codeName}}\``)),
    "className",
  ];

  let types = propTypes(spec, P).join("\n");
  // type 은 우리가 고정한다 — 밖에서 바꾸면 컴포넌트가 다른 것이 된다.
  if (choice) types = types.replace(`extends ${attrTypeFor(spec)} {`, `extends Omit<${attrTypeFor(spec)}, "type"> {`);

  const L = [];
  L.push(imports[0].replace('import { forwardRef } from "react";', 'import { forwardRef, useId } from "react";'));
  L.push(...imports.slice(1));
  L.push("");
  L.push(types);
  L.push("");
  // ref 는 바깥 묶음이 아니라 입력 요소를 가리킨다 — 폼 라이브러리의 register 와 focus() 가 그대로 붙는다.
  L.push(`export const ${P} = forwardRef<${elemType}, ${P}Props>(function ${P}(`);
  L.push(`  { ${destructureOf(spec).replace("...rest", "id: idProp, ...rest")} },`);
  L.push(`  ref,`);
  L.push(`) {`);
  L.push(`  const autoId = useId();`);
  L.push(`  // 밖에서 id 를 주면 그것을 쓴다. 안 그러면 라벨의 htmlFor 가 엉뚱한 id 를 가리킨다.`);
  L.push(`  const id = idProp ?? autoId;`);
  if (hasHelp) L.push(`  const helpId = \`\${id}-help\`;`);
  L.push(`  const classes = [${rootClass.join(", ")}].filter(Boolean).join(" ");`);
  if (choice) L.push(`  const text = label ?? children;`);
  L.push("");
  const labelBlock = (expr) => [
    `      {${expr} ? (`,
    `        <label className=${k("label")} htmlFor={id}>`,
    `          {${expr}}`,
    `        </label>`,
    `      ) : null}`,
  ];
  const attrs = [
    `ref={ref}`,
    `id={id}`,
    choice ? `type="${choice}"` : "",
    `className=${k("field")}`,
    hasInvalid ? `aria-invalid={invalid || undefined}` : "",
    hasHelp ? `aria-describedby={helperText ? helpId : undefined}` : "",
    `{...rest}`,
  ].filter(Boolean).join(" ");
  L.push(`  return (`);
  L.push(`    <div className={classes} data-testid=${q(cls)}>`);
  if (!choice) L.push(...labelBlock("label"));
  L.push(selfClosing || choice ? `      <${elem} ${attrs} />` : `      <${elem} ${attrs}>{children}</${elem}>`);
  if (choice) L.push(...labelBlock("text"));
  if (hasHelp) {
    L.push(`      {helperText ? (`);
    L.push(`        <span id={helpId} className=${isModule ? `{invalid ? styles.helpInvalid : styles.help}` : `{invalid ? "${cls}__help ${cls}__help--invalid" : "${cls}__help"}`}>`);
    L.push(`          {helperText}`);
    L.push(`        </span>`);
    L.push(`      ) : null}`);
  }
  L.push(`    </div>`);
  L.push(`  );`);
  L.push(`});`);
  L.push("");
  return L.join("\n");
}

/** 이름으로 체크박스·라디오를 가린다. 둘 다 `<input>` 이지만 type 이 다르다. */
function choiceType(spec) {
  const [elem] = elementOf(spec);
  if (elem !== "input") return null;
  if (/checkbox/i.test(spec.name)) return "checkbox";
  if (/radio/i.test(spec.name)) return "radio";
  return null;
}

/** children 을 가질 수 없는 요소. `<input>{children}</input>` 은 React 오류다. */
const VOID = new Set(["input", "img", "br", "hr", "area", "base", "col", "embed", "link", "meta", "source", "track", "wbr"]);

/** 라벨·도움말을 감싸야 하는 폼 요소. 라벨이 연결되지 않은 입력은 접근성 실패다. */
const FIELD = new Set(["input", "textarea", "select"]);

function isField(spec) {
  const [elem] = elementOf(spec);
  return FIELD.has(elem) && spec.props.some((p) => p.codeName === "label");
}

function testId(spec) {
  return `ds-${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function elementOf(spec) {
  const el = spec.element ?? (/^button$|button-?group|icon-?button/i.test(spec.name) ? "button" : "div");
  const map = {
    button: ["button", "HTMLButtonElement", "ButtonHTMLAttributes<HTMLButtonElement>", "ButtonHTMLAttributes"],
    a: ["a", "HTMLAnchorElement", "AnchorHTMLAttributes<HTMLAnchorElement>", "AnchorHTMLAttributes"],
    input: ["input", "HTMLInputElement", "InputHTMLAttributes<HTMLInputElement>", "InputHTMLAttributes"],
    textarea: ["textarea", "HTMLTextAreaElement", "TextareaHTMLAttributes<HTMLTextAreaElement>", "TextareaHTMLAttributes"],
    select: ["select", "HTMLSelectElement", "SelectHTMLAttributes<HTMLSelectElement>", "SelectHTMLAttributes"],
    table: ["table", "HTMLTableElement", "TableHTMLAttributes<HTMLTableElement>", "TableHTMLAttributes"],
    ul: ["ul", "HTMLUListElement", "HTMLAttributes<HTMLUListElement>", "HTMLAttributes"],
    nav: ["nav", "HTMLElement", "HTMLAttributes<HTMLElement>", "HTMLAttributes"],
    header: ["header", "HTMLElement", "HTMLAttributes<HTMLElement>", "HTMLAttributes"],
    aside: ["aside", "HTMLElement", "HTMLAttributes<HTMLElement>", "HTMLAttributes"],
    span: ["span", "HTMLSpanElement", "HTMLAttributes<HTMLSpanElement>", "HTMLAttributes"],
  };
  const heading = /^h[1-6]$/.test(el) ? ["h2", "HTMLHeadingElement", "HTMLAttributes<HTMLHeadingElement>", "HTMLAttributes"] : null;
  return heading ?? map[el] ?? ["div", "HTMLDivElement", "HTMLAttributes<HTMLDivElement>", "HTMLAttributes"];
}

export function ownProps(spec) {
  const [elem] = elementOf(spec);
  const native = nativeSet(elem);
  return spec.props.filter((p) => !native.has(p.codeName));
}

/** 확장할 HTML 속성 타입. 충돌하는 이름은 Omit 한다. */
function attrTypeFor(spec) {
  const [elem, , attrFull] = elementOf(spec);
  const c = conflictsFor(spec, elem);
  if (!c.length) return attrFull;
  return `Omit<${attrFull}, ${c.map((n) => JSON.stringify(n)).join(" | ")}>`;
}

function propTypes(spec, P) {
  const enums = spec.props.filter((p) => p.kind === "enum");
  const own = ownProps(spec);
  const lines = [];
  for (const p of enums) {
    lines.push(`export type ${P}${pascalCase(p.codeName)} = ${p.options.map((o) => q(o.code)).join(" | ")};`);
  }
  lines.push("");
  lines.push(`export interface ${P}Props extends ${attrTypeFor(spec)} {`);
  for (const p of enums) lines.push(`  /** Figma: ${p.figmaName} */\n  ${p.codeName}?: ${P}${pascalCase(p.codeName)};`);
  for (const p of own.filter((x) => x.kind === "boolean")) lines.push(`  /** Figma: ${p.figmaName} */\n  ${p.codeName}?: boolean;`);
  for (const p of own.filter((x) => x.kind === "node")) lines.push(`  /** Figma: ${p.figmaName} */\n  ${p.codeName}?: ReactNode;`);
  for (const p of own.filter((x) => x.kind === "string" && x.codeName !== "children")) lines.push(`  ${p.codeName}?: string;`);
  lines.push(`  children?: ReactNode;`);
  lines.push(`}`);
  return lines;
}

function destructureOf(spec) {
  const enums = spec.props.filter((p) => p.kind === "enum");
  const own = ownProps(spec);
  return [
    ...enums.map((p) => `${p.codeName} = ${q(p.defaultValue ?? p.options[0]?.code ?? "")}`),
    ...own.filter((x) => x.kind === "boolean").map((p) => `${p.codeName} = ${Boolean(p.defaultValue)}`),
    ...own.filter((x) => x.kind === "node").map((p) => p.codeName),
    // 문자열 prop(label·helperText)도 구조분해해야 한다. 빠뜨리면 정의되지 않은 변수가 되고,
    // 남겨두면 `...rest` 로 DOM 에 새어 React 경고가 난다.
    ...own.filter((x) => x.kind === "string" && x.codeName !== "children").map((p) => p.codeName),
    "className",
    "children",
    "...rest",
  ].join(", ");
}

/** 네이티브가 아닌 상태를 aria 속성으로 내보낸다. */
function ariaAttrs(spec) {
  return ownProps(spec)
    .filter((p) => p.kind === "boolean" && ARIA[p.codeName])
    .map((p) => ` ${ARIA[p.codeName]}={${p.codeName} || undefined}`)
    .join("");
}

function slotBody(spec, cls, withStyles) {
  const rows = spec.props
    .filter((x) => x.kind === "node")
    .map((p) => {
      const c = withStyles ? `{styles.${p.codeName.toLowerCase()}}` : q(`${cls}__${p.codeName.toLowerCase()}`);
      return `      {${p.codeName} ? <span className=${c} aria-hidden>{${p.codeName}}</span> : null}`;
    });
  rows.push("      {children}");
  return rows.join("\n");
}

function reactImports(spec, extra = []) {
  const [, , , attrType] = elementOf(spec);
  return [
    `import { forwardRef } from "react";`,
    `import type { ${attrType}, ReactNode } from "react";`,
    ...extra,
  ];
}

/**
 * 복합 컴포넌트 골격.
 *
 * Radix `Dialog.Root` 는 비시각 컨텍스트 프로바이더라 className·ref·data-testid 를
 * 받지 않는다. 여기에 유틸리티 클래스를 얹으면 **동작하지 않는 코드**가 나온다.
 * 그래서 결정적 생성기는 올바른 골격과 접근성 요구만 내고 구현은 비운다 —
 * 틀린 구현을 내는 것보다 비워 두는 게 정직하다.
 */
function compositeStub(spec, stack) {
  const P = spec.pascal;
  const radix = radixFor(spec.name, { composite: true });
  const parts = spec.parts ?? [];
  const L = [];
  L.push(`/**`);
  L.push(` * ${spec.name} — 복합 컴포넌트. **구현이 비어 있습니다.**`);
  L.push(` *`);
  L.push(` * 여러 요소가 ARIA 상태를 맞춰야 하므로 자동 생성하지 않습니다.`);
  L.push(` * 생성기가 틀린 구현을 내는 것보다 비워 두는 편이 낫습니다.`);
  L.push(` *`);
  if (parts.length) L.push(` * 필요한 부품: ${parts.join(" · ")}`);
  if (radix) L.push(` * 권장 기반:   ${radix}`);
  if (spec.a11y) L.push(` * 접근성:     ${spec.a11y}`);
  L.push(` *`);
  L.push(` * 채우는 방법 — prompts/generate-component.md 를 AI 에게 주고:`);
  L.push(` *   "${spec.name} 를 ${stack} 스택으로 구현해줘"`);
  L.push(` */`);
  if (radix && stack === "shadcn") {
    L.push(`import * as ${P}Primitive from ${q(radix)};`);
    L.push("");
    L.push(`// 네임스페이스만 내보낸다. 부품 이름은 컴포넌트마다 달라서`);
    L.push(`// (Tooltip 에는 Close 가 없다) 코드로 고정하지 않는다.`);
    L.push(`export { ${P}Primitive };`);
    if (parts.length) {
      L.push("");
      L.push(`// TODO(ds): 아래를 합성해 ${P} 을 구현할 것.`);
      for (const part of parts) L.push(`//   ${P}Primitive.${part}`);
    }
    L.push("");
    return L.join("\n");
  }

  // Radix 재내보내기가 아닌 경우: props 를 **선언하고 구조분해**한다.
  // 선언만 하고 구조분해를 빼면 variant·tone 같은 값이 `...rest` 로 DOM 에 새어
  // React 가 "unknown prop" 경고를 낸다.
  const [elem, elemType, attrFull, attrType] = elementOf(spec);
  const unwired = spec.props.map((x) => x.codeName).filter((n) => n !== "children");
  L.push(`import { forwardRef } from "react";`);
  L.push(`import type { ${attrType}, ReactNode } from "react";`);
  if (stack === "css" || stack === "css-modules") {
    L.push(stack === "css-modules" ? `import styles from "./${P}.module.css";` : `import "./${P}.css";`);
  }
  L.push("");
  L.push(propTypes(spec, P).join("\n"));
  L.push("");
  L.push(`export const ${P} = forwardRef<${elemType}, ${P}Props>(function ${P}(`);
  L.push(`  { ${destructureOf(spec)} },`);
  L.push(`  ref,`);
  L.push(`) {`);
  if (unwired.length) L.push(`  // TODO(ds): 아직 배선되지 않은 prop — ${unwired.join(", ")}`);
  if (parts.length) L.push(`  // TODO(ds): ${parts.join(" / ")} 를 합성할 것.`);
  L.push(`  // TODO(ds): 키보드 이동과 ARIA 상태를 구현할 것.`);
  L.push(`  const classes = [${stack === "css-modules" ? "styles.root" : q(testId(spec))}, className].filter(Boolean).join(" ");`);
  L.push("");
  L.push(`  return (`);
  L.push(`    <${elem} ref={ref} className={classes} data-testid=${q(testId(spec))}${ariaAttrs(spec)} {...rest}>`);
  L.push(`      {children}`);
  L.push(`    </${elem}>`);
  L.push(`  );`);
  L.push(`});`);
  L.push("");
  return L.join("\n");
}

export function buildComponent(spec, stack, { hasComponentTokens }) {
  if (spec.composite) {
    const files = [{ name: `${spec.pascal}.tsx`, once: true, body: compositeStub(spec, stack) }];
    if (stack === "css" || stack === "css-modules") {
      const nm = stack === "css-modules" ? `${spec.pascal}.module.css` : `${spec.pascal}.css`;
      files.push({ name: nm, once: true, body: styleSheet(spec, { isModule: stack === "css-modules", hasComponentTokens }) });
    }
    return files;
  }
  const P = spec.pascal;
  const cls = testId(spec);
  const [elem, elemType] = elementOf(spec);
  const enums = spec.props.filter((p) => p.kind === "enum");
  const bools = ownProps(spec).filter((p) => p.kind === "boolean");
  const files = [];

  if (stack === "css" || stack === "css-modules") {
    const isModule = stack === "css-modules";
    const styleName = isModule ? `${P}.module.css` : `${P}.css`;
    const imports = reactImports(spec, [
      isModule ? `import styles from "./${styleName}";` : `import "./${styleName}";`,
    ]);
    const classRows = [`  const classes = [`];
    classRows.push(isModule ? `    styles.root,` : `    ${q(cls)},`);
    for (const p of enums) classRows.push(isModule ? `    styles[${p.codeName}],` : `    \`${cls}--\${${p.codeName}}\`,`);
    for (const p of bools) classRows.push(isModule ? `    ${p.codeName} && styles.${p.codeName.toLowerCase()},` : `    ${p.codeName} && ${q(`${cls}--${p.codeName.toLowerCase()}`)},`);
    classRows.push(`    className,`, `  ]`, `    .filter(Boolean)`, `    .join(" ");`);
    if (isField(spec)) {
      files.push({ name: `${P}.tsx`, once: true, body: fieldComponent(spec, { stack, imports, classRows }) });
    } else {
      files.push({
        name: `${P}.tsx`,
        once: true,
        body: reactShell(spec, {
          imports, typeLines: propTypes(spec, P), destructure: destructureOf(spec),
          classExpr: classRows.join("\n"), body: slotBody(spec, cls, isModule), elem, elemType,
        }),
      });
    }
    files.push({ name: styleName, once: true, body: styleSheet(spec, { isModule, hasComponentTokens }) });
    return files;
  }

  if (stack === "tailwind") {
    const imports = reactImports(spec);
    const maps = [];
    for (const p of enums) {
      const rows = p.options.map((o) => `  ${JSON.stringify(o.code)}: ${q(
        p.codeName === "size" ? tailwindSize(o.code) : tailwindVariant(o.code),
      )},`).join("\n");
      maps.push(`const ${p.codeName.toUpperCase()}: Record<string, string> = {\n${rows}\n};`);
    }
    const classRows = [`  const classes = [`, `    BASE,`];
    for (const p of enums) classRows.push(`    ${p.codeName.toUpperCase()}[${p.codeName}],`);
    for (const p of bools) classRows.push(`    ${p.codeName} && "opacity-60 pointer-events-none",`);
    classRows.push(`    className,`, `  ]`, `    .filter(Boolean)`, `    .join(" ");`);
    files.push({
      name: `${P}.tsx`,
      once: true,
      body: [
        imports.join("\n"),
        "",
        `// 토큰에서 생성된 유틸리티. Tailwind v4 가 @theme 변수로 이 클래스들을 만든다.`,
        `const BASE =\n  ${q(TW_BASE)};`,
        maps.join("\n"),
        "",
        propTypes(spec, P).join("\n"),
        "",
        `export const ${P} = forwardRef<${elemType}, ${P}Props>(function ${P}(`,
        `  { ${destructureOf(spec)} },`,
        `  ref,`,
        `) {`,
        classRows.join("\n"),
        "",
        `  return (`,
        `    <${elem} ref={ref} className={classes} data-testid=${q(cls)}${ariaAttrs(spec)} {...rest}>`,
        slotBody(spec, cls, false),
        `    </${elem}>`,
        `  );`,
        `});`,
        "",
      ].join("\n"),
    });
    return files;
  }

  if (stack === "shadcn") {
    // 단순 컴포넌트에는 Radix 를 쓰지 않는다 (위 radixFor 주석 참고).
    const radix = null;
    const own = ownProps(spec);
    const variantProp = enums.find((p) => p.codeName === "variant") ?? enums.find((p) => p.codeName !== "size");
    const sizeProp = enums.find((p) => p.codeName === "size");
    const cvaName = `${spec.pascal[0].toLowerCase()}${spec.pascal.slice(1)}Variants`;
    const root = radix ? `${P}Primitive.Root` : elem;
    const rootType = radix ? `typeof ${root}` : q(elem);

    const imports = [
      `import { forwardRef } from "react";`,
      `import type { ReactNode } from "react";`,
      `import { cva, type VariantProps } from "class-variance-authority";`,
      `import { cn } from "@/lib/utils";`,
    ];
    if (radix) imports.push(`import * as ${P}Primitive from ${q(radix)};`);

    const cvaVariants = [];
    if (variantProp) {
      cvaVariants.push(`      ${variantProp.codeName}: {\n` +
        variantProp.options.map((o) => `        ${JSON.stringify(o.code)}: ${q(tailwindVariant(o.code))},`).join("\n") +
        `\n      },`);
    }
    if (sizeProp) {
      cvaVariants.push(`      size: {\n` +
        sizeProp.options.map((o) => `        ${JSON.stringify(o.code)}: ${q(tailwindSize(o.code))},`).join("\n") +
        `\n      },`);
    }
    const defaults = [];
    if (variantProp) defaults.push(`      ${variantProp.codeName}: ${q(variantProp.defaultValue ?? variantProp.options[0].code)},`);
    if (sizeProp) defaults.push(`      size: ${q(sizeProp.defaultValue ?? sizeProp.options[0].code)},`);

    // cva 가 다루는 것은 variant·size 뿐이다. 나머지 prop 을 인터페이스에서
    // 빼먹으면 story·Code Connect 가 타입으로 막힌다.
    const cvaNames = new Set([variantProp?.codeName, sizeProp && "size"].filter(Boolean));
    const extraProps = own.filter((x) => !cvaNames.has(x.codeName) && x.codeName !== "children");
    const conflicts = conflictsFor(spec, elem);
    const baseAttr = conflicts.length
      ? `Omit<React.ComponentPropsWithoutRef<${rootType}>, ${conflicts.map((n) => JSON.stringify(n)).join(" | ")}>`
      : `React.ComponentPropsWithoutRef<${rootType}>`;

    const iface = [`export interface ${P}Props`, `  extends ${baseAttr},`, `    VariantProps<typeof ${cvaName}> {`];
    for (const x of extraProps) {
      const t = x.kind === "boolean" ? "boolean" : x.kind === "node" ? "ReactNode" : x.kind === "enum"
        ? x.options.map((o) => q(o.code)).join(" | ") : "string";
      iface.push(`  /** Figma: ${x.figmaName} */`);
      iface.push(`  ${x.codeName}?: ${t};`);
    }
    iface.push(`  children?: ReactNode;`);
    iface.push(`}`);

    // 선언한 prop 은 전부 구조분해한다 — 안 하면 DOM 으로 새어 React 경고가 난다.
    const destr = [
      "className",
      ...[...cvaNames],
      ...extraProps.map((x) => x.codeName),
      "children",
      "...rest",
    ].join(", ");
    const cvaArgs = [...cvaNames].join(", ");
    const slots = extraProps.filter((x) => x.kind === "node")
      .map((x) => `        {${x.codeName} ? <span aria-hidden>{${x.codeName}}</span> : null}`);

    files.push({
      name: `${P}.tsx`,
      once: true,
      body: [
        imports.join("\n"),
        "",
        `const ${cvaName} = cva(`,
        `  ${q(TW_BASE)},`,
        `  {`,
        `    variants: {`,
        cvaVariants.join("\n"),
        `    },`,
        `    defaultVariants: {`,
        defaults.join("\n"),
        `    },`,
        `  },`,
        `);`,
        "",
        iface.join("\n"),
        "",
        `export const ${P} = forwardRef<React.ElementRef<${rootType}>, ${P}Props>(`,
        `  function ${P}({ ${destr} }, ref) {`,
        `    return (`,
        `      <${root}`,
        `        ref={ref}`,
        `        className={cn(${cvaName}({ ${cvaArgs} }), className)}`,
        `        data-testid=${q(cls)}`,
        `        {...rest}`,
        `      >`,
        ...slots,
        `        {children}`,
        `      </${root}>`,
        `    );`,
        `  },`,
        `);`,
        "",
      ].join("\n"),
    });
    return files;
  }

  throw new Error(`Unknown stack: ${stack}`);
}

/** css / css-modules 공용 스타일시트. 하드코딩 색 없음(가드 G10). */
function styleSheet(spec, { isModule, hasComponentTokens }) {
  const base = spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const cls = `ds-${base}`;
  const sel = (suffix) => (isModule ? (suffix ? `.${suffix}` : ".root") : suffix ? `.${cls}--${suffix}` : `.${cls}`);
  const t = (name, fallback) => (hasComponentTokens ? `var(--color-${base}-${name}, ${fallback})` : fallback);
  const enums = spec.props.filter((p) => p.kind === "enum");
  const L = [];
  L.push(`/* ${spec.name} — semantic/layout 토큰만 참조한다. primitive 직접 참조 금지(G1). */`);

  // 체크박스·라디오는 상자가 아니라 작은 표식 + 옆 글자다. 입력칸 스타일을 깔았다가 덮으면
  // 테두리·배경이 네이티브 표식에 새어 나온다 — 처음부터 따로 낸다.
  if (isField(spec) && choiceType(spec)) {
    const f = (n) => (isModule ? `.${n}` : `.${cls}__${n}`);
    L.push(`${sel()} {`);
    L.push(`  display: inline-flex;`);
    L.push(`  align-items: center;`);
    L.push(`  gap: calc(var(--spacing) * 2);`);
    L.push(`  font-family: var(--font-sans);`);
    L.push(`  font-size: var(--text-body-2);`);
    L.push(`  color: var(--color-text);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("field")} {`);
    L.push(`  width: calc(var(--spacing) * 4);`);
    L.push(`  height: calc(var(--spacing) * 4);`);
    L.push(`  margin: 0;`);
    L.push(`  accent-color: var(--color-primary);`);
    L.push(`  cursor: pointer;`);
    L.push(`}`);
    L.push("");
    L.push(`${f("field")}:focus-visible {`);
    L.push(`  outline: var(--border-width-thick) solid var(--color-primary);`);
    L.push(`  outline-offset: var(--border-width-thick);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("label")} { cursor: pointer; }`);
    L.push(`${f("field")}:disabled, ${f("field")}:disabled + ${f("label")} { color: var(--color-text-disabled); cursor: not-allowed; }`);
    L.push(`${f("field")}[aria-invalid="true"] { outline: var(--border-width-thin) solid var(--color-danger); outline-offset: var(--border-width-thin); }`);
    L.push("");
    return L.join("\n");
  }

  // 폼 요소는 라벨·입력칸·도움말이 세로로 쌓인 묶음이다. 칠해진 상자가 아니다.
  if (isField(spec)) {
    const f = (n) => (isModule ? `.${n}` : `.${cls}__${n}`);
    L.push(`${sel()} {`);
    L.push(`  display: inline-flex;`);
    L.push(`  flex-direction: column;`);
    L.push(`  gap: calc(var(--spacing) * 1.5);`);
    L.push(`  font-family: var(--font-sans);`);
    L.push(`  color: var(--color-text);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("label")} {`);
    L.push(`  font-size: var(--text-body-2);`);
    L.push(`  color: var(--color-text-secondary);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("field")} {`);
    L.push(`  min-height: calc(var(--spacing) * 8);`);
    L.push(`  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 3);`);
    L.push(`  border: var(--border-width-thin) solid var(--color-border-strong);`);
    L.push(`  border-radius: var(--radius-md);`);
    L.push(`  background: var(--color-surface-raised);`);
    L.push(`  color: inherit;`);
    L.push(`  font: inherit;`);
    L.push(`  font-size: var(--text-body-2);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("field")}:hover:not(:disabled) { border-color: var(--color-primary); }`);
    L.push("");
    L.push(`${f("field")}:focus-visible {`);
    L.push(`  outline: 2px solid var(--color-primary);`);
    L.push(`  outline-offset: 2px;`);
    L.push(`}`);
    L.push("");
    L.push(`${f("field")}:disabled {`);
    L.push(`  color: var(--color-text-disabled);`);
    L.push(`  background: var(--color-surface);`);
    L.push(`  cursor: not-allowed;`);
    L.push(`}`);
    L.push("");
    L.push(`/* 오류는 색만이 아니라 테두리 두께로도 구분된다. */`);
    L.push(`${f("field")}[aria-invalid="true"] {`);
    L.push(`  border-color: var(--color-danger);`);
    L.push(`  border-width: var(--border-width-thick);`);
    L.push(`}`);
    L.push("");
    L.push(`${f("help")} { font-size: var(--text-body-2); color: var(--color-text-secondary); }`);
    L.push(`${f("helpInvalid")}, ${f("help")}--invalid { font-size: var(--text-body-2); color: var(--color-danger); }`);
    L.push("");
    const sizeOnly = enums.find((p) => p.codeName === "size");
    if (sizeOnly) {
      const h = { l: 10, lg: 10, m: 8, md: 8, s: 7, sm: 7, xs: 6, xl: 12 };
      for (const o of sizeOnly.options) {
        L.push(`${sel(o.code)} ${f("field")} { min-height: calc(var(--spacing) * ${h[o.code] ?? 8}); }`);
      }
      L.push("");
    }
    return L.join("\n");
  }

  L.push(`${sel()} {`);
  L.push(`  display: inline-flex;`);
  L.push(`  align-items: center;`);
  L.push(`  justify-content: center;`);
  L.push(`  gap: calc(var(--spacing) * 2);`);
  L.push(`  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);`);
  L.push(`  border: var(--border-width-thin) solid transparent;`);
  L.push(`  border-radius: ${hasComponentTokens ? `var(--radius-${base}-radius, var(--radius-md))` : "var(--radius-md)"};`);
  L.push(`  font-family: var(--font-sans);`);
  L.push(`  font-size: var(--text-body-1);`);
  L.push(`  font-weight: var(--font-weight-medium);`);
  L.push(`  line-height: var(--leading-normal);`);
  L.push(`  background: ${t("bg", "var(--color-surface)")};`);
  L.push(`  color: ${t("fg", "var(--color-text)")};`);
  L.push(`  transition: background var(--duration-fast) var(--ease-standard);`);
  L.push(`}`);
  L.push("");
  const variantProp = enums.find((p) => p.codeName === "variant") ?? enums.find((p) => p.codeName !== "size");
  if (variantProp) {
    for (const o of variantProp.options) {
      L.push(`${sel(o.code)} {`);
      if (/^(danger|destructive|error|critical)/.test(o.code)) L.push(`  background: var(--color-danger);`, `  color: var(--color-on-primary);`);
      else if (/^(success|positive|ok)/.test(o.code)) L.push(`  background: var(--color-success);`, `  color: var(--color-on-primary);`);
      else if (/^(warning|caution|alert)/.test(o.code)) L.push(`  background: var(--color-warning);`, `  color: var(--color-on-primary);`);
      else if (/^(info|accent|brand)/.test(o.code)) L.push(`  background: var(--color-info);`, `  color: var(--color-on-primary);`);
      else if (/primary|default|solid|filled/.test(o.code)) L.push(`  background: var(--color-primary);`, `  color: var(--color-on-primary);`);
      else if (/outline|ghost|tertiary|text|link|plain/.test(o.code)) {
        L.push(`  background: transparent;`);
        L.push(`  border-color: ${/outline/.test(o.code) ? "var(--color-border-strong)" : "transparent"};`);
        L.push(`  color: var(--color-text);`);
      } else L.push(`  background: var(--color-surface-raised);`, `  color: var(--color-text);`, `  border-color: var(--color-border);`);
      L.push(`}`);
      L.push("");
    }
    if (/button|link|tab|menu|item|toggle|switch|option|chip/i.test(spec.name)) {
      const f = variantProp.options[0].code;
      L.push(`${sel(f)}:hover:not(:disabled) { background: var(--color-primary-hover); }`);
      L.push(`${sel(f)}:active:not(:disabled) { background: var(--color-primary-active); }`);
      L.push("");
    }
  }
  const sizeProp = enums.find((p) => p.codeName === "size");
  if (sizeProp) {
    const h = { l: 10, lg: 10, m: 8, md: 8, s: 7, sm: 7, xs: 6, xl: 12 };
    for (const o of sizeProp.options) L.push(`${sel(o.code)} { min-height: calc(var(--spacing) * ${h[o.code] ?? 8}); }`);
    L.push("");
  }
  L.push(`${sel()}:focus-visible {`, `  outline: 2px solid var(--color-primary);`, `  outline-offset: 2px;`, `}`);
  L.push("");
  L.push(`${sel()}:disabled,`, `${sel()}[aria-disabled="true"] {`, `  color: var(--color-text-disabled);`, `  cursor: not-allowed;`, `}`);
  L.push("");
  return L.join("\n");
}

function pascalCase(s) {
  return String(s ?? "").split(/[^A-Za-z0-9]+/).filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1)).join("") || "Default";
}

/**
 * 산출물 템플릿. 전부 결정적 — 같은 입력이면 같은 파일이 나온다.
 *
 * DSP `packages/ui/src/Button/{Button.stories.tsx,Button.figma.tsx}` 의 형태를
 * 그대로 따른다. 즉 이 스타터킷의 출력은 DSP 에 그대로 붙여 넣을 수 있다.
 */
import { figmaUrl } from "./components.mjs";

// 컴포넌트 구현·스타일 생성은 `stacks.mjs` 가 맡는다 (기술 스택별로 갈리므로).
// 여기에는 스택과 무관한 것만 남긴다: story · Code Connect · index.

const q = (s) => JSON.stringify(String(s ?? ""));

// Docs 의 inline Canvas 는 스토리 높이만큼만 영역을 잡는다. 떠 있는 패널은
// 그 영역 밖으로 나가 잘리므로 독립 프레임 안에서 충분한 높이를 준다.
const FLOATING_DOC_HEIGHT = {
  Modal: 480,
  Tooltip: 360,
  Toggletip: 360,
  Popover: 360,
  OverflowMenu: 440,
  Dropdown: 560,
  ComboBox: 560,
  MultiSelect: 560,
  DatePicker: 680,
  // overlay 는 화면 전체를 덮는다. inline 이면 Docs 페이지 전체가 가려진다.
  Loading: 320,
};

/**
 * 제어형 상태 prop → 비제어형 짝.
 *
 * story args 에 `checked: false` 처럼 제어형 값을 고정하면 눌러도 상태가 바뀌지 않는다
 * (onCheckedChange 를 받아 줄 쪽이 없다). 구현이 비제어형 prop 을 선언했으면 그쪽을 쓴다 —
 * 선언했는지는 생성기가 구현 파일을 읽어 `spec.uncontrolled` 에 넣어 준다.
 */
export const UNCONTROLLED = { open: "defaultOpen", checked: "defaultChecked", selected: "defaultSelected" };

/**
 * 예시 값 하나를 코드로. `{ "$jsx": "<svg …/>" }` 는 JSX 를 그대로 넣는다 —
 * JSON 으로는 아이콘 같은 노드를 줄 수 없어서다.
 */
function literal(v) {
  if (v && typeof v === "object" && !Array.isArray(v) && typeof v.$jsx === "string") return v.$jsx;
  return JSON.stringify(v);
}

/** enum prop 하나를 argTypes 한 줄로. */
function argType(p) {
  if (p.kind === "enum") {
    const opts = p.options.map((o) => q(o.code)).join(", ");
    const control = p.options.length <= 4 ? "inline-radio" : "select";
    return `    ${p.codeName}: { control: ${q(control)}, options: [${opts}] },`;
  }
  if (p.kind === "boolean") return `    ${p.codeName}: { control: "boolean" },`;
  if (p.kind === "string") return `    ${p.codeName}: { control: "text" },`;
  return `    ${p.codeName}: { control: false },`;
}

function defaultArgs(spec) {
  const rows = [];
  // 복합 컴포넌트는 컨테이너 prop 만으로는 빈 상자가 된다. 명세의 예시 데이터를 먼저 깐다.
  for (const [k, v] of Object.entries(spec.sampleArgs ?? {})) {
    rows.push(`${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${literal(v)}`);
  }
  const given = new Set(Object.keys(spec.sampleArgs ?? {}));
  for (const p of spec.props) {
    if (given.has(p.codeName)) continue;
    // 제어형 상태 prop 은 넣지 않는다(UNCONTROLLED 참고).
    if (spec.uncontrolled?.[p.codeName]) continue;
    if (p.codeName === "children") rows.push(`children: ${q(p.defaultValue || spec.name)}`);
    else if (p.kind === "enum" && p.defaultValue) rows.push(`${p.codeName}: ${q(p.defaultValue)}`);
    else if (p.kind === "boolean") rows.push(`${p.codeName}: ${Boolean(p.defaultValue)}`);
  }
  // 예시 데이터가 있으면 그게 의도다. children 을 억지로 끼워 넣지 않는다.
  // 폼 요소처럼 label 을 받는 컴포넌트는 children 을 그리지 않으므로 label 에 이름을 넣는다.
  if (!spec.sampleArgs && !spec.props.some((p) => p.codeName === "children")) {
    const hasLabel = spec.props.some((p) => p.codeName === "label" && p.kind === "string");
    rows.unshift(hasLabel ? `label: ${q(spec.name)}` : `children: ${q(spec.name)}`);
  }
  return rows.join(", ");
}

/**
 * 첫 스토리의 play. 최상위 요소가 실제 <button> 이면 존재 확인으로 끝내지 않고
 * 눌렀을 때 onClick 이 한 번 불리는지 본다(스파이는 Storybook 이 스토리마다 초기화한다).
 */
function firstPlay(spec, testId, clickable) {
  const lines = [];
  lines.push(clickable ? `  play: async ({ args, canvasElement }) => {` : `  play: async ({ canvasElement }) => {`);
  if (spec.portal) {
    lines.push(`    // document.body 로 렌더되므로 canvasElement 안에서는 찾을 수 없다.`);
    lines.push(`    const canvas = within(document.body);`);
    lines.push(`    void canvasElement;`);
  } else {
    lines.push(`    const canvas = within(canvasElement);`);
  }
  if (clickable) {
    lines.push(`    await userEvent.click(canvas.getByTestId(${q(testId)}));`);
    lines.push(`    await expect(args.onClick).toHaveBeenCalledTimes(1);`);
  } else {
    lines.push(`    await expect(canvas.getByTestId(${q(testId)})).toBeInTheDocument();`);
  }
  lines.push(`  },`);
  return lines;
}

export function storyFile(spec, { description }) {
  const P = spec.pascal;
  const url = figmaUrl(spec);
  const enums = spec.props.filter((p) => p.kind === "enum");
  const [first, second] = enums;
  const testId = `ds-${spec.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const names = storyNamer(first ? [] : ["Default"]);
  const clickable = spec.element === "button";

  const lines = [];
  lines.push(`import type { Meta, StoryObj } from "@storybook/react";`);
  lines.push(`import { ${clickable ? "expect, fn, userEvent, within" : "expect, within"} } from "@storybook/test";`);
  lines.push(`import { ${P} } from "./${P}";`);
  lines.push("");
  if (url) lines.push(`const FIGMA_URL =\n  ${q(url)};`, "");
  lines.push(`const meta = {`);
  lines.push(`  title: ${q(`Components/${P}`)},`);
  lines.push(`  component: ${P},`);
  lines.push(`  tags: ["autodocs"],`);
  lines.push(`  parameters: {`);
  lines.push(`    layout: "centered",`);
  if (url) lines.push(`    design: { type: "figma", url: FIGMA_URL },`);
  const frameHeight = FLOATING_DOC_HEIGHT[spec.name];
  if (description || frameHeight) {
    const docs = [
      ...(description ? [`description: { component: ${q(description)} }`] : []),
      ...(frameHeight ? [`story: { inline: false, iframeHeight: ${frameHeight} }`] : []),
    ];
    lines.push(`    docs: { ${docs.join(", ")} },`);
  }
  lines.push(`  },`);
  lines.push(`  args: { ${[defaultArgs(spec), clickable && "onClick: fn()"].filter(Boolean).join(", ")} },`);
  if (spec.props.length) {
    lines.push(`  argTypes: {`);
    for (const p of spec.props) lines.push(argType(p));
    lines.push(`  },`);
  }
  lines.push(`} satisfies Meta<typeof ${P}>;`);
  lines.push("");
  lines.push(`export default meta;`);
  lines.push(`type Story = StoryObj<typeof meta>;`);
  lines.push("");

  // 첫 enum 의 값마다 스토리 하나. enum 이 없으면 Default 하나.
  if (first) {
    first.options.forEach((o, i) => {
      const name = names(o.code, first.codeName);
      lines.push(`export const ${name}: Story = {`);
      lines.push(`  args: { ${first.codeName}: ${q(o.code)} },`);
      if (i === 0) lines.push(...firstPlay(spec, testId, clickable));
      lines.push(`};`);
      lines.push("");
    });
  } else {
    lines.push(`export const Default: Story = {`);
    lines.push(...firstPlay(spec, testId, clickable));
    lines.push(`};`);
    lines.push("");
  }

  for (const p of spec.props.filter((x) => x.kind === "boolean")) {
    const uncontrolled = spec.uncontrolled?.[p.codeName];
    if (uncontrolled) {
      lines.push(`export const ${names(p.codeName, "is")}: Story = { args: { ${uncontrolled}: true } };`);
    } else if (clickable && p.codeName === "disabled") {
      // disabled 는 모양이 아니라 동작이다. 눌러도 콜백이 불리지 않아야 한다.
      // pointer-events: none 인 버튼도 클릭을 시도할 수 있게 검사를 끈다.
      lines.push(`export const ${names(p.codeName, "is")}: Story = {`);
      lines.push(`  args: { disabled: true },`);
      lines.push(`  play: async ({ args, canvasElement }) => {`);
      lines.push(`    const canvas = within(canvasElement);`);
      lines.push(`    await userEvent.click(canvas.getByTestId(${q(testId)}), { pointerEventsCheck: 0 });`);
      lines.push(`    await expect(args.onClick).not.toHaveBeenCalled();`);
      lines.push(`  },`);
      lines.push(`};`);
    } else {
      lines.push(`export const ${names(p.codeName, "is")}: Story = { args: { ${p.codeName}: true } };`);
    }
    lines.push("");
  }

  // Figma 대조용 행렬. enum 2개면 2차원, 1개면 1행.
  // 처음부터 열려 있는 오버레이(모달)는 행렬로 그리면 서로 겹쳐 가려질 뿐이라 건너뛴다.
  const opensOnMount = spec.portal && (spec.sampleArgs?.open || spec.sampleArgs?.defaultOpen);
  if (first && !opensOnMount) {
    lines.push(`/** Every Figma variant side by side, to compare with Figma — ${first.figmaName}${second ? ` × ${second.figmaName}` : ""}. */`);
    lines.push(`export const ${names("matrix", "variant")}: Story = {`);
    lines.push(`  parameters: { controls: { disable: true } },`);
    lines.push(`  render: (args) => (`);
    lines.push(`    <div style={{ display: "grid", gap: 16 }}>`);
    lines.push(`      {(${JSON.stringify(first.options.map((o) => o.code))} as const).map((${first.codeName}) => (`);
    lines.push(`        <div key={${first.codeName}} style={{ display: "flex", gap: 12, alignItems: "center" }}>`);
    if (second) {
      lines.push(`          {(${JSON.stringify(second.options.map((o) => o.code))} as const).map((${second.codeName}) => (`);
      lines.push(`            <${P} key={${second.codeName}} {...args} ${first.codeName}={${first.codeName}} ${second.codeName}={${second.codeName}} />`);
      lines.push(`          ))}`);
    } else {
      lines.push(`          <${P} {...args} ${first.codeName}={${first.codeName}} />`);
    }
    lines.push(`        </div>`);
    lines.push(`      ))}`);
    lines.push(`    </div>`);
    lines.push(`  ),`);
    lines.push(`};`);
    lines.push("");
  }

  if (spec.pseudoStates.length) {
    lines.push(`/* Figma 의 State variant(${spec.pseudoStates.join(", ")})는 prop 이 아니다.`);
    lines.push(`   코드에서는 CSS 의사클래스(:hover/:active/:focus-visible)와 disabled 속성이 처리한다.`);
    lines.push(`   실제 상호작용과 어긋나지 않도록 story 로 고정하지 않는다. */`);
    lines.push("");
  }
  return lines.join("\n");
}

export function codeConnectFile(spec) {
  const P = spec.pascal;
  const url = figmaUrl(spec);
  const lines = [];
  lines.push(`import figma from "@figma/code-connect";`);
  lines.push(`import { ${P} } from "./${P}";`);
  lines.push("");
  lines.push(`figma.connect(${P}, ${q(url)}, {`);
  lines.push(`  props: {`);
  for (const p of spec.props) {
    if (p.kind === "enum") {
      const map = p.options.map((o) => `      ${JSON.stringify(o.figma)}: ${q(o.code)},`).join("\n");
      lines.push(`    ${p.codeName}: figma.enum(${q(p.figmaName)}, {`);
      lines.push(map);
      lines.push(`    }),`);
    } else if (p.kind === "boolean") {
      lines.push(`    ${p.codeName}: figma.boolean(${q(p.figmaName)}),`);
    } else if (p.kind === "string") {
      lines.push(`    ${p.codeName}: figma.string(${q(p.figmaName)}),`);
    } else if (p.kind === "node") {
      lines.push(`    ${p.codeName}: figma.instance(${q(p.figmaName)}),`);
    }
  }
  lines.push(`  },`);
  const args = spec.props.map((p) => p.codeName);
  const children = args.includes("children");
  const attrs = spec.props.filter((p) => p.codeName !== "children").map((p) => `${p.codeName}={${p.codeName}}`).join(" ");
  lines.push(`  example: ({ ${args.join(", ")} }) => (`);
  lines.push(children ? `    <${P} ${attrs}>{children}</${P}>` : `    <${P} ${attrs} />`);
  lines.push(`  ),`);
  lines.push(`});`);
  lines.push("");
  return lines.join("\n");
}

export function indexFile(spec, { reexport = false } = {}) {
  const P = spec.pascal;
  if (reexport) {
    // 네임스페이스만 내보내는 골격에는 컴포넌트도 Props 타입도 없다.
    return `export { ${P}Primitive } from "./${P}";\n`;
  }
  return `export { ${P} } from "./${P}";\nexport type { ${P}Props } from "./${P}";\n`;
}

/**
 * story export 이름 짓기. 변수 이름이 되어야 하고 겹치면 안 된다.
 *
 *   - 숫자로 시작하면(Figma 의 "2XL") 앞에 prop 이름을 붙인다: Size2Xl
 *   - 이미 쓴 이름이면(enum 값 "disabled" 와 boolean disabled) prop 이름을 붙이고,
 *     그래도 겹치면 숫자를 붙인다.
 * 둘 다 그대로 두면 `export const 2Xl` · 중복 export 로 story 파일 전체가 깨진다.
 */
export function storyNamer(reserved = []) {
  const taken = new Set(reserved);
  return (raw, prop) => {
    const prefix = pascalCase(prop);
    let name = pascalCase(raw);
    if (/^\d/.test(name)) name = `${prefix}${name}`;
    if (taken.has(name)) name = `${prefix}${name}`;
    let n = 2;
    const base = name;
    while (taken.has(name)) name = `${base}${n++}`;
    taken.add(name);
    return name;
  };
}

function pascalCase(s) {
  return String(s ?? "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("") || "Default";
}

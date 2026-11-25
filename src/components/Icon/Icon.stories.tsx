import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { IconButton } from "../IconButton";
import { Icon } from "./Icon";
import type { IconName, IconSize, IconTone, IconProps } from "./Icon";

const names: IconName[] = ["add", "close", "search"];
const sizes: IconSize[] = ["sm", "md", "lg"];
const tones: IconTone[] = ["inherit", "default", "secondary"];
const rootRef = createRef<SVGSVGElement>();
const onClick = fn();
const onDisabledClick = fn();

const meta = {
  title: "Components/Icon",
  component: Icon,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <>
    <style>{"body { background: var(--color-bg); }"}</style>
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)", padding: "calc(var(--spacing) * 4)" }}><Story /></div>
  </>],
  args: { name: "add" },
  argTypes: {
    name: { control: "inline-radio", options: names },
    size: { control: "inline-radio", options: sizes },
    tone: { control: "inline-radio", options: tones },
  },
} satisfies Meta<typeof Icon>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Checks the approved original's geometry and ARIA, and the standalone size and color worked out from tokens. */
async function checkIcon(element: SVGSVGElement, props: IconProps) {
  const { name, size = "md", tone = "inherit", decorative = true, label } = props;
  await expect(element).toHaveAttribute("viewBox", "0 0 16 16");
  await expect(element).toHaveAttribute("fill", "currentColor");
  await expect(element).toHaveAttribute("focusable", "false");
  await expect(element).not.toHaveAttribute("tabindex");
  await expect(element).not.toHaveAttribute("transform");
  if (decorative) {
    await expect(element).toHaveAttribute("aria-hidden", "true");
    await expect(element).not.toHaveAttribute("role");
    await expect(element).not.toHaveAttribute("aria-label");
  } else {
    await expect(element).not.toHaveAttribute("aria-hidden");
    await expect(element).toHaveAttribute("role", "img");
    await expect(element).toHaveAccessibleName(label!);
  }
  const path = element.querySelector("path")!;
  await expect(element.querySelectorAll("path")).toHaveLength(1);
  await expect(path).toHaveAttribute("d", {
    add: "M8 3v10M3 8h10", close: "M4 4l8 8M12 4l-8 8", search: "M10.5 10.5L14 14",
  }[name]);
  await expect(path).toHaveAttribute("stroke", "currentColor");
  await expect(path).toHaveAttribute("stroke-width", name === "add" ? "1.6" : "1.5");
  await expect(path).toHaveAttribute("stroke-linecap", "round");
  await expect(path).not.toHaveAttribute("transform");
  if (name === "search") {
    const circle = element.querySelector("circle")!;
    await expect(element.querySelectorAll("circle")).toHaveLength(1);
    for (const [attr, value] of Object.entries({ cx: "7", cy: "7", r: "4.5", stroke: "currentColor", "stroke-width": "1.5", fill: "none" })) {
      await expect(circle).toHaveAttribute(attr, value);
    }
    await expect(path).not.toHaveAttribute("fill");
  } else {
    await expect(element.querySelector("circle")).toBeNull();
    await expect(path).toHaveAttribute("fill", "none");
  }
  const win = element.ownerDocument.defaultView!;
  const actual = win.getComputedStyle(element);
  const spacing = parseFloat(actual.getPropertyValue("--spacing"));
  const expectedSize = spacing * { sm: 3, md: 4, lg: 5 }[size];
  await expect(parseFloat(actual.width)).toBe(expectedSize);
  await expect(parseFloat(actual.height)).toBe(expectedSize);
  const probe = element.ownerDocument.createElement("span");
  probe.style.color = tone === "inherit" ? "inherit" : `var(--color-text${tone === "secondary" ? "-secondary" : ""})`;
  probe.style.backgroundColor = "var(--color-bg)";
  element.parentElement!.append(probe);
  try {
    await expect(actual.color).toBe(win.getComputedStyle(probe).color);
    await expect(win.getComputedStyle(element.ownerDocument.body).backgroundColor).toBe(win.getComputedStyle(probe).backgroundColor);
  }
  finally { probe.remove(); }
}

export const Default: Story = {
  render: (args) => <Icon {...args} ref={rootRef} />,
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const element = canvas.getByTestId("ds-icon") as unknown as SVGSVGElement;
    await expect(rootRef.current).toBe(element);
    await checkIcon(element, args);
    if (args.decorative !== false) await expect(canvas.queryByRole("img")).toBeNull();
  },
};

export const Close: Story = {
  args: { name: "close" },
  play: async ({ args, canvasElement }) => {
    await checkIcon(within(canvasElement).getByTestId("ds-icon") as unknown as SVGSVGElement, args);
  },
};

export const Search: Story = {
  args: { name: "search" },
  play: async ({ args, canvasElement }) => {
    await checkIcon(within(canvasElement).getByTestId("ds-icon") as unknown as SVGSVGElement, args);
  },
};

export const Assets: Story = {
  render: (args) => <div style={{ display: "flex", gap: "calc(var(--spacing) * 3)" }}>
    {names.map((name) => <Icon key={name} {...args} name={name} />)}
  </div>,
  play: async ({ args, canvasElement }) => {
    const elements = within(canvasElement).getAllByTestId("ds-icon");
    await expect(elements).toHaveLength(3);
    for (const [index, name] of names.entries()) await checkIcon(elements[index] as unknown as SVGSVGElement, { ...args, name });
  },
};

export const Sizes: Story = {
  render: (args) => <div style={{ display: "flex", gap: "calc(var(--spacing) * 3)" }}>
    {sizes.map((size) => <Icon key={size} {...args} size={size} />)}
  </div>,
  play: async ({ args, canvasElement }) => {
    const elements = within(canvasElement).getAllByTestId("ds-icon");
    for (const [index, size] of sizes.entries()) await checkIcon(elements[index] as unknown as SVGSVGElement, { ...args, size });
  },
};

export const Tones: Story = {
  render: (args) => <div style={{ display: "flex", gap: "calc(var(--spacing) * 3)", color: "var(--color-text-secondary)" }}>
    {tones.map((tone) => <Icon key={tone} {...args} tone={tone} />)}
  </div>,
  play: async ({ args, canvasElement }) => {
    const elements = within(canvasElement).getAllByTestId("ds-icon");
    for (const [index, tone] of tones.entries()) await checkIcon(elements[index] as unknown as SVGSVGElement, { ...args, tone });
  },
};

export const Meaningful: Story = {
  args: { name: "search", decorative: false, label: "Search" },
  play: async ({ args, canvasElement }) => {
    const element = within(canvasElement).getByRole("img", { name: args.label }) as unknown as SVGSVGElement;
    await checkIcon(element, args);
  },
};

/** 3 names × 3 sizes × 3 tones × 2 modes (decorative / meaningful). */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => <div style={{ display: "grid", gap: "calc(var(--spacing) * 3)" }}>
    {names.flatMap((name) => sizes.flatMap((size) => tones.flatMap((tone) => [true, false].map((decorative) => (
      <div key={`${name}-${size}-${tone}-${decorative}`}>
        <Icon name={name} size={size} tone={tone} decorative={decorative} label={decorative ? undefined : `${name} ${size} ${tone}`} />
        {` ${name} / ${size} / ${tone} / ${decorative ? "decorative" : "meaningful"}`}
      </div>
    )))))}
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const elements = canvas.getAllByTestId("ds-icon");
    await expect(elements).toHaveLength(54);
    await expect(canvas.getAllByRole("img")).toHaveLength(27);
    let index = 0;
    for (const name of names) for (const size of sizes) for (const tone of tones) for (const decorative of [true, false]) {
      await checkIcon(elements[index++] as unknown as SVGSVGElement, { name, size, tone, decorative, label: decorative ? undefined : `${name} ${size} ${tone}` });
    }
  },
};

/** Wrong input is checked in an isolated server render, so no error screen is left on the normal canvas. */
export const InputContract: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Icon name="add" />,
  play: async ({ canvasElement }) => {
    await checkIcon(within(canvasElement).getByTestId("ds-icon") as unknown as SVGSVGElement, { name: "add" });
    const invalidNames = ["missing", "toString", "__proto__"];
    for (const name of invalidNames) {
      await expect(() => renderToStaticMarkup(<Icon name={name as IconName} />)).toThrow("name is not registered");
    }
    for (const label of [undefined, "", "   "]) {
      await expect(() => renderToStaticMarkup(<Icon name="search" decorative={false} label={label} />)).toThrow("non-empty label");
    }
    await expect(() => renderToStaticMarkup(<Icon name="add" label="중복 이름" />)).toThrow("label in decorative mode");
    await expect(() => renderToStaticMarkup(<Icon name="close" decorative={false} label="닫기" />)).not.toThrow();
  },
};

/** Uses only the existing public IconButton API. The slot size and color, click, Tab and disabled belong to the parent. */
export const WithIconButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => <div style={{ display: "flex", gap: "calc(var(--spacing) * 3)" }}>
    <IconButton size="L" label="Search L" icon={<Icon name="search" />} onClick={onClick} />
    <IconButton size="S" label="Search S" icon={<Icon name="search" />} onClick={onClick} />
    <IconButton disabled label="Search (disabled)" icon={<Icon name="search" />} onClick={onDisabledClick} />
    <IconButton label="Next action" icon={<Icon name="add" />} onClick={onClick} />
  </div>,
  play: async ({ canvasElement }) => {
    onClick.mockClear();
    onDisabledClick.mockClear();
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole("button");
    await expect(buttons).toHaveLength(5);
    await expect(canvas.queryByRole("img")).toBeNull();
    for (const [index, button] of buttons.entries()) {
      const svg = button.querySelector("svg")!;
      const slot = svg.parentElement!;
      const win = button.ownerDocument.defaultView!;
      const expectedSize = parseFloat(win.getComputedStyle(button).getPropertyValue("--spacing")) * (index === 2 ? 5 : 4);
      await expect(parseFloat(win.getComputedStyle(svg).width)).toBe(expectedSize);
      await expect(parseFloat(win.getComputedStyle(svg).height)).toBe(expectedSize);
      await expect(svg.getBoundingClientRect().width).toBe(slot.getBoundingClientRect().width);
      await expect(win.getComputedStyle(svg).color).toBe(win.getComputedStyle(button).color);
      await expect(button).toHaveAccessibleName(button.getAttribute("aria-label")!);
      await expect(svg).toHaveAttribute("aria-hidden", "true");
      await expect(svg).not.toHaveAttribute("tabindex");
      await userEvent.click(button);
    }
    await expect(onClick).toHaveBeenCalledTimes(4);
    await expect(onDisabledClick).not.toHaveBeenCalled();
    await expect(buttons[3]).toBeDisabled();
    buttons[0]!.focus();
    await userEvent.tab();
    await expect(buttons[1]).toHaveFocus();
    await userEvent.tab();
    await expect(buttons[2]).toHaveFocus();
    await userEvent.tab();
    await expect(buttons[4]).toHaveFocus();
  },
};

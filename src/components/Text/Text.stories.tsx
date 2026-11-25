import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";
import { Button } from "../Button";
import { Text } from "./Text";
import type { TextAs, TextVariant, TextTone } from "./Text";

const tags: TextAs[] = ["span", "p", "h1", "h2", "h3", "h4", "h5", "h6"];
const variants: TextVariant[] = ["body", "body-sm", "title"];
const tones: TextTone[] = ["default", "secondary"];
const rootRef = createRef<HTMLElement>();
const keyboardClick = fn();

const meta = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [(Story) => <>
    <style>{"body { background: var(--color-bg); }"}</style>
    <div style={{ background: "var(--color-bg)", color: "var(--color-text)", padding: "calc(var(--spacing) * 4)" }}><Story /></div>
  </>],
  args: { children: "Starter text" },
  argTypes: {
    as: { control: "select", options: tags },
    variant: { control: "inline-radio", options: variants },
    tone: { control: "inline-radio", options: tones },
  },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Reads the tokens with a separate probe and compares them with the real component's CSS. */
async function checkTypography(element: HTMLElement, variant: TextVariant, tone: TextTone) {
  const doc = element.ownerDocument;
  const probe = doc.createElement("span");
  const size = { body: "--text-body-1", "body-sm": "--text-body-2", title: "--text-title" }[variant];
  probe.style.fontFamily = "var(--font-sans)";
  probe.style.fontSize = `var(${size})`;
  probe.style.fontWeight = `var(--font-weight-${variant === "title" ? "medium" : "regular"})`;
  probe.style.lineHeight = `var(--leading-${variant === "title" ? "tight" : "normal"})`;
  probe.style.color = `var(--color-text${tone === "secondary" ? "-secondary" : ""})`;
  probe.style.backgroundColor = "var(--color-bg)";
  element.parentElement!.append(probe);
  try {
    const actual = doc.defaultView!.getComputedStyle(element);
    const expected = doc.defaultView!.getComputedStyle(probe);
    await expect(doc.defaultView!.getComputedStyle(doc.body).backgroundColor).toBe(expected.backgroundColor);
    for (const property of ["fontFamily", "fontSize", "fontWeight", "lineHeight", "color"] as const) {
      await expect(actual[property]).toBe(expected[property]);
    }
    await expect(parseFloat(actual.marginTop)).toBe(0);
    await expect(parseFloat(actual.marginBottom)).toBe(0);
    await expect(element).not.toHaveAttribute("tabindex");
  } finally { probe.remove(); }
}

export const Default: Story = {
  render: (args) => <Text {...args} ref={rootRef} />,
  play: async ({ args, canvasElement }) => {
    const element = within(canvasElement).getByTestId("ds-text");
    await expect(element.tagName.toLowerCase()).toBe(args.as ?? "span");
    await expect(element).toHaveTextContent(String(args.children));
    await expect(rootRef.current).toBe(element);
    await checkTypography(element, args.variant ?? "body", args.tone ?? "default");
  },
};

export const BodySmall: Story = {
  args: { as: "p", variant: "body-sm", tone: "secondary", children: "Secondary text", id: "text-detail", lang: "en", dir: "auto" },
  play: async ({ args, canvasElement }) => {
    const element = within(canvasElement).getByTestId("ds-text");
    await expect(element.tagName).toBe("P");
    await expect(element).toHaveTextContent(String(args.children));
    await expect(element).toHaveAttribute("id", args.id);
    await expect(element).toHaveAttribute("lang", args.lang);
    await expect(element).toHaveAttribute("dir", args.dir);
    await checkTypography(element, args.variant!, args.tone!);
  },
};

export const Title: Story = {
  args: { as: "h1", variant: "title", children: "Page title" },
  play: async ({ args, canvasElement }) => {
    const element = within(canvasElement).getByRole("heading", { level: 1, name: String(args.children) });
    await expect(element.tagName).toBe("H1");
    await checkTypography(element, "title", "default");
  },
};

/** 8 tags × 3 presets × 2 tones. Checks the look and the meaning separately. */
export const Matrix: Story = {
  parameters: { controls: { disable: true } },
  render: () => <div style={{ display: "grid", gap: "calc(var(--spacing) * 3)" }}>
    {tags.flatMap((as) => variants.flatMap((variant) => tones.map((tone) => (
      <Text key={`${as}-${variant}-${tone}`} as={as} variant={variant} tone={tone}>{`${as} / ${variant} / ${tone}`}</Text>
    ))))}
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const elements = canvas.getAllByTestId("ds-text");
    await expect(elements).toHaveLength(48);
    let index = 0;
    for (const as of tags) for (const variant of variants) for (const tone of tones) {
      const element = elements[index++]!;
      const text = `${as} / ${variant} / ${tone}`;
      await expect(element.tagName.toLowerCase()).toBe(as);
      await expect(element).toHaveTextContent(text);
      if (as.startsWith("h")) await expect(canvas.getByRole("heading", { level: Number(as[1]), name: text })).toBe(element);
      else await expect(element).not.toHaveAttribute("role");
      await checkTypography(element, variant, tone);
    }
  },
};

/** Checks that static Text does not get in the way when Tab moves between buttons. */
export const KeyboardFlow: Story = {
  parameters: { controls: { disable: true } },
  render: () => <div>
    <Button onClick={keyboardClick}>Previous action</Button>
    <Text>Static text</Text>
    <Button onClick={keyboardClick}>Next action</Button>
  </div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [before, after] = canvas.getAllByRole("button");
    keyboardClick.mockClear();
    await userEvent.click(before!);
    await userEvent.click(after!);
    await expect(keyboardClick).toHaveBeenCalledTimes(2);
    before!.focus();
    await userEvent.tab();
    await expect(after).toHaveFocus();
    await expect(canvas.getByTestId("ds-text")).not.toHaveAttribute("tabindex");
    await userEvent.tab({ shift: true });
    await expect(before).toHaveFocus();
  },
};

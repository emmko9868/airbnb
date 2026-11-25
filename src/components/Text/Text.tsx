import { forwardRef } from "react";
import type { ReactNode, Ref } from "react";
import "./Text.css";

export type TextAs = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextVariant = "body" | "body-sm" | "title";
export type TextTone = "default" | "secondary";

export interface TextProps {
  /** The text to show. Give headings meaningful text. */
  children: ReactNode;
  /** Meaning in the document (which HTML tag is used, such as a paragraph or a heading). Independent of the visual preset. */
  as?: TextAs;
  /** An approved combination of typography tokens. */
  variant?: TextVariant;
  /** Semantic color of the text. */
  tone?: TextTone;
  id?: string;
  lang?: string;
  dir?: "ltr" | "rtl" | "auto";
}

/** Single source for static text and native headings. Starter spec Text revision 2. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { children, as = "span", variant = "body", tone = "default", id, lang, dir },
  ref,
) {
  const Tag = as;
  // 공개 ref는 HTMLElement다. 닫힌 태그 집합은 모두 네이티브 HTMLElement다.
  return (
    <Tag ref={ref as Ref<HTMLParagraphElement>} id={id} lang={lang} dir={dir}
      className={`ds-text ds-text--${variant} ds-text--${tone}`} data-testid="ds-text">
      {children}
    </Tag>
  );
});

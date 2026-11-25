import { forwardRef } from "react";
import "./Icon.css";

export type IconName = "add" | "close" | "search";
export type IconSize = "sm" | "md" | "lg";
export type IconTone = "inherit" | "default" | "secondary";

export interface IconProps {
  /** One name from a fixed list of icons whose source has been checked. */
  name: IconName;
  /** Size when the icon is shown on its own. Inside an IconButton, it follows the parent slot's size. */
  size?: IconSize;
  /** With inherit, the icon follows the parent's semantic color. */
  tone?: IconTone;
  /** Decorative icons are hidden from screen readers; meaningful mode (false) requires a label. */
  decorative?: boolean;
  /** The accessible name in meaningful mode. Do not provide it in decorative mode. */
  label?: string;
}

/**
 * Original sources in this repository for the approved spec Icon revision 2. Every viewBox is 0 0 16 16.
 * add: src/components/IconButton/IconButton.stories.tsx
 * close: src/components/Modal/Modal.tsx
 * search: src/components/Search/Search.tsx
 * The original geometry, stroke and fill are kept unchanged. These are not student Figma assets.
 */
const glyphs = {
  add: <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" fill="none" />,
  close: <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth={1.5} fill="none" strokeLinecap="round" />,
  search: <>
    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth={1.5} fill="none" />
    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
  </>,
};

/** A single-color SVG icon. Clicks and navigation belong to the parent Button/IconButton/Link. */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = "md", tone = "inherit", decorative = true, label },
  ref,
) {
  if (!Object.hasOwn(glyphs, name)) throw new Error(`Icon: name is not registered: ${String(name)}`);
  if (decorative && label !== undefined) throw new Error("Icon: do not provide a label in decorative mode.");
  if (!decorative && (typeof label !== "string" || label.trim().length === 0)) {
    throw new Error("Icon: meaningful mode needs a non-empty label.");
  }

  return (
    <svg
      ref={ref}
      className={`ds-icon ds-icon--${size} ds-icon--${tone}`}
      data-testid="ds-icon"
      viewBox="0 0 16 16"
      fill="currentColor"
      focusable="false"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
    >
      {glyphs[name]}
    </svg>
  );
});

import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import "./Link.css";
import { useText } from "../../lib/i18n";

export type LinkVariant = "default" | "inline";
export type LinkSize = "sm" | "md";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Figma: Variant — `inline` is a link inside a sentence (always underlined). */
  variant?: LinkVariant;
  /** Figma: Size */
  size?: LinkSize;
  /** Figma: Disabled — removes `href` so the link does not go anywhere. */
  disabled?: boolean;
  /** Figma: External — opens in a new window and tells screen readers that it does. */
  external?: boolean;
  children?: ReactNode;
}

/**
 * A text link. Use it only to go to another page — to run an action, use Button.
 *
 * When disabled, it removes `href` and adds `aria-disabled`. `<a>` has no disabled attribute, so
 * changing only the class would still take you to the page when clicked.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { variant = "default", size = "md", disabled = false, external = false, className, children, href, target, rel, ...rest },
  ref,
) {
  const t = useText();
  const classes = [
    "ds-link",
    `ds-link--${variant}`,
    `ds-link--${size}`,
    disabled && "ds-link--disabled",
    external && "ds-link--external",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      ref={ref}
      className={classes}
      data-testid="ds-link"
      href={disabled ? undefined : href}
      role={disabled ? "link" : undefined}
      aria-disabled={disabled || undefined}
      target={external ? (target ?? "_blank") : target}
      rel={external ? (rel ?? "noopener noreferrer") : rel}
      {...rest}
    >
      {children}
      {external ? (
        <>
          <svg className="ds-link__external" viewBox="0 0 16 16" width="12" height="12" aria-hidden focusable="false">
            <path d="M9 3h4v4M13 3L7 9M11 9.5V13H3V5h3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="ds-link__sr">{t.newWindow}</span>
        </>
      ) : null}
    </a>
  );
});

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Breadcrumb.css";
import { useText } from "../../lib/i18n";

export type BreadcrumbSize = "sm" | "md";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** An action to run instead of following a link. Do not use it together with href. */
  onSelect?: () => void;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Figma: Size */
  size?: BreadcrumbSize;
  /** Figma: NoTrailingSlash */
  noTrailingSlash?: boolean;
  items?: BreadcrumbItem[];
  label?: string;
  children?: ReactNode;
}

/**
 * A trail of links showing where the current page sits in the site.
 *
 * The last item is the **current page**, so it is not a link — it gets `aria-current="page"` and
 * stays as plain text. A link that leads to the page you are already on confuses people.
 * The separators are `aria-hidden`, so screen readers don't read out "slash".
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { size = "md", noTrailingSlash = false, items = [], label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.breadcrumb;
  const classes = ["ds-breadcrumb", `ds-breadcrumb--${size}`, className].filter(Boolean).join(" ");

  return (
    <nav ref={ref} className={classes} data-testid="ds-breadcrumb" aria-label={label} {...rest}>
      <ol className="ds-breadcrumb__list">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="ds-breadcrumb__item">
              {last ? (
                <span className="ds-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <a className="ds-breadcrumb__link" href={item.href}>
                  {item.label}
                </a>
              ) : (
                <button type="button" className="ds-breadcrumb__link" onClick={item.onSelect}>
                  {item.label}
                </button>
              )}
              {!last || !noTrailingSlash ? (
                <span className="ds-breadcrumb__sep" aria-hidden>
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
      {children}
    </nav>
  );
});

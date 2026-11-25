import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./ContainedList.css";

export type ContainedListSize = "sm" | "md" | "lg";
export type ContainedListVariant = "on-page" | "disclosed";

export interface ContainedListEntry {
  id: string;
  label: string;
  meta?: string;
  onSelect?: () => void;
  disabled?: boolean;
}

export interface ContainedListProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: ContainedListSize;
  /** Figma: Variant */
  variant?: ContainedListVariant;
  title?: string;
  items?: ContainedListEntry[];
  action?: ReactNode;
  children?: ReactNode;
}

/**
 * A list with a title.
 *
 * The title and the list are tied together with `aria-labelledby`, so screen readers first say "what this is a list of".
 * If items can be clicked, use a `button` — an `li` with only onClick can't be pressed with the keyboard.
 */
export const ContainedList = forwardRef<HTMLDivElement, ContainedListProps>(function ContainedList(
  { size = "md", variant = "on-page", title, items = [], action, className, children, ...rest },
  ref,
) {
  const titleId = useId();
  const classes = ["ds-containedlist", `ds-containedlist--${size}`, `ds-containedlist--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-containedlist" {...rest}>
      {title ? (
        <div className="ds-containedlist__head">
          <h3 id={titleId} className="ds-containedlist__title">{title}</h3>
          {action ? <div className="ds-containedlist__action">{action}</div> : null}
        </div>
      ) : null}
      <ul className="ds-containedlist__list" aria-labelledby={title ? titleId : undefined}>
        {items.map((item) => (
          <li key={item.id} className="ds-containedlist__item">
            {item.onSelect ? (
              <button type="button" className="ds-containedlist__row" onClick={item.onSelect} disabled={item.disabled}>
                <span className="ds-containedlist__label">{item.label}</span>
                {item.meta ? <span className="ds-containedlist__meta">{item.meta}</span> : null}
              </button>
            ) : (
              <div className="ds-containedlist__row">
                <span className="ds-containedlist__label">{item.label}</span>
                {item.meta ? <span className="ds-containedlist__meta">{item.meta}</span> : null}
              </div>
            )}
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
});

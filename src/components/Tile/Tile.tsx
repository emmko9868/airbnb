import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from "react";
import "./Tile.css";

export type TileVariant = "base" | "clickable" | "selectable" | "expandable";

export interface TileProps extends HTMLAttributes<HTMLElement> {
  /** Figma: Variant */
  variant?: TileVariant;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Selected — whether a selectable tile is selected (controlled). */
  selected?: boolean;
  /** Whether a selectable tile starts out selected (uncontrolled). */
  defaultSelected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
  /** Set this when a clickable tile goes to another page. If set, the tile is drawn as an `<a>` link. */
  href?: string;
  /** Content shown when an expandable tile is opened. */
  details?: ReactNode;
  defaultExpanded?: boolean;
  children?: ReactNode;
}

/**
 * Tile — a surface that holds content. Each variant behaves differently.
 *
 *   base        plain surface
 *   clickable   the whole tile is one link/button (`<a>` if href is set, otherwise role=button)
 *   selectable  role=checkbox — click to select; Space also toggles it
 *   expandable  a title button (aria-expanded) opens the details
 */
export const Tile = forwardRef<HTMLElement, TileProps>(function Tile(
  { variant = "base", disabled = false, selected, defaultSelected = false, onSelectedChange, href, details, defaultExpanded = false, className, children, onClick, onKeyDown, ...rest },
  ref,
) {
  const panelId = useId();
  const [innerSelected, setInnerSelected] = useState(defaultSelected);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isSelected = selected ?? innerSelected;

  const classes = [
    "ds-tile",
    `ds-tile--${variant}`,
    disabled && "ds-tile--disabled",
    isSelected && "ds-tile--selected",
    variant === "expandable" && expanded && "ds-tile--expanded",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (variant === "clickable" && href && !disabled) {
    return (
      <a ref={ref as Ref<HTMLAnchorElement>} href={href} className={classes} data-testid="ds-tile" onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }

  if (variant === "clickable" || variant === "selectable") {
    const activate = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      if (variant === "selectable") {
        if (selected === undefined) setInnerSelected(!isSelected);
        onSelectedChange?.(!isSelected);
      }
      onClick?.(e);
    };
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className={classes}
        data-testid="ds-tile"
        role={variant === "selectable" ? "checkbox" : "button"}
        aria-checked={variant === "selectable" ? isSelected : undefined}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        onClick={activate}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          // role=button 은 Enter·Space, role=checkbox 는 Space 로 동작한다(APG).
          // 클릭과 같은 경로를 타도록 click() 을 부른다.
          if (e.key === " " || (e.key === "Enter" && variant === "clickable")) {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        {...rest}
      >
        {variant === "selectable" ? (
          <span className="ds-tile__check" aria-hidden>
            <svg viewBox="0 0 16 16" width="12" height="12" focusable="false">
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        ) : null}
        {children}
      </div>
    );
  }

  if (variant === "expandable") {
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={classes} data-testid="ds-tile" aria-disabled={disabled || undefined} {...rest}>
        <button
          type="button"
          className="ds-tile__summary"
          aria-expanded={expanded}
          aria-controls={panelId}
          disabled={disabled}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className="ds-tile__title">{children}</span>
          <svg className="ds-tile__chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div id={panelId} className="ds-tile__details" hidden={!expanded}>
          {details}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref as Ref<HTMLDivElement>} className={classes} data-testid="ds-tile" aria-disabled={disabled || undefined} onClick={onClick} onKeyDown={onKeyDown} {...rest}>
      {children}
    </div>
  );
});

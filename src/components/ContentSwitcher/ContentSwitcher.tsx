import { forwardRef, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./ContentSwitcher.css";
import { useText } from "../../lib/i18n";

export type ContentSwitcherSize = "sm" | "md" | "lg";

export interface ContentSwitcherOption {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface ContentSwitcherProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: ContentSwitcherSize;
  items?: ContentSwitcherOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  label?: string;
  children?: ReactNode;
}

/**
 * A row of options that switches the content shown in one place.
 *
 * Unlike Tabs, it does not hold the panels itself — it is a **selection tool** that changes what is shown in the same spot.
 * That is why `role="radiogroup"` is the right fit. With tablist, screen readers would go looking for panels.
 */
export const ContentSwitcher = forwardRef<HTMLDivElement, ContentSwitcherProps>(function ContentSwitcher(
  { size = "md", items = [], value, defaultValue, onValueChange, label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.viewSwitch;
  const first = items.find((o) => !o.disabled)?.id ?? "";
  const [inner, setInner] = useState(defaultValue ?? first);
  const selected = value ?? inner;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    if (value === undefined) setInner(id);
    onValueChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled);
    if (!usable.length) return;
    const at = usable.indexOf(index);
    let target: number | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") target = usable[(at + 1) % usable.length];
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = usable[(at - 1 + usable.length) % usable.length];
    else if (e.key === "Home") target = usable[0];
    else if (e.key === "End") target = usable[usable.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    const item = items[target];
    if (!item) return;
    select(item.id);
    buttons.current[target]?.focus();
  };

  const classes = ["ds-contentswitcher", `ds-contentswitcher--${size}`, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-contentswitcher" role="radiogroup" aria-label={label} {...rest}>
      {items.map((item, i) => {
        const on = item.id === selected;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            ref={(node) => {
              buttons.current[i] = node;
            }}
            className="ds-contentswitcher__option"
            aria-checked={on}
            // roving tabindex — 그룹 전체가 Tab 한 번에 들어온다.
            tabIndex={on ? 0 : -1}
            disabled={item.disabled}
            onClick={() => select(item.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {item.label}
          </button>
        );
      })}
      {children}
    </div>
  );
});

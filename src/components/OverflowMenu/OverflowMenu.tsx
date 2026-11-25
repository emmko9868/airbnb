import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./OverflowMenu.css";
import { useText } from "../../lib/i18n";

export type OverflowMenuSize = "sm" | "md" | "lg";
export type OverflowMenuAlign = "start" | "end";

export interface OverflowMenuEntry {
  id: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
  /** An item that cannot be undone, such as Delete. */
  danger?: boolean;
}

export interface OverflowMenuProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: OverflowMenuSize;
  /** Figma: Align */
  align?: OverflowMenuAlign;
  /** Figma: Flipped — opens upward. */
  flipped?: boolean;
  items?: OverflowMenuEntry[];
  label?: string;
  children?: ReactNode;
}

/**
 * A "more actions" menu behind a three-dot button.
 *
 * Inside `role="menu"` you move with the **arrow keys, not Tab** (the WAI-ARIA menu pattern).
 * That is why items have tabIndex -1 and the code moves focus itself.
 * The trigger has `aria-haspopup="menu"` so screen readers announce that it opens a menu.
 */
export const OverflowMenu = forwardRef<HTMLDivElement, OverflowMenuProps>(function OverflowMenu(
  { size = "md", align = "end", flipped = false, items = [], label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.more;
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const entries = useRef<(HTMLButtonElement | null)[]>([]);

  const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled);

  const close = useCallback((restore = true) => {
    setOpen(false);
    if (restore) trigger.current?.focus();
  }, []);

  const openAt = (index: number) => {
    setOpen(true);
    // 렌더 직후에 포커스를 줘야 한다.
    window.requestAnimationFrame(() => entries.current[index]?.focus());
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openAt(usable[0] ?? 0);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openAt(usable[usable.length - 1] ?? 0);
    }
  };

  const onItemKey = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const at = usable.indexOf(index);
    let target: number | undefined;
    if (e.key === "ArrowDown") target = usable[(at + 1) % usable.length];
    else if (e.key === "ArrowUp") target = usable[(at - 1 + usable.length) % usable.length];
    else if (e.key === "Home") target = usable[0];
    else if (e.key === "End") target = usable[usable.length - 1];
    else if (e.key === "Escape" || e.key === "Tab") {
      close();
      return;
    }
    if (target === undefined) return;
    e.preventDefault();
    entries.current[target]?.focus();
  };

  const classes = [
    "ds-overflowmenu",
    `ds-overflowmenu--${size}`,
    `ds-overflowmenu--${align}`,
    flipped && "ds-overflowmenu--flipped",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={classes}
      data-testid="ds-overflowmenu"
      {...rest}
    >
      <button
        type="button"
        ref={trigger}
        className="ds-overflowmenu__trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => (open ? close() : openAt(usable[0] ?? 0))}
        onKeyDown={onTriggerKey}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
          <circle cx="8" cy="3.5" r="1.4" fill="currentColor" />
          <circle cx="8" cy="8" r="1.4" fill="currentColor" />
          <circle cx="8" cy="12.5" r="1.4" fill="currentColor" />
        </svg>
      </button>

      <div id={id} role="menu" aria-label={label} className="ds-overflowmenu__list" hidden={!open}>
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            ref={(node) => {
              entries.current[i] = node;
            }}
            className={item.danger ? "ds-overflowmenu__item ds-overflowmenu__item--danger" : "ds-overflowmenu__item"}
            // 메뉴 안에서는 Tab 이 아니라 화살표로 움직인다.
            tabIndex={-1}
            disabled={item.disabled}
            onClick={() => {
              item.onSelect?.();
              close();
            }}
            onKeyDown={(e) => onItemKey(e, i)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
});

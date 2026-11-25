import { forwardRef, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./Tabs.css";
import { useText } from "../../lib/i18n";

export type TabsVariant = "line" | "contained";
export type TabsSize = "sm" | "md";
export type TabsOrientation = "horizontal" | "vertical";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Variant */
  variant?: TabsVariant;
  /** Figma: Size */
  size?: TabsSize;
  /** Figma: Orientation */
  orientation?: TabsOrientation;
  items?: TabItem[];
  defaultTab?: string;
  /** Called with the tab's id when the selected tab changes. It isn't named onChange because that name belongs to the native DOM event. */
  onTabChange?: (id: string) => void;
  label?: string;
  children?: ReactNode;
}

/**
 * A row of tabs that switches between panels of content.
 *
 * Follows the WAI-ARIA tabs pattern and uses a **roving tabindex**: one press of the Tab key moves
 * into the whole tab list, and inside it the arrow keys move between tabs. With 10 tabs, nobody has to press Tab 10 times.
 * The arrow direction follows orientation (←→ when horizontal, ↑↓ when vertical).
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { variant = "line", size = "md", orientation = "horizontal", items = [], defaultTab, onTabChange, label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.tabs;
  const base = useId();
  const first = items.find((t) => !t.disabled)?.id ?? "";
  const [active, setActive] = useState(defaultTab ?? first);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: string) => {
    setActive(id);
    onTabChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled);
    if (!usable.length) return;
    const at = usable.indexOf(index);
    const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
    const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";
    let target: number | undefined;
    if (e.key === nextKey) target = usable[(at + 1) % usable.length];
    else if (e.key === prevKey) target = usable[(at - 1 + usable.length) % usable.length];
    else if (e.key === "Home") target = usable[0];
    else if (e.key === "End") target = usable[usable.length - 1];
    if (target === undefined) return;
    e.preventDefault();
    const item = items[target];
    if (!item) return;
    // 이동하면 바로 선택한다(automatic activation). 패널이 무거우면 수동 활성으로 바꿀 것.
    select(item.id);
    tabs.current[target]?.focus();
  };

  const classes = ["ds-tabs", `ds-tabs--${variant}`, `ds-tabs--${size}`, `ds-tabs--${orientation}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-tabs" {...rest}>
      <div role="tablist" aria-label={label} aria-orientation={orientation} className="ds-tabs__list">
        {items.map((item, i) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${base}-t-${item.id}`}
              ref={(node) => {
                tabs.current[i] = node;
              }}
              className="ds-tabs__tab"
              aria-selected={selected}
              aria-controls={`${base}-p-${item.id}`}
              // roving tabindex: 선택된 탭만 Tab 키로 들어온다.
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${base}-p-${item.id}`}
          aria-labelledby={`${base}-t-${item.id}`}
          className="ds-tabs__panel"
          hidden={item.id !== active}
          // 패널 자체가 포커스를 받아야 탭에서 내용으로 넘어갈 수 있다.
          tabIndex={0}
        >
          {item.content}
        </div>
      ))}
      {children}
    </div>
  );
});

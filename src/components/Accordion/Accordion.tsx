import { forwardRef, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./Accordion.css";

export type AccordionSize = "sm" | "md" | "lg";
export type AccordionAlign = "start" | "end";

export interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: AccordionSize;
  /** Figma: Align — whether the expand marker goes before or after the title. */
  align?: AccordionAlign;
  /** Figma: Disabled — turns off the whole accordion. To turn off just one item, use item.disabled. */
  disabled?: boolean;
  items?: AccordionItem[];
  /** Whether only one item can be open at a time. By default, several can be open at once. */
  single?: boolean;
  defaultOpen?: string[];
  children?: ReactNode;
}

/**
 * A stack of titled sections that open and close.
 *
 * Follows the WAI-ARIA accordion pattern. Each title is a **button**, so Enter and Space just work;
 * only moving between titles is added on top (↑↓ Home End).
 * `aria-expanded` and `aria-controls` tie each title to its panel.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { size = "md", align = "end", disabled = false, items = [], single = false, defaultOpen = [], className, children, ...rest },
  ref,
) {
  const base = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const headers = useRef<(HTMLButtonElement | null)[]>([]);

  const toggle = (id: string) => {
    setOpen((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return single ? [id] : [...prev, id];
    });
  };

  // 제목 사이 이동. 패널 안의 Tab 순서는 건드리지 않는다.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled && !disabled);
    if (!usable.length) return;
    const at = usable.indexOf(index);
    // tsconfig 의 noUncheckedIndexedAccess 때문에 인덱스 접근은 undefined 를 포함한다.
    let next: number | undefined;
    if (e.key === "ArrowDown") next = usable[(at + 1) % usable.length];
    else if (e.key === "ArrowUp") next = usable[(at - 1 + usable.length) % usable.length];
    else if (e.key === "Home") next = usable[0];
    else if (e.key === "End") next = usable[usable.length - 1];
    if (next === undefined) return;
    e.preventDefault();
    headers.current[next]?.focus();
  };

  const classes = ["ds-accordion", `ds-accordion--${size}`, `ds-accordion--${align}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-accordion" aria-disabled={disabled || undefined} {...rest}>
      {items.map((item, i) => {
        const expanded = open.includes(item.id);
        const off = disabled || item.disabled;
        const headerId = `${base}-h-${item.id}`;
        const panelId = `${base}-p-${item.id}`;
        return (
          <div key={item.id} className="ds-accordion__item">
            <h3 className="ds-accordion__heading">
              <button
                type="button"
                id={headerId}
                ref={(node) => {
                  headers.current[i] = node;
                }}
                className="ds-accordion__trigger"
                aria-expanded={expanded}
                aria-controls={panelId}
                disabled={off}
                onClick={() => toggle(item.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                <span className="ds-accordion__title">{item.title}</span>
                <svg className="ds-accordion__chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </h3>
            <div id={panelId} role="region" aria-labelledby={headerId} className="ds-accordion__panel" hidden={!expanded}>
              <div className="ds-accordion__content">{item.content}</div>
            </div>
          </div>
        );
      })}
      {children}
    </div>
  );
});

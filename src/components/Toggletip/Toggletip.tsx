import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Toggletip.css";
import { useText } from "../../lib/i18n";

export type ToggletipAlign = "top" | "bottom" | "left" | "right";

export interface ToggletipProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Align */
  align?: ToggletipAlign;
  /** Name for the trigger button. The button shows only an icon, so it must have one. */
  label?: string;
  children?: ReactNode;
}

/**
 * A small help bubble that opens when you click an info button.
 *
 * Sits between Tooltip and Popover. It **opens on click** and can hold links, but unlike Popover it
 * does not move focus inside — instead it reads the content aloud through `aria-live`.
 * This is the toggletip approach WAI-ARIA recommends.
 */
export const Toggletip = forwardRef<HTMLDivElement, ToggletipProps>(function Toggletip(
  { align = "bottom", label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.help;
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      close();
      trigger.current?.focus();
    };
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, close]);

  const classes = ["ds-toggletip", `ds-toggletip--${align}`, className].filter(Boolean).join(" ");

  return (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={classes}
      data-testid="ds-toggletip"
      {...rest}
    >
      <button
        type="button"
        ref={trigger}
        className="ds-toggletip__trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M8 7.2v3.4M8 5.2v.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {/* 포커스를 옮기지 않으므로 열린 내용을 낭독기에 읽어줘야 한다. */}
      <div id={id} className="ds-toggletip__panel" role="status" aria-live="polite" hidden={!open}>
        {open ? children : null}
      </div>
    </div>
  );
});

import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Tooltip.css";

export type TooltipAlign = "top" | "bottom" | "left" | "right";

export interface TooltipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma: Align */
  align?: TooltipAlign;
  /** The description shown in the bubble. */
  label?: string;
  /** The element the description belongs to. */
  children?: ReactNode;
}

/**
 * A short hint that appears when you hover over or focus an element.
 *
 * If it opened only on `hover`, keyboard users could never see it, so it also opens on `focus`.
 * Don't put buttons or links inside. If people need to interact with it, use Toggletip or Popover.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { align = "top", label, className, children, ...rest },
  ref,
) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const holder = useRef<HTMLSpanElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  // Esc 로 닫힌다. 열려 있을 때만 듣는다.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const classes = ["ds-tooltip", `ds-tooltip--${align}`, className].filter(Boolean).join(" ");

  return (
    <span
      ref={(node) => {
        holder.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      className={classes}
      data-testid="ds-tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={close}
      {...rest}
    >
      <span className="ds-tooltip__anchor" aria-describedby={label ? id : undefined} tabIndex={0}>
        {children}
      </span>
      {label ? (
        <span id={id} role="tooltip" className="ds-tooltip__bubble" hidden={!open}>
          {label}
        </span>
      ) : null}
    </span>
  );
});

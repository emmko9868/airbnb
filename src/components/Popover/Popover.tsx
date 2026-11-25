import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Popover.css";
import { useText } from "../../lib/i18n";

export type PopoverAlign = "top" | "bottom" | "left" | "right";

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Align */
  align?: PopoverAlign;
  /** Figma: Caret */
  caret?: boolean;
  /** Figma: Open — to control it yourself, use it together with `onOpenChange`. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** What is shown on the button that opens the popover (text or an icon). It is already inside a button, so the keyboard can open it — don't pass another button. */
  trigger?: ReactNode;
  children?: ReactNode;
}

/**
 * A small pop-up panel that opens next to a button.
 *
 * It is different from Tooltip — **it can contain buttons and links.** So it opens on click, not on
 * hover (if it opened on hover, it would close while you move the mouse, and you could not click inside).
 * When it opens, focus moves to the first element inside; when it closes, focus goes back to the trigger.
 */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { align = "bottom", caret = true, open, defaultOpen = false, onOpenChange, trigger, className, children, ...rest },
  ref,
) {
  const t = useText();
  const id = useId();
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const root = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panel = useRef<HTMLDivElement | null>(null);

  const set = useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  // 최신 set 을 ref 로 들고 있는다. effect 가 set(=onOpenChange)에 의존하면 인라인
  // 콜백을 넘길 때 부모 렌더마다 effect 가 다시 돌며 포커스를 패널 첫 요소로 되돌린다.
  const setRef = useRef(set);
  useEffect(() => {
    setRef.current = set;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    // 열면 안으로 포커스를 옮긴다 — 그래야 Tab 이 팝오버 내용으로 이어진다.
    const first = panel.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    (first ?? panel.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      setRef.current(false);
      triggerRef.current?.focus();
    };
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setRef.current(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [isOpen]);

  const classes = ["ds-popover", `ds-popover--${align}`, caret && "ds-popover--caret", className]
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
      data-testid="ds-popover"
      {...rest}
    >
      <button
        type="button"
        ref={triggerRef}
        className="ds-popover__trigger"
        aria-expanded={isOpen}
        aria-controls={id}
        aria-haspopup="dialog"
        onClick={() => set(!isOpen)}
      >
        {trigger ?? t.open}
      </button>
      <div id={id} ref={panel} role="dialog" aria-modal="false" className="ds-popover__panel" tabIndex={-1} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
});

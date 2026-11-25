import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HTMLAttributes, ReactNode } from "react";
import "./Modal.css";
import { useText } from "../../lib/i18n";

export type ModalVariant = "default" | "danger";
export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Variant */
  variant?: ModalVariant;
  /** Figma: Size */
  size?: ModalSize;
  /** Figma: Open — controlled mode. If you pass it, the modal closes only when you set it to `false` in `onClose`. */
  open?: boolean;
  /** Whether it starts open, when the modal manages its own state (uncontrolled). */
  defaultOpen?: boolean;
  /** If given, draws a button with this text (or element) that opens the modal. Use it in uncontrolled mode. */
  trigger?: ReactNode;
  title?: string;
  onClose?: () => void;
  footer?: ReactNode;
  /** Whether clicking the background closes the modal. Set it to `false` if there is unsaved input. */
  dismissOnOverlay?: boolean;
  children?: ReactNode;
}

/** Elements that are part of the Tab order. The focus trap needs to know the first and the last one. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * A dialog that opens on top of the page.
 *
 * It always does three things — if any one is missing, keyboard users get stuck or lost.
 *   1. Focus trap: Tab never moves outside the modal
 *   2. Esc closes it
 *   3. When it closes, **focus goes back to where it was before it opened**
 *
 * It is attached to body with `createPortal`. This is the only way to keep it from being
 * cut off by a parent's `overflow: hidden` or `transform`.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { variant = "default", size = "md", open: openProp, defaultOpen = false, trigger, title, onClose, footer, dismissOnOverlay = true, className, children, ...rest },
  ref,
) {
  const t = useText();
  const base = useId();
  const dialog = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const [inner, setInner] = useState(defaultOpen);
  const open = openProp ?? inner;

  const close = useCallback(() => {
    if (openProp === undefined) setInner(false);
    onClose?.();
  }, [openProp, onClose]);

  // 최신 close 를 ref 로 들고 있는다. 아래 effect 가 close 에 의존하면
  // `onClose={() => setOpen(false)}` 처럼 인라인으로 넘길 때 부모가 렌더될 때마다
  // effect 가 정리(포커스를 트리거로 복귀) → 재실행(첫 요소로 포커스)되어,
  // 모달 안 입력칸에 한 글자 칠 때마다 포커스가 닫기 버튼으로 튄다.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  useEffect(() => {
    if (!open) return undefined;

    // 열기 전 포커스를 기억했다가 닫을 때 돌려준다.
    restoreTo.current = document.activeElement as HTMLElement | null;
    const node = dialog.current;
    const firstFocusable = node?.querySelector<HTMLElement>(FOCUSABLE);
    (firstFocusable ?? node)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !node) return;
      const targets = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!targets.length) {
        e.preventDefault();
        return;
      }
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (!first || !last) return;
      // 양 끝에서 감싸 돌린다 — 이게 없으면 포커스가 브라우저 주소창으로 새어 나간다.
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus();
    };
  }, [open]);

  const opener = trigger ? (
    <button type="button" className="ds-modal__trigger" aria-haspopup="dialog" onClick={() => setInner(true)}>
      {trigger}
    </button>
  ) : null;

  if (!open || typeof document === "undefined") return opener;

  const titleId = `${base}-title`;
  const classes = ["ds-modal", `ds-modal--${variant}`, `ds-modal--${size}`, className].filter(Boolean).join(" ");

  return (
    <>
      {opener}
      {createPortal(
    <div className="ds-modal__overlay" onMouseDown={dismissOnOverlay ? close : undefined}>
      <div
        ref={(node) => {
          dialog.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={classes}
        data-testid="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        // 배경 클릭 닫기가 내용 클릭에도 걸리지 않게 막는다.
        onMouseDown={(e) => e.stopPropagation()}
        {...rest}
      >
        <div className="ds-modal__head">
          {title ? <h2 id={titleId} className="ds-modal__title">{title}</h2> : <span />}
          <button type="button" className="ds-modal__close" onClick={close} aria-label={t.close}>
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="ds-modal__body">{children}</div>
        {footer ? <div className="ds-modal__foot">{footer}</div> : null}
      </div>
    </div>,
        document.body,
      )}
    </>
  );
});

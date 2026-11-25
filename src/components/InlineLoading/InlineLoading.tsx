import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./InlineLoading.css";
import { useText } from "../../lib/i18n";

export type InlineLoadingStatus = "active" | "finished" | "error" | "inactive";

export interface InlineLoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Status */
  status?: InlineLoadingStatus;
  /** Text shown next to the status. For example: "Saving", "Saved". */
  description?: string;
  children?: ReactNode;
}


/**
 * A small progress indicator that sits next to a button or form.
 * It shows the status with both an icon shape (spinner, check mark, exclamation mark) and text — never by color alone.
 */
export const InlineLoading = forwardRef<HTMLDivElement, InlineLoadingProps>(function InlineLoading(
  { status = "active", description, className, children, ...rest },
  ref,
) {
  const classes = ["ds-inlineloading", `ds-inlineloading--${status}`, className].filter(Boolean).join(" ");
  const t = useText();
  // 상태별 기본 문구. description 을 주면 그것이 먼저다.
  const fallback = { active: t.processing, finished: t.done, error: t.failed, inactive: "" }[status];
  const text = description ?? fallback;

  return (
    <div ref={ref} className={classes} data-testid="ds-inlineloading" role="status" aria-live="polite" {...rest}>
      {status !== "inactive" ? (
        <svg className="ds-inlineloading__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
          {status === "active" ? (
            <>
              <circle cx="8" cy="8" r="6" className="ds-inlineloading__track" />
              <circle cx="8" cy="8" r="6" className="ds-inlineloading__arc" />
            </>
          ) : status === "finished" ? (
            <>
              <circle cx="8" cy="8" r="7" fill="currentColor" />
              <path d="M4.8 8.3l2.2 2.2 4.2-4.6" className="ds-inlineloading__mark" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </>
          ) : (
            <>
              <circle cx="8" cy="8" r="7" fill="currentColor" />
              <path d="M8 4.5v4.2M8 11v.3" className="ds-inlineloading__mark" strokeWidth="1.7" strokeLinecap="round" />
            </>
          )}
        </svg>
      ) : null}
      {text ? <span className="ds-inlineloading__text">{text}</span> : null}
      {children}
    </div>
  );
});

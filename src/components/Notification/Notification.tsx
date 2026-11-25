import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Notification.css";
import { useText } from "../../lib/i18n";

export type NotificationTone = "info" | "success" | "warning" | "danger";
export type NotificationVariant = "inline" | "toast";

export interface NotificationProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Tone */
  tone?: NotificationTone;
  /** Figma: Variant */
  variant?: NotificationVariant;
  /** Figma: Dismissible */
  dismissible?: boolean;
  title?: string;
  /** Called when the close button is clicked. Only matters when `dismissible` is on. */
  onDismiss?: () => void;
  children?: ReactNode;
}

/**
 * A notification message.
 *
 * `danger` uses `role="alert"`, so the screen reader **interrupts** what it is saying to read it. The others use `role="status"`
 * and are read after the screen reader finishes what it is saying — an informational message should not interrupt the user's work.
 */
export const Notification = forwardRef<HTMLDivElement, NotificationProps>(function Notification(
  { tone = "info", variant = "inline", dismissible = false, title, onDismiss, className, children, ...rest },
  ref,
) {
  const t = useText();
  const titleId = useId();
  // 닫기를 누르면 스스로 사라진다. onDismiss 는 알림을 목록에서 빼야 하는 쪽을 위한 것이다.
  const [closed, setClosed] = useState(false);
  const urgent = tone === "danger";
  if (closed) return null;
  const classes = ["ds-notification", `ds-notification--${tone}`, `ds-notification--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={ref}
      className={classes}
      data-testid="ds-notification"
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      aria-labelledby={title ? titleId : undefined}
      {...rest}
    >
      {/* 색만으로 뜻을 전달하지 않는다 — 모양이 다른 표식을 함께 둔다. */}
      <span className="ds-notification__mark" aria-hidden />
      <div className="ds-notification__body">
        {title ? <p id={titleId} className="ds-notification__title">{title}</p> : null}
        {children ? <div className="ds-notification__text">{children}</div> : null}
      </div>
      {dismissible ? (
        <button type="button" className="ds-notification__close" onClick={() => {
            onDismiss?.();
            setClosed(true);
          }} aria-label={t.dismissNotification}>
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </div>
  );
});

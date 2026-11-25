import { forwardRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Tag.css";
import { useText } from "../../lib/i18n";

export type TagTone = "neutral" | "info" | "success" | "warning" | "danger";
export type TagSize = "sm" | "md";

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  /** Figma: Tone */
  tone?: TagTone;
  /** Figma: Size */
  size?: TagSize;
  /** Figma: Dismissible — adds a remove button. */
  dismissible?: boolean;
  /** Figma: Icon */
  icon?: ReactNode;
  /** Called when the remove button is pressed. After it is called, the tag removes itself. */
  onDismiss?: () => void;
  /** Accessible name of the remove button (what screen readers announce). Defaults to "Remove <text>". */
  dismissLabel?: string;
  children?: ReactNode;
}

/**
 * Category or filter label. If it can be removed (dismissible), a × button follows the text.
 * Only the ×, not the whole tag, is a button, so pressing the tag and removing it never get mixed up.
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { tone = "neutral", size = "md", dismissible = false, icon, onDismiss, dismissLabel, className, children, ...rest },
  ref,
) {
  const t = useText();
  const [gone, setGone] = useState(false);
  if (gone) return null;

  const classes = [
    "ds-tag",
    `ds-tag--${tone}`,
    `ds-tag--${size}`,
    dismissible && "ds-tag--dismissible",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const name = dismissLabel ?? t.remove(typeof children === "string" ? children : t.tag);

  return (
    <span ref={ref} className={classes} data-testid="ds-tag" {...rest}>
      {icon ? <span className="ds-tag__icon" aria-hidden>{icon}</span> : null}
      <span className="ds-tag__text">{children}</span>
      {dismissible ? (
        <button
          type="button"
          className="ds-tag__dismiss"
          aria-label={name}
          onClick={() => {
            onDismiss?.();
            setGone(true);
          }}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden focusable="false">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      ) : null}
    </span>
  );
});

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Loading.css";
import { useText } from "../../lib/i18n";

export type LoadingSize = "sm" | "md" | "lg";

export interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: LoadingSize;
  /** Figma: Overlay — covers the whole screen and shows the spinner in the middle. */
  overlay?: boolean;
  /** Text read out by screen readers. It is not shown on screen. */
  label?: string;
  /** Text shown below the spinner. */
  children?: ReactNode;
}

/**
 * A loading indicator (spinner).
 *
 * It has `role=status`, so screen readers read the label. The spinner is only decoration, so it is hidden from them.
 * For users who have turned on reduced motion, the spinning stops (CSS).
 */
export const Loading = forwardRef<HTMLDivElement, LoadingProps>(function Loading(
  { size = "md", overlay = false, label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.loading;
  const classes = ["ds-loading", `ds-loading--${size}`, overlay && "ds-loading--overlay", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-loading" role="status" aria-live="polite" {...rest}>
      <span className="ds-loading__box">
        <svg className="ds-loading__spinner" viewBox="0 0 48 48" aria-hidden focusable="false">
          <circle className="ds-loading__track" cx="24" cy="24" r="20" />
          <circle className="ds-loading__arc" cx="24" cy="24" r="20" />
        </svg>
        {children ? <span className="ds-loading__text">{children}</span> : null}
        <span className="ds-loading__sr">{label}</span>
      </span>
    </div>
  );
});

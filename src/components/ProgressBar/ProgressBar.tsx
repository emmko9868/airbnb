import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./ProgressBar.css";
import { useText } from "../../lib/i18n";

export type ProgressBarSize = "sm" | "md";
export type ProgressBarStatus = "active" | "finished" | "error";

export interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: ProgressBarSize;
  /** Figma: Status */
  status?: ProgressBarStatus;
  /** Figma: Indeterminate — for a task whose end is unknown. */
  indeterminate?: boolean;
  label?: string;
  helperText?: string;
  value?: number;
  max?: number;
  /** Whether to hide the percentage shown next to the label. */
  hideValue?: boolean;
  children?: ReactNode;
}

/**
 * A bar that shows how far a task has progressed.
 *
 * `role="progressbar"` + `aria-valuenow/min/max`. **When indeterminate, valuenow must be left out** —
 * if the value is unknown and you put 0, screen readers wrongly read "0%".
 * Finished and failed are not shown by color alone; they are also written as text.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { size = "md", status = "active", indeterminate = false, label, helperText, value = 0, max = 100, hideValue = false, className, children, ...rest },
  ref,
) {
  const t = useText();
  const base = useId();
  const pct = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const labelId = `${base}-label`;
  const helpId = `${base}-help`;
  const classes = ["ds-progressbar", `ds-progressbar--${size}`, `ds-progressbar--${status}`, indeterminate && "ds-progressbar--indeterminate", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-progressbar" {...rest}>
      {label || !hideValue ? (
        <div className="ds-progressbar__head">
          {label ? <span id={labelId} className="ds-progressbar__label">{label}</span> : <span />}
          {!hideValue && !indeterminate ? (
            <span className="ds-progressbar__value">{Math.round(pct)}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        className="ds-progressbar__track"
        role="progressbar"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={helperText ? helpId : undefined}
        // 값을 모를 때는 valuenow 를 아예 두지 않는다.
        aria-valuenow={indeterminate ? undefined : Math.round(pct)}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
      >
        <div className="ds-progressbar__fill" style={{ width: indeterminate ? undefined : `${pct}%` }} />
      </div>
      {helperText || status !== "active" ? (
        <span id={helpId} className="ds-progressbar__help">
          {helperText ?? (status === "finished" ? t.done : status === "error" ? t.failed : "")}
        </span>
      ) : null}
      {children}
    </div>
  );
});

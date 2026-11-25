import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./ProgressIndicator.css";
import { useText } from "../../lib/i18n";

export type ProgressIndicatorOrientation = "horizontal" | "vertical";
export type ProgressIndicatorSize = "sm" | "md";

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  /** Whether something went wrong at this step. */
  error?: boolean;
  disabled?: boolean;
}

export interface ProgressIndicatorProps extends HTMLAttributes<HTMLElement> {
  /** Figma: Orientation */
  orientation?: ProgressIndicatorOrientation;
  /** Figma: Size */
  size?: ProgressIndicatorSize;
  steps?: ProgressStep[];
  /** The current step, counting from 0. */
  current?: number;
  /** Whether users can click a step to go to it. Turn it off if the flow cannot go back. */
  interactive?: boolean;
  onStepChange?: (index: number) => void;
  label?: string;
  children?: ReactNode;
}

/**
 * A step-by-step progress tracker.
 *
 * The current step gets `aria-current="step"`. Complete / current / upcoming are not told apart **by color alone**;
 * a symbol (✓ · ! · number) is shown too — color-blind users also need to see how far they have come.
 */
export const ProgressIndicator = forwardRef<HTMLElement, ProgressIndicatorProps>(function ProgressIndicator(
  { orientation = "horizontal", size = "md", steps = [], current = 0, interactive = false, onStepChange, label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.progressSteps;
  const classes = ["ds-progressindicator", `ds-progressindicator--${orientation}`, `ds-progressindicator--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <nav ref={ref} className={classes} data-testid="ds-progressindicator" aria-label={label} {...rest}>
      <ol className="ds-progressindicator__list">
        {steps.map((step, i) => {
          const state = step.error ? "error" : i < current ? "complete" : i === current ? "current" : "incomplete";
          const mark = step.error ? "!" : state === "complete" ? "✓" : String(i + 1);
          const inner = (
            <>
              <span className="ds-progressindicator__mark" aria-hidden>
                {mark}
              </span>
              <span className="ds-progressindicator__text">
                <span className="ds-progressindicator__label">{step.label}</span>
                {step.description ? <span className="ds-progressindicator__desc">{step.description}</span> : null}
              </span>
              {/* 상태를 낭독기에 글자로도 전한다. 기호만으로는 전달되지 않는다. */}
              <span className="ds-progressindicator__sr">
                {step.error ? t.stepError : state === "complete" ? t.stepDone : state === "current" ? t.stepCurrent : t.stepPending}
              </span>
            </>
          );
          return (
            <li
              key={step.id}
              className="ds-progressindicator__step"
              data-state={state}
              aria-current={state === "current" ? "step" : undefined}
            >
              {interactive && !step.disabled ? (
                <button type="button" className="ds-progressindicator__button" onClick={() => onStepChange?.(i)}>
                  {inner}
                </button>
              ) : (
                <span className="ds-progressindicator__button">{inner}</span>
              )}
            </li>
          );
        })}
      </ol>
      {children}
    </nav>
  );
});

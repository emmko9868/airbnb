import { forwardRef, useId, useState } from "react";
import type { ChangeEvent, HTMLAttributes, ReactNode } from "react";
import "./Slider.css";

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  /** Figma: HideTextInput */
  hideTextInput?: boolean;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  helperText?: string;
  children?: ReactNode;
}

/**
 * A slider for picking a number by dragging a handle along a track.
 *
 * Uses the native `input[type=range]`, because the browser already handles the arrow, Home, End
 * and PageUp/Down keys and `aria-valuenow` correctly.
 * Building it by hand means re-implementing all of that, and something usually gets missed.
 *
 * The number box beside it is **a second control for the same value**, so screen readers
 * are shown it as one thing (the box is not `aria-hidden`; it shares the slider's label instead).
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  { disabled = false, invalid = false, hideTextInput = false, label, min = 0, max = 100, step = 1, value, defaultValue, onValueChange, helperText, className, children, ...rest },
  ref,
) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? min);
  const current = value ?? inner;

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) setInner(clamped);
    onValueChange?.(clamped);
  };

  const onRange = (e: ChangeEvent<HTMLInputElement>) => set(Number(e.target.value));
  // 숫자 칸은 입력하는 동안 글자로 두고 Enter·blur 때 확정한다(NumberInput 과 같은 이유).
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft === null) return;
    const n = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(n)) set(n);
    setDraft(null);
  };

  const labelId = `${base}-label`;
  const helpId = `${base}-help`;
  const classes = ["ds-slider", invalid && "ds-slider--invalid", className].filter(Boolean).join(" ");
  const percent = max === min ? 0 : ((current - min) / (max - min)) * 100;

  return (
    <div ref={ref} className={classes} data-testid="ds-slider" {...rest}>
      {label ? (
        <label id={labelId} className="ds-slider__label" htmlFor={`${base}-range`}>
          {label}
        </label>
      ) : null}
      <div className="ds-slider__row">
        <span className="ds-slider__bound" aria-hidden>
          {min}
        </span>
        <input
          id={`${base}-range`}
          type="range"
          className="ds-slider__range"
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          onChange={onRange}
          style={{ ["--ds-slider-fill" as string]: `${percent}%` }}
        />
        <span className="ds-slider__bound" aria-hidden>
          {max}
        </span>
        {!hideTextInput ? (
          <input
            type="number"
            className="ds-slider__number"
            min={min}
            max={max}
            step={step}
            value={draft ?? String(current)}
            disabled={disabled}
            aria-labelledby={label ? labelId : undefined}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
            }}
          />
        ) : null}
      </div>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-slider__help ds-slider__help--invalid" : "ds-slider__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./NumberInput.css";
import { useText } from "../../lib/i18n";

export type NumberInputSize = "sm" | "md" | "lg";

export interface NumberInputProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Size */
  size?: NumberInputSize;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  /** Figma: HideSteppers */
  hideSteppers?: boolean;
  label?: string;
  helperText?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
  children?: ReactNode;
}

/**
 * A field for entering a number.
 *
 * It uses `input[type=number]` but adds its own up/down buttons — the browser's built-in spinner
 * is too small to press easily and cannot be given an `aria-label`.
 * The Up/Down arrow keys are handled here instead of by the browser, so the value stays within `min` and `max`.
 */
export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(function NumberInput(
  { size = "md", disabled = false, invalid = false, hideSteppers = false, label, helperText, value, defaultValue, min, max, step = 1, onValueChange, className, children, ...rest },
  ref,
) {
  const t = useText();
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? 0);
  const current = value ?? inner;
  // 입력하는 동안의 글자. 매 글자마다 숫자로 바꾸면 "" 가 0 이 되고 min 에 막혀
  // 원하는 값을 칠 수 없다. Enter·blur 때 확정한다.
  const [draft, setDraft] = useState<string | null>(null);

  const set = (next: number) => {
    let n = next;
    if (min !== undefined) n = Math.max(min, n);
    if (max !== undefined) n = Math.min(max, n);
    if (value === undefined) setInner(n);
    onValueChange?.(n);
  };

  /** Confirms the text being typed. If it is not a number, goes back to the previous value. */
  const commit = () => {
    if (draft === null) return current;
    const n = Number(draft);
    const ok = draft.trim() !== "" && Number.isFinite(n);
    setDraft(null);
    if (ok) set(n);
    return ok ? n : current;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 네이티브가 ↑↓ 를 처리하지만 min/max 를 우리가 관리하므로 가로챈다.
    if (e.key === "ArrowUp") { e.preventDefault(); set(commit() + step); }
    else if (e.key === "ArrowDown") { e.preventDefault(); set(commit() - step); }
    else if (e.key === "Enter") commit();
  };

  const helpId = `${base}-help`;
  const atMin = min !== undefined && current <= min;
  const atMax = max !== undefined && current >= max;
  const classes = ["ds-numberinput", `ds-numberinput--${size}`, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-numberinput" {...rest}>
      {label ? (
        <label className="ds-numberinput__label" htmlFor={`${base}-input`}>
          {label}
        </label>
      ) : null}
      <div className="ds-numberinput__row">
        <input
          id={`${base}-input`}
          type="number"
          className="ds-numberinput__field"
          value={draft ?? String(current)}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
        {!hideSteppers ? (
          <span className="ds-numberinput__steppers">
            <button type="button" className="ds-numberinput__step" onClick={() => set(commit() + step)} disabled={disabled || atMax} aria-label={t.increment(step)}>
              ▲
            </button>
            <button type="button" className="ds-numberinput__step" onClick={() => set(commit() - step)} disabled={disabled || atMin} aria-label={t.decrement(step)}>
              ▼
            </button>
          </span>
        ) : null}
      </div>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-numberinput__help ds-numberinput__help--invalid" : "ds-numberinput__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

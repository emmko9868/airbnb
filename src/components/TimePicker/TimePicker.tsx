import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./TimePicker.css";
import { useText } from "../../lib/i18n";

export type TimePickerSize = "sm" | "md" | "lg";

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Size */
  size?: TimePickerSize;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  helperText?: string;
  /** Whether to use the 24-hour clock. The default is the 12-hour clock with AM/PM. */
  hour24?: boolean;
  /** "HH:MM" (always written in 24-hour time). */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Gap between minute choices. With 5, the choices are 00·05·10… */
  minuteStep?: number;
  children?: ReactNode;
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A field for entering a time.
 *
 * Hours and minutes are **each a separate `select`**. A free-text box would have to accept "9 o'clock",
 * "09:00", "9 AM" and so on, so checking the input would never end; native selects are also much better on mobile.
 *
 * The 12/24-hour format is shown on screen — if only "9:00" is visible, you can't tell whether it is AM or PM.
 * The three boxes make up one value, so they are grouped with `fieldset`+`legend` and screen readers read the name only once.
 */
export const TimePicker = forwardRef<HTMLDivElement, TimePickerProps>(function TimePicker(
  { size = "md", disabled = false, invalid = false, label: labelProp, helperText, hour24 = false, value, defaultValue, onValueChange, minuteStep = 5, children, className, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.time;
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? "09:00");
  const text = value ?? inner;
  const [h = "09", m = "00"] = text.split(":");
  const hour = Number(h);
  const minute = Number(m);

  const set = (nextHour: number, nextMinute: number) => {
    const next = `${pad(((nextHour % 24) + 24) % 24)}:${pad(nextMinute)}`;
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  const meridiem = hour < 12 ? "AM" : "PM";
  const shownHour = hour24 ? hour : hour % 12 === 0 ? 12 : hour % 12;
  const hourOptions = hour24
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
  const minuteOptions = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  const toH24 = (shown: number, mer: string) => {
    if (hour24) return shown;
    if (mer === "AM") return shown === 12 ? 0 : shown;
    return shown === 12 ? 12 : shown + 12;
  };

  const helpId = `${base}-help`;
  const classes = ["ds-timepicker", `ds-timepicker--${size}`, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-timepicker" {...rest}>
      <fieldset className="ds-timepicker__set" disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={helperText ? helpId : undefined}>
        <legend className="ds-timepicker__legend">
          {label} <span className="ds-timepicker__format">({hour24 ? t.format24 : t.format12})</span>
        </legend>
        <div className="ds-timepicker__row">
          <select
            className="ds-timepicker__select"
            aria-label={t.hour}
            value={shownHour}
            onChange={(e) => set(toH24(Number(e.target.value), meridiem), minute)}
          >
            {hourOptions.map((n) => (
              <option key={n} value={n}>
                {hour24 ? pad(n) : n}
              </option>
            ))}
          </select>
          <span className="ds-timepicker__colon" aria-hidden>
            :
          </span>
          <select
            className="ds-timepicker__select"
            aria-label={t.minute}
            value={minute}
            onChange={(e) => set(hour, Number(e.target.value))}
          >
            {minuteOptions.map((n) => (
              <option key={n} value={n}>
                {pad(n)}
              </option>
            ))}
          </select>
          {!hour24 ? (
            <select
              className="ds-timepicker__select ds-timepicker__select--meridiem"
              aria-label={t.meridiem}
              value={meridiem}
              onChange={(e) => set(toH24(shownHour, e.target.value), minute)}
            >
              <option value="AM">{t.am}</option>
              <option value="PM">{t.pm}</option>
            </select>
          ) : null}
        </div>
      </fieldset>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-timepicker__help ds-timepicker__help--invalid" : "ds-timepicker__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

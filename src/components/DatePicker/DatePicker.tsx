import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./DatePicker.css";
import { useText } from "../../lib/i18n";

export type DatePickerType = "single" | "range";
export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Type */
  type?: DatePickerType;
  /** Figma: Size */
  size?: DatePickerSize;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  helperText?: string;
  /** YYYY-MM-DD. For range, "start/end". */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
};
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** The 42 cells (6 weeks) that fill the calendar grid. Days from the months before and after fill the gaps so the rows don't jump around. */
function monthGrid(view: Date) {
  const first = new Date(view.getFullYear(), view.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/**
 * A date input with a pop-up calendar.
 *
 * **The text input is always there too.** With only a calendar, entering "1987-03-02" would mean
 * pressing the previous-month button hundreds of times. The calendar is a helper.
 *
 * The calendar is a `role="grid"` and the keyboard is essential.
 *   ←→↑↓ one day / one week  ·  PageUp/Down one month  ·  Home/End start/end of the week  ·  Esc close
 * Today is marked with `aria-current="date"`, and the chosen day with `aria-selected`.
 */
export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(function DatePicker(
  { type = "single", size = "md", disabled = false, invalid = false, label, helperText, value, defaultValue, onValueChange, className, children, ...rest },
  ref,
) {
  const t = useText();
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? "");
  const text = value ?? inner;
  const [open, setOpen] = useState(false);
  const [startText = "", endText = ""] = text.split("/");
  const selectedDate = parse(startText);
  const rangeEnd = type === "range" ? parse(endText) : null;
  const [view, setView] = useState(() => selectedDate ?? new Date());
  const [cursor, setCursor] = useState(() => selectedDate ?? new Date());
  const root = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);
  const cells = useRef<Record<string, HTMLButtonElement | null>>({});

  const set = (next: string) => {
    if (value === undefined) setInner(next);
    onValueChange?.(next);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // 격자에서 키로 움직였거나 방금 열었을 때만 날짜 칸으로 포커스를 옮긴다.
  // "다음 달" 버튼으로 넘길 때 옮기면, 버튼에서 Enter 를 한 번 더 누르는 순간 날짜가 골라진다.
  const focusCell = useRef(false);
  useEffect(() => {
    if (open && focusCell.current) {
      cells.current[iso(cursor)]?.focus();
      focusCell.current = false;
    }
  }, [open, cursor]);

  const close = () => {
    setOpen(false);
    input.current?.focus();
  };

  const toggle = () => {
    if (!open) {
      const at = selectedDate ?? new Date();
      setCursor(at);
      setView(new Date(at.getFullYear(), at.getMonth(), 1));
      focusCell.current = true;
    }
    setOpen((v) => !v);
  };

  const pick = (d: Date) => {
    if (type === "range") {
      const start = parse(startText);
      if (!start || text.includes("/")) {
        set(iso(d));
        return;
      }
      // 끝을 시작보다 앞에 찍어도 순서를 바로잡는다.
      set(d < start ? `${iso(d)}/${iso(start)}` : `${iso(start)}/${iso(d)}`);
      close();
    } else {
      set(iso(d));
      close();
    }
  };

  const shift = (days: number) => {
    const next = new Date(cursor);
    next.setDate(next.getDate() + days);
    setCursor(next);
    setView(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const shiftMonth = (months: number) => {
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + months);
    setCursor(next);
    setView(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const onGridKey = (e: KeyboardEvent<HTMLButtonElement>, d: Date) => {
    focusCell.current = true;
    const map: Record<string, () => void> = {
      ArrowLeft: () => shift(-1),
      ArrowRight: () => shift(1),
      ArrowUp: () => shift(-7),
      ArrowDown: () => shift(7),
      PageUp: () => shiftMonth(-1),
      PageDown: () => shiftMonth(1),
      Home: () => shift(-d.getDay()),
      End: () => shift(6 - d.getDay()),
    };
    if (map[e.key]) {
      e.preventDefault();
      map[e.key]?.();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(d);
    }
  };

  const today = new Date();
  const grid = monthGrid(view);
  const helpId = `${base}-help`;
  const gridId = `${base}-grid`;
  const classes = ["ds-datepicker", `ds-datepicker--${size}`, `ds-datepicker--${type}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-datepicker" {...rest}>
      {label ? (
        <label className="ds-datepicker__label" htmlFor={`${base}-input`}>
          {label}
        </label>
      ) : null}
      <div ref={root} className="ds-datepicker__field">
        <input
          id={`${base}-input`}
          ref={input}
          type="text"
          className="ds-datepicker__input"
          placeholder={type === "range" ? "YYYY-MM-DD/YYYY-MM-DD" : "YYYY-MM-DD"}
          value={text}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          onChange={(e) => set(e.target.value)}
        />
        <button
          type="button"
          className="ds-datepicker__open"
          aria-label={t.openCalendar}
          aria-expanded={open}
          aria-controls={gridId}
          disabled={disabled}
          onClick={toggle}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
            <rect x="2" y="3.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
            <path d="M2 6.5h12M5.5 2v3M10.5 2v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>

        <div
          id={gridId}
          className="ds-datepicker__panel"
          role="dialog"
          aria-label={t.chooseDate}
          hidden={!open}
          // 패널 어디에서든(이전·다음 달 버튼 포함) Esc 로 닫는다.
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            e.preventDefault();
            close();
          }}
        >
          <div className="ds-datepicker__nav">
            <button type="button" className="ds-datepicker__navbtn" onClick={() => shiftMonth(-1)} aria-label={t.prevMonth}>
              ‹
            </button>
            <span className="ds-datepicker__month" aria-live="polite">
              {t.monthTitle(view.getFullYear(), view.getMonth() + 1)}
            </span>
            <button type="button" className="ds-datepicker__navbtn" onClick={() => shiftMonth(1)} aria-label={t.nextMonth}>
              ›
            </button>
          </div>

          <table className="ds-datepicker__grid" role="grid">
            <thead>
              <tr>
                {t.weekdays.map((w, i) => (
                  <th key={w} scope="col" abbr={t.weekdaysLong[i]}>
                    {w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }, (_, week) => (
                <tr key={week}>
                  {grid.slice(week * 7, week * 7 + 7).map((d) => {
                    const outside = d.getMonth() !== view.getMonth();
                    const isSelected = Boolean((selectedDate && sameDay(d, selectedDate)) || (rangeEnd && sameDay(d, rangeEnd)));
                    const inRange = Boolean(selectedDate && rangeEnd && d > selectedDate && d < rangeEnd);
                    const isCursor = sameDay(d, cursor);
                    return (
                      <td key={iso(d)} role="gridcell" aria-selected={isSelected}>
                        <button
                          type="button"
                          ref={(node) => {
                            cells.current[iso(d)] = node;
                          }}
                          className="ds-datepicker__day"
                          data-outside={outside || undefined}
                          data-selected={isSelected || undefined}
                          data-inrange={inRange || undefined}
                          aria-current={sameDay(d, today) ? "date" : undefined}
                          aria-label={t.dayLabel(d.getFullYear(), d.getMonth() + 1, d.getDate())}
                          // roving tabindex — 격자 전체가 Tab 한 번에 들어온다.
                          tabIndex={isCursor ? 0 : -1}
                          onClick={() => pick(d)}
                          onKeyDown={(e) => onGridKey(e, d)}
                        >
                          {d.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-datepicker__help ds-datepicker__help--invalid" : "ds-datepicker__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

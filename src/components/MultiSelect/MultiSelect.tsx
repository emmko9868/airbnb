import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./MultiSelect.css";
import { useText } from "../../lib/i18n";

export type MultiSelectSize = "sm" | "md" | "lg";
export type MultiSelectType = "default" | "inline";

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Size */
  size?: MultiSelectSize;
  /** Figma: Type */
  type?: MultiSelectType;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  items?: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  placeholder?: string;
  helperText?: string;
  onValueChange?: (values: string[]) => void;
  children?: ReactNode;
}

/**
 * A dropdown for choosing several options.
 *
 * The list has `aria-multiselectable="true"`, and each option's `aria-selected` tells whether it is chosen.
 * The number of chosen options is read out with `aria-live` — a count badge alone can only be seen, not heard.
 * The list **stays open** after you choose an option (because the point is to choose several).
 */
export const MultiSelect = forwardRef<HTMLDivElement, MultiSelectProps>(function MultiSelect(
  { size = "md", type = "default", disabled = false, invalid = false, label, items = [], value, defaultValue, placeholder: placeholderProp, helperText, onValueChange, className, children, ...rest },
  ref,
) {
  const t = useText();
  const placeholder = placeholderProp ?? t.selectPlaceholder;
  const base = useId();
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState<string[]>(defaultValue ?? []);
  const [activeIndex, setActiveIndex] = useState(-1);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  const selected = value ?? inner;
  const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled);

  const toggle = (index: number) => {
    const option = items[index];
    if (!option || option.disabled) return;
    const next = selected.includes(option.value)
      ? selected.filter((v) => v !== option.value)
      : [...selected, option.value];
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

  const move = (delta: number) => {
    if (!usable.length) return;
    const at = usable.indexOf(activeIndex);
    const next = at === -1 ? usable[0] : usable[(at + delta + usable.length) % usable.length];
    if (next !== undefined) setActiveIndex(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(usable[0] ?? -1);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIndex(usable[0] ?? -1); }
    else if (e.key === "End") { e.preventDefault(); setActiveIndex(usable[usable.length - 1] ?? -1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(activeIndex); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); trigger.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  };

  const listId = `${base}-list`;
  const labelId = `${base}-label`;
  const helpId = `${base}-help`;
  const classes = ["ds-multiselect", `ds-multiselect--${size}`, `ds-multiselect--${type}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-multiselect" {...rest}>
      {label ? <span id={labelId} className="ds-multiselect__label">{label}</span> : null}
      <div ref={root} className="ds-multiselect__field">
        <button
          type="button"
          ref={trigger}
          className="ds-multiselect__trigger"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          // 포커스는 트리거에 둔 채 활성 옵션을 가리킨다 — 없으면 낭독기가 ↑↓ 이동을 읽지 못한다.
          aria-activedescendant={open && activeIndex >= 0 ? `${base}-o-${activeIndex}` : undefined}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
        >
          {selected.length ? (
            <span className="ds-multiselect__count" aria-hidden>
              {selected.length}
            </span>
          ) : null}
          <span className={selected.length ? "ds-multiselect__value" : "ds-multiselect__placeholder"}>
            {selected.length
              ? items.filter((o) => selected.includes(o.value)).map((o) => o.label).join(", ")
              : placeholder}
          </span>
          <svg className="ds-multiselect__chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul id={listId} role="listbox" aria-multiselectable="true" className="ds-multiselect__list" hidden={!open}>
          {items.map((option, i) => {
            const on = selected.includes(option.value);
            return (
              <li
                key={option.value}
                id={`${base}-o-${i}`}
                role="option"
                className="ds-multiselect__option"
                aria-selected={on}
                aria-disabled={option.disabled || undefined}
                data-active={i === activeIndex || undefined}
                onMouseDown={(e) => { e.preventDefault(); toggle(i); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {/* 체크 표시는 장식이다 — 상태는 aria-selected 가 전한다. */}
                <span className="ds-multiselect__box" aria-hidden>
                  {on ? "✓" : ""}
                </span>
                {option.label}
              </li>
            );
          })}
        </ul>
      </div>
      <span className="ds-multiselect__sr" role="status" aria-live="polite">
        {selected.length ? t.selectedCount(selected.length) : ""}
      </span>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-multiselect__help ds-multiselect__help--invalid" : "ds-multiselect__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

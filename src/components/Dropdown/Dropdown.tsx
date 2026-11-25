import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./Dropdown.css";
import { useText } from "../../lib/i18n";

export type DropdownType = "default" | "inline";
export type DropdownSize = "sm" | "md" | "lg";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// div 의 defaultValue 는 string | number | readonly string[] 이라 우리 string 과 충돌한다.
export interface DropdownProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Type */
  type?: DropdownType;
  /** Figma: Size */
  size?: DropdownSize;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  items?: DropdownOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: string;
  /** Not named onSelect, because onSelect is already a native DOM event and can't be used. */
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

/**
 * A custom-built dropdown for picking one option.
 *
 * Follows the WAI-ARIA combobox + listbox pattern. If a native `select` can do the job, use `Select` —
 * the native one works much better on mobile. Use this one only when the options need formatting.
 *
 * Focus stays on the trigger, and `aria-activedescendant` points to the active option.
 * If focus moved to each option, screen readers would announce it as if you had left the list.
 */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { type = "default", size = "md", disabled = false, invalid = false, label, items = [], value, defaultValue, placeholder: placeholderProp, helperText, onValueChange, className, children, ...rest },
  ref,
) {
  const t = useText();
  const placeholder = placeholderProp ?? t.selectPlaceholder;
  const base = useId();
  const [open, setOpen] = useState(false);
  const [inner, setInner] = useState(defaultValue ?? "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const root = useRef<HTMLDivElement | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);

  const selected = value ?? inner;
  const usable = items.map((_, i) => i).filter((i) => !items[i]?.disabled);
  const current = items.find((o) => o.value === selected);

  const choose = (index: number) => {
    const option = items[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInner(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    trigger.current?.focus();
  };

  // 바깥을 누르면 닫는다. 열려 있을 때만 듣는다.
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
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      const start = items.findIndex((o) => o.value === selected);
      setActiveIndex(start >= 0 ? start : (usable[0] ?? -1));
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Home") { e.preventDefault(); setActiveIndex(usable[0] ?? -1); }
    else if (e.key === "End") { e.preventDefault(); setActiveIndex(usable[usable.length - 1] ?? -1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(activeIndex); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    else if (e.key === "Tab") setOpen(false);
  };

  const classes = ["ds-dropdown", `ds-dropdown--${type}`, `ds-dropdown--${size}`, className].filter(Boolean).join(" ");
  const listId = `${base}-list`;
  const labelId = `${base}-label`;
  const helpId = `${base}-help`;

  return (
    <div ref={ref} className={classes} data-testid="ds-dropdown" aria-disabled={disabled || undefined} {...rest}>
      {label ? <span id={labelId} className="ds-dropdown__label">{label}</span> : null}
      <div ref={root} className="ds-dropdown__field">
        <button
          type="button"
          ref={trigger}
          className="ds-dropdown__trigger"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          aria-activedescendant={open && activeIndex >= 0 ? `${base}-o-${activeIndex}` : undefined}
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
        >
          <span className={current ? "ds-dropdown__value" : "ds-dropdown__placeholder"}>
            {current?.label ?? placeholder}
          </span>
          <svg className="ds-dropdown__chevron" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <ul id={listId} role="listbox" className="ds-dropdown__list" aria-labelledby={label ? labelId : undefined} hidden={!open}>
          {items.map((option, i) => (
            <li
              key={option.value}
              id={`${base}-o-${i}`}
              role="option"
              className="ds-dropdown__option"
              aria-selected={option.value === selected}
              aria-disabled={option.disabled || undefined}
              data-active={i === activeIndex || undefined}
              // 포커스를 옮기지 않으므로 mousedown 으로 처리한다(blur 보다 먼저 일어난다).
              onMouseDown={(e) => { e.preventDefault(); choose(i); }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </div>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-dropdown__help ds-dropdown__help--invalid" : "ds-dropdown__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

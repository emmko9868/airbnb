import { forwardRef, useEffect, useId, useMemo, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./ComboBox.css";
import { useText } from "../../lib/i18n";

export type ComboBoxSize = "sm" | "md" | "lg";

export interface ComboBoxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ComboBoxProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** Figma: Size */
  size?: ComboBoxSize;
  /** Figma: Disabled */
  disabled?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  items?: ComboBoxOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  helperText?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

/**
 * Combo box — a choice you narrow down by typing.
 *
 * How it differs from Dropdown: the trigger is a **text input**, so you narrow the list by typing.
 * `aria-autocomplete="list"` tells screen readers that "typing narrows the list".
 * The number of results is read out through `aria-live` — seeing the list shrink must not be the only way to notice it.
 */
export const ComboBox = forwardRef<HTMLDivElement, ComboBoxProps>(function ComboBox(
  { size = "md", disabled = false, invalid = false, label, items = [], value, defaultValue, placeholder: placeholderProp, helperText, onValueChange, className, children, ...rest },
  ref,
) {
  const t = useText();
  const placeholder = placeholderProp ?? t.comboPlaceholder;
  const base = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [inner, setInner] = useState(defaultValue ?? "");
  const [activeIndex, setActiveIndex] = useState(-1);
  const root = useRef<HTMLDivElement | null>(null);
  const input = useRef<HTMLInputElement | null>(null);

  const selected = value ?? inner;
  const current = items.find((o) => o.value === selected);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((o) => o.label.toLowerCase().includes(q));
  }, [items, query]);

  const usable = filtered.map((_, i) => i).filter((i) => !filtered[i]?.disabled);

  const choose = (index: number) => {
    const option = filtered[index];
    if (!option || option.disabled) return;
    if (value === undefined) setInner(option.value);
    onValueChange?.(option.value);
    setQuery("");
    setOpen(false);
    input.current?.focus();
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

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
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
    else if (e.key === "Enter") { e.preventDefault(); choose(activeIndex); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); setQuery(""); }
  };

  const listId = `${base}-list`;
  const helpId = `${base}-help`;
  const classes = ["ds-combobox", `ds-combobox--${size}`, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-combobox" {...rest}>
      {label ? (
        <label className="ds-combobox__label" htmlFor={`${base}-input`}>
          {label}
        </label>
      ) : null}
      <div ref={root} className="ds-combobox__field">
        <input
          id={`${base}-input`}
          ref={input}
          type="text"
          className="ds-combobox__input"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={open && activeIndex >= 0 ? `${base}-o-${activeIndex}` : undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={helperText ? helpId : undefined}
          // 열려서 검색어가 비어 있으면 지금 값을 흐리게 보여 준다 — 값이 사라진 것처럼 보이지 않게.
          placeholder={open && current ? current.label : placeholder}
          disabled={disabled}
          value={open ? query : (current?.label ?? "")}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          // Tab 등으로 포커스가 빠져나가면 닫는다. 옵션은 mousedown 에서 기본 동작을 막아 blur 가 나지 않는다.
          onBlur={(e) => {
            if (root.current?.contains(e.relatedTarget as Node | null)) return;
            setOpen(false);
            setQuery("");
          }}
          onKeyDown={onKeyDown}
        />
        <ul id={listId} role="listbox" className="ds-combobox__list" hidden={!open}>
          {filtered.map((option, i) => (
            <li
              key={option.value}
              id={`${base}-o-${i}`}
              role="option"
              className="ds-combobox__option"
              aria-selected={option.value === selected}
              aria-disabled={option.disabled || undefined}
              data-active={i === activeIndex || undefined}
              onMouseDown={(e) => { e.preventDefault(); choose(i); }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {option.label}
            </li>
          ))}
          {!filtered.length ? <li className="ds-combobox__empty">{t.noResults}</li> : null}
        </ul>
      </div>
      {/* 좁혀진 결과 수를 소리로도 알린다. */}
      <span className="ds-combobox__sr" role="status" aria-live="polite">
        {open ? t.resultCount(filtered.length) : ""}
      </span>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-combobox__help ds-combobox__help--invalid" : "ds-combobox__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

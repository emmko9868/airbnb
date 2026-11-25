import { forwardRef, useEffect, useRef, useState } from "react";
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { assignRefs } from "../../lib/refs";
import "./Search.css";
import { useText } from "../../lib/i18n";

export type SearchSize = "sm" | "md" | "lg";

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  /** Figma: Size */
  size?: SearchSize;
  /** Figma: Expandable — while the field is empty, only the magnifying-glass button is shown. */
  expandable?: boolean;
  /** Accessible name (what screen readers announce). It is not shown on screen (the placeholder does not count as a name). */
  label?: string;
  /** Called when the field is emptied with the clear button or the Esc key. onChange is also called, with an empty value. */
  onClear?: () => void;
  children?: ReactNode;
}

/** Changes the value through the native setter and fires an `input` event, so onChange still runs even when the value is controlled. */
function setNativeValue(el: HTMLInputElement, next: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(el, next);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Search field.
 *
 * `input[type=search]` + a magnifying-glass icon + a clear button. The outer wrapper is a `role=search` landmark.
 * The clear button appears once there is a value, and Esc also clears it. The ref points to the input.
 */
export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  { size = "md", expandable = false, label: labelProp, placeholder: placeholderProp, onClear, className, children, value, defaultValue, onChange, onKeyDown, onBlur, disabled, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.search;
  const placeholder = placeholderProp ?? t.searchPlaceholder;
  const input = useRef<HTMLInputElement | null>(null);
  const [inner, setInner] = useState(String(defaultValue ?? ""));
  const current = value !== undefined ? String(value ?? "") : inner;
  const [expanded, setExpanded] = useState(false);
  const [focusAfterExpand, setFocusAfterExpand] = useState(false);
  const collapsed = expandable && !expanded && current === "";

  useEffect(() => {
    if (focusAfterExpand && !collapsed) {
      input.current?.focus();
      setFocusAfterExpand(false);
    }
  }, [focusAfterExpand, collapsed]);

  const change = (e: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) setInner(e.target.value);
    onChange?.(e);
  };

  const clear = () => {
    const el = input.current;
    if (!el) return;
    setNativeValue(el, "");
    onClear?.();
    el.focus();
  };

  const keyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented || e.key !== "Escape") return;
    if (current !== "") {
      e.preventDefault();
      clear();
    } else if (expandable) {
      setExpanded(false);
    }
  };

  const classes = [
    "ds-search",
    `ds-search--${size}`,
    expandable && "ds-search--expandable",
    collapsed && "ds-search--collapsed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const icon = (
    <svg className="ds-search__glyph" viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className={classes} role="search" data-testid="ds-search">
      {collapsed ? (
        <button
          type="button"
          className="ds-search__toggle"
          aria-label={label}
          disabled={disabled}
          onClick={() => {
            setExpanded(true);
            setFocusAfterExpand(true);
          }}
        >
          {icon}
        </button>
      ) : (
        <>
          <span className="ds-search__icon">{icon}</span>
          <input
            ref={assignRefs(ref, input)}
            type="search"
            className="ds-search__field"
            aria-label={label}
            placeholder={placeholder}
            value={current}
            disabled={disabled}
            onChange={change}
            onKeyDown={keyDown}
            onBlur={(e) => {
              onBlur?.(e);
              if (expandable && e.currentTarget.value === "") setExpanded(false);
            }}
            {...rest}
          />
          {current !== "" && !disabled ? (
            <button type="button" className="ds-search__clear" aria-label={t.clearSearch} onClick={clear}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </>
      )}
      {children}
    </div>
  );
});

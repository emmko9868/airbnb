import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes, ReactNode } from "react";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Figma: Size */
  size?: SelectSize;
  /** Figma: Invalid */
  invalid?: boolean;
  label?: string;
  helperText?: string;
  /** The choices. If omitted, the `<option>` elements in children are used as they are. */
  items?: SelectOption[];
  /** Hint text shown while nothing is chosen. If given, an empty first option is added. */
  placeholder?: string;
  children?: ReactNode;
}

/**
 * Native select box. On mobile the phone's own picker opens, and the browser handles keyboard and screen-reader support.
 * Use Dropdown only when the options need custom formatting. The ref points to the `<select>`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = "md", invalid = false, label, helperText, items, placeholder, className, children, id: idProp, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const classes = ["ds-select", `ds-select--${size}`, className].filter(Boolean).join(" ");
  const described = [describedBy, helperText ? helpId : null].filter(Boolean).join(" ") || undefined;
  // 안내 문구를 보이려면 처음 값이 빈 값이어야 한다. 브라우저는 disabled 가 아닌 첫 option 을 고른다.
  const initial = placeholder && rest.value === undefined && rest.defaultValue === undefined ? { defaultValue: "" } : {};

  return (
    <div className={classes} data-testid="ds-select">
      {label ? (
        <label className="ds-select__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <select ref={ref} id={id} className="ds-select__field" aria-invalid={invalid || undefined} aria-describedby={described} {...initial} {...rest}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {items
          ? items.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          : children}
      </select>
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-select__help ds-select__help--invalid" : "ds-select__help"}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
});

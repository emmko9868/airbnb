import { forwardRef, useEffect, useId, useRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { assignRefs } from "../../lib/refs";
import "./Checkbox.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Figma: Indeterminate */
  indeterminate?: boolean;
  /** Figma: Invalid */
  invalid?: boolean;
  /** The text shown next to the box. If it is not given, children is used instead. */
  label?: string;
  children?: ReactNode;
}

/**
 * A checkbox for turning one option on or off.
 *
 * Uses the native `input[type=checkbox]` — the browser takes care of the keyboard (Space), form submission and what screen readers announce.
 * The ref points to the input (so a form library's register attaches to it directly).
 * `indeterminate` is a DOM property, not an HTML attribute, so it is set in an effect.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { indeterminate = false, invalid = false, label, className, children, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const input = useRef<HTMLInputElement | null>(null);
  const text = label ?? children;

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const classes = ["ds-checkbox", invalid && "ds-checkbox--invalid", className].filter(Boolean).join(" ");

  return (
    <div className={classes} data-testid="ds-checkbox">
      <input
        ref={assignRefs(ref, input)}
        id={id}
        type="checkbox"
        className="ds-checkbox__field"
        aria-invalid={invalid || undefined}
        {...rest}
      />
      {text ? (
        <label className="ds-checkbox__label" htmlFor={id}>
          {text}
        </label>
      ) : null}
    </div>
  );
});

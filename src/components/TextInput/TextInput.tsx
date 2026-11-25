import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import "./TextInput.css";

export type TextInputSize = "sm" | "md" | "lg";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Figma: Size */
  size?: TextInputSize;
  /** Figma: Invalid */
  invalid?: boolean;
  helperText?: string;
  label?: string;
  children?: ReactNode;
}

/**
 * Single-line text input.
 *
 * The ref points to the `<input>`, so form libraries (register) and focus() work as they are.
 * `className` goes on the outer wrapper, which also holds the label and helper text.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { size = "md", invalid = false, helperText, label, className, children, id: idProp, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const classes = ["ds-textinput", `ds-textinput--${size}`, className].filter(Boolean).join(" ");
  const described = [describedBy, helperText ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classes} data-testid="ds-textinput">
      {label ? (
        <label className="ds-textinput__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <input ref={ref} id={id} className="ds-textinput__field" aria-invalid={invalid || undefined} aria-describedby={described} {...rest} />
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-textinput__help ds-textinput__help--invalid" : "ds-textinput__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

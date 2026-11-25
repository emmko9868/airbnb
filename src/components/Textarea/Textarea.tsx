import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";
import "./Textarea.css";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Figma: Size */
  size?: TextareaSize;
  /** Figma: Invalid */
  invalid?: boolean;
  helperText?: string;
  label?: string;
  children?: ReactNode;
}

/**
 * Multi-line text input. The ref points to the `<textarea>`.
 * `children` goes below the helper text, not inside the textarea (set the textarea's value with value/defaultValue).
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { size = "md", invalid = false, helperText, label, className, children, id: idProp, "aria-describedby": describedBy, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const helpId = `${id}-help`;
  const classes = ["ds-textarea", `ds-textarea--${size}`, className].filter(Boolean).join(" ");
  const described = [describedBy, helperText ? helpId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={classes} data-testid="ds-textarea">
      {label ? (
        <label className="ds-textarea__label" htmlFor={id}>
          {label}
        </label>
      ) : null}
      <textarea ref={ref} id={id} className="ds-textarea__field" aria-invalid={invalid || undefined} aria-describedby={described} {...rest} />
      {helperText ? (
        <span id={helpId} className={invalid ? "ds-textarea__help ds-textarea__help--invalid" : "ds-textarea__help"}>
          {helperText}
        </span>
      ) : null}
      {children}
    </div>
  );
});

import { forwardRef, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import "./Toggle.css";

export type ToggleSize = "sm" | "md";

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "defaultChecked"> {
  /** Figma: Size */
  size?: ToggleSize;
  /** Figma: Checked — controlled. If you pass it, you must update it yourself in onCheckedChange. */
  checked?: boolean;
  /** Starting state when uncontrolled. */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Text next to the switch. If omitted, children is used. If both are missing, give it an aria-label. */
  label?: string;
  children?: ReactNode;
}

/**
 * On/off switch.
 *
 * WAI-ARIA switch pattern — a `button[role=switch]` with `aria-checked`. The text sits inside the button, so it
 * becomes the accessible name, and clicking the text also switches it. Use it only for settings that apply right away (use Checkbox if a form must be submitted).
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { size = "md", checked, defaultChecked = false, onCheckedChange, label, className, children, onClick, type = "button", ...rest },
  ref,
) {
  const [inner, setInner] = useState(defaultChecked);
  const on = checked ?? inner;
  const text = label ?? children;

  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (checked === undefined) setInner(!on);
    onCheckedChange?.(!on);
  };

  const classes = ["ds-toggle", `ds-toggle--${size}`, on && "ds-toggle--checked", className].filter(Boolean).join(" ");

  return (
    <button ref={ref} type={type} role="switch" aria-checked={on} className={classes} data-testid="ds-toggle" onClick={handle} {...rest}>
      <span className="ds-toggle__track" aria-hidden>
        <span className="ds-toggle__thumb" />
      </span>
      {text ? <span className="ds-toggle__label">{text}</span> : null}
    </button>
  );
});

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "link";
export type ButtonSize = "large" | "small";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Shows loading spinner and disables interaction */
  isLoading?: boolean;
  /** Makes button full width of container */
  fullWidth?: boolean;
  /** Optional leading icon */
  icon?: ReactNode;
  children?: ReactNode;
}

/** Loading ellipsis SVG from Figma (3 dots) */
const LoadingEllipsis = () => (
  <svg
    className="ds-button__ellipsis"
    width="36"
    height="8"
    viewBox="0 0 36 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="4" cy="4" r="4" fill="var(--color-neutral-02)" />
    <circle cx="18" cy="4" r="4" fill="var(--color-on-primary)" />
    <circle cx="32" cy="4" r="4" fill="var(--color-on-primary)" />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "large",
    isLoading = false,
    fullWidth = false,
    className,
    children,
    icon,
    type = "button",
    disabled,
    ...rest
  },
  ref,
) {
  const classes = [
    "ds-button",
    `ds-button--${variant}`,
    `ds-button--${size}`,
    fullWidth && "ds-button--full-width",
    isLoading && "ds-button--loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      data-testid="ds-button"
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...rest}
    >
      {isLoading && variant === "primary" ? (
        <LoadingEllipsis />
      ) : isLoading ? (
        <span className="ds-button__spinner" aria-hidden="true" />
      ) : null}
      {icon && !isLoading && <span className="ds-button__icon">{icon}</span>}
      {!isLoading && <span className="ds-button__content">{children}</span>}
    </button>
  );
});

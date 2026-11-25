import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

export type IconButtonSize = "L" | "S";
export type IconButtonVariant = "primary" | "secondary";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button size (Figma: Size) */
  size?: IconButtonSize;
  /** Visual style variant (Figma: Type) */
  variant?: IconButtonVariant;
  /** Icon SVG to render */
  icon?: ReactNode;
  /**
   * Accessible name for the button. Becomes aria-label and title.
   * Required because the button has no visible text.
   */
  label: string;
  children?: ReactNode;
}

/** Profile icon — from my-assets/icons/Button Icon/Type=Profile.svg */
export const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" strokeWidth="1.5" stroke="currentColor"/>
    <path d="M19.8451 19.215C18.6601 17.1075 16.6501 15.54 14.2501 14.9175V14.3775C15.5926 13.5975 16.5001 12.1575 16.5001 10.5C16.5001 8.0175 14.4826 6 12.0001 6C9.51756 6 7.50006 8.0175 7.50006 10.5C7.50006 12.165 8.40756 13.605 9.75006 14.3775V14.9175C7.38006 15.5325 5.37756 17.07 4.18506 19.1475" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** Search icon — from my-assets/icons/Button Icon/Type=Search.svg */
export const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.9163 14.9163L21.1663 21.1663" strokeWidth="1.5" stroke="currentColor"/>
    <path d="M17.0002 9.91681C17.0002 13.8289 13.8289 17.0002 9.91681 17.0002C6.00481 17.0002 2.8335 13.8289 2.8335 9.91681C2.8335 6.00481 6.00481 2.8335 9.91681 2.8335C13.8289 2.8335 17.0002 6.00481 17.0002 9.91681Z" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** Menu icon — from my-assets/icons/Button Icon/Type=Menu.svg */
export const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 11.7143H22M2 17.4286H22M2 6H22" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** Next icon — from my-assets/icons/Button Icon/Type=Next.svg */
export const NextIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L16.7286 11.4167C16.9026 11.5724 17 11.7819 17 12C17 12.2181 16.9026 12.4276 16.7286 12.5833L6 22" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** Previous icon — from my-assets/icons/Button Icon/Type=Previous.svg */
export const PreviousIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 22L6.74673 12.5833C6.58858 12.4276 6.5 12.2181 6.5 12C6.5 11.7819 6.58858 11.5724 6.74673 11.4167L16.5 2" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** Redirect icon — from my-assets/icons/Button Icon/Type=Redirect.svg */
export const RedirectIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.5593 12H2M13.2842 3L21.785 11.475C21.9228 11.6152 22 11.8037 22 12C22 12.1963 21.9228 12.3848 21.785 12.525L13.2842 21" strokeWidth="1.5" stroke="currentColor"/>
  </svg>
);

/** A round icon-only button. `label` is its accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "secondary", size = "L", icon, label, className, children, type = "button", disabled, ...rest },
  ref,
) {
  const classes = ["ds-iconbutton", `ds-iconbutton--${variant}`, `ds-iconbutton--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      data-testid="ds-iconbutton"
      aria-label={label}
      title={label}
      disabled={disabled}
      {...rest}
    >
      <span className="ds-iconbutton__icon" aria-hidden>
        {icon ?? children}
      </span>
    </button>
  );
});

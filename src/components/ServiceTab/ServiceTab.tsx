import { forwardRef } from "react";
import type { ButtonHTMLAttributes, CSSProperties } from "react";
import "./ServiceTab.css";

export interface ServiceTabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text label below the icon */
  label: string;
  /** Icon image source URL (PNG) */
  icon: string;
  /** Whether this tab is currently selected */
  selected?: boolean;
}

/**
 * Component-scoped color tokens from Figma design (node 418:3150).
 * These are exact Figma fill values not declared as Figma variables,
 * so they are defined here as CSS custom properties on the root element.
 */
const SERVICE_TAB_TOKENS: CSSProperties = {
  "--st-hover-bg": "#FCEDED",
  "--st-selected-border": "#C72D65",
  "--st-selected-overlay": "rgba(241,164,164,0.2)",
} as CSSProperties;

/** A selectable category tab — icon above label, Airbnb-style. */
export const ServiceTab = forwardRef<HTMLButtonElement, ServiceTabProps>(function ServiceTab(
  { label, icon, selected = false, className, style, disabled, ...rest },
  ref,
) {
  const classes = ["ds-servicetab", selected && "ds-servicetab--selected", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      type="button"
      className={classes}
      data-testid="ds-servicetab"
      data-selected={selected || undefined}
      disabled={disabled}
      style={{ ...SERVICE_TAB_TOKENS, ...style }}
      {...rest}
    >
      <span className="ds-servicetab__icon-item">
        <span className="ds-servicetab__service-icon">
          <img src={icon} alt="" width={48} height={48} />
        </span>
      </span>
      <span className="ds-servicetab__label">{label}</span>
    </button>
  );
});

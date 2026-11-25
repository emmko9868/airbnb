import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Badge.css";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Tone */
  tone?: BadgeTone;
  children?: ReactNode;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(function Badge(
  { tone = "neutral", className, children, ...rest },
  ref,
) {
  const classes = [
    "ds-badge",
    `ds-badge--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-badge" {...rest}>
      {children}
    </div>
  );
});

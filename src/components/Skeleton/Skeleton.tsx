import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Skeleton.css";

export type SkeletonVariant = "text" | "placeholder" | "icon";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Variant — text (lines of text) · placeholder (space for an image or card) · icon (small square) */
  variant?: SkeletonVariant;
  /** Figma: Animated — a moving shimmer effect. It stops when the user's "reduce motion" setting is on. */
  animated?: boolean;
  /** Number of lines when the variant is text. The last line is drawn shorter. */
  lines?: number;
  /** A skeleton never shows content. Children are accepted but ignored. */
  children?: ReactNode;
}

/**
 * Loading placeholder.
 *
 * The skeleton itself carries no meaning, so it is `aria-hidden`. To announce "loading", put
 * `aria-busy` on the surrounding area or use Loading. Override the size with style/className.
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { variant = "text", animated = false, lines = 1, className, children: _children, ...rest },
  ref,
) {
  const classes = ["ds-skeleton", `ds-skeleton--${variant}`, animated && "ds-skeleton--animated", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-skeleton" aria-hidden {...rest}>
      {variant === "text"
        ? Array.from({ length: Math.max(1, lines) }, (_, i) => <span key={i} className="ds-skeleton__line" />)
        : <span className="ds-skeleton__block" />}
    </div>
  );
});

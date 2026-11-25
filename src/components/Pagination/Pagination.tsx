import { forwardRef, useState } from "react";
import type { HTMLAttributes } from "react";
import "./Pagination.css";
import { useText } from "../../lib/i18n";

export type PaginationVariant = "default" | "compact";
export type PaginationSize = "sm" | "md" | "lg";

export interface PaginationProps extends HTMLAttributes<HTMLElement> {
  /** Figma: Variant */
  variant?: PaginationVariant;
  /** Figma: Size */
  size?: PaginationSize;
  /** The current page, counting from 1 (controlled). If you pass it, you must update it yourself in `onPageChange`. */
  page?: number;
  /** The page shown first (uncontrolled). */
  defaultPage?: number;
  pageCount?: number;
  /** Called with the new page number. (It is not named `onChange` because that is already a native DOM event.) */
  onPageChange?: (page: number) => void;
  /** How many page numbers to show on each side of the current page. */
  siblings?: number;
  label?: string;
}

/** Shows only the pages around the current one and folds the rest into an ellipsis (…). */
function pagesToShow(page: number, pageCount: number, siblings: number): (number | "gap")[] {
  if (pageCount <= siblings * 2 + 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - siblings);
  const end = Math.min(pageCount - 1, page + siblings);
  if (start > 2) out.push("gap");
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < pageCount - 1) out.push("gap");
  out.push(pageCount);
  return out;
}

/**
 * Controls for moving between pages.
 *
 * `nav` + `aria-label` give the area a name, and the current page gets `aria-current="page"`.
 * The ellipsis is an `aria-hidden` mark, not a button, so it is not in the Tab order.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { variant = "default", size = "md", page: pageProp, defaultPage = 1, pageCount = 1, onPageChange, siblings = 1, label: labelProp, className, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.pagination;
  const classes = ["ds-pagination", `ds-pagination--${variant}`, `ds-pagination--${size}`, className]
    .filter(Boolean)
    .join(" ");
  const [inner, setInner] = useState(defaultPage);
  const page = pageProp ?? inner;
  const go = (n: number) => {
    if (n < 1 || n > pageCount || n === page) return;
    if (pageProp === undefined) setInner(n);
    onPageChange?.(n);
  };
  const items = variant === "compact" ? [] : pagesToShow(page, pageCount, siblings);

  return (
    <nav ref={ref} className={classes} data-testid="ds-pagination" aria-label={label} {...rest}>
      <button type="button" className="ds-pagination__step" onClick={() => go(page - 1)} disabled={page <= 1} aria-label={t.prevPage}>
        ‹
      </button>

      {variant === "compact" ? (
        <span className="ds-pagination__status">
          {page} / {pageCount}
        </span>
      ) : (
        <ul className="ds-pagination__list">
          {items.map((item, i) =>
            item === "gap" ? (
              <li key={`gap-${i}`} className="ds-pagination__gap" aria-hidden>
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  className="ds-pagination__page"
                  onClick={() => go(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-label={t.pageN(item)}
                >
                  {item}
                </button>
              </li>
            ),
          )}
        </ul>
      )}

      <button type="button" className="ds-pagination__step" onClick={() => go(page + 1)} disabled={page >= pageCount} aria-label={t.nextPage}>
        ›
      </button>
    </nav>
  );
});

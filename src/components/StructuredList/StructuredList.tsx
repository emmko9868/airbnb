import { forwardRef, useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./StructuredList.css";
import { useText } from "../../lib/i18n";

export interface StructuredRow {
  id: string;
  cells: ReactNode[];
  disabled?: boolean;
}

export interface StructuredListProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Selectable */
  selectable?: boolean;
  /** Figma: Condensed */
  condensed?: boolean;
  headers?: string[];
  rows?: StructuredRow[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  label?: string;
  children?: ReactNode;
}

/**
 * A list laid out in rows and columns, like a simple table.
 *
 * Lighter than DataTable, and meant for choosing **only one** row.
 * When selectable, each row gets a real `radio` — with `aria-selected` alone, rows can't be picked with the keyboard.
 * When not selectable, it still uses a table (instead of `dl`) rather than a meaningless grid with no `role="table"`.
 */
export const StructuredList = forwardRef<HTMLDivElement, StructuredListProps>(function StructuredList(
  { selectable = false, condensed = false, headers = [], rows = [], value, defaultValue, onValueChange, label: labelProp, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.list;
  const name = useId();
  const [inner, setInner] = useState(defaultValue ?? "");
  const selected = value ?? inner;

  const choose = (id: string) => {
    if (value === undefined) setInner(id);
    onValueChange?.(id);
  };

  const classes = [
    "ds-structuredlist",
    selectable && "ds-structuredlist--selectable",
    condensed && "ds-structuredlist--condensed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-structuredlist" {...rest}>
      <table className="ds-structuredlist__table">
        <caption className="ds-structuredlist__caption">{label}</caption>
        {headers.length ? (
          <thead>
            <tr>
              {selectable ? <th scope="col" className="ds-structuredlist__pick" aria-label={t.pick} /> : null}
              {headers.map((h, i) => (
                <th key={i} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="ds-structuredlist__row" data-selected={row.id === selected || undefined}>
              {selectable ? (
                <td className="ds-structuredlist__pick">
                  <input
                    type="radio"
                    name={name}
                    value={row.id}
                    checked={row.id === selected}
                    disabled={row.disabled}
                    onChange={() => choose(row.id)}
                    aria-label={typeof row.cells[0] === "string" ? String(row.cells[0]) : t.pickRow(row.id)}
                  />
                </td>
              ) : null}
              {row.cells.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  );
});

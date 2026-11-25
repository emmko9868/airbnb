import { forwardRef, useCallback, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./CodeSnippet.css";
import { useText } from "../../lib/i18n";

export type CodeSnippetType = "single" | "multi" | "inline";

export interface CodeSnippetProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Type */
  type?: CodeSnippetType;
  /** Figma: WrapText */
  wrapText?: boolean;
  /** Figma: Disabled */
  disabled?: boolean;
  code?: string;
  /** How many lines to show when a multi snippet is collapsed. */
  collapsedLines?: number;
  children?: ReactNode;
}

/**
 * A piece of code to show and copy.
 *
 * A successful copy is announced **in words** — if only the icon changes, screen reader users can't tell whether it was copied.
 * The result is written into an `aria-live="polite"` region.
 * `inline` renders only `code`, with no button.
 */
export const CodeSnippet = forwardRef<HTMLDivElement, CodeSnippetProps>(function CodeSnippet(
  { type = "single", wrapText = false, disabled = false, code = "", collapsedLines = 15, className, children, ...rest },
  ref,
) {
  const t = useText();
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState(false);
  const text = code || (typeof children === "string" ? children : "");
  const lines = text.split("\n");
  const longEnough = type === "multi" && lines.length > collapsedLines;

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(t.copied);
    } catch {
      setStatus(t.copyFailed);
    }
    window.setTimeout(() => setStatus(""), 3000);
  }, [text, t]);

  const classes = [
    "ds-codesnippet",
    `ds-codesnippet--${type}`,
    wrapText && "ds-codesnippet--wrap",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (type === "inline") {
    return (
      <code ref={ref as never} className={classes} data-testid="ds-codesnippet" {...rest}>
        {text || children}
      </code>
    );
  }

  const shown = longEnough && !expanded ? lines.slice(0, collapsedLines).join("\n") : text;

  return (
    <div ref={ref} className={classes} data-testid="ds-codesnippet" {...rest}>
      <pre className="ds-codesnippet__pre">
        <code>{shown}</code>
      </pre>
      <button type="button" className="ds-codesnippet__copy" onClick={copy} disabled={disabled} aria-label={t.copyCode}>
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden focusable="false">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M10.5 5.5v-2a1.5 1.5 0 0 0-1.5-1.5H3.5A1.5 1.5 0 0 0 2 3.5v5.5a1.5 1.5 0 0 0 1.5 1.5h2" stroke="currentColor" strokeWidth="1.3" fill="none" />
        </svg>
      </button>
      {longEnough ? (
        <button type="button" className="ds-codesnippet__more" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? t.collapse : t.showMoreLines(lines.length - collapsedLines)}
        </button>
      ) : null}
      {/* 결과를 글자로 전한다. 아이콘 변화만으로는 전달되지 않는다. */}
      <span className="ds-codesnippet__status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
});

import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import "./Callout.css";

export type CalloutVariant = "propertyHighlight" | "cancelation";

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Figma: Property 1 */
  variant?: CalloutVariant;
  /** Property Highlight: main message text */
  children?: ReactNode;
  /** Cancelation: section header (e.g., "Your reservation") */
  title?: ReactNode;
  /** Cancelation: status label (e.g., "CANCELED") */
  statusLabel?: ReactNode;
  /** Cancelation: property name (e.g., "tiny house, tiny farm") */
  propertyName?: ReactNode;
  /** Cancelation: reservation code (e.g., "Reservation code: XMPQKAPZ6D") */
  reservationCode?: ReactNode;
  /** Cancelation: image area content (default: gray placeholder) */
  imagePlaceholder?: ReactNode;
}

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  {
    variant = "propertyHighlight",
    className,
    children,
    title,
    statusLabel,
    propertyName,
    reservationCode,
    imagePlaceholder,
    ...rest
  },
  ref,
) {
  const classes = ["ds-callout", `ds-callout--${variant}`, className].filter(Boolean).join(" ");

  return (
    <div ref={ref} className={classes} data-testid="ds-callout" {...rest}>
      {variant === "propertyHighlight" && (
        <>
          <p className="ds-callout__text">{children}</p>
          <div className="ds-callout__icon" aria-hidden>
            <svg
              width="32"
              height="32"
              viewBox="0 0 30.8792 30.3859"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.43586 2.57081L3.41296 10.1451L15.5663 25.7143L27.4741 10.1451L21.3296 2.57081H9.43586Z" fill="var(--color-accent-01)" />
              <path d="M15.4415 30.3859L0.0664263 9.79045L30.8082 9.79045L15.4415 30.3859Z" strokeWidth="2.38321" stroke="var(--color-accent-02)" />
              <path d="M0.452094 10.126L8.6324 0.595801H21.9103L30.435 10.13" strokeWidth="1.1916" stroke="var(--color-accent-02)" />
              <path d="M8.77777 0.782981L15.4484 29.542L22.1054 0.782981" strokeWidth="1.1916" stroke="var(--color-accent-02)" />
            </svg>
          </div>
        </>
      )}
      {variant === "cancelation" && (
        <>
          {title && <p className="ds-callout__title">{title}</p>}
          <div className="ds-callout__content">
            <div className="ds-callout__image">
              {imagePlaceholder ?? <div className="ds-callout__placeholder" />}
            </div>
            <div className="ds-callout__details">
              {statusLabel && <p className="ds-callout__status">{statusLabel}</p>}
              <div className="ds-callout__info">
                {propertyName && <p className="ds-callout__name">{propertyName}</p>}
                {reservationCode && <p className="ds-callout__code">{reservationCode}</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

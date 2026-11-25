import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import "./Card.css";
import { Button } from "../Button/Button";

export type CardType = "default" | "sleep" | "reservation" | "confirmation" | "discount" | "map";

export interface BreakdownItem {
  label: string;
  value: string;
  isSuccess?: boolean;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  cardType?: CardType;
  title?: string;
  subtitle?: string;
  dates?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  reviews?: number;
  imageSrc?: string;
  isFavorite?: boolean;
  onFavoriteClick?: () => void;
  onReserveClick?: () => void;
  guests?: string;
  breakdownItems?: BreakdownItem[];
  totalLabel?: string;
  total?: string;
}

/* ── SVG Icons from Figma (original paths) ── */

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 3C4.239 3 2 5.216 2 7.95C2 10.157 2.875 15.395 11.488 20.69C11.6423 20.7839 11.8194 20.8335 12 20.8335C12.1806 20.8335 12.3577 20.7839 12.512 20.69C21.125 15.395 22 10.157 22 7.95C22 5.216 19.761 3 17 3C14.239 3 12 6 12 6C12 6 9.761 3 7 3Z"
      fill={filled ? "var(--color-primary)" : "rgba(34, 34, 34, 0.3)"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="white"
    />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 13.9913 13.3556" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.54356 0.286448C6.72397 -0.0954823 7.26736 -0.0954828 7.44776 0.286447L9.16868 3.92971C9.24156 4.08402 9.38811 4.19049 9.55739 4.21213L13.5541 4.72298C13.9731 4.77654 14.141 5.29333 13.8335 5.58293L10.9004 8.34545C10.7762 8.46245 10.7202 8.63473 10.7519 8.8024L11.5011 12.7614C11.5797 13.1764 11.1401 13.4958 10.7696 13.2929L7.2359 11.3569C7.08623 11.2749 6.90509 11.2749 6.75543 11.3569L3.22172 13.2929C2.85127 13.4958 2.41166 13.1764 2.4902 12.7614L3.23941 8.8024C3.27114 8.63473 3.21517 8.46245 3.09094 8.34545L0.157779 5.58293C-0.149709 5.29333 0.0182067 4.77654 0.437193 4.72298L4.43394 4.21213C4.60321 4.19049 4.74976 4.08402 4.82264 3.92971L6.54356 0.286448Z"
      fill="var(--color-text)"
    />
  </svg>
);

const EllipsesIcon = () => (
  <svg width="49" height="6" viewBox="0 0 49 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="3" cy="3" r="3" fill="white" />
    <circle cx="14" cy="3" r="3" fill="#DDDDDD" />
    <circle cx="25" cy="3" r="3" fill="#DDDDDD" />
    <circle cx="36" cy="3" r="3" fill="#DDDDDD" />
    <circle cx="47" cy="3" r="2" fill="#DDDDDD" />
  </svg>
);

const DotSeparator = () => (
  <svg width="2" height="2" viewBox="0 0 2 2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="1" cy="1" r="1" fill="var(--color-text)" />
  </svg>
);

const MapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
      fill="var(--color-text)"
    />
  </svg>
);

const SuperhostBadge = () => (
  <svg width="67" height="14" viewBox="0 0 67 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="11" fontFamily="SF Pro, system-ui, sans-serif" fontSize="12" fontWeight="590" fill="var(--color-text)">
      pay
    </text>
  </svg>
);

/* ── Card Component ── */

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    cardType = "default",
    title = "",
    subtitle,
    dates,
    price,
    originalPrice,
    rating,
    reviews,
    isFavorite = false,
    onFavoriteClick,
    onReserveClick,
    guests,
    breakdownItems,
    totalLabel,
    total,
    className,
    ...rest
  },
  ref,
) {
  const classes = ["ds-card", `ds-card--${cardType}`, className].filter(Boolean).join(" ");

  const renderHeart = () => (
    <button
      type="button"
      className="ds-card__heart"
      onClick={onFavoriteClick}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
    >
      <HeartIcon filled={isFavorite} />
    </button>
  );

  const renderEllipses = () => (
    <div className="ds-card__ellipses">
      <EllipsesIcon />
    </div>
  );

  const renderRating = () =>
    rating !== undefined && (
      <div className="ds-card__rating">
        <StarIcon />
        <span>{rating.toFixed(2)}</span>
      </div>
    );

  const renderDefaultContent = () => (
    <>
      <div className="ds-card__image" />
      {renderHeart()}
      {renderEllipses()}
      <div className="ds-card__content">
        <div className="ds-card__info">
          {title && <p className="ds-card__title">{title}</p>}
          {subtitle && <p className="ds-card__subtitle">{subtitle}</p>}
          {dates && <p className="ds-card__dates">{dates}</p>}
          {price && (
            <p className="ds-card__price">
              <span className="ds-card__price-strong">${price}</span> night
            </p>
          )}
        </div>
        {renderRating()}
      </div>
    </>
  );

  const renderSleepContent = () => (
    <>
      <div className="ds-card__image" />
      {renderHeart()}
      <div className="ds-card__content">
        <p className="ds-card__bedroom-title">{title}</p>
        {subtitle && <p className="ds-card__bed-info">{subtitle}</p>}
      </div>
    </>
  );

  const renderReservationContent = () => (
    <>
      <div className="ds-card__price-header">
        {originalPrice && <span className="ds-card__price-old">${originalPrice}</span>}
        {price && <span className="ds-card__price-new">${price}</span>}
        <span className="ds-card__price-unit">night</span>
        <div className="ds-card__rating-row">
          {renderRating()}
          {rating !== undefined && <span className="ds-card__dot" />}
          {reviews !== undefined && <span className="ds-card__reviews">{reviews} reviews</span>}
        </div>
      </div>
      <div className="ds-card__date-fields">
        <div className="ds-card__date-field">
          <p className="ds-card__date-label">CHECK-IN</p>
          <p className="ds-card__date-value">{dates?.split(" - ")[0] || ""}</p>
        </div>
        <div className="ds-card__date-field">
          <p className="ds-card__date-label">CHECKOUT</p>
          <p className="ds-card__date-value">{dates?.split(" - ")[1] || ""}</p>
        </div>
      </div>
      <div className="ds-card__guests-field">
        <p className="ds-card__date-label">GUESTS</p>
        <p className="ds-card__date-value">{guests || "1 guest"}</p>
      </div>
      <Button variant="primary" fullWidth className="ds-card__reserve-btn" onClick={onReserveClick}>
        Reserve
      </Button>
      <p className="ds-card__notice">You won't be charged yet</p>
      <div className="ds-card__breakdown">
        {breakdownItems?.map((item, index) => (
          <div key={index} className="ds-card__breakdown-row">
            <span className="ds-card__breakdown-label">{item.label}</span>
            <span className={item.isSuccess ? "ds-card__breakdown-value--success" : "ds-card__breakdown-value"}>
              {item.value}
            </span>
          </div>
        ))}
        {total && (
          <div className="ds-card__breakdown-row ds-card__breakdown-total">
            <span>{totalLabel || "Total before taxes"}</span>
            <span>${total}</span>
          </div>
        )}
      </div>
    </>
  );

  const renderConfirmationContent = () => (
    <>
      {renderHeart()}
      <div className="ds-card__header">
        <div className="ds-card__header-image" />
        <div className="ds-card__header-info">
          {subtitle && <p className="ds-card__header-type">{subtitle}</p>}
          {title && <p className="ds-card__header-title">{title}</p>}
          <div className="ds-card__header-meta">
            {renderRating()}
            <DotSeparator />
            {reviews !== undefined && <span className="ds-card__reviews">({reviews} reviews)</span>}
          </div>
        </div>
      </div>
      <div className="ds-card__protection">
        Your booking is protected by <SuperhostBadge />
      </div>
      <p className="ds-card__price-details-title">Price details</p>
      <div className="ds-card__breakdown">
        {title && (
          <div className="ds-card__breakdown-row">
            <span className="ds-card__breakdown-label">{title}</span>
            <span className="ds-card__breakdown-value">${price}</span>
          </div>
        )}
        <div className="ds-card__breakdown-row ds-card__breakdown-total">
          <span>Total (USD)</span>
          <span>${price}</span>
        </div>
      </div>
    </>
  );

  const renderDiscountContent = () => (
    <>
      <div className="ds-card__image" />
      <div className="ds-card__badge">Superhost</div>
      {renderHeart()}
      {renderEllipses()}
      <div className="ds-card__content">
        <div className="ds-card__info">
          {title && <p className="ds-card__title">{title}</p>}
          {subtitle && <p className="ds-card__subtitle">{subtitle}</p>}
          {dates && <p className="ds-card__dates">{dates}</p>}
          <div className="ds-card__price-row">
            {originalPrice && <span className="ds-card__price-original">${originalPrice}</span>}
            {price && (
              <p className="ds-card__price">
                <span className="ds-card__price-strong">${price}</span> night
              </p>
            )}
          </div>
        </div>
        <div className="ds-card__rating">
          {renderRating()}
          {reviews !== undefined && <span>({reviews})</span>}
        </div>
      </div>
    </>
  );

  const renderMapContent = () => (
    <>
      <div className="ds-card__image" />
      <div className="ds-card__map-icon">
        <MapIcon />
      </div>
      {renderHeart()}
      {renderEllipses()}
      <div className="ds-card__bottom">
        <div className="ds-card__bottom-info">
          {title && <p className="ds-card__title">{title}</p>}
          <div className="ds-card__price-dates">
            {price && (
              <span>
                <span className="ds-card__price-strong">${price}</span> night
              </span>
            )}
            <DotSeparator />
            {dates && <span className="ds-card__date-text">{dates}</span>}
          </div>
        </div>
        {renderRating()}
      </div>
    </>
  );

  const renderContent = () => {
    switch (cardType) {
      case "sleep":
        return renderSleepContent();
      case "reservation":
        return renderReservationContent();
      case "confirmation":
        return renderConfirmationContent();
      case "discount":
        return renderDiscountContent();
      case "map":
        return renderMapContent();
      default:
        return renderDefaultContent();
    }
  };

  return (
    <div ref={ref} className={classes} data-testid="ds-card" {...rest}>
      {renderContent()}
    </div>
  );
});

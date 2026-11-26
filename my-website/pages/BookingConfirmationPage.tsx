import { Link } from "@/components/Link";
import { Text } from "@/components/Text";
import { imageUrl } from "@/assets/images";
import "./BookingConfirmationPage.css";

export default function BookingConfirmationPage() {
  return (
    <main className="page-Booking">
      <header className="page-Booking__header" data-section="header">
        <Link href="/" variant="default" size="md" className="page-Booking__logo">
          <img src={imageUrl("airbnb-logo")} alt="Airbnb" className="page-Booking__logo-img" />
        </Link>
        <div className="page-Booking__nav-actions">
          <Link href="/host" variant="default" size="md">Become a Host</Link>
          <button type="button" className="page-Booking__icon-btn" aria-label="Choose a language">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button type="button" className="page-Booking__user-menu-btn" aria-label="User menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <div className="page-Booking__avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </button>
        </div>
      </header>

      <section className="page-Booking__title-row" data-section="title-row">
        <button type="button" className="page-Booking__back-btn" aria-label="Go back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <Text as="h1" variant="title">Confirm and pay</Text>
      </section>

      <div className="page-Booking__content">
        <div className="page-Booking__left-column">
          <section className="page-Booking__step-1" data-section="step-1">
            <h2>1. Choose when to pay</h2>
            <div className="page-Booking__payment-options">
              <label className="page-Booking__payment-option">
                <div className="page-Booking__option-content">
                  <p className="page-Booking__option-title">Pay £340.91 now</p>
                </div>
                <div className="page-Booking__radio">
                  <input type="radio" name="payment" value="full" />
                  <span className="page-Booking__radio-circle"></span>
                </div>
              </label>
              <div className="page-Booking__divider"></div>
              <label className="page-Booking__payment-option">
                <div className="page-Booking__option-content">
                  <p className="page-Booking__option-title">Pay £0 now</p>
                  <p className="page-Booking__option-details">
                    £340.91 charged on 13 Jan 2027. No extra fees.
                    <button type="button" className="page-Booking__more-info">More info</button>
                  </p>
                </div>
                <div className="page-Booking__radio">
                  <input type="radio" name="payment" value="later" />
                  <span className="page-Booking__radio-circle"></span>
                </div>
              </label>
              <div className="page-Booking__divider"></div>
              <label className="page-Booking__payment-option">
                <div className="page-Booking__option-content">
                  <p className="page-Booking__option-title">Pay in 3 payments with Klarna</p>
                  <p className="page-Booking__option-details">
                    3 payments of £113.63 each (0% APR). 18+, T&C apply.
                    <button type="button" className="page-Booking__more-info">More info</button>
                  </p>
                </div>
                <div className="page-Booking__radio">
                  <input type="radio" name="payment" value="klarna" />
                  <span className="page-Booking__radio-circle"></span>
                </div>
              </label>
            </div>
            <div className="page-Booking__next-container">
              <button type="button" className="page-Booking__next-btn">Next</button>
            </div>
          </section>

          <section className="page-Booking__step-2" data-section="step-2">
            <h2>2. Add a payment method</h2>
          </section>

          <section className="page-Booking__step-3" data-section="step-3">
            <h2>3. Review your reservation</h2>
          </section>
        </div>

        <aside className="page-Booking__right-column">
          <div className="page-Booking__summary-card" data-section="summary-card">
            <div className="page-Booking__stay-header">
              <div className="page-Booking__stay-image-placeholder"></div>
              <div className="page-Booking__stay-info">
                <p className="page-Booking__stay-name">STAY 2572</p>
                <div className="page-Booking__stay-rating-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#222">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>4.98 (487)</span>
                </div>
                <div className="page-Booking__guest-favourite-row">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF385C">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Guest favourite</span>
                </div>
              </div>
            </div>

            <div className="page-Booking__cancellation">
              <p className="page-Booking__cancellation-title">Free cancellation</p>
              <p className="page-Booking__cancellation-details">
                Cancel before 21 January for a full refund.
                <button type="button" className="page-Booking__full-policy">Full policy</button>
              </p>
            </div>

            <div className="page-Booking__detail-row">
              <div>
                <p className="page-Booking__detail-label">Dates</p>
                <p className="page-Booking__detail-value">22–24 Jan 2027</p>
              </div>
              <button type="button" className="page-Booking__change-btn">Change</button>
            </div>

            <div className="page-Booking__detail-row">
              <div>
                <p className="page-Booking__detail-label">Guests</p>
                <p className="page-Booking__detail-value">1 adult</p>
              </div>
              <button type="button" className="page-Booking__change-btn">Change</button>
            </div>

            <div className="page-Booking__price-details">
              <p className="page-Booking__price-details-title">Price details</p>
              <div className="page-Booking__price-row">
                <span>2 nights x £170.46</span>
                <span>£340.91</span>
              </div>
              <div className="page-Booking__price-row page-Booking__total-row">
                <span>
                  Total
                  <button type="button" className="page-Booking__currency-btn">GBP</button>
                </span>
                <span>£340.91</span>
              </div>
              <button type="button" className="page-Booking__breakdown-link">Price breakdown</button>
            </div>
          </div>

          <div className="page-Booking__notice-box" data-section="notice-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <p>Rare find! This place is usually booked</p>
          </div>
        </aside>
      </div>

      <section className="page-Booking__inspiration" data-section="inspiration">
        <Text as="h2" variant="title">Inspiration for future getaways</Text>
      </section>

      <footer className="page-Booking__footer" data-section="footer">
        <div className="page-Booking__footer-columns">
          <div className="page-Booking__footer-column">
            <h3>Support</h3>
            <ul>
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/safety">Get help with a safety issue</Link></li>
              <li><Link href="/aircover">AirCover</Link></li>
              <li><Link href="/insurance">Travel insurance</Link></li>
              <li><Link href="/anti-discrimination">Anti-discrimination</Link></li>
              <li><Link href="/disability">Disability support</Link></li>
              <li><Link href="/cancellation">Cancellation options</Link></li>
              <li><Link href="/report">Report neighborhood concern</Link></li>
            </ul>
          </div>
          <div className="page-Booking__footer-column">
            <h3>Hosting</h3>
            <ul>
              <li><Link href="/host-home">Airbnb your home</Link></li>
              <li><Link href="/host-hotel">Airbnb your hotel</Link></li>
              <li><Link href="/host-experience">Airbnb your experience</Link></li>
              <li><Link href="/host-service">Airbnb your service</Link></li>
              <li><Link href="/host-aircover">AirCover for Hosts</Link></li>
              <li><Link href="/earnings">Earnings Protection</Link></li>
              <li><Link href="/resources">Hosting resources</Link></li>
              <li><Link href="/community">Community Center</Link></li>
              <li><Link href="/responsible">Hosting responsibly</Link></li>
              <li><Link href="/friendly">Airbnb-friendly apartments</Link></li>
              <li><Link href="/class">Join a free hosting class</Link></li>
              <li><Link href="/cohost">Find a co‑host</Link></li>
              <li><Link href="/refer">Refer a host</Link></li>
            </ul>
          </div>
          <div className="page-Booking__footer-column">
            <h3>Airbnb</h3>
            <ul>
              <li><Link href="/release">2026 Summer Release</Link></li>
              <li><Link href="/newsroom">Newsroom</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/investors">Investors</Link></li>
              <li><Link href="/giftcards">Gift cards</Link></li>
              <li><Link href="/emergency">Airbnb.org emergency stays</Link></li>
            </ul>
          </div>
        </div>
        <div className="page-Booking__footer-bottom">
          <div className="page-Booking__footer-left">
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <Link href="/privacy">Privacy</Link>
            <span>·</span>
            <Link href="/terms">Terms</Link>
            <span>·</span>
            <Link href="/choices">Your Privacy Choices</Link>
          </div>
          <div className="page-Booking__footer-right">
            <button type="button" className="page-Booking__footer-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              English (US)
            </button>
            <button type="button" className="page-Booking__footer-btn">
              ₩ KRW
            </button>
            <div className="page-Booking__social-icons">
              <Link href="/facebook" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </Link>
              <Link href="/twitter" aria-label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                </svg>
              </Link>
              <Link href="/instagram" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

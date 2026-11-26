import { Link } from "@/components/Link";
import { Text } from "@/components/Text";
import { imageUrl } from "@/assets/images";
import "./ListingDetailPage.css";

export default function ListingDetailPage() {
  return (
    <main className="page-ListingDetail">
      <header className="page-ListingDetail__header" data-section="header">
        <Link href="/" variant="default" size="md" className="page-ListingDetail__logo">
          <img src={imageUrl("airbnb-logo")} alt="Airbnb" className="page-ListingDetail__logo-img" />
        </Link>
        <div className="page-ListingDetail__search-pill">
          <span>Anywhere</span>
          <span>Any week</span>
          <span>Add guests</span>
        </div>
        <div className="page-ListingDetail__nav-actions">
          <Link href="/host" variant="default" size="md">Become a Host</Link>
          <button type="button" className="page-ListingDetail__icon-btn" aria-label="Choose a language">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </button>
          <button type="button" className="page-ListingDetail__user-menu-btn" aria-label="User menu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
            <div className="page-ListingDetail__avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            </div>
          </button>
        </div>
      </header>

      <section className="page-ListingDetail__title-row" data-section="title-row">
        <Text as="h1" variant="title">
          Kalani's guesthouse TAHAA
        </Text>
        <div className="page-ListingDetail__title-actions">
          <button type="button" className="page-ListingDetail__action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
            </svg>
            공유하기
          </button>
          <button type="button" className="page-ListingDetail__action-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            저장
          </button>
        </div>
      </section>

      <section className="page-ListingDetail__photos" data-section="photos">
        <div className="page-ListingDetail__photo-grid">
          <div className="page-ListingDetail__photo-main page-ListingDetail__photo-placeholder-1"></div>
          <div className="page-ListingDetail__photo-small page-ListingDetail__photo-placeholder-2"></div>
          <div className="page-ListingDetail__photo-small page-ListingDetail__photo-placeholder-3"></div>
          <div className="page-ListingDetail__photo-small page-ListingDetail__photo-placeholder-4"></div>
          <div className="page-ListingDetail__photo-small page-ListingDetail__photo-placeholder-5">
            <button type="button" className="page-ListingDetail__view-all-photos">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              사진 모두 보기
            </button>
          </div>
        </div>
      </section>

      <div className="page-ListingDetail__content">
        <div className="page-ListingDetail__left-column">
          <section className="page-ListingDetail__summary" data-section="summary">
            <Text as="h2" variant="title">Entire home in Gangneung-si, South Korea</Text>
            <p className="page-ListingDetail__summary-details">4 guests · 2 bedrooms · 2 beds · 2 bathrooms</p>
          </section>

          <section className="page-ListingDetail__guest-favourite" data-section="guest-favourite">
            <div className="page-ListingDetail__favourite-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#FF385C" />
              </svg>
              <span>Guest favourite</span>
            </div>
            <p>One of the most loved homes on Airbnb, according to guests</p>
            <div className="page-ListingDetail__rating-row">
              <span className="page-ListingDetail__rating-value">4.98</span>
              <div className="page-ListingDetail__stars">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#222">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="page-ListingDetail__reviews-count">487 Reviews</span>
            </div>
          </section>

          <section className="page-ListingDetail__highlights" data-section="highlights">
            <div className="page-ListingDetail__highlight-row">
              <div className="page-ListingDetail__highlight-icon">
                <img src={imageUrl("details-top")} alt="Top 10%" />
              </div>
              <div>
                <p className="page-ListingDetail__highlight-title">Top 10% of homes</p>
                <p className="page-ListingDetail__highlight-text">This home is highly ranked based on ratings, reviews and reliability.</p>
              </div>
            </div>
            <div className="page-ListingDetail__highlight-row">
              <div className="page-ListingDetail__highlight-icon">
                <img src={imageUrl("details-near")} alt="Near beach" />
              </div>
              <div>
                <p className="page-ListingDetail__highlight-title">Near Anmok Beach</p>
                <p className="page-ListingDetail__highlight-text">Anmok Beach is about an 8-min walk away, with the coast close by for a seaside outing.</p>
              </div>
            </div>
            <div className="page-ListingDetail__highlight-row">
              <div className="page-ListingDetail__highlight-icon">
                <img src={imageUrl("details-kitchen")} alt="Kitchen" />
              </div>
              <div>
                <p className="page-ListingDetail__highlight-title">Roomy home with a full kitchen</p>
                <p className="page-ListingDetail__highlight-text">A roomy private home with a full kitchen gives your group space to cook and settle in.</p>
              </div>
            </div>
            <div className="page-ListingDetail__highlight-row">
              <div className="page-ListingDetail__highlight-icon">
                <img src={imageUrl("details-host")} alt="Host" />
              </div>
              <div>
                <p className="page-ListingDetail__highlight-title">Hosted by Kalani</p>
                <p className="page-ListingDetail__highlight-text">Superhost · 6 years hosting</p>
              </div>
            </div>
            <button type="button" className="page-ListingDetail__learn-more">
              Learn more about summaries
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          </section>

          <div className="page-ListingDetail__divider"></div>

          <section className="page-ListingDetail__translation" data-section="translation">
            <p>Some info has been automatically translated.</p>
            <button type="button" className="page-ListingDetail__show-original">Show original</button>
          </section>

          <section className="page-ListingDetail__about" data-section="about-this-place">
            <Text as="h2" variant="title">About this place</Text>
            <p>This is' stay 2572 ', located on the way to Anmok Coffee Street.</p>
            <p>We will try to provide a complete 'rest' for our guests.</p>
            <p>Stay 2572 provides a 40-pyeong space used by the host as a private house.</p>
            <p>(This is for 4 people)</p>
            <button type="button" className="page-ListingDetail__show-more">Show more</button>
          </section>

          <div className="page-ListingDetail__divider"></div>

          <section className="page-ListingDetail__sleep" data-section="where-youll-sleep">
            <Text as="h2" variant="title">Where you'll sleep</Text>
            <div className="page-ListingDetail__bedroom-grid">
              <div className="page-ListingDetail__bedroom-card">
                <div className="page-ListingDetail__bedroom-image page-ListingDetail__bedroom-placeholder-1"></div>
                <p className="page-ListingDetail__bedroom-name">Bedroom 1</p>
                <p className="page-ListingDetail__bedroom-bed">1 queen bed</p>
              </div>
              <div className="page-ListingDetail__bedroom-card">
                <div className="page-ListingDetail__bedroom-image page-ListingDetail__bedroom-placeholder-2"></div>
                <p className="page-ListingDetail__bedroom-name">Bedroom 2</p>
                <p className="page-ListingDetail__bedroom-bed">1 queen bed</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="page-ListingDetail__reservation-card" data-section="reservation-card">
          <div className="page-ListingDetail__price-row">
            <span className="page-ListingDetail__original-price">$500</span>
            <span className="page-ListingDetail__price">$440</span>
            <span>night</span>
          </div>
          <div className="page-ListingDetail__rating-reviews">
            <span>4.99</span>
            <span>337 reviews</span>
          </div>
          <div className="page-ListingDetail__booking-fields">
            <div className="page-ListingDetail__field">
              <span className="page-ListingDetail__field-label">CHECK-IN</span>
              <span>2/6/2023</span>
            </div>
            <div className="page-ListingDetail__field">
              <span className="page-ListingDetail__field-label">CHECKOUT</span>
              <span>2/11/2023</span>
            </div>
            <div className="page-ListingDetail__field page-ListingDetail__field--full">
              <span className="page-ListingDetail__field-label">GUESTS</span>
              <span>1 guest</span>
            </div>
          </div>
          <button type="button" className="page-ListingDetail__reserve-btn">Reserve</button>
          <p className="page-ListingDetail__no-charge">You won't be charged yet</p>
          <div className="page-ListingDetail__price-breakdown">
            <div className="page-ListingDetail__breakdown-row">
              <span>$500 x 5 nights</span>
              <span>$2,500</span>
            </div>
            <div className="page-ListingDetail__breakdown-row">
              <span>Long stay discount</span>
              <span>-$300</span>
            </div>
            <div className="page-ListingDetail__breakdown-row">
              <span>Cleaning fee</span>
              <span>$200</span>
            </div>
            <div className="page-ListingDetail__breakdown-row">
              <span>Service fee</span>
              <span>$0</span>
            </div>
            <div className="page-ListingDetail__breakdown-row page-ListingDetail__breakdown-total">
              <span>Total before taxes</span>
              <span>$2,400</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="page-ListingDetail__report-link">
        <button type="button" className="page-ListingDetail__report-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
          리스팅 신고하기
        </button>
      </div>

      <section className="page-ListingDetail__inspiration" data-section="inspiration">
        <Text as="h2" variant="title">Inspiration for future getaways</Text>
      </section>

      <footer className="page-ListingDetail__footer" data-section="footer">
        <div className="page-ListingDetail__footer-columns">
          <div className="page-ListingDetail__footer-column">
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
          <div className="page-ListingDetail__footer-column">
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
          <div className="page-ListingDetail__footer-column">
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
        <div className="page-ListingDetail__footer-bottom">
          <div className="page-ListingDetail__footer-left">
            <span>© 2026 Airbnb, Inc.</span>
            <span>·</span>
            <Link href="/privacy">Privacy</Link>
            <span>·</span>
            <Link href="/terms">Terms</Link>
            <span>·</span>
            <Link href="/choices">Your Privacy Choices</Link>
          </div>
          <div className="page-ListingDetail__footer-right">
            <button type="button" className="page-ListingDetail__footer-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              English (US)
            </button>
            <button type="button" className="page-ListingDetail__footer-btn">
              ₩ KRW
            </button>
            <div className="page-ListingDetail__social-icons">
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

// ds-page-plan: docs/plans/pages/AirbnbHome.md 6ac5a53d10f6f7be2521c2c9537aed42f5775558ff87c50554e731d38ceda495
import { Link } from "@/components/Link";
import { Navigation } from "@/components/Navigation";
import { Tabs } from "@/components/Tabs";
import { Text } from "@/components/Text";
import "./HomePage.css";

export default function HomePage() {
  const GlobeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.5" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );

  const MenuIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const ProfileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="5" r="3" fill="currentColor" />
      <path d="M2 14c0-3 2.5-5 6-5s6 2 6 5" fill="currentColor" />
    </svg>
  );

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

  const propertyCards = Array(11).fill({
    title: "Groveland, California",
    subtitle: "Yosemite National Park",
    dates: "Oct 13 - 20",
    price: "128",
    rating: 4.91,
  });

  const serviceTabs = [
    { label: "All", icon: "🌍" },
    { label: "Homes", icon: "🏠" },
    { label: "Hotels", icon: "🛎️" },
    { label: "Experiences", icon: "🎈" },
    { label: "Services", icon: "🔔" },
  ];

  return (
    <main className="page-Home">
      <header className="page-Home__top-nav" data-section="top-nav">
        <Link key="logo" href={"/"} variant={"default"} size={"md"} className="page-Home__logo">
          <span className="page-Home__logo-text">airbnb</span>
        </Link>
        <div className="page-Home__nav-actions">
          <Link key="become-host" href={"/host"} variant={"default"} size={"md"} className="page-Home__host-link">
            {"Become a Host"}
          </Link>
          <button key="globe-btn" type="button" className="page-Home__globe-btn" aria-label="Choose a language">
            <GlobeIcon />
          </button>
          <button key="user-menu-btn" type="button" className="page-Home__user-menu-btn" aria-label="User menu">
            <MenuIcon />
            <div className="page-Home__profile-avatar">
              <ProfileIcon />
              <span className="page-Home__notification-dot" aria-label="Notification" />
            </div>
          </button>
        </div>
      </header>

      <section className="page-Home__hero" data-section="hero">
        <Text key="hero-heading" as={"h1"} variant={"title"}>
          {"Start Your Trip with Airbnb"}
        </Text>
        <div key="service-tabs" className="page-Home__service-tabs">
          {serviceTabs.map((tab, index) => (
            <button
              key={index}
              type="button"
              className={`page-Home__service-tab ${index === 0 ? "page-Home__service-tab--selected" : ""}`}
            >
              <span className="page-Home__service-tab-icon">{tab.icon}</span>
              <span className="page-Home__service-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <Navigation
          key="search-bar"
          sections={[
            { id: "where", label: "Where", placeholder: "Search destinations" },
            { id: "checkin", label: "Check-in", placeholder: "Add dates" },
            { id: "checkout", label: "Check-out", placeholder: "Add dates" },
            { id: "who", label: "Who", placeholder: "Add guests" },
          ]}
        ></Navigation>
      </section>

      <section className="page-Home__reservations" data-section="reservations">
        <div className="page-Home__reservation-card">
          <div className="page-Home__reservation-image" />
          <div className="page-Home__reservation-info">
            <p className="page-Home__reservation-title">Your reservation</p>
            <p className="page-Home__reservation-status page-Home__reservation-status--checkin">CHECK-IN</p>
            <p className="page-Home__reservation-name">San Francisco, tiny home</p>
            <p className="page-Home__reservation-dates">Oct 13 - 20</p>
            <p className="page-Home__reservation-code">Reservation code: UNIMPORTANTID</p>
          </div>
        </div>
        <div className="page-Home__reservation-card">
          <div className="page-Home__reservation-image" />
          <div className="page-Home__reservation-info">
            <p className="page-Home__reservation-title">Your reservation</p>
            <p className="page-Home__reservation-status page-Home__reservation-status--checkout">CHECK-OUT</p>
            <p className="page-Home__reservation-name">tiny house, tiny farm</p>
            <p className="page-Home__reservation-dates">Oct 13 - 20</p>
            <p className="page-Home__reservation-code">Reservation code: UNIMPORTANTID</p>
          </div>
        </div>
        <div className="page-Home__reservation-card page-Home__reservation-card--cancelled">
          <div className="page-Home__reservation-image" />
          <div className="page-Home__reservation-info">
            <p className="page-Home__reservation-title">Your reservation</p>
            <p className="page-Home__reservation-status page-Home__reservation-status--cancelled">CANCELLED</p>
            <p className="page-Home__reservation-name">tiny house, city farm</p>
            <p className="page-Home__reservation-dates">Oct 13 - 20</p>
            <p className="page-Home__reservation-code">Reservation code: UNIMPORTANTID</p>
          </div>
        </div>
      </section>

      <section className="page-Home__stay-in-seoul" data-section="stay-in-seoul">
        <Text key="seoul-heading" as={"h2"} variant={"title"}>
          {"Stay in Seoul"}
        </Text>
        <Tabs
          key="filter-chips"
          variant={"contained"}
          size={"sm"}
          items={[
            { id: "monthly", label: "Monthly", content: null },
            { id: "entire", label: "Entire", content: null },
            { id: "guesthouse", label: "Guesthouse", content: null },
            { id: "resort", label: "Resort", content: null },
          ]}
          defaultTab={"monthly"}
        ></Tabs>
        <div className="page-Home__property-grid">
          {propertyCards.map((card, index) => (
            <div key={index} className="page-Home__property-card">
              <div className="page-Home__property-image">
                <button type="button" className="page-Home__property-heart" aria-label="Add to favorites">
                  <HeartIcon />
                </button>
              </div>
              <div className="page-Home__property-info">
                <div className="page-Home__property-details">
                  <p className="page-Home__property-title">{card.title}</p>
                  <p className="page-Home__property-subtitle">{card.subtitle}</p>
                  <p className="page-Home__property-dates">{card.dates}</p>
                  <p className="page-Home__property-price">
                    <span className="page-Home__property-price-strong">${card.price}</span> night
                  </p>
                </div>
                <div className="page-Home__property-rating">
                  <StarIcon />
                  <span>{card.rating.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-Home__inspiration" data-section="inspiration">
        <Text key="inspiration-heading" as={"h2"} variant={"title"}>
          {"Inspiration for future getaways"}
        </Text>
        <Tabs
          key="inspiration-tabs"
          variant={"line"}
          size={"md"}
          items={[
            { id: "popular", label: "Popular", content: null },
            { id: "arts-culture", label: "Arts & culture", content: null },
            { id: "beach", label: "Beach", content: null },
            { id: "mountains", label: "Mountains", content: null },
            { id: "outdoors", label: "Outdoors", content: null },
            { id: "things-to-do", label: "Things to do", content: null },
            { id: "travel-tips", label: "Travel tips & inspiration", content: null },
            { id: "airbnb-friendly", label: "Airbnb-friendly apartments", content: null },
          ]}
          defaultTab={"popular"}
        ></Tabs>
        <Text key="destination-links" as={"span"} variant={"body"}>
          {"Washington"}
        </Text>
      </section>

      <div className="page-Home__footer" data-section="footer">
        <Text key="footer-support-heading" as={"h3"} variant={"body-sm"}>
          {"Support"}
        </Text>
        <Text key="footer-help-center" as={"span"} variant={"body-sm"}>
          {"Help Center"}
        </Text>
        <Text key="footer-hosting-heading" as={"h3"} variant={"body-sm"}>
          {"Hosting"}
        </Text>
        <Text key="footer-airbnb-heading" as={"h3"} variant={"body-sm"}>
          {"Airbnb"}
        </Text>
      </div>
    </main>
  );
}

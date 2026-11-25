# Plan

## Design system (Storybook)

### Brand

- Figma file: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=389-2752
- Mood words: Not specified yet

### Token intent

- Main action: Comes from Figma
- Text: Comes from Figma
- Notes from the documents: Colors and fonts come from Figma file

### Parts

| Part | Used for | Stories / FR |
|---|---|---|
| ServiceTab | Hero service tabs (All, Homes, Hotels, Experience, Services) | Story 1 |
| Search | Hero search bar | Story 1, FR-001 |
| TextInput | "Where" field in search bar | Story 1, FR-001 |
| Button | Search button in hero, "Next" button on booking page | Story 1, Story 6 |
| Card | Stay cards and reservation cards | Story 2, Story 3 |
| Tabs | Inspiration tabs | Story 4 |
| Tag | Filter chips (Hotels, Motel, Guesthouse, Resort) | Story 3 |
| Link | Footer links, "Become a Host" link | FR-001 |
| Icon | Globe, menu, heart, share, social icons | Story 3, Story 4, Story 5 |
| RadioButton | Payment choices on booking page | Story 6, FR-011 |

## Website

### Pages

| Page | Route | Title | What it's for | Stories / FR |
|---|---|---|---|---|
| Home | / | Home | Showing a search bar, my reservations and stays in Seoul | Story 1, 2, 3, 4 |
| Listing Detail | /listing | Listing Detail | Showing one stay with its photos, details, bedrooms and price | Story 5, FR-007, FR-008, FR-009 |
| Booking Confirmation | /booking | Booking Confirmation | Showing the steps to confirm and pay, next to a summary of the stay and its price | Story 6, FR-010, FR-011, FR-012, FR-013, FR-014 |

### Sections and copy

#### Home (/)

| Section | Parts | Copy (exact words) |
|---|---|---|
| Header | Link, Icon | "Become a Host" |
| Hero | ServiceTab, Search, TextInput, Button | "Start Your Trip with Airbnb", "Where", "Search destinations", "Check-in", "Add dates", "Check-out", "Add dates", "Who", "Add guests" |
| Your reservations | Card | "Your reservation", "CANCELED", "Reservation code:" |
| Stay in Seoul | Tag, Card, Icon | "Stay in Seoul", "Hotels", "Motel", "Guesthouse", "Resort" |
| Inspiration | Tabs, Link | "Inspiration for future getaways", "Popular", "Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do", "Travel tips & inspiration", "Airbnb-friendly apartments", "Show more" |
| Footer | Link, Icon | "Support", "Hosting", "Airbnb", "© 2026 Airbnb, Inc.", "Privacy", "Terms", "Your Privacy Choices", "English (US)", "₩ KRW" |

#### Listing Detail (/listing)

| Section | Parts | Copy (exact words) |
|---|---|---|
| Header | Link, Icon, Search | "Anywhere", "Any week", "Add guests", "Become a Host" |
| Title row | Button, Icon | "서면/전포역5분/최대8인/프라이빗독채/계단없음/조용한숙소/사잇길", "공유하기", "저장" |
| Photos | Icon | "사진 모두 보기" |
| Summary | — | "Entire home in Gangneung-si, South Korea", "4 guests · 2 bedrooms · 2 beds · 2 bathrooms" |
| Guest favourite box | — | "Guest favourite", "One of the most loved homes on Airbnb, according to guests", "4.98", "487", "Reviews" |
| Highlights | Icon | "Top 10% of homes", "Near Anmok Beach", "Roomy home with a full kitchen", "Guests praise the cleanliness", "Hosted by (host name)", "Superhost", "6 years hosting", "Learn more about summaries" |
| Translation notice | Link | "Some info has been automatically translated.", "Show original" |
| About this place | Button | "Show more" |
| Where you'll sleep | Card | "Where you'll sleep", "Bedroom 1", "1 queen bed", "Bedroom 2" |
| Reservation card | Button, Link | "$500", "$440", "night", "4.99", "337 reviews", "CHECK-IN", "2/6/2023", "CHECKOUT", "2/11/2023", "GUESTS", "1 guest", "Reserve", "You won't be charged yet", "리스팅 신고하기" |
| Inspiration | Tabs, Link | Same as Home page |
| Footer | Link, Icon | Same as Home page |

#### Booking Confirmation (/booking)

| Section | Parts | Copy (exact words) |
|---|---|---|
| Header | Link, Icon | "Become a Host" |
| Title row | Button | "Confirm and pay" |
| Step 1 box | RadioButton, Button | "1. Choose when to pay", "Pay £340.91 now", "Pay £0 now", "£340.91 charged on 13 Jan 2027. No extra fees.", "More info", "Pay in 3 payments with Klarna", "3 payments of £113.63 each (0% APR). 18+, T&C apply", "Credit subject to status.", "Next" |
| Step 2 box | — | "2. Add a payment method" |
| Step 3 box | — | "3. Review your reservation" |
| Summary card | Link, Button | "STAY 2572", "4.98 (487)", "Guest favourite", "Free cancellation", "Cancel before 21 January for a full refund.", "Full policy", "Dates", "22–24 Jan 2027", "Change", "Guests", "1 adult", "Price details", "Total", "GBP", "Price breakdown" |
| Notice box | Icon | "Rare find! This place is usually booked" |
| Inspiration | Tabs, Link | Same as Home page |
| Footer | Link, Icon | Same as Home page |

### Data and actions

- Search button: filters stay cards by "Where" field input; shows "No stays found." if no match
- Service tabs: clicked tab becomes selected (visual only)
- Filter chips: clicked chip becomes selected (visual only, cards don't change)
- Inspiration tabs: clicked tab becomes selected (visual only, list doesn't change)
- Heart icons: toggle full/empty on click (not persisted after reload)
- Reservation cards row: scrolls sideways
- Listing Detail, "저장" button: heart toggles full/empty on click (not persisted after reload)
- Listing Detail, "Reserve" button: goes to /booking
- Booking Confirmation, payment choice: clicked choice becomes selected (only one at a time, none selected when page opens)
- Booking Confirmation, "Next" button: shows "Thanks! This is a demo. No payment was made."
- Booking Confirmation, back button: goes to /listing

## Design rules (from documents)

- Left and right page margin: 80px in Header, Hero, Your reservations and Stay in Seoul; 48px in Inspiration and Footer
- Space between sections: 80px
- Space between cards: 22px between stay cards in one row, 40px between rows, 23px between reservation cards
- Widest content: 1280px (page frame is 1440px wide)
- Cards in one row: 4 (desktop only, 1440px)
- Hero: 426px tall, 80px above and below content, 32px between title, tabs and search bar
- 80px between service tabs, 20px between chips
- Corners: 12px on cards and pictures; chips and search bar are fully round
- 4th reservation card goes past right edge, so row scrolls

### Listing Detail (/listing)

- Left and right page margin: 80px for Header, Title row and Photos; 160px for sections 4 to 10; 48px in Inspiration and Footer
- Space between sections: 40px between Header and Title row, 80px between Photos and Summary; left column sections split by thin line with 32px or 48px above and below
- Space between cards: 9px between photos, 16px between bedroom cards, 24px between highlight rows
- Widest content: 1280px for Photos, 1120px for sections 4 to 10 (left column 653px, reservation card 373px)
- Cards in one row: 2 bedroom cards; Photos: 1 big picture and 4 small pictures in 2 rows of 2
- Photos block: 567px tall
- Reservation card: 373px wide, 532px tall, 12px corners, soft shadow
- Corners: 12px on boxes and "Show more" button; 8px on bedroom pictures, "Reserve" button and grey notice box
- 250px of empty space between last section and Inspiration
- Desktop only (1440px)

### Booking Confirmation (/booking)

- Left and right page margin: 80px in Header; 215px for Title row and two columns; 48px in Inspiration and Footer
- Space between sections: 24px between title and two columns; 270px between two columns and Inspiration
- Space between cards: 24px between step boxes; 24px between summary card and notice box
- Widest content: 1010px (left column 540px, right column 390px)
- Cards in one row: 2 columns (steps on left, summary on right)
- Corners: 24px on Step 1 box and summary card; 20px on Step 2 and Step 3 boxes; 12px on notice box; 8px on "Next" button, "Change" buttons and stay picture
- Back button: 44px circle, 24px to the left of title
- Step 1 box: soft shadow, no border; other boxes: thin border, no shadow
- Desktop only (1440px)

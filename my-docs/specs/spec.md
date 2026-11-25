# Spec: Airbnb Seoul

## User stories

### Story 1 — Search for stays (Priority: P1)

As a traveler, I want to search for stays by destination so that I can find accommodations in Seoul.

Why P1: Search is the main purpose of the Home page.

Acceptance scenarios:

1. Given I am on the Home page, When I type a place in the "Where" field and click the search button, Then only stay cards matching the typed word are shown.
2. Given I typed a place that matches no stays, When I click the search button, Then "No stays found." is displayed.

### Story 2 — View my reservations (Priority: P1)

As a user with bookings, I want to see my reservations so that I can check their status and codes.

Why P1: Returning users need quick access to their bookings.

Acceptance scenarios:

1. Given I have reservations, When I view the Home page, Then I see my reservation cards with status, stay name, and reservation code.
2. Given there are more than 3 reservation cards, When I view the row, Then I can scroll sideways to see all cards.

### Story 3 — Browse stays in Seoul (Priority: P1)

As a traveler, I want to browse stay cards in Seoul so that I can find a place to stay.

Why P1: Browsing stays is a core function.

Acceptance scenarios:

1. Given I am on the Home page, When I view "Stay in Seoul", Then I see 12 stay cards in 3 rows of 4.
2. Given I see stay cards, When I click a heart icon, Then it toggles between full and empty (not saved after reload).
3. Given I see filter chips, When I click a chip, Then it becomes the selected chip (cards don't change).

### Story 4 — Get inspiration for future trips (Priority: P2)

As a traveler, I want to browse destination inspiration so that I can plan future getaways.

Acceptance scenarios:

1. Given I am on the Home page, When I view "Inspiration", Then I see place links organized by tabs.
2. Given I see inspiration tabs, When I click a tab, Then it becomes the selected tab (list doesn't change).

### Story 5 — View listing details (Priority: P1)

As a traveler, I want to view the details of a stay so that I can decide whether to book it.

Why P1: Viewing listing details is required before booking.

Acceptance scenarios:

1. Given I click a stay card, When the Listing Detail page opens, Then I see the stay title, photos, summary, highlights, description, bedrooms and a reservation card.
2. Given I am on the Listing Detail page, When I click the heart icon, Then it toggles between full and empty (not saved after reload).
3. Given I am on the Listing Detail page, When I click "Reserve", Then I go to the Booking Confirmation page.

### Story 6 — Confirm and pay (Priority: P1)

As a traveler, I want to confirm my booking and choose a payment option so that I can complete my reservation.

Why P1: Booking confirmation is the final step in the reservation flow.

Acceptance scenarios:

1. Given I am on the Booking Confirmation page, When I view the page, Then I see three payment choices, a summary card with stay details and price, and three step boxes.
2. Given I am on the Booking Confirmation page, When I select a payment choice and click "Next", Then I see "Thanks! This is a demo. No payment was made."
3. Given I am on the Booking Confirmation page, When I click the back button, Then I go to the Listing Detail page.

## Edge cases

- Search with no matching results: shows "No stays found."
- Reservation cards overflow: row scrolls sideways
- Booking page: no payment choice is selected when the page opens

## Functional requirements

- FR-001: The site MUST display a search bar with "Where", "Check-in", "Check-out", and "Who" fields
- FR-002: The site MUST filter stay cards based on the "Where" field input
- FR-003: The site MUST display reservation cards with status, stay name, and reservation code
- FR-004: The site MUST allow horizontal scrolling for reservation cards
- FR-005: The site MUST toggle heart icons on stay cards (not persisted)
- FR-006: The site MUST allow selecting service tabs, filter chips, and inspiration tabs (visual only)
- FR-007: The site MUST display listing details: title, photos, summary, highlights, description, bedrooms and reservation card
- FR-008: The site MUST toggle the heart icon on the Listing Detail page (not persisted)
- FR-009: The site MUST navigate from Listing Detail to Booking Confirmation when "Reserve" is clicked
- FR-010: The site MUST display three payment choices on the Booking Confirmation page
- FR-011: The site MUST allow selecting one payment choice at a time (radio selection)
- FR-012: The site MUST display a summary card with stay details, dates, guests and price breakdown
- FR-013: The site MUST show "Thanks! This is a demo. No payment was made." when "Next" is clicked
- FR-014: The site MUST navigate from Booking Confirmation to Listing Detail when the back button is clicked

## Key entities

- Stay card: place, area, dates, price, rating, picture
- Reservation card: title, picture, status, stay name, reservation code
- Inspiration place: place name, rental type
- Listing: title, photos, summary, highlights, description, bedrooms, price, rating, reviews
- Booking: payment choices, summary card, stay details, dates, guests, price breakdown

## Success criteria

- SC-001: Users can search for stays by typing a destination
- SC-002: Users can view their reservations with status and codes
- SC-003: Users can browse 12 stay cards in Seoul
- SC-004: Users can browse 17 inspiration place links
- SC-005: Users can view listing details with photos, highlights, bedrooms and price
- SC-006: Users can select a payment choice and see a demo confirmation message

## Clarifications

### Session 2026-11-25

- Q: What is the name of this website? → A: Airbnb Seoul (chosen in chat)
- Q: What voice and tone should the website use? → Left out for now
- Q: What three mood words describe the look? → Left out for now

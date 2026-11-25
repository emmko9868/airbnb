# My website plan

> **Note for the AI:** Text inside `<!-- -->` is only help and examples for the student. It is not part of this plan. Never use it as a fact. Use only what is written outside it.

<!--
This file follows the "one file per page" way. It covers the Home page only.
The Listing Detail page and the Booking Confirmation page get their own files later.
Every answer in parts 1, 2, 3 and 5 was read from the Figma frame "Home" (1440 x 3367).
Part 4 is not in Figma. Figma shows what a thing looks like, not what it does, so every line in part 4 is a choice to check.
-->

## 1. What pages are you building?

- Home
  - Address: /
  - Tab title: Home
  - For: showing a search bar, my reservations and stays in Seoul

## 2. Do you have a Figma link for each page?

- Home: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=389-2752

## 3. What sections does each page have?

**Home**

1. Header: logo picture on the left. On the right: link "Become a Host", a globe icon button, a menu button with a profile picture
2. Hero: background photo, big title "Start Your Trip with Airbnb", 5 service tabs with icons "All" (selected), "Homes", "Hotels", "Experience", "Services", a search bar with 4 fields "Where" / "Search destinations", "Check-in" / "Add dates", "Check-out" / "Add dates", "Who" / "Add guests", and a round search button
3. Your reservations: 4 reservation cards in one row. Each card: title "Your reservation", a picture, status "CANCELED", stay name, "Reservation code:" and the code
4. Stay in Seoul: title "Stay in Seoul", 4 chips "Hotels" (selected), "Motel", "Guesthouse", "Resort", 12 stay cards in 3 rows of 4 (picture, heart, picture dots, place, area, dates, price, rating)
5. Inspiration: title "Inspiration for future getaways", 8 tabs "Popular" (selected), "Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do", "Travel tips & inspiration", "Airbnb-friendly apartments", 17 place links in 6 columns, button "Show more"
6. Footer: 3 link columns "Support", "Hosting", "Airbnb". Bottom line: "© 2026 Airbnb, Inc.", "Privacy", "Terms", "Your Privacy Choices", "English (US)", "₩ KRW", 3 social icons

**Things the pages show** (stays, menu items, products…)

Stay cards (the Figma shows the same placeholder stay 12 times):

- Groveland, California · Yosemite National Park · Oct 23 - 28 · $289 night · rating 4.91 · picture none

Reservation cards (the Figma shows the same placeholder reservation 4 times):

- tiny house, tiny farm · CANCELED · Reservation code: XMPQKAPZ6D · picture none

Inspiration place links, tab "Popular" (place · small text):

- Washington · Apartment rentals
- West Palm Beach · Cottage rentals
- Savannah · Villa rentals
- Manhattan · Vacation rentals
- Kansas City · Apartment rentals
- Destin · House rentals
- Amsterdam · Cabin rentals
- St. Petersburg · Vacation rentals
- Las Vegas · House rentals
- Cartagena · Villa rentals
- Milan · Condo rentals
- Pocono Mountains · Monthly Rentals
- Sacramento · Apartment rentals
- Jersey City · House rentals
- Broken Bow · Cottage rentals
- Osaka · House rentals
- Sarasota · House rentals

Footer links:

- Support: Help Center, Get help with a safety issue, AirCover, Travel insurance, Anti-discrimination, Disability support, Cancellation options, Report neighborhood concern
- Hosting: Airbnb your home, Airbnb your hotel, Airbnb your experience, Airbnb your service, AirCover for Hosts, Earnings Protection, Hosting resources, Community Center, Hosting responsibly, Airbnb-friendly apartments, Join a free hosting class, Find a co‑host, Refer a host
- Airbnb: 2026 Summer Release, Newsroom, Careers, Investors, Gift cards, Airbnb.org emergency stays

## 4. What does each section do?

**Home**

- Header, logo: goes to /
- Header, "Become a Host" link: nothing, just shows it
- Header, globe button: nothing, just shows it
- Header, menu button: nothing, just shows it
- Hero, service tabs: the clicked tab becomes the selected tab. Nothing else changes.
- Hero, "Where" field: people can type a place
- Hero, "Check-in", "Check-out" and "Who" fields: nothing, just shows them
- Hero, search button: shows only the stay cards whose place has the typed word. If nothing matches, shows "No stays found."
- Your reservations, the row of cards: scrolls sideways
- Your reservations, a reservation card: nothing, just shows it
- Stay in Seoul, chips: the clicked chip becomes the selected chip. The cards don't change.
- Stay in Seoul, a stay card: nothing, just shows it
- Stay in Seoul, heart: turns full or empty when clicked. Not saved after the page reloads.
- Stay in Seoul, picture dots: nothing, just shows them
- Inspiration, tabs: the clicked tab becomes the selected tab. The list doesn't change.
- Inspiration, place links: nothing, just shows them
- Inspiration, "Show more" button: nothing, just shows it
- Footer, links, language button, currency button, social icons: nothing, just shows them

> **Rule for the AI:** If the Figma design shows something people can use (a button, link, icon, input box, tab, toggle…) and this part doesn't say what it does, **don't guess.** Write it as a question (`[NEEDS CLARIFICATION]`) and ask me with choices before building it. "Leave it out for now" is a fine choice.

## 5. Do you have design rules?

- Left and right page margin: 80px in Header, Hero, Your reservations and Stay in Seoul. 48px in Inspiration and Footer.
- Space between sections: 80px
- Space between cards (gap): 22px between stay cards in one row, 40px between rows, 23px between reservation cards
- Widest content: 1280px (the page frame is 1440px wide)
- Cards in one row: 4 on a computer. This page is designed for a computer only (1440px).
- Other rules:
  - Hero is 426px tall, with 80px above and below its content and 32px between the title, the tabs and the search bar
  - 80px between service tabs, 20px between chips
  - Corners: 12px on cards and pictures. Chips and the search bar are fully round.
  - The 4th reservation card goes past the right edge of the page, so the row scrolls

> **Rule for the AI:** For every rule left empty here, use what the Figma design of that page shows: its layout, spacing and sizes, as in the Figma code (CSS). Don't make up values. If a page has no Figma link and the rule is empty, ask me. Colors and fonts always come from my Figma file through the kit's tokens.

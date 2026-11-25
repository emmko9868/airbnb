# My website plan

> **Note for the AI:** Text inside `<!-- -->` is only help and examples for the student. It is not part of this plan. Never use it as a fact. Use only what is written outside it.

<!--
This file follows the "one file per page" way. It covers the Listing Detail page only.
Every answer in parts 1, 2, 3 and 5 was read from the Figma frame "Detail" (1440 x 3601).
Part 4 is not in Figma. Figma shows what a thing looks like, not what it does, so every line in part 4 is a choice to check.
The Figma frame holds a real host name, an Instagram name and a licence number. They are left out here, because this site can become public.
-->

## 1. What pages are you building?

- Listing Detail
  - Address: /listing
  - Tab title: Listing Detail
  - For: showing one stay with its photos, details, bedrooms and price

## 2. Do you have a Figma link for each page?

- Listing Detail: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=812-393

## 3. What sections does each page have?

**Listing Detail**

1. Header: logo picture on the left. In the middle a search pill with "Anywhere", "Any week", "Add guests" and a round search button. On the right: link "Become a Host", a globe icon button, a menu button with a profile picture
2. Title row: stay title "서면/전포역5분/최대8인/프라이빗독채/계단없음/조용한숙소/사잇길". On the right: button "공유하기" with a share icon, button "저장" with a heart icon
3. Photos: 1 big picture on the left and 4 small pictures in 2 rows of 2 on the right, button "사진 모두 보기" on the last picture
4. Summary: title "Entire home in Gangneung-si, South Korea", small text "4 guests · 2 bedrooms · 2 beds · 2 bathrooms"
5. Guest favourite box: "Guest favourite" between two leaf pictures, text "One of the most loved homes on Airbnb, according to guests", rating "4.98" with 5 stars, "487" "Reviews"
6. Highlights: 5 rows, each with a small picture, a title and one line of text, then a small line "Learn more about summaries" with an info icon
7. Translation notice: grey box "Some info has been automatically translated." with the link "Show original"
8. About this place: the first lines of the stay text, then button "Show more"
9. Where you'll sleep: title "Where you'll sleep", 2 bedroom cards (picture, name, bed)
10. Reservation card (on the right, next to sections 4 to 9): old price "$500" crossed out, price "$440" "night", rating "4.99", "337 reviews", boxes "CHECK-IN" "2/6/2023", "CHECKOUT" "2/11/2023", "GUESTS" "1 guest", button "Reserve", small text "You won't be charged yet", 4 price lines, "Total before taxes" "$2,400". Under the card: link "리스팅 신고하기" with a flag icon
11. Inspiration: the same as on the Home page
12. Footer: the same as on the Home page

**Things the pages show** (stays, menu items, products…)

Highlights (title · text · picture):

- Top 10% of homes · This home is highly ranked based on ratings, reviews and reliability. · picture none
- Near Anmok Beach · Anmok Beach is about an 8-min walk away, with the coast close by for a seaside outing. · picture none
- Roomy home with a full kitchen · A roomy private home with a full kitchen gives your group space to cook and settle in. · picture none
- Guests praise the cleanliness · Guests repeatedly praise the spotless rooms and thoughtful upkeep throughout the home. · picture none
- Hosted by (host name) · Superhost · 6 years hosting · picture none

About this place (the lines the Figma shows before "Show more"):

- This is' stay 2572 ', located on the way to Anmok Coffee Street.
- We will try to provide a complete 'rest' for our guests.
- Stay 2572 provides a 40-pyeong space used by the host as a private house.
- (This is for 4 people)

Bedrooms:

- Bedroom 1 · 1 queen bed · picture none
- Bedroom 2 · 1 queen bed · picture none

Price lines in the reservation card:

- 500 x 5 nights · $2,500
- Long stay discount · -$300
- Cleaning fee · $200
- Service fee · $0

Photos:

- 5 photos of the stay · picture none

## 4. What does each section do?

**Listing Detail**

- Header, logo: goes to /
- Header, search pill: nothing, just shows it
- Header, "Become a Host" link, globe button, menu button: nothing, just shows them
- Title row, "공유하기" button: nothing, just shows it
- Title row, "저장" button: the heart turns full or empty when clicked. Not saved after the page reloads.
- Photos, a picture: nothing, just shows it
- Photos, "사진 모두 보기" button: nothing, just shows it
- Guest favourite box: nothing, just shows it
- Highlights, a row: nothing, just shows it
- Highlights, "Learn more about summaries": nothing, just shows it
- Translation notice, "Show original" link: nothing, just shows it
- About this place, "Show more" button: nothing, just shows it
- Where you'll sleep, a bedroom card: nothing, just shows it
- Reservation card, "CHECK-IN", "CHECKOUT" and "GUESTS" boxes: nothing, just shows them
- Reservation card, "Reserve" link: goes to /booking
- Reservation card, price lines: nothing, just shows them
- Reservation card, "리스팅 신고하기" link: nothing, just shows it
- Inspiration and Footer: the same as on the Home page

> **Rule for the AI:** If the Figma design shows something people can use (a button, link, icon, input box, tab, toggle…) and this part doesn't say what it does, **don't guess.** Write it as a question (`[NEEDS CLARIFICATION]`) and ask me with choices before building it. "Leave it out for now" is a fine choice.

## 5. Do you have design rules?

- Left and right page margin: 80px for the Header, the Title row and the Photos. 160px for sections 4 to 10. 48px in Inspiration and Footer.
- Space between sections: 40px between the Header and the Title row, 80px between the Photos and the Summary. In the left column the sections are split by a thin line with 32px or 48px above and below it.
- Space between cards (gap): 9px between photos, 16px between bedroom cards, 24px between highlight rows
- Widest content: 1280px for the Photos, 1120px for sections 4 to 10 (left column 653px, reservation card 373px)
- Cards in one row: 2 bedroom cards. Photos: 1 big picture and 4 small pictures in 2 rows of 2.
- Other rules:
  - The Photos block is 567px tall
  - The reservation card is 373px wide and 532px tall, with 12px corners and a soft shadow
  - Corners: 12px on boxes and the "Show more" button, 8px on bedroom pictures, the "Reserve" button and the grey notice box
  - There are 250px of empty space between the last section and Inspiration
  - This page is designed for a computer only (1440px)

> **Rule for the AI:** For every rule left empty here, use what the Figma design of that page shows: its layout, spacing and sizes, as in the Figma code (CSS). Don't make up values. If a page has no Figma link and the rule is empty, ask me. Colors and fonts always come from my Figma file through the kit's tokens.

# My website plan

> **Note for the AI:** Text inside `<!-- -->` is only help and examples for the student. It is not part of this plan. Never use it as a fact. Use only what is written outside it.

<!--
This file follows the "one file per page" way. It covers the Booking Confirmation page only.
Every answer in parts 1, 2, 3 and 5 was read from the Figma frame "Booking" (1440 x 2234).
Part 4 is not in Figma. Figma shows what a thing looks like, not what it does, so every line in part 4 is a choice to check.
This page is a demo. Nothing is really booked or paid, and no card details are asked.
-->

## 1. What pages are you building?

- Booking Confirmation
  - Address: /booking
  - Tab title: Booking Confirmation
  - For: showing the steps to confirm and pay, next to a summary of the stay and its price

## 2. Do you have a Figma link for each page?

- Booking Confirmation: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=812-1056

## 3. What sections does each page have?

**Booking Confirmation**

1. Header: logo picture on the left. On the right: link "Become a Host", a globe icon button, a menu button with a profile picture
2. Title row: a round back button with an arrow, big title "Confirm and pay"
3. Step 1 box (left column, open): title "1. Choose when to pay", 3 choices with a round radio button each, button "Next"
4. Step 2 box (left column, closed): title "2. Add a payment method"
5. Step 3 box (left column, closed): title "3. Review your reservation"
6. Summary card (right column): stay picture, name "STAY 2572", rating "4.98 (487)", label "Guest favourite", "Free cancellation" "Cancel before 21 January for a full refund." with the link "Full policy", "Dates" "22–24 Jan 2027" with a "Change" button, "Guests" "1 adult" with a "Change" button, "Price details", "Total" with the link "GBP", link "Price breakdown"
7. Notice box (right column, under the summary card): a small diamond picture and "Rare find! This place is usually booked"
8. Inspiration: the same as on the Home page
9. Footer: the same as on the Home page

**Things the pages show** (stays, menu items, products…)

Choices in Step 1 (title · small text):

- Pay £340.91 now
- Pay £0 now · £340.91 charged on 13 Jan 2027. No extra fees. More info
- Pay in 3 payments with Klarna · 3 payments of £113.63 each (0% APR). 18+, T&C apply, Credit subject to status. More info

Price lines in the summary card:

- 2 nights x £170.46 · £340.91
- Total · £340.91

Pictures:

- Stay picture in the summary card · picture none

## 4. What does each section do?

**Booking Confirmation**

- Header, logo: goes to /
- Header, "Become a Host" link, globe button, menu button: nothing, just shows them
- Title row, back button: goes to /listing
- Step 1, a choice: the clicked choice becomes the selected choice. Only one choice is selected at a time. No choice is selected when the page opens.
- Step 1, "More info" links: nothing, just shows them
- Step 1, "Next" button: shows "Thanks! This is a demo. No payment was made."
- Step 2 box and Step 3 box: nothing, just shows them
- Summary card, "Full policy" link: nothing, just shows it
- Summary card, "Change" buttons: nothing, just shows them
- Summary card, "GBP" link: nothing, just shows it
- Summary card, "Price breakdown" link: nothing, just shows it
- Notice box: nothing, just shows it
- Inspiration and Footer: the same as on the Home page

> **Rule for the AI:** If the Figma design shows something people can use (a button, link, icon, input box, tab, toggle…) and this part doesn't say what it does, **don't guess.** Write it as a question (`[NEEDS CLARIFICATION]`) and ask me with choices before building it. "Leave it out for now" is a fine choice.

## 5. Do you have design rules?

- Left and right page margin: 80px in the Header, 215px for the Title row and the two columns, 48px in Inspiration and Footer
- Space between sections: 24px between the title and the two columns, 80px between the left column and the right column
- Space between cards (gap): 24px between the step boxes, 24px between the summary card and the notice box
- Widest content: 1010px (left column 540px, right column 390px)
- Cards in one row: 2 columns, the steps on the left and the summary on the right
- Other rules:
  - Corners: 24px on the Step 1 box and the summary card, 20px on the Step 2 and Step 3 boxes, 12px on the notice box, 8px on the "Next" button, the "Change" buttons and the stay picture
  - The back button is a 44px circle, 24px to the left of the title
  - The Step 1 box has a soft shadow and no border. The other boxes have a thin border and no shadow.
  - There are 270px of empty space between the two columns and Inspiration
  - This page is designed for a computer only (1440px)

> **Rule for the AI:** For every rule left empty here, use what the Figma design of that page shows: its layout, spacing and sizes, as in the Figma code (CSS). Don't make up values. If a page has no Figma link and the rule is empty, ask me. Colors and fonts always come from my Figma file through the kit's tokens.

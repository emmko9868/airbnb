---
kind: page
site: AirbnbHome
revision: 13
status: review-required
source_ref: my-website/figma/Home.png; my-website/figma/Home.layers.xml; my-website/figma/Home.json (Figma node 389:2752, frame 1440x3367)
facts_complete: true
open_questions: 0
---

# Website assembly plan — AirbnbHome

```page-spec
{
  "title": "Airbnb",
  "locale": "en",
  "catalog": {
    "Navigation": {
      "codeHash": "7d6716518f4ece5c158ca5ddde746c09a19dcdacdde2e953985a1f72b040dcd8",
      "cssHash": "cf68331ec0fb13ec07f49a09c4a254167fc29da2858f096138f76e68d8757042",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"
    },
    "Link": {
      "codeHash": "9f173f62eeda46e00879a04169e253ca60ed733bdb9a40abd07a84319c6b7206",
      "cssHash": "b366b4d82603603d34e33c7733be2185ef0f163c1b6da7f22616a14a7a9b48bc",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"
    },
    "Tabs": {
      "codeHash": "17af55844dab84a292b5a4b3ea3587668bca8655d20a3e1cb3856d96a4963ba4",
      "cssHash": "0a09328c73b881c3275b61a03e9b0608101c65241adda164c5ffa3901f110398",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"
    },
    "Text": {
      "codeHash": "6a4988876058e71f062874b336212e9d0be9833fcec2949a77409f5818013fd7",
      "cssHash": "3324044cee78fc329d9cb2df9e9a6eeb153eef8c25f168a79ff797f875a43b5d",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "bdd38527174fe00ec064c97b5c7b28e998943e59d88e253b7067c639631f297a"
    }
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "evidence": "Figma node 389:2752 'Home' frame 1440x3367; screenshot my-website/figma/Home.png",
      "responsive": "Source viewport 1440px wide; layout uses 1280px content width with 80px side margins",
      "sections": [
        {
          "id": "top-nav",
          "tag": "header",
          "items": [
            {
              "id": "logo",
              "image": "airbnb-logo",
              "alt": "airbnb"
            }
          ]
        },
        {
          "id": "hero",
          "tag": "section",
          "items": [
            {
              "id": "hero-heading",
              "component": "Text",
              "props": { "as": "h1", "variant": "title" },
              "children": ["Start Your Trip with Airbnb"],
              "states": ["default"]
            },
            {
              "id": "search-bar",
              "component": "Navigation",
              "props": {
                "sections": [
                  { "id": "where", "label": "Where", "placeholder": "Search destinations" },
                  { "id": "checkin", "label": "Check-in", "placeholder": "Add dates" },
                  { "id": "checkout", "label": "Check-out", "placeholder": "Add dates" },
                  { "id": "who", "label": "Who", "placeholder": "Add guests" }
                ]
              },
              "states": ["default"]
            }
          ]
        },
        {
          "id": "stay-in-seoul",
          "tag": "section",
          "items": [
            {
              "id": "seoul-heading",
              "component": "Text",
              "props": { "as": "h2", "variant": "title" },
              "children": ["Stay in Seoul"],
              "states": ["default"]
            },
            {
              "id": "filter-chips",
              "component": "Tabs",
              "props": {
                "variant": "contained",
                "size": "sm",
                "items": [
                  { "id": "monthly", "label": "Monthly" },
                  { "id": "entire", "label": "Entire" },
                  { "id": "guesthouse", "label": "Guesthouse" },
                  { "id": "resort", "label": "Resort" }
                ],
                "defaultTab": "monthly"
              },
              "states": ["default"]
            }
          ]
        },
        {
          "id": "inspiration",
          "tag": "section",
          "items": [
            {
              "id": "inspiration-heading",
              "component": "Text",
              "props": { "as": "h2", "variant": "title" },
              "children": ["Inspiration for future getaways"],
              "states": ["default"]
            },
            {
              "id": "inspiration-tabs",
              "component": "Tabs",
              "props": {
                "variant": "line",
                "size": "md",
                "items": [
                  { "id": "popular", "label": "Popular" },
                  { "id": "arts-culture", "label": "Arts & culture" },
                  { "id": "beach", "label": "Beach" },
                  { "id": "mountains", "label": "Mountains" },
                  { "id": "outdoors", "label": "Outdoors" },
                  { "id": "things-to-do", "label": "Things to do" },
                  { "id": "travel-tips", "label": "Travel tips & inspiration" },
                  { "id": "airbnb-friendly", "label": "Airbnb-friendly apartments" }
                ],
                "defaultTab": "popular"
              },
              "states": ["default"]
            }
          ]
        },
        {
          "id": "footer",
          "tag": "div",
          "items": [
            {
              "id": "footer-support-heading",
              "component": "Text",
              "props": { "as": "h3", "variant": "body-sm" },
              "children": ["Support"],
              "states": ["default"]
            },
            {
              "id": "footer-help-center",
              "component": "Text",
              "props": { "as": "span", "variant": "body-sm" },
              "children": ["Help Center"],
              "states": ["default"]
            },
            {
              "id": "footer-hosting-heading",
              "component": "Text",
              "props": { "as": "h3", "variant": "body-sm" },
              "children": ["Hosting"],
              "states": ["default"]
            },
            {
              "id": "footer-airbnb-heading",
              "component": "Text",
              "props": { "as": "h3", "variant": "body-sm" },
              "children": ["Airbnb"],
              "states": ["default"]
            }
          ]
        }
      ],
      "layout": {},
      "media": []
    }
  ]
}
```

## Sourced facts and evidence

| Topic | Sourced facts and evidence | AI interpretation | Student decision/correction |
|---|---|---|---|
| Complete screens, sections, copy, data and optional matching images | Figma node 389:2752 "Home" frame 1440x3367; sections: top nav (logo + Become a Host), hero ("Start Your Trip with Airbnb" + search bar), reservations (3 cards), Stay in Seoul (heading + 4 filter chips + room cards grid), Inspiration (heading + 8 tabs), footer (3 columns) | Copy from Figma; no images in my-assets | Confirmed |
| Parts, public props, eligible scope and versions | Navigation (unverified), Link (starter), Tabs (starter), Text (starter) | Starter parts can be used freely | Confirmed |
| Routes, events, and real/demo outcomes | Single page at "/" path | Demo page | Confirmed |
| Layout tokens, viewports and responsive behavior | Source viewport 1440px; 1280px content width with 80px side margins | CSS grid/flexbox with token spacing | Confirmed |

## Questions

| Question ID | Decision needed, choices and impact | Student answer | Status |
|---|---|---|---|
| Q-01 | Service tabs: Figma shows 5 service tabs (All, Homes, Hotels, Experiences, Services) with icons. Use inline HTML buttons since ServiceTab is not in catalog. | Use inline buttons | answered |
| Q-02 | Reservation cards: 3 cards (CHECK-IN, CHECK-OUT, CANCELLED) with inline HTML. | Use inline HTML | answered |
| Q-03 | Property cards: 11 cards in 4-column grid with inline HTML. | Use inline HTML | answered |

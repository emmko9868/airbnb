---
kind: page
site: Airbnb Seoul
revision: 1
status: review-required
source_ref: my-docs/specs/plan.md; my-website/figma/Home.png
facts_complete: false
open_questions: 3
---

# Website assembly plan

```page-spec
{
  "title": "Airbnb Seoul",
  "locale": "en",
  "catalog": {
    "ServiceTab": {
      "codeHash": "52fa8a916f5a8f1ea2eeff58ac67b7649688c348bb8e3c7184c8700c8fb67db5",
      "cssHash": "99d3b31370d48c78b253492da67bbac2ef5b30e4aadcb071517df7ec1eb2f305",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Search": {
      "codeHash": "3585ebc4d94cf7b76f9482c4572b3b841e078b7f97db9d48947d18b17240eb39",
      "cssHash": "5310513f302f1713ef92aef04c8ca68982d09bd07d96bf9a38725cf8ec05da77",
      "dependencyHash": "0778067baa81a2b6b636b15bcb6f7db028bd535a783ef1ededc6fbf5c9485e3a",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "TextInput": {
      "codeHash": "ea7aa66f550dfb462c51c3a8bba93d44925e424fd360d5579c01af4550d4561d",
      "cssHash": "390cc18d732cd02b6ca7808d86443abf2c24fc98af785fbd95a03823aeab00b2",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Button": {
      "codeHash": "dbcfb61736274cb53ac8cf094759b3b79e10dbc20a79a9a039f42e1a61242ac3",
      "cssHash": "4a5ffbf06e275969e0eda537461274e6ff7051f62405ce302213b08e3a8a4ff1",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Card": {
      "codeHash": "e4ad6979546eefb9140a1cd3d8bdf96feef99d167a8b7229bd978c96d329278f",
      "cssHash": "7b3f1b6e47ed077d13ab83ab98f66abab5ad087eb4c82e0f1773c83f0ac98f12",
      "dependencyHash": "55c67bded1f55db84d1c352c33a5a88c51e90b9d0418cca7335f154a7957ee05",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Tabs": {
      "codeHash": "17af55844dab84a292b5a4b3ea3587668bca8655d20a3e1cb3856d96a4963ba4",
      "cssHash": "0a09328c73b881c3275b61a03e9b0608101c65241adda164c5ffa3901f110398",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Tag": {
      "codeHash": "6942312f4c3e594dccfb359cd3a1a35588dcb9cd3817995dc4db473ba9b3a74b",
      "cssHash": "a409b276e70a6b728991eadcc194764fd530b1abfbb1002bad4971885d816292",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Link": {
      "codeHash": "9f173f62eeda46e00879a04169e253ca60ed733bdb9a40abd07a84319c6b7206",
      "cssHash": "b366b4d82603603d34e33c7733be2185ef0f163c1b6da7f22616a14a7a9b48bc",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    },
    "Icon": {
      "codeHash": "b1dea3d1ba435fed9971acfdfcfabc13406de26beaf0b48f038178cceeb3a525",
      "cssHash": "90618475f26ad96e8828c508cc9ea804b463da82c89814896a777d24834fe580",
      "dependencyHash": "46420e41e0ef48b3a83d591c9b1237dea688ebde6250f08e1207346f503425de",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    }
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "title": "Home",
      "evidence": "my-docs/specs/plan.md; my-website/figma/Home.png",
      "responsive": "1440px desktop only, no responsive breakpoints",
      "sections": [
        {
          "id": "header",
          "items": [
            {
              "id": "logo",
              "component": "Link",
              "props": { "href": "/" },
              "children": ["Airbnb Logo"]
            },
            {
              "id": "become-host-link",
              "component": "Link",
              "props": {},
              "children": ["Become a Host"]
            }
          ]
        },
        {
          "id": "hero",
          "items": [
            {
              "id": "hero-title",
              "component": "Text",
              "props": { "tag": "h1" },
              "children": ["Start Your Trip with Airbnb"]
            },
            {
              "id": "service-tabs",
              "component": "ServiceTab",
              "props": { "label": "All", "selected": true }
            },
            {
              "id": "search-bar",
              "component": "Search",
              "props": { "label": "Search stays", "size": "lg" },
              "children": [
                {
                  "id": "where-field",
                  "component": "TextInput",
                  "props": { "label": "Where", "placeholder": "Search destinations" }
                }
              ]
            },
            {
              "id": "search-button",
              "component": "Button",
              "props": { "variant": "primary", "size": "large" },
              "children": ["Search"]
            }
          ]
        },
        {
          "id": "reservations",
          "items": [
            {
              "id": "reservations-title",
              "component": "Text",
              "props": { "tag": "h2" },
              "children": ["Your reservations"]
            },
            {
              "id": "reservation-card-1",
              "component": "Card",
              "props": { "cardType": "reservation", "title": "Your reservation", "subtitle": "CANCELED" }
            }
          ]
        },
        {
          "id": "stay-in-seoul",
          "items": [
            {
              "id": "stay-title",
              "component": "Text",
              "props": { "tag": "h2" },
              "children": ["Stay in Seoul"]
            },
            {
              "id": "filter-chips",
              "component": "Tag",
              "props": { "tone": "neutral" },
              "children": ["Hotels"]
            },
            {
              "id": "stay-card-1",
              "component": "Card",
              "props": { "cardType": "default", "title": "Groveland, California", "subtitle": "Yosemite National Park", "dates": "Oct 23 - 28", "price": "$289 night", "rating": 4.91 }
            }
          ]
        },
        {
          "id": "inspiration",
          "items": [
            {
              "id": "inspiration-title",
              "component": "Text",
              "props": { "tag": "h2" },
              "children": ["Inspiration for future getaways"]
            },
            {
              "id": "inspiration-tabs",
              "component": "Tabs",
              "props": { "variant": "line", "size": "md" },
              "children": ["Popular", "Arts & culture", "Beach", "Mountains", "Outdoors", "Things to do", "Travel tips & inspiration", "Airbnb-friendly apartments"]
            },
            {
              "id": "show-more-button",
              "component": "Button",
              "props": { "variant": "tertiary" },
              "children": ["Show more"]
            }
          ]
        },
        {
          "id": "footer",
          "items": [
            {
              "id": "footer-support-title",
              "component": "Text",
              "props": { "tag": "h3" },
              "children": ["Support"]
            },
            {
              "id": "footer-hosting-title",
              "component": "Text",
              "props": { "tag": "h3" },
              "children": ["Hosting"]
            },
            {
              "id": "footer-airbnb-title",
              "component": "Text",
              "props": { "tag": "h3" },
              "children": ["Airbnb"]
            },
            {
              "id": "footer-copyright",
              "component": "Text",
              "props": {},
              "children": ["© 2026 Airbnb, Inc."]
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

| Topic | Sourced facts and evidence | AI interpretation | Student decision/correction |
|---|---|---|---|
| Complete screens, sections, copy, data and optional matching images | my-docs/specs/plan.md; my-website/figma/Home.png | 6 sections: Header, Hero, Your reservations, Stay in Seoul, Inspiration, Footer | UNDECIDED |
| Parts, public props, eligible scope and versions | pnpm ds:catalog output | ServiceTab (unverified), Button (stale), Card (stale) need review before use | UNDECIDED |
| Routes, events, and real/demo outcomes | my-docs/specs/spec.md | Search filters stay cards; hearts toggle; tabs/chips select visually only | UNDECIDED |
| Layout tokens, viewports and responsive behavior | my-docs/inbox/page-1-home.md | 1440px desktop, 80px margins, 1280px content, 80px section gaps | UNDECIDED |

| Question ID | Decision needed, choices and impact | Student answer | Status |
|---|---|---|---|
| Q-01 | ServiceTab is unverified — run `pnpm ds:review ServiceTab` before use, or leave it out? | UNANSWERED | open |
| Q-02 | Button is stale — run `pnpm ds:review Button` before use, or leave it out? | UNANSWERED | open |
| Q-03 | Card is stale — run `pnpm ds:review Card` before use, or leave it out? | UNANSWERED | open |

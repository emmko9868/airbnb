---
kind: page
site: AirbnbSeoul
revision: 1
status: approved
source_ref: my-docs/specs/plan.md; my-website/figma/Home.png; my-website/figma/ListingDetail.png; my-website/figma/BookingConfirmation.png
facts_complete: true
open_questions: 0
---

# Website assembly plan

```page-spec
{
  "title": "AirbnbSeoul",
  "locale": "en",
  "catalog": {
    "Link": {
      "codeHash": "9f173f62eeda46e00879a04169e253ca60ed733bdb9a40abd07a84319c6b7206",
      "cssHash": "b366b4d82603603d34e33c7733be2185ef0f163c1b6da7f22616a14a7a9b48bc",
      "dependencyHash": "dcda0b203f9ec5f15cd91deb26aba4eb696a7919d711208c24901dd43cf83894",
      "tokensHash": "a95a230f72159d0105f1dbc39b9f93cf87b68a70492ec9910f6c4f67bf967e36"
    }
  },
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "title": "Home",
      "evidence": "my-docs/specs/plan.md; my-website/figma/Home.png",
      "responsive": "1440px desktop only",
      "sections": [
        {
          "id": "header",
          "items": [
            {
              "id": "logo",
              "component": "Link",
              "props": { "href": "/" },
              "children": ["Airbnb"],
              "states": ["default"]
            }
          ]
        }
      ],
      "layout": {},
      "media": []
    },
    {
      "name": "ListingDetail",
      "path": "/listing",
      "title": "Listing Detail",
      "evidence": "my-docs/specs/plan.md; my-website/figma/ListingDetail.png",
      "responsive": "1440px desktop only",
      "sections": [
        {
          "id": "header",
          "items": [
            {
              "id": "logo",
              "component": "Link",
              "props": { "href": "/" },
              "children": ["Airbnb"],
              "states": ["default"]
            }
          ]
        }
      ],
      "layout": {},
      "media": []
    },
    {
      "name": "BookingConfirmation",
      "path": "/booking",
      "title": "Booking Confirmation",
      "evidence": "my-docs/specs/plan.md; my-website/figma/BookingConfirmation.png",
      "responsive": "1440px desktop only",
      "sections": [
        {
          "id": "header",
          "items": [
            {
              "id": "logo",
              "component": "Link",
              "props": { "href": "/" },
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

---
kind: tokens
revision: 4
status: approved
source_url: https://www.figma.com/design/zrqq2F92iVtCoxKzj4b8Pm/testing-Airbnb-UI-Kit--Community-?node-id=238-2378
palette_hash: b16c94c6a15e59cc7abe324ca0e69916cbf4f8b37d228e6479866db4f7e5451b
content_hash: 8d3ce60ec3083ce890c59a56e99846cc9ef720a6f8b0fb347aa643b554356ea3
open_questions: 0
---
# Color Role Assignments

Student Figma files/nodes: 232:1522 (Buttons), 245:3517, 245:3518

Figma declared semantic roles are not duplicated below.
Primitive names and values come from the token calculation.

<!-- token-mappings:start -->
| Role | Primitive | Figma Node | Value | Reason |
|------|-----------|------------|-------|--------|
| bg | shade-01 | 232:1522 | #FFFFFF | Page background |
| surface | shade-01 | 232:1522 | #FFFFFF | Card/component surface |
| surface-raised | shade-01 | 232:1522 | #FFFFFF | Elevated elements |
| border | neutral-03 | 232:1522 | #DDDDDD | Default borders (secondary buttons) |
| border-strong | neutral-07 | 232:1522 | #717171 | Strong emphasis borders |
| text | shade-02 | 232:1522 | #222222 | Primary text color |
| text-secondary | neutral-07 | 232:1522 | #717171 | Secondary/muted text |
| text-disabled | neutral-05 | 245:3518 | #C2C2C2 | Disabled text |
| primary | primary-02 | 245:3518 | #FF385C | Primary button bg (Airbnb pink) |
| primary-hover | accent-02 | 245:3518 | #D03660 | Hover state (darker pink) |
| primary-active | accent-02 | 245:3518 | #D03660 | Active/pressed state |
| on-primary | shade-01 | 232:1522 | #FFFFFF | Text on primary buttons |
| danger | error-02 | 245:3518 | #C13515 | Error/danger state |
| success | discounts | 245:3518 | #008A05 | Success state |
| warning | primary-01 | 245:3518 | #F6475F | Warning state |
| info | link | 232:1522 | #004CC4 | Info/link color |
| image-placeholder | neutral-06 | 238:2378 | #B0B0B0 | Image placeholder background across all Card variants. AI proposal — no same-name Figma semantic declaration. |
| text-tertiary | neutral-08 | 238:2378 | #5E5E5E | Tertiary text for subtitles, dates, review counts in Card variants. Distinct from text-secondary (#717171). AI proposal — no same-name Figma semantic declaration. |
<!-- token-mappings:end -->

<!-- token-contrast:start -->
Normal text needs 4.5:1; disabled text is exempt. Colors are never adjusted automatically.
| Text | Background | Contrast | Result |
|---|---|---|---|
| text | bg | 15.91:1 | pass |
| text | surface | 15.91:1 | pass |
| text | surface-raised | 15.91:1 | pass |
| text-secondary | bg | 4.88:1 | pass |
| text-secondary | surface | 4.88:1 | pass |
| text-secondary | surface-raised | 4.88:1 | pass |
| text-disabled | bg | 1.78:1 | disabled (exempt) |
| text-disabled | surface | 1.78:1 | disabled (exempt) |
| text-disabled | surface-raised | 1.78:1 | disabled (exempt) |
| text-tertiary | bg | 6.48:1 | pass |
| text-tertiary | surface | 6.48:1 | pass |
| text-tertiary | surface-raised | 6.48:1 | pass |
| on-primary | primary | 3.52:1 | warning |
| on-primary | primary-hover | 4.80:1 | pass |
| on-primary | primary-active | 4.80:1 | pass |
| danger | bg | 5.54:1 | pass |
| danger | surface | 5.54:1 | pass |
| warning | bg | 3.51:1 | warning |
| warning | surface | 3.51:1 | warning |
| success | bg | 4.53:1 | pass |
| success | surface | 4.53:1 | pass |
| info | bg | 7.42:1 | pass |
| info | surface | 7.42:1 | pass |
<!-- token-contrast:end -->

## Student Review

- Q: Use these roles? → A: Use these roles (Recommended) (chosen in chat)
- Q: Missing roles (danger/success/warning/info)? → A: Implement these 2 designs from Figma first (chosen in chat)
- Q (revision 2): Two new colors from Card (238:2378) need semantic roles. #B0B0B0 → image-placeholder, #5E5E5E → text-tertiary. → A: Use these roles (Recommended) — Add --color-image-placeholder: #B0B0B0 (neutral-06) and --color-text-tertiary: #5E5E5E (neutral-08). (AI proposal, chosen in chat)

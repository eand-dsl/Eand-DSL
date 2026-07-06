# V1.1 Audit — 99 Coverage Sweep

**Date:** 2026-07-04
**Library:** e& Consumer App DSL V1.1 (fileKey `pzm63BTLfPfT1stcF89ILQ`)

## Method & limits

- Harvested via Figma MCP `search_design_system` restricted to this library's key, sweeping ~40+ fuzzy queries (component vocabulary + single-letter stragglers), deduped by componentKey.
- This is a **published-library index sweep, NOT a page-list**: the REST PAT expired and MCP page enumeration is unavailable, so anything *not published* to the library (WIP pages, scratch frames never published) is invisible to this method.
- `search_design_system` returns ~20 fuzzy matches per query; exhaustiveness is probabilistic. Items caught by zero query terms could be missed.
- Audit files present at sweep time: 01-primitives, 02-controls, 03-navigation, 04-layout, 05-feedback, 07-cards. Sections 00/06/08/09 were in-flight; coverage for those is attributed from the agreed audit scope (Overlays: Tooltip, Bottom sheet; Cards: Service, Recommendation; Banners: Highlight; Product-specific: Smiles Balance, Voucher; Foundations).

## Coverage matrix

*Harvested **163** unique published assets (107 covered / 56 orphan-flagged; icon glyphs sampled, not exhaustively enumerated).*

| Name | assetType | updatedAt | Mapped section | Status |
|---|---|---|---|---|
| Offers Badges | component_set | 2026-07-02 | 01 Primitives (Badges) | covered |
| Offers Badges | component_set | 2026-07-02 | 01 Primitives (Badges) | covered |
| Status Badges | component_set | 2026-07-02 | 01 Primitives (Badges) | covered |
| icon-size | component_set | 2026-07-02 | 01 Primitives (Icon-size) | covered |
| bookmark, banner, flag, tag | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| bubble notification, badge, message | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| email 2 notification, badge, envelope, mail | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| error, warning, alert | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| file 1, document, cloud, sync | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| icon | component_set | 2026-07-02 | 01 Primitives (Icons) | covered |
| icon | component_set | 2026-07-02 | 01 Primitives (Icons) | covered |
| icon | component_set | 2026-07-02 | 01 Primitives (Icons) | covered |
| Icon asset | component_set | 2026-04-28 | 01 Primitives (Icons) | covered |
| icons/avatar | component_set | 2026-04-28 | 01 Primitives (Icons) | covered |
| icons/microphone | component_set | 2026-04-28 | 01 Primitives (Icons) | covered |
| icons/send | component | 2026-04-28 | 01 Primitives (Icons) | covered |
| login, enter, door | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| notifications, badge | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| processor, chip | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| questionmark, faq, help, questionaire | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| table, spreedsheet, chart | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| touch, tab, click | icon-set | 2026-07-02 | 01 Primitives (Icons) | covered |
| progress-bar-core | component_set | 2026-07-02 | 01 Primitives (Progress-bar) | covered |
| e& Icon | component | 2026-04-28 | 01 Primitives (e& Logo) | covered |
| button | component_set | 2026-07-02 | 02 Controls (Buttons) | covered |
| Button | component | 2026-07-02 | 02 Controls (Buttons) | covered |
| Button | component_set | 2026-07-02 | 02 Controls (Buttons) | covered |
| Button | component_set | 2026-07-02 | 02 Controls (Buttons) | covered |
| Buttons | component_set | 2026-07-02 | 02 Controls (Buttons) | covered |
| button-content | component | 2026-07-02 | 02 Controls (Buttons, atom) | covered |
| suggestion-chips | component_set | 2026-07-02 | 02 Controls (Chips / AI Search) | covered |
| Assistive chip | component_set | 2026-06-01 | 02 Controls (Chips) | covered |
| Chip groups | component_set | 2026-06-01 | 02 Controls (Chips) | covered |
| Chips | component_set | 2026-07-02 | 02 Controls (Chips) | covered |
| Filter chip | component_set | 2026-06-01 | 02 Controls (Chips) | covered |
| Input chip | component_set | 2026-06-01 | 02 Controls (Chips) | covered |
| Suggestion chip | component_set | 2026-06-01 | 02 Controls (Chips) | covered |
| input-field | component_set | 2026-07-02 | 02 Controls (Input) | covered |
| Addon | component_set | 2026-07-02 | 02 Controls (Input, atom) | covered |
| input status | component_set | 2026-07-02 | 02 Controls (Input, atom) | covered |
| Input type | component_set | 2026-07-02 | 02 Controls (Input, atom) | covered |
| Pass check | component_set | 2026-07-02 | 02 Controls (Input, atom) | covered |
| 🔄 Input-field | component | 2026-06-16 | 02 Controls (Input, atom) | covered |
| radio-button | component_set | 2026-07-02 | 02 Controls (Radio) | covered |
| radio-button | component_set | 2026-07-02 | 02 Controls (Radio) | covered |
| action-bar | component_set | 2026-07-02 | 03 Navigation (Action bar) | covered |
| bill action card | component_set | 2026-07-02 | 03 Navigation (Bill action card) | covered |
| bill-container | component | 2026-07-02 | 03 Navigation (Bill action card, atom) | covered |
| Third action button card | component | 2026-04-28 | 03 Navigation (Bill action card, atom) | covered |
| Bottom Navigation - NEW | component_set | 2026-05-14 | 03 Navigation (Nav bar) | covered |
| navbar | component | 2026-07-02 | 03 Navigation (Nav bar) | covered |
| navbar-tabs | component_set | 2026-07-02 | 03 Navigation (Nav bar, atom) | covered |
| navbar-tabs | component_set | 2026-07-02 | 03 Navigation (Nav bar, atom) | covered |
| Navigation header | component_set | 2026-07-02 | 03 Navigation (Navigation header) | covered |
| Navigation header | component_set | 2026-07-02 | 03 Navigation (Navigation header) | covered |
| Navigation header | component_set | 2026-07-02 | 03 Navigation (Navigation header) | covered |
| Navigation header | component_set | 2026-07-02 | 03 Navigation (Navigation header) | covered |
| Action card | component_set | 2026-07-02 | 03 Navigation (Quick Action) | covered |
| pill-tabs | component_set | 2026-07-02 | 03 Navigation (Tabs) | covered |
| pill-tabs | component_set | 2026-07-02 | 03 Navigation (Tabs) | covered |
| tab-content | component | 2026-07-02 | 03 Navigation (Tabs, atom) | covered |
| Left part | component_set | 2026-07-02 | 03 Navigation (Top bar, atom) | covered |
| Middle part | component_set | 2026-07-02 | 03 Navigation (Top bar, atom) | covered |
| Right part | component_set | 2026-07-02 | 03 Navigation (Top bar, atom) | covered |
| Top nav buttons | component_set | 2026-06-10 | 03 Navigation (Top bar, atom) | covered |
| Top nav buttons | component_set | 2026-06-10 | 03 Navigation (Top bar, atom) | covered |
| Master menu component | component_set | 2026-07-02 | 03 Navigation (Top bar/Master menu) | covered |
| Accordion header | component_set | 2026-06-17 | 04 Layout (Accordion header) | covered |
| Accordion header | component_set | 2026-06-17 | 04 Layout (Accordion header) | covered |
| Main Title | component_set | 2026-07-02 | 04 Layout (Section — Main Title) | covered |
| Title | component_set | 2026-07-02 | 04 Layout (Section — Title) | covered |
| Alert Message | component_set | 2026-06-09 | 05 Feedback (Alert Message) | covered |
| Alert Message | component_set | 2026-06-09 | 05 Feedback (Alert Message) | covered |
| alert-message | component_set | 2026-07-02 | 05 Feedback (Alert Message) | covered |
| Plan usage | component | 2026-07-02 | 05 Feedback (Plan Usage Bar) | covered |
| Usage/ card/no icon | component | 2026-04-28 | 05 Feedback (Plan Usage, atom) | covered |
| Snackbar | component_set | 2026-06-09 | 05 Feedback (Snackbar) | covered |
| Snackbar | component_set | 2026-06-16 | 05 Feedback (Snackbar) | covered |
| 🔄 Snackbar-states | component | 2026-06-01 | 05 Feedback (Snackbar, atom) | covered |
| Status | component_set | 2026-07-02 | 05 Feedback (Status screens) | covered |
| Bottom sheet | component | 2026-07-02 | 06 Overlays (Bottom sheet) | covered |
| ↪ Bottom sheet ↪ Header | component_set | 2026-06-18 | 06 Overlays (Bottom sheet, atom) | covered |
| Grabber | component_set | 2026-07-02 | 06 Overlays (Grabber) | covered |
| deals-card | component | 2026-07-02 | 07 Cards (Deals, atom) | covered |
| card | component_set | 2026-04-28 | 07 Cards (General) | covered |
| Card | component_set | 2026-06-03 | 07 Cards (General) | covered |
| Card | component_set | 2026-06-09 | 07 Cards (General) | covered |
| Card | component_set | 2026-04-28 | 07 Cards (General) | covered |
| Plan card | component_set | 2026-04-28 | 07 Cards (Plans) | covered |
| plans-mini-core | component | 2026-07-02 | 07 Cards (Plans-mini, atom) | covered |
| Product cards grid | component_set | 2026-07-02 | 07 Cards (Product) | covered |
| Service card | component_set | 2026-07-02 | 07 Cards (Service) | covered |
| Core Service Icon | component_set | 2026-04-29 | 07 Cards (Service, atom) | covered |
| Core Service Icon | component_set | 2026-04-28 | 07 Cards (Service, atom) | covered |
| 🔄 Card label | component | 2026-07-02 | 07 Cards (atom) | covered |
| card-features-addon | component | 2026-07-02 | 07 Cards (card-features, atom) | covered |
| Icon+Text Banner | component_set | 2026-04-28 | 08 Banners | covered |
| Banner | component | 2026-07-02 | 08 Banners (Highlight) | covered |
| Banners Carousel | component_set | 2026-07-02 | 08 Banners (Highlight) | covered |
| Banners Carousel | component_set | 2026-07-02 | 08 Banners (Highlight) | covered |
| highlight-banner | component_set | 2026-07-02 | 08 Banners (Highlight) | covered |
| Success | component_set | 2026-04-28 | 05 Feedback (Status screens, atom) | covered-atom |
| Badge banner | component | 2026-07-02 | 08 Banners (atom) | covered-atom |
| Simple banner with icon | component | 2026-04-28 | 08 Banners (atom) | covered-atom |
| Bottom part | component | 2026-07-02 | atom (parent TBD) | covered-atom |
| *Status-bar | component | 2026-05-06 | device chrome atom | covered-atom |
| Keyboard | component | 2026-07-02 | device chrome atom | covered-atom |
| Billing info | component_set | 2026-07-02 | 03 Navigation (Bill action card, atom?) | orphan |
| State | component_set | 2026-07-02 | 05 Feedback (Status screens, atom?) | orphan |
| Banner 1 | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Gifts Included Banner | component | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Info Banner | component | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Mshop banner (small) | component_set | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Mshop banners | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Notification banner | component | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Offer Banner | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Promo banner | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Promo banner | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Simple promo banner | component | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Switch to e& banner | component | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Text banner | component_set | 2026-07-02 | 08 Banners candidate (unaudited variant) | orphan |
| Whats new banner | component_set | 2026-04-28 | 08 Banners candidate (unaudited variant) | orphan |
| Action Card (TBD) | component_set | 2026-04-28 | ? | orphan |
| Big title | component_set | 2026-07-02 | ? | orphan |
| Devices small cards | component_set | 2026-04-28 | ? | orphan |
| Devices small cards | component_set | 2026-06-09 | ? | orphan |
| elife config/ tv packs/ Pattern | component_set | 2026-04-28 | ? | orphan |
| Feedback buttons | component_set | 2026-04-28 | ? | orphan |
| floating-buttons | component_set | 2026-06-22 | ? | orphan |
| Insurance card | component | 2026-07-02 | ? | orphan |
| Interactive header | component_set | 2026-07-02 | ? | orphan |
| Interactive header | component_set | 2026-07-02 | ? | orphan |
| Link your card | component | 2026-07-02 | ? | orphan |
| Manage account | component_set | 2026-04-28 | ? | orphan |
| Profile completion | component | 2026-04-28 | ? | orphan |
| Profile header - NEW | component_set | 2026-07-02 | ? | orphan |
| Profile header - NEW | component_set | 2026-07-02 | ? | orphan |
| SIM card | component_set | 2026-04-28 | ? | orphan |
| Subheader | component_set | 2026-07-02 | ? | orphan |
| Subscription card | component | 2026-07-02 | ? | orphan |
| Text offer card | component | 2026-07-02 | ? | orphan |
| Visual asset | component_set | 2026-07-02 | ? | orphan |
| 🔄 Card Carousel | component | 2025-12-04 | ? | orphan |
| 🔄 Selection cards | component | 2026-07-02 | ? | orphan |
| Elements/Button | component_set | 2026-04-28 | ? Elements/* family | orphan |
| Elements/Input stepper | component_set | 2026-04-28 | ? Elements/* family | orphan |
| Elements/Selection input | component_set | 2026-04-28 | ? Elements/* family | orphan |
| Elements/Text input | component_set | 2026-04-28 | ? Elements/* family | orphan |
| Field | component_set | 2026-04-28 | ? Elements/* family | orphan |
| Footer | component_set | 2026-07-02 | ? Footer family | orphan |
| Sticky footer | component | 2026-07-02 | ? Footer family | orphan |
| Skeleton item | component | 2026-06-03 | ? loading state | orphan |
| Ad pop-up no image | component_set | 2026-07-02 | ? pop-up family | orphan |
| Bottom elements | component_set | 2026-07-02 | atom (parent TBD) | orphan |
| Header | component_set | 2026-06-01 | atom (parent TBD) | orphan |
| Header | component_set | 2026-07-02 | atom (parent TBD) | orphan |
| Header | component_set | 2026-07-02 | atom (parent TBD) | orphan |
| Header top part | component | 2026-07-02 | atom (parent TBD) | orphan |
| original-core | component | 2026-07-02 | atom (parent TBD) | orphan |
| State indicator text | component_set | 2026-04-28 | atom (parent TBD) | orphan |
| Button (Fluent 2 desc) | component_set | 2026-06-18 | — foreign import (Fluent 2 kit) | orphan |
| Compound button (Fluent 2 desc) | component_set | 2026-06-18 | — foreign import (Fluent 2 kit) | orphan |
| Split button (Fluent 2 desc) | component_set | 2026-06-18 | — foreign import (Fluent 2 kit) | orphan |

## Unaudited surface

*(pending)*

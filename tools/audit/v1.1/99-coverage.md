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

*Classification added 2026-07-06.* Method: `search_design_system` by exact name against this library. Same access limits as the harvest apply — search returns componentKeys only (no node-ids), and MCP page enumeration returns only the Cover page, so items below could not be opened node-by-node; classifications marked *(probable)* are based on name/family/timestamp signals and need node-level confirmation when their section is next touched. `updatedAt 2026-07-02` is the bulk-republish timestamp and does not imply active work; the `2026-04-28` cluster is the V1.0 import batch.

Buckets: **NEW-UNAUDITED** (real V1.1 surface no audit section covers) · **ATOM** (piece of an already-audited component) · **SCRATCH / foreign-import** (auto-named, stale-iteration, or imported from another kit).

### Banner family (beyond audited Highlight, 08)

None of these live on the audited Highlight page (08 enumerated it fully); all are separate published banner assets.

| Asset | Type / updated | Classification | Recommendation |
|---|---|---|---|
| Banner 1 | set · 07-02 | SCRATCH *(probable)* — Figma auto-name ("Banner 1") signals an unnamed set published by accident | Ask design to rename or unpublish; audit under an 08 extension only if it turns out to be a real component |
| Gifts Included Banner | component · 04-28 | NEW-UNAUDITED — V1.0-import purchase-flow strip ("gifts included"), single component, never restyled | Confirm V1.1 intent with design; fold into an 08 extension if kept, else deprecate |
| Info Banner | component · 04-28 | NEW-UNAUDITED — inline informational strip, likely superseded by 05 Alert Message | Confirm-and-deprecate against Alert Message; no new section |
| Mshop banner (small) | set · 04-28 | NEW-UNAUDITED — Mshop (marketplace) vertical asset | Ignore for DSL core; audit only if the Mshop surface enters scope (then merge with "Mshop banners") |
| Mshop banners | set · 07-02 | NEW-UNAUDITED — Mshop vertical asset, duplicate sizing of the above | Same as above; consolidate small/large into one set |
| Notification banner | component · 04-28 | NEW-UNAUDITED — overlaps audited Snackbar / Alert Message (05) | Confirm-and-deprecate; no new section |
| Offer Banner | set · 07-02 | NEW-UNAUDITED — promotional offer banner, republished current | Strongest candidate for a new **08-extension audit** together with Promo banner |
| Promo banner (×2 sets) | 2 sets · 07-02 | NEW-UNAUDITED — two distinct published sets with the same name | 08-extension audit after design merges the duplicate sets |

Remaining banner-candidate orphans from the matrix (Text banner, Simple promo banner, Switch to e& banner, Whats new banner) follow the same pattern: 04-28 singles → confirm-and-deprecate; 07-02 sets → sweep into the same 08-extension audit.

### Slider family — **missed by the 163-asset harvest** (caught by this follow-up sweep; matrix above intentionally left unaltered)

| Asset | Type / updated | Classification | Recommendation |
|---|---|---|---|
| Slider (×2 sets) | sets · 06-01 + 04-28 | NEW-UNAUDITED — genuine control family absent from 02 Controls; 04-28 set is the stale duplicate | New audit item: fold a **Slider audit into section 02 Controls**; deprecate the 04-28 duplicate |
| interactive slider (×2 sets) | sets · 06-01 + 04-28 | NEW-UNAUDITED — interactive variant of the same family; old duplicate again | Audit together with Slider in the 02 extension; dedupe |
| Slider indicator | set · 06-01 | ATOM *(probable)* of Slider (value indicator/bubble; published in the same 06-01 batch) | Cover inside the Slider audit; no section of its own |
| jump to (×2 sets) | sets · 06-01 + 04-28 | NEW-UNAUDITED — small jump-to-top/section utility (pairs with icon "align top, arrow"); old duplicate | Fold into section 03 Navigation on next touch; dedupe the 04-28 set |
| settings slider hor · Data distribution slider | set · 07-02 / set · 04-28 | NEW-UNAUDITED — product-specific slider variants surfaced by the same sweep | Audit with the Slider family in the 02 extension (Data distribution likely deprecable V1.0 import) |

### Other substantial orphans

| Asset | Type / updated | Classification | Recommendation |
|---|---|---|---|
| Footer / footer / Sticky footer / .footer/Default | set + 2 components + dot-atom · 07-02 | NEW-UNAUDITED — coherent layout family (Footer set, Sticky footer, `.footer/Default` core atom) | New audit item: **fold a Footer entry into section 04 Layout** covering all four assets |
| Visual asset | set · 07-02 | NEW-UNAUDITED *(probable)* — name pattern suggests an illustration/media slot primitive with size/ratio variants | Verify contents, then fold into section 01 Primitives |
| Profile header - NEW (×2 sets) | 2 sets · 07-02 | NEW-UNAUDITED — profile-screen header; "- NEW" suffix + duplicate sets = unconsolidated iteration | Audit under section 03 Navigation (header family) once design merges the two sets and drops the suffix |
| Billing info | set · 07-02 | ATOM *(probable)* of Bill action card (03 Navigation, audited) — billing summary block; siblings are the V1.0 "Usage/ payment…" imports | Verify during the next 03 touch-up; no new section |
| State | set · 07-02 | ATOM *(probable)* of Status screens (05 Feedback, audited "Status" set) — per-state atom; related orphans "States" (07-02) and "State indicator text" (04-28) likely same family | Verify during the next 05 refresh; no new section |

**Net-new audit work recommended:** 08-extension (Offer/Promo/Mshop banners after design dedupe) · Slider family folded into 02 Controls · Footer folded into 04 Layout · Visual asset folded into 01 Primitives · Profile header - NEW folded into 03 Navigation. Everything else is atom-verification or confirm-and-deprecate — no standalone sections.

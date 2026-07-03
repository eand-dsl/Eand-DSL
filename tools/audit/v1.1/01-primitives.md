# Audit — e& DSL V1.1 — Section 01: Primitives

- **Audit date:** 2026-07-02
- **Figma file:** `pzm63BTLfPfT1stcF89ILQ` — "e& Consumer App DSL V1.1" (published library, edited 2026-07-02)
- **Pages audited (node-ids):** e& Logo `27020:6155` · Badges `22668:60275` · Icons `31135:12366` (NEW) · Icon-size `25460:22589` · Logo-row `25996:32494` · Dismiss `28961:16066` (NEW) · Progress-bar `26663:89882` · Add-trigger `25752:11470` · Product-assets 🟡 `28919:1442` (WIP) · Atom-Surfaces `26729:91998`
- **Code compared:** `packages/react-design-system/src/components/primitives.tsx` (Text, Icon, Badge, SmilesAvatar, SmilesRow, ProgressBar, AddTrigger, LogoRow, AtomSurface, Logo) · `packages/icons` (23 SVGs/exports) · `tools/anatomy/*.md` · `design.md`

## Drift table

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| e& Logo | set `e&-logo` 27032:50455; atom `.e&-logo-core` 27032:50443 | | `version` = default / white / midnight / red; 96×96 (core 100×100). Full lockup: "e&" ligature + "etisalat and" wordmark; default = white-on-red app tile | `Logo` — styled text span "e&", fontSize 22, `text.brand.default`; no `version` prop, no artwork | `eand-logo.md` — current (variants + dims match V1.1) | VISUAL-DRIFT + VARIANT-DRIFT | Replace text placeholder with real lockup SVGs; add `version` prop (4 values) |
| Badges | offers set 12934:864; status set 25694:12036; tier set 26501:2010 (sections 26109:21649 / 26045:553 / 26501:2009) | | Offers ×12 · Status = neutral, **neutra-inverse (new)**, **disabled**, positive, warning, danger · Tier = Platinum/Gold/Gold+/Silver/Silver+/Bronze "number" · sizes sm/md/lg = h16/20/24 fixed, md: px8 py4 min-w 56, radius 8 | `Badge` — offer (all 12 ✓), status = neutral/positive/warning/danger/**brand** (no disabled, no neutral-inverse, no tiers); padding-based height, md px=4, no min-width | `badges.md` — mostly current; lists tiers code never had | VARIANT-DRIFT + TOKEN-DRIFT | Add `disabled` + `neutral-inverse` statuses, drop/confirm `brand`, add tier variants; fix h/pad/min-w; fix `"limited stock"` token key (see notes) |
| Icons (NEW page) | page 31135:12366; 14 category frames; 209 icon component sets | NEW | 209 glyph sets, each 24×24 × 30 variants: `filled`(on/off) × `stroke`(1/1.5/2) × `radius`(0/1/2/3) × `join`(round/square@radius-0) | `@eand/icons` — 23 static single-style SVG exports; mixed viewBox 24 and **32** (home, mshop, profile, shop, support) | — (no anatomy file) | MISSING-IN-CODE (≈197 glyphs) + VARIANT-DRIFT | Regenerate icon package from V1.1 page; normalize to 24×24; decide on variant-axis support; see full diff below |
| Icon-size | set `icon-size` 25408:1190 | | `category`(icon/logo/3d-icon) × `size` xs8 / sm12 / md16 / lg20 / xl24 / 2xl32 / 3xl40 / 4xl48 | `Icon` size prop + `tokens.icon` — all 8 stops match exactly; no category axis (layout-only, acceptable) | `icon-size.md` — dims list omits 12×12 and 8×8 | OK (minor STALE-ANATOMY) | Append 12/8 dims to anatomy file |
| Logo-row | set `logo-row` 25997:32516; atoms `.logo-style` 26556:17510, `more-items` 28892:13176 | | `size`(sm/md/lg) × `style`(Default/glass); Default 164×24 / 232×32 / 280×40; glass 260×40 / 328×48 / 376×56; logo h 24/32/40; overlapping brand circles + "+x" chip; `more-items` surface default/inverse | `LogoRow` — generic flex row, gap `lg`, fixed item h32, no size/style/glass/+x-more. `SmilesRow`/`SmilesAvatar` — closest visual match but hardcoded hexes (#6C3FD6, #c0bfc8), fixed +4 | `logo-row.md` — dims current; V1.0 top-level axes (logo-1..5, +x-more, type, surface) no longer variant symbols (likely converted to booleans/atoms — verify) | VARIANT-DRIFT + TOKEN-DRIFT | Merge LogoRow/SmilesRow into one tokenized logo-row (size × style, more-items surface); replace hardcoded colors |
| Dismiss (NEW) | set `dismiss` 28961:19839 (default 28961:19838, inverse 28961:19840); atom `.dismiss-core` 28961:19833 | NEW | `surface` = default / inverse; 24×24 circular scrim button with X glyph | — no export | — no anatomy file | MISSING-IN-CODE | Add `Dismiss` primitive (2 surfaces) + anatomy file |
| Progress-bar | set `progress-bar-core` 26437:43709 | | `Progress` = 5…100 step 5; 300×**4**; fill `color/text/positive/subtle` #54bc72 (green); no track fill | `ProgressBar` — h**8**, PILL radius, track `surface.sunken.default`, default fill `status.accent` (#e00800 red) + tone prop | `progress-bar.md` — current (300×4, Progress axis) | TOKEN-DRIFT + VISUAL-DRIFT | Set h4; default fill positive/subtle green; re-evaluate tone prop + visible track vs Figma |
| Add-trigger | set `add-trigger` 25973:25405 (default 25752:11486, **inverse 28917:4269 new**) | | 285×**72**; bg `surface/glass/midnight/sm` rgba(25,19,41,.07); radius 16; px20/py16; **no dashed border**; inner tertiary button: plus-circle icon 24 (red) + label `button/lg` SemiBold 16 #191329 | `AddTrigger` — h40, PILL radius, transparent bg, **1px dashed** border.default, `text.brand` label, `button.md`, icon "sm", no inverse | `add-trigger.md` — 285×72 + surface axis current, but spec bullets (H52, dashed, icon 20) copied from Figma's own stale statesheet | VISUAL-DRIFT + VARIANT-DRIFT | Rebuild to V1.1 render (glass bg, r16, h72, button-inside); add surface=inverse; flag stale Figma statesheet to design |
| Product-assets 🟡 | section "WIP" 29067:12921; set `Devices small cards` 28919:19889 | WIP | `Device` = xbox / Laptop / Speaker / Powerbank / iPhone / Dualsense / Tablet / Smart home / Mi TV (86.8×100.8 photo cards); loose Photo frame 28919:19988 (180×166), 224×224 logo tiles, unsplash bitmaps | — no export (expected) | — none | MISSING-IN-CODE (documented-only, page in progress) | No action until page loses 🟡; re-audit next pass |
| Atom-Surfaces | set `.card-bg-color` 25710:20065 (section "card-bg-color" 30420:25249) | | `color` = default / red / orange / yellow / green / **cyan** / blue / violet; 224×272 pastel card swatches; hero renamed "Card background color" | `AtomSurface` — `level`(canvas/base/raised/sunken) using `color.surface.*`; `tokens.color.atomSurfaces` exists (8 hexes) but **unused** by component; token names have **purple**, no **cyan** | `atom-surfaces.md` — current (matches V1.1 axes/dims) | VARIANT-DRIFT + TOKEN-DRIFT | Re-point AtomSurface to `atomSurfaces` color axis (or split into CardBg primitive); reconcile cyan/blue/purple naming |

**Verdict tally:** OK 1 · MISSING-IN-CODE 3 (Icons bulk, Dismiss, Product-assets[WIP]) · VARIANT-DRIFT 5 · VISUAL-DRIFT 3 · TOKEN-DRIFT 4 · STALE-ANATOMY 2 (minor) · REMOVED-IN-FIGMA 1 (badge `brand` status; plus ~11 code icons unmatched, see below). (Components carry multiple flags.)

---

## Notes per component

### e& Logo — `27020:6155`
- V1.1 component set `e&-logo` **27032:50455**: `version=default` 27032:50454, `version=white` 27032:50456, `version=midnight` 27032:50459, `version=red` 27032:50475 — all 96×96. Core atom `.e&-logo-core` **27032:50443** (100×100).
- Figma usage rules (statesheet): light surface → default/midnight/red; dark surface → default/white; "always ensure sufficient contrast".
- Screenshot confirms full brand lockup ("e&" script ligature + "etisalat and" wordmark; default = white mark on red rounded tile).
- **Drift:** code `Logo` is a typographic placeholder (`<span>e&</span>`, 22px, brand red) — no version prop, no wordmark, no tile. `design.md` §e& Logo "States: version: primary · monochrome · app-icon" is stale V1.0 language; actual axis is default/white/midnight/red.
- Anatomy `eand-logo.md` is current (variants + 96/100 dims match).

### Badges — `22668:60275`
- Fresh V1.1 set ids: **Offers 12934:864** (12 types × sm/md/lg; heights 16/20/24), **Status 25694:12036**, **Tier 26501:2010** (frame inside section 26501:2009; frame is misnamed "Offers Badges" in Figma).
- Status axis in Figma: `neutral, neutra-inverse, disabled, positive, warning, danger` — note **Figma typo "neutra-inverse"** (nodes 30687:18151/20277/20279, added in V1.1). **No `brand` status exists in Figma**; code + tokens carry `brand` (#e00800) → REMOVED-IN-FIGMA (or never shipped) — confirm with design before deleting.
- Exact md spec (design-context on 25694:12055): fixed h20, min-width 56, padding `spacing/sm`(8) × `spacing/xs`(4), radius `border-radius/2`(8), type `badge/md` 12px weight 450 lh 100%.
- **Code drift:** `Badge` has no fixed height/min-width; md/sm horizontal padding uses `xs`(4) where Figma md uses `sm`(8). Missing statuses `disabled`, `neutral-inverse` (tokens already exist: `badge.surface.status.disabled/neutralInverse`). No tier badge support (tokens `badge.text.tiers.*` exist).
- **Token bug:** `tokens.ts` → `badge.surface.offers["limited stock"]` has a literal space; `color('badge.surface.offers.limited-stock')` camelizes to `limitedStock` and misses → `offer="limited-stock"` renders with an unresolved background string. (Text-side key `limitedStock` is correct.)
- Offer name mapping code↔Figma is otherwise complete: `validity`↔"Valid for 2 days", `limited-time`↔"Limited time offer", rest 1:1.

### Icons (NEW page) — `31135:12366`
- 14 category frames, **209 icon component sets**, all 24×24, each with **30 variants**: `filled`(on/off) × `stroke`(1/1.5/2) × `radius`(0/1/2/3) × `join`(round; square only at radius=0). Category frames + counts: Interface General 31150:23 (56) · Accessibility 31150:4054 (2) · AI & Magic 31152:4179 (4) · Arrows 31152:4426 (55) · Building 31152:9632 (9) · Code 31152:10509 (3) · Clouds 31152:11635 (4) · Communication 31152:12213 (16) · Devices & Signals 31152:15044 (23) · Edit 31152:18424 (3) · Filter & Settings 31152:20010 (4) · Folders & Files 31214:45466 (15) · Food 31214:49006 (1) · Hands 31239:51307 (14).
- Code registry `packages/icons/src/icons.tsx` exports **23** icons (note: brief said 24; actual raw/ count is 23): car, chevron-right, gift, grid, home, mic, mobile, mshop, notification, plus, profile, puzzle, search, shield, shop, sim, sparkle, subscriptions, support, truck, tv, wallet, wifi. Single style only; **5 icons use 32×32 viewBox** (home, mshop, profile, shop, support) vs Figma's uniform 24.
- **Code → Figma V1.1 mapping (12 matched, mostly renamed):**
  - `chevron-right` → "chevron-right" (Arrows) — exact
  - `grid` → "dot grid, menu, grab" / "menu 1|2, grid, circle" (Interface General) — ambiguous rename, verify glyph
  - `home` → "home simple, house" | "home line, house" | "home open, house" (Building)
  - `mobile` → "phone, device, iphone, mobile" (Devices & Signals)
  - `notification` → "notification, bell, activity" (Interface General)
  - `plus` → "plus, add large" / "plus, add small" (Interface General — split into two glyphs)
  - `search` → "search 2, magnifying glass" (Interface General)
  - `shop` → "store, shop, business" (Building)
  - `sim` → "memory 1, sim card, card" (Folders & Files)
  - `sparkle` → "ai 2 stars, sparkles, ✨" (AI & Magic)
  - `tv` → "television 1, tv, monitor, video, screen, display" (Devices & Signals)
  - `wifi` → "wifi 2, spot, signal, hot spot" (Devices & Signals)
- **Code icons with NO V1.1 equivalent (11):** car, gift, mic, mshop (brand glyph), profile, puzzle, shield, subscriptions, support, truck, wallet. Categories that would host them (People, Commerce/Money, Vehicles, Security, Media) are absent from the page — the library looks **mid-migration**; treat these as "pending in Figma", not confirmed removals.
- **Figma glyphs missing in code:** ~197 (209 − 12 matched). Full per-category name list retained in audit scratch (`figma-icons.txt`); headline gaps for the app shell: chevron top/bottom/left + small variants, close/x set, arrows set, loader, qr code, eye/eye-off, filter/settings, call/message/email set, cloud set, folders/files set.

### Icon-size — `25460:22589`
- Set `icon-size` **25408:1190**; symbols e.g. 25408:1189 (icon/sm 12), 26593:14473-14477 (4xl 48 trio). Axes: `category`(icon/logo/3d-icon) × `size`(xs 8, sm 12, md 16, lg 20, xl 24, 2xl 32, 3xl 40, 4xl 48).
- Code `tokens.icon` matches all 8 stops byte-for-byte; `Icon` size prop resolves through it. Verdict OK.
- `icon-size.md` anatomy lists only 48/40/32/24/20/16 dims — add 12×12 and 8×8 (minor stale).

### Logo-row — `25996:32494`
- Set `logo-row` **25997:32516** (V1.1): `size`(sm/md/lg) × `style`(Default/glass). Symbol dims: sm 25997:32598 164×24, sm-glass 26560:28048 260×40, md 25997:32648 232×32, md-glass 26560:28056 328×48, lg 26556:17599 280×40, lg-glass 26560:28064 376×56. Logo heights: 24/32/40 (statesheet).
- Atoms: `.logo-style` **26556:17510** (type=Default 24×24 / glass-margin 40×40), `more-items` **28892:13176** (surface=default/inverse 24×24).
- Screenshot: overlapping circular brand ("smiles") logos + trailing "+4" chip; glass style wraps each logo in a dark translucent ring; inverse surface shown on dark.
- V1.0 anatomy axes (`logo-1..5` on/off, `+x-more`, `type`, `surface` at set level) no longer appear as variant symbols — likely demoted to boolean props/atom axes; dims in `logo-row.md` still match exactly, so anatomy is usable but axis list needs re-verification.
- **Code drift:** `LogoRow` is a generic gap-`lg` flex row (fixed 32px items, no overlap, no +x chip, no sizes/glass). `SmilesRow`/`SmilesAvatar` reproduce the visual but with hardcoded `#6C3FD6`/`#c0bfc8`/white-border and fixed 11px/7px font math — no tokens. Two half-implementations of one Figma component.

### Dismiss (NEW, no code export) — `28961:16066`
- Component set `dismiss` **28961:19839**: `surface=default` 28961:19838, `surface=inverse` 28961:19840 — both **24×24**. Core atom `.dismiss-core` **28961:19833** (24×24).
- Spec: circular scrim/ghost button containing an X (crossed) glyph; default = light grey translucent circle on light surfaces, inverse = darker grey circle for dark/inverse surfaces. Statesheet: single default state per surface; no size axis (fixed 24).
- Tokens: circle fill reads as glass/scrim neutral (pair of grey steps consistent with `surface/glass` family — bind exact tokens when implementing); glyph = midnight on default, white on inverse.
- **MISSING-IN-CODE:** no `Dismiss` export in `primitives.tsx`, no `tools/anatomy/dismiss.md`; `design.md` only references dismiss as a slot inside Snackbar/Alert/Modal. Action: create primitive + anatomy entry.

### Progress-bar — `26663:89882`
- V1.1 set renamed **`progress-bar-core`** 26437:43709 (was "progress-bar" era in anatomy): `Progress` = 5,10,…,100 (20 variants), all **300×4**.
- Exact spec (design-context on Progress=50, node 26437:43724): container h `scale/4` = **4px**, bar fill token **`color/text/positive/subtle` #54bc72** (green), anchored left, no track fill behind, no radius token surfaced.
- **Code drift:** `ProgressBar` renders 8px-tall PILL with `surface.sunken.default` track and default fill `status.accent` (**#e00800 red**) + `tone` prop (accent/positive/warning/danger). Height 2× spec and default color family entirely different (red vs green). The `tone` axis does not exist in Figma.
- Anatomy `progress-bar.md` is current (matches V1.1); the code is the drifted side.

### Add-trigger — `25752:11470`
- Set `add-trigger` **25973:25405**: `surface=default` 25752:11486, `surface=inverse` **28917:4269 (new in V1.1)** — both 285×72. Statesheet: "1 Default state on both surfaces"; "Both share identical anatomy… only color tokens differ".
- Exact V1.1 render (design-context on 25752:11486): container 285×**72**, bg **`color/surface/glass/midnight/sm`** rgba(25,19,41,0.07), radius **`border-radius/5` = 16px**, padding 20/16, **no dashed border**; contains a tertiary **button** (per VD comment) = plus-circle icon **24px** (red glyph) + label `typography/button/lg` Suisse Int'l SemiBold 16, color `button/tertiary/text/midnight/default` #191329. Label: single line, never wraps.
- **Internal Figma inconsistency:** the page's own spec bullets (nodes 26281:4656-4664) still read "Height: 52px / 1px inside dashed stroke / Icon 20px" — stale V1.0 statesheet text contradicting the shipped component. `add-trigger.md` anatomy copied those bullets → those specific lines are STALE-ANATOMY (dims line 285×72 and surface axis are correct).
- **Code drift:** `AddTrigger` = h40 hug-width pill (PILL radius) with transparent bg + dashed `border.default` + `text.brand` label + `button.md` type + "＋" glyph in `sm`(12px) icon. Wrong height, radius, background, border, label color/size, icon size; missing `surface=inverse`.

### Product-assets 🟡 (WIP — document only) — `28919:1442`
- Page canvas "↳ Product-assets 🟡"; single section literally named **"WIP" 29067:12921**.
- One real component set: **`Devices small cards` 28919:19889** — `Device` = xbox / Laptop / Speaker / Powerbank / iPhone / Dualsense / Tablet / Smart home / Mi TV; each 86.8×100.8; photoreal product image on light-grey radius card (screenshot verified).
- Loose/unstructured content: `Photo` frame 28919:19988 (180×166 product image + "Multi plus" 24×24 + archived all-purpose badge), two 224×224 `Logo` instances, raw screenshots/unsplash rectangles, empty `body` frame 28919:20079.
- No code export exists and none expected yet. Not in anatomy set. Re-audit when the 🟡 flag drops; likely feeds Product/Voucher card imagery.

### Atom-Surfaces — `26729:91998`
- V1.1 restructure: section renamed **"card-bg-color" 30420:25249**, hero titled "Card background color"; component set is the atom **`.card-bg-color` 25710:20065** with `color` = default 26522:14527 / red 25710:20060 / orange 25710:20063 / yellow 25710:20059 / green 25710:20058 / **cyan 25710:20064** / blue 25710:20061 / violet 25710:20062 — all **224×272** pastel swatches.
- **Code drift (two-fold):**
  1. `AtomSurface` models a different concept entirely — `level: canvas|base|raised|sunken` bound to `color.surface.*` elevation tokens. The Figma primitive is a card **background color** picker, not elevation. `design.md` §Atom Surfaces mixes both (lists canvas/base/raised/sunken states *and* the 8 `color.atom-surfaces` hexes).
  2. Token naming off-by-one: Figma axis has **cyan** and no purple; `tokens.color.atomSurfaces` has **purple** (#ebebfc) and no cyan. By hex, Figma `cyan` ≈ token `blue` (#ebf7fc) and Figma `blue` ≈ token `purple` (#ebebfc). Needs a rename pass (Style Dictionary source `variables.json` → "atom-surfaces" group, line ~7444).
- Anatomy `atom-surfaces.md` matches V1.1 exactly (8 colors, 224×272) — current.

---

## Cross-cutting actions
1. Icons package regeneration against page 31135:12366 is the largest gap (≈197 glyphs; 11 legacy code icons unmatched — hold for Figma's pending categories before deleting).
2. Two brand-new primitives to build: `Dismiss` (simple, spec complete) — Product-assets should wait (WIP).
3. Token fixes: `badge.surface.offers["limited stock"]` space bug; `atomSurfaces` cyan/blue/purple rename; progress fill token (`text.positive.subtle`).
4. Ask design to refresh the Add-trigger statesheet in Figma (H52/dashed/icon-20 bullets contradict the shipped 72px glass component) — then sync `add-trigger.md`.
5. Confirm intent for badge `status=brand` (in code+tokens, absent from Figma) before removal.

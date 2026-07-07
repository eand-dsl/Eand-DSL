# V1.1 Audit — 10 Extensions (coverage-sweep families)

- **Section:** 10-extensions
- **Audit date:** 2026-07-06 (stub) · sections completed 2026-07-07
- **Figma file:** `pzm63BTLfPfT1stcF89ILQ` — "e& Consumer App DSL V1.1" (published library)
- **Scope:** the NEW-UNAUDITED families flagged by `99-coverage.md` — Slider family · jump to · Footer family · Visual asset · Profile header - NEW · Offer/Promo/Text banners. DOCUMENT ONLY; no component code touched.
- **Code compared (conceptually):** `packages/react-design-system/src/components/navigation.tsx` (ActionBar, TopBar) · `cards.tsx` (Highlight, DealCard) — none of these families has a dedicated code export.

## Method & limits

- **Access:** published-library index via `search_design_system` (exact-name queries, restricted to library key `lk-63675edd…775a8a`). Search returns componentKeys + updatedAt only — **no node-ids**. MCP page enumeration re-verified broken this session (returns only `0:1 🖼 Cover`); no REST PAT available.
- **Node-level specs were possible only where node-ids were recoverable from earlier audit passes:** Bottom sheet parts (06-overlays: Footer `27907:20590`, Sticky footer `29415:15592`, Visual asset `29297:19665`) — all three resolved and were specced at node level this session. The Top bar page's Profile header - NEW set `15483:931` (03-navigation) **refused both design-context and screenshot** ("invalid node selection"; page 🟡), so that section reuses 03's node-verified capture. Families with no recoverable node-id (Sliders, jump to, banner sets) are documented from the published index + statesheet/timestamp signals and marked **canvas-unreachable**; their axis/dim claims need node-level confirmation when a PAT or node link becomes available.
- Figma MCP calls are rate-limited on this seat; specs below were pulled in a single constrained session. `updatedAt 2026-07-02` = bulk-republish timestamp; the `2026-04-28`/`2026-06-01` clusters = V1.0 import batch / June working batch respectively (see 99-coverage §Unaudited surface).

---

## 1. Slider family

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Slider | **2 duplicate sets**: key `576f6b4b…` (06-01) + key `f2707568…` (04-28) | ⚠ canvas-unreachable, dup | No node-ids recoverable; published-index only. 06-01 set = June working batch (current); 04-28 set = V1.0 import (stale duplicate) | — none (verified: zero `slider` hits in `packages/`, tokens, or `design.md` components) | — none (only a passing "Actions: Slider (opt.)" line in `tooltip.md`) | MISSING-IN-CODE | Future `DsSlider` in 02 Controls; spec from the 06-01 set once node access returns; deprecate the 04-28 key |
| interactive slider | **2 duplicate sets**: key `9d0fb258…` (06-01) + key `22bb5fe6…` (04-28) | ⚠ canvas-unreachable, dup | Same dup pattern — 06-01 current / 04-28 stale. Name signals the draggable (gesture) variant vs the display-only `Slider` | — none | — none | MISSING-IN-CODE | Audit with Slider; likely collapses into `DsSlider` as an `interactive` bool/state; dedupe 04-28 |
| Slider indicator | set, key `87e9f03e…` (06-01) | ⚠ canvas-unreachable | Published 41 s after `Slider` in the same 06-01 batch → value-indicator/bubble **atom** of the slider handle, not a standalone control | — none | — none | MISSING-IN-CODE (atom) | Cover inside the Slider audit; no export of its own |
| settings slider hor | set, key `939ef3f6…` (**07-02** republish) | ⚠ canvas-unreachable | Only family member carried into the 07-02 bulk republish → treated as current by design; name = horizontal settings-row slider (e.g. brightness/volume-style row) | — none | — none | MISSING-IN-CODE | Audit as the settings-row composition of DsSlider; confirm axes at node level |
| Data distribution slider | set, key `0695d66d…` (04-28 only) | ⚠ canvas-unreachable | V1.0 import batch, never touched since → product-specific (data-sharing between lines) and likely deprecable | — none | — none | MISSING-IN-CODE (probable deprecate) | Confirm-and-deprecate with design before speccing |

**Section verdict:** MISSING-IN-CODE ×5 (1 atom, 1 probable deprecate) — an entire control family with no code counterpart.

### Notes
- **Whole-family gap:** the react-design-system has no slider primitive at all — no export, no `slider` token group, no anatomy file. This is the largest single control gap after the icon package (01).
- **Access:** every member is search-index-only this session (componentKeys + timestamps above; `search_design_system` returns no node-ids, page enumeration broken). All axis/dim claims are inferred from names + publish batches and **need node-level confirmation** before `DsSlider` is specced.
- **Dedupe (2026-04-28 duplicates):** `Slider` and `interactive slider` each exist twice — one key from the 04-28 V1.0 import batch, one from the 06-01 June working batch. The 06-01 keys are the live ones; ask design to unpublish/deprecate keys `f2707568…` and `22bb5fe6…` so instances stop forking. `Data distribution slider` exists *only* as an 04-28 key — same era as other confirm-and-deprecate V1.0 leftovers (99-coverage).
- **Family shape (inferred, to verify):** display `Slider` (track + fill + handle) · `interactive slider` (gesture state set) · `Slider indicator` (value bubble atom above handle) · `settings slider hor` (labelled settings-row composition). A single `DsSlider` with `interactive` + indicator/label slots would cover the first three; settings-row is a composition, not a variant.
- Same-minute batch signal: a `🔄 Controls` statesheet component (key `2738a7af…`, 06-01 11:02) was published one minute after the slider sets — the slider states board almost certainly lives there; pull it first when node access returns.
- Cross-ref: `tooltip.md` (06-overlays) lists an optional Slider inside Tooltip actions — the future DsSlider must work on the midnight tooltip surface (inverse scheme), so expect a `color-scheme`/surface axis.

## 2. jump to

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| jump to | **2 duplicate sets**: `jump to` key `66cff22c…` (06-01) + `Jump to` key `2b6b1a9c…` (04-28) | ⚠ canvas-unreachable, dup | Index-only: jump-to-top/section utility button; same dup pattern as the Slider family (06-01 June working batch = current, 04-28 V1.0 import = stale). Pairs with icon set `align top, arrow` (key `f68abaa4…`, 07-02 — Arrows category of the new Icons page) as its glyph | — none (no code export expected; utility) | — none | MISSING-IN-CODE (low priority) | Fold into 03 Navigation on next touch; dedupe the 04-28 `Jump to`; spec at node level when access returns |

**Section verdict:** MISSING-IN-CODE ×1 (utility, deliberate non-export for now) + Figma dedupe ask.

### Notes
- Published twice with only a case difference (`jump to` / `Jump to`) — the 06-01 lowercase set follows the V1.1 naming convention (lowercase working sets, cf. `action-bar`, `highlight-banner`), so treat it as the live one; ask design to unpublish the 04-28 capitalized key.
- Both sets are search-index-only this session; no axes/dims/tokens verifiable. Expected anatomy (to confirm): floating circular/pill scrim button with the `align top, arrow` glyph, likely `surface` default/inverse like Dismiss (01).
- No code export and none scheduled — a scroll-utility like this belongs with 03 Navigation's floating elements (see also orphan `floating-buttons`, 99-coverage) rather than a standalone component now.

## 3. Footer family

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Footer | set `Footer` **27907:20590** (key `ca3fe086…`); variants `type=Default` 27923:10055 / `Stacked` 27907:20589 / `Horizontal` 27907:20591 / `Terms & Conditions` 27923:10495 / `Amount` **29415:16720 (new)** | | `type` ×5 + bools `context`/`secondary`/`tertiary`/`link`; 375w, shell radius 24/24/36/36, transparent bg, **no top divider**; Actions pt/px `xl` 20 gap `md` 12; primary h48 full-width brand pill `button/lg` SemiBold 16 white; secondary h48 2px `button/border/midnight` outline pill Bold 16; tertiary/link text buttons + 24 icon; `context` (Stacked/Horiz) = centered text block pt/px 20: `title/sm` SemiBold 16 + `body/md` 14 `text/default/subtle`; T&C = 24×24 red checkbox (`mark/on-light/active`, r8) + `body/md` 14 with underlined link; Amount = "Total amount" `body/lg` 16 + right price atoms `title/sm` SemiBold 16 ("200 AED /month"), pt `lg` 16; **Default = safe-area only** (no actions); all types end in `.iOS system bar` (144×5 pill `surface/canvas/midnight` #140f21, pt20 pb8) | `ActionBar` (navigation.tsx) — sticky bottom div: helper `body.sm` muted over `children` button row gap `md`, p `lg` 16, bg `surface.canvas.default`, **1px top border**; no types, no h48/full-width button spec, no T&C/Amount/price, no safe-area bar | — none (bottom-sheet.md lists Footer as a sheet part; axes/dims current incl. Type=Amount) | VISUAL-DRIFT + TOKEN-DRIFT + VARIANT-DRIFT | Rebuild the sticky-footer code against this family (see notes — this IS the ActionBar concept's V1.1 home); model `type` + 4 bools; drop the top border |
| Sticky footer | symbol `Sticky footer` **29415:15592** (key `1907d745…`), 375×101 | | Wrapper holding one Footer instance pinned sticky: bg `surface/canvas/default` #fff, top radius `border-radius/7` 24 (bottom square), **shadow 1px 0 44px rgba(25,19,41,0.15)** instead of a divider, overflow clip; content = Actions (primary h48 brand pill, pt/px 20) + `.iOS system bar` | same `ActionBar` — sticky ✓, canvas bg ✓; but 1px `border.solid.subtle` top border vs radius-24 + 44px shadow; no fixed 101h/safe-area | — none | VISUAL-DRIFT + TOKEN-DRIFT | Same rebuild: top radius 24 + midnight 15% blur-44 shadow, remove border |
| footer (atom) / .footer/Default (atom) | published `footer` component (key `5e33e366…`) + `.footer/Default` (key `dd7be840…`), both updated 07-02 | ⚠ canvas-unreachable | No node-ids recoverable via search (componentKeys only). Name pattern + publish batch put both in this family: `.footer/Default` = dot-prefixed core shell atom; lowercase `footer` = the inner footer frame reused by Sticky footer (its wrapped child frame is literally named "Footer") | — (atoms; no code export expected) | — | ATOM (unverified) | Cover inside the Footer audit when node access returns; no section of their own |

**Section verdict:** VISUAL-DRIFT + TOKEN-DRIFT + VARIANT-DRIFT (one code component, `ActionBar`, vs the whole family) — **not** MISSING-IN-CODE and **not** REMOVED.

### Notes — and the ActionBar question answered
- **KEY FINDING: the Footer family IS the V1.1 home of code `ActionBar`.** 03-navigation concluded code `ActionBar` (sticky bottom footer: helper text over a children button row) "models the V1.0 sticky action footer" and matches none of the V1.1 `action-bar` axes — leaving it Figma-homeless. It is not homeless: the concept was **relocated, not removed**. Figma V1.1 rebuilt the sticky action footer as the Bottom-sheet part set `Footer` (published standalone, key `ca3fe086…`) plus the screen-usable `Sticky footer` symbol. The mapping is 1:1 with design.md's stale ActionBar states line ("1-button · 2-button · with helper text"): 1-button = `type=Stacked` (primary only) / `type=Default`+Sticky wrapper, 2-button = `type=Horizontal` (secondary+primary flex-1 row) or Stacked with `secondary=true`, with-helper = `context=true` text block. **This downgrades 03-navigation's implicit REMOVED-IN-FIGMA to RELOCATED** — update that file's Action-bar row note on its next touch (its `bill action card` pointer stays valid as the *bill-specific* analogue; the *generic* home is this Footer family).
- Structure verified at node level (design-context on both nodes + set screenshot `footer-set.png`): five types stack vertically as [optional context/T&C/price block] → [Actions] → [iOS system bar]. `type=Default` renders **only** the system bar — a safe-area spacer for sheets whose content provides its own CTA.
- The set variants carry the full sheet corner set (24/24/36/36) because they demo in bottom-sheet context; `Sticky footer` is the floating page-level form (top-24 only + 44px midnight shadow) — that, not the set, is what a rebuilt code `ActionBar`/`DsFooter` should render.
- **Code drift detail** (`ActionBar`, navigation.tsx:125-140): top border `border.solid.subtle` has no Figma equivalent anywhere in the family (Figma separates via shadow); helper is `body.sm` muted left-aligned vs Figma's centered `title/sm`+`body/md subtle` block; padding `lg` 16 vs `xl` 20; children are free-form vs Figma's specified h48 full-width pill hierarchy; no T&C row, no Amount/price row, no safe-area bar, no radius.
- 06-overlays already audited this set as a Bottom-sheet part (page 🟡) — this section adds the standalone-family reading and the ActionBar linkage; specs agree.

## 4. Visual asset

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Visual asset | set `Visual asset` **29297:19665** (key `423db8eb…`, 07-02); variants Default 29297:19664 / Bg & Icon 29297:19666 / 3D icon 29297:20065 | (parent Bottom sheet page 🟡) | `type` = **Default** (image 367×206, radius `border-radius/6` 20, cover; wrapper 375w p `xs` 4) / **3D icon** (367×206 r20, bg `surface/canvas/brand` #e73933, centered 247px 3D render with 20.6px blur + drop shadow) / **Bg & Icon** (367×120 backdrop image with **12px blur** r20 + overlaid 64×64 `.image-asset` tile at 20/12; total 375×124) × **`gradient` bool (undocumented until now)** = top scrim `surface/canvas/midnight` #140f21 3.2%→transparent 61.4%, mix-blend **multiply**, full media size — legibility layer for floating headers over the media | — none; `BottomSheet` (overlays.tsx) has no visualAsset slot (flagged in 06) | `bottom-sheet.md` lists Visual asset as a sheet part (Default/3D icon/Bg & Icon + dims) — current, but **misses the `gradient` bool** | MISSING-IN-CODE (+ minor STALE-ANATOMY) | Media-slot primitive for the future BottomSheet slot expansion (06 action list); add `gradient` to `bottom-sheet.md`; primitive home = 01 |

**Section verdict:** MISSING-IN-CODE ×1 + STALE-ANATOMY 1 (minor — missing `gradient` bool).

### Notes
- Node-verified this session (design-context on 29297:19665 — one of only two extension families still canvas-reachable). Spec supersedes the summary line in 06-overlays: same three types and dims, **plus** the `gradient` boolean scrim no earlier pass recorded.
- **Anatomy per type:** wrapper is always 375w with `spacing/xs` 4 padding (media 367w inset). Default = plain photo slot. 3D icon = brand-red canvas with an oversized blurred 3D glyph (asset from the 3D-icon pool). Bg & Icon = short banner: the *same* image used as a 12px-blurred backdrop with a crisp 64×64 icon tile on top (`.image-asset` construction shared with Action bar / Quick Action, see 03).
- **Relation to Product-assets (01, WIP):** no instance dependency visible in the generated structure — Visual asset does not consume `Devices small cards` or other Product-assets components; it is the generic **media slot** those images would populate. Keep them as separate audit items: Product-assets = content library (still WIP), Visual asset = layout primitive (shipped).
- Code path: build as a small presentational primitive (01) consumed by BottomSheet's `visualAsset` slot when 06's slot expansion lands; the `gradient` bool matters for the sheet's floating-header pattern (`Header - iFrame` / `floatingHeader` slot).

## 5. Profile header - NEW

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Profile header - NEW | **2 duplicate published sets**, keys `79882cb2…` + `3327b323…` (both updated 07-02, 2 min apart); set node `15483:931` per 03-navigation — **node-unreachable this session** (design-context + screenshot both refused; Top bar page 🟡) | 🟡 dup | Node-verified in the 03-navigation pass: red brand account header — greeting **14 Regular** + masked number **14 Bold**, circle icon buttons **48×48** white-glass **10%**, **avatar + tier badge** slot, optional "Link" right-part, `quickAction` **carousel of 305×72** dark-glass cards (bg rgba(25,19,41,0.2), radius **20**, white pill CTA "Get" **h36**) | `TopBar variant="brand"` (navigation.tsx:20-48) — sticky red header `surface.base.brand`, bottom radius 20, faux status bar, greeting `body.sm` **12**, title `title.md` **20** + ⌄, `CircleBtn` **40×40 @ rgba(255,255,255,0.18)**, `actionBar` = **single** card rgba(0,0,0,0.18) radius **14** + padded white pill CTA; **no avatar/tier/Link** | `top-bar.md` — brand-header bullets current per 03 | VARIANT-DRIFT + VISUAL-DRIFT + TOKEN-DRIFT (+ duplicate sets in Figma) | Treat as the brand-TopBar successor (see notes); fix 48/10%, 14-Bold number, carousel action cards r20/h36; add avatar/tier/Link; ask design to merge the 2 sets + drop "- NEW" |

**Section verdict:** VARIANT-DRIFT + VISUAL-DRIFT + TOKEN-DRIFT — successor located, code drifts on every metric class.

### Notes
- **KEY FINDING: `Profile header - NEW` is the V1.1 home/successor of code `TopBar variant="brand"`** (the red account header). 03-navigation already drew the conceptual line ("brand ≈ Profile header - NEW: greeting/title/actions/actionBar"); this section confirms the family is **live and published current** (2 sets, both in the 07-02 republish) — the brand TopBar is neither orphaned nor removed, just drifted.
- **Duplicate sets:** two distinct published `component_set`s share the exact name (keys `79882cb2dbd2113d9f6687adece8ff2162624ae2` / `3327b3231ea30ca51c47b12173638807231d1a1c`). The "- NEW" suffix plus the pair reads as unconsolidated iteration — instances in consuming files may be split across both. Design action: merge, deprecate one key, rename without suffix. Until merged, code should target the spec below (identical per 03's pass, which found one coherent set at `15483:931`).
- **Access status:** both `get_design_context` and `get_screenshot` on `15483:931` return "invalid node selection" this session (Top bar page is 🟡 and MCP page enumeration is broken), so the axis list of each duplicate could not be re-diffed; spec lines above are the 03-navigation node-verified capture (2026-07-04 pass). Re-diff the two sets when node access returns.
- **Code drift recap** (vs node-verified spec): circle buttons 40×40 @ 18% white should be **48×48 @ 10%**; masked number `title.md` 20 should be **14 Bold**; greeting `body.sm` 12 should be **14 Regular**; `actionBar` prop renders one full-width rgba(0,0,0,.18) r14 card — Figma is a **carousel of 305×72 glass-midnight r20 cards** each with an h36 white pill button; missing slots: avatar with tier badge, "Link" right-part.
- Probable family atom: published `Header top part` component (key `20f290b7…`, 07-02) — name + batch place it as this header's top row; canvas-unreachable, verify on next touch.
- **Relation to Master menu:** 03-navigation treats `Master menu component` 29547:11510 as the *final* Top-bar composition (Large title / Bottom element axes). Profile header - NEW is the *account-page* header sibling, not a Master-menu variant; keep them separate rows when 03 is refreshed.

## 6. Offer Banner / Promo banner / Text banner

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Offer Banner | set, key `d05a8a1d…` (07-02 09:55:40) | ⚠ canvas-unreachable | Index-only: promotional offer banner set, carried current in the 07-02 republish (same page-cluster second range as the Footer/quick-task assets) | — none (`Highlight` in cards.tsx is the only banner export and maps to `highlight-banner`, audited in 08) | — none (`highlight.md` covers Highlight only) | MISSING-IN-CODE | Prime candidate for the 08-extension audit; spec at node level when access returns |
| Promo banner | **2 duplicate sets**, keys `0103928c…` (07-02 09:50:49) + `eb1443e8…` (07-02 09:52:41) | ⚠ canvas-unreachable, dup | Two distinct keys sharing one name; republish seconds put them on **different pages** (09:50:49 clusters with "Mshop banners"/"Banner 1"; 09:52:41 with the second "Banners Carousel") — parallel iterations, not one set republished twice. 04-28 sibling `Simple promo banner` (key `ff0b861e…`, desc "Promo banner postpaid - Upgrade") shows the family's V1.0 origin | — none | — none | MISSING-IN-CODE (+ dup in Figma) | Design must merge the two sets before code work; then audit under 08 |
| Text banner | set, key `7e2b26f7…` (07-02 09:51:13) | ⚠ canvas-unreachable | Index-only: text-led (media-free) banner set, current per 07-02 republish; republish second sits in the same page-cluster as Promo #1 | — none | — none | MISSING-IN-CODE | Audit under 08 with the other two; likely the media-free tier of one banner family |

**Section verdict:** MISSING-IN-CODE ×3 (one with duplicate sets in Figma).

### Notes
- **Access:** all three are search-index-only (no recoverable node-ids; queries via exact-name search against the library key). Axis/dim/token claims deliberately omitted — nothing beyond names, types, keys and timestamps is verifiable this session.
- **Relation to code `Highlight` (cards.tsx) and 08-banners:** 08 established that the audited `highlight-banner` set is **photo-media only** in V1.1, and flagged code Highlight's `tone` brand/purple + bare-`cta` state as REMOVED-IN-FIGMA "pending design confirm". These three sets are the obvious place that promotional/text-led banner duty moved to. **Hypothesis (needs node confirmation): Offer/Promo/Text banner supersede Highlight's V1.0 brand/purple/CTA tones as separate components.** If confirmed, 08's REMOVED verdict for the tones softens to relocated-to-new-components — check before deleting `tone`/`background`/`cta` from Highlight (08 cross-cutting action 4).
- **Family layering (from 99-coverage + this sweep):** current 07-02 layer = Offer Banner · Promo banner ×2 · Text banner · Switch to e& banner (component) · Banner 1 (scratch auto-name) · Mshop banners; stale 04-28 layer = Simple promo banner · Whats new banner · Gifts Included Banner · Info Banner · Notification banner · Mshop banner (small). The 04-28 layer follows 99-coverage's confirm-and-deprecate track; only the 07-02 sets belong in the 08-extension audit.
- **Dedupe ask for design:** merge the two `Promo banner` sets (keys above) and rename/unpublish `Banner 1`; without this, an 08-extension audit would document two forks of the same component.

---

## Verdict tally (6 families)

**OK 0 · MISSING-IN-CODE 10 · VISUAL-DRIFT 2 · TOKEN-DRIFT 2 · VARIANT-DRIFT 2 · STALE-ANATOMY 1 (minor) · REMOVED-IN-FIGMA 0.**

- MISSING-IN-CODE ×10: Slider · interactive slider · Slider indicator (atom) · settings slider hor · Data distribution slider (probable deprecate) · jump to · Visual asset · Offer Banner · Promo banner · Text banner.
- VISUAL + TOKEN + VARIANT-DRIFT ×2 (each): Footer family vs code `ActionBar` · Profile header - NEW vs code `TopBar variant="brand"`.
- STALE-ANATOMY ×1 minor: `bottom-sheet.md` misses Visual asset's `gradient` bool.
- **Two prior REMOVED readings downgraded by this sweep:** (1) code `ActionBar`'s sticky-footer concept was **relocated** into the Footer family (§3), not removed — amend 03-navigation's Action-bar note on next touch; (2) Highlight's brand/purple/CTA tones may have relocated into the Offer/Promo/Text banner sets (§6, hypothesis pending node access) — hold 08's deletion action until checked.
- **Figma-side dedupe asks (5 duplicate pairs):** Slider (04-28 key) · interactive slider (04-28 key) · Jump to (04-28 key) · Promo banner (two 07-02 keys on different pages) · Profile header - NEW (two 07-02 keys). Plus rename/unpublish `Banner 1`.

## Recommended section homes

| Family | Home section | Cross-refs |
|---|---|---|
| Slider · interactive slider · Slider indicator · settings slider hor (Data distribution → confirm-and-deprecate) | **02 Controls** | Tooltip actions slot (06) |
| jump to | **03 Navigation** (floating utilities, with `floating-buttons`) | Icons "align top, arrow" (01) |
| Footer · Sticky footer · footer / .footer atoms | **04 Layout** | 06 Overlays (Bottom-sheet part) · 03 Navigation (`ActionBar` successor) |
| Visual asset | **01 Primitives** (media-slot primitive) | 06 Overlays (BottomSheet `visualAsset` slot) · Product-assets (01, WIP content library) |
| Profile header - NEW (+ Header top part atom) | **03 Navigation** (Top bar family) | code `TopBar variant="brand"` |
| Offer Banner · Promo banner · Text banner | **08 Banners** (extension, after Promo dedupe) | code `Highlight` tone-removal question (08 action 4) |

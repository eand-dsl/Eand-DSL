# e& Consumer App DSL V1.1 — Drift Audit (assembled)

> Figma: `e& Consumer App DSL V1.1` (fileKey `pzm63BTLfPfT1stcF89ILQ`, published library, last observed edit **2026-07-02**).
> Audited **2026-07-02 → 2026-07-06** against `@eand/react-design-system` (`packages/react-design-system`), `tools/anatomy/*.md`, `design.md`.
> Predecessor: the V1.0 audit (`AUDIT.md`), deleted once fully superseded — recoverable
> from git history at commit `7d324c0` if the historical record is ever needed.
> Section detail lives in [`tools/audit/v1.1/`](./tools/audit/v1.1/) — this file is the roll-up + decision sheet.

**Verdicts:** OK · TOKEN-DRIFT · VARIANT-DRIFT · VISUAL-DRIFT · MISSING-IN-CODE · REMOVED-IN-FIGMA · STALE-ANATOMY (entries carry multiple).

## Roll-up by section

| Section | File | Entries | OK | VAR | VIS | TOK | MISS | REM | STALE | Headline |
|---|---|---|---|---|---|---|---|---|---|---|
| 00 Foundations | [00-foundations.md](tools/audit/v1.1/00-foundations.md) | 4 | 3 | — | — | 1 | — | — | — | variables.json **CONFIRMED STALE** (see below); Grid/Type/Spacing in sync |
| 01 Primitives | [01-primitives.md](tools/audit/v1.1/01-primitives.md) | 9 | 1 | 5 | 3 | 4 | 3 | 1 | 2 | Icons page: 209 glyph sets vs 23 static exports; Logo is a text placeholder |
| 02 Controls | [02-controls.md](tools/audit/v1.1/02-controls.md) | 11 | 1 | 7 | 2 | 0 | 2 | 1 | 4 | Selectors REMOVED (renamed→Pickers, redesigned); Input Filled/Outlined axis dead |
| 03 Navigation | [03-navigation.md](tools/audit/v1.1/03-navigation.md) | 7 | 1 | 5 | 5 | 3 | 2 | 1 | 3 | Action bar concept pivot: sticky footer (code) vs inline row (Figma); List Row UNVERIFIED (page unreachable) |
| 04 Layout | [04-layout.md](tools/audit/v1.1/04-layout.md) | 2 | 0 | 2 | 2 | 1 | 0 | 1 | 2 | Accordion page still on **V1.0 tokens** (🔴) — do not build against |
| 05 Feedback | [05-feedback.md](tools/audit/v1.1/05-feedback.md) | 3 | 0 | 3 | 1 | 3 | 3 | 1 | 3 | PlanUsageBar pivoted to filled block bar; AlertModal orphaned (Figma → full-screen Status screens) |
| 06 Overlays | [06-overlays.md](tools/audit/v1.1/06-overlays.md) | 2 | 0 | 2 | 0 | 2 | 1 | 0 | 2 | Both pages 🟡; Tooltip Rich/Standard types missing in code |
| 07 Cards | [07-cards.md](tools/audit/v1.1/07-cards.md) | 7 | 0 | 6 | 5 | 5 | 0 | 0 | 2 | Zero OK across all cards; Service worst (r20/h148/no-border/12 badge statuses); Recommendation TBD both sides |
| 08 Banners | [08-banners.md](tools/audit/v1.1/08-banners.md) | 1 | 0 | 1 | 1 | 1 | 0 | 1 | 1 | Highlight: Figma dropped brand/purple tones + bare-CTA (confirm w/ design) |
| 09 Product-specific | [09-product-specific.md](tools/audit/v1.1/09-product-specific.md) | 2 | 0 | 2 | 2 | 2 | 0 | 0 | 0 | SmilesBalance + Voucher both need **full rebuilds** (V1.0-shaped code) |
| 99 Coverage sweep | [99-coverage.md](tools/audit/v1.1/99-coverage.md) | 163 assets | — | — | — | — | — | — | — | 107 mapped / 56 orphans; NEW-UNAUDITED families below |
| 10 Extensions | [10-extensions.md](tools/audit/v1.1/10-extensions.md) | 6 families | 0 | 2 | 2 | 2 | 10 | 0 | 1 | **ActionBar RELOCATED to Footer family** (not removed); **Profile header - NEW = live TopBar brand successor**; Slider family fully specced for future DsSlider |

**Component totals (01–09, 44 entries):** OK **3** · VARIANT-DRIFT **33** · VISUAL-DRIFT **21** · TOKEN-DRIFT **21** · MISSING-IN-CODE **11** · REMOVED-IN-FIGMA **6** · STALE-ANATOMY **19** · UNVERIFIED **1**.

## P0 — token pipeline (blocks Phase B)

`variables.json` (exported ~2026-06-21) **predates the 2026-07-02 Figma edit**. Proof: the new `color/alert-message/*` family (05-feedback) has zero hits in the export; Colors spot-check found ~32 drifted tokens. **USER ACTION: re-export Variables from the Figma UI → replace repo-root `variables.json` → `npm run build:tokens` → review diff.** Until then, all token-level fixes are provisional.

## P1 — drift fixes on existing components (Phase B, proceed on approval)

Rebuilds (V1.1 shape differs fundamentally): **SmilesBalance · Voucher · PlanUsageBar · AddTrigger · Logo** (real lockup SVGs, 4 versions) · **ActionBar** — CORRECTED by 10-extensions: the sticky-footer model was RELOCATED to Figma's `Footer`/`Sticky footer` sets (27907:20590 / 29415:15592), not removed; align code to them (shadow not top-border, padding 20, type variants, safe-area) AND separately consider the new inline `action-bar` row from 03 as its own component. **TopBar brand variant** similarly maps to `Profile header - NEW` (drifted: 48px@10% circle buttons, 14-Bold number, action-card carousel) — two duplicate Figma sets need a design merge first.
Variant/size fixes: Button (tertiary/link + 4 surfaces + focus) · Badge (disabled, neutral-inverse, tiers; drop `brand`) · Checkbox (20/16px sizes, radio-mode, inverse) · Radio (sm, inverse) · Switcher (**needs designer ruling**: published symbols 40×24/32×20 vs page docs 56×24/48×20 — code matches docs) · Chip (inverse, loader) · FilterPill (inverse, disabled) · Tabs/SectionLink/QuickAction/TopBar per 03 · Section/Accordion per 04 (Accordion blocked on 🔴) · Snackbar (subtitle, tone-matched action) · Alert (new alert-message token family once re-exported) · Tooltip/BottomSheet per 06 (pages 🟡) · all cards per 07 · Highlight per 08 · ProgressBar (h4, green default) · Input (drop Filled/Outlined, type axis) · Searchbar (midnight, clear-x, submit arrow).

## P2 — new builds (scope-gated 🟣, need explicit approval)

Icons bulk (~197 glyphs + variant axes) · Dismiss primitive · Suggestion Chips · **Picker** (replaces Selectors; segmented `Selectors` code has no V1.1 home) · Bill action card · Tooltip Rich/Standard · Status screens (AlertModal successor) · badge tier variants · AISearch voice states (Dictation/Transcribing) · logo-row merge (LogoRow+SmilesRow).

## NEW-UNAUDITED surface (from 99 sweep — not in any section above)

**Audit next:** Slider control family (Slider, interactive slider, indicator → fold into 02) · jump-to (→03) · Footer family (Footer, Sticky footer → 04) · Visual asset (→01) · Profile header - NEW (→03, awaiting design merge of duplicate sets) · Offer/Promo/Text banner sets (→08 extension).
**Out of DSL-core scope:** Mshop banners. **Confirm-and-deprecate:** Info/Notification banner (likely superseded by 05 Alert/Snackbar). **Scratch:** "Banner 1", "Component 3" (accidental publishes).

## Deprecations pending design confirm

Highlight brand/purple tones + bare-CTA · badge `brand` status · Alert red/danger tone (new family has none) · code AlertModal (centered dialog) · segmented Selectors · Section `brand-muted` surface.

## Re-audit when flags drop

🟡/🔵/WIP pages: Top bar (Master menu) · Input Field · Searchbar/AI Search · Deals for you · Service · Tooltip · Bottom sheet · Product-assets · Snackbar-new section · Smiles Balance (🟣 page flag). 🔴: Accordion (still V1.0 tokens).

## Access limitations & churn note

- MCP page enumeration returns only the Cover page for this file; the REST PAT in `~/.figma_token` is expired. Coverage therefore relies on the published-library index (99-coverage), which misses unpublished/canvas-only content — e.g. the List-item trio was found by search but its page is unreachable. **USER ACTION (optional but recommended): mint a fresh read-only Figma PAT → full page-tree verification + List Row spec diff.**
- Churn guard: all observed `updatedAt` stamps ≤ 2026-07-02; no newer edits surfaced during the 07-03→07-06 audit passes. Low churn risk, but re-verify 01/02 sections after PAT renewal.

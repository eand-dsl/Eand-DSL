
# Open questions for design — V1.1 reconciliation

Drift items from `AUDIT-V1.1.md` that **cannot be fixed in code without a ruling**. Each
one has two defensible answers, so guessing would bake a coin-flip into the library and
into the Figma Make kit. The code is stated as-is for each, so nothing is blocked on
reading the audit first.

Raised 2026-08-05. File: `e& Consumer App DSL V1.1` (`pzm63BTLfPfT1stcF89ILQ`).

---

## 1. Switcher — which size is correct?

**The published component and its own documentation page disagree.**

| Source | Track | Thumb |
| --- | --- | --- |
| Published symbols | 40×24 (md), 32×20 (sm) | — |
| Documentation page | 56×24 (md), 48×20 (sm) | — |
| **Code today** | follows the **documentation page** | |

The `size` collection has `switcher/track/width/md` = 40 and `switcher/track/height/md` = 24,
which agrees with the published symbol, not the page. So the tokens and the doc page also
disagree with each other.

**Need:** which is canonical? If the published symbol wins, the doc page and the code both
change. Source: 02-controls.

---

## 2. Highlight — were the brand/purple tones and the bare CTA dropped deliberately?

V1.1 no longer shows the brand tone, the purple tone, or the bare-CTA (no-button) layout
that the code still ships. Removal from the file is not by itself proof of deprecation —
it can equally mean the variants moved to a page that was not published.

**Code today:** still exposes brand + purple tones and the bare-CTA arrangement.

**Need:** deprecate and remove, or restore in Figma? Source: 08-banners.

---

## 3. TopBar brand — two Figma sets describe the same header

`Profile header - NEW` (10-extensions) reads as the successor to the brand `TopBar`, but
both sets exist and they differ: 48px action buttons at 10% opacity, a 14-Bold phone
number, and an action-card carousel in the bottom slot.

**Code today:** the older brand `TopBar` shape.

**Need:** a merge in Figma first — which set is canonical, and does the other get deleted?
Code can follow once there is one answer. Source: 03-navigation, 10-extensions.

---

## 4. Accordion — the Figma page is still on V1.0 tokens

`04-layout` marks the Accordion page 🔴: it references V1.0 token names that no longer
exist. Any code change made against it would encode dead values.

**Code today:** unchanged, correct against V1.0.

**Need:** the page re-tokenised to V1.1, then a re-audit. Nothing to decide — just
sequencing. Source: 04-layout.

---

## 5. Six deprecations pending confirmation

Each is present in code and absent from V1.1. Same caveat as #2 — absence is not proof.

| # | Item | Code today |
| --- | --- | --- |
| 5a | `Highlight` brand/purple tones + bare CTA | shipped (see #2) |
| 5b | `Badge` `status="brand"` | shipped |
| 5c | `Alert` red/danger tone | shipped — the new `color/alert-message/*` family has **no** danger entry, only success/alert/warning/info |
| 5d | `AlertModal` (centred dialog) | shipped — Figma moved to full-screen Status screens |
| 5e | Segmented `Selectors` | shipped — renamed to `Pickers` and redesigned; the segmented control has no V1.1 home |
| 5f | `Section` `surface="brand-muted"` | shipped |

**Need:** for each, *deprecate* (remove from code + guidelines) or *restore* (add back to
Figma). 5c is the most load-bearing: if danger is genuinely gone, `Alert`'s tone axis
shrinks and the Make-kit guidelines change with it.

---

## 6. Snackbar status marks are built from deprecated colour *styles*

`SNACK_MARK` in `src/components/feedback.tsx` carries three hardcoded values, commented as
coming from `Component/IconBox/{Positive,Negative,Warning}` — Figma colour **styles**, not
variables. `AUDIT.md` §2 records that the legacy colour styles are deprecated and that the
library should build from the `tokens`/`primitives` variable collections instead.

Two of the three match no variable in the refreshed 944-token export:

| Mark | Hardcoded | Nearest variable |
| --- | --- | --- |
| positive | `#47cb6c` | **no match** — `status/positive` is `green/700` `#3b8b53` |
| danger | `#d05d0a` | **no match** — `status/danger` is `orange/700` `#b85a1a` |
| warning | `#d5b549` | matches `yellow/600` (= `status/warning` is `yellow/700`, so still not exact) |

**Need:** what should the Snackbar mark bind to — `color/status/*`, the new
`color/alert-message/*` family, or something on the WIP "Snackbar-new" page? The audit
already flags that page 🟡 for re-audit, so this is likely blocked on it landing.

Not guessed at: picking a nearest-match variable would silently change three shipped
colours on the strength of a hunch.

## 7. SmilesAvatar purple is outside the token system

`primitives.tsx` defaults `SmilesAvatar` to `bg = '#6C3FD6'`, which matches no variable in
the export. Smiles is a partner brand, so a colour outside the e& DSL may well be correct —
but it is currently un-tokenised and undocumented.

**Need:** confirm whether Smiles brand colours belong in the DSL (as a `special/*` group,
alongside gold/silver/bronze) or stay app-level.

## 8. `SectionLink` — the name refers to two different things

Figma's published `section-link` (**25440:14243**, 9 symbols) is an **icon-only 40×40 link
button** that sits top-right of a Section header. Our exported `SectionLink` is a
**full-width header row** (title + "See all" + chevron) — the composed pattern, not the
published component.

The icon button already exists in code as `TriggerChevron` inside `Section` (40×40,
radius/4, glass on dark). It just is not exported, and the name is taken.

Two things are needed, and both are yours:

1. **Naming.** Keep the composed row as `SectionLink` and export the icon button under a
   different name, or rename the row and give `SectionLink` to the icon button? The latter
   is a breaking change for anyone importing it.
2. **A size ruling.** The statesheet says Lg 48 / Md 36 / Sm 32, but every published symbol
   and the `section-link/lg` variable say **40**. The audit flags this as needing a
   designer call.

Also unbuilt: the NEW `Top-bar link` atom (**31511:33083**, 40×40 circle, glass 15% /
white focus / 10% disabled, chevron-left). `TopBar`'s internal `CircleBtn` approximates it
at 18% but has no focus or disabled state and is not exported.

## 9. Voucher — what happens to `redeemed` and `expired`?

**Built** (2026-08-06): the 144×144 ticket tile, notches and perforation are done — the
exported shape path punches the holes, so it needs no ruling. Logo and the Footer
alignment are done too; only this one question is left from that group.

Figma's axes are `Display` (Light/Dark) × `State` (Default/Applied). The code's V1.0
`status` had three values:

| `status` | Mapped to | Confidence |
| --- | --- | --- |
| `active` | `state="default"` | unambiguous |
| `redeemed` | `state="applied"` | unambiguous |
| `expired` | `state="applied"` + 60% opacity | **invented** — no V1.1 equivalent |

**Need:** is an expired voucher a real state? If so it needs a Figma variant. If not, the
prop value should be removed rather than left dimming a tile on a convention nobody agreed.

## 9b. ActionBar — one code component, two Figma things

`CtaFooter` is now aligned to Figma's `Footer` (29415:15497): shadow instead of a top
border, rounded top by default, 20px padding, safe-area indicator. That covers the
sticky-footer model the audit says was *relocated*, not deleted.

Still open: 03-navigation describes a **separate new inline `action-bar` row**, and code's
`ActionBar` (the 72px promo row) is a third thing again. Nobody has said whether the inline
row is a new component, a variant of the promo row, or a rename.

**Need:** confirm what the inline `action-bar` is, before anything is built for it.

## Also worth a design decision, found while reconciling tokens

**`color/green/550` is a deleted variable that is still bound.** `.plan-usage-bar`'s fill
(`28927:23669`) points at it; it resolves by ID but its collection no longer lists it.
Live `color/green/600` is the identical colour (`#54bc72`). Re-pointing the binding in
Figma would clear it. Code already uses `green.600` and is unaffected.

## 10. NavBar — a wireframe wants a detached Shop button that Figma has deleted

The Account-screen UX wireframe (`Design App Interface/src/imports/ux.png`) draws the
bottom nav as **three tabs in the glass pill (Home · Profile · Support) plus Shop as a
separate dark rounded square to the right of the pill.** The published design system says
something different on both counts:

- `navbar` **29317:6983** is a single pill of **4 equal tabs, ordered Home · Support ·
  Profile · Shop**. There is no detached element.
- `.navbar-tab-state` **26593:20631** now publishes only a `selected = true|false` axis.
  The `special` axis is **gone** — 03-navigation recorded it as "published only as *no*"
  and it has since been removed outright, along with the `focus-special` tokens.

Code followed Figma: `NavItem.special` existed but was never read by `NavBar`'s render, so
passing it did nothing. It has now been removed, and `MAKE_KIT_GUIDELINES.md` no longer
claims a "detached glass circle left of the pill" for mShop — that sentence described
behaviour no published symbol has ever had.

**Need:** a ruling on whether the detached Shop/mShop button is a real V1.2 direction or
just wireframe shorthand. If it is real, it needs a published variant axis and tokens
before code can carry it; if it is not, the wireframes should be corrected to the 4-tab
pill so screens generated from them stop diverging. Also confirm the tab **order** —
wireframes are using Home · Profile · Support · Shop against the symbol's Home · Support ·
Profile · Shop.

Stale leftover to clear either way: `tokens.ts` still carries
`color.navbar-tab.*.focusSpecial` (#e00800 / #ffffff) for an axis Figma no longer
publishes. It is a generated file, so this clears on the next `tokens:pull` once Figma is
settled.

> **Update (V1.2 token sync):** the `focusSpecial` leftover above has cleared — V1.2 no
> longer exports it, and `tokens.ts` was regenerated from the live file.

## 11. PageHeader — the two states use different corner radii

`page-header` **37390:28734**. The `State=default` variant draws its card with the
`,page-header-surface-default` layer at **`border-radius/7` (20px)**; `State=Inverse` draws
`,page-header-surface-inverse` at **`border-radius/8` (24px)**. The outer frame is /8 in
both, but it clips, so the default card shows 20px corners. Nothing in the description
says the two states should differ.

Code follows the symbols: 20px default, 24px inverse.

**Need:** confirm whether the 4px difference is intended, or which radius both should use.

## 12. PageHeader — the selected tab on the light card is white, not tinted

The page-header description says the tab pills "automatically use `inverse=false` tokens on
the default state", and `tab-pill`'s own description says a selected pill "fills with a
light red tint". But in `State=default`, the selected pill is bound to
**`tab/inverse/surface/selected` (#ffffff)** with `tab/inverse/text/selected` (#e00800), on
a white card. So it reads as red text with no visible pill. The unselected pills bind
`tab/default/surface/default` (also white). On `State=Inverse` the unselected labels bind
`button/primary/text/brand/default` — the same white as `tab/inverse/text/default`, which
code uses instead.

Code follows the symbol: white selected pill on both states.

**Need:** confirm the default-state selected pill. If it should be the tint, the binding is
`tab/default/surface/selected` (#fce6e6) with `tab/default/text/selected` (#e00800).

## 13. PageTitle — titles are a step smaller than the text styles they name

`page-title` **40283:145186**. Each variant applies a `heading/<size>` text style, then
binds the font size directly to a smaller step: lg uses `heading/lg` with `font/size/7`
(24px, where the style is 28px); md uses `font/size/6` (20px vs 24px); sm uses
`font/size/5` (18px vs 20px). xs keeps `heading/xs` (16px). Line height is overridden on the
symbol to **110%** (120% at xs), which no `font/line-height/*` token holds, against 120–135%
on the styles.

Code follows the bound sizes and the symbol's 110%, written as a literal with a comment
because no token carries it.

**Need:** either a `page-title/*` typography token set (or a 110 line-height token), or a
ruling that page-title should use the plain `heading/*` styles.

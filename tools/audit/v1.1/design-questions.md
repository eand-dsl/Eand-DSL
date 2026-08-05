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

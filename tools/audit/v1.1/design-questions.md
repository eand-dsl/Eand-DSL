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

## Also worth a design decision, found while reconciling tokens

**`color/green/550` is a deleted variable that is still bound.** `.plan-usage-bar`'s fill
(`28927:23669`) points at it; it resolves by ID but its collection no longer lists it.
Live `color/green/600` is the identical colour (`#54bc72`). Re-pointing the binding in
Figma would clear it. Code already uses `green.600` and is unaffected.

# Open questions for design: V1.1 and V1.2 reconciliation

> **Refreshed 2026-10-14** against Figma **e& Consumer App DSL V1.2** (`pzm63BTLfPfT1stcF89ILQ`)
> and branch `feat/page-header-title` at `40e3443`.
>
> **What V1.2 is.** It is the same library file after the July–October 2026 design passes.
> Tokens were re-synced from 944 to 976 variables (`b5da7f0`). Button, link and border states
> were renamed from `focus` to `pressed`, and chip, tab and mark states to `selected`. The radius
> scale gained a 6px step at `border-radius/2`. The heading text styles were retuned (see #14).
> Most component pages were rebuilt (V1.2 node ids are 25xxx–42xxx). Every component file was
> then reconciled against the published symbols and their bound variables, using six read-only
> audits (G1–G6) and eight implementation passes.
>
> **Order of authority** when Figma disagrees with itself: **published symbol + bound variable >
> statesheet prose > anatomy `.md` > audit table.** Every "code today" line below follows that
> order. An item is here only when that order cannot settle it: two published things disagree,
> the value has no token (CLAUDE.md rule 8), or the question is about intent, not geometry.
>
> **Statuses.** RESOLVED: closed by Figma evidence or a commit (cited). CHANGED: the question
> moved, and part or all of it is still live. STILL OPEN: unchanged. NEW: raised by the V1.2
> pass. Items 1–14 keep their original V1.1 text as history, with a dated status note on top.
> Pure naming and typo problems are not questions. They are listed under
> [Figma hygiene](#figma-hygiene-no-ruling-needed) at the end.

## Index

| # | Area · component | Question | Status | Blocks |
| --- | --- | --- | --- | --- |
| 14 | Foundations · typography | Heading text styles vs `typography/heading/*` variables: which wins? | STILL OPEN (widened) | Every heading: Section, TopBar, PageHeader, PageTitle, cards, AlertModal, BottomSheet. Also `ty()` and the Make guidelines |
| 15 | Foundations · colour | Legacy and remote variables still bound in V1.2 symbols, several with no V1.2 token | NEW | ProductCard, DealCard, NewCard, SmilesBalance, Tooltip. Also the card-info, Device, product-card and Tariff builds |
| 16 | Foundations · gradients | Unbound gradients: tokenise them or approve the literals? | NEW | Badge `tier` and the plan-usage card (both unbuilt). Section, Snackbar and NavBar already ship literals |
| 17 | Foundations · glass | What is the CSS translation of the GLASS effect, and which glass surfaces blur? | NEW | Every glass surface |
| 18 | Foundations · sizes | Off-scale and unbound sizes: add tokens or accept the literals? | NEW | TopBar, Picker, carousels, ActionBar stack, UAE PASS, CTA bar |
| 19 | Foundations · assets | Should flags, 3D icons, Brands logos and visual assets ship in the package? | NEW (absorbs #7) | LogoRow artwork, SmilesAvatar replacement, StatusBanner, SmilesBalance medals, TopBar avatar |
| 20 | Foundations · motion | The "in-motion" frames have no readable spec | NEW | All card press and entry motion, Picker motion |
| 21 | Foundations · focus | No published keyboard-focus treatment | NEW | Accessibility sign-off for every control |
| 22 | Foundations · defaults | Code defaults that differ from Figma's default variant: confirm them | NEW | Switcher, LogoRow, Recommendation, OtpInput, Picker, Chip |
| 23 | Foundations · status | Pages not final, or still on legacy collections: what gets built, and when? | NEW (includes #4) | Accordion, Searchbar, AISearch, color-spot, Filter-local, Picker v2, card-info, card-list, gallery, media-switcher, Device, product-card, Tariff |
| 5b | Primitives · Badge | Deprecate `status="brand"`? | STILL OPEN | Badge API and guidelines |
| 7 | Primitives · SmilesAvatar | Smiles purple `#6C3FD6` is outside the tokens | CHANGED → #19 | — |
| 24 | Primitives · Badge | `lg/neutral` binds 56/6 where every other lg binds 64/8 | NEW | Badge lg |
| 25 | Primitives · Badge | Which way does the RTL chevron point? | NEW | Badge `chevron` in RTL |
| 26 | Primitives · StatusIndicator | The glass-dark neutral dot is midnight on dark | NEW | StatusIndicator glass-dark |
| 27 | Primitives · LogoRow | `more-items` is always the white variant, even on light surfaces | NEW | LogoRow `more` on light |
| 28 | Primitives · surfaces | Three surface-atom copies disagree; is `.card-bg-color` square? | NEW | AtomSurface, Recommendation, ProductCard tint |
| 29 | Button | Secondary `scheme` bindings are crossed | NEW | Secondary on inverse and midnight |
| 30 | Button | Four per-variant slips and one contrast problem | NEW | Link, tertiary, md padding |
| 31 | Button · UAE PASS | The Arabic label is outlined vectors | NEW | UaePassButton `rtl` |
| 1 | Controls · Switcher | Which size is correct? | RESOLVED | — |
| 32 | Controls · Radio | Inverse binds the default mark family and four deleted variables | NEW | Radio on dark |
| 33 | Controls · Switcher | Inverse off: the md and sm symbols disagree | NEW | Switcher inverse |
| 34 | Controls · ConsentCheckbox | Disabled links: the variants disagree | NEW | ConsentCheckbox, CTA bar |
| 35 | Controls · Chip | Page still "In review": loader, removable chip, check marker | NEW | Chip API |
| 36 | Controls · FilterPill | Transparent fill confirmed? | NEW | FilterPill on grey Sections |
| 37 | Controls · Input | Status-row inset, vertical padding, reserved status space | NEW | Input, every form |
| 38 | Controls · OtpInput | Is masked "•" the default? | NEW | OtpInput |
| 39 | Controls · Tabs | Is the icon required? Retire `scope="local"`? | NEW | Tabs, PageHeader tabs |
| 5e | Controls · Selectors | Deprecate the segmented `Selectors`? | STILL OPEN | Selectors |
| 3 | Navigation · TopBar | Two Figma sets describe the same header | CHANGED | Confirmation only |
| 8 | Navigation · SectionLink | Naming, and the 40 vs 48/36/32 size | CHANGED (size still open) | SectionLinkButton sizes |
| 9b | Navigation · ActionBar | One code component, two Figma things | RESOLVED | — |
| 10 | Navigation · NavBar | Detached Shop button in the wireframe | RESOLVED (fix the wireframes) | — |
| 40 | Navigation · TopBar | Title 24 (`.topbar-title`) or 28 (`Big title`)? | NEW | TopBar hero title |
| 41 | Navigation · TopBar | Back button and logo on white/none, account `type=icon`, column overflow | NEW | TopBar detail pages |
| 42 | Navigation · NavBar | Logged-out default tab | NEW | Logged-out NavBar |
| 43 | Navigation · ListRow / ActionBar | Which one is the tappable settings row? | NEW | Every settings and account list Make draws |
| 44 | Navigation · ActionBar | `type=multiple` layers on non-inverse surfaces | NEW | ActionBar `stack` on light |
| 45 | Navigation · QuickAction | The `rows` labels are swapped; grid cells hug at 147 | NEW | QuickAction carousel, grid |
| 4 | Layout · Accordion | The page is still on V1.0 tokens | STILL OPEN → #23 | Accordion |
| 5f | Layout · Section | Deprecate `surface="brand-muted"`? | STILL OPEN | Section, guidelines line 126 (FAQ, "Jump to…") |
| 11 | Layout · PageHeader | The two states use different corner radii | STILL OPEN | PageHeader |
| 12 | Layout · PageHeader | The selected tab on the light card is white, not tinted | STILL OPEN (stronger) | PageHeader tabs |
| 13 | Layout · PageTitle | Titles are a step smaller than the text styles | SUPERSEDED by #14 | — |
| 46 | Layout · GeneralCard | Are the `surface` labels inverted? | NEW | GeneralCard, Card |
| 47 | Layout · GeneralCard | `top-alignment`: the symbol vs the description | NEW | GeneralCard |
| 48 | Layout · FAQ | Standalone, or inside a Section? | NEW | FAQ |
| 5c | Feedback · Alert | Deprecate the red/danger tone? | RESOLVED | — |
| 5d | Feedback · AlertModal | Deprecate the centred dialog? | RESOLVED | — |
| 6 | Feedback · Snackbar | The marks are built from deprecated colour styles | RESOLVED | — |
| 49 | Feedback · Alert | Which published `alert-message` set is canonical? | NEW | Alert Info Midnight, Code Connect |
| 50 | Feedback · Snackbar | "No CTA" vs the `Show button` prop; retire the V1.0 props? | NEW | Snackbar API |
| 51 | Feedback · Alert | The third step-counter state is unbound | NEW | Alert `stack` |
| 52 | Feedback · AlertModal | `top-group`: close or forward? | NEW | AlertModal close |
| 53 | Feedback · StatusBanner | Illustration assets and tints | NEW | StatusBanner (unbuilt) |
| 54 | Feedback · PlanUsageBar | The filled-text switch rule | NEW | PlanUsageBar |
| 55 | Overlays · Tooltip | The caret-placement names read backwards | NEW | Code Connect mapping |
| 56 | Overlays · BottomSheet | Keep or deprecate `display="dark"`? | NEW | BottomSheet API |
| 57 | CTA bar | Bottom spacing when `home-indicator=false` | NEW | CtaFooter on web |
| 58 | CTA bar · ActionBlock | Is the status ribbon valid without payment? | NEW | ActionBlock |
| 59 | CTA bar · StatusRibbon | Leading-icon colour | NEW | StatusRibbon |
| 60 | CTA bar · PriceLine | The description promises a strikethrough | NEW | PriceLine |
| 2 / 5a | Cards · Highlight | Brand/purple tones and bare CTA dropped? | RESOLVED | — |
| 9 | Cards · Voucher | What happens to `expired`? | STILL OPEN | Voucher `status` |
| 61 | Cards · Highlight | md/sm hide the title and subtitle: intended? | NEW | Highlight md/sm |
| 62 | Cards · SmilesBalance | Built on legacy styles; Gold and Platinum medals missing | NEW | SmilesBalance tiers |
| 63 | Cards · DealCard | Feedback-pill icon and states | NEW | DealCard feedback |

Counts: of the V1.1 items (1–14, 9b and the six #5 sub-items), 9 are closed (8 resolved, 1
superseded), 3 changed and 8 still open. The `green/550` note has moved to hygiene. There are
49 new items (15–63).

**The five rulings that unblock the most UI:** #14 (typography), #23 (page status), #15
(legacy bindings), #19 (assets) and #43 (ListRow vs ActionBar). #16 (gradients) comes next.

---

# Part 1 — V1.1 items, re-evaluated against V1.2

The original V1.1 text is kept below unchanged, as history. Only the dated status note under
each heading is current. The original introduction follows.

Drift items from `AUDIT-V1.1.md` that **cannot be fixed in code without a ruling**. Each
one has two defensible answers, so guessing would bake a coin-flip into the library and
into the Figma Make kit. The code is stated as-is for each, so nothing is blocked on
reading the audit first.

Raised 2026-08-05. File: `e& Consumer App DSL V1.1` (`pzm63BTLfPfT1stcF89ILQ`).

---

## 1. Switcher — which size is correct?

> **2026-10-14 — RESOLVED: the published symbol wins.** In V1.2 everything except the statesheet
> prose says 40×24 (md) and 32×20 (sm): the symbols in `switcher` 26215:7141, the bound
> `switcher/track/*` and `thumb/*` variables (`rem/2-5`, `rem/2`), `tokens.ts`, and a newly written
> component description. Code follows them since `94e12f2`, which also binds `color/mark/*` and adds
> `inverse`. `size="lg"` is a deprecated alias of `md`. The Switcher inside `action-bar` (nav note
> "#25") is 40×24 too, so it now matches. Remaining action, Figma side only: correct the statesheet.
> The new inverse-off conflict is #33.

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

> **2026-10-14 — RESOLVED: deprecate.** The V1.2 Highlight page (25460:83982; `highlight`
> 34272:25571) has only image + midnight gradient. The CTA lives only in the action bar, and the
> page's own guidance names two tap targets, card and action-bar CTA. No brand or purple surface,
> and no bare-CTA layout, appears anywhere. Code (`37b925c`) marks `tone`, `background` and `cta`
> `@deprecated`; they still render, so existing callers don't break. Guidelines still to update:
> MAKE_KIT_GUIDELINES.md:180 recommends `tone="brand"|"purple"`. The new md/sm question is #61.

V1.1 no longer shows the brand tone, the purple tone, or the bare-CTA (no-button) layout
that the code still ships. Removal from the file is not by itself proof of deprecation —
it can equally mean the variants moved to a page that was not published.

**Code today:** still exposes brand + purple tones and the bare-CTA arrangement.

**Need:** deprecate and remove, or restore in Figma? Source: 08-banners.

---

## 3. TopBar brand — two Figma sets describe the same header

> **2026-10-14 — CHANGED: probably settled by V1.2; confirm only.** The 09.09.2026 `topbar`
> (38172:12163) absorbed the profile-header anatomy: account block in the header row, 40px avatar,
> number in title/sm + chevron, inset card on four surfaces. Code was rebuilt on it (`f1891ac`). The
> V1.2 audits did not re-read `Profile header - NEW` (10-extensions). **Need:** confirm that set is
> retired, so the extension page stops competing with `topbar`. The new TopBar gaps are #40 and #41.

`Profile header - NEW` (10-extensions) reads as the successor to the brand `TopBar`, but
both sets exist and they differ: 48px action buttons at 10% opacity, a 14-Bold phone
number, and an action-card carousel in the bottom slot.

**Code today:** the older brand `TopBar` shape.

**Need:** a merge in Figma first — which set is canonical, and does the other get deleted?
Code can follow once there is one answer. Source: 03-navigation, 10-extensions.

---

## 4. Accordion — the Figma page is still on V1.0 tokens

> **2026-10-14 — STILL OPEN, now tracked in #23.** The page 27465:29326 is still
> [Not Finalized], and its changelog is an unfilled template. `Accordion header` 27465:30105 still binds V1.0
> names (`Spacing/Small 6`, `Text/Default/Dark/High-emphasis`, `heading/h5`, `Border/Softer`). The
> "latest exploration" is a white 20px-radius card with a 72px header, which is what the new `FAQ`
> (`9422bf9`) builds as its own item. Code `Accordion` is unchanged.

`04-layout` marks the Accordion page 🔴: it references V1.0 token names that no longer
exist. Any code change made against it would encode dead values.

**Code today:** unchanged, correct against V1.0.

**Need:** the page re-tokenised to V1.1, then a re-audit. Nothing to decide — just
sequencing. Source: 04-layout.

---

## 5. Six deprecations pending confirmation

> **2026-10-14 — split.**
> - **5a RESOLVED:** see #2.
> - **5b STILL OPEN:** V1.2 `badges-status` 25694:12036 publishes neutral, neutra-inverse, disabled,
>   positive, warning and danger. There is no brand, so absence is now stronger evidence. Code keeps
>   `status="brand"` (`8b0fbe9` left it).
> - **5c RESOLVED: no red alert.** V1.2 `alert-message` 40289:34516 / `.alert-message-core` 37215:9573
>   has Success · Alert · Warning · Info · Info Midnight. The orange **Warning** binds
>   `status-indicator/surface/danger`. Code (`18e48f5`) uses `status`; the deprecated `tone` maps
>   positive→success, warning→alert, danger→warning, default→info.
> - **5d RESOLVED: the dialog is gone.** `alert-modal` 32934:67842 is a full-screen or bottom-sheet
>   success screen. Code adds `integration`; the centred dialog renders only on the legacy props and
>   is `@deprecated` (`18e48f5`).
> - **5e STILL OPEN:** no V1.2 evidence either way. `Selectors` is unchanged.
> - **5f STILL OPEN, and now load-bearing.** No V1.2 section surface has `brand-muted`. The V1.2 set
>   is default · raised · ai-powered · brand · midnight-base · midnight-raised · glass-midnight ·
>   glass-white (`.section-surface-*` 26423:39325 / :39319). MAKE_KIT_GUIDELINES.md:126 still sends
>   Make to `brand-muted` for "Jump to…" and FAQs, but the V1.2 FAQ uses white cards. Code keeps it
>   (`9422bf9`).

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

> **2026-10-14 — RESOLVED by V1.2.** `.icon-snackbar-status` 37211:9101 now binds the tile to
> `color/status-indicator/surface/{positive,warning,danger,neutral}` and the glyph to
> `color/alert-message/text/info`. The legacy `#47cb6c` / `#d05d0a` / `#d5b549` are gone from the
> Snackbar. Code follows them (`18e48f5`, test in `feedback.test.tsx`). `#47cb6c` survives in the
> NewCard ring: see #15.

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

> **2026-10-14 — CHANGED: folded into #19.** V1.2 draws partner marks from the `Brands` icon set
> (31689:49780, `type=smiles` among them), which `logo-row` and `icon-size category=logo`
> instance. `SmilesAvatar` and `SmilesRow` are now `@deprecated` in favour of `LogoRow` + `more`
> (`8b0fbe9`). The question is no longer "token or not" but whether the Brands artwork ships (#19).
> `#6C3FD6` stays as the deprecated placeholder.

`primitives.tsx` defaults `SmilesAvatar` to `bg = '#6C3FD6'`, which matches no variable in
the export. Smiles is a partner brand, so a colour outside the e& DSL may well be correct —
but it is currently un-tokenised and undocumented.

**Need:** confirm whether Smiles brand colours belong in the DSL (as a `special/*` group,
alongside gold/silver/bronze) or stay app-level.

## 8. `SectionLink` — the name refers to two different things

> **2026-10-14 — CHANGED: part 1 resolved, part 2 still open.**
> - **Naming, resolved without a break (`b860170`):** the published icon button ships as
>   `SectionLinkButton`, and the composed row keeps `SectionLink`. `8b0fbe9` rebuilt the button on V1.2:
>   `glass` × `inverse` on `color/section-link/*`, pressed state, `action` forward/backwards/close.
>   V1.2 still has no composed "See all" row, so `SectionLink` stays code-only. The guidelines should
>   steer Make to the Section header + `SectionLinkButton`.
> - **Size, STILL OPEN:** every `section-link` 25440:14243 symbol is 40, and the
>   `section-link/sm|md|lg` tokens (32/36/40) are still exported. The statesheet says 48/36/32.
>   Code: 40 only.
> - **Top-bar link:** V1.2 publishes `topbar-link` 38792:25385 (12 symbols). TopBar now renders its
>   default state from `section-link/*` tokens (`f1891ac`). A public, interactive `TopBarLink` is an API
>   decision, not a design one.

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

> **2026-10-14 — STILL OPEN.** `Voucher` 28278:13817 still has only `display` dark|light ×
> `state` default|applied. V1.2 adds no expired variant, and the page's flow sign 28278:13777 reads
> **WIP**. Code: `status` is `@deprecated`, and `expired` still dims to 60%.

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

> **2026-10-14 — RESOLVED: they are the same component.** On the V1.2 Action Bar page (25519:15621),
> the inline `action-bar` 28201:38278 *is* the 72px icon + two-line + trigger row. That is what code's
> `ActionBar` models, and `f1891ac` aligned it (scheme, surfaces, switcher trigger, stack). The
> `Footer` (CtaFooter) is not on this page. There is no third thing.

`CtaFooter` is now aligned to Figma's `Footer` (29415:15497): shadow instead of a top
border, rounded top by default, 20px padding, safe-area indicator. That covers the
sticky-footer model the audit says was *relocated*, not deleted.

Still open: 03-navigation describes a **separate new inline `action-bar` row**, and code's
`ActionBar` (the 72px promo row) is a third thing again. Nobody has said whether the inline
row is a new component, a variant of the promo row, or a rename.

**Need:** confirm what the inline `action-bar` is, before anything is built for it.

## Also worth a design decision, found while reconciling tokens

> **2026-10-14 — STILL OPEN, moved to [Figma hygiene](#figma-hygiene-no-ruling-needed).** `.plan-usage-bar`
> 28927:23669 and `.progress-bar-status` 28927:22814 still bind the deleted `color/green/550`.

**`color/green/550` is a deleted variable that is still bound.** `.plan-usage-bar`'s fill
(`28927:23669`) points at it; it resolves by ID but its collection no longer lists it.
Live `color/green/600` is the identical colour (`#54bc72`). Re-pointing the binding in
Figma would clear it. Code already uses `green.600` and is unaffected.

## 10. NavBar — a wireframe wants a detached Shop button that Figma has deleted

> **2026-10-14 — RESOLVED for the library. Fix the wireframes.** The V1.2 `navbar` 29317:6983
> description now spells it out: one pill of four tabs, logged in **Home · Support · Profile · Shop**,
> active state chosen on `navbar-tabs-set`. There is no detached element and no `special` axis. Code
> matches (`f1891ac`: no border, equal tabs, Regular active label, token-bound colours). Remaining
> action, outside the DS: redraw the Account-screen wireframe to the four-tab pill and the symbol's order.
> The logged-out default is #42.

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

> **2026-10-14 — STILL OPEN.** `page-header` 37390:28734 was not re-read in the V1.2 pass. Code
> still follows the symbols: 20px default, 24px inverse.

`page-header` **37390:28734**. The `State=default` variant draws its card with the
`,page-header-surface-default` layer at **`border-radius/7` (20px)**; `State=Inverse` draws
`,page-header-surface-inverse` at **`border-radius/8` (24px)**. The outer frame is /8 in
both, but it clips, so the default card shows 20px corners. Nothing in the description
says the two states should differ.

Code follows the symbols: 20px default, 24px inverse.

**Need:** confirm whether the 4px difference is intended, or which radius both should use.

## 12. PageHeader — the selected tab on the light card is white, not tinted

> **2026-10-14 — STILL OPEN, and the evidence for the tint is stronger.** The V1.2 `tab-pill`
> 25502:12416 binds `default, selected` to `tab/default/surface/selected` **#fce6e6**, the tint. Code
> `Tabs` follows it (`5fa48e0`). So the white pill on the default page-header is now the odd one out,
> against both the tab-pill symbol and its prose. Code `PageHeader` still follows its own symbol
> (white).

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

> **2026-10-14 — SUPERSEDED by #14.** Its premise ("the style is 28px") is stale. In V1.2 the
> heading/lg *style* is 24px, so PageTitle's bound sizes match the styles, and only the 110% line
> height still has no `font/line-height/*` token (see #14).

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

## 14. Typography — the heading text styles and the heading variables have split

> **2026-10-14 — STILL OPEN, and widened.** Every audit and implementation pass hit this one
> (G4 cross-cutting, G6 X1, layout A, cards qK, nav 15). Code: `ty()` now reads the published
> styles (`3711416`, merged `a015511`). Symbols that bind the *variables* read `T.typography.heading.*`
> explicitly, each with a node comment. The full list of those symbols is now:
> - page-header `.title-block` 37291:112320;
> - topbar `Big title` 29547:11486;
> - `alert-title` 32934:66061 (28/1.2);
> - the SmilesBalance total 26610:3492.
>
> BottomSheet binds `font/size/6` over heading/md, which agrees with the V1.2 style (20). The
> decision also settles where a 110% line height lives: no `font/line-height/*` token holds it.
> TopBar title 24 vs 28 is split out as #40.

V1.2 retuned the published **text styles** without updating the **variables** of the same name:

| | text style (what symbols apply) | `typography/<style>/*` variables |
| --- | --- | --- |
| heading/2xl | 32 / 100% (new) | — |
| heading/xl | 28 / 110% | 32 / 100% |
| heading/lg | 24 / 110% | 28 / 120% |
| heading/md | 20 / 110% | 24 / 135% |
| heading/sm | 18 / 110% | 20 / 135% |
| alerts/md | Semi Bold 14 / 130% | Light 20 / 130% |

The styles now bind `font/size/*` primitives directly, so `typography/heading/*/font-size`,
`…/line-height` and `typography/alerts/md/*` are bound by nothing that uses the style. Most
symbols apply the style (Section titles, page-title, cards). A few bind the variables
directly instead — page-header's `.title-block` (37291:112320) and the topbar `Big title`
(29547:11486) render 28px / 120%.

Code now follows the symbols. `ty('heading.lg')` and the other text-style lookups read the
published styles, which `text-styles.json` holds and which generate `tokens.textStyle`. The raw
variables are still in `tokens.typography`, and the components that bind them read those
explicitly. This also corrects #13 above, which assumed heading/lg was 28px.

**Need:** either update the `typography/heading/*` and `typography/alerts/md/*` variables to
match the styles, or delete them. Also re-point page-header and Big title at the styles if they
were meant to follow them.

---

# Part 2 — New questions from the V1.2 pass (2026-10-14)

Sources: the audits G1 (primitives), G2 (controls a), G3 (controls b), G4 (navigation and layout),
G5 (feedback and overlays) and G6 (cards), and the implementation NOTES for each component file.
Every value was re-read from the published symbol and its bound variables. Duplicates raised by
several passes are merged; the source tags list all of them. Format: **Nodes** · **A / B** (the
candidate answers) · **Code today** · **Unblocks**.

## Foundations and cross-cutting

### 15. Legacy and remote variables still bound inside V1.2 symbols

Rule 8 applies wherever there is no V1.2 token. Where there is an exact equivalent, the fix is a
rebind in Figma, with no ruling needed.

| Binding (collection) | Value | Where (node) | V1.2 equivalent |
| --- | --- | --- | --- |
| `Text/Default/Dark/High-emphasis` | #140f21 | product title 26523:18817; deals price 25928:216894/5; SmilesBalance footer line (26610:3492); card-info title 37586:403 | **none.** `text/default/default` is #191329 |
| `Light Green/Base`, `Red/100` | #47cb6c, #e00800 | NewCard ring `.new-on-eand-state` 26523:22852 | none for the green |
| `color/green/500` (a primitive) | — | badge fill in `quick-action` 27962:37107 | no badge token |
| `Text/Default/Dark/Low-emphasis`, `BG/Component/Light Gray` | #191329 @50% (Book 12/16), #f4f3f5 | SmilesBalance tier pill | none (see #62) |
| `Spacing/4` (Sizes), `Spacing/Tiny 4` | 16, 4 | `.input-status` 25328:25295; `color-spot` 34393:96641 | `spacing/lg`, `spacing/xs` |
| `Foreground/Quartermary`, `Border-Radius/4` | — | `.addon` 29010:2516 (right); the input comment scrollbar | rebind |
| `Midnight %/10%` (e& Foundation) | midnight 10% | Searchbar stroke, "Standard search" 28114:62804 | **none** |
| `Text/Action/Midnight/Default`, `Text/Dark/Dark 100` | #191329, #1a1921 | `.plan-usage-bar` label 28927:23669; SmilesBalance total; Tooltip Rich title 33202:6649 | `text/default/default` |
| Whole legacy collections (`BG/Component/*`, `Radius/Radius 16`, `Spacing/Tiny *`, `Grayscale/White 100`, remote Badges and Buttons) | — | `Device card-Updated` 39749:73692, `product-card` 38609:45058, Tariff cards 39861:26863 | re-tokenise |

- **A:** rebind each to the nearest V1.2 token in Figma, accepting the small pixel shift (for
  example #140f21 → #191329).
- **B:** add V1.2 tokens for the values that have none.
- **Code today:** literals with a node comment. Nothing is near-matched. The three legacy-collection
  cards are not built.
- **Unblocks:** removing literals from ProductCard, DealCard, NewCard, SmilesBalance and Tooltip; the
  builds of card-info, Device, product-card and Tariff; and the Searchbar stroke.
- Sources: G6 X2, cards qA/qB/qE, G2 q9, G3 §6, G5 Tooltip/PlanUsage, controls "Not done".

### 16. Unbound gradients: tokenise them, or approve the literals?

| Gradient | Node | Values | Code |
| --- | --- | --- | --- |
| Section "sunset" glow (also the Visual-assets `gradient`) | 32553:58207 | md: #fa700c @27% blur 140 + #e00800 @27% blur 110. sm: both @25% blur 72. Hidden #ffcaa4 @60%. Instance at 96% | literal ellipses, CSS blur = radius/2 |
| Section `ai-powered` surface | 26437:43343 | #ffe4e3 → #f5f5f7 | `linear-gradient(128deg, …)` literal |
| Snackbar `back-ground=yes` | 40278:34191 | #3f3f3f → #fff@0 at 15%; progressive blur 0→8; pad 32; gaps 10 and 3 | literal, masked 8px blur |
| NavBar scrim | 29317:6983 | midnight 0% → 40% @48% → 70% | literal |
| Highlight scrim, stop 0 | `highlight` 34272:25571 | #191329 @0 (stops 2–3 bind `midnight.a60`/`a80`) | literal stop 0 |
| plan-usage card bottom fade | 38351:53904 | #fff 85% → 0, 40px | **not built** |
| Badge tiers, radial | `badges-tiers` 26501:2010 | Platinum #c2c1e7→#595779, Gold #e2c668→#b78d3b, Gold+ #b78d3b→#530118, Silver #e8e7ea→#8c8994, Silver+ #a3a1a9→#191329, Bronze #e8b8a4→#9f5739 | **not built** |

- **A:** gradient tokens, or stop tokens, in the variable set.
- **B:** approve these literals as part of the spec.
- **Code today:** see the table. Nothing is near-matched.
- **Unblocks:** `Badge tier` and a `PlanUsage` composite. It also lets the shipped literals be
  replaced with tokens. Also confirm the sunset glow *replaces* the old dark fade (it does in code).
- Sources: layout B/C, G1 j, G5 Snackbar/PlanUsage, feedback 15, G4 NavBar, cards qF.

### 17. Glass: what is the CSS translation, and which glass surfaces blur?

- **Nodes:** StatusIndicator glass 36858:109828; `.default-surface`/`.inverse-surface` 26770:*;
  `.logo-style` 26556:17510; the glass section surfaces in `.section-surface-inverse` 26423:39319.
- **A:** `backdrop-filter: blur(effects/glass/<size>/frost)` is the agreed translation. The light
  edge and refraction in Figma's render are not reproduced.
- **B:** tokenise the rim highlight too, for example as an inset stroke.
- **Second ask:** the glass-midnight and glass-white *section* surfaces carry no effect at all.
  Should they carry the GLASS effect, as SectionLinkButton and the PageHeader inverse do?
- **Code today:** blur(frost) wherever the symbol has the GLASS effect: 100px for lg, 20px for md.
  The glass Sections have no blur, following the symbol.
- **Unblocks:** consistent glass on every glass surface: SectionLinkButton, Tabs, Chip, Input, Picker, NavBar, ActionBar, LogoRow, StatusIndicator, AtomSurface and Section.
- Sources: primitives d, layout D, Button "Glass".

### 18. Off-scale and unbound sizes: add tokens, or accept the literals?

| Value | Node | Code |
| --- | --- | --- |
| TopBar top radius **36** (the scale stops at /8 = 24, then pill) | `topbar` 38172:12163 | literal `TOPBAR_TOP_RADIUS` |
| Picker strip badge bottom radius **28** (the top binds /2) | `.picker-scheme-*` 34373:16315 / :16508 | literal 28 |
| Carousel cell **147** | `General-card` 28463:12391, `quick-action` 27962:37107 | literal |
| Highlight stacked **307** in a 335 slot; Recommendation carousel **338** in 353 | 34218:38232; 36698:108342 | literals |
| ActionBar stack inset **6**, offsets **18/28** (gap −54) | `action-bar` 28201:38278 | literals |
| UAE PASS disabled logo opacity **0.34** | 39861:22282 | `UAE_PASS_LOGO_DISABLED_OPACITY` |
| Home indicator **34 / 144×5** on iOS-kit `Labels/Primary` #000 | `cta-bar` 31617:1007, `navbar` 29317:6983 | literals. CtaFooter #000, NavBar `surface.raised.default` |

- **A:** add `scale`, `radius` and `opacity` tokens for each.
- **B:** approve each as a literal. For the home indicator, bind a DSL colour if midnight was meant.
- **Unblocks:** removing these literals. Each one is small, but each is a rule-8 exception today.
- Sources: nav 14/23/24, controls P1, cards qG, layout H, Button B5, ctabar CTA-3.

### 19. Which asset sets ship in the package? (absorbs #7)

- **Nodes:**
  - `country_flag` 31917:28257: 218 countries × circle|rectangle.
  - `.3d` 32140:37718: 17 states.
  - `Brands` 31689:49780: alexa, careem, e&-money, gochat, smiles, starz, switch-tv, placeholder.
  - Visual assets 28919:1442: `profile-pic` 31511:35529, `devices-small` 41504:112835,
    `placeholder-image` 37376:21772, `video` 37479:5008.
  - `status-banner` art 32846:19638 (#53).
  - Gold and Platinum medals: only Silver exists, via the remote `Badge` 26610:3448 (#62).
- **A:** export them into the package, as the icons and logo already are, with licensing cleared for
  partner logos and 3D art.
- **B:** they stay app-level, and components take caller artwork.
- **Code today:** none ship. `LogoRow` takes caller logos or URLs. `SmilesAvatar` (`#6C3FD6`) is
  deprecated. TopBar `account.avatar` and AlertModal `visual` are free slots.
- **Unblocks:** LogoRow defaults, retiring SmilesRow, StatusBanner, the SmilesBalance tiers, flags in
  inputs, and the TopBar avatar.
- Sources: G1 Icons/Visual assets, primitives "Not done", G5 status-banner, cards qC, q7.

### 20. Motion has no readable spec

- **Nodes:** the "in-motion" frames added 13.08.2026 on the Features 25701:12472, Deals 25717:33323,
  Quick Action 25507:13670, Plans 25915:74211, Service 26019:79144 and New on e& 25915:75766 pages.
  Also Picker's 14.08.2026 motion section, which is only a link.
- **Ask:** durations and easing as tokens or prose. There are no prototype reactions and no motion
  variables to read.
- **Code today:** no press or entry motion on any card.
- **Unblocks:** card and picker motion.
- Sources: G6 X3, cards "Not done", G3 Picker.

### 21. No published keyboard-focus treatment

- **Nodes:** `button` 25394:85067 has `state` default/pressed/disabled only. The same holds across the
  control pages.
- **A:** adopt the code ring.
- **B:** publish a focus state.
- **Code today:** Button and UaePassButton draw a 2px (`border/lg`) outline, offset 2
  (`spacing/2xs`), in `border/interactive/{default|inverse}/pressed`. It shows for non-pointer focus
  only. Pressed is now pointer- and key-driven, never focus-driven.
- **Unblocks:** an accessibility sign-off, and extending the ring to the other controls.
- Sources: Button B7.

### 22. Code defaults that differ from Figma's default variant: confirm

| Component | Figma default | Code default, and why |
| --- | --- | --- |
| Switcher | `small=true` (32×20) | md (40×24). Changing it would shrink every shipped switcher |
| LogoRow | sm (24) | md (32), the old rendered size |
| Recommendation | `carousel=true` | `false`. One card without `items` cannot peek |
| OtpInput | no rtl variant | the cell row is `dir="ltr"` on RTL pages, because codes read left-to-right |
| Picker | no disabled+selected variant | disabled wins: disabled inks, no check |
| Removable chip on dark | only `Dismiss surface=default` shown | `Dismiss surface="default"` (#908e9a) |

- **Ask:** confirm each, or name the intended default.
- **Unblocks:** guideline wording, and avoiding churn later.
- Sources: controls "Decisions", cards qI, primitives LogoRow.

### 23. Pages that are not final, or still on legacy collections: what gets built, and when?

| Page / set | State | Blocker |
| --- | --- | --- |
| Accordion 27465:29326 (#4) | [Not Finalized]; template changelog | V1.0 tokens |
| Searchbar (28114:62804), AI Search | [Not Finalized], no changelog | `Midnight %/10%` stroke (#15); typing states |
| Color-selection `color-spot` 34393:96641 | In review 06.10.2026 | raw hex (product data); legacy gap |
| `Filter - local` 38609:44319 | template changelog; local copy | Title-Case props, "Srticky" |
| Picker v2 (`.type-picker` 42162:15699 and others) | page-root WIP | outside the documented section |
| `card-info` 37586:403, `card-list` 38626:35503 | In review | legacy ink, raw #fff. card-list: 353 vs 335 width, br/3 vs br/4 icon tile, needs a status-indicator pill |
| `card-gallery` 37479:6638 | In review | raw #000@20% and #fff on `.video`; remote play glyph |
| `media-switcher` 37445:3210 | template changelog | raw red↔green gradient toggle with layer blur; unbound Medium weight; one axis couples surface and header type |
| `Device card-Updated` 39749:73692, `product-card` 38609:45058, Tariff 39861:26863 | template changelogs | legacy collections throughout (#15) |
| Chips page | In review since 03.06.2026 | see #35 |
| Progress-bar, Voucher | In review 06.10.2026; flow sign WIP | — |

- **Ask:** for each, mark it Done and re-tokenised (then code builds it from the G-audit specs),
  or say it is not coming.
- **Code today:** none of the new ones is built. Accordion, Searchbar and AISearch ship their
  pre-V1.2 versions, with only clear bugs fixed.
- **Unblocks:** 13 components that are not built or not reconciled.
- Sources: G3, G4, G6, cards "Not done", controls "Out of scope".

## Primitives

### 24. Badge: `badges-status` lg/neutral binds 56/6, while every other lg binds 64/8

- **Nodes:** `badges-status` 25694:12036 `size=lg, type=neutral`, against the other 5 status lg variants
  and all 12 offer lg variants (12934:864).
- **A:** a missed update, so 64/8.
- **B:** neutral is meant to be smaller.
- **Code today:** 64/8 for every lg (`8b0fbe9`). The statesheet 25698:11338 prose ("52 / 54px") is
  outranked by the bound values.
- **Unblocks:** the Badge lg spec.
- Sources: primitives a, G1.

### 25. Badge: which way does the RTL chevron point?

- **Nodes:** `.badges-core` 40602:71471 `rtl=true` moves the chevron to the start but keeps
  `chevron-right` unrotated, so it points back into the label. Also, lg rtl pads `spacing/md` 12 with
  gap −12, while lg ltr pads 8 with gap −8.
- **A:** it points left, mirrored.
- **B:** it points right, as drawn.
- **Code today:** `data-rtl-flip`. Since `932013f` the flip really applies, so code points left
  (unlike the symbol). Padding is 8 in both directions.
- **Unblocks:** the Badge `chevron` prop in Arabic.
- Sources: primitives b.

### 26. StatusIndicator: the glass-dark neutral dot is midnight on a dark backdrop

- **Nodes:** `status-indicator-type` 37171:3663 (`Glass-dark` × neutral) binds `text/default/default`
  #191329.
- **A:** `text/default/inverse`.
- **B:** keep it as drawn.
- **Also:** the 19.08.2026 changelog says it "removed status coloured background variants", yet
  `type=pill` still has status-coloured surfaces. Code keeps them.
- **Code today:** follows the symbol, so the dot is nearly invisible.
- **Unblocks:** StatusIndicator glass-dark.
- Sources: primitives c.

### 27. LogoRow: `more-items` is always `surface=inverse` (white 15%)

- **Nodes:** every `logo-row` 25997:32516 variant instances `more-items` 26560:27420 inverse, and the
  page sits on dark.
- **A:** light surfaces use `default` (glass midnight).
- **B:** always inverse.
- **Code today:** defaults to inverse and exposes `moreSurface`. On light, the "+N" is near-invisible.
  PlanCard already uses default on its light scheme, following its own symbol.
- **Unblocks:** LogoRow on light cards.
- Sources: primitives i, cards PlanCard.

### 28. Surface atoms: three copies disagree, and is `.card-bg-color` square?

- **Nodes:**
  - Shared `.default-surface`/`.inverse-surface` 26770:100166 / :100161: r20, glass-white =
    `glass/white/lg`, no brand.
  - Plans copy `.surface-inverse` 25973:27593: r0, adds `brand` (26003:41829).
  - Recommendation copy 26590:12921 / :12927: r20, `white-transparent` = `glass/white/md`, other value names.
  - `.card-bg-color` 25710:20065: binds `border-radius/6` but is unclipped, with a hidden fill and an
    r0 tint child, so it renders square.
- **A:** merge into one atom with `brand`, r20 and white/lg.
- **B:** keep per-use copies.
- **Second ask:** is the tint square or rounded?
- **Code today:** `AtomSurface` follows the shared atom (r20, white/lg) and adds `brand`.
  `CardBgColor` keeps 16, and parents clip it.
- **Unblocks:** AtomSurface, Recommendation, the ProductCard tint panel.
- Sources: primitives e/f, G3 c, G6 AtomSurface.

## Buttons

### 29. Button secondary: the `scheme` bindings are crossed

- **Nodes:** `button` 25394:85067. Secondary `scheme=inverse` binds `secondary/*/midnight/*` (dark
  outline), and `scheme=midnight` binds `secondary/*/inverse/*` (white outline). Every other type
  binds the other way round. The same variants bind a text var as the stroke and a border var as the
  pressed fill. The values are the same today.
- **A:** un-cross the symbol, so inverse = the white outline, like primary's white fill. Code then
  swaps `SECONDARY_SCHEME_KEY` (one line).
- **B:** the crossing is intended.
- **Code today:** `scheme` follows the symbol exactly (`a541e10`). The deprecated `surface` keeps its
  V1.1 meaning.
- **Unblocks:** secondary buttons on red and midnight.
- Sources: Button B1, G2 q1.

### 30. Button: four per-variant slips and one contrast problem

| Variant (25394:85067) | Odd one out | Majority | Code |
| --- | --- | --- | --- |
| link lg pressed | no underline | md, sm underline | underlines at every size |
| tertiary sm pressed | underline | lg, md none | never underlines |
| md label padding | `spacing/2xs` on 3 of 21 (primary, glass, secondary at default/default) | `spacing/xs` | xs (inset 16) |
| tertiary lg pressed (default scheme) | content padding 4/4, so it jumps 8px | 0 | 0 |
| contrast | tertiary and link pressed on `scheme=inverse` = `red/1100` #bb0700 on brand red | — | token value, as Figma |

- **Ask:** confirm the four slips. Is the inverse pressed ink a token to retune?
- **Unblocks:** removing the per-variant hedges.
- Sources: Button B2–B4 and "Not done", G2 q2.

### 31. UAE PASS: the Arabic label is outlined vectors

- **Nodes:** `button-uae-pass` 39861:22282 `type=rtl` ("Group 4", 25 vectors). It is unbound black when
  enabled and `button/secondary/text/midnight/disabled` when disabled.
- **Ask:** the exact Arabic string and font, ideally as a text layer.
- **Code today:** live text `تسجيل الدخول بالهوية الرقمية`, transcribed from the screenshot, in
  `button/lg`. It falls back to a system Arabic font and renders 264px wide, against 284.
- **Unblocks:** an exact UAE PASS rtl.
- Sources: Button B6.

## Controls

### 32. Radio: inverse binds the default mark family and four deleted variables

- **Nodes:** `radio-button` 26369:775 was last touched 05.05.2026, so it missed the July `mark` migration.

| State | Bound | Value |
| --- | --- | --- |
| inverse selected / selected-disabled | `mark/default/border/default` / `…/disabled` | #908e9a / #d8d7de: a grey ring on dark |
| inverse off / off-disabled | deleted `mark/default/border/default1` / `disabled1` | white 70% / 40% |
| default off / off-disabled | deleted `mark/default/surface/focus` / `default-disabled` | #908e9a / #d8d7de |

- **A:** move to `mark/inverse/*`, like Checkbox and Switcher. Then, is off white 70% or
  `mark/inverse/border/default` #fff?
- **B:** keep the grey.
- **Code today (`6bec332`):** inverse selected is white, as shipped. Inverse off is
  `border.interactive.inverse.default` (60%). Disabled is `mark/inverse/*` (white 40%). The default
  scheme uses the same-value live tokens.
- **Unblocks:** Radio on dark.
- Sources: controls R1, G3 §5 / a.

### 33. Switcher: inverse off, md and sm disagree

- **Nodes:** in `switcher` 26215:7141, inverse md off binds the deleted `mark/default/border/default1`
  (white 70%) with a `surface/raised/default` knob. Inverse sm off binds `mark/inverse/surface/default`
  #c0bfc8 with `mark/inverse/icon/default`. Both sizes bind the on-disabled knob to
  `surface/sunken/default` #e4e3ea, not `mark/inverse/icon/selected-disabled`.
- **A:** the sm treatment (mark/inverse).
- **B:** the md one.
- **Also:** is the sunken knob deliberate?
- **Code today (`94e12f2`):** the sm treatment at both sizes, and the sunken knob as published.
- **Unblocks:** Switcher inverse.
- Sources: controls S1, G3 b.

### 34. ConsentCheckbox: the variants disagree on disabled links

- **Nodes:** in `checkbox-variants` 33489:12153, 3 of the 4 disabled variants switch the links to
  `button/link/text/*/disabled`. `inverse=false, selected=true, disabled=true` keeps
  `button/link/text/brand/default` (red). The default+disabled scheme also leaves them at
  `state=default`, while inverse+disabled sets `state=disabled`.
- **A:** links are always disabled with the box.
- **B:** links stay live, so the terms are readable while the box is locked.
- **Code today:** always disabled. `ConsentCheckbox` is canonical, and `CheckboxLine` is now a
  deprecated wrapper (`40e3443`).
- **Unblocks:** the consent row in the CTA bar.
- Sources: controls C1, ctabar CTA-5.

### 35. Chips: the page is still "In review"

- **Nodes:** `chips` 31539:8725 (In review since 03.06.2026); `.chips.marker` 31543:14010;
  `.chips-core-status` 31543:14084.
- **Asks:**
  1. Is the V1.1 loader really gone? Code: `loading` is `@deprecated` but still works.
  2. Is the removable chip (the `selected=true` atom with a trailing dismiss) meant to be published?
     Code built it from the atom as `onDismiss`.
  3. `type=check` is static in Figma, shown selected or not. Code shows the check only while
     selected. Is a check on an unselected chip ever wanted?
- **Unblocks:** the Chip API.
- Sources: controls C2, G2 q8.

### 36. FilterPill: is the transparent fill intended?

- **Nodes:** `filter-pill` 26151:391 has no fill except on inverse+selected.
- **A:** transparent, as published.
- **B:** white, as V1.1 shipped.
- **Code today:** transparent (`c184467`). On grey Sections it now looks visibly different from
  the old white pill.
- **Unblocks:** FilterPill on grey.
- Sources: G2 q7, controls re-confirmations. The unbound stroke and the orphaned `has-loader` are in
  hygiene.

### 37. Input: status-row inset, vertical padding, reserved space

- **Nodes:** `input-field` 29010:3152, `.input-text-ltr` 29001:2591, `.input-status` 25328:25295.
- **Asks:**
  1. **Inset.** The atom pads 2/16/4/16 with gap 2. The instance inside input-field overrides it to
     0/12/4/12 with gap 0, and `otp` uses the atom's defaults. Which is canonical? Code: Input 12, OTP 16.
  2. **Vertical padding.** The field binds 12/12 with `scale/56`, but 12 + 17 + 2 + 22 + 12 = 65.
     What is the real value? Code: 8, with min-height 56.
  3. **Reserved space.** Every variant is 86 tall, a 30px status wrapper even with no message.
     Code renders the row only when there is a message. Confirm?
- **Unblocks:** form spacing everywhere.
- Sources: controls I1–I3, G2 q3.

### 38. OtpInput: is masked "•" the default?

- **Nodes:** `otp` 33330:26041. The default row is built from disabled cells, and the filled cells show "•".
- **A:** masked by default.
- **B:** digits by default.
- **Code today:** `masked` is opt-in. There are 6 cells, and the row is LTR on RTL pages (#22).
- **Unblocks:** OtpInput.
- Sources: G2 q4, controls "Kept".

### 39. Tabs: is the icon required, and is `scope="local"` retired?

- **Nodes:** the `tab-pill` 25502:12416 description says "the leading 20px icon is always present", but
  `tab-pill-content` 37840:19927 still exposes `icon` as a toggle.
- **A:** the icon is required.
- **B:** it is optional.
- **Code today:** optional, and sized to 20 when given (`5fa48e0`). PageHeader's tab pills render no
  icon. `scope="local"` exists on no V1.2 symbol; it is `@deprecated` and still documented at
  MAKE_KIT_GUIDELINES.md:152.
- **Unblocks:** Tabs and the PageHeader tabs.
- Sources: G4 Tabs, controls "Not done".

## Navigation

### 40. TopBar title: 24 or 28?

- **Nodes:** `.topbar-title` 31539:6621 is what `topbar` renders. It applies the heading/lg *style*
  (24 / 110% / snug). The separately published `Big title` 29547:11486 (and its rtl twin 38172:13900)
  binds the `typography/heading/lg` *variables* (28 / 120% / tight), with an unbound #fff title.
- **A:** 24. Retire `Big title`.
- **B:** 28. Re-align `.topbar-title`.
- **Code today:** 24 / 1.1 / −0.35, set explicitly (`f1891ac`).
- **Unblocks:** the TopBar hero title. The broader rule is #14.
- Sources: nav 15, G4.

### 41. TopBar: three gaps in the V1.2 symbols

- **Nodes:** `.topbar-body-left-side` 32710:75541; `.top-bar-account-display` 32710:70116;
  `.topbar-header-schemes` 38965:82143.
- **Asks:**
  1. **Back button on white or none.** `type=back-button` exists only as `button type=glass`, which
     is invisible on white. Code reuses the topbar-link solid look. **Logo on none:** only the white
     instance overrides to `color-scheme=red`. Code uses red on white and on none.
  2. **Account display.** `type=icon` and `type=profile-picture` hold the same image. What does
     `type=icon` show? Code: `account.avatar` is a free slot.
  3. **Overflow.** The three columns are equal, about 112px at 375w, but the account (up to 177)
     and the page name (143) overflow and can collide. What are the max widths or truncation rules?
     Code: `minmax(0,1fr) auto minmax(0,1fr)` with ellipsis.
- **Unblocks:** TopBar on detail pages, and the account header.
- Sources: nav 16–18, G4.

### 42. NavBar: logged-out default tab

- **Nodes:** `navbar` 29317:6983. The prose says logged out is Shop · Plans · Devices · eLife with
  **Plans** as default, but the logged-out set selects page-1 (**Shop**).
- **A:** Plans.
- **B:** Shop.
- **Code today:** the caller picks the active tab, and no logged-out preset ships.
- **Unblocks:** guideline wording for logged-out screens. The 108 vs 114 height is hygiene: the
  symbol wins.
- Sources: G4 NavBar, nav 22.

### 43. ListRow or ActionBar: which one is the tappable settings row?

- **Nodes:** `list-item` 34677:66964 says it "is not a tap target; use action-bar".
  `action-bar-scheme` 25627:23258 binds the description to `text/default/default`, while list-item binds
  its subtitle to `text/default/subtle`. List-item price prose promises a "bottom divider" the symbol
  lacks, and `.list-item-padding` 34586:22304 is r16 around an r20 surface.
- **A:** settings rows are ActionBar; ListRow is a data row.
- **B:** ListRow stays tappable.
- **Also:** is the ink difference intended?
- **Code today:** `ListRow` renders a `<div>`. It keeps `onClick` → `<button>` for back-compat
  (`f1891ac`). Each component follows its own ink. There is no divider, and the radius is r20. The
  guidelines (MAKE_KIT_GUIDELINES.md:123, :196) still steer Make to ListRow for settings.
- **Unblocks:** every settings and account list Make generates.
- Sources: nav 19–21, G2 q5/q6.

### 44. ActionBar `type=multiple`: layers on non-inverse surfaces

- **Nodes:** `action-bar` 28201:38278. The two `core/sm` layers are always glass/white/md + glass,
  and Figma shows only the inverse scheme.
- **Ask:** what do the layers look like behind a light bar?
- **Code today:** `stack` renders with the inverse scheme only (insets and offsets are in #18).
- **Unblocks:** a stacked ActionBar on light.
- Sources: nav 23, G2 #19.

### 45. QuickAction: `rows` labels swapped; grid cells hug

- **Nodes:** `quick-action` 27962:37107. `rows=2` is 452 tall (three rows) and `rows=3` is 300
  (two rows). Grid cells hug at 147 instead of filling a 335 section.
- **Ask:** confirm the swap. Do grid cells fill?
- **Code today:** `rows` is the literal row count. Grid cells fill (1fr), and carousel cells are 147.
- **Unblocks:** the QuickAction layouts.
- Sources: nav 24, G6.

## Layout

### 46. GeneralCard: are the `surface` labels inverted?

- **Nodes:** `.card-general` 26825:101736. `surface=default` fills midnight-raised #312c40 with inverse
  ink, and `surface=inverse` fills white. The description ("default when the card sits in a light
  section") agrees with the fills.
- **A:** as published.
- **B:** `default` = white, as code `Card` names it.
- **Code today:** `GeneralCard` follows the symbol, and `Card` (no V1.2 symbol) keeps the opposite
  naming.
- **Unblocks:** GeneralCard vs Card guidance.
- Sources: layout F, G6.

### 47. GeneralCard: `top-alignment`, symbol vs description

- **Nodes:** `.card-general-core` 28379:3531. `top-alignment=true` puts the title at the **bottom** and
  the badge at the top. The description says it "pins the title to the top".
- **A:** the symbol.
- **B:** the prose.
- **Code today:** follows the symbol (`topAlignment`).
- **Unblocks:** either the prop or its doc.
- Sources: layout G.

### 48. FAQ: standalone, or inside a Section?

- **Nodes:** `faq` 38563:27574 has no fill and no header, and the page sample sits on grey.
- **A:** a bare block, wrapped in a `Section` for the title.
- **B:** it carries its own header.
- **Code today:** bare (`9422bf9`). The remote-symbol links are in hygiene.
- **Unblocks:** FAQ guidance, and #5f (brand-muted for FAQs).
- Sources: layout J, G4.

## Feedback and overlays

### 49. Alert: which published `alert-message` set is canonical?

- **Nodes:**
  - `alert-message` 40289:34516 ("Final component") binds Info Midnight to `alert-message/surface/midnight` #140f21.
  - `alert-message` 40266:31340 ("In review") binds `surface/base/midnight` #191329.
  - The OUTDATED 30969:1112 is still published (CURRENT).
- **A:** 40289. Unpublish the other two.
- **B:** 40266.
- **Code today:** follows 40289 (`18e48f5`). `code-connect/Alert.figma.tsx` still points at 30969 (its
  `Staus` axis).
- **Unblocks:** Alert Info Midnight, and Code Connect.
- Sources: feedback 14, G5.

### 50. Snackbar: "No CTA" vs `Show button`, and retiring the V1.0 props

- **Nodes:** the `Snack-bar` 40278:34192 description says "No CTA", but `.snack-bar-core` 37211:9193 has
  `Show button` and a primary/inverse button.
- **A:** an action is allowed.
- **B:** no action.
- **Also:** may `onDismiss`, `subtitle` and the bare, centred `tone="default"` be dropped? Figma has no
  mark-less snack bar.
- **Code today:** supports `action`. The V1.0 props are `@deprecated` but still work, and with neither
  prop set, the default now shows the `info` mark.
- **Unblocks:** the Snackbar API.
- Sources: feedback 15, G5.

### 51. Alert step counter: the third dot state is unbound

- **Nodes:** `alert-step-count-core` 40278:33974 `Property 1=3` is a 5×12 dot on unbound #d9d9d9 with a
  full-height midnight inner. `Stack=yes` does not use it.
- **Ask:** what is state 3 (completed, or auto-advance progress?), and what is its token?
- **Code today:** inactive and active only.
- **Unblocks:** the Alert `stack` progress.
- Sources: feedback 16.

### 52. AlertModal `top-group`: close or forward?

- **Nodes:** `top-group` 33166:53096 → `section-close` holds a `section-link` whose action is
  **type=forward**, a chevron.
- **A:** close (✕, dismisses).
- **B:** forward (continues).
- **Code today:** the close glyph, end-aligned.
- **Unblocks:** AlertModal navigation.
- Sources: feedback 17.

### 53. StatusBanner: illustration assets and tints

- **Nodes:** `status-banner` 32846:19638 (16 variants) is a 3D image fill, outlined display lettering
  and Star sparkles, on unbound tints (#67e38a @20%, #d5ede0, …).
- **Ask:** exported assets and licensing (#19), plus tokens for the per-scenario tints.
- **Code today:** not built. `AlertModal` takes a `visual` slot.
- **Unblocks:** a `StatusBanner` component.
- Sources: feedback 18, G5.

### 54. PlanUsageBar: the filled-text switch rule

- **Nodes:** `.plan-usage/value|label|content` switch to `state=filled` by hand, per instance (`.plan-usage-bar` 28927:23669).
- **A:** switch when the fill fully covers the run.
- **B:** some other threshold, or a manual choice.
- **Code today:** an automatic full-cover rule, overridable with `valueState` and `labelState`
  (`18e48f5`). A partly covered value stays midnight.
- **Unblocks:** PlanUsageBar.
- Sources: feedback 19, G5.

### 55. Tooltip: the caret-placement names read backwards

- **Nodes:** in `.tooltip-caret` 29972:2741, `caret-placement=right` puts the caret near the left (x=32),
  and `left` near the right.
- **Ask:** rename or flip the Figma values.
- **Code today:** `caretAlign` start|center|end names where the caret sits.
- **Unblocks:** a correct Code Connect mapping.
- Sources: feedback 20.

### 56. BottomSheet: keep or deprecate `display="dark"`?

- **Nodes:** `bottom-sheet` 40299:160405 has `type` basic|detailed|system-message and no dark variant.
- **A:** deprecate.
- **B:** add a dark variant in Figma.
- **Code today:** kept and `@deprecated` (`5f9bbe3`). MAKE_KIT_GUIDELINES.md:174 still lists it.
- **Unblocks:** the BottomSheet API.
- Sources: G5 BottomSheet.

## CTA bar

### 57. CTA bar: the bottom spacing when `home-indicator=false`

- **Nodes:** `cta-bar` 31617:1007 has no padding. The 34px home indicator is the only bottom space. The
  description says "always present — do not remove it", yet the boolean exists.
- **A:** remove the boolean.
- **B:** rule a padding, for example `spacing/xl`, to match the top.
- **Code today:** `homeIndicator` defaults to true. With it off, the bottom padding is 0. On the web,
  `env(safe-area-inset-bottom)` is the natural stand-in.
- **Unblocks:** CtaFooter on the web.
- Sources: ctabar CTA-1, G4.

### 58. ActionBlock: is the status ribbon valid without payment?

- **Nodes:** `.action-block` `payment=false` 31617:1497 has no ribbon layer, so `show-status-ribbon`
  does nothing. Only `payment=true` 31617:1498 has it, and that one also carries a stray `itemSpacing: 1`.
- **A:** valid in both modes.
- **B:** payment only.
- **Code today:** the ribbon renders in both modes.
- **Unblocks:** ActionBlock.
- Sources: ctabar CTA-2.

### 59. StatusRibbon: leading-icon colour

- **Nodes:** `.status-ribbon` 31577:2612. The leading `icon-size xl` holds an un-overridden
  `placeholder` bound to `text/default/default` #191329, while the label uses
  `alert-message/text/<status>`.
- **A:** midnight.
- **B:** the status ink.
- **Code today:** the status ink.
- **Unblocks:** StatusRibbon.
- Sources: ctabar CTA-4.

### 60. PriceLine: the description promises a strikethrough

- **Nodes:** `price-line` 33496:60459. The description talks about original vs discounted prices, but
  there is no strikethrough layer.
- **A:** add the layer.
- **B:** drop the sentence.
- **Code today:** no slot. Callers can put one in `value`.
- **Unblocks:** PriceLine.
- Sources: ctabar CTA-6.

## Cards

### 61. Highlight md/sm: hiding the title and subtitle, intended?

- **Nodes:** `.highlight-sizes` 34218:38232. md (224) and sm (148) show only the tag and the action bar.
- **A:** intended.
- **B:** the text should show.
- **Code today:** implemented as published (`37b925c`).
- **Unblocks:** Highlight md/sm.
- Sources: cards qH, G6.

### 62. SmilesBalance: built on legacy styles, and the Gold and Platinum medals are missing

- **Nodes:** `smiles-balance-card` 27131:101113, `.smiles-balance-card-core` 26610:3492, `.next-tier`
  26663:89987. It uses `Text/Action/Midnight/Default`, `BG/Component/Light Gray`,
  `Text/Default/Dark/Low-emphasis` (Book 12/16, no V1.2 style), the `Gradients/Silver|Gold|Platinum`
  paint styles, and the remote `Badge` medal (Silver only). The changelog is an empty template.
- **Ask:** re-tokenise the card (#15, #16), and supply the Gold and Platinum medals (#19).
- **Code today:** literals throughout. The Silver medal is reproduced from the exported path data;
  Gold and Platinum reuse the tier's gradient.
- **Unblocks:** SmilesBalance for every tier.
- Sources: cards qC, G5.

### 63. DealCard: the feedback-pill icon and states

- **Nodes:** `.footer` 25928:216907. The master icon is `bookmark-filled`, and instances override it to
  thumbs. There is no pressed or selected state.
- **Ask:** which glyph is canonical, and what does a voted state look like?
- **Code today:** outline `thumbs-up` / `thumbs-down`, with no state invented.
- **Unblocks:** an interactive deals feedback.
- Sources: cards qJ, G6.

---

## Figma hygiene (no ruling needed)

These need a Figma fix only. Code already copes: it strips the name, maps it, or follows the
symbol. They are not numbered as questions.

**Typos and wrong names**

| Node | Problem | Fix |
| --- | --- | --- |
| `.etisalat-logo-variations` 42579:83633 | type `billingual` | `bilingual` |
| `.quick-action-core` 28365:37221 | `direction` value `lrt` | `ltr` |
| `.3d` 32140:37718 | state `ewaiting` | fix the spelling |
| `badges-status` 25694:12036 | type `neutra-inverse` | `neutral-inverse` |
| `Filter - local` 38609:44319 | state `Srticky` | `Sticky` |
| `alert-message` 30969:1112 (OUTDATED) | axis `Staus` | unpublish (#49) |
| chips filled surface variable | `sisabled` | **fixed in V1.2** (`…/surface/disabled`) |
| `.tobpar-core` 38558:8041 | set name `tobpar`; boolean `stepprt` | `topbar`, `stepper` |
| FAQ remote Accordion | layer `surface-dedault` | `surface-default` |
| Icons: `qr-code `, `ai-text `, `office `, `cloud off, offline ` | trailing spaces | trim (the generator strips them) |
| `status-indicator-type` 37171:3537 | `Glass-dark` next to `glass` | one casing |
| `.footer-ltr` 37482:5280 | holds the **RTL** order (struck-through price first) | rename to `-rtl` |
| `.topbar-body-right-side` 38172:13741 | is the RTL twin of left-side | rename |
| `.add-trigger-content-rtl-inverse` 37884:69850 | has both ltr and rtl; it is the inverse colourway | rename |
| `.input-text-ltr` 37882:64237 | second set with the `-ltr` name; it is the RTL set | rename |

**Duplicate or orphaned sets**

| Node | Problem |
| --- | --- |
| `.badges-core` 37840:21062 | orphan duplicate of `.badges-core` 40602:71471. Nothing uses it |
| `.navbar-tab-state` 37502:16407 and 26593:20631 | two sets, one name |
| `.recommendation-core` 36698:86494 and 37905:28731 | two sets, one name |
| `.section-trigger` 27110:68969 and 38351:36648 | the rtl twin has the same name |
| `checkbox-variants/false/false/false` 42112:29214 | stray standalone COMPONENT outside the set |
| `.picker-body-default/Yes` 31358:141372 (and the inverse twin) | main component has no parent |
| `.next-tier` 26663:89987 | `next-tier4` duplicates silver |
| `alert-step-count-core` 40278:33974 / `Component 9` 40266:31351 | duplicate in the WIP frame |
| `.picker-surface-*` 42162:15634 / :15637 | duplicates in the Picker WIP |

**Bindings to rewire (same value, or a deleted or legacy variable)**

| Node | Bound to | Should be |
| --- | --- | --- |
| `.plan-usage-bar` 28927:23669, `.progress-bar-status` 28927:22814 | deleted `color/green/550` | `color/green/600` (#54bc72, identical) |
| `.navbar-tab-state` 37502:16407 selected pill fill | `navbar-tab/text/default` | `navbar-tab/surface/selected` |
| `tab-pill` 25502:12416 default selected label; inverse unselected label | `tab/inverse/text/selected`; `button/primary/text/brand/default` | `tab/default/text/selected`; `tab/inverse/text/default` |
| `.input-surface` 29706:19988 `inverse=true` | the disabled fill | the inverse default fill |
| `filter-pill` 26151:391 default+selected stroke | raw #191329 | `filter-pill/border/default/selected`. Also remove the orphaned `has-loader` |
| `.service-card-core` 37840:18370; `card-info` `Info-card` | raw #ffffff | `surface/canvas/default` |
| Searchbar fill | `button/primary/surface/inverse/default` | a surface token |
| `dismiss` 28961:19839 | legacy local icon 31150:2071 | the published `dismiss` set 31733:86641 |
| `.bottom-sheet-tabs` | legacy `Chips/state=focus` | `chips type=outline, state=selected` |
| `faq` 38563:27574 | remote `FAQ` 38563:27354 and remote `Accordion` 33219:2167 (chips on the V1.1 `…/focus`, radius on the remote `/6`) | the local Accordion 32753:390 and V1.2 chips |
| `.status-indicator-core` 37840:21741 label | the capital-B legacy `Badge/md` style | `badge/md` |
| StatusIndicator glass | `surface/glass/white/xs` while `color/status-indicator/surface/glass` exists (same value) | pick one |
| `Big title` 29547:11486 title fill | unbound #fff | `text/default/inverse` |

**Prose the published symbol already outranks** (update the docs)

| Node | Prose says | Symbol has |
| --- | --- | --- |
| Switcher statesheet | 56×24 / 48×20 | 40×24 / 32×20 (#1) |
| `add-trigger` 25973:25405 | dashed 1px stroke, 20px icon, fixed 285px | no stroke, a 16px disc, FILL. MAKE_KIT_GUIDELINES.md:166 still says "dashed" |
| `Recommendation` 36698:108342 | full-width CTA; `surface/base/default`; icon `border-radius/2 (8px)` | hugging CTA; `surface/base/inverse`; `/3` (the pre-V1.2 name). Statesheet 36691:5643 is an unfilled template |
| `picker` 34373:16787 | "Set state=selected"; a wheel picker | nested `selected` / `disabled` variants; a tile |
| Badges statesheet 25698:11338 | 52 / 54px minimums | 56 / 64 (#24) |
| `navbar` 29317:6983 | total height 114 | 108 (16 + 58 + 34) |
| `list-item` 34677:66964 | price "bottom divider" | no divider (#43) |
| `section-link` statesheet | Lg 48 / Md 36 / Sm 32 | 40 (#8) |
| Changelog frames on Accordion, FAQ, List item, OTP, Smiles Balance, Filter/compare, Device, Tariff | `DD.MM.YYY` template | fill them in |

# V1.2 reconciliation — findings

**Date:** 2026-09-01  
**Figma library:** `e& Consumer App DSL V1.2` (`pzm63BTLfPfT1stcF89ILQ`)  
**Code baseline:** `packages/react-design-system` (55 exported components)  
**Prior audit:** `tools/audit/v1.1/`

This is a read-only sweep. No component code was changed.

---

## 0. Token inputs — stale before any component is checked

These files must be refreshed against V1.2 Figma before any fix can be trusted.

| Input | Last refreshed | V1.2 status |
| --- | --- | --- |
| `variables.json` | 2026-08-05 | **STALE** — does not capture V1.2 renames (see §0.1) |
| `src/tokens/tokens.ts` | generated from above | **STALE** — same staleness propagated |
| `src/icons/icons.tsx` | 2026-07-24 | **STALE** — icon set not refreshed since pre-V1.2 |

Fix: `npm run tokens:pull` against the live V1.2 file, then `npm run build-icons`.

### 0.1 Known V1.2 token rename — navbar-tab

| Path | V1.1 (local, stale) | V1.2 (live Figma) |
| --- | --- | --- |
| surface active state | `color/navbar-tab/surface/focus` | `color/navbar-tab/surface/selected` |
| text active state | `color/navbar-tab/text/focus` | `color/navbar-tab/text/selected` |
| surface special state | `color/navbar-tab/surface/focus-special` | **deleted** |
| text special state | `color/navbar-tab/text/focus-special` | **deleted** |

Impact: `tokens.ts` exports `navbarTab.surface.focusSpecial`, `navbarTab.surface.focus`,
`navbarTab.text.focusSpecial`, `navbarTab.text.focus` — all dead paths. `NavBar` render
uses hardcoded hex values (not these token paths), so no silent CSS failure in production,
but the exported token object is wrong and will mislead Make-kit consumers.

Next `tokens:pull` will clear this. Assume other families may also have been renamed; a
missed rename ships as invalid CSS browsers drop silently — verify every `color()` call
after the pull.

---

## Summary counts

| Verdict | Count |
| --- | --- |
| OK | 17 |
| VISUAL-DRIFT | 7 |
| VARIANT-DRIFT | 7 |
| TOKEN-DRIFT | 1 |
| STALE-ANATOMY | 8 |
| NEW-IN-FIGMA | 1 |
| MISSING-IN-CODE | 4 families |

Design questions carrying over from V1.1: **10** (see `tools/audit/v1.1/design-questions.md`).  
New design questions added for V1.2: **1** (§11, InfoBar Split variant).

---

## 01 — Primitives (`src/components/primitives.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Logo | 25440:24483 | — | `e&` lockup, 3 versions × 3 colours | `Logo` / `version`, `size`, `color` | **OK** | — |
| Badge | 26593:20569 | VARIANT-DRIFT | disabled state, neutral-inverse, lg size | Missing `disabled` bool; no `neutral-inverse`; lg size unvalidated | **VARIANT-DRIFT** | Add disabled + neutral-inverse; measure lg against V1.2 symbol |
| Icon | cluster | STALE-ANATOMY | 209+ icons in V1.2 Figma | 23 icons in `icons.tsx`, refreshed 2026-07-24 | **STALE-ANATOMY** | Run `npm run build-icons` after tokens:pull |
| SmilesAvatar | 26593:20585 | VISUAL-DRIFT | Smiles purple (undocumented) | `SmilesAvatar` / `bg="#6C3FD6"` — not in token system | **VISUAL-DRIFT** | Q7: confirm if Smiles brand colour belongs in DSL |
| SmilesRow | 26593:20590 | — | Row of avatar bubbles | `SmilesRow` / `count`, `plus`, `size` | **OK** | — |
| ProgressBar | 26593:20606 | — | Horizontal fill bar, green fill | `ProgressBar` / `value`, `tone` | **OK** | — |
| Stepper | 26593:20620 | — | Step dots, inverse mode | `Stepper` / `steps`, `progress`, `inverse` | **OK** | — |
| AddTrigger | 26593:20650 | — | 48px circle plus button | `AddTrigger` / `label`, `onClick` | **OK** | — |
| Dismiss | 26593:20660 | — | 24/32px circle, 2 surfaces | `Dismiss` / `surface`, `size`, `onClick` | **OK** | — |
| LogoRow | 26593:20670 | — | Horizontal strip of logos | `LogoRow` / `logos` | **OK** | — |
| AtomSurface | 26593:20680 | — | 8 tint surfaces (cyan/blue/purple etc.) | `AtomSurface` / `surfaceColor`, `level` | **OK** | — |
| CardBgColor | 26593:20690 | — | Background tint tile | `CardBgColor` / `tint`, `fixedSize` | **OK** | — |
| SectionLinkButton | 25440:14243 | — | 40×40 icon button, 2 surfaces | `SectionLinkButton` / `surface`, `icon`, `disabled` | **OK** | — |

---

## 02 — Button (`src/components/Button/Button.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Button | 25440:14260 | — | primary / secondary / tertiary / link / glass × brand/inverse-brand/white/midnight × sm/md/lg | `Button` / `variant`, `surface`, `tone`, `size`, `loading`, `icon` — all 5 variants present | **OK** | — |

---

## 03 — Controls (`src/components/controls.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Input | 26593:20730 | VARIANT-DRIFT | Figma `type` axis: text/number/email/password/textarea | Code `type`: `text\|dropdown\|picker\|comment` — naming misaligns | **VARIANT-DRIFT** | Re-audit Input type axis against V1.2 symbol; rename to match Figma |
| OtpInput | 26593:20740 | — | 4–6 digit entry, masked, error, inverse | `OtpInput` / `length`, `masked`, `inverse`, `error` | **OK** | Confirm digit count range against V1.2 symbol |
| Chip | 26593:20760 | VARIANT-DRIFT | outline / filled / glass / inverse | `Chip` / `type`, `selected`, `disabled` — inverse incomplete (no token binding for inverse text/border) | **VARIANT-DRIFT** | Verify inverse Chip render against V1.2 symbol |
| FilterPill | 26593:20780 | — | selected / inverse / disabled | `FilterPill` / `selected`, `inverse`, `disabled` | **OK** | Minor spacing delta from V1.1 may persist; screenshot to confirm |
| Checkbox | 26593:20800 | VARIANT-DRIFT | md=20px, sm=16px per published symbol | Code renders 24px regardless of `size` prop | **VARIANT-DRIFT** | Align to symbol sizes; check V1.2 for size axis changes |
| Radio | 26593:20820 | VARIANT-DRIFT | lg / sm × default / inverse | Code: `size="lg"` only, no `size="sm"`, no inverse | **VARIANT-DRIFT** | Add sm size and inverse mode |
| Switcher | 26593:20840 | VARIANT-DRIFT | Q1 open: symbol says 40×24 md; doc page says 56×24 md | Code follows doc page (56×24) | **VARIANT-DRIFT** | Blocked on Q1 ruling |
| Searchbar | 26593:20860 | STALE-ANATOMY | Full state set in Figma (default/active/results/voice/AI) | `Searchbar` present but no state variants, no voice UI | **STALE-ANATOMY** | Extend to cover state axis; AISearch needs voice trigger state |
| AISearch | 26593:20870 | VARIANT-DRIFT | Voice trigger, recording, active states | `AISearch` has no state props beyond placeholder | **VARIANT-DRIFT** | Add voice/recording states |
| Tabs | 26593:20890 | — | global / local scope × icon option | `Tabs` / `scope`, `icons`, `tabs`, `value` | **OK** | — |
| Picker | 26593:20910 | — | default / light / inverse / glass × selected / disabled | `Picker` + `PickerOption` / `surface`, `value`, `options` | **OK** | — |
| Selectors | 26593:20920 | REMOVED-IN-FIGMA | Renamed to Pickers; segmented control has no V1.2 home | `Selectors` ships as deprecated compat wrapper around `Picker` | **REMOVED-IN-FIGMA** | Q5e: remove once callers migrated to Picker |

---

## 04 — Navigation (`src/components/navigation.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| TopBar | 26593:20940 | VISUAL-DRIFT | Q3 open: TopBar vs Profile header-NEW disagree on button size and bottom slot | `TopBar` / full slot API; implements older brand set | **VISUAL-DRIFT** | Q3: merge ruling needed before code can move |
| ListRow | 29317:6989 | STALE-ANATOMY | Published V1.1; V1.2 node unreachable via Figma MCP | `ListRow` / `label`, `caption`, `leading`, `trailing`, `surface`, `separator` | **STALE-ANATOMY** | Re-verify node in V1.2 Figma; full anatomy read needed |
| NavBar | 29317:6983 | TOKEN-DRIFT | `selected` axis (V1.2); token `navbar-tab/surface/selected` | Hardcoded `#fff`/`rgba` — not bound to navbarTab tokens; `special` removed; `scrollDirection` present | **TOKEN-DRIFT** | After tokens:pull, bind render to resolved tokens; also confirm tab order vs Q10 |
| ActionBar | 26593:20960 | STALE-ANATOMY | Q9b open: separate inline action-bar row | `ActionBar` is the 72px promo row (8 surfaces), not the inline row | **STALE-ANATOMY** | Q9b: confirm inline action-bar identity before building |
| SectionLink | 26593:20980 | STALE-ANATOMY | `section-link` (25440:14243) is a 40×40 icon button; code's `SectionLink` is a full-width header row | Naming conflict unresolved (Q8) | **STALE-ANATOMY** | Q8: naming ruling + size ruling (40px vs statesheet 48/36/32) |
| QuickAction | 26593:21000 | — | Grid of 2–4 icon tiles; carousel mode via Section | `QuickAction` / `columns=2`; carousel through `Section` wrapper | **OK** | — |

---

## 05 — Layout (`src/components/layout.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Section | 25519:12055 | — | 5 surfaces, carousel, gradient, trigger chevron/button/none | `Section` / `surface`, `size`, `carousel`, `gradient`, `trigger`, `filterPill`, `titleLine` | **OK** | `brand-muted` pending Q5f ruling |
| Card (General) | 26825:101736 | — | default / inverse, radius 20, carousel/grid | `Card` / `surface`, `width`, `media`, `title`, `body`, `action` | **OK** | — |
| Accordion | 26593:21020 | STALE-ANATOMY | Figma page references V1.0 token names (not updated to V1.1/V1.2) | Code correct against V1.0; Figma page blocks any re-audit | **STALE-ANATOMY** | Q4: re-audit after Figma page is re-tokenised to V1.1+ |

---

## 06 — Feedback (`src/components/feedback.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| PlanUsageBar | 28927:23669 | — | 48px block bar, remaining/total, 2 statuses | `PlanUsageBar` / `remaining`, `total`, `status` | **OK** | Figma binds fill to deleted `color/green/550`; code uses `green.600` (identical). Clear Figma binding. |
| Snackbar | 26593:21040 | VISUAL-DRIFT | Action: tone-matched underlined text per Figma | Action renders `text.brand.subtle`, no underline; Q6 open on mark colours | **VISUAL-DRIFT** | Q6: resolve mark colour tokens, then align action style |
| Alert | 26593:21060 | — | success / alert / warning / info; `alert-message.*` tokens | `Alert` / `status`, `title`, `message`, `onAction` — bound to `color('alert-message.*')`, resolves correctly | **OK** | Danger tone absent from V1.2 (Q5c) — confirm removal |
| AlertModal | 26593:21080 | STALE-ANATOMY | No V1.1/V1.2 home; full-screen Status screens are the replacement | `AlertModal` still ships as centred dialog | **STALE-ANATOMY** | Q5d: deprecate AlertModal; map callers to Status screen pattern |

---

## 07 — Overlays (`src/components/overlays.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| Tooltip | 26593:21100 | STALE-ANATOMY | Arrow tooltip, 4 placements, dark surface | Partial: basic render present, no tail/arrow placement logic | **STALE-ANATOMY** | Re-audit against V1.2 symbol; complete placement + arrow |
| BottomSheet | 26593:21110 | STALE-ANATOMY | Drag handle, header slot, safe-area indicator | Partial: renders but drag gesture not implemented | **STALE-ANATOMY** | Re-audit against V1.2 symbol; add drag gesture |

---

## 08 — Cards (`src/components/cards.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| PlanCard | 26593:21130 | — | 222×300, colorScheme default/inverse, heading.md title, title.md price | `PlanCard` / `colorScheme`, `title`, `price`, `features`, `cta` | **OK** | — |
| ProductCard | 26593:21150 | VISUAL-DRIFT | logo-row header, discount price, type addon/product/category, radius 20 | `ProductCard` / `type` — image-led, not fully aligned to logo-row spec | **VISUAL-DRIFT** | Re-audit against V1.2 symbol; align header layout to logo-row |
| DealCard | 26593:21170 | VISUAL-DRIFT | Logo-row, discount price, feedback pill at bottom | Code: image-led (cover photo top), no logo-row or feedback pill | **VISUAL-DRIFT** | Rebuild header to logo-row; add feedback pill |
| NewCard | 26593:21190 | — | 137×224, gradient ring on selected, offer badge, no border | `NewCard` — rebuilt V1.1; 137×224, ring, `Badge offer="new-card"` | **OK** | — |
| ServiceCard | 26593:21210 | VISUAL-DRIFT | radius 20, no border, 48px circular 3D illustration slot | Code: radius 16, border present, glyph placeholder icon | **VISUAL-DRIFT** | Fix radius to 20, remove border, swap icon to 48px illustration slot |
| Highlight | 26593:21230 | VISUAL-DRIFT | radius 24, glass logo-row, heading.xl (32px), scrim | radius 20, SmilesRow, heading.sm (20px); Q2 open on brand/purple tones | **VISUAL-DRIFT** | Q2 ruling first; then fix radius + logo-row + type |
| SmilesBalance | 26593:21250 | VISUAL-DRIFT | White card, progress bar, tier pill, points balance | Still V1.0: gold gradient bg, horizontal label+points+Button layout | **VISUAL-DRIFT** | Rebuild to V1.1 white card spec |
| Voucher | 26593:21270 | — | 144×144 ticket tile, notch SVG, light/dark, default/applied | `Voucher` / `display`, `state` — rebuilt V1.1 | **OK** | Q9: expired state has no V1.2 equivalent — remove prop or add Figma variant |

---

## 09 — CtaFooter (`src/components/ctabar.tsx`)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |
| --- | --- | --- | --- | --- | --- | --- |
| CtaFooter | 29415:15497 | — | Shadow, rounded top, safe-area indicator, ribbon/price/terms/payment/actions | `CtaFooter` / `ribbon`, `price`, `terms`, `payment`, `actions`, `homeIndicator`, `rounded` | **OK** | Q9b: inline action-bar (§04) still open |
| ButtonGroup | 29415:15510 | — | vertical/horizontal layout, 2–3 buttons | `ButtonGroup` / `orientation`, `primary`, `secondary`, `tertiary` | **OK** | — |

---

## 10 — Missing families (no code at all)

From `tools/audit/v1.1/10-extensions.md` — not built and no V1.2 resolution.

| Family | Figma node (V1.2) | Verdict | Note |
| --- | --- | --- | --- |
| Slider / SliderHandle / SliderThumb | 31511:33070 | **MISSING-IN-CODE** | 3-component family, not started |
| JumpTo | 31511:33080 | **MISSING-IN-CODE** | Alphabet index scroll utility |
| Offer / Promo / Text banners | 31511:33090 | **MISSING-IN-CODE** | 3 distinct banner types, all absent |
| Visual asset (illustration slot) | 31511:33100 | **MISSING-IN-CODE** | Shared illustration container |

Profile header-NEW blocked on Q3. Footer family beyond CtaFooter blocked on Q9b.

---

## 11 — New in V1.2

### InfoBar (node 32159:151199) — NEW-IN-FIGMA

Not in code. Not in `MAKE_KIT_GUIDELINES.md`.

Yellow/amber info strip. States published in V1.2:

| Axis | Values |
| --- | --- |
| Variant | Positive · Split |
| Character limit | on / off |
| Without edge bar | on / off |
| Without ligature | on / off |

"Positive" variant: full-width amber banner with a left-side icon and a right-side CTA.
"Split" variant: bar divided into two zones. "Without edge bar" removes the left accent rail.
Shown inline in a phone frame below the status bar in the Figma "Example of use" annotation.

No token group for InfoBar exists in the local `variables.json` snapshot; it will surface
after `tokens:pull`.

**Action:** read the V1.2 symbol for exact token paths, radius, icon slot size, and
typography variant before building. See Q11 below.

#### Q11 — InfoBar: Split variant layout and action slot

The "Split" variant's right zone is unclear from the screenshot (text only vs. text + button
vs. icon button). Before building, confirm:

1. What fills the right zone in Split — text label, CTA button, or icon?
2. Is there a dismiss behaviour — swipe only, or a Dismiss atom?
3. Is InfoBar stateful (dismissible, persisting across sessions) or always shown?

These are API-shaping decisions. Add to `tools/audit/v1.1/design-questions.md` when the
component is scheduled.

---

## 12 — Make-kit gap

`MAKE_KIT_GUIDELINES.md` does not mention InfoBar. After InfoBar is built and shipped, the
guidelines need a new section covering its surface colour family, the two variant modes
(Positive / Split), and the icon + action slot. No guidelines change is made by this audit.

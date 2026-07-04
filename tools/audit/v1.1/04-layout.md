# V1.1 Audit — 04 Layout

- **Section:** 04-layout
- **Audit date:** 2026-07-03
- **Figma file:** `pzm63BTLfPfT1stcF89ILQ` — "e& Consumer App DSL V1.1" (published library)
- **Pages audited:** Section `25519:12055` · Accordion 🔴 `27465:29326`
- **Code:** `packages/react-design-system/src/components/layout.tsx` (Section, Accordion)
- **Skipped:** Card (exported from `layout.tsx` but its Figma home is section 07 · Cards — audited by the cards agent)

## Drift table

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Section | set `section` **26423:42129** (surface=Default 26423:42128, surface=inverse 26423:42154); atoms `.section-header` 29389:3807, `.section-trigger` 27110:68969, `.section-body` 26423:41850, `.section-core` 25463:73512 | — | `surface` = Default \| inverse (367×572); radius `border-radius/7` 24; header pt `2xl`(24) px `lg`(16); title `heading/lg` 28 Bold single-line ellipsis; context `body/md` 14 `text/default/subtle`, pt `xs`(4); trigger = `section-link` **40×40, radius `border-radius/4` 14**, bg raised-white / `glass/white/lg`(.20), chevron-right in 24 icon-size; body p16, Slot sizes xs…xl (heights 104/180/256/332/484 = rows 1/2/3/4/6); statesheet adds **8 surface treatments**, **10 header variants**, **5 sizes** | `Section` — surface default\|brand\|brand-muted\|midnight; title `heading.sm` 20; context `body.sm` 12 muted, gap 2; chevron = **36×36 circle**, `#fff`+shadow / rgba(255,255,255,.16), text glyph "›"; padding 16 uniform (top 16), gap 16; slot gap 4 ✓; `carousel` bleed ✓; fill-width + hug ✓ | `section.md` — padding 16/top 24, radius 24, fill+hug, filter-pill/context/chevron all current; surface list (brand-muted pink "Jump to…"/"FAQs") is V1.0-era vs V1.1's 8 named treatments; no size axis or header-variant list | VARIANT-DRIFT + TOKEN-DRIFT + VISUAL-DRIFT + REMOVED-IN-FIGMA (`brand-muted`) + STALE-ANATOMY (minor) | Realign surface axis to V1.1 (Default/inverse set + statesheet treatments); fix title→`heading.lg`, context→`body.md`/subtle, header pt 24; rebuild trigger as 40×40 r14 `section-link` with real chevron icon + `Manage`-link variant; confirm `brand-muted` fate with design |
| Accordion | set `Accordion header` **27465:30105** (Expanded=No 27465:30106, Expanded=Yes 27465:30115) in section "accordion (do not use, development not yes started)" 27465:30103 | 🔴 | `Expanded` = No \| Yes (**343×58 / 343×142**) + bool props `Chevron down` · `Subtitle` · `Left icon` · `Right title`; collapsed row h58 py6 border-b `border/softer`; title 18 Bold lh24; subtitle 14 Regular med-emphasis; right title 14 Bold + chevron **20px**; expanded adds content body (py8, gap 4, starter 14 Bold + 14 body w/ inline link). **Built entirely on legacy V1.0 tokens** (`border/softer`, `text/default/dark/*`, `spacing/small-*`, `scale-*`) | `Accordion` — `title` + `defaultOpen` only; title `title.sm` 16 SemiBold; chevron `Icon` sm **12px** text glyph "⌄" rotate-180; border-b `border.solid.subtle` ✓concept; py 12 (row ≈48); no subtitle / left icon / right title / chevron toggle; fill-width + hug ✓ | `accordion.md` — variants + dims match the live set exactly (current); does not record the 🔴 do-not-use status | VARIANT-DRIFT + VISUAL-DRIFT (🔴 scope-gated — Figma side is a legacy-token draft) | HOLD code changes — page flagged "do not use, development not started"; log 🔴 in anatomy + design.md; when design re-cuts it on V1.1 tokens, add subtitle/left-icon/right-title bools, 20px chevron icon, h58 row |

**Verdict tally:** OK 0 · VARIANT-DRIFT 2 · TOKEN-DRIFT 1 · VISUAL-DRIFT 2 · MISSING-IN-CODE 0 · REMOVED-IN-FIGMA 1 (Section `brand-muted` surface — pending design confirm) · STALE-ANATOMY 2 (minor). (Components carry multiple flags.)

---

## Notes per component

### Section — `25519:12055`
- Page name `   ↳ Section ` — no emoji flag. One Figma section `section` **29394:16315** containing: hero/"component" frame 29394:16341, Changelog 25717:32875, the component-set frame, and Statesheet **27007:28182**.
- **Component set `section` 26423:42129** — the published axis is just `surface` = Default (26423:42128) / inverse (26423:42154), both 367×572. "inverse" renders on `.section-surface-inverse` filled with `color/surface/base/brand` **#e00800** (brand red), i.e. Figma's "inverse" = code's `brand`. Default fills `.section-surface-default` `color/surface/base/default` #f0f0f5.
- **Exact anatomy (design-context on the set):**
  - Container: radius `border-radius/7` = 24, overflow clip, fill width (367 in symbol).
  - Header: pt `spacing/2xl` 24, px `spacing/lg` 16, no bottom padding; field-row gap `spacing/xs` 4 → title + `.section-trigger`; context row pt `spacing/xs` 4.
  - Title: `typography/heading/lg` 28 Suisse Int'l Bold, tracking −0.65, single line + ellipsis, `text/default/default` (inverse: `text/default/inverse`).
  - Context: `typography/body/md` 14 Regular, `text/default/subtle` (inverse: plain `text/default/inverse` white — code's rgba(255,255,255,0.72) is a near-miss). Statesheet note: "Context will be fixed to 260px and will not extend till below button" (symbol renders 291px — minor internal inconsistency; flag to design).
  - Trigger (`section-link`, token `section-link/lg` = 40): **40×40, radius `border-radius/4` 14 (rounded square, not a circle)**, bg `surface/raised/default` white on Default / `surface/glass/white/lg` rgba(255,255,255,0.20) on inverse, no shadow; contains 24px `icon-size` wrapper (p 2) with a real **chevron-right** glyph.
  - Body: padding `spacing/lg` 16 all sides, single `Slot` child.
- **Atoms:** `.section-header` 29389:3807 (`Title line` = 1-Line 25581:11522 375×88 / 2-line 29389:3808 375×116) · `.section-trigger` 27110:68969 (`chevron ↔ button` = yes 27110:68968 40×40 / **no 27110:68967 = "Manage" text link** 70×19) · `.section-body` 26423:41850 (`size` = xl 484 / lg 332 / md 256 / sm 180 / xs 104, all 337 wide; description: "XL: 6 rows; LG: 4 rows; MD: 3 rows; SM: 2 rows; XS: 1 row" — matches `size.section.body.height` tokens 452/300/224/148/72 + 2×16 body padding) · `.section-core` 25463:73512 (367×572).
- **Statesheet 27007:28182 (V1.1-authoritative doc):**
  - *Header variants* ×10: Title · Title 2-line · Title and description(±2-line) · Title and filter-pill · Title, filter pill and description · Title and link · Title, link and description · Title, filter pill and link · Title, filter pill, link and description. Code covers title/context/filterPill/chevron; the **text-link ("Manage") trigger variant has no code path**.
  - *Surfaces* ×8: **Default · Raised · AI-powered (peach-tinted gradient) · Inverse-brand · Inverse-midnight · Inverse-midnight raised · Glass midnight · Glass white**. "The surface drives both the body fill and the text/icon colors that read on top of it."
  - *Sizes* ×5 (xs/sm/md/lg/xl) with usage guidance (XS status tiles/alerts → XL hero tiles). "Section gaps and padding remains same across sizes."
  - *Anatomy* frame labels: Title, Filter pill, Context, Section link, Slot area.
- **Code drift:**
  - `surface` axis mismatch: code `default|brand|brand-muted|midnight` vs set `Default|inverse` and statesheet's 8 treatments. Mapping: code `brand` ≈ Inverse-brand ✓, `midnight` ≈ Inverse-midnight ✓; code **`brand-muted` (pink) appears nowhere in V1.1** → REMOVED-IN-FIGMA pending design confirm; Raised / AI-powered / Glass-midnight / Glass-white have no code equivalents.
  - Type tokens: title `heading.sm` 20 → should be `heading.lg` 28; context `body.sm` 12 muted → `body.md` 14 subtle; title↔context gap 2 → `xs` 4.
  - Header top padding 16 → `2xl` 24 (side 16 ✓; header→body rhythm via body p16 ≈ code gap 16 ✓).
  - Trigger: 36×36 `borderRadius:'50%'` circle with box-shadow and "›" text glyph vs 40×40 r14 token-built `section-link` with icon; inverse bg 0.16 vs `glass/white/lg` 0.20.
  - Locked layout rule (containers = fill-width + hug) — code honors it ✓; slot gap 4px matches the tight stacking seen in `section-slots` templates ✓; carousel bleed matches Template examples ✓.
- **Anatomy `section.md`:** padding 16/top 24/16 gap, radius 24, white-circle-chevron wording, brand-muted examples — the paddings/radius/composition lines are current, but "white circle chevron" and the 4-surface list are stale vs the V1.1 set/statesheet; no size axis or header-variant enumeration; keep node `25519-12055` and add set/atom ids above.
- **design.md §Section:** Role/behavior/slot model current; "States: with/without header · padded vs full-bleed body" under-describes V1.1 (10 header variants × 8 surfaces × 5 sizes); size tokens block already lists `section.body.height` rows — matches `.section-body`.

### Accordion — `27465:29326` 🔴
- **Page renamed with a red flag:** `   ↳ Accordion 🔴`; its single Figma section is literally named **"accordion (do not use, development not yes started)"** (27465:30103). Neither `accordion.md` nor design.md records this status. New flag colour — exemplar audits saw 🟡 (WIP) and 🔵 (watch); 🔴 here reads as *do-not-use / not started*.
- **Component set `Accordion header` 27465:30105:** variant axis `Expanded` = No (343×58) / Yes (343×142); the four remaining anatomy axes (`Chevron down`, `Subtitle`, `Left icon`, `Right title`) are **boolean component props**, not variant symbols — `accordion.md`'s variant line and dims match the live set exactly (current).
- **Exact spec (design-context on the set):**
  - Collapsed row: h 58, py 6, border-bottom 1px `border/softer` rgba(25,19,41,0.07); left `VD Asset` icon 24; title 18 Bold lh 24 tracking −0.09 `text/default/dark/high-emphasis` #191329; subtitle 14 Regular lh 18 `text/default/dark/med-emphasis` rgba(25,19,41,0.7); right cluster gap 8 = right-title 14 Bold + chevron-bottom **20px**.
  - Expanded: column gap 12; header row repeats with chevron-top; `Content body text` block py 8 gap 4 — "Content starter" 14 Bold + 14 Regular body copy with underlined inline link.
  - **Every token is legacy V1.0 vocabulary** — `spacing/small-6|8|12`, `spacing/tiny-4`, `scale-03|04|05|07`, `border/softer`, `text/default/dark/*` — none of these exist in the V1.1 token set (`spacing/xs…2xl`, `color/text/default/*`, `color/border/*`). The Figma component predates the V1.1 token refresh, consistent with its do-not-use label. This is Figma-side drift; code is already on V1.1 tokens.
- **Rest of the page:** 🪧 Flow Sign instance, `Section Label` instance, "On White BG" example frame 27465:30127 (accordion rows on white), four skeleton rounded-rectangles, and two `Plan Data v1` usage mockups (27465:30135 / 27465:30173) composed of `List item/medium` instances — references, not components.
- **Code drift (documented, not actioned — scope-gated by 🔴):**
  - Props: code exposes `title` + `defaultOpen` only — no subtitle, left icon, right title, or chevron-hide bool.
  - Visuals: chevron is a 12px (`Icon` sm) text glyph "⌄" vs 20px icon; title `title.sm` 16 SemiBold vs 18 Bold (legacy scale — V1.1 equivalent TBD by design); row ≈48 (py 12) vs 58 (py 6 on 44 content).
  - Alignment: border-bottom divider concept ✓, expand/collapse + rotation ✓, fill-width + hug ✓ (locked layout rule).
- **design.md §Accordion:** "States: expanded · collapsed × disabled" — `disabled` is not an axis or prop in the V1.1 set; drop or verify. Add the 🔴 status line.

---

## Cross-cutting actions
1. Section is the priority fix: surface-axis realignment (incl. `brand-muted` ruling), heading/context type tokens, and the 40×40 r14 `section-link` trigger rebuild (+ "Manage" link variant).
2. Ask design whether the statesheet's 8 surface treatments will be published as set variants (today only Default/inverse exist) and to reconcile the context-width note (260px doc vs 291px symbol).
3. Accordion: touch nothing until the 🔴 drops — the Figma set is still on V1.0 tokens; record the flag in `accordion.md` + design.md so nobody builds against it.
4. Re-audit the Accordion page when it is re-cut on V1.1 tokens; expected changes: token rebind, possible surface axis, possible disabled state.

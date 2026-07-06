# V1.1 Audit — 08 Banners

- **Section:** 08-banners
- **Audit date:** 2026-07-05
- **Figma file:** `pzm63BTLfPfT1stcF89ILQ` — "e& Consumer App DSL V1.1" (published library)
- **Pages audited:** Highlight `25460:83982` (no WIP flag; changelog: V1 created 08.04.2026 → docs restyled + template examples 09.06.2026 → docs updated 15.06.2026, all Done)
- **Code:** `packages/react-design-system/src/components/cards.tsx` (Highlight) · `primitives.tsx` (SmilesRow, used inside Highlight)

## Drift table

| Component | Figma node (V1.1) | Flag | Figma spec (variants/dims) | Code (export/props) | Anatomy file | Verdict | Action |
|---|---|---|---|---|---|---|---|
| Highlight | final set `highlight-banner` **28382:19131** (`carousel=no,size=xl` 28382:19130 335×452 · `no,lg` 28382:19230 335×300 · `yes,xl` 28382:19129 313×452 · `yes,lg` 28382:19232 313×300); atoms `.highlight-content` **28382:14364** (`type`=informational 28382:14363 292×204 \| action 28382:14471 292×228), `.highlight-core` **25461:61744** (316×452); shared `action-bar` 26163:72077/72095 | | `carousel`(no/yes) × `size`(xl/lg), all image-media only; radius `border-radius/7` **24**; image cover + 3-stop midnight scrim (rgba(25,19,41,0) 46% → `midnight-%/60%` 70% → `midnight-%/80%` 100%); content bottom-anchored px `2xl` 24 / pb `3xl` 32; logo strip = 2–3 `.logo-style` glass wraps (`surface/glass/white/lg` .2, p8, pill, inner 32px circle, 0.5px `border/surface-based/glass/default/sm` .8) gap `sm` 8; title `heading/xl` Bold **32** lh1 tr −0.65 `text/default/inverse`; subtitle `body/md` 14 lh1.4 inverse; action type swaps subtitle for **action-bar**: h72, r `border-radius/6` 20, px `lg` 16, bg `surface/glass/white/md` .15 + GLASS effect, inner h40: `title/xs` SemiBold 14 + `body/md` 14 inverse, gap `md` 12, h40 primary brand pill button `button/md` Medium 14 #e00800; carousel gap 8, swipe on mobile | `Highlight` — title/subtitle/image/cta/action/width/tone(image\|brand\|purple)/background; radius **20**, minH 340/200 (not fixed 452/300), scrim 2-stop rgba(20,15,33,0)35%→.78, pad `lg` 16 all, `SmilesRow` count 3 (overlapping, hardcoded hexes) not glass logo-row, title `heading.sm` **20**, subtitle `body.sm` 12 rgba(255,255,255,.85), action bar rgba(25,19,41,.55)+blur4 r12 p8 `title.xs`+`body.sm` + Button sm, bare-`cta` state, no size/carousel axes | `highlight.md` — Informational/Action × XL/L × Single/Carousel ✓, bottom-anchored 2-line title ✓, carousel fixed width ✓; stale: "rounded 20" (now 24), tones "image · brand (red) · purple (Smiles gradient)" + red/purple examples (no tone axis in V1.1), "tier-badge row" naming (now logo strip w/ 3 treatments) | TOKEN-DRIFT + VISUAL-DRIFT + VARIANT-DRIFT + REMOVED-IN-FIGMA (brand/purple tones, bare-CTA state) + STALE-ANATOMY | Retokenize (r24, heading/xl, body/md, px24/pb32, 3-stop midnight scrim, glass action-bar h72/r20); swap SmilesRow → glass logo-row; add `size` xl/lg + `carousel` fixed 313; model `type` informational/action; confirm tone brand/purple + `cta` removal with design; refresh anatomy (radius, tones, logo treatments) |

**Verdict tally:** OK 0 · TOKEN-DRIFT 1 · VISUAL-DRIFT 1 · VARIANT-DRIFT 1 · MISSING-IN-CODE 0 · REMOVED-IN-FIGMA 1 (tone brand/purple + bare-CTA, pending design confirm) · STALE-ANATOMY 1. (Single component carries multiple flags.)

---

## Notes per component

### Highlight — page `25460:83982` ("   ↳ Highlight", no 🟡/🔵 flag)
- Page layout: section **Highlight Banners** 26196:11851 → Changelog 25463:76380 · Notes 25544:1347 · Documentation 26196:3672 (hero, Single Line / Carousel example boards, `.section-core` templates, Atoms) · Statesheet 26924:32292 · "Final component" frame 29372:31967 holding the published set.
- **Final set `highlight-banner` 28382:19131** — axes `carousel`(no/yes) × `size`(xl/lg). Dims: single 335 wide, carousel 313 wide; xl h452, lg h300. All four variants are photo-media banners (dark seascape) — **no tone axis**; screenshot shows identical anatomy across sizes, only height/width differ.
- **Exact xl spec** (design-context on 28382:19130): `.highlight-core` fills variant, radius `border-radius/7` **24**, overflow clip; bg = image cover + gradient overlay `rgba(25,19,41,0)` from 45.99% → `midnight-%/60%` rgba(25,19,41,0.6) at 70.29% → `midnight-%/80%` rgba(25,19,41,0.8) at bottom (bottom-biased for text legibility, per statesheet). `.highlight-content` bottom-anchored, px `spacing/2xl` 24, pb `spacing/3xl` 32; internal wrappers pt `sm` 8 between logo-row / title / subtitle, logo wrapper pb `xs` 4.
- **Logo strip**: instances of the logo-row glass style — each `.logo-style` = `surface/glass/white/lg` rgba(255,255,255,0.2) wrap, p `sm` 8, radius 1200 pill, inner 32×32 circle with 0.5px `border/surface-based/glass/default/sm` rgba(255,255,255,0.8); gap `sm` 8; example brands smiles / STARZ PLAY / switch TV. Statesheet defines **three logo treatments**: Single logo (1 logo inside the action tile), Glass logo (2–3 frosted containers above headline), Fill logo (2–3 solid-fill containers above headline).
- **Type**: title `typography/heading/xl` Suisse Int'l Bold **32px**, leading-none, tracking −0.65, `text/default/inverse` white, 2 lines max (statesheet: single line 15 chars / two-line 29 chars); subtitle `body/md` 14 Regular lh 1.4, also `text/default/inverse` (full white, not a subtle step).
- **Action type** (atom 28382:14471; documented as "Action – XL/L" boards): heading block (logo strip + title, pb `xl` 20) + **action-bar** instance (shared component 26163:72077/72095, the same action-bar used under the Smiles Balance template): h **72**, radius `border-radius/6` **20**, px `lg` 16, bg layer `surface/glass/white/md` rgba(255,255,255,0.15) + GLASS effect (`surface/glass/glass-md` frost); inner `.action-bar-core` h40, gap `md` 12 = text block (`title/xs` SemiBold 14 lh 1.3 + `body/md` 14 lh 1.4, both inverse) + `.action-bar-trigger` = primary brand button h40 min-w 40 px `md` 12 pill, `button/md` Medium 14, `button/primary/surface/brand/default` #e00800, white label ("Play"). Informational type has **no CTA at all** — action-bar is the only actionable form.
- **States/statesheet extras**: carousel item spacing **8px**; swipe gesture on mobile; anatomy layer order bottom-to-top = background media → gradient overlay → logo strip → title (2-line) → sub title.
- **Code drift** (`Highlight` in cards.tsx):
  - Radius **20 vs 24** (`border-radius/7`); heights `minHeight` 340 (image) / 200 vs fixed 452 (xl) / 300 (lg); no `size` or `carousel` axes (width prop approximates carousel fixed width but without the 313/8-gap spec).
  - Scrim = 2-stop `rgba(20,15,33,0) 35% → rgba(20,15,33,0.78)` — wrong base (#140f21 canvas-midnight vs #191329 midnight) and missing the 60%-at-70% middle stop.
  - Padding `lg` 16 uniform vs px 24 / pb 32.
  - Logo strip rendered with `SmilesRow` (overlapping avatars, hardcoded #6C3FD6/#c0bfc8 — see 01-primitives Logo-row finding) vs Figma's non-overlapping glass `.logo-style` row.
  - Title `heading.sm` 20 vs `heading/xl` 32; subtitle `body.sm` 12 at off-token rgba(255,255,255,0.85) vs `body/md` 14 `text/default/inverse`.
  - Action bar: rgba(25,19,41,0.55) + blur(4), radius 12, p `sm` 8, description `body.sm` at rgba(255,255,255,0.75), `Button size="sm"` — vs glass-white/md h72 r20 px16, `body/md` description, h40 `button/md` primary brand trigger.
  - `tone` brand/purple + `background` override and the bare-`cta` state have **no V1.1 equivalent** (V1.0 residue — red "Play and win" / purple "Discover Smiles" examples are gone) → REMOVED-IN-FIGMA, confirm with design before deleting.
- **Anatomy `highlight.md`**: variant matrix (Informational/Action × XL/L × Single/Carousel), bottom-anchored anatomy and carousel fixed-width note all match V1.1. Stale lines: "rounded 20" (now `border-radius/7` 24), the tones bullet ("image · brand (red) · purple (Smiles gradient)") and the red/purple CTA examples ("Play now"/"Watch now"/"Activate now" on brand/purple banners), and "tier-badge row (smiles / stars-play / owl-tv)" — V1.1 formalizes this as the logo strip with Single/Glass/Fill treatments.
- **design.md §Highlight** is conceptually right (full-bleed banner slot, fill × hug) but "States: default · with/without CTA · light/dark media" and "Composition … + Button" predate the informational/action + action-bar model; media is dark-image only in V1.1.

---

## Cross-cutting actions
1. Rebuild `Highlight` against the V1.1 render in one pass: radius 24, fixed size axis (xl 452 / lg 300, carousel width 313 + 8 gap), 3-stop midnight scrim, px24/pb32, `heading/xl` title, `body/md` subtitle, glass logo strip, glass action-bar (h72/r20/glass-white-md + h40 brand trigger).
2. The action-bar is a shared Figma component also used by Smiles Balance (see 09-product-specific) — extract it as one code component instead of the inline div in `Highlight`.
3. Blocked on the Logo-row primitive fix from 01-primitives: Highlight's logo strip should consume the tokenized glass logo-row, not `SmilesRow`.
4. Ask design to confirm removal of brand/purple tones + bare-CTA state before deleting `tone`/`background`/`cta` props (breaking change).
5. Refresh `tools/anatomy/highlight.md` (radius 24, drop tones, rename tier-badge row → logo strip, add Single/Glass/Fill logo treatments + 15/29-char headline limits + 8px carousel gap).

# E&DSA repo vs Figma V1.1 — component audit findings

Repo: ~/Desktop/E&DSA/packages/react-design-system/src/components
Figma: e& Consumer App DSL V1.1 (pzm63BTLfPfT1stcF89ILQ)

## CONTROLS

### Button (Button/Button.tsx) — PARTIAL
- Figma axes: type=primary|secondary|tertiary|link|**glass** × size sm/md/lg × surface (per-type) × state default/focus/disabled
- Repo matches primary/secondary/tertiary/link + surfaces brand/inverse-brand/white/midnight + states. ✅
- ✅ FIXED 2026-07-19: `glass` variant added (type=glass, brand surface only, node 31511:8011)
- ✅ FIXED 2026-07-19: `loading` prop added (Figma `Loader <-> Icon=on/off` 28266:67127)
- Figma also has uae-pass composite buttons (Login En/Ar, Live chat support, FindMe, Satellite view) — not in repo (likely app-level, flag only)

### CTA-bar (page 31501:35139) — ✅ IMPLEMENTED (2026-07-19: StatusRibbon, ButtonGroup, PaymentRow, CtaFooter in components/ctabar.tsx)
- Figma defines: `button-group-horizontal`/`button-group-vertical` (Primary / Primary+Secondary / Primary+Tertiary / Primary+Secondary+Tertiary), `button-stack` (vertical<->horizontal), `action-block` (Payment=yes/no with price/T&C checkbox row), `status-ribbon` (Status=success|alert|warning|info), CTA footer frames w/ iOS home indicator.
- Repo has no CTA-bar/button-group/status-ribbon component.

### Input (controls.tsx Input) — ✅ MOSTLY FIXED (2026-07-19: V1.1 rewrite — floating label, 56px field, state borders, text/dropdown/picker/comment types, inverse, clearable, success status; new OtpInput. Remaining: dropdown/picker only render the field — menu/sheet wiring is app-level.)
- Figma: type=text|otp|dropdown|picker|comment × active/filled/disabled/error + inverse=yes/no + label position, helper status=error|Success|neutral, leading icon position Left/Right.
- Repo: only outlined/filled visual variant + error/helper/disabled + icons.
- **MISSING: otp, dropdown, picker, comment types; inverse scheme; active (focused) state styling; success status on helper**

### Chip (controls.tsx) — ✅ FIXED (2026-07-19: type=outline|filled|glass|inverse × default/focus/disabled, check-mark content, loading spinner)
- Figma: type=outline|filled|glass|inverse × state default/focus/disabled; content check-icon|custom-icon; Loader on/off.
- Repo: only outline-ish default + inverse + selected.
- **MISSING: filled & glass types, disabled state, loader, check-mark selected content**

### FilterPill — ✅ MATCH (State default/focused/disabled × Color default/inverse; h40, 1px border, pill radius, 16px chevron)

### Checkbox — ✅ MATCH (color-scheme default/inverse × radio yes/no × size sm(16)/md(20) × selected × disabled — all in repo)

### Radio — ✅ MATCH (color-scheme default/inverse × small yes/no × selected × disabled). Note: repo disabled = opacity 0.5 — verify tokens vs Figma disabled colors.

### Switcher — PARTIAL
- Figma: color-scheme default/inverse × Small × Active × disabled. Sizes documented lg 56×24, sm 48×20 (symbols drawn 40×24/32×20 — Figma internally inconsistent, repo follows documented 56/48).
- Repo matches sizes/track/knob rules. **MISSING: inverse color-scheme prop.**

### Searchbar — PARTIAL
- Figma standard search 345×52: leading search icon, trailing mic OR arrow-right-circle, active state has clear (x,circle) leading + blinking cursor.
- Repo: h52, search icon + mic ✅. **MISSING: trailing arrow-right submit variant, clear button in active state.**
- AI Search (30635:82333): rich states (default/focus/typing/dictation started/transcribing/stop) — repo AISearch is just a placeholder alias of Searchbar. **Effectively missing.**

### Picker (28278:1530) — ✅ IMPLEMENTED (2026-07-21: Picker + PickerOption in controls.tsx — value/caption/badge tiles, surface default|light|inverse|glass, selected accent border + check, disabled)
- Figma picker: option-row selectors (title+description+checkbox) with variants Default|Light|Inverse|Glass × Selected × Disabled; surface-color sunken/default/glass/midnight.
- Repo `Selectors` is a segmented pill control — not the same thing. No picker component in repo.

### Tabs (in controls.tsx; Figma page 22542:13966 pending review)

## Notes
- List items (32159:151199): `.list-item-core` State=standard(56px)|Highlighted(72px). Repo ListRow ≈ standard only; **MISSING Highlighted variant**; style verification pending.

## NAVIGATION

### TopBar — ✅ REWORKED (2026-07-21: slot-based header in navigation.tsx — top row leading/logo/actions, big-title block eyebrow/bigTitle/subtext, account display, bottom children slot; variant/greeting/actionBar kept as back-compat)
- Figma "Master menu component" (29547:11510): Large title on/off × Bottom element on/off, built from slot atoms:
  left-part (Chevron+Text | Avatar+Text | Chevron | Text | None), middle-part (Title+Subtitle | Title | Logo | None),
  right-part (2 icon buttons | 1 icon button | Link | None | Button), header-top-part, big-title (eyebrow×subtext),
  bottom-elements (AI Search | search | AI Search 2 | Button | Tabs | Chips | OTP | steps | Banner 1 | Banner 2 | Carousel),
  .topbar-action (stacked yes/no), .top-bar-account-display (profile-picture | icon), compressed-header search state.
- Repo TopBar: ad-hoc default|brand variants w/ greeting + actionBar. Does not model the slot system, big-title, or bottom-elements. Needs redesign to match V1.1.

### NavBar — CLOSE MATCH
- Figma: tabs home/support/profile/shop/Plans/Devices/Elife; active = filled red icon + expanded white pill ✓ (repo matches);
  profile logged-in/out sets (app-level data — fine via items prop); scroll-direction up/down ✓ repo has it.
- Spec: 16px outer padding, 8px gap between tabs, 114px total height. Repo: gap space('sm')=8 ✓, padding lg — verify 16 ✓, height not pinned to 114 (flexible) — minor.

### Tabs (Pill Tabs) — PARTIAL
- Figma axes: State default|active × inverse yes|no. Anatomy: h40 fixed, radius pill, optional 20px leading icon, hug width, label never wraps.
- Repo Tabs: scope 'global'|'local' — **axis mismatch**: Figma has default vs inverse (dark surface), not global/local. Colors need re-mapping to Figma tokens.
- **MISSING: leading icon in tab-content; inverse scheme.** Height 40 ✓. No disabled state in Figma ✓ (repo has none either).

### ActionBar — GOOD, small gaps
- Figma: surface-color default/subtle/sunken/white-transparent/glass/midnight-base/midnight-raised/midnight-transparent ✓ all 8 in repo;
  leading type icon|image ✓; trigger chevron|button ✓ … but also **trigger=switcher — MISSING in repo**.
- **MISSING: bill-container (Type=Bill / Sub-text; State Compact|Expanded)** — expandable bill Action bar not implemented.
- New surface-color4 variant (32658:6917) — check design intent.

### SectionLink — PARTIAL
- Figma: surface default|inverse|glass × state default|focus|disabled.
- Repo: single light-surface style only. **MISSING inverse/glass surfaces and focus/disabled states.**

### QuickAction — PARTIAL
- Figma: 13 named icon types (app-level), layout Grid on/off × Carousel on/off × Row Single|Two|Three; variant Carousel|Stack; badge slots ✓.
- Repo: static grid w/ columns prop + badge ✓. **MISSING: carousel variant, row presets, stack variant.**

## LAYOUT + FEEDBACK

### Section — ✅ REWORKED (2026-07-21: size axis xs/sm/md/lg/xl → slot heights 72/148/224/300/452, surface default|inverse, trigger chevron|button|none, showHeader, titleLine, gradient; heading.lg title; hideChevron/onSeeAll back-compat)
- Figma .section-core: size xs|sm|md|lg|xl, surface Default|inverse, Title line 1-Line|2-line, chevron↔button no|yes.
- Repo Section: surfaces default/brand/brand-muted/midnight (no size axis, no explicit 2-line title handling, chevron only — no button alternative).
- **MISSING: size axis (xs–xl), chevron↔button toggle; surface axis naming differs (Default|inverse vs 4 ad-hoc surfaces).**

### Accordion — OK (flag)
- Figma: Accordion header Expanded=No|Yes only; section titled "do not use, development not yet started" 🔴.
- Repo has a basic Accordion — fine, but Figma marks it not-ready; expect changes.

### PlanUsageBar — MAJOR GAPS
- Figma atoms: .plan-usage/value|label|content (default|filled), .progress-bar-status (Default | low data),
  .plan-usage-bar, .usage-bar-set (plans=2 | 3 | low data warning | 4+), full "Plan usage" template w/ filter chips + action-bar
  (action bar appears when a plan is critically low/expired). Warning rule: expiring within 3 days OR below 30% remaining.
- Repo: single bar, tone switches at 75%/90% used — **threshold logic differs from Figma (30% remaining rule)**; no usage-bar-set, no chips/action-bar composition.

### Snackbar — ✅ MATCH (Success/Error/Warning/Loading/Default = repo positive/danger/warning/loading/default)

### Alert (inline msg) — CLOSE
- Figma .alert-message-container: Status Success|Alert|Warning|Info × subtitle on/off × description on/off; action type=text|primary.
- Repo Alert: positive/warning/danger/default tones w/ title+children+text action.
- **GAP: action type=primary (button) variant missing; check "Info" vs repo 'default' colors.**

### AlertModal — MISMATCH (verify visually)
- Figma Alert Modals page: full-bleed illustration state boxes ("Yaaay", "Empty", "Stop!") — illustration + big title + description + buttons.
- Repo AlertModal: small icon + title + body — no illustration layout. Needs design-context check before rework.

## OVERLAYS

### Tooltip — MAJOR GAPS
- Figma: standard core (alignment left|center|right, tail top|bottom, surface default|inverse, Mode Light|Dark) + **rich tooltip** (title, body, media image, steps, sizes L|M|S, caret up/down).
- Repo: minimal dark pill, placement top|bottom only. MISSING: alignment, light/default surface, rich variant.

### BottomSheet — MAJOR GAPS (modular system)
- Figma local components: Grabber (Light|Dark), Header (Light|Dark) + Header-iFrame, Main Title (lg|md|sm|xs) + Reduced Title, Footer (Default|Stacked|Horizontal|Terms&Conditions|Amount) + Sticky footer, Subheader (Search bar|Chips), Visual asset (Default|3D icon|Bg&Icon; incl. alert illustration templates), Benefit item (Icon|Tick|Bullet), Keyboard, iOS system bar, Skeleton state.
- Repo BottomSheet: grabber + title + scroll + generic footer. MISSING: footer types, visual-asset header, subheader, benefit items, dark display, skeleton.

## CARDS / BANNERS / PRODUCT-SPECIFIC

### ProductCard — PARTIAL
- Figma card-features (fixed 229×300): package(addon, no image, Smiles pts default) | product(image top) | category(bg color = category, image below label). Atoms: price-label (from|pay-only|smiles-combined), price (smiles|aed). Badge top-right 16px inset.
- Repo ProductCard covers addon+product loosely; **MISSING category variant, smiles/aed price atom structure, fixed 229×300 sizing; badge inset 8 vs 16.**

### DealCard ("Deals for you") — MISMATCH
- Figma deals-card fixed 166×224 with cta on/off variant; section banner 343×172 with logo-row, light-grey bg, max 7 carousel items.
- Repo DealCard 240-wide image+title card — different anatomy/size; no cta variant, no banner composition.

### PlanCard (plans-mini) — PARTIAL
- Figma plans-mini fixed 222×300; color-scheme default|inverse; surfaces: subtle|default|sunken + midnight-base|midnight-raised|glass-midnight|glass-white|brand; states: services on/off × badge on/off; anatomy: padding 16, label top-left, badge top-right, title 2 lines, logos 40px max 3 + "+N".
- Repo PlanCard: only default|brand|midnight, 210 wide, smiles avatars 24px. **MISSING 5 surface variants, wrong logo size, no explicit services/badge axes.**

### Card (General) — MAJOR GAPS
- Figma general-card core: title alignment Top|Bottom × media Size Sm|Md|Lg; surface default family (subtle|default|sunken) + inverse family (midnight-base|midnight-raised|glass-midnight|glass-white); layout Carousel|Grid (147 vs 166 wide × 224); Rows 1|2. All values tokenized.
- Repo Card: generic media/title/body/action, no axes at all.

### NewCard (new-on) — MISMATCH
- Figma new-on fixed 137×224, full-bleed image w/ gradient + tag ("New" story card); selected yes|no = outline on LAST carousel card only; tag+gradient shown for 3 days only; title 2 lines max 34 chars.
- Repo NewCard: 200-wide image-top + title-below card — different anatomy.

### Recommendation (action-card) — **MISSING ENTIRELY**
- Figma action-card 292×148: color-scheme default|inverse; surfaces subtle|default|sunken + midnight-base|midnight-raised|midnight-transparent|white-transparent|glass; used in "Container cards" carousel with header. No repo component.

### ServiceCard — ROUGH MATCH (verify)
- Figma Category tile 109×148: offers badge top, 3D icon 50×50, label below. Repo ServiceCard similar structure; check exact size/tokens.

### Highlight — PARTIAL
- Figma highlight-banner: carousel yes|no × size xl(335×452)|lg(335×300); content type informational|action; .highlight-tag (basic-badge yes|no); logo treatment single|glass|fill; headline 1-line 15 chars / 2-line 29 chars; carousel gap 8px; bottom-biased dark gradient ✓ (repo has gradient).
- Repo Highlight: tone image|brand|purple + action tile. **MISSING xl/lg size axis, tag atom, logo treatments (SmilesRow is hardcoded), carousel sizing.**

### SmilesBalance — MISMATCH
- Figma smiles-balance-card 353×148; states points-activated|points-not-active; .next-tier silver|gold|plat progress atom.
- Repo: static gold gradient row w/ Redeem — no states, no next-tier.

### Voucher — STRUCTURAL MISMATCH
- Figma Voucher: small ticket-shape card 144×144 (boolean-op notched shape), Display Light|Dark × State Default|Applied, title/description + button.
- Repo Voucher: full-width dashed row w/ code + status badge — entirely different.

## PRIMITIVES

### Badge — CLOSE MATCH + gaps
- Offers: all 12 Figma offer types present in repo ✓. Status: neutral/neutral-inverse/disabled/positive/warning/danger ✓ (repo has all incl. neutral-inverse).
- Repo `brand` status does not exist in Figma (already flagged in code) — remove or confirm.
- **MISSING: tier number badges — Bronze | Silver | Silver+ | Gold | Gold+ | Platinum (sm/md/lg, set 26501:2084…)**

### ProgressBar — ✅ MATCH (300×4 core, 5–100% in 5% steps; repo continuous value OK)

### Stepper (31614:11244) — ✅ IMPLEMENTED (2026-07-19: Stepper in primitives.tsx, steps 2-8 × progress × inverse)
- Segmented progress: .stepper-segment 110×4, active×inverse states; stepper steps=2..8, progress=0..8, scheme default|inverse, 375×6 track.

### AddTrigger — MISMATCH
- Figma: 285×72, radius 16px, 1px dashed border, 20px icon, single-line label; surface default|inverse.
- Repo: height 40 PILL radius — wrong shape/size; missing inverse.

### Dismiss (28961:16066) — ✅ IMPLEMENTED (2026-07-21: Dismiss in primitives.tsx — circular close, surface default|inverse × size md(24)|sm(20))

### LogoRow — PARTIAL
- Figma: size sm(24)|md(32)|lg(40) × style Default|glass(-margin); `more-items` (+N) chip surface default|inverse.
- Repo: fixed 32px row, no size/style axes, no +N overflow.

### AtomSurface — WRONG CONCEPT
- Figma "Atom-Surfaces" page = `.card-bg-color`: category card background colors default|red|orange|yellow|green|cyan|blue|violet.
- Repo AtomSurface renders surface.{level} panels — not the same thing. Rework as CardBgColor.

### Logo (e&) — PLACEHOLDER
- Figma e&-logo: real logo asset, versions default|white|midnight|red (96×96). Repo renders styled text "e&" — needs real SVG asset + version prop.

### Icon sizes — TOKENS ✓, USAGE ✗
- Token ramp matches Figma exactly (xs8/sm12/md16/lg20/xl24/2xl32/3xl40/4xl48) ✓; categories 2d|logo|3d (repo has no category concept — minor).
- ✅ FIXED 2026-07-19 (Searchbar→lg, Chip→md, FilterPill chevron→md, AddTrigger→lg, SectionLink chevron→md, Input→lg): components passed wrong size keys — e.g. Searchbar icons `size="sm"`(12px) but Figma = 20px (lg); FilterPill chevron `xs`(8px) but Figma = 16px (md); Chip leading icon sm(12) vs Figma 20; SectionLink chevron xs(8) vs ~16. Audit all Icon call sites.

### Accordion note: Figma page marked "do not use, development not yet started".

#!/usr/bin/env python3
"""Write token-model-derived anatomy files for components not yet Figma-verified.
Grounded in the component's token groups + the locked layout rules + standard e&
mobile patterns. The generator labels these 'derived ... pending verification'.
Never overwrites a verified slug. Re-run safe (skips files already present unless --force)."""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANATOMY = os.path.join(ROOT, "tools", "anatomy")
VERIFIED = {"buttons","input-field","chips","filter-pill","switcher","checkbox","radio",
            "searchbar","eand-logo","badges","icon-size","top-bar"}

A = {
# ---- Navigation
"nav-bar": """\
  - **Type:** bottom tab bar — 3–5 destinations, sticky, respects bottom safe-area.
  - **Item anatomy:** icon (24) over label (caption), centered; equal-width items. Optional badge dot/count on an item; optional center emphasized/FAB item.
  - **States (per item):** active (icon + label use accent/brand) · inactive (muted) — `color/navbar-tab/*`.
  - **Sizing:** width fill; height fixed (token) + bottom inset.
  - **Make hint:** map any persistent UX bottom tab bar here; set the current screen's tab to active.""",
"action-bar": """\
  - **Type:** sticky action footer pinned above the Nav bar (or to the bottom on flow screens).
  - **Anatomy:** top divider/elevation + 1–2 Buttons (fill-width) + optional helper text/price above.
  - **Variants:** single primary · primary + secondary (stacked or side-by-side) · with helper/summary row.
  - **Sizing:** width fill; height hug (button height + `spacing` padding); respects bottom inset.
  - **Make hint:** when a UX screen has one persistent primary CTA at the bottom, use this (not an inline Button).""",
"tabs": """\
  - **Type:** in-page tab switcher (segment the content of one screen).
  - **Anatomy:** horizontal row of tab items (label, optional leading icon/badge) + active indicator (underline/pill); scrolls horizontally if items overflow.
  - **States (per tab):** selected · default · disabled — `color/tab/*`; sizing from `size.tabs`.
  - **Sizing:** width fill; height fixed (`tabs` token). Items hug or equal-distributed.
  - **Make hint:** map a UX in-screen segmented control / tab strip here; place directly under Top bar or at a Section's top.""",
"section-link": """\
  - **Type:** Section header row (titles a Section, optional action).
  - **Anatomy:** title (left) + optional 'see all' link / chevron (right). Optional leading icon or subtitle.
  - **Variants:** title only · title + see-all · title + chevron · with subtitle.
  - **Sizing:** width fill; height fixed (`size.section-link`).
  - **Make hint:** add at the top of any titled Section; link to the full list/screen.""",
"quick-action": """\
  - **Type:** quick-action shortcut grid (top tasks on Home).
  - **Anatomy:** grid (typically 4-up per row) of cells = circular/rounded icon tile + short label below; wraps to multiple rows.
  - **States:** default · pressed · disabled (per cell); optional badge on a cell.
  - **Sizing:** container width fill, height hug; cells equal-width (grid), fixed-height each.
  - **Make hint:** map a UX grid of small icon+label shortcuts here.""",
# ---- Layout
"section": """\
  - **Type:** the primary full-width body container — groups related content into a titled block.
  - **Anatomy:** optional **Section link** header → body content (any of: card carousel, stacked cards, list rows, grid, controls). Vertical padding + inter-item gap from `size.section`.
  - **Variants:** with/without header · padded body vs full-bleed body (carousels/banners bleed to edges) · light vs inverse surface.
  - **Sizing:** width **fill** (full screen width); height **hug** content.
  - **Make hint:** every distinct UX content block → one Section. Stack Sections vertically in the scroll body with the section-gap token.""",
"accordion": """\
  - **Type:** expand/collapse disclosure container (FAQ, details).
  - **Anatomy:** header row (title + trailing chevron, rotates) + collapsible body; divider between items; chevron up=expanded / down=collapsed.
  - **States:** collapsed · expanded × disabled; single- or multi-open.
  - **Sizing:** width fill; height hug (animates between collapsed/expanded).
  - **Make hint:** map a UX list of expandable rows / FAQ here.""",
# ---- Feedback & status
"plan-usage-bar": """\
  - **Type:** consumption meter (data/minutes/quota vs plan).
  - **Anatomy:** label + used/total values + **Progress bar** fill; optional status text/CTA ('Add data').
  - **States (by level):** normal · warning (near limit) · danger (over/depleted) — `color/status/*`.
  - **Sizing:** width fill; height hug.
  - **Make hint:** map a UX usage/quota meter; pick level color by remaining %.""",
"snackbar-and-alert-msg": """\
  - **Type:** transient snackbar (floats, bottom) OR inline alert message (in a Section).
  - **Anatomy:** status icon + message text + optional action link + optional dismiss (×). Single or two-line.
  - **States:** info · positive · warning · danger (`color/status/*`); with/without action; auto-dismiss (snackbar) vs persistent (inline).
  - **Sizing:** width fill (with side margin); height hug.
  - **Make hint:** transient feedback → snackbar overlay; persistent contextual message → inline alert inside the Section it relates to.""",
"alert-modals": """\
  - **Type:** centered modal dialog over a scrim (blocking decision).
  - **Anatomy:** optional illustration/icon + title + body text + action Buttons (1–2, stacked or row) + optional dismiss (×).
  - **States:** info · positive · warning · danger; 1-action (acknowledge) · 2-action (confirm/cancel).
  - **Sizing:** width fill with side margin (max width); height hug; centered; scrim behind.
  - **Make hint:** use for confirmations/irreversible actions; not for transient info (use snackbar).""",
# ---- Overlays
"tooltip": """\
  - **Type:** small contextual hint / coachmark anchored to a control.
  - **Anatomy:** container + text (optional title) + directional arrow pointing at the anchor; optional dismiss for coachmarks.
  - **States (placement):** top · bottom · left · right (arrow follows); with/without title.
  - **Sizing:** width hug (max width, wraps); height hug.
  - **Make hint:** attach to an icon/control that needs explanation; keep copy short.""",
"bottom-sheet": """\
  - **Type:** modal panel sliding up from the bottom over a scrim.
  - **Anatomy:** drag handle (grabber) + optional header (title + dismiss) + scrollable content + optional sticky footer (Action bar).
  - **States:** snap points (peek / half / full ~90%); with/without handle/header/footer; dismiss by drag-down or scrim tap.
  - **Sizing:** width fill; height variable up to ~90% screen; content scrolls inside.
  - **Make hint:** map UX 'slide-up panel / picker / detail drawer' here; put its primary CTA in the sheet's footer Action bar.""",
# ---- Cards
"general": """\
  - **Type:** generic content card.
  - **Anatomy:** optional media/icon (top or leading) + title + body text + optional Badge + optional action (Button/link). Rounded corners (`border-radius`), surface fill (`atom-surfaces`), `size.card` padding.
  - **States:** default · pressed (if tappable) · with/without media · with/without action.
  - **Sizing:** width fill when stacked in a Section; height hug.
  - **Make hint:** default choice for a vertical list of content blocks.""",
"product": """\
  - **Type:** product tile (device/accessory/plan add-on).
  - **Anatomy:** product image + title + price (+ strikethrough/discount) + optional Badge (promo/new) + CTA (Add/Buy).
  - **States:** default · discounted (Badge) · out-of-stock/disabled.
  - **Sizing:** **fixed width** in a horizontal carousel; **fill width** if stacked. Height hug.
  - **Make hint:** UX 'swipeable product row' → carousel Section of these (fixed width).""",
"deals-for-you": """\
  - **Type:** personalized offer/deal tile.
  - **Anatomy:** image/brand + offer headline + sub/terms + Badge (expiring/limited) + CTA.
  - **States:** default · expiring/limited (Badge) · redeemed/disabled.
  - **Sizing:** fixed width (carousel item); height hug.
  - **Make hint:** UX 'Deals for you' horizontal scroller → carousel Section of these.""",
"plans": """\
  - **Type:** selectable plan card (tariff/bundle).
  - **Anatomy:** plan name + price/period + feature list (data/mins/SMS) + Badge (recommended) + CTA (Choose); optional highlighted border when recommended/selected.
  - **States:** default · recommended/selected (Badge + border) · disabled.
  - **Sizing:** fixed width (carousel) or fill (stacked comparison); height hug.
  - **Make hint:** UX plan picker → carousel or stacked Section of these; mark one 'recommended'.""",
"new-on-eand": """\
  - **Type:** editorial 'newly launched' tile.
  - **Anatomy:** media (image/illustration) + title + optional subtitle/CTA.
  - **States:** default; optional 'New' Badge.
  - **Sizing:** fixed width (carousel item); height hug.
  - **Make hint:** UX 'New on e&' discovery row → carousel Section.""",
"recommendation": """\
  - **Type:** recommended item tile (cross-sell/upsell). _(no node-id yet — send link to verify)_
  - **Anatomy:** media + title + short reason + CTA; optional Badge.
  - **States:** default · disabled.
  - **Sizing:** fixed width (carousel item); height hug.
  - **Make hint:** UX 'Recommended for you' row → carousel Section.""",
"service": """\
  - **Type:** service/feature entry.
  - **Anatomy:** icon (or small image) + label (+ optional sublabel/chevron). Grid cell or full-width list row.
  - **States:** default · pressed · disabled; optional badge.
  - **Sizing:** grid cell (equal width) or fill (row); height hug/fixed-row.
  - **Make hint:** UX services grid/list → Section of these (grid for icon+label, rows for richer items).""",
# ---- Banners
"highlight": """\
  - **Type:** promotional / announcement banner (full-bleed).
  - **Anatomy:** background media/color + title + subtitle + CTA (Button) + optional logo/badge; can be a single banner or a swipeable carousel with dots.
  - **States:** default · with/without CTA · light vs dark media (text/`button` tone adapts) · single vs carousel.
  - **Sizing:** width fill **edge-to-edge** (bleeds past the screen gutter); height hug / fixed aspect.
  - **Make hint:** UX hero/promo strip → place between Sections, full-bleed.""",
# ---- Product-specific
"smiles-balance": """\
  - **Type:** Smiles loyalty balance module.
  - **Anatomy:** Smiles mark/icon + points balance (large number) + label + CTA ('Redeem'/'See rewards'); tier-themed background (special palettes: gold/silver/platinum/bronze).
  - **States:** by tier (special palette); zero vs positive balance.
  - **Sizing:** width fill; height hug.
  - **Make hint:** UX loyalty/points widget on Home or rewards → this module near the top.""",
"voucher": """\
  - **Type:** voucher / coupon.
  - **Anatomy:** value/offer + code (with copy affordance) + validity/expiry + status Badge; often a ticket shape (notch/perforation).
  - **States:** active · redeemed · expired (status Badge + dimming).
  - **Sizing:** width fill (stacked) or fixed (carousel); height hug.
  - **Make hint:** UX coupons/rewards list → Section of these; reflect status via Badge.""",
# ---- Controls (remaining)
"ai-search": """\
  - **Type:** AI / voice-assisted search entry.
  - **Anatomy:** search field + mic/AI affordance; expands into dictation/transcription UI (waveform + live transcript + stop).
  - **States:** Default · Focus · Dictation started · Transcribing (→ user taps stop). _(states confirmed via REST)_
  - **Sizing:** width fill; height fixed (collapsed); expands when dictating.
  - **Make hint:** UX 'search with mic / ask AI' → this; otherwise use Searchbar.""",
"selectors": """\
  - **Type:** option selectors (segmented control / option rows / quantity / dropdown trigger).
  - **Anatomy:** group of options (segments or rows) with a selected indicator; or a value field + chevron that opens a Bottom sheet/menu.
  - **States:** default · selected · disabled; single-select.
  - **Sizing:** width fill or hug; height fixed.
  - **Make hint:** UX 'pick one of a few' → segmented Selectors; 'pick from many' → Selector that opens a Bottom sheet.""",
# ---- Primitives (remaining)
"progress-bar": """\
  - **Type:** linear progress / completion indicator.
  - **Anatomy:** rounded track + fill; optional label/percentage; steps variant = segmented track.
  - **States:** determinate (0–100%) · indeterminate (animated); status color via `color/status/*`.
  - **Sizing:** width fill; height fixed (thin track token).
  - **Make hint:** use inside Plan Usage Bar, onboarding/step flows, uploads.""",
"add-trigger": """\
  - **Type:** add / plus trigger (entry to add an item).
  - **Anatomy:** plus icon + label (e.g. 'Add line', 'Add card'); dashed/ghost container or inline link style.
  - **States:** default · pressed · disabled.
  - **Sizing:** width hug (or fill as a list row); height fixed.
  - **Make hint:** UX 'add new …' affordance at the end of a list/form.""",
"atom-surfaces": """\
  - **Type:** base container surfaces (the building-block backgrounds for cards/sheets/sections).
  - **Anatomy:** a filled rounded rectangle at an elevation level; everything else composes on top.
  - **Levels:** canvas · base · raised · sunken (+ brand/midnight tints) — `color/atom-surfaces` / `color/surface/*`.
  - **Sizing:** width fill; height hug.
  - **Make hint:** not placed directly — it's the surface token applied to containers.""",
"logo-row": """\
  - **Type:** row of partner/product logos.
  - **Anatomy:** horizontal row (or wrap) of equal-height logo lockups with consistent gaps; optional 'as seen on / partners' label.
  - **States:** default; scroll if overflow.
  - **Sizing:** width fill; height hug (logos share a fixed height).
  - **Make hint:** UX 'partners / works with' strip → this inside a Section.""",
"dismiss": """\
  - **Type:** close / clear / remove affordance. _(no node-id yet — send link to verify)_
  - **Anatomy:** icon button (×, chevron-down, or clear) in a ≥40px tap target.
  - **States:** default · pressed · disabled.
  - **Sizing:** fixed (icon ~24, tap ~40).
  - **Make hint:** top-right of Sheets/Modals/Snackbars; trailing on removable Chips/Searchbar.""",
"product-assets": """\
  - **Type:** product imagery / illustration assets. _(no node-id yet — send link to verify)_
  - **Anatomy:** image asset rendered at a fixed aspect ratio; consistent background/padding within tiles.
  - **States:** loaded · placeholder/skeleton.
  - **Sizing:** fills its tile width or fixed tile size; height by aspect ratio.
  - **Make hint:** the media slot inside Product/Deals/New cards.""",
}

def main():
    os.makedirs(ANATOMY, exist_ok=True)
    force = "--force" in sys.argv
    wrote = 0
    for slug, md in A.items():
        if slug in VERIFIED:
            continue
        path = os.path.join(ANATOMY, slug + ".md")
        if os.path.exists(path) and not force:
            # don't clobber an existing (possibly verified) file
            continue
        open(path, "w").write(md.rstrip() + "\n")
        wrote += 1
        print(f"  wrote {slug}.md")
    print(f"derived anatomy written: {wrote}")

if __name__ == "__main__":
    main()

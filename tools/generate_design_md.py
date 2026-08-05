#!/usr/bin/env python3
"""Generate design.md — the e& DSL master file for Figma Make.
Resolves all tokens from variables.json, maps them onto the component inventory,
and adds the layout system, per-component behavior/composition, a composition map,
and screen-assembly recipes so Make can turn UX wireframes into UI screens."""
import json, os, re, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VARS = os.path.join(ROOT, "variables.json")
OUT = os.path.join(ROOT, "design.md")
ANATOMY = os.path.join(ROOT, "tools", "anatomy")
FILE_KEY = "pzm63BTLfPfT1stcF89ILQ"  # V1.1 (e& UAE Consumer org); node-ids preserved from V1.0
FIG = f"https://www.figma.com/design/{FILE_KEY}/e--Consumer-App-DSL-V1.1?node-id="

def slugify(name):
    s = name.lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def is_leaf(n): return isinstance(n, dict) and "$value" in n
def deep_merge(t, s):
    for k, v in s.items():
        if is_leaf(v): t[k] = v
        else: t.setdefault(k, {}); deep_merge(t[k], v)
def load_merged(raw):
    m = {}
    for col in raw:
        name = list(col.keys())[0]; deep_merge(m, col[name]["modes"]["value"])
    return m
def lookup(tree, dotpath):
    node = tree
    for seg in dotpath.split("."):
        if not isinstance(node, dict): return None
        node = node.get(seg)
    return node if is_leaf(node) else None
def resolve(tree, leaf, seen=None):
    seen = seen or set(); v = leaf["$value"]
    if isinstance(v, str):
        ref = None
        if v.startswith("{") and v.endswith("}"):
            ref = v[1:-1]                       # V1.0 alias: {color.red.1000}
        elif v.startswith("$."):
            ref = ".".join(v[2:].split(".")[2:])  # V1.1 alias: $.<collection>.value.<path>
        if ref:
            if ref in seen: return v
            seen.add(ref); tgt = lookup(tree, ref)
            return resolve(tree, tgt, seen) if tgt else v
    return v
def resolved_tree(tree):
    def walk(n): return resolve(tree, n) if is_leaf(n) else {k: walk(v) for k, v in n.items()}
    return walk(tree)
def md_tree(d, indent=0):
    out = []
    for k, v in d.items():
        if isinstance(v, dict): out.append("  "*indent + f"- **{k}**"); out += md_tree(v, indent+1)
        else: out.append("  "*indent + f"- `{k}` → `{v}`")
    return out

WEIGHT_NUM = {"Thin":"100","Light":"300","Regular":"400","Book":"450","Medium":"500",
              "Semi bold":"600","Bold":"700","Black":"800"}

# Slugs whose anatomy was pulled directly from Figma (verified). All others with an
# anatomy file are token-model-derived (labeled accordingly, pending verification).
VERIFIED = {"buttons","input-field","chips","filter-pill","switcher","checkbox","radio",
            "searchbar","eand-logo","badges","icon-size","top-bar","tabs",
            "nav-bar","action-bar","section-link","quick-action","section","accordion",
            "plan-usage-bar","snackbar-and-alert-msg","alert-modals","tooltip","bottom-sheet",
            "general","product","deals-for-you","plans","new-on-eand","service","highlight",
            "smiles-balance","voucher","selectors","progress-bar","add-trigger","atom-surfaces",
            "logo-row"}

# ---- component inventory: (name, node, role, color_groups, size_groups, typo_groups)
SECTIONS = [
 ("01 · Primitives", [
   ("e& Logo","27020-6155","Brand logo lockups.",[],[],[]),
   ("Badges","22668-60275","Membership/status/promo badges.",["badge"],[],["badge"]),
   ("Icon size","25460-22589","Icon sizing scale.",[],["icon"],[]),
   ("Logo row","25996-32494","Row of partner/product logos.",[],[],[]),
   ("Progress bar","26663-89882","Linear progress indicator.",["status"],[],[]),
   ("Add trigger","25752-11470","Add / plus trigger control.",["button"],[],[]),
   ("Atom Surfaces","26729-91998","Base container surfaces.",["atom-surfaces","surface"],[],[]),
 ]),
 ("02 · Controls", [
   ("Buttons","22542-13972","Primary/secondary/tertiary/link buttons.",["button"],[],["button"]),
   ("Input Field","22609-113539","Text input with label/helper/error.",["input-field"],["border"],["body"]),
   ("Chips","28171-29640","Selectable chips / tags.",["chips"],[],["body"]),
   ("Filter Pill","25581-9146","Filter pills with chevron.",["filter-pill"],[],["body"]),
   ("Checkbox","25394-83294","Checkbox control.",["border","icon"],["checkbox"],[]),
   ("Switcher","25394-82591","Toggle switch.",["surface","border"],["switcher"],[]),
   ("Radio","25394-83997","Radio control.",["border","icon"],["radio"],[]),
   ("Searchbar","28114-62397","Search input.",["input-field","surface"],[],["body"]),
   ("AI Search","28189-33142","AI / voice search entry.",["input-field","surface"],[],["body"]),
   ("Selectors","28278-1530","Segmented / option selectors.",["surface","border"],[],["body"]),
 ]),
 ("03 · Navigation", [
   ("Top bar","22542-13963","App header bar.",["surface","text","icon"],[],["title","heading"]),
   ("Nav bar","22542-13964","Bottom navigation bar.",["navbar-tab"],[],["body"]),
   ("Action bar","25519-15621","Sticky action footer.",["surface","button"],[],["button"]),
   ("Tabs","22542-13966","In-page tab switcher.",["tab"],["tabs"],["title","body"]),
   ("Section link","25460-83978","Section header + see-all.",["text","icon"],["section-link"],["title","body"]),
   ("Quick Action","25507-13670","Quick-action shortcut grid.",["surface","text","icon"],[],["body"]),
 ]),
 ("04 · Layout", [
   ("Section","25519-12055","Full-width content container.",["surface","text"],["section"],["heading","title"]),
   ("Accordion","27465-29326","Expand/collapse container.",["surface","text","border","icon"],[],["title","body"]),
   ("List row","","Settings / contact / overview / usage row.",["surface","text"],[],["title","body"]),
 ]),
 ("05 · Feedback & Status", [
   ("Plan Usage Bar","26663-89880","Plan / data usage meter.",["status","surface","text"],[],["body"]),
   ("Snackbar & Alert msg","22574-22808","Snackbars + inline alerts.",["status","surface","text"],[],["body"]),
   ("Alert Modals","23201-17897","Modal alerts / dialogs.",["status","surface","text"],[],["title","body"]),
 ]),
 ("06 · Overlays", [
   ("Tooltip","23201-15868","Tooltip / coachmark.",["surface","text"],[],["body"]),
   ("Bottom sheet","27907-11716","Bottom sheet container.",["surface","text"],[],["title","body"]),
 ]),
 ("07 · Cards", [
   ("General","26760-100129","Generic content card.",["surface","border","text"],["card"],["title","body"]),
   ("Product","25701-12472","Product card.",["surface","border","text"],["card"],["title","body"]),
   ("Deals for you","25717-33323","Deal card.",["surface","border","text"],["card"],["title","body"]),
   ("Plans","25915-74211","Plan card.",["surface","border","text"],["card"],["title","body"]),
   ("New on e&","25915-75766","'New on e&' card.",["surface","border","text"],["card"],["title","body"]),
   ("Service","26019-79144","Service card.",["surface","border","text"],["card"],["title","body"]),
 ]),
 ("08 · Banners", [
   ("Highlight","25460-83982","Highlight / promo banner.",["surface","text","button"],[],["heading","body"]),
 ]),
 ("09 · Product-Specific", [
   ("Smiles Balance","26610-601","Smiles loyalty balance module.",["special","surface","text"],[],["title","body"]),
   ("Voucher","28278-13069","Voucher / coupon.",["special","surface","text","border"],[],["title","body"]),
 ]),
]

# ---- curated behavior/composition metadata (slug -> dict). Applies the locked sizing model:
# controls = fill-width + fixed token height; containers = fill-width + hug; bars = fill-width + fixed.
B = {
 "eand-logo": dict(slot="Primitive / brand", w="hug", h="fixed (lockup sizes)",
   states="version: primary · monochrome · app-icon", contains="logomark + wordmark",
   within="Top bar, Highlight banner, splash", use="Brand identity mark."),
 "badges": dict(slot="Primitive / indicator (inline)", w="hug", h="fixed (24; lg/md/sm)",
   states="type (tier: Gold/Silver/Platinum/Bronze/+ · promo: Best seller/Discount/New/Sold out/Limited… · status: positive/warning/danger/neutral/disabled) × size (lg/md/sm)",
   contains="label (+ optional leading dot/icon)", within="Cards, Product, Plans, list items, Top bar",
   use="Small status/tier/promo label attached to other content."),
 "icon-size": dict(slot="Primitive / token (sizing scale)", w="n/a", h="fixed (xs8 sm12 md16 lg20 xl24 2xl32 3xl40 4xl48)",
   states="category: icon · 3d-icon · logo", contains="—", within="every icon-bearing component",
   use="Canonical icon dimensions; pick by density/role."),
 "logo-row": dict(slot="Primitive / media row", w="fill", h="hug",
   states="—", contains="row of brand/partner logos", within="Sections, Highlight",
   use="Display a set of partner/product logos."),
 "dismiss": dict(slot="Primitive / control (icon button)", w="fixed", h="fixed (≥24 glyph, ~40 tap target)",
   states="default · pressed · disabled", contains="close/×/clear icon",
   within="Bottom sheet, Alert modal, Snackbar, removable Chips, Searchbar",
   use="Close/clear/remove affordance."),
 "progress-bar": dict(slot="Primitive / status", w="fill", h="fixed (thin track token)",
   states="determinate (0–100%) · indeterminate", contains="track + fill",
   within="Plan usage bar, onboarding, uploads", use="Linear progress / completion."),
 "add-trigger": dict(slot="Primitive / control", w="hug", h="fixed",
   states="default · pressed · disabled", contains="plus icon + label",
   within="lists, forms, empty states", use="Entry point to add an item (line/card/address)."),
 "product-assets": dict(slot="Primitive / media", w="varies (often fill or fixed tile)", h="hug (aspect-ratio)",
   states="—", contains="product image/illustration", within="Product/Deals/New cards",
   use="Product imagery; respects aspect ratio."),
 "atom-surfaces": dict(slot="Primitive / surface", w="fill", h="hug",
   states="surface levels (canvas/base/raised/sunken)", contains="—",
   within="Cards, Sections, Sheets (as background)", use="Base elevation surfaces for containers."),

 "buttons": dict(slot="Control / CTA", w="fill (block CTA) or hug (inline)", h="fixed (lg48 / md40 / sm32)",
   states="type (primary/secondary/tertiary/link) × tone (brand/inverse/midnight/white) × state (default/focus/disabled)",
   contains="leading icon? · label · trailing icon?", within="Action bar, forms, Cards, Banners, Sheets",
   use="Trigger the primary or secondary action."),
 "input-field": dict(slot="Control / form", w="fill", h="fixed (~52 + label/status)",
   states="style (Filled/Outlined) × state (Enabled/Hovered/Focused/Error/Disabled) × leading/trailing icon · types: text/comment/dropdown/otp/picker",
   contains="Section label · [leading icon · value/placeholder · trailing icon] · status (helper/error)",
   within="forms inside Sections", use="Capture typed/selected input."),
 "chips": dict(slot="Control / selection (inline)", w="hug", h="fixed (40)",
   states="state (default/focus/disabled) × icon (on/off) · Loader",
   contains="leading visual (icon20 / 40×40 brand / none) · label", within="horizontal chip/filter rows (scroll), forms",
   use="Selectable tag / quick filter."),
 "filter-pill": dict(slot="Control / filter (inline)", w="hug", h="fixed (40)",
   states="state (default/focus/disabled) × color (default/inverse)",
   contains="label + trailing chevron (16)", within="horizontal filter row (scroll) at top of a list Section",
   use="Toggle/open a filter."),
 "checkbox": dict(slot="Control / form", w="fixed", h="fixed (lg24 / sm20)",
   states="selected (yes/no) × disabled × size", contains="box + check glyph (+ optional label row)",
   within="forms, consent rows, multi-select lists", use="Multi-select / boolean opt-in."),
 "switcher": dict(slot="Control / form", w="fixed (lg56 / sm48)", h="fixed (24 / 20)",
   states="state (on/off) × disabled × color-scheme (default/inverse) × size",
   contains="track + white knob", within="settings rows", use="Instant on/off toggle."),
 "radio": dict(slot="Control / form", w="fixed", h="fixed (lg24 / sm20)",
   states="selected (yes/no) × disabled", contains="ring + center dot (+ optional label row)",
   within="single-select option lists", use="Single-select from a set."),
 "searchbar": dict(slot="Control / search", w="fill", h="fixed (52)",
   states="Default · Typing · Typed × surface (white/midnight)",
   contains="leading search/clear icon20 · value · trailing mic/submit icon20",
   within="below Top bar or top of a list Section", use="Free-text search entry."),
 "ai-search": dict(slot="Control / search", w="fill", h="fixed",
   states="Default · Focus · Dictation started · Transcribing",
   contains="search field + mic/AI affordance + transcription state", within="search surfaces",
   use="Voice/AI-assisted search."),
 "selectors": dict(slot="Control / selection", w="fill or hug", h="fixed",
   states="default · selected · disabled", contains="segmented options / option rows",
   within="forms, filter sheets", use="Choose one option from a small set."),

 "top-bar": dict(slot="Header (sticky top, respects top safe-area)", w="fill", h="fixed (token)",
   states="default · with title · with back · with actions · transparent/scrolled",
   contains="leading (logo/back) · title · trailing action icons", within="top of every screen",
   use="Screen identity, back nav, screen-level actions.", key=True),
 "nav-bar": dict(slot="Bottom nav (sticky bottom, global, respects bottom safe-area)", w="fill", h="fixed (token + inset)",
   states="per tab: active / inactive (color/navbar-tab)", contains="3–5 nav-tab items (icon + label)",
   within="bottom of top-level (tabbed) screens", use="Switch between top-level destinations.", key=True),
 "action-bar": dict(slot="Footer (sticky, above Nav bar; optional)", w="fill", h="fixed (hug button + padding)",
   states="1-button · 2-button · with helper text", contains="1–2 Buttons (fill-width)",
   within="bottom of task/flow screens", use="Persistent primary screen CTA."),
 "tabs": dict(slot="Body / in-page switcher", w="fill", h="fixed (tabs token)",
   states="per tab: selected/default (color/tab) · scrollable if overflow",
   contains="tab items (label, optional badge)", within="below Top bar or inside a Section",
   use="Switch content within one screen."),
 "section-link": dict(slot="Body / section header row", w="fill", h="fixed (section-link token)",
   states="with/without action · with/without chevron", contains="title + 'see all' link/chevron",
   within="top of a Section", use="Title a Section and link to its full view."),
 "quick-action": dict(slot="Body / grid", w="fill", h="hug",
   states="—", contains="grid of borderless white cards (radius 20, 4px cell gap) — each a grey radius-12 icon square (filled e& icon) + label + optional count badge",
   within="a Section near top of Home",
   use="Compact grid of top tasks. Cards have NO border (white on the grey Section)."),

 "section": dict(slot="Body / container (THE layout wrapper)", w="fill (full screen width)", h="hug (content)",
   states="with/without header (Section link) · padded vs full-bleed body",
   contains="optional Section link header + body (Cards / lists / controls / carousels). Stacked slot components share a tight 4px gap; carousels keep card spacing.",
   within="the vertical scroll stack between Top bar and Nav bar",
   use="Group related content into a titled, full-width block. The primary building block of a screen.", key=True),
 "list-row": dict(slot="Body / list item", w="fill", h="hug",
   states="with/without leading icon · with value · with chevron · pressed",
   contains="leading icon (grey square) + label (+ sublabel) + value/Button + chevron",
   within="a Section (Settings, Contact us, Profile overview, plan-usage lists)",
   use="A tappable row: navigate to a setting/section, or show a label↔value pair."),
 "accordion": dict(slot="Body / container", w="fill", h="hug (expands/collapses)",
   states="expanded · collapsed × disabled", contains="header row (title + chevron) + collapsible body",
   within="a Section (FAQ/details)", use="Progressive disclosure of grouped content."),

 "plan-usage-bar": dict(slot="Body / status module", w="fill", h="hug",
   states="usage level: normal / warning / danger (color/status)",
   contains="label + Progress bar + used/total values", within="a Section on dashboard/plan screens",
   use="Show consumption against a plan/quota."),
 "snackbar-and-alert-msg": dict(slot="Overlay (transient, bottom) / inline alert", w="fill (with side margin)", h="hug",
   states="info / positive / warning / danger (color/status) · with/without action · auto-dismiss",
   contains="status icon + message + optional action + dismiss", within="floats above content / inline in a Section",
   use="Transient feedback or inline status message."),
 "alert-modals": dict(slot="Overlay (centered modal + scrim)", w="fill (with margin) / max width", h="hug",
   states="info / positive / warning / danger · 1–2 actions",
   contains="title + body + action Buttons + dismiss", within="floats above content with scrim",
   use="Blocking confirmation / decision."),

 "tooltip": dict(slot="Overlay (anchored)", w="hug (max width)", h="hug",
   states="placement: top/bottom/left/right · with/without arrow/title",
   contains="text (+ optional title)", within="anchored to a control/icon",
   use="Contextual hint or coachmark."),
 "bottom-sheet": dict(slot="Overlay (anchored bottom + scrim)", w="fill", h="hug / variable (snap points, max ~90%)",
   states="snap sizes · with/without drag handle/header/footer",
   contains="drag handle + header + scrollable content + optional Action bar footer",
   within="slides up over content", use="Modal content, pickers, detail panels.", key=True),

 "general": dict(slot="Card (in a Section)", w="fill (stacked) ", h="hug",
   states="with/without media · with/without action", contains="media/icon + title + body + optional Button/Badge",
   within="a vertical Section", use="Generic content card."),
 "product": dict(slot="Card (carousel item, or stacked)", w="fixed (carousel) / fill (stacked)", h="hug",
   states="default · with badge · out-of-stock/disabled", contains="image + title + price + Badge + CTA",
   within="a horizontal carousel Section", use="Show a buyable product."),
 "deals-for-you": dict(slot="Card (carousel item)", w="fixed (carousel)", h="hug",
   states="default · expiring/limited (Badge)", contains="image + offer text + Badge + CTA",
   within="a horizontal 'Deals for you' carousel Section", use="Personalized offer tile."),
 "plans": dict(slot="Card (carousel or stacked)", w="fixed (carousel) / fill (stacked)", h="hug",
   states="default · recommended/selected (Badge/border) · disabled",
   contains="plan name + price + feature list + Badge + CTA", within="a plans Section",
   use="Present a selectable plan."),
 "new-on-eand": dict(slot="Card (carousel item)", w="fixed (carousel)", h="hug",
   states="default", contains="media + title + optional CTA", within="a 'New on e&' carousel Section",
   use="Editorial / newly-launched tile."),
 "recommendation": dict(slot="Card (carousel item)", w="fixed (carousel)", h="hug",
   states="default", contains="media + title + CTA", within="a recommendations carousel Section",
   use="Recommended item tile."),
 "service": dict(slot="Card (grid/list cell in a Section)", w="grid cell / fill (row)", h="hug",
   states="default · disabled", contains="icon + label (+ optional chevron)", within="a services grid/list Section",
   use="Entry to a service/feature."),

 "highlight": dict(slot="Banner (full-bleed, in body)", w="fill (edge-to-edge)", h="hug / fixed aspect",
   states="default · with/without CTA · light/dark media",
   contains="background media + title + subtitle + Button", within="between Sections in the scroll stack",
   use="Promotional / announcement banner."),

 "smiles-balance": dict(slot="Body module / header widget", w="fill", h="hug",
   states="tier-themed (special palettes)", contains="points balance + Smiles mark + CTA",
   within="a Section near top of Home / rewards screen", use="Show loyalty points balance."),
 "voucher": dict(slot="Card", w="fill / fixed (carousel)", h="hug",
   states="active · redeemed · expired (status Badge)", contains="value + code + validity + status Badge",
   within="a vouchers/rewards Section", use="Coupon / voucher the user can redeem."),
}

MISSION = """\
> **Master spec for Figma Make.** This file is the single source of truth for the e& Consumer App
> design system: every token (resolved to its concrete value), every component (states, behavior,
> placement, composition), the layout system, and recipes for assembling UI screens from UX wireframes.
>
> **What Make should do with it:** given a UX wireframe, identify the screen regions (header, scrollable
> body, bottom nav, overlays), map each region/block to the right e& component(s), and assemble an
> accurate, token-correct UI screen — picking carousels vs. stacked cards, filter rows, forms, etc.,
> and applying the sizing rules below. Treat this as a **UI app library**, not loose mockups.
"""

ASSEMBLY = """\
## Screen assembly recipes (UX → UI)

Use this to turn a UX wireframe into a UI screen built from e& components.

### Step 1 — Frame the screen
- Screen width = device width (e.g. 390). For e& main tabs, use the **red account header** (`<TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567" actions={[…]} />`); for pushed/detail pages use the default white `TopBar` with a back chevron. A red **action bar** inside the header (e.g. "Complete your profile · Start") is optional.
- If the screen has top-level page tabs (e.g. For you / Account / Loyalty), add a **global `Tabs`** row right under the header.
- Persistent bottom nav → floating **`NavBar`** (Home · Support · Profile · Shop; mark the current tab `active`). The area between is the **vertical scroll body**.
- One persistent primary CTA pinned at the bottom → **Action bar** (sticky, above Nav bar).

### Step 2 — Split the body into Sections
- Every distinct UX content block becomes a full-width **Section** (`width: fill`, `height: hug`).
- If the block has a title (and maybe a "see all") → add a **Section link** header at the top of the Section.
- Stack Sections vertically with the section gap token.

### Step 3 — Fill each Section by matching the UX pattern
| UX pattern in the wireframe | e& component(s) to use |
|---|---|
| Horizontal row of tiles / "cards you swipe" | carousel of **Product / Deals for you / New on e& / Recommendation / Plans** cards (`width: fixed`) |
| Vertical list of content blocks | **General** cards (`width: fill`) |
| Settings / contact / "X ›" / label↔value rows | **ListRow** stacked in a Section |
| Account-hub / quick-links grid (icon + label + count badge) | **QuickAction** cells with a `badge` (e.g. `<Badge status="positive">3 active</Badge>`) |
| Icon+label shortcuts grid | **QuickAction** (or **Service** cells with a New badge) |
| "Jump to…" / quick chips block | **Chips** inside a `surface="brand-muted"` (pink) Section |
| Row of filter/sort chips | **Filter Pill** / **Chips** (`width: hug`, horizontal scroll) |
| Top-level page tabs (For you/Account/Loyalty) | **Tabs** `scope="global"` (tinted-red active) |
| In-section tab switcher (All/Data/Calls) | **Tabs** `scope="local"` (midnight active) |
| Form (text, choices, toggles) | **Input Field, Searchbar, Checkbox, Radio, Switcher, Selectors** |
| Promo / announcement strip | **Highlight** banner (full-bleed) |
| Usage / quota meter | **Plan Usage Bar** |
| Expandable FAQ/detail | **Accordion** |
| Loyalty points | **Smiles Balance** · Coupons → **Voucher** |

### Step 4 — Overlays & feedback (not in the scroll flow)
- Modal content / picker → **Bottom sheet**. Blocking decision → **Alert modal**. Transient toast → **Snackbar**. Contextual hint → **Tooltip**.

### Step 5 — Apply the rules
- **Controls** (Button, Input, Chip, Filter pill, Checkbox, Radio, Switcher, Searchbar, Tabs) → `width: fill` (or `hug` for inline chips/pills) + **fixed** token height.
- **Containers** (Section, all Cards, Accordion, Bottom sheet) → `width: fill` + **hug** content height with token paddings.
- **Bars** (Top bar, Nav bar, Action bar) → `width: fill` + **fixed** token height.
- Inset padded content by the screen gutter; let banners/carousels bleed to the edges.
- Apply color/typography/spacing/radius tokens from **Global foundations**. Mirror horizontally for Arabic (RTL).

### Worked example — a Home screen
```
[ Top bar ]                         ← header: logo (leading) + profile/notification icons (trailing)
──────────── scroll body ────────────
[ Section ] Smiles Balance          ← loyalty module, fill width
[ Section · "Quick actions" ]       ← Quick Action grid
[ Section · "Deals for you" + see-all ]  ← horizontal carousel of Deals cards (fixed width)
[ Highlight ] promo banner          ← full-bleed
[ Section · "Plans" + see-all ]     ← carousel of Plan cards
[ Section · "Services" ]            ← Service grid
──────────────────────────────────────
[ Nav bar ]                         ← Home · Shop · Services · More (active = Home)
```
"""

def emit_size_group(R, w, group, label):
    node = R.get(group)
    if isinstance(node, dict):
        w(f"\n**{label}** (`size.{group}`)");
        return md_tree(node, 0)
    return []

def main():
    raw = json.load(open(VARS)); R = resolved_tree(load_merged(raw))
    L = []; w = L.append

    w("# e& Consumer App DSL — Master Spec\n")
    w(MISSION)

    # ---------------- Layout system ----------------
    w("\n---\n\n## Layout system & screen composition\n")
    w("**Screen archetype (e&):** **Top bar** — usually the **red account header** (`variant=\"brand\"`: greeting "
      "\"Hi, Ahmed\" + masked number + circle icons; optional red action bar like \"Complete your profile\") → "
      "optional **global Pill Tabs** row (For you / Account / Loyalty) → **scroll body** = a vertical stack of "
      "full-width grey **Sections** (each wrapping cards / ListRows / QuickAction grids / carousels) → floating "
      "**Nav bar** (Home · Support · Profile · Shop; active = red pill). Optional **Action bar** above the nav; "
      "overlays (**Bottom sheet, Alert modal, Snackbar, Tooltip**) float above everything.\n")
    w("**Sizing rules (apply to every component):**")
    w("- **Controls** (Button, Input, Chip, Filter pill, Checkbox, Radio, Switcher, Searchbar, Tabs): "
      "`width: fill` (or `hug` for inline chips/pills/badges) + **fixed** height from tokens.")
    w("- **Containers** (Section, all Cards, Accordion, Bottom sheet): `width: fill` + **hug** content height "
      "(internal paddings/min-heights from tokens).")
    w("- **Bars** (Top bar, Nav bar, Action bar): `width: fill` + **fixed** height from tokens.")
    w("- Cards in a **horizontal carousel** are `width: fixed`; the same card **stacked** in a vertical Section is `width: fill`.")
    w("\n**Width & gutters:** components span the device width. Padded content is inset by the screen gutter "
      "(`spacing/lg` = 16); banners and carousels bleed edge-to-edge. **Vertical rhythm:** gap between Sections "
      "and between items uses spacing tokens. **Scroll:** body scrolls vertically between the sticky Top bar and "
      "Nav bar; carousels scroll horizontally inside their Section. **Safe areas:** Top bar respects the top inset, "
      "Nav bar the bottom inset. **RTL:** mirror horizontally for Arabic (`aed/*` type ramp; logical start/end).\n")
    for grp, lab in [("section","Section"),("card","Card"),("tabs","Tabs"),("section-link","Section link"),
                     ("scale","Scale"),("border","Border width")]:
        L.extend(emit_size_group(R, w, grp, lab))

    # ---------------- Foundations ----------------
    w("\n---\n\n## Global foundations\n")
    w("### Color — primitive ramps\n")
    for hue, ramp in R["color"].items():
        if not isinstance(ramp, dict) or hue in ("surface","text","border","button","tab","filter-pill",
            "status","badge","mark","atom-surfaces","input-field","chips","navbar-tab"): continue
        if hue == "special":
            w(f"- **special** (membership/loyalty palettes): {', '.join(ramp.keys())}"); continue
        w(f"- **{hue}**: " + ", ".join(f"`{k}`={v}" for k,v in ramp.items() if not isinstance(v,dict)))
    w("\n### Color — semantic\n")
    for cat in ("surface","text","icon","border","status"):
        node = R["color"].get(cat)
        if node: w(f"\n**{cat}**"); L.extend(md_tree(node,1))
    w("\n### Typography (Latin ramp)\n")
    w("| style | size px | weight | line-height | letter-spacing | family |"); w("|---|---|---|---|---|---|")
    def emit_typo(prefix, node):
        for k,v in node.items():
            if isinstance(v,dict) and "font-size" in v:
                wt=str(v.get("font-weight","")); w(f"| {prefix}{k} | {v.get('font-size')} | {wt} ({WEIGHT_NUM.get(wt,'')}) | {v.get('line-height','')} | {v.get('letter-spacing','')} | {v.get('font-family','')} |")
            elif isinstance(v,dict): emit_typo(f"{prefix}{k}.", v)
    for cat,node in R["typography"].items():
        if cat!="aed": emit_typo(f"{cat}.", node)
    w("\n> Arabic ramp mirrors these as `aed/<style>` (same scale; family Suisse Int'l, distinct Arabic face TBD).\n")
    w("### Spacing scale\n"); w(", ".join(f"`{k}`={v}" for k,v in R["spacing"].items()))
    w("\n### Border radius\n"); w(", ".join(f"`{k}`={v}" for k,v in R["border-radius"].items()))
    w("\n### Icon sizes\n"); w(", ".join(f"`{k}`={v}" for k,v in R["icon"].items()))

    w("\n### Icons — folded into `@eand/react-design-system`\n")
    w("Icons ship **inside** this UI library — there is no separate icons package. Import "
      "`Icon` from `@eand/react-design-system` alongside the components and render "
      "`<Icon name=\"…\" />` into any `icon`/`leadingIcon`/`actions` slot. The set mirrors "
      "the **e& App Icons** Figma library (`9Q64oRPBkm3Sla5HMP4LJA`, MS-Fluent-2 line set + "
      "13 Core Service Icons). Icons tint via CSS `color`, so they inherit the slot colour "
      "(red on an active `NavBar` tab, white on the brand `TopBar`, dark in a "
      "`QuickAction`/`ListRow` square). `Icon` takes `name`, `size` (px, default 24), "
      "`color`, and `title`.\n")
    w("Every icon has two forms: the outline `name` and the filled `name-filled` (e.g. "
      "`home` and `home-filled`) — **198 base names, 396 total**. Prominent slots (active "
      "nav tabs, hero tiles, quick-action squares, service tiles) take the filled form; "
      "inline and secondary glyphs (list rows, buttons, header actions, hints) take the "
      "outline form.\n")
    w("The authoritative name list is the grouped registry in "
      "`packages/react-design-system/MAKE_KIT_GUIDELINES.md` (between the `icons:begin` / "
      "`icons:end` markers), which `npm run guidelines:check` verifies against the built "
      "library on every push. It is deliberately not duplicated here — a second copy would "
      "drift. In code, `ICONS` and `ICON_META` are exported from the package itself.\n")
    w("> **Never generate, draw, or emoji-substitute an icon.** If the concept you want has "
      "no entry, pick the nearest real name — never a placeholder or a drawing. If nothing "
      "fits, request the glyph be added to the package (exported from the e& App Icons "
      "library) rather than inventing one.\n")

    # ---------------- Composition map ----------------
    w("\n\n---\n\n## Component composition map\n")
    w("| Component | Slot | Width | Height |")
    w("|---|---|---|---|")
    for section, comps in SECTIONS:
        for name,*_ in comps:
            b = B.get(slugify(name), {})
            w(f"| {name} | {b.get('slot','—')} | {b.get('w','—')} | {b.get('h','—')} |")

    # ---------------- Components ----------------
    w("\n\n---\n\n## Components\n")
    w("> Each component: behavior (slot / sizing), states, composition, use case, exact mapped tokens, and "
      "Figma-verified anatomy where extracted.\n")
    for section, comps in SECTIONS:
        w(f"\n### {section}\n")
        for name, node, role, cgroups, sgroups, tgroups in comps:
            slug = slugify(name); b = B.get(slug, {})
            link = f"[`{node}`]({FIG}{node})" if node else "_node-id TBD_"
            w(f"\n#### {name}")
            w(f"- **Figma:** {link}" + ("  ·  **key building block**" if b.get("key") else ""))
            w(f"- **Role:** {role}")
            if b:
                w(f"- **Behavior:** slot `{b['slot']}` · width: {b['w']} · height: {b['h']}")
                w(f"- **States:** {b['states']}")
                w(f"- **Composition:** contains {b['contains']} · appears within {b['within']}")
                w(f"- **Use case:** {b['use']}")
            for g in cgroups:
                nd = R["color"].get(g)
                if isinstance(nd, dict): w(f"- **Color tokens — `color.{g}`:**"); L.extend(md_tree(nd,1))
            for g in sgroups:
                nd = R.get(g)
                if isinstance(nd, dict): w(f"- **Size tokens — `{g}`:**"); L.extend(md_tree(nd,1))
            if tgroups:
                styles=[]
                for g in tgroups:
                    tn=R["typography"].get(g)
                    if isinstance(tn,dict):
                        for sz,props in tn.items():
                            if isinstance(props,dict) and "font-size" in props:
                                styles.append(f"`{g}.{sz}`({props.get('font-size')}/{props.get('font-weight')})")
                if styles: w(f"- **Typography:** {', '.join(styles)}")
            apath = os.path.join(ANATOMY, slug + ".md")
            if os.path.exists(apath):
                label = ("Anatomy (Figma-verified)" if slug in VERIFIED
                         else "Anatomy (derived from token model — Figma verification pending)")
                w(f"- **{label}:**"); w(open(apath).read().rstrip())
            else:
                w("- _anatomy: pending (behavior/states above are from the token model)._")

    # ---------------- Assembly recipes ----------------
    w("\n\n---\n\n" + ASSEMBLY)

    open(OUT, "w").write("\n".join(L) + "\n")
    print(f"Wrote {OUT} ({len(L)} lines)")

if __name__ == "__main__":
    main()

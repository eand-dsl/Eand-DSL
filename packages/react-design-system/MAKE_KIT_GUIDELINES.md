# e& Design System — Figma Make kit guidelines

These guidelines teach Figma Make how to build e& Consumer App screens with
`@eand/react-design-system`. The package is **web React 18**, self-contained
(token styles are inline — no separate CSS import required), and renders via esm.sh.

```tsx
import { TopBar, Section, NavBar, Button, /* …39 more */ } from '@eand/react-design-system';
import { Icon } from '@eand/icons';   // real e& icons — see "Icons" below
```

## Icons — never invent them
Icons live in a **separate package, `@eand/icons`** (mirrors the e& App Icons Figma
library; kept separate so the UI lib stays light). **Do not generate, draw, or use
emoji/SVG of your own** — always render `<Icon name="..." />` from `@eand/icons` and
pass it into a component's `icon`/`leadingIcon`/`actions` slot. It tints via CSS
`color`, so it inherits the slot's color (red on an active nav tab, white on the red
header, dark in a grey square). Available names: `home`, `support`, `profile`, `shop`,
`search`, `notification`, `sparkle` (AI), `wallet`, `truck`, `grid`, `mobile`, `tv`,
`wifi`, `gift`, `plus`, `mic`, `shield`, `chevron-right`. Need one that isn't listed?
Ask for it to be added to `@eand/icons` — don't substitute a placeholder.

## Golden rules (always apply)
- **Build screens, not loose mockups.** An e& screen = **red account `TopBar`** (`variant="brand"`: greeting + masked number + circle icons) → optional **global `Tabs`** row (For you / Account / Loyalty) → a vertical scroll body of full-width grey **`Section`s** (wrapping cards / `ListRow`s / `QuickAction` grids / carousels) → floating **`NavBar`** (Home · Support · Profile · Shop, active = red pill). Overlays (`BottomSheet`, `AlertModal`, `Snackbar`, `Tooltip`) float above; a persistent primary CTA → `ActionBar` above the nav. Detail/pushed pages use the default white `TopBar` with a back chevron.
- **Sizing:** controls (`Button`, `Input`, `Chip`, `FilterPill`, `Checkbox`, `Radio`, `Switcher`, `Searchbar`, `Tabs`) are fixed-height; in a form they fill width, inline (chips/pills/badges) they hug. Containers (`Section`, all cards, `Accordion`, `BottomSheet`) are full-width + hug content. Cards in a **carousel** are fixed-width; **stacked** they fill width.
- **Sections** are full bleed to the screen width; padded content insets automatically. Put a carousel of cards in `<Section carousel>`.
- Use the brand: primary actions = `<Button>` (brand red). e& red is the accent; "midnight" is the neutral ink; gold/silver/etc. are Smiles tiers.

## Component reference (props that matter)
**Chrome / layout**
- `TopBar({ variant: default|brand, leading, title, greeting?, actions?, actionBar?, trailing })` — **brand** = red account header (greeting "Hi, Ahmed" + masked number + circle `actions` + optional `actionBar`={title,subtitle,cta}); **default** = white header (leading `<Logo/>`/back + title + actions).
- `ListRow({ icon?, label, sublabel?, value?, chevron })` — white rounded row for settings / contact / overview / label↔value (e.g. "2 GB left" → "Local Data"). Stack inside a Section.
- `NavBar({ items: {label, icon, active, onClick}[] })` — **floating glass** bottom nav: frosted white-15% + blur pill over a midnight scrim; **active tab = solid white pill with red icon+label**, inactive = white; white home indicator. 3–5 tabs (Home·Support·Profile·Shop); mark current `active`.
- `ActionBar({ helper })` + children — sticky footer for the primary `Button`(s).
- `Section({ title, context?, filterPill?, surface?, onSeeAll?, carousel? })` — **grey rounded container** (the body building block) with a white circle chevron. `surface`: default(grey)|brand(red)|**brand-muted(pink, for "Jump to…"/"FAQs")**|midnight. `context` = subtext; `filterPill` can also hold a text link like "Manage". `carousel` = horizontal scroll of fixed-width cards.
- `SectionLink({ title, link, onLinkClick })` — standalone section header + "See all".
- `Accordion({ title, defaultOpen })` — expand/collapse.
- `Card({ media, title, body, action, width? })` — generic content card.

**Controls**
- `Button({ variant: primary|secondary, tone: brand|inverse, size: sm|md|lg, block, leadingIcon, trailingIcon })`.
- `Input({ label, helper, error, variant: outlined|filled, leadingIcon, trailingIcon })`; `Searchbar({ onMic })`; `AISearch`.
- `Chip({ selected, leadingIcon })`; `FilterPill({ selected })` (filter row); `Tabs({ tabs, value, scope })` — `scope="global"` page tabs (active = **tinted-red** pill) vs `scope="local"` in-section tabs (active = **midnight** pill); `Selectors({ options, value })`.
- `Checkbox({ label, checked })`; `Radio({ label })`; `Switcher({ checked, size: sm|lg })`.

**Primitives**
- `Text({ variant: "body.md"|"title.sm"|"heading.lg"|…, as, color })`; `Logo`. For glyphs use `<Icon name="…" />` from **`@eand/icons`** (see "Icons" above) — never emoji.
- `Badge({ offer?, status?, size })` — **offer**: new-card/new-plan (green) · mega-deals/green-friday/discount (red) · limited-stock/validity/limited-time (yellow) · best-seller (magenta) · online-exclusive/exclusive-for-emirati (burgundy) · sold-out (grey). **status**: neutral/positive/warning/danger/brand. `SmilesRow({ count, plus })` (overlapping smiles avatars); `ProgressBar({ value, tone })`; `AddTrigger({ label })`; `LogoRow({ logos })`.

**Feedback / overlays**
- `PlanUsageBar({ label, used, total, unit })`; `Snackbar({ tone, message, action, onDismiss })`; `AlertModal({ open, tone, title, body, actions })`.
- `Tooltip({ content, visible, placement })`; `BottomSheet({ open, title, footer })`.

**Cards / product**
- `PlanCard({ variant: default|brand|midnight, category, name, price, period, discount, smiles })` — Plans-mini: Postpaid eyebrow + Discount badge + title + smiles row + "from AED…/mo".
- `ProductCard({ eyebrow?, title, image?, discount?, price, period, pts?, tint? })` — card-features (product/addon/category). `pts` = Smiles pricing (😊 PTS); `tint` = category card bg.
- `DealCard({ image, title, subtitle, badge })`; `NewCard({ image, title })`; `ServiceCard({ icon, label, badge? })` (badge e.g. `<Badge offer="new-plan">New</Badge>`).
- `Highlight({ title, subtitle?, image?, action?: { title, subtitle, cta } })` — dark image banner + smiles row; `action` adds a Play-now action bar. `SmilesBalance({ points, cta })`; `Voucher({ value, code, validity, status })`.

## UX → UI assembly (turn a wireframe into a screen)
| UX pattern | Use |
|---|---|
| Greeting / account header | `TopBar variant="brand"` (greeting + masked number + circle actions) |
| Bottom tab bar | `NavBar` — Home · Support · Profile · Shop (mark current `active`) |
| Top-level page tabs | `Tabs scope="global"` (For you / Account / Loyalty) |
| In-section tabs (All/Data/Calls) | `Tabs scope="local"` |
| Each content block | a full-width `Section` (`title` + `context` + chevron) |
| Horizontal row of tiles | `<Section carousel>` of `ProductCard`/`DealCard`/`PlanCard`/`NewCard` |
| Settings / contact / "X ›" / label↔value rows | `ListRow` stacked in a Section |
| Account-hub / quick-links grid | `QuickAction` cells with a count `badge` (`<Badge status="positive">3 active</Badge>`) |
| Icon shortcut grid | `QuickAction` (or `ServiceCard` grid with New badge) |
| "Jump to…" chips block | `Chip`s in a `surface="brand-muted"` Section |
| Filter/sort row | `FilterPill`/`Chip` row |
| Form | `Input`/`Searchbar`/`Checkbox`/`Radio`/`Switcher`/`Selectors` |
| Promo strip | `Highlight` (full-bleed) |
| Usage meter | `PlanUsageBar` · Loyalty → `SmilesBalance` · Coupon → `Voucher` |
| Modal / picker | `BottomSheet` · Confirm → `AlertModal` · Toast → `Snackbar` · Hint → `Tooltip` |
| Persistent bottom CTA | `ActionBar` with a `Button` |

## Worked example — Home screen
```tsx
<>
  <TopBar leading={<Logo/>} trailing={<><Icon name="search"/><Icon name="notification"/></>} />
  <SmilesBalance points="12,450 Smiles" />

  <Section title="Quick actions" context="Top things to do" onSeeAll={()=>{}}>
    <QuickAction columns={3} items={[
      { label:'Quick Pay & Recharge', icon:<Icon name="wallet"/>, badge:<Badge status="positive" size="sm">Active</Badge> },
      { label:'Track Your Order', icon:<Icon name="truck"/> }, { label:'mParking', icon:<Icon name="grid"/> },
    ]}/>
  </Section>

  <Section title="Plans" context="Cover these with your Smiles Points" carousel onSeeAll={()=>{}}>
    <PlanCard variant="default"/><PlanCard variant="brand"/><PlanCard variant="midnight"/>
  </Section>

  <Section title="Deals for you" context="Cover these with your Smiles Points" carousel onSeeAll={()=>{}}>
    <ProductCard eyebrow="Data" title="New Freedom Unlimited Data Plan 500 Local" discount="20% off" price="200" pts/>
    <ProductCard image={<Icon name="mobile"/>} title="iPhone Clear Case For Safe Use" discount="20% off" price="AED 200"/>
  </Section>

  <Highlight title="For Travellers" subtitle="Stay connected, even when you're away"
    action={{ title:'Smiles Unlimited', subtitle:'Exclusive venue deals', cta:'Play now' }}/>

  <Section title="Services" context="Explore everything e&" onSeeAll={()=>{}}>
    {/* grid of */}
    <ServiceCard icon={<Icon name="mobile"/>} label="Mobile Plans" badge={<Badge offer="new-plan" size="sm">New</Badge>}/>
  </Section>

  <NavBar items={[
    {label:'Home',icon:<Icon name="home"/>,active:true},{label:'Support',icon:<Icon name="support"/>},
    {label:'Profile',icon:<Icon name="profile"/>},{label:'Shop',icon:<Icon name="shop"/>},
  ]}/>
</>
```
See `demo/home-screen.png` for the rendered result. **Tip for Make:** put each content block in its own `Section` (grey container), use `carousel` for horizontal card rows, and reach for the specific card (`PlanCard`/`ProductCard`/`DealCard`) rather than a generic `Card`.

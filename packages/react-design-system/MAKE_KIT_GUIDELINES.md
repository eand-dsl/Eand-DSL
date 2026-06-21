# e& Design System — Figma Make kit guidelines

These guidelines teach Figma Make how to build e& Consumer App screens with
`@eand/react-design-system`. The package is **web React 18**, self-contained
(token styles are inline — no separate CSS import required), and renders via esm.sh.

```tsx
import { TopBar, Section, NavBar, Button, /* …39 more */ } from '@eand/react-design-system';
```

## Golden rules (always apply)
- **Build screens, not loose mockups.** A screen = `TopBar` (sticky header) → a vertical scroll body of full-width `Section`s → `NavBar` (sticky bottom). Overlays (`BottomSheet`, `AlertModal`, `Snackbar`, `Tooltip`) float above. A persistent primary CTA → `ActionBar` (sticky, above NavBar).
- **Sizing:** controls (`Button`, `Input`, `Chip`, `FilterPill`, `Checkbox`, `Radio`, `Switcher`, `Searchbar`, `Tabs`) are fixed-height; in a form they fill width, inline (chips/pills/badges) they hug. Containers (`Section`, all cards, `Accordion`, `BottomSheet`) are full-width + hug content. Cards in a **carousel** are fixed-width; **stacked** they fill width.
- **Sections** are full bleed to the screen width; padded content insets automatically. Put a carousel of cards in `<Section carousel>`.
- Use the brand: primary actions = `<Button>` (brand red). e& red is the accent; "midnight" is the neutral ink; gold/silver/etc. are Smiles tiers.

## Component reference (props that matter)
**Chrome / layout**
- `TopBar({ leading, title, trailing })` — app header. `leading`=`<Logo/>` or back; `trailing`=icon buttons.
- `NavBar({ items: {label, icon, active, onClick}[] })` — 3–5 bottom tabs; mark current `active`.
- `ActionBar({ helper })` + children — sticky footer for the primary `Button`(s).
- `Section({ title?, action?, surface?, carousel? })` — the body building block. `surface`: default|inverse|brand|midnight. `carousel` = horizontal scroll of cards.
- `SectionLink({ title, link, onLinkClick })` — standalone section header + "See all".
- `Accordion({ title, defaultOpen })` — expand/collapse.
- `Card({ media, title, body, action, width? })` — generic content card.

**Controls**
- `Button({ variant: primary|secondary, tone: brand|inverse, size: sm|md|lg, block, leadingIcon, trailingIcon })`.
- `Input({ label, helper, error, variant: outlined|filled, leadingIcon, trailingIcon })`; `Searchbar({ onMic })`; `AISearch`.
- `Chip({ selected, leadingIcon })`; `FilterPill({ selected })` (filter row); `Tabs({ tabs, value, scope: global|local })`; `Selectors({ options, value })`.
- `Checkbox({ label, checked })`; `Radio({ label })`; `Switcher({ checked, size: sm|lg })`.

**Primitives**
- `Text({ variant: "body.md"|"title.sm"|"heading.lg"|…, as, color })`; `Icon({ size: xs|sm|md|lg|xl })`; `Logo`.
- `Badge({ tone: neutral|accent|positive|warning|danger|gold|silver|platinum|bronze, size })`; `ProgressBar({ value, tone })`; `AddTrigger({ label })`; `LogoRow({ logos })`.

**Feedback / overlays**
- `PlanUsageBar({ label, used, total, unit })`; `Snackbar({ tone, message, action, onDismiss })`; `AlertModal({ open, tone, title, body, actions })`.
- `Tooltip({ content, visible, placement })`; `BottomSheet({ open, title, footer })`.

**Cards / product**
- `ProductCard({ image, title, price, badge, cta })`; `DealCard({ image, title, subtitle, badge })`; `PlanCard({ name, price, features, recommended, cta })`; `NewCard({ image, title })`; `ServiceCard({ icon, label })`.
- `Highlight({ title, subtitle, cta, background })` (full-bleed banner); `SmilesBalance({ points, cta })`; `Voucher({ value, code, validity, status })`.

## UX → UI assembly (turn a wireframe into a screen)
| UX pattern | Use |
|---|---|
| Header | `TopBar` (logo/back leading, action icons trailing) |
| Bottom tab bar | `NavBar` (mark current tab active) |
| Each content block | a full-width `Section` (add `title`+`action` for a header) |
| Horizontal row of tiles | `<Section carousel>` of `ProductCard`/`DealCard`/`PlanCard`/`NewCard` |
| Vertical list | stacked `Card`s |
| Icon shortcut grid | `QuickAction` (or `ServiceCard` grid) |
| Filter/sort row | `FilterPill`/`Chip` row |
| In-screen tabs | `Tabs` |
| Form | `Input`/`Searchbar`/`Checkbox`/`Radio`/`Switcher`/`Selectors` |
| Promo strip | `Highlight` (full-bleed) |
| Usage meter | `PlanUsageBar` · Loyalty → `SmilesBalance` · Coupon → `Voucher` |
| Modal / picker | `BottomSheet` · Confirm → `AlertModal` · Toast → `Snackbar` · Hint → `Tooltip` |
| Persistent bottom CTA | `ActionBar` with a `Button` |

## Worked example — Home screen
```tsx
<>
  <TopBar leading={<Logo/>} trailing={<><Icon>🔍</Icon><Icon>🔔</Icon></>} />
  <Section><SmilesBalance points="12,450 Smiles" cta="Redeem" /></Section>
  <Section title="Quick actions"><QuickAction items={[{label:'Recharge',icon:'⚡'}, /*…*/]} /></Section>
  <Section title="Deals for you" action="See all" carousel>
    <DealCard title="50% off eLife" subtitle="Home broadband" badge="Limited" />
    {/* … */}
  </Section>
  <Section><Highlight title="Upgrade to 5G" subtitle="Unlimited data." cta="Explore plans" /></Section>
  <Section title="Recommended plans" action="See all" carousel>
    <PlanCard name="Plus" price="AED 125" features={['120 GB','Unlimited mins','5G']} recommended />
  </Section>
  <NavBar items={[{label:'Home',icon:'🏠',active:true}, {label:'Shop',icon:'🛍️'}, /*…*/]} />
</>
```
See `demo/home-screen.png` for the rendered result.

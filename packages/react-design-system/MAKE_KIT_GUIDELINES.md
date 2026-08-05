# e& Design System — Figma Make kit guidelines

These guidelines teach Figma Make how to build e& Consumer App screens with
`@eand/react-design-system`. The package is **web React 18**, Vite-compatible, and
self-contained: no dependencies, and token styles are inline, so no separate CSS import
is required.

Everything ships from one package — components, `Icon`, and the design tokens:

```tsx
import { TopBar, Section, NavBar, Button, Icon } from '@eand/react-design-system';
```

## Icons — never invent them

Icons ship **inside this package**. Import `Icon` from `@eand/react-design-system`
alongside the components — there is no separate icons package, and `@eand/icons` does
not exist. Never draw an SVG, use an emoji, or invent a name; every glyph you need is
already here.

Render `<Icon name="…" />` and pass it into a component's `icon` / `leadingIcon` /
`actions` slot. It tints via CSS `color`, so it inherits the slot's colour (red on an
active nav tab, white on the red header, dark ink in a grey square). `Icon` takes
`name`, `size` (px, default 24), `color`, and `title`.

**Every icon has two forms:** the outline `name` and the filled `name-filled`
(e.g. `home` and `home-filled`). Prominent slots — active nav tabs, hero tiles,
quick-action squares, service tiles — take the **filled** form. Inline and secondary
glyphs (list rows, buttons, header actions, hints) take the outline form. That is
198 base names, 396 total.

If the concept you want is not below, pick the nearest listed name — do not substitute
a placeholder or a drawing. `placeholder` is design scaffolding only; never ship it in
a customer-facing screen.

<!-- icons:begin -->
**Navigation & wayfinding** — `home` · `explore` · `menu` · `apps` · `grid` · `grid-2` · `rows` · `more-horizontal` · `more-vertical` · `chevron-up` · `chevron-down` · `chevron-left` · `chevron-right` · `chevron-up-sm` · `chevron-down-sm` · `chevron-left-sm` · `chevron-right-sm` · `arrow-up` · `arrow-down` · `arrow-left` · `arrow-right` · `arrow-up-right` · `external-link`

**Actions & editing** — `add` · `add-2` · `subtract` · `close` · `dismiss` · `delete` · `remove` · `edit` · `cut` · `copy` · `copy-2` · `save` · `undo` · `redo` · `refresh` · `sync` · `swap` · `shuffle` · `move` · `drag` · `expand` · `expand-horizontal` · `expand-vertical` · `collapse` · `aspect-ratio` · `filter` · `filters` · `sort` · `sort-vertical` · `search` · `search-list`

**Status & feedback** — `check` · `check-circle` · `checklist` · `verified` · `warning` · `info` · `help` · `hourglass` · `thumbs-up` · `thumbs-down` · `smiley` · `celebrate` · `heart`

**Time & scheduling** — `alarm` · `calendar` · `calendar-pick` · `clock` · `timer`

**Communication & support** — `call` · `call-add` · `call-end` · `call-incoming` · `call-outgoing` · `chat` · `chat-help` · `chat-typing` · `mail` · `mail-unread` · `message-text` · `notification` · `reply` · `send` · `share` · `support` · `support-agent` · `headphones`

**Connectivity & network** — `wifi` · `bluetooth` · `broadcast` · `plug` · `server` · `chip` · `cloud-download` · `cloud-upload` · `cloud-off-offline` · `airplay`

**Devices & media** — `phone-device` · `smartwatch` · `laptop` · `monitor` · `screen` · `tv` · `devices` · `webcam` · `camera` · `video` · `image` · `picture-in-picture` · `play` · `pause` · `stop` · `volume` · `volume-off` · `mic` · `mic-off` · `subtitles` · `printer`

**Files & content** — `file` · `file-add` · `folder` · `folder-add` · `attachment` · `link` · `link-off` · `pin` · `bookmark` · `bookmark-off` · `download` · `upload` · `qr-code` · `scan-frame` · `code` · `bug` · `guide` · `education`

**Commerce & payments** — `shop` · `store` · `cart` · `card` · `card-add` · `wallet` · `bank` · `receipt` · `tag` · `discount` · `gift` · `ticket` · `package`

**Plans, telecom & rewards** — `sim` · `speed` · `unlimited` · `puzzle` · `insurance` · `crown` · `trophy` · `medal` · `rocket` · `bolt`

**Account, security & privacy** — `user` · `user-add` · `user-verified` · `users` · `login` · `logout` · `lock` · `unlock` · `security` · `fingerprint` · `face-id` · `visibility` · `visibility-off` · `cookie` · `settings`

**AI & sustainability** — `ai` · `ai-text` · `magic-wand` · `energy-eco` · `sprout`

**Places & mobility** — `location` · `location-pin` · `navigation` · `globe` · `office` · `warehouse` · `car` · `delivery` · `order-tracking`

**Appearance & theme** — `sun` · `moon` · `palette` · `glasses`

**Scaffolding & abstract** — `placeholder` · `shapes` · `spiral`
<!-- icons:end -->

Common e& mappings: account/profile → `user` · AI assistant → `ai` · handset →
`phone-device` · order tracking → `delivery` or `order-tracking` · add-ons → `puzzle` ·
subscriptions → `package` · privacy/protection → `security` · add something → `add` ·
mParking → `car` · All Services → `grid` · e& Shop → `shop` · retail branch → `store`.

## Golden rules (always apply)
- **Build screens, not loose mockups.** An e& screen = **red account `TopBar`** (`surface="brand"` + `account={{ greeting, name }}` → "Hi, Ahmed" over a masked number, plus circle `actions`) → optional **global `Tabs`** row (For you / Account / Loyalty) → a vertical scroll body of full-width grey **`Section`s** (wrapping cards / `ListRow`s / `QuickAction` grids / carousels) → floating **`NavBar`** (Home · Support · Profile · Shop, active = white pill with a red icon). Overlays (`BottomSheet`, `AlertModal`, `Snackbar`, `Tooltip`) float above; a persistent primary CTA → `CtaFooter` pinned under the body. Detail/pushed pages use the default white `TopBar` with a back chevron.
- **Sizing:** controls (`Button`, `Input`, `OtpInput`, `Chip`, `FilterPill`, `Checkbox`, `Radio`, `Switcher`, `Searchbar`, `Tabs`) are fixed-height; in a form they fill width, inline (chips/pills/badges) they hug. Containers (`Section`, all cards, `Accordion`, `BottomSheet`) are full-width + hug content. Cards in a **carousel** are fixed-width; **stacked** they fill width.
- **Sections** are full bleed to the screen width; padded content insets automatically. Put a carousel of cards in `<Section carousel>` and set `size` to the row the cards need (`md` for deal/product cards, `lg` for plan cards, `xl` for a highlight banner).
- Use the brand: primary actions = `<Button>` (brand red). e& red is the accent; "midnight" is the neutral ink; gold/silver/etc. are Smiles tiers.
- **Give the page a neutral host stylesheet.** These components style themselves inline, so anything they set always wins — but anything they *don't* set is inherited from the page. `text-align`, `direction` and page-level width constraints leak straight through: a starter stylesheet with `#root { text-align: center; width: 1126px }` centres every section title and stretches inline controls to full width, and the components look broken when nothing is wrong with them. Reset the host to `body { margin: 0 }` and give the app a phone-width column (`width: 390px; margin: 0 auto; text-align: left`). Do not add global rules that target bare `button`, `input` or `p` — they will fight the components.
- **Prefer the current axis over the back-compat alias.** `surface` replaces `tone` on `Button`, `surface` + `account` + `children` replace `variant` / `greeting` / `actionBar` on `TopBar`, `colorScheme` replaces `variant` on `PlanCard`, `trigger`/`onTrigger` replace `hideChevron`/`onSeeAll` on `Section`, and `status` replaces `tone` on `Alert`. The old names still compile, but Make should not reach for them.

## Component reference (props that matter)
**Chrome / layout**
- `TopBar({ surface: brand|default, statusBar, leading, logo, title, account, actions, trailing, eyebrow, bigTitle, subtext, chevron, rounded, children })` — slot-based header. **brand** = red account header (`account={{ greeting, name }}`, circle `actions`, rounded bottom); **default** = white header (`leading` back chevron or `<Logo/>`, `title`, `actions`). `bigTitle` (+ `eyebrow`/`subtext`) gives the large hero title; `children` is the bottom slot for a search field, `Tabs`, chips or a `Stepper`. `variant`, `greeting` and `actionBar` are deprecated back-compat aliases — use `surface`, `account={{ greeting }}` and `children` instead.
- `ListRow({ icon, label, sublabel, value, chevron })` — white rounded row for settings / contact / overview / label↔value (e.g. "2 GB left" → "Local Data"). Stack inside a Section.
- `QuickAction({ items, columns })` — Account-hub grid of **borderless** white cards (radius 20, 4px gap); each item is `{ label, icon, badge, onClick }` and renders a grey radius-12 square holding a filled `<Icon/>`, label below, optional count `badge` top-right. No card border.
- `NavBar({ items, scrollDirection: up|down })` — **floating glass** bottom nav; items are `{ label, icon, avatar, active, special, onClick }`. Frosted white-15% + blur pill over a midnight scrim; **active tab = solid white pill with red icon+label**, inactive = white; white home indicator. 3–5 tabs (Home · Support · Profile · Shop); mark the current one `active` and give it the `-filled` icon. A `special: true` item (the **mShop** button) renders as its own detached glass circle left of the pill — use `icon={<Icon name="shop" />}`.
- `Section({ title, context, titleLine, filterPill, surface: default|inverse|brand|brand-muted|midnight, showHeader, trigger: chevron|button|none, triggerLabel, onTrigger, size: xs|sm|md|lg|xl, gradient, carousel })` — **grey rounded container** (the body building block) with a white circle chevron. Stacked slot children share a tight **4px gap**; carousels keep card spacing. `surface`: default(grey) · inverse/brand(red) · **brand-muted(pink, for "Jump to…"/"FAQs")** · midnight. `context` = subtext; `filterPill` can also hold a text link like "Manage". `trigger="button"` swaps the chevron for a `triggerLabel` text button, `trigger="none"` hides it.
- `SectionLink({ title, link, onLinkClick })` — standalone section header + "See all", for content that is not inside a `Section`.
- `Accordion({ title, defaultOpen })` — expand/collapse block, e.g. FAQs.
- `Card({ media, title, body, action, width, surface: default|inverse })` — generic content card; reach for a specific card first.
- `AtomSurface({ surfaceColor: default|subtle|sunken|midnight-base|midnight-raised|glass-midnight|glass-white })` — raw surface panel when you need a token-correct background behind custom content. Prefer `Section`/`Card` for real screens.
- `CardBgColor({ tint: default|red|orange|yellow|green|cyan|blue|violet, fixedSize })` — the pastel tint panel that backs a card's media area (same palette as `ProductCard`'s `tint`).

**CTA bar (sticky bottom checkout)**
- `CtaFooter({ ribbon, price, terms, payment, actions, homeIndicator, rounded })` — the sticky bottom CTA bar. Slots stack top-to-bottom: `ribbon` (a `StatusRibbon`) → `price` (`{ label, value, note }`) → `terms` (your own `Checkbox` + label) → `payment` (a `PaymentRow`) beside `actions` → optional iOS `homeIndicator`. This is the persistent-CTA pattern; do not hand-roll a fixed footer.
- `ButtonGroup({ orientation: horizontal|vertical, primary, secondary, tertiary })` — the CTA button arrangement inside `actions`. Vertical stacks them; horizontal puts secondary + primary side by side. `tertiary` always gets its own centred row.
- `StatusRibbon({ status: alert|success|warning|info, leadingIcon, action, trailingIcon, onAction })` — 40px full-bleed status strip above a CTA footer ("Only 2 left in stock", "Delivery by Thursday").
- `PaymentRow({ icon, label, actionLabel, onAction })` — payment-method summary: 40px method tile + masked number ("•••• 4326") + a "Change" link.
- `ActionBar({ title, subtitle, icon, action, chevron, surface: default|subtle|sunken|white-transparent|glass|midnight-base|midnight-raised|midnight-transparent, stack })` — a 72px promo/action **card row** (icon tile + two lines + a trailing `Button` *or* a `chevron`, never both). Use it inside the body or in the `TopBar` bottom slot — it is not the sticky footer, `CtaFooter` is. `stack` gives the layered "more of these" look and only applies on the dark/glass surfaces.

**Controls**
- `Button({ variant: primary|secondary|tertiary|link|glass, surface: brand|inverse-brand|white|midnight, size: sm|md|lg, block, loading, leadingIcon, trailingIcon })` — primary = filled brand red, secondary = outlined, tertiary = text, link = underlined text, glass = frosted (brand surface only). `surface` re-colours the whole set for the background it sits on; `block` stretches it for a CTA. `loading` shows a spinner and suppresses clicks — it is not the disabled state.
- `Input({ label, helper, error, success, type: text|dropdown|picker|comment, htmlType, inverse, clearable, onClear, leadingIcon, trailingIcon })` — floating label inside a 56px filled field. `type="dropdown"`/`"picker"` render read-only with a trailing chevron; `type="comment"` is the multi-line box. `htmlType` is the underlying HTML type (password, email…). `inverse` for dark surfaces.
- `OtpInput({ length, value, defaultValue, onValueChange, masked, inverse, disabled, error })` — a row of one-character cells for a verification code. `masked` renders dots.
- `Searchbar({ onMic })` and `AISearch({ onMic })` — the search field and its "Ask e&" sibling; both accept the native input props (`placeholder`, `value`, `onChange`).
- `Chip({ type: outline|filled|glass|inverse, selected, disabled, check, loading, leadingIcon, onClick })` — 40px pill for "Jump to…" blocks and tag rows. `check` swaps the leading slot for a check mark when selected.
- `FilterPill({ selected, inverse, disabled, onClick })` — the filter/sort row pill.
- `Tabs({ tabs, value, defaultValue, scope: global|local, onChange })` — `scope="global"` page tabs (active = **tinted-red** pill) vs `scope="local"` in-section tabs (active = **midnight** pill).
- `Selectors({ options, value, defaultValue, onChange })` — compact segmented control.
- `Picker({ options, surface: default|light|inverse|glass, value, defaultValue, onChange })` — a single-select row of option tiles (data plan sizes, durations, colours). Each option is `{ value, caption, badge, disabled }`.
- `PickerOption({ value, caption, badge, surface: default|light|inverse|glass, selected, disabled, onClick })` — the standalone tile, when you need to lay the options out yourself.
- `Checkbox({ label, size: sm|md, inverse, radio })` and `Radio({ label, size: sm|lg, inverse })` — both wrap a native `<input>`, so state comes from the usual `checked` / `defaultChecked` / `onChange` props. `Checkbox radio` draws the round mark while keeping checkbox semantics.
- `Switcher({ checked, defaultChecked, disabled, size: sm|lg, onChange })` — the on/off toggle.

**Primitives**
- `Text({ variant, as, color })` — `variant` is a typography token path such as `body.md`, `title.sm`, `heading.lg`; `as` picks the element. For glyphs use `<Icon name="…" />` (see "Icons" above) — never emoji.
- `Logo({ version: default|white|midnight|red, size, color })` — the real e& lockup ("e&" ligature over "etisalat and"), for the header `leading`/`logo` slot. `default` is the red app tile with a white mark; the other three are the bare lockup already inked for you — `white` on dark surfaces, `midnight` on light, `red` for brand emphasis. Never re-create the mark from text or an emoji.
- `IconBox({ size })` — fixed square that keeps a glyph on the icon scale (`xs`…`4xl`).
- `Badge({ offer, status, size: sm|md|lg })` — **offer**: `new-card`/`new-plan` (green) · `mega-deals`/`green-friday`/`discount` (red) · `limited-stock`/`validity`/`limited-time` (yellow) · `best-seller` (magenta) · `online-exclusive`/`exclusive-for-emirati` (burgundy) · `sold-out` (grey). **status**: `neutral`/`neutral-inverse`/`disabled`/`positive`/`warning`/`danger`/`brand`.
- `SmilesRow({ count, plus, size })` — overlapping Smiles avatars with a "+N"; `SmilesAvatar({ size, label, bg })` is the single avatar.
- `ProgressBar({ value, tone: accent|positive|warning|danger })` — a single filled bar; `Stepper({ steps, progress, inverse })` is the segmented 2–8 step indicator for onboarding and checkout flows.
- `AddTrigger({ label })` — the dashed "＋ Add" pill; `Dismiss({ surface: default|inverse, size: sm|md, onClick })` — the circular close button on cards, sheets and banners; `LogoRow({ logos })` — a row of partner logos.

**Feedback / overlays**
- `Alert({ status: success|alert|warning|info, title, action, onAction })` — in-page message block with a status mark, body text as children, and an optional underlined action.
- `PlanUsageBar({ label, remaining, total, unit, note, status: default|low-data })` — a 48px filled block showing what is **left** of an allowance: the amount reads inside the block ("2 GB left"), the category label sits in the track opposite ("Local Data"). Green normally, orange on `low-data` — set it yourself, the bar does not guess the threshold. `note` adds a second line such as "Expires 3 days". Stack them with a 4px gap for a plan breakdown.
- `Snackbar({ tone: default|positive|warning|danger|loading, message, subtitle, action, onAction, onDismiss })` — transient dark toast, 48px min height. `message` is the bold title line; `subtitle` adds a lighter second line. `action` renders as an underlined link. `loading` and a bare message both centre.
- `AlertModal({ open, tone: info|positive|warning|danger, title, body, actions, onDismiss })` — centred confirm dialog.
- `Tooltip({ content, title, media, action, steps, size: simple|standard|rich, surface: default|dark, visible, placement: top|bottom|left|right })` — hint bubble; `steps` drives the coach-mark counter.
- `BottomSheet({ open, display: light|dark, grabber, title, subheader, visual, footer, onDismiss })` — the modal sheet; put the sheet's CTA in `footer`.

**Cards / product**
- `PlanCard({ name, category, price, period, discount, colorScheme: default|inverse, smiles, width })` — Plans-mini: Postpaid eyebrow + Discount badge + title + smiles row + "from AED…/mo".
- `ProductCard({ eyebrow, title, image, discount, price, period, pts, type: addon|product|category, tint, width })` — card-features. `pts` shows Smiles pricing; `tint` is a `CardBgColor` tint name for the media area.
- `DealCard({ image, title, subtitle, badge, width })` · `NewCard({ image, title, width, selected })` · `ServiceCard({ icon, label, badge, size: grid|carousel })` — badge e.g. `<Badge offer="new-plan" size="sm">New</Badge>`.
- `Highlight({ title, subtitle, image, cta, action, tone: brand|image|purple, background, width })` — full-bleed banner; `action` (`{ title, subtitle, cta }`) adds the Play-now action bar. The default `tone="image"` reserves a 452px photo banner, so **pass an `image` with it** — without one you get a tall empty gradient. With no artwork to hand, use `tone="brand"` or `tone="purple"`, which are 200px and designed to stand alone.
- `SmilesBalance({ points, cta })` — the gold loyalty balance strip; `Voucher({ title, description, display: light|dark, state: default|applied, onApply })` — a fixed 144×144 ticket tile with notched sides and a punched perforation, carrying a title, a qualifier line and an Apply action. It is a fixed-size carousel cell, not a full-width row: put several in a `<Section carousel>`.

## UX → UI assembly (turn a wireframe into a screen)
| UX pattern | Use |
|---|---|
| Greeting / account header | `TopBar surface="brand"` with `account={{ greeting, name }}` + circle actions |
| Detail / pushed page header | `TopBar` (default white) with a back chevron in `leading` |
| Bottom tab bar | `NavBar` — Home · Support · Profile · Shop (mark current `active`, `-filled` icon) |
| Top-level page tabs | `Tabs scope="global"` (For you / Account / Loyalty) |
| In-section tabs (All/Data/Calls) | `Tabs scope="local"` |
| Each content block | a full-width `Section` (`title` + `context` + chevron) |
| Horizontal row of tiles | `<Section carousel>` of `ProductCard`/`DealCard`/`PlanCard`/`NewCard` |
| Settings / contact / "X ›" / label↔value rows | `ListRow` stacked in a Section |
| Account-hub / quick-links grid | `QuickAction` cells with a count `badge` (`<Badge status="positive">3 active</Badge>`) |
| Icon shortcut grid | `QuickAction` (or `ServiceCard` grid with a New badge) |
| Promo / upsell row inside the body | `ActionBar` (icon tile + two lines + button or chevron) |
| "Jump to…" chips block | `Chip`s in a `surface="brand-muted"` Section |
| Filter/sort row | `FilterPill`/`Chip` row |
| Form | `Input`/`Searchbar`/`Checkbox`/`Radio`/`Switcher`/`Selectors` |
| Choose one of several options (size, duration, colour) | `Picker` (or `PickerOption` tiles laid out yourself) |
| OTP / verification-code entry | `OtpInput` (`length={6}`, `masked` when it is a PIN) |
| Multi-step flow progress | `Stepper` in the `TopBar` bottom slot |
| Promo strip | `Highlight` (full-bleed) |
| Usage meter | `PlanUsageBar` · generic bar → `ProgressBar` · Loyalty → `SmilesBalance` · Coupon → `Voucher` |
| Inline message block | `Alert` · above a checkout CTA → `StatusRibbon` |
| Modal / sheet | `BottomSheet` · Confirm → `AlertModal` · Toast → `Snackbar` · Hint → `Tooltip` |
| Persistent bottom CTA / checkout footer | `CtaFooter` with `ButtonGroup` in `actions` (+ `PaymentRow`, `StatusRibbon`) |

## Worked example — Home screen
```tsx example
<>
  <TopBar
    surface="brand"
    account={{ greeting: 'Hi, Ahmed', name: '050 ••• 4567' }}
    actions={[<Icon name="search" />, <Icon name="notification" />]}
  >
    <Tabs scope="global" tabs={['For you', 'Account', 'Loyalty']} />
  </TopBar>

  <SmilesBalance points="12,450 Smiles" cta="Redeem" />

  <Section title="Quick actions" context="Top things to do" onTrigger={() => {}}>
    <QuickAction
      columns={3}
      items={[
        { label: 'Quick Pay & Recharge', icon: <Icon name="wallet-filled" />, badge: <Badge status="positive" size="sm">Active</Badge> },
        { label: 'Track Your Order', icon: <Icon name="delivery-filled" /> },
        { label: 'mParking', icon: <Icon name="car-filled" /> },
      ]}
    />
  </Section>

  <Section title="Plans" context="Cover these with your Smiles Points" carousel size="lg" onTrigger={() => {}}>
    <PlanCard colorScheme="default" />
    <PlanCard colorScheme="inverse" />
  </Section>

  <Section title="Deals for you" context="Picked for your plan" carousel size="md" onTrigger={() => {}}>
    <ProductCard type="addon" eyebrow="Data" title="Freedom Unlimited Data 500 Local" discount="20% off" price="AED 200" pts />
    <ProductCard type="product" image={<Icon name="phone-device" size={64} />} title="iPhone Clear Case" discount="20% off" price="AED 200" />
  </Section>

  <Highlight
    tone="purple"
    title="For Travellers"
    subtitle="Stay connected, even when you are away"
    action={{ title: 'Smiles Unlimited', subtitle: 'Exclusive venue deals', cta: 'Play now' }}
  />

  <Section title="Services" context="Explore everything e&" onTrigger={() => {}}>
    <ServiceCard icon={<Icon name="sim-filled" />} label="SIM & eSIM" badge={<Badge offer="new-plan" size="sm">New</Badge>} />
    <ServiceCard icon={<Icon name="tv-filled" />} label="eLife TV" />
    <ServiceCard icon={<Icon name="wifi-filled" />} label="Home Internet" />
  </Section>

  <ActionBar
    surface="subtle"
    icon={<Icon name="receipt" />}
    title="Your bill is ready"
    subtitle="AED 480 due 12 Aug"
    action={<Button size="sm">Pay now</Button>}
  />

  <NavBar items={[
    { label: 'Home', icon: <Icon name="home-filled" />, active: true },
    { label: 'Support', icon: <Icon name="support" /> },
    { label: 'Profile', icon: <Icon name="user" /> },
    { label: 'Shop', icon: <Icon name="shop" /> },
  ]} />
</>
```
**Tip for Make:** put each content
block in its own `Section` (grey container), use `carousel` + `size` for horizontal card
rows, reach for the specific card (`PlanCard`/`ProductCard`/`DealCard`) rather than a
generic `Card`, and give every prominent glyph the `-filled` form.

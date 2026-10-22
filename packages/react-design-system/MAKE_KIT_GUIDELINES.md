# etisalat Design System — Figma Make kit guidelines

These guidelines teach Figma Make how to build etisalat Consumer App screens with
`@eand/react-design-system`. The components follow the Figma **etisalat Consumer App DSL V1.2**
library. The package is **web React 18 or 19**, Vite-compatible, and self-contained: no
dependencies, and token styles are inline, so no separate CSS import is required.

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
**Navigation & wayfinding** — `home` · `explore` · `menu` · `apps` · `grid` · `rows` · `more-horizontal` · `more-vertical` · `chevron-up` · `chevron-down` · `chevron-left` · `chevron-right` · `chevron-up-sm` · `chevron-down-sm` · `chevron-left-sm` · `chevron-right-sm` · `arrow-up` · `arrow-down` · `arrow-left` · `arrow-right` · `arrow-up-right` · `external-link`

**Actions & editing** — `add` · `add-content` · `subtract` · `close` · `dismiss` · `delete` · `remove` · `edit` · `cut` · `copy` · `copy-doc` · `save` · `undo` · `redo` · `refresh` · `sync` · `swap` · `shuffle` · `move` · `drag` · `expand` · `expand-horizontal` · `expand-vertical` · `collapse` · `aspect-ratio` · `filter` · `filters` · `sort` · `sort-vertical` · `search` · `search-list`

**Status & feedback** — `check` · `check-circle` · `dot` · `checklist` · `verified` · `warning` · `info` · `help` · `hourglass` · `thumbs-up` · `thumbs-down` · `smiley` · `celebrate` · `heart`

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

Common etisalat mappings: account/profile → `user` · AI assistant → `ai` · handset →
`phone-device` · order tracking → `delivery` or `order-tracking` · add-ons → `puzzle` ·
subscriptions → `package` · privacy/protection → `security` · add something → `add` ·
mParking → `car` · All Services → `grid` · etisalat Shop → `shop` · retail branch → `store` ·
a sparkle/star glyph in a header action → `magic-wand` or `ai` (not `add`).

**Right-to-left.** The library's own chevrons and arrows mirror on Arabic (`dir="rtl"`)
pages. A directional glyph *you* pass into a slot (a `chevron-right` in a `Button`'s
`trailingIcon`, say) does not know it is directional: wrap it as
`<span data-rtl-flip><Icon name="chevron-right" /></span>` and it mirrors too.

## Golden rules (always apply)
- **Build screens, not loose mockups.** An etisalat screen = **red account `TopBar`** (`surface="brand"` + `account={{ greeting, name }}` → "Hi, Ahmed" over a masked number, plus circle `actions`, with an optional `Tabs inverse` row in its `children`) → a vertical scroll body of grey **`Section`s on a white canvas** (wrapping cards / `ActionBar`s / `ListRow`s / `QuickAction` grids / carousels) → floating **`NavBar`** (Home · Support · Profile · Shop, active = white pill with a red icon). Overlays (`BottomSheet`, `AlertModal`, `Snackbar`, `Tooltip`) float above; a persistent primary CTA → `CtaFooter` pinned under the body. Detail/pushed pages use `<TopBar surface="white" onBack={…} title="…" />` (a back button and a centred page name).
- **Sizing:** controls (`Button`, `Input`, `OtpInput`, `Chip`, `FilterPill`, `Checkbox`, `Radio`, `Switcher`, `Searchbar`, `Tabs`) are fixed-height; in a form they fill width, inline (chips/pills/badges) they hug. `Button` `tertiary` and `link` hug their text with no padding. Containers (`Section`, `Accordion`, `FAQ`, `BottomSheet`) are full-width + hug content. Cards are fixed-height; in a **carousel** they are fixed-width, **stacked** or in a grid they fill width.
- **Sections** carry no outer margin of their own — they are `width: 100%` and paint their own fill, so the **page shell** supplies every gutter (see "The page shell" below). Padded content insets automatically. Put a carousel of cards in `<Section carousel>` and set `size` to the row the cards need: `sm` (148) for service cards and quick actions, `md` (224) for `DealCard` / `GeneralCard` / `NewCard`, `lg` (300) for `PlanCard` / `ProductCard`, `xl` (452) for a full `Highlight` banner.
- Use the brand: primary actions = `<Button>` (brand red). etisalat red is the accent; "midnight" is the neutral ink; silver/gold/platinum are Smiles tiers.
- **Give the page a neutral host stylesheet.** These components style themselves inline, so anything they set always wins — but anything they *don't* set is inherited from the page. `text-align`, `direction` and page-level width constraints leak straight through: a starter stylesheet with `#root { text-align: center; width: 1126px }` centres every section title and stretches inline controls to full width, and the components look broken when nothing is wrong with them. Reset the host to `body { margin: 0 }` and give the app a phone-width column (`width: 390px; margin: 0 auto; text-align: left`). Do not add global rules that target bare `button`, `input` or `p` — they will fight the components.
- **Never hand-draw chrome the kit already ships.** `TopBar` draws the iOS status bar itself (`statusBar` defaults to on), so do not add your own time/signal/wifi/battery row. `CtaFooter` draws the home indicator (on by default). Do not draw a device bezel, notch or Dynamic Island unless the user explicitly asks for a presentation mockup — a Make preview is already phone-shaped. Same rule as icons: if the kit renders it, let it.
- **Use the V1.2 props, never the deprecated aliases.** The old names still compile so existing screens keep working, but they render V1.1 looks or nothing at all. See "Deprecated — don't use" at the end of the component reference.

## The page shell — white canvas, 4px gutters

`Section` paints its own fill (`surface="default"` is the grey **#f0f0f5**) and is
`width: 100%` with no outer margin, so **the shell around the sections is what creates
every gap.** Getting this wrong makes a screen read as broken while every component in it
is correct, so build the shell first.

- **The canvas behind the sections is white.** Not grey. A grey canvas — `#f2f2f2`,
  `#e8e8e8`, Tailwind's `bg-gray-100` — lands within a few hex points of the section fill,
  so the sections dissolve into the background and the gutters disappear. "Default canvas"
  means **white**; only `Section` and the cards are grey.
- **4px padding around the section column, and a 4px gap between sections.** The white
  canvas shows through as a thin gutter at the screen edges and between every block. That
  4px is the whole spacing system at this level — do not substitute 8, 12 or 16.
- **`TopBar` and `NavBar` sit outside the padded column.** `NavBar` is full-bleed.
  `TopBar` is a rounded card that already carries its own 4px inset at the top and sides,
  so it lines up with the sections below it — do not wrap it in more padding.
- **Reserve ~100px of clearance at the bottom of the column.** `NavBar` is
  `position: sticky; bottom: 0` and floats over the content, so without it the last
  section scrolls underneath the glass pill.
- The phone column is **390px** wide.

```tsx
<div style={{ width: 390, margin: '0 auto', background: '#fff' }}>
  <TopBar surface="brand" account={{ greeting: 'Hi, Ahmed', name: '050 ••• 7823' }} />

  {/* 4px white gutter at the screen edges and between every section */}
  <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 100 }}>
    {/* every Section goes here */}
  </div>

  <NavBar items={[/* Home · Support · Profile · Shop */]} />
</div>
```

Inside a section the spacing is already handled: stacked `Section` children share a 4px
gap automatically, and a `carousel` keeps its own card spacing. Do not add wrapper divs
with your own margins between them.

## Component reference (props that matter)
**Chrome / layout**
- `TopBar({ surface: brand|midnight|white|none, statusBar, onBack, leading, logo, title, subtitle, account, actions, trailing, eyebrow, eyebrowChevron, bigTitle, subtext, chevron, rounded, children })` — the header: a rounded card (36px top / 20px bottom corners, 4px inset) holding the status bar and a three-column row. **brand** = red account header (`account={{ greeting, name, avatar }}` on the left, circle `actions` on the right); **midnight** = the same on dark; **white** = the light header for pushed pages; **none** = transparent, for a grey or midnight canvas. `onBack` draws the 40px back button; `title` (+ `subtitle`) is the centred page name; `logo` (`true`) puts the etisalat lockup in the middle instead. `bigTitle` (+ `eyebrow`/`eyebrowChevron`/`subtext`) gives the large 24px hero title. `children` is the add-on slot below the row, for a `Searchbar`, `<Tabs inverse>`, chips, a `Stepper` or an `ActionBar`. `actions` take bare `<Icon/>`s — the header draws the circles and inks them. **`statusBar` is on by default** — the iOS status bar comes free, so never hand-draw one; pass `statusBar={false}` only to suppress it. With no `surface` it is `brand` when `account` or `bigTitle` is set, else `white`.
- `NavBar({ items, scrollDirection: up|down })` — **floating glass** bottom nav; items are `{ label, icon, avatar, active, onClick }`. Frosted white-15% + blur pill over a midnight scrim; **active tab = solid white pill with red icon+label** (label stays regular weight), inactive = white. **One pill of 4 equal tabs — Home · Support · Profile · Shop**; mark the current one `active` and give it the `-filled` icon. There is no detached or floating nav button: every item sits inside the single pill. `scrollDirection="down"` collapses it to icons only.
- `Section({ title, context, titleLine, filterPill, surface: default|raised|ai-powered|brand|midnight-base|midnight-raised|glass-midnight|glass-white, showHeader, trigger: chevron|button|none, triggerLabel, onTrigger, size: xs|sm|md|lg|xl, gradient, carousel })` — **grey rounded container** (radius 24), the body building block. Header = a 24px bold `title`, an optional `filterPill` inline after the title, then the trigger at the end; `context` is the subtext line. `trigger="chevron"` (default) is the 40px section-link button; `trigger="button"` swaps it for a `triggerLabel` tertiary button (use this for a "Manage" or "See all" text link); `trigger="none"` hides it. Stacked slot children share a tight **4px gap**; carousels keep card spacing. `surface`: `default` grey · `raised` white · `ai-powered` soft pink gradient · `brand` red · `midnight-base`/`midnight-raised` dark · `glass-midnight`/`glass-white` over imagery only. On dark surfaces pass `<FilterPill inverse>`. `gradient` adds the orange-red sunset glow — on the most important section only.
- `ListRow({ type: info|price, label, sublabel, icon, logo, value, hint, badge, tooltip, onTooltipClick, action, chevron, inverse, surface: default|subtle|sunken|glass|white-transparent|midnight-base|midnight-raised|midnight-transparent, padding })` — a **data row**, not a tap target: label ↔ value pairs, plan details, overview lines. `type="info"` (default) is a padded white rounded card; `type="price"` is a flat line item for receipts and price breakdowns. Leading `icon` (40px tile) or `logo`; `sublabel` under the title; trailing `value` / `hint` / `badge`; `tooltip` adds an info glyph after the title. It shows a trailing chevron by default — pass `chevron={false}` on pure data rows. For a row the user taps, use `ActionBar`. `inverse` for dark surfaces.
- `ActionBar({ title, subtitle, icon, action, chevron, switcher, colorScheme: default|inverse, surface: default|subtle|sunken|glass|white-transparent|midnight-base|midnight-raised|midnight-transparent, stack })` — the 72px **tappable row / card row**: icon tile + two lines + **one** trailing trigger — a `Button` in `action`, a `chevron` (the whole bar becomes the tap target), or a `switcher` (`true` or `Switcher` props). Use it for settings and navigation rows ("Manage my plan ›"), promos and toggles, inside the body or in the `TopBar` add-on slot. It is not the sticky footer — `CtaFooter` is.
  **Picking a surface:** inside a grey `Section` use `surface="default"` (white) — `subtle` is #f0f0f5, the *same colour as the Section*, so it vanishes there; keep `subtle` for rows sitting directly on the white canvas. Light family: `default` · `subtle` · `sunken` · `glass`; inverse family (white ink, for dark or image backgrounds): `glass` · `white-transparent` · `midnight-base` · `midnight-raised` · `midnight-transparent`. The ink follows the surface; `colorScheme="default"` with `surface="glass"` gives the light glass with dark ink. `stack` gives the layered "more of these" look on the inverse surfaces only.
- `QuickAction({ items, layout: grid|carousel, columns, rows })` — Account-hub shortcut grid of borderless white cards (148 tall, radius 20, 4px gap): a grey radius-12 square holding a filled glyph, a status badge at the top end, the label at the bottom. `grid` is **2-up** (keep the default `columns`); `carousel` scrolls horizontally in `rows` of 147px cells. Each item is `{ type, label, icon, badge, onClick }`. `type` is one of the 13 catalogue tasks and fills the label and icon for you: `quick-pay` · `order-track` · `sim-activate` · `sim-replace` · `addon-buy` · `devices` · `device-buy` · `plan-change` · `live-chat` · `contact-us` · `subscriptions` · `mParking` · `all-services`. Badges are `<Badge status="positive" size="lg">`.
- `SectionLink({ title, link, onLinkClick })` — standalone header + "See all" link, for content that is not inside a `Section`. Inside a Section use its own header.
- `SectionLinkButton({ glass, inverse, action: forward|backwards|close, icon, disabled })` — the 40×40 round icon button at the top-end of a section header. `Section` already renders one via `trigger="chevron"`; use this directly only when building a header by hand. `glass inverse` is the treatment for dark or image surfaces.
- `FAQ({ items, categories, value, defaultValue, onCategoryChange, defaultOpen })` — the questions-and-answers block at the end of a page: white accordion cards (one open at a time) under an optional row of category chips. `items` are `{ question, answer, category }`; an item with no `category` shows under every chip. Use it for **3 or more** questions, never for 1–2. It has no header of its own — put it in a `<Section title="FAQs">`.
- `Accordion({ title, defaultOpen })` — a single plain expand/collapse row. For a list of questions use `FAQ`.
- `PageHeader({ title, subtitle, icon, tabs, value, defaultValue, onTabChange, inverse, as })` — the **opening** block of a content page: 56px `icon` slot, a two-line 28px bold title, a centred subtitle and a row of 48px tab pills. `title` is up to two lines, each `{ muted, strong }` — e.g. `[{ muted: 'Discover', strong: 'Thermostats.' }, { muted: 'Built for', strong: 'Intelligence' }]`; the muted word is greyed, the strong one full ink. `tabs` is a string array with exactly one selected. White card on light pages; `inverse` = 20% glass with white text for dark or image backgrounds. **One per screen, directly below the `TopBar`, outside any `Section`.** Not for results — that is `PageTitle`.
- `PageTitle({ type: lg|md|sm|xs, alignment: center|left, status: positive|danger|warning|brand|neutral, statusIcon, title, description, as })` — the **concluding** block after an action: status icon (lg and md only), a bold title clamped to two lines, an optional description. `lg` for a full-page success or failure, stepping down to `xs` inside a `BottomSheet` or card. `center` for standalone screens, `left` inside a content flow. Match `status` to the real outcome.
- `StatusIcon({ type: positive|danger|warning|brand|neutral, icon })` — the 56px tinted tile with a filled status glyph that `PageTitle` uses; `icon` swaps the glyph for another icon-set name.
- `AtomSurface({ surfaceColor: default|subtle|sunken|brand|midnight-base|midnight-raised|glass-midnight|glass-white })` — raw radius-20 surface panel when you need a token-correct background behind custom content. Prefer `Section` or a card for real screens.
- `CardBgColor({ tint: default|red|orange|yellow|green|cyan|blue|violet, fixedSize })` — the pastel tint panel that backs a card's media area (same palette as `ProductCard`'s `tint`).

**CTA bar (sticky bottom checkout)**
- `CtaFooter({ ribbon, price, terms, payment, actions, surface, homeIndicator, rounded })` — the sticky bottom CTA bar: a white card with a soft shadow and rounded top corners. Slots stack top-to-bottom: `ribbon` (a `StatusRibbon`) → `price` (`{ label, value, actionLabel, onAction, actionIcon }`, drawn as a `PriceLine`) → `terms` (a `ConsentCheckbox`) → `payment` (a `PaymentRow`) beside `actions` (half width each) → the iOS home indicator. **Leave `homeIndicator` on** (the default): it is the bar's only bottom spacing, and without it the buttons sit flush on the edge. `surface={false}` drops the fill and shadow when the bar sits on a surface that already separates it. This is the persistent-CTA pattern; do not hand-roll a fixed footer.
- `ActionBlock({ ribbon, price, terms, payment, actions })` — the same stack without the bar (no fill, shadow, sticky position or home indicator), for a CTA block inside a `BottomSheet` footer or a page body.
- `ButtonGroup({ orientation: horizontal|vertical, primary, secondary, tertiary })` — the CTA button arrangement inside `actions`. Vertical stacks them 20px apart; horizontal puts secondary + primary side by side, 12px apart. `tertiary` always gets its own centred row.
- `PriceLine({ label, value, actionLabel, onAction, actionIcon })` — the price summary row: a grey label (with an optional tertiary button such as "View breakdown" under it) and the price at the end. `CtaFooter`'s `price` draws one for you.
- `StatusRibbon({ status: alert|success|warning|info, leadingIcon, action, trailingIcon, onAction })` — 40px full-bleed status strip above a CTA footer ("Only 2 left in stock", "Delivery by Thursday"); the label is its children.
- `PaymentRow({ icon, label, actionLabel, onAction })` — payment-method summary: 40px method tile + masked number ("•••• 4326") + a tertiary "Change" button.

**Controls**
- `Button({ variant: primary|secondary|tertiary|link|glass, scheme: default|inverse|midnight, size: sm|md|lg, block, loading, leadingIcon, trailingIcon })` — primary = filled pill, secondary = 1px outline, tertiary = bare text, link = body text underlined only while pressed, glass = frosted (for the brand-red header; it ignores `scheme`). `scheme` re-colours the set for its background: `default` = brand red (light backgrounds), `inverse` = white (red or dark backgrounds), `midnight` = ink. **Secondary is the exception:** on secondary, `scheme="inverse"` is the dark outline and `scheme="midnight"` is the white outline — so a secondary on a red or dark background is `scheme="midnight"`. Primary, secondary and glass are 48 / 40 / 32 tall (lg / md / sm); tertiary and link hug their text. Icon slots take an `<Icon>` of 20 (lg), 16 (md) or 12 (sm). `block` stretches it for a CTA. `loading` shows a spinner and suppresses clicks — it is not the disabled state; pass the native `disabled` for that.
- `UaePassButton({ variant: login|continue|rtl, block })` — the UAE PASS sign-in button (48px outline pill with the UAE PASS logo and fixed copy). `rtl` is the Arabic label. Pass the native `disabled` to disable it. Use it only for UAE PASS sign-in, never as a general button.
- `Input({ label, helper, error, success, statusIcon, type: text|dropdown|picker|comment, htmlType, inverse, clearable, onClear, leadingIcon, trailingIcon })` — floating label inside a 56px filled field (radius 14). No outline at rest; a 1px red outline while focused, a danger outline with `error`. `helper` / `error` / `success` render a status line with an info glyph under the field (`statusIcon={false}` hides the glyph). `type="dropdown"`/`"picker"` render read-only with a trailing chevron; `type="comment"` is the multi-line box. `htmlType` is the underlying HTML type (password, email…). `clearable` shows a clear (✕) button only while the field is focused and has a value. Icon slots take a 20px `<Icon>`. `inverse` for dark surfaces.
- `OtpInput({ length, value, defaultValue, onValueChange, masked, inverse, disabled, error })` — a row of one-character cells for a verification code; **6 cells by default**. `masked` renders dots (for a PIN). The cells stay left-to-right on Arabic pages.
- `Searchbar({ onMic })` and `AISearch({ onMic })` — the search field and its "Ask etisalat" sibling; both accept the native input props (`placeholder`, `value`, `onChange`).
- `Chip({ type: outline|filled|glass|inverse, selected, disabled, check, leadingIcon, onDismiss, dismissLabel, onClick })` — 40px pill for category rows, "Jump to…" rows and tag rows. `check` puts a check mark in the leading slot while selected; `leadingIcon` takes a 12px `<Icon>`. `onDismiss` makes it removable (a trailing ✕). Use `type="glass"` or `"inverse"` on dark surfaces.
- `FilterPill({ selected, inverse, disabled, onClick })` — the filter/sort row pill with a trailing chevron; transparent until selected.
- `Tabs({ tabs, value, defaultValue, inverse, icons, onChange })` — a row of 48px tab pills: white pills, the selected one tinted red. **`inverse`** gives the glass pills for the red or midnight `TopBar` add-on slot and other dark surfaces. `icons` (optional, index-aligned) takes icon-set names or nodes. Use the same `Tabs` for page tabs and in-section tabs.
- `Selectors({ options, value, defaultValue, onChange })` — compact segmented control.
- `Picker({ options, surface: default|light|inverse|glass, value, defaultValue, onChange })` — a single-select row of fixed 106×72 option tiles (data plan sizes, durations, colours). The selected tile turns midnight with white text and a check (white with dark text on `inverse`/`glass`). Each option is `{ value, caption, badge, disabled }`; a string `badge` ("Popular") renders the neutral strip along the tile's bottom.
- `PickerOption({ value, caption, badge, surface: default|light|inverse|glass, selected, disabled, onClick })` — the standalone tile, when you need to lay the options out yourself.
- `Checkbox({ label, size: sm|md, inverse, radio })` and `Radio({ label, size: sm|lg, inverse })` — both wrap a native `<input>`, so state comes from the usual `checked` / `defaultChecked` / `onChange` / `disabled` props. `Checkbox radio` draws the round mark while keeping checkbox semantics.
- `ConsentCheckbox({ prefix, links, conjunction, suffix, inverse })` — the consent row: a checkbox and one wrapping sentence with inline legal links — e.g. `prefix="Agree to the"`, `links={[{ label: 'Terms' }, { label: 'Privacy Policy' }]}`, `suffix="before proceeding"` ("and" joins two links). Each link is `{ label, href, onClick }`; tapping a link does not tick the box. State comes from the native `checked` / `defaultChecked` / `onChange` / `disabled`. This is what goes in `CtaFooter`'s `terms`.
- `Switcher({ checked, defaultChecked, disabled, size: sm|md, inverse, onChange })` — the on/off toggle: `md` 40×24 (default) or `sm` 32×20. `inverse` for red or midnight surfaces.

**Primitives**
- `Text({ variant, as, color })` — `variant` is a typography path such as `body.md`, `title.sm`, `heading.lg` (24px bold); `as` picks the element. **`color` is a raw CSS colour, not a token path and not a keyword.** `color="muted"` / `"secondary"` / `"text.default.muted"` are invalid CSS that the browser drops silently, leaving the text in default ink with no error — so **omit `color`** and let `Text` ink itself, or pass a real value from the exported `tokens` object: `tokens.color.text.default.muted` (#908e9a) for a secondary line, `.subtle` (#575362) for a slightly dimmed one. For glyphs use `<Icon name="…" />` (see "Icons" above) — never emoji.
- `Logo({ version: default|white|red, type: lockup|logomark|wordmark|bilingual, rtl, size, color })` — the real **etisalat** logo (V1.2 rebrand: the swoosh mark + "etisalat" wordmark; the old "e&" lockup is gone). With no `type` it is the square brand symbol: `default` = red tile with the white lockup (app-icon look), `white` on dark/brand surfaces, `red` on light ones. Add `type` for a bare artwork that fills its square: `logomark` (swoosh only, for tight spots), `wordmark` (text only), `lockup`, or `bilingual` (English + Arabic). `rtl` swaps lockup and wordmark to Arabic — pass it on Arabic screens. Never re-create the mark from text or an emoji.
- `IconBox({ size, category: 2d|logo, icon })` — fixed square that keeps a glyph on the icon scale (`xs`…`5xl`: 8–56px). Pass `icon` (an icon-set name) and it draws the glyph at the right size inside the box's inset; `category="logo"` clips artwork to the full box.
- `Badge({ offer, status, size: sm|md|lg, chevron })` — **offer**: `new-card`/`new-plan` (green) · `mega-deals`/`green-friday`/`discount` (red) · `limited-stock`/`validity`/`limited-time` (yellow) · `best-seller` (magenta) · `online-exclusive`/`exclusive-for-emirati` (burgundy) · `sold-out` (grey). **status**: `neutral`/`neutral-inverse`/`disabled`/`positive`/`warning`/`danger`. `chevron` adds a trailing chevron. Cards and quick actions use `lg`, service cards `md`.
- `StatusIndicator({ type: basic|pill|glass|glass-dark, status: neutral|positive|danger|warning, dot })` — a status dot + short label ("Active", "Expired"); the label is its children. `basic` is bare text, `pill` sits on a tinted pill, `glass` / `glass-dark` are frosted pills for imagery. `dot={false}` hides the dot.
- `LogoRow({ logos, size: sm|md|lg, glass, more, moreSurface: default|inverse })` — a row of round partner logos (24 / 32 / 40px). `logos` are image URLs or nodes; `glass` puts each on a frosted tile (for imagery); `more={4}` appends a "+4" bubble.
- `MoreItems({ count, surface: default|inverse, size })` — the round "+N" bubble on its own (`LogoRow`'s `more` draws one for you). `default` is dark glass for light backgrounds, `inverse` white glass for dark ones.
- `ProgressBar({ value, tone: accent|positive|warning|danger })` — a single filled bar; `Stepper({ steps, progress, inverse })` is the segmented 2–8 step indicator for onboarding and checkout flows.
- `AddTrigger({ label, surface: default|inverse })` — the "＋ Add" pill: a small red disc with a plus, then the label, on a soft tinted pill (no border). `inverse` for dark surfaces.
- `Dismiss({ surface: default|inverse, size: sm|md, onClick })` — the circular close button on cards, sheets and banners.

**Feedback / overlays**
- `Alert({ status: success|alert|warning|info|info-midnight, title, action, onAction, actionPlacement: end|below, stack, stackIndex })` — in-page message block: a tinted card (radius 16) with a 32px status tile, bold `title`, body text as children, and one optional `action`, drawn as a small white primary button. **The status names are not the usual traffic light:** `success` green · `alert` amber (a caution) · `warning` **orange — the most severe step, use it for errors and failures** (V1.2 has no red alert) · `info` neutral grey · `info-midnight` dark. `actionPlacement="below"` puts the button under a longer text block. `stack={3}` with `stackIndex` draws the step dots when several alerts share one slot.
- `PlanUsageBar({ label, remaining, total, unit, note, status: default|low-data, valueState: default|filled, labelState: default|filled })` — a 48px filled block showing what is **left** of an allowance: the amount reads inside the block ("2 GB left"), the category label sits in the track opposite ("Local Data"). Green normally, orange on `low-data` — set it yourself, the bar does not guess the threshold. `note` adds a second line such as "Expires 3 days". Text that the fill covers turns white automatically; `valueState` / `labelState` pin it. Stack them with a 4px gap for a plan breakdown.
- `Snackbar({ status: success|alert|warning|info|loader, message, aed, action, onAction, backdrop })` — transient dark toast (radius 16, 48px min height): a 44px status tile, the `message` in regular 14px white text, an optional `aed` amount after it ("AED 60.00"), and an optional `action` drawn as a small white primary button. Status names match `Alert` (`warning` = orange errors); with no `status` it shows the `info` mark; `loader` shows a spinner. `backdrop` adds a blurred gradient behind the pill for busy content. It is not positioned for you — place it near the bottom, above the `NavBar`.
- `AlertModal({ open, integration: full-screen|bottom-sheet, visual, title, description, footer, onClose })` — the **success / outcome screen** that takes over after an action ("Payment successful"): a framed `visual` (an illustration) at the top, a centred 28px title and `description`, and the CTAs in `footer` (one or two block `Button`s). `full-screen` covers the page; `bottom-sheet` rises on a scrim. `onClose` adds the close button. It is **not** a confirm dialog — V1.2 has none; ask a confirming question with a `BottomSheet` whose `footer` holds a `ButtonGroup`.
- `BottomSheet({ open, type: basic|detailed|system-message, grabber, title, description, icon, pills, visual, closeButton, footer, onDismiss })` — the modal sheet on a scrim: a light-grey sheet (radius 24 top) with a 20px bold title and a white content area (its children). `type`: `detailed` (default) = title + body · `basic` = `visual` + `icon` + title + `description` · `system-message` = no grabber, a close button + body. `pills` takes a `Chip` row under the title. The close button shows whenever `onDismiss` is set (`closeButton={false}` hides it). Put the sheet's CTA in `footer` (a `ButtonGroup` or an `ActionBlock`).
- `Tooltip({ content, title, media, action, steps, onClose, size: simple|standard|rich, surface: default|dark, visible, placement: top|bottom|left|right, caret, caretAlign: start|center|end })` — a hint bubble with a caret pointing at its trigger (the children). `simple` is one line; `standard` is 200px wide; `rich` is 280px with `title`, `media`, an `action` button, a `steps` counter ("1 of 3") for coach marks and a close (`onClose`). `caretAlign` slides the caret along the top/bottom edge; `caret={false}` hides it.
- `Scrim` — the full-screen midnight 50% + blur layer behind overlays. `BottomSheet` and `AlertModal` already bring their own; use it only behind a custom overlay.

**Cards / product**
- `PlanCard({ name, category, price, period, from, discount, colorScheme: default|inverse, smiles, logos, moreLogos, width })` — plans-portable, 222×300: overline (`category`, "Postpaid") + title + a logo row, then the red Discount badge, "from" and the price in the footer. `discount` is a label (`true` = "Discount"); `from={false}` drops the "from" line; `category={null}` / `period={null}` hide those. `colorScheme="inverse"` is the dark card. Section `size="lg"`.
- `ProductCard({ type: package|product|category, eyebrow, title, image, discount, colors, price, period, pts, priceLabel: from|pay-only|smiles-combined|none, labelPts, logos, tint, width })` — card-features, 229×300, a pastel `tint` panel with a white ring on a white card. `package` = add-on / bundle (overline `eyebrow`, a 4-line title, logos); `product` = an `image` (a product shot or a large `<Icon>`) over the title; `category` = a category tile. `discount` is the lg badge label ("20% off") — or pass `colors` (CSS colours) for colour swatches instead. `pts` prices in Smiles points; `priceLabel` sets the line above the price. Section `size="lg"`.
- `DealCard({ overline, title, logos, price, wasPrice, discount, likes, onLike, onDislike, width })` — deals-card, 166×224 white card: overline + 2-line title, a logo row, then the Discount badge and struck-through `wasPrice`, the `price`, and an optional like/dislike pill (`likes`). It has no image. Section `size="md"`.
- `GeneralCard({ title, image, imageAlt, size: sm|md|lg, topAlignment, surface: default|inverse, carousel, badge, badgePlacement: start|center|end })` — the general 224-tall tile: a centred 2-line title and an image (`sm` 64px, `md` 128px, `lg` full-bleed). **`surface="default"` is the dark card; `inverse` is the white one** (as Figma names them). `carousel` makes it a 147px carousel cell; otherwise it fills its grid slot. `topAlignment` puts the image and badge at the top and the title at the bottom. Section `size="md"`.
- `NewCard({ image, title, selected, badge, width })` — "New on etisalat" tile, 137×224; `selected` adds the gradient ring; the "New card" badge shows unless `badge={false}`. `ServiceCard({ icon, label, badge, size: grid|carousel })` — a 148-tall service tile with a 48px filled icon and a 2-line label; badge e.g. `<Badge offer="new-plan" size="md">New</Badge>`.
- `Highlight({ size: lg|md|sm, title, subtitle, image, action, tag: logos|badge|none, logos, badge, placement: single|stacked, items, width })` — the photo banner (radius 24, dark gradient at the bottom). `size="lg"` (452) shows `title` and `subtitle`; `md` (224) and `sm` (148) show only the tag and the action bar. `image` is a URL — it is a photo banner, so **pass one**; without it the banner falls back to a plain dark fill, so with no artwork prefer `md`/`sm`. `action` (`{ title, subtitle, cta, onCta }`) adds the glass action bar with a button; `tag` is a glass logo row (`logos`), the "Limited time offer" badge (`badge` relabels it), or `none`. `placement="stacked"` lays this banner and `items` out as peeking 307px cards.
- `Recommendation({ title, description, icon, cta, onCta, inverse, carousel, items, width })` — a centred "Recommended for you" card (224 tall): a 32px logo, title, description and a button. `inverse` (the default) is the glass card for a dark or image backdrop; `inverse={false}` is the white card. `carousel` lays this card and `items` out as peeking cards.
- `SmilesBalance({ points, label, active, tier: silver|gold|platinum, nextTier: silver|gold|platinum, pointsToNext, progress, message, tooltip, onInfo })` — the white Smiles points card (148 tall): the total and "Points", the member's tier pill, a progress bar and "Just {n} points to your {Tier} Tier". `active={false}` is the not-yet-activated state; `tier={null}` hides the pill. `points` is the number only ("12,450") — the "Points" label is drawn for you.
- `Voucher({ title, description, display: light|dark, state: default|applied, onApply })` — a fixed 144×144 ticket tile with notched sides and a punched perforation, carrying a title, a qualifier line and an Apply action. It is a fixed-size carousel cell, not a full-width row: put several in a `<Section carousel>`.
- `Card({ media, title, body, action, width, surface: default|inverse })` — a generic media-over-text card with no V1.2 symbol of its own. Reach for `GeneralCard` or a specific card first.

**Deprecated — don't use.** These still compile so older screens keep working, but they
render V1.1 looks or nothing at all. Use the replacement:

| Don't use | Use instead |
|---|---|
| `Button` `surface` / `tone` | `scheme` (`default` · `inverse` · `midnight`) |
| `TopBar` `variant`, `greeting`, `actionBar`, `compact`, `surface="default"`; a back chevron in `leading` | `surface`, `account={{ greeting }}`, `children`, `surface="white"`, `onBack` |
| `Section` `surface="inverse"` / `"midnight"` / `"brand-muted"`, `hideChevron`, `onSeeAll`; `filterPill` holding a text link | `brand` / `midnight-base` (brand-muted has no V1.2 surface), `trigger="none"`, `onTrigger`; `trigger="button" triggerLabel="Manage"` |
| `Tabs scope="local"` | `Tabs` (add `inverse` on dark surfaces) |
| `Chip` `loading`, `inverse` | no chip loader in V1.2; `type="inverse"` |
| `Switcher size="lg"` | `size="md"` |
| `Input` `variant` | nothing — there is one filled style |
| `SectionLinkButton` `surface` | `glass` + `inverse` |
| `AtomSurface` `level` | `surfaceColor` |
| `ActionBar` `inverse` | `colorScheme="inverse"` |
| `Alert` / `Snackbar` `tone` (V1.0 names — `tone="warning"` is `status="alert"`, `tone="danger"` is `status="warning"`) | `status` |
| `Snackbar` `subtitle`, `onDismiss` | one-line `message` (+ `aed`), `action` |
| `AlertModal` `tone`, `body`, `actions`, `onDismiss` (the old centred dialog) | `integration`, `description`, `footer`, `onClose` |
| `BottomSheet` `display`, `subheader` | the sheet is always light; `pills` |
| `PlanUsageBar` `used` | `remaining` |
| `CtaFooter` / `PriceLine` price `note` | `actionLabel` |
| `CheckboxLine` (and a hand-rolled `Checkbox` + label for terms) | `ConsentCheckbox` |
| `PlanCard` `variant` | `colorScheme` |
| `ProductCard type="addon"` | `type="package"` |
| `DealCard` `image`, `subtitle`, `badge` | `logos`, `overline`, `discount` |
| `Highlight` `tone`, `background`, `cta` | `image` + `size` + `tag`, `action` |
| `SmilesBalance` `cta` (the old gold Redeem strip) | the V1.2 card has no button |
| `Voucher` `status` | `state` |
| `SmilesRow`, `SmilesAvatar` | `LogoRow` with `more` |
| `Logo version="midnight"` | `default` · `white` · `red` |
| `Badge status="brand"` | pending design confirmation — prefer the other statuses |

## UX → UI assembly (turn a wireframe into a screen)
| UX pattern | Use |
|---|---|
| The screen itself (canvas, gutters) | white 390px column · 4px padding · 4px gaps · ~100px bottom clearance — see "The page shell" |
| Greeting / account header | `TopBar surface="brand"` with `account={{ greeting, name }}` + circle `actions` |
| Detail / pushed page header | `TopBar surface="white"` with `onBack` + `title` (`surface="none"` on a grey or midnight canvas) |
| Category / landing intro under the top bar | `PageHeader` (icon · two-line title · subtitle · tab pills) |
| Success / failure page in a flow | `PageTitle type="lg"` with the matching `status`, then the CTA in a `CtaFooter` |
| Success takeover after a payment or order | `AlertModal` (`integration="full-screen"` or `"bottom-sheet"`) |
| Bottom tab bar | `NavBar` — Home · Support · Profile · Shop (mark current `active`, `-filled` icon) |
| Top-level page tabs (For you / Account / Loyalty) | `<Tabs inverse>` in the red `TopBar`'s `children` |
| In-section tabs (All / Data / Calls) | `Tabs` inside the Section |
| Each content block | a full-width `Section` (`title` + `context` + trigger) |
| "Manage" / "See all" text link in a section header | `Section trigger="button" triggerLabel="Manage"` |
| Horizontal row of tiles | `<Section carousel size>` of `DealCard`/`GeneralCard`/`NewCard` (`md`) or `PlanCard`/`ProductCard` (`lg`) |
| Tappable settings / navigation row ("X ›") | `ActionBar` with `chevron` (`surface="default"` inside a Section) |
| Settings toggle row | `ActionBar` with `switcher` |
| Label ↔ value / plan detail / overview rows | `ListRow` (`chevron={false}`) stacked in a Section |
| Receipt / price breakdown lines | `ListRow type="price"` |
| Account-hub / quick-links grid | `QuickAction` (2-up `grid`, or `layout="carousel"`) with catalogue `type`s and `<Badge status="positive" size="lg">` |
| Service shortcut grid | `ServiceCard`s in a Section (badge `size="md"`) |
| Promo / upsell row inside the body | `ActionBar` (icon tile + two lines + button or chevron) |
| Personalised suggestion card | `Recommendation` |
| "Jump to…" / category chips block | a `Chip` row in a default `Section` |
| FAQs at the end of a page | `<Section title="FAQs"><FAQ items={…} /></Section>` (3+ questions) |
| Filter/sort row | `FilterPill`/`Chip` row |
| Form | `Input`/`Searchbar`/`Checkbox`/`Radio`/`Switcher`/`Selectors` |
| Terms & conditions consent | `ConsentCheckbox` (in `CtaFooter`'s `terms`) |
| Sign in with UAE PASS | `UaePassButton` |
| Choose one of several options (size, duration, colour) | `Picker` (or `PickerOption` tiles laid out yourself) |
| OTP / verification-code entry | `OtpInput` (6 cells by default, `masked` when it is a PIN) |
| Multi-step flow progress | `Stepper` in the `TopBar`'s `children` |
| Promo banner | `Highlight` (pass an `image`) |
| Status label ("Active", "Expired") | `StatusIndicator` · offer / count tag → `Badge` |
| Usage meter | `PlanUsageBar` · generic bar → `ProgressBar` · Loyalty → `SmilesBalance` · Coupon → `Voucher` |
| Inline message block | `Alert` · above a checkout CTA → `StatusRibbon` |
| Modal / sheet | `BottomSheet` · Confirm a choice → `BottomSheet` with a `ButtonGroup` `footer` · Toast → `Snackbar` · Hint / coach mark → `Tooltip` |
| Persistent bottom CTA / checkout footer | `CtaFooter` with `ButtonGroup` in `actions` (+ `price`, `ConsentCheckbox`, `PaymentRow`, `StatusRibbon`) |

## Worked example — Home screen
```tsx example
<div style={{ width: 390, margin: '0 auto', background: '#fff' }}>
  <TopBar
    surface="brand"
    account={{ greeting: 'Hi, Ahmed', name: '050 ••• 4567' }}
    actions={[<Icon name="search" />, <Icon name="notification" />]}
  >
    <Tabs inverse tabs={['For you', 'Account', 'Loyalty']} />
  </TopBar>

  {/* 4px white gutter at the screen edges and between every section */}
  <div style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 100 }}>
    <Section title="Your Smiles" context="Silver member" onTrigger={() => {}}>
      <SmilesBalance points="12,450" tier="silver" nextTier="gold" pointsToNext="2,500" progress={40} />
    </Section>

    <Section title="Quick actions" context="Top things to do" onTrigger={() => {}}>
      <QuickAction
        items={[
          { type: 'quick-pay', badge: <Badge status="positive" size="lg">Active</Badge> },
          { type: 'order-track' },
          { type: 'mParking' },
          { type: 'all-services' },
        ]}
      />
    </Section>

    <Section title="Plans" context="Cover these with your Smiles Points" carousel size="lg" onTrigger={() => {}}>
      <PlanCard colorScheme="default" />
      <PlanCard colorScheme="inverse" />
    </Section>

    <Section title="Deals for you" context="Picked for your plan" carousel size="md" onTrigger={() => {}}>
      <DealCard overline="Data" title="Freedom Unlimited Data 500 Local" discount="20% off" wasPrice="AED 250" price="AED 200" />
      <DealCard overline="Roaming" title="GCC Roaming Pass 7 days" discount="15% off" wasPrice="AED 120" price="AED 102" />
    </Section>

    <Section title="Add-ons" context="Top up your plan" carousel size="lg" onTrigger={() => {}}>
      <ProductCard type="package" eyebrow="Data" title="Freedom Unlimited Data 500 Local" discount="20% off" price="AED 200" />
      <ProductCard type="product" image={<Icon name="phone-device" size={64} />} title="iPhone Clear Case" discount="20% off" price="AED 200" />
    </Section>

    <Highlight
      size="md"
      tag="badge"
      action={{ title: 'Smiles Unlimited', subtitle: 'Exclusive venue deals', cta: 'Play now' }}
    />

    <Section title="Account" trigger="none">
      <ActionBar surface="default" icon={<Icon name="receipt" />} title="Your bill is ready" subtitle="AED 480 due 12 Aug" action={<Button size="sm">Pay now</Button>} />
      <ActionBar surface="default" icon={<Icon name="settings" />} title="Manage my plan" subtitle="Postpaid 500" chevron />
      <ListRow label="Local Data" sublabel="Renews 1 Sep" value="2 GB left" chevron={false} />
    </Section>

    <Section title="FAQs" trigger="none">
      <FAQ
        items={[
          { question: 'How do I pay my bill?', answer: 'Tap Pay now on your bill, or use Quick Pay & Recharge.' },
          { question: 'How do I track my order?', answer: 'Open Track Your Order from Quick actions.' },
          { question: 'How do I earn Smiles points?', answer: 'You earn points on every bill you pay with etisalat.' },
        ]}
      />
    </Section>
  </div>

  <NavBar items={[
    { label: 'Home', icon: <Icon name="home-filled" />, active: true },
    { label: 'Support', icon: <Icon name="support" /> },
    { label: 'Profile', icon: <Icon name="user" /> },
    { label: 'Shop', icon: <Icon name="shop" /> },
  ]} />
</div>
```
**Tip for Make:** build the white 390px shell with its 4px gutters first, then put each
content block in its own `Section` (grey container), use `carousel` + the right `size` for
horizontal card rows, reach for the specific card (`PlanCard`/`ProductCard`/`DealCard`/
`GeneralCard`) rather than a generic `Card`, use `ActionBar` for anything the user taps and
`ListRow` for data, and give every prominent glyph the `-filled` form. Let `TopBar` draw the
status bar and let `Text` pick its own colour.

# e& Consumer App DSL — Full Audit

> ⚠️ **DEPRECATED (2026-07-02):** this audit targets the old **V1.0** file (`IoDxMEgOiOuwfIL5IbJzi5`).
> Current audit: [`AUDIT-V1.1.md`](./AUDIT-V1.1.md) against `e& Consumer App DSL V1.1` (`pzm63BTLfPfT1stcF89ILQ`).
> Kept as historical record.

> Source of truth for building the React Native UI package (working name `@eand/ds`).
> Figma: `e& Consumer App DSL V1.0` (fileKey `IoDxMEgOiOuwfIL5IbJzi5`).
> Token export: `./variables.json` (Figma Variables, DTCG/W3C format).
> Audited: 2026-06-16.

---

## 1. Access & source notes

- The Figma **page-listing endpoint is unreliable** here (only ever returns the Cover page); navigation by explicit node-id works fine.
- The **canonical token source is `variables.json`** (exported Figma Variables), not the documentation frames. Build the package from this file.
- Legacy **Colour Styles** still exist in the file (`BG White/100`, `Gold/130`, `Components/Badges/*`, `Gradients/*`, `Midnight %/80%`). These are **deprecated** — build from the `tokens`/`primitives` variable collections, not the old styles.

---

## 2. Token system

`variables.json` = 3 collections, **single mode (`value`)**, **830 leaf tokens**, **3-tier aliasing** (`semantic → primitive alias → rem → px`).

| Collection | Leaves | Top-level groups | Types |
|---|---|---|---|
| `primitives` | 243 | `color`, `font`, `rem` | color, float, string |
| `size` | 90 | `border`, `border-radius`, `card`, `checkbox`, `icon`, `radio`, `scale`, `section`, `section-link`, `spacing`, `switcher`, `tabs` | float |
| `tokens` | 497 | `Scroll bar`, `color`, `typography` | boolean, color, float, string |

**No Figma dark mode.** Light/dark is expressed via explicit `inverse/*` semantic tokens, not a mode switch. → Package theme = single surface + inverse variants (not a runtime mode toggle, unless we add one).

### 2.1 Color — primitives (`primitives.color`)
Ramps: `white` (12), `midnight` (25, incl. alpha `a5–a90`), `red` (16), `green` (11), `orange` (12), `yellow` (11), `special` (60).
- **Brand red = `red/1000` = `#e00800`**; accent/focus `red/1100 #bb0700`.
- **Neutral = `midnight`**; `midnight/1000 = #191329`.
- `special` = membership/loyalty palettes: mauve, red-sand, teal, burgundy, pink, **gold, bronze, blue-platinum, silver**.

### 2.2 Color — semantic (`tokens.color`)
Per-role + per-component, **55 border / 47 button / 46 badge** etc.:
`surface` (31), `text` (26), `border` (55), `button` (47), `tab` (8), `filter-pill` (13), `status` (9), `badge` (46), `mark` (8), `atom-surfaces` (8), `input-field` (19), `chips` (21), `navbar-tab` (5).
- `button` is a full matrix: `{primary|secondary} × {text|surface|border|icon} × {brand|inverse|midnight|white} × {default|focus|disabled}`.
- Component-scoped color tokens (button/badge/input-field/chips/tab/filter-pill/navbar-tab) make per-component theming clean.

### 2.3 Typography (`tokens.typography`)
Font: **Suisse Int'l**. Weights (`primitives.font.weight`): Thin 200, Light 300, Regular 400, **Book 450**, Medium 500, Semi bold 600, Bold 700, Black 800.
Size ramp (`primitives.font.size` → px): 1=10, 2=12, 3=14, 4=16, 5=20, 6=24, 7=28, 8=32, 9=40, 10=48, 11=56, 12=64.

**Two parallel ramps** (bilingual structure):
- **Latin:** `display` (lg/md), `heading` (xs–xl), `title` (xs–xl), `body` (xs–xl), `button` (sm/md/lg), `badge` (sm/md/lg).
- **`aed/*` (Arabic/RTL):** `aed/display`, `aed/heading`, `aed/title`, `aed/body`.
- ⚠️ `font.family.default` **and** `font.family.aed` **both currently = "Suisse Int'l"** — the Arabic ramp is scaffolded but not yet on a distinct Arabic typeface (TBD).

Latin scale (style → size px / weight / leading / tracking):
- display/lg 48 Bold · display/md 40 Bold
- heading xl 32 / lg 28 / md 24 / sm 20 / xs 16 — all Bold 700
- title xl 28 / lg 24 / md 20 / sm 16 / xs 14 — Semi bold 600
- body xl 20 / lg 16 / md 14 / sm 12 / xs 10 — Regular 400
- button lg 16 (600) / md 14 (500) / sm 12 (500)
- badge lg 14 / md 12 / sm 10 — Book 450
- (leading = `line-height.relaxed`; tracking = tight/snug/none per style)

### 2.4 Spacing / radius / sizing (`size` + `primitives.rem`)
- **rem scale:** `rem/n = 16 · n` (e.g. `rem/1 = 16`, `rem/2 = 32`); fractional names like `rem/0-5 = 8`, `rem/0-75 = 12`, `rem/2-5 = 40`.
- **Spacing (t-shirt):** 2xs 2 · xs 4 · sm 8 · md 12 · lg 16 · xl 20 · 2xl 24 · 3xl 32 · 4xl 40 · 5xl 48 · 6xl 56 · 7xl 64 · 8xl 72.
- **Border-radius:** 1 4 · 2 8 · 3 12 · 4 14 · 5 16 · 6 20 · 7 24 · 8 large/pill.
- **Icon sizes:** xs 8 · sm 12 · md 16 · lg 20 · xl 24 · 2xl 32 · 3xl 40 · 4xl 48.
- Component sizing groups also defined: `card`, `checkbox`, `radio`, `switcher`, `tabs`, `section`, `section-link`, `border`, `scale`.

---

## 3. Component inventory (by section)

From the Figma Pages panel. ~45 components across 9 sections. Node-ids captured for per-component extraction during build.

### 00. Foundations
| Component | node-id |
|---|---|
| Colors | 25460-22588 |
| Typography | 25460-22587 |
| Spacing | 25460-22590 |
| Grid | 25460-22591 |

### 01. Primitives
| Component | node-id |
|---|---|
| e& Logo | 27020-6155 |
| Badges | 22668-60275 |
| Icon-size | 25460-22589 |
| Logo-row | 25996-32494 |
| Dismiss | TBD |
| Progress-bar | 26663-89882 |
| Add-trigger | 25752-11470 |
| Product-assets | TBD |
| Atom-Surfaces | 26729-91998 |

### 02. Controls
| Component | node-id |
|---|---|
| Buttons | 22542-13972 |
| Input Field | 22609-113539 |
| Chips | 28171-29640 |
| Filter Pill | 25581-9146 |
| Checkbox | 25394-83294 |
| Switcher | 25394-82591 |
| Radio | 25394-83997 |
| Searchbar | 28114-62397 |
| AI Search | 28189-33142 |
| Selectors | 28278-1530 |

### 03. Navigation
| Component | node-id |
|---|---|
| Top bar | 22542-13963 |
| Nav bar | 22542-13964 |
| Action bar | 25519-15621 |
| Tabs | 22542-13966 |
| Section link | 25460-83978 |
| Quick Action | 25507-13670 |

### 04. Layout
| Component | node-id |
|---|---|
| Section | 25519-12055 |
| Accordion | 27465-29326 |

### 05. Feedback & Status
| Component | node-id |
|---|---|
| Plan Usage Bar | 26663-89880 |
| Snackbar & Alert msg | 22574-22808 |
| Alert Modals | 23201-17897 |

### 06. Overlays
| Component | node-id |
|---|---|
| Tooltip | 23201-15868 |
| Bottom sheet | 27907-11716 |

### 07. Cards
| Component | node-id |
|---|---|
| General | 26760-100129 |
| Product | 25701-12472 |
| Deals for you | 25717-33323 |
| Plans | 25915-74211 |
| New on e& | 25915-75766 |
| Recommendation | TBD |
| Service | 26019-79144 |

### 08. Banners
| Component | node-id |
|---|---|
| Highlight | 25460-83982 |

### 09. Product-Specific
| Component | node-id |
|---|---|
| Smiles Balance | 26610-601 |
| Voucher | 28278-13069 |

---

## 4. Key findings & risks

1. **Mature, layered token system** (primitives → semantic, DTCG format, aliased) — ideal for a Style Dictionary pipeline; minimal cleanup needed.
2. **Bilingual / RTL is first-class** (`aed/*` ramp). RN package must support `I18nManager` RTL + per-direction type styles, even though the Arabic font is currently the same family (TBD).
3. **Single mode, no dark theme** — theme is single-surface with `inverse/*` tokens. Decide whether the package exposes a runtime dark mode now or later.
4. **Suisse Int'l licensing** — commercial typeface. The package must NOT bundle the font; it exposes family-name tokens and the consumer app licenses/loads the font (also satisfies the "works in Expo + bare" constraint).
5. **Legacy Colour Styles** coexist with variables — exclude from the build.
6. **"Everything" is large** (~45 components, many composite: 7 card types, nav, overlays, product-specific). Must be phased.
7. **npm name** — `e&ds` is invalid (`&` illegal). Use a scope, e.g. `@eand/ds`.

---

## 5. Recommended build architecture (proposed — pending approval)

- **Target:** React Native, **Expo + bare** compatible, **JS-only, zero native deps**, TypeScript.
- **Token pipeline:** `variables.json` → **Style Dictionary** → generated TS token modules → theme object.
- **Styling/theming:** pure-TS theme (Shopify **Restyle** recommended) consuming generated tokens; RTL-aware.
- **Build:** `react-native-builder-bob` (ESM + CJS + type defs).
- **Fonts:** not bundled; family-name tokens + setup docs for Expo (`expo-font`) and bare (`react-native.config.js`).
- **Docs:** Storybook for RN or an Expo example app.
- **Distribution:** scoped package (`@eand/...`), public npm or private registry (TBD).

### Proposed phasing (same end state, safe increments)
- **Phase 0 — Foundations:** token pipeline + theme (color, type, spacing, radius, icon sizes) + RTL scaffolding.
- **Phase 1 — Primitives/Controls:** Button, Text/Typography, Icon, Input Field, Chips, Filter Pill, Checkbox, Switcher, Radio, Badge, Progress bar.
- **Phase 2 — Navigation & Layout:** Top/Nav/Action bar, Tabs, Section, Section link, Accordion, Quick Action.
- **Phase 3 — Feedback/Overlays:** Snackbar, Alert modals, Tooltip, Bottom sheet, Plan usage bar.
- **Phase 4 — Cards & Product-specific:** 7 card types, Highlight banner, Smiles balance, Voucher, Selectors, Search/AI search.

> Each phase = its own spec → plan → implementation cycle.

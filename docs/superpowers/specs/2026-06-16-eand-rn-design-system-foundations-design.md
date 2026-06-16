# e& React Native Design System — Phase 0: Foundations (Design Spec)

**Date:** 2026-06-16
**Status:** Approved for implementation planning
**Package (working name):** `@eand/react-native-design-system` (private)
**Audit:** see `../../../AUDIT.md`
**Token source:** `../../../variables.json`
**Reference model:** Axis Bank "Subzero" — `@am92/react-design-system` (web, MUI-based)

---

## 1. Goal

Ship the **foundation** of an installable React Native UI package that mirrors the e& Consumer App DSL. After Phase 0, a developer can install the package privately and get: the full **token-driven theme**, a `DsThemeProvider`, RTL support, and one production-grade proof component (`DsButton`) — proving the pipeline end-to-end. The remaining ~44 components follow in later phases.

**Non-goal for Phase 0:** building all components. Phase 0 is the pipeline + theme + one component + publish path.

## 2. Context & constraints

- **Target:** React Native, must run in **both Expo (managed) and bare RN**, **JS-only, zero native modules**, TypeScript throughout.
- **Token source of truth:** `variables.json` — a Figma Variables export, 3 collections (`primitives`, `size`, `tokens`), **single mode (`value`)**, 830 tokens, DTCG-ish with cross-collection aliases (`{rem.1}`, `{font.size.10}`).
- **Bilingual/RTL:** Latin + `aed/*` (Arabic) type ramps. Arabic font currently resolves to the same family (Suisse Int'l) — RTL handling is required; distinct Arabic typeface is TBD.
- **No dark mode.** The system is light-only. `inverse/*` tokens are ordinary semantic colors for content placed on dark/brand surfaces (e.g. white text on midnight), **not** a dark theme — there is no mode to switch and no scheme-switching machinery.
- **Fonts not bundled:** Suisse Int'l is commercial — the package exposes font-family tokens and setup docs; the consumer app licenses/loads the font (also keeps us Expo+bare friendly).
- **Distribution:** private registry (note: Subzero itself is public npm; e& chose private).

## 3. Architecture (mirrors Subzero, adapted for RN)

Single package, internally organized to parallel `@am92/react-design-system`:

```
src/
  tokens/            # GENERATED from variables.json via Style Dictionary
    colors.ts  typography.ts  spacing.ts  radius.ts  size.ts  index.ts
  Theme/
    colors.ts        # single (light) semantic color set, incl. inverse/* for on-dark content
    getTypography.ts # Latin + aed ramps -> Restyle textVariants
    spacing.ts  radius.ts  elevation.ts  breakpoints.ts
    componentOverrides.ts                                   # per-component token defaults
    index.ts         # createTheme() -> Restyle theme
  Components/
    DsButton/        # Phase 0 proof component
  Hocs/
    DsThemeProvider.tsx  withTheme.ts
  Constants/
  Types/
  locale.ts          # RTL + locale (selects Latin vs aed type ramp)
  index.ts           # barrel export
```

**Key differences from Subzero (web):**
- Components are **hand-built with Shopify Restyle** (pure-TS, zero native deps) instead of wrapping MUI.
- Theme values are **generated from `variables.json`** via Style Dictionary, not hand-maintained.
- Build via **`react-native-builder-bob`** (ESM + CJS + `.d.ts`) instead of bare `tsc`.

**Same as Subzero:** single package, `Ds` component prefix, `Theme/` module shape, barrel export, semver auto-publish on `npm version`.

## 4. Token pipeline (the heart of Phase 0)

`variables.json` is not standard DTCG — it needs preprocessing before Style Dictionary.

1. **Preprocess** (`scripts/build-tokens/preprocess.ts`): read `variables.json`, merge the 3 collections into one tree, and normalize:
   - **Fully resolve aliases during preprocessing** (flatten `{rem.1}`, `{font.size.10}`, etc. to concrete primitive values) so Style Dictionary receives a self-contained, alias-free tree. This is deterministic and avoids the non-standard alias syntax tripping SD's resolver.
   - Key normalization: `rem/0-625` → numeric `0.625` semantics; sanitize names with `/`, spaces (`Scroll bar`), and `&`.
   - Classify by `$type` (color / float / string) and typography composites.
2. **Style Dictionary** transforms the normalized tree → TypeScript modules in `src/tokens/`:
   - `colors.ts` — primitive ramps + semantic aliases (`color.surface.*`, `color.text.*`, `color.button.*`, …) as typed string constants.
   - `typography.ts` — resolved text styles (size px, weight, lineHeight, letterSpacing, family) for both Latin and `aed/*`.
   - `spacing.ts`, `radius.ts`, `size.ts` — numeric tokens (rem = 16·n resolution).
   - `index.ts` — barrel + a typed `tokens` object.
3. **Theme assembly** (`src/Theme/index.ts`): map generated tokens → a Restyle `createTheme` object (`colors`, `spacing`, `borderRadii`, `textVariants`, component variant maps).

Pipeline runs via `pnpm build:tokens` and is committed-output (generated files checked in) so the package builds without Figma access.

## 5. Theme & DsThemeProvider

- `colors.ts` wires the single (light) semantic color set. There is **no dark mode**; `inverse/*` tokens are exposed as ordinary semantic colors for content on dark/brand surfaces. No scheme-switching machinery.
- `getTypography.ts` produces Restyle `textVariants` for each style (`heading.lg`, `title.md`, `body.md`, `button.md`, `badge.sm`, …) and an `aed`-prefixed parallel set.
- `DsThemeProvider` wraps Restyle's `ThemeProvider`, exposes the theme, and reads **locale/direction** (from `locale.ts` / `I18nManager`) to select the Latin vs `aed` text variants and set RTL.
- `withTheme` / `useDsTheme` hooks for consumers.

## 6. Proof component: `DsButton`

Built end-to-end to validate the pipeline:
- Variants from semantic button tokens: `primary | secondary`, color set `brand | inverse | midnight | white`, states `default | focus | disabled`.
- Sizes `sm | md | lg` (typography `button/*` + size tokens).
- Restyle-typed props; token-constrained; RTL-aware icon placement.
- Renders correctly in both Expo and bare (no native deps).

## 7. Build, exports, peers

- **Build:** `react-native-builder-bob` → `lib/module` (ESM), `lib/commonjs` (CJS), `lib/typescript` (`.d.ts`).
- **package.json:** `main`/`module`/`types`/`react-native`/`exports` fields; `sideEffects: false`; `files: ["lib", "src"]`.
- **Peer deps:** `react`, `react-native`, `react-native-svg`, `@shopify/restyle`. **No native modules.**
- **Tooling:** pnpm, TypeScript, ESLint/Prettier (match a sensible RN default).

## 8. Fonts

Not bundled. Export font-family name tokens + a `docs/fonts.md` with Expo (`expo-font`) and bare (`react-native.config.js`) setup. Theme references family by name; consumer is responsible for loading licensed Suisse Int'l.

## 9. Docs

- **Storybook for React Native** (on-device/Expo) for the component catalog (start with DsButton + a tokens/theme story).
- An **Expo example app** (`example/`) that consumes the package locally — the Subzero-equivalent reference surface and the manual test harness.

## 10. Distribution (Phase 0 = dry-run)

- Configure `publishConfig` (scoped, private registry) + `.npmrc` template.
- Phase 0 verifies packaging via `npm pack` (tarball) and a local install into `example/`. Real registry publish waits on org/registry credentials.

## 11. Testing strategy

- **Token pipeline:** unit tests asserting known resolutions (`rem/1 → 16`, `color.text.brand.default → #e00800`, `typography.body.md → {size:14, weight:'400', ...}`).
- **DsButton:** render tests (react-native-testing-library) for each variant/state + RTL.
- **Build smoke:** `npm pack` + import from `example/` resolves types and renders.

## 12. Out of scope (later phases)

Per `AUDIT.md` §5: Phase 1 Controls, Phase 2 Nav/Layout, Phase 3 Feedback/Overlays, Phase 4 Cards/Product-specific. Each is its own spec → plan → build. Codemod package and a hosted (react-native-web) Storybook are explicitly deferred. **Dark mode is not part of the e& system — the package is light-only by design.**

## 13. Open decisions (do not block Phase 0; defaults chosen)

1. **npm scope / exact name** — default `@eand/react-native-design-system`; confirm real org scope before first publish.
2. **Private registry** — default GitHub Packages (`.npmrc` + `publishConfig`); confirm before publish.

## 14. Success criteria (Phase 0 "done")

- `pnpm build:tokens` regenerates `src/tokens/*` from `variables.json` deterministically.
- `pnpm build` produces ESM + CJS + types via builder-bob.
- `DsThemeProvider` + `DsButton` render all variants/states in the Expo `example/` app, in both LTR and RTL.
- Token pipeline + DsButton tests pass.
- `npm pack` tarball installs cleanly into `example/` with working types.
- Storybook shows DsButton + a theme/tokens story.

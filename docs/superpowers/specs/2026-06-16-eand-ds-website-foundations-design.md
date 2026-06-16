# e& Design System Website — Phase W0: Foundations (Design Spec)

**Date:** 2026-06-16
**Status:** Approved for implementation planning
**Sub-project of:** e& Design System (sibling to the RN package spec)
**Reference model:** Axis Bank "Subzero" portal (subzero.axis.bank.in) + its Storybook
**Consumes:** `@eand/react-native-design-system` (the package; see `2026-06-16-eand-rn-design-system-foundations-design.md`)

---

## 1. Goal

A public-style **design-system docs portal** (Subzero-style) that documents the e& DSL: foundations, tokens, components, and usage — with **live, interactive previews of the real React Native components rendered in the browser**. After Phase W0, the site is deployed with Get-started + Foundations + the `DsButton` page (live preview), and grows one component section per package phase.

**Non-goal for W0:** documenting all ~45 components. W0 proves the platform (Next.js + react-native-web + token browser) and ships Foundations + one component page.

## 2. Context & constraints

- **Components are React Native.** The site must render them in a browser via **react-native-web**. This is the central technical risk and the thing W0 must prove.
- **Dogfoods the package.** The site imports `@eand/react-native-design-system` (and its generated tokens) — docs use the exact shipped components/tokens, so they can't drift.
- **Bilingual/RTL** is documented (Latin + `aed`/Arabic, RTL behavior). Translating the *site UI itself* to Arabic is out of scope for W0.
- **Brand:** e& — brand red `#e00800`, midnight neutrals (`#191329`), Suisse Int'l.
- **Font licensing:** Suisse Int'l is commercial. Displaying it on the public web needs a **web font license**. W0 uses the licensed web font if available, else a close fallback, and documents the intended typeface. (Open decision below.)

## 3. Architecture

- **pnpm monorepo** holding both deliverables:
  ```
  e& DS repo (pnpm workspace)
    packages/react-native-design-system/   # the published RN package
    apps/docs/                              # this Next.js site
    variables.json                          # shared token source
    docs/superpowers/specs/                 # specs
  ```
  The published artifact is still the single package; the monorepo just also houses the docs app and lets the site consume the package via workspace linking.
- **Site framework:** **Next.js (App Router) + TypeScript**.
- **Docs engine:** **Fumadocs** (MDX content, nav, built-in search) with a **custom e&-branded theme**.
- **RN-in-browser:** **react-native-web** + a live playground (**react-live**).
- **Deploy:** **Vercel**.

## 4. react-native-web integration (the crux)

- Next.js config: `transpilePackages: ['react-native', 'react-native-web', 'react-native-svg', '@shopify/restyle', '@eand/react-native-design-system']`.
- Webpack/Turbopack alias `react-native$` → `react-native-web`; resolve `.web.tsx/.web.ts` extensions first.
- `react-native-svg` → its web build (icons render in browser).
- A `<DsThemeProvider>` wraps preview surfaces so components get the real theme.
- **Proof gate:** a real `DsButton` (all variants/states, LTR + RTL) renders correctly in the browser before any content work.

## 5. Live preview & playground

- **`<LivePreview>`** MDX component renders a `Ds*` component on a styled canvas (light surface; LTR/RTL toggle).
- **`<Playground>`** uses **react-live** with a scope exposing the `Ds*` components + theme, so users edit JSX and see live results in the same react-native-web runtime.
- Props tables auto-generated from the component TypeScript types (e.g. `react-docgen-typescript`).

## 6. Token browser (Foundations)

- Foundations pages are generated from the **same token source the package uses** — import the package's generated tokens (`@eand/react-native-design-system/tokens`) and/or read `variables.json` — so values never drift from the package.
- Pages: **Colors** (primitive ramps + semantic categories as swatches with token name + hex), **Typography** (Latin + `aed` ramp specimens), **Spacing** (the rem scale visualized), **Radius**, **Icon sizes**, **Grid**.

## 7. Information architecture (Subzero-style)

- **Home / overview** — what e& DS is, install command, links (package, Figma, Storybook-if-any).
- **Get started** — install, setup, **font loading** (Expo + bare), **RTL** setup. (The "developers toolkit".)
- **Foundations** — Colors, Typography, Spacing, Radius, Icon sizes, Grid (token browser).
- **Components** — one page per `Ds*`: anatomy, variants, **live preview + playground**, props, do/don't, code. (W0: `DsButton` only.)
- **Guidelines** — usage, accessibility, bilingual/RTL, content.
- **Resources** — Figma links, changelog, versioning.

## 8. Theming / branding

- Custom Fumadocs theme: e& brand red accent, midnight neutral chrome, Suisse Int'l (or fallback). Light-only (matches the system — no dark mode).
- Site chrome aims for the polish of the Subzero portal; exact visual design is a design pass during implementation (can route through a design skill later).

## 9. Deploy

- New **Vercel** project (separate from keshu.me / clayboy). Domain/subdomain TBD (open decision).
- CI: build the package, then build `apps/docs` against it.

## 10. Phasing

- **W0 (this spec):** monorepo scaffold + Next.js + Fumadocs + react-native-web proven + e& theme + **Get started + Foundations (token browser) + DsButton page (live preview + playground)** + Vercel deploy.
- **W1+:** add component sections in lockstep with each package phase (Controls, Nav/Layout, Feedback/Overlays, Cards). Then guidelines depth, versioned docs, Arabic site UI.

**Sequencing:** Foundations/token-browser can start immediately from `variables.json`. Component pages depend on the package's components — `DsButton` page needs package Phase 0's `DsButton`. Build package Phase 0 first (or in tandem), then wire it into W0.

## 11. Out of scope (W0)

Full component catalog, versioned docs (multiple package versions), Arabic translation of the site UI, Algolia (use Fumadocs built-in search), auth/gating, analytics beyond Vercel defaults.

## 12. Open decisions (defaults chosen; non-blocking)

1. **Domain** — default a Vercel subdomain; real domain/subdomain TBD.
2. **Suisse Int'l on web** — display licensed web font if available, else a close fallback; confirm license.
3. **Playground engine** — default **react-live**; Sandpack is a heavier alternative if full isolation is needed later.

## 13. Success criteria (W0 "done")

- Monorepo builds; `apps/docs` consumes the workspace package.
- A real `DsButton` renders **live and editable** in the browser (react-native-web), LTR + RTL.
- Foundations pages render from the token source (colors, type, spacing) with no drift from the package.
- e&-branded site chrome; Get-started page complete.
- Site deploys to Vercel and loads cleanly (no console errors, key pages present).

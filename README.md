# e& Consumer App — Design System (E&DSA)

The e& Consumer App design system: a React component library built to the Figma
**e& Consumer App DSL V1.1**, plus a documentation site.

## Repository layout

```
packages/
  react-design-system/   @eand/react-design-system — components, design tokens,
                         and the e& App Icons (folded in: <Icon name="…" />)
apps/
  docs/                  Documentation site (Next.js + fumadocs) with live,
                         knob-driven demos and SwiftUI / Compose / React snippets
figma-component-audit.md Component-by-component audit vs Figma V1.1
```

There is no npm workspace root — `apps/docs` consumes the library via a
`file:../../packages/react-design-system` dependency, so the package must be
**built before** the docs.

## Develop

```bash
# 1. build the library (tokens + icons + components)
npm --prefix packages/react-design-system install
npm --prefix packages/react-design-system run build

# 2. run the docs site
cd apps/docs
npm install
npm run dev            # http://localhost:3000
```

Library tests: `npm --prefix packages/react-design-system test`.

The icon set is generated from `packages/react-design-system/src/icons/raw/*.svg`
by `scripts/build-icons.py` (Python, dev-time only — the output `icons.tsx` is
committed, so deploys don't need Python). Regenerate with:

```bash
python3 packages/react-design-system/scripts/build-icons.py
```

## Deploy the docs to Vercel

The docs are a static-prerendered Next.js app. To host on Vercel's free tier:

1. **Import** this repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `apps/docs`.
3. Enable **Settings → Build → "Include files outside the root directory"** — the
   docs build reaches `../../packages/react-design-system`.
4. Leave the build/install commands to `apps/docs/vercel.json` (already committed):
   it installs the library's deps, builds the library, regenerates prop tables,
   then runs `next build`.
5. Deploy. Every push to `main` redeploys; every branch gets a preview URL.

> The Vercel free "Hobby" tier is for non-commercial use per their ToS. For a
> ToS-clean company deploy, either move to Vercel Pro or host the static export
> (this app prerenders fully) on Cloudflare Pages / GitHub Pages.

## Figma Code Connect

Figma **Code Connect** mappings live in
`packages/react-design-system/code-connect/*.figma.tsx` — each maps a published
Figma component to its React component here (exact node IDs + variant→prop
mappings). Config: `packages/react-design-system/figma.config.json` (rewrites the
displayed import to `@eand/react-design-system` via `importPaths`).

```bash
cd packages/react-design-system
npm install                                   # installs @figma/code-connect
export FIGMA_ACCESS_TOKEN=<token>             # Figma token with Code Connect write
npm run codeconnect:check                     # dry-run validation
npm run codeconnect:publish                   # publish to the Figma library
```

Requires an **Organization/Enterprise** Figma plan and the components published to
a team library. Mapped so far: Button, Chip, FilterPill, Checkbox, Radio,
Switcher, Dismiss, Stepper, Badge (status + offers), Logo. Add more by dropping a
new `Component.figma.tsx` next to the others (same pattern).

## Figma Make

The library is published as a single package (`@eand/react-design-system`) that
exports every component **and** the icons, so it — together with the Code Connect
mappings above — can back a Figma Make kit from this repo without a second
dependency.

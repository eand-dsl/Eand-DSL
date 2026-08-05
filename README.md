# e& Consumer App — Design System (E&DSA)

The e& Consumer App design system: a React component library built to the Figma
**e& Consumer App DSL V1.1**, plus a documentation site and a Figma Make kit.

## Repository layout

```
packages/
  react-design-system/   @eand/react-design-system — 54 components, design tokens,
                         and the 396-icon e& App Icons set (folded in: <Icon name="…" />)
  tokens-native/         SwiftUI + Compose token exports from the same variable source
apps/
  docs/                  Documentation site (Next.js + fumadocs) with live, knob-driven
                         demos, an editable playground, and SwiftUI / Compose / React snippets
tools/
  anatomy/               Per-component anatomy specs
  audit/v1.1/            Component-by-component drift audit against Figma V1.1
  generate_design_md.py  Generates design.md from variables.json + anatomy
design.md                Master spec (generated) — the source of truth for behaviour
variables.json           Figma Variables export (DTCG), the token source of truth
AUDIT-V1.1.md            Drift audit roll-up + decision sheet
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
npm run extract:props   # regenerate prop tables from the library source
npm run dev             # http://localhost:3000
```

Library tests: `npm --prefix packages/react-design-system test`.

The icon set is generated from `packages/react-design-system/src/icons/raw/*.svg`
by `scripts/build-icons.py` (Python, dev-time only — the output `icons.tsx` is
committed, so deploys don't need Python). Regenerate with:

```bash
python3 packages/react-design-system/scripts/build-icons.py
```

`design.md` is generated too — edit `tools/generate_design_md.py`, not the output:

```bash
python3 tools/generate_design_md.py
```

## The gate

`.github/workflows/design-system.yml` runs this on every push and PR. Run it before
proposing anything, from `packages/react-design-system`:

```bash
npm ci
npm run build
npm test                    # vitest
npm run typecheck           # src + code-connect + demo
npm run guidelines:check    # Make kit guidelines match the library
npm run guidelines:example  # the worked example compiles against dist
npm run smoke               # built ESM imports and renders
npm pack --dry-run          # dist + the two MD files only (22 files)
npx vite build --config demo/vite.config.ts
```

`guidelines:check` is the one that matters most: Figma Make follows
`MAKE_KIT_GUIDELINES.md` literally, so a green library with stale guidelines still
produces broken screens.

## Documentation site

Deployed from `apps/docs` on Vercel. Two project settings are mandatory because the
build reaches outside its root directory:

- **Root Directory** = `apps/docs`
- **Settings → Build → "Include files outside the root directory"** = enabled

`apps/docs/vercel.json` owns the install and build commands — don't override them in the
dashboard. Every push to `main` redeploys; every branch gets a preview URL.

> Vercel's free "Hobby" tier is non-commercial per their ToS. For a ToS-clean company
> deploy, either move to Vercel Pro or host the static export (this app prerenders fully)
> on Cloudflare Pages / GitHub Pages.

## Figma Make kit

The library doubles as a **Figma Make kit**. It is published to its own repository,
[eand-dsl/eand-make-kit](https://github.com/eand-dsl/eand-make-kit), which is a **build
artifact — never edit it by hand**:

```bash
cd packages/react-design-system
npm run kit:release -- --dry-run   # gate + stage, print the tree, push nothing
npm run kit:release                # gate + stage, force-push and tag the kit repo
```

`scripts/release-kit.ts` runs the full gate, then pushes `dist/` plus
`MAKE_KIT_GUIDELINES.md` and `MAKE_KIT_README.md` and tags `v<version>`.
`.github/workflows/release-kit.yml` does the same on `workflow_dispatch` or a `v*` tag
(needs a `KIT_REPO_TOKEN` secret with `contents: write` on the kit repo).

**The kit repo is not itself a Make source.** Figma Make kits accept **npm packages only**
— public npm, or a Figma-hosted registry private to your org. GitHub repos and CDN URLs
such as esm.sh are not accepted
([Figma docs](https://developers.figma.com/docs/code/bring-your-design-system-package/)).
The kit repo is the versioned artifact you publish *from*:

1. `npm run kit:release` → tagged snapshot on GitHub
2. `npm publish` → Figma's private `@eand` registry (needs a Figma **org admin** to claim
   the scope) or public npm. Runbook and the exact admin request:
   `packages/react-design-system/MAKE_KIT_README.md`
3. Figma Make → Make kits → add `@eand/react-design-system` → paste
   `MAKE_KIT_GUIDELINES.md` into the kit's `guidelines/guidelines.md`

Step 3 is not optional. The package alone does not teach Make how to assemble a screen.

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
a team library. 23 mappings across 19 components: Button, Chip, FilterPill,
Checkbox, Radio, Switcher, Dismiss, Stepper, Badge (status + offers), Logo,
Card, PlanCard, ProductCard (×3 siblings), DealCard, ServiceCard, NewCard,
Highlight, Alert, AtomSurface (×2), CardBgColor. Add more by dropping a new
`Component.figma.tsx` next to the others (same pattern).

Mappings target the **published original** (`pzm63BTLfPfT1stcF89ILQ`). Node IDs are
identical in the de-dotted copy, but **layer names are not** — `nestedProps()` matches
on layer name and fails soft (empty prop, no error), so always use the original's
names. `npm run typecheck` covers `code-connect/`.

Several mappings carry a `NOT MAPPED` comment naming a Figma property with no code
counterpart — those comments are the todo list. See
`tools/audit/v1.1/atom-gap-report.md` for the full reconciliation status, and
`component-map.json` for the machine-readable inventory.

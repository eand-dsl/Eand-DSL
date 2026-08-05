# `@eand/docs` — e& Design System documentation site

Next.js + [fumadocs](https://fumadocs.dev) site documenting
`@eand/react-design-system`: 45 component pages with live demos, 4 foundations pages,
searchable prop tables, and an icon gallery.

## Develop

The site consumes the library through a `file:../../packages/react-design-system`
dependency, so **the library must be built first**:

```bash
npm --prefix ../../packages/react-design-system install
npm --prefix ../../packages/react-design-system run build

npm install
npm run extract:props    # regenerates components/preview/props.json from the library source
npm run dev              # http://localhost:3000
```

Re-run `extract:props` after changing any component's props — the tables are generated
from source by `react-docgen-typescript`, not hand-written.

Check types with `npm run types:check` (runs `fumadocs-mdx` and `next typegen` first, so
it works from a clean checkout).

## Layout

| Path | What it is |
| --- | --- |
| `content/docs/` | The MDX pages. `components/*.mdx` are thin — a `<ComponentDemo>`, a `<PropsTable>`, and a Figma link |
| `components/preview/` | The live preview machinery: `catalog.tsx` (per-component demo definitions + knobs), `snippets.ts` (React/SwiftUI/Compose code per demo), `playground.tsx` (react-live sandbox), `props-table.tsx`, `icons-browser.tsx`, `tokens-browser.tsx` |
| `components/mdx.tsx` | Registers those components as MDX globals, so pages use them without importing |
| `scripts/extract-props.ts` | Generates `components/preview/props.json` from the library's TypeScript source |
| `lib/source.ts`, `lib/shared.ts` | fumadocs source adapter and site constants |
| `app/(home)/` | Landing page |
| `app/docs/` | Docs layout and catch-all page |
| `app/api/search/route.ts` | Search handler |
| `app/llms.txt`, `app/llms-full.txt`, `app/llms.mdx/` | Machine-readable exports of the docs |

## Deploy

Hosted on Vercel from this directory. The build reaches outside it (to the library and
`variables.json`), so two project settings are mandatory:

- **Root Directory** = `apps/docs`
- **Settings → Build → "Include files outside the root directory"** = enabled

`vercel.json` in this directory owns the install and build commands — it installs the
library's dependencies, builds the library, regenerates the prop tables, then runs
`next build`. Don't override them in the dashboard.

The site prerenders fully, so it can also be exported and hosted on any static host if
Vercel's Hobby-tier terms become a problem.

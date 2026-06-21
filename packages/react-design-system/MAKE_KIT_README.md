# `@eand/react-design-system` — publishing & Figma Make kit

Web React 18 component library (the e& DSL for the browser) built to be consumed
by **Figma Make** as a Make kit. Self-contained, token-styled, Vite-built.

## Build
```bash
export PATH="$HOME/.local/bin:$PATH"   # Node lives in ~/.local
npm install
npm run build        # build:tokens -> vite build -> tsc d.ts  =>  dist/{index.js,index.cjs,index.d.ts,styles.css}
npm test             # vitest
```
`npm run build:tokens` regenerates tokens from `../../variables.json` (re-run after a new Figma variables export).

## Verify the package
```bash
npm pack --dry-run   # should list only dist/** — no src, no node_modules, no workspace deps
```

## Publish
Pick a registry (decide at publish time):

**A) Figma private registry (recommended — you have the e& org)**
1. Org admin: Figma → Admin → Resources → **npm registry**, add the `@eand` scope.
2. Configure auth in `.npmrc` (per Figma's instructions), then:
```bash
npm version patch
npm publish
```

**B) Public npm**
```bash
npm publish --access public
```

> Before publishing, ensure there are **no `workspace:*` dependencies** (there aren't — the package is self-contained).

## Create the Make kit
1. Publish the package (above).
2. In Figma Make → **Make kits** → create a kit → add the package `@eand/react-design-system`.
3. Paste **`MAKE_KIT_GUIDELINES.md`** as the kit guidelines (this is what teaches Make how to assemble e& screens).
4. In a Make file, prompt with a UX wireframe; Make installs the package (via esm.sh) and builds the screen using the components per the guidelines.

## Local consumption proof
`demo/` assembles a full e& Home screen from the package (`demo/home-screen.png`):
```bash
npx vite --config demo/vite.config.ts          # dev server
# or: npx vite build --config demo/vite.config.ts && serve demo/dist
```

## Notes
- Components are **inline-token-styled** (no required CSS import) so they render via esm.sh without extra setup. `dist/styles.css` ships the raw `--eand-*` CSS variables for anyone who wants them.
- Source of truth for component behavior/states/anatomy is the repo's `design.md`; `MAKE_KIT_GUIDELINES.md` is the Make-facing distillation.

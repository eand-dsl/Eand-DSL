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

## Cut a kit release (GitHub)

```bash
npm run kit:release -- --dry-run   # gate + stage, print the tree, push nothing
npm run kit:release                # gate + stage, force-push and tag eand-dsl/eand-make-kit
```

`scripts/release-kit.ts` runs the full gate below, then publishes `dist/` plus these two
markdown files to [eand-dsl/eand-make-kit](https://github.com/eand-dsl/eand-make-kit) and
tags it `v<version>`. That repo is a **build artifact — never edit it by hand**; the next
release overwrites it. Figma Make can consume the tag directly through esm.sh, which needs
no npm registry and no credentials.

Publishing to npm is separate and still manual — see below.

## Publish runbook (npm)

Follow these five steps in order. Everything here is owner-operated — it needs e& org
credentials, so it is deliberately not automated.

### 1. Run the pre-publish gate

Every command must exit 0. Stop at the first failure — do not publish past a red gate.

```bash
export PATH="$HOME/.local/bin:$PATH"
npm ci
npm run build
npm test                    # unit tests
npm run typecheck           # includes code-connect
npm run guidelines:check    # guidelines match the library
npm run guidelines:example  # worked example compiles
npm run smoke               # built ESM imports and renders
npm pack --dry-run          # dist + 2 md files only
```

`npm pack --dry-run` must list **23 files**: `dist/**` (20), `package.json`,
`MAKE_KIT_GUIDELINES.md`, `MAKE_KIT_README.md`. If `src/`, `scripts/` or
`guidelines-facts.json` appear, fix the `files` array in `package.json` — it must stay
`["dist", "MAKE_KIT_GUIDELINES.md", "MAKE_KIT_README.md"]`.

### 2. Set the version

Edit `"version"` in `package.json` by hand. **Do not run `npm version`** — it creates a
git tag, and tagging is a release decision to make deliberately, not a side effect.

The package is self-contained: no `dependencies`, and `react`/`react-dom` are
peers (`^18 || ^19`). Confirm there are no `workspace:*` dependencies before publishing.

### 3. Pick a registry and configure auth

**A) Figma private registry — recommended, since you have the e& org.**
1. Org admin: Figma → Admin → Resources → **npm registry**, add the `@eand` scope.
2. Point the scope at Figma's registry and authenticate. In `~/.npmrc` (not the repo —
   never commit a token):
   ```
   @eand:registry=https://<figma-registry-host>/
   //<figma-registry-host>/:_authToken=${FIGMA_NPM_TOKEN}
   ```
   Take the host and token-minting steps from Figma's own npm-registry instructions;
   they are the authority on both.
3. Publish:
   ```bash
   npm publish
   ```

**B) Public npm.** The `@eand` scope is private by default, so the flag is required:
```bash
npm login
npm publish --access public
```

### 4. Verify what landed

```bash
npm view @eand/react-design-system version
```

### 5. Create the Make kit in Figma

1. Figma Make → **Make kits** → create a kit → point it at the package, either by name
   (`@eand/react-design-system`, once published per the steps above) or by esm.sh URL
   against a tag of the generated kit repo:
   `https://esm.sh/gh/eand-dsl/eand-make-kit@v1.0.0`. Always pin the tag — the kit repo's
   `main` is force-pushed on every release.
2. Paste **`MAKE_KIT_GUIDELINES.md`** as the kit guidelines. This is the artifact that
   teaches Make how to assemble e& screens — the package alone is not enough.
3. In a Make file, prompt with a UX wireframe. Make installs the package and builds the
   screen from the components per the guidelines.

> **Maintenance:** after changing any component's props or the icon set, run
> `npm run guidelines:check` — it fails when the guidelines fall out of sync, and the
> guidelines are what Figma Make follows. A green library with stale guidelines still
> produces broken screens.

## Local consumption proof

`demo/` assembles a full e& Account screen from the built package
(`demo/account-screen.png`). It lives in the **source repository**
([eand-dsl/Eand-DSL](https://github.com/eand-dsl/Eand-DSL), under
`packages/react-design-system/`) — it is not shipped in the published package or the
generated kit repo, which carry only `dist/` and these two markdown files.

```bash
npx vite --config demo/vite.config.ts          # dev server
# or: npx vite build --config demo/vite.config.ts && serve demo/dist
```

## Notes
- Components are **inline-token-styled** (no required CSS import) so they render via esm.sh without extra setup. `dist/styles.css` ships the raw `--eand-*` CSS variables for anyone who wants them.
- Source of truth for component behavior/states/anatomy is the source repo's `design.md`; `MAKE_KIT_GUIDELINES.md` is the Make-facing distillation.

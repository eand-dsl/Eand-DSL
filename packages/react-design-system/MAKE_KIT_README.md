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

## How this reaches Figma Make

**Figma Make kits only accept npm packages** — the public npm registry, or a Figma-hosted
private registry scoped to your org. GitHub repositories and CDN URLs such as esm.sh are
**not** accepted as kit sources
([Figma developer docs](https://developers.figma.com/docs/code/bring-your-design-system-package/)).

So the pipeline has two stages, and only the second one feeds Make:

1. **`npm run kit:release`** → pushes the built package to
   [eand-dsl/eand-make-kit](https://github.com/eand-dsl/eand-make-kit) and tags
   `v<version>`. This is the versioned, reviewable artifact and the thing you publish
   *from*. It is a **build artifact — never edit it by hand**; the next release
   overwrites it.
2. **`npm publish`** → puts that same package on a registry Make can install from. This
   is the step that makes the kit usable, and it is manual because it needs e& org
   credentials.

```bash
npm run kit:release -- --dry-run   # gate + stage, print the tree, push nothing
npm run kit:release                # gate + stage, force-push and tag eand-dsl/eand-make-kit
```

Figma's own requirements for the package — React 18, Vite-compatible, no `workspace:*`
dependencies, published to a registry — are all met except the last.

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

`npm pack --dry-run` must list **24 files**: `dist/**` (21), `package.json`,
`MAKE_KIT_GUIDELINES.md`, `MAKE_KIT_README.md`. If `src/`, `scripts/` or
`guidelines-facts.json` appear, fix the `files` array in `package.json` — it must stay
`["dist", "MAKE_KIT_GUIDELINES.md", "MAKE_KIT_README.md"]`. (`npm run kit:release`
asserts the *shape* rather than the count, so a release cannot ship a regressed `files`
array; the count here is a human sanity check and moves whenever a module is added — dist
went 19 -> 20 with the logo artwork and 20 -> 21 with the voucher shape.)

### 2. Set the version

Edit `"version"` in `package.json` by hand. **Do not run `npm version`** — it creates a
git tag, and tagging is a release decision to make deliberately, not a side effect.

The package is self-contained: no `dependencies`, and `react`/`react-dom` are
peers (`^18 || ^19`). Confirm there are no `workspace:*` dependencies before publishing.

### 3. Pick a registry and configure auth

**A) Figma private registry — the intended route for e&.**

Keeps the library inside the *e& UAE Consumer* org. Requires a paid Figma plan (the org
qualifies) and, critically, **an org admin** — only admins can claim an npm scope.

1. **Org admin** enables the npm registry for the org and claims the `@eand` scope, then
   issues a publish token. This is done in Figma's admin settings; Figma's own
   npm-registry instructions are the authority on the current UI path, the registry
   host, and how tokens are minted. Do not guess these values.
2. Point the scope at that host and authenticate, in `~/.npmrc` — **not** in the repo, and
   never commit a token:
   ```
   @eand:registry=https://<figma-registry-host>/
   //<figma-registry-host>/:_authToken=${FIGMA_NPM_TOKEN}
   ```
3. Publish:
   ```bash
   npm publish
   ```

If you are not an org admin, this is the blocking step — see "Requesting the scope" below.

**B) Public npm — fallback.** Works without anyone's permission, but publishes the
compiled component library, tokens, and icon set publicly. That is a business decision,
not a technical one. The `@eand` scope is private by default, so the flag is required:
```bash
npm login
npm publish --access public
```

### Requesting the scope (if you are not a Figma org admin)

Send your *e& UAE Consumer* Figma org admin this:

> I need to publish our design system as a private npm package so it can be used as a
> Figma Make kit. Could you enable the **Figma private npm registry** for the
> *e& UAE Consumer* org and claim the **`@eand`** scope, then issue me a publish token?
>
> Figma's setup docs: https://developers.figma.com/docs/code/working-with-npm/
>
> The package is `@eand/react-design-system` — the e& Consumer App component library,
> built from the DSL V1.1 Figma variables. Publishing it privately keeps it inside the
> org; the alternative is publishing it to public npm, which I'd rather avoid.
>
> I need three things back: the registry host, a publish token scoped to `@eand`, and
> confirmation the scope is claimed.

### 4. Verify what landed

```bash
npm view @eand/react-design-system version
```

### 5. Create the Make kit in Figma

1. Figma Make → **Make kits** → create a kit → add the package by name,
   `@eand/react-design-system`. Only a published npm package works here; a GitHub URL or
   an esm.sh URL will not.
2. The kit gets a `guidelines/` folder. Paste **`MAKE_KIT_GUIDELINES.md`** into
   `guidelines/guidelines.md` — Make reads that file first. This is the artifact that
   teaches Make how to assemble e& screens; the package alone is not enough. Figma can
   auto-generate guidelines, but ours are hand-written and fact-checked against the
   library, so use ours.
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
- Components are **inline-token-styled** (no required CSS import) so they render with no build-step configuration, which is what keeps them reliable inside Make's Vite sandbox. `dist/styles.css` ships the raw `--eand-*` CSS variables for anyone who wants them.
- Source of truth for component behavior/states/anatomy is the source repo's `design.md`; `MAKE_KIT_GUIDELINES.md` is the Make-facing distillation.

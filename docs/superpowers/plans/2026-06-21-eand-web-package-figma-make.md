# e& Web Design System for Figma Make — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline) or subagent-driven-development. Steps use `- [ ]`.

**Goal:** Ship `@eand/react-design-system` — a web React 18 component library (the e& DSL rebuilt for the browser, styled from the same tokens) that **Figma Make can consume as a Make kit**, plus guidelines distilled from `design.md`. Prove the end-to-end path: tokens → web components → Vite build → a demo that renders an e& screen the way Make would.

**Architecture:** Vite library (React 18 + TS) in `packages/react-design-system`. Tokens generated from `variables.json` into `tokens.css` (CSS custom properties) + `tokens.ts`. Components use CSS Modules + token CSS vars. Self-contained (no workspace deps in the published artifact). Make kit = this package + `MAKE_KIT_GUIDELINES.md`.

**Tech stack:** React 18, TypeScript, Vite (lib mode) + `vite-plugin-dts`, Style Dictionary v4 (web), CSS Modules, Vitest + @testing-library/react, Node (official binary in `~/.local`).

**Figma Make constraints honored:** React 18, Vite-compatible, esm.sh-served, no `workspace:*` deps, guidelines included. ([Figma: bring your design system package](https://developers.figma.com/docs/code/bring-your-design-system-package/))

---

## Prerequisite — Node toolchain

- [ ] **Install Node LTS (no sudo, Homebrew broken on macOS 26.2):**
```bash
VER=$(curl -s https://nodejs.org/dist/index.json | python3 -c "import json,sys;print(next(x['version'] for x in json.load(sys.stdin) if x['lts']))")
curl -fsSL "https://nodejs.org/dist/$VER/node-$VER-darwin-arm64.tar.gz" -o /tmp/node.tgz
mkdir -p ~/.local/opt && tar -xzf /tmp/node.tgz -C ~/.local/opt
for b in node npm npx corepack; do ln -sf "$HOME/.local/opt/node-$VER-darwin-arm64/bin/$b" ~/.local/bin/$b; done
node -v && npm -v
```
Expected: prints versions. (`~/.local/bin` is already on PATH.)

---

## Task 0: Scaffold the Vite React library

**Files:** `packages/react-design-system/{package.json,tsconfig.json,vite.config.ts,index.html,src/index.ts}`

- [ ] **Step 1: package.json**
```json
{
  "name": "@eand/react-design-system",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" }, "./styles.css": "./dist/styles.css" },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "scripts": {
    "build:tokens": "tsx scripts/build-tokens.ts",
    "build": "npm run build:tokens && vite build && tsc --emitDeclarationOnly",
    "dev": "vite",
    "test": "vitest run"
  },
  "peerDependencies": { "react": "^18.0.0", "react-dom": "^18.0.0" },
  "devDependencies": {
    "@testing-library/react": "^16.0.0", "@testing-library/jest-dom": "^6.4.0",
    "@types/react": "^18.2.0", "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.3.0", "jsdom": "^24.0.0", "react": "^18.3.1",
    "react-dom": "^18.3.1", "style-dictionary": "^4.0.1", "tsx": "^4.16.0",
    "typescript": "^5.4.5", "vite": "^5.3.0", "vite-plugin-dts": "^3.9.0", "vitest": "^2.0.0"
  }
}
```
- [ ] **Step 2: `vite.config.ts`** — library mode, externalize react.
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es', 'cjs'], fileName: (f) => `index.${f === 'es' ? 'js' : 'cjs'}` },
    rollupOptions: { external: ['react', 'react-dom', 'react/jsx-runtime'] },
    cssCodeSplit: false,
  },
  test: { environment: 'jsdom', globals: true, setupFiles: './src/test-setup.ts' },
});
```
- [ ] **Step 3:** `tsconfig.json` (react-jsx, declaration, strict), `src/test-setup.ts` (`import '@testing-library/jest-dom'`), empty `src/index.ts`.
- [ ] **Step 4: install + verify:** `cd packages/react-design-system && npm install && npx tsc --noEmit` → passes.
- [ ] **Step 5: commit** `chore(web): scaffold Vite React library`.

## Task 1: Token pipeline → CSS variables + typed theme

**Files:** `scripts/build-tokens.ts`, generated `src/tokens/tokens.css`, `src/tokens/tokens.ts`
**Test:** `src/tokens/tokens.test.ts`

- [ ] **Step 1:** Write `scripts/build-tokens.ts` — read `../../variables.json`, resolve aliases (**both** `{a.b}` and `$.<coll>.value.<path>` forms), flatten to CSS custom properties `--eand-<group>-<path>` in `:root{}` (write `tokens.css`) and a typed nested object `export const tokens` (write `tokens.ts`). Colors→hex/rgba, dims→`px`.
- [ ] **Step 2:** Run `npm run build:tokens` → generates `tokens.css` + `tokens.ts`.
- [ ] **Step 3: failing test** then implement:
```ts
import { tokens } from './tokens';
test('semantic + scale resolve', () => {
  expect(tokens.color.surface.base.brand).toBe('#e00800');
  expect(tokens.color.text.default.default).toBe('#191329');
  expect(tokens.spacing.lg).toBe('16px');
  expect(tokens.typography.body.md.fontSize).toBe('14px');
});
```
Run: `npm run build:tokens && npx vitest run src/tokens/tokens.test.ts` → PASS.
- [ ] **Step 4:** `src/index.ts` imports `./tokens/tokens.css` (so `styles.css` ships the vars). Commit `feat(web): token pipeline -> CSS vars + theme`.

## Task 2: Base primitives — `Text` + `Icon` + theme helpers

**Files:** `src/components/Text/{Text.tsx,Text.module.css,index.ts}`, `src/components/Icon/...`
- [ ] Build `Text` (variant prop → `typography/*` token classes), `Icon` (size prop → `icon` tokens, renders an inline SVG slot). TDD: render asserts the right font-size/line-height from CSS vars. Commit.

## Task 3: `Button` (proof component, TDD)

**Files:** `src/components/Button/{Button.tsx,Button.types.ts,Button.module.css,index.ts}`, `Button.test.tsx`
- [ ] Variants from `design.md`: `variant` (primary/secondary/tertiary/link) × `tone` (brand/inverse/midnight/white) × `size` (sm/md/lg) + `disabled`, leading/trailing icon. CSS Modules using `--eand-color-button-*`, pill radius, fixed heights 48/40/32.
- [ ] Tests: renders label; click fires `onClick`; disabled blocks; primary/brand bg = `var(--eand-color-button-primary-surface-brand-default)`. Commit.

## Task 4: Layout component — `Section` (the key building block)

**Files:** `src/components/Section/...`
- [ ] Props per verified anatomy: `surface` (8 treatments), `size` (xs–xl), optional header (title + see-all), `fullBleed` body. `width:100%`, hug height, token paddings. Slots: `header`, `children`. Tests: renders header + children; applies surface var. Commit.

## Task 5: Screen chrome — `TopBar` + `NavBar`

**Files:** `src/components/TopBar/...`, `src/components/NavBar/...`
- [ ] `TopBar`: leading/title/trailing slots, sticky, fixed height. `NavBar`: 3–5 items (icon+label, active/inactive via `navbar-tab` tokens), sticky bottom, fixed height. Tests render slots/items + active state. Commit.

## Task 6: One `Card` (General) + `Badge`

**Files:** `src/components/Card/...`, `src/components/Badge/...`
- [ ] `Card` (General): media/title/body/action slots, fill width, hug height, surface + radius tokens. `Badge`: `type` (tier/promo/status) × `size`, hug + fixed height. Tests. Commit.

## Task 7: Barrel + Vite build + pack

**Files:** `src/index.ts` (export all + `App`-less), build outputs
- [ ] `src/index.ts` re-exports all components + `tokens` + imports `tokens.css`.
- [ ] Run `npm run build` → `dist/{index.js,index.cjs,index.d.ts,styles.css}`. `npm pack --dry-run` lists `dist/**` only, no workspace deps. Commit.

## Task 8: Demo screen + Make-kit guidelines + publish path

**Files:** `packages/react-design-system/demo/` (Vite app), `MAKE_KIT_GUIDELINES.md`, `.npmrc`/`publishConfig`
- [ ] **Demo app** (`demo/`): a Vite React app that imports `@eand/react-design-system` (via workspace link locally) and assembles a **Home screen** (TopBar → Section[Quick actions] → Section[Deals carousel of Cards] → Highlight → NavBar) — proves the package renders an e& screen the way Make will. Screenshot it.
- [ ] **`MAKE_KIT_GUIDELINES.md`**: distilled from `design.md` — component API (props/states), the sizing rules, and the UX→UI assembly recipes, written for Make. (Make kit = this package + these guidelines.)
- [ ] **Publish path:** add `publishConfig` + a `.npmrc` template; `npm publish --dry-run`. Registry (Figma private vs public) chosen at publish time. Document the Make-kit creation steps (Figma Make kits UI: add package + paste guidelines).
- [ ] Commit + write `MAKE_KIT_README.md` with the end-to-end consumption steps.

---

## Phasing (remaining components → waves after the pipeline works)
- **W1 Controls:** Input, Chips, Filter pill, Checkbox, Switcher, Radio, Searchbar, AI Search, Selectors, Tabs.
- **W2 Nav/Layout/Feedback:** Action bar, Section link, Quick Action, Accordion, Plan usage bar, Snackbar, Alert modal, Tooltip, Bottom sheet, Progress bar.
- **W3 Cards/Product:** Product, Deals, Plans, New on e&, Service, Highlight, Smiles balance, Voucher, Atom-surfaces, Logo, Logo-row, Add-trigger, Icon set.
Each wave: build from `design.md` verified anatomy, test, add to the demo, update guidelines, commit.

## Definition of done (pipeline)
- `npm run build:tokens` regenerates tokens from V1.1 `variables.json`.
- `npm run build` emits ESM+CJS+types+`styles.css`; `npm pack --dry-run` clean, no workspace deps.
- Demo app renders a complete e& Home screen from the components.
- `MAKE_KIT_GUIDELINES.md` written; publish dry-run targets a registry.

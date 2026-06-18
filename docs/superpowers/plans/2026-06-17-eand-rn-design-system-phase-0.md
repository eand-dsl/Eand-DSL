# e& RN Design System — Phase 0 (Foundations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the `@eand/react-native-design-system` package foundation — a deterministic token pipeline (`variables.json` → Style Dictionary → typed TS), a Restyle theme, `DsThemeProvider` with RTL, and `DsButton` as an end-to-end proof — buildable and publishable (dry-run).

**Architecture:** pnpm monorepo at the repo root; the package lives in `packages/react-native-design-system`. A custom preprocessor resolves the non-standard Figma aliases to concrete values and emits SD-format JSON; Style Dictionary v4 generates nested `as const` TS token modules (committed). `src/Theme` maps tokens into a Shopify Restyle theme. Components are pure-TS Restyle, zero native modules. Build via `react-native-builder-bob`.

**Tech Stack:** TypeScript, pnpm, Style Dictionary v4, @shopify/restyle, react-native-builder-bob, Jest + @testing-library/react-native, Expo (example app), tsx (scripts).

**Reference values (verified from `variables.json`, for tests):**
- `rem.1 = 16`, `rem.0-625 = 10`, `rem.0-875 = 14`
- `color.red.1000 = #e00800`, `color.midnight.1000 = #191329`
- `color.surface.base.brand → {color.red.1000} → #e00800`
- `color.text.default.default → {color.midnight.1000} → #191329`
- `color.button.primary.surface.brand.default → #e00800`
- `color.button.primary.text.brand.default → {color.text.default.inverse} → #ffffff`
- `typography.body.md.font-size → {font.size.3} → {rem.0-875} → 14`; `font-weight → Regular`
- `typography.button.md.font-size → 14`; `font-weight → Medium`
- collection order in the file: `primitives`, `size`, `tokens`; mode name is `value`

---

## File Structure

```
<repo root>/
  package.json                 # workspace root (private)
  pnpm-workspace.yaml
  variables.json               # token source (exists)
  packages/react-native-design-system/
    package.json
    tsconfig.json
    tsconfig.build.json
    babel.config.js
    jest.config.js
    jest.setup.ts
    .npmignore
    scripts/build-tokens/
      preprocess.ts            # variables.json -> tokens.resolved.json  (alias resolution)
      preprocess.test.ts
      formats.ts               # SD custom 'ts/nested-const' format
      build.ts                 # SD build -> src/tokens/*.ts
      tokens.resolved.json     # generated intermediate (committed)
    src/
      index.ts                 # barrel
      locale.ts                # RTL / direction
      tokens/                  # GENERATED (committed): colors,typography,spacing,radius,size,rem
        index.ts               # hand-written barrel (not generated)
        tokens.test.ts
      Theme/
        colors.ts  spacing.ts  radius.ts  breakpoints.ts
        getTypography.ts  componentOverrides.ts  index.ts
        theme.test.ts
      Hocs/
        DsThemeProvider.tsx  index.ts
        DsThemeProvider.test.tsx
      Components/DsButton/
        DsButton.types.ts  DsButton.tsx  index.ts
        DsButton.test.tsx
    docs/fonts.md
    README.md
  example/                     # Expo app consuming the package
```

---

## Task 0: Monorepo + package scaffold

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml` (repo root)
- Create: `packages/react-native-design-system/{package.json,tsconfig.json,tsconfig.build.json,babel.config.js,jest.config.js,jest.setup.ts,.npmignore}`

- [ ] **Step 1: Create workspace root `package.json`**

```json
{
  "name": "eand-design-system-monorepo",
  "private": true,
  "packageManager": "pnpm@9.7.0",
  "scripts": {
    "build": "pnpm --filter @eand/react-native-design-system build",
    "test": "pnpm --filter @eand/react-native-design-system test"
  }
}
```

- [ ] **Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "packages/*"
  - "example"
```

- [ ] **Step 3: Create `packages/react-native-design-system/package.json`**

```json
{
  "name": "@eand/react-native-design-system",
  "version": "0.0.0",
  "description": "e& Consumer App design system for React Native",
  "main": "lib/commonjs/index.js",
  "module": "lib/module/index.js",
  "types": "lib/typescript/src/index.d.ts",
  "react-native": "src/index.ts",
  "source": "src/index.ts",
  "files": ["src", "lib", "docs"],
  "sideEffects": false,
  "scripts": {
    "build:tokens": "tsx scripts/build-tokens/preprocess.ts ../../variables.json scripts/build-tokens/tokens.resolved.json && tsx scripts/build-tokens/build.ts",
    "build": "bob build",
    "typecheck": "tsc --noEmit",
    "test": "jest"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-native": ">=0.72.0",
    "@shopify/restyle": ">=2.4.0",
    "react-native-svg": ">=13.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@react-native/babel-preset": "^0.74.0",
    "@shopify/restyle": "^2.4.5",
    "@testing-library/react-native": "^12.5.0",
    "@types/jest": "^29.5.12",
    "@types/react": "^18.2.0",
    "jest": "^29.7.0",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "react-native-builder-bob": "^0.30.2",
    "react-native-svg": "^15.0.0",
    "react-test-renderer": "18.2.0",
    "style-dictionary": "^4.0.1",
    "tsx": "^4.16.0",
    "typescript": "^5.4.5"
  },
  "react-native-builder-bob": {
    "source": "src",
    "output": "lib",
    "targets": [["commonjs"], ["module"], ["typescript"]]
  }
}
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "lib": ["esnext", "dom"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "declaration": true,
    "noEmit": true
  },
  "include": ["src", "scripts"]
}
```

- [ ] **Step 5: Create `tsconfig.build.json`, `babel.config.js`, `jest.config.js`, `jest.setup.ts`, `.npmignore`**

`tsconfig.build.json`:
```json
{ "extends": "./tsconfig.json", "compilerOptions": { "noEmit": false }, "include": ["src"], "exclude": ["**/*.test.ts", "**/*.test.tsx"] }
```
`babel.config.js`:
```js
module.exports = { presets: ['@react-native/babel-preset'] };
```
`jest.config.js`:
```js
module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@shopify/restyle|react-native-svg)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
```
`jest.setup.ts`:
```ts
import '@testing-library/react-native/extend-expect';
```
`.npmignore`:
```
scripts/
**/*.test.ts
**/*.test.tsx
jest.config.js
jest.setup.ts
tsconfig*.json
babel.config.js
```

- [ ] **Step 6: Install and verify**

Run: `pnpm install`
Run: `cd packages/react-native-design-system && pnpm typecheck`
Expected: install succeeds; `typecheck` passes (no `src` files yet → no errors).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold pnpm monorepo + RN design system package"
```

---

## Task 1: Token preprocessor (alias resolution)

**Files:**
- Create: `packages/react-native-design-system/scripts/build-tokens/preprocess.ts`
- Test: `packages/react-native-design-system/scripts/build-tokens/preprocess.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// preprocess.test.ts
import fs from 'node:fs';
import path from 'node:path';
import { loadMergedTree, resolveValue, toResolvedSdTree, lookup } from './preprocess';

const raw = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../../variables.json'), 'utf8'),
);
const tree = loadMergedTree(raw);

test('resolves direct primitive values', () => {
  expect(resolveValue(tree, lookup(tree, 'rem.1')!)).toBe(16);
  expect(resolveValue(tree, lookup(tree, 'rem.0-875')!)).toBe(14);
  expect(resolveValue(tree, lookup(tree, 'color.red.1000')!)).toBe('#e00800');
});

test('resolves single-hop semantic aliases', () => {
  expect(resolveValue(tree, lookup(tree, 'color.surface.base.brand')!)).toBe('#e00800');
  expect(resolveValue(tree, lookup(tree, 'color.text.default.default')!)).toBe('#191329');
});

test('resolves multi-hop alias chains', () => {
  // typography.body.md.font-size -> {font.size.3} -> {rem.0-875} -> 14
  expect(resolveValue(tree, lookup(tree, 'typography.body.md.font-size')!)).toBe(14);
  // button.primary.text.brand.default -> {color.text.default.inverse} -> #ffffff
  expect(resolveValue(tree, lookup(tree, 'color.button.primary.text.brand.default')!)).toBe('#ffffff');
});

test('toResolvedSdTree produces alias-free {value,type} leaves', () => {
  const out = toResolvedSdTree(tree);
  expect(out.color.red['1000']).toEqual({ value: '#e00800', type: 'color' });
  expect(out.typography.body.md['font-weight'].value).toBe('Regular');
  expect(JSON.stringify(out)).not.toMatch(/\{[a-z]/i); // no unresolved aliases remain
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm jest scripts/build-tokens/preprocess.test.ts`
Expected: FAIL — "Cannot find module './preprocess'".

- [ ] **Step 3: Write `preprocess.ts`**

```ts
import fs from 'node:fs';

export type Leaf = { $value: unknown; $type?: string; $scopes?: string[] };
type Tree = Record<string, any>;

export const isLeaf = (n: any): n is Leaf =>
  n != null && typeof n === 'object' && Object.prototype.hasOwnProperty.call(n, '$value');

function deepMerge(target: Tree, src: Tree): void {
  for (const [k, v] of Object.entries(src)) {
    if (isLeaf(v)) target[k] = v;
    else { target[k] = target[k] ?? {}; deepMerge(target[k], v as Tree); }
  }
}

/** Merge the 3 collections (each { <name>: { modes: { value: {...} } } }) into one tree. */
export function loadMergedTree(raw: Array<Record<string, any>>): Tree {
  const merged: Tree = {};
  for (const collection of raw) {
    const name = Object.keys(collection)[0];
    deepMerge(merged, collection[name].modes.value);
  }
  return merged;
}

export function lookup(tree: Tree, dotPath: string): Leaf | undefined {
  let node: any = tree;
  for (const seg of dotPath.split('.')) {
    if (node == null) return undefined;
    node = node[seg];
  }
  return isLeaf(node) ? node : undefined;
}

const ALIAS_RE = /^\{(.+)\}$/;

export function resolveValue(tree: Tree, leaf: Leaf, seen: Set<string> = new Set()): unknown {
  const v = leaf.$value;
  if (typeof v === 'string') {
    const m = v.match(ALIAS_RE);
    if (m) {
      const ref = m[1];
      if (seen.has(ref)) throw new Error(`Circular token alias: {${ref}}`);
      seen.add(ref);
      const target = lookup(tree, ref);
      if (!target) throw new Error(`Unresolved token alias: {${ref}}`);
      return resolveValue(tree, target, seen);
    }
  }
  return v;
}

/** Produce a nested object whose leaves are SD-format { value, type }. */
export function toResolvedSdTree(tree: Tree): Tree {
  const walk = (node: any): any => {
    if (isLeaf(node)) return { value: resolveValue(tree, node), type: node.$type ?? 'other' };
    const out: Tree = {};
    for (const [k, v] of Object.entries(node)) out[k] = walk(v);
    return out;
  };
  return walk(tree);
}

if (require.main === module) {
  const [, , inPath, outPath] = process.argv;
  const raw = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  const resolved = toResolvedSdTree(loadMergedTree(raw));
  fs.writeFileSync(outPath, JSON.stringify(resolved, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath}`);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm jest scripts/build-tokens/preprocess.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Generate the resolved intermediate**

Run: `tsx scripts/build-tokens/preprocess.ts ../../variables.json scripts/build-tokens/tokens.resolved.json`
Expected: writes `tokens.resolved.json`. Spot check: `node -e "const t=require('./scripts/build-tokens/tokens.resolved.json'); console.log(t.color.surface.base.brand)"` → `{ value: '#e00800', type: 'color' }`.

- [ ] **Step 6: Commit**

```bash
git add scripts/build-tokens/preprocess.ts scripts/build-tokens/preprocess.test.ts scripts/build-tokens/tokens.resolved.json
git commit -m "feat(tokens): resolve Figma variable aliases to concrete values"
```

---

## Task 2: Style Dictionary → generated TS tokens

**Files:**
- Create: `scripts/build-tokens/formats.ts`, `scripts/build-tokens/build.ts`
- Create (generated, committed): `src/tokens/{colors,typography,spacing,radius,size,rem}.ts`
- Create (hand-written): `src/tokens/index.ts`
- Test: `src/tokens/tokens.test.ts`

- [ ] **Step 1: Write `formats.ts` (custom nested-const format)**

```ts
import StyleDictionary from 'style-dictionary';

type FlatToken = { path: string[]; value: unknown };

function nest(tokens: FlatToken[]): Record<string, any> {
  const root: Record<string, any> = {};
  for (const t of tokens) {
    let node = root;
    t.path.forEach((seg, i) => {
      if (i === t.path.length - 1) node[seg] = t.value;
      else node = node[seg] ?? (node[seg] = {});
    });
  }
  return root;
}

StyleDictionary.registerFormat({
  name: 'ts/nested-const',
  format: ({ dictionary, options }) => {
    const group = options.group as string;
    const tokens: FlatToken[] = dictionary.allTokens
      .filter((t: any) => t.path[0] === group)
      .map((t: any) => ({ path: t.path.slice(1), value: t.value }));
    return (
      `// AUTO-GENERATED by 'pnpm build:tokens'. Do not edit by hand.\n` +
      `export const ${options.exportName} = ${JSON.stringify(nest(tokens), null, 2)} as const;\n`
    );
  },
});

export default StyleDictionary;
```

- [ ] **Step 2: Write `build.ts`**

```ts
import path from 'node:path';
import StyleDictionary from './formats';

const buildPath = path.resolve(__dirname, '../../src/tokens/') + '/';

const file = (destination: string, group: string, exportName: string) => ({
  destination, format: 'ts/nested-const', options: { group, exportName },
});

async function main() {
  const sd = new StyleDictionary({
    source: [path.resolve(__dirname, 'tokens.resolved.json')],
    platforms: {
      ts: {
        transforms: ['attribute/cti', 'color/hex'],
        buildPath,
        files: [
          file('colors.ts', 'color', 'colors'),
          file('typography.ts', 'typography', 'typography'),
          file('spacing.ts', 'spacing', 'spacing'),
          file('radius.ts', 'border-radius', 'radius'),
          file('size.ts', 'icon', 'iconSize'),
          file('rem.ts', 'rem', 'rem'),
        ],
      },
    },
  });
  await sd.buildAllPlatforms();
}
main();
```

- [ ] **Step 3: Write hand-written `src/tokens/index.ts`**

```ts
export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { radius } from './radius';
export { iconSize } from './size';
export { rem } from './rem';
```

- [ ] **Step 4: Generate the token modules**

Run: `pnpm build:tokens`
Expected: creates `src/tokens/colors.ts`, `typography.ts`, `spacing.ts`, `radius.ts`, `size.ts`, `rem.ts`.

- [ ] **Step 5: Write the failing test**

```ts
// src/tokens/tokens.test.ts
import { colors, typography, spacing, radius } from './index';

test('semantic colors resolved', () => {
  expect(colors.surface.base.brand).toBe('#e00800');
  expect(colors.text.default.default).toBe('#191329');
  expect(colors.button.primary.surface.brand.default).toBe('#e00800');
});

test('typography resolved to concrete values', () => {
  expect(typography.body.md['font-size']).toBe(14);
  expect(typography.body.md['font-weight']).toBe('Regular');
  expect(typography.button.md['font-weight']).toBe('Medium');
});

test('spacing + radius numeric', () => {
  expect(spacing.lg).toBe(16);
  expect(radius['5']).toBe(16);
});
```

- [ ] **Step 6: Run test**

Run: `pnpm jest src/tokens/tokens.test.ts`
Expected: PASS (3 tests). If a key path differs, open the generated file and align the test to the real path (do not hand-edit generated files).

- [ ] **Step 7: Commit**

```bash
git add scripts/build-tokens/formats.ts scripts/build-tokens/build.ts src/tokens/
git commit -m "feat(tokens): generate typed TS token modules via Style Dictionary"
```

---

## Task 3: Restyle theme

**Files:**
- Create: `src/Theme/{colors.ts,spacing.ts,radius.ts,breakpoints.ts,elevation.ts,getTypography.ts,componentOverrides.ts,index.ts}`
- Test: `src/Theme/theme.test.ts`

- [ ] **Step 1: Write `src/Theme/colors.ts` (flatten semantic tokens to Restyle's flat color map)**

```ts
import { colors as raw } from '../tokens';

/** Flatten a nested token object to dot-joined keys: { 'surface.base.brand': '#e00800', ... } */
function flatten(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
    else out[key] = v as string;
  }
  return out;
}

export const colors = flatten(raw);
```

- [ ] **Step 2: Write `spacing.ts`, `radius.ts`, `breakpoints.ts`**

```ts
// spacing.ts
import { spacing as s } from '../tokens';
export const spacing = { ...s } as const;
```
```ts
// radius.ts
import { radius as r } from '../tokens';
export const borderRadii = { ...r } as const;
```
```ts
// breakpoints.ts  (RN: phone-first; tablet at 768)
export const breakpoints = { phone: 0, tablet: 768 } as const;
```
> (Elevation/shadows are deferred to a later phase — Cards need them; Phase 0 / DsButton does not.)

- [ ] **Step 3: Write `getTypography.ts` (tokens → Restyle textVariants)**

```ts
import { typography as raw } from '../tokens';

const WEIGHT_TO_FAMILY: Record<string, string> = {
  Thin: 'SuisseIntl-Thin', Light: 'SuisseIntl-Light', Regular: 'SuisseIntl-Regular',
  Book: 'SuisseIntl-Book', Medium: 'SuisseIntl-Medium', 'Semi bold': 'SuisseIntl-SemiBold',
  Bold: 'SuisseIntl-Bold', Black: 'SuisseIntl-Black',
};
const WEIGHT_TO_NUMERIC: Record<string, string> = {
  Thin: '100', Light: '300', Regular: '400', Book: '500', Medium: '500',
  'Semi bold': '600', Bold: '700', Black: '900',
};

export type TextVariant = {
  fontFamily: string; fontWeight: string; fontSize: number; lineHeight: number; letterSpacing: number;
};

/** Flatten typography styles to Restyle textVariants keyed 'category.size' (e.g. 'body.md'). */
export function getTypography(): Record<string, TextVariant> {
  const out: Record<string, TextVariant> = {};
  const isStyle = (n: any) => n && typeof n === 'object' && 'font-size' in n;
  // Recursive: handles both Latin ('body.md') and the deeper Arabic ramp ('aed.body.md').
  const walk = (node: Record<string, any>, prefix: string) => {
    for (const [k, v] of Object.entries(node)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (isStyle(v)) {
        const weightName = String(v['font-weight']);
        const fontSize = Number(v['font-size']);
        // line-height is stored as a percentage string (e.g. "120%") -> convert to px.
        const lhRaw = v['line-height'];
        const ratio = typeof lhRaw === 'string' && lhRaw.trim().endsWith('%')
          ? parseFloat(lhRaw) / 100
          : Number(lhRaw);
        out[key] = {
          fontFamily: WEIGHT_TO_FAMILY[weightName] ?? 'SuisseIntl-Regular',
          fontWeight: WEIGHT_TO_NUMERIC[weightName] ?? '400',
          fontSize,
          lineHeight: Number.isFinite(ratio) && ratio > 0 && ratio < 4
            ? Math.round(fontSize * ratio)
            : Math.round(fontSize * 1.2),
          letterSpacing: Number(v['letter-spacing']) || 0,
        };
      } else if (v && typeof v === 'object') {
        walk(v as Record<string, any>, key);
      }
    }
  };
  walk(raw as Record<string, any>, '');
  return out;
}
```

- [ ] **Step 4: Write `componentOverrides.ts` (DsButton color map by variant/tone/state)**

```ts
/** Maps DsButton (variant, tone, state) -> theme color keys (dot keys from Theme/colors). */
export const buttonColors = {
  primary: {
    brand:    { surface: 'button.primary.surface.brand.default',   text: 'button.primary.text.brand.default' },
    inverse:  { surface: 'button.primary.surface.inverse.default', text: 'button.primary.text.inverse.default' },
  },
  secondary: {
    brand:    { surface: 'surface.base.inverse', text: 'button.primary.surface.brand.default', border: 'button.secondary.border.brand.default' },
    inverse:  { surface: 'surface.base.brand',   text: 'button.primary.text.brand.default',    border: 'button.secondary.border.inverse.default' },
  },
} as const;

export const buttonDisabled = {
  primary: { surface: 'button.primary.surface.brand.disabled', text: 'button.primary.text.brand.disabled' },
} as const;
```
> Note: exact disabled/secondary keys exist in the `button` token group — if a referenced key is missing in `Theme/colors`, open `src/tokens/colors.ts`, find the closest real key, and update this map. Tests in Task 5 pin the primary/brand path.

- [ ] **Step 5: Write `src/Theme/index.ts` (createTheme)**

```ts
import { createTheme } from '@shopify/restyle';
import { colors } from './colors';
import { spacing } from './spacing';
import { borderRadii } from './radius';
import { breakpoints } from './breakpoints';
import { getTypography } from './getTypography';

export const theme = createTheme({
  colors,
  spacing,
  borderRadii,
  breakpoints,
  textVariants: getTypography(),
});

export type Theme = typeof theme;
```

- [ ] **Step 6: Write the test**

```ts
// src/Theme/theme.test.ts
import { theme } from './index';

test('theme exposes flattened semantic colors', () => {
  expect(theme.colors['surface.base.brand']).toBe('#e00800');
  expect(theme.colors['text.default.default']).toBe('#191329');
});

test('theme has spacing and radii', () => {
  expect(theme.spacing.lg).toBe(16);
  expect(theme.borderRadii['5']).toBe(16);
});

test('textVariants include button.md with mapped family/weight', () => {
  const v = theme.textVariants['button.md'];
  expect(v.fontSize).toBe(14);
  expect(v.fontFamily).toBe('SuisseIntl-Medium');
  expect(v.fontWeight).toBe('500');
});
```

- [ ] **Step 7: Run test**

Run: `pnpm jest src/Theme/theme.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 8: Commit**

```bash
git add src/Theme/
git commit -m "feat(theme): assemble Restyle theme from generated tokens"
```

---

## Task 4: locale + DsThemeProvider

**Files:**
- Create: `src/locale.ts`, `src/Hocs/DsThemeProvider.tsx`, `src/Hocs/index.ts`
- Test: `src/Hocs/DsThemeProvider.test.tsx`

- [ ] **Step 1: Write `src/locale.ts`**

```ts
import { I18nManager } from 'react-native';

export type Direction = 'ltr' | 'rtl';
export type Locale = 'en' | 'ar';

/** Latin styles for en, Arabic (aed/*) styles for ar. */
export function typographyPrefixForLocale(locale: Locale): '' | 'aed/' {
  return locale === 'ar' ? 'aed/' : '';
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar' || I18nManager.isRTL;
}
```

- [ ] **Step 2: Write `src/Hocs/DsThemeProvider.tsx`**

```tsx
import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider } from '@shopify/restyle';
import { theme, type Theme } from '../Theme';
import { type Locale, type Direction, isRTL } from '../locale';

type DsThemeContextValue = { locale: Locale; direction: Direction };
const DsThemeContext = createContext<DsThemeContextValue>({ locale: 'en', direction: 'ltr' });

export const useDsLocale = () => useContext(DsThemeContext);

export type DsThemeProviderProps = { locale?: Locale; children: React.ReactNode };

export function DsThemeProvider({ locale = 'en', children }: DsThemeProviderProps) {
  const value = useMemo<DsThemeContextValue>(
    () => ({ locale, direction: isRTL(locale) ? 'rtl' : 'ltr' }),
    [locale],
  );
  return (
    <DsThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </DsThemeContext.Provider>
  );
}

export type { Theme };
```

- [ ] **Step 3: Write `src/Hocs/index.ts`**

```ts
export { DsThemeProvider, useDsLocale, type DsThemeProviderProps } from './DsThemeProvider';
```

- [ ] **Step 4: Write the test**

```tsx
// src/Hocs/DsThemeProvider.test.tsx
import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { DsThemeProvider, useDsLocale } from './DsThemeProvider';

function Probe() {
  const { direction } = useDsLocale();
  return <Text>{direction}</Text>;
}

test('renders children and defaults to ltr', () => {
  render(<DsThemeProvider><Probe /></DsThemeProvider>);
  expect(screen.getByText('ltr')).toBeTruthy();
});

test('locale=ar sets rtl', () => {
  render(<DsThemeProvider locale="ar"><Probe /></DsThemeProvider>);
  expect(screen.getByText('rtl')).toBeTruthy();
});
```

- [ ] **Step 5: Run test**

Run: `pnpm jest src/Hocs/DsThemeProvider.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/locale.ts src/Hocs/
git commit -m "feat(theme): add DsThemeProvider with locale/RTL context"
```

---

## Task 5: DsButton (proof component)

**Files:**
- Create: `src/Components/DsButton/{DsButton.types.ts,DsButton.tsx,index.ts}`
- Test: `src/Components/DsButton/DsButton.test.tsx`

- [ ] **Step 1: Write `DsButton.types.ts`**

```ts
import type { ReactNode } from 'react';

export type DsButtonVariant = 'primary' | 'secondary';
export type DsButtonTone = 'brand' | 'inverse';
export type DsButtonSize = 'sm' | 'md' | 'lg';

export type DsButtonProps = {
  children: string;
  variant?: DsButtonVariant;
  tone?: DsButtonTone;
  size?: DsButtonSize;
  disabled?: boolean;
  onPress?: () => void;
  testID?: string;
};
```

- [ ] **Step 2: Write `DsButton.tsx`**

```tsx
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme, createText } from '@shopify/restyle';
import type { Theme } from '../../Theme';
import { buttonColors, buttonDisabled } from '../../Theme/componentOverrides';
import type { DsButtonProps, DsButtonSize } from './DsButton.types';

const Text = createText<Theme>();

const SIZE_TO_VARIANT: Record<DsButtonSize, string> = {
  sm: 'button.sm', md: 'button.md', lg: 'button.lg',
};
const PADDING: Record<DsButtonSize, { v: keyof Theme['spacing']; h: keyof Theme['spacing'] }> = {
  sm: { v: 'sm', h: 'md' }, md: { v: 'md', h: 'lg' }, lg: { v: 'lg', h: 'xl' },
};

export function DsButton({
  children, variant = 'primary', tone = 'brand', size = 'md', disabled = false, onPress, testID,
}: DsButtonProps) {
  const theme = useTheme<Theme>();
  const map = disabled ? buttonDisabled.primary : buttonColors[variant][tone];
  const bg = theme.colors[map.surface];
  const fg = theme.colors[map.text];
  const pad = PADDING[size];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: theme.borderRadii['5'],
          paddingVertical: theme.spacing[pad.v],
          paddingHorizontal: theme.spacing[pad.h],
        },
      ]}
    >
      <Text variant={SIZE_TO_VARIANT[size] as keyof Theme['textVariants']} style={{ color: fg }}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
});
```

- [ ] **Step 3: Write `index.ts`**

```ts
export { DsButton } from './DsButton';
export type { DsButtonProps, DsButtonVariant, DsButtonTone, DsButtonSize } from './DsButton.types';
```

- [ ] **Step 4: Write the test**

```tsx
// DsButton.test.tsx
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DsThemeProvider } from '../../Hocs';
import { DsButton } from './DsButton';

const wrap = (ui: React.ReactElement) => render(<DsThemeProvider>{ui}</DsThemeProvider>);

test('renders its label', () => {
  wrap(<DsButton onPress={() => {}}>Pay now</DsButton>);
  expect(screen.getByText('Pay now')).toBeTruthy();
});

test('calls onPress when enabled', () => {
  const onPress = jest.fn();
  wrap(<DsButton testID="btn" onPress={onPress}>Tap</DsButton>);
  fireEvent.press(screen.getByTestId('btn'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('does not call onPress when disabled', () => {
  const onPress = jest.fn();
  wrap(<DsButton testID="btn" disabled onPress={onPress}>Tap</DsButton>);
  fireEvent.press(screen.getByTestId('btn'));
  expect(onPress).not.toHaveBeenCalled();
});

test('primary/brand uses brand surface color', () => {
  wrap(<DsButton testID="btn" onPress={() => {}}>Buy</DsButton>);
  const styles = screen.getByTestId('btn').props.style.flat();
  expect(styles.some((s: any) => s && s.backgroundColor === '#e00800')).toBe(true);
});
```

- [ ] **Step 5: Run test**

Run: `pnpm jest src/Components/DsButton/DsButton.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/Components/DsButton/
git commit -m "feat(button): add DsButton proof component (variants/states/RTL)"
```

---

## Task 6: Barrel export + build + pack smoke

**Files:**
- Create: `src/index.ts`
- Test: full suite + `bob build` + `npm pack`

- [ ] **Step 1: Write `src/index.ts`**

```ts
export { DsThemeProvider, useDsLocale } from './Hocs';
export type { DsThemeProviderProps } from './Hocs';
export { DsButton } from './Components/DsButton';
export type { DsButtonProps, DsButtonVariant, DsButtonTone, DsButtonSize } from './Components/DsButton';
export { theme } from './Theme';
export type { Theme } from './Theme';
export * as tokens from './tokens';
export { typographyPrefixForLocale, isRTL, type Locale, type Direction } from './locale';
```

- [ ] **Step 2: Run the full test suite**

Run: `pnpm jest`
Expected: all suites PASS (preprocess, tokens, theme, provider, button).

- [ ] **Step 3: Typecheck + build**

Run: `pnpm typecheck`
Run: `pnpm build`
Expected: `lib/commonjs`, `lib/module`, `lib/typescript` produced with no errors.

- [ ] **Step 4: Pack smoke test**

Run: `npm pack --dry-run`
Expected: tarball lists `lib/**`, `src/**`, `docs/**`; excludes `scripts/`, tests. No `node_modules`.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: public barrel export + verify build/pack"
```

---

## Task 7: Expo example app (manual harness)

**Files:**
- Create: `example/` (Expo app) consuming the workspace package.

- [ ] **Step 1: Scaffold the example app**

Run (from repo root): `pnpm create expo-app example --template blank-typescript`
Then add the workspace dep — set `example/package.json` dependency:
```json
"@eand/react-native-design-system": "workspace:*"
```
Run: `pnpm install`

- [ ] **Step 2: Render DsButton in `example/App.tsx`**

```tsx
import React from 'react';
import { View } from 'react-native';
import { DsThemeProvider, DsButton } from '@eand/react-native-design-system';

export default function App() {
  return (
    <DsThemeProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <DsButton onPress={() => {}}>Primary / brand</DsButton>
        <DsButton variant="secondary" onPress={() => {}}>Secondary / brand</DsButton>
        <DsButton disabled onPress={() => {}}>Disabled</DsButton>
      </View>
    </DsThemeProvider>
  );
}
```

- [ ] **Step 3: Configure Metro for the monorepo**

Create `example/metro.config.js`:
```js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');
const config = getDefaultConfig(projectRoot);
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
module.exports = config;
```

- [ ] **Step 4: Verify it runs**

Run: `cd example && pnpm expo start` (or `pnpm expo start --web`)
Expected: app boots; three buttons render; brand button is `#e00800`. Set `locale="ar"` and confirm `useDsLocale().direction === 'rtl'`. (Full app-wide RTL flipping requires `I18nManager.forceRTL(true)` + reload — documented in `docs/fonts.md`; DsButton is centered/symmetric so it is direction-safe.)

- [ ] **Step 5: Commit**

```bash
git add example/ pnpm-lock.yaml
git commit -m "chore(example): Expo app consuming the package"
```

---

## Task 8: Storybook (RN) for DsButton + tokens

**Files:**
- Create: Storybook config in `example/` (on-device RN Storybook) + stories.

- [ ] **Step 1: Add Storybook RN to the example app**

Run (from `example/`): `npx storybook@latest init --type react_native`
This adds `.storybook/`, `@storybook/react-native` deps, and a `storybook` entry.

- [ ] **Step 2: Create `example/.storybook/stories/DsButton.stories.tsx`**

```tsx
import React from 'react';
import { DsThemeProvider, DsButton } from '@eand/react-native-design-system';

const meta = {
  title: 'Components/DsButton',
  component: DsButton,
  decorators: [(Story: any) => <DsThemeProvider><Story /></DsThemeProvider>],
  args: { children: 'Pay now', variant: 'primary', tone: 'brand', size: 'md', disabled: false },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    tone: { control: 'select', options: ['brand', 'inverse'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
export const Playground = {};
export const Disabled = { args: { disabled: true } };
```

- [ ] **Step 3: Create `example/.storybook/stories/Tokens.stories.tsx`**

```tsx
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { tokens } from '@eand/react-native-design-system';

export default { title: 'Foundations/Colors' };
export const SemanticSurfaces = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
    {Object.entries(tokens.colors.surface.base).map(([k, v]) => (
      <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: v as string }} />
        <Text>{`surface.base.${k} — ${v}`}</Text>
      </View>
    ))}
  </ScrollView>
);
```

- [ ] **Step 4: Verify**

Run: switch the Expo entry to Storybook (per the init output) and `pnpm expo start`.
Expected: DsButton playground + the color swatch story render on device/web.

- [ ] **Step 5: Commit**

```bash
git add example/.storybook example/package.json
git commit -m "chore(storybook): DsButton + tokens stories in example app"
```

---

## Task 9: Fonts docs, README, publish dry-run

**Files:**
- Create: `packages/react-native-design-system/docs/fonts.md`, `README.md`
- Modify: `package.json` (publishConfig), create `.npmrc` template

- [ ] **Step 1: Write `docs/fonts.md`**

```markdown
# Fonts (Suisse Int'l)

This package does NOT bundle Suisse Int'l (commercial license). Consumers load it.
Register these family names so theme `fontFamily` values resolve:
`SuisseIntl-Regular, SuisseIntl-Book, SuisseIntl-Medium, SuisseIntl-SemiBold, SuisseIntl-Bold` (+ Thin/Light/Black).

## Expo
Use `expo-font` `useFonts({...})` mapping each family name to its `.otf/.ttf`.

## Bare React Native
Add fonts to `react-native.config.js` `assets: ['./assets/fonts']` and run `npx react-native-asset`.

## Arabic (RTL)
For `locale="ar"`, the `aed/*` type ramp is used. Ship the Arabic faces under the same family names when finalized.
```

- [ ] **Step 2: Write `README.md`**

```markdown
# @eand/react-native-design-system

e& Consumer App design system for React Native. Works in Expo and bare RN. Light-only, bilingual (EN + Arabic/RTL).

## Install
```
npm install @eand/react-native-design-system @shopify/restyle react-native-svg
```

## Usage
```tsx
import { DsThemeProvider, DsButton } from '@eand/react-native-design-system';

export default () => (
  <DsThemeProvider>
    <DsButton onPress={() => {}}>Pay now</DsButton>
  </DsThemeProvider>
);
```

Load fonts: see `docs/fonts.md`. Tokens regenerate from `variables.json` via `pnpm build:tokens`.
```

- [ ] **Step 3: Add `publishConfig` + `.npmrc` template (private registry)**

Add to `package.json`:
```json
"publishConfig": { "registry": "https://npm.pkg.github.com", "access": "restricted" }
```
Create `.npmrc` (template — real token via env, do not commit secrets):
```
@eand:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

- [ ] **Step 4: Publish dry-run**

Run: `npm publish --dry-run`
Expected: prints the tarball contents and the target registry; no actual publish. Confirms name/version/files/registry are correct.

- [ ] **Step 5: Commit**

```bash
git add docs/fonts.md README.md package.json .npmrc
git commit -m "docs+chore: fonts/README + private publish config (dry-run verified)"
```

---

## Phase 0 Definition of Done

- `pnpm build:tokens` deterministically regenerates `src/tokens/*` from `variables.json`.
- `pnpm jest` passes (preprocess, tokens, theme, provider, button).
- `pnpm build` emits ESM + CJS + types; `npm pack --dry-run` is clean.
- Expo `example/` renders DsButton variants/states in LTR and RTL.
- Storybook shows DsButton + a color-token story.
- `npm publish --dry-run` targets the private registry correctly.

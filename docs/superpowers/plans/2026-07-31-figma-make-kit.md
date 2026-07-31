# Figma Make Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `@eand/react-design-system` a correct, publish-ready Figma Make kit — guidelines that match the library, an automated identifier fact-checker so they cannot silently drift again, and release prep at 1.0.0.

**Architecture:** A ground-truth extractor reads the library with `react-docgen-typescript` plus the `ICONS`/`ICON_META` registries and produces a facts object. A pure markdown claim parser extracts what `MAKE_KIT_GUIDELINES.md` asserts. A checker diffs the two and exits nonzero with a grouped report. The guidelines are then rewritten by hand until the checker passes.

**Tech Stack:** TypeScript run through `tsx` (matches the existing `scripts/build-tokens.ts` pattern), `react-docgen-typescript`, Vitest, Node 26 / npm 11.

## Global Constraints

- Work in `packages/react-design-system` unless a step says otherwise. Repo root is `/Users/kushal.l.sharma/Desktop/E&DSA`.
- `export PATH="$HOME/.local/bin:$PATH"` before any npm/node command — Node lives in `~/.local`.
- Package name is exactly `@eand/react-design-system`. Icons ship **inside it**. `@eand/icons` does not exist and must never be referenced.
- Icon registry is exactly **396 names = 198 base + 198 `-filled`**, perfectly paired, zero orphans.
- The library exports exactly **54 components**.
- **Do not modify `tsconfig.json`'s `include`.** It is pinned to `["src"]` with a comment explaining that widening it breaks `dist/index.d.ts` resolution for consumers. Scripts run under `tsx` and are excluded on purpose.
- **Do not change any component implementation.** This work touches documentation, scripts, and package metadata only.
- Do not run `npm publish`. The repo owner does that.
- Branch: `figma-make-kit` (already exists, PR #1 open).

---

### Task 1: Ground-truth facts extractor

**Files:**
- Create: `packages/react-design-system/scripts/guidelines-facts.ts`
- Create: `packages/react-design-system/scripts/guidelines-facts.test.ts`
- Modify: `packages/react-design-system/package.json` (add devDep + script)
- Modify: `packages/react-design-system/.gitignore` or repo `.gitignore` (ignore the emitted JSON)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `collectFacts(): Facts` and the `Facts`, `PropFact` types, imported by Tasks 3 and 5.

```ts
export interface PropFact { type: string; values: string[] | null; required: boolean }
export interface Facts {
  packageName: string;
  exportedComponents: string[];
  components: Record<string, Record<string, PropFact>>;
  iconNames: string[];
  iconBaseNames: string[];
  iconMeta: Record<string, { description: string; aliases: string[] }>;
}
```

- [ ] **Step 1: Add the dependency and scripts**

```bash
export PATH="$HOME/.local/bin:$PATH"
cd packages/react-design-system
npm install --save-dev react-docgen-typescript@^2.4.0
```

Then add to `package.json` `"scripts"`:

```json
"guidelines:facts": "tsx scripts/guidelines-facts.ts",
"guidelines:check": "tsx scripts/check-guidelines.ts",
"guidelines:example": "tsx scripts/check-example.ts"
```

Append to the repo-root `.gitignore`:

```
packages/react-design-system/guidelines-facts.json
```

- [ ] **Step 2: Write the failing test**

Create `scripts/guidelines-facts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { collectFacts } from './guidelines-facts';

describe('collectFacts', () => {
  const facts = collectFacts();

  it('names the single published package', () => {
    expect(facts.packageName).toBe('@eand/react-design-system');
  });

  it('finds all 54 exported components', () => {
    expect(facts.exportedComponents).toHaveLength(54);
    expect(facts.exportedComponents).toContain('Button');
    expect(facts.exportedComponents).toContain('Picker');
    expect(facts.exportedComponents).toContain('CtaFooter');
  });

  it('excludes SCREAMING_SNAKE constants', () => {
    expect(facts.exportedComponents).not.toContain('CARD_BG_TINTS');
  });

  it('captures the current Button variant axis including glass', () => {
    const variant = facts.components.Button.variant;
    expect(variant.values).toEqual(
      expect.arrayContaining(['primary', 'secondary', 'tertiary', 'link', 'glass']),
    );
  });

  it('captures props the old guidelines never mentioned', () => {
    expect(facts.components.Button).toHaveProperty('loading');
    expect(facts.components.Button).toHaveProperty('surface');
  });

  it('has 396 icons split evenly into base and filled', () => {
    expect(facts.iconNames).toHaveLength(396);
    expect(facts.iconBaseNames).toHaveLength(198);
    expect(facts.iconNames.filter((n) => n.endsWith('-filled'))).toHaveLength(198);
  });

  it('every base icon has a filled twin', () => {
    const all = new Set(facts.iconNames);
    const orphans = facts.iconBaseNames.filter((n) => !all.has(`${n}-filled`));
    expect(orphans).toEqual([]);
  });

  it('knows the 8 phantom names are absent and the real ones present', () => {
    for (const p of ['profile', 'mshop', 'sparkle', 'subscriptions', 'mobile', 'truck', 'plus', 'shield']) {
      expect(facts.iconNames).not.toContain(p);
    }
    for (const r of ['user', 'ai', 'phone-device', 'delivery', 'add', 'security']) {
      expect(facts.iconNames).toContain(r);
    }
  });

  it('carries icon meta for choosing between similar icons', () => {
    expect(facts.iconMeta.ai.aliases).toContain('sparkles');
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
export PATH="$HOME/.local/bin:$PATH"
cd packages/react-design-system
npx vitest run scripts/guidelines-facts.test.ts
```

Expected: FAIL — `Failed to resolve import "./guidelines-facts"`.

- [ ] **Step 4: Write the implementation**

Create `scripts/guidelines-facts.ts`:

```ts
// Ground truth about the library, for the guidelines fact-checker.
// Knows nothing about MAKE_KIT_GUIDELINES.md — it only reports what exists.
import { withCustomConfig } from 'react-docgen-typescript';
import { readFileSync, writeFileSync, globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ICONS, ICON_META } from '../src/icons/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(here, '..');

export interface PropFact { type: string; values: string[] | null; required: boolean }
export interface Facts {
  packageName: string;
  exportedComponents: string[];
  components: Record<string, Record<string, PropFact>>;
  iconNames: string[];
  iconBaseNames: string[];
  iconMeta: Record<string, { description: string; aliases: string[] }>;
}

const QUOTED = /^"(.*)"$/;
const SCREAMING = /^[A-Z0-9_]+$/;

function sourceFiles(): string[] {
  return globSync('src/components/**/*.tsx', { cwd: PKG })
    .filter((f) => !f.endsWith('.test.tsx'))
    .map((f) => resolve(PKG, f));
}

/** Exported PascalCase values, excluding SCREAMING_SNAKE constants. */
function exportedComponentNames(files: string[]): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/export (?:function|const) ([A-Z][A-Za-z0-9_]*)/g)) {
      if (!SCREAMING.test(m[1])) names.add(m[1]);
    }
  }
  return [...names].sort();
}

export function collectFacts(): Facts {
  const files = sourceFiles();
  const parser = withCustomConfig(resolve(PKG, 'tsconfig.json'), {
    propFilter: (p) => !p.parent?.fileName.includes('node_modules'),
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
  });

  const components: Facts['components'] = {};
  for (const doc of parser.parse(files)) {
    if (!/^[A-Z]/.test(doc.displayName)) continue;
    const props: Record<string, PropFact> = {};
    for (const p of Object.values(doc.props)) {
      const raw = (p.type.value ?? []) as Array<{ value: string }>;
      const values = raw.length
        ? raw.map((v) => QUOTED.exec(v.value)?.[1] ?? v.value).filter((v) => v !== 'undefined')
        : null;
      props[p.name] = { type: p.type.name, values, required: p.required };
    }
    components[doc.displayName] = props;
  }

  const iconNames = Object.keys(ICONS).sort();
  return {
    packageName: '@eand/react-design-system',
    exportedComponents: exportedComponentNames(files),
    components,
    iconNames,
    iconBaseNames: iconNames.filter((n) => !n.endsWith('-filled')),
    iconMeta: ICON_META,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const facts = collectFacts();
  const out = resolve(PKG, 'guidelines-facts.json');
  writeFileSync(out, JSON.stringify(facts, null, 2));
  console.log(
    `guidelines-facts.json: ${facts.exportedComponents.length} components, ${facts.iconNames.length} icons -> ${out}`,
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run scripts/guidelines-facts.test.ts
```

Expected: PASS, 9 tests.

If `expect(facts.exportedComponents).toHaveLength(54)` fails, do **not** relax the assertion. Print the array, diff it against this list, and fix the extractor:

```
AISearch, Accordion, ActionBar, AddTrigger, Alert, AlertModal, AtomSurface, Badge,
BottomSheet, Button, ButtonGroup, Card, CardBgColor, Checkbox, Chip, CtaFooter,
DealCard, Dismiss, FilterPill, Highlight, IconBox, Input, ListRow, Logo, LogoRow,
NavBar, NewCard, OtpInput, PaymentRow, Picker, PickerOption, PlanCard, PlanUsageBar,
ProductCard, ProgressBar, QuickAction, Radio, Searchbar, Section, SectionLink,
Selectors, ServiceCard, SmilesAvatar, SmilesBalance, SmilesRow, Snackbar,
StatusRibbon, Stepper, Switcher, Tabs, Text, Tooltip, TopBar, Voucher
```

- [ ] **Step 6: Verify the CLI emits the JSON**

```bash
npm run guidelines:facts
```

Expected: `guidelines-facts.json: 54 components, 396 icons -> …`

- [ ] **Step 7: Commit**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/scripts/guidelines-facts.ts \
        packages/react-design-system/scripts/guidelines-facts.test.ts \
        packages/react-design-system/package.json \
        packages/react-design-system/package-lock.json \
        .gitignore
git commit -m "feat(guidelines): extract library ground truth for fact-checking"
```

---

### Task 2: Markdown claim parser

Pure text→claims function, no filesystem and no library import, so it is cheap to test against fixtures. This is the parsing half of the spec's Unit 2; Task 3 is the diffing half. Split because a reviewer can reject the parser's grammar while accepting the diff logic.

**Files:**
- Create: `packages/react-design-system/scripts/guidelines-claims.ts`
- Create: `packages/react-design-system/scripts/guidelines-claims.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseClaims(markdown: string): Claims`, imported by Task 3.

```ts
export interface Claims {
  imports: string[];
  components: Record<string, Record<string, string[]>>;  // component -> prop -> documented literal values
  iconNames: string[];
}
```

**Grammar this parser recognises** — the rewritten guidelines in Task 4 must obey it:

1. Imports — `from '<specifier>'` anywhere.
2. Component signatures — backticked `` `Name({ prop, prop: a|b })` ``. Braces, brackets and parens nest correctly, so `` `QuickAction({ items: {label, icon}[], columns })` `` parses.
3. A parameter annotation counts as a **literal union claim** only when it is two or more lowercase identifiers separated by `|`. `variant: primary|secondary` is a claim; `label: ReactNode` and `items: {…}[]` record the prop name with no value claim.
4. Icon usages — `<Icon name="x" />` anywhere.
5. The icon inventory — backticked names inside an explicit `<!-- icons:begin -->` / `<!-- icons:end -->` block.

- [ ] **Step 1: Write the failing test**

Create `scripts/guidelines-claims.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseClaims } from './guidelines-claims';

describe('parseClaims', () => {
  it('collects import specifiers', () => {
    const md = "```tsx\nimport { Button } from '@eand/react-design-system';\nimport { Icon } from '@eand/icons';\n```";
    expect(parseClaims(md).imports).toEqual(['@eand/react-design-system', '@eand/icons']);
  });

  it('reads a signature with a literal union', () => {
    const md = '- `Button({ variant: primary|secondary, block })`';
    expect(parseClaims(md).components.Button).toEqual({
      variant: ['primary', 'secondary'],
      block: [],
    });
  });

  it('does not treat a type annotation as a value claim', () => {
    const md = '- `Card({ title: ReactNode, media })`';
    expect(parseClaims(md).components.Card).toEqual({ title: [], media: [] });
  });

  it('handles nested braces and brackets in a parameter', () => {
    const md = '- `QuickAction({ items: {label, icon, badge?, onClick}[], columns })`';
    expect(Object.keys(parseClaims(md).components.QuickAction).sort()).toEqual(['columns', 'items']);
  });

  it('merges props when a component is documented twice', () => {
    const md = '`Chip({ selected })` and later `Chip({ type: outline|filled })`';
    expect(parseClaims(md).components.Chip).toEqual({ selected: [], type: ['outline', 'filled'] });
  });

  it('collects icon names from usages and from the inventory block', () => {
    const md = [
      '<Icon name="wallet" />',
      '<!-- icons:begin -->',
      '`home` · `search`',
      '<!-- icons:end -->',
      '`not-an-icon-outside-the-block`',
    ].join('\n');
    expect(parseClaims(md).iconNames).toEqual(['home', 'search', 'wallet']);
  });

  it('returns empty structures for empty input', () => {
    expect(parseClaims('')).toEqual({ imports: [], components: {}, iconNames: [] });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run scripts/guidelines-claims.test.ts
```

Expected: FAIL — cannot resolve `./guidelines-claims`.

- [ ] **Step 3: Write the implementation**

Create `scripts/guidelines-claims.ts`:

```ts
// Parses MAKE_KIT_GUIDELINES.md into the set of checkable claims it makes.
// Pure text in, structured claims out — no filesystem, no library import.

export interface Claims {
  imports: string[];
  components: Record<string, Record<string, string[]>>;
  iconNames: string[];
}

/** Two or more lowercase identifiers joined by `|`. */
const LITERAL_UNION = /^[a-z][a-z0-9-]*(\s*\|\s*[a-z][a-z0-9-]*)+$/;
const PARAM = /^([a-zA-Z][a-zA-Z0-9]*)\??\s*(?::\s*([\s\S]+))?$/;

const OPEN = new Set(['{', '[', '(']);
const CLOSE = new Set(['}', ']', ')']);

/** Split a parameter list on top-level commas, so nested `{…}` and `[…]` survive. */
function splitParams(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if (OPEN.has(ch)) depth++;
    else if (CLOSE.has(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseParams(body: string): Record<string, string[]> {
  const props: Record<string, string[]> = {};
  for (const token of splitParams(body)) {
    const m = PARAM.exec(token);
    if (!m) continue;
    const [, name, annotation] = m;
    const trimmed = annotation?.trim();
    props[name] = trimmed && LITERAL_UNION.test(trimmed)
      ? trimmed.split('|').map((v) => v.trim())
      : [];
  }
  return props;
}

function parseComponents(md: string): Claims['components'] {
  const out: Claims['components'] = {};
  const head = /`([A-Z][A-Za-z0-9]*)\(\{/g;
  let m: RegExpExecArray | null;
  while ((m = head.exec(md))) {
    let depth = 1;
    let i = head.lastIndex;
    while (i < md.length && depth > 0) {
      if (md[i] === '{') depth++;
      else if (md[i] === '}') depth--;
      i++;
    }
    if (depth !== 0) continue;
    out[m[1]] = { ...(out[m[1]] ?? {}), ...parseParams(md.slice(head.lastIndex, i - 1)) };
  }
  return out;
}

function parseIconNames(md: string): string[] {
  const names = new Set<string>();
  for (const m of md.matchAll(/<Icon\s+name="([^"]+)"/g)) names.add(m[1]);
  const block = /<!-- icons:begin -->([\s\S]*?)<!-- icons:end -->/.exec(md);
  if (block) for (const m of block[1].matchAll(/`([a-z0-9-]+)`/g)) names.add(m[1]);
  return [...names].sort();
}

export function parseClaims(md: string): Claims {
  return {
    imports: [...new Set([...md.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]))],
    components: parseComponents(md),
    iconNames: parseIconNames(md),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run scripts/guidelines-claims.test.ts
```

Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/scripts/guidelines-claims.ts \
        packages/react-design-system/scripts/guidelines-claims.test.ts
git commit -m "feat(guidelines): parse guidelines markdown into checkable claims"
```

---

### Task 3: The checker, proven against today's guidelines

This task's deliverable is the spec's primary evidence: the checker must **fail** on the current document and name the real defects. Do not touch `MAKE_KIT_GUIDELINES.md` in this task.

**Files:**
- Create: `packages/react-design-system/scripts/check-guidelines.ts`
- Create: `packages/react-design-system/scripts/check-guidelines.test.ts`
- Create: `packages/react-design-system/scripts/__fixtures__/guidelines-original.md`

**Interfaces:**
- Consumes: `collectFacts`, `Facts` (Task 1); `parseClaims` (Task 2).
- Produces: `check(md: string, facts: Facts): Problem[]` where `Problem = { kind: Kind; detail: string }` and
  `Kind = 'phantom-package' | 'phantom-icon' | 'phantom-component' | 'phantom-prop' | 'phantom-value' | 'undocumented-component' | 'unlisted-icon'`.

- [ ] **Step 1: Snapshot the current guidelines as a test fixture**

The proof that the checker detects real drift has to survive Task 4 rewriting the document, and survive this branch merging to `main`. Copy the file now, before anything edits it:

```bash
cd packages/react-design-system
mkdir -p scripts/__fixtures__
cp MAKE_KIT_GUIDELINES.md scripts/__fixtures__/guidelines-original.md
```

This fixture is permanent evidence and must never be edited afterwards.

- [ ] **Step 2: Write the failing test**

Create `scripts/check-guidelines.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { check, type Problem } from './check-guidelines';
import { collectFacts } from './guidelines-facts';

const facts = collectFacts();
const kinds = (ps: Problem[]) => new Set(ps.map((p) => p.kind));
const details = (ps: Problem[]) => ps.map((p) => p.detail).join('\n');

describe('check', () => {
  it('accepts a document that only makes true claims', () => {
    const md = [
      "```tsx",
      "import { Button, Icon } from '@eand/react-design-system';",
      "```",
      '- `Button({ variant: primary|glass, loading })`',
      '<Icon name="wallet" />',
      '<!-- icons:begin -->',
      facts.iconBaseNames.map((n) => `\`${n}\``).join(' · '),
      '<!-- icons:end -->',
      facts.exportedComponents.map((c) => `\`${c}\``).join(' '),
    ].join('\n');
    expect(check(md, facts)).toEqual([]);
  });

  it('flags an import from a package that is not published', () => {
    const ps = check("import { Icon } from '@eand/icons';", facts);
    expect(kinds(ps)).toContain('phantom-package');
    expect(details(ps)).toContain('@eand/icons');
  });

  it('flags an icon name that is not in the registry', () => {
    const ps = check('<Icon name="mshop" />', facts);
    expect(ps.some((p) => p.kind === 'phantom-icon' && p.detail.includes('mshop'))).toBe(true);
  });

  it('flags a prop the component does not have', () => {
    const ps = check('`Button({ nonexistentProp })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-prop' && p.detail.includes('Button.nonexistentProp'))).toBe(true);
  });

  it('flags a union value the prop does not accept', () => {
    const ps = check('`Button({ variant: primary|bogus })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-value' && p.detail.includes('bogus'))).toBe(true);
  });

  it('flags a component that is documented but not exported', () => {
    const ps = check('`MadeUpWidget({ title })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-component' && p.detail.includes('MadeUpWidget'))).toBe(true);
  });

  it('does not flag Icon, which is public but lives outside src/components', () => {
    const ps = check('`Icon({ name, size, color })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-component')).toBe(false);
  });

  it('flags an exported component that is never documented', () => {
    const ps = check('nothing here', facts);
    expect(ps.some((p) => p.kind === 'undocumented-component' && p.detail.includes('Picker'))).toBe(true);
  });

  it('flags base icons missing from the inventory block', () => {
    const ps = check('<!-- icons:begin -->\n`home`\n<!-- icons:end -->', facts);
    expect(ps.some((p) => p.kind === 'unlisted-icon' && p.detail.includes('wallet'))).toBe(true);
  });
});

describe('the guidelines as they stood before the rewrite', () => {
  // Acceptance criterion 2: the checker must detect the drift that actually happened.
  // Reads the frozen fixture, so this keeps proving itself after Task 4 and after merge.
  const original = readFileSync(
    resolve(import.meta.dirname, '__fixtures__/guidelines-original.md'),
    'utf8',
  );
  const problems = check(original, facts);

  it('fails', () => {
    expect(problems.length).toBeGreaterThan(0);
  });

  it('names the phantom @eand/icons package', () => {
    expect(problems.some((p) => p.kind === 'phantom-package' && p.detail.includes('@eand/icons'))).toBe(true);
  });

  it('names all 8 phantom icons', () => {
    const flagged = problems.filter((p) => p.kind === 'phantom-icon').map((p) => p.detail).join('\n');
    for (const name of ['profile', 'mshop', 'sparkle', 'subscriptions', 'mobile', 'truck', 'plus', 'shield']) {
      expect(flagged).toContain(`'${name}'`);
    }
  });

  it('names undocumented components', () => {
    const flagged = problems.filter((p) => p.kind === 'undocumented-component').map((p) => p.detail).join('\n');
    for (const name of ['Picker', 'OtpInput', 'ButtonGroup', 'StatusRibbon', 'CtaFooter']) {
      expect(flagged).toContain(`'${name}'`);
    }
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx vitest run scripts/check-guidelines.test.ts
```

Expected: FAIL — cannot resolve `./check-guidelines`.

- [ ] **Step 4: Write the implementation**

Create `scripts/check-guidelines.ts`:

```ts
// Diffs the claims in MAKE_KIT_GUIDELINES.md against what the library actually exports.
// Verifies identifiers, not semantics: it knows whether a name exists, not whether the
// advice around it is good.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { collectFacts, type Facts } from './guidelines-facts.js';
import { parseClaims } from './guidelines-claims.js';

export type Kind =
  | 'phantom-package'
  | 'phantom-icon'
  | 'phantom-component'
  | 'phantom-prop'
  | 'phantom-value'
  | 'undocumented-component'
  | 'unlisted-icon';

export interface Problem { kind: Kind; detail: string }

// Public exports that are not components under src/components/, so they never appear in
// facts.exportedComponents. `Icon` is the name-based renderer from src/icons/ and is a
// first-class part of the kit's API — documenting it must not read as a phantom.
const EXTRA_PUBLIC = new Set(['Icon']);

const HEADLINE: Record<Kind, string> = {
  'phantom-package': 'Imports from a package that is not published',
  'phantom-icon': 'Icon names that do not exist in the registry',
  'phantom-component': 'Components documented but not exported',
  'phantom-prop': 'Props documented but not present on the component',
  'phantom-value': 'Union values the prop does not accept',
  'undocumented-component': 'Exported components missing from the guidelines',
  'unlisted-icon': 'Base icons missing from the inventory block',
};

export function check(md: string, facts: Facts): Problem[] {
  const problems: Problem[] = [];
  const claims = parseClaims(md);
  const exported = new Set(facts.exportedComponents);
  const icons = new Set(facts.iconNames);

  for (const spec of claims.imports) {
    if (spec !== facts.packageName) {
      problems.push({
        kind: 'phantom-package',
        detail: `imports from '${spec}' — only '${facts.packageName}' is published`,
      });
    }
  }

  for (const name of claims.iconNames) {
    if (!icons.has(name)) {
      problems.push({
        kind: 'phantom-icon',
        detail: `icon '${name}' is not in the registry (${facts.iconNames.length} names)`,
      });
    }
  }

  for (const [component, props] of Object.entries(claims.components)) {
    if (EXTRA_PUBLIC.has(component)) continue;
    if (!exported.has(component)) {
      problems.push({ kind: 'phantom-component', detail: `'${component}' is documented but not exported` });
      continue;
    }
    const real = facts.components[component];
    if (!real) continue; // exported, but docgen surfaced no prop table — nothing to verify
    for (const [prop, values] of Object.entries(props)) {
      const realProp = real[prop];
      if (!realProp) {
        problems.push({ kind: 'phantom-prop', detail: `${component}.${prop} is documented but not in its props` });
        continue;
      }
      if (!realProp.values) continue;
      for (const value of values) {
        if (!realProp.values.includes(value)) {
          problems.push({
            kind: 'phantom-value',
            detail: `${component}.${prop}='${value}' is not valid (${realProp.values.join('|')})`,
          });
        }
      }
    }
  }

  for (const component of facts.exportedComponents) {
    const mentioned = claims.components[component] || new RegExp('`' + component + '\\b').test(md);
    if (!mentioned) {
      problems.push({ kind: 'undocumented-component', detail: `'${component}' is exported but never documented` });
    }
  }

  const listed = new Set(claims.iconNames);
  for (const name of facts.iconBaseNames) {
    if (!listed.has(name)) {
      problems.push({ kind: 'unlisted-icon', detail: `base icon '${name}' is not listed in the icons section` });
    }
  }

  return problems;
}

export function report(problems: Problem[]): string {
  const grouped = new Map<Kind, string[]>();
  for (const p of problems) grouped.set(p.kind, [...(grouped.get(p.kind) ?? []), p.detail]);
  const lines: string[] = [];
  for (const [kind, details] of grouped) {
    lines.push(`\n${HEADLINE[kind]} (${details.length}):`);
    // Long lists (198 unlisted icons) would drown the report — show a sample.
    for (const d of details.slice(0, 12)) lines.push(`  ✗ ${d}`);
    if (details.length > 12) lines.push(`  … and ${details.length - 12} more`);
  }
  return lines.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const here = dirname(fileURLToPath(import.meta.url));
  const path = process.argv[2] ?? resolve(here, '../MAKE_KIT_GUIDELINES.md');
  const problems = check(readFileSync(path, 'utf8'), collectFacts());
  if (problems.length === 0) {
    console.log(`✓ ${path} matches the library`);
    process.exit(0);
  }
  console.error(`✗ ${problems.length} problems in ${path}`);
  console.error(report(problems));
  process.exit(1);
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run scripts/check-guidelines.test.ts
```

Expected: PASS, 13 tests — including the four proving the original guidelines fail.

- [ ] **Step 6: Capture the failing report as evidence**

```bash
npm run guidelines:check 2>&1 | tee /tmp/guidelines-before.txt; echo "exit=$?"
```

Expected: nonzero exit, and a report naming `@eand/icons`, the 8 phantom icons, and the undocumented components. **Keep this output — it goes in the Task 4 commit message.**

- [ ] **Step 7: Commit**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/scripts/check-guidelines.ts \
        packages/react-design-system/scripts/check-guidelines.test.ts \
        packages/react-design-system/scripts/__fixtures__/guidelines-original.md
git commit -m "feat(guidelines): fact-check the kit guidelines against the library

The checker fails against the current MAKE_KIT_GUIDELINES.md, naming the
phantom @eand/icons import, the 8 nonexistent icon names, and the 15
undocumented component exports."
```

---

### Task 4: Rewrite the guidelines

**Files:**
- Modify: `packages/react-design-system/MAKE_KIT_GUIDELINES.md` (substantial rewrite)

**Interfaces:**
- Consumes: `npm run guidelines:check` (Task 3) as the gate; `guidelines-facts.json` (Task 1) as the source of every factual claim.
- Produces: a document satisfying the Task 2 grammar. Task 5 reads its worked example.

**Method — do not write component facts from memory.** Generate the facts file first and read prop tables out of it:

```bash
export PATH="$HOME/.local/bin:$PATH"
cd packages/react-design-system
npm run guidelines:facts
python3 -c "
import json; f=json.load(open('guidelines-facts.json'))
for c in f['exportedComponents']:
    props=f['components'].get(c,{})
    print(c, '->', ', '.join(k + ('=' + '|'.join(v['values']) if v['values'] else '') for k,v in props.items()))
"
```

- [ ] **Step 1: Rewrite the import contract and icons section**

Replace the old header and the entire `## Icons — never invent them` section. The import line becomes:

```tsx
import { TopBar, Section, NavBar, Button, Icon } from '@eand/react-design-system';
```

The icons section must state the `-filled` convention and carry the full inventory inside the marker block:

```markdown
## Icons — never invent them

Icons ship **inside this package**. Import `Icon` from `@eand/react-design-system`
alongside the components — there is no separate icons package. Never draw an SVG,
use an emoji, or invent a name; every glyph you need is already here.

Render `<Icon name="…" />` and pass it into a component's `icon` / `leadingIcon` /
`actions` slot. It tints via CSS `color`, so it inherits the slot's colour.

**Every icon has two forms:** the outline `name` and the filled `name-filled`
(e.g. `home` and `home-filled`). Prominent slots — active nav tabs, hero tiles,
quick-action squares — take the **filled** form. Inline and secondary glyphs take
the outline form. That is 198 base names, 396 total.

<!-- icons:begin -->
`add` · `add-2` · … all 198 base names, grouped by purpose …
<!-- icons:end -->
```

Fill the block from `iconBaseNames`, grouped by purpose. Grouping is your call — derive it from `iconMeta` descriptions; the binding requirement is that **all 198 appear**, not any particular set of category labels. Generate the raw list with:

```bash
python3 -c "
import json; f=json.load(open('guidelines-facts.json'))
print(' · '.join('\`%s\`' % n for n in f['iconBaseNames']))
"
```

Where the old text named a phantom, use the real equivalent: `profile`→`user`, `sparkle`→`ai`, `mobile`→`phone-device`, `truck`→`delivery`, `plus`→`add`, `shield`→`security`. `mshop` and `subscriptions` have no equivalent — reword to use `shop` and `package` respectively.

- [ ] **Step 2: Rewrite the component reference**

Keep the "props that matter" curation — do not dump every prop. Every component in `exportedComponents` must appear at least once in backticks, and each signature must use only real props and real union values. Correct at minimum:

```markdown
- `Button({ variant: primary|secondary|tertiary|link|glass, surface: brand|inverse-brand|white|midnight, size: sm|md|lg, block, loading, leadingIcon, trailingIcon })`
- `Chip({ type: outline|filled|glass|inverse, selected, disabled, check, loading, leadingIcon, onClick })`
- `Input({ label, helper, error, success, type: text|dropdown|picker|comment, inverse, clearable, leadingIcon, trailingIcon })`
- `Checkbox({ label, size: sm|md, inverse, radio })`
- `Radio({ label, size: sm|lg, inverse })`
- `Switcher({ checked, size: sm|lg, disabled })`
- `Tabs({ tabs, value, scope: global|local })`
- `FilterPill({ selected, inverse, disabled })`
- `OtpInput({ length, value, masked, inverse, disabled, error })`
- `Picker({ surface: default|light|inverse|glass })`
- `PickerOption({ value, caption, badge, surface: default|light|inverse|glass, selected, disabled })`
```

Add a **CTA bar** subsection for the components that had none: `ButtonGroup`, `StatusRibbon`, `PaymentRow`, `CtaFooter`. Add `AtomSurface`, `CardBgColor`, `Stepper`, `Dismiss`, `IconBox`, `SmilesAvatar`, `Voucher`, `Accordion` to the primitives and layout subsections. Take each signature from the facts dump — do not guess.

`TopBar` is now slot-based. Verified against `src/components/navigation.tsx`, document it as:

```markdown
- `TopBar({ surface, statusBar, leading, logo, title, account, actions, trailing, eyebrow, bigTitle, subtext, chevron, rounded, children })`
```

and note in prose that `variant`, `greeting` and `actionBar` are deprecated back-compat aliases Make should not reach for — `surface`, `account={{ greeting }}` and `children` replace them.

- [ ] **Step 3: Keep the prose, fix the worked example**

The golden rules and the UX→UI assembly table are good judgment and largely survive. Two edits: extend the table with rows for the newly documented components (CTA footer → `CtaFooter`, OTP entry → `OtpInput`, option list → `Picker`), and rewrite the Home-screen example so every `<Icon name="…" />` resolves. Mark the example's fence so Task 5 can find it:

````markdown
```tsx example
<>
  <TopBar leading={<Logo />} actions={[<Icon name="search" />, <Icon name="notification" />]} />
  …
  <NavBar items={[
    { label: 'Home', icon: <Icon name="home-filled" />, active: true },
    { label: 'Support', icon: <Icon name="support" /> },
    { label: 'Profile', icon: <Icon name="user" /> },
    { label: 'Shop', icon: <Icon name="shop" /> },
  ]} />
</>
```
````

- [ ] **Step 4: Run the checker until it is green**

```bash
npm run guidelines:check
```

Expected: `✓ … matches the library`, exit 0. Iterate on the document — **never on the assertions** — until it passes.

- [ ] **Step 5: Confirm the whole suite still passes**

```bash
npx vitest run && npm run typecheck
```

Expected: all green. The Task 3 tests still pass because they read the frozen fixture at `scripts/__fixtures__/guidelines-original.md`, not the working copy.

- [ ] **Step 6: Commit**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/MAKE_KIT_GUIDELINES.md
git commit -m "fix(guidelines): reconcile the Make kit guidelines with the library

Single-package import (no @eand/icons), all 198 base icon names with the
-filled convention, current Button/Chip/Input/TopBar APIs, and the 15
previously undocumented exports. guidelines:check now exits 0.

Before this change the checker reported:
<paste /tmp/guidelines-before.txt here>"
```

---

### Task 5: Worked-example compile gate

Acceptance criterion 5. The example is what Make imitates most closely, so it has to compile against the built package's public types.

**Files:**
- Create: `packages/react-design-system/scripts/check-example.ts`
- Create: `packages/react-design-system/scripts/check-example.test.ts`

**Interfaces:**
- Consumes: the ` ```tsx example ` fence in `MAKE_KIT_GUIDELINES.md` (Task 4); `dist/index.d.ts` from `npm run build`.
- Produces: `extractExample(md: string): string | null`, plus a CLI that exits nonzero on a type error.

- [ ] **Step 1: Write the failing test**

Create `scripts/check-example.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { extractExample } from './check-example';

describe('extractExample', () => {
  it('pulls the body out of a ```tsx example fence', () => {
    const md = ['```tsx example', '<Button />', '```'].join('\n');
    expect(extractExample(md)).toBe('<Button />');
  });

  it('ignores plain tsx fences', () => {
    expect(extractExample('```tsx\n<Button />\n```')).toBeNull();
  });

  it('returns null when there is no example', () => {
    expect(extractExample('nothing here')).toBeNull();
  });

  it('finds the example in the real guidelines', () => {
    const md = readFileSync(resolve(import.meta.dirname, '../MAKE_KIT_GUIDELINES.md'), 'utf8');
    const example = extractExample(md);
    expect(example).toBeTruthy();
    expect(example).toContain('NavBar');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run scripts/check-example.test.ts
```

Expected: FAIL — cannot resolve `./check-example`.

- [ ] **Step 3: Write the implementation**

Create `scripts/check-example.ts`:

```ts
// Type-checks the guidelines' worked example against the built package types.
// Requires `npm run build` first — it resolves the import to dist/index.d.ts.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(here, '..');

export function extractExample(md: string): string | null {
  const m = /```tsx example\n([\s\S]*?)```/.exec(md);
  return m ? m[1].trimEnd() : null;
}

function run(): void {
  const md = readFileSync(resolve(PKG, 'MAKE_KIT_GUIDELINES.md'), 'utf8');
  const example = extractExample(md);
  if (!example) {
    console.error('✗ no ```tsx example fence found in MAKE_KIT_GUIDELINES.md');
    process.exit(1);
  }

  const dir = resolve(PKG, '.example-check');
  mkdirSync(dir, { recursive: true });

  // Every identifier the example uses comes from the package's public entry point,
  // so a wildcard import is enough to prove the names and prop types line up.
  writeFileSync(
    resolve(dir, 'example.tsx'),
    [
      "import * as DS from '@eand/react-design-system';",
      'const { ' +
        [...new Set([...example.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))].join(', ') +
        ' } = DS;',
      'export default function Example() {',
      '  return (',
      example,
      '  );',
      '}',
    ].join('\n'),
  );

  writeFileSync(
    resolve(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM'],
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          types: ['react'],
          baseUrl: '.',
          paths: { '@eand/react-design-system': ['../dist/index.d.ts'] },
        },
        include: ['example.tsx'],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync('npx', ['tsc', '-p', resolve(dir, 'tsconfig.json')], { cwd: PKG, stdio: 'inherit' });
    console.log('✓ worked example type-checks against dist');
    rmSync(dir, { recursive: true, force: true });
  } catch {
    console.error(`✗ worked example does not type-check — see ${dir}/example.tsx`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) run();
```

Add `.example-check/` to the repo-root `.gitignore` under the package path.

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run scripts/check-example.test.ts
```

Expected: PASS, 4 tests.

- [ ] **Step 5: Build, then run the gate**

```bash
npm run build && npm run guidelines:example
```

Expected: `✓ worked example type-checks against dist`. If it fails, fix the **example in the guidelines** (then re-run `npm run guidelines:check` too), not the checker.

- [ ] **Step 6: Commit**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/scripts/check-example.ts \
        packages/react-design-system/scripts/check-example.test.ts \
        packages/react-design-system/MAKE_KIT_GUIDELINES.md .gitignore
git commit -m "test(guidelines): type-check the worked example against dist"
```

---

### Task 6: Release prep and publish runbook

**Files:**
- Modify: `packages/react-design-system/package.json` (version)
- Create: `packages/react-design-system/scripts/smoke-esm.mjs`
- Modify: `packages/react-design-system/MAKE_KIT_README.md` (runbook)

**Interfaces:**
- Consumes: a green `guidelines:check` and `guidelines:example` (Tasks 4–5).
- Produces: a verified `1.0.0` tarball plus owner-facing publish instructions. Nothing consumes this.

- [ ] **Step 1: Write the ESM smoke test**

Create `scripts/smoke-esm.mjs`. This imports the built ESM the way esm.sh serves it, so a broken or missing export fails loudly rather than at Make runtime:

```js
// Proves dist/index.js is importable and renders. Run after `npm run build`.
import { renderToString } from 'react-dom/server';
import { createElement as h } from 'react';
import * as DS from '../dist/index.js';

const required = ['Button', 'Icon', 'TopBar', 'NavBar', 'Section', 'Picker', 'CtaFooter'];
const missing = required.filter((n) => typeof DS[n] !== 'function');
if (missing.length) {
  console.error(`✗ missing exports: ${missing.join(', ')}`);
  process.exit(1);
}

const html = renderToString(
  h(DS.Section, { title: 'Deals for you' }, h(DS.Button, { variant: 'primary' }, 'Pay now')),
);
if (!html.includes('Pay now') || !html.includes('Deals for you')) {
  console.error(`✗ unexpected render output:\n${html}`);
  process.exit(1);
}

const iconHtml = renderToString(h(DS.Icon, { name: 'wallet' }));
if (!iconHtml.includes('<svg')) {
  console.error(`✗ Icon did not render an svg:\n${iconHtml}`);
  process.exit(1);
}

console.log('✓ ESM smoke: exports resolve and render');
```

Add to `package.json` `"scripts"`:

```json
"smoke": "node scripts/smoke-esm.mjs"
```

- [ ] **Step 2: Run the smoke test**

```bash
export PATH="$HOME/.local/bin:$PATH"
cd packages/react-design-system
npm run build && npm run smoke
```

Expected: `✓ ESM smoke: exports resolve and render`.

- [ ] **Step 3: Bump the version to 1.0.0**

Edit `package.json`: `"version": "0.0.0"` → `"version": "1.0.0"`. Do not use `npm version` — it creates a git tag, and tagging is the owner's call at publish time.

- [ ] **Step 4: Verify the tarball**

```bash
npm pack --dry-run
```

Expected: 23 files — `dist/**`, `package.json`, `MAKE_KIT_GUIDELINES.md`, `MAKE_KIT_README.md`. No `src`, no `scripts`, no `node_modules`, no `guidelines-facts.json`, no `.example-check`. Version reads `1.0.0`.

If `scripts/` or `guidelines-facts.json` appear, fix the `files` array in `package.json` — it must stay `["dist", "MAKE_KIT_GUIDELINES.md", "MAKE_KIT_README.md"]`.

- [ ] **Step 5: Write the publish runbook**

Replace the `## Create the Make kit` section of `MAKE_KIT_README.md` with instructions the owner can follow without asking questions. It must cover: choosing the registry (Figma private npm registry with the `@eand` scope, or public npm with `--access public`), configuring `.npmrc` auth, the pre-publish gate, `npm publish`, and kit creation in Figma.

Include the pre-publish gate verbatim:

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

Add a maintenance note: *after changing any component's props or the icon set, run `npm run guidelines:check` — it fails when the guidelines fall out of sync, and the guidelines are what Figma Make follows.*

- [ ] **Step 6: Run the full gate**

```bash
npm run build && npm test && npm run typecheck && npm run guidelines:check && npm run guidelines:example && npm run smoke && npm pack --dry-run
```

Expected: every command exits 0.

- [ ] **Step 7: Commit and push**

```bash
cd /Users/kushal.l.sharma/Desktop/E\&DSA
git add packages/react-design-system/package.json \
        packages/react-design-system/scripts/smoke-esm.mjs \
        packages/react-design-system/MAKE_KIT_README.md
git commit -m "chore(release): prepare @eand/react-design-system 1.0.0 as a Make kit

ESM smoke test over the built bundle, version 1.0.0, and a publish runbook.
Publishing itself stays with the repo owner."
git push
```

---

## Acceptance criteria (from the spec)

Verify each before calling the work done:

1. `npm run guidelines:check` exits 0 — Task 4 Step 4.
2. The checker fails on the pre-rewrite guidelines and names the 8 phantom icons and the phantom package — Task 3 Steps 4–5, evidence in the Task 4 commit message.
3. All 54 exported components appear in the guidelines — enforced by `undocumented-component`.
4. All 198 base icon names documented; every icon name resolves — enforced by `unlisted-icon` and `phantom-icon`.
5. The worked example type-checks against the built package — Task 5 Step 5.
6. `npm pack --dry-run` ships only `dist/` + `package.json` + the two MD files — Task 6 Step 4.
7. `npm test` and `npm run typecheck` pass — Task 6 Step 6.
8. `MAKE_KIT_README.md` contains a runbook the owner can follow unaided — Task 6 Step 5.

## Out of scope

Running `npm publish` · the code↔Figma gaps in `figma-component-audit.md` · Code Connect mappings · `apps/docs` · any component implementation change.

# Icons Gallery: Outline/Filled Toggle + Descriptions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the docs icons gallery to show one tile per icon concept (198) with a per-tile outline/filled toggle, Figma-sourced descriptions, alias-aware search, and variant-aware copy.

**Architecture:** A one-time Figma extraction (via the `use_figma` MCP tool) dumps the 198 component-set descriptions from the `icons_2d` section; a committed node script parses them into a generated `metadata.ts` in `@eand/icons`, exported as `ICON_META`. The docs `IconGallery` component derives outline/filled pairs from `ICONS` keys (`base` / `base-filled`, exact 1:1) and renders per-tile toggles + descriptions.

**Tech Stack:** React 19 client component in a Next.js 16 (fumadocs) app; `@eand/icons` is a `file:`-linked workspace package built with `tsc`; Figma Plugin API via the `use_figma` MCP tool.

**Spec:** `docs/superpowers/specs/2026-07-17-icons-gallery-variants-descriptions-design.md`

**Refinement over spec:** metadata is emitted as a generated TypeScript module `packages/icons/src/metadata.ts` (matching the generated-`icons.tsx` idiom) rather than `metadata.json`. Importing JSON from an ESM package requires `with { type: 'json' }` import attributes with inconsistent bundler/Node support; a TS module sidesteps this. Same data, same location, still a checked-in generated artifact.

## Global Constraints

- Icon key naming: outline = `bookmark`, filled = `bookmark-filled`; every base has a filled counterpart (198 pairs, verified).
- Never fabricate description text — blank Figma descriptions render as name-only tiles and are reported.
- Do not modify the `Icon` component API, the `ICONS` map, or `tools/build-icons.py`.
- `packages/icons/src/icons.tsx` is auto-generated; never hand-edit it. `src/index.ts` is handwritten and safe to edit.
- Neither package has a test runner; verification is via `tsc`, node assertion scripts, and the running docs dev server.
- Repo git identity is configured repo-locally (`kushal <kushalsharma95@gmail.com>`); commit messages end with the Claude co-author trailer.
- Working directory notes: repo root is `/Users/kushal.l.sharma/Desktop/E&DSA` (quote the `&` in shell paths).

---

### Task 1: Extract Figma descriptions → generate `metadata.ts`

**Files:**
- Create: `packages/icons/tools/build-metadata.mjs`
- Create (generated): `packages/icons/src/metadata.ts`
- Scratch: `<scratchpad>/raw-icon-descriptions.json` (not committed)

**Interfaces:**
- Consumes: Figma file `e& Consumer App DSL V1.1` (key `pzm63BTLfPfT1stcF89ILQ`), section `icons_2d` node `31965:64761`, open in Figma desktop. `packages/icons/src/raw/*.svg` filenames (source of truth for expected base names).
- Produces: `packages/icons/src/metadata.ts` exporting `interface IconMeta { description: string; aliases: string[] }` and `const ICON_META: Record<string, IconMeta>` with exactly the 198 base names as keys. Task 2 re-exports this; Task 3 imports `ICON_META` and `IconMeta` shape.

**Precondition:** The Figma desktop app must have the e& Consumer App DSL V1.1 file open. If `use_figma` reports no file/connection, stop and ask the user to open it.

- [ ] **Step 1: Write the parser/generator script**

Create `packages/icons/tools/build-metadata.mjs`:

```js
#!/usr/bin/env node
// Generate src/metadata.ts from a raw Figma description dump.
// Usage: node tools/build-metadata.mjs <raw-dump.json>
//   raw-dump.json: [{ "name": "bookmark", "description": "Saved items… Also searchable as: banner, flag" }, …]
// Re-run after re-syncing descriptions from the e& Consumer App DSL Figma file
// (icons_2d section, node 31965:64761) — see the docs icons spec.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const rawPath = process.argv[2];
if (!rawPath) {
  console.error('Usage: node tools/build-metadata.mjs <raw-dump.json>');
  process.exit(1);
}
const raw = JSON.parse(readFileSync(rawPath, 'utf8'));

const meta = {};
const blank = [];
for (const { name, description } of raw) {
  const key = name.trim();
  const [head, tail = ''] = String(description ?? '').split(/also searchable as:/i);
  const desc = head.trim();
  const aliases = tail
    .split(',')
    .map((a) => a.trim().toLowerCase().replace(/[.…]+$/, '').trim())
    .filter(Boolean);
  if (!desc) blank.push(key);
  meta[key] = { description: desc, aliases };
}

// Validate against the icon set: base names derived from src/raw/*.svg.
const svgBases = new Set(
  readdirSync(new URL('../src/raw', import.meta.url))
    .filter((f) => f.endsWith('.svg'))
    .map((f) => f.replace(/\.svg$/, ''))
    .filter((n) => !n.endsWith('-filled')),
);
const figmaNames = new Set(Object.keys(meta));
const missingInFigma = [...svgBases].filter((b) => !figmaNames.has(b)).sort();
const extraInFigma = [...figmaNames].filter((f) => !svgBases.has(f)).sort();

const entries = Object.keys(meta)
  .sort()
  .map((k) => `  ${JSON.stringify(k)}: ${JSON.stringify(meta[k])}`)
  .join(',\n');
const out = `// AUTO-GENERATED from Figma icon descriptions (e& Consumer App DSL, icons_2d section).
// Regenerate with: node tools/build-metadata.mjs <raw-dump.json>. Do not edit.
export interface IconMeta { description: string; aliases: string[] }
export const ICON_META: Record<string, IconMeta> = {
${entries},
};
`;
writeFileSync(new URL('../src/metadata.ts', import.meta.url), out);

console.log(`Wrote ${figmaNames.size} entries to src/metadata.ts`);
if (blank.length) console.warn(`⚠ Blank descriptions (${blank.length}): ${blank.join(', ')}`);
if (missingInFigma.length) console.warn(`⚠ In package but not in Figma dump (${missingInFigma.length}): ${missingInFigma.join(', ')}`);
if (extraInFigma.length) console.warn(`⚠ In Figma dump but not in package (${extraInFigma.length}): ${extraInFigma.join(', ')}`);
```

- [ ] **Step 2: Dump descriptions from Figma**

Invoke the `figma:figma-use` skill (mandatory prerequisite), then call the `use_figma` MCP tool with:

```js
const section = await figma.getNodeByIdAsync('31965:64761');
const sets = section.findAll((n) => n.type === 'COMPONENT_SET');
return sets.map((s) => ({ name: s.name, description: s.description }));
```

If the result is truncated by size limits, page it (`sets.slice(0, 66)`, `slice(66, 132)`, `slice(132)`) and concatenate the arrays. Save the combined array as JSON to `<scratchpad>/raw-icon-descriptions.json`.

Expected: 198 objects; names like `bookmark`, `search`, `wifi`.

- [ ] **Step 3: Generate metadata.ts**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA/packages/icons"
node tools/build-metadata.mjs <scratchpad>/raw-icon-descriptions.json
```

Expected: `Wrote 198 entries to src/metadata.ts` with **no** missing/extra warnings. Blank-description warnings are acceptable — record the names for the final report to the user. If missing/extra names appear, list them for the user and stop; do not hand-edit names to force a match.

- [ ] **Step 4: Sanity-check the generated file**

```bash
grep -c 'description' src/metadata.ts   # expect 199 (198 entries + interface line)
grep '"bookmark"' src/metadata.ts       # expect description text + aliases array
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA"
git add packages/icons/tools/build-metadata.mjs packages/icons/src/metadata.ts
git commit -m "feat(icons): sync icon descriptions + search aliases from Figma

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Export `ICON_META` from `@eand/icons`

**Files:**
- Modify: `packages/icons/src/index.ts`
- Rebuild: `packages/icons/dist/*`

**Interfaces:**
- Consumes: `src/metadata.ts` from Task 1 (`ICON_META`, `IconMeta`).
- Produces: `import { ICON_META, type IconMeta } from '@eand/icons'` works for consumers; `ICON_META` keys are the 198 base names. Task 3 relies on this exact import.

- [ ] **Step 1: Add the export**

`packages/icons/src/index.ts` currently contains only `export * from './icons';`. Replace with:

```ts
export * from './icons';
export * from './metadata';
```

- [ ] **Step 2: Build the package**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA/packages/icons"
npm run build
```

Expected: exits 0. (This regenerates `src/icons.tsx` from SVGs then runs `tsc`; `dist/metadata.js` and `dist/metadata.d.ts` should now exist.)

- [ ] **Step 3: Verify the built export**

```bash
node -e "
import('./dist/index.js').then(({ ICONS, ICON_META }) => {
  const bases = Object.keys(ICONS).filter((k) => !k.endsWith('-filled'));
  const metaKeys = Object.keys(ICON_META);
  console.log('bases:', bases.length, 'meta:', metaKeys.length);
  const missing = bases.filter((b) => !ICON_META[b]);
  if (missing.length) { console.error('missing meta for:', missing); process.exit(1); }
  const bm = ICON_META['bookmark'];
  if (!bm || typeof bm.description !== 'string' || !Array.isArray(bm.aliases)) {
    console.error('bad shape:', bm); process.exit(1);
  }
  console.log('bookmark:', JSON.stringify(bm));
  console.log('OK');
}).catch((e) => { console.error(e); process.exit(1); });
"
```

Expected: `bases: 198 meta: 198`, the bookmark entry, then `OK`. (`react` isn't imported at module top-level scope during this check via jsx runtime — if node errors on `react/jsx-runtime` resolution, run the same assertions after `npm ls react` confirms the local devDependency install; `packages/icons/node_modules` exists so it should resolve.)

- [ ] **Step 4: Commit**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA"
git add packages/icons/src/index.ts
git commit -m "feat(icons): export ICON_META icon descriptions

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Rework `IconGallery` — pairs, toggle, descriptions, alias search

**Files:**
- Modify: `apps/docs/components/preview/icons-browser.tsx` (full rewrite of the file, shown below)

**Interfaces:**
- Consumes: `ICONS`, `ICON_META`, `Icon` from `@eand/icons` (Task 2). `Icon` renders `<Icon name size />`; `ICON_META[base]` may be absent → guard.
- Produces: `IconGallery` export (same name — `components/mdx.tsx` already wires it into MDX; do not change its export signature).

- [ ] **Step 1: Rewrite the component**

Replace the entire contents of `apps/docs/components/preview/icons-browser.tsx` with:

```tsx
'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { ICONS, ICON_META, Icon } from '@eand/icons';
import './preview.css';

const EMPTY_META = { description: '', aliases: [] as string[] };

const segWrap: CSSProperties = {
  display: 'flex',
  border: '1px solid var(--ea-border, #e5e4ea)',
  borderRadius: 999,
  overflow: 'hidden',
  fontSize: 10,
};

function segBtn(on: boolean): CSSProperties {
  return {
    padding: '3px 10px',
    border: 'none',
    cursor: 'pointer',
    background: on ? '#e00800' : 'transparent',
    color: on ? '#fff' : 'inherit',
    opacity: on ? 1 : 0.6,
    fontSize: 10,
    lineHeight: 1.4,
  };
}

/** One icon concept: outline/filled preview toggle, click-to-copy name, description. */
function IconTile({
  base,
  copiedKey,
  onCopy,
}: {
  base: string;
  copiedKey: string | null;
  onCopy: (key: string) => void;
}) {
  const [filled, setFilled] = useState(false);
  const key = filled ? `${base}-filled` : base;
  const meta = ICON_META[base] ?? EMPTY_META;
  const justCopied = copiedKey === base || copiedKey === `${base}-filled`;

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '16px 12px', border: '1px solid var(--ea-border, #e5e4ea)',
        borderRadius: 12, minWidth: 0,
      }}
    >
      <Icon name={key} size={26} />
      <div style={segWrap} role="group" aria-label={`${base} variant`}>
        <button type="button" style={segBtn(!filled)} aria-pressed={!filled} onClick={() => setFilled(false)}>
          outline
        </button>
        <button type="button" style={segBtn(filled)} aria-pressed={filled} onClick={() => setFilled(true)}>
          filled
        </button>
      </div>
      <button
        type="button"
        onClick={() => onCopy(key)}
        title={`Click to copy "${key}"`}
        style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          fontSize: 11, lineHeight: 1.3, textAlign: 'center', width: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          opacity: justCopied ? 1 : 0.75, color: justCopied ? '#e00800' : 'inherit',
        }}
      >
        {justCopied ? 'copied!' : key}
      </button>
      {meta.description && (
        <p
          style={{
            fontSize: 11, lineHeight: 1.4, textAlign: 'center', margin: 0, opacity: 0.55,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {meta.description}
        </p>
      )}
    </div>
  );
}

/**
 * Searchable gallery of every icon concept in @eand/icons (outline + filled pair
 * per tile). Search matches names, descriptions, and Figma "also searchable as"
 * aliases. Click a name to copy the currently-toggled variant's key.
 */
export function IconGallery() {
  const bases = useMemo(
    () => Object.keys(ICONS).filter((n) => !n.endsWith('-filled')).sort(),
    [],
  );
  const index = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of bases) {
      const meta = ICON_META[b] ?? EMPTY_META;
      m.set(b, `${b} ${meta.description.toLowerCase()} ${meta.aliases.join(' ')}`);
    }
    return m;
  }, [bases]);

  const [q, setQ] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const needle = q.toLowerCase().trim();
  const shown = needle ? bases.filter((b) => index.get(b)!.includes(needle)) : bases;

  const copy = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1200);
  };

  return (
    <div className="eapg">
      <input
        className="ctrl-input"
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', marginBottom: 16, fontSize: 15 }}
        placeholder={`Search ${bases.length} icons — names, descriptions, aliases…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div style={{ marginBottom: 12, fontSize: 13, opacity: 0.6 }}>
        {shown.length} icon{shown.length === 1 ? '' : 's'} · outline + filled variants
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {shown.map((base) => (
          <IconTile key={base} base={base} copiedKey={copiedKey} onCopy={copy} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck the docs app**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA/apps/docs"
npm run types:check
```

Expected: exits 0. If `ICON_META` isn't found, Task 2's rebuild didn't land — re-run `npm --prefix ../../packages/icons run build`.

- [ ] **Step 3: Verify against the running dev server**

The dev server runs in the background on `http://localhost:3000` (restart it if the `@eand/icons` rebuild isn't picked up: kill and re-run `npm run dev` in `apps/docs`).

```bash
curl -s http://localhost:3000/docs/foundations/icons | grep -c 'aria-pressed'
```

Expected: `396` (198 tiles × 2 toggle buttons; SSR renders initial state). Then ask the user (or use browser tooling if available) to visually confirm: tiles show icon + toggle + name + description; toggling flips the glyph and name to `-filled`; clicking a name flashes `copied!` and the clipboard holds the variant-aware key; searching `flag` surfaces `bookmark`; count text updates.

- [ ] **Step 4: Commit**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA"
git add apps/docs/components/preview/icons-browser.tsx
git commit -m "feat(docs): icon gallery variant toggle, descriptions, alias search

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Update icons page copy

**Files:**
- Modify: `apps/docs/content/docs/foundations/icons.mdx`

**Interfaces:**
- Consumes: `<IconGallery />` MDX component (unchanged export from Task 3).
- Produces: final user-facing page copy.

- [ ] **Step 1: Update the MDX body**

Replace the body of `apps/docs/content/docs/foundations/icons.mdx` (keep the frontmatter as-is) with:

````mdx
Icons come from the **`@eand/icons`** package — synced from the
[e& App Icons](https://www.figma.com/design/9Q64oRPBkm3Sla5HMP4LJA/e--App-Icons?node-id=7-118)
Figma library. Every icon is a 24×24 glyph whose colours resolve to
`currentColor`, so it tints with the surrounding text `color`.

Each icon ships in two variants: **outline** (`bookmark`) and **filled**
(`bookmark-filled`). Use the toggle on a tile to preview either variant —
clicking the name copies the key for whichever variant is selected.

```tsx
import { Icon } from '@eand/icons';

<Icon name="wallet" size={24} />
<Icon name="wallet-filled" size={24} />
```

Descriptions and search aliases are synced from the icon library in Figma —
searching below matches names, descriptions, and aliases (try `flag`).

<IconGallery />
````

(Note: the nested ```tsx fence inside this MDX block is part of the page content — keep it.)

- [ ] **Step 2: Verify the page renders**

```bash
curl -s http://localhost:3000/docs/foundations/icons | grep -c 'wallet-filled'
```

Expected: ≥ 1 (the code sample). Visually confirm the page header copy reads correctly and the gallery still renders below it.

- [ ] **Step 3: Commit**

```bash
cd "/Users/kushal.l.sharma/Desktop/E&DSA"
git add apps/docs/content/docs/foundations/icons.mdx
git commit -m "docs: describe icon variants and alias search on icons page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Final report to user

After all tasks: list any icons with blank Figma descriptions (from Task 1 Step 3) and any name mismatches encountered, and confirm the four verification points from Task 3 Step 3.

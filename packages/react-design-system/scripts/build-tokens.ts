// Generate src/tokens/{tokens.css, tokens.ts} from the repo's variables.json.
// Resolves both V1.0 `{a.b}` and V1.1 `$.<collection>.value.<path>` alias forms.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { toCssValue, toTsValue } from './token-convert';

const here = dirname(fileURLToPath(import.meta.url));
const VARS = resolve(here, '../../../variables.json');
const OUTDIR = resolve(here, '../src/tokens');

type Leaf = { $value: unknown; $type?: string };
const isLeaf = (n: any): n is Leaf => n != null && typeof n === 'object' && '$value' in n;

function deepMerge(t: any, s: any) {
  for (const [k, v] of Object.entries(s)) {
    if (isLeaf(v)) t[k] = v;
    else { t[k] = t[k] ?? {}; deepMerge(t[k], v); }
  }
}
function loadMerged(raw: any[]) {
  const m: any = {};
  for (const col of raw) { const name = Object.keys(col)[0]; deepMerge(m, col[name].modes.value); }
  return m;
}
function lookup(tree: any, path: string): Leaf | undefined {
  let n: any = tree;
  for (const seg of path.split('.')) { if (n == null) return undefined; n = n[seg]; }
  return isLeaf(n) ? n : undefined;
}
function resolveVal(tree: any, leaf: Leaf, seen = new Set<string>()): unknown {
  const v = leaf.$value;
  if (typeof v === 'string') {
    let ref: string | null = null;
    if (v.startsWith('{') && v.endsWith('}')) ref = v.slice(1, -1);
    else if (v.startsWith('$.')) ref = v.slice(2).split('.').slice(2).join('.');
    if (ref) {
      if (seen.has(ref)) return v;
      seen.add(ref);
      const t = lookup(tree, ref);
      return t ? resolveVal(tree, t, seen) : v;
    }
  }
  return v;
}

const camel = (k: string) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const raw = JSON.parse(readFileSync(VARS, 'utf8'));
const tree = loadMerged(raw);

/** A leaf's own $type, or — when it aliases another token — the type of what it resolves
 *  to. `motion/*` aliases inherit TIMING/EASING this way. */
function typeOf(leaf: Leaf, seen = new Set<string>()): string | undefined {
  const v = leaf.$value;
  if (typeof v === 'string') {
    let ref: string | null = null;
    if (v.startsWith('{') && v.endsWith('}')) ref = v.slice(1, -1);
    else if (v.startsWith('$.')) ref = v.slice(2).split('.').slice(2).join('.');
    if (ref && !seen.has(ref)) {
      seen.add(ref);
      const t = lookup(tree, ref);
      if (t) return typeOf(t, seen) ?? leaf.$type;
    }
  }
  return leaf.$type;
}

const cssLines: string[] = [];
const skipped: string[] = [];
const walkCss = (node: any, path: string[]) => {
  if (isLeaf(node)) {
    const name = path.map((s) => s.replace(/[^a-zA-Z0-9]+/g, '-')).join('-'); // valid custom-property name
    let val = toCssValue(resolveVal(tree, node), typeOf(node));
    if (val === null) { skipped.push(name); return; }
    // quote font-family names (they contain spaces/apostrophes -> invalid CSS unquoted)
    if (typeof val === 'string' && path.some((p) => p.includes('family'))) val = `"${val}"`;
    cssLines.push(`  --eand-${name}: ${val};`);
    return;
  }
  for (const [k, v] of Object.entries(node)) walkCss(v, [...path, k]);
};
const walkTs = (node: any): any => {
  if (isLeaf(node)) return toTsValue(resolveVal(tree, node), typeOf(node));
  const out: any = {};
  for (const [k, v] of Object.entries(node)) out[camel(k)] = walkTs(v);
  return out;
};

walkCss(tree, []);
const css = `:root {\n${cssLines.join('\n')}\n}\n`;
const ts = `// AUTO-GENERATED from variables.json by scripts/build-tokens.ts. Do not edit.\n` +
  `export const tokens = ${JSON.stringify(walkTs(tree), null, 2)} as const;\n`;

mkdirSync(OUTDIR, { recursive: true });
writeFileSync(resolve(OUTDIR, 'tokens.css'), css);
writeFileSync(resolve(OUTDIR, 'tokens.ts'), ts);
console.log(`Wrote tokens.css (${cssLines.length} vars) + tokens.ts`);
if (skipped.length) {
  // Not an error — springs and composite Font() tokens have no CSS form. Printed so a
  // sudden jump in the count is visible rather than silent.
  console.log(`Skipped ${skipped.length} token(s) with no CSS representation.`);
}

// Generate src/tokens/{tokens.css, tokens.ts} from the repo's variables.json.
// Resolves both V1.0 `{a.b}` and V1.1 `$.<collection>.value.<path>` alias forms.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const VARS = resolve(here, '../../../variables.json');
const OUTDIR = resolve(here, '../src/tokens');

type Leaf = { $value: unknown };
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

const WEIGHT: Record<string, string> = {
  Thin: '100', Light: '300', Regular: '400', Book: '450', Medium: '500',
  'Semi bold': '600', Bold: '700', Black: '800',
};
const conv = (v: unknown): string | number =>
  typeof v === 'number' ? `${v}px` : (WEIGHT[v as string] ?? (v as string));
const camel = (k: string) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const raw = JSON.parse(readFileSync(VARS, 'utf8'));
const tree = loadMerged(raw);

const cssLines: string[] = [];
const walkCss = (node: any, path: string[]) => {
  if (isLeaf(node)) {
    const resolved = resolveVal(tree, node);
    // skip non-CSS-able values: empty (gradients/placeholders) and composite Font(...) tokens
    if (resolved === '' || resolved == null || (typeof resolved === 'string' && resolved.startsWith('Font('))) return;
    let val: string | number = conv(resolved);
    // quote font-family names (they contain spaces/apostrophes -> invalid CSS unquoted)
    if (typeof val === 'string' && path.some((p) => p.includes('family'))) val = `"${val}"`;
    cssLines.push(`  --eand-${path.join('-')}: ${val};`);
    return;
  }
  for (const [k, v] of Object.entries(node)) walkCss(v, [...path, k]);
};
const walkTs = (node: any): any => {
  if (isLeaf(node)) return conv(resolveVal(tree, node));
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

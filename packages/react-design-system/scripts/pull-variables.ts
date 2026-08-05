/**
 * Regenerates the repo-root `variables.json` from the live Figma file.
 *
 * This replaces the manual "export Variables from the Figma UI" step the audit recorded
 * as a USER ACTION. That step is why the export went stale: it is invisible, easy to skip,
 * and nothing fails when it is skipped — the build just keeps emitting last quarter's
 * tokens. A script can run in CI.
 *
 *   export FIGMA_ACCESS_TOKEN=<read-only PAT>
 *   npm run tokens:pull            # writes ../../variables.json
 *   npm run tokens:pull -- --check # exits 1 if the file is stale, changes nothing
 *   npm run build:tokens           # regenerate tokens.css / tokens.ts
 *
 * Requires a token with `file_variables:read`. That scope is Enterprise-only on Figma's
 * REST API; if this 403s, the shape below is still exactly what the Plugin API returns,
 * so the same JSON can be produced through the Figma MCP `use_figma` tool instead.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const FILE_KEY = process.env.FIGMA_FILE_KEY ?? 'pzm63BTLfPfT1stcF89ILQ'; // e& Consumer App DSL V1.1
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../variables.json');
const CHECK = process.argv.includes('--check');

const token = process.env.FIGMA_ACCESS_TOKEN;
if (!token) {
  console.error('FIGMA_ACCESS_TOKEN is not set. Mint a read-only PAT with file_variables:read.');
  process.exit(1);
}

type RestVariable = {
  name: string;
  variableCollectionId: string;
  resolvedType: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  valuesByMode: Record<string, unknown>;
  description?: string;
  scopes?: string[];
};
type RestCollection = { name: string; modes: { modeId: string; name: string }[]; defaultModeId: string; variableIds: string[] };

const res = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`, {
  headers: { 'X-Figma-Token': token },
});
if (!res.ok) {
  console.error(`Figma API ${res.status}: ${await res.text()}`);
  if (res.status === 403) console.error('403 usually means the plan lacks the Variables REST API (Enterprise-only) or the token lacks file_variables:read.');
  process.exit(1);
}
const { meta } = (await res.json()) as {
  meta: { variables: Record<string, RestVariable>; variableCollections: Record<string, RestCollection> };
};

const hex = (c: { r: number; g: number; b: number; a?: number }) => {
  const h = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return '#' + h(c.r) + h(c.g) + h(c.b) + (c.a != null && c.a < 1 ? h(c.a) : '');
};
// A dot inside a name segment becomes a hyphen, in both nested keys and alias paths:
// `rem/0.125` -> rem > "0-125", referenced as `$.primitives.value.rem.0-125`.
const seg = (s: string) => s.replace(/\./g, '-');

const out: unknown[] = [];
const dangling: string[] = [];

for (const col of Object.values(meta.variableCollections)) {
  const tree: any = {};
  for (const vid of col.variableIds) {
    const v = meta.variables[vid];
    if (!v) continue;
    const parts = v.name.split('/').map(seg);
    let node = tree;
    for (const p of parts.slice(0, -1)) node = node[p] ??= {};

    const raw: any = v.valuesByMode[col.defaultModeId];
    let $value: unknown;
    if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
      const target = meta.variables[raw.id];
      if (target) {
        const tc = meta.variableCollections[target.variableCollectionId];
        $value = `$.${tc.name}.value.${target.name.split('/').map(seg).join('.')}`;
      } else {
        // The target was deleted from its collection but the binding still points at it —
        // e.g. color/green/550. Record it; the value cannot be resolved from this payload.
        dangling.push(v.name);
        $value = null;
      }
    } else if (v.resolvedType === 'COLOR') {
      $value = hex(raw);
    } else {
      $value = raw;
    }

    node[parts[parts.length - 1]] = {
      $type: v.resolvedType,
      $scopes: v.scopes ?? [],
      $description: v.description ?? '',
      $value,
    };
  }
  out.push({ [col.name]: { modes: { value: tree } } });
}

const json = JSON.stringify(out, null, 2) + '\n';
const count = (s: string) => (s.match(/"\$value"/g) ?? []).length;

if (CHECK) {
  const current = readFileSync(OUT, 'utf8');
  if (current === json) { console.log(`✓ variables.json is current (${count(json)} tokens)`); process.exit(0); }
  console.error(`✗ variables.json is stale: ${count(current)} tokens on disk, ${count(json)} live. Run \`npm run tokens:pull\`.`);
  process.exit(1);
}

writeFileSync(OUT, json);
console.log(`Wrote variables.json — ${out.length} collections, ${count(json)} tokens.`);
if (dangling.length) {
  console.log(`\n${dangling.length} dangling alias(es) — the variable they point at was deleted in Figma:`);
  for (const d of dangling) console.log(`  ${d}`);
  console.log('Re-point these in Figma; their $value is null until then.');
}
console.log('\nNext: npm run build:tokens');

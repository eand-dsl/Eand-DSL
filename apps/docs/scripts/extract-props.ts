/** Extracts component prop tables from the design-system source with
 *  react-docgen-typescript → components/preview/props.json (committed). */
import { withCustomConfig } from 'react-docgen-typescript';
import { writeFileSync, mkdirSync, globSync } from 'node:fs';
import path from 'node:path';

const PKG = path.resolve(import.meta.dirname, '../../../packages/react-design-system');

const parser = withCustomConfig(path.join(PKG, 'tsconfig.json'), {
  propFilter: (prop) => !(prop.parent?.fileName.includes('node_modules')),
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
});

const files = globSync('src/components/**/*.tsx', { cwd: PKG })
  .filter((f) => !f.endsWith('.test.tsx'))
  .map((f) => path.join(PKG, f));

type Row = { name: string; type: string; required: boolean; default?: string; description: string };
const out: Record<string, Row[]> = {};

for (const doc of parser.parse(files)) {
  if (!/^[A-Z]/.test(doc.displayName)) continue;
  out[doc.displayName] = Object.values(doc.props).map((p) => ({
    name: p.name,
    type: p.type.name,
    required: p.required,
    default: p.defaultValue?.value != null ? String(p.defaultValue.value) : undefined,
    description: p.description,
  })).sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

const dest = path.resolve(import.meta.dirname, '../components/preview/props.json');
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`props.json: ${Object.keys(out).length} components → ${dest}`);

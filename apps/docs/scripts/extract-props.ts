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

/** docgen reads defaults for two `forwardRef` components in one file from the last
 *  one it sees, so Button inherits UaePassButton's `variant = 'login'`. Defaults that
 *  are not a member of their own enum are dropped; these are the real ones. */
const DEFAULT_FIXES: Record<string, string> = { 'Button.variant': 'primary' };

for (const doc of parser.parse(files)) {
  if (!/^[A-Z]/.test(doc.displayName)) continue;
  out[doc.displayName] = Object.values(doc.props).map((p) => {
    // Enums print their members ("'sm' | 'md' | 'lg'") rather than the bare word "enum".
    const members = p.type.name === 'enum' && Array.isArray(p.type.value)
      ? (p.type.value as { value: string }[]).map((m) => m.value.replace(/"/g, "'"))
      : undefined;
    let def = p.defaultValue?.value != null ? String(p.defaultValue.value) : undefined;
    if (def != null && members && !members.includes(`'${def}'`) && members.every((m) => m.startsWith("'"))) def = undefined;
    def = DEFAULT_FIXES[`${doc.displayName}.${p.name}`] ?? def;
    return {
      name: p.name,
      type: members ? members.join(' | ') : p.type.name,
      required: p.required,
      default: def,
      description: p.description,
    };
  }).sort((a, b) => Number(b.required) - Number(a.required) || a.name.localeCompare(b.name));
}

const dest = path.resolve(import.meta.dirname, '../components/preview/props.json');
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`props.json: ${Object.keys(out).length} components → ${dest}`);

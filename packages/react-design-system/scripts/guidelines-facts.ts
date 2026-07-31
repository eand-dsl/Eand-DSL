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

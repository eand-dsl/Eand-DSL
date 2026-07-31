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

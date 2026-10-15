#!/usr/bin/env node
// Generate src/icons/metadata.ts from the Figma icon description dump.
// Usage: node scripts/build-icon-metadata.mjs [src/icons/descriptions.json]
//   descriptions.json: [{ "name": "bookmark", "description": "Saved items… Also searchable as: banner, flag" }, …]
// The dump is committed (src/icons/descriptions.json) so this can be re-run. Refresh it from
// the e& Consumer App DSL Figma file (icons_2d section, node 31965:64761), in set order.
//
// Raw dump quirks handled here:
//   - Names are slugified (trim, lowercase, spaces/commas collapsed to a
//     single hyphen, repeated hyphens collapsed) to fix trailing-space names
//     (e.g. "qr-code ", "ai-text ", "office ") and comma-separated names
//     (e.g. "cloud off, offline " -> "cloud-off-offline").
//   - V1.1 had duplicate names (add, copy, grid twice) that this script used to
//     suffix as `<name>-2`. V1.2 renamed them (add / add-content, copy / copy-doc,
//     grid), so a duplicate is now an error rather than a silent rename.
//   - Descriptions may contain HTML-escaped entities (e.g. "e&amp;"); these
//     are unescaped (&amp; -> &) before parsing.
//
// Description format: an alias marker appears as either "Searchable as:" or
// "Also searchable as:" (case-insensitive). The alias list is only the text
// from the marker up to the FIRST period (or end of string); anything after
// that period is guidance text (e.g. "Not for X (use Y).") and is kept in
// the description, joined after the pre-marker text. Entries with no marker
// keep the whole text as the description with no aliases.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const rawPath = process.argv[2] ?? new URL('../src/icons/descriptions.json', import.meta.url);
const raw = JSON.parse(readFileSync(rawPath, 'utf8'));

const slugify = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s,]+/g, '-')
    .replace(/-+/g, '-');

const meta = {};
const blank = [];
for (const { name, description } of raw) {
  const key = slugify(name);
  if (key in meta) {
    console.error(`✗ Duplicate icon name in the Figma dump: ${key}`);
    process.exit(1);
  }
  const unescaped = String(description ?? '').replace(/&amp;/g, '&');
  const marker = unescaped.match(/(?:also\s+)?searchable\s+as:/i);
  let desc;
  let aliases;
  if (marker) {
    const head = unescaped.slice(0, marker.index);
    const rest = unescaped.slice(marker.index + marker[0].length);
    const dot = rest.indexOf('.');
    const aliasStr = dot === -1 ? rest : rest.slice(0, dot);
    const tailAfter = dot === -1 ? '' : rest.slice(dot + 1);
    aliases = aliasStr
      .split(',')
      .map((a) => a.trim().toLowerCase().replace(/[.…]+$/, '').trim())
      .filter(Boolean);
    desc = `${head.trim()} ${tailAfter.trim()}`.trim();
  } else {
    desc = unescaped.trim();
    aliases = [];
  }
  if (!desc) blank.push(key);
  meta[key] = { description: desc, aliases };
}

// Validate against the icon set: base names derived from src/raw/*.svg.
const svgBases = new Set(
  readdirSync(new URL('../src/icons/raw', import.meta.url))
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
// Regenerate with: node scripts/build-icon-metadata.mjs. Do not edit.
export interface IconMeta { description: string; aliases: string[] }
export const ICON_META: Record<string, IconMeta> = {
${entries},
};
`;
writeFileSync(new URL('../src/icons/metadata.ts', import.meta.url), out);

console.log(`Wrote ${figmaNames.size} entries to src/icons/metadata.ts`);
if (blank.length) console.warn(`⚠ Blank descriptions (${blank.length}): ${blank.join(', ')}`);
if (missingInFigma.length) console.warn(`⚠ In package but not in Figma dump (${missingInFigma.length}): ${missingInFigma.join(', ')}`);
if (extraInFigma.length) console.warn(`⚠ In Figma dump but not in package (${extraInFigma.length}): ${extraInFigma.join(', ')}`);

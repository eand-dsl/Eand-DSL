#!/usr/bin/env node
// Generate src/metadata.ts from a raw Figma description dump.
// Usage: node tools/build-metadata.mjs <raw-dump.json>
//   raw-dump.json: [{ "name": "bookmark", "description": "Saved items… Also searchable as: banner, flag" }, …]
// Re-run after re-syncing descriptions from the e& Consumer App DSL Figma file
// (icons_2d section, node 31965:64761) — see the docs icons spec.
//
// Raw dump quirks handled here:
//   - Names are slugified (trim, lowercase, spaces/commas collapsed to a
//     single hyphen, repeated hyphens collapsed) to fix trailing-space names
//     (e.g. "qr-code ", "ai-text ", "office ") and comma-separated names
//     (e.g. "cloud off, offline " -> "cloud-off-offline").
//   - The dump contains duplicate names (add, copy, grid each appear twice)
//     for icon variants the package disambiguates as `<name>-2`. The second
//     occurrence of any slugified name is stored under `<name>-2`; a third
//     occurrence would warn and be skipped rather than silently overwriting.
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

const rawPath = process.argv[2];
if (!rawPath) {
  console.error('Usage: node tools/build-metadata.mjs <raw-dump.json>');
  process.exit(1);
}
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
  let key = slugify(name);
  if (key in meta) {
    const dupeKey = `${key}-2`;
    if (dupeKey in meta) {
      console.warn(`⚠ Duplicate name beyond the -2 suffix, skipping: ${key}`);
      continue;
    }
    key = dupeKey;
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

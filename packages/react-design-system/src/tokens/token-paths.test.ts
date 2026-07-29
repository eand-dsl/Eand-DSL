import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { color } from '../system';

/* Every color('…') path used in the library must resolve.
 *
 * `color()` returns the path string when a lookup fails, which is not a valid CSS colour,
 * so browsers drop the whole declaration silently. That is how `border.solid.*` — a group
 * that never existed in Figma — survived across nine call sites: no error, no failing test,
 * just borders that never drew. Typecheck cannot catch it either, since the argument is a
 * plain string. This test is the guard. */

const SRC = resolve(__dirname, '..');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
  });
}

// Only literal, single-quoted paths — template/dynamic lookups can't be checked statically.
const CALL = /\bcolor\('([^']+)'\)/g;
// Comments mention token paths in prose; strip them so documentation isn't scanned as code.
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('every literal color() path in src resolves to a token', () => {
  const unresolved: string[] = [];
  for (const file of walk(SRC)) {
    const text = stripComments(readFileSync(file, 'utf8'));
    for (const [, path] of text.matchAll(CALL)) {
      // color() falls back to returning its argument when the path is missing.
      if (color(path) === path) unresolved.push(`${file.slice(SRC.length + 1)}  color('${path}')`);
    }
  }
  expect(unresolved).toEqual([]);
});

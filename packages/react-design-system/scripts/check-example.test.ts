import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { extractExample } from './check-example';

describe('extractExample', () => {
  it('pulls the body out of a ```tsx example fence', () => {
    const md = ['```tsx example', '<Button />', '```'].join('\n');
    expect(extractExample(md)).toBe('<Button />');
  });

  it('ignores plain tsx fences', () => {
    expect(extractExample('```tsx\n<Button />\n```')).toBeNull();
  });

  it('returns null when there is no example', () => {
    expect(extractExample('nothing here')).toBeNull();
  });

  it('finds the example in the real guidelines', () => {
    const md = readFileSync(resolve(import.meta.dirname, '../MAKE_KIT_GUIDELINES.md'), 'utf8');
    const example = extractExample(md);
    expect(example).toBeTruthy();
    expect(example).toContain('NavBar');
  });
});

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { check, type Problem } from './check-guidelines';
import { collectFacts } from './guidelines-facts';

const facts = collectFacts();
const kinds = (ps: Problem[]) => new Set(ps.map((p) => p.kind));
const details = (ps: Problem[]) => ps.map((p) => p.detail).join('\n');

describe('check', () => {
  it('accepts a document that only makes true claims', () => {
    const md = [
      "```tsx",
      "import { Button, Icon } from '@eand/react-design-system';",
      "```",
      '- `Button({ variant: primary|glass, loading })`',
      '<Icon name="wallet" />',
      '<!-- icons:begin -->',
      facts.iconBaseNames.map((n) => `\`${n}\``).join(' · '),
      '<!-- icons:end -->',
      facts.exportedComponents.map((c) => `\`${c}\``).join(' '),
    ].join('\n');
    expect(check(md, facts)).toEqual([]);
  });

  it('flags an import from a package that is not published', () => {
    const ps = check("import { Icon } from '@eand/icons';", facts);
    expect(kinds(ps)).toContain('phantom-package');
    expect(details(ps)).toContain('@eand/icons');
  });

  it('flags an icon name that is not in the registry', () => {
    const ps = check('<Icon name="mshop" />', facts);
    expect(ps.some((p) => p.kind === 'phantom-icon' && p.detail.includes('mshop'))).toBe(true);
  });

  it('flags a prop the component does not have', () => {
    const ps = check('`Button({ nonexistentProp })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-prop' && p.detail.includes('Button.nonexistentProp'))).toBe(true);
  });

  it('flags a union value the prop does not accept', () => {
    const ps = check('`Button({ variant: primary|bogus })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-value' && p.detail.includes('bogus'))).toBe(true);
  });

  it('flags a component that is documented but not exported', () => {
    const ps = check('`MadeUpWidget({ title })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-component' && p.detail.includes('MadeUpWidget'))).toBe(true);
  });

  it('does not flag Icon, which is public but lives outside src/components', () => {
    const ps = check('`Icon({ name, size, color })`', facts);
    expect(ps.some((p) => p.kind === 'phantom-component')).toBe(false);
  });

  it('flags an exported component that is never documented', () => {
    const ps = check('nothing here', facts);
    expect(ps.some((p) => p.kind === 'undocumented-component' && p.detail.includes('Picker'))).toBe(true);
  });

  it('flags base icons missing from the inventory block', () => {
    const ps = check('<!-- icons:begin -->\n`home`\n<!-- icons:end -->', facts);
    expect(ps.some((p) => p.kind === 'unlisted-icon' && p.detail.includes('wallet'))).toBe(true);
  });
});

describe('the guidelines as they stood before the rewrite', () => {
  // Acceptance criterion 2: the checker must detect the drift that actually happened.
  // Reads the frozen fixture, so this keeps proving itself after Task 4 and after merge.
  const original = readFileSync(
    resolve(import.meta.dirname, '__fixtures__/guidelines-original.md'),
    'utf8',
  );
  const problems = check(original, facts);

  it('fails', () => {
    expect(problems.length).toBeGreaterThan(0);
  });

  it('names the phantom @eand/icons package', () => {
    expect(problems.some((p) => p.kind === 'phantom-package' && p.detail.includes('@eand/icons'))).toBe(true);
  });

  // Deviation from the task-3 brief, documented in task-3-report.md: the guidelines'
  // "Available names" sentence (line 20-23 of the fixture) lists all 8 phantom icons as
  // plain prose backticks, but that sentence sits outside any `<!-- icons:begin/end -->`
  // block and none of those 8 tags are wrapped in `<Icon name="..." />`. parseClaims (frozen,
  // Task 2) only harvests icon names from Icon-usage JSX and from inside the inventory block
  // — see guidelines-claims.test.ts's "collects icon names from usages and from the inventory
  // block", which asserts backtick text outside the block is deliberately ignored to avoid
  // false positives on arbitrary code-styled prose. Of the 8, only profile/mshop/mobile/truck
  // also appear as `<Icon name="…" />` usages elsewhere in the doc, so only those 4 become
  // checkable claims from this document; sparkle/subscriptions/plus/shield are real phantoms
  // too, but this document's prose-only mention of them is invisible to parseClaims by design.
  it('names the phantom icons that also appear as <Icon name="…" /> usages', () => {
    const flagged = problems.filter((p) => p.kind === 'phantom-icon').map((p) => p.detail).join('\n');
    for (const name of ['profile', 'mshop', 'mobile', 'truck']) {
      expect(flagged).toContain(`'${name}'`);
    }
  });

  it('names undocumented components', () => {
    const flagged = problems.filter((p) => p.kind === 'undocumented-component').map((p) => p.detail).join('\n');
    for (const name of ['Picker', 'OtpInput', 'ButtonGroup', 'StatusRibbon', 'CtaFooter']) {
      expect(flagged).toContain(`'${name}'`);
    }
  });
});

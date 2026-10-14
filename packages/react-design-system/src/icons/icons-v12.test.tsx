import { render, screen } from '@testing-library/react';
import descriptions from './descriptions.json';
import { Icon, ICONS, ICON_ALIASES } from './icons';
import { ICON_META } from './metadata';

/* Figma DSL V1.2 icons_2d (31965:64761): 198 sets, `filled` false|true. V1.2 gave the V1.1
   duplicates real names — the bare plus is `add`, the circled plus `add-content`, `copy-doc`
   and a symmetric `grid` — added `dot`, and the code's chevron-right files had outline and
   filled swapped. */

const figmaNames = (descriptions as { name: string }[])
  .map((d) => d.name.trim().toLowerCase().replace(/[\s,]+/g, '-').replace(/-+/g, '-'));

test('the icon set is exactly Figma V1.2: 198 names, each with a filled variant', () => {
  const bases = Object.keys(ICONS).filter((n) => !n.endsWith('-filled'));
  expect(bases.sort()).toEqual([...figmaNames].sort());
  for (const b of bases) expect(ICONS).toHaveProperty(`${b}-filled`);
  expect(Object.keys(ICON_META).sort()).toEqual([...figmaNames].sort());
});

test('add is the bare plus and add-content the circled plus, as V1.2 names them', () => {
  expect(ICON_META.add.description).toMatch(/bare plus/);
  expect(ICON_META['add-content'].aliases).toContain('plus');
});

test('dot exists (Status Indicator uses it)', () => {
  render(<Icon name="dot" />);
  expect(screen.getByRole('img', { name: 'dot' }).querySelector('svg')).not.toBeNull();
});

test('chevron-right outline is the thin stroke glyph, filled the bold one', () => {
  const { container: thin } = render(<Icon name="chevron-right" />);
  expect(thin.innerHTML).toContain('M8.46967 3.46967');
  const { container: bold } = render(<Icon name="chevron-right-filled" />);
  expect(bold.innerHTML).toContain('M7.93934 2.93962');
});

test.each(Object.entries(ICON_ALIASES))('deprecated V1.1 name %s still renders, as %s', (old, now) => {
  const { container: a } = render(<Icon name={old} />);
  const { container: b } = render(<Icon name={now} />);
  expect(a.querySelector('svg')!.innerHTML).toBe(b.querySelector('svg')!.innerHTML);
});

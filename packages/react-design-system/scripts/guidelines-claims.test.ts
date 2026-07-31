import { describe, it, expect } from 'vitest';
import { parseClaims } from './guidelines-claims';

describe('parseClaims', () => {
  it('collects import specifiers', () => {
    const md = "```tsx\nimport { Button } from '@eand/react-design-system';\nimport { Icon } from '@eand/icons';\n```";
    expect(parseClaims(md).imports).toEqual(['@eand/react-design-system', '@eand/icons']);
  });

  it('reads a signature with a literal union', () => {
    const md = '- `Button({ variant: primary|secondary, block })`';
    expect(parseClaims(md).components.Button).toEqual({
      variant: ['primary', 'secondary'],
      block: [],
    });
  });

  it('does not treat a type annotation as a value claim', () => {
    const md = '- `Card({ title: ReactNode, media })`';
    expect(parseClaims(md).components.Card).toEqual({ title: [], media: [] });
  });

  it('handles nested braces and brackets in a parameter', () => {
    const md = '- `QuickAction({ items: {label, icon, badge?, onClick}[], columns })`';
    expect(Object.keys(parseClaims(md).components.QuickAction).sort()).toEqual(['columns', 'items']);
  });

  it('merges props when a component is documented twice', () => {
    const md = '`Chip({ selected })` and later `Chip({ type: outline|filled })`';
    expect(parseClaims(md).components.Chip).toEqual({ selected: [], type: ['outline', 'filled'] });
  });

  it('collects icon names from usages and from the inventory block', () => {
    const md = [
      '<Icon name="wallet" />',
      '<!-- icons:begin -->',
      '`home` · `search`',
      '<!-- icons:end -->',
      '`not-an-icon-outside-the-block`',
    ].join('\n');
    expect(parseClaims(md).iconNames).toEqual(['home', 'search', 'wallet']);
  });

  it('returns empty structures for empty input', () => {
    expect(parseClaims('')).toEqual({ imports: [], components: {}, iconNames: [] });
  });
});

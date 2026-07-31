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

  // Regression: fix round 1, Finding 1 — LITERAL_UNION rejected quoted string-literal unions,
  // so a prop documented with quoted values (e.g. Text's variant) was silently recorded as [].
  it('accepts a quoted string literal union and strips the quotes', () => {
    const md = '- `Text({ variant: "body.md"|"title.sm"|"heading.lg", as, color })`';
    expect(parseClaims(md).components.Text.variant).toEqual(['body.md', 'title.sm', 'heading.lg']);
  });

  it('accepts a union mixing quoted and bare identifiers', () => {
    const md = '- `Foo({ kind: primary|"custom-value" })`';
    expect(parseClaims(md).components.Foo.kind).toEqual(['primary', 'custom-value']);
  });

  // Regression: fix round 1, Finding 2 — a union of bare TS primitive/builtin type names
  // (e.g. `string|number`) satisfied the old literal-union grammar and was wrongly captured
  // as a value claim, producing a false positive in the Task 3 checker.
  it('treats a union of primitive type names as a type annotation, not a value claim', () => {
    const md = '- `Field({ value: string|number, label })`';
    expect(parseClaims(md).components.Field).toEqual({ value: [], label: [] });
  });

  // Regression: fix round 1, Finding 3 — `<Icon name="..." />` used as an explanatory-prose
  // placeholder was captured as a literal icon name because the usage regex accepted any
  // non-quote characters. Only kebab-case names are real icon names.
  it('ignores a non-kebab-case Icon name placeholder like an ellipsis', () => {
    const md = [
      "Render `<Icon name=\"...\" />` and pass it into a component's slot.",
      '<Icon name="wallet" />',
    ].join('\n');
    expect(parseClaims(md).iconNames).toEqual(['wallet']);
  });
});

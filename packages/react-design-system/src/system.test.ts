import { describe, expect, it } from 'vitest';
import { ty } from './system';

describe('ty() font stack', () => {
  // The family token is literally `Suisse int'l`. Interpolated raw into a font stack it
  // produces `font-family:Suisse int'l, …` — and because the components style themselves
  // inline, that apostrophe opens a CSS string the browser never sees closed. Every
  // declaration after font-family in the same style attribute gets swallowed, so buttons
  // lost their background, colour and border and rendered as bare text. 28 of the 44
  // renderable components were affected. The family must stay quoted.
  it('quotes a family name containing an apostrophe', () => {
    const family = ty('body.md').fontFamily!;
    expect(family).toContain(`"Suisse int'l"`);
    expect(family).not.toMatch(/(^|,\s*)Suisse int'l/);
  });

  it('leaves no unbalanced quote for the CSS parser to choke on', () => {
    const family = ty('body.md').fontFamily!;
    // An even count of `"` means every string the parser opens is closed again.
    expect((family.match(/"/g) ?? []).length % 2).toBe(0);
  });

  it('keeps the fallback stack after the quoted family', () => {
    expect(ty('body.md').fontFamily).toBe(`"Suisse int'l", -apple-system, system-ui, sans-serif`);
  });

  it('returns undefined when the variant has no family', () => {
    expect(ty('nope.nope').fontFamily).toBeUndefined();
  });
});

/* The RTL sweep (7007200) wrapped directional glyphs in `<span data-rtl-flip>` "for CSS
   mirror", but no CSS rule was ever written, so no chevron mirrored in Arabic. Components
   are inline-styled and must work without a stylesheet import, so system.ts injects it. */
describe('data-rtl-flip', () => {
  it('injects one mirror rule into the document head', async () => {
    await import('./system');
    const tags = document.head.querySelectorAll('style#eand-rtl-flip');
    expect(tags).toHaveLength(1);
    expect(tags[0].textContent).toContain('[data-rtl-flip]');
    expect(tags[0].textContent).toContain('scaleX(-1)');
  });
});

describe('ty() follows the published text styles', () => {
  it('heading.lg is the V1.2 style (24px / 1.1), not the stale variable (28px)', () => {
    expect(ty('heading.lg')).toMatchObject({ fontSize: '24px', lineHeight: '1.1' });
  });
  it('knows the new heading/2xl', () => {
    expect(ty('heading.2xl').fontSize).toBe('32px');
  });
  it('still quotes the family', () => {
    expect(ty('heading.lg').fontFamily).toBe(`"Suisse int'l", -apple-system, system-ui, sans-serif`);
  });
});

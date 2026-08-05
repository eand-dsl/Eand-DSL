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

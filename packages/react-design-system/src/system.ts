// Shared helpers for token-driven inline styling.
import type { CSSProperties } from 'react';
import { tokens } from './tokens/tokens';

export const T = tokens as any;

/** Typography style from a `category.size` variant, e.g. "body.md", "heading.lg". */
export const ty = (variant: string): CSSProperties => {
  const [c, s] = variant.split('.');
  // Published text styles first (what Figma symbols apply); the typography variables only
  // where no style exists. In V1.2 they disagree for headings — see tokens.test.ts.
  const t = (T.textStyle?.[c]?.[s] ?? T.typography?.[c]?.[s] ?? {}) as Record<string, string>;
  return {
    // The family must be quoted. The token is `Suisse int'l`, and these components style
    // themselves inline — unquoted, that apostrophe opens a CSS string the parser never
    // sees closed, so every declaration after font-family in the same style attribute is
    // silently discarded (background, colour, border…). See system.test.ts.
    fontFamily: t.fontFamily ? `"${t.fontFamily}", -apple-system, system-ui, sans-serif` : undefined,
    fontSize: t.fontSize,
    fontWeight: t.fontWeight as any,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
  };
};

export const space = (k: string): string => T.spacing?.[k] ?? k;
export const radius = (k: string): string => T['borderRadius']?.[k] ?? k;
export const icon = (k: string): string => T.icon?.[k] ?? k;
/** Raw size step from the Figma `scale/*` collection, e.g. scale("24") -> "24px". */
export const scale = (k: string): string => T.scale?.[k] ?? k;
/** Card/section row height from Figma `section/body/height/*`, e.g. rowHeight("row-2") -> "148px".
 *  Card box heights bind to these rows in Figma, not to raw `scale/*` steps. */
export const rowHeight = (k: string): string => T.section?.body?.height?.[k] ?? k;

/* `color()` returns its argument when a path does not resolve, which yields invalid CSS
 * that browsers drop silently — no error, no failing test, just a property that never
 * applies. A fabricated `border.solid.*` group survived nine call sites that way, so those
 * borders never drew. `src/tokens/token-paths.test.ts` now asserts every literal color()
 * path in src resolves; keep that green rather than relying on review to spot it. */
const camelKey = (k: string) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
/** Deep-get a token color by dot path, e.g. color("surface.base.brand"). Keys in the
 *  generated theme are camelCased, so kebab segments (floating-inverse) are converted. */
export const color = (path: string): string =>
  path.split('.').reduce((o: any, k) => (o == null ? o : o[camelKey(k)]), T.color) ?? path;

export const PILL = '9999px';

/* Mirror directional glyphs in RTL. Components wrap chevrons and arrows in
   `<span data-rtl-flip>`; this is the rule that flips them. The library is inline-styled
   and promises to work without importing a stylesheet, so the rule is injected once here
   rather than shipped only in styles.css. `:dir(rtl)` follows the nearest `dir` ancestor
   (including `dir="auto"`); the attribute selector covers engines without :dir(). */
// Only :dir() resolves the *nearest* direction — an LTR island inside an RTL page, or an
// RTL demo inside the docs' <html dir="ltr">. Attribute selectors can't, so they are only
// the fallback for engines without :dir(), and only in the RTL direction.
const RTL_FLIP_CSS =
  '@supports not selector(:dir(rtl)){[dir="rtl"] [data-rtl-flip]{transform:scaleX(-1)}}' +
  '[data-rtl-flip]:dir(rtl){transform:scaleX(-1)}';
if (typeof document !== 'undefined' && !document.getElementById('eand-rtl-flip')) {
  const el = document.createElement('style');
  el.id = 'eand-rtl-flip';
  el.textContent = RTL_FLIP_CSS;
  document.head.appendChild(el);
}

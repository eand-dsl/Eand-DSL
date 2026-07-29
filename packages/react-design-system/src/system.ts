// Shared helpers for token-driven inline styling.
import type { CSSProperties } from 'react';
import { tokens } from './tokens/tokens';

export const T = tokens as any;

/** Typography style from a `category.size` variant, e.g. "body.md", "heading.lg". */
export const ty = (variant: string): CSSProperties => {
  const [c, s] = variant.split('.');
  const t = (T.typography?.[c]?.[s] ?? {}) as Record<string, string>;
  return {
    fontFamily: t.fontFamily ? `${t.fontFamily}, -apple-system, system-ui, sans-serif` : undefined,
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

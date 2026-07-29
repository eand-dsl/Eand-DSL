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

/* KNOWN BROKEN TOKEN PATHS — `color()` falls back to returning the path string when a
 * path does not resolve, which yields invalid CSS that browsers drop silently. These
 * borders have therefore never rendered:
 *
 *   color('border.solid.subtle' | '.default' | '.strong')   — 8 call sites
 *   color('border.default')                                 — 1 call site (primitives.tsx)
 *
 * There is no `border/solid` group in Figma (`variables.json` has zero matches); the real
 * groups are `color/border/surface-based/*` (e.g. base.default #d8d7de) and
 * `color/border/interactive/*` (e.g. default.subtle rgba(25,19,41,0.10)). Picking between
 * them is a design-semantics decision, so the paths are left as-is pending that call
 * rather than guessed at. See tools/audit/v1.1/component-map.json. */
const camelKey = (k: string) => k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
/** Deep-get a token color by dot path, e.g. color("surface.base.brand"). Keys in the
 *  generated theme are camelCased, so kebab segments (floating-inverse) are converted. */
export const color = (path: string): string =>
  path.split('.').reduce((o: any, k) => (o == null ? o : o[camelKey(k)]), T.color) ?? path;

export const PILL = '9999px';

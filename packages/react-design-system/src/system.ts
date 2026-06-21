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

/** Deep-get a token color by dot path, e.g. color("surface.base.brand"). */
export const color = (path: string): string =>
  path.split('.').reduce((o: any, k) => (o == null ? o : o[k]), T.color) ?? path;

export const PILL = '9999px';

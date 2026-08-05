// Value conversion for the token build. Split out of build-tokens.ts so it can be tested
// without the script's read/write side effects firing on import.

export const WEIGHT: Record<string, string> = {
  Thin: '100', Light: '300', Regular: '400', Book: '450', Medium: '500',
  'Semi bold': '600', Bold: '700', Black: '800',
};

/** Figma emits float noise (0.30000001192092896); 4dp is past any visible difference. */
const tidy = (n: number): string => String(Number(n.toFixed(4)));

export type EasingValue = {
  type: 'CUSTOM_CUBIC_BEZIER' | 'CUSTOM_SPRING' | string;
  easingFunctionCubicBezier?: { x1: number; y1: number; x2: number; y2: number };
  easingFunctionSpring?: { bounce: number };
};

const isEasing = (v: unknown): v is EasingValue =>
  typeof v === 'object' && v !== null && 'type' in (v as any);

/**
 * CSS custom-property value, or `null` when the token has no CSS representation and must
 * be skipped rather than stringified.
 *
 * `type` comes from the token's `$type`. Without it every number became `${n}px`, which is
 * right for lengths and wrong for a duration — and an EASING object stringified to
 * `[object Object]`, invalid CSS that browsers drop in silence.
 */
export function toCssValue(v: unknown, type?: string): string | number | null {
  if (v === '' || v == null) return null;
  if (typeof v === 'string' && v.startsWith('Font(')) return null;  // composite font token

  if (type === 'TIMING' && typeof v === 'number') return `${tidy(v * 1000)}ms`;

  if (type === 'EASING' && isEasing(v)) {
    const b = v.easingFunctionCubicBezier;
    if (v.type === 'CUSTOM_CUBIC_BEZIER' && b) {
      return `cubic-bezier(${[b.x1, b.y1, b.x2, b.y2].map(tidy).join(', ')})`;
    }
    // Springs have no CSS equivalent — `linear()` could approximate one, but a sampled
    // approximation is a different curve wearing the token's name. Skip it in CSS; the
    // bounce value still reaches consumers through tokens.ts.
    return null;
  }

  // An unrecognised object would stringify to "[object Object]" — drop it instead.
  if (typeof v === 'object') return null;

  return typeof v === 'number' ? `${v}px` : (WEIGHT[v as string] ?? (v as string));
}

/** Value for the generated `tokens.ts`. Springs survive here as structured data. */
export function toTsValue(v: unknown, type?: string): unknown {
  if (type === 'TIMING' && typeof v === 'number') return `${tidy(v * 1000)}ms`;
  if (type === 'EASING' && isEasing(v)) {
    const b = v.easingFunctionCubicBezier;
    if (v.type === 'CUSTOM_CUBIC_BEZIER' && b) {
      return `cubic-bezier(${[b.x1, b.y1, b.x2, b.y2].map(tidy).join(', ')})`;
    }
    const s = v.easingFunctionSpring;
    return s ? { spring: { bounce: Number(s.bounce.toFixed(4)) } } : undefined;
  }
  if (typeof v === 'object' && v !== null) return undefined;
  return typeof v === 'number' ? `${v}px` : (WEIGHT[v as string] ?? (v as string));
}

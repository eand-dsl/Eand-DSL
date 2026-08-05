import { describe, expect, it } from 'vitest';
import { toCssValue, toTsValue } from './token-convert';

/* The live Figma file carries motion/* tokens the repo's variables.json predates. They
   introduce two types the build had never seen — TIMING and EASING — and EASING values
   are objects. Without type-aware conversion a duration became "0.15px" and an easing
   curve became "[object Object]": invalid CSS that browsers drop without erroring, the
   same silent-failure class as the fabricated border.solid.* paths. */

describe('lengths and strings (existing behaviour, must not shift)', () => {
  it('renders plain numbers as px', () => {
    expect(toCssValue(16, 'FLOAT')).toBe('16px');
    expect(toCssValue(-0.35, 'FLOAT')).toBe('-0.35px');
  });
  it('maps Figma weight names to numeric weights', () => {
    expect(toCssValue('Semi bold', 'STRING')).toBe('600');
    expect(toCssValue('Book', 'STRING')).toBe('450');
  });
  it('passes colours and percentages through untouched', () => {
    expect(toCssValue('#54bc72', 'COLOR')).toBe('#54bc72');
    expect(toCssValue('120%', 'STRING')).toBe('120%');
  });
  it('skips empties and composite Font() tokens', () => {
    expect(toCssValue('', 'STRING')).toBeNull();
    expect(toCssValue(null, 'COLOR')).toBeNull();
    expect(toCssValue('Font(Suisse)', 'STRING')).toBeNull();
  });
});

describe('TIMING', () => {
  it('converts seconds to milliseconds rather than px', () => {
    expect(toCssValue(0.15, 'TIMING')).toBe('150ms');
    expect(toCssValue(0, 'TIMING')).toBe('0ms');
    expect(toCssValue(0.4, 'TIMING')).toBe('400ms');
  });
  it('does not leave float noise in the output', () => {
    // Figma returns 0.30000001192092896 for the 300ms step.
    expect(toCssValue(0.30000001192092896, 'TIMING')).toBe('300ms');
  });
});

describe('EASING', () => {
  const bezier = {
    type: 'CUSTOM_CUBIC_BEZIER',
    easingFunctionCubicBezier: { x1: 0.33000001311302185, y1: 1, x2: 0.6800000071525574, y2: 1 },
  };
  const spring = { type: 'CUSTOM_SPRING', easingFunctionSpring: { bounce: 0.25 } };

  it('renders a cubic-bezier curve, noise rounded off', () => {
    expect(toCssValue(bezier, 'EASING')).toBe('cubic-bezier(0.33, 1, 0.68, 1)');
  });

  it('skips springs in CSS instead of emitting a wrong curve', () => {
    // CSS has no spring. linear() could approximate one, but a sampled approximation is a
    // different curve wearing the token's name.
    expect(toCssValue(spring, 'EASING')).toBeNull();
  });

  it('keeps the spring bounce in tokens.ts where it can be used', () => {
    expect(toTsValue(spring, 'EASING')).toEqual({ spring: { bounce: 0.25 } });
  });

  it('never lets an object reach CSS as [object Object]', () => {
    for (const v of [bezier, spring, { type: 'SOMETHING_NEW' }, { a: 1 }]) {
      const out = toCssValue(v, 'EASING');
      expect(String(out)).not.toContain('[object Object]');
    }
    expect(toCssValue({ a: 1 }, 'FLOAT')).toBeNull();
  });
});

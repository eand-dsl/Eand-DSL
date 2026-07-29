import { render } from '@testing-library/react';
import { ProductCard, PlanCard, DealCard, ServiceCard, Highlight } from './cards';

const root = (c: HTMLElement) => c.firstElementChild as HTMLElement;

/* ---------------- ProductCard tint -> .card-bg-color (Figma 25710:20065) ---------------- */

test.each([
  ['default', 'rgb(228, 227, 234)'],
  ['orange', 'rgb(252, 243, 235)'],
  ['cyan', 'rgb(235, 247, 252)'],   // binds atom-surfaces/blue
  ['blue', 'rgb(235, 235, 252)'],   // binds atom-surfaces/purple
] as const)('ProductCard tint=%s resolves to the card-bg-color fill %s', (tint, bg) => {
  const { container } = render(<ProductCard tint={tint} />);
  expect(root(container).style.background).toBe(bg);
});

test('ProductCard still accepts a raw CSS colour for tint', () => {
  const { container } = render(<ProductCard tint="#123456" />);
  expect(root(container).style.background).toBe('rgb(18, 52, 86)');
});

test('ProductCard with no tint falls back to the raised surface', () => {
  const { container } = render(<ProductCard />);
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
});

/* ---------------- Card geometry pinned to Figma tokens ---------------- */

test.each([
  ['PlanCard', <PlanCard />, '16px', '300px'],       // plans-mini 26003:40647, row-4
  ['DealCard', <DealCard />, '16px', '224px'],       // deals-card 25973:22611, row-3
  ['ServiceCard', <ServiceCard label="l" />, '20px', '148px'], // 26592:14455, row-2
  ['Highlight', <Highlight />, '24px', '452px'],     // highlight-banner 28382:19131, row-6
] as const)('%s radius/minHeight match Figma', (_name, el, r, h) => {
  const { container } = render(el);
  expect(root(container).style.borderRadius).toBe(r);
  expect(root(container).style.minHeight).toBe(h);
});

test('ProductCard uses radius 20 and drops the resting border', () => {
  const { container } = render(<ProductCard />);
  const el = root(container);
  expect(el.style.borderRadius).toBe('20px');
  expect(el.style.border).toBe('');
});

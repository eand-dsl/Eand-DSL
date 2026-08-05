import { render, screen } from '@testing-library/react';
import { ProductCard, PlanCard, DealCard, NewCard, ServiceCard, Highlight } from './cards';

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

/* ---------------- Card variant axes (Figma) ---------------- */

/* PlanCard: plans-mini 26003:40647 color-scheme = default | inverse */
test.each([
  ['default', 'rgb(255, 255, 255)'],   // 26003:40646 surface/base/inverse (stale alias -> opaque)
  ['inverse', 'rgb(25, 19, 41)'],      // 26003:40648 surface/base/midnight
] as const)('PlanCard colorScheme=%s fills with %s', (colorScheme, bg) => {
  const { container } = render(<PlanCard colorScheme={colorScheme} />);
  expect(root(container).style.background).toBe(bg);
});

test('PlanCard deprecated variant=midnight equals colorScheme=inverse', () => {
  const { container: a } = render(<PlanCard variant="midnight" />);
  const { container: b } = render(<PlanCard colorScheme="inverse" />);
  expect(root(a).style.background).toBe(root(b).style.background);
});

test('PlanCard colorScheme wins over variant, and width is the Figma 222', () => {
  const { container } = render(<PlanCard colorScheme="default" variant="midnight" />);
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
  expect(root(container).style.width).toBe('222px');
});

/* ServiceCard: service-card-sizes 27216:41370 grid 109 / carousel 128, both h148 */
test.each([
  ['grid', '109px'],
  ['carousel', '128px'],
] as const)('ServiceCard size=%s is %s wide at h148', (size, w) => {
  const { container } = render(<ServiceCard label="l" size={size} />);
  expect(root(container).style.width).toBe(w);
  expect(root(container).style.minHeight).toBe('148px');
});

test('ServiceCard with no size fills its grid track', () => {
  const { container } = render(<ServiceCard label="l" />);
  expect(root(container).style.width).toBe('');
});

/* NewCard: new-on 26523:22852 selected = yes | no */
test('NewCard selected draws the 2px ring and the New-card badge', () => {
  const { container } = render(<NewCard selected />);
  // The ring is on the picture frame — the tile itself has no border in V1.1.
  const el = container.querySelector<HTMLElement>('[data-part="frame"]')!;
  expect(el.style.border).toContain('2px');
  expect(el.style.backgroundImage).toContain('#47cb6c');
  expect(screen.getByText('New card')).toBeInTheDocument();
});

test('NewCard unselected has no ring or badge, and binds row-3', () => {
  const { container } = render(<NewCard />);
  // The ring lives on the picture frame now, not the tile.
  expect(container.querySelector<HTMLElement>('[data-part="frame"]')!.style.backgroundImage).toBe('');
  // Figma sets a fixed h-[section/body/height/row-3], not a minimum.
  expect(root(container).style.height).toBe('224px');
  expect(screen.queryByText('New card')).not.toBeInTheDocument();
});

/* ProductCard: three card-features siblings, all row-4 = 300 */
test.each(['addon', 'product', 'category'] as const)('ProductCard type=%s is row-4 tall', (type) => {
  const { container } = render(<ProductCard type={type} />);
  expect(root(container).getAttribute('data-card-type')).toBe(type);
  expect(root(container).style.minHeight).toBe('300px');
});

test('ProductCard infers its type from image for pre-`type` callers', () => {
  const { container: withImg } = render(<ProductCard image={<i>i</i>} />);
  const { container: without } = render(<ProductCard />);
  expect(root(withImg).getAttribute('data-card-type')).toBe('product');
  expect(root(without).getAttribute('data-card-type')).toBe('addon');
});

test('ProductCard type=category tints the whole card', () => {
  const { container } = render(<ProductCard type="category" />);
  expect(root(container).style.background).toBe('rgb(252, 243, 235)'); // atom-surfaces/orange
});

/* ---------------- NewCard vs Figma `new-on` 26523:22852 ----------------
   The V1.1 tile is a *story*, not a boxed card: no card surface, no card radius. The
   picture frame carries border-radius/7 (24) with 4px padding, its inner container
   border-radius/6 (20), and the caption is centered body/md — not a left-aligned title. */

test('NewCard has no card surface or card border', () => {
  const { container } = render(<NewCard title="Discover Smart Home Add-ons" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe('');
  expect(root.style.border).toBe('');
});

test('NewCard picture frame is radius 24 with a 4px inset, inner radius 20', () => {
  const { container } = render(<NewCard title="T" />);
  const frame = container.querySelector<HTMLElement>('[data-part="frame"]')!;
  expect(frame.style.borderRadius).toBe('24px');
  expect(frame.style.padding).toBe('4px');
  expect((frame.firstElementChild as HTMLElement).style.borderRadius).toBe('20px');
});

test('NewCard caption is centered body/md, not a left-aligned title', () => {
  render(<NewCard title="Discover Smart Home Add-ons" />);
  const cap = screen.getByText('Discover Smart Home Add-ons');
  expect(cap.style.textAlign).toBe('center');
  expect(cap.style.fontSize).toBe('14px');
});

test('NewCard shows the New-card badge only when selected', () => {
  const { rerender } = render(<NewCard title="T" />);
  expect(screen.queryByText('New card')).not.toBeInTheDocument();
  rerender(<NewCard title="T" selected />);
  expect(screen.getByText('New card')).toBeInTheDocument();
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusIcon, PageTitle, PageHeader } from './layout';

/* ---------------- StatusIcon (Figma V1.2 40283:145559) ----------------
   56px tile, border-radius/7 (20px), a 40px icon box holding a 32px filled glyph.
   Surface and glyph bind status-icon/{surface,icon}/<type>. */

test.each([
  ['positive', 'rgb(193, 247, 208)', 'rgb(39, 99, 59)', 'check-circle-filled'],
  ['danger', 'rgb(255, 209, 168)', 'rgb(140, 63, 12)', 'dismiss-filled'],
  ['warning', 'rgb(255, 236, 171)', 'rgb(128, 109, 44)', 'warning-filled'],
  ['brand', 'rgb(249, 206, 204)', 'rgb(227, 33, 26)', 'wallet-filled'],
  ['neutral', 'rgb(216, 215, 222)', 'rgb(25, 19, 41)', 'wallet-filled'],
] as const)('StatusIcon type=%s binds its surface and glyph tokens', (type, bg, fg, glyph) => {
  const { container } = render(<StatusIcon type={type} />);
  const tile = container.firstElementChild as HTMLElement;
  expect(tile.style.background).toBe(bg);
  expect(tile.style.width).toBe('56px');
  expect(tile.style.height).toBe('56px');
  expect(tile.style.borderRadius).toBe('20px');
  const img = screen.getByRole('img', { name: glyph });
  expect(img.style.color).toBe(fg);
  expect(img.querySelector('svg')!.getAttribute('width')).toBe('32');
});

test('StatusIcon accepts a different glyph from the icon set', () => {
  render(<StatusIcon type="brand" icon="gift" />);
  expect(screen.getByRole('img', { name: 'gift' })).toBeInTheDocument();
});

/* ---------------- PageTitle (Figma V1.2 40283:145186) ----------------
   A conclusion block: status icon (lg/md only), a bold title clamped to two lines,
   an optional body/md description. The title sizes are bound per variant to
   font/size/7·6·5 and heading/xs — NOT to the heading/<size> text styles, which are a
   step larger (heading/lg is 28px; page-title lg is 24px). Line height 110% except xs. */

test.each([
  ['lg', '24px', '1.1', true],
  ['md', '20px', '1.1', true],
  ['sm', '18px', '1.1', false],
  ['xs', '16px', '1.2', false],
] as const)('PageTitle type=%s sets a %s title and icon=%s', (type, size, lh, hasIcon) => {
  render(<PageTitle type={type} title="Payment successful" description="Receipt sent." />);
  const title = screen.getByRole('heading', { name: 'Payment successful' });
  expect(title.style.fontSize).toBe(size);
  expect(title.style.lineHeight).toBe(lh);
  expect(title.style.fontWeight).toBe('700');
  expect(screen.queryByRole('img', { name: 'check-circle-filled' }) !== null).toBe(hasIcon);
});

test('PageTitle clamps the title to two lines and colours both texts text/default/default', () => {
  render(<PageTitle title="T" description="D" />);
  const title = screen.getByRole('heading', { name: 'T' });
  expect(title.style.webkitLineClamp).toBe('2');
  expect(title.style.color).toBe('rgb(25, 19, 41)');
  const desc = screen.getByText('D');
  expect(desc.style.color).toBe('rgb(25, 19, 41)');
  expect(desc.style.fontSize).toBe('14px');
  expect(desc.style.lineHeight).toBe('1.4');
});

test('PageTitle is centred by default and starts-aligned with alignment=left', () => {
  const { container, rerender } = render(<PageTitle title="T" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.alignItems).toBe('center');
  expect(screen.getByRole('heading').style.textAlign).toBe('center');
  rerender(<PageTitle title="T" alignment="left" />);
  expect(root.style.alignItems).toBe('flex-start');
  expect(screen.getByRole('heading').style.textAlign).toBe('start');
});

test('PageTitle metrics: gap spacing/md, inner gap spacing/xs, bottom padding spacing/xl', () => {
  const { container } = render(<PageTitle title="T" description="D" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.gap).toBe('12px');
  expect(root.style.paddingBottom).toBe('20px');
  expect((screen.getByRole('heading').parentElement as HTMLElement).style.gap).toBe('4px');
});

test('PageTitle passes the status type through and omits the description when absent', () => {
  render(<PageTitle status="danger" title="Payment failed" />);
  expect(screen.getByRole('img', { name: 'dismiss-filled' })).toBeInTheDocument();
  expect(screen.getByRole('heading').nextElementSibling).toBeNull();
});

/* ---------------- PageHeader (Figma V1.2 37390:28734) ----------------
   An opening block: 56px icon slot, a two-line heading/lg title where each line is a
   muted word + a strong word, a body/md subtitle, and a row of 48px tab pills. */

const LINES = [{ muted: 'Discover', strong: 'Thermostats.' }, { muted: 'Built for', strong: 'Intelligence' }];

test('PageHeader default: white card (20px), subtle muted words, midnight strong words', () => {
  const { container } = render(<PageHeader title={LINES} subtitle="Sub" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe('rgb(255, 255, 255)');
  // The default surface layer is border-radius/7 (20px); the inverse one is /8 (24px).
  expect(root.style.borderRadius).toBe('20px');
  expect(root.style.padding).toBe('24px 16px');
  expect(screen.getByText('Discover').style.color).toBe('rgb(87, 83, 98)');
  expect(screen.getByText('Thermostats.').style.color).toBe('rgb(25, 19, 41)');
  expect(screen.getByText('Sub').style.color).toBe('rgb(87, 83, 98)');
});

test('PageHeader inverse: 20% glass card (24px) and inverse text tokens', () => {
  const { container } = render(<PageHeader inverse title={LINES} subtitle="Sub" />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe('rgba(255, 255, 255, 0.2)');
  expect(root.style.borderRadius).toBe('24px');
  expect(screen.getByText('Discover').style.color).toBe('rgba(255, 255, 255, 0.6)');
  expect(screen.getByText('Thermostats.').style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('Sub').style.color).toBe('rgba(255, 255, 255, 0.75)');
});

test('PageHeader title is heading/lg (28px, tight tracking) and a single heading', () => {
  render(<PageHeader title={LINES} />);
  const h = screen.getByRole('heading');
  expect(h).toHaveTextContent('Discover Thermostats. Built for Intelligence');
  expect(h.style.fontSize).toBe('28px');
  expect(parseFloat(h.style.letterSpacing)).toBeCloseTo(-0.65, 3);
});

test('PageHeader tabs: one selected, 48px pills; default state colours', async () => {
  const fn = vi.fn();
  render(<PageHeader title={LINES} tabs={['Home', 'TVs', 'Phones']} onTabChange={fn} />);
  const list = screen.getByRole('tablist');
  const tabs = within(list).getAllByRole('tab');
  expect(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')).toHaveLength(1);
  const [home, tvs] = tabs;
  expect(home.style.height).toBe('48px');
  expect(home.style.minWidth).toBe('72px');
  // Symbol binds the selected pill to tab/inverse/surface/selected (white) — see
  // design-questions.md: the prose says a light-red tint.
  expect(home.style.background).toBe('rgb(255, 255, 255)');
  expect(home.style.color).toBe('rgb(224, 8, 0)');
  expect(tvs.style.background).toBe('rgb(255, 255, 255)');
  expect(tvs.style.color).toBe('rgb(144, 142, 154)');
  await userEvent.click(tvs);
  expect(fn).toHaveBeenCalledWith(1);
  expect(tvs.getAttribute('aria-selected')).toBe('true');
});

test('PageHeader inverse tabs: glass pills with white labels, white selected pill', () => {
  render(<PageHeader inverse title={LINES} tabs={['Home', 'TVs']} />);
  const [home, tvs] = screen.getAllByRole('tab');
  expect(home.style.background).toBe('rgb(255, 255, 255)');
  expect(home.style.color).toBe('rgb(224, 8, 0)');
  expect(tvs.style.background).toBe('rgba(255, 255, 255, 0.2)');
  expect(tvs.style.color).toBe('rgb(255, 255, 255)');
});

test('PageHeader renders the icon slot at 56px and hides optional parts', () => {
  render(<PageHeader title={[{ strong: 'Shop' }]} icon={<span data-testid="ico" />} />);
  expect(screen.getByTestId('ico').parentElement!.style.width).toBe('56px');
  expect(screen.queryByRole('tablist')).toBeNull();
});

import { render, screen } from '@testing-library/react';
import { Badge, ProgressBar } from './primitives';

/* ---------------- Badge ---------------- */

test('Badge renders its label', () => {
  render(<Badge status="neutral">Active</Badge>);
  expect(screen.getByText('Active')).toBeInTheDocument();
});

test('Badge status="disabled" uses the disabled badge tokens', () => {
  render(<Badge status="disabled">Disabled</Badge>);
  const el = screen.getByText('Disabled');
  // jsdom normalizes hex -> rgb; badge.surface.status.disabled #e4e3ea, badge.text.status.disabled #908e9a
  expect(el.style.background).toMatch(/#e4e3ea|rgb\(228,\s*227,\s*234\)/i);
  expect(el.style.color).toMatch(/#908e9a|rgb\(144,\s*142,\s*154\)/i);
});

test('Badge status="neutral-inverse" uses the neutral-inverse badge tokens', () => {
  render(<Badge status="neutral-inverse">Inverse</Badge>);
  const el = screen.getByText('Inverse');
  // badge.surface.status.neutralInverse #191329, badge.text.status.neutralInverse #ffffff
  expect(el.style.background).toMatch(/#191329|rgb\(25,\s*19,\s*41\)/i);
  expect(el.style.color).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
});

test('Badge status="brand" still renders its tokens (deprecation pending design confirm)', () => {
  render(<Badge status="brand">Brand</Badge>);
  const el = screen.getByText('Brand');
  expect(el.style.background).toMatch(/#e00800|rgb\(224,\s*8,\s*0\)/i);
});

test('Badge md geometry: fixed h20, min-width 56, px8 py4, radius 8', () => {
  render(<Badge status="neutral">Geometry</Badge>);
  const el = screen.getByText('Geometry');
  expect(el.style.height).toBe('20px');
  expect(el.style.minWidth).toBe('56px');
  expect(el.style.padding).toBe('4px 8px');
  expect(el.style.borderRadius).toBe('8px');
});

test('Badge sm/lg fixed heights 16 and 24', () => {
  render(
    <>
      <Badge size="sm" status="neutral">Small</Badge>
      <Badge size="lg" status="neutral">Large</Badge>
    </>,
  );
  expect(screen.getByText('Small').style.height).toBe('16px');
  expect(screen.getByText('Large').style.height).toBe('24px');
});

/* ---------------- ProgressBar ---------------- */

test('ProgressBar exposes progressbar role with value', () => {
  render(<ProgressBar value={35} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuenow', '35');
  expect(bar).toHaveAttribute('aria-valuemin', '0');
  expect(bar).toHaveAttribute('aria-valuemax', '100');
});

test('ProgressBar default height is 4px (Figma V1.1 300x4)', () => {
  render(<ProgressBar value={50} />);
  expect(screen.getByRole('progressbar').style.height).toBe('4px');
});

test('ProgressBar default fill is text.positive.subtle green', () => {
  render(<ProgressBar value={50} />);
  const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
  // color/text/positive/subtle #54bc72; jsdom normalizes hex -> rgb
  expect(fill.style.background).toMatch(/#54bc72|rgb\(84,\s*188,\s*114\)/i);
  expect(fill.style.width).toBe('50%');
});

test('ProgressBar keeps a visible track behind the fill', () => {
  render(<ProgressBar value={50} />);
  // track = surface.sunken.default #e4e3ea
  expect(screen.getByRole('progressbar').style.background).toMatch(/#e4e3ea|rgb\(228,\s*227,\s*234\)/i);
});

test('ProgressBar tone prop still overrides the fill', () => {
  render(<ProgressBar value={50} tone="accent" />);
  const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
  // status.accent #e00800
  expect(fill.style.background).toMatch(/#e00800|rgb\(224,\s*8,\s*0\)/i);
});

test('ProgressBar clamps value into 0-100', () => {
  render(<ProgressBar value={140} />);
  const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
  expect(fill.style.width).toBe('100%');
});

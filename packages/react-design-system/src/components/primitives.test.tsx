import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, ProgressBar, Stepper, Dismiss, AtomSurface } from './primitives';

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

/* ---------------- Stepper (Figma 31614:11244) ---------------- */


test('Stepper renders one segment per step with progress filled', () => {
  const { container } = render(<Stepper steps={5} progress={2} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuemax', '5');
  expect(bar).toHaveAttribute('aria-valuenow', '2');
  const segments = Array.from(container.querySelectorAll('span'));
  expect(segments).toHaveLength(5);
  // active = #e73933, inactive = #e4e3ea (jsdom normalizes to rgb)
  expect(segments.slice(0, 2).every((s) => s.style.background === 'rgb(231, 57, 51)')).toBe(true);
  expect(segments.slice(2).every((s) => s.style.background === 'rgb(228, 227, 234)')).toBe(true);
});

test('Stepper inverse scheme uses white segments', () => {
  const { container } = render(<Stepper steps={3} progress={1} inverse />);
  const segments = Array.from(container.querySelectorAll('span'));
  expect(segments[0].style.background).toBe('rgb(255, 255, 255)');
  expect(segments[1].style.background).toBe('rgba(255, 255, 255, 0.4)');
});

test('Stepper clamps steps to the Figma 2-8 range and progress to steps', () => {
  const { container } = render(<Stepper steps={12} progress={99} />);
  const bar = screen.getByRole('progressbar');
  expect(bar).toHaveAttribute('aria-valuemax', '8');
  expect(bar).toHaveAttribute('aria-valuenow', '8');
  expect(container.querySelectorAll('span')).toHaveLength(8);
});

/* ---------------- Dismiss (Figma 28961:16066) ---------------- */


test('Dismiss renders a labelled circular close button and fires onClick', async () => {
  const fn = vi.fn();
  const { container } = render(<Dismiss onClick={fn} />);
  const btn = screen.getByRole('button', { name: 'Dismiss' });
  expect(btn.style.borderRadius).toBe('50%');
  expect(container.querySelector('svg')).toBeInTheDocument();
  await userEvent.click(btn);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('Dismiss md is 24px and sm is 20px', () => {
  const { rerender } = render(<Dismiss />);
  expect(screen.getByRole('button').style.width).toBe('24px');
  rerender(<Dismiss size="sm" />);
  expect(screen.getByRole('button').style.width).toBe('20px');
});

test('Dismiss surface picks the default vs inverse fill', () => {
  const { rerender } = render(<Dismiss />);
  expect(screen.getByRole('button').style.background).toBe('rgb(144, 142, 154)'); // #908e9a
  rerender(<Dismiss surface="inverse" />);
  expect(screen.getByRole('button').style.background).toBe('rgb(192, 191, 200)'); // #c0bfc8
});

/* ---------------- AtomSurface surface-color axis ----------------
   default-surface 26770:100166 (3) + inverse-surface 26770:100161 (4).
   Each expected fill was read off its own Figma variant node. */
test.each([
  ['subtle', 'rgb(240, 240, 245)'],              // 26770:100167 surface/base/default
  // KNOWN TOKEN DRIFT — asserts what the stale token currently produces, not Figma.
  // Figma reports surface/base/inverse = #ffffff99 (60% white), but variables.json still
  // aliases it to primitives color.white.1000 (opaque). The correct alias is white.a60,
  // which already exists in the export. Re-export variables.json from Figma (or retarget
  // that one alias) and this expectation becomes 'rgba(255, 255, 255, 0.6)'.
  ['default', 'rgb(255, 255, 255)'],             // 26770:100168 surface/base/inverse
  ['sunken', 'rgb(228, 227, 234)'],              // 26770:100169 surface/sunken/default
  ['midnight-base', 'rgb(25, 19, 41)'],          // 26770:100162 surface/base/midnight
  ['midnight-raised', 'rgb(49, 44, 64)'],        // 26770:100163 surface/raised/midnight
  ['glass-midnight', 'rgba(25, 19, 41, 0.2)'],   // 26770:100164 surface/glass/midnight/md
  ['glass-white', 'rgba(255, 255, 255, 0.2)'],   // 26770:100165 surface/glass/white/lg
] as const)('AtomSurface surfaceColor=%s fills with %s', (surfaceColor, bg) => {
  const { container } = render(<AtomSurface surfaceColor={surfaceColor} />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe(bg);
});

test('AtomSurface keeps the deprecated level axis rendering as before', () => {
  const { container } = render(<AtomSurface level="sunken" />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe('rgb(228, 227, 234)');
});

test('AtomSurface defaults to surface.base.default when neither axis is given', () => {
  const { container } = render(<AtomSurface />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe('rgb(240, 240, 245)');
});

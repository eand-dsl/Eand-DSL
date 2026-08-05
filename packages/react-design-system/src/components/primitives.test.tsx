import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, ProgressBar, Stepper, Dismiss, AtomSurface, CardBgColor, CARD_BG_TINTS, AddTrigger, Logo } from './primitives';

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

// (The old "keeps a visible track" case is gone: Figma's progress-bar-core has no track
//  fill at all. Replaced by "draws no track behind the fill" above.)

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
  // This was marked "KNOWN TOKEN DRIFT — re-export variables.json and it becomes
  // rgba(255,255,255,0.6)". The re-export has since happened (830 -> 944 tokens) and the
  // value did not move: color/surface/base/inverse still aliases primitives white/1000,
  // opaque. So the variable and whatever node reported #ffffff99 disagree in Figma itself.
  // Not drift on our side; if the 60% is intended, the variable needs re-pointing there.
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

/* ---------------- CardBgColor (Figma .card-bg-color 25710:20065) ----------------
   Eight tints on one `color` axis. Each expected fill was read off its own variant
   node; `cyan` and `blue` are deliberately shifted against the token names. */
test.each([
  ['default', 'rgb(228, 227, 234)'],  // 26522:14527 atom-surfaces/default
  ['red', 'rgb(252, 235, 235)'],      // 25710:20060 atom-surfaces/red
  ['orange', 'rgb(252, 243, 235)'],   // 25710:20063 atom-surfaces/orange
  ['yellow', 'rgb(252, 252, 235)'],   // 25710:20059 atom-surfaces/yellow
  ['green', 'rgb(236, 252, 232)'],    // 25710:20058 atom-surfaces/green
  ['cyan', 'rgb(235, 247, 252)'],     // 25710:20064 atom-surfaces/BLUE  (shift)
  ['blue', 'rgb(235, 235, 252)'],     // 25710:20061 atom-surfaces/PURPLE (shift)
  ['violet', 'rgb(249, 235, 252)'],   // 25710:20062 atom-surfaces/violet
] as const)('CardBgColor tint=%s fills with %s', (tint, bg) => {
  const { container } = render(<CardBgColor tint={tint} />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe(bg);
});

test('CardBgColor cyan and blue resolve to different fills (the label shift is real)', () => {
  const { container: a } = render(<CardBgColor tint="cyan" />);
  const { container: b } = render(<CardBgColor tint="blue" />);
  const fill = (c: Element) => (c.firstElementChild as HTMLElement).style.background;
  expect(fill(a)).not.toBe(fill(b));
});

test('CardBgColor defaults to the default tint at radius 16', () => {
  const { container } = render(<CardBgColor />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.background).toBe('rgb(228, 227, 234)');
  expect(el.style.borderRadius).toBe('16px');
});

test('CardBgColor fixedSize uses the Figma card/width|height/lg footprint', () => {
  const { container } = render(<CardBgColor fixedSize />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.width).toBe('224px');
  expect(el.style.height).toBe('272px');
});

test('CARD_BG_TINTS exposes all eight Figma variants', () => {
  expect(CARD_BG_TINTS).toEqual(['default', 'red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet']);
});

/* Figma `progress-bar-core` 26437:43709 is a 300x4 clip with a single green fill and
   *nothing behind it* — no track colour and no corner radius on either the container or
   the bar. The code carried a pill radius and a sunken-grey track from V1.0. */

test('ProgressBar draws no track behind the fill', () => {
  const { container } = render(<ProgressBar value={40} />);
  const track = container.firstElementChild as HTMLElement;
  expect(track.style.background).toBe('');
  expect(track.style.backgroundColor).toBe('');
});

test('ProgressBar has square ends, not a pill', () => {
  const { container } = render(<ProgressBar value={40} />);
  const track = container.firstElementChild as HTMLElement;
  const fill = track.firstElementChild as HTMLElement;
  expect(track.style.borderRadius).toBe('');
  expect(fill.style.borderRadius).toBe('');
});

test('ProgressBar is 4px tall and green by default', () => {
  const { container } = render(<ProgressBar value={40} />);
  const track = container.firstElementChild as HTMLElement;
  expect(track.style.height).toBe('4px');
  // color/text/positive/subtle = green/600 #54bc72
  expect((track.firstElementChild as HTMLElement).style.background).toBe('rgb(84, 188, 114)');
});

/* ---------------- AddTrigger vs Figma `add-trigger` 25752:11486 ----------------
   V1.1 is a 72px glass panel with a tertiary button inside it. The code was still the
   V1.0 shape: a 40px dashed pill with a brand-red label. */

test('AddTrigger is a 72px glass panel at radius 16, with no dashed border', () => {
  const { container } = render(<AddTrigger label="Make your own deal now" />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.height).toBe('72px');
  expect(el.style.borderRadius).toBe('16px');
  expect(el.style.border).not.toContain('dashed');
  // surface/glass/midnight/sm
  expect(el.style.background).toBe('rgba(25, 19, 41, 0.07)');
});

test('AddTrigger label is button/lg 16 in midnight, not brand red', () => {
  const { container } = render(<AddTrigger label="Make your own deal now" />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.fontSize).toBe('16px');
  expect(el.style.color).toBe('rgb(25, 19, 41)');
});

/* ---------------- Logo vs Figma `e&-logo` 27032:50455 ----------------
   Was a styled text span reading "e&". V1.1 is a 96x96 lockup with four versions. */

test('Logo renders real lockup artwork, not a text glyph', () => {
  const { container } = render(<Logo />);
  expect(container.querySelector('svg')).toBeInTheDocument();
  expect(container.querySelectorAll('path').length).toBeGreaterThan(5);
  expect(container.textContent).toBe('');
});

test('Logo version=default is the red app tile', () => {
  const { container } = render(<Logo />);
  expect(container.querySelector('rect')!.getAttribute('fill')).toBe('#E00800');
});

// The three bare versions are one shape in three inks, so `version` has to carry the
// colour — leaving them all on currentColor made `red` and `midnight` render identically,
// which the tests missed and a screenshot caught.
test.each([
  ['white', '#ffffff'],
  ['midnight', '#191329'],
  ['red', '#E00800'],
] as const)('Logo version=%s drops the tile and inks the lockup %s', (version, fill) => {
  const { container } = render(<Logo version={version} />);
  expect(container.querySelector('rect')).toBeNull();
  expect(container.querySelector('g')!.getAttribute('fill')).toBe(fill);
});

test('Logo color prop overrides the version ink', () => {
  const { container } = render(<Logo version="midnight" color="currentColor" />);
  expect(container.querySelector('g')!.getAttribute('fill')).toBe('currentColor');
});

test('Logo carries an accessible name', () => {
  render(<Logo />);
  expect(screen.getByRole('img', { name: /e&/i })).toBeInTheDocument();
});

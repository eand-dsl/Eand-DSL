import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Badge, ProgressBar, Stepper, Dismiss, AtomSurface, CardBgColor, CARD_BG_TINTS, AddTrigger, Logo, SectionLinkButton, StatusIndicator, IconBox, LogoRow, MoreItems } from './primitives';

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

test('Badge md geometry: fixed h20, min-width 56, px8 py4, radius 6 (V1.2 border-radius/2)', () => {
  // Figma badges-status 25694:12036 + badges-offers 12934:864, md variants bind
  // border-radius/2, which is 6px in V1.2. The code had kept 8 from V1.1's numbering.
  render(<Badge status="neutral">Geometry</Badge>);
  const el = screen.getByText('Geometry');
  expect(el.style.height).toBe('20px');
  expect(el.style.minWidth).toBe('56px');
  expect(el.style.padding).toBe('4px 8px');
  expect(el.style.borderRadius).toBe('6px');
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

// Figma V1.2, all 36 badges-offers variants and 17 of 18 badges-status variants:
//   sm  h16  min scale/40  r border-radius/2 (6)   <- code had no sm min-width, and r8
//   md  h20  min scale/56  r border-radius/2 (6)   <- code r8
//   lg  h24  min scale/64  r border-radius/3 (8)
// (badges-status lg/neutral alone binds scale/56 + border-radius/2 — logged as a design question.)
test.each([
  ['sm', '40px', '6px'],
  ['md', '56px', '6px'],
  ['lg', '64px', '8px'],
] as const)('Badge size=%s has min-width %s and radius %s (offers and status alike)', (size, minWidth, r) => {
  render(
    <>
      <Badge size={size} status="positive">S</Badge>
      <Badge size={size} offer="discount">O</Badge>
    </>,
  );
  for (const label of ['S', 'O']) {
    const el = screen.getByText(label);
    expect(el.style.minWidth).toBe(minWidth);
    expect(el.style.borderRadius).toBe(r);
  }
});

// .badges-core 40602:71471 `chevron`: a chevron-right filled=true in icon-size 2d sm (8px
// glyph) or md (12px glyph). A negative gap equal to the end padding butts it against the
// label, so the badge ends at the icon box.
test('Badge chevron adds the icon-set chevron and drops the end padding', () => {
  const { container } = render(<Badge offer="new-card" size="md" chevron>New card</Badge>);
  const el = container.firstElementChild as HTMLElement;
  const glyph = container.querySelector('[aria-label="chevron-right-filled"]')!;
  expect(glyph).toBeInTheDocument();
  expect(glyph.querySelector('svg')!.getAttribute('width')).toBe('12');
  expect(el.style.paddingInlineEnd).toMatch(/^0(px)?$/);
  expect(el.style.paddingInlineStart).toBe('8px');
});

test('Badge chevron at sm is an 8px glyph after a 4px start padding', () => {
  const { container } = render(<Badge status="neutral" size="sm" chevron>N</Badge>);
  const glyph = container.querySelector('[aria-label="chevron-right-filled"]')!;
  expect(glyph.querySelector('svg')!.getAttribute('width')).toBe('8');
  expect((container.firstElementChild as HTMLElement).style.paddingInlineStart).toBe('4px');
});

test('Badge without chevron draws no glyph (every published badge sets chevron=false)', () => {
  const { container } = render(<Badge offer="discount">Discount</Badge>);
  expect(container.querySelector('svg')).toBeNull();
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

/* ---------------- Stepper (Figma page 32960:73423) ---------------- */

test('Stepper segments sit 4px apart (.stepper-steps-scheme 32960:73523, itemSpacing spacing/xs)', () => {
  // The code used space('sm') = 8px.
  render(<Stepper steps={4} progress={1} />);
  expect(screen.getByRole('progressbar').style.gap).toBe('4px');
});


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
  render(<Dismiss onClick={fn} />);
  const btn = screen.getByRole('button', { name: 'Dismiss' });
  expect(btn.style.borderRadius).toBe('50%');
  await userEvent.click(btn);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('Dismiss md is 24px and sm is 20px', () => {
  const { rerender } = render(<Dismiss />);
  expect(screen.getByRole('button').style.width).toBe('24px');
  rerender(<Dismiss size="sm" />);
  expect(screen.getByRole('button').style.width).toBe('20px');
});

// Figma dismiss 28961:19839: the 24/20 frame is transparent and holds icon-size xl/lg
// (2px inset) with a 20/16px filled close-circle whose X is knocked out. The code
// filled the whole box and hand-drew a white X (CLAUDE.md rule 4).
test('Dismiss uses the icon-set dismiss-filled glyph, inset 2px, on a transparent box', () => {
  const { container, rerender } = render(<Dismiss />);
  const btn = screen.getByRole('button');
  expect(btn.style.background).toBe('transparent');
  expect(btn.style.padding).toBe('2px');
  expect(container.querySelector('path[stroke]')).toBeNull();
  const glyph = container.querySelector('[aria-label="dismiss-filled"]') as HTMLElement;
  expect(glyph).toBeInTheDocument();
  expect(glyph.querySelector('svg')!.getAttribute('width')).toBe('20');
  rerender(<Dismiss size="sm" />);
  expect(container.querySelector('[aria-label="dismiss-filled"] svg')!.getAttribute('width')).toBe('16');
});

test('Dismiss surface picks the default vs inverse glyph colour', () => {
  const { container, rerender } = render(<Dismiss />);
  const glyph = () => container.querySelector('[aria-label="dismiss-filled"]') as HTMLElement;
  expect(glyph().style.color).toBe('rgb(144, 142, 154)'); // color/dismiss/default #908e9a
  rerender(<Dismiss surface="inverse" />);
  expect(glyph().style.color).toBe('rgb(192, 191, 200)'); // color/dismiss/inverse #c0bfc8
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
  ['brand', 'rgb(224, 8, 0)'],                    // 26003:41829 surface/base/brand (Plans copy)
] as const)('AtomSurface surfaceColor=%s fills with %s', (surfaceColor, bg) => {
  const { container } = render(<AtomSurface surfaceColor={surfaceColor} />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe(bg);
});

// Shared atoms .default-surface 26770:100166 / .inverse-surface 26770:100161 clip every
// variant at border-radius/7 = 20px. The code used radius('6') = 16.
test('AtomSurface corners are border-radius/7 = 20px', () => {
  const { container } = render(<AtomSurface surfaceColor="midnight-base" />);
  expect((container.firstElementChild as HTMLElement).style.borderRadius).toBe('20px');
});

// glass-white 26770:100165 carries a GLASS effect bound to effects/glass/lg (frost 100).
test('AtomSurface glass-white blurs what is behind it; glass-midnight does not', () => {
  const { container: a } = render(<AtomSurface surfaceColor="glass-white" />);
  const { container: b } = render(<AtomSurface surfaceColor="glass-midnight" />);
  expect((a.firstElementChild as HTMLElement).style.backdropFilter).toBe('blur(100px)');
  expect((b.firstElementChild as HTMLElement).style.backdropFilter).toBeFalsy();
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

// .add-trigger-content-ltr 37884:69847: a 16px disc (text/brand/default) holding icon-size
// 2d/sm (12, 2px inset) with `add` filled=true at 8px in text/default/inverse. The code
// drew a 24px circled plus (add-content-filled) with a transparent cut-out.
test('AddTrigger icon is a 16px brand disc holding an 8px white plus from the icon set', () => {
  const { container } = render(<AddTrigger label="Add" />);
  const glyph = container.querySelector('[aria-label="add-filled"]') as HTMLElement;
  expect(glyph).toBeInTheDocument();
  expect(glyph.querySelector('svg')!.getAttribute('width')).toBe('8');
  expect(glyph.style.color).toBe('rgb(255, 255, 255)');
  const disc = glyph.closest('[data-add-disc]') as HTMLElement;
  expect(disc.style.width).toBe('16px');
  expect(disc.style.background).toBe('rgb(224, 8, 0)');
  expect(container.querySelector('[aria-label="add-content-filled"]')).toBeNull();
});

// surface=inverse 28917:4269
test('AddTrigger surface="inverse": white glass panel, white label, white disc, midnight plus', () => {
  const { container } = render(<AddTrigger surface="inverse" label="Add" />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.background).toBe('rgba(255, 255, 255, 0.2)');        // surface/glass/white/lg
  expect(el.style.color).toBe('rgb(255, 255, 255)');                   // text/default/inverse
  const glyph = container.querySelector('[aria-label="add-filled"]') as HTMLElement;
  expect(glyph.style.color).toBe('rgb(20, 15, 33)');                   // surface/canvas/midnight #140f21
  // button/tertiary/text/inverse/default
  expect((glyph.closest('[data-add-disc]') as HTMLElement).style.background).toBe('rgb(255, 255, 255)');
});

/* ---------------- Logo vs Figma V1.2 "Etisalat Logo" 27020:6155 ----------------
   V1.1 shipped the "e&" lockup in four versions. V1.2 rebranded it: `etisalat-logo`
   27032:50455 is the etisalat swoosh + wordmark, color-scheme default | white | red
   (midnight is gone), and `.etisalat-logo-variations` 42176:33598 adds logomark,
   wordmark and bilingual, with Arabic lockup and wordmark. */
import { LOGO_ART } from '../icons/logo';

test('Logo renders the V1.2 etisalat lockup artwork, not a text glyph', () => {
  const { container } = render(<Logo />);
  expect(container.querySelector('svg')).toBeInTheDocument();
  // lockup.svg (42573:82636): "tisalat" letters + the two swoosh strokes = 9 paths.
  expect(container.querySelectorAll('path')).toHaveLength(LOGO_ART.lockup.paths.length);
  expect(LOGO_ART.lockup.paths).toHaveLength(9);
  expect(container.textContent).toBe('');
});

test('Logo version=default is the square red tile (color/red/1000, no radius)', () => {
  const { container } = render(<Logo />);
  const rect = container.querySelector('rect')!;
  expect(rect.getAttribute('fill')).toBe('#E00800');
  expect(rect.getAttribute('rx')).toBeNull();
  expect(container.querySelector('g')!.getAttribute('fill')).toBe('#ffffff');
});

// The bare versions are one shape in different inks, so `version` has to carry the
// colour — leaving them all on currentColor once made red and midnight identical.
test.each([
  ['white', '#ffffff'],
  ['red', '#E00800'],
  ['midnight', '#191329'], // deprecated in V1.2, still renders
] as const)('Logo version=%s drops the tile and inks the mark %s', (version, fill) => {
  const { container } = render(<Logo version={version} />);
  expect(container.querySelector('rect')).toBeNull();
  expect(container.querySelector('g')!.getAttribute('fill')).toBe(fill);
});

test('Logo places the lockup at 136/192 of the symbol width, as .etisalat-logo-core does', () => {
  const { container } = render(<Logo version="white" />);
  const t = container.querySelector('g')!.getAttribute('transform')!;
  const scale = Number(t.match(/scale\(([\d.]+)\)/)![1]);
  expect(LOGO_ART.lockup.width * scale).toBeCloseTo(96 * (136 / 192), 4);
});

test.each([
  ['lockup', false, 'lockup'],
  ['lockup', true, 'lockup-rtl'],
  ['wordmark', false, 'wordmark'],
  ['wordmark', true, 'wordmark-rtl'],
  ['logomark', true, 'logomark'],
  ['bilingual', true, 'bilingual'],
] as const)('Logo type=%s rtl=%s draws the %s variation', (type, rtl, key) => {
  const { container } = render(<Logo version="white" type={type} rtl={rtl} />);
  expect(container.querySelectorAll('path')).toHaveLength(LOGO_ART[key].paths.length);
});

test('Logo with a type and no tile fills its frame edge to edge', () => {
  const { container } = render(<Logo version="red" type="logomark" />);
  const t = container.querySelector('g')!.getAttribute('transform')!;
  const scale = Number(t.match(/scale\(([\d.]+)\)/)![1]);
  expect(LOGO_ART.logomark.width * scale).toBeCloseTo(96, 4);
});

test('Logo color prop overrides the version ink', () => {
  const { container } = render(<Logo version="red" color="currentColor" />);
  expect(container.querySelector('g')!.getAttribute('fill')).toBe('currentColor');
});

test('Logo is named "etisalat", or "اتصالات" for the Arabic artwork', () => {
  const { rerender } = render(<Logo />);
  expect(screen.getByRole('img', { name: 'etisalat' })).toBeInTheDocument();
  rerender(<Logo type="wordmark" rtl />);
  expect(screen.getByRole('img', { name: 'اتصالات' })).toBeInTheDocument();
});

/* ---------------- SectionLinkButton vs Figma `section-link` 25440:14243 ----------------
   The published component is this icon-only 40x40 button. `SectionLink` already meant the
   composed header row, so this ships beside it rather than renaming an export. */

test('SectionLinkButton is 40x40 at radius 14', () => {
  render(<SectionLinkButton />);
  const btn = screen.getByRole('button', { name: 'See all' });
  expect(btn.style.width).toBe('40px');
  expect(btn.style.height).toBe('40px');
  expect(btn.style.borderRadius).toBe('14px');
});

test('SectionLinkButton uses the icon set, not a drawn chevron', () => {
  const { container } = render(<SectionLinkButton />);
  expect(container.querySelector('svg')).toBeInTheDocument();
  expect(container.textContent!.trim()).toBe('');   // no "\u203a" character standing in
});

test('SectionLinkButton surface="inverse" (deprecated) still renders glass inverse', () => {
  render(<SectionLinkButton surface="inverse" />);
  expect(screen.getByRole('button').style.background).toBe('rgba(255, 255, 255, 0.2)');
});

// section-link 25440:14243: glass x inverse x state, bound to color/section-link/*.
// The code bound surface.raised.default / surface.glass.white.lg and text.default.*.
test.each([
  [false, false, 'rgb(255, 255, 255)', 'rgb(87, 83, 98)'],               // solid/default
  [false, true, 'rgb(240, 240, 245)', 'rgb(87, 83, 98)'],                // solid/inverse
  [true, false, 'rgba(255, 255, 255, 0.4)', 'rgb(87, 83, 98)'],          // glass/default
  [true, true, 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.75)'], // glass/inverse
] as const)('SectionLinkButton glass=%s inverse=%s fills %s with a %s glyph', (glass, inverse, bg, ink) => {
  render(<SectionLinkButton glass={glass} inverse={inverse} />);
  const btn = screen.getByRole('button');
  expect(btn.style.background).toBe(bg);
  expect(btn.style.color).toBe(ink);
});

test('SectionLinkButton has no shadow and no blur (no symbol carries an effect)', () => {
  const { rerender } = render(<SectionLinkButton />);
  expect(screen.getByRole('button').style.boxShadow).toBe('');
  rerender(<SectionLinkButton glass inverse />);
  expect(screen.getByRole('button').style.backdropFilter).toBeFalsy();
});

test('SectionLinkButton disabled uses the disabled tokens, not opacity', () => {
  const { rerender } = render(<SectionLinkButton disabled />);
  let btn = screen.getByRole('button');
  expect(btn.style.opacity).toBe('');
  expect(btn.style.color).toBe('rgb(192, 191, 200)'); // solid/default/icon/disabled #c0bfc8
  rerender(<SectionLinkButton glass inverse disabled />);
  btn = screen.getByRole('button');
  expect(btn.style.background).toBe('rgba(255, 255, 255, 0.15)');
  expect(btn.style.color).toBe('rgba(255, 255, 255, 0.5)');
});

test('SectionLinkButton uses the pressed icon token while the pointer is down', () => {
  render(<SectionLinkButton />);
  const btn = screen.getByRole('button');
  fireEvent.pointerDown(btn);
  expect(btn.style.color).toBe('rgb(224, 8, 0)'); // solid/default/icon/pressed #e00800
  fireEvent.pointerUp(btn);
  expect(btn.style.color).toBe('rgb(87, 83, 98)');
});

// .section-link-action 33137:15635: icon-size xl (24 box, 2px inset) -> a 20px glyph.
test.each([
  ['forward', 'chevron-right'],
  ['backwards', 'chevron-left'],
  ['close', 'close'],
] as const)('SectionLinkButton action=%s draws the 20px %s glyph', (action, name) => {
  const { container } = render(<SectionLinkButton action={action} />);
  const glyph = container.querySelector(`[aria-label="${name}"]`)!;
  expect(glyph).toBeInTheDocument();
  expect(glyph.querySelector('svg')!.getAttribute('width')).toBe('20');
});

/* ---------------- StatusIndicator (Figma page 36840:65099) ----------------
   status-indicator-type 37171:3537: type basic|pill|glass|Glass-dark x status. Each
   expectation below was read off its own variant node. */

test('StatusIndicator renders its label in badge/md with a dot from the icon set', () => {
  const { container } = render(<StatusIndicator>Active</StatusIndicator>);
  expect(screen.getByText('Active').style.fontSize).toBe('12px');
  const dot = container.querySelector('[aria-label="dot-filled"]') as HTMLElement;
  expect(dot).toBeInTheDocument();
  // icon-size 2d/sm: a 12px box with the 2px inset -> the 8px dot/filled=true glyph
  expect(dot.querySelector('svg')!.getAttribute('width')).toBe('8');
});

test.each([
  ['positive', 'rgb(59, 139, 83)'],  // status-indicator/text/positive #3b8b53
  ['danger', 'rgb(184, 90, 26)'],    // status-indicator/text/danger #b85a1a
  ['warning', 'rgb(170, 145, 58)'],  // status-indicator/text/warning #aa913a
  ['neutral', 'rgb(25, 19, 41)'],    // dot text/default/default, label status-indicator/text/neutral
] as const)('StatusIndicator basic %s colours the dot and label %s, with no surface', (status, ink) => {
  const { container } = render(<StatusIndicator type="basic" status={status}>Status</StatusIndicator>);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe('');
  expect(root.style.height).toBe('16px');
  expect((container.querySelector('[aria-label="dot-filled"]') as HTMLElement).style.color).toBe(ink);
  expect(screen.getByText('Status').style.color).toBe(ink);
});

test.each([
  ['positive', 'rgb(193, 247, 208)'],
  ['danger', 'rgb(255, 209, 168)'],
  ['warning', 'rgb(255, 236, 171)'],
  ['neutral', 'rgb(228, 227, 234)'],
] as const)('StatusIndicator pill %s is a 24px pill on status-indicator/surface %s, midnight label', (status, bg) => {
  const { container } = render(<StatusIndicator type="pill" status={status}>Status</StatusIndicator>);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe(bg);
  expect(root.style.height).toBe('24px');
  expect(root.style.paddingBlock).toBe('4px');
  expect(root.style.borderRadius).toBe('1200px');
  expect(screen.getByText('Status').style.color).toBe('rgb(25, 19, 41)');
});

test.each([
  ['glass', 'rgb(25, 19, 41)'],
  ['glass-dark', 'rgb(255, 255, 255)'],
] as const)('StatusIndicator %s is a 32px glass pill (surface/glass/white/xs + glass lg) with label %s', (type, ink) => {
  const { container } = render(<StatusIndicator type={type} status="positive">Status</StatusIndicator>);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.background).toBe('rgba(255, 255, 255, 0.05)');
  expect(root.style.backdropFilter).toBe('blur(100px)'); // effects/glass/lg/frost
  expect(root.style.height).toBe('32px');
  expect(root.style.paddingBlock).toBe('8px');
  expect(screen.getByText('Status').style.color).toBe(ink);
  expect((container.querySelector('[aria-label="dot-filled"]') as HTMLElement).style.color).toBe('rgb(59, 139, 83)');
});

test('StatusIndicator core pads 4px at the start and 8px at the end (.status-indicator-core 37840:21741)', () => {
  const { container } = render(<StatusIndicator type="pill">Status</StatusIndicator>);
  const core = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
  expect(core.style.paddingInlineStart).toBe('4px');
  expect(core.style.paddingInlineEnd).toBe('8px');
  expect(core.style.height).toBe('16px');
});

test('StatusIndicator dot={false} hides the dot (Figma `circle`)', () => {
  const { container } = render(<StatusIndicator dot={false}>Status</StatusIndicator>);
  expect(container.querySelector('[aria-label="dot-filled"]')).toBeNull();
});

test('StatusIndicator defaults to the Figma default variant: basic, positive, "Status"', () => {
  const { container } = render(<StatusIndicator />);
  expect(screen.getByText('Status').style.color).toBe('rgb(59, 139, 83)');
  expect((container.firstElementChild as HTMLElement).style.background).toBe('');
});

/* ---------------- IconBox vs Figma icon-size 25408:1190 ----------------
   2d: the glyph FILLs the box inside a spacing/2xs (xs-xl) or spacing/xs (2xl-5xl)
   inset. logo: no inset, clipped, glyph = box. The code had no inset and no 5xl. */
test.each([
  ['xs', '8px', '2px', 4], ['sm', '12px', '2px', 8], ['md', '16px', '2px', 12], ['lg', '20px', '2px', 16],
  ['xl', '24px', '2px', 20], ['2xl', '32px', '4px', 24], ['3xl', '40px', '4px', 32], ['4xl', '48px', '4px', 40],
  ['5xl', '56px', '4px', 48],
] as const)('IconBox 2d %s is a %s box with a %s inset and a %ipx glyph', (size, box, inset, glyph) => {
  const { container } = render(<IconBox size={size} />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.width).toBe(box);
  expect(el.style.height).toBe(box);
  expect(el.style.padding).toBe(inset);
  expect(el.style.boxSizing).toBe('border-box');
  expect(el.querySelector('svg')!.getAttribute('width')).toBe(String(glyph));
});

test('IconBox icon prop renders that icon at the Figma glyph size', () => {
  const { container } = render(<IconBox size="xl" icon="wallet" />);
  expect(container.querySelector('[aria-label="wallet"] svg')!.getAttribute('width')).toBe('20');
});

test('IconBox category="logo" has no inset, clips, and is the full box', () => {
  const { container } = render(<IconBox size="2xl" category="logo"><span>L</span></IconBox>);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.width).toBe('32px');
  expect(el.style.padding).toBe('0px');
  expect(el.style.overflow).toBe('hidden');
});

/* ---------------- LogoRow vs Figma logo-row 25997:32516 ----------------
   size sm|md|lg x style default|glass x direction. Default logos are circles of
   icon/xl|2xl|3xl (24/32/40); glass wraps each in a 40/48/56 tile (8px padding,
   surface/glass/white/lg + glass md). Gaps: default 4/4/8, glass 4/8/8. The code had a
   16px gap and one 32px size. */
test.each([
  ['sm', false, '24px', '4px'], ['md', false, '32px', '4px'], ['lg', false, '40px', '8px'],
  ['sm', true, '40px', '4px'], ['md', true, '48px', '8px'], ['lg', true, '56px', '8px'],
] as const)('LogoRow size=%s glass=%s: %s items, %s apart', (size, glass, item, gap) => {
  const { container } = render(<LogoRow size={size} glass={glass} logos={[<i key="a" />, <i key="b" />]} />);
  const row = container.firstElementChild as HTMLElement;
  expect(row.style.gap).toBe(gap);
  const first = row.firstElementChild as HTMLElement;
  expect(first.style.width).toBe(item);
  expect(first.style.height).toBe(item);
  expect(first.style.borderRadius).toBe('1200px');
});

test('LogoRow default logos are clipped to a circle', () => {
  const { container } = render(<LogoRow logos={[<i key="a" />]} />);
  const logo = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
  expect(logo.style.overflow).toBe('hidden');
});

test('LogoRow glass tiles carry the glass surface, blur and a 0.5px inside ring on the logo', () => {
  const { container } = render(<LogoRow size="md" glass logos={[<i key="a" />]} />);
  const tile = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
  expect(tile.style.background).toBe('rgba(255, 255, 255, 0.2)'); // surface/glass/white/lg
  expect(tile.style.backdropFilter).toBe('blur(20px)');           // effects/glass/md/frost
  expect(tile.style.padding).toBe('8px');
  const ring = tile.querySelector('[data-logo-ring]') as HTMLElement;
  expect(ring.style.border).toBe('0.5px solid rgba(255, 255, 255, 0.8)'); // border/surface-based/glass/default/sm
});

test('LogoRow string logos render as images', () => {
  const { container } = render(<LogoRow logos={['/a.png']} />);
  expect(container.querySelector('img')!.getAttribute('src')).toBe('/a.png');
});

test('LogoRow more={4} appends the "+4" more-items circle at the item size', () => {
  const { container } = render(<LogoRow size="lg" logos={[<i key="a" />]} more={4} />);
  const last = (container.firstElementChild as HTMLElement).lastElementChild as HTMLElement;
  expect(last.textContent).toBe('+4');
  expect(last.style.width).toBe('40px');
  // every logo-row symbol instances more-items surface=inverse
  expect(last.style.background).toBe('rgba(255, 255, 255, 0.15)');
});

/* more-items 26560:27420 / more-items-rtl 37905:16028 */
test.each([
  ['default', 'rgba(25, 19, 41, 0.6)'],     // surface/glass/midnight/lg
  ['inverse', 'rgba(255, 255, 255, 0.15)'], // surface/glass/white/md
] as const)('MoreItems surface=%s fills %s with a 10px white "+N"', (surface, bg) => {
  const { container } = render(<MoreItems count={7} surface={surface} />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.background).toBe(bg);
  expect(el.style.color).toBe('rgb(255, 255, 255)');
  expect(el.style.fontSize).toBe('10px');
  expect(el.style.width).toBe('24px');
  expect(el.textContent).toBe('+7');
});

test('MoreItems keeps "+" and the count in separate cells so RTL reads "7+"', () => {
  const { container } = render(<MoreItems count={7} />);
  const cells = Array.from((container.firstElementChild as HTMLElement).querySelectorAll(':scope > span > span'));
  expect(cells.map((c) => c.textContent)).toEqual(['+', '7']);
});

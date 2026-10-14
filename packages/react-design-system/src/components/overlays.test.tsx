import { fireEvent, render, screen } from '@testing-library/react';
import { Tooltip, BottomSheet, Scrim } from './overlays';

/* ---------------- Scrim — Figma V1.2 `scrim` 32960:77013 ----------------
   A surface/overlay/scrim rect under a GLASS effect of radius 20. Previously each overlay
   inlined the colour and dropped the blur. */

test('Scrim is surface/overlay/scrim with a 20px backdrop blur', () => {
  const { container } = render(<Scrim />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.getAttribute('data-part')).toBe('scrim');
  expect(el.style.background).toBe('rgba(25, 19, 41, 0.5)');
  expect(el.style.backdropFilter).toBe('blur(20px)');
  expect(el.style.position).toBe('fixed');
});

test('Scrim forwards clicks (overlays dismiss through it)', () => {
  const onClick = vi.fn();
  const { container } = render(<Scrim onClick={onClick} />);
  fireEvent.click(container.firstElementChild as HTMLElement);
  expect(onClick).toHaveBeenCalledTimes(1);
});

/* ---------------- Tooltip (Figma final component 33202:6649) ----------------
   Each size binds its own radius token, so a single radius across all three is wrong. */

const tip = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('tooltip');
};
const bubble = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-part="bubble"]')!;
const caret = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-part="caret"]');

test.each([
  ['simple', '4px'],    // 33202:6648 border-radius/1
  ['standard', '12px'], // 33202:6646 border-radius/4
  ['rich', '20px'],     // 33202:6647 border-radius/7
] as const)('Tooltip size=%s uses radius %s', (size, r) => {
  expect(bubble(tip(<Tooltip visible size={size} content="c"><b>t</b></Tooltip>)).style.borderRadius).toBe(r);
});

test.each([
  ['standard', '200px'], ['rich', '280px'],
] as const)('Tooltip size=%s is the symbol width %s (not a max the box shrinks under)', (size, w) => {
  // Rendered: as a max-width, an absolutely placed bubble shrank to ~76px beside a 24px trigger.
  expect(bubble(tip(<Tooltip visible size={size} content="c"><b>t</b></Tooltip>)).style.width).toBe(w);
});

test('Tooltip default surface is surface/canvas/default white', () => {
  expect(bubble(tip(<Tooltip visible content="c"><b>t</b></Tooltip>)).style.background).toBe('rgb(255, 255, 255)');
});

test('Tooltip surface=dark is surface/canvas/midnight #140f21, not the floating-inverse overlay', () => {
  // `.tooltip-core-surface` 32928:269817 surface=dark.
  expect(bubble(tip(<Tooltip visible surface="dark" content="c"><b>t</b></Tooltip>)).style.background).toBe('rgb(20, 15, 33)');
});

test('Tooltip carries effect style shadow/md (0 0 44 midnight/a10)', () => {
  const s = bubble(tip(<Tooltip visible content="c"><b>t</b></Tooltip>)).style.boxShadow;
  expect(s).toContain('44px');
  expect(s).toContain('rgba(25, 19, 41, 0.10)');
});

test('Tooltip simple padding is spacing/xs by spacing/md (4/12)', () => {
  expect(bubble(tip(<Tooltip visible size="simple" content="c"><b>t</b></Tooltip>)).style.padding).toBe('4px 12px');
});

test('Tooltip standard padding is 12 and rich is 16', () => {
  expect(bubble(tip(<Tooltip visible size="standard" content="c"><b>t</b></Tooltip>)).style.padding).toBe('12px');
  document.body.innerHTML = '';
  expect(bubble(tip(<Tooltip visible size="rich" content="c"><b>t</b></Tooltip>)).style.padding).toBe('16px');
});

test.each([
  ['top', '12px', '6px'], ['bottom', '12px', '6px'], ['left', '6px', '12px'], ['right', '6px', '12px'],
] as const)('Tooltip placement=%s draws the 12x6 caret (%s x %s)', (placement, w, h) => {
  // `.tooltip-caret` 29972:2741: a 12x6 vector bound to scale/12.
  const c = caret(tip(<Tooltip visible placement={placement} content="c"><b>t</b></Tooltip>))!;
  expect(c.getAttribute('width')).toBe(w.replace('px', ''));
  expect(c.getAttribute('height')).toBe(h.replace('px', ''));
});

test('Tooltip caret takes the surface colour (white default, midnight dark)', () => {
  const path = (el: HTMLElement) => caret(el)!.querySelector('path')!.getAttribute('fill');
  expect(path(tip(<Tooltip visible content="c"><b>t</b></Tooltip>))).toBe('#ffffff');
  document.body.innerHTML = '';
  expect(path(tip(<Tooltip visible surface="dark" content="c"><b>t</b></Tooltip>))).toBe('#140f21');
});

test.each([
  ['left', 'right'], ['right', 'left'],
] as const)('Tooltip placement=%s pins the caret to the physical %s side, so RTL cannot mirror it away', (placement, side) => {
  // Rendered: as a flex row, dir="rtl" flipped the caret to the far side of the bubble.
  render(<div dir="rtl"><Tooltip visible placement={placement} content="c"><b>t</b></Tooltip></div>);
  const holder = caret(screen.getByRole('tooltip'))!.parentElement as HTMLElement;
  expect(holder.style.position).toBe('absolute');
  expect(holder.style[side]).toBe('0px');
});

test('Tooltip caret can be hidden (show-caret)', () => {
  expect(caret(tip(<Tooltip visible caret={false} content="c"><b>t</b></Tooltip>))).toBeNull();
});

test('Tooltip caretAlign start/end insets the caret by spacing/3xl', () => {
  const el = tip(<Tooltip visible caretAlign="start" content="c"><b>t</b></Tooltip>);
  const row = caret(el)!.parentElement as HTMLElement;
  expect(row.style.justifyContent).toBe('flex-start');
  expect(row.style.paddingInline).toBe('32px');
});

test.each([
  ['top', 'bottom'], ['bottom', 'top'], ['left', 'right'], ['right', 'left'],
] as const)('Tooltip placement=%s anchors from %s', (placement, anchored) => {
  const el = tip(<Tooltip visible placement={placement} content="c"><b>t</b></Tooltip>);
  expect(el.style[anchored as 'top']).toBe('calc(100% + 8px)');
});

test('Tooltip rich body is text/default/subtle; standard body is text/default/default', () => {
  render(<Tooltip visible size="rich" title="T" content="rich body"><b>t</b></Tooltip>);
  expect(screen.getByText('rich body').style.color).toBe('rgb(87, 83, 98)');
  document.body.innerHTML = '';
  render(<Tooltip visible size="standard" content="std body"><b>t</b></Tooltip>);
  expect(screen.getByText('std body').style.color).toBe('rgb(25, 19, 41)');
});

test('Tooltip rich close is a 32px r12 icon button on surface/base/default', () => {
  const onClose = vi.fn();
  render(<Tooltip visible size="rich" title="T" onClose={onClose} content="c"><b>t</b></Tooltip>);
  const btn = screen.getByRole('button', { name: 'Close' });
  expect(btn.style.width).toBe('32px');
  expect(btn.style.borderRadius).toBe('12px');
  expect(btn.style.background).toBe('rgb(240, 240, 245)');
  fireEvent.click(btn);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('Tooltip rich media is clipped to border-radius/7 (20)', () => {
  render(<Tooltip visible size="rich" media={<i>img</i>} content="c"><b>t</b></Tooltip>);
  const frame = screen.getByText('img').parentElement as HTMLElement;
  expect(frame.style.borderRadius).toBe('20px');
  expect(frame.style.overflow).toBe('hidden');
});

test('Tooltip renders rich-only slots only at size=rich', () => {
  render(<Tooltip visible size="rich" title="T" steps="1 of 3" action={<button>Next</button>} content="c"><b>t</b></Tooltip>);
  expect(screen.getByText('T')).toBeInTheDocument();
  expect(screen.getByText('1 of 3')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
});

test('Tooltip ignores rich slots at size=standard', () => {
  render(<Tooltip visible size="standard" title="T" steps="1 of 3" content="c"><b>t</b></Tooltip>);
  expect(screen.queryByText('T')).not.toBeInTheDocument();
  expect(screen.queryByText('1 of 3')).not.toBeInTheDocument();
});

test('Tooltip is absent until visible', () => {
  render(<Tooltip content="c"><b>t</b></Tooltip>);
  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
});

/* ---------------- BottomSheet — Figma V1.2 `bottom-sheet` 40299:160405 ----------------
   Built from `.bottom-sheet-core` 40283:142315 and `.bottom-sheet-header` 40298:154246.
   The previous build cited 29355:6240 and friends — unpublished V1.1 nodes. */

const sheet = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('dialog');
};

test('BottomSheet surface is surface/sunken/inverse #f0f0f5, not the white raised surface', () => {
  expect(sheet(<BottomSheet>body</BottomSheet>).style.background).toBe('rgb(240, 240, 245)');
});

test('BottomSheet corners bind border-radius/8 = 24', () => {
  const el = sheet(<BottomSheet>body</BottomSheet>);
  expect(el.style.borderStartStartRadius).toBe('24px');
  expect(el.style.borderStartEndRadius).toBe('24px');
});

test('BottomSheet sits on the shared Scrim', () => {
  render(<BottomSheet>body</BottomSheet>);
  const scrim = document.querySelector<HTMLElement>('[data-part="scrim"]')!;
  expect(scrim).not.toBeNull();
  expect(scrim.style.backdropFilter).toBe('blur(20px)');
});

test('BottomSheet grabber is 40x4, pill, surface/glass/midnight/md', () => {
  render(<BottomSheet>body</BottomSheet>);
  const g = screen.getByTestId('grabber');
  expect(g.style.width).toBe('40px');
  expect(g.style.height).toBe('4px');
  expect(g.style.borderRadius).toBe('9999px');
  expect(g.style.background).toBe('rgba(25, 19, 41, 0.2)');
});

test('BottomSheet grabber can be hidden, and system-message has none by default', () => {
  render(<BottomSheet grabber={false}>body</BottomSheet>);
  expect(screen.queryByTestId('grabber')).not.toBeInTheDocument();
  document.body.innerHTML = '';
  render(<BottomSheet type="system-message">body</BottomSheet>);
  expect(screen.queryByTestId('grabber')).not.toBeInTheDocument();
  document.body.innerHTML = '';
  render(<BottomSheet type="detailed">body</BottomSheet>);
  expect(screen.getByTestId('grabber')).toBeInTheDocument();
});

test('BottomSheet title is Bold 20/110%: font/size/6 bound over the heading/md style', () => {
  render(<BottomSheet title="Choose a plan">body</BottomSheet>);
  const t = screen.getByText('Choose a plan');
  expect(t.style.fontSize).toBe('20px');
  expect(t.style.fontWeight).toBe('700');
  expect(t.style.lineHeight).toBe('1.1');
  expect(t.style.color).toBe('rgb(25, 19, 41)');
});

test('BottomSheet header pads 20/20/0/20 and the body 0/20/20/20 (spacing/xl)', () => {
  const { container } = render(<BottomSheet title="T">body</BottomSheet>);
  expect(container.ownerDocument.querySelector<HTMLElement>('[data-part="title"]')!.style.padding).toBe('20px 20px 0px 20px');
  expect(container.ownerDocument.querySelector<HTMLElement>('[data-part="body"]')!.style.padding).toBe('0px 20px 20px');
});

test('BottomSheet close is a 40px solid section-link (r14, white) that calls onDismiss', () => {
  const onDismiss = vi.fn();
  render(<BottomSheet title="T" onDismiss={onDismiss}>body</BottomSheet>);
  const btn = screen.getByRole('button', { name: 'Close' });
  expect(btn.style.width).toBe('40px');
  expect(btn.style.height).toBe('40px');
  expect(btn.style.borderRadius).toBe('14px');
  expect(btn.style.background).toBe('rgb(255, 255, 255)');
  fireEvent.click(btn);
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('BottomSheet closeButton={false} hides the close but keeps scrim dismissal', () => {
  render(<BottomSheet title="T" closeButton={false} onDismiss={() => {}}>body</BottomSheet>);
  expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
});

test('BottomSheet icon is a 40px r12 tile and the description is body/md', () => {
  render(<BottomSheet title="T" icon={<i>logo</i>} description="More detail">body</BottomSheet>);
  const tile = screen.getByText('logo').parentElement as HTMLElement;
  expect(tile.style.width).toBe('40px');
  expect(tile.style.borderRadius).toBe('12px');
  const d = screen.getByText('More detail');
  expect(d.style.fontSize).toBe('14px');
  expect(d.style.fontWeight).toBe('400');
});

test('BottomSheet pills sit 16px under the title in a 4px-gap row', () => {
  render(<BottomSheet title="T" pills={<><i>a</i><i>b</i></>}>body</BottomSheet>);
  const row = screen.getByText('a').parentElement as HTMLElement;
  expect(row.style.gap).toBe('4px');
  expect(row.style.paddingTop).toBe('16px');
});

test('BottomSheet visual is framed: 4px inset, r16, glass close on top', () => {
  const onDismiss = vi.fn();
  render(<BottomSheet type="basic" title="T" visual={<i>vis</i>} onDismiss={onDismiss}>body</BottomSheet>);
  const media = screen.getByText('vis').parentElement as HTMLElement;
  expect(media.style.borderRadius).toBe('16px');
  expect((media.parentElement as HTMLElement).style.padding).toBe('4px 4px 0px 4px');
  const closes = screen.getAllByRole('button', { name: 'Close' });
  expect(closes).toHaveLength(1);
  expect(media.parentElement!.contains(closes[0])).toBe(true);
  expect(closes[0].style.background).toBe('rgba(255, 255, 255, 0.2)'); // section-link/glass/inverse
});

test('BottomSheet footer has no divider', () => {
  render(<BottomSheet footer={<button>Go</button>}>body</BottomSheet>);
  const foot = screen.getByRole('button', { name: 'Go' }).parentElement as HTMLElement;
  expect(foot.style.borderTop).toBe('');
});

test('BottomSheet still renders the deprecated subheader slot', () => {
  render(<BottomSheet title="T" subheader={<i>sub</i>}>body</BottomSheet>);
  expect(screen.getByText('sub')).toBeInTheDocument();
});

test.each([
  ['light', 'rgba(25, 19, 41, 0.2)', 'rgb(240, 240, 245)'],
  ['dark', 'rgba(255, 255, 255, 0.4)', 'rgb(20, 15, 33)'],
] as const)('BottomSheet deprecated display=%s: grabber %s, sheet %s', (display, grab, bg) => {
  const el = sheet(<BottomSheet display={display}>body</BottomSheet>);
  expect(screen.getByTestId('grabber').style.background).toBe(grab);
  expect(el.style.background).toBe(bg);
});

test('BottomSheet is absent when closed', () => {
  render(<BottomSheet open={false}>body</BottomSheet>);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

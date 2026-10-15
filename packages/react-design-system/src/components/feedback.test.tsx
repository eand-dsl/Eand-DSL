import { fireEvent, render, screen } from '@testing-library/react';
import { Alert, AlertModal, PlanUsageBar, Snackbar } from './feedback';

/* ---------------- Alert — Figma V1.2 `alert-message` 40289:34516 ----------------
   Built on `.alert-message-core` 37215:9573 (axis `State`). The previous build tracked
   30969:1112, a set whose frame reads "OUTDATED (do not use)"; every metric below moved.
   Each surface and tile colour was read off its own State variant. */

const banner = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('status');
};
const tileOf = (el: HTMLElement) => el.querySelector<HTMLElement>('[data-part="status-tile"]')!;

test.each([
  ['success', 'rgb(193, 247, 208)'],   // 37215:9572 status-indicator/surface/positive
  ['alert', 'rgb(255, 236, 171)'],     // 37215:9574 status-indicator/surface/warning
  ['warning', 'rgb(255, 209, 168)'],   // 37215:9592 status-indicator/surface/danger (#ffd1a8, was #ffc28b)
  ['info', 'rgb(228, 227, 234)'],      // 37215:9610 status-indicator/surface/neutral
  ['info-midnight', 'rgb(20, 15, 33)'], // 40290:36402 alert-message/surface/midnight
] as const)('Alert status=%s binds the status-indicator surface %s', (status, bg) => {
  expect(banner(<Alert status={status} title="t" />).style.background).toBe(bg);
});

test.each([
  ['success', 'rgb(59, 139, 83)', 'check-circle-filled'],  // status/positive
  ['alert', 'rgb(170, 145, 58)', 'warning-filled'],        // status/warning
  ['warning', 'rgb(184, 90, 26)', 'dismiss-filled'],       // status/danger
  ['info', 'rgb(25, 19, 41)', 'info-filled'],              // status/default
  ['info-midnight', 'rgba(255, 255, 255, 0.15)', 'info-filled'], // surface/glass/white/md
] as const)('Alert status=%s: 32px r12 tile on %s with a white %s glyph', (status, bg, glyph) => {
  const tile = tileOf(banner(<Alert status={status} title="t" />));
  // `.icon-alertmessage-status` 37211:7997: 32x32, border-radius/4, padding 6 — a tile, not a pill.
  expect(tile.style.width).toBe('32px');
  expect(tile.style.height).toBe('32px');
  expect(tile.style.borderRadius).toBe('12px');
  expect(tile.style.background).toBe(bg);
  const icon = tile.querySelector<HTMLElement>('[role="img"]')!;
  expect(icon).toHaveAttribute('aria-label', glyph);
  expect(icon.style.color).toBe('rgb(255, 255, 255)'); // text/default/inverse on every state
});

test('Alert box: padding spacing/sm 8, gap spacing/md 12, radius border-radius/6 16', () => {
  const el = banner(<Alert title="t" />);
  expect(el.style.padding).toBe('8px');
  expect(el.style.gap).toBe('12px');
  expect(el.style.borderRadius).toBe('16px');
});

test('Alert title is title/xs and the body is body/md, both text/default/default', () => {
  render(<Alert status="warning" title="Heads up">Something happened</Alert>);
  const title = screen.getByText('Heads up');
  const body = screen.getByText('Something happened');
  expect(title.style.fontSize).toBe('14px');
  expect(title.style.fontWeight).toBe('600');
  expect(body.style.fontSize).toBe('14px');
  expect(body.style.fontWeight).toBe('400');
  // The ink no longer follows the status: every State binds text/default/default.
  expect(title.style.color).toBe('rgb(25, 19, 41)');
  expect(body.style.color).toBe('rgb(25, 19, 41)');
});

test('Alert info-midnight flips the text to text/default/inverse', () => {
  render(<Alert status="info-midnight" title="Heads up">Body</Alert>);
  expect(screen.getByText('Body').style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('Heads up').style.color).toBe('rgb(255, 255, 255)');
});

test('Alert action is a primary / sm / inverse Button: a 32px white pill', () => {
  const onAction = vi.fn();
  render(<Alert status="success" action="Fix" onAction={onAction}>Body</Alert>);
  const btn = screen.getByRole('button', { name: 'Fix' });
  expect(btn.style.height).toBe('32px');
  expect(btn.style.background).toBe('rgb(255, 255, 255)'); // button/primary/surface/inverse/default
  expect(btn.style.color).toBe('rgb(25, 19, 41)');         // button/primary/text/inverse/default
  expect(btn.style.textDecoration).toBe('');
  fireEvent.click(btn);
  expect(onAction).toHaveBeenCalledTimes(1);
});

test('Alert actionPlacement="below" puts the CTA under the text block (Content=yes)', () => {
  const { container } = render(<Alert title="T" action="Fix" actionPlacement="below">Long body</Alert>);
  const btn = screen.getByRole('button', { name: 'Fix' });
  const text = container.querySelector<HTMLElement>('[data-part="text"]')!;
  expect(text.contains(btn)).toBe(true);
});

/* The V1.0 tone names swap in the middle: warning->alert, danger->warning. */
test.each([
  ['positive', 'success'],
  ['warning', 'alert'],
  ['danger', 'warning'],
  ['default', 'info'],
] as const)('Alert tone=%s still maps to status=%s', (tone, status) => {
  const { container: a } = render(<Alert tone={tone} title="t" />);
  const { container: b } = render(<Alert status={status} title="t" />);
  const bg = (c: Element) => (c.firstElementChild as HTMLElement).style.background;
  expect(bg(a)).toBe(bg(b));
});

test('Alert status wins when both status and tone are given; default is info', () => {
  expect(banner(<Alert status="success" tone="danger" title="t" />).style.background).toBe('rgb(193, 247, 208)');
});
test('Alert defaults to info', () => {
  expect(banner(<Alert title="t" />).style.background).toBe('rgb(228, 227, 234)');
});

test('Alert stack draws one step dot per stacked alert, the active one 5x12', () => {
  // `alert-step-count-core` 40278:33974 — 5x5 dots on color/midnight/400, active is 5x12.
  const { container } = render(<Alert title="t" stack={3} stackIndex={1} />);
  const dots = container.querySelectorAll<HTMLElement>('[data-part="step-dot"]');
  expect(dots).toHaveLength(3);
  expect([...dots].map((d) => d.style.height)).toEqual(['5px', '12px', '5px']);
  expect(dots[0].style.width).toBe('5px');
  expect(dots[0].style.background).toBe('rgb(168, 166, 177)'); // midnight/400 #a8a6b1
});

test('Alert without stack has no step counter', () => {
  const { container } = render(<Alert title="t" />);
  expect(container.querySelector('[data-part="step-dot"]')).toBeNull();
});

/* ---------------- PlanUsageBar (Figma .plan-usage-bar 28927:23669) ----------------
   A 48px filled block, not a thin meter: the remaining amount reads inside the fill on
   the left, the category label sits in the track on the right. Colours come from the
   `Progress status` axis (28927:22814) — Default green, low data orange. */

const valueText = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-part="value"]')!.textContent;

test('reads "<value> <unit> left" inside the fill and the category on the right', () => {
  const { container } = render(<PlanUsageBar label="Local Data" remaining={2} total={40} unit="GB" />);
  expect(valueText(container)).toBe('2GBleft');
  expect(screen.getByText('Local Data')).toBeInTheDocument();
});

test('the value is three runs spaced by spacing/2xs, not by space glyphs', () => {
  // `.plan-usage/value` 26437:43875: "2" | "GB" | "left", each frame padded 0/2/0/0.
  const { container } = render(<PlanUsageBar label="D" remaining={2} total={40} unit="GB" />);
  const runs = container.querySelectorAll<HTMLElement>('[data-part="value"] > span');
  expect([...runs].map((r) => r.textContent)).toEqual(['2', 'GB', 'left']);
  expect(runs[0].style.paddingInlineEnd).toBe('2px');
  expect(runs[1].style.paddingInlineEnd).toBe('2px');
  expect(runs[2].style.paddingInlineEnd).toBe('');
});

test('fills to the share remaining, not the share consumed', () => {
  const { container } = render(<PlanUsageBar label="Local Data" remaining={2} total={40} />);
  // Figma's master sits at 2 of 40 with the fill inset to 95% — a 5% block.
  expect(container.querySelector<HTMLElement>('[data-part="fill"]')!.style.width).toBe('5%');
});

test('is green by default and orange on low data', () => {
  const fill = (ui: React.ReactElement) =>
    render(ui).container.querySelector<HTMLElement>('[data-part="fill"]')!.style.background;
  expect(fill(<PlanUsageBar label="D" remaining={30} total={40} />)).toBe('rgb(84, 188, 114)');   // green/550 #54bc72
  expect(fill(<PlanUsageBar label="D" remaining={2} total={40} status="low-data" />)).toBe('rgb(255, 159, 82)'); // orange/500 #ff9f52
});

test('shows the expiry note only when given', () => {
  const { rerender } = render(<PlanUsageBar label="D" remaining={2} total={40} />);
  expect(screen.queryByText('Expires 3 days')).not.toBeInTheDocument();
  rerender(<PlanUsageBar label="D" remaining={2} total={40} note="Expires 3 days" />);
  expect(screen.getByText('Expires 3 days')).toBeInTheDocument();
});

test('clamps the fill instead of overflowing the track', () => {
  const w = (r: number, t: number) =>
    render(<PlanUsageBar label="D" remaining={r} total={t} />).container
      .querySelector<HTMLElement>('[data-part="fill"]')!.style.width;
  expect(w(50, 40)).toBe('100%');
  expect(w(-5, 40)).toBe('0%');
  expect(w(5, 0)).toBe('0%');   // no allowance -> nothing to draw, and no divide-by-zero
});

test('exposes the usage to assistive tech as a meter', () => {
  render(<PlanUsageBar label="Local Data" remaining={2} total={40} unit="GB" />);
  const meter = screen.getByRole('progressbar');
  expect(meter).toHaveAttribute('aria-valuenow', '2');
  expect(meter).toHaveAttribute('aria-valuemax', '40');
  expect(meter).toHaveAttribute('aria-valuetext', '2 GB left');
});

test('still accepts the deprecated used= alias', () => {
  const { container } = render(<PlanUsageBar label="Local Data" used={38} total={40} unit="GB" />);
  expect(valueText(container)).toBe('2GBleft');
});

/* `.plan-usage-bar-set` 33838:4470: when the fill reaches the value (progress 55 / 65)
   the value switches to `state=filled` — text/default/inverse at button/md (Medium), and
   the note follows. Default is midnight title/xs (SemiBold). */
test('value, note and label default to midnight ink with a title/xs value', () => {
  const { container } = render(<PlanUsageBar label="Local Data" remaining={2} total={40} note="Expires" />);
  const value = container.querySelector<HTMLElement>('[data-part="value"]')!;
  expect(value.style.color).toBe('rgb(25, 19, 41)');
  expect(value.style.fontWeight).toBe('600');
  expect(screen.getByText('Expires').style.color).toBe('rgb(25, 19, 41)');
  expect(screen.getByText('Local Data').style.color).toBe('rgb(25, 19, 41)');
});

test('valueState="filled" turns the value and note white at button/md', () => {
  const { container } = render(<PlanUsageBar label="Local Data" remaining={30} total={40} note="Expires" valueState="filled" />);
  const value = container.querySelector<HTMLElement>('[data-part="value"]')!;
  expect(value.style.color).toBe('rgb(255, 255, 255)');
  expect(value.style.fontWeight).toBe('500');
  expect(screen.getByText('Expires').style.color).toBe('rgb(255, 255, 255)');
  // The label is a separate state: it stays midnight until the fill reaches it.
  expect(screen.getByText('Local Data').style.color).toBe('rgb(25, 19, 41)');
});

test('labelState="filled" turns the label white', () => {
  render(<PlanUsageBar label="Local Data" remaining={40} total={40} labelState="filled" />);
  expect(screen.getByText('Local Data').style.color).toBe('rgb(255, 255, 255)');
});

test('the note is body/sm at the symbol line height of 130%', () => {
  render(<PlanUsageBar label="D" remaining={2} total={40} note="Expires 3 days" />);
  const note = screen.getByText('Expires 3 days');
  expect(note.style.fontSize).toBe('12px');
  expect(note.style.lineHeight).toBe('1.3');
});

test('auto mode switches to filled once the measured fill covers the value', () => {
  // jsdom has no layout, so stub the rects: track 0..295, fill 0..192, value 16..120.
  const rect = (left: number, width: number) => ({ left, right: left + width, width, top: 0, bottom: 48, height: 48, x: left, y: 0, toJSON() {} });
  const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const part = this.getAttribute('data-part');
    if (part === 'fill') return rect(0, 192) as DOMRect;
    if (part === 'value-block') return rect(16, 104) as DOMRect;
    if (part === 'label') return rect(209, 70) as DOMRect;
    return rect(0, 295) as DOMRect;
  });
  const { container } = render(<PlanUsageBar label="Local Data" remaining={26} total={40} />);
  spy.mockRestore();
  expect(container.querySelector<HTMLElement>('[data-part="value"]')!.style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('Local Data').style.color).toBe('rgb(25, 19, 41)');
});

/* ---------------- Snackbar — Figma V1.2 `Snack-bar` 40278:34192 / `.snack-bar-core` 37211:9193 ----------------
   The previous build cited `Snackbar` 23011:7020, a node that no longer exists. */

const pill = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('status');
};

test('Snackbar pill: radius 16, padding 2/8/2/2, surface/base/midnight, min-h 48', () => {
  const el = pill(<Snackbar status="success" message="Saved" />);
  expect(el.style.borderRadius).toBe('16px');
  expect(el.style.padding).toBe('2px 8px 2px 2px');
  expect(el.style.background).toBe('rgb(25, 19, 41)');
  expect(el.style.minHeight).toBe('48px');
});

test.each([
  ['success', 'rgb(193, 247, 208)', 'check-circle-filled'],
  ['alert', 'rgb(255, 236, 171)', 'warning-filled'],
  ['warning', 'rgb(255, 209, 168)', 'dismiss-filled'],
  ['info', 'rgb(228, 227, 234)', 'info-filled'],
] as const)('Snackbar status=%s: 44px r14 tile on %s with %s in alert-message/text/info', (status, bg, glyph) => {
  // `.icon-snackbar-status` 37211:9101 — design-questions #6 resolved: the legacy
  // #47cb6c / #d05d0a / #d5b549 colour styles are gone from V1.2.
  const tile = tileOf(pill(<Snackbar status={status} message="m" />));
  expect(tile.style.width).toBe('44px');
  expect(tile.style.height).toBe('44px');
  expect(tile.style.borderRadius).toBe('14px');
  expect(tile.style.background).toBe(bg);
  const icon = tile.querySelector<HTMLElement>('[role="img"]')!;
  expect(icon).toHaveAttribute('aria-label', glyph);
  expect(icon.style.color).toBe('rgb(25, 19, 41)');
});

test('Snackbar status=loader draws a midnight spinner on the neutral tile', () => {
  const tile = tileOf(pill(<Snackbar status="loader" message="Working" />));
  expect(tile.style.background).toBe('rgb(228, 227, 234)');
  expect(tile.querySelector('svg circle, svg path')).not.toBeNull();
});

test('Snackbar message is body/md Regular 14 in text/default/inverse', () => {
  render(<Snackbar status="success" message="Snackbar success" />);
  const t = screen.getByText('Snackbar success');
  expect(t.style.fontSize).toBe('14px');
  expect(t.style.fontWeight).toBe('400');
  expect(t.style.color).toBe('rgb(255, 255, 255)');
});

test('Snackbar aed renders the aed-text run beside the message', () => {
  render(<Snackbar status="success" message="Recharged" aed="AED 60.00" />);
  const aed = screen.getByText('AED 60.00');
  expect(aed.style.fontWeight).toBe('600');
  expect(aed.style.color).toBe('rgb(255, 255, 255)');
});

test('Snackbar action is a primary / sm / inverse Button, not an underlined link', () => {
  const onAction = vi.fn();
  render(<Snackbar status="success" message="Saved" action="Undo" onAction={onAction} />);
  const btn = screen.getByRole('button', { name: 'Undo' });
  expect(btn.style.textDecoration).toBe('');
  expect(btn.style.height).toBe('32px');
  expect(btn.style.background).toBe('rgb(255, 255, 255)');
  fireEvent.click(btn);
  expect(onAction).toHaveBeenCalledTimes(1);
});

test.each([
  ['positive', 'success'], ['warning', 'alert'], ['danger', 'warning'], ['loading', 'loader'],
] as const)('Snackbar deprecated tone=%s maps to status=%s', (tone, status) => {
  const a = tileOf(pill(<Snackbar tone={tone} message="a" />)).style.background;
  document.body.innerHTML = '';
  const b = tileOf(pill(<Snackbar status={status} message="b" />)).style.background;
  expect(a).toBe(b);
});

test('Snackbar defaults to the info mark (Figma has no mark-less snack bar)', () => {
  expect(tileOf(pill(<Snackbar message="m" />)).style.background).toBe('rgb(228, 227, 234)');
});

test('Snackbar deprecated tone="default" keeps the bare centred message', () => {
  const el = pill(<Snackbar tone="default" message="m" />);
  expect(el.querySelector('[data-part="status-tile"]')).toBeNull();
  expect(el.style.justifyContent).toBe('center');
});

test('Snackbar deprecated tone="loading" still centres', () => {
  expect(pill(<Snackbar tone="loading" message="Working" />).style.justifyContent).toBe('center');
});

test('Snackbar keeps the deprecated subtitle and onDismiss working', () => {
  const onDismiss = vi.fn();
  render(<Snackbar status="success" message="Saved" subtitle="Text for the info" onDismiss={onDismiss} />);
  expect(screen.getByText('Text for the info')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
  expect(onDismiss).toHaveBeenCalledTimes(1);
});

test('Snackbar backdrop wraps the pill in the back-ground=yes scrim (padding 0/16/32/16)', () => {
  const { container } = render(<Snackbar status="success" message="Saved" backdrop />);
  const wrap = container.firstElementChild as HTMLElement;
  expect(wrap.getAttribute('data-part')).toBe('backdrop');
  expect(wrap.style.padding).toBe('0px 16px 32px');
  expect(wrap.style.background).toContain('linear-gradient');
  expect(wrap.contains(screen.getByRole('status'))).toBe(true);
});

/* ---------------- AlertModal — Figma V1.2 `alert-modal` 32934:67842 ----------------
   A success screen (full-screen | bottom-sheet), not a centred dialog. */

test('AlertModal renders the alert-title: centred heading/lg 28 Bold + body/lg description', () => {
  render(<AlertModal open title="Payment complete" description="Order 123" onClose={() => {}} />);
  const title = screen.getByText('Payment complete');
  // `alert-title` 32934:66061 binds typography/heading/lg/* directly: 28 / 120% / -0.65.
  expect(title.style.fontSize).toBe('28px');
  expect(title.style.fontWeight).toBe('700');
  expect(title.style.lineHeight).toBe('1.2');
  expect(title.style.textAlign).toBe('center');
  const desc = screen.getByText('Order 123');
  expect(desc.style.fontSize).toBe('16px');
  expect(desc.style.textAlign).toBe('center');
});

test('AlertModal full-screen fills the viewport on surface/base/default', () => {
  render(<AlertModal open integration="full-screen" title="Done" />);
  const dlg = screen.getByRole('dialog');
  expect(dlg.style.position).toBe('fixed');
  expect(dlg.style.background).toBe('rgb(240, 240, 245)');
});

test('AlertModal bottom-sheet sits on a scrim with 24px top corners', () => {
  const { container } = render(<AlertModal open integration="bottom-sheet" title="Done" />);
  const dlg = screen.getByRole('dialog');
  expect(dlg.style.borderStartStartRadius).toBe('24px');
  expect(container.ownerDocument.querySelector('[data-part="scrim"]')).not.toBeNull();
});

test('AlertModal frames the visual slot with a 4px inset and renders the footer', () => {
  render(<AlertModal open title="Done" visual={<i>banner</i>} footer={<button>Continue</button>} />);
  const frame = screen.getByText('banner').parentElement as HTMLElement;
  expect(frame.style.padding).toBe('4px 4px 0px 4px');
  expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
});

test('AlertModal close is a 40px section-link that calls onClose', () => {
  const onClose = vi.fn();
  render(<AlertModal open title="Done" onClose={onClose} />);
  const btn = screen.getByRole('button', { name: 'Close' });
  expect(btn.style.width).toBe('40px');
  expect(btn.style.borderRadius).toBe('14px');
  // `top-group` > section-close is end-aligned (primaryAxisAlignItems MAX), 20 from the edges.
  const group = btn.parentElement as HTMLElement;
  expect(group.style.insetInlineEnd).toBe('0');
  expect(group.style.padding).toBe('20px 20px 0px 20px');
  fireEvent.click(btn);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('AlertModal keeps the deprecated centred dialog for body/actions callers', () => {
  render(<AlertModal open tone="warning" title="Confirm" body="Sure?" actions={<button>OK</button>} />);
  expect(screen.getByText('Sure?')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  expect(screen.getByRole('dialog').getAttribute('data-variant')).toBe('legacy-dialog');
});

test('AlertModal renders nothing when closed', () => {
  render(<AlertModal open={false} title="Done" />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

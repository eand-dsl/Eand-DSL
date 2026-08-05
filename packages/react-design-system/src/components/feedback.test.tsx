import { render, screen } from '@testing-library/react';
import { Alert, PlanUsageBar } from './feedback';

/* ---------------- Alert (Figma alert-message 30969:1112) ----------------
   Each surface/ink pair was read off its own `Staus` variant node. */

const banner = (ui: React.ReactElement) => {
  render(ui);
  return screen.getByRole('status');
};

test.each([
  ['success', 'rgb(193, 247, 208)'],  // 30969:1111 alert-message/surface/success
  ['alert', 'rgb(255, 236, 171)'],    // 30969:1113 alert-message/surface/alert
  ['warning', 'rgb(255, 194, 139)'],  // 30971:1160 alert-message/surface/warning
  ['info', 'rgb(228, 227, 234)'],     // 30971:1182 alert-message/surface/info
] as const)('Alert status=%s uses the Figma surface %s', (status, bg) => {
  expect(banner(<Alert status={status} title="t" />).style.background).toBe(bg);
});

/* The V1.0 tone names swap in the middle: warning->alert, danger->warning. */
test.each([
  ['positive', 'success'],
  ['warning', 'alert'],
  ['danger', 'warning'],
  ['default', 'info'],
] as const)('Alert tone=%s maps to status=%s', (tone, status) => {
  const { container: a } = render(<Alert tone={tone} title="t" />);
  const { container: b } = render(<Alert status={status} title="t" />);
  const bg = (c: Element) => (c.firstElementChild as HTMLElement).style.background;
  expect(bg(a)).toBe(bg(b));
});

test('Alert tone="warning" is the amber step, not the orange one', () => {
  const { container: amber } = render(<Alert tone="warning" title="t" />);
  const { container: orange } = render(<Alert status="warning" title="t" />);
  const bg = (c: Element) => (c.firstElementChild as HTMLElement).style.background;
  expect(bg(amber)).toBe('rgb(255, 236, 171)');
  expect(bg(orange)).toBe('rgb(255, 194, 139)');
  expect(bg(amber)).not.toBe(bg(orange));
});

test('Alert status wins when both status and tone are given', () => {
  expect(banner(<Alert status="success" tone="danger" title="t" />).style.background)
    .toBe('rgb(193, 247, 208)');
});

test('Alert defaults to info', () => {
  expect(banner(<Alert title="t" />).style.background).toBe('rgb(228, 227, 234)');
});

test('Alert radius binds border-radius/6 = 20', () => {
  expect(banner(<Alert title="t" />).style.borderRadius).toBe('20px');
});

test('Alert renders title, body and an action', () => {
  render(<Alert status="info" title="Heads up" action="Fix">Something happened</Alert>);
  expect(screen.getByText('Heads up')).toBeInTheDocument();
  expect(screen.getByText('Something happened')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Fix' })).toBeInTheDocument();
});

/* ---------------- PlanUsageBar (Figma .plan-usage-bar 28927:23669) ----------------
   A 48px filled block, not a thin meter: the remaining amount reads inside the fill on
   the left, the category label sits in the track on the right. Colours come from the
   `Progress status` axis (28927:22814) — Default green, low data orange. */

test('reads "<value> <unit> left" inside the fill and the category on the right', () => {
  render(<PlanUsageBar label="Local Data" remaining={2} total={40} unit="GB" />);
  expect(screen.getByText(/2\s*GB\s*left/)).toBeInTheDocument();
  expect(screen.getByText('Local Data')).toBeInTheDocument();
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
});

test('still accepts the deprecated used= alias', () => {
  render(<PlanUsageBar label="Local Data" used={38} total={40} unit="GB" />);
  expect(screen.getByText(/2\s*GB\s*left/)).toBeInTheDocument();
});

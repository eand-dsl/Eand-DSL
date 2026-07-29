import { render, screen } from '@testing-library/react';
import { Alert } from './feedback';

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

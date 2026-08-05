import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusRibbon, ButtonGroup, PaymentRow, CtaFooter } from './ctabar';
import { Button } from './Button';
import { Checkbox } from './controls';

test('PaymentRow keeps the masked identifier on one line', () => {
  // In a CtaFooter the actions never shrink, so PaymentRow absorbs the squeeze
  // and a masked card number must not break mid-token ("••••" over "4326").
  render(<PaymentRow label="•••• 4326" />);
  expect(screen.getByText('•••• 4326').style.whiteSpace).toBe('nowrap');
});

/* ---------------- StatusRibbon ---------------- */

test('StatusRibbon renders message and fires action', async () => {
  const fn = vi.fn();
  render(<StatusRibbon status="success" action="Action" onAction={fn}>Payment saved</StatusRibbon>);
  expect(screen.getByRole('status')).toHaveTextContent('Payment saved');
  await userEvent.click(screen.getByRole('button', { name: 'Action' }));
  expect(fn).toHaveBeenCalledTimes(1);
});

test.each([
  ['success', 'rgb(193, 247, 208)', 'rgb(22, 64, 37)'],
  ['alert', 'rgb(255, 236, 171)', 'rgb(85, 72, 29)'],
  ['warning', 'rgb(255, 194, 139)', 'rgb(97, 42, 5)'],
  ['info', 'rgb(228, 227, 234)', 'rgb(25, 19, 41)'],
] as const)('StatusRibbon %s uses the alert-message surface/text pair', (status, bg, fg) => {
  render(<StatusRibbon status={status}>msg</StatusRibbon>);
  const el = screen.getByRole('status');
  expect(el.style.background).toBe(bg);
  expect(el.style.color).toBe(fg);
});

/* ---------------- ButtonGroup ---------------- */

test('ButtonGroup vertical stacks primary above secondary with tertiary centered', () => {
  render(
    <ButtonGroup
      primary={<Button>Primary</Button>}
      secondary={<Button variant="secondary">Secondary</Button>}
      tertiary={<Button variant="tertiary">Tertiary</Button>}
    />,
  );
  const buttons = screen.getAllByRole('button');
  expect(buttons.map((b) => b.textContent)).toEqual(['Primary', 'Secondary', 'Tertiary']);
});

test('ButtonGroup horizontal puts secondary before primary in one row', () => {
  render(
    <ButtonGroup orientation="horizontal"
      primary={<Button>Primary</Button>}
      secondary={<Button variant="secondary">Secondary</Button>}
    />,
  );
  const buttons = screen.getAllByRole('button');
  expect(buttons.map((b) => b.textContent)).toEqual(['Secondary', 'Primary']);
  // both share one flex row parent-of-parent
  expect(buttons[0].parentElement!.parentElement).toBe(buttons[1].parentElement!.parentElement);
});

/* ---------------- PaymentRow ---------------- */

test('PaymentRow shows masked label and fires the change action', async () => {
  const fn = vi.fn();
  render(<PaymentRow icon={<span>logo</span>} label="•••• 4326" onAction={fn} />);
  expect(screen.getByText('•••• 4326')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Change' }));
  expect(fn).toHaveBeenCalledTimes(1);
});

/* ---------------- CtaFooter ---------------- */

test('CtaFooter composes ribbon, price, terms, actions and home indicator', () => {
  render(
    <CtaFooter
      ribbon={<StatusRibbon status="success">Saved</StatusRibbon>}
      price={{ label: 'Total amount', value: 'AED 1,250' }}
      terms={<Checkbox label="Agree to the Terms & Conditions" />}
      actions={<Button block>Primary</Button>}
      homeIndicator
    />,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Saved');
  expect(screen.getByText('Total amount')).toBeInTheDocument();
  expect(screen.getByText('AED 1,250')).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
});

test('CtaFooter payment variant renders PaymentRow beside the action', () => {
  render(
    <CtaFooter
      payment={<PaymentRow label="•••• 4326" />}
      actions={<Button>Primary</Button>}
    />,
  );
  expect(screen.getByText('•••• 4326')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Primary' })).toBeInTheDocument();
});

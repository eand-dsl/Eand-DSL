import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StatusRibbon, ButtonGroup, PaymentRow, CtaFooter, PriceLine, CheckboxLine, ActionBlock } from './ctabar';
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

/* ---------------- CtaFooter vs Figma `Footer` 29415:15497 ----------------
   This is where the V1.0 sticky-footer ActionBar was relocated to. */

test('CtaFooter lifts off the page with a shadow and no top border', () => {
  const { container } = render(<CtaFooter actions={<button>Pay</button>} />);
  const el = container.querySelector('footer')!;
  expect(el.style.boxShadow).toContain('44px');
  expect(el.style.borderTop).toBe('');
});

test('CtaFooter rounds its top corners by default', () => {
  const { container } = render(<CtaFooter actions={<button>Pay</button>} />);
  const el = container.querySelector('footer')!;
  expect(el.style.borderStartStartRadius).toBe('24px');
  expect(el.style.borderStartEndRadius).toBe('24px');
});

/* ======================================================================
   V1.2 reconciliation — Figma "e& Consumer App DSL V1.2", CTA Bar page 31501:35139.
   Each test names the published node and what the code had wrong.
   ====================================================================== */

/* ---- .status-ribbon 31577:2612 (+ -rtl 38351:30443) ---- */

test('StatusRibbon pads 4/20 and spaces icon and label 4px apart (31577:2612)', () => {
  // Was `padding: 0 16px` and gap 8. Figma binds spacing/xs (4) block, spacing/xl (20) inline.
  render(<StatusRibbon leadingIcon={<i />}>msg</StatusRibbon>);
  const el = screen.getByRole('status');
  expect(el.style.paddingBlock).toBe('4px');
  expect(el.style.paddingInline).toBe('20px');
  expect(el.style.height).toBe('40px');
  expect(el.style.gap).toBe('4px');
  expect(el.style.justifyContent).toBe('space-between');
  const textBlock = screen.getByText('msg').parentElement!;
  expect(textBlock.style.gap).toBe('4px');
});

test('StatusRibbon leading icon sits in a 24px box (icon-size xl, 31577:2612)', () => {
  // Was IconBox size="lg" (20px).
  render(<StatusRibbon leadingIcon={<i data-testid="ico" />}>msg</StatusRibbon>);
  const box = screen.getByTestId('ico').parentElement!;
  expect(box.style.width).toBe('24px');
  expect(box.style.height).toBe('24px');
});

test.each(['success', 'alert', 'warning', 'info'] as const)(
  'StatusRibbon %s action is the midnight link ink, not the status ink (31577:2612)',
  (status) => {
    // Figma: `button type=link size=md scheme=midnight` -> button/link/text/midnight/default
    // #191329, body/md, gap 0 to its trailing icon. Code used the status text colour, gap 4.
    render(<StatusRibbon status={status} action="Action" trailingIcon={<i />}>msg</StatusRibbon>);
    const btn = screen.getByRole('button', { name: 'Action' });
    expect(btn.style.color).toBe('rgb(25, 19, 41)');
    expect(btn.style.fontSize).toBe('14px');
    expect(btn.style.fontWeight).toBe('400');
    expect(btn.style.gap).toBe('0px');
  },
);

/* ---- .button-group-vertical 31617:958 / -horizontal 31617:1293 ---- */

test('ButtonGroup vertical stacks with 20px between buttons (spacing/xl, 31617:958)', () => {
  // Was 12 (spacing/md) for both orientations.
  const { container } = render(
    <ButtonGroup primary={<Button>P</Button>} secondary={<Button variant="secondary">S</Button>} />,
  );
  expect((container.firstChild as HTMLElement).style.gap).toBe('20px');
});

test('ButtonGroup horizontal keeps 12px gaps, row and column (spacing/md, 31617:1293)', () => {
  const { container } = render(
    <ButtonGroup orientation="horizontal" primary={<Button>P</Button>}
      secondary={<Button variant="secondary">S</Button>} tertiary={<Button variant="tertiary">T</Button>} />,
  );
  const root = container.firstChild as HTMLElement;
  expect(root.style.gap).toBe('12px');
  expect((root.firstChild as HTMLElement).style.gap).toBe('12px');
});

/* ---- PaymentRow: the payment=true molecule of .action-block 31617:1498 ---- */

test('PaymentRow matches the Figma payment frame: gap 12, 8px tile, body/md label (31617:1498)', () => {
  // Was gap 8, radius('4') = 12px, title.xs label, 2px text gap.
  const { container } = render(<PaymentRow icon={<i data-testid="logo" />} label="•••• 4326" />);
  const row = container.firstChild as HTMLElement;
  expect(row.style.gap).toBe('12px');
  const tile = screen.getByTestId('logo').parentElement!;
  expect(tile.style.width).toBe('40px');
  expect(tile.style.borderRadius).toBe('8px');
  const label = screen.getByText('•••• 4326');
  expect(label.style.fontSize).toBe('14px');
  expect(label.style.fontWeight).toBe('400');
  expect(label.style.color).toBe('rgb(25, 19, 41)');
  expect(label.parentElement!.style.gap).toBe('4px');
});

test('PaymentRow "Change" is a tertiary Button (button/tertiary/text/brand/default)', () => {
  // Was a bare <button> styled with text.brand.default.
  render(<PaymentRow label="•••• 4326" />);
  const btn = screen.getByRole('button', { name: 'Change' });
  expect(btn.getAttribute('type')).toBe('button');
  expect(btn.style.color).toBe('rgb(224, 8, 0)');
  expect(btn.style.background).toBe('transparent');
});

/* ---- price-line 33496:60459 ---- */

test('PriceLine: 12px top / 20px side padding, subtle body/md label, title/xs value (33496:60459)', () => {
  // CtaFooter's price row used `padding: 20 20 0` and a title.sm (16px) value.
  const { container } = render(<PriceLine label="Total amount" value="AED 1,250" />);
  const el = container.firstChild as HTMLElement;
  expect(el.style.paddingTop).toBe('12px');
  expect(el.style.paddingInline).toBe('20px');
  expect(el.style.alignItems).toBe('flex-start');
  const label = screen.getByText('Total amount');
  expect(label.style.color).toBe('rgb(87, 83, 98)');
  expect(label.style.fontSize).toBe('14px');
  const value = screen.getByText('AED 1,250');
  expect(value.style.fontSize).toBe('14px');
  expect(value.style.fontWeight).toBe('600');
});

test('PriceLine renders the tertiary button under the label (33496:60459)', async () => {
  const fn = vi.fn();
  render(<PriceLine label="Total" value="AED 5" actionLabel="View details" onAction={fn} actionIcon={<i data-testid="chev" />} />);
  const btn = screen.getByRole('button', { name: 'View details' });
  expect(btn.style.color).toBe('rgb(224, 8, 0)');
  expect(btn.contains(screen.getByTestId('chev'))).toBe(true);
  await userEvent.click(btn);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('PriceLine keeps the deprecated code-only note under the value', () => {
  render(<PriceLine label="Total" value="AED 5" note="Incl. VAT" />);
  expect(screen.getByText('Incl. VAT')).toBeInTheDocument();
});

/* ---- checkbox line: checkbox-variants 33489:12153 / core 38351:31883 ---- */

test('CheckboxLine composes checkbox, lead-in, links and description (33489:12153)', async () => {
  const onTerms = vi.fn();
  render(
    <CheckboxLine label="Agree to" description="before proceeding"
      links={[{ label: 'T&C’s', onClick: onTerms }, { label: 'Privacy Policy' }]} />,
  );
  const box = screen.getByRole('checkbox');
  expect(screen.getByText('Agree to')).toBeInTheDocument();
  expect(screen.getByText('and')).toBeInTheDocument();
  expect(screen.getByText('before proceeding')).toBeInTheDocument();
  // Link buttons sit inside the <label> but must not toggle the checkbox.
  await userEvent.click(screen.getByRole('button', { name: 'T&C’s' }));
  expect(onTerms).toHaveBeenCalledTimes(1);
  expect(box).not.toBeChecked();
  await userEvent.click(screen.getByText('Agree to'));
  expect(box).toBeChecked();
});

test('CheckboxLine link is the brand link button; inverse uses inverse-subtle copy (33489:12153)', () => {
  render(<CheckboxLine inverse label="Agree to" links={[{ label: 'Terms' }]} />);
  expect(screen.getByRole('button', { name: 'Terms' }).style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('Agree to').style.color).toBe('rgba(255, 255, 255, 0.75)');
});

test('CheckboxLine default copy and link colours (checkbox-variants inverse=false)', () => {
  render(<CheckboxLine label="Agree to" links={[{ label: 'Terms' }]} />);
  expect(screen.getByRole('button', { name: 'Terms' }).style.color).toBe('rgb(224, 8, 0)');
  expect(screen.getByText('Agree to').style.color).toBe('rgb(25, 19, 41)');
});

test('CheckboxLine disabled disables its links too (checkbox-variants disabled=true)', () => {
  render(<CheckboxLine disabled label="Agree to" links={[{ label: 'Terms' }]} />);
  expect(screen.getByRole('button', { name: 'Terms' })).toBeDisabled();
  expect(screen.getByText('Agree to').style.color).toBe('rgb(192, 191, 200)');
});

/* ---- .action-block 31617:1499 ---- */

test('ActionBlock slot paddings follow the symbol: price 12, checkbox 16, buttons 20 (31617:1497)', () => {
  // Code had 20/20/16 for price/terms/actions.
  render(
    <ActionBlock
      price={{ label: 'Total', value: 'AED 5' }}
      terms={<span data-testid="terms" />}
      actions={<span data-testid="actions" />}
    />,
  );
  const price = screen.getByText('Total').closest('[data-slot="price-line"]') as HTMLElement;
  expect(price.style.paddingTop).toBe('12px');
  expect(screen.getByTestId('terms').parentElement!).toHaveStyle({ paddingTop: '16px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '0px' });
  expect(screen.getByTestId('actions').parentElement!).toHaveStyle({ paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '0px' });
});

test('ActionBlock payment row: 16/20/0 padding, 2px gap, payment and button take half each (31617:1498)', () => {
  render(<ActionBlock payment={<span data-testid="pay" />} actions={<Button>Confirm</Button>} />);
  const pay = screen.getByTestId('pay').parentElement!;
  const row = pay.parentElement!;
  expect(row).toHaveStyle({ paddingTop: '16px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '0px' });
  expect(row.style.gap).toBe('2px');
  const act = screen.getByRole('button', { name: 'Confirm' }).parentElement!;
  expect(pay.style.flex).toBe('1 1 0px');
  expect(act.style.flex).toBe('1 1 0px');
  expect(act.style.display).toBe('flex');
  expect(act.style.flexDirection).toBe('column');
});

test('ActionBlock order: ribbon, price, checkbox line, actions (31617:1499)', () => {
  const { container } = render(
    <ActionBlock ribbon={<StatusRibbon>r</StatusRibbon>} price={{ label: 'p', value: 'v' }}
      terms={<span>t</span>} actions={<span>a</span>} />,
  );
  expect((container.firstChild as HTMLElement).textContent).toBe('rpvta');
});

/* ---- cta-bar 31617:1007 + surface 32934:71710 ---- */

test('CtaFooter shadow is the effects/shadow/md token at 10% (31617:1007)', () => {
  // Was a hand-typed 15% shadow from a V1.1 node; V1.2 binds effects/shadow/md + midnight/a10.
  const { container } = render(<CtaFooter actions={<button>Pay</button>} />);
  const el = container.querySelector('footer')!;
  expect(el.style.boxShadow).toMatch(/^0px 0px 44px 0px rgba\(25, 19, 41, 0\.10?\)$/);
  expect(el.style.background).toBe('rgb(255, 255, 255)');
});

test('CtaFooter surface=false is transparent with no shadow (cta-bar `surface` boolean)', () => {
  const { container } = render(<CtaFooter surface={false} actions={<button>Pay</button>} />);
  const el = container.querySelector('footer')!;
  expect(el.style.background).toBe('transparent');
  expect(el.style.boxShadow).toBe('none');
});

test('CtaFooter home indicator is on by default and is a 34px block (cta-bar home-indicator=true)', () => {
  const { container } = render(<CtaFooter actions={<button>Pay</button>} />);
  const hi = container.querySelector('[data-slot="home-indicator"]') as HTMLElement;
  expect(hi).not.toBeNull();
  expect(hi.style.height).toBe('34px');
  const bar = hi.firstChild as HTMLElement;
  expect(bar.style.width).toBe('144px');
  expect(bar.style.height).toBe('5px');
});

test('CtaFooter without the home indicator adds no bottom padding (follows the symbol)', () => {
  const { container } = render(<CtaFooter homeIndicator={false} actions={<button>Pay</button>} />);
  expect(container.querySelector('[data-slot="home-indicator"]')).toBeNull();
  expect(container.querySelector('footer')!.style.paddingBottom).toBe('');
});

test('CtaFooter price accepts the V1.2 action and renders it as a PriceLine', () => {
  render(<CtaFooter price={{ label: 'Total', value: 'AED 5', actionLabel: 'Details' }} actions={<button>Pay</button>} />);
  expect(screen.getByRole('button', { name: 'Details' })).toBeInTheDocument();
  expect(screen.getByText('AED 5').style.fontSize).toBe('14px');
});

/* Button tertiary now hugs its 21px label (V1.2 25394:85067), so the group's own row
   padding matters: in `button-group` 31617:958 / 31617:1293 the tertiary instance is a
   full-width row with spacing/sm (8px) above and below — 37px tall, not a bare 21px. */
test('ButtonGroup gives the tertiary row 8px block padding (spacing/sm)', () => {
  const { getByText } = render(
    <ButtonGroup primary={<Button>P</Button>} tertiary={<Button variant="tertiary">T</Button>} />,
  );
  const row = getByText('T').closest('button')!.parentElement as HTMLElement;
  expect(row.style.paddingBlock).toBe('8px');
  expect(row.style.justifyContent).toBe('center');
});

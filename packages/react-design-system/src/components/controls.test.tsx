import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, ConsentCheckbox, Radio, Chip, FilterPill, Searchbar, Input, OtpInput, Picker, PickerOption, Tabs, Switcher } from './controls';

/* ---------------- Switcher vs Figma V1.2 `switcher` 26215:7141 ----------------
   Was 56×24 / 48×20 (the stale statesheet prose); the published symbols, the bound
   switcher/track/* variables and the new description all say 40×24 / 32×20 — design
   question #1 resolved by the source-of-truth rule. Colours were surface.* tokens plus a
   literal #fff knob and opacity .5 for disabled; Figma binds color/mark/* per state. */

const track = () => screen.getByRole('switch');
const knob = () => track().firstElementChild as HTMLElement;

test.each([
  ['md', '40px', '24px', '20px'],
  ['lg', '40px', '24px', '20px'], // deprecated alias of md (Figma small=false)
  ['sm', '32px', '20px', '16px'],
] as const)('Switcher size=%s is %s×%s with a %s knob (switcher/track, switcher/thumb)', (size, w, h, k) => {
  render(<Switcher size={size} />);
  expect(track().style.width).toBe(w);
  expect(track().style.height).toBe(h);
  expect(knob().style.width).toBe(k);
  expect(knob().style.height).toBe(k);
});

test.each([
  // [label, props, track, knob]
  ['off', {}, 'rgb(192, 191, 200)', 'rgb(255, 255, 255)'],                          // mark/default/surface/default, icon/default
  ['on', { checked: true }, 'rgb(224, 8, 0)', 'rgb(255, 255, 255)'],                 // surface/selected, icon/selected
  ['off disabled', { disabled: true }, 'rgb(216, 215, 222)', 'rgb(240, 240, 245)'],  // surface/disabled, icon/disabled
  ['on disabled', { checked: true, disabled: true }, 'rgb(216, 215, 222)', 'rgb(144, 142, 154)'], // selected-disabled
  ['inverse off', { inverse: true }, 'rgb(192, 191, 200)', 'rgb(255, 255, 255)'],    // mark/inverse/surface/default (sm symbol)
  ['inverse on', { inverse: true, checked: true }, 'rgb(255, 255, 255)', 'rgb(224, 8, 0)'], // mark/inverse/surface|icon/selected
  ['inverse off disabled', { inverse: true, disabled: true }, 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.6)'],
  ['inverse on disabled', { inverse: true, checked: true, disabled: true }, 'rgba(255, 255, 255, 0.4)', 'rgb(228, 227, 234)'], // knob: surface/sunken/default per symbol
] as const)('Switcher %s binds the mark tokens, no opacity', (_l, props, t, k) => {
  render(<Switcher {...props} />);
  expect(track().style.background).toBe(t);
  expect(knob().style.background).toBe(k);
  expect(track().style.opacity).toBe('');
});

test('Switcher toggles and reports the new state; disabled does not', async () => {
  const fn = vi.fn();
  const { rerender } = render(<Switcher onChange={fn} />);
  await userEvent.click(track());
  expect(fn).toHaveBeenLastCalledWith(true);
  expect(track()).toHaveAttribute('aria-checked', 'true');
  rerender(<Switcher onChange={fn} disabled />);
  await userEvent.click(track());
  expect(fn).toHaveBeenCalledTimes(1);
});

/* ---------------- Checkbox ---------------- */

test('Checkbox toggles and fires onChange', async () => {
  const fn = vi.fn();
  render(<Checkbox label="Terms" onChange={fn} />);
  const input = screen.getByRole('checkbox');
  await userEvent.click(input);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(input).toBeChecked();
});

test('Checkbox disabled blocks toggling', async () => {
  const fn = vi.fn();
  render(<Checkbox label="Terms" disabled onChange={fn} />);
  await userEvent.click(screen.getByRole('checkbox'));
  expect(fn).not.toHaveBeenCalled();
});

test('Checkbox md (default) renders a 20×20 styled control', () => {
  render(<Checkbox label="md" />);
  const control = screen.getByRole('checkbox').parentElement!;
  expect(control.style.width).toBe('20px');
  expect(control.style.height).toBe('20px');
});

test('Checkbox sm renders a 16×16 styled control', () => {
  render(<Checkbox label="sm" size="sm" />);
  const control = screen.getByRole('checkbox').parentElement!;
  expect(control.style.width).toBe('16px');
  expect(control.style.height).toBe('16px');
});

test('Checkbox checked fills the brand surface on the default scheme', () => {
  render(<Checkbox label="on" defaultChecked />);
  const control = screen.getByRole('checkbox').parentElement!;
  // jsdom normalizes hex -> rgb
  expect(control.style.background).toMatch(/#e00800|rgb\(224,\s*8,\s*0\)/i);
});

test('Checkbox inverse checked fills the inverse (white) surface', () => {
  render(<Checkbox label="inv" inverse defaultChecked />);
  const control = screen.getByRole('checkbox').parentElement!;
  expect(control.style.background).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
});

test('Checkbox radio variant renders a circular radio input', () => {
  render(<Checkbox label="radio" radio />);
  const input = screen.getByRole('radio');
  expect(input.parentElement!.style.borderRadius).toBe('50%');
});

/* Checkbox vs Figma V1.2 `checkbox` 27685:5017 (07.07.2026 token revamp). The tick was a
   hand-drawn <polyline> at 80% of the box (rule 4; 12.8px at sm where Figma is 8px). Figma
   instances the icon-set `check` (filled) — 12px in a 16px icon-size at md, 8px in 12px at sm. */

test.each([
  ['md', '16px', 12],
  ['sm', '12px', 8],
] as const)('Checkbox %s tick is the icon-set check-filled glyph in a %s box, not a hand-drawn path', (size, box, glyph) => {
  const { container } = render(<Checkbox label="x" size={size} defaultChecked />);
  expect(container.querySelector('polyline')).toBeNull();
  const icon = container.querySelector('[aria-label="check-filled"]') as HTMLElement;
  expect(icon).toBeInTheDocument();
  expect((icon.parentElement as HTMLElement).style.width).toBe(box);
  expect(icon.querySelector('svg')!.getAttribute('width')).toBe(String(glyph));
});

test.each([
  // [label, props, box background, box border, tick colour]
  ['default on', { defaultChecked: true }, 'rgb(224, 8, 0)', null, 'rgb(255, 255, 255)'],
  ['default on disabled', { defaultChecked: true, disabled: true }, 'rgb(216, 215, 222)', null, 'rgb(144, 142, 154)'],
  ['default off', {}, 'transparent', 'rgb(144, 142, 154)', null],
  ['default off disabled', { disabled: true }, 'transparent', 'rgb(216, 215, 222)', null],
  ['inverse on', { inverse: true, defaultChecked: true }, 'rgb(255, 255, 255)', null, 'rgb(224, 8, 0)'],
  ['inverse on disabled', { inverse: true, defaultChecked: true, disabled: true }, 'rgba(255, 255, 255, 0.4)', null, 'rgba(255, 255, 255, 0.6)'],
  ['inverse off', { inverse: true }, 'transparent', 'rgb(255, 255, 255)', null],
  ['inverse off disabled', { inverse: true, disabled: true }, 'transparent', 'rgba(255, 255, 255, 0.4)', null],
] as const)('Checkbox %s binds color/mark/*', (_l, props, bg, border, tick) => {
  const { container } = render(<Checkbox label="x" {...props} />);
  const box = screen.getByRole('checkbox').parentElement!;
  expect(box.style.background).toBe(bg);
  if (border) expect(box.style.border).toContain(border);
  if (tick) expect((container.querySelector('[aria-label="check-filled"]') as HTMLElement).style.color).toBe(tick);
});

test.each([
  // The consent row (checkbox-variants 33489:12153) carries the label colours.
  ['default', {}, 'rgb(25, 19, 41)'],
  ['default disabled', { disabled: true }, 'rgb(192, 191, 200)'],
  ['inverse', { inverse: true }, 'rgba(255, 255, 255, 0.75)'],         // was text/default/inverse (100%)
  ['inverse disabled', { inverse: true, disabled: true }, 'rgba(255, 255, 255, 0.5)'], // was inverse-muted (60%)
] as const)('Checkbox %s label colour follows checkbox-variants', (_l, props, fg) => {
  render(<Checkbox label="Agree" {...props} />);
  expect(screen.getByText('Agree').style.color).toBe(fg);
});

/* ConsentCheckbox — Figma `checkbox-variants` 33489:12153 + `.checkbox-core-variants-core`
   38351:31883: checkbox md + "Agree to" + link + "and" + link + "before proceeding", body/md,
   gap 8, links are `button type=link size=md` (body/md, 2px inline padding, no underline). */

test('ConsentCheckbox composes prefix, two links joined by "and", and suffix', async () => {
  const onTerms = vi.fn();
  render(
    <ConsentCheckbox prefix="Agree to" suffix="before proceeding"
      links={[{ label: "T&C's", onClick: onTerms }, { label: 'Privacy Policy', href: '/privacy' }]} />,
  );
  expect(screen.getByText('Agree to')).toBeInTheDocument();
  expect(screen.getByText('and')).toBeInTheDocument();
  expect(screen.getByText('before proceeding')).toBeInTheDocument();
  const terms = screen.getByRole('button', { name: "T&C's" });
  const privacy = screen.getByRole('link', { name: 'Privacy Policy' });
  expect(privacy).toHaveAttribute('href', '/privacy');
  expect(terms.style.color).toBe('rgb(224, 8, 0)'); // button/link/text/brand/default
  expect(terms.style.fontSize).toBe('14px');
  expect(terms.style.paddingInline).toBe('2px');
  // Clicking a link does not toggle the checkbox.
  await userEvent.click(terms);
  expect(onTerms).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  await userEvent.click(screen.getByText('Agree to'));
  expect(screen.getByRole('checkbox')).toBeChecked();
});

test('ConsentCheckbox inverse and disabled use the inverse link tokens and disabled links', () => {
  render(<ConsentCheckbox inverse disabled prefix="Agree to" links={[{ label: 'Terms', onClick: () => {} }]} />);
  const link = screen.getByRole('button', { name: 'Terms' });
  expect(link).toBeDisabled();
  expect(link.style.color).toBe('rgba(255, 255, 255, 0.5)'); // button/link/text/inverse/disabled
  expect(screen.getByText('Agree to').style.color).toBe('rgba(255, 255, 255, 0.5)'); // text/default/inverse-disabled
});

/* ---------------- Radio ---------------- */

test('Radio selects on click and fires onChange', async () => {
  const fn = vi.fn();
  render(<Radio label="Option A" onChange={fn} />);
  const input = screen.getByRole('radio');
  await userEvent.click(input);
  expect(fn).toHaveBeenCalledTimes(1);
  expect(input).toBeChecked();
});

test('Radio lg (default) renders a 24×24 styled control', () => {
  render(<Radio label="lg" />);
  const control = screen.getByRole('radio').parentElement!;
  expect(control.style.width).toBe('24px');
  expect(control.style.height).toBe('24px');
});

test('Radio sm renders a 20×20 styled control', () => {
  render(<Radio label="sm" size="sm" />);
  const control = screen.getByRole('radio').parentElement!;
  expect(control.style.width).toBe('20px');
  expect(control.style.height).toBe('20px');
});

test('Radio selected shows a brand dot on the default scheme', () => {
  render(<Radio label="on" defaultChecked />);
  const control = screen.getByRole('radio').parentElement!;
  const dot = control.querySelector('span')!;
  expect(dot.style.background).toMatch(/#e00800|rgb\(224,\s*8,\s*0\)/i);
});

test('Radio inverse selected shows a white dot and white ring', () => {
  render(<Radio label="inv" inverse defaultChecked />);
  const control = screen.getByRole('radio').parentElement!;
  expect(control.style.border).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
  const dot = control.querySelector('span')!;
  expect(dot.style.background).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
});

/* Radio vs Figma V1.2 `radio-button` 26369:775: a 2px inside ring (`border/lg`, was 1px), a
   16px dot in the 24 control and 12px in the 20 (`scale/16|12`, was 50% = 12/10), and
   disabled as colours (was opacity .5). */

test.each([
  ['lg', '16px'],
  ['sm', '12px'],
] as const)('Radio %s has a 2px ring and a %s dot', (size, dot) => {
  render(<Radio label="x" size={size} defaultChecked />);
  const control = screen.getByRole('radio').parentElement!;
  expect(control.style.border).toMatch(/^2px solid/);
  const d = control.querySelector('span')!;
  expect(d.style.width).toBe(dot);
  expect(d.style.height).toBe(dot);
});

test.each([
  // [label, props, ring, dot]
  ['off', {}, 'rgb(144, 142, 154)', null],                                    // #908e9a = mark/default/border/default
  ['on', { defaultChecked: true }, 'rgb(224, 8, 0)', 'rgb(224, 8, 0)'],        // mark/default/surface/selected
  ['off disabled', { disabled: true }, 'rgb(216, 215, 222)', null],           // #d8d7de
  ['on disabled', { defaultChecked: true, disabled: true }, 'rgb(216, 215, 222)', 'rgb(216, 215, 222)'],
  ['inverse off disabled', { inverse: true, disabled: true }, 'rgba(255, 255, 255, 0.4)', null],
  ['inverse on disabled', { inverse: true, defaultChecked: true, disabled: true }, 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.4)'],
] as const)('Radio %s uses colour tokens, not opacity', (_l, props, ring, dot) => {
  render(<Radio label="Opt" {...props} />);
  const control = screen.getByRole('radio').parentElement!;
  expect(control.style.border).toContain(ring);
  if (dot) expect(control.querySelector('span')!.style.background).toBe(dot);
  expect(control.parentElement!.style.opacity).toBe('');
});

test('Radio disabled label uses the disabled ink instead of dimming the row', () => {
  const { rerender } = render(<Radio label="Opt" disabled />);
  expect(screen.getByText('Opt').style.color).toBe('rgb(192, 191, 200)');
  rerender(<Radio label="Opt" inverse />);
  expect(screen.getByText('Opt').style.color).toBe('rgba(255, 255, 255, 0.75)');
});

/* ---------------- Chip ---------------- */

test('Chip fires onClick and reflects selected via aria-pressed', async () => {
  const fn = vi.fn();
  render(<Chip selected onClick={fn}>5G</Chip>);
  const chip = screen.getByRole('button', { name: '5G' });
  expect(chip).toHaveAttribute('aria-pressed', 'true');
  await userEvent.click(chip);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('Chip inverse (unselected) uses inverse text and border on a transparent surface', () => {
  render(<Chip inverse>Data</Chip>);
  const chip = screen.getByRole('button', { name: 'Data' });
  expect(chip.style.background).toBe('transparent');
  expect(chip.style.color).toMatch(/rgba\(255,\s*255,\s*255,\s*0?\.7\d*\)/i);
  expect(chip.style.border).toMatch(/rgba\(255,\s*255,\s*255,\s*0?\.4\d*\)/i);
});

test('Chip inverse selected fills white with muted-ink text', () => {
  render(<Chip inverse selected>Data</Chip>);
  const chip = screen.getByRole('button', { name: 'Data' });
  expect(chip.style.background).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
  expect(chip.style.color).toMatch(/#575362|rgb\(87,\s*83,\s*98\)/i);
});

/* ---------------- FilterPill ---------------- */

test('FilterPill fires onClick when enabled', async () => {
  const fn = vi.fn();
  render(<FilterPill onClick={fn}>Price</FilterPill>);
  await userEvent.click(screen.getByRole('button'));
  expect(fn).toHaveBeenCalledTimes(1);
});

test('FilterPill disabled blocks the click and styles with disabled tokens', async () => {
  const fn = vi.fn();
  render(<FilterPill disabled onClick={fn}>Price</FilterPill>);
  const pill = screen.getByRole('button');
  await userEvent.click(pill);
  expect(fn).not.toHaveBeenCalled();
  expect(pill).toBeDisabled();
  // V1.2: filter-pill/text/default/disabled moved from text/default/disabled (#c0bfc8)
  // to text/default/muted (#908e9a).
  expect(pill.style.color).toMatch(/#908e9a|rgb\(144,\s*142,\s*154\)/i);
});

test('FilterPill selected (Figma State=Focused) uses the focus border on the default scheme', () => {
  render(<FilterPill selected>Price</FilterPill>);
  const pill = screen.getByRole('button');
  expect(pill).toHaveAttribute('aria-pressed', 'true');
  expect(pill.style.border).toMatch(/#191329|rgb\(25,\s*19,\s*41\)/i);
});

test('FilterPill inverse (unselected) uses inverse text and border on a transparent surface', () => {
  render(<FilterPill inverse>Price</FilterPill>);
  const pill = screen.getByRole('button');
  expect(pill.style.background).toBe('transparent');
  expect(pill.style.color).toMatch(/rgba\(255,\s*255,\s*255,\s*0?\.7\d*\)/i);
  expect(pill.style.border).toMatch(/rgba\(255,\s*255,\s*255,\s*0?\.8\d*\)/i);
});

test('FilterPill inverse selected fills the inverse focus surface with midnight text', () => {
  render(<FilterPill inverse selected>Price</FilterPill>);
  const pill = screen.getByRole('button');
  expect(pill.style.background).toMatch(/#f0f0f5|rgb\(240,\s*240,\s*245\)/i);
  expect(pill.style.color).toMatch(/#191329|rgb\(25,\s*19,\s*41\)/i);
});

/* ---------------- Icon sizing per Figma V1.1 ---------------- */


test('Searchbar renders 20px (lg) search and mic icons per Figma', () => {
  const { container } = render(<Searchbar />);
  const icons = Array.from(container.querySelectorAll('span')).filter((s) => s.style.width === '20px');
  expect(icons.length).toBeGreaterThanOrEqual(2);
});

test('FilterPill chevron is the chevron-down-sm icon in a 16px (md) box', () => {
  const { container } = render(<FilterPill>Category</FilterPill>);
  // Icon renders <span role="img" aria-label={name}>; its IconBox parent carries the size.
  const icon = container.querySelector('[aria-label="chevron-down-sm"]')!;
  expect(icon).toBeInTheDocument();
  expect((icon.parentElement as HTMLElement).style.width).toBe('16px');
});

test('Chip leading icon is 16px (md) per Figma chips-core', () => {
  const { container } = render(<Chip leadingIcon="★">5G</Chip>);
  const icon = Array.from(container.querySelectorAll('span')).find((s) => s.textContent === '★')!;
  expect(icon.style.width).toBe('16px');
});

/* ---------------- Input V1.1 (Figma 22609:113539) ---------------- */


test('Input floats the label on focus and back on blur when empty', async () => {
  render(<Input label="Mobile number" />);
  const input = screen.getByRole('textbox');
  const label = screen.getByText('Mobile number');
  expect(label.style.fontSize).toBe('16px'); // resting
  await userEvent.click(input);
  expect(label.style.fontSize).toBe('12px'); // floated
  await userEvent.tab();
  expect(label.style.fontSize).toBe('16px');
});

test('Input keeps the label floated when it has a value', () => {
  render(<Input label="Name" defaultValue="Ahmed" />);
  expect(screen.getByText('Name').style.fontSize).toBe('12px');
});

test('Input border reflects state: default, active, error, disabled', async () => {
  const { rerender, container } = render(<Input label="A" />);
  const field = () => container.firstElementChild!.firstElementChild as HTMLElement;
  expect(field().style.border).toContain('rgb(216, 215, 222)'); // default #d8d7de
  await userEvent.click(screen.getByRole('textbox'));
  expect(field().style.border).toContain('rgb(233, 82, 77)'); // active #e9524d
  rerender(<Input label="A" error="Required" />);
  await userEvent.tab();
  expect(field().style.border).toContain('rgb(255, 159, 82)'); // error #ff9f52
  rerender(<Input label="A" disabled />);
  expect(field().style.border).toContain('rgba(25, 19, 41, 0.07)');
});

test('Input dropdown type is read-only with a trailing chevron', () => {
  const { container } = render(<Input label="Plan" type="dropdown" />);
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  expect(container.querySelector('[aria-label="chevron-down-sm"]')).toBeInTheDocument();
});

test('Input comment type renders a textarea', () => {
  render(<Input label="Comment" type="comment" defaultValue="Hi" />);
  expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
});

test('Input clearable erase button clears and refocuses', async () => {
  const fn = vi.fn();
  render(<Input label="Search" defaultValue="fibre" clearable onClear={fn} />);
  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
  expect(fn).toHaveBeenCalledTimes(1);
  expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
});

test('Input inverse scheme uses the white-15 surface', () => {
  const { container } = render(<Input label="A" inverse />);
  const field = container.firstElementChild!.firstElementChild as HTMLElement;
  expect(field.style.background).toBe('rgba(255, 255, 255, 0.15)');
});

test('Input error and success hints use danger/positive subtle colors', () => {
  const { rerender } = render(<Input label="A" error="Wrong code" />);
  expect(screen.getByText('Wrong code').style.color).toBe('rgb(224, 120, 48)'); // #e07830
  rerender(<Input label="A" success="Looks good" />);
  expect(screen.getByText('Looks good').style.color).toBe('rgb(84, 188, 114)'); // #54bc72
});

/* ---------------- OtpInput ---------------- */

test('OtpInput renders one 48×56 cell per digit and accepts typing', async () => {
  const fn = vi.fn();
  const { container } = render(<OtpInput length={4} onValueChange={fn} />);
  const cells = Array.from(container.querySelectorAll('span[aria-hidden]'));
  expect(cells).toHaveLength(4);
  expect((cells[0] as HTMLElement).style.width).toBe('48px');
  expect((cells[0] as HTMLElement).style.height).toBe('56px');
  await userEvent.type(screen.getByLabelText('One-time code'), '42');
  expect(fn).toHaveBeenLastCalledWith('42');
  expect(cells[0].textContent).toBe('4');
  expect(cells[1].textContent).toBe('2');
});

test('OtpInput masked shows dots and clamps to length', async () => {
  const { container } = render(<OtpInput length={3} masked defaultValue="12345" />);
  const cells = Array.from(container.querySelectorAll('span[aria-hidden]'));
  expect(cells).toHaveLength(3);
  expect(cells.map((c) => c.textContent)).toEqual(['•', '•', '•']);
});

/* ---------------- Chip V1.1 types (Figma 31539:8725) ---------------- */

test.each([
  ['outline', 'transparent', 'rgb(87, 83, 98)'],
  ['filled', 'rgb(255, 255, 255)', 'rgb(87, 83, 98)'],
  ['glass', 'rgba(255, 255, 255, 0.15)', 'rgb(255, 255, 255)'],
  ['inverse', 'transparent', 'rgba(255, 255, 255, 0.75)'],
] as const)('Chip type=%s default surface/text per Figma', (type, bg, fg) => {
  render(<Chip type={type}>C</Chip>);
  const chip = screen.getByRole('button', { name: 'C' });
  expect(chip.style.background).toBe(bg);
  expect(chip.style.color).toBe(fg);
});

test('Chip selected (focus) goes midnight for outline and filled', () => {
  const { rerender } = render(<Chip type="outline" selected>C</Chip>);
  expect(screen.getByRole('button').style.background).toBe('rgb(20, 15, 33)');
  rerender(<Chip type="filled" selected>C</Chip>);
  expect(screen.getByRole('button').style.background).toBe('rgb(20, 15, 33)');
});

test('Chip disabled blocks clicks and uses disabled colors', async () => {
  const fn = vi.fn();
  render(<Chip type="filled" disabled onClick={fn}>C</Chip>);
  const chip = screen.getByRole('button');
  await userEvent.click(chip);
  expect(fn).not.toHaveBeenCalled();
  expect(chip.style.color).toBe('rgb(144, 142, 154)');
});

test('Chip check shows a check mark only while selected', () => {
  // The mark is the `check` icon from the icon set, not a ✓ glyph.
  const { container, rerender } = render(<Chip check>C</Chip>);
  expect(container.querySelector('[aria-label="check"]')).toBeNull();
  rerender(<Chip check selected>C</Chip>);
  expect(container.querySelector('[aria-label="check"]')).toBeInTheDocument();
});

test('Chip loading shows a spinner and suppresses clicks', async () => {
  const fn = vi.fn();
  const { container } = render(<Chip loading onClick={fn}>C</Chip>);
  expect(container.querySelector('svg')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button'));
  expect(fn).not.toHaveBeenCalled();
});

/* ---------------- Picker (Figma 31358:139406) ---------------- */


test('PickerOption renders value, caption and badge', () => {
  render(<PickerOption value="5" caption="AED" badge={<span>neutral</span>} />);
  expect(screen.getByText('5')).toBeInTheDocument();
  expect(screen.getByText('AED')).toBeInTheDocument();
  expect(screen.getByText('neutral')).toBeInTheDocument();
});

test.each([
  ['default', 'rgb(228, 227, 234)'],
  ['light', 'rgb(255, 255, 255)'],
  ['inverse', 'rgb(49, 44, 64)'],
] as const)('PickerOption surface=%s uses the right fill', (surface, bg) => {
  render(<PickerOption value="5" surface={surface} />);
  expect(screen.getByRole('radio').style.background).toBe(bg);
});

/* Picker vs Figma V1.2 `picker` 34373:16787 + state atoms `.picker-scheme-default` 34373:16315
   / `-inverse` 34373:16508. 13.07.2026 "Changed selected state per VD feedback": selected is a
   fill + text swap with an icon-set check-circle (filled, 20 in a 24 icon-size, top/end 6), not
   a red border with a hand-drawn tick. Fixed 106×72, centred, content padding 20 top / 8 sides,
   disabled via text tokens with the badge hidden, not opacity. */

test('PickerOption is a fixed 106×72 centred tile with 20/8 content padding', () => {
  render(<PickerOption value="5" caption="AED" />);
  const tile = screen.getByRole('radio');
  expect(tile.style.width).toBe('106px');
  expect(tile.style.height).toBe('72px');
  expect(tile.style.textAlign).toBe('center');
  const content = screen.getByText('5').parentElement!;
  expect(content.style.paddingTop).toBe('20px');
  expect(content.style.paddingInline).toBe('8px');
});

test.each([
  // [surface, selected bg, value ink, caption ink, check ink]
  ['default', 'rgb(49, 44, 64)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)'], // raised/midnight
  ['light', 'rgb(49, 44, 64)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)'],
  ['glass', 'rgb(255, 255, 255)', 'rgb(25, 19, 41)', 'rgb(87, 83, 98)', 'rgb(224, 8, 0)'],          // raised/default
  ['inverse', 'rgb(255, 255, 255)', 'rgb(25, 19, 41)', 'rgb(87, 83, 98)', 'rgb(224, 8, 0)'],
] as const)('PickerOption surface=%s selected swaps fill and ink and shows check-circle', (surface, bg, value, caption, check) => {
  const { container } = render(<PickerOption value="5" caption="AED" surface={surface} selected />);
  const tile = screen.getByRole('radio');
  expect(tile).toHaveAttribute('aria-checked', 'true');
  expect(tile.style.background).toBe(bg);
  expect(tile.style.border).toBe('0px'); // no accent border any more
  expect(screen.getByText('5').style.color).toBe(value);
  expect(screen.getByText('AED').style.color).toBe(caption);
  const icon = container.querySelector('[aria-label="check-circle-filled"]') as HTMLElement;
  expect(icon.style.color).toBe(check);
  const box = icon.parentElement as HTMLElement;
  expect(box.style.width).toBe('24px');
  expect(box.style.top).toBe('6px');
  expect(box.style.insetInlineEnd).toBe('6px');
});

test('PickerOption inverse caption is text/default/inverse, not inverse-subtle', () => {
  render(<PickerOption value="5" caption="AED" surface="glass" />);
  expect(screen.getByText('AED').style.color).toBe('rgb(255, 255, 255)');
});

test('PickerOption string badge renders the neutral sm status badge across the tile', () => {
  render(<PickerOption value="5" badge="Neutral" />);
  const badge = screen.getByText('Neutral');
  expect(badge.style.background).toBe('rgb(240, 240, 245)'); // badge/surface/status/neutral
  expect(badge.style.height).toBe('16px');
  expect(badge.style.width).toBe('100%');
});

test('PickerOption disabled uses disabled inks, hides the badge, no opacity, and cannot be clicked', async () => {
  const fn = vi.fn();
  const { rerender } = render(<PickerOption value="5" caption="AED" badge="Neutral" disabled onClick={fn} />);
  const tile = screen.getByRole('radio');
  expect(tile.style.opacity).toBe('');
  expect(screen.getByText('5').style.color).toBe('rgb(192, 191, 200)');
  expect(screen.getByText('AED').style.color).toBe('rgb(192, 191, 200)');
  expect(screen.queryByText('Neutral')).toBeNull();
  await userEvent.click(tile);
  expect(fn).not.toHaveBeenCalled();
  rerender(<PickerOption value="5" caption="AED" surface="glass" disabled />);
  expect(screen.getByText('5').style.color).toBe('rgba(255, 255, 255, 0.5)'); // inverse-disabled
});

test('Picker manages single selection and fires onChange', async () => {
  const fn = vi.fn();
  render(<Picker onChange={fn} options={[
    { value: '5', caption: 'AED' },
    { value: '10', caption: 'AED' },
    { value: '20', caption: 'AED', disabled: true },
  ]} />);
  const tiles = screen.getAllByRole('radio');
  expect(tiles).toHaveLength(3);
  await userEvent.click(tiles[1]);
  expect(fn).toHaveBeenCalledWith(1);
  expect(tiles[1]).toHaveAttribute('aria-checked', 'true');
  await userEvent.click(tiles[2]); // disabled
  expect(fn).toHaveBeenCalledTimes(1);
});

/* ---------------- Tabs vs Figma `pill-tabs` 25502:12416 ----------------
   h40 and the pill radius were right; the label ramp, padding and the active fill were not.
   The audit asked for `tab/surface/global/active`; that name no longer exists — Figma
   restructured the tab tokens to default/inverse, and the colour lives at
   color/tab/default/surface/active (#fce6e6). */

test('Tabs label is title/xs 14 SemiBold, not button/sm 12', () => {
  render(<Tabs tabs={['For you', 'Account']} />);
  const tab = screen.getByRole('tab', { name: 'Account' });
  expect(tab.style.fontSize).toBe('14px');
  expect(tab.style.fontWeight).toBe('600');
});

/* V1.2 `tab-pill` 25502:12416 + `tab-pill-content` 37840:19927: height scale/48 (was
   tabs/height/md 40, which is the chips height), padding 0/16 (was 8), gap 0 with a 2px label
   pad, a 20px icon-size (16 glyph), unselected fill tab/default/surface/default #fff (was
   surface/base/default #f0f0f5), and an `inverse` glass variant (was missing). */

test('Tabs pill is 48 tall, min-width 72, with 16px side padding and no gap', () => {
  render(<Tabs tabs={['All']} />);
  const tab = screen.getByRole('tab', { name: 'All' });
  expect(tab.style.height).toBe('48px');
  expect(tab.style.minWidth).toBe('72px');
  expect(tab.style.paddingInline).toBe('16px');
  expect(tab.style.gap).toBe('0');
  expect(screen.getByText('All').style.paddingInline).toBe('2px');
});

test('Tabs global unselected is white (tab/default/surface/default) with muted ink', () => {
  render(<Tabs tabs={['For you', 'Account']} />);
  const tab = screen.getByRole('tab', { name: 'Account' });
  expect(tab.style.background).toBe('rgb(255, 255, 255)');
  expect(tab.style.color).toBe('rgb(144, 142, 154)');
});

test('Tabs inverse is glass when unselected and white with red ink when selected', () => {
  render(<Tabs inverse tabs={['For you', 'Account']} />);
  const on = screen.getByRole('tab', { name: 'For you' });
  const off = screen.getByRole('tab', { name: 'Account' });
  expect(off.style.background).toBe('rgba(255, 255, 255, 0.2)'); // tab/inverse/surface/default
  expect(off.style.color).toBe('rgb(255, 255, 255)');            // tab/inverse/text/default
  expect(off.style.backdropFilter).toBe('blur(20px)');
  expect(on.style.background).toBe('rgb(255, 255, 255)');        // tab/inverse/surface/selected
  expect(on.style.color).toBe('rgb(224, 8, 0)');                 // tab/inverse/text/selected
});

test('Tabs icons sit in a 20px icon-size box; a string is an icon-set name at 16px', () => {
  const { container } = render(<Tabs tabs={['All', 'Data']} icons={['placeholder', <i data-testid="ic" />]} />);
  const named = container.querySelector('[aria-label="placeholder"]') as HTMLElement;
  expect((named.parentElement as HTMLElement).style.width).toBe('20px');
  expect(named.querySelector('svg')!.getAttribute('width')).toBe('16');
  expect((screen.getByTestId('ic').parentElement as HTMLElement).style.width).toBe('20px');
});

test('Tabs global active binds the tab tokens, not surface/canvas/brand-muted', () => {
  render(<Tabs tabs={['For you', 'Account']} defaultValue={1} />);
  const active = screen.getByRole('tab', { name: 'Account' });
  expect(active.style.background).toBe('rgb(252, 230, 230)');  // tab/default/surface/active #fce6e6
  expect(active.style.color).toBe('rgb(224, 8, 0)');           // tab/default/text/active
});

test('Tabs renders an optional leading icon', () => {
  const { container } = render(<Tabs tabs={['All']} icons={[<i data-testid="ic" />]} />);
  expect(container.querySelector('[data-testid="ic"]')).toBeInTheDocument();
});

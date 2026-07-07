import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox, Radio, Chip, FilterPill } from './controls';

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

test('Chip inverse selected fills white with midnight text', () => {
  render(<Chip inverse selected>Data</Chip>);
  const chip = screen.getByRole('button', { name: 'Data' });
  expect(chip.style.background).toMatch(/#ffffff|rgb\(255,\s*255,\s*255\)/i);
  expect(chip.style.color).toMatch(/#191329|rgb\(25,\s*19,\s*41\)/i);
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
  expect(pill.style.color).toMatch(/#c0bfc8|rgb\(192,\s*191,\s*200\)/i);
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

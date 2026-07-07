import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

// jsdom normalizes hex -> rgb inconsistently, so every color assertion accepts both forms.
const BRAND = /#e00800|rgb\(224,\s*8,\s*0\)/i; // button.*.brand.default
const BRAND_FOCUS = /#bb0700|rgb\(187,\s*7,\s*0\)/i; // button.*.brand.focus
const WHITE = /#ffffff|rgb\(255,\s*255,\s*255\)/i; // button.*.inverse.default
const MIDNIGHT = /#191329|rgb\(25,\s*19,\s*41\)/i; // button.*.midnight.default

test('renders its label', () => {
  render(<Button>Pay now</Button>);
  expect(screen.getByRole('button', { name: 'Pay now' })).toBeInTheDocument();
});

test('fires onClick when enabled', async () => {
  const fn = vi.fn();
  render(<Button onClick={fn}>Tap</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(fn).toHaveBeenCalledTimes(1);
});

test('disabled blocks the click', async () => {
  const fn = vi.fn();
  render(<Button disabled onClick={fn}>Tap</Button>);
  await userEvent.click(screen.getByRole('button'));
  expect(fn).not.toHaveBeenCalled();
});

test('primary/brand renders the brand surface color inline', () => {
  render(<Button variant="primary" tone="brand">Buy</Button>);
  expect(screen.getByRole('button').style.background).toMatch(BRAND);
});

test('heights stay 32/40/48 across sizes', () => {
  render(
    <>
      <Button size="sm">S</Button>
      <Button size="md">M</Button>
      <Button size="lg">L</Button>
    </>,
  );
  expect(screen.getByRole('button', { name: 'S' }).style.height).toBe('32px');
  expect(screen.getByRole('button', { name: 'M' }).style.height).toBe('40px');
  expect(screen.getByRole('button', { name: 'L' }).style.height).toBe('48px');
});

// --- V1.1 variants -----------------------------------------------------------

test('tertiary is text-only: transparent fill, brand text, no underline', () => {
  render(<Button variant="tertiary">More</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  expect(el.style.color).toMatch(BRAND);
  expect(el.style.textDecoration).not.toBe('underline');
});

test('link is underlined text with brand color', () => {
  render(<Button variant="link">Terms</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  expect(el.style.color).toMatch(BRAND);
  expect(el.style.textDecoration).toBe('underline');
});

// --- surface axis --------------------------------------------------------------

test('primary on inverse-brand surface renders white fill with brand text', () => {
  render(<Button variant="primary" surface="inverse-brand">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toMatch(WHITE);
  expect(el.style.color).toMatch(BRAND);
});

test('secondary on white surface renders white border and text', () => {
  render(<Button variant="secondary" surface="white">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.border).toMatch(WHITE);
  expect(el.style.color).toMatch(WHITE);
});

test('tertiary on midnight surface renders midnight text', () => {
  render(<Button variant="tertiary" surface="midnight">More</Button>);
  expect(screen.getByRole('button').style.color).toMatch(MIDNIGHT);
});

test('link on white surface renders white text', () => {
  render(<Button variant="link" surface="white">Terms</Button>);
  expect(screen.getByRole('button').style.color).toMatch(WHITE);
});

test('tone="inverse" still works as a back-compat alias for the surface axis', () => {
  render(<Button variant="primary" tone="inverse">Buy</Button>);
  expect(screen.getByRole('button').style.background).toMatch(WHITE);
});

test('surface wins over tone when both are given', () => {
  render(<Button variant="primary" tone="inverse" surface="brand">Buy</Button>);
  expect(screen.getByRole('button').style.background).toMatch(BRAND);
});

// --- focus state ---------------------------------------------------------------

test('primary/brand swaps to the focus surface token while focused, and back on blur', async () => {
  render(
    <>
      <Button>Buy</Button>
      <button type="button">next</button>
    </>,
  );
  const el = screen.getByRole('button', { name: 'Buy' });
  await userEvent.tab();
  expect(el).toHaveFocus();
  expect(el.style.background).toMatch(BRAND_FOCUS);
  await userEvent.tab(); // move focus away
  expect(el.style.background).toMatch(BRAND);
});

test('secondary/brand gains the focus fill while focused', async () => {
  render(<Button variant="secondary">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  await userEvent.tab();
  // button.secondary.surface.brand.focus = #fce6e6
  expect(el.style.background).toMatch(/#fce6e6|rgb\(252,\s*230,\s*230\)/i);
  expect(el.style.border).toMatch(BRAND_FOCUS);
});

test('link swaps text color to the focus token while focused', async () => {
  render(<Button variant="link">Terms</Button>);
  const el = screen.getByRole('button');
  await userEvent.tab();
  expect(el.style.color).toMatch(BRAND_FOCUS);
});

test('caller onFocus/onBlur handlers still fire', async () => {
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  render(
    <>
      <Button onFocus={onFocus} onBlur={onBlur}>Buy</Button>
      <button type="button">next</button>
    </>,
  );
  await userEvent.tab();
  expect(onFocus).toHaveBeenCalledTimes(1);
  await userEvent.tab();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

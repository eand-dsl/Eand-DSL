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

// The label used to be brand red here. Figma re-pointed
// `color/button/primary/text/inverse/default` from `text/brand/default` to
// `text/default/default`, so a white button on a red surface now reads midnight. Picked up
// when the stale token export was refreshed (830 -> 944 tokens); the component follows the
// token, only this expectation was pinned to the old value.
test('primary on inverse-brand surface renders white fill with midnight text', () => {
  render(<Button variant="primary" surface="inverse-brand">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toMatch(WHITE);
  expect(el.style.color).toMatch(MIDNIGHT);
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

/* ---------------- Glass variant (Figma 31511:8011) ---------------- */

test('glass renders the frosted white-15% surface with white text', () => {
  render(<Button variant="glass">Glass</Button>);
  const btn = screen.getByRole('button');
  expect(btn.style.background).toBe('rgba(255, 255, 255, 0.15)');
  expect(btn.style.color).toBe('rgb(255, 255, 255)');
  expect(btn.style.backdropFilter).toBe('blur(20px)');
});

test('glass disabled dims surface and text per Figma', () => {
  render(<Button variant="glass" disabled>Glass</Button>);
  const btn = screen.getByRole('button');
  expect(btn.style.background).toBe('rgba(255, 255, 255, 0.1)');
  // 0.5 -> 0.6: the label binds to color/button/glass/text/disabled, which aliases
  // text/default/inverse-muted, and Figma moved that from 50% to 60% white. Surfaced when
  // the glass hardcodes were replaced with the tokens they were standing in for.
  expect(btn.style.color).toBe('rgba(255, 255, 255, 0.6)');
});

/* ---------------- Loading state (Figma Loader <-> Icon=on) ---------------- */

test('loading shows a spinner, sets aria-busy, and suppresses clicks', async () => {
  const fn = vi.fn();
  const { container } = render(<Button loading onClick={fn}>Save</Button>);
  const btn = screen.getByRole('button');
  expect(btn).toHaveAttribute('aria-busy', 'true');
  expect(container.querySelector('svg')).toBeInTheDocument();
  await userEvent.click(btn);
  expect(fn).not.toHaveBeenCalled();
});

test('loading keeps the default palette (not the disabled look)', () => {
  render(<Button loading>Save</Button>);
  const btn = screen.getByRole('button');
  expect(btn.style.background).toBe('rgb(224, 8, 0)'); // primary brand default
  expect(btn).not.toBeDisabled();
});

test('loading replaces the leading icon but keeps the trailing icon', () => {
  const { container } = render(<Button loading leadingIcon={<i data-testid="lead" />} trailingIcon={<i data-testid="trail" />}>Go</Button>);
  expect(container.querySelector('[data-testid="lead"]')).toBeNull();
  expect(container.querySelector('[data-testid="trail"]')).toBeInTheDocument();
  expect(container.querySelector('svg')).toBeInTheDocument();
});

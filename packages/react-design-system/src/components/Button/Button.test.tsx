import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, UaePassButton, type ButtonScheme, type ButtonVariant } from './Button';

// jsdom normalizes hex -> rgb inconsistently, so every color assertion accepts both forms.
const BRAND = /#e00800|rgb\(224,\s*8,\s*0\)/i; // button.*.brand.default
const BRAND_PRESSED = /#bb0700|rgb\(187,\s*7,\s*0\)/i; // button.*.brand.pressed
const WHITE = /#ffffff|rgb\(255,\s*255,\s*255\)/i; // button.*.inverse.default
const MIDNIGHT = /#191329|rgb\(25,\s*19,\s*41\)/i; // button.*.midnight.default
const GREY = /#a8a6b1|rgb\(168,\s*166,\s*177\)/i; // */disabled greys

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

// --- V1.2 geometry (Figma `button` 25394:85067) ---------------------------------

/** Total inline inset from the button edge to the label text: the sum of the start padding
 *  of every box between the button and its text (button > button-content > label). */
function insetToLabel(btn: HTMLElement, text: string): number {
  const label = [...btn.querySelectorAll('span')].find((s) => s.textContent === text && s.children.length === 0)!;
  let total = 0;
  for (let n: HTMLElement | null = label; n; n = n === btn ? null : n.parentElement) {
    total += parseFloat(n.style.paddingLeft || '0');
  }
  return total;
}

test('text inset is 16 / 16 / 10 per size, built as outer + content + label padding (25394:85067)', () => {
  // Figma: outer spacing/sm (lg, md) or spacing/xs (sm) + button-content spacing/xs + label
  // spacing/xs (lg, md) or spacing/2xs (sm). Code used to pad 20 / 16 / 8 in one box.
  render(
    <>
      <Button size="lg">L</Button>
      <Button size="md">M</Button>
      <Button size="sm">S</Button>
    </>,
  );
  expect(insetToLabel(screen.getByRole('button', { name: 'L' }), 'L')).toBe(16);
  expect(insetToLabel(screen.getByRole('button', { name: 'M' }), 'M')).toBe(16);
  expect(insetToLabel(screen.getByRole('button', { name: 'S' }), 'S')).toBe(10);
});

test('padded types have minWidth = height (scale/48, 40, 32)', () => {
  render(
    <>
      <Button size="lg">L</Button>
      <Button size="md" variant="secondary">M</Button>
      <Button size="sm" variant="glass">S</Button>
    </>,
  );
  expect(screen.getByRole('button', { name: 'L' }).style.minWidth).toBe('48px');
  expect(screen.getByRole('button', { name: 'M' }).style.minWidth).toBe('40px');
  expect(screen.getByRole('button', { name: 'S' }).style.minWidth).toBe('32px');
});

test('radius binds border-radius/9', () => {
  render(<Button>Buy</Button>);
  expect(screen.getByRole('button').style.borderRadius).toBe('1200px');
});

test('tertiary and link hug their text: no fixed height, no minWidth, no padding (25394:85067)', () => {
  // Figma tertiary/link have 0 padding at every level and HUG on both axes (lg 51x21 etc.).
  // Code used to give them the 40px height and 16px padding of a filled button.
  render(
    <>
      <Button variant="tertiary" size="lg">More</Button>
      <Button variant="link" size="md">Terms</Button>
    </>,
  );
  for (const [name, text] of [['More', 'More'], ['Terms', 'Terms']]) {
    const el = screen.getByRole('button', { name });
    expect(el.style.height).toBe('');
    expect(el.style.minWidth).toBe('');
    expect(insetToLabel(el, text)).toBe(0);
  }
});

test('primary has no stroke; secondary has a 1px border/sm inside stroke (not 2px)', () => {
  render(
    <>
      <Button>P</Button>
      <Button variant="secondary">S</Button>
    </>,
  );
  const p = screen.getByRole('button', { name: 'P' });
  const s = screen.getByRole('button', { name: 'S' });
  expect(p.style.boxShadow).toBe('');
  expect(p.style.border).toBe('0px'); // the old 2px transparent border is gone
  // Figma strokeAlign INSIDE: drawn as an inset ring so it does not add to the box.
  expect(s.style.boxShadow).toMatch(/^inset 0(px)? 0(px)? 0(px)? 1px /);
  expect(s.style.boxShadow).toMatch(BRAND);
  expect(s.style.border).toBe('0px');
});

test('disabled is tokens only — no extra layer opacity (Figma opacity 1)', () => {
  render(<Button disabled>Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.opacity).toBe('');
  expect(el.style.background).toMatch(/#c0bfc8|rgb\(192,\s*191,\s*200\)/i); // primary/surface/brand/disabled
});

test('link uses body type; tertiary keeps button type (25394:85067)', () => {
  render(
    <>
      <Button variant="link" size="lg">L</Button>
      <Button variant="link" size="sm">S</Button>
      <Button variant="tertiary" size="lg">T</Button>
    </>,
  );
  const l = screen.getByRole('button', { name: 'L' });
  expect(l.style.fontSize).toBe('16px');
  expect(l.style.fontWeight).toBe('400');
  expect(l.style.lineHeight).toBe('1.4');
  expect(screen.getByRole('button', { name: 'S' }).style.fontSize).toBe('12px');
  const t = screen.getByRole('button', { name: 'T' });
  expect(t.style.fontWeight).toBe('600');
  expect(t.style.lineHeight).toBe('1.3');
});

test('icon slot is 24 / 20 / 16 per size (.button-icon in lg / md / sm)', () => {
  const { container } = render(
    <>
      <Button size="lg" leadingIcon={<i data-testid="lg" />}>L</Button>
      <Button size="md" leadingIcon={<i data-testid="md" />}>M</Button>
      <Button size="sm" trailingIcon={<i data-testid="sm" />}>S</Button>
    </>,
  );
  const slot = (id: string) => (container.querySelector(`[data-testid="${id}"]`)!.parentElement as HTMLElement).style;
  expect(slot('lg').width).toBe('24px');
  expect(slot('md').width).toBe('20px');
  expect(slot('sm').width).toBe('16px');
});

// --- V1.1 variants -----------------------------------------------------------

test('tertiary is text-only: transparent fill, brand text, no underline', () => {
  render(<Button variant="tertiary">More</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  expect(el.style.color).toMatch(BRAND);
  expect(el.style.textDecoration).not.toBe('underline');
});

test('link is brand text, NOT underlined at rest (Figma textDecoration NONE)', () => {
  render(<Button variant="link">Terms</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  expect(el.style.color).toMatch(BRAND);
  expect(el.style.textDecoration).not.toBe('underline');
});

// --- scheme axis (V1.2) --------------------------------------------------------

test('scheme="inverse" primary is a white fill with midnight text', () => {
  render(<Button scheme="inverse">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toMatch(WHITE);
  expect(el.style.color).toMatch(MIDNIGHT);
});

test('scheme="midnight" primary is a midnight fill with white text', () => {
  render(<Button scheme="midnight">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toMatch(MIDNIGHT);
  expect(el.style.color).toMatch(WHITE);
});

test('scheme on tertiary/link picks the matching token group', () => {
  render(
    <>
      <Button variant="tertiary" scheme="midnight">T</Button>
      <Button variant="link" scheme="inverse">L</Button>
    </>,
  );
  expect(screen.getByRole('button', { name: 'T' }).style.color).toMatch(MIDNIGHT);
  expect(screen.getByRole('button', { name: 'L' }).style.color).toMatch(WHITE);
});

// The published secondary symbol crosses its bindings relative to every other type:
// scheme=inverse binds the midnight group (dark outline), scheme=midnight binds the inverse
// group (white outline). Ruling for this pass: follow the published symbol (logged).
test('secondary scheme="inverse" follows the published symbol: dark outline + dark text', () => {
  render(<Button variant="secondary" scheme="inverse">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.boxShadow).toMatch(MIDNIGHT);
  expect(el.style.color).toMatch(MIDNIGHT);
});

test('secondary scheme="midnight" follows the published symbol: white outline + white text', () => {
  render(<Button variant="secondary" scheme="midnight">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.boxShadow).toMatch(WHITE);
  expect(el.style.color).toMatch(WHITE);
});

test('scheme wins over surface and tone', () => {
  render(<Button scheme="default" surface="midnight" tone="inverse">Buy</Button>);
  expect(screen.getByRole('button').style.background).toMatch(BRAND);
});

// --- deprecated surface / tone (unchanged rendering) ----------------------------

// The label used to be brand red here. Figma re-pointed
// `color/button/primary/text/inverse/default` from `text/brand/default` to
// `text/default/default`, so a white button on a red surface now reads midnight.
test('primary on inverse-brand surface renders white fill with midnight text', () => {
  render(<Button variant="primary" surface="inverse-brand">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toMatch(WHITE);
  expect(el.style.color).toMatch(MIDNIGHT);
});

test('deprecated surface="white" secondary still renders a white outline and text', () => {
  render(<Button variant="secondary" surface="white">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.boxShadow).toMatch(WHITE);
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

// --- every computed token path resolves -------------------------------------------

// color() returns its argument on a miss, which ships as invalid CSS that browsers drop
// silently (CLAUDE.md rule 2). token-paths.test.ts only guards literal paths; these are
// template-built, so walk every variant x scheme x state and look for an unresolved path.
test('no inline style carries an unresolved token path, in any variant/scheme/state', () => {
  const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'link', 'glass'];
  const schemes: ButtonScheme[] = ['default', 'inverse', 'midnight'];
  for (const variant of variants) {
    for (const scheme of schemes) {
      for (const disabled of [false, true]) {
        const { unmount } = render(<Button variant={variant} scheme={scheme} disabled={disabled}>X</Button>);
        const el = screen.getByRole('button');
        if (!disabled) fireEvent.pointerDown(el); // pressed
        const css = el.getAttribute('style') ?? '';
        expect(css, `${variant}/${scheme}/${disabled ? 'disabled' : 'pressed'}`).not.toMatch(/\b(button|border|text)\.[a-z]/);
        expect(el.style.color, `${variant}/${scheme} color`).not.toBe('');
        unmount();
      }
    }
  }
});

// --- pressed follows the press, not focus ----------------------------------------

// Figma `state=pressed` is a press. Code used to set it on focus, so the pressed colour
// stayed on after a tap until something else took focus.
test('keyboard focus shows a focus ring but keeps the default colours', async () => {
  render(
    <>
      <Button>Buy</Button>
      <button type="button">next</button>
    </>,
  );
  const el = screen.getByRole('button', { name: 'Buy' });
  await userEvent.tab();
  expect(el).toHaveFocus();
  expect(el.style.background).toMatch(BRAND);
  expect(el.style.outlineStyle).toBe('solid');
  expect(el.style.outlineWidth).toBe('2px');
  expect(el.style.outlineColor).toMatch(MIDNIGHT); // border/interactive/default/pressed
  await userEvent.tab();
  expect(el.style.outlineStyle).toBe('none');
});

test('focus ring on an inverse button is white (border/interactive/inverse/pressed)', async () => {
  render(<Button scheme="inverse">Buy</Button>);
  await userEvent.tab();
  expect(screen.getByRole('button').style.outlineColor).toMatch(WHITE);
});

test('a pointer press shows the pressed token and releases on pointerup — no lingering', () => {
  render(<Button>Buy</Button>);
  const el = screen.getByRole('button');
  fireEvent.pointerDown(el);
  expect(el.style.background).toMatch(BRAND_PRESSED);
  fireEvent.pointerUp(el);
  expect(el.style.background).toMatch(BRAND);
});

test('a pointer press released outside (leave / cancel) does not stick', () => {
  render(<Button>Buy</Button>);
  const el = screen.getByRole('button');
  fireEvent.pointerDown(el);
  fireEvent.pointerLeave(el);
  expect(el.style.background).toMatch(BRAND);
  fireEvent.pointerDown(el);
  fireEvent.pointerCancel(el);
  expect(el.style.background).toMatch(BRAND);
});

test('a mouse click focuses without a focus ring and without lingering pressed colours', async () => {
  render(<Button>Buy</Button>);
  const el = screen.getByRole('button');
  await userEvent.click(el);
  expect(el).toHaveFocus();
  expect(el.style.background).toMatch(BRAND);
  expect(el.style.outlineStyle).toBe('none');
});

test('Space / Enter show pressed while held (keyboard activation)', () => {
  render(<Button>Buy</Button>);
  const el = screen.getByRole('button');
  fireEvent.keyDown(el, { key: ' ' });
  expect(el.style.background).toMatch(BRAND_PRESSED);
  fireEvent.keyUp(el, { key: ' ' });
  expect(el.style.background).toMatch(BRAND);
  fireEvent.keyDown(el, { key: 'Enter' });
  expect(el.style.background).toMatch(BRAND_PRESSED);
  fireEvent.keyUp(el, { key: 'Enter' });
  expect(el.style.background).toMatch(BRAND);
});

test('disabled and loading buttons never show pressed', () => {
  render(
    <>
      <Button disabled>D</Button>
      <Button loading>L</Button>
    </>,
  );
  const d = screen.getByRole('button', { name: 'D' });
  const l = screen.getByRole('button', { name: 'L' });
  fireEvent.pointerDown(d);
  fireEvent.pointerDown(l);
  expect(d.style.background).toMatch(/#c0bfc8|rgb\(192,\s*191,\s*200\)/i);
  expect(l.style.background).toMatch(BRAND);
});

test('secondary/brand pressed: solid red fill, white text, no stroke (V1.2)', () => {
  render(<Button variant="secondary">Buy</Button>);
  const el = screen.getByRole('button');
  expect(el.style.background).toBe('transparent');
  fireEvent.pointerDown(el);
  // button/secondary/surface/brand/pressed = red/1100 #bb0700, text/brand/pressed = white;
  // the pressed symbol has no stroke at all.
  expect(el.style.background).toMatch(BRAND_PRESSED);
  expect(el.style.color).toMatch(WHITE);
  expect(el.style.boxShadow).toBe('');
});

test('link takes the pressed token and underlines only while pressed', () => {
  render(<Button variant="link">Terms</Button>);
  const el = screen.getByRole('button');
  expect(el.style.textDecoration).not.toBe('underline');
  fireEvent.pointerDown(el);
  expect(el.style.color).toMatch(BRAND_PRESSED);
  expect(el.style.textDecoration).toBe('underline');
  fireEvent.pointerUp(el);
  expect(el.style.textDecoration).not.toBe('underline');
});

test('caller event handlers still fire', async () => {
  const onFocus = vi.fn();
  const onBlur = vi.fn();
  const onPointerDown = vi.fn();
  const onPointerUp = vi.fn();
  const onKeyDown = vi.fn();
  const onKeyUp = vi.fn();
  render(
    <>
      <Button {...{ onFocus, onBlur, onPointerDown, onPointerUp, onKeyDown, onKeyUp }}>Buy</Button>
      <button type="button">next</button>
    </>,
  );
  await userEvent.tab();
  expect(onFocus).toHaveBeenCalledTimes(1);
  const el = screen.getByRole('button', { name: 'Buy' });
  fireEvent.pointerDown(el);
  fireEvent.pointerUp(el);
  fireEvent.keyDown(el, { key: 'a' });
  fireEvent.keyUp(el, { key: 'a' });
  expect(onPointerDown).toHaveBeenCalledTimes(1);
  expect(onPointerUp).toHaveBeenCalledTimes(1);
  // userEvent.tab() also fires a Tab keyup on the button it lands on, so count the 'a' only.
  expect(onKeyDown.mock.calls.filter(([e]) => e.key === 'a')).toHaveLength(1);
  expect(onKeyUp.mock.calls.filter(([e]) => e.key === 'a')).toHaveLength(1);
  await userEvent.tab();
  expect(onBlur).toHaveBeenCalledTimes(1);
});

test('a caller style still overrides the computed one', () => {
  render(<Button style={{ background: 'red' }}>Buy</Button>);
  expect(screen.getByRole('button').style.background).toBe('red');
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
  // text/default/inverse-muted, and Figma moved that from 50% to 60% white.
  expect(btn.style.color).toBe('rgba(255, 255, 255, 0.6)');
});

/* ---------------- Loading state (Figma .button-icon loader=true) ---------------- */

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

/* ---------------- UAE PASS (Figma button-uae-pass 39861:22282) ---------------- */

test('UaePassButton login: 48px outline pill, 1px midnight stroke, logo + label', () => {
  const { container } = render(<UaePassButton />);
  const el = screen.getByRole('button', { name: 'Login with UAE PASS' });
  expect(el.style.height).toBe('48px');
  expect(el.style.minWidth).toBe('48px');
  expect(el.style.borderRadius).toBe('1200px');
  expect(el.style.background).toBe('transparent');
  expect(el.style.boxShadow).toMatch(/^inset 0(px)? 0(px)? 0(px)? 1px /);
  expect(el.style.boxShadow).toMatch(MIDNIGHT); // button/secondary/text/midnight/default
  expect(el.style.color).toMatch(MIDNIGHT);
  expect(el.style.fontSize).toBe('16px'); // button/lg
  expect(el.style.fontWeight).toBe('600');
  expect(el.style.paddingLeft).toBe('12px'); // spacing/md
  const logo = container.querySelector('svg')!;
  expect(logo.getAttribute('width')).toBe('24');
  expect(logo).toHaveAttribute('aria-hidden', 'true');
});

test('UaePassButton continue label', () => {
  render(<UaePassButton variant="continue" />);
  expect(screen.getByRole('button', { name: 'Continue with UAE PASS' })).toBeInTheDocument();
});

test('UaePassButton rtl: Arabic label, laid out right-to-left (logo after the text)', () => {
  render(<UaePassButton variant="rtl" />);
  const el = screen.getByRole('button', { name: 'تسجيل الدخول بالهوية الرقمية' });
  expect(el).toHaveAttribute('dir', 'rtl');
  expect(el).toHaveAttribute('lang', 'ar');
});

test('UaePassButton disabled: grey stroke and text, dimmed logo, no click', async () => {
  const fn = vi.fn();
  const { container } = render(<UaePassButton disabled onClick={fn} />);
  const el = screen.getByRole('button');
  expect(el.style.boxShadow).toMatch(GREY); // button/secondary/border/brand/disabled
  expect(el.style.color).toMatch(GREY); // button/secondary/text/midnight/disabled
  expect(el.style.opacity).toBe('');
  expect((container.querySelector('svg') as unknown as HTMLElement).style.opacity).toBe('0.34');
  await userEvent.click(el);
  expect(fn).not.toHaveBeenCalled();
});

test('UaePassButton accepts a label override and keeps the html type', () => {
  render(<UaePassButton type="submit">Sign in with UAE PASS</UaePassButton>);
  const el = screen.getByRole('button', { name: 'Sign in with UAE PASS' });
  expect(el).toHaveAttribute('type', 'submit');
});

test('UaePassButton shows a focus ring on keyboard focus', async () => {
  render(<UaePassButton />);
  await userEvent.tab();
  expect(screen.getByRole('button').style.outlineStyle).toBe('solid');
});

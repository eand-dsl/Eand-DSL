import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

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
  // jsdom normalizes hex -> rgb
  expect(screen.getByRole('button').style.background).toMatch(/#e00800|rgb\(224,\s*8,\s*0\)/i);
});

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

test('primary/brand wires the brand surface token', () => {
  render(<Button variant="primary" tone="brand">Buy</Button>);
  const btn = screen.getByRole('button');
  expect(btn.style.getPropertyValue('--btn-surface')).toBe(
    'var(--eand-color-button-primary-surface-brand-default)',
  );
});

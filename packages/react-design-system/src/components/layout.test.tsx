import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Section } from './layout';

/* ---------------- Section V1.1 (Figma 25519:12055 / 32899:266508) ---------------- */

test('Section renders title, context and a chevron trigger by default', () => {
  render(<Section title="Section" context="Cover these with your Smiles Points" />);
  expect(screen.getByText('Section')).toBeInTheDocument();
  expect(screen.getByText('Cover these with your Smiles Points')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'See all' })).toBeInTheDocument();
});

test.each([
  ['xs', '72px'], ['sm', '148px'], ['md', '224px'], ['lg', '300px'], ['xl', '452px'],
] as const)('Section size=%s reserves the row height %s for its slot', (size, h) => {
  const { container } = render(<Section title="S" size={size}><div>card</div></Section>);
  const slot = container.querySelector('section')!.querySelector('div > div') as HTMLElement;
  expect(slot.style.minHeight).toBe(h);
});

test('Section inverse surface uses brand red with white text', () => {
  const { container } = render(<Section title="S" surface="inverse" />);
  const sec = container.querySelector('section')!;
  expect(sec.style.background).toBe('rgb(224, 8, 0)'); // #e00800
  expect(screen.getByText('S').style.color).toBe('rgb(255, 255, 255)');
});

test('Section trigger=button renders a text button and fires onTrigger', async () => {
  const fn = vi.fn();
  render(<Section title="S" trigger="button" triggerLabel="See all" onTrigger={fn} />);
  const btn = screen.getByRole('button', { name: /See all/ });
  await userEvent.click(btn);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('Section trigger=none hides the trigger', () => {
  render(<Section title="S" trigger="none" />);
  expect(screen.queryByRole('button')).toBeNull();
});

test('Section showHeader={false} drops the whole header', () => {
  render(<Section title="Hidden" showHeader={false}><div>body</div></Section>);
  expect(screen.queryByText('Hidden')).toBeNull();
  expect(screen.getByText('body')).toBeInTheDocument();
});

test('Section titleLine controls the line clamp', () => {
  const { rerender } = render(<Section title="Long title" />);
  expect((screen.getByText('Long title').style as any).webkitLineClamp).toBe('1');
  rerender(<Section title="Long title" titleLine={2} />);
  expect((screen.getByText('Long title').style as any).webkitLineClamp).toBe('2');
});

test('Section back-compat: hideChevron + onSeeAll still work', async () => {
  const fn = vi.fn();
  const { rerender } = render(<Section title="S" hideChevron />);
  expect(screen.queryByRole('button')).toBeNull();
  rerender(<Section title="S" onSeeAll={fn} />);
  await userEvent.click(screen.getByRole('button', { name: 'See all' }));
  expect(fn).toHaveBeenCalledTimes(1);
});

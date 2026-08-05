import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar, QuickAction } from './navigation';

/* ---------------- TopBar V1.1 slot system (Figma 22542:13963) ---------------- */

test('TopBar compact default = one 56px row with a left-aligned title', () => {
  const { container } = render(<TopBar title="Account" />);
  const header = container.querySelector('header')!;
  expect(header.style.height).toBe('56px');
  expect(screen.getByText('Account')).toBeInTheDocument();
});

test('TopBar brand hero uses the brand surface and rounds its bottom', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Large title" statusBar={false} />);
  const header = container.querySelector('header')!;
  expect(header.style.background).toBe('rgb(224, 8, 0)'); // surface.base.brand
  expect(header.style.borderBottomLeftRadius).toBe('20px'); // radius 6
});

test('TopBar big-title block renders eyebrow, title and subtext', () => {
  render(<TopBar surface="brand" eyebrow="Overline" bigTitle="Large title goes here" subtext="Lorem ipsum" statusBar={false} />);
  expect(screen.getByText('Overline')).toBeInTheDocument();
  expect(screen.getByText('Large title goes here')).toBeInTheDocument();
  expect(screen.getByText('Lorem ipsum')).toBeInTheDocument();
});

test('TopBar account display shows greeting over the masked name', () => {
  render(<TopBar account={{ greeting: 'Hi, Ahmed', name: '050 123 4567' }} />);
  expect(screen.getByText('Hi, Ahmed')).toBeInTheDocument();
  expect(screen.getByText('050 123 4567')).toBeInTheDocument();
});

test('TopBar renders bottom-slot children (search, chips…)', () => {
  render(<TopBar surface="brand" bigTitle="Store"><input placeholder="Search for feature" /></TopBar>);
  expect(screen.getByPlaceholderText('Search for feature')).toBeInTheDocument();
});

test('TopBar renders right-part action buttons', async () => {
  const fn = vi.fn();
  render(<TopBar surface="brand" bigTitle="Store" actions={[<button key="b" onClick={fn}>bell</button>]} statusBar={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'bell' }));
  expect(fn).toHaveBeenCalledTimes(1);
});

test('TopBar back-compat: variant="brand" + greeting still renders the account header', () => {
  const { container } = render(<TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567" statusBar={false} />);
  expect(container.querySelector('header')!.style.background).toBe('rgb(224, 8, 0)');
  expect(screen.getByText('Hi, Ahmed')).toBeInTheDocument();
});

test('TopBar statusBar shows the faux iOS clock on brand by default', () => {
  render(<TopBar surface="brand" bigTitle="Store" />);
  expect(screen.getByText('9:41')).toBeInTheDocument();
});

test('TopBar statusBar draws signal/wifi/battery rather than emoji', () => {
  // Emoji render as full-colour platform glyphs, which clash with the brand-red
  // header; the faux iOS row should be monochrome and inherit currentColor.
  const { container } = render(<TopBar surface="brand" bigTitle="Store" />);
  const row = screen.getByText('9:41').parentElement!;
  expect(row.textContent).not.toMatch(/\p{Extended_Pictographic}|[▀-▟]/u);
  expect(row.querySelectorAll('svg').length).toBe(3);
});

test('TopBar does not leak the rounded prop onto the DOM', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Store" rounded={false} statusBar={false} />);
  const header = container.querySelector('header')!;
  expect(header.getAttribute('rounded')).toBeNull();
  expect(header.style.borderBottomLeftRadius).toBe('0');
});

/* ---------------- QuickAction vs Figma `quick-action` 27962:37107 ----------------
   Radius, surface, h148 and padding were already right. The grid arity, label ramp and
   badge placement were not. */

test('QuickAction grid is 2-up by default, matching Figma Grid=On', () => {
  const { container } = render(<QuickAction items={[{ label: 'Add-ons' }]} />);
  expect((container.firstElementChild as HTMLElement).style.gridTemplateColumns).toBe('repeat(2, 1fr)');
});

test('QuickAction label is title/sm 16, not title/xs 14', () => {
  render(<QuickAction items={[{ label: 'Add-ons' }]} />);
  expect(screen.getByText('Add-ons').style.fontSize).toBe('16px');
});

test('QuickAction badge sits in the header row, not absolutely positioned', () => {
  const { container } = render(<QuickAction items={[{ label: 'Add-ons', badge: <b>3</b> }]} />);
  const badgeHost = container.querySelector<HTMLElement>('[data-part="qa-badge"]')!;
  expect(badgeHost.style.position).not.toBe('absolute');
});

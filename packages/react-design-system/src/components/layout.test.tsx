import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Section, Card, GeneralCard, FAQ } from './layout';

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
  render(<Section title="S" size={size}><div>card</div></Section>);
  const slot = screen.getByText('card').parentElement as HTMLElement;
  expect(slot.style.minHeight).toBe(h);
});

/* ---------------- Section V1.2 (Figma `section` 36698:87167, `.section-header` 29389:3807) ----------------
   Header pTop is spacing/lg 16 (was 24). The title applies the heading/lg TEXT STYLE —
   24px / 110% / font/letter-spacing/snug (bound font/size/7) — not the 28px/1.2
   typography/heading/lg variables. The filter pill sits inline after the title
   (`select`, gap spacing/sm 8); the trigger has its own wrapper with spacing/md 12
   inline-start padding, in a 40px (scale/40) field row. */

test('Section header: 16px top padding and a 40px field row', () => {
  render(<Section title="Lorem" context="ctx" />);
  const header = screen.getByText('Lorem').closest('header') as HTMLElement;
  expect(header.style.paddingTop).toBe('16px');
  expect(header.style.paddingLeft).toBe('16px');
  expect(header.style.paddingRight).toBe('16px');
  expect(header.style.paddingBottom).toBe('0px');
  const row = header.firstElementChild as HTMLElement;
  expect(row.style.minHeight).toBe('40px');
  expect(row.style.alignItems).toBe('center');
  expect(row.style.justifyContent).toBe('space-between');
  expect(screen.getByText('ctx').style.paddingTop).toBe('4px');
});

test('Section title is the heading/lg text style: 24px / 1.1 / snug / bold', () => {
  render(<Section title="Lorem" />);
  const t = screen.getByText('Lorem');
  expect(t.style.fontSize).toBe('24px');
  expect(t.style.lineHeight).toBe('1.1');
  expect(parseFloat(t.style.letterSpacing)).toBeCloseTo(-0.35, 3);
  expect(t.style.fontWeight).toBe('700');
});

test('Section filter pill sits inline after the title; the trigger has its own 12px wrapper', () => {
  render(<Section title="Lorem" filterPill={<span data-testid="pill" />} />);
  const title = screen.getByText('Lorem');
  const pill = screen.getByTestId('pill');
  const select = title.parentElement as HTMLElement;
  expect(pill.parentElement).toBe(select);
  expect(title.nextElementSibling).toBe(pill);
  expect(select.style.gap).toBe('8px');
  const trigger = screen.getByRole('button', { name: 'See all' });
  const wrapper = trigger.parentElement as HTMLElement;
  expect(wrapper).not.toBe(select);
  expect(wrapper.style.paddingInlineStart).toBe('12px');
});

test('Section titleLine=2 top-aligns the row and lets the title fill', () => {
  render(<Section title="Long" titleLine={2} />);
  const t = screen.getByText('Long');
  expect((t.parentElement!.parentElement as HTMLElement).style.alignItems).toBe('flex-start');
  expect(t.style.flex).toBe('1 1 auto');
});

test('Section trigger=button is the tertiary lg Button (button/lg type, tertiary brand ink)', () => {
  render(<Section title="S" trigger="button" triggerLabel="Manage" />);
  const btn = screen.getByRole('button', { name: 'Manage' });
  expect(btn.style.fontSize).toBe('16px');
  expect(btn.style.fontWeight).toBe('600');
  expect(btn.style.color).toBe('rgb(224, 8, 0)'); // button/tertiary/text/brand/default
  expect(btn.style.background).toBe('transparent');
});

test('Section trigger=button on an inverse surface uses the tertiary inverse ink', () => {
  render(<Section title="S" surface="midnight-raised" trigger="button" triggerLabel="Manage" />);
  expect(screen.getByRole('button', { name: 'Manage' }).style.color).toBe('rgb(255, 255, 255)');
});

// `.section-surface-default` 26423:39325 / `.section-surface-inverse` 26423:39319
test.each([
  ['default', 'rgb(240, 240, 245)', 'rgb(25, 19, 41)'],              // surface/base/default
  ['raised', 'rgb(255, 255, 255)', 'rgb(25, 19, 41)'],               // surface/raised/default
  ['brand', 'rgb(224, 8, 0)', 'rgb(255, 255, 255)'],                 // surface/base/brand
  ['midnight-base', 'rgb(25, 19, 41)', 'rgb(255, 255, 255)'],        // surface/base/midnight
  ['midnight', 'rgb(25, 19, 41)', 'rgb(255, 255, 255)'],             // back-compat name
  ['midnight-raised', 'rgb(49, 44, 64)', 'rgb(255, 255, 255)'],      // surface/raised/midnight
  ['glass-midnight', 'rgba(25, 19, 41, 0.2)', 'rgb(255, 255, 255)'], // surface/glass/midnight/md
  ['glass-white', 'rgba(255, 255, 255, 0.2)', 'rgb(255, 255, 255)'], // surface/glass/white/lg
] as const)('Section surface=%s fills %s with %s title ink', (surface, bg, ink) => {
  const { container } = render(<Section title="S" surface={surface} />);
  expect(container.querySelector('section')!.style.background).toBe(bg);
  expect(screen.getByText('S').style.color).toBe(ink);
});

test('Section surface=ai-powered is the unbound #ffe4e3 -> #f5f5f7 linear gradient with default ink', () => {
  const { container } = render(<Section title="S" surface="ai-powered" />);
  const bg = container.querySelector('section')!.style.background;
  expect(bg).toContain('linear-gradient');
  expect(bg).toContain('#ffe4e3');
  expect(bg).toContain('#f5f5f7');
  expect(screen.getByText('S').style.color).toBe('rgb(25, 19, 41)');
});

test('Section brand-muted (code-only) still renders', () => {
  const { container } = render(<Section title="S" surface="brand-muted" />);
  expect(container.querySelector('section')!.style.background).not.toBe('');
});

// `gradient` 32553:58207 type=sunset: two blurred glows, not a dark fade.
test('Section gradient is the sunset glow: orange and brand-red blurred ellipses', () => {
  const { container } = render(<Section title="S" size="xl" gradient><div>card</div></Section>);
  const glow = container.querySelector('[data-section-gradient]') as HTMLElement;
  expect(glow).not.toBeNull();
  expect(glow.dataset.sectionGradient).toBe('md');
  expect(glow.style.opacity).toBe('0.96');
  const [orange, red] = Array.from(glow.children) as HTMLElement[];
  expect(orange.style.background).toBe('rgba(250, 112, 12, 0.27)');
  expect(orange.style.filter).toBe('blur(70px)');
  expect(red.style.background).toBe('rgba(224, 8, 0, 0.27)');
  expect(red.style.filter).toBe('blur(55px)');
  expect(container.innerHTML).not.toContain('rgba(20,15,33');
  // The body clips the glow (.section-body clipsContent).
  expect((glow.parentElement as HTMLElement).style.overflow).toBe('hidden');
});

test.each([['xs', 'sm'], ['sm', 'sm'], ['md', 'md'], ['lg', 'md'], ['xl', 'md']] as const)(
  'Section size=%s uses the %s sunset glow', (size, variant) => {
    const { container } = render(<Section title="S" size={size} gradient />);
    expect((container.querySelector('[data-section-gradient]') as HTMLElement).dataset.sectionGradient).toBe(variant);
  },
);

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

/* ---------------- Card surface axis (Figma .card-general 26825:101736) ---------------- */

test.each([
  ['default', 'rgb(255, 255, 255)'],  // surface/raised/default
  ['inverse', 'rgb(49, 44, 64)'],     // surface/raised/midnight
] as const)('Card surface=%s fills with %s', (surface, bg) => {
  const { container } = render(<Card surface={surface} title="t" />);
  expect((container.firstElementChild as HTMLElement).style.background).toBe(bg);
});

test('Card inverse flips the ink to the inverse token', () => {
  const { container } = render(<Card surface="inverse" title="t" />);
  expect((container.firstElementChild as HTMLElement).style.color).toBe('rgb(255, 255, 255)');
});

test('Card radius binds border-radius/6 = 20 with no resting border', () => {
  const { container } = render(<Card title="t" />);
  const el = container.firstElementChild as HTMLElement;
  expect(el.style.borderRadius).toBe('20px');
  expect(el.style.border).toBe('');
});

/* ---------------- GeneralCard (Figma `General-card` 28463:12391, `.card-general` 26825:101736,
   `.card-general-core` 28379:3531, `.badge-placement` 37806:11255) ----------------
   A fixed 224px (rem/14) tile at border-radius/7: a centred title/sm title, an
   absolutely positioned image (sm 64 · md 128 · lg 224 full-bleed) and an optional
   badge 12px in from the corner. Code's `Card` (media over text) has no V1.2 symbol and
   stays as it is. NOTE the published fills: `surface=default` is the DARK card
   (surface/raised/midnight) and `inverse` the white one (surface/base/inverse) — the
   reverse of `Card`'s naming. Logged as a design question. */

test.each([
  ['default', 'rgb(49, 44, 64)', 'rgb(255, 255, 255)'], // .inverse-surface midnight-raised + text/default/inverse
  ['inverse', 'rgb(255, 255, 255)', 'rgb(25, 19, 41)'], // .default-surface (surface/base/inverse) + text/default/default
] as const)('GeneralCard surface=%s fills %s with %s title ink', (surface, bg, ink) => {
  const { container } = render(<GeneralCard surface={surface} title="Control from anywhere" />);
  const card = container.firstElementChild as HTMLElement;
  expect(card.style.background).toBe(bg);
  expect(screen.getByText('Control from anywhere').style.color).toBe(ink);
});

test('GeneralCard shell: 224px tall, radius 20, clips; grid fills, carousel is 147 wide', () => {
  const { container, rerender } = render(<GeneralCard title="T" />);
  const card = container.firstElementChild as HTMLElement;
  expect(card.style.height).toBe('224px');
  expect(card.style.borderRadius).toBe('20px');
  expect(card.style.overflow).toBe('hidden');
  expect(card.style.width).toBe('100%');
  rerender(<GeneralCard title="T" carousel />);
  expect(card.style.width).toBe('147px');
});

test('GeneralCard title: title/sm, centred, clamped to 2 lines, 24px top / 12px side padding', () => {
  render(<GeneralCard title="Control from anywhere" />);
  const t = screen.getByText('Control from anywhere');
  expect(t.style.fontSize).toBe('16px');
  expect(t.style.fontWeight).toBe('600');
  expect(t.style.textAlign).toBe('center');
  expect((t.style as any).webkitLineClamp).toBe('2');
  expect((t.parentElement as HTMLElement).style.padding).toBe('24px 12px 0px');
});

test('GeneralCard topAlignment moves the title to the bottom and the badge to the top', () => {
  const { container } = render(<GeneralCard title="T" topAlignment badge={<span data-testid="b" />} />);
  const card = container.firstElementChild as HTMLElement;
  expect(card.style.justifyContent).toBe('flex-end');
  expect((screen.getByText('T').parentElement as HTMLElement).style.padding).toBe('0px 12px 24px');
  const slot = screen.getByTestId('b').parentElement as HTMLElement;
  expect(slot.style.top).toBe('0px');
  expect(slot.style.bottom).toBe('');
});

test.each([
  ['sm', false, '64px', 'flex-start', '104px'],
  ['md', false, '128px', 'flex-end', '0px'],
  ['lg', false, '224px', 'center', '0px'],
  ['sm', true, '64px', 'flex-start', '56px'],
  ['md', true, '128px', 'flex-start', '0px'],
] as const)('GeneralCard size=%s topAlignment=%s: %s image, aligned %s, offset %s', (size, top, px, align, offset) => {
  render(<GeneralCard title="T" size={size} topAlignment={top} image="x.png" imageAlt="pic" />);
  const img = screen.getByRole('img', { name: 'pic' });
  const box = img.parentElement as HTMLElement;
  expect(box.style.width).toBe(px);
  expect(box.style.height).toBe(px);
  const layer = box.parentElement as HTMLElement;
  expect(layer.style.position).toBe('absolute');
  expect(layer.style.alignItems).toBe(align);
  expect(layer.style.justifyContent).toBe('center');
  expect(layer.style.paddingTop).toBe(offset);
});

test('GeneralCard badge sits at the bottom inline-start corner with 12px padding by default', () => {
  render(<GeneralCard title="T" badge={<span data-testid="b" />} />);
  const slot = screen.getByTestId('b').parentElement as HTMLElement;
  expect(slot.style.position).toBe('absolute');
  expect(slot.style.bottom).toBe('0px');
  expect(slot.style.padding).toBe('12px');
  expect(slot.style.justifyContent).toBe('flex-start');
});

test('GeneralCard badgePlacement=center|end aligns the badge', () => {
  const { rerender } = render(<GeneralCard title="T" badge={<span data-testid="b" />} badgePlacement="end" />);
  expect((screen.getByTestId('b').parentElement as HTMLElement).style.justifyContent).toBe('flex-end');
  rerender(<GeneralCard title="T" badge={<span data-testid="b" />} badgePlacement="center" />);
  expect((screen.getByTestId('b').parentElement as HTMLElement).style.justifyContent).toBe('center');
});

/* ---------------- FAQ (Figma `faq` 38563:27574, page 38563:27249) ----------------
   Optional outline-chip category row (16px padding, 8px gap, 40px chips), then a
   0/16-padded stack of white (surface/base/inverse) 20px-radius accordion cards with a
   4px (spacing/xs) gap. Header: 16px padding, a title/xs question in a 40px block (two
   lines max) and a 24px icon box with a 20px chevron-down / chevron-up. Answer: body/md
   text/default/subtle in a 0/4/4/4 container with 0/12/16/12 padding. One open at a time. */

const QA = [
  { question: 'What is e& Smart Home?', answer: 'A range of smart devices.', category: 'Smart Home' },
  { question: 'How do I get started?', answer: 'Download the app.', category: 'Smart Home' },
  { question: 'How do I pay my bill?', answer: 'From the Billing tab.', category: 'Billing' },
];

test('FAQ items are white 20px cards stacked with a 4px gap in a 0/16 frame', () => {
  render(<FAQ items={QA} />);
  const q = screen.getByRole('button', { name: /What is e& Smart Home\?/ });
  const card = q.parentElement as HTMLElement;
  expect(card.style.background).toBe('rgb(255, 255, 255)');
  expect(card.style.borderRadius).toBe('20px');
  const stack = card.parentElement as HTMLElement;
  expect(stack.style.gap).toBe('4px');
  expect(stack.style.padding).toBe('0px 16px');
});

test('FAQ collapsed header: 16px padding, 12px gap, a 40px question block, title/xs default ink', () => {
  render(<FAQ items={QA} />);
  const q = screen.getByRole('button', { name: /How do I get started\?/ });
  expect(q.style.padding).toBe('16px');
  expect(q.style.gap).toBe('12px');
  const text = screen.getByText('How do I get started?');
  expect(text.style.fontSize).toBe('14px');
  expect(text.style.fontWeight).toBe('600');
  expect(text.style.color).toBe('rgb(25, 19, 41)');
  expect((text.style as any).webkitLineClamp).toBe('2');
  expect((text.parentElement as HTMLElement).style.height).toBe('40px');
  expect(q.getAttribute('aria-expanded')).toBe('false');
  expect(screen.getAllByRole('img', { name: 'chevron-down', hidden: true })).toHaveLength(3);
});

test('FAQ opens one item at a time; the answer is body/md subtle with the Figma insets', async () => {
  render(<FAQ items={QA} defaultOpen={0} />);
  const first = screen.getByRole('button', { name: /What is e& Smart Home\?/ });
  const second = screen.getByRole('button', { name: /How do I get started\?/ });
  expect(first.getAttribute('aria-expanded')).toBe('true');
  const answer = screen.getByText('A range of smart devices.');
  expect(answer.style.fontSize).toBe('14px');
  expect(answer.style.color).toBe('rgb(87, 83, 98)');
  expect(answer.style.padding).toBe('0px 12px 16px');
  expect((answer.parentElement as HTMLElement).style.padding).toBe('0px 4px 4px');
  expect(screen.getByRole('img', { name: 'chevron-up', hidden: true })).toBeInTheDocument();
  // the expanded question is no longer held in the 40px block
  expect((screen.getByText('What is e& Smart Home?').parentElement as HTMLElement).style.height).toBe('');
  await userEvent.click(second);
  expect(second.getAttribute('aria-expanded')).toBe('true');
  expect(first.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByText('A range of smart devices.')).toBeNull();
  await userEvent.click(second);
  expect(second.getAttribute('aria-expanded')).toBe('false');
});

test('FAQ without categories renders no chip row', () => {
  render(<FAQ items={QA} />);
  expect(screen.queryAllByRole('button').every((b) => !b.hasAttribute('aria-pressed'))).toBe(true);
});

test('FAQ categories: outline chips in a 16px-padded row, gap 8, first selected, filtering items', async () => {
  const fn = vi.fn();
  render(<FAQ items={QA} categories={['Smart Home', 'Billing', 'Devices']} onCategoryChange={fn} />);
  const home = screen.getByRole('button', { name: 'Smart Home' });
  const billing = screen.getByRole('button', { name: 'Billing' });
  expect(home.getAttribute('aria-pressed')).toBe('true');
  expect(billing.getAttribute('aria-pressed')).toBe('false');
  expect(home.style.height).toBe('40px');
  expect(home.style.background).toBe('rgb(20, 15, 33)'); // chips/default/outline/surface/selected
  const row = home.parentElement as HTMLElement;
  expect(row.style.gap).toBe('8px');
  expect(row.style.overflowX).toBe('auto');
  expect((row.parentElement as HTMLElement).style.padding).toBe('16px');
  expect(screen.getByText('What is e& Smart Home?')).toBeInTheDocument();
  expect(screen.queryByText('How do I pay my bill?')).toBeNull();
  await userEvent.click(billing);
  expect(fn).toHaveBeenCalledWith(1);
  expect(billing.getAttribute('aria-pressed')).toBe('true');
  expect(screen.queryByText('What is e& Smart Home?')).toBeNull();
  expect(screen.getByText('How do I pay my bill?')).toBeInTheDocument();
});

test('FAQ items without a category show under every chip', () => {
  render(<FAQ items={[...QA, { question: 'Always here?', answer: 'Yes.' }]} categories={['Billing']} />);
  expect(screen.getByText('Always here?')).toBeInTheDocument();
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar, ListRow, NavBar, ActionBar, QuickAction, QUICK_ACTION_PRESETS } from './navigation';

const part = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-part="${name}"]`)!;

/* ---------------- TopBar vs Figma V1.2 `topbar` 38172:12163 ----------------
   An inset card: root padding 4/4/0/4 (spacing/xs), wrapper radius 36/36/20/20 (top
   unbound, bottom border-radius/7), padding-bottom 16, fill per surface. Then a 62px iOS
   status bar, the 41px `.topbar-header-schemes` row (three equal columns), and the
   `.tobpar-core` add-ons, each with its own 16px top padding. */

test('TopBar is an inset card: 4px outer padding, radius 36 top / 20 bottom', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Store" statusBar={false} />);
  const header = container.querySelector('header')!;
  expect(header.style.padding).toBe('4px 4px 0px 4px');
  const card = part(container, 'topbar-surface');
  expect(card.style.borderStartStartRadius).toBe('36px');
  expect(card.style.borderStartEndRadius).toBe('36px');
  expect(card.style.borderEndStartRadius).toBe('20px');
  expect(card.style.borderEndEndRadius).toBe('20px');
  expect(card.style.paddingBottom).toBe('16px');
});

test.each([
  ['brand', 'rgb(224, 8, 0)'], // surface/base/brand
  ['midnight', 'rgb(25, 19, 41)'], // surface/base/midnight
  ['white', 'rgb(255, 255, 255)'], // surface/base/inverse
  ['none', 'transparent'], // surface=false
  ['default', 'rgb(255, 255, 255)'], // deprecated alias of white
] as const)('TopBar surface=%s fills the card %s', (surface, bg) => {
  const { container } = render(<TopBar surface={surface} title="Page" statusBar={false} />);
  expect(part(container, 'topbar-surface').style.background).toBe(bg);
});

test('TopBar status bar is the 62px iOS bar with a 17px clock', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Store" />);
  const bar = part(container, 'status-bar');
  expect(bar.style.height).toBe('62px');
  expect(bar.style.fontSize).toBe('17px');
});

test('TopBar statusBar shows the faux iOS clock on brand by default', () => {
  render(<TopBar surface="brand" bigTitle="Store" />);
  expect(screen.getByText('9:41')).toBeInTheDocument();
});

test('TopBar statusBar draws signal/wifi/battery rather than emoji', () => {
  // Emoji render as full-colour platform glyphs, which clash with the brand-red
  // header; the faux iOS row should be monochrome and inherit currentColor.
  render(<TopBar surface="brand" bigTitle="Store" />);
  const row = screen.getByText('9:41').parentElement!;
  expect(row.textContent).not.toMatch(/\p{Extended_Pictographic}|[▀-▟]/u);
  expect(row.querySelectorAll('svg').length).toBe(3);
});

test('TopBar header row is three columns with a truly centred middle (.topbar-header-schemes 38965:82143)', () => {
  // Code used flex with a flex:1 middle, so the logo/title was only centred when both
  // sides happened to be the same width.
  const { container } = render(<TopBar surface="brand" logo actions={['a']} statusBar={false} />);
  const row = part(container, 'topbar-header');
  expect(row.style.display).toBe('grid');
  expect(row.style.gridTemplateColumns).toBe('minmax(0, 1fr) auto minmax(0, 1fr)');
  expect(row.style.paddingInline).toBe('16px');
});

test('TopBar renders `title` in the hero header too (was dropped — bug)', () => {
  render(<TopBar surface="brand" bigTitle="Big" title="Page name" subtitle="Subtitle" statusBar={false} />);
  expect(screen.getByText('Page name')).toBeInTheDocument();
  expect(screen.getByText('Subtitle')).toBeInTheDocument();
});

test('TopBar page name is centred title/sm 16 with a body/md 14 subtitle (.topbar-page-name 31511:35168)', () => {
  render(<TopBar surface="white" title="Page name" subtitle="Subtitle" statusBar={false} />);
  const t = screen.getByText('Page name');
  expect(t.style.fontSize).toBe('16px');
  expect(t.style.fontWeight).toBe('600');
  expect(t.parentElement!.style.textAlign).toBe('center');
  expect(screen.getByText('Subtitle').style.fontSize).toBe('14px');
  expect(t.style.color).toBe('rgb(25, 19, 41)'); // default ink on white
});

test('TopBar logo is the real etisalat logo, white on brand and red on white (not a text "e&")', () => {
  const { container: brand } = render(<TopBar surface="brand" logo statusBar={false} />);
  const mark = within(brand).getByRole('img', { name: 'etisalat' });
  expect(mark.querySelector('g')!.getAttribute('fill')).toBe('#ffffff');
  expect(brand.textContent).not.toContain('e&');
  const { container: white } = render(<TopBar surface="white" logo statusBar={false} />);
  expect(within(white).getByRole('img', { name: 'etisalat' }).querySelector('g')!.getAttribute('fill')).toBe('#E00800');
});

test('TopBar account sits in the header row: body/md name over title/sm number, full ink (.topbar-account 31318:22933)', () => {
  const { container } = render(
    <TopBar surface="brand" account={{ greeting: 'Hi, Ahmed', name: '050 123 4567', avatar: <img alt="me" /> }} statusBar={false} />,
  );
  const row = part(container, 'topbar-header');
  const greeting = within(row).getByText('Hi, Ahmed');
  expect(greeting.style.fontSize).toBe('14px');
  expect(greeting.style.color).toBe('rgb(255, 255, 255)'); // text/default/inverse, not inverse-subtle
  const number = within(row).getByText('050 123 4567');
  expect(number.style.fontSize).toBe('16px');
  expect(within(row).getByAltText('me')).toBeInTheDocument();
});

test('TopBar big title follows `.topbar-title` 31539:6621: body/md overline, 24px heading/lg style, body/lg subtext in full ink', () => {
  render(<TopBar surface="brand" eyebrow="Overline" eyebrowChevron bigTitle="Large title" subtext="Lorem" statusBar={false} />);
  const eyebrow = screen.getByText('Overline');
  expect(eyebrow.style.fontSize).toBe('14px');
  expect(eyebrow.style.fontWeight).toBe('400');
  // The symbol APPLIES the heading/lg text style (24 / 110% / snug), it does not bind the
  // 28px typography/heading/lg variables the separate `Big title` symbol uses.
  const title = screen.getByText('Large title');
  expect(title.style.fontSize).toBe('24px');
  expect(title.style.lineHeight).toBe('1.1');
  expect(title.style.letterSpacing).toBe('-0.3499999940395355px');
  expect(title.style.fontWeight).toBe('700');
  const sub = screen.getByText('Lorem');
  expect(sub.style.fontSize).toBe('16px');
  expect(sub.style.color).toBe('rgb(255, 255, 255)');
  expect(sub.parentElement!.style.paddingTop).toBe('8px');
  expect(eyebrow.parentElement!.querySelectorAll('svg').length).toBe(1); // overline chevron
});

test('TopBar add-ons get 16px top padding and 16px sides (.tobpar-core 38558:8041)', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Store" statusBar={false}><input placeholder="Search for feature" /></TopBar>);
  expect(screen.getByPlaceholderText('Search for feature')).toBeInTheDocument();
  const addons = part(container, 'topbar-addons');
  expect(addons.style.paddingTop).toBe('16px');
  expect(addons.style.paddingInline).toBe('16px');
  expect(addons.style.gap).toBe('16px');
});

test.each([
  ['brand', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.75)'], // topbar-link glass/inverse
  ['white', 'rgb(240, 240, 245)', 'rgb(87, 83, 98)'], // solid/inverse
  ['none', 'rgb(255, 255, 255)', 'rgb(87, 83, 98)'], // solid/default
] as const)('TopBar controls on %s use the topbar-link look (38792:25385)', (surface, bg, ink) => {
  const { container } = render(<TopBar surface={surface} title="P" actions={['x']} statusBar={false} />);
  const ctl = part(container, 'topbar-link');
  expect(ctl.style.background).toBe(bg);
  expect(ctl.style.color).toBe(ink);
  expect(ctl.style.width).toBe('40px');
});

test('TopBar renders right-part action buttons', async () => {
  const fn = vi.fn();
  render(<TopBar surface="brand" bigTitle="Store" actions={[<button key="b" onClick={fn}>bell</button>]} statusBar={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'bell' }));
  expect(fn).toHaveBeenCalledTimes(1);
});

test('TopBar onBack renders the 40px glass back button (.topbar-body-left-side type=back-button)', async () => {
  const fn = vi.fn();
  render(<TopBar surface="brand" logo onBack={fn} statusBar={false} />);
  const back = screen.getByRole('button', { name: 'Back' });
  expect(back.style.background).toBe('rgba(255, 255, 255, 0.15)'); // button/glass/surface/default
  expect(back.querySelector('[data-rtl-flip] svg')).not.toBeNull();
  await userEvent.click(back);
  expect(fn).toHaveBeenCalledTimes(1);
});

test('TopBar title-only now renders the Figma header (status bar, white card), not the code-only 56px row', () => {
  const { container } = render(<TopBar title="Account" />);
  expect(part(container, 'topbar-surface').style.background).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('9:41')).toBeInTheDocument();
});

test('TopBar compact (deprecated, code-only) still renders one 56px row', () => {
  const { container } = render(<TopBar compact title="Account" />);
  const header = container.querySelector('header')!;
  expect(header.style.height).toBe('56px');
  expect(screen.getByText('Account')).toBeInTheDocument();
});

test('TopBar back-compat: variant="brand" + greeting still renders the account header', () => {
  const { container } = render(<TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567" statusBar={false} />);
  expect(part(container, 'topbar-surface').style.background).toBe('rgb(224, 8, 0)');
  expect(screen.getByText('Hi, Ahmed')).toBeInTheDocument();
});

test('TopBar does not leak the rounded prop onto the DOM', () => {
  const { container } = render(<TopBar surface="brand" bigTitle="Store" rounded={false} statusBar={false} />);
  const header = container.querySelector('header')!;
  expect(header.getAttribute('rounded')).toBeNull();
  expect(part(container, 'topbar-surface').style.borderEndStartRadius).toBe('0');
});

/* ---------------- ListRow vs Figma V1.2 `list-item` 34677:66964 ----------------
   A data row, "not for standalone rows that need a tap target". type=info is a padded
   surface card (16, radius 20); type=price is flat (16 bottom only). Title title/xs 14,
   subtitle body/md 14 text/default/subtle, logo↔content gap 8, core gap 12. */

test('ListRow is not a tap target by default — it renders a non-button element', () => {
  const { container } = render(<ListRow label="Current plan rental" />);
  expect(screen.queryByRole('button')).toBeNull();
  expect(part(container, 'list-row').tagName).toBe('DIV');
});

test('ListRow with onClick stays a button (back-compat)', async () => {
  const fn = vi.fn();
  render(<ListRow label="Settings" onClick={fn} />);
  await userEvent.click(screen.getByRole('button', { name: /Settings/ }));
  expect(fn).toHaveBeenCalledTimes(1);
});

test('ListRow title is title/xs 14 and the subtitle body/md 14 in text/default/subtle', () => {
  render(<ListRow label="Current plan rental" sublabel="Renews 12 Oct" />);
  const t = screen.getByText('Current plan rental');
  expect(t.style.fontSize).toBe('14px');
  expect(t.style.fontWeight).toBe('600');
  const s = screen.getByText('Renews 12 Oct');
  expect(s.style.fontSize).toBe('14px');
  expect(s.style.color).toBe('rgb(87, 83, 98)');
});

test('ListRow chevron is the icon-set chevron-right in a 20px box, not a literal "›" (rule 4)', () => {
  const { container } = render(<ListRow label="Row" />);
  expect(container.textContent).not.toContain('›');
  const chev = part(container, 'list-row-chevron');
  expect(chev.getAttribute('data-rtl-flip')).not.toBeNull();
  expect(chev.style.width).toBe('20px');
  expect(chev.getAttribute('aria-hidden')).toBe('true');
  expect(chev.querySelector('svg')!.getAttribute('width')).toBe('16');
});

test('ListRow type=info is a padded surface card, radius 20 (.list-item-padding padding=true)', () => {
  const { container } = render(<ListRow type="info" label="Row" />);
  const row = part(container, 'list-row');
  expect(row.style.padding).toBe('16px');
  expect(row.style.borderRadius).toBe('20px');
  expect(row.style.background).toBe('rgb(255, 255, 255)'); // surface/raised/default
});

test('ListRow type=price is flat with 16px bottom padding and no surface (.list-item-padding padding=false)', () => {
  const { container } = render(<ListRow type="price" label="Row" value="AED 10" />);
  const row = part(container, 'list-row');
  expect(row.style.padding).toBe('0px 0px 16px 0px');
  expect(row.style.background).toBe('transparent');
});

test.each([
  ['subtle', false, 'rgb(240, 240, 245)'],
  ['sunken', false, 'rgb(228, 227, 234)'],
  ['midnight-base', true, 'rgb(25, 19, 41)'],
  ['midnight-raised', true, 'rgb(49, 44, 64)'],
  ['midnight-transparent', true, 'rgba(25, 19, 41, 0.2)'],
  ['white-transparent', true, 'rgba(255, 255, 255, 0.15)'],
  ['glass', true, 'rgba(255, 255, 255, 0.15)'],
] as const)('ListRow surface=%s (inverse=%s) fills %s (.list-item-surface 34586:21593 / -inverse 34586:21587)', (surface, inverse, bg) => {
  const { container } = render(<ListRow label="Row" surface={surface} inverse={inverse} />);
  expect(part(container, 'list-row').style.background).toBe(bg);
});

test('ListRow inverse scheme: inverse title, inverse-subtle subtitle (.list-item-scheme inverse=true)', () => {
  render(<ListRow inverse label="T" sublabel="S" />);
  expect(screen.getByText('T').style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('S').style.color).toBe('rgba(255, 255, 255, 0.75)');
});

test('ListRow trailing is two lines (title/xs value over body/md hint) with an optional badge (.trailing 40868:18756)', () => {
  const { container } = render(<ListRow type="price" label="Row" value="AED XX.XX" hint="per month" badge={<b>New</b>} />);
  const v = screen.getByText('AED XX.XX');
  expect(v.style.fontSize).toBe('14px');
  expect(v.style.fontWeight).toBe('600');
  expect(v.style.color).toBe('rgb(25, 19, 41)');
  const h = screen.getByText('per month');
  expect(h.style.color).toBe('rgb(87, 83, 98)');
  expect(part(container, 'list-row-value').style.alignItems).toBe('flex-end');
  expect(screen.getByText('New')).toBeInTheDocument();
});

test('ListRow icon tile is 40 radius 12 on surface/glass/midnight/sm, holding a 32 box (.logo type=icon)', () => {
  const { container } = render(<ListRow label="Row" icon={<i>x</i>} />);
  const tile = part(container, 'list-row-leading');
  expect(tile.style.width).toBe('40px');
  expect(tile.style.borderRadius).toBe('12px');
  expect(tile.style.background).toBe('rgba(25, 19, 41, 0.07)');
  expect((tile.firstElementChild as HTMLElement).style.width).toBe('32px');
});

test('ListRow logo tile is surface/base/default (.logo type=logo)', () => {
  const { container } = render(<ListRow label="Row" logo={<img alt="brand" />} />);
  expect(part(container, 'list-row-leading').style.background).toBe('rgb(240, 240, 245)');
});

test('ListRow gaps: core 12, logo↔content 8 (.list-item-core 37905:54931)', () => {
  const { container } = render(<ListRow label="Row" icon={<i>x</i>} />);
  expect(part(container, 'list-row').style.gap).toBe('12px');
  expect(part(container, 'list-row-left').style.gap).toBe('8px');
});

test('ListRow tooltip shows the info glyph after the title, and the action slot sits under the subtitle', () => {
  render(<ListRow label="Row" tooltip sublabel="Sub" action={<a href="#x">Explore</a>} chevron={false} />);
  expect(screen.getByRole('img', { name: 'info-filled' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Explore' })).toBeInTheDocument();
});

/* ---------------- NavBar vs Figma V1.2 `navbar` 29317:6983 ---------------- */

const NAV = [
  { label: 'Home', icon: <i>h</i>, active: true },
  { label: 'Support', icon: <i>s</i> },
  { label: 'Profile', icon: <i>p</i> },
  { label: 'Shop', icon: <i>c</i> },
];

test('NavBar scrim top padding is spacing/lg 16 (was 44)', () => {
  const { container } = render(<NavBar items={NAV} />);
  expect((container.firstElementChild as HTMLElement).style.paddingTop).toBe('16px');
});

test('NavBar glass bar has no border, 4px side padding and no gap between tabs (.navbar-profile 29372:17589)', () => {
  const { container } = render(<NavBar items={NAV} />);
  const bar = part(container, 'navbar-bar');
  expect(bar.style.border).toBe('');
  expect(bar.style.paddingInline).toBe('4px');
  expect(bar.style.gap).toBe('0');
  expect(bar.style.background).toBe('rgba(255, 255, 255, 0.15)'); // surface/glass/white/md
});

test('NavBar active label stays Regular 10px (navbar-tab body/xs)', () => {
  render(<NavBar items={NAV} />);
  const home = screen.getByText('Home');
  expect(home.style.fontWeight).toBe('400');
  expect(home.style.fontSize).toBe('10px');
});

test('NavBar active pill binds navbar-tab/surface/selected and the red selected ink', () => {
  const { container } = render(<NavBar items={NAV} />);
  const tab = screen.getByRole('button', { name: /Home/ });
  expect(tab.style.color).toBe('rgb(224, 8, 0)');
  expect(within(tab).getByText('Home').parentElement!.style.background).toBe('rgb(255, 255, 255)');
  expect(screen.getByRole('button', { name: /Shop/ }).style.color).toBe('rgb(255, 255, 255)');
  expect(container.querySelectorAll('[data-part="navbar-pill"]').length).toBe(4);
});

test('NavBar collapsed keeps equal tabs and narrows the bar to 48px sides (.navbar-scroll down)', () => {
  const { container } = render(<NavBar items={NAV} scrollDirection="down" />);
  const tabs = screen.getAllByRole('button');
  expect(new Set(tabs.map((t) => t.style.flexGrow))).toEqual(new Set(['1']));
  expect(part(container, 'navbar-scroll').style.paddingInline).toBe('48px');
});

test('NavBar home indicator is a 34px block', () => {
  const { container } = render(<NavBar items={NAV} />);
  expect(part(container, 'home-indicator').style.height).toBe('34px');
});

/* ---------------- ActionBar vs Figma V1.2 `action-bar` 28201:38278 ---------------- */

test('ActionBar description is text/default/default (action-bar-scheme 25627:23258 binds it, not subtle)', () => {
  render(<ActionBar title="Title" subtitle="Description" />);
  expect(screen.getByText('Description').style.color).toBe('rgb(25, 19, 41)');
});

test('ActionBar inverse description is text/default/inverse', () => {
  render(<ActionBar surface="glass" title="Title" subtitle="Description" />);
  expect(screen.getByText('Description').style.color).toBe('rgb(255, 255, 255)');
});

test('ActionBar light-family glass: colorScheme="default" + surface="glass" keeps dark ink (.surface-default glass)', () => {
  render(<ActionBar colorScheme="default" surface="glass" title="Title" />);
  const t = screen.getByText('Title');
  expect(t.style.color).toBe('rgb(25, 19, 41)');
  expect((t.closest('[data-part="action-bar"]') as HTMLElement).style.background).toBe('rgba(255, 255, 255, 0.15)');
});

test('ActionBar white-transparent is the inverse family on glass/white/md (.surface-inverse 26714:1796)', () => {
  render(<ActionBar surface="white-transparent" title="Title" />);
  const t = screen.getByText('Title');
  expect(t.style.color).toBe('rgb(255, 255, 255)');
  expect((t.closest('[data-part="action-bar"]') as HTMLElement).style.background).toBe('rgba(255, 255, 255, 0.15)');
});

test('ActionBar chevron trigger is a 20px glyph in a 24px box (.action-bar-trigger chevron)', () => {
  const { container } = render(<ActionBar title="T" chevron />);
  const box = part(container, 'action-bar-chevron');
  expect(box.style.width).toBe('24px');
  expect(box.querySelector('svg')!.getAttribute('width')).toBe('20');
});

test('ActionBar switcher trigger renders a switch (.action-bar-trigger switcher)', async () => {
  const fn = vi.fn();
  render(<ActionBar title="T" switcher={{ onChange: fn }} />);
  await userEvent.click(screen.getByRole('switch'));
  expect(fn).toHaveBeenCalledWith(true);
});

test('ActionBar stack: two 64px glass layers inset 6/12, radius 16, each peeking 10px (type=multiple)', () => {
  const { container } = render(<ActionBar surface="glass" title="T" stack />);
  const layers = [...container.querySelectorAll<HTMLElement>('[data-part="action-bar-layer"]')];
  expect(layers.length).toBe(2);
  for (const l of layers) {
    expect(l.style.height).toBe('64px');
    expect(l.style.borderRadius).toBe('16px');
    expect(l.style.opacity).toBe('');
    expect(l.style.border).toBe('');
  }
  expect(layers.map((l) => [l.style.top, l.style.insetInline]).sort()).toEqual([['18px', '6px'], ['28px', '12px']]);
  expect((container.firstElementChild as HTMLElement).style.paddingBottom).toBe('20px');
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

test('QuickAction carousel is a horizontal scroll of 147px cells, gap 4 (carousel=true)', () => {
  const { container } = render(<QuickAction layout="carousel" items={[{ label: 'A' }, { label: 'B' }, { label: 'C' }, { label: 'D' }]} />);
  const root = container.firstElementChild as HTMLElement;
  expect(root.style.overflowX).toBe('auto');
  expect(root.style.gridAutoFlow).toBe('column');
  expect(root.style.gridAutoColumns).toBe('147px');
  expect(root.style.gap).toBe('4px');
});

test('QuickAction preset types fill label and filled glyph from .quick-action-variants 27917:8012', () => {
  expect(Object.keys(QUICK_ACTION_PRESETS)).toHaveLength(13);
  render(<QuickAction items={[{ type: 'quick-pay' }]} />);
  expect(screen.getByText('Quick Pay & Recharge')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'card-filled' })).toBeInTheDocument();
});

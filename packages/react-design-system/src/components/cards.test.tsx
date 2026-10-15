import { render, screen } from '@testing-library/react';
import { ProductCard, PlanCard, DealCard, NewCard, ServiceCard, Highlight, Recommendation, SmilesBalance, Voucher } from './cards';

const root = (c: HTMLElement) => c.firstElementChild as HTMLElement;
const part = (c: HTMLElement, name: string) => c.querySelector<HTMLElement>(`[data-part="${name}"]`)!;

/* ---------------- Card geometry pinned to Figma tokens ----------------
   V1.2 binds each card's HEIGHT to a section row (a fixed box, not a minimum). */

test.each([
  ['PlanCard', <PlanCard />, '16px', '300px'],       // plans-portable 26003:40647, row-4
  ['DealCard', <DealCard />, '16px', '224px'],       // deals-card 25973:22611, row-3
  ['ServiceCard', <ServiceCard label="l" />, '20px', '148px'], // .service-card-core 37840:18370, row-2
  ['ProductCard', <ProductCard />, '20px', '300px'], // card-features 37905:18719, row-4
] as const)('%s radius/height match Figma', (_name, el, r, h) => {
  const { container } = render(el);
  expect(root(container).style.borderRadius).toBe(r);
  expect(root(container).style.height).toBe(h);
});

/* ---------------- ProductCard vs card-features (V1.2) ---------------- */

test.each([
  ['default', 'rgb(228, 227, 234)'],
  ['orange', 'rgb(252, 243, 235)'],
  ['cyan', 'rgb(235, 247, 252)'],   // binds atom-surfaces/blue
  ['blue', 'rgb(235, 235, 252)'],   // binds atom-surfaces/purple
] as const)('ProductCard tint=%s fills the tint PANEL with %s, not the card', (tint, bg) => {
  // 37905:18719 — `.card-bg-color` fills the header panel; the card stays raised/default.
  const { container } = render(<ProductCard tint={tint} />);
  expect(part(container, 'panel').style.background).toBe(bg);
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
});

test('ProductCard still accepts a raw CSS colour for tint', () => {
  const { container } = render(<ProductCard tint="#123456" />);
  expect(part(container, 'panel').style.background).toBe('rgb(18, 52, 86)');
});

test('ProductCard card surface is raised/default with no resting border', () => {
  const { container } = render(<ProductCard />);
  const el = root(container);
  expect(el.style.background).toBe('rgb(255, 255, 255)');
  expect(el.style.border).toBe('');
});

test('ProductCard panel is radius 24 with the 4px white inside ring', () => {
  // header 25893:54112: border-radius/8, 4px (border/xl) INSIDE stroke border/interactive/inverse/pressed.
  const { container } = render(<ProductCard />);
  const p = part(container, 'panel');
  expect(p.style.borderRadius).toBe('24px');
  expect(p.style.boxShadow).toBe('inset 0 0 0 4px #ffffff');
});

test.each([
  ['package', '176px'],  // 25893:54112 scale/176
  ['product', '144px'],  // 26522:14493 scale/144
] as const)('ProductCard type=%s panel is %s tall', (type, h) => {
  const { container } = render(<ProductCard type={type} image={type === 'product' ? <i>i</i> : undefined} />);
  expect(part(container, 'panel').style.height).toBe(h);
});

test('ProductCard default width is the Figma 229', () => {
  const { container } = render(<ProductCard />);
  expect(root(container).style.width).toBe('229px');
});

test.each(['package', 'product', 'category'] as const)('ProductCard type=%s is row-4 tall', (type) => {
  const { container } = render(<ProductCard type={type} />);
  expect(root(container).getAttribute('data-card-type')).toBe(type);
  expect(root(container).style.height).toBe('300px');
});

test('ProductCard type=addon is the deprecated alias of package', () => {
  const { container } = render(<ProductCard type="addon" />);
  expect(root(container).getAttribute('data-card-type')).toBe('package');
});

test('ProductCard infers its type from image for pre-`type` callers', () => {
  const { container: withImg } = render(<ProductCard image={<i>i</i>} />);
  const { container: without } = render(<ProductCard />);
  expect(root(withImg).getAttribute('data-card-type')).toBe('product');
  expect(root(without).getAttribute('data-card-type')).toBe('package');
});

test('ProductCard type=category tints the panel orange, not the card', () => {
  const { container } = render(<ProductCard type="category" />);
  expect(part(container, 'panel').style.background).toBe('rgb(252, 243, 235)'); // atom-surfaces/orange
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
});

test('ProductCard titles use the V1.2 heading styles: package/product 18, category 20', () => {
  // 25893:54385 / 26523:18817 heading/sm (font/size/5); 26521:1402 heading/md (font/size/6).
  render(<ProductCard type="package" title="Pkg" />);
  expect(screen.getByText('Pkg').style.fontSize).toBe('18px');
  expect(screen.getByText('Pkg').style.lineHeight).toBe('1.1');
  render(<ProductCard type="category" title="Cat" />);
  expect(screen.getByText('Cat').style.fontSize).toBe('20px');
});

test('ProductCard overline and "From" are body/md 14 subtle; price is body/xl 20 Regular', () => {
  // .product-card-price 32477:102451 / -price-label 32466:90703
  render(<ProductCard eyebrow="Data" price="AED 200" period="/mo" />);
  expect(screen.getByText('Data').style.fontSize).toBe('14px');
  expect(screen.getByText('Data').style.color).toBe('rgb(87, 83, 98)');
  expect(screen.getByText('From').style.fontSize).toBe('14px');
  const price = screen.getByText(/AED 200/);
  expect(price.style.fontSize).toBe('20px');
  expect(price.style.fontWeight).toBe('400');
});

test('ProductCard price label variants', () => {
  render(<ProductCard priceLabel="pay-only" />);
  expect(screen.getByText('Pay only')).toBeInTheDocument();
  render(<ProductCard priceLabel="smiles-combined" labelPts="30" />);
  expect(screen.getByText(/From 30 PTS/)).toBeInTheDocument();
});

test('ProductCard discount badge is lg and sits in the footer, not the header', () => {
  // .product-card-badge-or-color-selection 34393:96879 — badges-offers lg in the footer.
  const { container } = render(<ProductCard eyebrow="Data" discount="20% off" />);
  const badge = screen.getByText('20% off');
  expect(badge.style.height).toBe('24px');
  expect(part(container, 'footer').contains(badge)).toBe(true);
  expect(part(container, 'panel').contains(badge)).toBe(false);
});

test('ProductCard color-spot replaces the badge with 12px swatches', () => {
  const { container } = render(<ProductCard colors={['#4fa0f8', '#b3b3b3']} />);
  const spots = part(container, 'color-spot');
  expect(spots.children).toHaveLength(2);
  expect((spots.firstElementChild as HTMLElement).style.width).toBe('12px');
});

test('ProductCard logo row renders on request only', () => {
  const { container: off } = render(<ProductCard />);
  expect(off.querySelector('[data-part="logo-row"]')).toBeNull();
  const { container: on } = render(<ProductCard logos />);
  expect(on.querySelector('[data-part="logo-row"]')).not.toBeNull();
});

/* ---------------- PlanCard vs Figma `plans-portable` 26003:40647 ---------------- */

test.each([
  ['default', 'rgb(255, 255, 255)'],   // 26003:40646 surface/base/inverse
  ['inverse', 'rgb(25, 19, 41)'],      // 26003:40648 surface/base/midnight
] as const)('PlanCard colorScheme=%s fills with %s', (colorScheme, bg) => {
  const { container } = render(<PlanCard colorScheme={colorScheme} />);
  expect(root(container).style.background).toBe(bg);
});

test('PlanCard deprecated variant=midnight equals colorScheme=inverse', () => {
  const { container: a } = render(<PlanCard variant="midnight" />);
  const { container: b } = render(<PlanCard colorScheme="inverse" />);
  expect(root(a).style.background).toBe(root(b).style.background);
});

test('PlanCard colorScheme wins over variant, and width is the Figma 222', () => {
  const { container } = render(<PlanCard colorScheme="default" variant="midnight" />);
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
  expect(root(container).style.width).toBe('222px');
});

test('PlanCard title is the heading/md STYLE, 20/110% — not the 24 variable', () => {
  // 37502:7996 title applies heading/md, fontSize bound to font/size/6 (G6 X1).
  render(<PlanCard name="Entertainment plans" />);
  const t = screen.getByText('Entertainment plans');
  expect(t.style.fontSize).toBe('20px');
  expect(t.style.lineHeight).toBe('1.1');
});

test('PlanCard price is title/md 20', () => {
  render(<PlanCard price="AED 1250" period="/mo" />);
  expect(screen.getByText(/AED 1250/).style.fontSize).toBe('20px');
});

test('PlanCard category and "from" are body/md 14 in text/default/subtle', () => {
  render(<PlanCard category="Postpaid" />);
  const cat = screen.getByText('Postpaid');
  expect(cat.style.fontSize).toBe('14px');
  expect(cat.style.color).toBe('rgb(87, 83, 98)');            // text/default/subtle #575362
  expect(screen.getByText('from').style.fontSize).toBe('14px');
});

test('PlanCard inverse ink binds text/default/inverse and inverse-subtle, not rgba literals', () => {
  render(<PlanCard colorScheme="inverse" category="Postpaid" name="Plan" />);
  expect(screen.getByText('Postpaid').style.color).toBe('rgba(255, 255, 255, 0.75)'); // inverse-subtle
  expect(screen.getByText('Plan').style.color).toBe('rgb(255, 255, 255)');
});

test('PlanCard discount badge is the lg red Discount, in the footer, on both schemes', () => {
  // 26003:40504 — badges-offers[lg, Discount] in the footer column; inverse uses it too.
  for (const scheme of ['default', 'inverse'] as const) {
    const { container, unmount } = render(<PlanCard colorScheme={scheme} discount />);
    const b = screen.getByText('Discount');
    expect(b.style.minWidth).toBe('64px');
    expect(b.style.background).toBe('rgb(224, 8, 0)');
    expect(part(container, 'footer').contains(b)).toBe(true);
    unmount();
  }
});

test('PlanCard header gap is spacing/xs and the logo row is md (32px logos)', () => {
  const { container } = render(<PlanCard />);
  expect(part(container, 'header').style.gap).toBe('4px');
  expect(part(container, 'logo').style.width).toBe('32px');
});

test('PlanCard price-from toggle hides "from"', () => {
  render(<PlanCard from={false} />);
  expect(screen.queryByText('from')).not.toBeInTheDocument();
});

/* ---------------- DealCard vs Figma `deals-card` 25973:22611 ---------------- */

test('DealCard is 166x224 on surface/base/inverse with no border', () => {
  const { container } = render(<DealCard />);
  const el = root(container);
  expect(el.style.width).toBe('166px');     // section/body/width/col-12
  expect(el.style.height).toBe('224px');    // row-3
  expect(el.style.background).toBe('rgb(255, 255, 255)');
  expect(el.style.border).toBe('');
  expect(el.style.padding).toBe('12px');
});

test('DealCard overline body/sm subtle; title heading/xs 16/120%', () => {
  render(<DealCard overline="Top-line" title="Item Name" />);
  expect(screen.getByText('Top-line').style.fontSize).toBe('12px');
  expect(screen.getByText('Top-line').style.color).toBe('rgb(87, 83, 98)');
  expect(screen.getByText('Item Name').style.fontSize).toBe('16px');
  expect(screen.getByText('Item Name').style.lineHeight).toBe('1.2');
});

test('DealCard footer: md Discount badge, struck old price, title/md price', () => {
  // .footer 25928:216907
  render(<DealCard discount="20% off" wasPrice="AED 500" price="AED 400" />);
  expect(screen.getByText('20% off').style.height).toBe('20px');
  const was = screen.getByText('AED 500');
  expect(was.style.textDecoration).toBe('line-through');
  expect(was.style.color).toBe('rgb(144, 142, 154)'); // text/default/muted
  expect(screen.getByText('AED 400').style.fontSize).toBe('20px');
});

test('DealCard feedback pill: 24 tall on glass/midnight/sm with like/dislike', () => {
  const { container } = render(<DealCard likes="120.8k" />);
  const pill = part(container, 'feedback');
  expect(pill.style.height).toBe('24px');
  expect(pill.style.background).toBe('rgba(25, 19, 41, 0.07)');
  expect(screen.getByText('120.8k')).toBeInTheDocument();
  expect(screen.getByLabelText('Like')).toBeInTheDocument();
  expect(screen.getByLabelText('Dislike')).toBeInTheDocument();
});

test('DealCard deprecated subtitle becomes the overline', () => {
  render(<DealCard subtitle="Old subtitle" />);
  expect(screen.getByText('Old subtitle').style.fontSize).toBe('12px');
});

/* ---------------- NewCard vs Figma `.new-on-eand-state` 26523:22852 ---------------- */

test('NewCard selected draws the 2px three-stop ring as an overlay', () => {
  const { container } = render(<NewCard selected />);
  const ring = part(container, 'ring');
  expect(ring.style.padding).toBe('2px');           // border/lg
  expect(ring.style.backgroundImage).toContain('#47cb6c');
  expect(ring.style.backgroundImage).toContain('#191329'); // the middle stop V1.1 lacked
  expect(ring.style.backgroundImage).toContain('#e00800');
});

test('NewCard ring does not change the image geometry (inside stroke)', () => {
  // .new-on-core 37840:19332: the container is 129 wide in both states.
  const a = part(render(<NewCard selected />).container, 'frame');
  const b = part(render(<NewCard />).container, 'frame');
  expect(a.style.padding).toBe(b.style.padding);
  expect(a.style.border).toBe('');
});

test('NewCard unselected has no ring, and binds row-3', () => {
  const { container } = render(<NewCard />);
  expect(container.querySelector('[data-part="ring"]')).toBeNull();
  expect(root(container).style.height).toBe('224px');
});

test('NewCard badge is its own boolean, shown in both states by default', () => {
  // `badge` BOOL (37840:2) is true in both selected variants.
  const { unmount } = render(<NewCard title="T" />);
  expect(screen.getByText('New card')).toBeInTheDocument();
  unmount();
  render(<NewCard title="T" selected badge={false} />);
  expect(screen.queryByText('New card')).not.toBeInTheDocument();
});

test('NewCard has no card surface or card border', () => {
  const { container } = render(<NewCard title="Discover Smart Home Add-ons" />);
  expect(root(container).style.background).toBe('');
  expect(root(container).style.border).toBe('');
});

test('NewCard picture frame is radius 24 with a 4px inset, inner radius 20', () => {
  const { container } = render(<NewCard title="T" />);
  const frame = part(container, 'frame');
  expect(frame.style.borderRadius).toBe('24px');
  expect(frame.style.padding).toBe('4px');
  expect((frame.firstElementChild as HTMLElement).style.borderRadius).toBe('20px');
});

test('NewCard caption is centered body/md, not a left-aligned title', () => {
  render(<NewCard title="Discover Smart Home Add-ons" />);
  const cap = screen.getByText('Discover Smart Home Add-ons');
  expect(cap.style.textAlign).toBe('center');
  expect(cap.style.fontSize).toBe('14px');
});

/* ---------------- ServiceCard vs `.service-card-core` 37840:18370 ---------------- */

test.each([
  ['grid', '109px'],
  ['carousel', '128px'],
] as const)('ServiceCard size=%s is %s wide at h148', (size, w) => {
  const { container } = render(<ServiceCard label="l" size={size} />);
  expect(root(container).style.width).toBe(w);
  expect(root(container).style.height).toBe('148px');
});

test('ServiceCard with no size fills its grid track', () => {
  const { container } = render(<ServiceCard label="l" />);
  expect(root(container).style.width).toBe('');
});

test('ServiceCard padding is 8/8/16/8 and content is top-aligned', () => {
  const { container } = render(<ServiceCard label="l" />);
  expect(root(container).style.padding).toBe('8px 8px 16px 8px');
  expect(root(container).style.justifyContent).toBe('flex-start');
});

test('ServiceCard icon slot is 48 (icon/4xl) under a spacing/2xl top pad', () => {
  const { container } = render(<ServiceCard label="l" />);
  const slot = part(container, 'icon');
  expect(slot.style.paddingTop).toBe('24px');
  expect((slot.firstElementChild as HTMLElement).style.width).toBe('48px');
});

test('ServiceCard title is title/xs 14/600, centred, 40 tall', () => {
  render(<ServiceCard label="Mobile Plans" />);
  const t = screen.getByText('Mobile Plans');
  expect(t.style.fontSize).toBe('14px');
  expect(t.style.fontWeight).toBe('600');
  expect(t.style.textAlign).toBe('center');
  expect(t.style.height).toBe('40px');
});

/* ---------------- Highlight vs V1.2 `highlight` 34272:25571 ---------------- */

test.each([
  ['lg', '452px'], ['md', '224px'], ['sm', '148px'],
] as const)('Highlight size=%s is %s tall at radius 24', (size, h) => {
  // .highlight-sizes 34218:38232 binds the core height to row-6 / row-3 / row-2.
  const { container } = render(<Highlight size={size} />);
  expect(root(container).style.height).toBe(h);
  expect(root(container).style.borderRadius).toBe('24px');
});

test('Highlight title is heading/lg 24/110% and subtitle body/md 14, both opaque inverse', () => {
  // 28382:14309 heading/lg (font/size/7); 28382:14310 body/md text/default/inverse.
  render(<Highlight title="For Travellers" subtitle="Stay connected" />);
  const t = screen.getByText('For Travellers');
  expect(t.style.fontSize).toBe('24px');
  expect(t.style.lineHeight).toBe('1.1');
  const s = screen.getByText('Stay connected');
  expect(s.style.fontSize).toBe('14px');
  expect(s.style.color).toBe('rgb(255, 255, 255)');
});

test('Highlight scrim is the midnight 60/80 gradient from 46% down', () => {
  // 25461:61744 gradient: #191329 a0 -> Midnight %/60% -> Midnight %/80%, transform-mapped.
  const { container } = render(<Highlight />);
  const bg = part(container, 'scrim').style.background;
  expect(bg).toContain('rgba(25, 19, 41, 0) 46%');
  expect(bg).toContain('rgba(25, 19, 41, 0.60) 70%');
  expect(bg).toContain('rgba(25, 19, 41, 0.80) 100%');
});

test('Highlight action renders the glass ActionBar with a md button', () => {
  // action-bar-scheme[color-scheme=inverse] 28382:14477: 72 tall, radius 20, glass/white/md.
  render(<Highlight action={{ title: 'Smiles Unlimited', subtitle: 'Deals', cta: 'Play' }} />);
  const btn = screen.getByText('Play').closest('button')!;
  expect(btn.style.height).toBe('40px');
  const bar = screen.getByText('Smiles Unlimited').closest('div')!;
  expect(bar.style.height).toBe('72px');
  expect(bar.style.borderRadius).toBe('20px');
  expect(bar.style.background).toBe('rgba(255, 255, 255, 0.15)');
});

test('Highlight tag: glass logo row by default, the Limited-time badge on request', () => {
  const { container, unmount } = render(<Highlight />);
  expect(part(container, 'logo').style.background).toBe('rgba(255, 255, 255, 0.2)'); // glass/white/lg
  unmount();
  render(<Highlight tag="badge" />);
  const b = screen.getByText('Limited time offer');
  expect(b.style.height).toBe('24px'); // lg at size lg
});

test('Highlight md/sm hide the heading, as the published sizes do', () => {
  render(<Highlight size="md" title="Hidden title" />);
  expect(screen.queryByText('Hidden title')).not.toBeInTheDocument();
});

test('Highlight placement=stacked lays out 307-wide banners at a 4 gap', () => {
  const { container } = render(<Highlight placement="stacked" items={[{ title: 'Second' }]} />);
  const row = root(container);
  expect(row.style.gap).toBe('4px');
  const banners = row.querySelectorAll<HTMLElement>('[data-size]');
  expect(banners).toHaveLength(2);
  expect(banners[0].style.width).toBe('307px');
});

test('Highlight deprecated tone/cta still render', () => {
  const { container } = render(<Highlight tone="purple" cta="Go" />);
  expect(root(container).style.minHeight).toBe('200px');
  expect(screen.getByText('Go')).toBeInTheDocument();
});

/* ---------------- Recommendation (new) vs `Recommendation` 36698:108342 ---------------- */

test('Recommendation is 224 tall at radius 20, centred, padding 16', () => {
  const { container } = render(<Recommendation />);
  const el = root(container);
  expect(el.style.height).toBe('224px');
  expect(el.style.borderRadius).toBe('20px');
  expect(el.style.padding).toBe('16px');
  expect(el.style.alignItems).toBe('center');
});

test('Recommendation inverse is glass white/md with inverse ink and a white primary button', () => {
  // 36698:86448 .surface-inverse glass; title inverse, description inverse-subtle.
  const { container } = render(<Recommendation title="T" description="D" cta="Explore" />);
  expect(root(container).style.background).toBe('rgba(255, 255, 255, 0.15)');
  expect(screen.getByText('T').style.color).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('D').style.color).toBe('rgba(255, 255, 255, 0.75)');
  expect(screen.getByText('Explore').closest('button')!.style.background).toBe('rgb(255, 255, 255)');
});

test('Recommendation inverse=false is white with a midnight primary button', () => {
  // 36698:86495 surface/base/inverse; button scheme=midnight.
  const { container } = render(<Recommendation inverse={false} title="T" description="D" cta="Explore" />);
  expect(root(container).style.background).toBe('rgb(255, 255, 255)');
  expect(screen.getByText('T').style.color).toBe('rgb(25, 19, 41)');
  expect(screen.getByText('D').style.color).toBe('rgb(87, 83, 98)');
  expect(screen.getByText('Explore').closest('button')!.style.background).toBe('rgb(25, 19, 41)');
});

test('Recommendation title is title/md 20 centred; icon is 32 at radius 8', () => {
  const { container } = render(<Recommendation title="T" />);
  expect(screen.getByText('T').style.fontSize).toBe('20px');
  expect(screen.getByText('T').style.textAlign).toBe('center');
  const icon = part(container, 'icon');
  expect(icon.style.width).toBe('32px');
  expect(icon.style.borderRadius).toBe('8px');
});

test('Recommendation carousel lays out 338-wide cards at a 4 gap', () => {
  const { container } = render(<Recommendation carousel items={[{ title: 'Second' }]} />);
  const row = root(container);
  expect(row.style.gap).toBe('4px');
  expect((row.firstElementChild!.firstElementChild as HTMLElement).style.width).toBe('338px');
  expect(screen.getByText('Second')).toBeInTheDocument();
});

/* ---------------- SmilesBalance vs `smiles-balance-card` 27131:101113 ---------------- */

test('SmilesBalance is the white 148-tall card at radius 16, not the V1.0 gold strip', () => {
  const { container } = render(<SmilesBalance />);
  const el = root(container);
  expect(el.style.background).toBe('rgb(255, 255, 255)'); // surface/base/inverse
  expect(el.style.height).toBe('148px');                  // row-2
  expect(el.style.borderRadius).toBe('16px');
});

test('SmilesBalance total binds the heading/lg variables (28) and "Points" the style (24)', () => {
  render(<SmilesBalance points="40,340" />);
  expect(screen.getByText('40,340').style.fontSize).toBe('28px');
  expect(screen.getByText('Points').style.fontSize).toBe('24px');
  expect(screen.getByText('Points').style.lineHeight).toBe('1.1');
});

test('SmilesBalance progress bar is a 12 pill: sunken/inverse track, positive/subtle fill', () => {
  const { container } = render(<SmilesBalance progress={40} />);
  const bar = part(container, 'bar');
  expect(bar.style.width).toBe('40%');
  expect(bar.style.background).toBe('rgb(84, 188, 114)');
  const track = bar.parentElement!;
  expect(track.style.height).toBe('12px');
  expect(track.style.background).toBe('rgb(240, 240, 245)');
});

test('SmilesBalance activated shows the tier pill and the next-tier line', () => {
  const { container } = render(<SmilesBalance tier="silver" nextTier="gold" pointsToNext="500" />);
  expect(part(container, 'tier')).not.toBeNull();
  expect(part(container, 'next-tier').textContent).toBe('Gold Tier');
  expect(screen.getByText(/Just 500 points to your/)).toBeInTheDocument();
});

test('SmilesBalance points-not-active drops the pill and changes the line', () => {
  const { container } = render(<SmilesBalance active={false} pointsToNext="500" />);
  expect(container.querySelector('[data-part="tier"]')).toBeNull();
  expect(screen.getByText(/Get 500 points for activating/)).toBeInTheDocument();
});

/* ---------------- Voucher vs Figma `Voucher` 28278:13817 ---------------- */

test('Voucher is a fixed 144x144 tile, not a full-width row', () => {
  const { container } = render(<Voucher title="Title with 2 lines" />);
  const el = root(container);
  expect(el.style.width).toBe('144px');
  expect(el.style.height).toBe('144px');
});

test('Voucher draws the ticket silhouette as a path, not a dashed border', () => {
  const { container } = render(<Voucher />);
  expect(container.querySelector('svg path')).toBeInTheDocument();
  expect(root(container).style.border).not.toContain('dashed');
});

test('Voucher Display tints the ticket and the ink', () => {
  const light = render(<Voucher display="light" />).container;
  const dark = render(<Voucher display="dark" />).container;
  // SVG presentation attributes keep the token's raw hex — jsdom only normalises to rgb()
  // for CSS style properties.
  expect(light.querySelector('path')!.getAttribute('fill')).toBe('#ffffff');   // surface/base/inverse
  expect(dark.querySelector('path')!.getAttribute('fill')).toBe('#312c40');    // surface/raised/midnight
});

test('Voucher Applied green differs per display, for contrast', () => {
  // subtle #54bc72 on light, muted #9ff3b7 on dark. One green for both left the dark
  // tile at about 1.3:1 against #312c40.
  render(<Voucher display="light" state="applied" />);
  expect(screen.getByText('Applied').closest('button')!.style.color).toBe('rgb(84, 188, 114)');
  render(<Voucher display="dark" state="applied" />);
  const dark = screen.getAllByText('Applied').at(-1)!.closest('button')!;
  expect(dark.style.color).toBe('rgb(159, 243, 183)');
});

test('Voucher State=Applied swaps the action to a positive "Applied"', () => {
  render(<Voucher state="applied" />);
  expect(screen.getByText('Applied')).toBeInTheDocument();
  expect(screen.queryByText('Apply')).not.toBeInTheDocument();
});

test('Voucher deprecated status maps onto the new state model', () => {
  // active -> Default, redeemed -> Applied. `expired` has no V1.1 equivalent and is
  // rendered as Applied-but-dimmed until design rules on it.
  render(<Voucher status="redeemed" />);
  expect(screen.getByText('Applied')).toBeInTheDocument();
  const { container } = render(<Voucher status="expired" />);
  expect(Number(root(container).style.opacity)).toBeLessThan(1);
});

/* Found on the docs site: the tier text used the `background` shorthand with
   background-clip: text. When nextTier changed, React re-set the shorthand, which resets
   background-clip, and the words became a solid gradient block. backgroundImage doesn't. */
test('SmilesBalance tier text keeps its text clip when the tier changes', () => {
  const { container, rerender } = render(<SmilesBalance nextTier="gold" />);
  rerender(<SmilesBalance nextTier="platinum" />);
  const el = container.querySelector('[data-part="next-tier"]') as HTMLElement;
  expect(el.style.backgroundImage).toMatch(/radial-gradient/);
  expect(el.getAttribute('style')).not.toMatch(/(^|;)\s*background:/);
});

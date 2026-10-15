'use client';

import { useState, useRef, type CSSProperties, type ReactNode } from 'react';
import {
  Button, UaePassButton, Badge, StatusIndicator, MoreItems, Chip, Tabs, TopBar, Section, ListRow, QuickAction, NavBar, PlanCard,
  Snackbar, Alert,
  Input, OtpInput, FilterPill, Checkbox, ConsentCheckbox, Radio, Switcher, Searchbar, AISearch, Selectors, Picker,
  Logo, LogoRow, ProgressBar, Stepper, AddTrigger, Dismiss, AtomSurface, SmilesRow,
  Card, GeneralCard, FAQ, Accordion, PageHeader, PageTitle, ActionBar, SectionLink, PlanUsageBar, AlertModal, Tooltip, BottomSheet, Scrim,
  ProductCard, DealCard, NewCard, ServiceCard, Highlight, Recommendation, SmilesBalance, Voucher,
  StatusRibbon, ButtonGroup, PaymentRow, PriceLine, ActionBlock, CtaFooter,
  Text,
} from '@eand/react-design-system';
import { Icon as EaIcon } from '@eand/react-design-system';
import type { Snippet } from './code-tabs';
import type { Control, ControlValues } from './controls-panel';
import { snippets } from './snippets';

const ic = (n: string, size = 24) => <EaIcon name={n} size={size} />;
const p = (v: ControlValues, k: string) => v[k] as any;

export interface Page {
  id: string; group: string; title: string; blurb: string;
  frame: 'phone' | 'pad' | 'full';
  controls?: Control[];
  render: (props: ControlValues) => ReactNode;
  code?: Snippet;
  /** Initial reserved stage height (px) so tall variants don't shift the preview on
   *  first paint. The stage never shrinks below the tallest variant it has rendered. */
  minH?: number;
}

/* ---------------- Stage backdrops ----------------
   Demo scenery only — the components themselves are token-styled. Inverse and glass
   variants are drawn on the kind of surface they are published for. */
const BG = {
  canvas: '#f0f0f5',
  grey: '#e4e3ea',
  brand: '#e00800',
  midnight: '#191329',
  /** dark imagery, for glass / inverse */
  night: 'radial-gradient(120% 120% at 20% 0%, #3a3168 0%, #1a1330 60%, #100b1e 100%)',
  /** brand imagery, for glass on red */
  ember: 'linear-gradient(135deg, #e00800 0%, #8a1240 55%, #3a1b6b 100%)',
  /** light imagery, for light-family glass */
  dawn: 'linear-gradient(135deg, #ffd9c7 0%, #f3c6da 45%, #c9c3f0 100%)',
};
const backdrop = (background: string, extra?: CSSProperties): CSSProperties =>
  ({ padding: 24, borderRadius: 16, background, ...extra });

/** Abstract artwork for image slots (Highlight, GeneralCard, sheet visuals). The library
 *  ships no photography; these stand in for campaign imagery. */
function art(a: string, b: string, c: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 452' preserveAspectRatio='xMidYMid slice'>`
    + `<defs><radialGradient id='g' cx='28%' cy='22%' r='95%'><stop offset='0' stop-color='${a}'/><stop offset='.5' stop-color='${b}'/><stop offset='1' stop-color='${c}'/></radialGradient></defs>`
    + `<rect width='400' height='452' fill='url(#g)'/>`
    + `<circle cx='310' cy='110' r='96' fill='#fff' fill-opacity='.14'/><circle cx='80' cy='360' r='150' fill='#fff' fill-opacity='.07'/>`
    + `<circle cx='250' cy='300' r='44' fill='#fff' fill-opacity='.1'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
const ART = {
  sunset: art('#ff9a62', '#e00800', '#3a1b6b'),
  dusk: art('#8f7cf0', '#4a2f8f', '#140f21'),
  sea: art('#7fd3e6', '#2a6fb0', '#191329'),
};
const ArtBlock = ({ src, h }: { src: string; h: number | string }) => (
  <div style={{ height: h, width: '100%', background: `center / cover no-repeat url("${src}")` }} />
);

/** Partner logos for LogoRow-style slots: the etisalat symbol, sized to its circle. */
const logos = (n: number, px: number) => Array.from({ length: n }, (_, i) => <Logo key={i} size={px} />);

/** A clipped phone screen. `transform` makes it the containing block for the
 *  fixed-position overlays (Scrim, BottomSheet, AlertModal), so they open inside the
 *  stage instead of over the docs page. */
function Screen({ children, height = 640 }: { children?: ReactNode; height?: number }) {
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', transform: 'translateZ(0)', background: BG.canvas }}>
      <TopBar surface="white" title="My account" subtitle="050 123 4567" onBack={() => {}} actions={[ic('settings')]} />
      <Section title="My plan" context="Freedom Live Plan 200" trigger="none">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <PlanUsageBar label="Local Data" remaining={20} total={40} unit="GB" />
          <PlanUsageBar label="Minutes" remaining={200} total={500} unit="min" />
        </div>
      </Section>
      {children}
    </div>
  );
}
const Reopen = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <div style={{ position: 'absolute', insetInline: 0, bottom: 32, display: 'flex', justifyContent: 'center' }}>
    <Button onClick={onClick}>{label}</Button>
  </div>
);

/** A row of chips where clicking selects one — inherent interactivity. Removable chips
 *  drop out of the row; the row refills once it is empty. */
const CHIP_ITEMS = ['Manage my Plan', 'Change Plan', 'Family Plan', 'Buy Add-on'];
function ChipRow({ type, check, disabled, removable }: {
  type?: 'outline' | 'filled' | 'glass' | 'inverse'; check?: boolean; disabled?: boolean; removable?: boolean;
}) {
  const [sel, setSel] = useState(0);
  const [items, setItems] = useState(CHIP_ITEMS);
  const shown = items.length ? items : CHIP_ITEMS;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 }}>
      {shown.map((label, i) => (
        <Chip key={label} type={type} check={check} disabled={disabled}
          selected={i === sel} onClick={() => setSel(i)}
          onDismiss={removable ? () => { setItems(shown.filter((x) => x !== label)); setSel(0); } : undefined}>{label}</Chip>
      ))}
    </div>
  );
}

/** Bottom nav with a live-selectable active tab. Tab set switches by variant. */
const NAV_SETS: Record<string, [string, string][]> = {
  'logged-in': [['Home', 'home'], ['Support', 'support'], ['Profile', 'user'], ['mShop', 'store']],
  'logged-out': [['mShop', 'store'], ['Plans', 'grid'], ['Devices', 'phone-device'], ['eLife', 'tv']],
};
function NavBarDemo({ variant }: { variant: string }) {
  const set = NAV_SETS[variant] ?? NAV_SETS['logged-in'];
  const [active, setActive] = useState(variant === 'logged-out' ? 1 : 0);
  const [dir, setDir] = useState<'up' | 'down'>('up');
  const lastY = useRef(0);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const y = e.currentTarget.scrollTop;
    if (y > lastY.current + 4 && y > 12) setDir('down');
    else if (y < lastY.current - 4) setDir('up');
    lastY.current = y;
  };
  return (
    <div style={{ position: 'relative', height: 360, background: '#2a2438', overflow: 'hidden' }}>
      <div onScroll={onScroll} style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '16px 16px 150px' }}>
        <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>Scroll ↑ / ↓ to expand / collapse the nav</div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{ height: 52, borderRadius: 12, background: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
        <NavBar scrollDirection={dir} items={set.map(([label, name], i) => ({
          label, icon: ic(name), active: i === active, onClick: () => setActive(i),
        }))} />
      </div>
    </div>
  );
}

/** A row of filter pills — single active selection, like ChipRow. */
function FilterPillRow({ items, inverse, disabled }: { items: string[]; inverse?: boolean; disabled?: boolean }) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
      {items.map((label, i) => (
        <FilterPill key={label} inverse={inverse} disabled={disabled} selected={i === sel} onClick={() => setSel(i)}>{label}</FilterPill>
      ))}
    </div>
  );
}

/** Surfaces the mark can sit on — Figma `color-scheme` (default vs inverse). Brand and
 *  Midnight both use the inverse scheme; only the backdrop differs. */
const CHECKBOX_SURFACES: Record<string, { bg: string; inverse: boolean }> = {
  Default: { bg: '#ffffff', inverse: false },
  Brand: { bg: BG.brand, inverse: true },
  Midnight: { bg: BG.midnight, inverse: true },
};

/** Interactive checkbox/radio playground — a labelled mark on the chosen surface. */
function CheckboxPlayground({ size, radio, surface, disabled }: { size: 'sm' | 'md'; radio: boolean; surface: string; disabled: boolean }) {
  const [on, setOn] = useState(true);
  const s = CHECKBOX_SURFACES[surface] ?? CHECKBOX_SURFACES.Default;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 48px', borderRadius: 20, background: s.bg, boxShadow: '0 1px 3px rgba(25,19,41,0.12)' }}>
      <Checkbox size={size} radio={radio} inverse={s.inverse} disabled={disabled} checked={on}
        onChange={(e) => setOn(e.currentTarget.checked)} label={disabled ? 'Disabled' : 'Keep me signed in'} />
    </div>
  );
}

/** ActionBar — leading visual + title/subtitle + one trailing trigger, across both
 *  colour schemes. The backdrop follows the scheme the bar resolves to. */
const AB_INVERSE_DEFAULT = ['glass', 'white-transparent', 'midnight-base', 'midnight-raised', 'midnight-transparent'];
function ActionBarDemo({ surface, scheme, leading, title, subtitle, trailing, stack }: {
  surface: string; scheme: string; leading: string; title: boolean; subtitle: boolean; trailing: string; stack: boolean;
}) {
  const colorScheme = scheme === 'auto' ? undefined : (scheme as 'default' | 'inverse');
  const inverse = colorScheme ? colorScheme === 'inverse' : AB_INVERSE_DEFAULT.includes(surface);
  const leadingEl = leading === 'icon'
    ? <EaIcon name="placeholder" size={24} />
    : leading === 'image' ? <ArtBlock src={ART.sunset} h="100%" /> : undefined;
  return (
    <div style={{ padding: 24, minHeight: 220, display: 'flex', alignItems: 'center', background: inverse ? BG.night : BG.dawn }}>
      <ActionBar
        surface={surface as never}
        colorScheme={colorScheme}
        stack={stack}
        icon={leadingEl}
        title={title ? 'Now playing' : undefined}
        subtitle={subtitle ? 'e& podcast · Ep 12' : undefined}
        chevron={trailing === 'chevron'}
        switcher={trailing === 'switcher' ? { defaultChecked: true, 'aria-label': 'Autoplay' } as never : undefined}
        action={trailing === 'button'
          ? <Button size="md" scheme={inverse ? 'inverse' : 'default'}>Play</Button>
          : undefined}
        style={{ width: '100%' }}
      />
    </div>
  );
}

/** A radio group — one selection at a time. */
function RadioGroupDemo({ items, size, inverse, disabled }: { items: string[]; size: 'sm' | 'lg'; inverse: boolean; disabled: boolean }) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start', ...backdrop(inverse ? BG.midnight : '#fff') }}>
      {items.map((label, i) => (
        <Radio key={label} name="radio-demo" size={size} inverse={inverse} disabled={disabled} label={label}
          checked={i === sel} onChange={() => setSel(i)} />
      ))}
    </div>
  );
}

/** Tooltip is always-visible here so the bubble is legible in the docs frame. */
function TooltipDemo({ placement, size, surface, caret, caretAlign }: {
  placement: 'top' | 'bottom' | 'left' | 'right'; size: 'simple' | 'standard' | 'rich'; surface: 'default' | 'dark';
  caret: boolean; caretAlign: 'start' | 'center' | 'end';
}) {
  const rich = size === 'rich';
  const side = placement === 'left' || placement === 'right';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: rich ? (side ? '120px 0' : '260px 0 24px') : '72px 0',
      ...(placement === 'bottom' && rich ? { padding: '24px 0 260px' } : {}) }}>
      <Tooltip
        content={rich ? 'Pay your bill with points and keep the cash for later.' : 'Uses your Smiles Points'}
        title={rich ? 'Smiles Points' : undefined}
        media={rich ? <ArtBlock src={ART.dusk} h={96} /> : undefined}
        steps={rich ? '1 of 3' : undefined}
        action={rich ? <Button size="sm">Next</Button> : undefined}
        onClose={rich ? () => {} : undefined}
        placement={placement} size={size} surface={surface} caret={caret} caretAlign={caretAlign} visible
      >
        <Button size="sm" variant="secondary">Hover target</Button>
      </Tooltip>
    </div>
  );
}

/** Overlay demos open inside a phone screen (see `Screen`). */
function BottomSheetDemo({ type, grabber, icon, description, pills, visual, close }: {
  type: 'basic' | 'detailed' | 'system-message'; grabber: boolean; icon: boolean; description: boolean;
  pills: boolean; visual: boolean; close: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Screen>
      {!open && <Reopen label="Open bottom sheet" onClick={() => setOpen(true)} />}
      <BottomSheet open={open} type={type} grabber={grabber} closeButton={close} onDismiss={() => setOpen(false)}
        title="Choose a plan"
        description={description ? 'All plans include 5G and free Smiles membership.' : undefined}
        icon={icon ? <Logo size={40} /> : undefined}
        visual={visual ? <ArtBlock src={ART.sunset} h={160} /> : undefined}
        pills={pills ? <><Chip type="outline" selected>All</Chip><Chip type="outline">Data</Chip><Chip type="outline">Voice</Chip><Chip type="outline">Roaming</Chip></> : undefined}
        footer={<Button block onClick={() => setOpen(false)}>Confirm</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ListRow type="price" label="Freedom Live 200" sublabel="20 GB · 200 min" value="AED 200.00" hint="per month" chevron={false} />
          <ListRow type="price" label="Freedom Live 400" sublabel="50 GB · 500 min" value="AED 400.00" hint="per month" chevron={false} />
        </div>
      </BottomSheet>
    </Screen>
  );
}
function AlertModalDemo({ integration, visual, description, close }: {
  integration: 'full-screen' | 'bottom-sheet'; visual: boolean; description: boolean; close: boolean;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Screen height={680}>
      {!open && <Reopen label="Show the outcome" onClick={() => setOpen(true)} />}
      <AlertModal open={open} integration={integration}
        visual={visual ? <ArtBlock src={ART.sea} h={integration === 'full-screen' ? 300 : 200} /> : undefined}
        title="Your new plan is active"
        description={description ? 'Freedom Live Plan 200 starts today. We have sent the details to your email.' : undefined}
        onClose={close ? () => setOpen(false) : undefined}
        footer={<Button block onClick={() => setOpen(false)}>Done</Button>} />
    </Screen>
  );
}
function ScrimDemo({ content }: { content: 'modal' | 'sheet' | 'empty' }) {
  const [open, setOpen] = useState(true);
  return (
    <Screen>
      {!open && <Reopen label="Show the scrim" onClick={() => setOpen(true)} />}
      {open && content === 'sheet' ? (
        <BottomSheet type="basic" title="Leave without saving?" description="Your changes to this plan will be lost."
          onDismiss={() => setOpen(false)}
          footer={<ButtonGroup primary={<Button block onClick={() => setOpen(false)}>Keep editing</Button>}
            secondary={<Button block variant="secondary" onClick={() => setOpen(false)}>Leave</Button>} />} />
      ) : open ? (
        <Scrim onClick={() => setOpen(false)} style={{ position: 'fixed', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          {content === 'modal' ? (
            <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: 24, padding: '28px 20px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <PageTitle type="md" status="positive" title="Payment received" description="AED 200.00 was paid to 050 123 4567." />
              <Button block onClick={() => setOpen(false)}>Done</Button>
            </div>
          ) : null}
        </Scrim>
      ) : null}
    </Screen>
  );
}

/** CTA bar / action block shared bits. */
const paymentTile = (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3a3168, #191329)', color: '#fff' }}>
    <EaIcon name="card-filled" size={20} />
  </div>
);
const consent = (inverse?: boolean) => (
  <ConsentCheckbox inverse={inverse} prefix="Agree to the" conjunction="and"
    links={[{ label: 'Terms & Conditions', onClick: () => {} }, { label: 'Privacy Policy', onClick: () => {} }]}
    suffix="before proceeding" />
);
const RIBBON_COPY: Record<string, string> = {
  success: 'Payment method saved', alert: 'Your plan renews tomorrow', warning: 'Card expires this month', info: 'Prices include VAT',
};
const ribbon = (status: string) => status === 'none' ? undefined : (
  <StatusRibbon status={status as never} leadingIcon={ic(status === 'success' ? 'check-circle' : status === 'info' ? 'info' : 'warning')}
    action="View" trailingIcon={<span data-rtl-flip style={{ display: 'inline-flex' }}>{ic('chevron-right', 20)}</span>}>{RIBBON_COPY[status]}</StatusRibbon>
);

const cardStage = (node: ReactNode, bg = BG.grey) => (
  <div style={{ padding: 16, background: bg, display: 'flex', justifyContent: 'center' }}>{node}</div>
);

export const PAGES: Page[] = [
  /* ---------------- Controls ---------------- */
  { id: 'button', group: 'Controls', title: 'Button', frame: 'pad',
    blurb: 'Pill-shaped actions. Five types, three colour schemes, three sizes. Tertiary and link hug their text.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['primary', 'secondary', 'tertiary', 'link', 'glass'] },
      { kind: 'select', prop: 'scheme', label: 'Scheme', options: ['default', 'inverse', 'midnight'], def: 'default' },
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'lg' },
      { kind: 'toggle', prop: 'icon', label: 'Leading icon' },
      { kind: 'toggle', prop: 'block', label: 'Block' },
      { kind: 'toggle', prop: 'loading', label: 'Loading' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Make your own deal' },
    ],
    render: (v) => {
      const variant = p(v, 'variant');
      const scheme = p(v, 'scheme');
      // White-ink buttons need a red or dark backdrop. Secondary's published bindings are
      // crossed: scheme=midnight is the white outline, scheme=inverse the dark one.
      const bg = variant === 'glass' ? BG.ember
        : variant === 'secondary' ? (scheme === 'midnight' ? BG.midnight : undefined)
          : scheme === 'inverse' ? BG.brand : undefined;
      const glyph = { sm: 12, md: 16, lg: 20 }[p(v, 'size') as 'sm' | 'md' | 'lg'];
      return (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box', padding: 24, borderRadius: 16, background: bg }}>
          <Button variant={variant} scheme={variant === 'glass' ? undefined : scheme} size={p(v, 'size')} block={p(v, 'block')}
            loading={p(v, 'loading')} disabled={p(v, 'disabled')}
            leadingIcon={p(v, 'icon') ? <EaIcon name="placeholder" size={glyph} /> : undefined}>{p(v, 'label')}</Button>
        </div>
      );
    } },

  { id: 'uaepassbutton', group: 'Controls', title: 'UaePassButton', frame: 'pad',
    blurb: 'The UAE PASS sign-in button: an outline pill with the UAE PASS mark and fixed copy, in English or Arabic.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['login', 'continue', 'rtl'], def: 'login' },
      { kind: 'toggle', prop: 'block', label: 'Block' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', justifyContent: 'center', width: 343, maxWidth: '100%', ...backdrop('#fff') }}>
        <UaePassButton variant={p(v, 'variant')} block={p(v, 'block')} disabled={p(v, 'disabled')} />
      </div>
    ) },

  { id: 'ctabar', group: 'Controls', title: 'CTA Bar', frame: 'phone', minH: 440,
    blurb: 'Sticky bottom CTA bar: status ribbon, price line, consent line, payment method and button group, on a white card with the home indicator.',
    controls: [
      { kind: 'select', prop: 'buttongroup', label: 'Buttons',
        options: ['Primary', 'Primary+Secondary', 'Primary+Tertiary', 'Primary+Secondary+Tertiary'], def: 'Primary+Secondary' },
      { kind: 'toggle', prop: 'horizontal', label: 'Horizontal', def: false },
      { kind: 'toggle', prop: 'payment', label: 'Payment', def: false },
      { kind: 'select', prop: 'ribbon', label: 'Ribbon', options: ['none', 'success', 'alert', 'warning', 'info'], def: 'none' },
      { kind: 'toggle', prop: 'price', label: 'Price line', def: true },
      { kind: 'toggle', prop: 'terms', label: 'Consent line', def: false },
      { kind: 'toggle', prop: 'surface', label: 'Surface', def: true },
      { kind: 'toggle', prop: 'home', label: 'Home indicator', def: true },
    ],
    render: (v) => {
      const combo: string = p(v, 'buttongroup') ?? 'Primary';
      return (
        <div style={{ width: '100%', background: p(v, 'surface') ? BG.canvas : '#fff', paddingTop: 48 }}>
          <CtaFooter
            surface={p(v, 'surface')}
            ribbon={ribbon(p(v, 'ribbon'))}
            price={p(v, 'price') ? { label: 'Total amount', value: 'AED 1,250.00', actionLabel: 'View details', onAction: () => {} } : undefined}
            terms={p(v, 'terms') ? consent() : undefined}
            payment={p(v, 'payment') ? <PaymentRow icon={paymentTile} label="•••• 4326" onAction={() => {}} /> : undefined}
            actions={p(v, 'payment')
              ? <Button block>Pay now</Button>
              : <ButtonGroup orientation={p(v, 'horizontal') ? 'horizontal' : 'vertical'}
                  primary={<Button block>Continue</Button>}
                  secondary={combo.includes('Secondary') ? <Button block variant="secondary">Save for later</Button> : undefined}
                  tertiary={combo.includes('Tertiary') ? <Button variant="tertiary" size="lg">Cancel</Button> : undefined} />}
            homeIndicator={p(v, 'home')}
          />
        </div>
      );
    } },

  { id: 'actionblock', group: 'Controls', title: 'ActionBlock', frame: 'phone', minH: 300,
    blurb: 'The content of the CTA bar without its card: ribbon, price line, consent line and actions, with the payment method beside the button.',
    controls: [
      { kind: 'select', prop: 'ribbon', label: 'Ribbon', options: ['none', 'success', 'alert', 'warning', 'info'], def: 'success' },
      { kind: 'toggle', prop: 'price', label: 'Price line', def: true },
      { kind: 'toggle', prop: 'terms', label: 'Consent line', def: true },
      { kind: 'toggle', prop: 'payment', label: 'Payment', def: false },
    ],
    render: (v) => (
      <div style={{ width: '100%', background: '#fff', paddingBottom: 20 }}>
        <ActionBlock
          ribbon={ribbon(p(v, 'ribbon'))}
          price={p(v, 'price') ? { label: 'Total amount', value: 'AED 1,250.00' } : undefined}
          terms={p(v, 'terms') ? consent() : undefined}
          payment={p(v, 'payment') ? <PaymentRow icon={paymentTile} label="•••• 4326" onAction={() => {}} /> : undefined}
          actions={p(v, 'payment') ? <Button block>Pay now</Button> : <Button block>Continue</Button>}
        />
      </div>
    ) },

  { id: 'priceline', group: 'Controls', title: 'PriceLine', frame: 'phone',
    blurb: 'A label and an amount on one line, with an optional tertiary action under the label.',
    controls: [
      { kind: 'text', prop: 'label', label: 'Label', def: 'Total amount' },
      { kind: 'text', prop: 'value', label: 'Value', def: 'AED 1,250.00' },
      { kind: 'toggle', prop: 'action', label: 'Action', def: true },
      { kind: 'toggle', prop: 'actionIcon', label: 'Action icon', def: true },
    ],
    render: (v) => (
      <div style={{ width: '100%', background: '#fff', padding: '8px 0 20px' }}>
        <PriceLine label={p(v, 'label')} value={p(v, 'value')}
          actionLabel={p(v, 'action') ? 'View details' : undefined} onAction={() => {}}
          actionIcon={p(v, 'action') && p(v, 'actionIcon') ? <span data-rtl-flip style={{ display: 'inline-flex' }}>{ic('chevron-right', 16)}</span> : undefined} />
        <PriceLine label="VAT (5%)" value="AED 62.50" />
      </div>
    ) },

  { id: 'input', group: 'Controls', title: 'Input', frame: 'pad',
    blurb: 'Filled field with a floating label. A stroke appears only while active or in error. Types: text, dropdown, picker, comment, plus the OTP cell row.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['text', 'dropdown', 'picker', 'comment', 'otp'], def: 'text' },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Email address' },
      { kind: 'select', prop: 'status', label: 'Status', options: ['none', 'helper', 'error', 'success'], def: 'helper' },
      { kind: 'toggle', prop: 'statusIcon', label: 'Status icon', def: true },
      { kind: 'toggle', prop: 'leading', label: 'Leading icon' },
      { kind: 'toggle', prop: 'clearable', label: 'Clearable', def: true },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => {
      const st = p(v, 'status');
      return (
        <div style={{ width: 375, maxWidth: '100%', boxSizing: 'border-box', padding: 20, borderRadius: 16,
          background: p(v, 'inverse') ? BG.night : '#fff' }}>
          {p(v, 'type') === 'otp' ? (
            <OtpInput inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} defaultValue="1234"
              error={st === 'error' ? 'Wrong code, try again' : undefined} />
          ) : (
            <Input type={p(v, 'type')} label={p(v, 'label')} key={p(v, 'type')}
              inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} clearable={p(v, 'clearable')} statusIcon={p(v, 'statusIcon')}
              leadingIcon={p(v, 'leading') ? ic('mail', 20) : undefined}
              defaultValue={p(v, 'type') === 'dropdown' || p(v, 'type') === 'picker' ? 'Value' : 'ahmed@eand.com'}
              helper={st === 'helper' ? 'We’ll never share it.' : undefined}
              error={st === 'error' ? 'Enter a valid email address' : undefined}
              success={st === 'success' ? 'Looks good' : undefined} />
          )}
        </div>
      );
    } },

  { id: 'searchbar', group: 'Controls', title: 'Searchbar', frame: 'pad',
    blurb: 'Rounded search field with a leading magnifier and a trailing voice-search mic.',
    controls: [
      { kind: 'text', prop: 'placeholder', label: 'Placeholder', def: 'Search' },
    ],
    render: (v) => <div style={{ width: 343, maxWidth: '100%' }}><Searchbar placeholder={p(v, 'placeholder')} /></div> },

  { id: 'aisearch', group: 'Controls', title: 'AISearch', frame: 'pad',
    blurb: 'The Searchbar preset for the “Ask e&” assistant entry point. Here it is wired to the live component finder.',
    render: () => <div style={{ width: 343, maxWidth: '100%' }}><AISearch /></div> },

  { id: 'chip', group: 'Controls', title: 'Chip', frame: 'pad',
    blurb: 'Selectable pills in four types: outline, filled, glass, inverse. Click one to select it; removable chips carry a dismiss.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['outline', 'filled', 'glass', 'inverse'], def: 'outline' },
      { kind: 'toggle', prop: 'check', label: 'Check mark', def: true },
      { kind: 'toggle', prop: 'removable', label: 'Removable' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ ...backdrop(p(v, 'type') === 'glass' ? BG.ember : p(v, 'type') === 'inverse' ? BG.midnight : p(v, 'type') === 'filled' ? BG.grey : '#fff') }}>
        <ChipRow type={p(v, 'type')} check={p(v, 'check')} disabled={p(v, 'disabled')} removable={p(v, 'removable')} />
      </div>
    ) },

  { id: 'filterpill', group: 'Controls', title: 'FilterPill', frame: 'pad',
    blurb: 'Dropdown-style filter pill with a caret. One pill in the row is active.',
    controls: [
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={backdrop(p(v, 'inverse') ? BG.midnight : '#fff')}>
        <FilterPillRow items={['All', 'Data', 'Voice', 'Roaming']} inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} />
      </div>
    ) },

  { id: 'checkbox', group: 'Controls', title: 'Checkbox', frame: 'pad',
    blurb: 'Selection mark. Checkbox (square) or radio (circle) share one component. Red with a white tick on light surfaces; white with a red tick on brand or midnight.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md'], def: 'md' },
      { kind: 'select', prop: 'type', label: 'Type', options: ['checkbox', 'radio'], def: 'checkbox' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['Default', 'Brand', 'Midnight'], def: 'Default' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => <CheckboxPlayground size={p(v, 'size')} radio={p(v, 'type') === 'radio'} surface={String(p(v, 'surface'))} disabled={!!p(v, 'disabled')} /> },

  { id: 'consentcheckbox', group: 'Controls', title: 'ConsentCheckbox', frame: 'pad',
    blurb: 'A checkbox with a line of consent copy and up to two inline legal links. Tapping a link opens it without ticking the box.',
    controls: [
      { kind: 'toggle', prop: 'two', label: 'Two links', def: true },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ width: 375, maxWidth: '100%', boxSizing: 'border-box', ...backdrop(p(v, 'inverse') ? BG.midnight : '#fff', { padding: 20 }) }}>
        <ConsentCheckbox inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} defaultChecked
          prefix="Agree to the"
          links={p(v, 'two')
            ? [{ label: 'Terms & Conditions', onClick: () => {} }, { label: 'Privacy Policy', onClick: () => {} }]
            : [{ label: 'Terms & Conditions', onClick: () => {} }]}
          suffix="before proceeding" />
      </div>
    ) },

  { id: 'radio', group: 'Controls', title: 'Radio', frame: 'pad',
    blurb: 'Single-choice control with a 2px ring and a centred dot. Pick one option and the selection follows.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'lg'], def: 'lg' },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => <RadioGroupDemo size={p(v, 'size')} inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} items={['Pay monthly', 'Pay yearly', 'Pay as you go']} /> },

  { id: 'switcher', group: 'Controls', title: 'Switcher', frame: 'pad',
    blurb: 'On/off toggle: md 40×24, sm 32×20. The track turns e& red when on; the inverse scheme is white with a red knob.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md'], def: 'md' },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', ...backdrop(p(v, 'inverse') ? BG.brand : '#fff', { padding: '24px 40px' }) }}>
        <Switcher size={p(v, 'size')} inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} defaultChecked aria-label="Data roaming" />
        <Switcher size={p(v, 'size')} inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} aria-label="Wi-Fi calling" />
      </div>
    ) },

  { id: 'selectors', group: 'Controls', title: 'Selectors', frame: 'pad',
    blurb: 'Segmented control: a pill track with one active segment. Click to switch.',
    render: () => <Selectors options={['Daily', 'Weekly', 'Monthly']} /> },

  { id: 'picker', group: 'Controls', title: 'Picker', frame: 'pad',
    blurb: 'Selectable option tiles: value, caption and a status strip. Selected fills midnight (white on dark) with a check.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'light', 'inverse', 'glass'], def: 'default' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled option' },
    ],
    render: (v) => {
      const surface = p(v, 'surface');
      return (
        <div style={backdrop(surface === 'glass' ? BG.ember : surface === 'inverse' ? BG.midnight : surface === 'light' ? BG.canvas : '#fff')}>
          <Picker surface={surface} defaultValue={1} options={[
            { value: '5', caption: 'AED', badge: '1 GB' },
            { value: '10', caption: 'AED', badge: '3 GB' },
            { value: '20', caption: 'AED', badge: '8 GB', disabled: p(v, 'disabled') },
          ]} />
        </div>
      );
    } },

  { id: 'tabs', group: 'Controls', title: 'Tabs', frame: 'pad',
    blurb: '48px pill tabs: white pills with a red-tinted selected pill, or glass pills on brand, midnight and image surfaces. Click to switch.',
    controls: [
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'icons', label: 'Icons' },
    ],
    render: (v) => (
      <div style={{ width: 375, maxWidth: '100%', boxSizing: 'border-box', ...backdrop(p(v, 'inverse') ? BG.ember : BG.canvas, { padding: '20px 16px' }) }}>
        <Tabs inverse={p(v, 'inverse')} tabs={['For you', 'Account', 'Loyalty']} defaultValue={0}
          icons={p(v, 'icons') ? ['home', 'user', 'gift'] : undefined} />
      </div>
    ) },

  /* ---------------- Primitives ---------------- */
  { id: 'logo', group: 'Primitives', title: 'Logo', frame: 'pad',
    blurb: 'The etisalat logo (V1.2): the square brand symbol in three colour schemes, or a bare lockup, logomark, wordmark or bilingual artwork — with Arabic lockup and wordmark.',
    controls: [
      { kind: 'select', prop: 'version', label: 'Colour', options: ['default', 'white', 'red'], def: 'default' },
      { kind: 'select', prop: 'type', label: 'Type', options: ['symbol', 'lockup', 'logomark', 'wordmark', 'bilingual'], def: 'symbol' },
      { kind: 'toggle', prop: 'rtl', label: 'Arabic (RTL)' },
    ],
    render: (v) => (
      <div style={{ padding: 24, borderRadius: 16, background: p(v, 'version') === 'white' ? BG.midnight : undefined }}>
        <Logo size={140} version={p(v, 'version')} rtl={p(v, 'rtl')}
          type={p(v, 'type') === 'symbol' ? undefined : p(v, 'type')} />
      </div>
    ) },

  { id: 'logorow', group: 'Primitives', title: 'LogoRow', frame: 'pad',
    blurb: 'A row of circular partner logos in three sizes, optionally on glass tiles, closed by a “+N” more-items circle.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'toggle', prop: 'glass', label: 'Glass' },
      { kind: 'select', prop: 'more', label: 'More', options: ['none', 4, 12], def: 4 },
      { kind: 'select', prop: 'moreSurface', label: 'More surface', options: ['inverse', 'default'], def: 'inverse' },
    ],
    render: (v) => {
      const px = { sm: 24, md: 32, lg: 40 }[p(v, 'size') as 'sm' | 'md' | 'lg'];
      const dark = p(v, 'glass') || p(v, 'moreSurface') === 'inverse';
      return (
        <div style={backdrop(dark ? BG.night : '#fff', { padding: '28px 36px' })}>
          <LogoRow size={p(v, 'size')} glass={p(v, 'glass')} logos={logos(3, px)}
            more={p(v, 'more') === 'none' ? undefined : p(v, 'more')} moreSurface={p(v, 'moreSurface')} />
        </div>
      );
    } },

  { id: 'badge', group: 'Primitives', title: 'Badge', frame: 'pad',
    blurb: 'Status badges (neutral, positive, warning, danger) and colour-coded offer badges, in three sizes with an optional chevron.',
    controls: [
      { kind: 'select', prop: 'status', label: 'Status', options: ['neutral', 'positive', 'warning', 'danger', 'brand'], def: 'positive' },
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'toggle', prop: 'chevron', label: 'Chevron' },
      { kind: 'text', prop: 'label', label: 'Text', def: '3 active' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
        <Badge status={p(v, 'status')} size={p(v, 'size')} chevron={p(v, 'chevron')}>{p(v, 'label')}</Badge>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 380 }}>
          <Badge offer="new-plan" size={p(v, 'size')} chevron={p(v, 'chevron')}>New plan</Badge>
          <Badge offer="discount" size={p(v, 'size')} chevron={p(v, 'chevron')}>20% off</Badge>
          <Badge offer="best-seller" size={p(v, 'size')} chevron={p(v, 'chevron')}>Best seller</Badge>
          <Badge offer="limited-time" size={p(v, 'size')} chevron={p(v, 'chevron')}>Limited time</Badge>
        </div>
      </div>
    ) },

  { id: 'statusindicator', group: 'Primitives', title: 'StatusIndicator', frame: 'pad',
    blurb: 'A coloured dot and a short label for the state of a line, order or service. Basic, pill, glass and glass-dark types.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['basic', 'pill', 'glass', 'glass-dark'], def: 'pill' },
      { kind: 'select', prop: 'status', label: 'Status', options: ['positive', 'warning', 'danger', 'neutral'], def: 'positive' },
      { kind: 'toggle', prop: 'dot', label: 'Dot', def: true },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Active' },
    ],
    render: (v) => {
      const type = p(v, 'type');
      const COPY: Record<string, string> = { positive: 'Active', warning: 'Expiring', danger: 'Suspended', neutral: 'Paused' };
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center',
          ...backdrop(type === 'glass' ? BG.dawn : type === 'glass-dark' ? BG.night : '#fff', { padding: '32px 24px' }) }}>
          <StatusIndicator type={type} status={p(v, 'status')} dot={p(v, 'dot')}>{p(v, 'label')}</StatusIndicator>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['positive', 'warning', 'danger', 'neutral'] as const).map((s) => (
              <StatusIndicator key={s} type={type} status={s} dot={p(v, 'dot')}>{COPY[s]}</StatusIndicator>
            ))}
          </div>
        </div>
      );
    } },

  { id: 'moreitems', group: 'Primitives', title: 'MoreItems', frame: 'pad',
    blurb: 'The “+N” circle that closes a truncated row of logos or avatars.',
    controls: [
      { kind: 'select', prop: 'count', label: 'Count', options: [4, 12, 99], def: 4 },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', ...backdrop(p(v, 'surface') === 'inverse' ? BG.night : '#fff', { padding: '28px 40px' }) }}>
        {[24, 32, 40].map((s) => <MoreItems key={s} count={p(v, 'count')} surface={p(v, 'surface')} size={s} />)}
      </div>
    ) },

  { id: 'progressbar', group: 'Primitives', title: 'ProgressBar', frame: 'pad',
    blurb: 'Slim 4px track with a fill. Tone recolours the fill; the default is subtle green.',
    controls: [
      { kind: 'select', prop: 'value', label: 'Value', options: [0, 25, 50, 75, 100], def: 50 },
      { kind: 'select', prop: 'tone', label: 'Tone', options: ['default', 'accent', 'positive', 'warning', 'danger'] },
    ],
    render: (v) => (
      <div style={{ width: 320, maxWidth: '100%' }}>
        <ProgressBar value={p(v, 'value')} tone={p(v, 'tone') === 'default' ? undefined : p(v, 'tone')} />
      </div>
    ) },

  { id: 'stepper', group: 'Primitives', title: 'Stepper', frame: 'pad',
    blurb: 'Segmented step progress: 2–8 equal pill segments, completed ones filled. Inverse scheme for dark surfaces.',
    controls: [
      { kind: 'select', prop: 'steps', label: 'Steps', options: [2, 3, 4, 5, 6, 7, 8], def: 5 },
      { kind: 'select', prop: 'progress', label: 'Progress', options: [0, 1, 2, 3, 4, 5, 6, 7, 8], def: 2 },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
    ],
    render: (v) => (
      <div style={{ width: 375, maxWidth: '100%', boxSizing: 'border-box', padding: 16, borderRadius: 16,
        background: p(v, 'inverse') ? BG.midnight : undefined }}>
        <Stepper steps={p(v, 'steps')} progress={p(v, 'progress')} inverse={p(v, 'inverse')} />
      </div>
    ) },

  { id: 'addtrigger', group: 'Primitives', title: 'AddTrigger', frame: 'pad',
    blurb: 'An “add” affordance: a red plus disc and a label, for adding a card, a line or an add-on.',
    controls: [
      { kind: 'text', prop: 'label', label: 'Label', def: 'Add a line' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
    ],
    render: (v) => (
      <div style={{ width: 343, maxWidth: '100%', boxSizing: 'border-box', ...backdrop(p(v, 'surface') === 'inverse' ? BG.night : '#fff') }}>
        <AddTrigger label={p(v, 'label')} surface={p(v, 'surface')} onClick={() => {}} />
      </div>
    ) },

  { id: 'dismiss', group: 'Primitives', title: 'Dismiss', frame: 'pad',
    blurb: 'Close control: the icon-set dismiss glyph with its X knocked out. Surface default or inverse, size md (24) or sm (20).',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
      { kind: 'select', prop: 'size', label: 'Size', options: ['md', 'sm'], def: 'md' },
    ],
    render: (v) => (
      <div style={backdrop(p(v, 'surface') === 'inverse' ? BG.midnight : '#fff', { padding: 32 })}>
        <Dismiss surface={p(v, 'surface')} size={p(v, 'size')} onClick={() => {}} />
      </div>
    ) },

  { id: 'atomsurface', group: 'Primitives', title: 'AtomSurface', frame: 'pad',
    blurb: 'The shared surface atom: a 20px-radius container in one of the published surface colours.',
    controls: [
      { kind: 'select', prop: 'surfaceColor', label: 'Surface', options: ['default', 'subtle', 'sunken', 'brand', 'midnight-base', 'midnight-raised', 'glass-midnight', 'glass-white'], def: 'default' },
    ],
    render: (v) => {
      const s: string = p(v, 'surfaceColor');
      const dark = s === 'brand' || s.startsWith('midnight') || s.startsWith('glass');
      return (
        <div style={backdrop(s.startsWith('glass') ? BG.ember : BG.canvas, { padding: 32 })}>
          <AtomSurface surfaceColor={s as never} style={{ width: 220, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="title.xs" color={dark ? '#fff' : undefined}>{s}</Text>
          </AtomSurface>
        </div>
      );
    } },

  { id: 'smilesrow', group: 'Primitives', title: 'SmilesRow', frame: 'pad',
    blurb: 'Deprecated: overlapping Smiles avatars with a “+N” chip. Use LogoRow with `more` instead.',
    controls: [
      { kind: 'select', prop: 'count', label: 'Avatars', options: [1, 2, 3], def: 2 },
      { kind: 'select', prop: 'plus', label: 'Overflow', options: [0, 4, 9], def: 4 },
    ],
    render: (v) => <SmilesRow count={p(v, 'count')} plus={p(v, 'plus')} size={36} /> },

  /* ---------------- Layout ---------------- */
  { id: 'section', group: 'Layout', title: 'Section', frame: 'phone', minH: 420,
    blurb: 'The body container: a header (title, context, trigger) over a body slot sized for the card type it holds, from xs list rows to xl highlight banners.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'], def: 'md' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'raised', 'ai-powered', 'brand', 'midnight-base', 'midnight-raised', 'glass-midnight', 'glass-white'], def: 'default' },
      { kind: 'select', prop: 'trigger', label: 'Trigger', options: ['chevron', 'button', 'none'], def: 'chevron' },
      { kind: 'toggle', prop: 'context', label: 'Context', def: true },
      { kind: 'toggle', prop: 'filter', label: 'Filter pill' },
      { kind: 'toggle', prop: 'gradient', label: 'Gradient' },
    ],
    render: (v) => {
      const size = p(v, 'size');
      const surface: string = p(v, 'surface');
      const dark = surface === 'brand' || surface.startsWith('midnight') || surface.startsWith('glass');
      // each size fits a different component in the slot
      const slot = size === 'xs'
        ? <ListRow label="Quick Pay & Recharge" sublabel="Pay any e& bill" icon={ic('card-filled')} inverse={dark} />
        : size === 'sm'
          ? <QuickAction items={[{ type: 'quick-pay' }, { type: 'order-track' }]} />
          : size === 'md'
            ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                <GeneralCard title="Control from anywhere" image={<ArtBlock src={ART.sea} h="100%" />} size="md" />
                <GeneralCard title="Manage your plans" image={<ArtBlock src={ART.dusk} h="100%" />} size="md" surface="inverse" /></div>
            : size === 'lg'
              ? <div style={{ display: 'flex', gap: 4, overflow: 'hidden' }}>
                  <PlanCard colorScheme={dark ? 'default' : 'inverse'} />
                  <PlanCard colorScheme={dark ? 'default' : 'inverse'} name="Data plans" price="AED 650" /></div>
              : <Highlight image={ART.sunset} title="Primary Text 2-lines max" subtitle="Stay in control, even when you’re away"
                  action={{ title: 'Smiles Unlimited', subtitle: 'From AED 50', cta: 'Explore' }} />;
      const section = (
        <Section
          title="Section"
          context={p(v, 'context') ? 'Cover these with your Smiles Points' : undefined}
          surface={surface as never}
          trigger={p(v, 'trigger')}
          triggerLabel="Manage"
          filterPill={p(v, 'filter') ? <FilterPill inverse={dark}>All</FilterPill> : undefined}
          gradient={p(v, 'gradient')}
          size={size}
        >
          {slot}
        </Section>
      );
      return surface.startsWith('glass')
        ? <div style={{ background: `center / cover url("${ART.dusk}")`, padding: '16px 0' }}>{section}</div>
        : section;
    }, code: snippets.section },

  { id: 'card', group: 'Layout', title: 'Card', frame: 'phone',
    blurb: 'A general-purpose content card (code-only): optional media, title, body and an action slot.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
    ],
    render: (v) => cardStage(
      <Card width={280} surface={p(v, 'surface')} media={<ArtBlock src={ART.sunset} h={120} />}
        title="Refer a friend" body="Get AED 50 credit for every friend who joins e&."
        action={<Button size="sm" scheme={p(v, 'surface') === 'inverse' ? 'inverse' : 'default'}>Invite</Button>} />
    ) },

  { id: 'accordion', group: 'Layout', title: 'Accordion', frame: 'phone',
    blurb: 'Expand/collapse disclosure row with an animated caret. For a list of questions, use FAQ.',
    render: () => (
      <div style={{ padding: 16, background: '#fff' }}>
        <Accordion title="What is Freedom Live?" defaultOpen>
          <Text variant="body.md" color="#575362">A postpaid plan with rollover data and Smiles rewards.</Text>
        </Accordion>
        <Accordion title="Can I change plans anytime?">
          <Text variant="body.md" color="#575362">Yes — switch once per billing cycle from the app.</Text>
        </Accordion>
      </div>
    ) },

  { id: 'faq', group: 'Layout', title: 'FAQ', frame: 'phone', minH: 520,
    blurb: 'Questions and answers as white expandable cards, optionally filtered by a row of category chips. One answer is open at a time.',
    controls: [
      { kind: 'toggle', prop: 'categories', label: 'Categories', def: true },
    ],
    render: (v) => (
      // FAQ carries its own 16px inset, so it sits on the canvas under a plain heading;
      // nesting it in a Section body would double the inset.
      <div style={{ background: BG.canvas, paddingBottom: 16 }}>
        <Text as="h3" variant="heading.lg" style={{ display: 'block', margin: 0, padding: '20px 16px 0' }}>Frequently asked questions</Text>
        <FAQ key={String(p(v, 'categories'))} defaultOpen={0}
          categories={p(v, 'categories') ? ['Plans', 'Billing', 'Roaming'] : undefined}
          items={[
            { category: 'Plans', question: 'Can I change my plan before the contract ends?', answer: 'Yes. Upgrades apply straight away; downgrades apply from your next bill.' },
            { category: 'Plans', question: 'Does unused data roll over?', answer: 'On Freedom plans, unused local data rolls over for one month.' },
            { category: 'Billing', question: 'When is my bill issued?', answer: 'Bills are issued on the same day each month. You can see the date under Account.' },
            { category: 'Billing', question: 'Can I pay with Smiles Points?', answer: 'Yes. Choose Smiles at checkout to cover all or part of the amount.' },
            { category: 'Roaming', question: 'How do I turn on roaming?', answer: 'Roaming is on by default. Buy a roaming pack to avoid pay-as-you-go rates.' },
          ]} />
      </div>
    ) },

  { id: 'pageheader', group: 'Layout', title: 'PageHeader', frame: 'phone',
    blurb: 'Opens a content page: a 56px icon, a two-line title of muted and strong words, a subtitle and a row of tab pills. One per screen, directly under the top bar.',
    controls: [
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'subtitle', label: 'Subtitle', def: true },
      { kind: 'toggle', prop: 'tabs', label: 'Tabs', def: true },
    ],
    minH: 360,
    render: (v) => (
      <div style={{ padding: 16, background: p(v, 'inverse') ? 'linear-gradient(160deg,#631c46,#191329)' : BG.canvas }}>
        <PageHeader as="h2" inverse={p(v, 'inverse')} icon={<EaIcon name="home-filled" size={56} color={BG.brand} />}
          title={[{ muted: 'Discover', strong: 'Thermostats.' }, { muted: 'Built for', strong: 'Intelligence' }]}
          subtitle={p(v, 'subtitle') ? 'Your home learns your rhythm — adjusting temperature, saving energy, and creating comfort before you even notice.' : undefined}
          tabs={p(v, 'tabs') ? ['Home', 'Thermostats', 'Cameras', 'Lighting'] : undefined} />
      </div>
    ) },

  { id: 'pagetitle', group: 'Layout', title: 'PageTitle', frame: 'phone',
    blurb: 'Concludes an activity: a status icon, a bold title of at most two lines and an optional description. lg for a full-page outcome, down to xs inside a sheet or card.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['lg', 'md', 'sm', 'xs'], def: 'lg' },
      { kind: 'select', prop: 'alignment', label: 'Alignment', options: ['center', 'left'], def: 'center' },
      { kind: 'select', prop: 'status', label: 'Status', options: ['positive', 'danger', 'warning', 'brand', 'neutral'], def: 'positive' },
      { kind: 'toggle', prop: 'description', label: 'Description', def: true },
    ],
    minH: 240,
    render: (v) => (
      <div style={{ padding: 24, background: '#fff' }}>
        <PageTitle type={p(v, 'type')} alignment={p(v, 'alignment')} status={p(v, 'status')}
          title="Your new plan is active"
          description={p(v, 'description') ? 'Freedom Live Plan 200 starts today. We have sent the details to your email.' : undefined} />
      </div>
    ) },

  { id: 'listrow', group: 'Layout', title: 'ListRow', frame: 'phone',
    blurb: 'A data row: title and subtitle against a value, as a padded card (info) or a flat line item (price), with a leading icon or logo.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['info', 'price'], def: 'info' },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'subtle', 'sunken', 'glass', 'midnight-base', 'midnight-raised', 'midnight-transparent', 'white-transparent'], def: 'default' },
      { kind: 'select', prop: 'leading', label: 'Leading', options: ['icon', 'logo', 'none'], def: 'icon' },
      { kind: 'select', prop: 'trailing', label: 'Trailing', options: ['value', 'value + hint', 'badge'], def: 'value + hint' },
      { kind: 'toggle', prop: 'tooltip', label: 'Tooltip' },
      { kind: 'toggle', prop: 'action', label: 'Action' },
    ],
    render: (v) => {
      const inverse = p(v, 'inverse');
      const lead = (name: string) => p(v, 'leading') === 'icon' ? { icon: ic(name) } : p(v, 'leading') === 'logo' ? { logo: <Logo size={40} /> } : {};
      const trailing = p(v, 'trailing');
      const common = {
        type: p(v, 'type'), inverse, surface: p(v, 'surface'), tooltip: p(v, 'tooltip'),
        action: p(v, 'action') ? <Button variant="tertiary" size="md" scheme={inverse ? 'inverse' : 'default'}>Manage</Button> : undefined,
      };
      return (
        <div style={{ padding: 16, background: inverse ? BG.night : BG.canvas, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ListRow {...common} {...lead('wallet')} label="Freedom Live 200" sublabel="Renews 12 Nov"
            value={trailing !== 'badge' ? 'AED 200.00' : undefined} hint={trailing === 'value + hint' ? 'per month' : undefined}
            badge={trailing === 'badge' ? <Badge offer="discount" size="md">20% off</Badge> : undefined} />
          <ListRow {...common} {...lead('sim')} label="Data roaming pack" sublabel="GCC · 7 days"
            value={trailing !== 'badge' ? 'AED 49.00' : undefined} hint={trailing === 'value + hint' ? 'one-off' : undefined}
            badge={trailing === 'badge' ? <Badge offer="new-plan" size="md">New</Badge> : undefined} />
        </div>
      );
    }, code: snippets.listrow },

  { id: 'quickaction', group: 'Layout', title: 'QuickAction', frame: 'phone',
    blurb: 'Account-hub shortcuts: white 148px tiles with an icon tile, an optional badge and a label. A 2-up grid, or a horizontal carousel.',
    controls: [
      { kind: 'select', prop: 'layout', label: 'Layout', options: ['grid', 'carousel'], def: 'grid' },
      { kind: 'select', prop: 'rows', label: 'Rows', options: [1, 2], def: 1 },
      { kind: 'toggle', prop: 'badge', label: 'Badge', def: true },
    ],
    render: (v) => (
      <div style={{ padding: 16, background: BG.canvas }}>
        <QuickAction layout={p(v, 'layout')} rows={p(v, 'rows')} items={[
          { type: 'quick-pay' },
          { type: 'addon-buy', badge: p(v, 'badge') ? <Badge status="positive" size="lg">3 active</Badge> : undefined },
          { type: 'plan-change' },
          { type: 'order-track' },
          { type: 'live-chat' },
          { type: 'mParking' },
        ].slice(0, p(v, 'layout') === 'grid' ? 4 : 6) as never} />
      </div>
    ), code: snippets.quickaction },

  /* ---------------- Navigation ---------------- */
  { id: 'topbar', group: 'Navigation', title: 'TopBar', frame: 'phone', minH: 400,
    blurb: 'The screen header: a rounded card on brand, midnight, white or transparent, with a status bar, a centred logo or page name, and slots for an account, a big title and add-ons.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['brand', 'midnight', 'white', 'none'], def: 'brand' },
      { kind: 'select', prop: 'layout', label: 'Layout', options: ['title', 'account', 'page'], def: 'title' },
      { kind: 'toggle', prop: 'eyebrow', label: 'Overline', def: true },
      { kind: 'toggle', prop: 'subtext', label: 'Subtext', def: true },
      { kind: 'toggle', prop: 'addons', label: 'Add-ons', def: true },
    ],
    render: (v) => {
      const surface = p(v, 'surface');
      const layout = p(v, 'layout');
      const onDark = surface === 'brand' || surface === 'midnight';
      // Add-ons per surface: glass tab pills on brand/midnight (Figma `.topbar-tabs`),
      // a search field and outline chips on the white and transparent headers.
      const addons = !p(v, 'addons') ? undefined : onDark
        ? <Tabs inverse tabs={['For you', 'Plans', 'Devices']} defaultValue={0} />
        : (
          <>
            <Searchbar placeholder="Search for a feature" />
            <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
              <Chip type="outline" selected check>All</Chip>
              <Chip type="outline">Plans</Chip>
              <Chip type="outline">Devices</Chip>
            </div>
          </>
        );
      const canvas = surface === 'none' ? BG.grey : '#fff';
      const bar = layout === 'page'
        ? <TopBar surface={surface} title="Account details" subtitle="050 123 4567" onBack={() => {}} actions={[ic('settings')]}>{addons}</TopBar>
        : layout === 'account'
          ? <TopBar surface={surface} account={{ greeting: 'Hi, Ahmed', name: '050 123 4567' }} logo
              actions={[ic('magic-wand'), ic('notification')]}>{addons}</TopBar>
          : <TopBar surface={surface} logo onBack={() => {}} actions={[ic('magic-wand'), ic('notification')]}
              eyebrow={p(v, 'eyebrow') ? 'Overline' : undefined} eyebrowChevron={p(v, 'eyebrow')}
              bigTitle="Large title goes here" chevron
              subtext={p(v, 'subtext') ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' : undefined}>{addons}</TopBar>;
      return <div style={{ background: canvas, paddingBottom: 16 }}>{bar}</div>;
    }, code: snippets.topbar },

  { id: 'navbar', group: 'Navigation', title: 'NavBar', frame: 'phone',
    blurb: 'Floating glass bottom nav over a midnight scrim. The active tab is a white pill. Click a tab to move it; scroll the area to collapse it to icons, as the Figma scroll-direction state does.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['logged-in', 'logged-out'] },
    ],
    render: (v) => <NavBarDemo key={p(v, 'variant')} variant={p(v, 'variant')} />,
    code: snippets.navbar },

  { id: 'actionbar', group: 'Navigation', title: 'ActionBar', frame: 'phone',
    blurb: 'Compact bar: a leading visual, a title and subtitle, and one trailing trigger (button, chevron or switcher). Light and inverse colour schemes; multiple-stack on the inverse scheme.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'subtle', 'sunken', 'glass', 'white-transparent', 'midnight-base', 'midnight-raised', 'midnight-transparent'], def: 'default' },
      { kind: 'select', prop: 'scheme', label: 'Color scheme', options: ['auto', 'default', 'inverse'], def: 'auto' },
      { kind: 'select', prop: 'leading', label: 'Leading', options: ['icon', 'image', 'none'], def: 'icon' },
      { kind: 'toggle', prop: 'title', label: 'Title', def: true },
      { kind: 'toggle', prop: 'subtitle', label: 'Subtitle', def: true },
      { kind: 'select', prop: 'trailing', label: 'Trailing', options: ['button', 'chevron', 'switcher', 'none'], def: 'button' },
      { kind: 'toggle', prop: 'stack', label: 'Multiple-stack', def: false },
    ],
    render: (v) => <ActionBarDemo surface={String(p(v, 'surface'))} scheme={String(p(v, 'scheme'))} leading={String(p(v, 'leading'))} title={!!p(v, 'title')} subtitle={!!p(v, 'subtitle')} trailing={String(p(v, 'trailing'))} stack={!!p(v, 'stack')} /> },

  { id: 'sectionlink', group: 'Navigation', title: 'SectionLink', frame: 'phone',
    blurb: 'A heading with a “See all” link (code-only). Inside a Section, use the Section header instead.',
    render: () => (
      <div style={{ padding: 16, background: '#fff' }}>
        <SectionLink title="Deals for you" />
      </div>
    ) },

  /* ---------------- Feedback & Status ---------------- */
  { id: 'snackbar', group: 'Feedback', title: 'Snackbar', frame: 'phone', minH: 260,
    blurb: 'Transient midnight pill confirming an action: a status mark, a message, an optional amount and one button.',
    controls: [
      { kind: 'select', prop: 'status', label: 'Status', options: ['success', 'alert', 'warning', 'info', 'loader'], def: 'success' },
      { kind: 'text', prop: 'message', label: 'Message', def: 'Payment received' },
      { kind: 'toggle', prop: 'aed', label: 'Amount', def: true },
      { kind: 'toggle', prop: 'action', label: 'Action', def: false },
      { kind: 'toggle', prop: 'backdrop', label: 'Backdrop', def: false },
    ],
    render: (v) => (
      <div style={{ position: 'relative', height: 260, background: BG.canvas, overflow: 'hidden' }}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ListRow label="Freedom Live 200" sublabel="Renews 12 Nov" icon={ic('wallet')} value="AED 200.00" />
          <ListRow label="Data roaming pack" sublabel="GCC · 7 days" icon={ic('sim')} value="AED 49.00" />
        </div>
        <div style={{ position: 'absolute', insetInline: 0, bottom: 0, padding: p(v, 'backdrop') ? 0 : '0 16px 24px' }}>
          <Snackbar status={p(v, 'status')} message={p(v, 'message')}
            aed={p(v, 'aed') ? 'AED 60.00' : undefined}
            action={p(v, 'action') ? 'View' : undefined} onAction={() => {}}
            backdrop={p(v, 'backdrop')} />
        </div>
      </div>
    ) },

  { id: 'alert', group: 'Feedback', title: 'Alert', frame: 'pad',
    blurb: 'Inline message for contextual status: a tinted card with a status tile, title, message and one optional button. Stackable.',
    controls: [
      { kind: 'select', prop: 'status', label: 'Status', options: ['success', 'alert', 'warning', 'info', 'info-midnight'], def: 'success' },
      { kind: 'text', prop: 'title', label: 'Title', def: 'You’re all set' },
      { kind: 'text', prop: 'body', label: 'Message', def: 'Your request was completed and everything is updated.' },
      { kind: 'text', prop: 'action', label: 'Action', def: 'Done' },
      { kind: 'select', prop: 'placement', label: 'Action placement', options: ['end', 'below'], def: 'end' },
      { kind: 'toggle', prop: 'stack', label: 'Stack' },
    ],
    render: (v) => (
      <div style={{ width: 375, maxWidth: '100%' }}>
        <Alert status={p(v, 'status')} title={p(v, 'title') || undefined} action={p(v, 'action') || undefined} onAction={() => {}}
          actionPlacement={p(v, 'placement')} stack={p(v, 'stack') ? 3 : undefined} stackIndex={1}>{p(v, 'body')}</Alert>
      </div>
    ) },

  { id: 'alertmodal', group: 'Feedback', title: 'AlertModal', frame: 'phone', minH: 680,
    blurb: 'The outcome screen after a task: a visual, a heading and description, and a footer of actions — full screen or as a bottom sheet.',
    controls: [
      { kind: 'select', prop: 'integration', label: 'Integration', options: ['full-screen', 'bottom-sheet'], def: 'bottom-sheet' },
      { kind: 'toggle', prop: 'visual', label: 'Visual', def: true },
      { kind: 'toggle', prop: 'description', label: 'Description', def: true },
      { kind: 'toggle', prop: 'close', label: 'Close button', def: true },
    ],
    render: (v) => <AlertModalDemo key={p(v, 'integration')} integration={p(v, 'integration')} visual={p(v, 'visual')} description={p(v, 'description')} close={p(v, 'close')} /> },

  { id: 'planusagebar', group: 'Feedback', title: 'PlanUsageBar', frame: 'phone', minH: 180,
    blurb: 'Usage meter: a filled block showing what is left of the plan, with the amount inside it and the category in the track opposite. Green normally, orange on low data; text turns white where the fill covers it.',
    controls: [
      { kind: 'text', prop: 'label', label: 'Label', def: 'Local Data' },
      { kind: 'select', prop: 'remaining', label: 'Remaining', options: [2, 20, 38], def: 20 },
      { kind: 'select', prop: 'total', label: 'Total', options: [40], def: 40 },
      { kind: 'select', prop: 'status', label: 'Status', options: ['default', 'low-data'], def: 'default' },
      { kind: 'text', prop: 'note', label: 'Note', def: '' },
    ],
    render: (v) => (
      // Stacked at the 4px gap the Figma bar-set uses, inset like the Section they sit in.
      <div style={{ width: '100%', padding: '16px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <PlanUsageBar label={p(v, 'label')} remaining={p(v, 'remaining')} total={p(v, 'total')}
          unit="GB" status={p(v, 'status')} note={p(v, 'note') || undefined} />
        <PlanUsageBar label="Minutes" remaining={200} total={500} unit="min" />
        <PlanUsageBar label="Roaming Data" remaining={0.6} total={10} unit="GB" status="low-data" note="Expires 3 days" />
      </div>
    ) },

  /* ---------------- Overlays ---------------- */
  { id: 'tooltip', group: 'Overlays', title: 'Tooltip', frame: 'pad',
    blurb: 'A bubble anchored to its target by a caret. Simple, standard and rich (title, media, steps, action and close).',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['simple', 'standard', 'rich'], def: 'standard' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'dark'], def: 'default' },
      { kind: 'select', prop: 'placement', label: 'Placement', options: ['top', 'bottom', 'left', 'right'], def: 'top' },
      { kind: 'toggle', prop: 'caret', label: 'Caret', def: true },
      { kind: 'select', prop: 'caretAlign', label: 'Caret align', options: ['start', 'center', 'end'], def: 'center' },
    ],
    render: (v) => <TooltipDemo placement={p(v, 'placement')} size={p(v, 'size')} surface={p(v, 'surface')} caret={p(v, 'caret')} caretAlign={p(v, 'caretAlign')} /> },

  { id: 'bottomsheet', group: 'Overlays', title: 'BottomSheet', frame: 'phone', minH: 640,
    blurb: 'A modal sheet that rises from the bottom over a scrim: grabber, optional visual, title, description and pills, a body and a footer.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['basic', 'detailed', 'system-message'], def: 'detailed' },
      { kind: 'toggle', prop: 'grabber', label: 'Grabber', def: true },
      { kind: 'toggle', prop: 'visual', label: 'Visual', def: false },
      { kind: 'toggle', prop: 'icon', label: 'Icon', def: false },
      { kind: 'toggle', prop: 'description', label: 'Description', def: true },
      { kind: 'toggle', prop: 'pills', label: 'Pills', def: true },
      { kind: 'toggle', prop: 'close', label: 'Close button', def: true },
    ],
    render: (v) => <BottomSheetDemo type={p(v, 'type')} grabber={p(v, 'grabber')} visual={p(v, 'visual')} icon={p(v, 'icon')}
      description={p(v, 'description')} pills={p(v, 'pills')} close={p(v, 'close')} /> },

  { id: 'scrim', group: 'Overlays', title: 'Scrim', frame: 'phone', minH: 640,
    blurb: 'The dimmed, blurred layer behind sheets and modals. It blocks the screen beneath and dismisses on tap.',
    controls: [
      { kind: 'select', prop: 'content', label: 'Over it', options: ['modal', 'sheet', 'empty'], def: 'modal' },
    ],
    render: (v) => <ScrimDemo key={p(v, 'content')} content={p(v, 'content')} /> },

  /* ---------------- Cards ---------------- */
  { id: 'plancard', group: 'Cards', title: 'PlanCard', frame: 'phone',
    blurb: 'Portable plan card: overline, plan name, a Smiles logo row and a “from AED…/mo” price, with a discount badge. Default and inverse colour schemes.',
    controls: [
      { kind: 'select', prop: 'colorScheme', label: 'Color scheme', options: ['default', 'inverse'], def: 'inverse' },
      { kind: 'toggle', prop: 'discount', label: 'Discount', def: true },
      { kind: 'toggle', prop: 'smiles', label: 'Logo row', def: true },
      { kind: 'toggle', prop: 'from', label: 'Price from', def: true },
    ],
    render: (v) => cardStage(
      <PlanCard colorScheme={p(v, 'colorScheme')} category="Postpaid" name="Freedom Live 200" price="AED 200" period="/mo"
        discount={p(v, 'discount') ? '20% off' : null} smiles={p(v, 'smiles')} from={p(v, 'from')} />
    ), code: snippets.plancard },

  { id: 'productcard', group: 'Cards', title: 'ProductCard', frame: 'phone', minH: 340,
    blurb: 'Feature card for a package, a product or a category: a tinted panel, a title, a badge or colour swatches, and a price.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['package', 'product', 'category'], def: 'product' },
      { kind: 'select', prop: 'priceLabel', label: 'Price label', options: ['from', 'pay-only', 'smiles-combined', 'none'], def: 'from' },
      { kind: 'select', prop: 'marker', label: 'Badge or colour', options: ['badge', 'colors', 'none'], def: 'badge' },
    ],
    render: (v) => {
      const type = p(v, 'type');
      return cardStage(
        <ProductCard type={type} eyebrow={type === 'package' ? 'Add-on' : undefined}
          title={type === 'package' ? 'Social 5 GB for 30 days' : type === 'category' ? 'Smart home' : 'iPhone 15 Clear Case'}
          image={type === 'package' ? undefined : <EaIcon name={type === 'category' ? 'home-filled' : 'phone-device'} size={type === 'category' ? 96 : 72} />}
          logos={type !== 'category'}
          discount={p(v, 'marker') === 'badge' ? '20% off' : undefined}
          colors={p(v, 'marker') === 'colors' ? ['#4fa0f8', '#b3b3b3', '#f84f4f'] : undefined}
          priceLabel={p(v, 'priceLabel')} price="AED 99" period={type === 'package' ? '/mo' : null} />
      );
    } },

  { id: 'dealcard', group: 'Cards', title: 'DealCard', frame: 'phone',
    blurb: 'Compact deal tile for “Deals for you” rails: overline, a two-line title, partner logos, a discount with the old price, and a like/dislike pill.',
    controls: [
      { kind: 'toggle', prop: 'logos', label: 'Logo row', def: true },
      { kind: 'toggle', prop: 'discount', label: 'Discount', def: true },
      { kind: 'toggle', prop: 'likes', label: 'Feedback', def: true },
    ],
    render: (v) => cardStage(
      <div style={{ display: 'flex', gap: 4 }}>
        <DealCard overline="Dining" title="50% off at Smiles venues" logos={p(v, 'logos')}
          discount={p(v, 'discount') ? '50% off' : undefined} wasPrice={p(v, 'discount') ? 'AED 120' : undefined} price="AED 60"
          likes={p(v, 'likes') ? '12.4k' : undefined} />
        <DealCard overline="Streaming" title="3 months of OSN+ on us" logos={p(v, 'logos')}
          discount={p(v, 'discount') ? '100% off' : undefined} wasPrice={p(v, 'discount') ? 'AED 105' : undefined} price="AED 0"
          likes={p(v, 'likes') ? '8.1k' : undefined} />
      </div>
    ) },

  { id: 'newcard', group: 'Cards', title: 'NewCard', frame: 'phone',
    blurb: 'Compact media-topped card for the “New on e&” rail. The newest card carries a gradient ring for three days.',
    controls: [
      { kind: 'toggle', prop: 'selected', label: 'Selected', def: true },
      { kind: 'toggle', prop: 'badge', label: 'Badge', def: true },
    ],
    render: (v) => cardStage(
      <div style={{ display: 'flex', gap: 8 }}>
        <NewCard image={<ArtBlock src={ART.sunset} h="100%" />} title="Smiles Unlimited" badge={p(v, 'badge')} />
        <NewCard image={<ArtBlock src={ART.dusk} h="100%" />} title="eLife TV, now in 4K" badge={p(v, 'badge')} selected={p(v, 'selected')} />
      </div>
    ) },

  { id: 'servicecard', group: 'Cards', title: 'ServiceCard', frame: 'phone',
    blurb: 'Tappable service tile: a 48px icon and a two-line title, with an optional corner badge.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['grid', 'carousel'], def: 'grid' },
    ],
    render: (v) => cardStage(
      <div style={{ display: p(v, 'size') === 'grid' ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, width: 343 }}>
        <ServiceCard size={p(v, 'size')} icon={ic('wifi', 48)} label="Home internet" />
        <ServiceCard size={p(v, 'size')} icon={ic('sim', 48)} label="Roaming" badge={<Badge offer="new-plan" size="md">New</Badge>} />
        <ServiceCard size={p(v, 'size')} icon={ic('tv', 48)} label="eLife TV" />
      </div>
    ) },

  { id: 'highlight', group: 'Cards', title: 'Highlight', frame: 'phone', minH: 500,
    blurb: 'Hero banner over campaign imagery with a midnight gradient, an offer tag and a glass action bar. Three heights; stack banners to let the next one peek.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['lg', 'md', 'sm'], def: 'lg' },
      { kind: 'select', prop: 'tag', label: 'Tag', options: ['logos', 'badge', 'none'], def: 'logos' },
      { kind: 'toggle', prop: 'action', label: 'Action bar', def: true },
      { kind: 'select', prop: 'placement', label: 'Placement', options: ['single', 'stacked'], def: 'single' },
    ],
    render: (v) => {
      const action = p(v, 'action') ? { title: 'Smiles Unlimited', subtitle: 'From AED 50/mo', cta: 'Explore', onCta: () => {} } : undefined;
      return (
        <div style={{ padding: '16px 0 16px 16px', background: BG.grey, overflow: 'hidden', paddingInlineEnd: p(v, 'placement') === 'single' ? 16 : 0 }}>
          <Highlight size={p(v, 'size')} tag={p(v, 'tag')} placement={p(v, 'placement')} image={ART.sunset}
            title="Exclusive venue deals every week" subtitle="Save up to 50% with Smiles Unlimited" action={action}
            items={[{ image: ART.dusk, title: 'Stream more with eLife', subtitle: 'OSN+ included for 3 months', action }]} />
        </div>
      );
    } },

  { id: 'generalcard', group: 'Cards', title: 'GeneralCard', frame: 'phone', minH: 300,
    blurb: 'A 224px tile with a centred title and an image in one of three sizes, plus an optional badge. Dark by default; white on dark sections.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Image size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
      { kind: 'toggle', prop: 'topAlignment', label: 'Top alignment' },
      { kind: 'toggle', prop: 'badge', label: 'Badge', def: true },
      { kind: 'select', prop: 'badgePlacement', label: 'Badge placement', options: ['start', 'center', 'end'], def: 'start' },
      { kind: 'toggle', prop: 'carousel', label: 'Carousel' },
    ],
    render: (v) => {
      const props = {
        size: p(v, 'size'), surface: p(v, 'surface'), topAlignment: p(v, 'topAlignment'), carousel: p(v, 'carousel'),
        badgePlacement: p(v, 'badgePlacement'),
      };
      const media = (src: string) => p(v, 'size') === 'sm'
        ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%', background: `center / cover url("${src}")` }} />
        : <ArtBlock src={src} h="100%" />;
      return (
        <div style={{ padding: 16, background: p(v, 'surface') === 'inverse' ? BG.midnight : BG.canvas }}>
          <div style={{ display: p(v, 'carousel') ? 'flex' : 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, overflow: 'hidden' }}>
            <GeneralCard {...props} title="Watch live sport on eLife" image={media(ART.sea)}
              badge={p(v, 'badge') ? <Badge offer="discount" size="md">20% off</Badge> : undefined} />
            <GeneralCard {...props} title="Smart home starter kit" image={media(ART.sunset)}
              badge={p(v, 'badge') ? <Badge offer="new-plan" size="md">New</Badge> : undefined} />
            {p(v, 'carousel') ? <GeneralCard {...props} title="Gaming bundles" image={media(ART.dusk)} /> : null}
          </div>
        </div>
      );
    } },

  { id: 'recommendation', group: 'Cards', title: 'Recommendation', frame: 'phone', minH: 260,
    blurb: 'A personalised suggestion card: a logo, a two-line title, a description and one button. Glass on dark imagery, or white.',
    controls: [
      { kind: 'toggle', prop: 'inverse', label: 'Inverse', def: true },
      { kind: 'toggle', prop: 'carousel', label: 'Carousel' },
      { kind: 'toggle', prop: 'cta', label: 'Button', def: true },
    ],
    render: (v) => (
      <div style={{ padding: 16, overflow: 'hidden', background: p(v, 'inverse') ? `center / cover url("${ART.dusk}")` : BG.canvas }}>
        <Recommendation inverse={p(v, 'inverse')} carousel={p(v, 'carousel')} cta={p(v, 'cta') ? 'Explore' : null} onCta={() => {}}
          items={[{ title: 'Add a second line for AED 50', description: 'Share your data with family on one bill.', cta: p(v, 'cta') ? 'Add line' : null }]} />
      </div>
    ) },

  { id: 'smilesbalance', group: 'Cards', title: 'SmilesBalance', frame: 'phone',
    blurb: 'The Smiles points card: the balance, the member’s tier, and progress towards the next tier.',
    controls: [
      { kind: 'toggle', prop: 'active', label: 'Activated', def: true },
      { kind: 'select', prop: 'tier', label: 'Tier', options: ['silver', 'gold', 'platinum', 'none'], def: 'silver' },
      { kind: 'select', prop: 'progress', label: 'Progress', options: [5, 40, 80], def: 40 },
    ],
    render: (v) => {
      const tier = p(v, 'tier');
      const next = tier === 'silver' ? 'gold' : 'platinum';
      return cardStage(
        <div style={{ width: 343 }}>
          {/* Keyed by tier: SmilesBalance sets its tier ink with the \`background\` shorthand
              plus background-clip, and React's update of the shorthand alone drops the clip. */}
          <SmilesBalance key={tier} active={p(v, 'active')} tier={tier === 'none' ? null : tier} nextTier={next as never}
            points="40,340" pointsToNext="2,500" progress={p(v, 'progress')} onInfo={() => {}} />
        </div>
      );
    } },

  { id: 'voucher', group: 'Cards', title: 'Voucher', frame: 'phone', minH: 200,
    blurb: '144×144 ticket tile with notched sides and a punched perforation. Light or dark, Apply or Applied.',
    controls: [
      { kind: 'select', prop: 'display', label: 'Display', options: ['light', 'dark'], def: 'light' },
      { kind: 'select', prop: 'state', label: 'State', options: ['default', 'applied'], def: 'default' },
      { kind: 'text', prop: 'title', label: 'Title', def: 'Title with 2 lines' },
      { kind: 'text', prop: 'description', label: 'Description', def: 'above AED 60+' },
    ],
    render: (v) => cardStage(
      // Fixed-size carousel cells, so two sit side by side the way a Section would place them.
      <div style={{ display: 'flex', gap: 8 }}>
        <Voucher display={p(v, 'display')} state={p(v, 'state')} title={p(v, 'title')} description={p(v, 'description')} />
        <Voucher display={p(v, 'display')} state={p(v, 'state') === 'applied' ? 'default' : 'applied'} title="Free delivery" description="on any order" />
      </div>
    ) },
];

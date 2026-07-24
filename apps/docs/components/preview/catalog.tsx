'use client';

import { useState, useRef, type ReactNode } from 'react';
import {
  Button, Badge, Chip, Tabs, TopBar, Section, ListRow, QuickAction, NavBar, PlanCard,
  Snackbar, Alert,
  Input, OtpInput, FilterPill, Checkbox, Radio, Switcher, Searchbar, AISearch, Selectors, Picker,
  Logo, LogoRow, ProgressBar, Stepper, AddTrigger, Dismiss, AtomSurface, SmilesRow,
  Card, Accordion, ActionBar, SectionLink, PlanUsageBar, AlertModal, Tooltip, BottomSheet,
  ProductCard, DealCard, NewCard, ServiceCard, Highlight, SmilesBalance, Voucher,
  StatusRibbon, ButtonGroup, PaymentRow, CtaFooter,
  Text,
} from '@eand/react-design-system';
import { Icon as EaIcon } from '@eand/react-design-system';
import type { Snippet } from './code-tabs';
import type { Control, ControlValues } from './controls-panel';
import { snippets } from './snippets';

const ic = (n: string, c?: string) => <EaIcon name={n} size={24} color={c} />;
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

/** A row of chips where clicking selects one — inherent interactivity. */
function ChipRow({ items, type, check, disabled, loading }: {
  items: string[]; type?: 'outline' | 'filled' | 'glass' | 'inverse'; check?: boolean; disabled?: boolean; loading?: boolean;
}) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
      {items.map((label, i) => (
        <Chip key={label} type={type} check={check} disabled={disabled} loading={loading && i === sel}
          selected={i === sel} onClick={() => setSel(i)}>{label}</Chip>
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
function FilterPillRow({ items }: { items: string[] }) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
      {items.map((label, i) => (
        <FilterPill key={label} selected={i === sel} onClick={() => setSel(i)}>{label}</FilterPill>
      ))}
    </div>
  );
}

/** Surfaces the mark can sit on — Figma `color-scheme` (default vs inverse). Brand and
 *  Midnight both use the inverse scheme; only the backdrop differs. */
const CHECKBOX_SURFACES: Record<string, { bg: string; inverse: boolean; text: string }> = {
  Default: { bg: '#ffffff', inverse: false, text: '#908e9a' },
  Brand: { bg: '#e73933', inverse: true, text: 'rgba(255,255,255,0.7)' },
  Midnight: { bg: '#191329', inverse: true, text: 'rgba(255,255,255,0.6)' },
};

/** Interactive checkbox/radio playground — a single clickable mark on the chosen surface. */
function CheckboxPlayground({ size, radio, surface, disabled }: { size: 'sm' | 'md'; radio: boolean; surface: string; disabled: boolean }) {
  const [on, setOn] = useState(true);
  const s = CHECKBOX_SURFACES[surface] ?? CHECKBOX_SURFACES.Default;
  return (
    <div
      onClick={() => { if (!disabled) setOn((o) => !o); }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '32px 48px', borderRadius: 20, background: s.bg, boxShadow: '0 1px 3px rgba(25,19,41,0.12)', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <Checkbox size={size} radio={radio} inverse={s.inverse} disabled={disabled} checked={on} onChange={() => {}} />
      <Text variant="body.sm" color={s.text}>{disabled ? 'Disabled' : 'Click to toggle'}</Text>
    </div>
  );
}

/** ActionBar — leading visual + title/subtitle + one trailing action, across surface families. */
const AB_LIGHT_SURFACES = ['default', 'subtle', 'sunken', 'white-transparent'];
function ActionBarDemo({ surface, leading, title, subtitle, trailing, stack }: {
  surface: string; leading: string; title: boolean; subtitle: boolean; trailing: string; stack: boolean;
}) {
  const light = AB_LIGHT_SURFACES.includes(surface);
  const leadingEl = leading === 'icon'
    ? <EaIcon name="placeholder" size={24} />
    : leading === 'image'
      ? <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e00800, #3a3168)' }} />
      : undefined;
  return (
    <div style={{
      padding: 24, minHeight: 220, display: 'flex', alignItems: 'center',
      background: light
        ? 'linear-gradient(135deg, #f7f7fa, #d8d7de)'
        : 'radial-gradient(120% 120% at 20% 0%, #3a3168 0%, #1a1330 60%, #100b1e 100%)',
    }}>
      <ActionBar
        surface={surface as never}
        stack={stack}
        icon={leadingEl}
        title={title ? 'Now playing' : undefined}
        subtitle={subtitle ? 'e& podcast · Ep 12' : undefined}
        chevron={trailing === 'chevron'}
        action={trailing === 'button'
          ? <Button size="md" surface="brand" leadingIcon={<EaIcon name="placeholder" size={20} />}>Play</Button>
          : undefined}
      />
    </div>
  );
}

/** A radio group — one selection at a time. */
function RadioGroupDemo({ items, size }: { items: string[]; size: 'sm' | 'lg' }) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
      {items.map((label, i) => (
        <Radio key={label} name="radio-demo" size={size} label={label} checked={i === sel} onChange={() => setSel(i)} />
      ))}
    </div>
  );
}

/** Tooltip is always-visible here so the bubble is legible in the docs frame. */
function TooltipDemo({ placement }: { placement: 'top' | 'bottom' }) {
  return (
    <div style={{ padding: '48px 0' }}>
      <Tooltip content="Uses your Smiles Points" placement={placement} visible>
        <Button size="sm" variant="secondary">Hover target</Button>
      </Tooltip>
    </div>
  );
}

/** Trigger-driven overlay demos — a button opens the fixed-position surface. */
function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
      <BottomSheet open={open} title="Choose a plan" onDismiss={() => setOpen(false)}
        footer={<Button block onClick={() => setOpen(false)}>Confirm</Button>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <ListRow label="Freedom Live 200" value="AED 200/mo" />
          <ListRow label="Freedom Live 400" value="AED 400/mo" />
          <ListRow label="Freedom Live 600" value="AED 600/mo" />
        </div>
      </BottomSheet>
    </>
  );
}
function AlertModalDemo({ tone }: { tone: 'info' | 'positive' | 'warning' | 'danger' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open alert modal</Button>
      <AlertModal open={open} tone={tone} title="Cancel this plan?"
        body="You’ll lose your remaining allowance at the end of the billing cycle."
        onDismiss={() => setOpen(false)}
        actions={<>
          <Button block onClick={() => setOpen(false)}>Keep plan</Button>
          <Button block variant="secondary" onClick={() => setOpen(false)}>Cancel plan</Button>
        </>} />
    </>
  );
}

const cardStage = (node: ReactNode) => (
  <div style={{ padding: 12, background: '#e4e3ea', display: 'flex', justifyContent: 'center' }}>{node}</div>
);

export const PAGES: Page[] = [
  { id: 'button', group: 'Components', title: 'Button', frame: 'pad',
    blurb: 'Primary actions are e& red and pill-shaped. Secondary is outlined. Toggle the props to see every state.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['primary', 'secondary', 'tertiary', 'link', 'glass'] },
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'toggle', prop: 'block', label: 'Block' },
      { kind: 'toggle', prop: 'loading', label: 'Loading' },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Make your own deal' },
    ],
    render: (v) => (
      // glass sits on brand/imagery surfaces — give it a brand backdrop so it reads
      <div style={{ display: 'flex', justifyContent: 'center', width: 320, padding: 16, borderRadius: 16,
        background: p(v, 'variant') === 'glass' ? '#e00800' : undefined }}>
        <Button variant={p(v, 'variant')} size={p(v, 'size')} block={p(v, 'block')} loading={p(v, 'loading')}>{p(v, 'label')}</Button>
      </div>
    ), code: snippets.button },

  { id: 'ctabar', group: 'Components', title: 'CTA Bar', frame: 'phone', minH: 420,
    blurb: 'Sticky bottom CTA footer: status ribbon, total price, T&C row, payment method, and button group — per the Figma CTA-bar page.',
    controls: [
      // Figma "Group button" master properties (kept 1:1 with the Design panel)
      { kind: 'select', prop: 'buttongroup', label: 'Buttongroup',
        options: ['Primary', 'Primary+Secondary', 'Primary+Tertiary', 'Primary+Secondary+Tertiary'], def: 'Primary' },
      { kind: 'toggle', prop: 'horizontal', label: 'vertical ↔ horizontal', def: false },
      { kind: 'toggle', prop: 'payment', label: 'Payment', def: false },
      // template slots from the CTA footer examples
      { kind: 'select', prop: 'ribbon', label: 'Ribbon', options: ['none', 'success', 'alert', 'warning', 'info'], def: 'none' },
      { kind: 'toggle', prop: 'price', label: 'Price row', def: false },
      { kind: 'toggle', prop: 'terms', label: 'T&C row', def: false },
      { kind: 'toggle', prop: 'home', label: 'Home indicator', def: true },
    ],
    render: (v) => {
      const combo: string = p(v, 'buttongroup') ?? 'Primary';
      return (
        <div style={{ width: '100%' }}>
          <CtaFooter
            rounded
            ribbon={p(v, 'ribbon') !== 'none'
              ? <StatusRibbon status={p(v, 'ribbon')} leadingIcon={ic('check-circle')} action="View" trailingIcon={ic('chevron-right')}>Payment method saved</StatusRibbon>
              : undefined}
            price={p(v, 'price') ? { label: 'Total amount', value: 'AED 1,250', note: 'Incl. VAT' } : undefined}
            terms={p(v, 'terms') ? <Checkbox label={<>I accept the <u>Terms &amp; Conditions</u></>} /> : undefined}
            payment={p(v, 'payment') ? <PaymentRow icon={<SmilesRow count={1} plus={0} size={28} />} label="•••• 4326" onAction={() => {}} /> : undefined}
            actions={p(v, 'payment')
              ? <Button>Pay now</Button>
              : <ButtonGroup orientation={p(v, 'horizontal') ? 'horizontal' : 'vertical'}
                  primary={<Button block>Primary</Button>}
                  secondary={combo.includes('Secondary') ? <Button block variant="secondary">Secondary</Button> : undefined}
                  tertiary={combo.includes('Tertiary') ? <Button variant="tertiary">Tertiary</Button> : undefined} />}
            homeIndicator={p(v, 'home')}
          />
        </div>
      );
    } },

  { id: 'badge', group: 'Components', title: 'Badge', frame: 'pad',
    blurb: 'Status badges (neutral/positive/warning/danger/brand) are prop-driven below. Offer badges are colour-coded by promo type.',
    controls: [
      { kind: 'select', prop: 'status', label: 'Status', options: ['neutral', 'positive', 'warning', 'danger', 'brand'], def: 'positive' },
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'text', prop: 'label', label: 'Text', def: '3 active' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
        <Badge status={p(v, 'status')} size={p(v, 'size')}>{p(v, 'label')}</Badge>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360, opacity: 0.9 }}>
          <Badge offer="new-plan">New</Badge>
          <Badge offer="discount">20% off</Badge>
          <Badge offer="best-seller">Best seller</Badge>
        </div>
      </div>
    ), code: snippets.badge },

  { id: 'chip', group: 'Components', title: 'Chip', frame: 'pad',
    blurb: 'Selectable pills across four Figma types: outline, filled, glass, inverse. Click one — the selection follows.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['outline', 'filled', 'glass', 'inverse'], def: 'outline' },
      { kind: 'toggle', prop: 'check', label: 'Check mark', def: true },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
      { kind: 'toggle', prop: 'loading', label: 'Loading' },
    ],
    render: (v) => (
      <div style={{ padding: 24, borderRadius: 16,
        background: p(v, 'type') === 'glass' ? 'linear-gradient(135deg, #e00800, #3a1b6b)'
          : p(v, 'type') === 'inverse' ? '#191329'
          : p(v, 'type') === 'filled' ? '#e4e3ea' : undefined }}>
        <ChipRow items={['Manage my Plan', 'Change Plan', 'Family Plan', 'Buy Add-on']}
          type={p(v, 'type')} check={p(v, 'check')} disabled={p(v, 'disabled')} loading={p(v, 'loading')} />
      </div>
    ),
    code: snippets.chip },

  { id: 'tabs', group: 'Components', title: 'Tabs', frame: 'pad',
    blurb: 'Pill tabs. Global scope = tinted-red active; local scope = midnight active. Click to switch.',
    controls: [
      { kind: 'select', prop: 'scope', label: 'Scope', options: ['global', 'local'] },
    ],
    render: (v) => (
      <div style={{ width: 360 }}>
        <Tabs scope={p(v, 'scope')} tabs={['For you', 'Account', 'Loyalty']} defaultValue={0} />
      </div>
    ) },

  { id: 'snackbar', group: 'Components', title: 'Snackbar', frame: 'pad',
    blurb: 'Transient dark pill confirming an action. Tones: success, error, warning, loading, and a plain default.',
    controls: [
      { kind: 'select', prop: 'tone', label: 'Tone', options: ['positive', 'danger', 'warning', 'loading', 'default'], def: 'positive' },
      { kind: 'text', prop: 'message', label: 'Message', def: 'Your changes were saved' },
      { kind: 'toggle', prop: 'action', label: 'Action', def: false },
      { kind: 'toggle', prop: 'dismiss', label: 'Dismiss', def: true },
    ],
    render: (v) => (
      <div style={{ width: 360, maxWidth: '100%' }}>
        <Snackbar tone={p(v, 'tone')} message={p(v, 'message')}
          action={p(v, 'action') ? 'Undo' : undefined}
          onDismiss={p(v, 'dismiss') ? () => {} : undefined} />
      </div>
    ) },

  { id: 'alert', group: 'Components', title: 'Alert', frame: 'pad',
    blurb: 'Inline banner for contextual status. Soft-tinted by tone with a title, message, and optional action link.',
    controls: [
      { kind: 'select', prop: 'tone', label: 'Tone', options: ['positive', 'warning', 'danger', 'default'], def: 'positive' },
      { kind: 'text', prop: 'title', label: 'Title', def: 'You’re all set!' },
      { kind: 'text', prop: 'body', label: 'Message', def: 'Your request was completed successfully and everything is updated.' },
      { kind: 'text', prop: 'action', label: 'Action', def: 'Done' },
    ],
    render: (v) => (
      <div style={{ width: 360, maxWidth: '100%' }}>
        <Alert tone={p(v, 'tone')} title={p(v, 'title')} action={p(v, 'action') || undefined}>{p(v, 'body')}</Alert>
      </div>
    ) },

  { id: 'topbar', group: 'Components', title: 'TopBar', frame: 'phone', minH: 380,
    blurb: 'Slot-based header: top row (leading · logo · actions), an optional big-title block or account display, and a bottom slot for search / chips / tabs.',
    controls: [
      { kind: 'select', prop: 'layout', label: 'Layout', options: ['hero', 'account', 'compact'], def: 'hero' },
      { kind: 'toggle', prop: 'eyebrow', label: 'Overline', def: true },
      { kind: 'toggle', prop: 'subtext', label: 'Subtext', def: true },
      { kind: 'toggle', prop: 'bottom', label: 'Bottom slot', def: true },
    ],
    render: (v) => {
      const layout = p(v, 'layout');
      if (layout === 'compact') {
        return <TopBar title="Account details" leading={ic('chevron-left')}
          actions={[ic('settings')]} />;
      }
      const bottom = p(v, 'bottom') ? (
        <>
          <Searchbar placeholder="Search for feature" />
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden' }}>
            <Chip type="glass" check>All</Chip>
            <Chip type="glass">Plans</Chip>
            <Chip type="glass">Devices</Chip>
          </div>
        </>
      ) : undefined;
      if (layout === 'account') {
        return <TopBar surface="brand" account={{ greeting: 'Hi, Ahmed', name: '050 123 4567' }} chevron
          logo actions={[ic('magic-wand', '#fff'), ic('notification', '#fff')]}>{bottom}</TopBar>;
      }
      return (
        <TopBar surface="brand" logo leading={ic('chevron-left', '#fff')}
          actions={[ic('magic-wand', '#fff'), ic('notification', '#fff')]}
          eyebrow={p(v, 'eyebrow') ? 'Overline' : undefined}
          bigTitle="Large title goes here" chevron
          subtext={p(v, 'subtext') ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' : undefined}>
          {bottom}
        </TopBar>
      );
    }, code: snippets.topbar },

  { id: 'section', group: 'Components', title: 'Section', frame: 'phone', minH: 420,
    blurb: 'The body container: header (title · context · trigger) over a body slot. The size axis reserves the row height for the card type it holds — xs list rows → xl highlight banners.',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['xs', 'sm', 'md', 'lg', 'xl'], def: 'md' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
      { kind: 'select', prop: 'trigger', label: 'Trigger', options: ['chevron', 'button', 'none'], def: 'chevron' },
      { kind: 'toggle', prop: 'context', label: 'Context', def: true },
    ],
    render: (v) => {
      const size = p(v, 'size');
      const surface = p(v, 'surface');
      // each size fits a different component in the slot
      const slot = size === 'xs'
        ? <ListRow label="Quick Pay & Recharge" value="" icon={ic('quick-pay')} />
        : size === 'sm'
          ? <QuickAction columns={2} items={[
              { label: 'Quick Pay', icon: ic('card') },
              { label: 'Track Order', icon: ic('cart') }]} />
          : size === 'md'
            ? <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
                <DealCard title="Control from anywhere" width={166} />
                <DealCard title="Manage plans" width={166} /></div>
            : size === 'lg'
              ? <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
                  <PlanCard variant={surface === 'inverse' ? 'brand' : 'default'} width={222} />
                  <PlanCard variant="midnight" width={222} /></div>
              : <Highlight tone="image" title="Primary Text 2-lines max" subtitle="Stay in control, even when you're away" />;
      return (
        <Section
          title="Section"
          context={p(v, 'context') ? 'Cover these with your Smiles Points' : undefined}
          surface={surface}
          trigger={p(v, 'trigger')}
          triggerLabel="See all"
          size={size}
        >
          {slot}
        </Section>
      );
    }, code: snippets.section },

  { id: 'listrow', group: 'Components', title: 'ListRow', frame: 'phone',
    blurb: 'A white rounded row: label ↔ value, optional leading icon and chevron.',
    render: () => (
      <div style={{ padding: 8, background: '#e4e3ea', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <ListRow icon={ic('wallet')} label="My SIM Cards" sublabel="2 active" />
        <ListRow label="2 GB left" value="Local Data" chevron={false} />
      </div>
    ), code: snippets.listrow },

  { id: 'quickaction', group: 'Components', title: 'QuickAction', frame: 'phone',
    blurb: 'Account-hub grid: borderless white cards, grey icon square, optional count badge.',
    render: () => (
      <div style={{ padding: 12, background: '#e4e3ea' }}>
        <QuickAction columns={2} items={[
          { label: 'Add-ons', icon: ic('puzzle'), badge: <Badge status="positive" size="sm">3 active</Badge> },
          { label: 'Subscriptions', icon: ic('sync') },
          { label: 'My Devices', icon: ic('phone-device') },
          { label: 'mParking', icon: ic('car') },
        ]} />
      </div>
    ), code: snippets.quickaction },

  { id: 'navbar', group: 'Components', title: 'NavBar', frame: 'phone',
    blurb: 'Floating glass bottom nav over a midnight scrim — one frosted pill of tabs. Active tab is a white pill with a red icon + label. Click a tab to move it; scroll the area to collapse (icons only) / expand (icons + labels), matching the Figma scroll-direction state.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['logged-in', 'logged-out'] },
    ],
    render: (v) => <NavBarDemo key={p(v, 'variant')} variant={p(v, 'variant')} />,
    code: snippets.navbar },

  { id: 'plancard', group: 'Components', title: 'PlanCard', frame: 'phone',
    blurb: 'Plans-mini card: eyebrow, name, smiles, “from AED…/mo”. Switch the variant below.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['default', 'brand', 'midnight'], def: 'brand' },
    ],
    render: (v) => (
      <div style={{ padding: 12, background: '#e4e3ea', display: 'flex', justifyContent: 'center' }}>
        <PlanCard variant={p(v, 'variant')} category="Postpaid" name="Freedom Live 200" price="200" period="/mo" />
      </div>
    ), code: snippets.plancard },

  /* ---------------- Controls ---------------- */
  { id: 'input', group: 'Controls', title: 'Input', frame: 'pad',
    blurb: 'V1.1 filled field with floating label and state border. Types: text, dropdown, picker, comment — plus the OTP cell row.',
    controls: [
      { kind: 'select', prop: 'type', label: 'Type', options: ['text', 'dropdown', 'picker', 'comment', 'otp'], def: 'text' },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Email address' },
      { kind: 'select', prop: 'status', label: 'Status', options: ['none', 'error', 'success'], def: 'none' },
      { kind: 'toggle', prop: 'clearable', label: 'Clearable' },
      { kind: 'toggle', prop: 'inverse', label: 'Inverse' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ width: 343, maxWidth: '100%', padding: 20, borderRadius: 16,
        background: p(v, 'inverse') ? '#191329' : undefined }}>
        {p(v, 'type') === 'otp' ? (
          <OtpInput length={4} inverse={p(v, 'inverse')} disabled={p(v, 'disabled')}
            error={p(v, 'status') === 'error' ? 'Wrong code, try again' : undefined} />
        ) : (
          <Input type={p(v, 'type')} label={p(v, 'label')}
            inverse={p(v, 'inverse')} disabled={p(v, 'disabled')} clearable={p(v, 'clearable')}
            defaultValue={p(v, 'type') === 'dropdown' || p(v, 'type') === 'picker' ? 'Value' : undefined}
            helper={p(v, 'status') === 'none' ? 'We’ll never share it.' : undefined}
            error={p(v, 'status') === 'error' ? 'Brief error message' : undefined}
            success={p(v, 'status') === 'success' ? 'Looks good' : undefined} />
        )}
      </div>
    ) },

  { id: 'searchbar', group: 'Controls', title: 'Searchbar', frame: 'pad',
    blurb: 'Grey rounded search field with a leading magnifier and a trailing voice-search mic.',
    controls: [
      { kind: 'text', prop: 'placeholder', label: 'Placeholder', def: 'Search' },
    ],
    render: (v) => <div style={{ width: 320, maxWidth: '100%' }}><Searchbar placeholder={p(v, 'placeholder')} /></div> },

  { id: 'aisearch', group: 'Controls', title: 'AISearch', frame: 'pad',
    blurb: 'The Searchbar preset for the “Ask e&” assistant entry point — same field, AI-forward placeholder.',
    render: () => <div style={{ width: 320, maxWidth: '100%' }}><AISearch /></div> },

  { id: 'checkbox', group: 'Controls', title: 'Checkbox', frame: 'pad',
    blurb: 'Selection mark. Checkbox (square) or radio (circle) share one component. Default fills e& red with a white tick; on brand/midnight surfaces (inverse) it fills white with a red tick. States: Off, Off/Disabled, On, On/Disabled. Sizes: md (20) and sm (16).',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md'], def: 'md' },
      { kind: 'select', prop: 'type', label: 'Type', options: ['checkbox', 'radio'], def: 'checkbox' },
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['Default', 'Brand', 'Midnight'], def: 'Default' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => <CheckboxPlayground size={p(v, 'size')} radio={p(v, 'type') === 'radio'} surface={String(p(v, 'surface'))} disabled={!!p(v, 'disabled')} /> },

  { id: 'radio', group: 'Controls', title: 'Radio', frame: 'pad',
    blurb: 'Single-choice control. Pick one option — the selection follows. Sizes: lg (24) and sm (20).',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'lg'], def: 'lg' },
    ],
    render: (v) => <RadioGroupDemo size={p(v, 'size')} items={['Pay monthly', 'Pay yearly', 'Pay as you go']} /> },

  { id: 'switcher', group: 'Controls', title: 'Switcher', frame: 'pad',
    blurb: 'On/off toggle. Track turns e& red when on. Sizes: lg (56×24) and sm (48×20).',
    controls: [
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'lg'], def: 'lg' },
      { kind: 'toggle', prop: 'disabled', label: 'Disabled' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Switcher size={p(v, 'size')} disabled={p(v, 'disabled')} defaultChecked />
        <Switcher size={p(v, 'size')} disabled={p(v, 'disabled')} />
      </div>
    ) },

  { id: 'selectors', group: 'Controls', title: 'Selectors', frame: 'pad',
    blurb: 'Segmented control — a pill track with one active segment. Click to switch.',
    render: () => <Selectors options={['Daily', 'Weekly', 'Monthly']} /> },

  { id: 'picker', group: 'Controls', title: 'Picker', frame: 'pad',
    blurb: 'Selectable option tiles (value + caption + status badge). Surface: default, light, inverse, glass. Selected gets an accent border and check.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'light', 'inverse', 'glass'], def: 'default' },
    ],
    render: (v) => {
      const surface = p(v, 'surface');
      const onDark = surface === 'inverse' || surface === 'glass';
      const badge = (label: string) => <Badge status={onDark ? 'neutral-inverse' : 'neutral'} size="sm">{label}</Badge>;
      return (
        <div style={{ padding: 24, borderRadius: 16,
          background: surface === 'glass' ? 'linear-gradient(135deg, #e00800, #3a1b6b)'
            : surface === 'inverse' ? '#191329' : undefined }}>
          <Picker surface={surface} defaultValue={1} options={[
            { value: '5', caption: 'AED', badge: badge('1 GB') },
            { value: '10', caption: 'AED', badge: badge('3 GB') },
            { value: '20', caption: 'AED', badge: badge('8 GB') },
          ]} />
        </div>
      );
    } },

  { id: 'filterpill', group: 'Controls', title: 'FilterPill', frame: 'pad',
    blurb: 'Dropdown-style filter pill with a caret. Single active selection across the row.',
    render: () => <FilterPillRow items={['All', 'Data', 'Voice', 'Roaming']} /> },

  /* ---------------- Primitives ---------------- */
  { id: 'logo', group: 'Primitives', title: 'Logo', frame: 'pad',
    blurb: 'The e& wordmark in brand red. The atomic brand primitive used across headers and cards.',
    render: () => <Logo style={{ fontSize: 40 }} /> },

  { id: 'logorow', group: 'Primitives', title: 'LogoRow', frame: 'pad',
    blurb: 'A horizontal row of partner/brand logos with even spacing — wraps on narrow widths.',
    render: () => <LogoRow logos={[<Logo key="a" />, <Logo key="b" />, <Logo key="c" />]} /> },

  { id: 'progressbar', group: 'Primitives', title: 'ProgressBar', frame: 'pad',
    blurb: 'Slim 4px track with a rounded fill. Tone recolours the fill; default is subtle green.',
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
      <div style={{ width: 375, maxWidth: '100%', padding: 16, borderRadius: 16,
        background: p(v, 'inverse') ? '#191329' : undefined }}>
        <Stepper steps={p(v, 'steps')} progress={p(v, 'progress')} inverse={p(v, 'inverse')} />
      </div>
    ) },

  { id: 'addtrigger', group: 'Primitives', title: 'AddTrigger', frame: 'pad',
    blurb: 'A dashed pill “add” affordance — for adding a card, line, or add-on.',
    controls: [
      { kind: 'text', prop: 'label', label: 'Label', def: 'Add a line' },
    ],
    render: (v) => <AddTrigger label={p(v, 'label')} /> },

  { id: 'dismiss', group: 'Primitives', title: 'Dismiss', frame: 'pad',
    blurb: 'Circular close button — a filled circle with a white X. Surface default or inverse, size md (24) or sm (20).',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'inverse'], def: 'default' },
      { kind: 'select', prop: 'size', label: 'Size', options: ['md', 'sm'], def: 'md' },
    ],
    render: (v) => (
      <div style={{ padding: 32, borderRadius: 16,
        background: p(v, 'surface') === 'inverse' ? '#191329' : undefined }}>
        <Dismiss surface={p(v, 'surface')} size={p(v, 'size')} onClick={() => {}} />
      </div>
    ) },

  { id: 'atomsurface', group: 'Primitives', title: 'AtomSurface', frame: 'pad',
    blurb: 'The raw surface primitive — a rounded container tinted by elevation level.',
    controls: [
      { kind: 'select', prop: 'level', label: 'Level', options: ['canvas', 'base', 'raised', 'sunken'], def: 'base' },
    ],
    render: (v) => (
      <AtomSurface level={p(v, 'level')} style={{ width: 200, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="body.sm">surface.{p(v, 'level')}</Text>
      </AtomSurface>
    ) },

  { id: 'smilesrow', group: 'Primitives', title: 'SmilesRow', frame: 'pad',
    blurb: 'Overlapping Smiles avatars with an optional “+N” overflow chip — the loyalty motif on plan cards.',
    controls: [
      { kind: 'select', prop: 'count', label: 'Avatars', options: [1, 2, 3], def: 2 },
      { kind: 'select', prop: 'plus', label: 'Overflow', options: [0, 4, 9], def: 4 },
    ],
    render: (v) => <SmilesRow count={p(v, 'count')} plus={p(v, 'plus')} size={36} /> },

  /* ---------------- Layout & Navigation ---------------- */
  { id: 'card', group: 'Layout', title: 'Card', frame: 'phone',
    blurb: 'The general-purpose card: optional media, title, body, and an action slot.',
    render: () => cardStage(
      <Card width={280} media={<div style={{ height: 120, background: '#e4e3ea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#191329' }}><EaIcon name="gift" size={48} /></div>}
        title="Refer a friend" body="Get AED 50 credit for every friend who joins e&."
        action={<Button size="sm">Invite</Button>} />
    ) },

  { id: 'accordion', group: 'Layout', title: 'Accordion', frame: 'phone',
    blurb: 'Expand/collapse disclosure row with an animated caret. Stack them for an FAQ.',
    render: () => (
      <div style={{ padding: 16, background: '#fff' }}>
        <Accordion title="What is Freedom Live?" defaultOpen>
          <Text variant="body.sm" color="#6a6577">A postpaid plan with rollover data and Smiles rewards.</Text>
        </Accordion>
        <Accordion title="Can I change plans anytime?">
          <Text variant="body.sm" color="#6a6577">Yes — switch once per billing cycle from the app.</Text>
        </Accordion>
      </div>
    ) },

  { id: 'actionbar', group: 'Navigation', title: 'ActionBar', frame: 'phone',
    blurb: 'Compact bar: a leading visual, a title + subtitle, and one trailing action — a button or a chevron, never both. Ships two surface families (light + dark/glass); multiple-stack is glass/inverse only.',
    controls: [
      { kind: 'select', prop: 'surface', label: 'Surface', options: ['default', 'subtle', 'sunken', 'white-transparent', 'glass', 'midnight-base', 'midnight-raised', 'midnight-transparent'], def: 'default' },
      { kind: 'select', prop: 'leading', label: 'Leading', options: ['icon', 'image', 'none'], def: 'icon' },
      { kind: 'toggle', prop: 'title', label: 'Title', def: true },
      { kind: 'toggle', prop: 'subtitle', label: 'Subtitle', def: true },
      { kind: 'select', prop: 'trailing', label: 'Trailing', options: ['button', 'chevron', 'none'], def: 'button' },
      { kind: 'toggle', prop: 'stack', label: 'Multiple-stack', def: false },
    ],
    render: (v) => <ActionBarDemo surface={String(p(v, 'surface'))} leading={String(p(v, 'leading'))} title={!!p(v, 'title')} subtitle={!!p(v, 'subtitle')} trailing={String(p(v, 'trailing'))} stack={!!p(v, 'stack')} /> },

  { id: 'sectionlink', group: 'Navigation', title: 'SectionLink', frame: 'phone',
    blurb: 'A section header row: a heading on the left and a “See all” link on the right.',
    render: () => (
      <div style={{ padding: 16, background: '#fff' }}>
        <SectionLink title="Deals for you" />
      </div>
    ) },

  /* ---------------- Feedback & Status ---------------- */
  { id: 'planusagebar', group: 'Feedback', title: 'PlanUsageBar', frame: 'phone',
    blurb: 'Usage meter: label, used/total readout, and a progress track that reddens as you approach the limit.',
    controls: [
      { kind: 'text', prop: 'label', label: 'Label', def: 'Local Data' },
      { kind: 'select', prop: 'used', label: 'Used', options: [2, 6, 9], def: 6 },
      { kind: 'select', prop: 'total', label: 'Total', options: [10], def: 10 },
    ],
    render: (v) => (
      <div style={{ width: 320, maxWidth: '100%' }}>
        <PlanUsageBar label={p(v, 'label')} used={p(v, 'used')} total={p(v, 'total')} unit="GB" />
      </div>
    ) },

  { id: 'alertmodal', group: 'Feedback', title: 'AlertModal', frame: 'pad',
    blurb: 'Centered confirmation dialog over a scrim. Tap the button to open it.',
    controls: [
      { kind: 'select', prop: 'tone', label: 'Tone', options: ['info', 'positive', 'warning', 'danger'], def: 'warning' },
    ],
    render: (v) => <AlertModalDemo tone={p(v, 'tone')} /> },

  /* ---------------- Overlays ---------------- */
  { id: 'tooltip', group: 'Overlays', title: 'Tooltip', frame: 'pad',
    blurb: 'Small dark bubble anchored to a target. Placement flips it above or below.',
    controls: [
      { kind: 'select', prop: 'placement', label: 'Placement', options: ['top', 'bottom'] },
    ],
    render: (v) => <TooltipDemo placement={p(v, 'placement')} /> },

  { id: 'bottomsheet', group: 'Overlays', title: 'BottomSheet', frame: 'pad',
    blurb: 'Modal sheet that slides up from the bottom with a grab handle, title and footer. Tap to open.',
    render: () => <BottomSheetDemo /> },

  /* ---------------- Cards ---------------- */
  { id: 'productcard', group: 'Cards', title: 'ProductCard', frame: 'phone',
    blurb: 'Product / add-on card: optional image, title, discount badge and a “from AED…” price.',
    render: () => cardStage(
      <ProductCard title="iPhone 15 Clear Case" image={<EaIcon name="phone-device" size={56} />} discount="20% off" price="AED 99" period="" />
    ) },

  { id: 'dealcard', group: 'Cards', title: 'DealCard', frame: 'phone',
    blurb: 'Wide media card for “Deals for you” carousels, with an overlaid offer badge.',
    render: () => cardStage(
      <DealCard image={<EaIcon name="gift" size={48} />} title="50% off at Smiles venues" subtitle="Until 30 Jun"
        badge={<Badge offer="mega-deals" size="sm">Mega deal</Badge>} />
    ) },

  { id: 'newcard', group: 'Cards', title: 'NewCard', frame: 'phone',
    blurb: 'Compact media-topped card for the “New on e&” rail.',
    render: () => cardStage(<NewCard image={<EaIcon name="magic-wand" size={56} />} title="Smiles Unlimited" />) },

  { id: 'servicecard', group: 'Cards', title: 'ServiceCard', frame: 'phone',
    blurb: 'Square tappable service tile: centred icon and label, optional corner badge.',
    render: () => cardStage(
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, width: 320 }}>
        <ServiceCard icon={<EaIcon name="wifi" size={32} />} label="Data" />
        <ServiceCard icon={<EaIcon name="sim" size={32} />} label="Roaming" badge={<Badge status="positive" size="sm">New</Badge>} />
        <ServiceCard icon={<EaIcon name="tv" size={32} />} label="eLife TV" />
      </div>
    ) },

  { id: 'highlight', group: 'Cards', title: 'Highlight', frame: 'phone',
    blurb: 'Full-bleed hero banner with a gradient scrim, Smiles avatars and an optional CTA.',
    controls: [
      { kind: 'select', prop: 'tone', label: 'Tone', options: ['image', 'brand', 'purple'], def: 'purple' },
    ],
    render: (v) => cardStage(
      <Highlight tone={p(v, 'tone')} width={320} title="Smiles Unlimited" subtitle="Exclusive venue deals every week" cta="Explore" />
    ) },

  { id: 'smilesbalance', group: 'Cards', title: 'SmilesBalance', frame: 'phone',
    blurb: 'Gold loyalty strip showing the Smiles balance with a redeem action.',
    render: () => cardStage(<div style={{ width: 320 }}><SmilesBalance points="12,450 Smiles" cta="Redeem" /></div>) },

  { id: 'voucher', group: 'Cards', title: 'Voucher', frame: 'phone',
    blurb: 'Dashed-border voucher: value, code, validity and a status badge (active / redeemed / expired).',
    controls: [
      { kind: 'select', prop: 'status', label: 'Status', options: ['active', 'redeemed', 'expired'] },
    ],
    render: (v) => cardStage(
      <div style={{ width: 320 }}><Voucher value="AED 50 off" code="EAND50" validity="Exp 30 Jun" status={p(v, 'status')} /></div>
    ) },
];

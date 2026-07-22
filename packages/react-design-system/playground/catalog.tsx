import { useState, type ReactNode } from 'react';
import {
  Button, Badge, Chip, Tabs, TopBar, Section, ListRow, QuickAction, NavBar, PlanCard,
  Snackbar, Alert,
} from '../src';
import { Icon as EaIcon } from '../../icons/src';
import type { Snippet } from './code-tabs';
import type { Control, ControlValues } from './controls-panel';
import { snippets } from './snippets';
import { ColorsView, TypographyView, SpacingView } from './tokens-view';

const ic = (n: string, c?: string) => <EaIcon name={n} size={24} color={c} />;
const p = (v: ControlValues, k: string) => v[k] as any;

export interface Page {
  id: string; group: string; title: string; blurb: string;
  frame: 'phone' | 'pad' | 'full';
  controls?: Control[];
  render: (props: ControlValues) => ReactNode;
  code?: Snippet;
}

/** A row of chips where clicking selects one — inherent interactivity, no knobs. */
function ChipRow({ items }: { items: string[] }) {
  const [sel, setSel] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
      {items.map((label, i) => (
        <Chip key={label} selected={i === sel} onClick={() => setSel(i)}>{label}</Chip>
      ))}
    </div>
  );
}

/** Bottom nav with a live-selectable active tab. Tab set switches by variant.
 *  (Remounted per variant via key, so the default active tab resets correctly.) */
const NAV_SETS: Record<string, [string, string][]> = {
  'logged-in': [['Home', 'home'], ['Support', 'support'], ['Profile', 'user'], ['mShop', 'store']],
  'logged-out': [['mShop', 'store'], ['Plans', 'grid'], ['Devices', 'phone-device'], ['eLife', 'tv']],
};
function NavBarDemo({ variant }: { variant: string }) {
  const set = NAV_SETS[variant] ?? NAV_SETS['logged-in'];
  const [active, setActive] = useState(variant === 'logged-out' ? 1 : 0);
  return (
    <div style={{ background: '#2a2438', paddingTop: 24 }}>
      <NavBar items={set.map(([label, name], i) => ({
        label, icon: ic(name), active: i === active, onClick: () => setActive(i),
      }))} />
    </div>
  );
}

export const PAGES: Page[] = [
  // ---------- Foundations ----------
  { id: 'colors', group: 'Foundations', title: 'Colour', frame: 'full',
    blurb: 'Every colour resolves from variables.json — the same source the native (Swift/Kotlin) and web token exports read, so values never drift.',
    render: () => <ColorsView /> },
  { id: 'type', group: 'Foundations', title: 'Typography', frame: 'full',
    blurb: 'The Suisse Int’l type ramp: display, heading, title, body, button. Load the licensed font in-app; sizes/weights/line-heights come from the tokens.',
    render: () => <TypographyView /> },
  { id: 'space', group: 'Foundations', title: 'Spacing & Radius', frame: 'full',
    blurb: 'The spacing rem-scale, corner radii, and icon sizes. Section slots stack on a tight 4px gap.',
    render: () => <SpacingView /> },

  // ---------- Components ----------
  { id: 'button', group: 'Components', title: 'Button', frame: 'pad',
    blurb: 'Primary actions are e& red and pill-shaped. Secondary is outlined. Toggle the props to see every state.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['primary', 'secondary'] },
      { kind: 'select', prop: 'size', label: 'Size', options: ['sm', 'md', 'lg'], def: 'md' },
      { kind: 'toggle', prop: 'block', label: 'Block' },
      { kind: 'text', prop: 'label', label: 'Label', def: 'Make your own deal' },
    ],
    render: (v) => (
      <div style={{ display: 'flex', justifyContent: 'center', width: 320 }}>
        <Button variant={p(v, 'variant')} size={p(v, 'size')} block={p(v, 'block')}>{p(v, 'label')}</Button>
      </div>
    ), code: snippets.button },

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
    blurb: 'Selectable pills for “Jump to…” shortcuts and filters. Click one — the selection follows.',
    render: () => <ChipRow items={['Manage my Plan', 'Change Plan', 'Family Plan', 'Buy Add-on']} />,
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

  { id: 'topbar', group: 'Components', title: 'TopBar', frame: 'phone',
    blurb: 'The account header. Brand variant is the red masked-number header; default is a light title bar.',
    controls: [
      { kind: 'select', prop: 'variant', label: 'Variant', options: ['brand', 'default'] },
    ],
    render: (v) => {
      const brand = p(v, 'variant') === 'brand';
      return <TopBar variant={p(v, 'variant')} greeting={brand ? 'Hi, Ahmed' : undefined} title={brand ? '050 123 4567' : 'Account'}
        actions={[ic('magic-wand', brand ? '#fff' : undefined), ic('notification', brand ? '#fff' : undefined)]} />;
    }, code: snippets.topbar },

  { id: 'section', group: 'Components', title: 'Section', frame: 'phone',
    blurb: 'The body building block: a full-width grey rounded container. Slots share a 4px gap.',
    render: () => (
      <div style={{ padding: 8, background: '#e4e3ea' }}>
        <Section title="My Plan" context="Freedom Live Plan 200" hideChevron>
          <ListRow label="2 GB left" value="Local Data" chevron={false} />
          <ListRow label="200 min left" value="Minutes" chevron={false} />
          <ListRow label="250 SMS left" value="Local SMS" chevron={false} />
        </Section>
      </div>
    ), code: snippets.section },

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
    blurb: 'Floating glass bottom nav over a midnight scrim — one frosted pill of equal-width tabs. Active tab is a white pill with a red icon + label. Click a tab to move it. mShop is now a regular tab.',
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
];

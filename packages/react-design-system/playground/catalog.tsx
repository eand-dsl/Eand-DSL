import type { ReactNode } from 'react';
import {
  Button, Badge, Chip, Tabs, TopBar, Section, ListRow, QuickAction, NavBar, PlanCard,
} from '../src';
import { Icon as EaIcon } from '../../icons/src';
import type { Snippet } from './code-tabs';
import { snippets } from './snippets';
import { ColorsView, TypographyView, SpacingView } from './tokens-view';

const ic = (n: string, c?: string) => <EaIcon name={n} size={24} color={c} />;

export interface Page {
  id: string; group: string; title: string; blurb: string;
  frame: 'phone' | 'pad' | 'full';
  render: () => ReactNode;
  code?: Snippet;
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
    blurb: 'Primary actions are e& red and pill-shaped. Secondary is outlined; tertiary/link are text.',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 320 }}>
        <Button variant="primary">Make your own deal</Button>
        <Button variant="secondary">Overview</Button>
        <Button variant="primary" size="sm">Small</Button>
      </div>
    ), code: snippets.button },

  { id: 'badge', group: 'Components', title: 'Badge', frame: 'pad',
    blurb: 'Offer badges (colour-coded by promo type) and status badges (neutral/positive/warning).',
    render: () => (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
        <Badge offer="new-plan">New</Badge>
        <Badge offer="discount">20% off</Badge>
        <Badge offer="best-seller">Best seller</Badge>
        <Badge status="positive">3 active</Badge>
        <Badge status="warning">Expiring</Badge>
      </div>
    ), code: snippets.badge },

  { id: 'chip', group: 'Components', title: 'Chip', frame: 'pad',
    blurb: 'Selectable pills for “Jump to…” shortcuts and filters.',
    render: () => (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
        <Chip selected>Manage my Plan</Chip><Chip>Change Plan</Chip><Chip>Family Plan</Chip><Chip>Buy Add-on</Chip>
      </div>
    ), code: snippets.chip },

  { id: 'tabs', group: 'Components', title: 'Tabs', frame: 'pad',
    blurb: 'Global page tabs (active = tinted-red) and local in-section tabs (active = midnight).',
    render: () => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
        <Tabs scope="global" tabs={['For you', 'Account', 'Loyalty']} defaultValue={1} />
        <Tabs scope="local" tabs={['All', 'Data', 'Calls']} />
      </div>
    ) },

  { id: 'topbar', group: 'Components', title: 'TopBar', frame: 'phone',
    blurb: 'The red account header: greeting, masked number, and circular icon actions.',
    render: () => <TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567"
      actions={[ic('sparkle', '#fff'), ic('notification', '#fff')]} />, code: snippets.topbar },

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
          { label: 'Subscriptions', icon: ic('subscriptions') },
          { label: 'My Devices', icon: ic('mobile') },
          { label: 'mParking', icon: ic('car') },
        ]} />
      </div>
    ), code: snippets.quickaction },

  { id: 'navbar', group: 'Components', title: 'NavBar', frame: 'phone',
    blurb: 'Floating glass bottom nav over a midnight scrim. Active = white pill + red. mShop is a detached special circle.',
    render: () => (
      <div style={{ background: '#2a2438', paddingTop: 24 }}>
        <NavBar items={[
          { label: 'mShop', icon: ic('mshop'), special: true },
          { label: 'Home', icon: ic('home'), active: true },
          { label: 'Support', icon: ic('support') },
          { label: 'Profile', icon: ic('profile') },
          { label: 'Shop', icon: ic('shop') },
        ]} />
      </div>
    ), code: snippets.navbar },

  { id: 'plancard', group: 'Components', title: 'PlanCard', frame: 'phone',
    blurb: 'Plans-mini card: eyebrow, name, smiles, “from AED…/mo”. Variants default / brand / midnight.',
    render: () => (
      <div style={{ padding: 12, background: '#e4e3ea', display: 'flex', gap: 12 }}>
        <PlanCard variant="default" category="Postpaid" name="Freedom Live 200" price="200" period="/mo" />
        <PlanCard variant="brand" category="Postpaid" name="Freedom Unlimited" price="350" period="/mo" />
      </div>
    ), code: snippets.plancard },
];

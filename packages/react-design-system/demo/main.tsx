import { createRoot } from 'react-dom/client';
import {
  TopBar, NavBar, Section, Tabs, ListRow, QuickAction, Chip, Searchbar, Badge, Button,
} from '../src';
import { Icon as EaIcon } from '../../icons/src';

const ic = (name: string, size = 24, color?: string) => <EaIcon name={name} size={size} color={color} />;

function Account() {
  return (
    <>
      <TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567"
        actions={[ic('sparkle', 22, '#fff'), ic('notification', 22, '#fff')]} />

      <div className="scroll">
        <div style={{ padding: '8px 8px 0' }}>
          <Tabs scope="global" tabs={['For you', 'Account', 'Loyalty']} defaultValue={1} />
        </div>

        <Section title="My Plan" context="Freedom Live Plan 200" hideChevron
          filterPill={<span style={{ color: '#e00800', fontWeight: 600, fontSize: 13 }}>Manage</span>}>
          <Tabs scope="local" tabs={['All', 'Data', 'Calls']} />
          <ListRow label="2 GB left" value="Local Data" chevron={false} />
          <ListRow label="200 min left" value="Minutes" chevron={false} />
          <ListRow label="250 SMS left" value="Local SMS" chevron={false} />
          <ListRow label="600 MB left" value="Roaming Data" chevron={false} />
        </Section>

        <Section title="My Bill" onSeeAll={() => {}}>
          <ListRow label="Total: AED 500" sublabel="Monthly bill: AED 480 · Extras: AED 20"
            value={<Button size="sm" variant="secondary">Overview</Button>} chevron={false} />
        </Section>

        <Section title="My Account Hub" onSeeAll={() => {}}>
          <QuickAction columns={2} items={[
            { label: 'Add-ons', icon: ic('puzzle'), badge: <Badge status="positive" size="sm">3 active</Badge> },
            { label: 'Subscriptions', icon: ic('subscriptions'), badge: <Badge status="neutral" size="sm">0</Badge> },
            { label: 'My Devices', icon: ic('mobile'), badge: <Badge status="warning" size="sm">Active</Badge> },
            { label: 'My SIM Cards', icon: ic('sim'), badge: <Badge status="positive" size="sm">2 cards</Badge> },
            { label: 'mParking', icon: ic('car') },
            { label: 'All Services', icon: ic('grid') },
          ]} />
        </Section>

        <Section title="Jump to..." surface="brand-muted" onSeeAll={() => {}}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Manage my Plan', 'Change Plan', 'My limits', 'Family Plan', 'Buy Add-on', 'Replace SIM', 'Switch to Postpaid'].map((c) => <Chip key={c}>{c}</Chip>)}
          </div>
          <Searchbar placeholder="Search for feature" />
        </Section>
      </div>

      <NavBar items={[
        { label: 'mShop', icon: ic('mshop'), special: true },
        { label: 'Home', icon: ic('home'), active: true }, { label: 'Support', icon: ic('support') },
        { label: 'Profile', icon: ic('profile') }, { label: 'Shop', icon: ic('shop') },
      ]} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Account />);

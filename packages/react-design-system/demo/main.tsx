import { createRoot } from 'react-dom/client';
import {
  TopBar, NavBar, Section, Tabs, ListRow, QuickAction, Chip, Searchbar, Badge, Icon, Button,
} from '../src';

function Account() {
  return (
    <>
      <TopBar variant="brand" greeting="Hi, Ahmed" title="050 123 4567"
        actions={[<span key="a">✦</span>, <span key="b">🔔</span>]} />

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
            { label: 'Add-ons', icon: '🧩', badge: <Badge status="positive" size="sm">3 active</Badge> },
            { label: 'Subscriptions', icon: '🔁', badge: <Badge status="neutral" size="sm">0</Badge> },
            { label: 'My Devices', icon: '📱', badge: <Badge status="warning" size="sm">Active</Badge> },
            { label: 'My SIM Cards', icon: '💳', badge: <Badge status="positive" size="sm">2 cards</Badge> },
            { label: 'mParking', icon: '🚗' },
            { label: 'All Services', icon: '⋯' },
          ]} />
        </Section>

        <Section title="Jump to..." surface="brand-muted" onSeeAll={() => {}}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Manage my Plan', 'Change Plan', 'My limits', 'Family Plan', 'Buy Add-on', 'Replace SIM', 'Manage Add-on', 'Switch to Postpaid'].map((c) => <Chip key={c}>{c}</Chip>)}
          </div>
          <Searchbar placeholder="Search for feature" />
        </Section>
      </div>

      <NavBar items={[
        { label: 'Home', icon: '🏠', active: true }, { label: 'Support', icon: '🎧' },
        { label: 'Profile', icon: '👤' }, { label: 'Shop', icon: '🛍️' },
      ]} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Account />);

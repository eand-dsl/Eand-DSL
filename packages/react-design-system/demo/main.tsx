import { createRoot } from 'react-dom/client';
import {
  TopBar, NavBar, Section, QuickAction, Highlight, SmilesBalance,
  PlanCard, ProductCard, ServiceCard, Badge, Icon, Logo,
} from '../src';

function Home() {
  return (
    <>
      <TopBar leading={<Logo />} title="" trailing={<><Icon size="md">🔍</Icon><Icon size="md">🔔</Icon><Icon size="md">👤</Icon></>} />
      <div className="scroll">
        <div style={{ padding: '0 8px' }}><SmilesBalance points="12,450 Smiles" /></div>

        <Section title="Quick actions" context="Top things to do" onSeeAll={() => {}}>
          <QuickAction columns={3} items={[
            { label: 'Quick Pay & Recharge', icon: '💳', badge: <Badge status="positive" size="sm">Active</Badge> },
            { label: 'Track Your Order', icon: '🚚' },
            { label: 'mParking', icon: '🚗' },
          ]} />
        </Section>

        <Section title="Plans" context="Cover these with your Smiles Points" carousel onSeeAll={() => {}}>
          <PlanCard variant="default" />
          <PlanCard variant="brand" />
          <PlanCard variant="midnight" />
        </Section>

        <Section title="Deals for you" context="Cover these with your Smiles Points" carousel onSeeAll={() => {}}>
          <ProductCard eyebrow="Data" title="New Freedom Unlimited Data Plan 500 Local" discount="20% off" price="200" pts />
          <ProductCard image="📱" title="iPhone Clear Case For Safe Use" discount="20% off" price="AED 200" />
          <ProductCard eyebrow="Top-line" title="Category" image="📱" discount="20% off" price="AED 200" tint="#fdf3ec" />
        </Section>

        <div style={{ padding: '0 8px' }}>
          <Highlight
            title="For Travellers"
            subtitle="Stay connected, even when you're away"
            action={{ title: 'Smiles Unlimited', subtitle: 'Exclusive venue deals', cta: 'Play now' }}
          />
        </div>

        <Section title="Services" context="Explore everything e&" onSeeAll={() => {}}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <ServiceCard icon="📱" label="Mobile Plans" badge={<Badge offer="new-plan" size="sm">New</Badge>} />
            <ServiceCard icon="⌚" label="Devices" />
            <ServiceCard icon="📶" label="TV & Internet" />
            <ServiceCard icon="🏪" label="EASE" />
            <ServiceCard icon="🛡️" label="Insurance" />
            <ServiceCard icon="🏠" label="Smart Living" />
          </div>
        </Section>
      </div>

      <NavBar items={[
        { label: 'Shop', icon: '🛍️' }, { label: 'Plans', icon: '📄', active: true },
        { label: 'Devices', icon: '📱' }, { label: 'eLife', icon: '📺' },
      ]} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Home />);

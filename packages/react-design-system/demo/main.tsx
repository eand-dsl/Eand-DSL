import { createRoot } from 'react-dom/client';
import {
  TopBar, NavBar, Section, SectionLink, QuickAction, Highlight, SmilesBalance,
  ProductCard, DealCard, PlanCard, ServiceCard, Icon, Logo, Badge, Button,
} from '../src';

function Home() {
  return (
    <>
      <TopBar
        leading={<Logo />}
        title=""
        trailing={<><Icon size="md">🔍</Icon><Icon size="md">🔔</Icon><Icon size="md">👤</Icon></>}
      />
      <div className="scroll">
        <Section>
          <SmilesBalance points="12,450 Smiles" cta="Redeem" />
        </Section>

        <Section title="Quick actions">
          <QuickAction items={[
            { label: 'Recharge', icon: '⚡' }, { label: 'Pay bill', icon: '🧾' },
            { label: 'Add data', icon: '📶' }, { label: 'Support', icon: '💬' },
          ]} />
        </Section>

        <Section title="Deals for you" action="See all" carousel>
          <DealCard title="50% off eLife" subtitle="Home broadband" badge="Limited" />
          <DealCard title="Double data" subtitle="Postpaid plans" badge="New" />
          <DealCard title="Free roaming" subtitle="Travel pack" badge="48h" />
        </Section>

        <Section>
          <Highlight title="Upgrade to 5G" subtitle="Unlimited data, zero throttling." cta="Explore plans" />
        </Section>

        <Section title="Recommended plans" action="See all" carousel>
          <PlanCard name="Plus" price="AED 125" features={['120 GB data', 'Unlimited mins', '5G']} recommended />
          <PlanCard name="Basic" price="AED 80" features={['40 GB data', '500 mins']} />
        </Section>

        <Section title="Shop" action="See all" carousel>
          <ProductCard title="iPhone 16 Pro" price="AED 4,799" badge="New" />
          <ProductCard title="Galaxy S25" price="AED 3,299" />
        </Section>

        <Section title="Services">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            <ServiceCard icon="📱" label="My number" />
            <ServiceCard icon="🏠" label="eLife" />
            <ServiceCard icon="🎁" label="Smiles" />
            <ServiceCard icon="🌍" label="Roaming" />
            <ServiceCard icon="🛡️" label="Insurance" />
            <ServiceCard icon="➕" label="More" />
          </div>
        </Section>
      </div>

      <NavBar items={[
        { label: 'Home', icon: '🏠', active: true }, { label: 'Shop', icon: '🛍️' },
        { label: 'Services', icon: '⚙️' }, { label: 'Smiles', icon: '🎁' }, { label: 'More', icon: '☰' },
      ]} />
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Home />);

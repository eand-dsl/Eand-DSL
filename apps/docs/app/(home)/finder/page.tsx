import FinderBar from '@/components/finder-bar';

export const metadata = { title: 'Component Finder' };

export default function FinderPage() {
  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Component Finder</h1>
      <p style={{ color: '#6b6b76', fontSize: 14, margin: '0 0 24px', maxWidth: 640 }}>
        Search every React component, icon, and Figma library component at once — or drop / paste an
        image to search by picture. The field is built from the design system&rsquo;s own tokens and
        icons; the search runs entirely in your browser, with no server model.
      </p>
      <div style={{ maxWidth: 720 }}>
        <FinderBar placeholder="Search components, icons, or describe it…" maxResults={12} />
      </div>
    </main>
  );
}

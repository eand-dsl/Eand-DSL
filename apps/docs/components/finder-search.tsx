'use client';
// The finder now lives inside the design system: <AISearch/> IS the finder.
// This page just showcases the library's own search bar.
import { AISearch } from '@eand/react-design-system';

export default function FinderSearch() {
  return (
    <div style={{ maxWidth: 720 }}>
      <AISearch placeholder="Search components, icons, or describe it…" maxResults={12} />
    </div>
  );
}

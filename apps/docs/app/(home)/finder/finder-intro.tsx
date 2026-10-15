'use client';

import FinderBar from '@/components/finder-bar';
import { useLang } from '@/lib/i18n/provider';

export default function FinderIntro() {
  const { t } = useLang();

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
        {t.finder.title}
      </h1>
      <p style={{ color: '#6b6b76', fontSize: 14, margin: '0 0 24px', maxWidth: 640 }}>
        {t.finder.body}
      </p>
      <div style={{ maxWidth: 720 }}>
        <FinderBar placeholder={t.finder.placeholder} maxResults={12} />
      </div>
    </main>
  );
}

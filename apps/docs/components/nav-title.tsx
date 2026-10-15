'use client';

import { useLang } from '@/lib/i18n/provider';

export default function NavTitle() {
  const { t } = useLang();

  return (
    <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span
        dir="ltr"
        style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}
      >
        e<b style={{ color: '#e00800' }}>&amp;</b>
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{t.siteTitle}</span>
    </span>
  );
}

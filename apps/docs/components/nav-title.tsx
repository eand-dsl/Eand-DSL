'use client';

import { Logo } from '@eand/react-design-system';
import { useLang } from '@/lib/i18n/provider';

export default function NavTitle() {
  const { lang, t } = useLang();

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Logo is a square box; the lockup sits centred in it, so clip to the lockup's height. */}
      <span style={{ display: 'flex', alignItems: 'center', height: 20, overflow: 'hidden' }}>
        <Logo type="lockup" version="red" rtl={lang === 'ar'} size={88} />
      </span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{t.siteTitle}</span>
    </span>
  );
}

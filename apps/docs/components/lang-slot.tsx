'use client';

import type { ReactNode } from 'react';
import { useLang } from '@/lib/i18n/provider';

/** Prose slots for MDX. Children keep normal markdown, so a page carries both
 *  languages and renders whichever is active. A page with only <EN> still reads
 *  correctly in Arabic — the chrome translates, the reference prose does not. */
export function EN({ children }: { children: ReactNode }) {
  return useLang().lang === 'en' ? <>{children}</> : null;
}

export function AR({ children }: { children: ReactNode }) {
  return useLang().lang === 'ar' ? <>{children}</> : null;
}

'use client';

import { useLang } from '@/lib/i18n/provider';
import { navLabels } from '@/lib/i18n/ui';
import { pagesAr } from '@/lib/i18n/pages';

/** Swaps a known English label for its Arabic counterpart, falling back to the
 *  English when untranslated — component names resolve that way by design. */
export function I18nLabel({ en }: { en: string }) {
  const { lang } = useLang();
  return <>{lang === 'ar' ? (navLabels[en] ?? en) : en}</>;
}

export function PageTitle({ slug, en }: { slug: string; en: string }) {
  const { lang } = useLang();
  return <>{lang === 'ar' ? (pagesAr[slug]?.title ?? en) : en}</>;
}

export function PageDescription({ slug, en }: { slug: string; en?: string }) {
  const { lang } = useLang();
  return <>{lang === 'ar' ? (pagesAr[slug]?.description ?? en) : en}</>;
}

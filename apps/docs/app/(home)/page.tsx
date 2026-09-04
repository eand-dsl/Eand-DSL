'use client';

import Link from 'next/link';
import { useLang } from '@/lib/i18n/provider';

export default function HomePage() {
  const { lang, t } = useLang();

  const entries = [
    { href: '/docs', ...t.cards.started },
    { href: '/docs/components/button', ...t.cards.components },
    { href: '/docs/foundations/colors', ...t.cards.foundations },
    { href: '/docs/foundations/icons', ...t.cards.icons },
  ];

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      {/* Arabic has no letter case, and uppercasing would corrupt the `e&` mark. */}
      <p
        className={`text-fd-muted-foreground text-sm font-medium tracking-wide ${
          lang === 'en' ? 'uppercase' : ''
        }`}
      >
        {t.tagline}
      </p>
      <h1 className="mt-3 max-w-2xl text-center text-4xl font-bold tracking-tight sm:text-5xl">
        {t.heroTitle}
      </h1>
      <p className="text-fd-muted-foreground mt-5 max-w-xl text-center text-lg">{t.heroBody}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="bg-fd-primary text-fd-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          {t.ctaDocs}
        </Link>
        <Link
          href="/docs/components/button"
          className="border-fd-border hover:bg-fd-accent rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          {t.ctaComponents}
        </Link>
      </div>

      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="border-fd-border bg-fd-card hover:border-fd-primary/50 rounded-xl border p-5 transition-colors"
          >
            <h2 className="font-semibold">{entry.title}</h2>
            <p className="text-fd-muted-foreground mt-1.5 text-sm">{entry.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

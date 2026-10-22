'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLang } from '@/lib/i18n/provider';
import data from './preview/figma-descriptions.json';

type Entry = { node: string; name: string; url: string; published: boolean; description: string };
const entries = data as unknown as Record<string, Entry>;

const LABEL = /^(Use for|Not for|Choosing|Rules|USE FOR|NOT FOR|[\w-]+ vs [\w-]+)(:\s*|\s{2,})/;

function isHeading(line: string) {
  const l = line.trim();
  return l.length > 0 && l.split(/\s+/).length <= 5 && !/[.!?:=]$/.test(l) && !l.includes(' - ') && !l.includes('=');
}

function Line({ text }: { text: string }) {
  if (isHeading(text)) return <p className="mt-3 font-semibold text-fd-foreground first:mt-0">{text.trim()}</p>;
  const m = text.match(LABEL);
  const body: ReactNode = m ? (
    <><strong className="font-semibold text-fd-foreground">{m[1]}</strong>{m[2].includes(':') ? ': ' : ' '}{text.slice(m[0].length)}</>
  ) : text;
  return <p className="whitespace-pre-wrap">{body}</p>;
}

const COLLAPSED = 152;

export function FigmaDescription({ slug }: { slug: string }) {
  const { lang, t } = useLang();
  const entry = entries[slug];
  const bodyRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el) setOverflows(el.scrollHeight > COLLAPSED + 8);
  }, [slug]);

  if (!entry || slug.startsWith('_')) return null;
  const s = t.figma;

  const header = (
    <div className="flex items-center justify-between gap-3">
      <span dir="auto" className="text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
        {s.title} · <code className="normal-case tracking-normal">{entry.name}</code>
      </span>
      <a dir="auto" href={entry.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-fd-primary hover:underline">
        {s.open} ↗
      </a>
    </div>
  );

  if (!entry.description) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-fd-border px-4 py-3 text-sm">
        {header}
        <p className="mt-1.5 text-fd-muted-foreground">{entry.published ? s.empty : s.unpublished}</p>
      </div>
    );
  }

  const paragraphs = entry.description.split('\n\n');
  const clipped = overflows && !open;

  return (
    <section aria-label={s.title} className="mt-4 rounded-xl border border-fd-border bg-fd-card px-4 py-3 text-sm">
      {header}
      {lang === 'ar' && s.englishOnly ? <p className="mt-1 text-xs text-fd-muted-foreground">{s.englishOnly}</p> : null}
      <div className="relative mt-2">
        <div
          ref={bodyRef}
          id={`figma-desc-${slug}`}
          dir="ltr"
          lang="en"
          className="flex flex-col gap-2.5 overflow-hidden leading-relaxed text-fd-muted-foreground"
          style={{ maxHeight: clipped ? COLLAPSED : undefined }}
        >
          {paragraphs.map((p, i) => (
            <div key={i} className="flex flex-col gap-1">
              {p.split('\n').map((l, j) => <Line key={j} text={l} />)}
            </div>
          ))}
        </div>
        {clipped ? <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-fd-card" /> : null}
      </div>
      {overflows ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`figma-desc-${slug}`}
          onClick={() => setOpen((o) => !o)}
          className="mt-2 text-xs font-semibold text-fd-primary hover:underline"
        >
          {open ? s.less : s.more}
        </button>
      ) : null}
    </section>
  );
}

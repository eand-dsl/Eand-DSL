'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { PAGES } from './catalog';
import { CodeTabs } from './code-tabs';
import { Controls, controlDefaults } from './controls-panel';
import { snippets } from './snippets';
import './preview.css';

/** Live, knob-driven preview of a catalog component — the docs-site port of the
 *  playground Stage. Drop `<ComponentDemo id="button" />` into any MDX page.
 *
 *  The stage reserves a fixed height equal to the tallest variant rendered so far
 *  (grow-only): switching variants centres content in that space instead of
 *  resizing the box, so the preview never jumps and never clips a taller variant. */
export function ComponentDemo({ id, code = true }: { id: string; code?: boolean }) {
  const page = PAGES.find((x) => x.id === id);
  const contentRef = useRef<HTMLDivElement>(null);
  const [reserved, setReserved] = useState(page?.minH ?? 0);

  // Lock the stage to the tallest content it has ever held. Measuring the natural
  // content height (not the reserved slot) keeps this monotonic and clip-free.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setReserved((h) => Math.max(h, el.getBoundingClientRect().height));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  });

  const [vals, setVals] = useState(() => controlDefaults(page?.controls));
  if (!page) return <div className="eapg-missing">Unknown demo id: {id}</div>;
  const set = (prop: string, value: string | number | boolean) => setVals((prev) => ({ ...prev, [prop]: value }));
  const preview = page.render(vals);
  // Every component ships SwiftUI / Compose / React snippets keyed by page id; an
  // inline page.code (if any) wins over the shared snippets map.
  const snippet = page.code ?? snippets[page.id];

  return (
    <div className="eapg">
      {page.frame === 'full' ? (
        <div style={{ marginTop: 8 }}>{preview}</div>
      ) : (
        <div className={`stage ${page.frame}`}>
          <div className="stage-slot" style={{ minHeight: reserved || undefined }}>
            <div className="stage-content" ref={contentRef}>
              {page.frame === 'phone' ? <div className="frame">{preview}</div> : preview}
            </div>
          </div>
        </div>
      )}
      {page.controls?.length ? <Controls controls={page.controls} values={vals} onChange={set} /> : null}
      {code && snippet ? <CodeTabs code={snippet} /> : null}
    </div>
  );
}

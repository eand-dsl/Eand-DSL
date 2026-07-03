'use client';

import { useState } from 'react';
import { PAGES } from './catalog';
import { CodeTabs } from './code-tabs';
import { Controls, controlDefaults } from './controls-panel';
import './preview.css';

/** Live, knob-driven preview of a catalog component — the docs-site port of the
 *  playground Stage. Drop `<ComponentDemo id="button" />` into any MDX page. */
export function ComponentDemo({ id, code = true }: { id: string; code?: boolean }) {
  const page = PAGES.find((x) => x.id === id);
  const [vals, setVals] = useState(() => controlDefaults(page?.controls));
  if (!page) return <div className="eapg-missing">Unknown demo id: {id}</div>;
  const set = (prop: string, value: string | number | boolean) => setVals((prev) => ({ ...prev, [prop]: value }));
  const preview = page.render(vals);

  return (
    <div className="eapg">
      {page.frame === 'full' ? (
        <div style={{ marginTop: 8 }}>{preview}</div>
      ) : (
        <div className={`stage ${page.frame}`}>
          {page.frame === 'phone' ? <div className="frame">{preview}</div> : <div>{preview}</div>}
        </div>
      )}
      {page.controls?.length ? <Controls controls={page.controls} values={vals} onChange={set} /> : null}
      {code && page.code ? <CodeTabs code={page.code} /> : null}
    </div>
  );
}

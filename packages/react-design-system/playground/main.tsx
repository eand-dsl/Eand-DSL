import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PAGES, type Page } from './catalog';
import { CodeTabs } from './code-tabs';
import { Controls, controlDefaults } from './controls-panel';

const GROUPS = ['Foundations', 'Components'];

function Stage({ page }: { page: Page }) {
  const [vals, setVals] = useState(() => controlDefaults(page.controls));
  const set = (prop: string, value: string | number | boolean) => setVals((p) => ({ ...p, [prop]: value }));
  const preview = page.render(vals);

  const stage = page.frame === 'full'
    ? <div style={{ marginTop: 28 }}>{preview}</div>
    : page.frame === 'phone'
      ? (
        <>
          <div className="stage-label">Live preview</div>
          <div className="stage phone"><div className="frame">{preview}</div></div>
        </>
      )
      : (
        <>
          <div className="stage-label">Live preview</div>
          <div className="stage pad"><div>{preview}</div></div>
        </>
      );

  return (
    <>
      {stage}
      {page.controls?.length ? <Controls controls={page.controls} values={vals} onChange={set} /> : null}
    </>
  );
}

const initialId = () => {
  const p = new URLSearchParams(location.search).get('p') || location.hash.replace('#', '');
  return PAGES.some((x) => x.id === p) ? p : 'button';
};
function App() {
  const [id, setId] = useState(initialId);
  const go = (next: string) => {
    setId(next);
    history.replaceState(null, '', `?p=${next}`);
  };
  const page = PAGES.find((p) => p.id === id)!;
  return (
    <>
      <aside className="rail">
        <div className="brand">
          <span className="mark">e<b>&amp;</b></span>
          <span className="sub">Design<br />System</span>
        </div>
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="rail-group">{g}</div>
            {PAGES.filter((p) => p.group === g).map((p) => (
              <button key={p.id} className={`rail-item ${p.id === id ? 'on' : ''}`} onClick={() => go(p.id)}>
                <span className="dot" />{p.title}
              </button>
            ))}
          </div>
        ))}
        <div className="rail-foot">
          One token source → web + iOS + Android.<br />
          <code>@eand/tokens-native</code><br />
          <code>@eand/react-design-system</code><br />
          <code>@eand/icons</code>
        </div>
      </aside>

      <main className="content">
        <div className="page">
          <div className="eyebrow">{page.group}</div>
          <h1>{page.title}</h1>
          <p className="lede">{page.blurb}</p>
          <Stage key={page.id} page={page} />
          {page.code ? <CodeTabs code={page.code} /> : null}
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')!).render(<App />);

import { tokens } from '@eand/react-design-system';

type Tree = Record<string, any>;
function leaves(node: Tree, path: string[] = []): [string[], string][] {
  const out: [string[], string][] = [];
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === 'object') out.push(...leaves(v, [...path, k]));
    else out.push([[...path, k], String(v)]);
  }
  return out;
}
const isColor = (v: string) => /^#|^rgba?\(/.test(v);

export function ColorsView() {
  const groups: Record<string, [string, string][]> = {};
  for (const [parts, v] of leaves(tokens.color as Tree)) {
    if (!isColor(v)) continue;
    const g = parts[0];
    (groups[g] ??= []).push([parts.join('.'), v]);
  }
  // semantic groups first, then primitive ramps
  const order = ['text', 'surface', 'border', 'badge', 'button', 'icon'];
  const keys = Object.keys(groups).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  return (
    <>
      {keys.map((g) => (
        <div key={g}>
          <div className="grp-h">{g} <span style={{ color: 'var(--muted)', fontWeight: 500 }}>· {groups[g].length}</span></div>
          <div className="grid-sw">
            {groups[g].map(([name, val]) => (
              <div className="sw" key={name}>
                <div className="chip" style={{ background: `linear-gradient(45deg,#ddd 25%,transparent 25%,transparent 75%,#ddd 75%),linear-gradient(45deg,#ddd 25%,#fff 25%,#fff 75%,#ddd 75%)`, backgroundSize: '12px 12px', backgroundPosition: '0 0,6px 6px' }}>
                  <div style={{ height: '100%', background: val }} />
                </div>
                <div className="meta">
                  <div className="nm">{name.replace(/^color\./, '').replace(`${g}.`, '')}</div>
                  <div className="vl">{val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function TypographyView() {
  const styles = leaves(tokens.typography as Tree)
    .filter(([p]) => p[p.length - 1] === 'fontSize')
    .map(([p]) => p.slice(0, -1));
  const get = (p: string[]) => p.reduce((o: any, k) => o?.[k], tokens.typography as any);
  return (
    <div>
      {styles.map((p) => {
        const s = get(p);
        const px = parseFloat(s.fontSize);
        return (
          <div className="spec-row" key={p.join('.')}>
            <div className="lbl">{p.join('.')}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: Math.min(px, 40), fontWeight: Number(s.fontWeight) || 400, lineHeight: 1.1, letterSpacing: px > 28 ? '-0.5px' : 0 }}>
                The quick brown fox
              </div>
              <div className="vl" style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11, marginTop: 4 }}>
                {s.fontSize} · {s.fontWeight} · lh {s.lineHeight}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SpacingView() {
  const space = Object.entries(tokens.spacing as Tree);
  const radius = Object.entries(tokens.borderRadius as Tree);
  const icon = Object.entries(tokens.icon as Tree);
  return (
    <div>
      <div className="grp-h">Spacing</div>
      {space.map(([k, v]) => (
        <div className="scale-row" key={k}>
          <div className="lbl">{k}</div>
          <div className="bar" style={{ width: String(v) }} />
          <div className="vl">{String(v)}</div>
        </div>
      ))}
      <div className="grp-h">Border radius</div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {radius.map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: '#fff', border: '1px solid var(--line)', borderRadius: String(v) }} />
            <div className="vl" style={{ marginTop: 6 }}>{k} · {String(v)}</div>
          </div>
        ))}
      </div>
      <div className="grp-h">Icon sizes</div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {icon.map(([k, v]) => (
          <div key={k} style={{ textAlign: 'center' }}>
            <div style={{ width: String(v), height: String(v), background: 'var(--red)', borderRadius: 4 }} />
            <div className="vl" style={{ marginTop: 6 }}>{k} · {String(v)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

/** The published Figma V1.2 text styles (`tokens.textStyle`) — what `ty()` and the
 *  `Text` component apply. Each specimen is set at the style's real size, weight,
 *  line height and tracking. */
const STYLE_GROUPS: [string, string][] = [
  ['display', 'Display'], ['heading', 'Heading'], ['title', 'Title'], ['body', 'Body'],
  ['button', 'Button'], ['badge', 'Badge'], ['alerts', 'Alerts'],
];
type Style = { fontFamily: string; fontSize: string; fontWeight: string; lineHeight?: string; letterSpacing?: string };
const pct = (lh?: string) => (lh == null ? 'auto' : lh.endsWith('px') ? lh : `${Math.round(parseFloat(lh) * 100)}%`);

function StyleRow({ name, s, arabic }: { name: string; s: Style; arabic: boolean }) {
  return (
    <div className="spec-row">
      <div className="lbl">{name}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          dir={arabic ? 'rtl' : undefined}
          lang={arabic ? 'ar' : undefined}
          style={{
            fontSize: s.fontSize, fontWeight: Number(s.fontWeight) || 400, lineHeight: s.lineHeight ?? 'normal',
            letterSpacing: s.letterSpacing, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {/* `aed/*` is the Arabic ramp, so it gets Arabic copy — a Latin specimen says
              nothing about the metrics this ramp exists to tune. */}
          {arabic ? 'باقة فريدم لايف ٢٠٠' : 'Freedom Live Plan 200'}
        </div>
        <div className="vl" style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: 11, marginTop: 4 }}>
          {s.fontSize} · {s.fontWeight} · lh {pct(s.lineHeight)} · tracking {s.letterSpacing ?? '0px'}
        </div>
      </div>
    </div>
  );
}

export function TypographyView() {
  const ts = tokens.textStyle as unknown as Record<string, Record<string, any>>;
  const block = (root: Record<string, any>, prefix: string, arabic: boolean) =>
    STYLE_GROUPS.filter(([g]) => root[g]).map(([g, label]) => (
      <div key={prefix + g}>
        <div className="grp-h">{arabic ? `Arabic · ${label}` : label}</div>
        {Object.entries(root[g] as Record<string, Style>).map(([size, s]) => (
          <StyleRow key={size} name={`${prefix}${g}/${size}`} s={s} arabic={arabic} />
        ))}
      </div>
    ));
  return (
    <div>
      {block(ts, '', false)}
      {ts.aed ? block(ts.aed, 'aed/', true) : null}
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

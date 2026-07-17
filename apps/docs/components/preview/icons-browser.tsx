'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { ICONS, ICON_META, Icon } from '@eand/icons';
import './preview.css';

const EMPTY_META = { description: '', aliases: [] as string[] };

const segWrap: CSSProperties = {
  display: 'flex',
  border: '1px solid var(--line, #e6e5ec)',
  borderRadius: 999,
  overflow: 'hidden',
  fontSize: 10,
};

function segBtn(on: boolean): CSSProperties {
  return {
    padding: '3px 10px',
    border: 'none',
    cursor: 'pointer',
    background: on ? 'var(--red, #e00800)' : 'transparent',
    color: on ? '#fff' : 'inherit',
    opacity: on ? 1 : 0.6,
    fontSize: 10,
    lineHeight: 1.4,
  };
}

/** One icon concept: outline/filled preview toggle, click-to-copy name, description. */
function IconTile({
  base,
  copiedKey,
  onCopy,
}: {
  base: string;
  copiedKey: string | null;
  onCopy: (key: string) => void;
}) {
  const [filled, setFilled] = useState(false);
  const key = filled ? `${base}-filled` : base;
  const meta = ICON_META[base] ?? EMPTY_META;
  const justCopied = copiedKey === base || copiedKey === `${base}-filled`;

  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '16px 12px', border: '1px solid var(--line, #e6e5ec)',
        borderRadius: 12, minWidth: 0,
      }}
    >
      <Icon name={key} size={26} />
      <div style={segWrap} role="group" aria-label={`${base} variant`}>
        <button type="button" style={segBtn(!filled)} aria-pressed={!filled} onClick={() => setFilled(false)}>
          outline
        </button>
        <button type="button" style={segBtn(filled)} aria-pressed={filled} onClick={() => setFilled(true)}>
          filled
        </button>
      </div>
      <button
        type="button"
        onClick={() => onCopy(key)}
        title={`Click to copy "${key}"`}
        style={{
          border: 'none', background: 'transparent', cursor: 'pointer', padding: 0,
          fontSize: 11, lineHeight: 1.3, textAlign: 'center', width: '100%',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          opacity: justCopied ? 1 : 0.75, color: justCopied ? 'var(--red, #e00800)' : 'inherit',
        }}
      >
        {justCopied ? 'copied!' : key}
      </button>
      {meta.description && (
        <p
          style={{
            fontSize: 11, lineHeight: 1.4, textAlign: 'center', margin: 0, opacity: 0.55,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {meta.description}
        </p>
      )}
    </div>
  );
}

/**
 * Searchable gallery of every icon concept in @eand/icons (outline + filled pair
 * per tile). Search matches names, descriptions, and Figma "also searchable as"
 * aliases. Click a name to copy the currently-toggled variant's key.
 */
export function IconGallery() {
  const bases = useMemo(
    () => Object.keys(ICONS).filter((n) => !n.endsWith('-filled')).sort(),
    [],
  );
  const index = useMemo(() => {
    const m = new Map<string, string>();
    for (const b of bases) {
      const meta = ICON_META[b] ?? EMPTY_META;
      m.set(b, `${b} ${meta.description.toLowerCase()} ${meta.aliases.join(' ')}`);
    }
    return m;
  }, [bases]);

  const [q, setQ] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const needle = q.toLowerCase().trim();
  const shown = needle ? bases.filter((b) => index.get(b)!.includes(needle)) : bases;

  const copy = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((c) => (c === key ? null : c)), 1200);
  };

  return (
    <div className="eapg">
      <input
        className="ctrl-input"
        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', marginBottom: 16, fontSize: 15 }}
        placeholder={`Search ${bases.length} icons — names, descriptions, aliases…`}
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div style={{ marginBottom: 12, fontSize: 13, opacity: 0.6 }}>
        {shown.length} icon{shown.length === 1 ? '' : 's'} · outline + filled variants
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {shown.map((base) => (
          <IconTile key={base} base={base} copiedKey={copiedKey} onCopy={copy} />
        ))}
      </div>
    </div>
  );
}

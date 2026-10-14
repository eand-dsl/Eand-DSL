'use client';
/*
 * FinderBar — the docs site's component finder.
 *
 * The field is assembled from the design system itself (`Icon`, `IconBox`, and the
 * `--eand-*` token variables that `@eand/react-design-system/styles.css` publishes), so
 * it looks like the DSL `Searchbar` it sits beside without the library having to ship a
 * component that depends on a static index. The search logic is in `lib/finder-client`.
 *
 * Type to match every React component, icon, and Figma-library component at once, or
 * drop / paste / upload a picture to rank the libraries by visual similarity.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon, IconBox } from '@eand/react-design-system';
import {
  loadIndex, rankByName, searchByImage, thumbBase,
  type FinderEntry, type FinderIndex,
} from '@/lib/finder-client';

const BRAND = 'var(--eand-color-surface-base-brand)';
const SURFACE = 'var(--eand-color-surface-base-default)';
const SUNKEN = 'var(--eand-color-surface-sunken-default)';
const LINE = 'var(--eand-color-border-surface-based-canvas-default)';
const TEXT = 'var(--eand-color-text-default-default)';
const MUTED = 'var(--eand-color-text-default-muted)';
const RADIUS = 'var(--eand-border-radius-6)';
const SP_SM = 'var(--eand-spacing-sm)';
const SP_LG = 'var(--eand-spacing-lg)';

export interface FinderBarProps {
  placeholder?: string;
  /** Max rows in the dropdown. */
  maxResults?: number;
  /** Allow the in-browser image search (default true). */
  enableVisual?: boolean;
}

export default function FinderBar({
  placeholder = 'Ask e& or search',
  maxResults = 12,
  enableVisual = true,
}: FinderBarProps) {
  const router = useRouter();
  const [index, setIndex] = useState<FinderIndex | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<FinderEntry[]>([]);
  const [note, setNote] = useState('');
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null); // data URL
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tok = useRef(0);

  const listId = useId();
  const optionId = (i: number) => `${listId}-opt-${i}`;

  // Load the static index. Retryable: `loadIndex` does not cache a failed attempt.
  const load = useCallback(() => {
    let alive = true;
    setLoadFailed(false);
    loadIndex()
      .then((idx) => { if (alive) setIndex(idx); })
      .catch(() => { if (alive) setLoadFailed(true); });
    return () => { alive = false; };
  }, []);
  useEffect(() => load(), [load]);

  // close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // An image → visual search; otherwise name search as you type.
  useEffect(() => {
    if (!index) return;
    const t = ++tok.current;
    setActive(-1);
    if (image) {
      setBusy(true);
      // Drop the previous text hits: leaving them up under "Searching by image…" reads
      // as though they were the visual matches, and the model can take 10s+ cold.
      setResults([]);
      setNote('Searching by image…');
      searchByImage(image, { limit: maxResults })
        .then((res) => {
          if (t !== tok.current) return;
          setResults(res);
          setNote(res.length ? `${res.length} look-alike${res.length === 1 ? '' : 's'} in the libraries` : 'No visual matches');
        })
        .catch(() => {
          if (t !== tok.current) return;
          setResults([]);
          setNote('Image search unavailable — check your connection and try again');
        })
        .finally(() => { if (t === tok.current) setBusy(false); });
      return;
    }
    const hits = rankByName(index.entries, q);
    setResults(hits.slice(0, maxResults));
    setNote(q ? `${hits.length} match${hits.length === 1 ? '' : 'es'}` : '');
    // An image search that was superseded by this keystroke skips its own `finally`
    // (its token is stale), so `busy` has to be cleared here or it sticks forever.
    setBusy(false);
  }, [q, image, index, maxResults]);

  const toURL = (f: File) => new Promise<string>((r) => {
    const fr = new FileReader();
    fr.onload = () => r(fr.result as string);
    fr.readAsDataURL(f);
  });

  const useImageFile = async (f?: File | null) => {
    if (!f || !f.type.startsWith('image/')) return;
    setQ('');
    setImage(await toURL(f));
    setOpen(true);
  };

  // Always route image clearing through here: without the value reset, re-picking the
  // same file fires no `change` event and the search silently never starts.
  const clearImage = () => {
    setImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  // Docs first. A cross-linked entry carries BOTH a docs page and a Figma node; on the
  // docs site its own page is the useful destination, and Figma-only entries still open
  // in Figma. Preferring `figma` sent every documented component off-site instead.
  const isExternal = (e: FinderEntry) => !e.docs && !!e.figma;
  const hrefOf = (e: FinderEntry) => e.docs || e.figma || '#';

  const go = (e: FinderEntry) => {
    if (e.docs) {
      setOpen(false);
      router.push(e.docs); // client-side transition; window.open('_self') reloaded the app
      return;
    }
    if (e.figma) window.open(e.figma, '_blank', 'noopener,noreferrer');
  };

  const hasQuery = q !== '' || !!image;

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%' }}
      onDragEnter={(e) => { if (enableVisual) { e.preventDefault(); setDragging(true); } }}
      onDragOver={(e) => { if (enableVisual) e.preventDefault(); }}
      onDragLeave={(e) => { if (enableVisual && !wrapRef.current?.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={async (e) => {
        if (!enableVisual) return;
        e.preventDefault();
        setDragging(false);
        await useImageFile([...e.dataTransfer.files].find((x) => x.type.startsWith('image/')));
      }}
      onPaste={async (e) => {
        if (!enableVisual) return;
        const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith('image/'));
        if (it) await useImageFile(it.getAsFile());
      }}
    >
      {dragging && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 52, borderRadius: RADIUS,
          border: `2px dashed ${BRAND}`, background: SURFACE, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: SP_SM, color: BRAND, fontWeight: 600,
          pointerEvents: 'none', zIndex: 60,
        }}>
          <Icon name="image" size={20} /> Drop image to search by picture
        </div>
      )}

      {/* field — mirrors the DSL Searchbar, plus an image preview and upload control */}
      <span style={{
        display: 'flex', alignItems: 'center', gap: SP_SM, height: 52, padding: `0 ${SP_LG}`,
        borderRadius: RADIUS, background: SURFACE, width: '100%', boxSizing: 'border-box',
        boxShadow: dragging ? `0 0 0 2px ${BRAND}` : undefined, transition: 'box-shadow 120ms',
      }}>
        {image ? (
          <span style={{
            position: 'relative', width: 34, height: 34, flex: '0 0 auto', borderRadius: 8,
            overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${LINE}`,
          }}>
            <img src={image} alt="Search image" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <button
              type="button" aria-label="Remove image" onClick={clearImage}
              style={{
                position: 'absolute', top: 0, right: 0, width: 15, height: 15, border: 0,
                borderRadius: '0 0 0 5px', background: 'rgba(0,0,0,.55)', color: '#fff',
                fontSize: 11, lineHeight: '13px', cursor: 'pointer', padding: 0,
              }}
            >×</button>
          </span>
        ) : (
          <IconBox size="lg"><Icon name="search" size={24} /></IconBox>
        )}

        <input
          value={q}
          placeholder={image ? 'Searching by image — type to search text instead' : placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 && results[active] ? optionId(active) : undefined}
          onChange={(e) => { if (image) clearImage(); setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter' && active >= 0 && results[active]) { e.preventDefault(); go(results[active]); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: TEXT }}
        />

        {enableVisual && (
          <>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => { await useImageFile(e.target.files?.[0]); }} />
            <button
              type="button" title="Search by image — upload a screenshot or picture" aria-label="Search by image"
              onClick={() => fileRef.current?.click()}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: image ? BRAND : MUTED }}
            >
              <IconBox size="lg"><Icon name="image" size={24} /></IconBox>
            </button>
          </>
        )}
      </span>

      {open && (
        <div style={{
          position: 'absolute', top: 58, left: 0, right: 0, zIndex: 50, maxHeight: '60vh',
          overflowY: 'auto', background: SURFACE, border: `1px solid ${LINE}`, borderRadius: RADIUS,
          boxShadow: '0 12px 34px rgba(20,20,45,.14)', padding: 6,
        }}>
          {loadFailed && (
            <div style={{ padding: 14, color: MUTED, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ flex: 1 }}>Could not load the search index.</span>
              <button
                type="button" onClick={load}
                style={{ border: 0, background: 'transparent', color: BRAND, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}
              >Retry</button>
            </div>
          )}
          {!index && !loadFailed && <div style={{ padding: 14, color: MUTED, fontSize: 13 }}>Loading index…</div>}
          {index && !hasQuery && (
            <div style={{ padding: 14, color: MUTED, fontSize: 13 }}>
              Type to search components, icons &amp; Figma libraries
              {enableVisual ? ' — or upload / paste an image to search by picture' : ''}.
            </div>
          )}

          {/* Only the options live in the listbox — status rows inside it are invalid ARIA. */}
          <div role="listbox" id={listId} aria-label="Search results">
            {results.map((e, i) => (
              <a
                key={e.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                href={hrefOf(e)}
                target={isExternal(e) ? '_blank' : undefined}
                rel={isExternal(e) ? 'noopener noreferrer' : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={(ev) => {
                  if (isExternal(e)) return; // let the browser open the external tab
                  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
                  ev.preventDefault();
                  go(e);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 10,
                  textDecoration: 'none', color: TEXT, background: i === active ? SUNKEN : 'transparent',
                }}
              >
                <span style={{
                  width: 40, height: 40, flex: '0 0 auto', borderRadius: 9, background: SUNKEN,
                  display: 'grid', placeItems: 'center', overflow: 'hidden',
                }}>
                  {e.thumb
                    ? <img src={thumbBase + e.thumb} alt="" style={{ maxWidth: '84%', maxHeight: '84%' }} />
                    : <span style={{ color: BRAND, fontWeight: 700 }}>{e.name.slice(0, 1).toUpperCase()}</span>}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {e.kind.replace('figma-', 'Figma ')}{e.sub ? ' · ' + e.sub : ''}
                  </span>
                </span>
                <span style={{ flex: '0 0 auto', fontSize: 11, fontWeight: 600, color: BRAND }}>{e.docs ? 'Docs' : 'Figma ↗'}</span>
              </a>
            ))}
          </div>

          {index && hasQuery && results.length === 0 && !busy && (
            <div style={{ padding: 14, color: MUTED, fontSize: 13 }}>No matches.</div>
          )}
          {(note || busy) && (
            <div style={{ padding: '8px 12px 4px', fontSize: 11, color: MUTED, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span aria-live="polite">{busy ? 'Working…' : note}</span>
              {enableVisual && !image && <span style={{ whiteSpace: 'nowrap' }}>drag, paste, or upload an image</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

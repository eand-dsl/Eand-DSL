/* ---------------- Finder engine ----------------
 * Powers <AISearch> as a live component/icon finder. Loads a prebuilt static
 * index (index.json + embeddings.f32 + optional thumbs) that the CONSUMING app
 * serves (default base "/finder/"), and searches it two ways:
 *   Tier 1 — name/description/alias/tag match, instant, no model (as you type).
 *   Tier 2 — search by IMAGE: upload, paste, or drop a picture and a SigLIP
 *            vision model runs IN THE BROWSER (transformers.js from a CDN, lazy)
 *            to find look-alike components across the libraries.
 * Nothing runs on a server, so a consumer can deploy this fully static (Vercel).
 * The library ships NO model dependency — transformers.js is fetched at runtime
 * only when visual search is first used.
 */
import { useEffect, useRef, useState, type CSSProperties, type InputHTMLAttributes } from 'react';
import { color, space, ty, radius } from '../system';
import { Icon } from '../icons';
import { IconBox } from './primitives';

export interface FinderEntry {
  id: string; kind: string; name: string; sub?: string; desc?: string;
  tags?: string[]; docs?: string | null; figma?: string | null; thumb?: string | null; emb?: number | null;
}

// hide the CDN URL from the bundler (vite/webpack/turbopack) so it isn't resolved at build time
const cdnImport = (u: string): Promise<any> => (new Function('u', 'return import(u)') as any)(u);
const MODEL = 'Xenova/siglip-base-patch16-224';
const l2 = (v: number[]) => { let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1; return v.map((x) => x / n); };

// module-level singletons: many <AISearch> instances share one index + one model
interface Cache { base?: string; entries?: FinderEntry[]; dim?: number; emb?: Float32Array; load?: Promise<void>; clip?: any; clipLoad?: Promise<any>; }
const C: Cache = {};

function loadAll(base: string): Promise<void> {
  if (C.entries && C.base === base) return Promise.resolve();
  if (C.load && C.base === base) return C.load;
  C.base = base;
  C.load = (async () => {
    const [entries, meta, embBuf] = await Promise.all([
      fetch(base + 'index.json').then((r) => r.json()),
      fetch(base + 'embed-meta.json').then((r) => r.json()).catch(() => ({ dim: 0 })),
      fetch(base + 'embeddings.f32').then((r) => r.arrayBuffer()).catch(() => new ArrayBuffer(0)),
    ]);
    C.entries = entries; C.dim = meta.dim || 0; C.emb = new Float32Array(embBuf);
  })();
  return C.load;
}

export function nameSearch(query: string): FinderEntry[] {
  const list = C.entries || [];
  const ql = query.toLowerCase().trim();
  const terms = ql.split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const out: [number, FinderEntry][] = [];
  for (const e of list) {
    const hay = (e.name + ' ' + (e.desc || '') + ' ' + (e.sub || '') + ' ' + (e.tags || []).join(' ')).toLowerCase();
    if (!terms.every((t) => hay.includes(t))) continue;
    const nm = e.name.toLowerCase();
    let s = 0;
    if (nm === ql) s += 100; else if (nm.startsWith(ql)) s += 60; else if (nm.includes(ql)) s += 40;
    for (const t of terms) { if (nm.startsWith(t)) s += 8; else if (nm.includes(t)) s += 4; }
    if (e.kind === 'component') s += 5; else if (e.kind === 'icon') s += 3; // prefer the DSL's own
    out.push([s, e]);
  }
  out.sort((a, b) => b[0] - a[0]);
  return out.map((x) => x[1]);
}

function semantic(qvec: number[]): FinderEntry[] {
  const E = C.emb, D = C.dim || 0, list = C.entries || [];
  if (!E || !D) return [];
  const scored: [number, FinderEntry][] = [];
  for (const e of list) {
    if (e.emb == null) continue;
    const o = e.emb * D; let s = 0;
    for (let d = 0; d < D; d++) s += qvec[d] * E[o + d];
    scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.map((x) => x[1]);
}

function ensureModel(): Promise<any> {
  if (C.clip) return Promise.resolve(C.clip);
  if (C.clipLoad) return C.clipLoad;
  C.clipLoad = (async () => {
    const T = await cdnImport('https://esm.sh/@huggingface/transformers@3.0.0');
    C.clip = {
      processor: await T.AutoProcessor.from_pretrained(MODEL),
      vision: await T.SiglipVisionModel.from_pretrained(MODEL),
      RawImage: T.RawImage,
    };
    return C.clip;
  })();
  return C.clipLoad;
}
async function embedImage(dataURL: string) { const c = await ensureModel(); const img = await c.RawImage.fromURL(dataURL); const { pooler_output } = await c.vision(await c.processor(img)); return l2(pooler_output.tolist()[0]); }

/** Loads the finder index for `base`; returns whether it's ready. */
function useFinderReady(base: string) {
  const [ready, setReady] = useState(() => C.entries != null && C.base === base);
  useEffect(() => { let alive = true; loadAll(base).then(() => alive && setReady(true)).catch(() => {}); return () => { alive = false; }; }, [base]);
  return ready;
}

export interface FinderSearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onMic?: () => void;
  indexBase?: string;
  enableVisual?: boolean;
  maxResults?: number;
}

export function FinderSearchBar({
  placeholder = 'Ask e& or search', onMic, style, indexBase = '/finder/', enableVisual = true, maxResults = 8,
  value, onChange, onFocus, ...rest
}: FinderSearchBarProps) {
  const ready = useFinderReady(indexBase);
  const [q, setQ] = useState(typeof value === 'string' ? value : '');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<FinderEntry[]>([]);
  const [note, setNote] = useState('');
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<string | null>(null); // data URL of an uploaded/pasted/dropped picture
  const [dragging, setDragging] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const tok = useRef(0);

  useEffect(() => { if (typeof value === 'string') setQ(value); }, [value]);

  // close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
  }, []);

  // an image → visual (SigLIP) search; otherwise name search as you type
  useEffect(() => {
    if (!ready) return;
    const t = ++tok.current;
    setActive(-1);
    if (image) {
      setBusy(true); setNote('Searching by image…');
      embedImage(image)
        .then((v) => { if (t !== tok.current) return; const res = semantic(v).slice(0, maxResults); setResults(res); setNote(res.length ? `${res.length} look-alike${res.length === 1 ? '' : 's'} in the libraries` : 'No visual matches'); })
        .catch(() => { if (t === tok.current) setNote('Image search unavailable'); })
        .finally(() => { if (t === tok.current) setBusy(false); });
      return;
    }
    const base = nameSearch(q);
    setResults(base.slice(0, maxResults));
    setNote(q ? `${base.length} match${base.length === 1 ? '' : 'es'}` : '');
  }, [q, image, ready, maxResults]);

  const toURL = (f: File) => new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f); });
  const useImageFile = async (f?: File | null) => { if (!f || !f.type.startsWith('image/')) return; setQ(''); setImage(await toURL(f)); setOpen(true); };
  const clearImage = () => { setImage(null); setOpen(true); if (fileRef.current) fileRef.current.value = ''; };
  const go = (e: FinderEntry) => { const href = e.figma || e.docs; if (href) window.open(href, e.figma ? '_blank' : '_self'); };

  const showPanel = open && (!!image || results.length > 0 || !!note || !ready);
  const acc = color('surface.base.brand');
  const line = color('border.surface-based.canvas.default');
  const muted = color('text.default.muted');

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}
      onDragEnter={(e) => { if (enableVisual) { e.preventDefault(); setDragging(true); } }}
      onDragOver={(e) => { if (enableVisual) e.preventDefault(); }}
      onDragLeave={(e) => { if (enableVisual && !wrapRef.current?.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={async (e) => { if (!enableVisual) return; e.preventDefault(); setDragging(false); await useImageFile([...e.dataTransfer.files].find((x) => x.type.startsWith('image/'))); }}
      onPaste={async (e) => { if (!enableVisual) return; const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith('image/')); if (it) await useImageFile(it.getAsFile()); }}>

      {/* drag-to-search overlay */}
      {dragging && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 52, borderRadius: radius('5'), border: `2px dashed ${acc}`, background: color('surface.base.default'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: space('sm'), color: acc, fontWeight: 600, pointerEvents: 'none', zIndex: 60 }}>
          <Icon name="image" size={20} /> Drop image to search by picture
        </div>
      )}

      {/* field — matches Searchbar, with an image preview + upload control */}
      <span style={{ display: 'flex', alignItems: 'center', gap: space('sm'), height: 52, padding: `0 ${space('lg')}`, borderRadius: radius('5'), background: color('surface.base.default'), width: '100%', boxSizing: 'border-box', boxShadow: dragging ? `0 0 0 2px ${acc}` : undefined, transition: 'box-shadow 120ms', ...style }}>
        {image ? (
          <span style={{ position: 'relative', width: 34, height: 34, flex: '0 0 auto', borderRadius: 8, overflow: 'hidden', boxShadow: `inset 0 0 0 1px ${line}` }}>
            <img src={image} alt="Search image" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <button type="button" aria-label="Remove image" onClick={clearImage}
              style={{ position: 'absolute', top: 0, right: 0, width: 15, height: 15, border: 0, borderRadius: '0 0 0 5px', background: 'rgba(0,0,0,.55)', color: '#fff', fontSize: 11, lineHeight: '13px', cursor: 'pointer', padding: 0 }}>×</button>
          </span>
        ) : (
          <IconBox size="lg"><Icon name="search" size={24} /></IconBox>
        )}
        <input value={q} placeholder={image ? 'Searching by image — type to search text instead' : placeholder}
          onChange={(e) => { if (image) setImage(null); setQ(e.target.value); setOpen(true); onChange?.(e); }}
          onFocus={(e) => { setOpen(true); onFocus?.(e); }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === 'Enter' && active >= 0 && results[active]) { go(results[active]); }
            else if (e.key === 'Escape') { setOpen(false); }
          }}
          style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', ...ty('body.md') }} {...rest} />
        {enableVisual && (
          <>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => { await useImageFile(e.target.files?.[0]); }} />
            <button type="button" title="Search by image — upload a screenshot or picture" aria-label="Search by image"
              onClick={() => fileRef.current?.click()}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 0, color: image ? acc : muted }}>
              <IconBox size="lg"><Icon name="image" size={24} /></IconBox>
            </button>
          </>
        )}
        <button type="button" onClick={onMic} aria-label="Voice search" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: muted }}><IconBox size="lg"><Icon name="mic" size={24} /></IconBox></button>
      </span>

      {showPanel && (
        <div role="listbox" style={{
          position: 'absolute', top: 58, left: 0, right: 0, zIndex: 50, maxHeight: '60vh', overflowY: 'auto',
          background: color('surface.base.default'), border: `1px solid ${line}`, borderRadius: radius('5'),
          boxShadow: '0 12px 34px rgba(20,20,45,.14)', padding: 6,
        }}>
          {!ready && <div style={{ padding: 14, color: muted, fontSize: 13 }}>Loading index…</div>}
          {ready && !image && q === '' && (
            <div style={{ padding: 14, color: muted, fontSize: 13 }}>
              Type to search components, icons &amp; Figma libraries{enableVisual ? ' — or upload / paste an image to search by picture' : ''}.
            </div>
          )}
          {results.map((e, i) => (
            <a key={e.id} href={e.figma || e.docs || '#'} target={e.figma ? '_blank' : undefined} rel="noopener noreferrer"
              onMouseEnter={() => setActive(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 10, textDecoration: 'none',
                color: color('text.default.default'), background: i === active ? color('surface.sunken.default') : 'transparent' }}>
              <span style={{ width: 40, height: 40, flex: '0 0 auto', borderRadius: 9, background: color('surface.sunken.default'), display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {e.thumb ? <img src={indexBase + e.thumb} alt="" style={{ maxWidth: '84%', maxHeight: '84%' }} />
                  : <span style={{ color: acc, fontWeight: 700 }}>{e.name.slice(0, 1).toUpperCase()}</span>}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {e.kind.replace('figma-', 'Figma ')}{e.sub ? ' · ' + e.sub : ''}
                </span>
              </span>
              <span style={{ flex: '0 0 auto', fontSize: 11, fontWeight: 600, color: acc }}>{e.figma ? 'Figma ↗' : 'Docs'}</span>
            </a>
          ))}
          {ready && (q !== '' || image) && results.length === 0 && !busy && <div style={{ padding: 14, color: muted, fontSize: 13 }}>No matches.</div>}
          {(note || busy) && (
            <div style={{ padding: '8px 12px 4px', fontSize: 11, color: muted, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>{busy ? 'Working…' : note}</span>
              {enableVisual && !image && <span style={{ whiteSpace: 'nowrap' }}>drag, paste, or upload an image</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

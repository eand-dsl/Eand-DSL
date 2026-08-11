'use client';
/*
 * Global search dialog = Fumadocs' docs search + an image option.
 * - Text: unchanged Fumadocs docs search (useDocsSearch over /api/search).
 * - Image: click the picture icon, or paste / drop an image → SigLIP runs in the
 *   browser and returns look-alike components/icons across the libraries.
 * Wired via <RootProvider search={{ SearchDialog: … }}> in app/layout.tsx.
 */
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SearchDialog, SearchDialogOverlay, SearchDialogContent, SearchDialogHeader,
  SearchDialogIcon, SearchDialogInput, SearchDialogClose, SearchDialogList,
} from 'fumadocs-ui/components/dialog/search';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { fetchClient } from 'fumadocs-core/search/client/fetch';
import { searchByImage, thumbBase, type FinderEntry } from '@/lib/finder-client';

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const muted = 'var(--color-fd-muted-foreground)';
const border = 'var(--color-fd-border)';
const acc = '#e30613';

export default function SearchDialogWithImage(props: Props) {
  const router = useRouter();
  const client = fetchClient({ api: '/api/search' });
  const { search, setSearch, query } = useDocsSearch({ client });
  const [image, setImage] = useState<string | null>(null);
  const [imgResults, setImgResults] = useState<FinderEntry[] | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tok = useRef(0);

  const toURL = (f: File) => new Promise<string>((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result as string); fr.readAsDataURL(f); });
  async function useFile(f?: File | null) {
    if (!f || !f.type.startsWith('image/')) return;
    const url = await toURL(f);
    setImage(url); setSearch(''); setImgResults(null); setBusy(true);
    const t = ++tok.current;
    try { const res = await searchByImage(url); if (t === tok.current) setImgResults(res.slice(0, 12)); }
    catch { if (t === tok.current) setImgResults([]); }
    finally { if (t === tok.current) setBusy(false); }
  }
  function clearImage() { setImage(null); setImgResults(null); if (fileRef.current) fileRef.current.value = ''; }
  function goto(e: FinderEntry) {
    if (!e.docs) return; // only ever open pages inside the react library
    props.onOpenChange(false);
    router.push(e.docs);
  }

  return (
    <SearchDialog search={search} onSearchChange={(v) => { if (image) clearImage(); setSearch(v); }} isLoading={busy || query.isLoading} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent
        onPaste={async (e) => { const it = [...(e.clipboardData?.items || [])].find((x) => x.type.startsWith('image/')); if (it) await useFile(it.getAsFile()); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => { e.preventDefault(); await useFile([...e.dataTransfer.files].find((x) => x.type.startsWith('image/'))); }}>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput placeholder={image ? 'Searching by image — clear to search docs' : 'Search docs, or upload an image…'} />
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => useFile(e.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()} aria-label="Search by image" title="Search by image — upload, paste, or drop a picture"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: image ? acc : muted, flex: '0 0 auto' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.6" /><path d="m21 15-4.5-4.5L7 20" /></svg>
          </button>
          <SearchDialogClose />
        </SearchDialogHeader>

        {image ? (
          <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 10px' }}>
              <img src={image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', boxShadow: `inset 0 0 0 1px ${border}` }} />
              <span style={{ fontSize: 13, color: muted, flex: 1 }}>{busy ? 'Searching by image…' : `Matching components in the library`}</span>
              <button type="button" onClick={clearImage} style={{ fontSize: 12, fontWeight: 600, color: acc, background: 'transparent', border: 0, cursor: 'pointer' }}>Clear</button>
            </div>
            {imgResults?.map((e) => (
              <button key={e.id} type="button" onClick={() => goto(e)}
                onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--color-fd-accent)')}
                onMouseLeave={(ev) => (ev.currentTarget.style.background = 'transparent')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-fd-foreground)' }}>
                <span style={{ width: 38, height: 38, flex: '0 0 auto', borderRadius: 8, background: 'var(--color-fd-muted)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                  {e.thumb ? <img src={thumbBase + e.thumb} alt="" style={{ maxWidth: '84%', maxHeight: '84%' }} /> : <span style={{ color: acc, fontWeight: 700 }}>{e.name.slice(0, 1).toUpperCase()}</span>}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</span>
                  <span style={{ display: 'block', fontSize: 11, color: muted }}>{e.kind.replace('figma-', 'Figma ')}{e.sub ? ' · ' + e.sub : ''}</span>
                </span>
                <span style={{ flex: '0 0 auto', fontSize: 11, fontWeight: 600, color: acc }}>Docs</span>
              </button>
            ))}
            {!busy && imgResults && imgResults.length === 0 && <div style={{ padding: 14, color: muted, fontSize: 13 }}>No visual matches.</div>}
          </div>
        ) : (
          <SearchDialogList items={query.data !== 'empty' ? query.data : null} />
        )}
      </SearchDialogContent>
    </SearchDialog>
  );
}

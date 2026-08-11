/*
 * finder-client — tiny, self-contained search engine for the docs app's global
 * search dialog. Reads the prebuilt static index (/finder/*) and runs SigLIP in
 * the browser for image search. Loaded lazily: the 1.9MB index + the model are
 * only fetched the first time someone actually searches by image, so plain text
 * (docs) search stays instant. Kept local to apps/docs so the component library
 * package is not touched.
 */
export type FinderEntry = {
  id: string; kind: string; name: string; sub?: string; desc?: string;
  tags?: string[]; docs?: string | null; figma?: string | null; thumb?: string | null; emb?: number | null;
};

const BASE = '/finder/';
const MODEL = 'Xenova/siglip-base-patch16-224';
// hide the CDN URL from the bundler so it isn't resolved at build time
const cdnImport = (u: string): Promise<any> => (new Function('u', 'return import(u)') as any)(u);
const l2 = (v: number[]) => { let n = 0; for (const x of v) n += x * x; n = Math.sqrt(n) || 1; return v.map((x) => x / n); };

let entries: FinderEntry[] | null = null;
let dim = 0;
let emb: Float32Array | null = null;
let loadP: Promise<void> | null = null;

function load(): Promise<void> {
  if (entries) return Promise.resolve();
  if (loadP) return loadP;
  loadP = (async () => {
    const [i, m, b] = await Promise.all([
      fetch(BASE + 'index.json').then((r) => r.json()),
      fetch(BASE + 'embed-meta.json').then((r) => r.json()).catch(() => ({ dim: 0 })),
      fetch(BASE + 'embeddings.f32').then((r) => r.arrayBuffer()).catch(() => new ArrayBuffer(0)),
    ]);
    entries = i; dim = m.dim || 0; emb = new Float32Array(b);
  })();
  return loadP;
}

export const thumbBase = BASE;

export function nameSearch(query: string): FinderEntry[] {
  const list = entries || [];
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
    if (e.kind === 'component') s += 5; else if (e.kind === 'icon') s += 3;
    out.push([s, e]);
  }
  out.sort((a, b) => b[0] - a[0]);
  return out.map((x) => x[1]);
}

function semantic(qvec: number[]): FinderEntry[] {
  const E = emb, D = dim, list = entries || [];
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

let clip: any = null;
let clipP: Promise<any> | null = null;
function ensureModel(): Promise<any> {
  if (clip) return Promise.resolve(clip);
  if (clipP) return clipP;
  clipP = (async () => {
    const T = await cdnImport('https://esm.sh/@huggingface/transformers@3.0.0');
    clip = {
      processor: await T.AutoProcessor.from_pretrained(MODEL),
      vision: await T.SiglipVisionModel.from_pretrained(MODEL),
      RawImage: T.RawImage,
    };
    return clip;
  })();
  return clipP;
}

/**
 * Search by a picture (data URL). Loads the index + model lazily.
 * Scoped to the REACT LIBRARY only — returns just the library's own
 * components/icons (which open at their docs pages). The cross-library Figma
 * finder is a separate thing, living on the /finder page.
 */
export async function searchByImage(dataURL: string): Promise<FinderEntry[]> {
  await load();
  const c = await ensureModel();
  const img = await c.RawImage.fromURL(dataURL);
  const { pooler_output } = await c.vision(await c.processor(img));
  const ranked = semantic(l2(pooler_output.tolist()[0]));
  return ranked.filter((e) => !!e.docs && (e.kind === 'component' || e.kind === 'icon'));
}

/** Search components/icons/Figma by name. Loads the index lazily. */
export async function searchByName(query: string): Promise<FinderEntry[]> {
  await load();
  return nameSearch(query);
}

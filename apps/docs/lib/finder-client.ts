/*
 * finder-client — the one search engine behind the docs site's component finder.
 *
 * It lives in the docs app, not in @eand/react-design-system, deliberately. The finder
 * is a feature of the live site (eand-dsl.vercel.app), and it needs a prebuilt static
 * index that a Figma Make app will never serve. Shipping it inside the package would
 * put a component that fetches `/finder/index.json` into the Make kit, where the fetch
 * can only 404 — a green library producing a broken screen.
 *
 * Two tiers, both entirely in the browser:
 *   1. name / description / alias match — instant, no model, runs as you type.
 *   2. search by image — a SigLIP vision model (transformers.js, from a CDN) embeds the
 *      picture and ranks the index by cosine similarity. Loaded on first use only.
 *
 * Everything it reads is static (`/finder/*`), so the site deploys with no server model.
 *
 * The ranking helpers (`rankByName`, `rankByVector`, `l2`) are pure and exported for
 * `finder-client.test.ts`; the loaders below hold the only mutable state.
 */
export type FinderEntry = {
  id: string; kind: string; name: string; sub?: string; desc?: string;
  tags?: string[]; docs?: string | null; figma?: string | null; thumb?: string | null; emb?: number | null;
};

/** A loaded index: the entries plus the embedding matrix they point into. */
export interface FinderIndex {
  entries: FinderEntry[];
  /** Embedding width. 0 when no embeddings shipped — visual search is then a no-op. */
  dim: number;
  /** Row-major `count × dim`; `entry.emb` is the row number. */
  emb: Float32Array;
}

const BASE = '/finder/';
const MODEL = 'Xenova/siglip-base-patch16-224';

/** Thumbnails in the index are stored relative to the index itself. */
export const thumbBase = BASE;

// Hide the CDN URL from the bundler (webpack/turbopack) so it isn't resolved at build
// time — transformers.js must stay a runtime fetch, never a package dependency.
const cdnImport = (u: string): Promise<any> => (new Function('u', 'return import(u)') as any)(u);

/** Unit-normalise, so a dot product against the (already unit-norm) rows is a cosine. */
export const l2 = (v: number[]): number[] => {
  let n = 0;
  for (const x of v) n += x * x;
  n = Math.sqrt(n) || 1;
  return v.map((x) => x / n);
};

/* ---------------- index loading ---------------- */

// `base` is held beside the index, not on it, so the cached and freshly-loaded calls
// return the identical object.
let cache: { base: string; index: FinderIndex } | null = null;
let inflight: { base: string; p: Promise<FinderIndex> } | null = null;

async function fetchJSON(url: string): Promise<any> {
  const r = await fetch(url);
  // Without this, a 404 whose body is an HTML error page fails as a JSON parse error,
  // which reads as a corrupt index rather than a missing one.
  if (!r.ok) throw new Error(`${url} → HTTP ${r.status}`);
  return r.json();
}

/**
 * Fetch (once) the static index. Rejections are deliberately NOT cached: a single
 * transient 503 must not disable the finder for the life of the page, so the next call
 * retries. `embed-meta`/`embeddings` are optional — without them tier 1 still works.
 */
export function loadIndex(base: string = BASE): Promise<FinderIndex> {
  if (cache && cache.base === base) return Promise.resolve(cache.index);
  if (inflight && inflight.base === base) return inflight.p;

  const p = (async (): Promise<FinderIndex> => {
    const [entries, meta, embBuf] = await Promise.all([
      fetchJSON(base + 'index.json'),
      fetchJSON(base + 'embed-meta.json').catch(() => ({ dim: 0 })),
      fetch(base + 'embeddings.f32')
        .then((r) => (r.ok ? r.arrayBuffer() : new ArrayBuffer(0)))
        .catch(() => new ArrayBuffer(0)),
    ]);
    const index: FinderIndex = {
      entries: entries as FinderEntry[],
      dim: meta?.dim || 0,
      emb: new Float32Array(embBuf),
    };
    cache = { base, index };
    return index;
  })();

  const rec = { base, p };
  inflight = rec;
  // Clear the slot on failure. Keeping the rejected promise is what turned one bad
  // response into a finder stuck on "Loading index…" with no way back but a reload.
  p.catch(() => { if (inflight === rec) inflight = null; });
  return p;
}

/** Drop all cached state — index, and the loaded model. For tests. */
export function resetFinderCache(): void {
  cache = null;
  inflight = null;
  clip = null;
  clipInflight = null;
}

/* ---------------- tier 1: name search ---------------- */

/**
 * Rank by name/description/alias overlap. Every term must appear somewhere in the
 * entry; the score then rewards matches on the *name* over the description, and the
 * library's own components/icons over the raw Figma lanes.
 */
export function rankByName(entries: FinderEntry[], query: string): FinderEntry[] {
  const ql = query.toLowerCase().trim();
  const terms = ql.split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const out: [number, FinderEntry][] = [];
  for (const e of entries) {
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

/* ---------------- tier 2: visual search ---------------- */

/**
 * Rank by cosine similarity against a query vector. Both sides are unit-norm — the
 * generator writes normalised rows and `l2` normalises the query — so the dot product
 * IS the cosine. `finder-client.test.ts` asserts the stored rows still hold that.
 */
export function rankByVector(index: FinderIndex, qvec: number[]): FinderEntry[] {
  const { emb, dim, entries } = index;
  if (!emb.length || !dim) return [];
  const scored: [number, FinderEntry][] = [];
  for (const e of entries) {
    if (e.emb == null) continue;
    const o = e.emb * dim;
    let s = 0;
    for (let d = 0; d < dim; d++) s += qvec[d] * emb[o + d];
    scored.push([s, e]);
  }
  scored.sort((a, b) => b[0] - a[0]);
  return scored.map((x) => x[1]);
}

let clip: any = null;
let clipInflight: Promise<any> | null = null;

function ensureModel(): Promise<any> {
  if (clip) return Promise.resolve(clip);
  if (clipInflight) return clipInflight;
  const p = (async () => {
    const T = await cdnImport('https://esm.sh/@huggingface/transformers@3.0.0');
    clip = {
      processor: await T.AutoProcessor.from_pretrained(MODEL),
      vision: await T.SiglipVisionModel.from_pretrained(MODEL),
      RawImage: T.RawImage,
    };
    return clip;
  })();
  clipInflight = p;
  // Same reasoning as the index: one CDN hiccup must not permanently disable image
  // search, so a failed load is not remembered.
  p.catch(() => { if (clipInflight === p) clipInflight = null; });
  return p;
}

export interface SearchOptions {
  /** Restrict to these entry kinds. Omit for every lane (React + Figma). */
  kinds?: string[];
  /** Keep only entries that have a docs page. */
  requireDocs?: boolean;
  /** Truncate the ranked list. */
  limit?: number;
  /** Override the index location (defaults to `/finder/`). */
  base?: string;
}

function narrow(list: FinderEntry[], opts: SearchOptions): FinderEntry[] {
  let out = list;
  if (opts.kinds) out = out.filter((e) => opts.kinds!.includes(e.kind));
  if (opts.requireDocs) out = out.filter((e) => !!e.docs);
  return opts.limit == null ? out : out.slice(0, opts.limit);
}

/** Search by a picture (data URL). Loads the index and the model lazily. */
export async function searchByImage(dataURL: string, opts: SearchOptions = {}): Promise<FinderEntry[]> {
  const index = await loadIndex(opts.base);
  const c = await ensureModel();
  const img = await c.RawImage.fromURL(dataURL);
  const { pooler_output } = await c.vision(await c.processor(img));
  return narrow(rankByVector(index, l2(pooler_output.tolist()[0])), opts);
}

/** Search components/icons/Figma by name. Loads the index lazily. */
export async function searchByName(query: string, opts: SearchOptions = {}): Promise<FinderEntry[]> {
  const index = await loadIndex(opts.base);
  return narrow(rankByName(index.entries, query), opts);
}

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  l2, loadIndex, rankByName, rankByVector, resetFinderCache, searchByName,
  type FinderEntry, type FinderIndex,
} from './finder-client';

const entry = (p: Partial<FinderEntry> & { id: string; name: string }): FinderEntry =>
  ({ kind: 'component', ...p });

const ENTRIES: FinderEntry[] = [
  entry({ id: 'c:button', name: 'Button', desc: 'Primary action', tags: ['cta'], docs: '/docs/components/button' }),
  entry({ id: 'c:button-group', name: 'Button Group', docs: '/docs/components/button-group' }),
  entry({ id: 'i:search', name: 'search', kind: 'icon', desc: 'Magnifier', docs: '/docs/foundations/icons' }),
  entry({ id: 'f:1', name: 'Button', kind: 'figma-component', figma: 'https://figma.com/x', docs: null }),
];

afterEach(() => {
  resetFinderCache();
  vi.unstubAllGlobals();
});

describe('rankByName', () => {
  it('returns nothing for an empty query', () => {
    expect(rankByName(ENTRIES, '   ')).toEqual([]);
  });

  it('ranks an exact name match above a prefix match', () => {
    const [first] = rankByName(ENTRIES, 'Button');
    expect(first.name).toBe('Button');
    expect(first.kind).toBe('component'); // the DSL's own, not the Figma lane
  });

  it('prefers the library lane over the raw Figma lane at equal name score', () => {
    const kinds = rankByName(ENTRIES, 'Button').map((e) => e.kind);
    expect(kinds.indexOf('component')).toBeLessThan(kinds.indexOf('figma-component'));
  });

  it('requires every term to appear somewhere in the entry', () => {
    expect(rankByName(ENTRIES, 'button nonsense')).toEqual([]);
    expect(rankByName(ENTRIES, 'button group').map((e) => e.id)).toEqual(['c:button-group']);
  });

  it('matches on description and tags, not just the name', () => {
    expect(rankByName(ENTRIES, 'magnifier').map((e) => e.id)).toEqual(['i:search']);
    expect(rankByName(ENTRIES, 'cta').map((e) => e.id)).toEqual(['c:button']);
  });
});

describe('l2 / rankByVector', () => {
  it('normalises to unit length', () => {
    const v = l2([3, 4]);
    expect(Math.hypot(...v)).toBeCloseTo(1, 12);
  });

  it('survives a zero vector instead of dividing by zero', () => {
    expect(l2([0, 0])).toEqual([0, 0]);
  });

  it('ranks by cosine and skips entries with no embedding', () => {
    const index: FinderIndex = {
      entries: [
        entry({ id: 'a', name: 'A', emb: 0 }),
        entry({ id: 'b', name: 'B', emb: 1 }),
        entry({ id: 'c', name: 'C', emb: null }),
      ],
      dim: 2,
      emb: new Float32Array([1, 0, 0, 1]),
    };
    expect(rankByVector(index, [0, 1]).map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('is a no-op when the index shipped no embeddings', () => {
    const index: FinderIndex = { entries: ENTRIES, dim: 0, emb: new Float32Array(0) };
    expect(rankByVector(index, [1])).toEqual([]);
  });
});

/** Minimal fetch stub over the three files loadIndex asks for. */
function stubFetch(handler: (url: string) => { ok: boolean; body?: unknown; status?: number }) {
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    calls.push(url);
    const r = handler(url);
    return {
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 500),
      json: async () => r.body,
      arrayBuffer: async () => new ArrayBuffer(0),
    };
  }));
  return calls;
}

describe('loadIndex', () => {
  const ok = (url: string) =>
    url.endsWith('index.json') ? { ok: true, body: ENTRIES }
      : url.endsWith('embed-meta.json') ? { ok: true, body: { dim: 0 } }
        : { ok: true };

  it('fetches once and caches the result', async () => {
    const calls = stubFetch(ok);
    const a = await loadIndex();
    const b = await loadIndex();
    expect(a).toBe(b);
    expect(calls.filter((u) => u.endsWith('index.json'))).toHaveLength(1);
  });

  it('rejects on a non-OK index response instead of parsing the error page', async () => {
    stubFetch((url) => (url.endsWith('index.json') ? { ok: false, status: 404 } : { ok: true, body: { dim: 0 } }));
    await expect(loadIndex()).rejects.toThrow(/404/);
  });

  // The regression that mattered most: a rejected promise used to be cached, so one
  // transient failure disabled the finder for the life of the page.
  it('retries after a failure rather than caching the rejection', async () => {
    let attempt = 0;
    stubFetch((url) => {
      if (url.endsWith('index.json')) {
        attempt++;
        return attempt === 1 ? { ok: false, status: 503 } : { ok: true, body: ENTRIES };
      }
      return { ok: true, body: { dim: 0 } };
    });

    await expect(loadIndex()).rejects.toThrow(/503/);
    const recovered = await loadIndex();
    expect(recovered.entries).toHaveLength(ENTRIES.length);
    expect(attempt).toBe(2);
  });

  it('still serves name search when the embeddings are missing', async () => {
    stubFetch((url) => (url.endsWith('index.json') ? { ok: true, body: ENTRIES } : { ok: false, status: 404 }));
    const index = await loadIndex();
    expect(index.dim).toBe(0);
    expect(rankByName(index.entries, 'button').length).toBeGreaterThan(0);
  });
});

describe('searchByName options', () => {
  it('filters by kind, requires docs, and honours the limit', async () => {
    stubFetch((url) =>
      url.endsWith('index.json') ? { ok: true, body: ENTRIES }
        : url.endsWith('embed-meta.json') ? { ok: true, body: { dim: 0 } }
          : { ok: true });

    const all = await searchByName('button');
    expect(all.some((e) => e.kind === 'figma-component')).toBe(true);

    const scoped = await searchByName('button', { kinds: ['component'], requireDocs: true });
    expect(scoped.every((e) => e.kind === 'component' && e.docs)).toBe(true);

    expect(await searchByName('button', { limit: 1 })).toHaveLength(1);
  });
});

// Guards the invariant the whole visual ranking rests on. If a future index is written
// with unnormalised rows, the dot product stops being a cosine and the ranking silently
// degrades — no error, no type failure.
describe('the committed finder index', () => {
  const at = (p: string) => fileURLToPath(new URL(`../public/finder/${p}`, import.meta.url));
  const meta = JSON.parse(readFileSync(at('embed-meta.json'), 'utf8'));
  const entries: FinderEntry[] = JSON.parse(readFileSync(at('index.json'), 'utf8'));
  const buf = readFileSync(at('embeddings.f32'));
  const mat = new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4);

  it('has a row count matching embed-meta', () => {
    expect(meta.dim).toBeGreaterThan(0);
    expect(mat.length / meta.dim).toBe(meta.count);
    expect(meta.ids).toHaveLength(meta.count);
  });

  it('stores every row unit-normalised, so a dot product is a cosine', () => {
    for (let r = 0; r < meta.count; r++) {
      let n = 0;
      for (let d = 0; d < meta.dim; d++) { const x = mat[r * meta.dim + d]; n += x * x; }
      expect(Math.sqrt(n)).toBeCloseTo(1, 4);
    }
  });

  it('never points an entry at a row outside the matrix', () => {
    for (const e of entries) {
      if (e.emb == null) continue;
      expect(e.emb).toBeGreaterThanOrEqual(0);
      expect(e.emb).toBeLessThan(meta.count);
    }
  });
});

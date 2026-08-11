/*
 * build-finder-index.mjs — build a unified, static search index for the DSL docs.
 * Merges: React components (MDX frontmatter) + React icons (ICON_META) + the Figma
 * component index (from ~/figma-component-finder), cross-linked by name.
 *
 * Output (all STATIC — Vercel just serves them; no server model):
 *   apps/docs/public/finder/index.json        — every searchable entry (name/tags/links)
 *   apps/docs/public/finder/embeddings.f32     — SigLIP vectors for entries that have one
 *   apps/docs/public/finder/embed-meta.json    — { dim, ids } aligned to embeddings.f32
 *   apps/docs/public/finder/thumbs/<id>.png    — thumbnails for the DSL's own entries
 *
 * Run:  node tools/build-finder-index.mjs   (needs ~/figma-component-finder built)
 */
import fs from 'fs';
import path from 'path';
import os from 'os';

const REPO = path.resolve(import.meta.dirname, '..');
const FIN = path.join(os.homedir(), 'figma-component-finder');
const FDATA = path.join(FIN, 'public', 'data');
const OUT = path.join(REPO, 'apps', 'docs', 'public', 'finder');
const OUTTHUMBS = path.join(OUT, 'thumbs');
fs.mkdirSync(OUTTHUMBS, { recursive: true });

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// ---- 1. Figma index + embeddings -----------------------------------------
const figComps = fs.existsSync(path.join(FDATA, 'components.json')) ? readJSON(path.join(FDATA, 'components.json')) : [];
const figIcons = fs.existsSync(path.join(FDATA, 'icons.json')) ? readJSON(path.join(FDATA, 'icons.json')) : [];
const embMeta = readJSON(path.join(FDATA, 'img-embed-meta.json'));
const DIM = embMeta.dim;
const embBuf = fs.readFileSync(path.join(FDATA, 'img-embeddings.f32'));
const embMat = new Float32Array(embBuf.buffer, embBuf.byteOffset, embBuf.byteLength / 4);
const rowByKey = new Map(); embMeta.ids.forEach((k, i) => rowByKey.set(k, i));
const vecFor = (k) => { const r = rowByKey.get(k); return r == null ? null : embMat.subarray(r * DIM, (r + 1) * DIM); };

// cross-link maps: normalized name -> best Figma item (prefer one with an embedding + thumb)
const compByName = new Map(), iconByName = new Map();
const addTo = (map, it) => { const n = norm(it.n); if (!n) return; if (!map.has(n)) map.set(n, it); };
for (const it of figComps) addTo(compByName, it);
for (const it of figIcons) addTo(iconByName, it);

// ---- 2. React icons (ICON_META) ------------------------------------------
const metaSrc = fs.readFileSync(path.join(REPO, 'packages/react-design-system/src/icons/metadata.ts'), 'utf8');
const metaObj = (() => {
  const o = {}; // line-based parse — robust to trailing commas / TS wrapper
  for (const line of metaSrc.split('\n')) {
    const m = line.match(/^\s*"([^"]+)"\s*:\s*(\{.*\})\s*,?\s*$/);
    if (m) { try { o[m[1]] = JSON.parse(m[2]); } catch {} }
  }
  return o;
})();
const iconNames = Object.keys(metaObj);

// ---- 3. React components (MDX frontmatter + meta.json groups) -------------
const CDOCS = path.join(REPO, 'apps/docs/content/docs/components');
const metaPages = readJSON(path.join(CDOCS, 'meta.json')).pages || [];
const groupOf = {}; let curGroup = 'Components';
for (const p of metaPages) { const g = p.match(/^---(.+)---$/); if (g) curGroup = g[1].trim(); else groupOf[p] = curGroup; }
const compFiles = fs.readdirSync(CDOCS).filter((f) => f.endsWith('.mdx'));
const fmField = (src, k) => { const m = src.match(new RegExp('^' + k + ':\\s*(.+)$', 'm')); return m ? m[1].trim().replace(/^["']|["']$/g, '') : ''; };

// ---- 4. Build unified entries + collect embeddings ------------------------
const entries = [];
const embIds = []; const embVecs = [];
let thumbCopied = 0;
const linkedKeys = new Set(); // Figma keys already represented by a React entry
function copyThumb(figItem, id) {
  if (!figItem || !figItem.th) return null;
  const src = path.join(FIN, 'public', figItem.th); // thumbs/xxx.png
  // sanitize the filename (ids contain ':' which is illegal on Windows checkouts)
  const safe = id.replace(/[^a-z0-9._-]+/gi, '_');
  const dest = path.join(OUTTHUMBS, safe + '.png');
  try { fs.copyFileSync(src, dest); thumbCopied++; return 'thumbs/' + safe + '.png'; } catch { return null; }
}
function attachEmb(figItem, id) {
  const v = figItem && figItem.k ? vecFor(figItem.k) : null;
  if (!v) return null;
  embIds.push(id); embVecs.push(Array.from(v)); return embIds.length - 1;
}

// 4a. React components
for (const f of compFiles) {
  const id = f.replace(/\.mdx$/, ''); if (id === 'meta') continue;
  const src = fs.readFileSync(path.join(CDOCS, f), 'utf8');
  const title = fmField(src, 'title') || id;
  const desc = fmField(src, 'description');
  const fig = compByName.get(norm(title)); if (fig) linkedKeys.add(fig.k);
  const eid = 'c:' + id;
  const thumb = copyThumb(fig, eid);
  const emb = attachEmb(fig, eid);
  entries.push({ id: eid, kind: 'component', name: title, sub: groupOf[id] || 'Components', desc,
    tags: fig?.g || [], docs: '/docs/components/' + id, figma: fig?.u || null, thumb, emb });
}

// 4b. React icons
for (const name of iconNames) {
  const meta = metaObj[name] || {};
  const fig = iconByName.get(norm(name)); if (fig) linkedKeys.add(fig.k);
  const eid = 'i:' + name;
  const thumb = copyThumb(fig, eid);
  const emb = attachEmb(fig, eid);
  entries.push({ id: eid, kind: 'icon', name, sub: 'Icon', desc: meta.description || '',
    tags: meta.aliases || [], icon: name, docs: '/docs/foundations/icons', figma: fig?.u || null, thumb, emb });
}

// 4c. remaining Figma entries (name/keyword searchable; linked to Figma; no shipped thumb)
for (const [lane, arr] of [['figma-component', figComps], ['figma-icon', figIcons]]) {
  for (const it of arr) {
    if (linkedKeys.has(it.k)) continue; // already represented by a React entry
    entries.push({ id: 'f:' + it.k, kind: lane, name: it.n, sub: it.l, desc: '',
      tags: it.g || [], page: it.pg || '', docs: null, figma: it.u || null, thumb: null, emb: null, lib: it.l });
  }
}

// ---- 5. write outputs -----------------------------------------------------
const dim = DIM;
const flat = new Float32Array(embVecs.length * dim);
embVecs.forEach((v, i) => flat.set(v, i * dim));
fs.writeFileSync(path.join(OUT, 'embeddings.f32'), Buffer.from(flat.buffer));
fs.writeFileSync(path.join(OUT, 'embed-meta.json'), JSON.stringify({ model: embMeta.model, dim, count: embIds.length, ids: embIds }));
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(entries));

const byKind = {}; for (const e of entries) byKind[e.kind] = (byKind[e.kind] || 0) + 1;
const sz = (f) => (fs.statSync(path.join(OUT, f)).size / 1e6).toFixed(2) + ' MB';
console.log('entries:', entries.length, byKind);
console.log('with embedding (visual-searchable):', embIds.length, '· thumbnails copied:', thumbCopied);
console.log('sizes → index.json', sz('index.json'), '| embeddings.f32', sz('embeddings.f32'));
console.log('wrote', path.relative(REPO, OUT));

# Icons Gallery: Outline/Filled Toggle + Descriptions

**Date:** 2026-07-17
**Status:** Approved

## Goal

Upgrade the docs icons page (`/docs/foundations/icons`) so that:

1. Each icon *concept* is shown once (198 tiles instead of 396), with a per-tile
   toggle to switch between its outline and filled variant — mirroring the
   `filled` variant toggle in the Figma icon library.
2. Every tile shows the icon's description, sourced from the Figma component-set
   descriptions in the e& Consumer App DSL file (`icons_2d` section, node
   `31965:64761`).
3. Search matches names, descriptions, and the "Also searchable as:" aliases
   (e.g. typing `flag` finds `bookmark`).

## Background facts (verified)

- `@eand/icons` contains 396 icons: 198 outline (`bookmark`) + 198 filled
  (`bookmark-filled`). Pairing is exact 1:1 — every `-filled` key has a base key
  and vice versa. Pairs are derivable from `ICONS` keys alone.
- The Figma `icons_2d` section contains exactly 198 component sets, one per
  concept, each with `filled=off` / `filled=on` variants. Names match the
  package base names.
- Descriptions live as Figma component-set descriptions, in the form:
  `"Saved items, favorites, reading list. Also searchable as: banner, flag,
  tag, save, …"`. They are not present in layout metadata; they must be read
  via `use_figma` (`node.description` on each `COMPONENT_SET`).

## Design

### 1. Metadata extraction (one-time sync script)

A `use_figma` script iterates the `icons_2d` section, collects every
`COMPONENT_SET` (name + description), and parses each description:

- Split on `Also searchable as:` (case-insensitive).
- Head → `description` (trimmed).
- Tail → `aliases`: comma-separated, trimmed, lowercased, empties dropped.
- Blank/missing description → `{ description: "", aliases: [] }`; the affected
  names are reported to the user, never fabricated.

Output is written to `packages/icons/src/metadata.json`:

```json
{
  "bookmark": {
    "description": "Saved items, favorites, reading list.",
    "aliases": ["banner", "flag", "tag", "save"]
  }
}
```

Keys are base names only (no `-filled` entries). This file is a checked-in
generated artifact, like the generated `icons.tsx` — the docs app has no
runtime or build-time Figma dependency.

### 2. Package changes (`@eand/icons`)

- Add `src/metadata.json` (generated above).
- Export from `src/index.ts`:

```ts
export interface IconMeta { description: string; aliases: string[] }
export const ICON_META: Record<string, IconMeta>
```

- `resolveJsonModule` enabled in the package tsconfig if not already.
- No changes to `Icon`, `ICONS`, or the generated components.

### 3. Docs gallery (`apps/docs/components/preview/icons-browser.tsx`)

Rework `IconGallery` (still a single client component):

- **Tiles:** one per base concept — `Object.keys(ICONS).filter(k =>
  !k.endsWith('-filled')).sort()`.
- **Per-tile state:** `filled: boolean` (default `false`), held in a
  `Record<string, boolean>` (or per-tile component state). The tile renders
  `<Icon name={filled ? `${base}-filled` : base} />` and a compact
  `outline | filled` segmented toggle.
- **Tile layout:** icon preview, toggle, name, description text (clamped to a
  few lines). Wider grid cells (`minmax(~200px, 1fr)`) to fit descriptions.
  Styling consistent with existing `preview.css` / theme variables.
- **Copy:** clicking the name (or the tile's copy affordance) copies the
  *current variant* key — `bookmark` when outline, `bookmark-filled` when
  filled — keeping the existing "copied!" flash behavior.
- **Search:** query matches against base name, description text, and aliases
  (all lowercased substring match). Result count reflects filtered concepts.
- Icons with no metadata entry render name-only (no description block).

### 4. Content (`apps/docs/content/docs/foundations/icons.mdx`)

Copy tweak: note that every icon ships outline + filled variants
(`name` / `name-filled`), each tile has a variant toggle, and descriptions +
search aliases come from the Figma library. `<IconGallery />` usage unchanged.

## Out of scope

- No global (page-level) filled toggle.
- No changes to the `Icon` component API or SVG build pipeline.
- No automated re-sync of descriptions (manual re-run of the extraction, same
  as the existing SVG sync).

## Error handling

- Extraction reports any component set whose name doesn't match a package base
  name (and vice versa) instead of silently dropping it.
- Blank descriptions: tile renders without a description; extraction output
  lists them.
- `metadata.json` missing a key at runtime → gallery falls back to name-only
  tile (guard with `ICON_META[base] ?? { description: '', aliases: [] }`).

## Testing

- `npm run typecheck` in `packages/icons`; rebuild package.
- Docs dev server: verify tile count is 198, toggle flips variants per-tile,
  copy yields variant-aware names, search by alias (`flag` → bookmark) works,
  and the page renders correctly in light/dark themes.

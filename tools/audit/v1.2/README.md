# V1.2 reconciliation audit — brief

Read-only sweep of the **e& Consumer App DSL V1.2** Figma library against
`packages/react-design-system` (55 exported components). Produces the worklist for a
V1.2 migration; **no component code is changed by this audit.**

## Why this exists

The library was last reconciled against **V1.1**. Since then the Figma library has been
republished as **V1.2** (`get_libraries` on the DSL file lists
`e& Consumer App DSL V1.2` as the only subscribed team library), and the code's
Figma-derived inputs have gone stale:

| Input | Last refreshed |
| --- | --- |
| `variables.json` + `src/tokens/tokens.ts` | 2026-08-05 |
| `src/icons/icons.tsx` | 2026-07-24 |

`tools/audit/v1.1/` is the prior map. It is **provably stale in places** — treat it as
"where to look", never as a worklist.

## File key

`pzm63BTLfPfT1stcF89ILQ` — the DSL file. Note `get_metadata` with no `nodeId`
under-reports (it lists only the Cover page); pass an explicit node id.

## Source-of-truth order

**published symbol + bound variable > statesheet prose > anatomy `.md` > audit table.**

## Known V1.2 drift pattern — token renames

`navbar-tab` renamed **`focus` → `selected`** and **deleted `focus-special`**:

- live V1.2: `color/navbar-tab/surface/selected`, `text/selected`, `text/default`
- local snapshot: `navbarTab.surface.focus`, `.focusSpecial`, `text.focus`, `.focusSpecial`

Assume other families renamed the same way. A missed rename is invisible: `color()`
returns its argument when a path misses, which ships as invalid CSS that browsers drop
**silently** — no error, no failing test. Record every binding you cannot resolve.

## Verdict vocabulary

`OK` · `VISUAL-DRIFT` · `VARIANT-DRIFT` · `TOKEN-DRIFT` · `STALE-ANATOMY` ·
`MISSING-IN-CODE` · `NEW-IN-FIGMA` · `REMOVED-IN-FIGMA`

## Table schema (same as V1.1, plus NEW-IN-FIGMA)

| Component | Figma node (V1.2) | Flag | Figma spec | Code (export/props) | Verdict | Action |

## Rules for this audit

1. **Read-only.** Write only your own `tools/audit/v1.2/*.md` file. Do not touch
   `src/`, `demo/`, `MAKE_KIT_GUIDELINES.md`, `variables.json`, or any generated file.
2. **Do not run** `tokens:pull`, `build-icons.py`, `kit:release`, or any `npm publish`.
3. `guidelines-facts.json` is a **stale committed snapshot** — do not trust it. Read
   component source directly, or regenerate facts in a scratch dir.
4. Cite node ids for every claim. If Figma and the V1.1 audit disagree, Figma wins and
   you say so.
5. Where design has to rule, do not invent an answer — record it as an open question.

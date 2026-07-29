# V1.1 Atom-Tree Gap Report

**Phase 1 of the DS reconciliation.** Records, per component, the axis and atom tree Figma
actually exposes versus what the React library models.

- **Figma read from:** `m8r6Q0MSCDxtSn8vF3u0xw` (the de-dotted copy) — a reading lens only.
- **Code Connect targets:** `pzm63BTLfPfT1stcF89ILQ` (the published original). Node IDs are
  identical between the two files; **layer names are not** (see Caveats).
- **Method:** every value below was read off its own variant node. Reading a component
  **set** returns the union of its variants, which is exactly how a flattened axis hides.

## Why per-variant reads are non-negotiable

Three findings that a set-level read would have missed, and that the audit's one-value-per-
component drift table actively obscured:

| Finding | What a set-level read shows | Truth |
|---|---|---|
| Tooltip radius | one radius | **4 / 12 / 20** by `Size` |
| card-bg-color tints | 8 tints, names match tokens | variant `cyan`→token `blue`, variant `blue`→token `purple` |
| Grabber fill | two glass tokens | one per `Display`; Light≠Dark |

The audit said "Tooltip: fix radius 8→12". That is true only for `Standard`. Applying it
flat was wrong for two of three variants.

---

## Reconciled (axis modelled + tests pinning it)

| Component | Figma node | Axis in Figma | Was in code |
|---|---|---|---|
| `Tooltip` | 33202:6649 | `Size` simple\|standard\|rich; `Surface` default\|dark; 4-way caret | one flat radius, dark-only, top/bottom |
| `AtomSurface` | 26770:100166 + …161 | `surface-color` ×7 (3 default + 4 inverse/glass) | `level` ×4, none matching |
| `CardBgColor` | 25710:20065 | `color` ×8 | **no React component at all** |
| `BottomSheet` | 29355:6240 | `Display` Light\|Dark; `Grabber` bool | no axis; grabber invisible |
| `Alert` | 30969:1112 | `Staus` Success\|Alert\|Warning\|Info | 4 tones, all 4 colours wrong |
| `PlanCard` | 26003:40647 | `color-scheme` default\|inverse | `variant` ×3, `brand` has no counterpart |
| `ServiceCard` | 27216:41370 | `size` grid 109\|carousel 128 | no size axis |
| `NewCard` | 26523:22852 | `selected` yes\|no | no axis, no height |
| `ProductCard` | 25893:54098 +2 | 3 siblings addon\|product\|category | one component |
| `Card` | 26825:101736 | `surface` default\|inverse | no surface axis |

## Verified as having NO axis

| Component | Figma node | Finding |
|---|---|---|
| `DealCard` | 25973:22611 | Single symbol 166×224 (`default-surface` + `deals-card-core`). Its VARIANT-DRIFT verdict is **anatomy**, not an axis. |

## Open — axis modelled, anatomy still approximate

| Component | Gap |
|---|---|
| `DealCard` | Needs the V1.1 anatomy: top-line, logo-row, struck-through price, feedback pill, **no image slot**. Currently image-led. |
| `ProductCard` | The three types share one shell; addon (content-fill), product (media panel), category (centred image) are approximations. Inner media panel binds `border-radius/7` = 24, shared `imageBox` renders 12. |
| `Highlight` | Retokenise per audit: heading/xl, px24/pb32, 3-stop scrim, glass action-bar h72/r20; `SmilesRow` → glass logo-row. |
| `SmilesBalance` | Audit calls for a full rebuild as a white V1.1 card. |

## Not yet opened in Figma

VARIANT-DRIFT rows with a live export that this pass did not reach. Each may collapse an
axis the way `Tooltip` did; **the verdict alone does not say which axis**:

`Badge` · `LogoRow` · `Logo` · `AddTrigger` · `Input` · `Chip` · `FilterPill` · `Checkbox` ·
`Radio` · `AISearch` · `TopBar` · `NavBar` · `ActionBar` · `SectionLink` · `QuickAction` ·
`Section` · `Accordion` · `PlanUsageBar` · `Snackbar` · `Voucher`

---

## Cross-cutting defects found while reconciling

1. **`color('border.solid.*')` never resolves.** No `border/solid` group exists in Figma
   (0 matches in `variables.json`); the real groups are `border/surface-based/*` and
   `border/interactive/*`. `color()` falls back to returning the path string, which is
   invalid CSS and silently dropped. Surfaced in three separate places (`DealCard`,
   `BottomSheet` grabber, `Card`) — those borders have **never rendered**. Needs a
   design-semantics decision; not guessed at. See the note in `src/system.ts`.

2. **`variables.json` lags Figma.** Two instances:
   - `color/surface/base/inverse` aliases `color.white.1000` (opaque); Figma reports
     `#ffffff99`. The correct alias `white.a60` already exists in the export.
   - `color/alert-message/*` is **entirely absent** (0 matches) though Figma has it.
   Spot-checked 21 live values against `tokens.ts`: 20 match, so the export is otherwise
   current. Both need a re-export, not a hand-patch.

3. **Figma variant labels disagree with the tokens they bind.** In two places, so treat it
   as a pattern rather than a one-off:
   - `surface-color`: `subtle`→`base/default`, `default`→`base/inverse`
   - `card-bg-color`: `cyan`→`atom-surfaces/blue`, `blue`→`atom-surfaces/purple`

4. **Figma property typo:** the Alert axis is spelled **`Staus`**. Code Connect mappings
   must use that exact key.

5. **One Figma component, two React implementations.** The bottom sheet's `Footer`
   resolves to **27907:20590** — the same node the audit maps `ActionBar` to. Both would
   claim it in Code Connect.

6. **Test coverage was absent where the bugs were.** `overlays`, `cards`, and `feedback`
   had no test files at all. All three now do; the flat Tooltip radius, the invisible
   grabber and the wrong Alert palette all lived in untested files.

## Defects found in inherited Code Connect mappings

Surfaced by reading every mapped node's real axes (Phase 4). All three parsed and
published cleanly while describing something that does not exist:

1. **`Button.surface` resolved to nothing.** The mapping read `figma.enum('🎨 surface', …)`
   with values `🔴 brand` / `⚪️ white`. The real axis is **`🎨 scheme`** with
   `🔴 default | ⚫️ midnight | ⚪️ inverse | ⚪️🔴 inverse-brand` — wrong key *and* wrong
   values, on the most-used component in the system. Corrected.
2. **`DealCard` pointed at `.card-general`** (26825:101736) — the General card's cell.
   Now mapped to `deals-card` 25973:22611; the node belongs to `Card`.
3. **`PlanCard` pointed at `card-features-addon`** (25893:54098) — ProductCard's node. Its
   property names lined up well enough to look verified. Now `plans-mini` 26003:40647.

Related gaps worth a design decision:

- **`Switcher.color-scheme`** exists in Figma but is absent from both the mapping and
  `SwitcherProps` — the inverse scheme is unreachable from code.
- **`Logo.version`** (default|white|midnight|red) has no React counterpart; all four
  collapse to one output.
- **`FilterPill.selected`** is mapped in code but is not an axis on that set.
- **Naming inconsistency across sibling controls:** Checkbox uses `inverse`/`size`;
  Radio uses `color-scheme`/`small` for the same two concepts. Checkbox mixes casing
  within one set (`selected`, `size`, but `Disabled`).
- **Figma value typo:** badges-status exposes `neutra-inverse` (missing the "l").
- **Token key typo:** `color/badge/surface/offers/limited stock` uses a space where every
  sibling uses a hyphen.

## Figma annotations (Phase 4)

23 nodes annotated in the copy under the **Development** category, each carrying the React
component + import, the axis→prop mapping, the atom tree with node IDs, the verified token
spec, and any caveat above. Live `width`/`height` properties are attached so Dev Mode shows
measurements alongside. Annotations were written to the **copy only** — porting them to the
published original is a separate, explicitly-approved step.

## Caveats

- **Layer names differ between the two files.** `.card-general-core` (original) is
  `card-general-core` (copy); `.quick-task-core` is still dotted in both. `nestedProps()`
  matches on layer name and fails soft — an empty prop, no error. Any mapping must use the
  **original's** names.
- The copy's dot-rename is **incomplete**: `.quick-task-core` and `.image-asset` remain.
- The copy is **not published as a library**, so it cannot back Code Connect.
- `tools/audit/recheck-hardcoded.py` only matches `prop: <number>`; ternaries such as
  `tone === 'image' ? 452 : 200` are missed, and `fontSize` rows resolve against
  `scale`/`rem` when they should use `ty()`.

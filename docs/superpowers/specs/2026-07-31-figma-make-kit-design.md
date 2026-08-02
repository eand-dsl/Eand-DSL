# E&DSA → Figma Make kit — design

**Date:** 2026-07-31
**Status:** approved (design); implementation not started

## Goal

Make `@eand/react-design-system` a correct, publishable **Figma Make kit**: the package
plus guidelines that actually match it, verified end to end, with an automated fact-check
so the two cannot silently drift apart again.

The deliverable is a **publish-ready artifact plus a runbook**. Running `npm publish` and
creating the kit in Figma stays with the repo owner — those steps need e& org credentials.

## Current state

The repo already carries most of this path:

- `packages/react-design-system` — 54 exported components + a 396-entry icon set, Vite
  library build, inline-token-styled (renders through esm.sh with no CSS import).
- `MAKE_KIT_README.md` — publish + kit-creation instructions.
- `MAKE_KIT_GUIDELINES.md` — 122 lines of Make-facing instruction: golden rules, a
  component reference, a UX→UI assembly table, and a worked Home-screen example.
- `demo/` — proves local consumption by assembling a full e& Home screen.
- `docs/superpowers/plans/2026-06-21-eand-web-package-figma-make.md` — the original plan
  that produced the package.

Two things were checked and are **already correct**, needing no work:

- `npm pack --dry-run` ships exactly `dist/` + `package.json` + both MD files (23 files,
  341 kB packed / 1.4 MB unpacked). No `src`, no `node_modules`.
- No `workspace:*` dependencies. The package is self-contained.

## The problem

The package is sound. **The guidelines — the artifact that actually teaches Make how to
build — are substantially false.** Figma Make follows them literally, so each false claim
becomes generated code that does not run.

Every defect below was verified against the source, not inferred.

| # | Defect | Evidence |
|---|---|---|
| 1 | Imports a package that does not exist | Guidelines say `import { Icon } from '@eand/icons'` and *"Icons live in a separate package"*. `packages/` contains only `react-design-system` and `tokens-native`. `src/index.ts` says the opposite — *"e& App Icons — folded in"* — and re-exports `./icons`. |
| 2 | **8 of 23 documented icon names do not exist** | Registry holds 396 names. Absent: `profile`, `mshop`, `sparkle`, `subscriptions`, `mobile`, `truck`, `plus`, `shield`. Real equivalents exist under other names (`user`, `ai`, `phone-device`, `delivery`, `add`, `security`). |
| 3 | The flagship worked example does not run | The Home-screen example renders `<Icon name="mshop"/>`, `"profile"`, `"truck"`, `"mobile"` — four phantom names. This is the example Make imitates most closely. |
| 4 | 24 of 396 icons offered, with a hard stop | Guidelines list 24 names and instruct *"Need one that isn't listed? Ask for it to be added — don't substitute a placeholder."* Make is steered away from 94% of the set and told to halt rather than reach for a real icon. |
| 5 | Stale component APIs | `Button` documented as `variant: primary\|secondary`; ships `primary\|secondary\|tertiary\|link\|glass` plus `surface` and `loading`. `Chip` documented as `{ selected, leadingIcon }`; ships `type: outline\|filled\|glass\|inverse` with states and a loader. `TopBar` documented with the `{ variant, greeting, actionBar }` API that is now back-compat only, superseded by a slot-based header. |
| 6 | 15 exports undocumented | `Picker`, `PickerOption`, `OtpInput`, `ButtonGroup`, `StatusRibbon`, `PaymentRow`, `CtaFooter`, `AtomSurface`, `CardBgColor`, `Stepper`, `Dismiss`, `Voucher`, `Accordion`, `SmilesAvatar`, `IconBox`. Guidelines say "39 more" components; the library exports 54. |
| 7 | `version: 0.0.0` | Not meaningfully publishable or referencable from a kit. |

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Icon packaging | **One package.** Icons stay folded into `@eand/react-design-system`; the guidelines are corrected to match. | Matches what the code and README already do. One publish, one version, no cross-package sync. The guidelines' stated rationale ("keeps the UI lib light") does not outweigh a second package to build, version, publish, and register. |
| Delivery scope | **Publish-ready; owner publishes.** | Publishing needs e& org credentials that should not sit with the agent. |
| Drift control | **Hand-written prose + automated fact-check.** | The golden rules, assembly table, and worked example are judgment; generating them would degrade them. The factual claims — component exists, prop exists, icon exists — are exactly what drifted, and are mechanically checkable. |
| Icon documentation | **All 198 base names**, grouped by purpose, with the `-filled` convention explained. | Verified: the registry is exactly 198 base + 198 `-filled`, perfectly paired, zero orphans. Documenting base names plus the suffix rule is therefore complete and lossless at roughly 1.5 kB. A curated subset would recreate defect #4. |
| Version | **1.0.0** | The library is mature — 54 components, tokens bound to Figma variables, Code Connect published. Pre-1.0 signalling would understate it, and Make kits gain nothing from it. |

## Architecture

Four units with separate responsibilities and a JSON boundary between the two scripts.

### Unit 1 — `scripts/guidelines-facts.ts` (ground truth extractor)

- **Does:** emits `guidelines-facts.json` describing what the library actually contains —
  exported component names, their prop names, literal union values for variant props, all
  396 icon names, and `ICON_META` descriptions and aliases.
- **Used as:** `npm run guidelines:facts`.
- **Depends on:** `react-docgen-typescript` (already a proven pattern in
  `apps/docs/scripts/extract-props.ts`, which parses the same source with the same
  tsconfig), plus a direct import of the `ICONS` and `ICON_META` registries from
  `src/icons/`.
- **Knows nothing about** the guidelines document.

### Unit 2 — `scripts/check-guidelines.ts` (fact checker)

- **Does:** parses `MAKE_KIT_GUIDELINES.md`, extracts every checkable claim, diffs against
  the facts file, prints a readable report, exits nonzero on any mismatch.
- **Claims extracted:**
  - component signatures written as `Name({ prop, prop: a|b })`
  - prop names and the literal union values given for them
  - `<Icon name="…" />` usages anywhere in the document, including code fences
  - the enumerated icon-name list
  - imports, to catch a package that is not `@eand/react-design-system`
- **Checks:**
  - no documented component that is not exported *(catches defect 6's inverse)*
  - no exported component left undocumented *(catches defect 6)*
  - no documented prop absent from the component's props *(catches defect 5)*
  - no documented union value absent from the real type *(catches defect 5)*
  - no icon name absent from the registry *(catches defects 2 and 3)*
  - no import from a package other than the single published one *(catches defect 1)*
- **Used as:** `npm run guidelines:check`.
- **Depends on:** `guidelines-facts.json` only — it never parses TypeScript itself.

### Unit 3 — `MAKE_KIT_GUIDELINES.md` (rewritten)

Hand-written prose, corrected facts. Structure:

1. **Import contract** — the single package; `Icon` comes from it.
2. **Golden rules** — kept largely as-is; this content is good and is what makes Make
   produce e& screens rather than generic ones.
3. **Icons** — the `-filled` convention, all 198 base names grouped by purpose, and
   guidance on choosing (drawn from `ICON_META` descriptions/aliases). Keeps the "never
   invent an icon" rule but removes the dead end by making the real set reachable.
   Grouping is the implementer's call, derived from `ICON_META` descriptions — the
   binding requirement is that all 198 appear and the grouping aids lookup, not that any
   particular set of category labels is used.
4. **Component reference** — organised by role, with current props and the variant axes
   that exist today. Curated to "props that matter", not an exhaustive dump.
5. **UX → UI assembly table** — kept, extended for the newly documented components.
6. **Worked example** — a Home screen that compiles and uses only real icon names.

### Unit 4 — release prep

- `version` → `1.0.0`.
- `npm pack` verification (already passing; re-verify after changes).
- ESM smoke test — see Testing.
- Demo render check.
- Publish runbook written into `MAKE_KIT_README.md`: registry choice, `.npmrc` auth,
  `npm publish`, then Figma → Make kits → add package → paste guidelines.

## Data flow

```
src/**/*.tsx ──react-docgen-typescript──┐
                                        ├──> guidelines-facts.json ──> check-guidelines ──> pass / fail
src/icons/ (ICONS, ICON_META) ──────────┘                                    ↕
                                                              MAKE_KIT_GUIDELINES.md
```

## Testing

- **The checker must fail against today's guidelines before anything is rewritten.** If it
  does not surface the 8 phantom icon names and the `@eand/icons` import, the checker is
  itself broken. This runs first and is the primary evidence that the tool works. Only
  then is the guidelines document rewritten, until the checker passes.
- **Unit tests** (Vitest) for the claim extractor against fixture markdown containing a
  known-bad prop, a known-bad icon name, a known-missing component, and a known-good
  control that must not raise.
- **ESM smoke test** — in a clean directory, import from the built `dist/index.js` and
  `renderToString` a small screen. Exercises the same shape of resolution esm.sh performs
  and catches broken or missing exports that a bundled build can hide.
- **Regression** — existing `npm test` (Vitest) and `npm run typecheck` stay green.

## Acceptance criteria

1. `npm run guidelines:check` exits 0.
2. The same command, run against the pre-rewrite guidelines, exits nonzero and names the
   phantom package and every phantom icon the parser can reach. The pre-rewrite document is
   frozen at `scripts/__fixtures__/guidelines-original.md`, and the failing output is
   captured in the implementation's commit message as evidence.

   **Amended 2026-08-02.** This criterion originally demanded all 8 phantom icon names.
   Only 4 (`mobile`, `mshop`, `profile`, `truck`) are reachable: they appear in
   `<Icon name="…">` usages. The other 4 (`sparkle`, `subscriptions`, `plus`, `shield`)
   exist only in an undelimited prose list in the original document, and the parser
   deliberately reads icon names only from `<Icon>` usages and the `<!-- icons:begin -->`
   block — parsing loose prose would make every backticked word a candidate icon. The
   detection gap is by design, not defect. Actual result: 212 problems, including the
   phantom package, 4 phantom icons, 14 undocumented components, and 2 phantom props
   (`ActionBar.helper`, `Checkbox.checked`) that the original audit missed.
3. All 54 exported components appear in the guidelines.
4. All 198 base icon names are documented; every icon name in the document resolves.
5. The worked example type-checks against the built package.
6. `npm pack --dry-run` still ships only `dist/` + `package.json` + the two MD files.
7. `npm test` and `npm run typecheck` pass.
8. `MAKE_KIT_README.md` contains a runbook the owner can follow without further questions.

## Boundaries and risks

**The checker verifies identifiers, not semantics.** It confirms a component, prop, union
value, or icon *exists*. It cannot judge whether the prose gives good design advice, or
whether the guidelines recommend the right component for a given UX pattern. It prevents
precisely the class of drift that occurred here — phantom identifiers — and nothing wider.
Semantic quality stays a human review concern.

**Icon-name churn.** The icon registry is auto-generated from Figma via
`scripts/build-icons.py`. If Figma renames an icon, the checker will catch the resulting
guidelines mismatch on the next run, but will not fix it. That is the intended behaviour:
fail loudly, repair by hand.

## Out of scope

- Running `npm publish` or creating the kit in Figma.
- Closing the code ↔ Figma component gaps catalogued in `figma-component-audit.md`.
- Code Connect mappings (`code-connect/*.figma.tsx`).
- The docs site (`apps/docs`).
- Any change to component implementations. This work changes documentation, tooling, and
  package metadata only.

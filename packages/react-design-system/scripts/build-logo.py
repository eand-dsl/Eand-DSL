#!/usr/bin/env python3
"""Generate src/icons/logo.tsx from the e& lockup SVGs in src/icons/logo-raw/.

Mirrors build-icons.py: Python at dev time, committed TSX output, so deploys need no
Python. Re-run after re-exporting the lockups from Figma:

    python3 packages/react-design-system/scripts/build-logo.py

Source: Figma `e&-logo` 27032:50455, four `version` symbols, all 96x96.
  version=default  27032:50454   red tile + white lockup (the app icon)
  version=white    27032:50456   bare lockup, white
  version=midnight 27032:50459   bare lockup, midnight
  version=red      27032:50475   bare lockup, brand red

Two things this has to do, because the raw exports are not usable as-is:

1. Strip the canvas. Exporting a symbol that sits on a Figma page picks up the page
   backdrop: a 96x96 #E8E7EA rect plus paths spanning roughly -5108..2429, far outside
   the viewBox. Only the `<g id="version=...">` subtree is the logo.
2. Collapse the three bare lockups into one. They are the same geometry and differ only
   in fill, so they ship once with `currentColor` and are coloured by CSS. The script
   asserts that equivalence and fails if a future export breaks it, rather than silently
   emitting a lockup that is wrong for two of the three versions.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "src" / "icons" / "logo-raw"
OUT = ROOT / "src" / "icons" / "logo.tsx"

TILE_FILL = "#E00800"          # version=default app tile
# The `version` axis IS the colour — each bare symbol ships a different lockup fill.
BARE_FILL = {"white": "#ffffff", "midnight": "#191329", "red": "#E00800"}
BARE = tuple(BARE_FILL)


def subtree(svg: str) -> str:
    """The `<g id="version=...">` subtree — everything else is Figma canvas."""
    i = svg.find('<g id="version=')
    if i < 0:
        raise SystemExit("no version= group found; did the export change?")
    depth, j = 0, i
    while j < len(svg):
        if svg.startswith("<g", j):
            depth += 1
        elif svg.startswith("</g>", j):
            depth -= 1
            if depth == 0:
                return svg[i : j + 4]
        j += 1
    raise SystemExit("unterminated version= group")


def paths(sub: str) -> list[str]:
    return re.findall(r'<path[^>]*\sd="([^"]+)"', sub)


def read(name: str) -> str:
    return subtree((RAW / f"{name}.svg").read_text())


def shape_hash(sub: str) -> str:
    """Geometry identity, ignoring fill colour and ids."""
    x = re.sub(r'fill="[^"]*"', "", sub)
    x = re.sub(r'id="[^"]*"', "", x)
    return hashlib.sha1(re.sub(r"\s+", " ", x).encode()).hexdigest()

# The three bare lockups must be one shape, or the currentColor collapse is a lie.
hashes = {n: shape_hash(read(n)) for n in BARE}
if len(set(hashes.values())) != 1:
    raise SystemExit(f"bare lockups are no longer identical shapes: {hashes}")

lockup = paths(read("white"))
default_sub = read("default")
default_paths = paths(default_sub)

# The default tile is a <rect>, not a path, and the lockup sits on top of it.
if TILE_FILL not in default_sub:
    raise SystemExit(f"version=default no longer carries the {TILE_FILL} tile")
if default_paths != lockup:
    raise SystemExit("version=default lockup geometry differs from the bare lockup")

size = 96  # every version symbol is 96x96
body = ",\n".join(f"  '{d}'" for d in lockup)
OUT.write_text(f"""// AUTO-GENERATED from src/icons/logo-raw/*.svg by scripts/build-logo.py. Do not edit.
// Figma `e&-logo` 27032:50455 — 96x96, four `version` symbols.
import type {{ SVGProps }} from 'react';

/** Figma's four `version` symbols. `default` is the red app tile with a white lockup;
 *  the rest are the bare lockup, coloured by CSS. */
export type LogoVersion = 'default' | 'white' | 'midnight' | 'red';

export const LOGO_SIZE = 96;
export const LOGO_TILE_FILL = '{TILE_FILL}';

/** Lockup fill per version. The axis carries the colour — `red` and `midnight` are the
 *  same artwork in different inks, so leaving them both on `currentColor` would make the
 *  prop do nothing. Pass `color="currentColor"` to inherit from CSS instead. */
export const LOGO_FILL: Record<LogoVersion, string> = {{
  default: '#ffffff',
  white: '{BARE_FILL["white"]}',
  midnight: '{BARE_FILL["midnight"]}',
  red: '{BARE_FILL["red"]}',
}};

/** The "e&" ligature + "etisalat and" wordmark. One copy: the white, midnight and red
 *  symbols are the same geometry and only differ in fill, which build-logo.py asserts. */
export const LOGO_LOCKUP: readonly string[] = [
{body},
];

export interface LogoArtProps extends Omit<SVGProps<SVGSVGElement>, 'fill' | 'color'> {{
  version?: LogoVersion;
  size?: number | string;
  /** Overrides the version's ink. `currentColor` inherits from CSS. */
  color?: string;
}}

/** Raw lockup artwork. Prefer the `Logo` component, which adds the accessible name. */
export function LogoArt({{ version = 'default', size = LOGO_SIZE, color, ...rest }}: LogoArtProps) {{
  const tile = version === 'default';
  return (
    <svg width={{size}} height={{size}} viewBox="0 0 {size} {size}" fill="none"
      xmlns="http://www.w3.org/2000/svg" {{...rest}}>
      {{tile ? <rect width={{LOGO_SIZE}} height={{LOGO_SIZE}} fill={{LOGO_TILE_FILL}} /> : null}}
      <g fill={{color ?? LOGO_FILL[version]}}>
        {{LOGO_LOCKUP.map((d, i) => <path key={{i}} d={{d}} />)}}
      </g>
    </svg>
  );
}}
""")

print(f"Wrote {OUT.relative_to(ROOT)} — {len(lockup)} lockup paths, 4 versions")

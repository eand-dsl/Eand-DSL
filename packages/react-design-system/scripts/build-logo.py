#!/usr/bin/env python3
"""Generate src/icons/logo.tsx from the etisalat logo SVGs in src/icons/logo-raw/.

Mirrors build-icons.py: Python at dev time, committed TSX output, so deploys need no
Python. Re-run after re-exporting the artwork from Figma:

    python3 packages/react-design-system/scripts/build-logo.py

Source: Figma DSL V1.2, page "Etisalat Logo" 27020:6155.

  etisalat-logo              27032:50455  96x96 symbol, color-scheme = default | white | red.
                                          default is a red (color/red/1000) square tile; all three
                                          hold .etisalat-logo-core, i.e. the white lockup at
                                          136/192 of the width, centred.
  .etisalat-logo-variations  42176:33598  140x140 frames, art full-width and centred:
      type=lockup,    rtl=false  42573:82636  -> lockup.svg
      type=lockup,    rtl=true   42573:83248  -> lockup-rtl.svg
      type=logomark,  rtl=false  42176:33685  -> logomark.svg
      type=wordmark,  rtl=false  42176:33689  -> wordmark.svg
      type=wordmark,  rtl=true   42176:33687  -> wordmark-rtl.svg
      type=billingual rtl=false  42579:83633  -> bilingual.svg   (Figma spells it "billingual")

Each raw file is the export of the artwork group alone (exportAsync SVG_STRING), so its
viewBox is the art's own bounds. The script refuses anything but plain white <path>
elements: a rect, transform or second colour would mean the export changed shape and the
currentColor collapse below would be wrong.
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "src" / "icons" / "logo-raw"
OUT = ROOT / "src" / "icons" / "logo.tsx"

ART = ["lockup", "lockup-rtl", "logomark", "wordmark", "wordmark-rtl", "bilingual"]
TILE_FILL = "#E00800"   # color/red/1000, the default tile
CORE_RATIO = 136 / 192  # .etisalat-logo-core: lockup width / symbol width


def load(name: str):
    svg = (RAW / f"{name}.svg").read_text()
    m = re.match(r'<svg width="([\d.]+)" height="([\d.]+)" viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    if not m:
        raise SystemExit(f"{name}.svg: unexpected root element")
    w, h, vw, vh = (float(x) for x in m.groups())
    if (w, h) != (vw, vh):
        raise SystemExit(f"{name}.svg: width/height disagree with the viewBox")
    body = re.sub(r"^<svg[^>]*>|</svg>\s*$", "", svg.strip()).strip()
    elems = re.findall(r"<(\w+)", body)
    if set(elems) != {"path"}:
        raise SystemExit(f"{name}.svg: expected only <path>, found {sorted(set(elems))}")
    fills = set(re.findall(r'fill="([^"]+)"', body))
    if fills != {"white"}:
        raise SystemExit(f"{name}.svg: expected a single white fill, found {sorted(fills)}")
    if "transform" in body:
        raise SystemExit(f"{name}.svg: transforms are not supported")
    return w, h, re.findall(r'\sd="([^"]+)"', body)


art = {n: load(n) for n in ART}

entries = []
for n in ART:
    w, h, ds = art[n]
    paths = ",\n".join(f"      '{d}'" for d in ds)
    entries.append(f"  '{n}': {{\n    width: {w:g},\n    height: {h:g},\n    paths: [\n{paths},\n    ],\n  }},")
table = "\n".join(entries)

OUT.write_text(f"""// AUTO-GENERATED from src/icons/logo-raw/*.svg by scripts/build-logo.py. Do not edit.
// Figma DSL V1.2 "Etisalat Logo" 27020:6155: etisalat-logo 27032:50455 and
// .etisalat-logo-variations 42176:33598.
import type {{ SVGProps }} from 'react';

/** Figma `etisalat-logo` color-scheme. `default` is the red square tile with a white
 *  lockup; `white` and `red` are the bare mark in that ink.
 *  `midnight` is deprecated: V1.2 removed it. It still renders, in midnight ink. */
export type LogoVersion = 'default' | 'white' | 'red' | 'midnight';

/** Figma `.etisalat-logo-variations` type. Figma names the last one `billingual`. */
export type LogoType = 'lockup' | 'logomark' | 'wordmark' | 'bilingual';

export type LogoArtKey = {' | '.join(f"'{n}'" for n in ART)};

export const LOGO_TILE_FILL = '{TILE_FILL}';
/** `.etisalat-logo-core`: the lockup spans 136 of the symbol's 192 units. */
export const LOGO_CORE_RATIO = {CORE_RATIO!r};

export const LOGO_FILL: Record<LogoVersion, string> = {{
  default: '#ffffff',
  white: '#ffffff',
  red: '{TILE_FILL}',
  midnight: '#191329',
}};

/** Artwork per variation, each in its own tight viewBox. */
export const LOGO_ART: Record<LogoArtKey, {{ width: number; height: number; paths: readonly string[] }}> = {{
{table}
}};

/** Which artwork a type + direction resolves to. Only lockup and wordmark have an Arabic
 *  version; logomark is direction-free and bilingual carries both scripts. */
export function logoArtKey(type: LogoType, rtl: boolean): LogoArtKey {{
  if (rtl && (type === 'lockup' || type === 'wordmark')) return `${{type}}-rtl`;
  return type;
}}

export interface LogoArtProps extends Omit<SVGProps<SVGSVGElement>, 'fill' | 'color' | 'type'> {{
  version?: LogoVersion;
  /** Omit for the `etisalat-logo` symbol; set for a `.etisalat-logo-variations` frame. */
  type?: LogoType;
  rtl?: boolean;
  /** Side of the square symbol, in px. */
  size?: number | string;
  /** Overrides the version's ink. `currentColor` inherits from CSS. */
  color?: string;
}}

/** Raw logo artwork in a square, as Figma frames it. Prefer the `Logo` component, which
 *  adds the accessible name. */
export function LogoArt({{ version = 'default', type, rtl = false, size = 96, color, ...rest }}: LogoArtProps) {{
  const a = LOGO_ART[logoArtKey(type ?? 'lockup', rtl)];
  const tile = version === 'default';
  // etisalat-logo (no type) and any tiled logo use the core inset; a bare variation fills
  // its frame edge to edge, as .etisalat-logo-variations does.
  const span = type && !tile ? 1 : LOGO_CORE_RATIO;
  const box = 96;
  const s = (box * span) / a.width;
  const x = (box - a.width * s) / 2;
  const y = (box - a.height * s) / 2;
  return (
    <svg width={{size}} height={{size}} viewBox={{`0 0 ${{box}} ${{box}}`}} fill="none"
      xmlns="http://www.w3.org/2000/svg" {{...rest}}>
      {{tile ? <rect width={{box}} height={{box}} fill={{LOGO_TILE_FILL}} /> : null}}
      <g transform={{`translate(${{x}} ${{y}}) scale(${{s}})`}} fill={{color ?? LOGO_FILL[version]}}>
        {{a.paths.map((d, i) => <path key={{i}} d={{d}} />)}}
      </g>
    </svg>
  );
}}
""")

print(f"Wrote {OUT.relative_to(ROOT)} — {len(ART)} artworks, " +
      ", ".join(f"{n} {len(art[n][2])} paths" for n in ART))

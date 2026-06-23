#!/usr/bin/env python3
"""Generate src/icons.tsx from raw SVGs (src/raw/*.svg) exported from the e& App Icons
library. Normalizes hard-coded colors to currentColor so icons tint via CSS `color`."""
import os, re, json, glob

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(HERE, "src", "raw")
OUT = os.path.join(HERE, "src", "icons.tsx")

def pascal(name):
    return "".join(p.capitalize() for p in re.split(r"[^a-z0-9]+", name.lower()) if p) + "Icon"

def normalize(svg):
    m = re.search(r'viewBox="([^"]+)"', svg)
    vb = m.group(1) if m else "0 0 24 24"
    inner = re.sub(r"^.*?<svg[^>]*>", "", svg, flags=re.S)
    inner = re.sub(r"</svg>\s*$", "", inner, flags=re.S).strip()
    # any hard-coded color (hex OR named like white/black) -> currentColor.
    # keep fill="none" (transparent) and already-currentColor untouched.
    inner = re.sub(r'(stroke|fill)="(?!none\b)(?!currentColor\b)[^"]+"', r'\1="currentColor"', inner)
    return vb, re.sub(r"\s+", " ", inner).strip()

icons = {}
for f in sorted(glob.glob(os.path.join(RAW, "*.svg"))):
    name = os.path.splitext(os.path.basename(f))[0]
    vb, inner = normalize(open(f).read())
    icons[name] = (pascal(name), vb, inner)

lines = [
    "// AUTO-GENERATED from e& App Icons SVGs. Do not edit.",
    "import type { SVGProps, CSSProperties } from 'react';",
    "export interface IconSvgProps extends SVGProps<SVGSVGElement> { size?: number | string; }",
    "",
]
for name, (comp, vb, inner) in icons.items():
    lines.append(
        f"export function {comp}({{ size = 24, ...p }}: IconSvgProps) {{\n"
        f"  return <svg width={{size}} height={{size}} viewBox=\"{vb}\" fill=\"none\" "
        f"xmlns=\"http://www.w3.org/2000/svg\" {{...p}} dangerouslySetInnerHTML={{{{ __html: {json.dumps(inner)} }}}} />;\n"
        f"}}"
    )
reg = ", ".join(f"{json.dumps(n)}: {c}" for n, (c, _, _) in icons.items())
lines.append(f"\nexport const ICONS = {{ {reg} }} as const;")
lines.append("export type IconName = keyof typeof ICONS;")
lines.append("""
export interface IconProps {
  name: IconName | (string & {});
  size?: number;
  color?: string;
  title?: string;
  style?: CSSProperties;
  className?: string;
}
export function Icon({ name, size = 24, color, title, style, className }: IconProps) {
  const C = (ICONS as Record<string, (p: IconSvgProps) => JSX.Element>)[name];
  if (!C) return null;
  return (
    <span role="img" aria-label={title ?? name} className={className}
      style={{ display: 'inline-flex', lineHeight: 0, color, ...style }}>
      <C size={size} />
    </span>
  );
}""")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, "w").write("\n".join(lines) + "\n")
print(f"wrote {OUT} with {len(icons)} icons: {', '.join(icons)}")

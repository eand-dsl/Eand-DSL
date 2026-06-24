#!/usr/bin/env python3
"""Generate native design tokens (iOS Swift + Android Compose Kotlin + XML resources)
from the repo's variables.json — the SAME source the web package consumes, so values
never drift across platforms.

Outputs:
  ios/EandTokens.swift                 SwiftUI: EandColor / EandSpacing / EandRadius /
                                       EandIcon / EandBorder / EandTypography
  android/EandTokens.kt                Compose: EandColor / EandSpacing / EandRadius /
                                       EandIcon / EandBorder / EandTypography
  android/res/values/colors.xml        Android color resources
  android/res/values/dimens.xml        Android dimension resources
"""
import json, os, re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(HERE))
VARS = os.path.join(ROOT, "variables.json")

# ---------------- token loader / resolver (mirrors tools/generate_design_md.py) ----------------
def is_leaf(n): return isinstance(n, dict) and "$value" in n
def deep_merge(t, s):
    for k, v in s.items():
        if is_leaf(v): t[k] = v
        else: t.setdefault(k, {}); deep_merge(t[k], v)
def load_merged(raw):
    m = {}
    for col in raw:
        name = list(col.keys())[0]; deep_merge(m, col[name]["modes"]["value"])
    return m
def lookup(tree, dotpath):
    node = tree
    for seg in dotpath.split("."):
        if not isinstance(node, dict): return None
        node = node.get(seg)
    return node if is_leaf(node) else None
def resolve(tree, leaf, seen=None):
    seen = seen or set(); v = leaf["$value"]
    if isinstance(v, str):
        ref = None
        if v.startswith("{") and v.endswith("}"): ref = v[1:-1]
        elif v.startswith("$."): ref = ".".join(v[2:].split(".")[2:])
        if ref:
            if ref in seen: return v
            seen.add(ref); tgt = lookup(tree, ref)
            return resolve(tree, tgt, seen) if tgt else v
    return v
def resolved_tree(tree):
    def walk(n): return resolve(tree, n) if is_leaf(n) else {k: walk(v) for k, v in n.items()}
    return walk(tree)

def leaves(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items(): yield from leaves(v, f"{path}.{k}" if path else k)
    else: yield path, node

# ---------------- naming ----------------
def camel(parts):
    out = ""
    for i, p in enumerate(parts):
        p = re.sub(r"[^a-zA-Z0-9]+", " ", p).strip()
        words = p.split()
        for j, w in enumerate(words):
            if i == 0 and j == 0: out += w.lower()
            else: out += w[:1].upper() + w[1:].lower()
    return out or "_"
def snake(parts):
    s = "_".join(parts)
    return re.sub(r"[^a-zA-Z0-9]+", "_", s).strip("_").lower()

# ---------------- color parsing -> (r,g,b,a) floats 0..1 ----------------
def parse_color(v):
    if not isinstance(v, str) or not v: return None
    v = v.strip()
    m = re.match(r"#([0-9a-fA-F]{3,8})$", v)
    if m:
        h = m.group(1)
        if len(h) == 3: h = "".join(c*2 for c in h)
        if len(h) == 6: h += "ff"
        if len(h) != 8: return None
        r, g, b, a = (int(h[i:i+2], 16) for i in (0, 2, 4, 6))
        return (r/255, g/255, b/255, a/255)
    m = re.match(r"rgba?\(([^)]+)\)$", v)
    if m:
        parts = [p.strip() for p in m.group(1).split(",")]
        if len(parts) < 3: return None
        r, g, b = (int(float(p)) for p in parts[:3])
        a = float(parts[3]) if len(parts) > 3 else 1.0
        return (r/255, g/255, b/255, a)
    return None

def hex8(rgba):
    r, g, b, a = rgba
    return "#%02X%02X%02X%02X" % (round(a*255), round(r*255), round(g*255), round(b*255))  # ARGB

# weight name -> (SwiftUI, Compose, numeric)
WEIGHT = {
    "thin": ("thin", "Thin", 100), "light": ("light", "Light", 300),
    "regular": ("regular", "Normal", 400), "book": ("regular", "W500", 450),
    "medium": ("medium", "Medium", 500), "semi bold": ("semibold", "SemiBold", 600),
    "semibold": ("semibold", "SemiBold", 600), "bold": ("bold", "Bold", 700),
    "black": ("black", "Black", 800),
}
def weight(name):
    return WEIGHT.get(str(name).strip().lower(), ("regular", "Normal", 400))

def num(v):
    if isinstance(v, (int, float)): return float(v)
    if isinstance(v, str):
        m = re.match(r"^(-?\d+(\.\d+)?)", v.strip())
        if m: return float(m.group(1))
    return None
def fmt(n):
    return str(int(n)) if float(n).is_integer() else ("%.4g" % n)

# ---------------- collect ----------------
R = resolved_tree(load_merged(json.load(open(VARS))))

# colors: everything under `color`
colors = []  # (parts, rgba)  parts excludes leading 'color'
for path, v in leaves(R.get("color", {})):
    rgba = parse_color(v)
    if rgba is None: continue
    colors.append((path.split("."), rgba))

# dimensions: numeric leaves from these top-level groups (px -> pt/dp)
DIM_GROUPS = {
    "Spacing": "spacing", "Radius": "border-radius", "Icon": "icon", "Border": "border",
    "Scale": "scale", "SectionLink": "section-link", "Tabs": "tabs", "Section": "section",
    "Card": "card", "Checkbox": "checkbox", "Switcher": "switcher", "Radio": "radio", "Rem": "rem",
}
dims = {}  # enumName -> list of (parts, value)
for enum, key in DIM_GROUPS.items():
    sub = R.get(key)
    if not sub: continue
    items = []
    for path, v in leaves(sub):
        n = num(v)
        if n is None: continue
        items.append((path.split("."), n))
    if items: dims[enum] = items

# typography text styles
typo = []  # (parts, size, weightName, lineHeightPx, family)
def collect_typo(node, parts):
    if isinstance(node, dict) and not is_leaf(node):
        # a text style = a dict whose children include font-size
        if "font-size" in node and isinstance(node.get("font-size"), (int, float, str)):
            size = num(node.get("font-size"))
            w = node.get("font-weight", "Regular")
            lh = node.get("line-height")
            fam = node.get("font-family", "Suisse int'l")
            lh_px = None
            if isinstance(lh, str) and lh.endswith("%") and size is not None:
                lh_px = size * float(lh[:-1]) / 100.0
            elif num(lh) is not None:
                lh_px = num(lh)
            if size is not None:
                typo.append((parts, size, w, lh_px, fam))
            return
        for k, v in node.items(): collect_typo(v, parts + [k])
collect_typo(R.get("typography", {}), [])

FAMILY = R.get("font", {}).get("family", {}).get("default", {})
FAMILY = FAMILY if isinstance(FAMILY, str) else "Suisse int'l"

# ---------------- emit: iOS Swift ----------------
def swift():
    L = ["// AUTO-GENERATED from variables.json. Do not edit.",
         "// e& Design System tokens — SwiftUI.", "import SwiftUI", "",
         "public struct EandTextStyle {",
         "    public let size: CGFloat",
         "    public let weight: Font.Weight",
         "    public let lineHeight: CGFloat",
         "    public let family: String",
         "}", ""]
    L.append("public enum EandColor {")
    last = None
    for parts, rgba in colors:
        if parts[0] != last: last = parts[0]; L.append(f"    // MARK: {last}")
        r, g, b, a = rgba
        L.append(f"    public static let {camel(parts)} = Color(.sRGB, red: {fmt(r)}, green: {fmt(g)}, blue: {fmt(b)}, opacity: {fmt(a)})")
    L.append("}"); L.append("")
    for enum, items in dims.items():
        L.append(f"public enum Eand{enum} {{")
        for parts, v in items:
            L.append(f"    public static let {camel(parts)}: CGFloat = {fmt(v)}")
        L.append("}"); L.append("")
    L.append("public enum EandTypography {")
    for parts, size, w, lh, fam in typo:
        sw = weight(w)[0]
        lhv = fmt(lh) if lh is not None else fmt(size)
        L.append(f"    public static let {camel(parts)} = EandTextStyle(size: {fmt(size)}, weight: .{sw}, lineHeight: {lhv}, family: \"{fam}\")")
    L.append("}"); L.append("")
    return "\n".join(L)

# ---------------- emit: Android Compose Kotlin ----------------
def kotlin():
    L = ["// AUTO-GENERATED from variables.json. Do not edit.",
         "// e& Design System tokens — Jetpack Compose.",
         "package com.eand.tokens", "",
         "import androidx.compose.ui.graphics.Color",
         "import androidx.compose.ui.text.TextStyle",
         "import androidx.compose.ui.text.font.FontWeight",
         "import androidx.compose.ui.unit.dp",
         "import androidx.compose.ui.unit.sp", ""]
    L.append("object EandColor {")
    last = None
    for parts, rgba in colors:
        if parts[0] != last: last = parts[0]; L.append(f"    // {last}")
        r, g, b, a = rgba
        L.append(f"    val {camel(parts)} = Color(red = {fmt(r)}f, green = {fmt(g)}f, blue = {fmt(b)}f, alpha = {fmt(a)}f)")
    L.append("}"); L.append("")
    for enum, items in dims.items():
        L.append(f"object Eand{enum} {{")
        for parts, v in items:
            L.append(f"    val {camel(parts)} = {fmt(v)}.dp")
        L.append("}"); L.append("")
    L.append("object EandTypography {")
    for parts, size, w, lh, fam in typo:
        kw = weight(w)[1]
        lhv = fmt(lh) if lh is not None else fmt(size)
        L.append(f"    val {camel(parts)} = TextStyle(fontSize = {fmt(size)}.sp, fontWeight = FontWeight.{kw}, lineHeight = {lhv}.sp)")
    L.append("}"); L.append("")
    return "\n".join(L)

# ---------------- emit: Android XML ----------------
def xml_colors():
    L = ['<?xml version="1.0" encoding="utf-8"?>', "<!-- AUTO-GENERATED from variables.json. Do not edit. -->", "<resources>"]
    for parts, rgba in colors:
        L.append(f'    <color name="{snake(parts)}">{hex8(rgba)}</color>')
    L.append("</resources>"); return "\n".join(L)
def xml_dimens():
    L = ['<?xml version="1.0" encoding="utf-8"?>', "<!-- AUTO-GENERATED from variables.json. Do not edit. -->", "<resources>"]
    for enum, items in dims.items():
        for parts, v in items:
            L.append(f'    <dimen name="{snake([enum]+parts)}">{fmt(v)}dp</dimen>')
    L.append("</resources>"); return "\n".join(L)

# ---------------- write ----------------
def write(rel, content):
    p = os.path.join(HERE, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w").write(content + "\n"); return p

write("ios/EandTokens.swift", swift())
write("android/EandTokens.kt", kotlin())
write("android/res/values/colors.xml", xml_colors())
write("android/res/values/dimens.xml", xml_dimens())
print(f"colors={len(colors)}  dim-groups={len(dims)} ({sum(len(v) for v in dims.values())} dims)  typography={len(typo)}  family={FAMILY!r}")

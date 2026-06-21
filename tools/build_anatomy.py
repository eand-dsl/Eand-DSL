#!/usr/bin/env python3
"""Parse Figma REST node JSON (from /tmp/fig/<slug>.json) into tools/anatomy/<slug>.md.
Figma-verified anatomy: variant axes, dimensions, radius/border, parts, written specs."""
import json, os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANATOMY = os.path.join(ROOT, "tools", "anatomy")
FIGDIR = "/tmp/fig"
SPEC_RE = re.compile(r"(height|width|radius|corner|border|stroke|\d+\s*px|\bpx\b|rem\)|icon|gap|padding|knob|chevron|fixed at|hug|1200)", re.I)
GENERIC_NAME = re.compile(r"^(frame|group|rectangle|vector|ellipse|line|union|subtract|component|instance)\b|^\s*$|^[\d\.]+$|^\.+$|^Frame \d", re.I)

def walk(node, fn, depth=0):
    fn(node, depth)
    for c in node.get("children", []) or []:
        walk(c, fn, depth + 1)

def strip_id(s):  # "Size#12:3" -> "Size"
    return s.split("#")[0].strip()

def clean_name(s):  # drop emoji/non-ascii + tidy: "🎨 surface" -> "surface"
    s = re.sub(r"[^\x00-\x7F]+", "", strip_id(s))
    return re.sub(r"\s+", " ", s).strip(" -")

def analyze(slug, path):
    d = json.load(open(path))
    nodes = d.get("nodes", {})
    if not nodes:
        return None
    nid = next(iter(nodes))
    doc = nodes[nid].get("document")
    if not doc:
        return None

    comp_sets, comps, texts = [], [], []
    def visit(n, depth):
        t = n.get("type")
        if t == "COMPONENT_SET":
            comp_sets.append(n)
        elif t == "COMPONENT":
            bb = n.get("absoluteBoundingBox") or {}
            comps.append({
                "id": n.get("id"), "name": n.get("name", ""),
                "w": round(bb.get("width", 0)), "h": round(bb.get("height", 0)),
                "r": n.get("cornerRadius"), "rr": n.get("rectangleCornerRadii"),
                "sw": n.get("strokeWeight") if n.get("strokes") else None,
                "children": [c.get("name", "") for c in (n.get("children") or [])],
            })
        elif t == "TEXT":
            ch = (n.get("characters") or "").strip()
            if ch:
                texts.append(ch)
    walk(doc, visit)

    # ---- variant axes ----
    axes = {}  # name -> set(values)
    for cs in comp_sets:
        for pname, pdef in (cs.get("componentPropertyDefinitions") or {}).items():
            name = clean_name(pname)
            if not name:
                continue
            t = pdef.get("type")
            if t == "VARIANT":
                axes.setdefault(name, set()).update(pdef.get("variantOptions") or [])
            elif t == "BOOLEAN":
                axes.setdefault(name, set()).update({"on", "off"})
            # skip TEXT and INSTANCE_SWAP props (content/icon-swap, not meaningful states)
    # fallback: parse component names "a=b, c=d"
    if not axes:
        for c in comps:
            for part in c["name"].split(","):
                if "=" in part:
                    k, v = part.split("=", 1)
                    axes.setdefault(k.strip(), set()).add(v.strip())

    # ---- dimensions (group by size axis if present) ----
    size_key = next((k for k in axes if k.lower() in ("size", "small", "scale")), None)
    dims = []
    if comps:
        seen = set()
        for c in comps:
            key = (c["w"], c["h"])
            if key not in seen and c["w"] and c["h"]:
                seen.add(key); dims.append(key)
        dims.sort(key=lambda wh: wh[0] * wh[1], reverse=True)

    rep = max(comps, key=lambda c: c["w"] * c["h"], default=None)

    # ---- specs from text ----
    NOISE = ("read state has a midnight", "key points", "lorem", "rules and states",
             "caption", "both share identical anatomy")
    specs, seen = [], set()
    for ch in texts:
        cl = ch.lower()
        if SPEC_RE.search(ch) and len(ch) < 160 and not ch.startswith(".") \
           and not any(x in cl for x in NOISE):
            if cl not in seen:
                seen.add(cl); specs.append(ch.replace("\n", " "))
    specs = specs[:8]

    # ---- parts ----
    parts = []
    if rep:
        for nm in rep["children"]:
            if nm and not GENERIC_NAME.search(nm) and nm not in parts:
                parts.append(nm)
    parts = parts[:10]

    return {"nid": nid, "axes": axes, "dims": dims, "rep": rep,
            "specs": specs, "parts": parts, "n_comps": len(comps)}

def fmt(slug, a):
    L = []
    if a["axes"]:
        ax = []
        for k, vs in a["axes"].items():
            vals = sorted(v for v in vs if v)
            ax.append(f"`{k}` ({', '.join(vals)})" if vals else f"`{k}`")
        L.append(f"  - **Variants:** {' × '.join(ax)}.")
    if a["dims"]:
        ds = " · ".join(f"{w}×{h}" for w, h in a["dims"][:6])
        L.append(f"  - **Dimensions:** {ds}.")
    rep = a["rep"]
    if rep:
        shape = []
        r = rep.get("r")
        if isinstance(r, (int, float)):
            shape.append("pill/fully-rounded" if r >= 100 else f"corner radius {round(r)}")
        elif rep.get("rr"):
            shape.append("radius " + "/".join(str(round(x)) for x in rep["rr"]))
        if rep.get("sw"):
            shape.append(f"border {round(rep['sw'])}px")
        if shape:
            L.append(f"  - **Shape:** {'; '.join(shape)}.")
    if a["parts"]:
        L.append(f"  - **Anatomy parts:** {' · '.join(a['parts'])}.")
    if a["specs"]:
        L.append("  - **Specs (from Figma):**")
        for s in a["specs"]:
            L.append(f"    - {s}")
    L.append(f"  - **Figma node:** `{a['nid']}`" + ("" if a["n_comps"] else " (no variant component set found)"))
    return "\n".join(L) + "\n"

def main(slugs):
    os.makedirs(ANATOMY, exist_ok=True)
    done = []
    for path in sorted(glob.glob(os.path.join(FIGDIR, "*.json"))):
        slug = os.path.splitext(os.path.basename(path))[0]
        if slug.startswith("_"):
            continue
        if slugs and slug not in slugs:
            continue
        try:
            a = analyze(slug, path)
        except Exception as e:
            print(f"  {slug}: PARSE-ERROR {e}"); continue
        if not a:
            print(f"  {slug}: no document"); continue
        open(os.path.join(ANATOMY, slug + ".md"), "w").write(fmt(slug, a))
        print(f"  {slug}: axes={list(a['axes'])} dims={a['dims'][:3]} specs={len(a['specs'])} parts={len(a['parts'])}")
        done.append(slug)
    print(f"wrote {len(done)} anatomy files")

if __name__ == "__main__":
    main(set(sys.argv[1:]))

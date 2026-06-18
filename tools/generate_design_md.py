#!/usr/bin/env python3
"""Generate design.md from variables.json — resolves all token aliases to concrete
values and maps them onto the component inventory. Output is a Figma-Make-friendly spec."""
import json, os, sys, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VARS = os.path.join(ROOT, "variables.json")
OUT = os.path.join(ROOT, "design.md")
ANATOMY = os.path.join(ROOT, "tools", "anatomy")
FILE_KEY = "IoDxMEgOiOuwfIL5IbJzi5"
FIG = f"https://www.figma.com/design/{FILE_KEY}/e--Consumer-App-DSL-V1.0?node-id="

def slugify(name):
    s = name.lower().replace("&", "and")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")

def is_leaf(n): return isinstance(n, dict) and "$value" in n

def deep_merge(t, s):
    for k, v in s.items():
        if is_leaf(v): t[k] = v
        else:
            t.setdefault(k, {}); deep_merge(t[k], v)

def load_merged(raw):
    m = {}
    for col in raw:
        name = list(col.keys())[0]
        deep_merge(m, col[name]["modes"]["value"])
    return m

def lookup(tree, dotpath):
    node = tree
    for seg in dotpath.split("."):
        if not isinstance(node, dict): return None
        node = node.get(seg)
    return node if is_leaf(node) else None

def resolve(tree, leaf, seen=None):
    seen = seen or set()
    v = leaf["$value"]
    if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
        ref = v[1:-1]
        if ref in seen: raise RuntimeError(f"circular {ref}")
        seen.add(ref)
        tgt = lookup(tree, ref)
        if tgt is None: return v  # unresolved, keep marker
        return resolve(tree, tgt, seen)
    return v

def resolved_tree(tree):
    def walk(node):
        if is_leaf(node): return resolve(tree, node)
        return {k: walk(v) for k, v in node.items()}
    return walk(tree)

WEIGHT_NUM = {"Thin":"100","Light":"300","Regular":"400","Book":"450/500",
              "Medium":"500","Semi bold":"600","Bold":"700","Black":"800"}

def md_tree(d, indent=0):
    out = []
    for k, v in d.items():
        if isinstance(v, dict):
            out.append("  "*indent + f"- **{k}**")
            out += md_tree(v, indent+1)
        else:
            out.append("  "*indent + f"- `{k}` → `{v}`")
    return out

def get(tree, *path):
    node = tree
    for p in path:
        if not isinstance(node, dict): return None
        node = node.get(p)
    return node

# ---- component inventory: (name, node, desc, color_groups, size_groups, typo_groups)
SECTIONS = [
 ("00 · Foundations", []),  # handled separately
 ("01 · Primitives", [
   ("e& Logo","27020-6155","Brand logo lockups (primary, mono, app icon).",[],[],[]),
   ("Badges","22668-60275","Membership/status badges (Gold, Silver, Platinum Blue, Bronze, +).",["badge"],[],["badge"]),
   ("Icon size","25460-22589","Icon sizing scale.",[],["icon"],[]),
   ("Logo row","25996-32494","Row of partner/product logos.",[],[],[]),
   ("Dismiss","","Close / dismiss affordance.",[],[],[]),
   ("Progress bar","26663-89882","Linear progress indicator.",["status"],[],[]),
   ("Add trigger","25752-11470","Add / plus trigger control.",["button"],[],[]),
   ("Product assets","","Product imagery / illustration assets.",[],[],[]),
   ("Atom Surfaces","26729-91998","Base surface atoms (cards/containers).",["atom-surfaces","surface"],[],[]),
 ]),
 ("02 · Controls", [
   ("Buttons","22542-13972","Primary/secondary buttons across tones and states.",["button"],[],["button"]),
   ("Input Field","22609-113539","Text input with label/helper/error states.",["input-field"],["border"],["body"]),
   ("Chips","28171-29640","Selectable chips / tags.",["chips"],[],["body"]),
   ("Filter Pill","25581-9146","Filter pills with selected/unselected states.",["filter-pill"],[],["body"]),
   ("Checkbox","25394-83294","Checkbox control.",["border","icon"],["checkbox"],[]),
   ("Switcher","25394-82591","Toggle switch.",["surface","border"],["switcher"],[]),
   ("Radio","25394-83997","Radio control.",["border","icon"],["radio"],[]),
   ("Searchbar","28114-62397","Search input.",["input-field","surface"],[],["body"]),
   ("AI Search","28189-33142","AI-powered search entry.",["input-field","surface"],[],["body"]),
   ("Selectors","28278-1530","Selector controls (segmented/option pickers).",["surface","border"],[],["body"]),
 ]),
 ("03 · Navigation", [
   ("Top bar","22542-13963","App top/header bar.",["surface","text","icon"],[],["title","heading"]),
   ("Nav bar","22542-13964","Bottom navigation bar.",["navbar-tab"],[],["body"]),
   ("Action bar","25519-15621","Sticky action bar.",["surface","button"],[],["button"]),
   ("Tabs","22542-13966","Tab bar.",["tab"],["tabs"],["title","body"]),
   ("Section link","25460-83978","Section header link / see-all.",["text","icon"],["section-link"],["title","body"]),
   ("Quick Action","25507-13670","Quick action shortcuts grid.",["surface","text","icon"],[],["body"]),
 ]),
 ("04 · Layout", [
   ("Section","25519-12055","Content section container + header.",["surface","text"],["section"],["heading","title"]),
   ("Accordion","27465-29326","Expand/collapse accordion.",["surface","text","border","icon"],[],["title","body"]),
 ]),
 ("05 · Feedback & Status", [
   ("Plan Usage Bar","26663-89880","Plan/data usage meter.",["status","surface","text"],[],["body"]),
   ("Snackbar & Alert msg","22574-22808","Snackbars and inline alerts.",["status","surface","text"],[],["body"]),
   ("Alert Modals","23201-17897","Modal alerts/dialogs.",["status","surface","text"],[],["title","body"]),
 ]),
 ("06 · Overlays", [
   ("Tooltip","23201-15868","Tooltip / coachmark.",["surface","text"],[],["body"]),
   ("Bottom sheet","27907-11716","Bottom sheet container.",["surface","text"],[],["title","body"]),
 ]),
 ("07 · Cards", [
   ("General","26760-100129","General-purpose card.",["surface","border","text"],["card"],["title","body"]),
   ("Product","25701-12472","Product card.",["surface","border","text"],["card"],["title","body"]),
   ("Deals for you","25717-33323","Deals card.",["surface","border","text"],["card"],["title","body"]),
   ("Plans","25915-74211","Plan card.",["surface","border","text"],["card"],["title","body"]),
   ("New on e&","25915-75766","'New on e&' card.",["surface","border","text"],["card"],["title","body"]),
   ("Recommendation","","Recommendation card.",["surface","border","text"],["card"],["title","body"]),
   ("Service","26019-79144","Service card.",["surface","border","text"],["card"],["title","body"]),
 ]),
 ("08 · Banners", [
   ("Highlight","25460-83982","Highlight / promo banner.",["surface","text","button"],[],["heading","body"]),
 ]),
 ("09 · Product-Specific", [
   ("Smiles Balance","26610-601","Smiles loyalty balance module.",["special","surface","text"],[],["title","body"]),
   ("Voucher","28278-13069","Voucher / coupon.",["special","surface","text","border"],[],["title","body"]),
 ]),
]

def main():
    raw = json.load(open(VARS))
    merged = load_merged(raw)
    R = resolved_tree(merged)
    L = []
    w = L.append

    w("# e& Consumer App DSL — Design Spec\n")
    w("> Auto-generated from `variables.json` (Figma Variables, fully resolved). "
      "Token values are exact and 1-1 with the Figma design system. Use this as the "
      "source spec when prompting **Figma Make**.\n")
    w("## How to use with Figma Make\n")
    w("1. Paste the **Global foundations** section so Make has the color/type/spacing scales.\n"
      "2. For each component, paste its section (variants, states, and the exact mapped tokens).\n"
      "3. Each component links to its Figma node (`node-id`) for visual reference.\n"
      "4. System is **light-only**; `inverse/*` tokens are for content on dark/brand surfaces. "
      "Bilingual: Latin + `aed/*` (Arabic, RTL).\n")
    w(f"- Figma file: `{FILE_KEY}` — node links: `{FIG}<node-id>`\n")

    # ---------- Foundations ----------
    w("\n---\n\n## Global foundations\n")

    w("### Color — primitive ramps\n")
    for hue, ramp in R["color"].items():
        if not isinstance(ramp, dict): continue
        if hue in ("surface","text","border","button","tab","filter-pill","status",
                   "badge","mark","atom-surfaces","input-field","chips","navbar-tab"): continue
        if hue == "special":
            w(f"- **special** (membership/loyalty palettes): {', '.join(ramp.keys())}")
            continue
        swatches = ", ".join(f"`{k}`={v}" for k, v in ramp.items() if not isinstance(v, dict))
        w(f"- **{hue}**: {swatches}")

    w("\n### Color — semantic\n")
    for cat in ("surface","text","icon","border","status"):
        node = R["color"].get(cat)
        if not node: continue
        w(f"\n**{cat}**")
        L.extend(md_tree(node, 1))

    w("\n### Typography (Latin ramp)\n")
    w("| style | size px | weight | line-height | letter-spacing | family |")
    w("|---|---|---|---|---|---|")
    typo = R["typography"]
    def emit_typo(prefix, node):
        for k, v in node.items():
            if isinstance(v, dict) and "font-size" in v:
                fam = v.get("font-family","")
                wt = str(v.get("font-weight",""))
                num = WEIGHT_NUM.get(wt, "")
                lh = v.get("line-height","")
                ls = v.get("letter-spacing","")
                w(f"| {prefix}{k} | {v.get('font-size')} | {wt} ({num}) | {lh} | {ls} | {fam} |")
            elif isinstance(v, dict):
                emit_typo(f"{prefix}{k}.", v)
    for cat, node in typo.items():
        if cat == "aed": continue
        emit_typo(f"{cat}.", node)
    w("\n> Arabic ramp mirrors these as `aed/<style>` (same scale; family currently Suisse Int'l, distinct Arabic face TBD).\n")

    w("\n### Spacing scale\n")
    w(", ".join(f"`{k}`={v}" for k, v in R["spacing"].items()))
    w("\n### Border radius\n")
    w(", ".join(f"`{k}`={v}" for k, v in R["border-radius"].items()))
    w("\n### Icon sizes\n")
    w(", ".join(f"`{k}`={v}" for k, v in R["icon"].items()))

    # ---------- Components ----------
    w("\n\n---\n\n## Components\n")
    w("> For each: Figma node, role, and the **exact mapped tokens** (resolved values). "
      "Variant/state structure is read directly from the token groups. "
      "Items marked _anatomy: needs Figma extraction_ have no dedicated token group — "
      "they use the shared semantic tokens above; their precise layout should be pulled from the Figma node.\n")

    for section, comps in SECTIONS:
        if not comps: continue
        w(f"\n### {section}\n")
        for name, node, desc, cgroups, sgroups, tgroups in comps:
            link = f"[`{node}`]({FIG}{node})" if node else "_node-id TBD_"
            w(f"\n#### {name}")
            w(f"- **Figma:** {link}")
            w(f"- **Role:** {desc}")
            mapped = False
            for g in cgroups:
                node_data = R["color"].get(g)
                if node_data and isinstance(node_data, dict):
                    w(f"- **Color tokens — `color.{g}`:**")
                    L.extend(md_tree(node_data, 1)); mapped = True
            for g in sgroups:
                node_data = R.get(g)
                if node_data and isinstance(node_data, dict):
                    w(f"- **Size tokens — `{g}`:**")
                    L.extend(md_tree(node_data, 1)); mapped = True
            if tgroups:
                styles = []
                for g in tgroups:
                    tn = R["typography"].get(g)
                    if isinstance(tn, dict):
                        for sz, props in tn.items():
                            if isinstance(props, dict) and "font-size" in props:
                                styles.append(f"`{g}.{sz}`({props.get('font-size')}/{props.get('font-weight')})")
                if styles:
                    w(f"- **Typography:** {', '.join(styles)}")
            apath = os.path.join(ANATOMY, slugify(name) + ".md")
            if os.path.exists(apath):
                w("- **Anatomy (from Figma):**")
                w(open(apath).read().rstrip())
            else:
                note = "" if (mapped or tgroups) else " (no dedicated token group; uses shared semantic tokens)"
                w(f"- _anatomy: pending Figma extraction{note}._")

    open(OUT, "w").write("\n".join(L) + "\n")
    print(f"Wrote {OUT} ({len(L)} lines)")

if __name__ == "__main__":
    main()

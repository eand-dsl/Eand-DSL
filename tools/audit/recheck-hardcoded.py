#!/usr/bin/env python3
"""Recheck: find hardcoded numeric style values that a design token could express.

Scans src/components for inline-style numeric literals and reports which ones map onto
a Figma-backed token collection (spacing / scale / borderRadius / icon). Pairs with
component-map.json's VARIANT-DRIFT verdicts to separate the two failure modes:

  value drift  — the number disagrees with, or bypasses, its token   (this script)
  axis drift   — the code collapses a Figma variant axis             (component-map.json)

Dev-time only. Run:  python3 tools/audit/recheck-hardcoded.py
"""
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "packages" / "react-design-system" / "src"
TOKENS_TS = SRC / "tokens" / "tokens.ts"
MAP_JSON = ROOT / "tools" / "audit" / "v1.1" / "component-map.json"

# CSS properties worth tokenising, and the collection each should draw from
PROP_COLLECTION = {
    "borderRadius": "borderRadius",
    "gap": "spacing", "padding": "spacing", "paddingTop": "spacing", "paddingBottom": "spacing",
    "paddingLeft": "spacing", "paddingRight": "spacing", "marginTop": "spacing",
    "marginBottom": "spacing", "rowGap": "spacing", "columnGap": "spacing",
    "width": "scale", "height": "scale", "minHeight": "scale", "minWidth": "scale",
    "maxWidth": "scale", "maxHeight": "scale", "fontSize": "scale",
}
DECL = re.compile(r"\b(" + "|".join(PROP_COLLECTION) + r")\s*:\s*(\d+)\b")
# Component boundaries so findings can be attributed
FUNC = re.compile(r"^export function ([A-Z][A-Za-z0-9]*)", re.M)


def _flatten(node, prefix: str = "") -> dict[str, float]:
    """Collections nest (section.body.height.row-2), so flatten to dotted keys."""
    out: dict[str, float] = {}
    if isinstance(node, dict):
        for k, v in node.items():
            out.update(_flatten(v, f"{prefix}.{k}" if prefix else k))
    else:
        m = re.match(r"^(\d+(?:\.\d+)?)px$", str(node))
        if m:
            out[prefix] = float(m.group(1))
    return out


def load_tokens() -> dict[str, dict[str, float]]:
    text = TOKENS_TS.read_text()
    raw = json.loads(re.search(r"= (\{.*\}) as const", text, re.S).group(1))
    # Height/width literals are frequently row tokens, not raw scale steps — check both.
    return {coll: _flatten(raw.get(coll) or {}) for coll in
            ("spacing", "scale", "borderRadius", "icon", "section", "card", "rem")}


def owner_at(names: list[tuple[int, str]], pos: int) -> str:
    found = "(module)"
    for start, name in names:
        if start <= pos:
            found = name
        else:
            break
    return found


def main() -> None:
    tokens = load_tokens()
    variant_drift: dict[str, bool] = {}
    if MAP_JSON.exists():
        data = json.loads(MAP_JSON.read_text())
        for e in data["audited"]:
            if e.get("reactExport"):
                variant_drift[e["reactExport"]] = (
                    variant_drift.get(e["reactExport"], False) or "VARIANT-DRIFT" in e["verdicts"]
                )

    findings: dict[str, list[str]] = defaultdict(list)
    untokenised = 0
    for path in sorted(SRC.rglob("*.tsx")):
        if path.name.endswith(".test.tsx"):
            continue
        text = path.read_text()
        names = [(m.start(), m.group(1)) for m in FUNC.finditer(text)]
        for m in DECL.finditer(text):
            prop, num = m.group(1), float(m.group(2))
            # A 0 is a reset, not a spacing decision
            if num == 0:
                continue
            primary = PROP_COLLECTION[prop]
            # Prefer the property's own collection, then row/card tokens for box sizes
            order = [primary] + [c for c in ("section", "card", "rem", "scale") if c != primary]
            hit = next(((c, k) for c in order for k, v in tokens[c].items() if v == num), None)
            line = text.count("\n", 0, m.start()) + 1
            comp = owner_at(names, m.start())
            if hit:
                coll, key = hit
                mark = "" if coll == primary else "  *"
                findings[comp].append(
                    f"{path.name}:{line}  {prop}: {int(num)}  -> {coll}.{key}{mark}")
                untokenised += 1
            else:
                findings[comp].append(
                    f"{path.name}:{line}  {prop}: {int(num)}  -> NO TOKEN")
    print("=" * 78)
    print("RECHECK — hardcoded numeric style values that a token could express")
    print("=" * 78)
    for comp in sorted(findings):
        flag = "  [VARIANT-DRIFT per audit]" if variant_drift.get(comp) else ""
        print(f"\n{comp}{flag}")
        for f in findings[comp]:
            print(f"   {f}")
    print(f"\n{'-' * 78}")
    print(f"components with hardcoded values : {len(findings)}")
    print(f"total literals                   : {sum(len(v) for v in findings.values())}")
    print(f"  of which a token exists for    : {untokenised}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Build component-map.json — the DS reconciliation inventory.

Harvests the V1.1 audit drift tables (tools/audit/v1.1/0*.md, 10-*.md), which all share
one schema:

    | Component | Figma node (V1.1) | Flag | Figma spec | Code (export/props) | Anatomy file | Verdict | Action |

and joins them against the React exports and the Code Connect mappings, producing one
entry per audited component.

Dev-time only; output is committed. Run:

    python3 tools/audit/build-component-map.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
AUDIT_DIR = ROOT / "tools" / "audit" / "v1.1"
SRC_DIR = ROOT / "packages" / "react-design-system" / "src" / "components"
CODE_CONNECT_DIR = ROOT / "packages" / "react-design-system" / "code-connect"
OUT = AUDIT_DIR / "component-map.json"

# A markdown table cell boundary: a pipe not escaped as \|
CELL_SPLIT = re.compile(r"(?<!\\)\|")
NODE_ID = re.compile(r"\b(\d{4,6}:\d{1,7})\b")
# `name` optionally followed by **node** or node — captures atom name/id pairs
NAMED_NODE = re.compile(r"`([^`]+)`\s*\*{0,2}(\d{4,6}:\d{1,7})\*{0,2}")
BACKTICKED = re.compile(r"`([^`]+)`")
VERDICTS = (
    "VISUAL-DRIFT", "VARIANT-DRIFT", "TOKEN-DRIFT", "STALE-ANATOMY",
    "MISSING-IN-CODE", "REMOVED-IN-FIGMA", "OK",
)


def react_exports() -> dict[str, str]:
    """Map exported component name -> source file, across src/components."""
    out: dict[str, str] = {}
    for path in sorted(SRC_DIR.rglob("*.tsx")):
        if path.name.endswith(".test.tsx"):
            continue
        rel = path.relative_to(ROOT).as_posix()
        for name in re.findall(r"^export function ([A-Z][A-Za-z0-9]*)", path.read_text(), re.M):
            out[name] = rel
    return out


def code_connect_map() -> dict[str, dict]:
    """Map React component name -> its .figma.tsx file and connected node ids."""
    out: dict[str, dict] = {}
    for path in sorted(CODE_CONNECT_DIR.glob("*.figma.tsx")):
        text = path.read_text()
        nodes = re.findall(r"node-id=(\d{4,6}-\d{1,7})", text)
        for name in re.findall(r"figma\.connect\(\s*([A-Z][A-Za-z0-9]*)", text):
            entry = out.setdefault(name, {"file": path.relative_to(ROOT).as_posix(), "nodes": []})
            entry["nodes"] = sorted({n.replace("-", ":") for n in nodes + entry["nodes"]})
    return out


def split_row(line: str) -> list[str]:
    cells = [c.strip() for c in CELL_SPLIT.split(line.strip())]
    # A leading/trailing pipe produces empty edge cells
    if cells and not cells[0]:
        cells = cells[1:]
    if cells and not cells[-1]:
        cells = cells[:-1]
    return [c.replace(r"\|", "|") for c in cells]


def parse_section(path: Path) -> list[dict]:
    rows: list[dict] = []
    # Drift tables are split into several blocks separated by blank lines, so the header
    # appears once per file, not once per block. Stay "in table" for the rest of the file.
    seen_header = False
    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped.startswith("|"):
            continue
        cells = split_row(stripped)
        if len(cells) < 8:
            continue
        if cells[0].lower() == "component":
            seen_header = True
            continue
        if set(cells[0]) <= {"-", ":", " "}:  # separator row
            continue
        if not seen_header:
            continue

        component, node_cell, flag, figma_spec, code_cell, anatomy, verdict_cell, action = cells[:8]

        atoms = [{"name": n, "node": nid} for n, nid in NAMED_NODE.findall(node_cell)]
        all_nodes = NODE_ID.findall(node_cell)
        atom_nodes = {a["node"] for a in atoms}
        # The primary node is the first bolded id, else the first id not claimed by an atom
        bold = re.findall(r"\*\*(\d{4,6}:\d{1,7})\*\*", node_cell)
        primary = bold[0] if bold else next((n for n in all_nodes if n not in atom_nodes), None)
        if primary is None and all_nodes:
            primary = all_nodes[0]

        export = None
        m = BACKTICKED.search(code_cell)
        if m and re.fullmatch(r"[A-Z][A-Za-z0-9]*", m.group(1)):
            export = m.group(1)

        rows.append({
            "section": path.stem,
            "component": component,
            "figmaNode": primary,
            "atoms": atoms,
            "allNodes": sorted(set(all_nodes)),
            "flag": flag or None,
            "reactExport": export,
            # Word-boundary match: plain `in` makes "OK" a false positive inside "TOKEN-DRIFT"
            "verdicts": [v for v in VERDICTS
                         if re.search(rf"(?<![A-Z-]){re.escape(v)}(?![A-Z-])", verdict_cell)],
            "anatomyFile": anatomy or None,
            "action": action or None,
        })
    return rows


def main() -> None:
    exports = react_exports()
    connected = code_connect_map()

    entries: list[dict] = []
    for path in sorted(AUDIT_DIR.glob("*.md")):
        if not re.match(r"^(0\d|10)-", path.name):
            continue
        for row in parse_section(path):
            export = row["reactExport"]
            row["sourceFile"] = exports.get(export) if export else None
            row["exportExists"] = bool(export and export in exports)
            cc = connected.get(export) if export else None
            row["codeConnect"] = cc["file"] if cc else None
            row["codeConnectNodes"] = cc["nodes"] if cc else []
            entries.append(row)

        # Components with a mapping but no audit row still belong in the inventory
    audited_exports = {e["reactExport"] for e in entries if e["reactExport"]}
    unaudited = [
        {"section": None, "component": name, "figmaNode": None, "atoms": [], "allNodes": [],
         "flag": None, "reactExport": name, "verdicts": [], "anatomyFile": None, "action": None,
         "sourceFile": src, "exportExists": True,
         "codeConnect": connected.get(name, {}).get("file"),
         "codeConnectNodes": connected.get(name, {}).get("nodes", [])}
        for name, src in sorted(exports.items()) if name not in audited_exports
    ]

    payload = {
        "generatedBy": "tools/audit/build-component-map.py",
        "figmaFile": {
            "original": "pzm63BTLfPfT1stcF89ILQ",
            "cleanNameCopy": "m8r6Q0MSCDxtSn8vF3u0xw",
            "note": "Code Connect targets `original`; layer names there are dot-prefixed. "
                    "`cleanNameCopy` is a read-only lens and is NOT published as a library.",
        },
        "counts": {
            "auditedRows": len(entries),
            "reactExports": len(exports),
            "exportsWithAuditRow": len(audited_exports & set(exports)),
            "exportsWithoutAuditRow": len(unaudited),
            "exportsWithCodeConnect": len(connected),
        },
        "audited": entries,
        "unaudited": unaudited,
    }
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    c = payload["counts"]
    print(f"wrote {OUT.relative_to(ROOT)}")
    print(f"  audited rows          {c['auditedRows']}")
    print(f"  react exports         {c['reactExports']}")
    print(f"  exports w/ audit row  {c['exportsWithAuditRow']}")
    print(f"  exports w/o audit row {c['exportsWithoutAuditRow']}")
    print(f"  exports w/ CodeConnect{c['exportsWithCodeConnect']:>4}")


if __name__ == "__main__":
    main()

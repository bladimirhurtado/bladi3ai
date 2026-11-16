#!/usr/bin/env python3
"""Build a conservative, read-only relationship graph for ARK zone assets.

This is a discovery aid, not a UE package serializer. It never edits source assets.
String matches are labelled as candidates, not verified object references.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
from collections import defaultdict
from pathlib import Path

ZONE_ALIASES = {
    "redwood": ("redwood", "redwoods", "redwoodforest", "redwoodforests"),
    "swamp": ("swamp", "swamps", "writhingswamps"),
    "snow": ("snow", "snowbiome", "ice"),
    "mountain": ("mountain", "mountains", "farspeak"),
    "jungle": ("jungle", "jungles", "southernjungle"),
    "beach": ("beach", "shore", "shores", "southernislets"),
    "ocean": ("ocean", "deepwater", "darkwater", "shallowwater"),
    "grassland": ("grassland", "easternplains", "plains"),
}

def printable_strings(data: bytes, minimum: int = 4) -> set[str]:
    found: set[str] = set()
    # ASCII/UTF-8-like runs
    for match in re.finditer(rb"[\x20-\x7e]{" + str(minimum).encode() + rb",}", data):
        found.add(match.group().decode("ascii", "replace"))
    # Unreal name/path strings are often UTF-16LE
    for match in re.finditer(rb"(?:[\x20-\x7e]\x00){" + str(minimum).encode() + rb",}", data):
        found.add(match.group().decode("utf-16-le", "replace"))
    return found

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def classify(text: str) -> list[str]:
    low = text.lower().replace("_", "").replace("-", "")
    return [zone for zone, aliases in ZONE_ALIASES.items()
            if any(alias in low for alias in aliases)]

def main() -> int:
    ap = argparse.ArgumentParser(description="Reconstruye relaciones candidatas de zonas ARK; solo lectura.")
    ap.add_argument("--biomes", required=True, help="Archivo .umap o .uexp de Biomes")
    ap.add_argument("--spawns", required=True, help="Archivo .umap o .uexp de DinoSpawns")
    ap.add_argument("--inventory", help="Inventario pakchunk*_lista.txt opcional")
    ap.add_argument("--out", default="analisis/zonas_relaciones", help="Prefijo de salida")
    args = ap.parse_args()

    sources = {"biomes": Path(args.biomes).expanduser(), "spawns": Path(args.spawns).expanduser()}
    if args.inventory:
        sources["inventory"] = Path(args.inventory).expanduser()
    for label, path in sources.items():
        if not path.is_file():
            ap.error(f"No existe {label}: {path}")

    records = []
    for label in ("biomes", "spawns"):
        path = sources[label]
        for value in sorted(printable_strings(path.read_bytes())):
            zones = classify(value)
            if zones:
                records.append({"source": label, "file": str(path), "value": value,
                                "zones": zones, "evidence": "string_match_candidate"})

    inventory_hits = []
    if "inventory" in sources:
        for line_no, line in enumerate(sources["inventory"].read_text(
                encoding="utf-8", errors="replace").splitlines(), 1):
            value = line.strip()
            zones = classify(value)
            if zones:
                inventory_hits.append({"line": line_no, "path": value, "zones": zones,
                                       "evidence": "inventory_path_name_candidate"})

    graph = defaultdict(lambda: {"biomes_strings": [], "spawns_strings": [], "inventory_paths": []})
    for item in records:
        key = item["source"] + "_strings"
        for zone in item["zones"]:
            graph[zone][key].append(item["value"])
    for item in inventory_hits:
        for zone in item["zones"]:
            graph[zone]["inventory_paths"].append(item["path"])

    output = Path(args.out).expanduser()
    output.parent.mkdir(parents=True, exist_ok=True)
    report = {
        "tool": "ARK Zone Relationship Builder",
        "version": "0.1.1",
        "mode": "read_only",
        "sources": {name: {"path": str(path.resolve()), "bytes": path.stat().st_size,
                           "sha256": sha256(path)} for name, path in sources.items()},
        "zones": dict(sorted(graph.items())),
        "summary": {"zones_with_candidates": len(graph), "biome_string_candidates": sum(len(v["biomes_strings"]) for v in graph.values()), "spawn_string_candidates": sum(len(v["spawns_strings"]) for v in graph.values()), "inventory_path_candidates": sum(len(v["inventory_paths"]) for v in graph.values())},
        "string_candidates": records,
        "inventory_candidates": inventory_hits,
        "limitations": [
            "Las coincidencias de cadenas/nombres no demuestran referencias UObject ni relaciones espaciales.",
            "No decodifica tablas completas de imports/exports ni propiedades serializadas.",
            "No modifica .umap, .uasset, .uexp ni el PAK.",
            "La escritura de cambios reales requiere un serializador UE compatible y validación en el juego."
        ]
    }
    json_path = output.with_suffix(".json")
    csv_path = output.with_suffix(".csv")
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["zone", "source", "candidate", "evidence"])
        writer.writeheader()
        for item in records:
            for zone in item["zones"]:
                writer.writerow({"zone": zone, "source": item["source"],
                                 "candidate": item["value"], "evidence": item["evidence"]})
        for item in inventory_hits:
            for zone in item["zones"]:
                writer.writerow({"zone": zone, "source": "inventory",
                                 "candidate": item["path"], "evidence": item["evidence"]})

    print("ARK Zone Relationship Builder 0.1.1 — solo lectura")
    print("Zonas con candidatos:", len(graph))
    for zone, values in sorted(graph.items()):
        print(f"- {zone}: biomes={len(values['biomes_strings'])}, "
              f"spawns={len(values['spawns_strings'])}, inventory={len(values['inventory_paths'])}")
    print("JSON:", json_path.resolve())
    print("CSV:", csv_path.resolve())
    print("Originales intactos; relaciones todavía candidatas.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

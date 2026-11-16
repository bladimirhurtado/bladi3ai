#!/usr/bin/env python3
"""Combine ARK MAP LAB and Zone Relationship Builder reports.

Read-only integration layer: consumes JSON reports and writes a new summary.
It does not parse or modify Unreal packages, PAK files, or source reports.
All string/path matches remain candidates, never verified object references.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

VERSION = "0.1.0"


def load_json(path: Path, label: str) -> dict[str, Any]:
    if not path.is_file():
        raise ValueError(f"No existe {label}: {path}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"No se puede leer {label} como JSON válido: {exc}") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{label} debe contener un objeto JSON")
    return value


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def nonnegative_int(value: Any) -> int:
    return value if isinstance(value, int) and not isinstance(value, bool) and value >= 0 else 0


def integrate(map_report: dict[str, Any], zone_report: dict[str, Any],
              map_path: Path, zone_path: Path) -> dict[str, Any]:
    categories = map_report.get("conteo_categorias", {})
    if not isinstance(categories, dict):
        categories = {}
    summary = zone_report.get("summary", {})
    if not isinstance(summary, dict):
        summary = {}
    zones = zone_report.get("zones", {})
    if not isinstance(zones, dict):
        zones = {}

    normalized_zones = {}
    for name, data in sorted(zones.items()):
        if not isinstance(data, dict):
            continue
        normalized_zones[name] = {
            "biome_string_candidates": len(data.get("biomes_strings", []))
                if isinstance(data.get("biomes_strings", []), list) else 0,
            "spawn_string_candidates": len(data.get("spawns_strings", []))
                if isinstance(data.get("spawns_strings", []), list) else 0,
            "inventory_path_candidates": len(data.get("inventory_paths", []))
                if isinstance(data.get("inventory_paths", []), list) else 0,
            "evidence_level": "candidate_only",
        }

    map_candidate_count = nonnegative_int(map_report.get("candidatos"))
    unique_resources = nonnegative_int(map_report.get("recursos_unicos"))
    inventory_candidates = nonnegative_int(summary.get("inventory_path_candidates"))

    return {
        "tool": "ARK Ecosystem Integrator",
        "version": VERSION,
        "mode": "read_only",
        "evidence_policy": "candidate_matches_are_not_verified_object_references",
        "sources": {
            "ark_map_lab": {
                "path": str(map_path.resolve()),
                "sha256": sha256(map_path),
                "version": str(map_report.get("version", "unknown")),
            },
            "zone_relationship_builder": {
                "path": str(zone_path.resolve()),
                "sha256": sha256(zone_path),
                "version": str(zone_report.get("version", "unknown")),
            },
        },
        "map_inventory": {
            "unique_resources": unique_resources,
            "named_candidates": map_candidate_count,
            "category_counts": {
                str(key): nonnegative_int(value) for key, value in sorted(categories.items())
            },
        },
        "zone_candidates": normalized_zones,
        "cross_report_checks": {
            "zone_inventory_candidates": inventory_candidates,
            "map_lab_has_inventory_hash": bool(map_report.get("sha256_inventario")),
            "zone_builder_has_inventory_source": "inventory" in zone_report.get("sources", {}),
            "interpretation": (
                "Los informes describen inventarios y coincidencias por nombre. "
                "No prueban que un recurso esté enlazado a una zona mediante referencias UObject."
            ),
        },
        "limitations": [
            "No se decodifican tablas completas de imports/exports ni propiedades serializadas.",
            "No se verifican referencias UObject ni relaciones espaciales.",
            "No se modifican PAK, UMAP, UASSET, UEXP ni los informes de entrada.",
            "Este informe no autoriza cambios en el juego; se necesita un parser/serializador UE compatible."
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Integra informes ARK MAP LAB y Zone Relationship Builder; solo lectura."
    )
    parser.add_argument("--map-summary", required=True, help="JSON mapa_resumen.json de ARK MAP LAB")
    parser.add_argument("--zone-report", required=True, help="JSON generado por Zone Relationship Builder")
    parser.add_argument("--out", default="analisis/mapa/ark_ecosystem", help="Prefijo de salida")
    args = parser.parse_args()

    map_path = Path(args.map_summary).expanduser()
    zone_path = Path(args.zone_report).expanduser()
    try:
        map_report = load_json(map_path, "map-summary")
        zone_report = load_json(zone_path, "zone-report")
        result = integrate(map_report, zone_report, map_path, zone_path)
    except ValueError as exc:
        parser.error(str(exc))

    output = Path(args.out).expanduser()
    output.parent.mkdir(parents=True, exist_ok=True)
    json_path = output.with_suffix(".json")
    json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n",
                         encoding="utf-8")
    print(f"ARK Ecosystem Integrator {VERSION} — solo lectura")
    print("Recursos únicos:", result["map_inventory"]["unique_resources"])
    print("Candidatos del mapa:", result["map_inventory"]["named_candidates"])
    print("Zonas con candidatos:", len(result["zone_candidates"]))
    print("JSON:", json_path.resolve())
    print("Informes originales intactos; coincidencias siguen siendo candidatas.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

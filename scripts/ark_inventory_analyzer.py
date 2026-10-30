#!/usr/bin/env python3
"""REA ARK inventory analyzer: read-only cross-check of CSV/TXT reports."""
from __future__ import annotations
import argparse, csv, json, os
from collections import Counter, defaultdict
from pathlib import Path

INTEREST = {
    "criaturas_y_animales": ("dino", "creature", "tamed", "wild", "dinosaur"),
    "personajes_y_jugadores": ("character", "player", "human", "male", "female"),
    "inventario_y_objetos": ("inventory", "item", "engram", "consumable", "resource"),
    "construccion": ("structure", "building", "foundation", "wall", "door"),
    "armas_y_combate": ("weapon", "ammo", "rifle", "bow", "spear", "grenade"),
    "logica_del_juego": ("gamemode", "gamestate", "primal", "blueprint", "coreai"),
    "mapas_y_escenarios": ("\.umap", "dungeon", "cave", "landscape", "mobile"),
}
GROUPS = {
    "paquetes_uasset": {".uasset"},
    "datos_uexp": {".uexp"},
    "datos_bulk": {".ubulk"},
    "mapas": {".umap"},
    "configuracion": {".ini"},
    "plugins": {".uplugin"},
    "proyecto": {".uproject"},
    "localizacion": {".locres", ".locmeta"},
    "imagenes_fuentes": {".png", ".ttf", ".ufont"},
    "otros": set(),
}

def main():
    p = argparse.ArgumentParser(description="Cruza el inventario PAK de ARK con el informe de componentes; solo lectura.")
    p.add_argument("csv_file", help="Ruta de ARK-inventario.csv")
    p.add_argument("--components", help="Ruta de ARK-componentes.txt (opcional)")
    p.add_argument("--out", default="ARK-REA-analisis", help="Prefijo de los informes de salida")
    a = p.parse_args()
    csv_path = Path(a.csv_file).expanduser()
    if not csv_path.is_file():
        p.error(f"No existe el CSV: {csv_path}")
    rows = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames or not {"ruta", "original"}.issubset(set(reader.fieldnames)):
            p.error(f"CSV con columnas inesperadas. Columnas encontradas: {reader.fieldnames}")
        for n, row in enumerate(reader, 1):
            try:
                size = int(row["original"])
            except (TypeError, ValueError):
                p.error(f"Tamaño inválido en la fila {n}: {row.get('original')!r}")
            path = row["ruta"].replace("\\", "/")
            rows.append({"ruta": path, "original": size, "ext": Path(path).suffix.lower(), "row": row})
    if not rows:
        p.error("El CSV no contiene entradas.")
    counts = Counter(x["ext"] or "[sin extensión]" for x in rows)
    bytes_by_ext = Counter()
    for x in rows:
        bytes_by_ext[x["ext"] or "[sin extensión]"] += x["original"]
    groups = {}
    for name, exts in GROUPS.items():
        selected = [x for x in rows if x["ext"] in exts] if exts else [
            x for x in rows if x["ext"] not in set().union(*GROUPS.values())
        ]
        groups[name] = {"files": len(selected), "declared_bytes": sum(x["original"] for x in selected)}
    hits = defaultdict(list)
    for x in rows:
        low = x["ruta"].lower()
        for category, terms in INTEREST.items():
            if any(term in low for term in terms):
                hits[category].append({"ruta": x["ruta"], "bytes": x["original"], "extension": x["ext"]})
    comp = Path(a.components).expanduser() if a.components else None
    comp_status = "not_supplied"
    comp_bytes = None
    if comp:
        if comp.is_file():
            comp_status = "present_readable"
            comp_bytes = comp.stat().st_size
        else:
            comp_status = "not_found"
    largest = sorted(rows, key=lambda x: x["original"], reverse=True)[:100]
    report = {
        "tool": "REA ARK Inventory Analyzer",
        "mode": "read_only",
        "csv": str(csv_path.resolve()),
        "csv_rows": len(rows),
        "component_report": {"path": str(comp.resolve()) if comp and comp.exists() else str(comp) if comp else None,
                             "status": comp_status, "size_bytes": comp_bytes},
        "groups": groups,
        "extensions": [{"extension": k, "files": counts[k], "declared_bytes": bytes_by_ext[k]}
                       for k in sorted(counts, key=lambda z: (-counts[z], z))],
        "interest_candidates": dict(hits),
        "largest_files": [{"ruta": x["ruta"], "bytes": x["original"], "extension": x["ext"]} for x in largest],
        "limitations": [
            "El inventario describe metadatos del índice; no decodifica contenido UAsset/UEXP.",
            "Las coincidencias por nombre son candidatos, no prueba de función.",
            "No se extraen ni modifican archivos del PAK."
        ]
    }
    out = Path(a.out)
    json_path = out.with_suffix(".json")
    txt_path = out.with_suffix(".txt")
    json_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    lines = [
        "REA — INFORME DE ANALISIS DEL INVENTARIO ARK",
        f"Entradas CSV validadas: {len(rows)}",
        f"Informe de componentes: {comp_status}" + (f" ({comp_bytes} bytes)" if comp_bytes is not None else ""),
        "",
        "CLASIFICACION POR GRUPOS"
    ]
    for name, info in groups.items():
        lines.append(f"{name}: {info['files']} archivos | {info['declared_bytes']} bytes")
    lines += ["", "EXTENSIONES PRINCIPALES"]
    for item in report["extensions"][:25]:
        lines.append(f"{item['extension']}: {item['files']} archivos | {item['declared_bytes']} bytes")
    lines += ["", "CANDIDATOS POR AREA (coincidencia de ruta; requiere validacion)"]
    for category, items in hits.items():
        lines.append(f"\n[{category}] {len(items)} coincidencias")
        lines.extend(f"- {x['ruta']} | {x['bytes']} bytes" for x in items[:80])
        if len(items) > 80:
            lines.append(f"... {len(items)-80} más; consultar JSON")
    lines += ["", "LIMITES"]
    lines.extend(f"- {x}" for x in report["limitations"])
    txt_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("REA ARK: análisis completado (solo lectura)")
    print(f"Entradas validadas: {len(rows)}")
    print(f"Informe TXT: {txt_path.resolve()}")
    print(f"Informe JSON: {json_path.resolve()}")
    print("No se extrajo ni modificó el PAK.")

if __name__ == "__main__":
    main()

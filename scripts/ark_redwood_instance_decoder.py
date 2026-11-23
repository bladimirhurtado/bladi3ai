#!/usr/bin/env python3
"""Read-only Redwood foliage/landscape package inspector using uasset_read.

This tool does not edit packages. It inventories likely Redwood foliage/landscape
assets from an existing PAK listing and, when extracted packages are supplied,
uses uasset_read to report exports, imports, relations, properties and transforms.
"""
from __future__ import annotations

import argparse
import dataclasses
import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

TERMS = re.compile(
    r"redwood|redwoods|foliage|instanced|hierarchicalinstanced|"
    r"landscape|tree|forest|vegetation|staticmesh|spline|grass|fern|bush",
    re.IGNORECASE,
)
INSTANCE_CLASSES = re.compile(
    r"foliage|instancedstaticmesh|hierarchicalinstancedstaticmesh|"
    r"landscapecomponent|staticmeshcomponent",
    re.IGNORECASE,
)
TRANSFORM_KEYS = {
    "relativeLocation", "relativeRotation", "relativeScale3D",
    "componentToWorld", "worldTransform", "instanceTransforms",
    "perInstanceSMData", "instances", "location", "rotation", "scale",
    "transform", "translation",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def jsonable(value: Any) -> Any:
    if dataclasses.is_dataclass(value):
        return {k: jsonable(v) for k, v in dataclasses.asdict(value).items()}
    if isinstance(value, dict):
        return {str(k): jsonable(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [jsonable(v) for v in value]
    if hasattr(value, "value") and not isinstance(value, (str, bytes, int, float, bool)):
        try:
            return jsonable(value.value)
        except Exception:
            pass
    if isinstance(value, bytes):
        return {"bytes_hex_prefix": value[:96].hex(), "bytes_total": len(value)}
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def walk_keys(value: Any, path: str = "$"):
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key in TRANSFORM_KEYS or re.search(r"transform|location|rotation|scale|instance", key, re.I):
                yield {"path": child_path, "key": key, "value": child}
            yield from walk_keys(child, child_path)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_keys(child, f"{path}[{index}]")


def inventory_candidates(path: Path) -> list[dict[str, Any]]:
    rows = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        item = raw.strip()
        if item and TERMS.search(item) and item.lower().endswith((".uasset", ".umap")):
            rows.append({"line": line_no, "pak_path": item})
    return rows


def inspect_package(path: Path) -> dict[str, Any]:
    try:
        from uasset_read.package import parse_package_document
    except ImportError as exc:
        raise RuntimeError(
            "Falta uasset_read. Instala con: "
            "python -m pip install 'git+https://github.com/soatori/uasset_read.git'"
        ) from exc

    doc = parse_package_document(str(path), tolerant=True, depth="decode")
    objects = []
    for obj in doc.objects:
        props = jsonable(obj.properties) if obj.properties is not None else None
        record = {
            "id": obj.id,
            "name": obj.name,
            "class": obj.class_name,
            "outer_ref": jsonable(obj.outer_ref),
            "class_ref": jsonable(obj.class_ref),
            "template_ref": jsonable(obj.template_ref),
            "status": jsonable(obj.status),
            "properties": props,
            "diagnostics": jsonable(obj.diagnostics),
        }
        if INSTANCE_CLASSES.search(obj.class_name or "") or TERMS.search(obj.name):
            record["transform_candidates"] = list(walk_keys(props or {}))
            objects.append(record)
    return {
        "path": str(path.resolve()),
        "size_bytes": path.stat().st_size,
        "sha256": sha256(path),
        "layout": doc.layout,
        "package": jsonable(doc.package),
        "summary": jsonable(doc.summary),
        "imports": jsonable([x for x in doc.objects if x.id.startswith("import:")]),
        "relations": jsonable(doc.relations),
        "diagnostics": jsonable(doc.diagnostics),
        "reader_diagnostics": jsonable(doc.reader_diagnostics),
        "candidate_objects": objects,
        "all_object_count": len(doc.objects),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Inspección Redwood de foliage/instancias/transform; solo lectura.")
    ap.add_argument("--inventory", help="Inventario PAK existente pakchunk*_lista.txt")
    ap.add_argument("--root", help="Raíz donde ya están extraídos los assets seleccionados")
    ap.add_argument("--package", action="append", default=[], help="Ruta a .uasset/.umap extraído; repetible")
    ap.add_argument("--out", default="ARK-REDWOOD-instancias.json")
    args = ap.parse_args()

    report: dict[str, Any] = {
        "tool": "ARK Redwood Instance Decoder",
        "version": "0.1.0",
        "mode": "read_only",
        "inventory_candidates": [],
        "packages": [],
        "errors": [],
        "interpretation": [
            "Una ruta/nombre coincidente solo identifica un candidato.",
            "Una referencia de objeto solo se considera resuelta si el parser la decodifica y valida.",
            "Las posiciones requieren propiedades/arrays de instancias legibles; nombres de clase no bastan.",
            "No se escriben ni modifican .pak, .uasset, .umap, .uexp o .ubulk."
        ],
    }

    if args.inventory:
        inv = Path(args.inventory).expanduser()
        if not inv.is_file():
            ap.error(f"No existe inventario: {inv}")
        report["inventory_candidates"] = inventory_candidates(inv)
        report["inventory_source"] = {
            "path": str(inv.resolve()), "sha256": sha256(inv),
            "candidate_count": len(report["inventory_candidates"])
        }

    package_paths = [Path(p).expanduser() for p in args.package]
    if args.root:
        root = Path(args.root).expanduser()
        if not root.is_dir():
            ap.error(f"No existe raíz: {root}")
        package_paths.extend(p for p in root.rglob("*") if p.is_file() and p.suffix.lower() in (".uasset", ".umap"))

    seen = set()
    for path in package_paths:
        key = str(path.resolve())
        if key in seen:
            continue
        seen.add(key)
        if not path.is_file():
            report["errors"].append({"path": str(path), "error": "file_not_found"})
            continue
        try:
            report["packages"].append(inspect_package(path))
        except Exception as exc:
            report["errors"].append({
                "path": str(path.resolve()), "error_type": type(exc).__name__,
                "error": str(exc)
            })

    output = Path(args.out).expanduser()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("ARK Redwood Instance Decoder 0.1.0 — solo lectura")
    print("Candidatos en inventario:", len(report["inventory_candidates"]))
    print("Paquetes inspeccionados:", len(report["packages"]))
    print("Errores:", len(report["errors"]))
    print("JSON:", output.resolve())
    if report["errors"]:
        print("Hay errores de parser; revisar el JSON antes de interpretar resultados.")
    print("Originales intactos.")
    return 0 if not report["errors"] else 2


if __name__ == "__main__":
    raise SystemExit(main())

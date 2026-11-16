#!/usr/bin/env python3
"""Conservative read-only probe of the fixed Unreal package summary prefix.

It reports only fields whose offsets are stable in the classic package summary
prefix. It is not a full .uasset/.umap parser and never writes to input files.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import struct
from pathlib import Path
from typing import Any

PACKAGE_TAG = 0x9E2A83C1
PACKAGE_TAG_BYTES = struct.pack("<I", PACKAGE_TAG)
PREFIX_SIZE = 20


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def inspect_prefix(path: Path) -> dict[str, Any]:
    if not path.is_file():
        raise ValueError(f"No existe el archivo: {path}")
    size = path.stat().st_size
    if size < PREFIX_SIZE:
        raise ValueError(f"Archivo demasiado pequeño para el prefijo ({size} bytes)")
    with path.open("rb") as stream:
        prefix = stream.read(PREFIX_SIZE)
    tag = struct.unpack_from("<I", prefix, 0)[0]
    if tag != PACKAGE_TAG:
        raise ValueError(
            f"Tag Unreal no reconocido: bytes={prefix[:4].hex()} "
            f"value=0x{tag:08X}"
        )
    legacy_file, legacy_ue3, file_ue4, licensee_ue4 = struct.unpack_from(
        "<iiii", prefix, 4
    )
    return {
        "path": str(path.resolve()),
        "size_bytes": size,
        "sha256": sha256(path),
        "package_tag": f"0x{tag:08X}",
        "package_tag_valid": True,
        "legacy_file_version": legacy_file,
        "legacy_ue3_version": legacy_ue3,
        "file_version_ue4": file_ue4,
        "licensee_version_ue4": licensee_ue4,
        "evidence_level": "fixed_header_prefix_only",
        "limitations": [
            "No interpreta custom versions ni el resto de FPackageFileSummary.",
            "No identifica por sí solo la versión exacta del motor.",
            "No lee imports, exports, nombres ni propiedades serializadas.",
            "No modifica el archivo."
        ],
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Inspecciona el prefijo fijo de cabecera Unreal; solo lectura."
    )
    parser.add_argument("files", nargs="+", help="Archivos .uasset/.umap extraídos")
    parser.add_argument("--out", help="JSON opcional; se crea aparte de los originales")
    args = parser.parse_args()

    results = []
    for raw in args.files:
        path = Path(raw).expanduser()
        try:
            results.append(inspect_prefix(path))
        except (OSError, ValueError) as exc:
            results.append({"path": str(path), "error": str(exc)})

    report = {
        "tool": "ARK Unreal Header Probe",
        "version": "0.1.0",
        "mode": "read_only",
        "files": results,
    }
    rendered = json.dumps(report, ensure_ascii=False, indent=2)
    if args.out:
        output = Path(args.out).expanduser()
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(rendered + "\n", encoding="utf-8")
        print("JSON:", output.resolve())
    print(rendered)
    return 1 if any("error" in item for item in results) else 0


if __name__ == "__main__":
    raise SystemExit(main())

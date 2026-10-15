#!/usr/bin/env python3
"""Read-only, bounded file triage for the reverse-engineering workbench.

This tool does not execute samples, extract archive entries, or modify inputs.
Its results are preliminary observations, not a safety or malware verdict.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
import zipfile
from typing import Sequence

DEFAULT_MAX_BYTES = 64 * 1024 * 1024
HASH_CHUNK_BYTES = 1024 * 1024
SIGNATURE_BYTES = 16
MAX_ARCHIVE_ENTRIES = 5000
MAX_ARCHIVE_NAME_CHARS = 1_000_000
HIGH_COMPRESSION_RATIO = 1000.0

SIGNATURES = (
    (b"\x7fELF", "ELF executable/shared object"),
    (b"MZ", "DOS/Windows PE candidate"),
    (b"\x89PNG\r\n\x1a\n", "PNG image"),
    (b"\xff\xd8\xff", "JPEG image"),
    (b"GIF87a", "GIF image"),
    (b"GIF89a", "GIF image"),
    (b"%PDF-", "PDF document"),
    (b"SQLite format 3\x00", "SQLite database"),
    (b"\x1f\x8b", "GZIP compressed data"),
    (b"\x7b\x5c\x72\x74\x66", "RTF document"),
    (b"\x00asm", "WebAssembly module"),
)
EXTENSION_HINTS = {
    ".apk": "APK package",
    ".dex": "Android DEX bytecode",
    ".so": "ELF shared library",
    ".exe": "DOS/Windows PE candidate",
    ".dll": "DOS/Windows PE candidate",
    ".pdf": "PDF document",
    ".png": "PNG image",
    ".jpg": "JPEG image",
    ".jpeg": "JPEG image",
    ".zip": "ZIP archive",
    ".gz": "GZIP compressed data",
}


def _error(code: str, message: str, path: Path | str | None = None) -> dict:
    result = {"status": "error", "error": {"code": code, "message": message}}
    if path is not None:
        result["path"] = str(path)
    return result


def _signature_guess(prefix: bytes) -> str:
    for signature, label in SIGNATURES:
        if prefix.startswith(signature):
            return label
    # ZIP local-file, empty-archive end-of-central-directory, or spanning signatures.
    if prefix.startswith((b"PK\x03\x04", b"PK\x05\x06", b"PK\x07\x08")):
        return "ZIP archive"
    # A DEX signature is ASCII 'dex\n' followed by three version digits and NUL.
    if len(prefix) >= 8 and prefix.startswith(b"dex\n") and prefix[4:7].isdigit() and prefix[7:8] == b"\x00":
        return "Android DEX bytecode"
    return "unknown"


def _is_suspicious_archive_path(name: str) -> bool:
    normalized = name.replace("\\", "/")
    return (
        normalized.startswith("/")
        or normalized.startswith("//")
        or (len(normalized) >= 2 and normalized[1] == ":" and normalized[0].isalpha())
        or any(part == ".." for part in normalized.split("/"))
    )


def _inspect_zip(path: Path) -> tuple[dict | None, list[str]]:
    notes: list[str] = []
    if not zipfile.is_zipfile(path):
        try:
            with path.open("rb") as stream:
                prefix = stream.read(4)
        except OSError:
            return None, notes
        if prefix.startswith((b"PK\\x03\\x04", b"PK\\x05\\x06", b"PK\\x07\\x08")) or path.suffix.lower() in (".zip", ".apk"):
            notes.append("archive_inspection_failed")
        return None, notes
    try:
        with zipfile.ZipFile(path, "r") as archive:
            infos = archive.infolist()
            if len(infos) > MAX_ARCHIVE_ENTRIES:
                notes.append("archive_entry_limit_exceeded")
                return {
                    "inspection": "limited",
                    "entry_count": len(infos),
                    "entry_names": [],
                    "suspicious_paths": [],
                    "duplicate_names": [],
                    "high_compression_ratio": [],
                    "metadata_note": f"Entry count exceeds limit of {MAX_ARCHIVE_ENTRIES}; names omitted.",
                }, notes

            total_name_chars = sum(len(info.filename) for info in infos)
            if total_name_chars > MAX_ARCHIVE_NAME_CHARS:
                notes.append("archive_metadata_limit_exceeded")
                return {
                    "inspection": "limited",
                    "entry_count": len(infos),
                    "entry_names": [],
                    "suspicious_paths": [],
                    "duplicate_names": [],
                    "high_compression_ratio": [],
                    "metadata_note": "Total filename metadata exceeds configured limit; names omitted.",
                }, notes

            names = [info.filename for info in infos]
            seen: set[str] = set()
            duplicates: list[str] = []
            for name in names:
                if name in seen and name not in duplicates:
                    duplicates.append(name)
                seen.add(name)

            suspicious = []
            high_ratio = []
            for info in infos:
                if _is_suspicious_archive_path(info.filename):
                    suspicious.append({"name": info.filename, "reason": "unsafe_path_shape"})
                if info.file_size > 0:
                    ratio = float("inf") if info.compress_size == 0 else info.file_size / info.compress_size
                    if ratio >= HIGH_COMPRESSION_RATIO:
                        high_ratio.append({
                            "name": info.filename,
                            "declared_ratio": "infinite" if ratio == float("inf") else round(ratio, 2),
                        })

            has_manifest = "AndroidManifest.xml" in names
            has_dex = any(name.startswith("classes") and name.endswith(".dex") for name in names)
            return {
                "inspection": "central_directory_metadata_only",
                "entry_count": len(infos),
                "entry_names": names[:200],
                "entry_names_truncated": len(names) > 200,
                "suspicious_paths": suspicious,
                "duplicate_names": duplicates,
                "high_compression_ratio": high_ratio,
                "apk_like": bool(has_manifest and has_dex),
            }, notes
    except (OSError, zipfile.BadZipFile, zipfile.LargeZipFile, RuntimeError, ValueError):
        notes.append("archive_inspection_failed")
        return None, notes


def inspect_file(path: str | Path, max_bytes: int = DEFAULT_MAX_BYTES) -> dict:
    """Return bounded, read-only metadata about a file; never execute or extract it."""
    target = Path(path).expanduser()
    if not isinstance(max_bytes, int) or isinstance(max_bytes, bool) or max_bytes <= 0:
        return _error("invalid_limit", "max_bytes must be a positive integer.", target)
    try:
        info = target.stat()
    except FileNotFoundError:
        return _error("not_found", "Input file does not exist.", target)
    except PermissionError:
        return _error("unreadable", "Input file cannot be accessed due to permissions.", target)
    except OSError:
        return _error("unreadable", "Input file metadata could not be read.", target)

    if not stat.S_ISREG(info.st_mode):
        return _error("not_regular_file", "Input must be a regular file.", target)
    if info.st_size > max_bytes:
        return _error("file_too_large", f"File size exceeds configured limit of {max_bytes} bytes.", target)

    digest = hashlib.sha256()
    bytes_read = 0
    prefix = b""
    try:
        with target.open("rb") as stream:
            prefix = stream.read(SIGNATURE_BYTES)
            digest.update(prefix)
            bytes_read += len(prefix)
            while True:
                chunk = stream.read(HASH_CHUNK_BYTES)
                if not chunk:
                    break
                bytes_read += len(chunk)
                if bytes_read > max_bytes:
                    return _error("file_too_large", f"File grew beyond configured limit of {max_bytes} bytes during inspection.", target)
                digest.update(chunk)
    except PermissionError:
        return _error("unreadable", "Input file cannot be read due to permissions.", target)
    except OSError:
        return _error("unreadable", "Input file could not be read.", target)

    signature_guess = _signature_guess(prefix)
    extension = target.suffix.lower()
    archive, archive_notes = _inspect_zip(target)
    notes = list(archive_notes)
    format_guess = signature_guess
    if archive is not None:
        format_guess = "ZIP archive (APK-like)" if archive.get("apk_like") else "ZIP archive"
    elif signature_guess == "unknown" and extension in EXTENSION_HINTS:
        notes.append("format_based_on_signature_unknown")
    extension_hint = EXTENSION_HINTS.get(extension)
    if extension_hint and signature_guess != "unknown":
        compatible = (
            (extension == ".apk" and archive is not None and archive.get("apk_like"))
            or (extension == ".zip" and archive is not None)
            or (extension in (".jpg", ".jpeg") and signature_guess == "JPEG image")
            or (extension == ".so" and signature_guess.startswith("ELF"))
            or (extension in (".exe", ".dll") and signature_guess == "DOS/Windows PE candidate")
            or (extension == ".gz" and signature_guess == "GZIP compressed data")
            or (extension == ".dex" and signature_guess == "Android DEX bytecode")
            or (extension == ".pdf" and signature_guess == "PDF document")
            or (extension == ".png" and signature_guess == "PNG image")
        )
        if not compatible:
            notes.append("extension_mismatch")
    elif extension_hint and signature_guess == "unknown":
        notes.append("extension_not_verified_by_signature")

    return {
        "status": "ok",
        "assessment": "preliminary static triage only; not a safety or malware verdict",
        "path": str(target),
        "size_bytes": bytes_read,
        "sha256": digest.hexdigest(),
        "signature_guess": signature_guess,
        "format_guess": format_guess,
        "extension_hint": extension_hint,
        "notes": sorted(set(notes)),
        "archive": archive,
    }


def _render_human(result: dict) -> str:
    if result.get("status") == "error":
        error = result["error"]
        return f"ERROR [{error['code']}]: {error['message']}\n"
    lines = [
        "Reverse-engineering workbench — preliminary static triage",
        f"Path: {result['path']}",
        f"Size: {result['size_bytes']} bytes",
        f"SHA-256: {result['sha256']}",
        f"Signature: {result['signature_guess']}",
        f"Format guess: {result['format_guess']}",
        f"Extension hint: {result['extension_hint'] or 'none'}",
        f"Notes: {', '.join(result['notes']) if result['notes'] else 'none'}",
        f"Assessment: {result['assessment']}",
    ]
    archive = result.get("archive")
    if archive is not None:
        lines.append(f"Archive entries: {archive['entry_count']} (metadata only; no extraction)")
        if archive.get("apk_like") is not None:
            lines.append(f"APK-like structure: {'yes' if archive['apk_like'] else 'no'}")
        if archive.get("suspicious_paths"):
            lines.append(f"Suspicious path shapes: {len(archive['suspicious_paths'])}")
        if archive.get("duplicate_names"):
            lines.append(f"Duplicate entry names: {len(archive['duplicate_names'])}")
        if archive.get("high_compression_ratio"):
            lines.append(f"High declared compression ratios: {len(archive['high_compression_ratio'])}")
    return "\n".join(lines) + "\n"


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Read-only, bounded file triage. Does not execute or extract samples; results are not a malware verdict."
    )
    parser.add_argument("path", help="path to a local file to inspect")
    parser.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES,
                        help=f"maximum input size in bytes (default: {DEFAULT_MAX_BYTES})")
    parser.add_argument("--json", action="store_true", help="emit machine-readable JSON")
    args = parser.parse_args(argv)
    result = inspect_file(args.path, max_bytes=args.max_bytes)
    if args.json:
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
    else:
        sys.stdout.write(_render_human(result))
    return 0 if result.get("status") == "ok" else 2


if __name__ == "__main__":
    raise SystemExit(main())

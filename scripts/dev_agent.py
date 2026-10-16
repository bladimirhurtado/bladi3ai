#!/usr/bin/env python3
"""Safe, standard-library repository helper for the Agente de Desarrollo skills.

The default commands inspect files and metadata only. Project code is never executed
by inspect, review, or plan. The clone command is explicit and does not run hooks,
install dependencies, initialize submodules, or execute project scripts.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from typing import Any
from urllib.parse import urlsplit

EXCLUDED_DIRS = {
    ".git", ".hg", ".svn", ".venv", "venv", "node_modules", "vendor",
    "dist", "build", "target", "__pycache__", ".mypy_cache", ".pytest_cache",
    ".next", ".nuxt", "coverage",
}
MANIFEST_NAMES = {
    "package.json", "pyproject.toml", "requirements.txt", "Pipfile",
    "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "build.gradle.kts",
    "Gemfile", "composer.json", "Makefile", "Justfile",
}
TEXT_SUFFIXES = {
    ".py", ".pyi", ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx",
    ".java", ".kt", ".kts", ".go", ".rs", ".rb", ".php", ".sh",
    ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".json",
    ".xml", ".html", ".css", ".scss", ".md", ".txt", ".env",
    ".properties", ".gradle", ".sql",
}
MAX_FILES = 5000
MAX_SCAN_BYTES = 1_000_000
SECRET_PATTERNS = (
    ("private-key", re.compile(r"-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----")),
    ("github-token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{20,}\b")),
    ("aws-access-key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    (
        "credential-assignment",
        re.compile(
            r"""(?i)\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\b"""
            r"""\s*[:=]\s*["'][^"'\r\n]{8,}["']"""
        ),
    ),
)


class AgentError(Exception):
    """An expected, user-actionable error."""


def safe_relative_path(base_dir: Path, user_path: str) -> Path:
    """Resolve a path and reject traversal outside base_dir.

    This lexical/canonical check is useful for ordinary paths but is not a complete
    sandbox against concurrent symlink changes. Callers must not treat it as one.
    """
    base = base_dir.resolve(strict=True)
    candidate = (base / user_path).resolve(strict=False)
    try:
        candidate.relative_to(base)
    except ValueError as exc:
        raise AgentError(f"Ruta fuera del directorio permitido: {user_path}") from exc
    return candidate


def require_directory(value: str) -> Path:
    path = Path(value).expanduser().resolve(strict=True)
    if not path.is_dir():
        raise AgentError(f"No es un directorio: {path}")
    return path


def iter_project_files(root: Path, limit: int = MAX_FILES) -> tuple[list[Path], bool]:
    found: list[Path] = []
    truncated = False
    for current, dirs, files in os.walk(root, topdown=True, followlinks=False):
        dirs[:] = sorted(
            d for d in dirs
            if d not in EXCLUDED_DIRS and not (Path(current) / d).is_symlink()
        )
        for name in sorted(files):
            path = Path(current) / name
            if path.is_symlink() or not path.is_file():
                continue
            found.append(path)
            if len(found) >= limit:
                truncated = True
                return found, truncated
    return found, truncated


def git_metadata(root: Path) -> dict[str, Any]:
    if not shutil.which("git"):
        return {"available": False, "is_repository": False, "status": None}
    try:
        probe = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--is-inside-work-tree"],
            capture_output=True, text=True, timeout=5, check=False,
        )
        if probe.returncode != 0 or probe.stdout.strip() != "true":
            return {"available": True, "is_repository": False, "status": None}
        status = subprocess.run(
            ["git", "-C", str(root), "status", "--short", "--branch"],
            capture_output=True, text=True, timeout=10, check=False,
        )
        return {
            "available": True,
            "is_repository": True,
            "status": status.stdout.strip() if status.returncode == 0 else None,
            "status_error": status.stderr.strip()[:300] if status.returncode else None,
        }
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {
            "available": True, "is_repository": False, "status": None,
            "error": type(exc).__name__,
        }


def inspect_repository(path: str) -> dict[str, Any]:
    root = require_directory(path)
    files, truncated = iter_project_files(root)
    manifests = sorted(
        str(file.relative_to(root).as_posix())
        for file in files if file.name in MANIFEST_NAMES
    )
    tests = sorted({
        str(file.relative_to(root).parts[0])
        for file in files
        if any(part.lower() in {"test", "tests", "spec", "specs"} for part in file.relative_to(root).parts[:-1])
        or file.name.lower().startswith(("test_", "test.",))
        or file.name.lower().endswith((".test.js", ".test.ts", ".spec.js", ".spec.ts"))
    })
    top_level = sorted({
        file.relative_to(root).parts[0] for file in files
    })
    return {
        "tool": "agente-desarrollo-skills",
        "operation": "inspect",
        "root": str(root),
        "file_count": len(files),
        "file_limit_reached": truncated,
        "top_level_entries": top_level,
        "manifests": manifests,
        "test_locations": tests,
        "git": git_metadata(root),
        "executed_project_code": False,
    }


def review_repository(path: str) -> dict[str, Any]:
    root = require_directory(path)
    inventory = inspect_repository(str(root))
    files, truncated = iter_project_files(root)
    findings: list[dict[str, Any]] = []
    names = {file.name for file in files}

    if not ({"README.md", "README.rst", "README.txt", "README"} & names):
        findings.append({"severity": "warning", "kind": "documentation", "message": "No se encontró un README reconocible."})
    if not inventory["test_locations"]:
        findings.append({"severity": "warning", "kind": "tests", "message": "No se detectaron ubicaciones de pruebas por nombre o ruta."})
    if not inventory["git"]["is_repository"]:
        findings.append({"severity": "info", "kind": "git", "message": "El directorio no parece ser un repositorio Git."})
    if truncated:
        findings.append({"severity": "warning", "kind": "coverage", "message": f"Se alcanzó el límite de inspección de {MAX_FILES} archivos."})

    scanned = 0
    for file in files:
        if file.suffix.lower() not in TEXT_SUFFIXES and file.name not in {".env", ".env.local", "Dockerfile"}:
            continue
        if file.name in {".env.example", ".env.sample", ".env.template"}:
            continue
        try:
            if file.stat().st_size > MAX_SCAN_BYTES:
                continue
            content = file.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        scanned += 1
        relative = file.relative_to(root).as_posix()
        for line_number, line in enumerate(content.splitlines(), start=1):
            if line.lstrip().startswith(("<<<<<<< ", ">>>>>>> ")):
                findings.append({
                    "severity": "warning", "kind": "merge-conflict-marker",
                    "path": relative, "line": line_number,
                    "message": "Posible marcador de conflicto Git sin resolver.",
                })
            for label, pattern in SECRET_PATTERNS:
                if pattern.search(line):
                    findings.append({
                        "severity": "high", "kind": "possible-secret", "pattern": label,
                        "path": relative, "line": line_number,
                        "message": "Posible secreto incrustado; valor omitido deliberadamente.",
                    })
                    break
    return {
        "tool": "agente-desarrollo-skills",
        "operation": "review",
        "root": str(root),
        "files_scanned_for_text": scanned,
        "findings": findings,
        "finding_count": len(findings),
        "file_limit_reached": truncated,
        "executed_project_code": False,
        "limitations": [
            "Inspección heurística: puede producir falsos positivos y falsos negativos.",
            "No ejecuta pruebas, linters, compiladores ni scripts del repositorio.",
            "No sustituye una revisión de seguridad ni una revisión humana.",
        ],
    }


def make_refactor_plan(path: str) -> dict[str, Any]:
    inventory = inspect_repository(path)
    root = Path(inventory["root"])
    files, truncated = iter_project_files(root)
    source_files = []
    for file in files:
        if file.suffix.lower() in TEXT_SUFFIXES:
            try:
                if file.stat().st_size <= MAX_SCAN_BYTES:
                    line_count = len(file.read_text(encoding="utf-8", errors="replace").splitlines())
                    if line_count >= 500:
                        source_files.append({
                            "path": file.relative_to(root).as_posix(),
                            "lines": line_count,
                        })
            except OSError:
                pass
    source_files.sort(key=lambda item: (-item["lines"], item["path"]))
    steps = [
        "Registrar commit, estado Git y comportamiento observable antes de modificar.",
        "Definir el objetivo y criterios de aceptación; separar correcciones de refactorización.",
        "Identificar contratos públicos, dependencias y pruebas que protejan el comportamiento actual.",
        "Proponer cambios pequeños y ordenados; evitar migraciones tecnológicas sin una necesidad demostrada.",
        "Implementar un cambio por vez en una rama de trabajo y revisar el diff.",
        "Ejecutar las pruebas y comprobaciones pertinentes en un entorno autorizado.",
        "Documentar resultados, riesgos restantes y pasos para revertir.",
    ]
    if not inventory["test_locations"]:
        steps.insert(2, "Crear primero pruebas de caracterización o ejemplos reproducibles para el comportamiento crítico.")
    return {
        "tool": "agente-desarrollo-skills",
        "operation": "plan",
        "root": inventory["root"],
        "inventory": inventory,
        "large_text_files": source_files[:50],
        "steps": steps,
        "file_limit_reached": truncated,
        "writes_performed": False,
        "executed_project_code": False,
        "note": "Plan orientativo; no modifica el repositorio ni demuestra que el diseño propuesto sea correcto.",
    }


def validate_clone_source(source: str) -> str:
    candidate = source.strip()
    if not candidate:
        raise AgentError("El origen no puede estar vacío.")
    if candidate.startswith("git@"):
        if not re.fullmatch(r"git@[A-Za-z0-9.-]+:[A-Za-z0-9._/-]+(?:\.git)?", candidate):
            raise AgentError("Formato SSH no admitido o contiene caracteres inesperados.")
        return candidate
    if "://" in candidate:
        parsed = urlsplit(candidate)
        if parsed.scheme not in {"https", "ssh"} or not parsed.hostname:
            raise AgentError("Solo se admiten orígenes remotos HTTPS o SSH.")
        if parsed.username or parsed.password or parsed.query or parsed.fragment:
            raise AgentError("No incluyas credenciales, query ni fragmentos en la URL del repositorio.")
        if parsed.path in {"", "/"}:
            raise AgentError("La URL no identifica una ruta de repositorio.")
        return candidate
    local = Path(candidate).expanduser()
    if local.exists() and local.is_dir():
        return str(local.resolve())
    raise AgentError("Origen no reconocido. Usa una URL HTTPS/SSH sin credenciales o una ruta local existente.")


def clone_repository(source: str, destination: str) -> dict[str, Any]:
    if not shutil.which("git"):
        raise AgentError("Git no está instalado o no está disponible en PATH.")
    clean_source = validate_clone_source(source)
    raw_dest = Path(destination).expanduser()
    parent = raw_dest.parent.resolve(strict=True)
    dest = parent / raw_dest.name
    if dest.exists() or dest.is_symlink():
        raise AgentError(f"El destino ya existe; no se sobrescribirá: {dest}")
    if raw_dest.name in {"", ".", ".."}:
        raise AgentError("El destino debe ser un nuevo directorio con nombre explícito.")
    try:
        proc = subprocess.run(
            ["git", "clone", "--no-recurse-submodules", "--", clean_source, str(dest)],
            capture_output=True, text=True, timeout=300, check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise AgentError("La clonación superó el límite de 300 segundos.") from exc
    except OSError as exc:
        raise AgentError(f"No se pudo ejecutar Git: {exc}") from exc
    if proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "Git terminó con error").strip()[:1200]
        raise AgentError(f"La clonación falló (código {proc.returncode}): {detail}")
    return {
        "tool": "agente-desarrollo-skills",
        "operation": "clone",
        "source": clean_source,
        "destination": str(dest),
        "success": True,
        "project_code_executed": False,
        "dependencies_installed": False,
        "submodules_initialized": False,
        "next_steps": [
            "Inspeccionar los archivos antes de ejecutar scripts del proyecto.",
            "Revisar la documentación y las dependencias declaradas.",
            "Ejecutar pruebas o instalar dependencias solo tras evaluar el riesgo y autorizarlo.",
        ],
    }


def emit(data: dict[str, Any], as_json: bool = False) -> None:
    if as_json:
        print(json.dumps(data, ensure_ascii=False, indent=2))
        return
    operation = data.get("operation", "resultado")
    print(f"Agente de Desarrollo — {operation}")
    print(f"Raíz: {data.get('root', data.get('destination', '—'))}")
    if operation == "inspect":
        print(f"Archivos inspeccionados: {data.get('file_count')}")
        print(f"Manifiestos: {', '.join(data.get('manifests', [])) or 'ninguno detectado'}")
        print(f"Git: {'sí' if data.get('git', {}).get('is_repository') else 'no detectado'}")
        print(f"Código del proyecto ejecutado: {data.get('executed_project_code')}")
    elif operation == "review":
        print(f"Archivos de texto revisados: {data.get('files_scanned_for_text')}")
        print(f"Hallazgos: {data.get('finding_count')}")
        for finding in data.get("findings", []):
            where = f"{finding.get('path', '')}:{finding.get('line', '')}".rstrip(":")
            print(f"- [{finding['severity']}] {finding['kind']} {where}: {finding['message']}")
        for limitation in data.get("limitations", []):
            print(f"Limitación: {limitation}")
    elif operation == "plan":
        print("Plan propuesto:")
        for index, step in enumerate(data.get("steps", []), start=1):
            print(f"{index}. {step}")
        if data.get("large_text_files"):
            print("Archivos de texto extensos:")
            for item in data["large_text_files"][:10]:
                print(f"- {item['path']} ({item['lines']} líneas)")
    else:
        print("Clonación completada; no se ejecutó código del proyecto.")
        for step in data.get("next_steps", []):
            print(f"- {step}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Inspección, revisión heurística, planificación de refactorización y clonación segura de repositorios."
    )
    sub = parser.add_subparsers(dest="command", required=True)
    for command, help_text in (
        ("inspect", "Inventariar un directorio sin ejecutar código."),
        ("review", "Buscar marcadores de conflicto y posibles secretos; no ejecuta código."),
        ("plan", "Generar un plan de refactorización sin modificar archivos."),
    ):
        item = sub.add_parser(command, help=help_text)
        item.add_argument("path", help="Ruta al directorio del proyecto.")
        item.add_argument("--json", action="store_true", help="Emitir resultado estructurado JSON.")
    clone = sub.add_parser("clone", help="Clonar a un destino nuevo sin instalar dependencias ni ejecutar scripts.")
    clone.add_argument("source", help="URL HTTPS/SSH sin credenciales o ruta local existente.")
    clone.add_argument("destination", help="Nuevo directorio de destino; debe no existir.")
    clone.add_argument("--json", action="store_true", help="Emitir resultado estructurado JSON.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "inspect":
            result = inspect_repository(args.path)
        elif args.command == "review":
            result = review_repository(args.path)
        elif args.command == "plan":
            result = make_refactor_plan(args.path)
        else:
            result = clone_repository(args.source, args.destination)
        emit(result, args.json)
        return 0
    except AgentError as exc:
        error = {"tool": "agente-desarrollo-skills", "success": False, "error": str(exc)}
        if getattr(args, "json", False):
            print(json.dumps(error, ensure_ascii=False, indent=2), file=sys.stderr)
        else:
            print(f"Error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())

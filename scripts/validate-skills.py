#!/usr/bin/env python3
"""Validate the local reusable skill toolkit using only the Python standard library."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1] / ".agents" / "skills"
EXPECTED = {
    "investigacion-herramientas", "agente-desarrollo-skills", "orquestador-multi-ia", "ingenieria-software",
    "auditoria-ia-aegis-hydra", "integracion-sistemas", "control-calidad-qa",
    "arquitectura-sistemas", "seguridad-optimizacion", "gestion-documentacion",
    "diseno-ui-ux", "gestion-errores-resiliencia", "automatizacion-flujos",
    "analisis-datos-metricas", "despliegue-configuracion",
    "seguridad-auditoria-ataque", "ingenieria-inversa-educativa", "reverse-engineering",
    "refactorizacion-codigo", "gestion-dependencias-parches",
    "diseno-bases-datos", "clonacion-replicacion-entornos",
    "anatomia-agentes-ia", "analizador-pro-movil",
}
errors = []
for name in sorted(EXPECTED):
    path = ROOT / name / "SKILL.md"
    if not path.is_file():
        errors.append(f"MISSING: {path.relative_to(ROOT)}")
        continue
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        errors.append(f"FRONTMATTER: {path.relative_to(ROOT)} must start with ---")
        continue
    end = text.find("\n---", 4)
    if end < 0:
        errors.append(f"FRONTMATTER: {path.relative_to(ROOT)} has no closing ---")
        continue
    header = text[4:end]
    for field in ("name:", "description:"):
        if not re.search(rf"(?m)^{re.escape(field)}\s*\S+", header):
            errors.append(f"METADATA: {path.relative_to(ROOT)} missing {field[:-1]}")
    if f"name: {name}" not in header:
        errors.append(f"NAME: {path.relative_to(ROOT)} name does not match folder")
    if len(text.splitlines()) < 8:
        errors.append(f"SHORT: {path.relative_to(ROOT)} appears incomplete")
if errors:
    print("\n".join(errors))
    sys.exit(1)
print(f"OK: {len(EXPECTED)} skill packages have basic metadata and non-empty instructions.")
print("Note: structural validation only; it does not prove task-level effectiveness.")

"""Core workflow engine for clean-room application reconstruction."""
from __future__ import annotations
import json
import re
from datetime import datetime, timezone
from pathlib import Path

STAGES = [
    ("recon", "Reconocimiento", "Map public information and user-authorized flows; document screens, states, features and unknowns."),
    ("architect", "Arquitectura", "Choose a suitable stack; define components, data model, APIs, security boundaries and implementation order."),
    ("design", "Sistema de diseño", "Create original design tokens, responsive rules and accessible components; use original or licensed assets."),
    ("build", "Construcción", "Implement the approved feature matrix in small, testable increments using original code and content."),
    ("backend", "Backend e integraciones", "Design authentication, storage and integrations. Never embed secrets; document costs and consent requirements."),
    ("test", "Pruebas", "Create and run unit, integration, accessibility and end-to-end tests; record reproducible defects."),
    ("diff", "Paridad funcional", "Compare documented behaviors and user flows; report gaps without copying protected expression."),
    ("entrepreneur", "Oportunidad y usuarios", "Analyze only supplied or publicly accessible reviews with source links; never invent quotes, counts or findings."),
    ("brand", "Identidad propia", "Create a distinct name, visual identity and copy; check trademark/domain questions separately."),
    ("launch", "Preparación de lanzamiento", "Prepare original landing-page and store copy; validate claims, privacy disclosures and platform limits."),
    ("deploy", "Despliegue", "Run preflight checks and prepare deployment instructions; require explicit human approval before publishing."),
]
STAGE_MAP = {row[0]: row for row in STAGES}
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,47}$")

def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")

def _safe_project_name(name):
    slug = re.sub(r"[^a-z0-9-]+", "-", name.strip().lower()).strip("-")
    if not SLUG_RE.fullmatch(slug):
        raise ValueError("El nombre debe producir un identificador de 2 a 48 caracteres: letras, números y guiones.")
    return slug

def _write_new(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        raise FileExistsError(str(path))
    path.write_text(content, encoding="utf-8")

def init_project(workspace, name, target=""):
    slug = _safe_project_name(name)
    root = Path(workspace).expanduser().resolve() / slug
    root.mkdir(parents=True, exist_ok=False)
    state = {"engine": "BLADI REPLICA ENGINE", "version": "0.2.0", "project": slug,
             "target_reference": target.strip(), "created_at": _now(), "current_stage": "recon",
             "completed": [], "status": "active",
             "approval_required_for": ["backend_integrations", "deploy", "external_network_access"]}
    (root / "project.json").write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    _write_new(root / "features.csv", "id,name,priority,status,notes\nF001,Documentar flujo principal,must,not_started,\n")
    _write_new(root / "README.md", f"# {slug}\n\nProyecto de reconstrucción funcional clean-room.\n\nReferencia: {target or 'Pendiente'}\n")
    _write_new(root / "evidence" / ".gitkeep", "")
    _write_new(root / "outputs" / ".gitkeep", "")
    return root

def load_state(project_dir):
    path = Path(project_dir).expanduser().resolve() / "project.json"
    if not path.is_file():
        raise FileNotFoundError(f"No se encontró project.json en {path.parent}")
    return json.loads(path.read_text(encoding="utf-8"))

def save_state(project_dir, state):
    path = Path(project_dir).expanduser().resolve() / "project.json"
    tmp = path.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp.replace(path)

def status(project_dir):
    state = load_state(project_dir)
    return {"project": state["project"], "status": state["status"],
            "current_stage": state["current_stage"], "completed": list(state["completed"]),
            "remaining": [s[0] for s in STAGES if s[0] not in state["completed"]]}

def prepare_stage(project_dir, stage=None):
    root = Path(project_dir).expanduser().resolve()
    state = load_state(root)
    key = stage or state["current_stage"]
    if key not in STAGE_MAP:
        raise ValueError(f"Etapa desconocida: {key}")
    _, title, objective = STAGE_MAP[key]
    prompt = f"""# BLADI REPLICA ENGINE — {title}

Flujo de reconstrucción clean-room.

Proyecto: {state['project']}
Referencia declarada: {state.get('target_reference') or 'No especificada'}

## Objetivo
{objective}

## Instrucciones
- Usa únicamente información pública o material que el usuario esté autorizado a proporcionar.
- Reconstruye comportamientos y flujos de forma original. No copies código, marcas, logotipos, textos, activos ni APIs privadas.
- Distingue hechos, inferencias y preguntas abiertas. No inventes métricas, reseñas, fuentes ni resultados.
- Registra decisiones, riesgos, dependencias y evidencia verificable.
- Si una acción requiere credenciales, dinero, acceso externo, publicación o cambios destructivos, detente y solicita aprobación humana.
- Guarda el resultado como Markdown en outputs/{key}.md.
- Termina con: Estado: completo | parcial | bloqueado; y próximos pasos.

## Entregable
Un documento claro, comprobable y accionable para la siguiente etapa.
"""
    output = root / "prompts" / f"{key}.md"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(prompt, encoding="utf-8")
    return output

def complete_stage(project_dir, stage, result_file):
    root = Path(project_dir).expanduser().resolve()
    if stage not in STAGE_MAP:
        raise ValueError(f"Etapa desconocida: {stage}")
    source = Path(result_file).expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(str(source))
    content = source.read_text(encoding="utf-8")
    if not content.strip():
        raise ValueError("El resultado está vacío.")
    state = load_state(root)
    destination = root / "outputs" / f"{stage}.md"
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding="utf-8")
    if stage not in state["completed"]:
        state["completed"].append(stage)
    remaining = [s[0] for s in STAGES if s[0] not in state["completed"]]
    state["current_stage"] = remaining[0] if remaining else "done"
    state["status"] = "complete" if not remaining else "active"
    state["updated_at"] = _now()
    save_state(root, state)
    return destination

def export_manifest(project_dir):
    root = Path(project_dir).expanduser().resolve()
    state = load_state(root)
    manifest = {"project": state["project"], "target_reference": state.get("target_reference", ""),
                "stages": [{"id": key, "name": title, "completed": key in state["completed"],
                            "prompt_exists": (root / "prompts" / f"{key}.md").is_file(),
                            "output_exists": (root / "outputs" / f"{key}.md").is_file()}
                           for key, title, _ in STAGES]}
    path = root / "manifest.json"
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path

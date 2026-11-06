"""Small, inspectable project memory stored locally as JSONL."""
import json
from datetime import datetime, timezone
from pathlib import Path

def append_memory(project_dir, role, content, provider="manual"):
    if role not in ("user", "assistant", "system", "note"):
        raise ValueError("Rol de memoria no permitido.")
    if not isinstance(content, str) or not content.strip():
        raise ValueError("El contenido de memoria no puede estar vacío.")
    path = Path(project_dir).expanduser().resolve() / "memory.jsonl"
    path.parent.mkdir(parents=True, exist_ok=True)
    record = {"timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
              "role": role, "provider": provider, "content": content.strip()}
    with path.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(record, ensure_ascii=False) + "\n")
    return path

def read_memory(project_dir, limit=20):
    path = Path(project_dir).expanduser().resolve() / "memory.jsonl"
    if not path.exists():
        return []
    limit = max(1, min(int(limit), 200))
    records = []
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            if line.strip():
                records.append(json.loads(line))
    return records[-limit:]

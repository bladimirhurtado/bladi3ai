#!/usr/bin/env python3
"""REA local read-only bridge for the Bladi Taller web app.

Binds only to loopback. It exposes a health check and a fixed, read-only
summary of the local REA checkout. It never accepts commands or file paths.
"""
from __future__ import annotations

import hmac
import json
import os
import platform
import secrets
import subprocess
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HOST = "127.0.0.1"
PORT = int(os.environ.get("REA_BRIDGE_PORT", "8765"))
ALLOWED_ORIGIN = "https://bladi-taller-herramientas.floot.app"
ROOT = Path(__file__).resolve().parent.parent
TOKEN = secrets.token_urlsafe(32)


def repo_status(root: Path = ROOT) -> dict:
    required = ["rea.sh", "scripts/dev_agent.py", "scripts/re_triage.py"]
    exists = {name: (root / name).is_file() for name in required}
    git_branch = None
    git_commit = None
    git_dirty = None
    try:
        branch = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=root, capture_output=True, text=True, timeout=2, check=True)
        commit = subprocess.run(["git", "rev-parse", "--short", "HEAD"], cwd=root, capture_output=True, text=True, timeout=2, check=True)
        dirty = subprocess.run(["git", "status", "--porcelain"], cwd=root, capture_output=True, text=True, timeout=2, check=True)
        git_branch, git_commit, git_dirty = branch.stdout.strip(), commit.stdout.strip(), bool(dirty.stdout.strip())
    except (OSError, subprocess.SubprocessError):
        pass
    tests_dir = root / "tests"
    test_files = sorted(p.name for p in tests_dir.glob("test_*.py")) if tests_dir.is_dir() else []
    return {
        "connected": True,
        "service": "REA local read-only bridge",
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "python": platform.python_version(),
        "platform": platform.system(),
        "repo_ready": all(exists.values()),
        "required_files": exists,
        "git": {"branch": git_branch, "commit": git_commit, "working_tree_dirty": git_dirty},
        "test_file_count": len(test_files),
    }


class Handler(BaseHTTPRequestHandler):
    server_version = "REA-Bridge/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print("[REA bridge] " + (fmt % args))

    def _cors(self) -> None:
        if self.headers.get("Origin", "") == ALLOWED_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Cache-Control", "no-store")

    def _json(self, code: int, payload: dict) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        if self.headers.get("Origin", "") != ALLOWED_ORIGIN:
            self.send_error(403, "Origin not allowed")
            return
        self.send_response(204)
        self._cors()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/health":
            self._json(200, {"ok": True, "service": "REA local read-only bridge"})
            return
        if self.path != "/status":
            self._json(404, {"error": "not_found"})
            return
        if self.headers.get("Origin", "") != ALLOWED_ORIGIN:
            self._json(403, {"error": "origin_not_allowed"})
            return
        if not hmac.compare_digest(self.headers.get("Authorization", ""), "Bearer " + TOKEN):
            self._json(401, {"error": "unauthorized", "message": "Token incorrecto o ausente."})
            return
        self._json(200, repo_status())


def main() -> None:
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    server.daemon_threads = True
    print("REA bridge iniciado solo en este teléfono (127.0.0.1).")
    print(f"Puerto: {PORT}")
    print("Pega este token en Taller > Conexión REA. No lo compartas:")
    print(TOKEN)
    print("Solo ofrece estado de lectura; no ejecuta comandos recibidos desde la web.")
    print("Mantén esta sesión de Termux abierta. Ctrl+C para detener.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nREA bridge detenido.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

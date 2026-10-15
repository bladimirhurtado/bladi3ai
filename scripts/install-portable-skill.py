#!/usr/bin/env python3
"""Install the portable reverse-engineering skill into a compatible project.

Standard-library only. Preflights conflicts before writing and backs up any
replaced skill when --force is used. Does not install external analysis tools.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path
import shutil
import sys

PACKAGE = Path(__file__).resolve().parents[1] / "portable-skills" / "reverse-engineering"
AGENT_DIRS = {
    "agents": Path(".agents") / "skills",
    "claude": Path(".claude") / "skills",
    "generic": Path("skills"),
}


def valid_skill(path: Path) -> bool:
    if not path.is_file():
        return False
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return False
    end = text.find("\n---", 4)
    if end < 0:
        return False
    header = text[4:end]
    return all(line.startswith(field + ":") for field in ("name", "description")
               for line in header.splitlines() if line.startswith(field + ":")) and (
        "name: reverse-engineering" in header
        and any(line.startswith("description:") and len(line.split(":", 1)[1].strip()) > 0
                for line in header.splitlines())
    )


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("target", nargs="?", default=".", help="target project directory (default: current directory)")
    parser.add_argument("--agent", choices=sorted(AGENT_DIRS), default="agents",
                        help="skill discovery convention: agents (.agents/skills), claude (.claude/skills), generic (skills)")
    parser.add_argument("--source", type=Path, default=PACKAGE,
                        help="portable skill package directory (defaults to this checkout's package)")
    parser.add_argument("--force", action="store_true", help="replace an existing skill after making a timestamped backup")
    parser.add_argument("--dry-run", action="store_true", help="show the destination without writing files")
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    source = args.source.expanduser().resolve()
    target = Path(args.target).expanduser().resolve()
    skill_file = source / "SKILL.md"
    if not target.is_dir():
        print(f"ERROR: target directory does not exist: {target}", file=sys.stderr)
        return 2
    if not valid_skill(skill_file):
        print(f"ERROR: missing or invalid portable skill: {skill_file}", file=sys.stderr)
        return 2

    destination = target / AGENT_DIRS[args.agent] / "reverse-engineering"
    if destination.exists() and not args.force:
        print(f"CONFLICT: {destination} already exists; nothing changed. Use --force to back it up and replace it.", file=sys.stderr)
        return 3
    if args.dry_run:
        print(f"DRY RUN: would install {source} -> {destination}")
        return 0

    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup = destination.with_name(destination.name + ".backup-" + stamp)
        suffix = 1
        while backup.exists():
            backup = destination.with_name(destination.name + ".backup-" + stamp + f"-{suffix}")
            suffix += 1
        shutil.copytree(destination, backup)
        print(f"BACKUP: {backup}")
        shutil.rmtree(destination)
    shutil.copytree(source, destination)
    print(f"INSTALLED: {destination}")
    print("NOTE: this copies skill instructions only; it does not install or grant access to analysis tools.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

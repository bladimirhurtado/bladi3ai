"""Command-line interface for BLADI REPLICA ENGINE."""
import argparse
import json
from .engine import STAGES, complete_stage, export_manifest, init_project, prepare_stage, status

def main(argv=None):
    parser = argparse.ArgumentParser(prog="bladi-replica", description="Motor clean-room para analizar y reconstruir aplicaciones.")
    sub = parser.add_subparsers(dest="command", required=True)
    create = sub.add_parser("init", help="Crear un proyecto")
    create.add_argument("--workspace", default=".")
    create.add_argument("--name", required=True)
    create.add_argument("--target", default="")
    for command in ("status", "manifest"):
        item = sub.add_parser(command)
        item.add_argument("project_dir")
    prepare = sub.add_parser("prepare", help="Generar instrucciones de una etapa")
    prepare.add_argument("project_dir")
    prepare.add_argument("--stage", choices=[s[0] for s in STAGES])
    finish = sub.add_parser("complete", help="Guardar un resultado y avanzar")
    finish.add_argument("project_dir")
    finish.add_argument("--stage", choices=[s[0] for s in STAGES], required=True)
    finish.add_argument("--result", required=True)
    args = parser.parse_args(argv)
    if args.command == "init":
        print(init_project(args.workspace, args.name, args.target))
    elif args.command == "status":
        print(json.dumps(status(args.project_dir), ensure_ascii=False, indent=2))
    elif args.command == "manifest":
        print(export_manifest(args.project_dir))
    elif args.command == "prepare":
        print(prepare_stage(args.project_dir, args.stage))
    elif args.command == "complete":
        print(complete_stage(args.project_dir, args.stage, args.result))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())

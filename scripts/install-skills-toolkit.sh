#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/bladimirhurtado/bladi3ai.git"
BRANCH="${SKILLS_TOOLKIT_BRANCH:-tooling/20-skills-toolkit}"
TARGET="."
FORCE=0

while (($#)); do
  case "$1" in
    --force) FORCE=1 ;;
    -h|--help)
      echo "Usage: $0 [target-project-directory] [--force]"
      echo "Installs the toolkit skills into TARGET/.agents/skills."
      echo "Existing skill folders are preserved unless --force is supplied; --force makes a timestamped backup."
      exit 0 ;;
    *)
      if [[ "$TARGET" == "." ]]; then TARGET="$1"; else echo "Unexpected argument: $1" >&2; exit 2; fi ;;
  esac
  shift
done

if ! command -v git >/dev/null 2>&1; then
  echo "Error: git is required." >&2; exit 1
fi
if [[ ! -d "$TARGET" ]]; then
  echo "Error: target directory does not exist: $TARGET" >&2; exit 1
fi
TARGET="$(cd "$TARGET" && pwd)"
DEST="$TARGET/.agents/skills"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --depth 1 --branch "$BRANCH" "$REPO_URL" "$TMP/repo" >/dev/null
mkdir -p "$DEST"

# Preflight first: do not partially install when a conflict exists.
for SRC in "$TMP/repo/.agents/skills"/*; do
  [[ -d "$SRC" ]] || continue
  NAME="$(basename "$SRC")"
  if [[ -e "$DEST/$NAME" && "$FORCE" -ne 1 ]]; then
    echo "Conflict: $DEST/$NAME already exists. Nothing was copied." >&2
    echo "Use --force to create a backup before replacing existing folders." >&2
    exit 3
  fi
done

if [[ "$FORCE" -eq 1 ]]; then
  BACKUP="$DEST/.backup-$(date -u +%Y%m%dT%H%M%SZ)"
  mkdir -p "$BACKUP"
  for SRC in "$TMP/repo/.agents/skills"/*; do
    [[ -d "$SRC" ]] || continue
    NAME="$(basename "$SRC")"
    if [[ -e "$DEST/$NAME" ]]; then cp -a "$DEST/$NAME" "$BACKUP/$NAME"; fi
  done
  echo "Existing skill folders backed up at: $BACKUP"
fi

for SRC in "$TMP/repo/.agents/skills"/*; do
  [[ -d "$SRC" ]] || continue
  NAME="$(basename "$SRC")"
  if [[ -e "$DEST/$NAME" ]]; then rm -rf "$DEST/$NAME"; fi
  cp -a "$SRC" "$DEST/$NAME"
  echo "Installed: $NAME"
done

echo "Toolkit installed into: $DEST"
echo "Review .agents/skills/README.md in the source repository for the catalog."

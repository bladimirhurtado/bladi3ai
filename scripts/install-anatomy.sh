#!/usr/bin/env bash
set -Eeuo pipefail

# Install the pinned Anatomy skill into any project without silently overwriting work.
# Usage: ./scripts/install-anatomy.sh [PROJECT_DIR] [--force]
# Requires: bash, curl, tar.

UPSTREAM_REPO="https://github.com/wheresryan22/anatomy"
UPSTREAM_COMMIT="be2fa9b47a7e4b05dec468be9ffc42e830c2101c"
PROJECT_DIR="."
PROJECT_SET="false"
FORCE="false"

while (($#)); do
  case "$1" in
    --force) FORCE="true"; shift ;;
    -h|--help)
      sed -n '1,5p' "$0"
      exit 0
      ;;
    *)
      if [[ "$PROJECT_SET" == "true" ]]; then
        echo "ERROR: only one project directory may be supplied." >&2
        exit 2
      fi
      PROJECT_DIR="$1"
      PROJECT_SET="true"
      shift
      ;;
  esac
done

[[ -d "$PROJECT_DIR" ]] || { echo "ERROR: project directory does not exist: $PROJECT_DIR" >&2; exit 2; }
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
DEST="$PROJECT_DIR/.agents/skills/anatomy"
COMPAT="$PROJECT_DIR/skills/anatomy"

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT
ARCHIVE="$TMP/anatomy.tar.gz"
SOURCE="$TMP/source"
STAGED="$TMP/anatomy"
mkdir -p "$SOURCE" "$STAGED"

# Download and validate the full pinned copy before touching an existing installation.
curl --fail --location --retry 3 --silent --show-error \
  "$UPSTREAM_REPO/archive/$UPSTREAM_COMMIT.tar.gz" -o "$ARCHIVE"
tar -xzf "$ARCHIVE" --strip-components=1 -C "$SOURCE"

for required in SKILL.md LICENSE kit references examples scripts; do
  [[ -e "$SOURCE/$required" ]] || { echo "ERROR: upstream archive missing $required" >&2; exit 4; }
done

cp -a "$SOURCE/." "$STAGED/"
cat > "$STAGED/VENDOR.md" <<EOF
# Anatomy vendor copy

- Upstream: $UPSTREAM_REPO
- Pinned commit: $UPSTREAM_COMMIT
- License: see LICENSE (MIT in the pinned upstream copy)
- Installed by: scripts/install-anatomy.sh

This is a project-local agent skill. Keep the pinned source intact when possible.
To update, review a new upstream commit and test it before replacing this copy.
EOF
[[ -s "$STAGED/SKILL.md" && -s "$STAGED/LICENSE" ]] || {
  echo "ERROR: staged copy failed verification." >&2
  exit 5
}

if [[ -e "$DEST" || -L "$DEST" ]]; then
  if [[ "$FORCE" != "true" ]]; then
    echo "ERROR: $DEST already exists. Nothing changed." >&2
    echo "Review it first, or rerun with --force to make a timestamped backup." >&2
    exit 3
  fi
  BACKUP="$DEST.backup.$(date -u +%Y%m%dT%H%M%SZ)"
  mv "$DEST" "$BACKUP"
  echo "Existing skill preserved at: $BACKUP"
fi

mkdir -p "$(dirname "$DEST")"
mv "$STAGED" "$DEST"

# Add the compatibility path only if it is free; never replace an existing path.
if [[ ! -e "$COMPAT" && ! -L "$COMPAT" ]]; then
  mkdir -p "$(dirname "$COMPAT")"
  ln -s ../.agents/skills/anatomy "$COMPAT"
  echo "Created compatibility symlink: $COMPAT"
elif [[ -e "$COMPAT" || -L "$COMPAT" ]]; then
  echo "Kept existing compatibility path unchanged: $COMPAT"
fi

echo "Anatomy installed successfully."
echo "Project: $PROJECT_DIR"
echo "Skill:   $DEST/SKILL.md"
echo "Version: pinned upstream commit $UPSTREAM_COMMIT"
echo "Runtime for full browser checks: Node.js >=20.10 and Chrome/Chromium."

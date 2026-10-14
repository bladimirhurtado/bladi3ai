#!/usr/bin/env bash
set -Eeuo pipefail

# Install the pinned Anatomy skill into any project without silently overwriting work.
# Usage: ./scripts/install-anatomy.sh [PROJECT_DIR] [--force]
# Requires: bash, curl, tar, git (for project-root discovery is optional).

UPSTREAM_REPO="https://github.com/wheresryan22/anatomy"
UPSTREAM_COMMIT="be2fa9b47a7e4b05dec468be9ffc42e830c2101c"
PROJECT_DIR="."
FORCE="false"

for arg in "$@"; do
  case "$arg" in
    --force) FORCE="true" ;;
    -h|--help)
      sed -n '1,9p' "$0"
      exit 0
      ;;
    *)
      if [[ "$PROJECT_DIR" != "." ]]; then
        echo "ERROR: only one project directory may be supplied." >&2
        exit 2
      fi
      PROJECT_DIR="$arg"
      ;;
  esac
done

PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
DEST="$PROJECT_DIR/.agents/skills/anatomy"
COMPAT="$PROJECT_DIR/skills/anatomy"

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

TMP="$(mktemp -d)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

ARCHIVE="$TMP/anatomy.tar.gz"
SOURCE="$TMP/source"
mkdir -p "$SOURCE" "$(dirname "$DEST")"
curl --fail --location --retry 3 --silent --show-error \
  "$UPSTREAM_REPO/archive/$UPSTREAM_COMMIT.tar.gz" -o "$ARCHIVE"
tar -xzf "$ARCHIVE" --strip-components=1 -C "$SOURCE"

for required in SKILL.md LICENSE kit references examples scripts; do
  [[ -e "$SOURCE/$required" ]] || { echo "ERROR: upstream archive missing $required" >&2; exit 4; }
done

mkdir -p "$DEST"
cp -a "$SOURCE/." "$DEST/"
cat > "$DEST/VENDOR.md" <<EOF
# Anatomy vendor copy

- Upstream: $UPSTREAM_REPO
- Pinned commit: $UPSTREAM_COMMIT
- License: see LICENSE (MIT in the pinned upstream copy)
- Installed by: scripts/install-anatomy.sh

This is a project-local agent skill. Keep the pinned source intact when possible.
To update, review a new upstream commit and test it before replacing this copy.
EOF

# Add the compatibility path only if it is free; never replace an existing path.
if [[ ! -e "$COMPAT" && ! -L "$COMPAT" ]]; then
  mkdir -p "$(dirname "$COMPAT")"
  ln -s ../.agents/skills/anatomy "$COMPAT"
  echo "Created compatibility symlink: $COMPAT"
elif [[ -e "$COMPAT" || -L "$COMPAT" ]]; then
  echo "Kept existing compatibility path unchanged: $COMPAT"
fi

[[ -s "$DEST/SKILL.md" && -s "$DEST/LICENSE" ]] || {
  echo "ERROR: post-install verification failed." >&2
  exit 5
}

echo "Anatomy installed successfully."
echo "Project: $PROJECT_DIR"
echo "Skill:   $DEST/SKILL.md"
echo "Version: pinned upstream commit $UPSTREAM_COMMIT"
echo "Runtime for full browser checks: Node.js >=20.10 and Chrome/Chromium."

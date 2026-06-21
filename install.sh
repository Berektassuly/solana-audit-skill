#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="solana-audit"
SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/skill"
INSTALL_MODE="claude"
TARGET_PATH=""

usage() {
  cat >&2 <<'USAGE'
Solana Audit Skill installer

Usage:
  bash install.sh [--agents] [--path TARGET]
  bash install.sh [--agents] TARGET

Options:
  --agents       Install to ~/.agents/skills/solana-audit by default.
  --claude       Install to ~/.claude/skills/solana-audit by default.
  --path TARGET  Install to a custom target skill directory.
  -h, --help     Show this help.

The installer copies the contents of ./skill into the target directory.
It overwrites this skill's files on rerun but does not delete extra files.
USAGE
}

log() {
  printf '%s\n' "$*" >&2
}

fail() {
  log "Error: $*"
  exit 1
}

expand_path() {
  case "$1" in
    "~") printf '%s\n' "$HOME" ;;
    "~/"*) printf '%s/%s\n' "$HOME" "${1#~/}" ;;
    [A-Za-z]:[\\/]*)
      if command -v wslpath >/dev/null 2>&1; then
        wslpath -u "$1"
      elif command -v cygpath >/dev/null 2>&1; then
        cygpath -u "$1"
      else
        fail "Windows-style paths require wslpath or cygpath; use a POSIX path instead"
      fi
      ;;
    [A-Za-z]:*)
      fail "Windows-style path appears to have lost separators: $1. Use a POSIX path such as /mnt/c/... or C:/... instead"
      ;;
    *) printf '%s\n' "$1" ;;
  esac
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --agents)
      INSTALL_MODE="agents"
      shift
      ;;
    --claude)
      INSTALL_MODE="claude"
      shift
      ;;
    --path|--target)
      [ "$#" -ge 2 ] || fail "$1 requires a target path"
      TARGET_PATH="$2"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      fail "unknown option: $1"
      ;;
    *)
      [ -z "$TARGET_PATH" ] || fail "multiple target paths provided"
      TARGET_PATH="$1"
      shift
      ;;
  esac
done

[ "$#" -eq 0 ] || fail "unexpected arguments: $*"
[ -d "$SOURCE_DIR" ] || fail "source directory not found: $SOURCE_DIR"
[ -f "$SOURCE_DIR/SKILL.md" ] || fail "SKILL.md not found in: $SOURCE_DIR"

if [ -z "$TARGET_PATH" ]; then
  if [ "$INSTALL_MODE" = "agents" ]; then
    TARGET_PATH="$HOME/.agents/skills/$SKILL_NAME"
  else
    TARGET_PATH="$HOME/.claude/skills/$SKILL_NAME"
  fi
fi

TARGET_PATH="$(expand_path "$TARGET_PATH")"
PARENT_DIR="$(dirname -- "$TARGET_PATH")"

if [ -d "$TARGET_PATH" ]; then
  if [ -f "$TARGET_PATH/SKILL.md" ]; then
    if ! grep -Eq '^name:[[:space:]]*solana-audit[[:space:]]*$' "$TARGET_PATH/SKILL.md"; then
      fail "target contains a different skill: $TARGET_PATH/SKILL.md"
    fi
  else
    first_entry="$(find "$TARGET_PATH" -mindepth 1 -maxdepth 1 -print -quit)"
    if [ -n "$first_entry" ]; then
      fail "target exists and is not an existing solana-audit skill: $TARGET_PATH"
    fi
  fi
fi

mkdir -p "$PARENT_DIR"
mkdir -p "$TARGET_PATH"

log "Installing $SKILL_NAME from:"
log "  $SOURCE_DIR"
log "to:"
log "  $TARGET_PATH"

cp -R "$SOURCE_DIR"/. "$TARGET_PATH"/

log ""
log "Installed $SKILL_NAME."
log ""
log "Next steps:"
log "  1. Restart or refresh your Agent Skills runtime if it caches skills."
log "  2. Ask: \"Audit this Anchor instruction for signer and PDA bugs.\""
log "  3. For Solana AI Kit submodule installs, route to skill/SKILL.md in this repo."

#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

removed=0

# Remove agents
for f in "$REPO_DIR"/plugins/*/agents/*.md; do
  [ -f "$f" ] || continue
  dest="$CLAUDE_DIR/agents/$(basename "$f")"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: agents/$(basename "$f")"
    removed=$((removed + 1))
  fi
done

# Remove skills
for d in "$REPO_DIR"/plugins/*/skills/*/; do
  [ -d "$d" ] || continue
  name="$(basename "$d")"
  dest="$CLAUDE_DIR/skills/${name}.md"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: skills/${name}.md"
    removed=$((removed + 1))
  fi
done

# Remove harness docs (exclude AGENTS.md)
for f in "$REPO_DIR"/plugins/*/*.md; do
  [ -f "$f" ] || continue
  name="$(basename "$f")"
  [ "$name" = "AGENTS.md" ] && continue
  dest="$CLAUDE_DIR/harnesses/$name"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: harnesses/$name"
    removed=$((removed + 1))
  fi
done

# Remove hooks (*.sh only)
for f in "$REPO_DIR"/plugins/*/hooks/*.sh; do
  [ -f "$f" ] || continue
  dest="$CLAUDE_DIR/hooks/$(basename "$f")"
  if [ -f "$dest" ]; then
    rm "$dest"
    echo "removed: hooks/$(basename "$f")"
    removed=$((removed + 1))
  fi
done

echo ""
echo "done. removed: $removed files."

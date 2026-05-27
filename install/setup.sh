#!/usr/bin/env bash
# Bootstrap the Claude Code project-log system in the current repo.
# Run from the repo root. Idempotent — won't overwrite existing files.
#
# Usage:
#   bash setup.sh                    # uses $(basename $PWD) as project slug
#   bash setup.sh my-custom-slug     # override slug
#
# Or one-shot:
#   curl -fsSL https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install/setup.sh | bash

set -euo pipefail

REPO_RAW="https://raw.githubusercontent.com/Daeseon-AI-Factory/daseon-blog/main/install"
SLUG="${1:-$(basename "$PWD")}"

green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

if [ ! -d .git ]; then
  red "✗ Not in a git repo. cd into your project root first."
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  yellow "⚠ jq not found. The Stop hook needs jq. Install with:"
  yellow "    macOS:  brew install jq"
  yellow "    Linux:  apt install jq    (or your distro's equivalent)"
fi

echo "→ Project slug: $SLUG"

mkdir -p docs ".claude" "content/logs/$SLUG"
green "✓ Created docs/, .claude/, content/logs/$SLUG/"

if [ -f docs/troubleshooting.md ]; then
  yellow "⚠ docs/troubleshooting.md exists — leaving alone"
else
  curl -fsSL "$REPO_RAW/troubleshooting-starter.md" -o docs/troubleshooting.md
  green "✓ Wrote docs/troubleshooting.md"
fi

if [ -f .claude/settings.json ]; then
  yellow "⚠ .claude/settings.json exists — leaving alone (merge the Stop hook manually)"
  echo ""
  echo "── snippet to merge into .claude/settings.json ──"
  curl -fsSL "$REPO_RAW/settings.json"
  echo "────────────────────────────────────────────────"
else
  curl -fsSL "$REPO_RAW/settings.json" -o .claude/settings.json
  green "✓ Wrote .claude/settings.json"
fi

echo ""
echo "→ Snippet to append to your CLAUDE.md (read it, then paste at the bottom):"
echo ""
echo "──────────────────────────────────────────────────────────────────"
curl -fsSL "$REPO_RAW/claude-md-snippet.md"
echo "──────────────────────────────────────────────────────────────────"
echo ""
green "Done. Three things to do manually:"
echo "  1. Paste the snippet above into your CLAUDE.md (create it if missing)"
echo "  2. Replace <project-slug> with: $SLUG"
echo "  3. Trigger Claude with a real fix and watch the dual-write happen"
echo ""
echo "Full guide: https://daeseon.ai/posts/install-claude-code-project-log"

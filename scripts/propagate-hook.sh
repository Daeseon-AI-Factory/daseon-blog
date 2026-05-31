#!/usr/bin/env bash
# Copy the current Stop hook script from install/hooks/stop-check.sh into every
# known satellite repo, commit, and push. Run from daseon-blog repo root.
#
# When you edit install/hooks/stop-check.sh (e.g. tightening triggers, adding
# a new keyword), run this once. No need to touch each satellite manually.
#
# Idempotent — re-running with no source change is a no-op (git commit will say
# "nothing to commit"). Safe to run anytime.
#
# Assumes each satellite is cloned under /Users/daeseonyoo/Documents/GitHub/ai-product/<dir>
# with a clean working tree. Skips any satellite whose working tree is dirty
# (prints a warning so you can resolve manually).

set -uo pipefail

SOURCE="$(pwd)/install/hooks/stop-check.sh"
SETTINGS="$(pwd)/install/settings.json"

if [ ! -f "$SOURCE" ]; then
  echo "✗ $SOURCE not found — run from daseon-blog repo root." >&2
  exit 1
fi

# satellite dir → slug (used only for the commit message)
declare -a SATELLITES=(
  "/Users/daeseonyoo/Documents/GitHub/ai-product/shadow-ai"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/ddalkkak"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/meta-smart-glass"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/jarvis-pc"
)

green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

for repo in "${SATELLITES[@]}"; do
  echo ""
  echo "→ $repo"

  if [ ! -d "$repo/.git" ]; then
    yellow "  ⚠ not a git repo (skipping)"
    continue
  fi

  # Check working tree is clean
  if [ -n "$(git -C "$repo" status --porcelain)" ]; then
    yellow "  ⚠ dirty working tree — skipping. Commit/stash local changes first."
    continue
  fi

  # Make sure we're on main (or master)
  branch=$(git -C "$repo" rev-parse --abbrev-ref HEAD)
  if [ "$branch" != "main" ] && [ "$branch" != "master" ]; then
    yellow "  ⚠ on branch '$branch' (not main/master) — skipping"
    continue
  fi

  mkdir -p "$repo/.claude/hooks"
  cp "$SOURCE" "$repo/.claude/hooks/stop-check.sh"
  chmod +x "$repo/.claude/hooks/stop-check.sh"
  cp "$SETTINGS" "$repo/.claude/settings.json"

  if [ -z "$(git -C "$repo" status --porcelain)" ]; then
    green "  ✓ hook already current (no change)"
    continue
  fi

  git -C "$repo" add .claude/hooks/stop-check.sh .claude/settings.json
  git -C "$repo" commit -m "Sync Stop hook from daseon-blog [no-log]" >/dev/null
  if git -C "$repo" push 2>/dev/null; then
    green "  ✓ hook updated + pushed"
  else
    red "  ✗ push failed (commit local, push manually)"
  fi
done

echo ""
green "Done. Run again whenever you edit install/hooks/stop-check.sh."

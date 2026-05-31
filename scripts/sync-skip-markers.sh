#!/usr/bin/env bash
# Audit each satellite's git history for [no-log]/[skip-log] commits that have
# no corresponding `<!-- skipped: hash subject -->` marker in docs/troubleshooting.md,
# and append the missing markers in one batch.
#
# Why: the v1/v2 Stop hook only added markers when fired live. If a commit was
# tagged [no-log] before the hook was installed (or fired with a different
# implementation), the audit trail is incomplete. This script reconciles.
#
# Run from daseon-blog repo root. Reads/writes each satellite under
# /Users/daeseonyoo/Documents/GitHub/ai-product/<dir>.
#
# Safe to re-run. Only adds markers, never modifies existing ones.

set -uo pipefail

declare -a SATELLITES=(
  "/Users/daeseonyoo/Documents/GitHub/ai-product/shadow-ai"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/ddalkkak"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/meta-smart-glass"
  "/Users/daeseonyoo/Documents/GitHub/ai-product/jarvis-pc"
)

green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

for repo in "${SATELLITES[@]}"; do
  echo ""
  echo "→ $repo"

  if [ ! -d "$repo/.git" ]; then
    yellow "  ⚠ not a git repo (skipping)"
    continue
  fi

  if [ -n "$(git -C "$repo" status --porcelain)" ]; then
    yellow "  ⚠ dirty working tree — skipping (commit/stash first)"
    continue
  fi

  TROUBLESHOOTING="$repo/docs/troubleshooting.md"
  if [ ! -f "$TROUBLESHOOTING" ]; then
    yellow "  ⚠ docs/troubleshooting.md missing (skipping — run install kit first)"
    continue
  fi

  # Find commits whose subject contains [no-log] or [skip-log]
  # Output: <hash> <subject>
  needed=$(git -C "$repo" log --pretty=format:'%h %s' --grep='\[no-log\]\|\[skip-log\]' 2>/dev/null || true)
  if [ -z "$needed" ]; then
    green "  ✓ no [no-log] commits in history"
    continue
  fi

  total=$(echo "$needed" | wc -l | tr -d ' ')
  added=0
  while IFS= read -r line; do
    h=$(echo "$line" | awk '{print $1}')
    if grep -q "$h" "$TROUBLESHOOTING" 2>/dev/null; then
      continue
    fi
    s=$(echo "$line" | cut -d' ' -f2-)
    printf '<!-- skipped: %s %s -->\n' "$h" "$s" >> "$TROUBLESHOOTING"
    added=$((added + 1))
  done <<< "$needed"

  if [ "$added" -eq 0 ]; then
    green "  ✓ all $total [no-log] commits already marked"
    continue
  fi

  green "  ✓ added $added missing skip markers (of $total [no-log] commits)"

  # Commit + push
  git -C "$repo" add docs/troubleshooting.md
  git -C "$repo" commit -m "Backfill skip markers for $added historical [no-log] commits [no-log]" >/dev/null
  if git -C "$repo" push 2>/dev/null; then
    green "  ✓ pushed"
  else
    yellow "  ⚠ push failed — push manually later"
  fi
done

echo ""
green "Done."

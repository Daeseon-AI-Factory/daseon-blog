#!/usr/bin/env bash
# Create a new kind:discussion log entry stub. Lightweight writer for the
# "I just had a strategy chat / brainstorm / planning conversation that
# produced or surfaced options" case.
#
# Usage:
#   bash scripts/new-discussion.sh <project-slug> <short-slug-for-filename>
#
# Example:
#   bash scripts/new-discussion.sh shadow-ai drill-ux-direction
#
# Writes to: content/logs/<project-slug>/<YYYY-MM-DD>-discussion-<slug>.mdx
# Fills frontmatter, leaves the body slots for the human (or Claude) to fill.

set -uo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <project-slug> <short-slug>"
  echo "Example: $0 shadow-ai drill-ux-direction"
  exit 1
fi

PROJECT="$1"
SLUG="$2"
DATE=$(date +%Y-%m-%d)
FILENAME="${DATE}-discussion-${SLUG}.mdx"

# Determine target dir: if we're in the hub repo (daseon-blog) and this is
# a hub-project entry, write to content/logs/<project>/. If we're in a
# satellite repo, also content/logs/<project>/. Same path either way.
TARGET_DIR="content/logs/${PROJECT}"
TARGET="${TARGET_DIR}/${FILENAME}"

if [ -f "$TARGET" ]; then
  echo "✗ $TARGET already exists. Pick a different short-slug."
  exit 1
fi

mkdir -p "$TARGET_DIR"

cat > "$TARGET" <<EOF
---
title: "<one-line title — what the discussion was about>"
date: "${DATE}"
project: "${PROJECT}"
kind: "discussion"
visibility: "public"
language: "en"
source: "<claude.ai chat / in-person / slack / etc — and rough duration if known>"
participants: ["me"]
summary: "<one sentence — what was discussed and what the outcome was>"
tags: []
---

## Context

<Why this discussion happened. What was the trigger? What constraint or
opportunity prompted you to think about this now?>

## What we discussed

<List the options or threads that came up. Be honest about which option
felt natural at first and which you had to push back on.>

## What I rejected from AI suggestion

<Only if applicable. If AI's first suggestion was X and you pushed back,
what was X and why did you reject it? This section captures the
*judgment* moment — the AI engineer's differentiating signal.>

## Outcome

<What was decided, or — if no decision yet — what the next step is.
If a decision was made, link to the kind:decision entry with
\`linked_decision: "<filename>"\` in frontmatter above.>

## Why this matters

<Why is recording this discussion worth doing? If you can't articulate
this in one or two sentences, the discussion probably wasn't substantial
enough to log — delete this file and move on.>

## Next steps

<Concrete actions you'll take based on this discussion.>
EOF

echo "✓ Created $TARGET"
echo ""
echo "Next:"
echo "  1. Fill in the slots above (title, source, body sections)"
echo "  2. If a decision was made, also create a kind:decision entry:"
echo "     - For substantial (architecture / vendor / monetization): Tier 1, 8 slots"
echo "     - For notable (feature direction / UX): Tier 2, 6 slots"
echo "  3. Commit with [no-log] if this is the only file — the entry IS the log."

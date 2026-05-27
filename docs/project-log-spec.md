# Project log spec (portable to any Claude Code project)

This is the system this repo uses to record the *real* history of each project — every non-trivial decision, fix, retrospective, and strategy memo — *while you're working*, not after.

Two design goals:

1. **Dual-write**: machine-facing reference (terse, deduplicated) + human-facing surface (narrative, timeline). Same fact, two indexes.
2. **No hallucination**: Claude only writes what it verified. Hard rules below.

If you're another engineer using Claude Code and you want the same system in your repo, copy this file, the CLAUDE.md snippet, and the Stop hook. Adjust paths to your stack.

---

## What gets logged

| Kind | Purpose | Typical visibility |
|---|---|---|
| `troubleshoot` | A bug or platform behavior that broke, was diagnosed, was fixed. | public |
| `tech-retro` | An architecture, dependency, or refactor decision worth recalling. | public |
| `ux-retro` | A UI / copy / layout choice made on judgment. | public |
| `business` | Strategy, positioning, or competitive memo. | private |
| `monetization` | Pricing, ads, deal terms, cost analysis. | private |
| `update` | Shipped a feature, cut a version, hit a milestone. | public |

`update` is for "what changed for users", not "what I did today". Daily standups don't belong here.

**Trigger heuristic**: would future-you or a collaborator benefit from a 60-second read in a year? If yes, log. If you'd skip it on re-reading, don't log it.

What does NOT belong: routine renames, lint fixes, typo fixes, dependency bumps with no behavior change, formatting commits.

---

## Where it lives (two files per event)

### 1. Machine-facing: `docs/troubleshooting.md` (or `docs/decisions.md` for choices)

A flat append-only log. New entries at the bottom. Format:

```markdown
## <short title>

- **Symptom**: <literal error message or observable behavior>
- **Cause**: <verified explanation> · (or `Hypothesis: ...` + `Verified by: ...`)
- **Fix**: <files changed, mechanism>
- **Commit**: <hash from `git rev-parse HEAD` AFTER committing>
- **Pattern**: <one-line recurring lesson — optional>
```

Purpose: when Claude (or you) is about to touch the same area again, grep this file. It's a problem-indexed cache.

### 2. Human-facing: `content/logs/<project-slug>/<YYYY-MM-DD>-<short-slug>.mdx`

One file per event. Project-grouped, date-named. Frontmatter:

```yaml
---
title: "Concrete, one-line title in present or past tense"
date: "YYYY-MM-DD"
project: "<project-slug>"
kind: "troubleshoot|tech-retro|ux-retro|business|monetization|update"
visibility: "public|unlisted|private"
language: "en"
summary: "One or two sentences. This is the only thing most readers will see."
tags: ["framework", "concept"]
---
```

Body: free-form markdown. Common sections — *Symptom*, *Cause*, *Fix*, *What I'd do differently*, *Pattern* — but adapt. For non-bug entries (retro, business), narrative > template.

Purpose: surfaced on the project's public page as a timeline. Both signal-to-recruiters AND personal archive.

If your project doesn't have a website, skip the mdx and use `docs/logs/<project>/<date>-<slug>.md` instead. The structure is what matters; the rendering is optional.

---

## Anti-hallucination rules (the part that matters)

These are non-negotiable. Claude (and you) MUST follow them.

### Rule 1: Symptom is literal

Paste the actual error message, stack trace, or terminal output. Use a fenced code block. Do not paraphrase. Do not summarize. If the stack is long, paste the first 5 lines + the "Import trace" / "Caused by" / final line.

❌ "The build had a webpack error related to node modules."
✓ `You may need an additional plugin to handle "node:" URIs. Import trace: node:path → ./lib/source.ts → ./lib/logs.ts → ./components/LogTimeline.tsx`

### Rule 2: Cause is verified or marked

Only state what you read in actual code, ran in an actual command, or saw in actual logs. Three valid forms:

✓ **Verified**: "`lib/storage.ts:savePost` calls `fs.writeFile` before the `if (githubConfigured())` branch. Production fs is read-only — line 47 crashes before commit runs."

✓ **Hypothesis with evidence**: "Hypothesis: build cache held a stale module. Verified by: deleting `.next/` and rebuilding cleared the error."

✓ **Suspected, not verified**: "Suspected: cookie SameSite=Lax blocks the cross-origin admin request. Not yet verified — needs a test from a third-party origin."

❌ **Forbidden**: "Probably a webpack issue" / "Looks like a TypeScript bug" with no evidence.

### Rule 3: Fix names actual files

`git diff` is the source of truth. If you write "fixed savePost in lib/storage.ts", `git diff` must show changes there. Do not write speculative fixes ("I think changing X to Y would help") — those go in a separate "Hypothesis" entry, not as Fix.

### Rule 4: Commit hash from git, not from memory

Sequence:
1. Make changes
2. Stage + commit
3. `git rev-parse HEAD` → real hash
4. Write the log entry with that hash
5. `git commit --amend` to include the log file in the same commit (optional — separate commit also fine, just reference the fix commit's hash)

Never write "commit abc1234" before the commit exists. Never carry an older hash forward "because the fix is similar".

### Rule 5: Date from git

For just-fixed issues: `git log -1 --format=%cI` gives ISO commit time. Truncate to date.

For forward-looking entries (decisions, retros being written in the moment): use today's date as established at the start of the session. Do not guess.

### Rule 6: Pattern is rare

Only write a Pattern line if you can name a recurring lesson that applies beyond this specific incident. Most entries don't have one. **Padding "Pattern" sections with motherhood-and-apple-pie advice is worse than omitting them** — it teaches the index to ignore that field.

❌ Pattern: "Test code thoroughly before deploying."
✓ Pattern: "Code paths gated by env vars that are only set in production are effectively untested. Set the env locally and exercise the prod path, or write a unit test that mocks it."

### Rule 7: Don't fabricate timing or metrics

If you don't have actual measurements, don't write them. "It was about 60s" is allowed if you saw 60s. "It took some time" is fine. "It took exactly 1m 23s" is forbidden unless you have the timestamp.

---

## How to instruct Claude (CLAUDE.md snippet to copy)

Paste this into your project's CLAUDE.md:

```markdown
## Project log (required, dual-write)

When you fix or decide something non-trivial, write BOTH in the same turn as the commit:

1. `docs/troubleshooting.md` (terse problem-indexed reference)
2. `content/logs/<project-slug>/<YYYY-MM-DD>-<short-slug>.mdx` (dated narrative)

Format and anti-hallucination rules: see `docs/project-log-spec.md`.

What counts as non-trivial: build/deploy errors, hidden coupling found, dependency-version migrations, architecture decisions, infra choices, design/copy decisions made on judgment, strategy or pricing memos.

What doesn't: routine renames, lint fixes, typo fixes, dependency bumps without behavior change, formatting commits.

Hard rules: Symptom is literal (paste error text, not paraphrase). Cause is verified or marked Hypothesis/Suspected with evidence. Commit hash comes from `git rev-parse HEAD` AFTER committing, not before. No fabricated metrics.
```

## Stop-hook reminder (settings.json snippet)

Reminds Claude after any commit in the last 2 minutes. Add to `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "recent=$(git log --since=\"2 minutes ago\" --oneline 2>/dev/null | head -1); [ -z \"$recent\" ] && exit 0; jq -n --arg c \"$recent\" '{systemMessage: (\"⚠ Recent commit: \" + $c + \"\\n\\nLog this in docs/troubleshooting.md + content/logs/ (problem + cause + fix + commit hash).\")}'",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

Requires `jq` on PATH (preinstalled on macOS and most Linux dev envs).

---

## Why dual-write instead of one source

Tried single-source. Problems:

- **One date-indexed surface only** (mdx logs): grep "EROFS" returns the same fact buried in narrative. Slow recall when you hit the same bug again.
- **One problem-indexed surface only** (troubleshooting.md): no narrative, no timeline, no recruiter-readable artifact, no public archive.

Both surfaces are cheap to write (the second one is mostly a richer copy of the first) but each one alone serves only half the use cases. The cost of duplication is paid back the first time a fix recurs and you hit grep before you hit the timeline.

---

## What this system does NOT do

- It doesn't replace ADRs (architecture decision records) for large teams. ADRs typically live in their own repo with review gates. For solo / small projects, this log is enough.
- It doesn't replace a project management tool. Issues and tickets belong in GitHub Issues or Linear; this log records *what happened*, not *what's planned*.
- It doesn't auto-cross-link to external systems. If you want each entry to mention the related JIRA ticket, add a `jira: "PROJ-123"` field to the frontmatter. The spec doesn't enforce it.

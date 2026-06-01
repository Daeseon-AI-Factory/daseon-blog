# Project Log System — Complete Map (handoff for analysis)

> A self-contained map of the "project log" system in this repo (`daseon-blog`).
> Hand this file to another AI/engineer to analyze the system. Paths are repo-relative.
> Generated 2026-06-01 from a file-level inventory sweep.

## Purpose (why it exists)

AI generates code cheaply; the scarce part is the **judgment** behind it — which option was
chosen, what trade-off was accepted, what didn't work, what the author didn't initially understand.
That judgment normally lives in a chat and evaporates. This system forces every non-trivial action
to leave a **durable, dual-written record** so the *why* survives:

1. **Machine-facing** (`docs/troubleshooting.md`) — terse, problem-indexed; grep it when you hit the same bug again.
2. **Human-facing** (`content/logs/<slug>/*.mdx`) — dated narrative, rendered on the site as a portfolio timeline.

Secondary purposes: it is itself a portfolio piece (methodology as differentiation for a job hunt),
and it is packaged to be installed into other repos.

## Architecture — two control planes (the core mental model)

| Plane | What | Property |
|---|---|---|
| **Harness** (code) | the Stop hook | always runs, can **hard-block** the turn |
| **Prompt** (text) | `CLAUDE.md` rules | read every turn, **asks** Claude to comply, no enforcement |

Everything else is support: **Data** (the records), **Read path** (load records to the site),
**Rendering** (show them), **Install/propagation** (give the system to other repos),
**Spec/docs** (the canonical written explanation).

The deep design constraint: a hook can only enforce on an **observable artifact** (a git commit).
A decision made only in conversation is invisible to it — so the prompt layer is a request, not a guarantee.
(See `content/posts/en/observability-is-enforceability.mdx`.)

## File inventory by layer

### 1. Enforcement (harness — the code that blocks)
- `.claude/settings.json` — registers the `Stop` hook (`bash .claude/hooks/stop-check.sh`, 10s). Only hook registered.
- `.claude/hooks/stop-check.sh` — **the enforcement engine (v3.1, live).** On turn end: pass if latest commit hash already appears in the log surface; else if a *positive trigger* fired (LOC>200 / sensitive path / subject keyword) → block (overrides `[no-log]`); else if `[no-log]` tag → auto-append a skip marker; else → block. Emits `{decision:"block",reason}` JSON via `jq`. Auto-suggests decision tier (T1/T2/T3).
  - NOTE: `decision-reminder.sh` and a `.last-stop-hash` state file do **not** exist (designed but not applied — see "Known issues").

### 2. Rules (prompt — text Claude reads every turn)
- `CLAUDE.md` — the single text artifact loaded every turn. Relevant sections:
  - "Project log (required, dual-write)" — what counts as non-trivial, how to satisfy the hook, the `[no-log]`/override escape valves.
  - Anti-hallucination rules — Symptom=literal, Cause=verified, Fix=actual files, Date=git, Pattern=only if recurring.
  - Categories/kinds + `decision`/`discussion`/`learning-gap` specs (required frontmatter + body slots).
  - "Presenting options to the human" — per-option Why/Trade-off/Reversibility/Evidence/Missing-info.
  - "Decision tiers" — T1 (substantial) / T2 (notable) / T3 (trivial) slot requirements.

### 3. Data (the records themselves)
- `docs/troubleshooting.md` — flat machine index. Entry format: Symptom/Cause/Fix/Commit/Pattern. Also holds `<!-- skipped: HASH -->` and `<!-- override-trigger: HASH ... -->` markers (the hook's hash sentinel greps this file).
- `content/logs/daeseon-ai/*.mdx` — ~33 dated narrative entries (one dir per project slug). Frontmatter: title, date, project, kind, visibility, language, summary, tags, + per-kind: tier, status, reversibility, source, participants, linked_decision, handwritten, backfilled. Optional `*.human.mdx` companions (human annotation; none created yet).

### 4. Types + read path (records → site)
- `lib/log-kinds.ts` — **client-safe boundary file** (no `fs`): `LogKind` union, `LogFrontmatter` type, tier/status/reversibility enums, kind labels.
- `lib/logs.ts` — loads/parses log entries from `content/logs/` (frontmatter + date coercion).
- `lib/source.ts` — content read path + **cross-repo aggregation**: if a project's frontmatter has `logSourceRepo`, pulls that satellite's logs via the GitHub API. `listProjectLogs`, `getProjectLog`.
- `lib/storage.ts` — **write path** for `*.human.mdx` companions (`saveHumanCompanion`/`deleteHumanCompanion`). Hard constraint: never `fs.writeFile` in production code.
- `lib/projects.ts` — project frontmatter loader; defines `logSourceRepo`, requires `url`.

### 5. Rendering (where logs are shown)
- `app/(public)/projects/page.tsx` — `/projects` grid.
- `app/(public)/projects/[slug]/page.tsx` — single project; renders `ProjectBody`.
- `app/(public)/projects/[slug]/log/[entry]/page.tsx` — single log entry; renders `LogBody`.
- `app/(public)/method/page.tsx` — `/method`, the methodology doc page (tiers, kinds, frameworks).
- `app/api/admin/log-companion/route.ts` — admin API to save/delete `.human.mdx` companions (+ ISR revalidate).
- `components/`: `ProjectBody.tsx` (calls `listProjectLogs`), `ProjectStatusHeader.tsx` (judgment-layer counts), `LogTimeline.tsx` (filterable entry list, client), `LogBody.tsx` (dual-column AI + human), `ProjectList.tsx`, `ProjectCard.tsx`, `mdx-components.tsx`.

### 6. Install + cross-repo propagation (give the system to other repos)
- `install/setup.sh` — one-shot installer (curls hook + settings + CLAUDE.md snippet into a target repo).
- `install/hooks/stop-check.sh` — the **propagation source** copy of the hook (kept byte-identical to `.claude/`).
- `install/settings.json`, `install/claude-md-snippet.md`, `install/troubleshooting-starter.md`, `install/README.md`.
- `scripts/propagate-hook.sh` — syncs `install/` hook + settings into 4 satellite repos (skips dirty/non-main; **overwrites settings.json wholesale**).
- `scripts/sync-skip-markers.sh` — backfills missing skip markers.
- `scripts/new-discussion.sh` — scaffolds a `kind:discussion` entry.

### 7. Spec + canonical docs + published posts (the written explanation)
- `docs/project-log-system-v1-blueprint.md` — **most authoritative**: ~500-line, 14-section, externally-reviewable spec (+ `.v0-draft.md` backup).
- `docs/project-log-spec.md` — kind definitions and the system spec for re-use.
- `docs/architecture.md` — build vs runtime, fs vs fetch, ISR caching, the read-path constraints.
- Published posts: `content/posts/{en,ko}/project-log-system-v1.mdx` (live-build retrospective), `install-claude-code-project-log.mdx` (how-to), `observability-is-enforceability.mdx` (the concept post on why the prompt layer can't be enforced).

## Data / control flow

```
ENFORCE:  commit → turn ends → Stop hook (stop-check.sh) →
          hash already in troubleshooting.md/content-logs?  → pass
          else positive trigger fired?  → BLOCK (overrides [no-log])
          else [no-log] tag?  → auto-append skip marker → pass
          else  → BLOCK (require dual-write)
          → author writes both files + commits → next Stop sees hash → pass

DISPLAY:  content/logs/*.mdx (+ satellite logs via logSourceRepo)
          → lib/logs.ts / lib/source.ts → ProjectBody → LogTimeline / LogBody → /projects/<slug>
```

## Where to start reading (for an external analyzer, ranked)

1. `docs/project-log-system-v1-blueprint.md` — the full spec with rationale.
2. `CLAUDE.md` → "Project log (required, dual-write)" — the rules as actually enforced.
3. `.claude/hooks/stop-check.sh` — the real enforcement code (~150 lines).
4. `docs/project-log-spec.md` — kind/tier definitions.
5. `content/posts/en/observability-is-enforceability.mdx` — the design's load-bearing idea (observability = enforceability).

## Known issues / current state (from a 2026-06-01 audit — verify independently)

- **Live hook is v3.1.** A v3.2 fix (per-commit iteration + jq fail-closed + `lib/source.ts` coverage) is **designed but NOT applied** (self-modification of `.claude/hooks/` requires explicit human approval, which is pending).
- Audit found 6 defects: (1) hook reads only HEAD → intermediate commits in a multi-commit turn slip; (2) missing `jq` → fails **open** (enforcement silently off); (3) keyword `auth` matches "author" (over-fire); (4) sensitive-path regex misses `lib/source.ts` (under-fire); (5) satellite repos run 3 divergent hook generations (propagation drift); (6) `propagate-hook.sh` overwrites `settings.json` wholesale (would clobber satellite-specific hooks).
- ~33 log entries exist; no `.human.mdx` companions created yet; 2 satellites pending hook propagation.

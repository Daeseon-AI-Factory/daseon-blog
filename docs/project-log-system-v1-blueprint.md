# Project Log System v1 — Blueprint

> **Status**: Spec in review. Author: Daeseon Yoo. Reviewers welcome — see "How to read this" below.
>
> **TL;DR**: A logging system for solo developers who delegate substantial work to AI and need every decision visible, queryable, and annotatable later. Built on three established frameworks (Nygard ADR, Bezos two-way doors, Klein pre-mortem) plus one novel piece (AI-author + human-annotator dual columns). Shipped incrementally — minimum viable v1 in 48 hours, real v1 in 1-2 weeks.

## How to read this

This document is the target shape of the system, written for two audiences:

- **Me (the builder)** — to keep the spec lockable so I don't drift mid-build
- **External reviewer** — to push back on anything that sounds clever but doesn't work

Tier-1 critique I'm specifically asking for: is the *judgment-recording* layer (decision tiers + learning-gap) the right differentiator, or am I papering over weaker fundamentals? Is the 48-hour scope realistic, or am I about to ship a shell?

---

## 1. Why this exists

I'm a senior backend engineer (6 years), now job-hunting in Toronto, and I've been delegating most code writing to Claude Code. The output is fine. What's harder is *staying in the loop on why* — three months in, even I can't reconstruct why we chose Tauri over Swift on one project, or why a database column was added to break a specific bug.

The risk that motivates this system: in a world where anyone can ship code with AI, the differentiator for engineers is **the judgment layer** — what you choose to build, what trade-offs you accept, what AI suggestions you reject, what gaps in your own understanding you notice and close. None of this lives in the code. It lives in *records*, or it disappears.

Existing tools cover *parts* of this:

- **ADR (Nygard 2011)** captures decisions but not incidents or daily work
- **Conventional commits + semantic-release** captures changes but not reasoning
- **Devlogs (e.g. antirez/Redis)** capture narrative but aren't structured
- **Lab notebooks** capture chronology but aren't multi-project
- **Build-in-public (levelsio, Tony Dinh)** capture marketing but not internal decisions

This system combines them into a single dual-write layer (problem-indexed grep cache + dated narrative timeline) running across multiple repos, with explicit slots for the judgment artifacts that other systems leave implicit.

## 2. Four properties (what makes this different)

1. **Nothing missed by default.** A positive-trigger layer in the commit hook overrides author's `[no-log]` tag when a commit exceeds 200 LOC, touches sensitive paths, or carries certain keywords. Author judgment slips ~30-50% on what's "trivial"; the system catches it.
2. **AI-author + human-annotator.** Every AI-written log entry has a sibling `.human.mdx` slot rendered side-by-side. Empty slots render as "REVIEW NEEDED" — absence is visible, not silent.
3. **Cross-repo aggregation.** A hub site (daseon.ai) pulls logs on-demand from N satellite repos via GitHub Contents API. No sync, no second source of truth.
4. **Tiered decision capture.** Decisions are recorded with templates scaled to their weight (T1 substantial → MBA-grade 8-slot template; T2 notable → 6-slot; T3 trivial → no template). Plus a `learning-gap` kind for what the human didn't initially understand — the growth artifact most systems omit.

## 3. The kind taxonomy

The unit of logging is a single MDX file under `content/logs/<project-slug>/<date>-<slug>.mdx`, with `kind:` frontmatter that determines its template and rendering.

| Kind | Purpose | Visibility default | Template heaviness |
|---|---|---|---|
| `troubleshoot` | Symptom + cause + fix for a specific incident | public | light |
| `tech-retro` | Technical change recap (what shipped, why) | public | medium |
| `ux-retro` | UX change recap | public | medium |
| `decision` | Judgment artifact — multiple options weighed | public (private if sensitive) | tiered (T1/T2/T3) |
| `discussion` | Conversation that surfaced options | public/private | light |
| `learning-gap` | What the human didn't understand initially | public/private | light |
| `business` | Strategy memo | private (default) | medium |
| `monetization` | Money decisions | private (default) | medium |
| `update` | General update or milestone | public | light |
| `snapshot` | Architecture overview / monthly state capture | public | medium |

The differentiating kinds for the AI engineer signal are `decision`, `discussion`, and `learning-gap`. The others exist in any standard logging convention.

## 4. Decision tiers (the MBA-grade layer)

Adapted from established frameworks:

- **Two-way / one-way doors** — Bezos 1997 shareholder letter
- **Pre-mortem** — Gary Klein, *Harvard Business Review* 2007
- **DACI** — Atlassian decision-roles framework
- **ADR** — Michael Nygard, *Documenting Architecture Decisions* 2011

### Tier 1 (substantial decisions)

Triggered by: architecture / vendor choice / monetization / security posture / data model / major refactor / LOC > 500 / two or more positive triggers fired on the commit.

Required slots (8):

1. **Context & constraints** — situation + limits
2. **Goals (ranked)** — what's being optimized; if multiple, the priority order
3. **Options considered** (≥3, including "do nothing"/"defer") — each option has Cost / Reversibility (two-way / hard / one-way) / Risk / Evidence base
4. **Trade-off accepted** — explicit "what is lost by this choice"
5. **Pre-mortem** — assume failure at 6 months; describe three plausible failure modes
6. **Decision criteria to flip** — what signal would reverse this decision
7. **Success measure** — how we'll know it worked (specific metric)
8. **Reversal plan** — if wrong, what's the unwind procedure

Authoring time: 20-30 min when done thoroughly. Examples worth a Tier-1 entry: switching default LLM vendor, choosing data layer (Postgres vs NoSQL), monetization model (subscription vs MoR), security architecture (5-layer vs minimal).

(Dropped from the original 11-slot draft after review: `Stakeholders DACI-lite` — redundant for solo work; `Second-order effects` — overlaps in practice with "Decision criteria to flip".)

### Tier 2 (notable decisions)

Triggered by: feature direction / UX call / dependency upgrade / LOC 200-500 / one positive trigger.

Required slots (6):

1. Context
2. Options considered (≥2)
3. Chosen + Why
4. Trade-off
5. Reversibility
6. Verified by

Authoring time: 5-10 min.

### Tier 3 (trivial)

Variable renames, lint fixes, formatting, dep bumps with no behavior change. No decision entry; the commit alone suffices.

### How tier is determined

Auto-suggested by the Stop hook based on positive-trigger output. Author overrides with `:tier-1` / `:tier-2` / `:tier-3` in the commit subject. Overrides downgrading from auto-T1 or upgrading from auto-T3 require a one-line reason in the entry.

`reversibility` uses Bezos two-way / one-way door framing:
- `two-way` — easy to revert (interface flip, config change)
- `hard` — effortful to revert (data migration, vendor lock-in light)
- `one-way` — committed irreversibly (public API contract, security disclosure)

## 5. Learning-gap kind (the growth artifact)

The kind exists because *recording what you didn't know* is the most under-captured signal of an engineer's growth.

Triggered by: the human says "I asked this before" / re-asks a question with different wording / acknowledges a mental-model gap mid-conversation. Claude Code proposes the entry in the same turn.

Required slots (5):

1. What I (initially) didn't understand
2. Where the gap came from (prior assumption, missing context, mental model)
3. What clicked
4. Still confused (if anything remains)
5. Related wiki entries to update

Workflow: entries are written as they happen. Quarterly: walk through the `learning-gap` entries, consolidate into wiki updates.

Example use cases for the author:
- "I thought dense embeddings were strictly better than sparse retrieval until..."
- "I kept reaching for connection pooling but didn't actually understand statement preparation until..."
- "I had a wrong mental model of Next.js ISR until commit X failed in a way that forced..."

This kind is the most novel piece of the system. The author isn't aware of any other public log convention that explicitly tracks the *learner's* confusion path.

## 6. Cross-repo aggregation

Each satellite repo (e.g. `shadow-ai`, `dalkkak-ai`, `jarvis-pc`, `meta-smart-glass`) keeps its own `content/logs/<slug>/` directory. The hub site (`daseon-blog`) has, on each project's MDX entry, a `logSourceRepo: "owner/name"` frontmatter field.

When a visitor opens `/projects/<slug>` on the hub, the hub fetches via GitHub Contents API + 30s ISR cache:

- The satellite's `content/logs/<slug>/*.mdx` files
- The hub's local `content/logs/<slug>/*.human.mdx` files (human annotations)

Both are merged and rendered as a two-column timeline. No sync, no webhooks, no scheduled jobs — pull on demand.

Trade-off: GitHub PAT needs `Contents: read` on each source repo. Same-owner repos work with the existing token; different-owner repos need a new fine-grained PAT.

## 7. Automation (the Stop hook)

The Stop hook fires after every Claude Code turn that produced a recent commit (<3 min window). It runs five branches in order:

1. No recent commit → pass
2. Hash already in `docs/troubleshooting.md` or `content/logs/` → pass (logged)
3. **Positive trigger fired** → block; require dual-write entry OR explicit `<!-- override-trigger: hash subject — rationale -->` line
4. `[no-log]` / `[skip-log]` in subject AND no trigger → auto-append skip marker, pass
5. Default → block; require dual-write or `[no-log]` tag

Positive triggers (any one fires):

- LOC delta > 200 (insertions + deletions across all files)
- Sensitive paths: `lib/*storage*`, `lib/*auth*`, `lib/*hooks*`, `middleware.*`, `app/(admin)/*`, `app/api/auth/*`, `.claude/settings*`, `.claude/hooks/*`, `install/*`, `next.config*`, `package.json`, `tsconfig*`, `migrations/*`, `prisma/schema*`, `*.schema.*`
- Subject keywords (case-insensitive): `decision`, `architecture`, `fallback`, `audit`, `auth`, `security`, `migration`, `dispatcher`, `ADR-N`, `refactor`, `pivot`, `breaking`, `deprecat`, `hidden coupling`

The override mechanism (`<!-- override-trigger: ... -->`) requires a real one-sentence rationale. Silent overrides are deliberately disabled because the system's whole purpose is to preserve human reasoning in the audit trail.

## 8. Visible surfaces on the hub

### 8.1 `daseon.ai/projects/<slug>` — per-project page

Three blocks, top to bottom:

1. **Status header** (auto-rendered from logs):
   ```
   v0.4 shipped · 98 commits · 30 logged (31%) · 12 skip-marked
   8 decisions (T1: 3, T2: 5) · 2 learning-gaps · last update 2026-05-31
   [Architecture overview ↓] [Latest snapshot ↓]
   ```
   The decision/learning-gap counts are the *portfolio signal* — they distinguish this from a project that's just "shipped a lot."

2. **Activity heatmap** (calendar grid colored by entry kind) — deferred to v1.1. Status header alone in v1.

3. **Timeline** — newest first, two-column rendering of AI entry (left) + human commentary (right). Empty right column = "REVIEW NEEDED" placeholder.

### 8.2 `daseon.ai/method` — methodology as portfolio piece

A surface dedicated to explaining the system itself. Sections:

- Why this exists (the AI delegation + traceability framing)
- Four properties
- Decision tiers + framework citations
- Try it (one-line install pointing to /posts/install-claude-code-project-log)
- Live build journal (link to the build post)

Header menu adds `Method`. About page links to it.

### 8.3 `daseon.ai/posts/project-log-system-v1` — live build retrospective

Long-form post documenting the build itself. Format B (project recap) shape: What I did / What it was before / What I changed / What happened / What it doesn't do / What's next. ~600-800 lines when finalized.

## 9. Repo file layout

### Satellite

```
shadow-ai/
├── .claude/
│   ├── hooks/stop-check.sh           # v3 positive-trigger hook
│   └── settings.json
├── CLAUDE.md                         # snippet appended
├── docs/troubleshooting.md           # problem-indexed grep cache + skip markers
└── content/logs/shadow-ai/
    ├── 2026-05-31-architecture-overview.mdx       # kind: snapshot
    ├── 2026-05-31-monthly-snapshot.mdx            # kind: snapshot, period: "2026-05"
    ├── 2026-05-27-llm-vendor-decision.mdx          # kind: decision, tier: "1"
    ├── 2026-05-31-leitner-srs-for-drills.mdx      # kind: tech-retro
    └── 2026-05-30-jwt-revocation.mdx              # kind: troubleshoot
```

### Hub

```
daseon-blog/
├── content/
│   ├── logs/
│   │   ├── daeseon-ai/               # hub's own logs
│   │   ├── shadow-ai/                # human companions for satellite logs
│   │   │   └── 2026-05-31-leitner-srs-for-drills.human.mdx
│   │   └── ddalkkak/
│   ├── posts/{en,ko}/
│   │   ├── project-log-system-v1.mdx     # the live retrospective
│   │   └── install-claude-code-project-log.mdx
│   └── projects/{en,ko}/
├── scripts/
│   ├── propagate-hook.sh             # sync hook → satellites
│   └── sync-skip-markers.sh          # reconcile skip markers
└── install/                          # public install kit
    ├── setup.sh
    ├── hooks/stop-check.sh
    ├── settings.json
    └── claude-md-snippet.md
```

## 10. Sample artifacts

### Tier-1 decision entry

```mdx
---
title: "Default LLM for analysis pipeline — Gemini over Claude"
date: "2026-05-27"
project: "shadow-ai"
kind: "decision"
tier: "1"
status: "accepted"
reversibility: "two-way"
visibility: "public"
language: "en"
summary: "Switched analysis-pipeline default from Claude to Gemini 2.5 Flash after Anthropic credit hit zero. AiAnalysisClient interface keeps Claude as fallback. ~$200/month cost saved; one abstraction layer added; quality validated at +4 days."
tags: ["llm", "vendor-choice", "cost", "architecture"]
---

## Context & constraints
Anthropic credit zeroed mid-session. ~3 weeks of dogfooding ahead. Personal budget ~$0 ops cost target. Solo dev — no team review.

## Goals (ranked)
1. Pipeline uninterrupted
2. Minimize ongoing cost
3. Preserve structured-output (직독직해) quality
4. (side benefit) Cleaner architecture

## Options considered

### A. Top up Anthropic + continue with Claude
- Cost: ~$200/month ongoing
- Reversibility: two-way
- Risk: personal budget pressure compounds → panic-switch later
- Evidence: known cost, known quality

### B. Switch to Gemini 2.5 Flash default, Claude as fallback (chosen)
- Cost: 3 days integration, one abstraction layer
- Reversibility: two-way (`@ConditionalOnProperty` flip)
- Risk: structured-output quality unknown
- Evidence: latency benchmark Gemini 8-15s vs Claude 41s (favorable); quality unverified at decision time

### C. Switch to Groq + Llama
- Cost: 3 days
- Reversibility: two-way
- Risk: benchmark showed worse structured-output quality (76s + lower fidelity)
- Evidence: adverse benchmark

### D. Defer (1 week pause)
- Cost: pipeline halt, lost dogfood time
- Risk: momentum loss, may not recover

## Trade-off accepted
- 3 days migration time for ~$200/month savings + cleaner abstraction
- Quality risk (ship + measure mitigation)
- Multi-vendor fallback complexity even when only one provider needed

## Pre-mortem (6 months out)
1. Gemini quality consistently worse → revert to Claude. Cheap rollback because interface stayed.
2. Gemini quota silently changes (this actually happened — 250 RPD → 20 RPD docs change). Fallback in place handles it.
3. Both providers raise pricing simultaneously → evaluate local model (Qwen2.5-VL).

## Decision criteria to flip
- 직독직해 quality metric > 20% degradation on 50-sample human-rated test → revert
- Anthropic offers personal free tier → reconsider Claude default
- Local model hits quality bar with $0 marginal cost → migrate further

## Success measure
- Pipeline uptime ≥ 99% over 30 days
- 직독직해 quality on 50-sample test stays within 10% of Claude baseline
- $0/month LLM cost for 60 days

## Reversal plan
1. Set `analysis.provider=anthropic` env var
2. Backend restart
3. End — no code change required

## Discussion artifacts
- None at decision time (solo)
- Adjacent benchmark: `content/logs/shadow-ai/2026-05-27-vision-dispatcher-bench.mdx`

## Status
Accepted 2026-05-27. Validated 2026-05-28 (Gemini's 직독직해 quality acceptable after `thinkingBudget: 0` tuning).

## Commit
`<hash>` — Introduce AiAnalysisClient interface; default to Gemini.
```

### Learning-gap entry

```mdx
---
title: "Dense embeddings vs sparse retrieval — when each one"
date: "2026-06-15"
project: "general"
kind: "learning-gap"
visibility: "public"
related_wiki: ["embeddings", "rag", "sparse-retrieval"]
language: "en"
summary: "I was treating dense embedding as strictly newer/better than BM25. It's not — they solve different problems and the standard answer is hybrid."
---

## What I (initially) didn't understand
Why a system would use BM25 instead of dense embedding when embedding seemed more "modern."

## Where the gap came from
Prior assumption that dense embedding subsumed sparse retrieval. Carried this from skimming RAG tutorials that always start with embedding, and missed the part where production systems use both.

## What clicked
1. Dense embedding measures *semantic similarity* — good for "find me passages about X concept."
2. Sparse retrieval (BM25) measures *exact term match* — good for "find me passages containing the literal phrase X."
3. Production RAG pipelines almost always hybrid: sparse retrieval narrows candidate set; dense rerank.

## Still confused
- How to set hybrid weighting (alpha) for a new domain — heuristic vs measured?
- When is domain-specific embedding fine-tuning worth the cost?

## Related wiki
[[embeddings]] and [[rag]] entries both need updating to reflect this — currently they undersell sparse retrieval.
```

## 11. The honest betting

What I'm assuming that could be wrong:

1. **The `.human.mdx` annotation habit will form.** Audit data shows I haven't reliably done this yet. The whole AI/human dual-author surface depends on someone actually filling the human column. If I don't, "REVIEW NEEDED" placeholders accumulate forever and become noise. Mitigation: weekly Sunday-morning annotation ritual on the calendar. Failure mode: ritual slips, system degrades.
2. **Tier 1 decisions don't burn me out.** 20-30 min per T1 entry × 3-5/month = 1.5-2.5 hr/month. Manageable in theory; *in practice* the slot-filling can feel like homework. Mitigation: tiers exist precisely so T1 is rare. If I find myself filing T1 entries weekly, the trigger threshold is too aggressive.
3. **Cross-repo pull doesn't break under network or rate-limit failure.** GitHub Contents API has rate limits. With ISR 30s cache, a busy day shouldn't hit them — but if it does, satellite logs vanish from the hub until refresh. Mitigation: cached read fallback on 429.
4. **The `learning-gap` kind doesn't become a vehicle for performative humility.** "Look how much I'm learning!" is a real failure mode. Honest entry: "I was wrong about X." Performative entry: "I learned today that X is interesting!" Discipline must come from the author.

What I'm betting on that could be right or wrong:

- That recruiters reading my portfolio will weigh *judgment trail* over *projects shipped*. Empirically untested. Anti-evidence: most recruiters skim, never click through.
- That AI delegation will accelerate enough that the "judgment moat" becomes the only meaningful differentiator in 12 months. Reasonable bet but not certain.

## 12. Roadmap

### v1 (48-hour target — full scope, no cuts)

1. Phase A1: positive-trigger hook in hub repo ✅ (shipped commit `a9c4911`)
2. Phase A2: hook propagated to 4 satellite repos
3. Phase A3: skip-marker sync script run across satellites
4. Phase B1: 5 architecture-overview entries (workflow fan-out, one per project)
5. Phase B2: 6 audit-flagged missing entries backfilled (`9d1972a`, `3c8c80f`, `d10738d`+`59e2483`, jarvis-pc `2ffc163`+`33fd37e`+`a54b121`, shadow-ai `bc0d3c7`)
6. Phase C1: status header on `/projects/<slug>` — full counts including decision/discussion/learning-gap aggregation across satellites
7. Phase C2: activity heatmap (calendar grid colored by entry kind)
8. Kinds: `decision`, `discussion`, `learning-gap` added to `lib/log-kinds.ts` — frontmatter types + rendering + sample entries (one of each)
9. Tier-detection logic in the Stop hook (LOC + keyword → tier suggestion in the block message)
10. `/method` page — methodology surface, linked from About + header nav
11. Live build retrospective post `/posts/project-log-system-v1` finalized and published
12. Bilingual (en + ko) for v1 content (posts, method page, sample mdx)
13. `kind: discussion` writer — admin UI form OR CC slash command (pick one and ship)

### v2 (next sprint and beyond)

- Chat-capture browser/desktop helper (claude.ai conversation auto-export → log entry)
- Decision graph visualization (DAG with `[[]]` backlinks)
- Global hook pattern (`~/.claude/global-hooks/`) for multi-machine workflow
- Audit auto-runner (quarterly, AI-generated audit report)
- Monthly architecture-snapshot ritual cadence
- Status badges embeddable in external surfaces (LinkedIn, GitHub READMEs)

## 13. Open questions for external review

For a reviewer evaluating this spec, the most useful pushback would be on:

1. **Is the kind taxonomy too rich?** 10 kinds may be more than a solo author can keep distinct in practice. Counter-argument: each kind has a clear trigger — `decision` only when options were weighed; `learning-gap` only when re-ask happened. But if reviewer sees overlap I missed, that's valuable.
2. **Does the positive-trigger override mechanism create author resentment?** The system overriding the author's `[no-log]` could feel paternalistic. Counter: the override mechanism (`<!-- override-trigger: ... -->`) preserves agency. But if a reviewer sees this as friction-creating, the threshold may need to be looser.
3. **Is the Tier-1 template lifted directly from established frameworks the right move, or should I customize?** I deliberately stayed close to Klein/Bezos/Nygard rather than invent new slots. Reviewer's call: is fidelity to established frameworks a strength (interpretable to others) or a limitation (doesn't reflect AI-pair-programming specifics)?
4. **Is `kind: learning-gap` a real differentiator or self-indulgent?** Recording what you didn't know could either be the system's most distinctive feature or a vehicle for performative humility. Sample an entry and judge.
5. **Is 48 hours for MV v1 realistic?** I estimated 12-16 hours of focused work above. Past project shipping cadence: I've under-estimated similar work by 30-50%. If reviewer thinks 72 hours is the realistic floor, that's worth knowing.

## 14. Citations and influences

- Michael Nygard, *Documenting Architecture Decisions*, 2011 — ADR pattern
- Jeff Bezos, 1997 shareholder letter — two-way / one-way door framing
- Gary Klein, "Performing a Project Premortem," *Harvard Business Review*, 2007
- Atlassian — DACI decision-roles framework
- Andy Grove, *High Output Management*, 1983 — structured information capture as management leverage
- Cal Newport, *Deep Work* — distraction-resistant journaling as professional development
- Salvatore Sanfilippo (antirez) — devlog tradition for high-signal individual engineering writing
- Drew DeVault — project-status post cadence
- Obsidian / Logseq — linked atomic notes with backlinks (`[[]]` syntax adapted)

## Revision log

- **2026-05-31, Revision A** — `kind: decision` and `kind: discussion` added as first-class log kinds (previously decisions were buried inside `tech-retro` entries).
- **2026-05-31, Revision B** — CLAUDE.md and install snippet enforced "presenting options to the human" rule. When Claude Code surfaces options, must include per-option: Why exists / Trade-off / Reversibility / Evidence / Missing info. Single recommendations must include Alternatives + Trade-off + Flip-criteria.
- **2026-05-31, Revision C** — Decision tier system added (T1/T2/T3) with framework citations. `kind: learning-gap` introduced for explicit knowledge-gap capture. Tier-1 template reduced from 11 slots to 8 after critique (dropped DACI-lite Stakeholders and Second-order effects as redundant for solo work).
- **2026-05-31, Revision D — this rewrite** — Document restructured for external review. Korean-mixed prose tightened. Framework citations made explicit. "Honest betting" and "Open questions" sections added so reviewers can push back on the right things. (Earlier draft of this revision split scope into Minimum Viable v1 + Real v1; reverted on author push-back — prior delivery history shows estimates run long, so full 13-item v1 in 48h stands.)

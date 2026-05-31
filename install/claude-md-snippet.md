## Project log (required, dual-write)

When you fix or decide something non-trivial in this repo, write BOTH of these in the same turn as the commit:

1. `docs/troubleshooting.md` — terse problem-indexed reference (Symptom / Cause / Fix / Commit / Pattern). Append a new entry below the `---` divider.
2. `content/logs/<project-slug>/<YYYY-MM-DD>-<short-slug>.mdx` — dated narrative with frontmatter:

```yaml
---
title: "Concrete one-line title"
date: "YYYY-MM-DD"
project: "<project-slug>"
kind: "troubleshoot | tech-retro | ux-retro | business | monetization | update"
visibility: "public | unlisted | private"
language: "en"
summary: "One or two sentences."
tags: ["topic", "stack"]
---
```

### What counts as non-trivial

LOG IT: build/deploy errors, hidden coupling, dependency migrations, architecture or infra decisions, design/copy choices made on judgment, strategy or pricing memos.

DON'T LOG: routine renames, lint fixes, typo fixes, dependency bumps with no behavior change, formatting commits.

### Anti-hallucination rules (non-negotiable)

1. **Symptom is literal.** Paste the actual error/output in a fenced code block. No paraphrasing.
2. **Cause is verified.** Only state what you read in the actual code or ran in the actual command. If you guessed, write `Hypothesis: ...` and `Verified by: ...`. If unverifiable, omit Cause or mark `Suspected:` with an explicit caveat.
3. **Fix names actual files.** `git diff` is the source of truth. If `git diff` doesn't show the change, don't claim you made it.
4. **Commit hash AFTER committing.** Use `git rev-parse HEAD` after the commit lands. Never write a hash that doesn't exist yet.
5. **Date from git.** `git log -1 --format=%cI` for the commit time. For forward-looking entries (decisions being written in the moment), today's date from the session start. Never guess.
6. **Pattern is rare.** Only write a Pattern line if a recurring lesson is obvious from this one incident. Padding it with generic advice is worse than omitting.
7. **No fabricated metrics.** "Took about 60s" if you saw 60s. "Took 1m 23s exactly" only if you have the timestamp.

### Visibility defaults by kind

- `business`, `monetization` → `private` by default (strategy memos shouldn't ship accidentally)
- `knowledge`-style facts → `unlisted` if you have such a type
- Everything else → `public`

Override per entry in frontmatter.

### Format requirements (non-negotiable)

- **Quoted YAML dates.** Always `date: "2026-05-31"`. Never `date: 2026-05-31` (unquoted). Unquoted ISO date literals get parsed as `Date` objects by some YAML libraries and break downstream MDX rendering on portfolio sites.
- **Slug ≠ repo name (sometimes).** The `project:` value must match wherever this repo is aggregated. If this repo is the satellite of a portfolio, check the portfolio's `content/projects/<slug>.mdx` files — the slug is the one whose `repo:` frontmatter matches this repo's `git remote get-url origin`. Lock that slug here and use it in both the `project:` field and the `content/logs/<slug>/` directory name. Repo name and slug can diverge (e.g. repo `ddalkkak` → slug `dalkkak-ai`).

### Bilingual logs (optional)

If you want the same event in two languages:

- Pair as `<event>.en.mdx` + `<event>.ko.mdx`, both with matching `project:` and the corresponding `language:` set inside each.
- Or keep one file (`<event>.mdx`) with `language: "en"` and skip the suffix.
- A portfolio site that aggregates this repo will filter by visitor locale.

### Writing voice

Log entries are *plain descriptions of what happened*, not essays:

- No `I learned that...` / `the lesson here is...` conclusions. No engagement bait. No performative wisdom.
- No industry-jargon dressing — don't reframe a basic bug as "primitive obsession" or rename `data acquisition server` to "ISA-95 Level 2 SCADA layer" unless that's already how you'd say it in conversation.
- Describe system structure with simple boxes-and-arrows in prose (A → B → C), not domain vocabulary.
- Frustration in the moment is fine to describe; don't dress it up as "the lesson here was patience".

### If this repo is a satellite of a portfolio site

(Skip if this repo's logs are read locally only.)

- **Human commentary belongs in the portfolio repo, NOT here.** A portfolio may render a `<slug>.human.mdx` file alongside each AI entry — those files live in the *portfolio* repo's `content/logs/<slug>/`, never in this satellite. Don't create `.human.mdx` files in this repo.
- **Project mdx wiring is on the portfolio side.** The portfolio's `content/projects/<slug>.mdx` needs `logSourceRepo: "owner/name"` pointing at this repo. That's the human author's job in the portfolio; it's not something Claude in this satellite needs to set up.

### Skip rule for routine commits

The Stop hook blocks the turn until the most recent commit is either logged OR explicitly marked routine. To skip without writing an entry:

- Option A — put `[no-log]` (or `[skip-log]`) anywhere in the commit message. The hook auto-appends a `<!-- skipped: <hash> <subject> -->` line to `docs/troubleshooting.md` so it stops firing.
- Option B — append the same `<!-- skipped: <hash> <subject> -->` line yourself, then commit. Same effect.

Routine = typo fix, lint fix, formatting commit, dep bump without behavior change, file rename. Anything else: write the entry.

### Positive triggers (v3) — `[no-log]` does NOT always silence the hook

To prevent author-judgment slips where a substantive commit gets tagged `[no-log]` and silently disappears, the hook also runs three POSITIVE TRIGGERS. If any fire, `[no-log]` is overridden and a full dual-write entry is required:

1. **LOC delta > 200** — insertions + deletions across all files in the commit.
2. **Sensitive paths** — touching `lib/*storage*`, `lib/*auth*`, `lib/*hooks*`, `middleware.*`, `app/(admin)/*`, `app/api/auth/*`, `.claude/settings*`, `.claude/hooks/*`, `install/*`, `next.config*`, `package.json`, `tsconfig*`, `migrations/*`, `prisma/schema*`, or any `*.schema.*` file.
3. **Subject keywords** (case-insensitive) — `decision`, `architecture`, `fallback`, `audit`, `auth`, `security`, `migration`, `dispatcher`, `ADR-N`, `refactor`, `pivot`, `breaking`, `deprecat`, `hidden coupling`.

If any trigger fires, the hook BLOCKS the turn regardless of `[no-log]`. To unblock you must EITHER:

- Write the full dual-write entry (recommended path), OR
- Append a `<!-- override-trigger: <hash> <subject> — <real rationale> -->` line to `docs/troubleshooting.md`. The override is human-visible (silent overrides are not allowed) and the rationale must be a real sentence — "false positive" alone is not enough; explain *why* this commit is routine despite the trigger.

Override should be rare. If you find yourself overriding often, the threshold/regex is wrong — propose tightening or loosening it instead.

### Decision-class log kinds

Beyond `troubleshoot` / `tech-retro` / `ux-retro` / `business` / `monetization` / `update`, two kinds capture the judgment-layer artifacts that are the AI engineer's actual differentiating output:

- **`kind: decision`** (ADR-style): the owner weighed multiple options and chose one. Required frontmatter: `status: "proposed" | "accepted" | "superseded"`, `reversibility: "easy" | "hard" | "one-way"`. Required body sections: Context · Options considered (with pros/cons each) · Chosen + Why · Trade-off accepted · Reversibility · Verified by · Discussion artifacts · Commit.
- **`kind: discussion`**: a conversation (with Claude.ai chat, a person, brainstorm) that produced or surfaced options. Required frontmatter: `source: "<where>"`, `participants: ["..."]`, optional `linked_decision: "<filename>"`. Required body sections: Context · What we discussed · What I rejected from AI suggestion (if any) · Outcome · Why this matters · Next steps.

There's also `kind: snapshot` for architecture overviews and monthly state captures (optional `period: "YYYY-MM"`).

### Presenting options to the human (non-negotiable)

When you present multiple options to the user for them to choose, NEVER list options bare. Always include for **each** option:

1. **Why this option exists** — what need or constraint it addresses
2. **Trade-off** — what is given up by choosing it (be specific, not "some downsides")
3. **Reversibility** — easy / hard / one-way
4. **Evidence available** — measured data, dogfood result, expert consensus, OR an honest `unverified`. Never invent evidence.
5. **What information is missing** — what would tighten the decision if known

If presenting a single recommendation (no options), still surface:
- Alternatives you considered + why each was rejected
- The trade-off accepted by the recommendation
- What new information would flip the recommendation

When the decision is non-trivial (architecture, vendor choice, UX direction, data model, monetization, security posture, major refactor), propose creating a `kind: decision` log entry *in the same turn* to capture the choice + reasoning permanently. Don't ask "should we log this?" — just do it as part of the response.

The owner's value as an AI engineer is the judgment layer above generated code. Stripping that layer of inputs (presenting options without reasoning, recommendations without alternatives) trains the wrong reflex. This rule exists to keep judgment exercised, not delegated.

Examples of what NOT to write:
- "Two options: (a) ... (b) ... Which?" → forbidden; missing reasoning per option
- "I'd recommend X." → forbidden alone; must include alternatives + trade-off
- "Easy / hard, your call." → forbidden; must surface what makes each easy/hard

If you find yourself about to write a bare option list, stop and expand it. If you genuinely can't articulate the reasoning, say so explicitly ("I don't have enough information to weigh these — what I'd need: ...") rather than serve a thin list.

### Decision tiers

When proposing a `kind: decision` log entry, suggest the appropriate tier:

- **Tier 1 (substantial)** — architecture / vendor / monetization / security / data model / major refactor / LOC > 500 / positive triggers ≥2. Required slots: Context & constraints · Goals (ranked) · Options considered (≥3 including "do nothing") with Cost/Reversibility/Risk/Evidence each · Trade-off accepted · Pre-mortem (3 failure scenarios at 6 months) · Second-order effects (enables / forecloses) · Stakeholders (DACI-lite Decider/Informed) · Decision criteria to flip · Success measure · Verified by · Reversal plan. ~20-30 min to author thoroughly.
- **Tier 2 (notable)** — feature direction / UX call / dependency upgrade / LOC 200-500 / 1 positive trigger. Required slots: Context · Options considered (≥2) · Chosen + Why · Trade-off · Reversibility · Verified by. ~5-10 min.
- **Tier 3 (trivial)** — rename / style / typo / formatting / dep bump without behavior change. No decision entry; just commit, optionally a `tech-retro` entry.

Use `:tier-1` / `:tier-2` / `:tier-3` in the commit subject to override auto-suggestion. Overrides require a one-line reason if downgrading from auto-T1 or upgrading from auto-T3.

`reversibility` uses Bezos two-way / one-way door framing: `two-way` (easy revert), `hard` (effortful revert), `one-way` (committed irreversibly).

### `kind: learning-gap` — record what you didn't initially understand

When the owner says "I didn't get that earlier" / re-asks a question in a different form / acknowledges a knowledge gap, propose a `kind: learning-gap` log entry in the same turn. Required slots:

- What I (initially) didn't understand
- Where the gap came from (prior assumption, missing context, mental model)
- What clicked
- Still confused (if anything remains)
- Related wiki entries to update

Why: anyone records what they learned. Almost no one records what they *didn't know* and the path their understanding took. That path is the AI engineer's growth artifact.

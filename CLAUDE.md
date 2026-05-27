# CLAUDE.md

Personal site for Daeseon Yoo — AI engineer in Toronto. Public blog + private admin dashboard.

## Project Goal

A personal site that the owner actually uses. Public blog as primary surface. Admin section visible only to the owner — for drafts, post analytics, distribution checklist, automation status.

Long-term: integrate the owner's cross-posting automation tool (planned, separate project) into the admin panel.

## Tech Stack

- Next.js 15+ (App Router)
- TypeScript
- MDX for blog posts (in `content/posts/{en,ko}/*.mdx`)
- Tailwind CSS
- NextAuth (GitHub OAuth) — or simple env-based password — for admin protection
- Hosted on Vercel (free tier)
- Domain: daeseon.ai

## Internationalization (i18n)

Bilingual blog. English is default/primary, Korean is secondary.

**Routing:**
- English (default): `daeseon.ai/posts/[slug]`
- Korean: `daeseon.ai/ko/posts/[slug]`

**Content directory:**
```
/content/posts
  /en/*.mdx    # English posts
  /ko/*.mdx    # Korean posts
```

**Per-post frontmatter:**
- `language: en` or `language: ko` — required
- `translationKey: <shared-id>` — optional, for cross-linking translations when both exist

**Behavior:**
- Each post is written in ONE language. No automatic translation.
- Owner chooses language per post (some posts English only, some Korean only).
- If `translationKey` matches across two posts, show "한국어 버전 →" / "English version →" link automatically.
- Header has a language toggle (EN ↔ KO).
- SEO: emit `hreflang` tags. Sitemap and RSS feed per language.
- The 4-tone writing convention applies in either language. Korean has its own marketing-guru buzzwords (혁신, 패러다임, 시너지) — same forbidden list applies. Korean wisdom-guru tone (자기계발서 style) is also forbidden.

## Folder Structure

```
/app
  /(public)              # Public blog routes
    /page.tsx            # Home (English post list, default)
    /posts/[slug]/       # Individual English post
    /ko/                 # Korean section
      /page.tsx          # Korean home
      /posts/[slug]/     # Individual Korean post
    /about/page.tsx
    /now/page.tsx        # "What I'm working on now" — optional
  /(admin)               # Auth-gated admin routes
    /admin/page.tsx      # Admin home (stats overview)
    /admin/drafts/       # Draft management (both languages)
    /admin/analytics/    # Post performance (per language)
    /admin/distribution/ # Per-post distribution checklist
  /api
    /auth/               # NextAuth endpoints
/content
  /posts
    /en/*.mdx            # English posts
    /ko/*.mdx            # Korean posts
/lib                     # Utility functions (incl. i18n helpers)
/components              # Reusable components (incl. LanguageToggle)
```

## Dev Commands

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint check
- `npm run typecheck` — TypeScript check

## Writing Conventions (Most Important — Apply to All Draft Suggestions)

The blog has a specific tone. ALL post drafts, copy, and content suggestions must follow these.

**Tone: 담담한 (calm, plain, matter-of-fact). Anti-LinkedIn-guru.**

Forbidden in any post or copy:
- "I learned that..." / "교훈은..." conclusions
- Emojis (max 1, carefully chosen — default zero)
- "What do you think?" / engagement-bait questions at the end
- "humbled / excited / thrilled / grateful / mind-blowing / game changer / revolutionary"
- "future of X / next big thing / disruptive"
- Performative wisdom or revelation framing

Required in every post:
- Concrete numbers, tool names, or specific facts
- A stated limitation or what didn't work
- Specific verbs, not vague abstractions

## Post Formats

The blog has two primary post formats. Choose based on post type.

### Format A: Multi-Register (for concept learning posts)

Default format for concepts, terms, patterns (e.g., embeddings, attention, RAG, MoE, tool calling, design patterns). One concept, written in multiple tones.

**Required four sections (in this order):**

**1. Raw tone (날것)** — "Me understanding it for real"
- Specific: tool names, exact behavior, numbers
- State what didn't work or what was confusing
- "I initially misunderstood this" is OK
- Precise analogies only
- No conclusion / "lessons learned" wrap-up
- Usually the longest section
- Zoom level: technical detail (what it does, how it works)

**2. Marketing tone (마케팅)** — "As a LinkedIn AI guru would write it"
- Buzzwords on purpose: "revolutionize", "10x", "unlock", "future of", "game-changing"
- Emotional inflation: "mind-blowing", "humbled", "thrilled"
- Vague metrics ("dramatically improved")
- Engagement bait at end ("What do you think?")
- 1–2 emojis
- Important: simulate sincerely, do NOT exaggerate into parody. The contrast does the work.

**3. Professional / interview tone (전문가)** — "Explaining to a senior peer or interviewer"
- Precise jargon used correctly (idempotent, race condition, etc.)
- Explicit trade-offs
- "Why this matters" included
- Zero emotional words
- Compressed into 3–5 sentences

**4. Big-picture tone (큰그림)** — "Why this pattern shows up elsewhere"
- Zoom level: structural principle (zoomed out from technical detail)
- Different camera distance from Raw, not the same content

Strict rules for big-picture (this is the most dangerous tone — closest to wisdom-guru territory):

OK:
- Structural isomorphism (same mathematical / system form)
- Cross-domain comparisons that are concrete and verifiable
- Explicit pattern names ("weighted aggregation", "indexing in high-dim space")

NOT OK:
- Life analogies ("this is like how in life...")
- Leadership / growth framings ("learning to focus on what matters")
- Emotional generalizations ("perhaps everything is...")
- Non-structural vibes-based comparisons

Test: would another engineer or scientist agree the analogy is structurally precise? If not, cut it — and if the section can't be written, the post is NOT a Format A post.

**Critical filter — use this to decide format:** before writing, ask "does this concept have a real structural big-picture?" If yes, Format A. If no, use Format B (project) or a single-tone short note. Do NOT force a big-picture section just to fit Format A — that produces the exact wisdom-guru content this blog rejects. The 4-section requirement narrows Format A to concepts with genuine cross-domain structure (e.g., attention, embeddings, RAG, agent loops). Concepts without that structure (specific library APIs, syntax features, narrow how-tos) belong in other formats.

Order rationale: raw establishes truth, marketing shows how it gets distorted, professional shows how to communicate it well, big-picture lifts to structural principle.

### Format B: Before / Change / Result / Limit (for project / work posts)

For project recaps, work-in-progress notes, technical debugging stories.

1. What I did (one line)
2. What it looked like before (specific context, numbers if available)
3. What I changed
4. What happened (specific result)
5. What it doesn't do / what's next

5–10 sentences. Short wins.

### When neither format fits

Tool comparisons → comparison table. Short notes → single-tone short post. Don't force the format.

## Design Conventions (Lock These Down)

- Use the chosen template's default design for the first month
- Do not change colors, fonts, or layout in v1
- Reach 5+ published posts before touching design
- If tempted to redesign: write a post instead

## Admin Section (Private, Auth-Gated)

Only the owner can access `/admin/*`. Features for v1:
- Draft list (in-progress posts)
- Simple analytics (views per post, referral source)
- Distribution checklist per post (LinkedIn / X / Dev.to / etc. — checkbox state)

Auth approach for v1: Route middleware checks session. GitHub OAuth via NextAuth preferred. If too heavy for v1: env-based password (`ADMIN_PASSWORD` in `.env.local`).

## Do Not

- Do not change blog design without explicit approval
- Do not add wisdom-tone copy anywhere ("Discover the future of...", etc.)
- Do not add tracking scripts beyond basic analytics
- Do not commit secrets — all keys/passwords in `.env.local`
- Do not add features just because they're trendy
- Do not suggest design changes in v1 — suggest writing a post instead

## Current Status

- [ ] Project initialized
- [ ] Template chosen and cloned
- [ ] Domain connected to Vercel
- [ ] About page written
- [ ] First post published
- [ ] Admin section auth set up
- [ ] Admin distribution checklist UI
- [ ] LinkedIn / X integration (later, separate tool)

## Notes for Claude Code

- Solo project. Owner is the only user/admin.
- When proposing changes, prefer fewer features and more stability.
- When writing blog content suggestions, follow Writing Conventions strictly.
- When suggesting design changes in v1: refuse and suggest writing a post instead.
- Owner's broader brand: AI engineer who learns in public, calm tone, no guru posturing.

## Project log (required, dual-write)

When you fix or decide something non-trivial in this repo, write **both** of these in the same turn as the commit:

1. `docs/troubleshooting.md` — terse Claude-facing reference (Symptom / Cause / Fix / Commit / Pattern). Indexed by problem, not by date.
2. `content/logs/<project-slug>/<YYYY-MM-DD>-<short-slug>.mdx` — user-facing log entry surfaced on `/projects/<slug>`. Indexed by date, grouped by kind.

These serve different audiences. Don't skip one. The Stop hook in `.claude/settings.json` reminds after any recent commit.

**What counts as non-trivial** (log both): build/deploy errors, hidden coupling found, dependency-version migrations, architecture decisions, infra choices, design/copy decisions made on judgment, strategy or pricing memos.

**What doesn't** (skip both): routine renames, lint fixes, typo fixes, dependency bumps without behavior change, formatting commits.

### Anti-hallucination rules

When writing log entries, never fabricate. Concrete rules:

- **Symptom**: paste literal error messages, stack traces, or describe observable behavior in present tense. Do not paraphrase, do not summarize. If pasting a long stack, paste the first 5 lines plus the "Import trace" or final line.
- **Cause**: only state what you verified by reading the actual code, running the actual command, or checking git history. If you guessed, write `Hypothesis:` and add `Verified by:` with the evidence. If you can't verify, omit Cause and write `Suspected:` with an explicit caveat.
- **Fix**: name the actual files/functions changed. Reference the commit hash from `git rev-parse HEAD` after committing, never before. Don't claim "I fixed X" if `git diff` doesn't show X changed.
- **Date**: use `git log -1 --format=%cI` for the commit time, or the user's stated today's date for forward-looking entries. Don't guess.
- **Pattern**: only if a recurring lesson is obvious from this one incident. Otherwise omit. Don't pad.

### Categories (kind)

`troubleshoot` · `tech-retro` · `ux-retro` · `business` · `monetization` · `update`. Definitions in `docs/project-log-spec.md` if a friend wants the system for their own repo.

## Architecture reference

`docs/architecture.md` explains build vs runtime, fs vs `fetch`, ISR caching, and why publish-to-live is ~3-5s even though a Vercel rebuild also runs. Read it before changing anything in `lib/source.ts`, `lib/storage.ts`, or the content read path. Hard constraint: **never `fs.writeFile` in code that runs in production** — see the EROFS entry in `troubleshooting.md`. Second hard constraint: **`lib/source.ts` and `lib/storage.ts` must NEVER appear in the import graph of a `"use client"` component** — see the node-URI entry in `troubleshooting.md`.

## Project entries (required fields)

Every file in `/content/projects/{en,ko}/*.mdx` MUST set `url` (live service link) in frontmatter — not just `repo`. Projects without a live URL won't render (the loader filters them out). If a project isn't shipped yet, point `url` at a coming-soon page, a Loom demo, or the project's README on GitHub. A repo link alone is not enough for visitors evaluating the work.
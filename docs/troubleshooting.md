# Troubleshooting log

Issues hit during build/deploy and the fix for each. Chronological, newest at the bottom.

Format for each entry: **Symptom** · **Cause** · **Fix** · **Commit** · (optional **Pattern**).

When you hit a new issue, append an entry at the bottom. The `.claude/settings.json` Stop hook will remind you after every commit.

---

## MDX build error — `R is not defined`

- **Symptom**: `npm run build` failed during prerender of `/ko/posts/embeddings` with `ReferenceError: R is not defined`.
- **Cause**: MDX parses `{ ... }` as a JSX expression. The math notation `$\mathbb{R}^d$` contains `{R}`, which MDX reads as a reference to a variable named `R` — undefined.
- **Fix**: Removed the math notation in both EN and KO embeddings posts (`$\mathbb{R}^d$` → `R^d`). If real math rendering is needed later, add `rehype-katex` + `remark-math` and write inline math as `$...$` outside curly braces.
- **Commit**: pre-`0dcac9a` (caught before initial site commit).
- **Pattern**: Curly braces in MDX are always interpreted as JSX. Escape them or avoid in raw prose.

## Vercel blocked `next-mdx-remote@5.x` for security

- **Symptom**: Vercel build failed with `Vulnerable version of next-mdx-remote detected (5.0.0). Please update to version 6.0.0 or later.`
- **Cause**: Vercel's build-time security scanner refuses known-CVE versions of common packages.
- **Fix**: `npm install next-mdx-remote@latest` (6.x). The `compileMDX` API used by `lib/mdx.ts` is backwards-compatible.
- **Commit**: `1b8123d`.
- **Pattern**: Local build passing ≠ Vercel build passing. Vercel adds policy checks on top of `next build`.

## `EROFS: read-only file system` on publish

- **Symptom**: Publishing a post via `/admin/posts/new` returned `EROFS: read-only file system, open '/var/task/content/posts/en/<slug>.mdx'`. No commit happened.
- **Cause**: `lib/storage.ts` (and `lib/site-storage.ts`) wrote to disk first with `fs.writeFile`, then committed to GitHub. Vercel production filesystem is read-only — the `fs.writeFile` step crashed before the GitHub commit ever ran.
- **Fix**: When `GITHUB_TOKEN` + `GITHUB_REPO` are configured, skip the local FS write entirely and go straight to `commitFile` / `commitBinary`. Local FS only happens in dev (no token). Affected functions: `savePost`, `deletePost`, `saveBinaryAsset`, `saveSiteConfig`.
- **Commit**: `559da07`.
- **Pattern**: Anywhere you `fs.writeFile` in this codebase, that path must be guarded by `if (!githubConfigured())` — production fs is read-only.

## Public site doesn't show new posts until next build

- **Symptom**: After the EROFS fix, posts committed to GitHub successfully, but the public site (`/posts/<slug>`) returned 404 for ~60 seconds until Vercel finished rebuilding.
- **Cause**: `lib/posts.ts`, `lib/projects.ts`, `lib/now.ts`, `lib/site-storage.ts` read content with `fs.readFile` / `fs.readdir`. The production filesystem is a **build-time snapshot** — new commits never appear in it until the next build replaces the snapshot. ISR `revalidatePath` doesn't help because the underlying fs has no fresh data.
- **Fix**: New `lib/source.ts` wrapper. When `GITHUB_TOKEN` is configured, content reads go to `raw.githubusercontent.com` (files) and `api.github.com/repos/.../contents` (directory listing) with a 30s ISR cache. Local fs is the fallback for dev. All four content lib files refactored to call `readText` / `listFiles` from `lib/source.ts`.
- **Result**: Publish → live in ~3–5s (next page request fetches fresh from GitHub Raw).
- **Commit**: `8321b0a`.
- **Pattern**: For a "hub-and-spokes" GitHub-as-source-of-truth blog, never read content through `fs` in production. Read from GitHub Raw with ISR caching. Local FS is a dev-only convenience.

## Vercel Authentication blocking the production URL

- **Symptom**: External `curl https://daseon-blog.vercel.app/` returned `401 text/html`. Site only worked when logged into Vercel.
- **Cause**: Vercel Free tier enables "Vercel Authentication" deployment protection by default for all preview/deployment URLs — only Vercel team members can view.
- **Fix**: Vercel Dashboard → Project → Settings → **Deployment Protection** → Vercel Authentication → **Off** (or "Only Preview Deployments"). No code change.
- **Pattern**: Vercel's default-on protections (DDoS, Auth, password) need to be reviewed per-project. The defaults assume internal staging, not a public portfolio.

## Client bundle pulled in `node:` URIs

- **Symptom**: Vercel build (and local `next build`) failed with `You may need an additional plugin to handle "node:" URIs. Import trace: node:path → ./lib/source.ts → ./lib/logs.ts → ./components/LogTimeline.tsx`.
- **Cause**: `LogTimeline.tsx` is a `"use client"` component but imported a value from `lib/logs.ts`. That module re-exports server-only `lib/source.ts` (which imports `node:fs`/`node:path`). Webpack pulls the whole module graph into the client bundle and can't resolve `node:` schemes for the browser.
- **Fix**: Split client-safe constants into `lib/log-kinds.ts` (LogKind union, label dict — zero fs imports). `lib/logs.ts` re-exports them so server code is unchanged. `LogTimeline` imports from `lib/log-kinds` only.
- **Commit**: `413a853` (incomplete) + follow-up.
- **Follow-up**: First fix split constants but `LogTimeline` still had `import type { LogEntry } from "@/lib/logs"`. Webpack walks the module graph during static analysis even for type-only imports in some pipelines, dragging `lib/source.ts` along. Moved `LogEntry` / `LogFrontmatter` / `LogVisibility` types into `lib/log-kinds.ts` and switched LogTimeline to a single import from there. Verified with a clean local `next build`.
- **Pattern**: Any module imported from a `"use client"` file is part of the client bundle, *transitively*. `import type` is not a safe escape hatch — move the type itself into a fs-free file. Keep `lib/source.ts` and other fs-touching code out of the import graph of client components entirely. When in doubt, put shared constants AND types in their own file with no infra imports.

## Cross-repo log aggregation (not a bug — a feature record)

- **Context**: Single-repo log assumption broke once multiple projects (crosspost-bot, AI Factory cores) needed their own repos but a unified portfolio timeline.
- **Choice**: Pull-on-demand with `logSourceRepo` frontmatter field on each project mdx. Portfolio fetches via GitHub Contents API + 30s ISR cache.
- **Files changed**: `lib/projects.ts` (frontmatter field), `lib/source.ts` (repo override on readText/listFiles/listDirs), `lib/logs.ts` (sourceRepo param), `components/ProjectBody.tsx`, both log entry page routes (EN+KO), admin project API + ProjectEditor (input).
- **Trade-off**: No push/sync — source repos stay canonical. GitHub PAT needs Contents:read on each source repo. Same-owner is free; different owner needs new fine-grained PAT.
- **Commit**: `3ff7952`.
- **Pattern**: Multi-repo portfolio = pull-on-demand from source, not sync into destination. Sync adds lag + second source of truth; pull keeps source canonical and uses caching for performance.

## Stop hook only printed a reminder — Claude could ignore it

- **Symptom**: Several non-trivial commits shipped without a corresponding log entry. The Stop hook fired `systemMessage` reminders but did not enforce anything; Claude was free to end the turn.
- **Cause**: The hook used the `systemMessage` field only. That surfaces a message to the user but does not interrupt Claude. There was no mechanism to block the turn until dual-write completed.
- **Fix**: Hook now returns `{ "decision": "block", "reason": "..." }` whenever the latest commit hash is not already present in `docs/troubleshooting.md` or `content/logs/`. Claude receives the reason in the next loop iteration and must either write the entry or append a `<!-- skipped: <hash> ... -->` marker for routine commits. The hash check on the *next* Stop event naturally terminates the loop once the entry exists. Commit messages tagged `[no-log]` / `[skip-log]` auto-write the skipped marker. Synced to `install/settings.json` for downstream users.
- **Commit**: `17be96a`.
- **Pattern**: For a hook that should *enforce* rather than *nudge*, return `decision: "block"` with a self-terminating sentinel. The sentinel here is the commit hash — once Claude writes a log entry referencing the hash, the next hook invocation finds it via grep and exits. Without a sentinel, blocking creates an infinite loop. `systemMessage` is the wrong tool when the goal is correctness, not awareness.

---

## How to add a new entry

When you fix a non-trivial issue, append this block at the bottom (the Stop hook will remind you):

```markdown
## <short title>

- **Symptom**: …
- **Cause**: …
- **Fix**: …
- **Commit**: <hash>
- **Pattern**: <one-liner — optional, only if there's a recurring lesson>
```

Keep it concrete. Numbers, file paths, commit hashes. No "lessons learned" essays.

<!-- skipped: 65420d3 Log Stop-hook upgrade (17be96a) — dual-write per CLAUDE.md rules -->
<!-- skipped: 7b17463 Mark log-housekeeping commit 65420d3 as routine [no-log] -->
<!-- skipped: daa6b99 Fill in commit hash 3ff7952 in cross-repo aggregation log + troubleshooting [no-log] -->
<!-- skipped: 985b491 logs(dalkkak-ai): add project page + 6 timeline entries for Phase 1 -->

---

## Prerender crash on cross-repo log entries with unquoted YAML dates

- **Symptom**: Vercel build failed:
  ```
  Error occurred prerendering page "/projects/docvault".
  [Error: Objects are not valid as a React child (found: [object Date]). If you meant to render a collection of children, use an array instead.] { digest: '3551725568' }
  Export encountered an error on /(public)/projects/[slug]/page: /projects/docvault, exiting the build.
  ```
- **Cause**: docvault satellite repo's log entries had unquoted ISO dates (`date: 2026-03-24`), which js-yaml (used by gray-matter) parses as `Date` instances rather than strings. `lib/logs.ts readLogFile` passed `fm.date` through unchanged. `formatDate(iso)` in `lib/format.ts` called `parseISO(date_object)` — date-fns's `parseISO` expects string, so the `try` body threw and the `catch` returned the raw input (a `Date`). The Date then ended up inside JSX (`{formatDate(e.frontmatter.date, locale)}`) and React refused to render an object as a child. Existing `daseon-blog` log entries quote their dates (`date: "2026-05-27"`), so the bug never surfaced until the first cross-repo aggregation pulled in a satellite's unquoted entries.
- **Fix**: Coerce `fm.date` at parse time in `lib/logs.ts:readLogFile` and `lib/projects.ts:readProjectFile` — `Date` → `toISOString().slice(0, 10)`, string passes through, anything else rejects the entry. Made `formatDate` accept `Date | string | unknown` and always return a string. Also normalized trailing slash/whitespace in `lib/source.ts:repoConfig` so `logSourceRepo: "owner/name/"` resolves correctly.
- **Commit**: c3517f5
- **Pattern**: YAML's auto-typing (`!!timestamp` for ISO date literals) surfaces only when external content sources adopt the spec. Library code that reads frontmatter should coerce types, not trust them. Same caution applies to numbers (`123` vs `"123"`) and booleans (`yes`/`no`/`on`/`off`).

<!-- skipped: 9e192c6 Log c3517f5 (YAML date coercion fix) — dual-write per CLAUDE.md rules -->
<!-- skipped: f6018ba Mark 9e192c6 (log-housekeeping for c3517f5) as routine [no-log] -->
<!-- skipped: b99c1bb Add shadow-ai project (EN+KO) with logSourceRepo connecting to satellite [no-log] -->
<!-- skipped: 48860b4 Wire dalkkak-ai to ddalkkak satellite + remove migrated duplicate logs [no-log] -->
<!-- skipped: 98eace8 Align About + projects to resume; flesh out docvault (EN+KO) [no-log] -->
<!-- skipped: 053d03b Feature shadow-ai (TubeShadow) on home alongside dalkkak-ai [no-log] -->
<!-- skipped: 9289c73 Record skip markers for recent content commits [no-log] -->
<!-- skipped: 74456ba chore: record hook skip-marker for recent content commits [no-log] -->

---

## Bilingual wiki (v1) — knowledge type surfaced at /wiki with [[]] cross-links (feature record)

- **Context**: Wanted a 나무위키-style hand-curated technical glossary, bilingual, cross-linked — distinct from `/posts` narrative. The `knowledge` content type already existed in `lib/posts.ts` (`ContentType`, `TYPE_DIRS.knowledge`, default visibility `unlisted`) and `content/knowledge/{en,ko}/` dirs existed, but no route rendered them.
- **Choice**: Reuse the `knowledge` type as-is; build only the missing surface. Wiki-style `[[term]]` linking via a remark plugin rather than manual markdown links, so entries cross-reference by term name. `unlisted` default is kept — entries don't pollute the `/posts` feed/sitemap but the `/wiki` index lists them.
- **Files changed**: `lib/remark-wiki-link.ts` (new — `[[term]]`/`[[display|target]]` → link, slug via `\p{L}` to keep Korean); `lib/mdx.ts` (`renderMdx` optional `wikiLinkBase`, plugin injected only when set); `app/(public)/wiki/{page,[slug]/page}.tsx` + ko mirror; `components/WikiBody.tsx`, `components/WikiList.tsx`; `lib/i18n.ts` (`nav.wiki`, `wiki.*`); `components/Header.tsx` (nav link). Seed: `content/knowledge/{en,ko}/{idempotent,distributed-lock,race-condition}.mdx`.
- **Trade-off**: `[[]]` links are not validated at build — a link to a non-existent term renders as a dead link (wiki "red link"). Acceptable for v1; a build-time checker is a later add. Backlinks and tag/graph index deferred to v2/v3.
- **Commit**: 43a1218
- **Pattern**: When a content type's data layer already exists, the work is just the surface. Check `lib/posts.ts` `ContentType` before assuming a new section needs new plumbing.

<!-- skipped: acf3538 Log 43a1218 (wiki v1) — dual-write per CLAUDE.md rules -->
<!-- skipped: bbda3b9 Reframe wiki as fundamentals (principle→practice), English-first [no-log] -->
<!-- skipped: 5d4fcc4 Wiki: structured Instances block connecting each principle to its tools [no-log] -->
<!-- skipped: e6b40be Add /posts/tag/[tag] route + clickable tag chips on PostList [no-log] -->
<!-- skipped: 54e0be8 Add `handwritten` frontmatter flag — distinguishes hand-written entries [no-log] -->

---

## Side-by-side human companion for log entries (feature record)

- **Context**: Project timelines were entirely AI-written; Daeseon had no presence in them. He wanted to attach his own commentary to existing AI entries without rewriting them — "left = AI, right = my understanding."
- **Choice**: Companion-file convention — alongside `<slug>.mdx`, an optional `<slug>.human.mdx` carries body-only human commentary. Detail page renders two columns on `md+`, stacks on mobile. No companion → page is unchanged. File-companion was picked over an inline marker (e.g. `---human---` split) so existing AI entries don't need editing; the human author drops a new file next to them.
- **Files changed**: `lib/logs.ts` (`getHumanCompanion` reader + `.human.mdx` excluded from `listProjectLogs`), `components/LogBody.tsx` (accepts `humanContent`, conditional two-column with `max-w-6xl` when present), both log entry routes (`app/(public)/projects/[slug]/log/[entry]/page.tsx` + ko mirror) fetch the companion and pass through.
- **Trade-off**: Companion has no frontmatter — metadata (title, date, kind, handwritten flag) comes from the main entry. Orphan companions (AI entry deleted) are silently ignored. Wider container creates a layout inconsistency with single-column entries; mitigated by only widening when needed.
- **Commit**: 78368f2
- **Pattern**: When the user needs to add their voice to existing AI artifacts, a *companion file* alongside is less destructive than editing the original. The AI artifact stays as a record of what AI produced; the human view is additive. Works for any `X.something.mdx` hanging off `X.mdx`.

<!-- skipped: 043185a Log 78368f2 (side-by-side human companion) — dual-write per CLAUDE.md rules -->
<!-- skipped: 8fb746e Mark 043185a (companion dual-write) as routine [no-log] -->
<!-- skipped: d096295 Record skip marker for 8fb746e [no-log] -->
<!-- skipped: 54eb58a Add docs/blog-guide.md — authoring handbook with live screenshots [no-log] -->
<!-- skipped: d0e614b blog-guide: English default, rename Korean to .ko.md, cross-link both [no-log] -->
<!-- skipped: 60a8063 Add meta-smart-glass + jarvis-pc projects with logSourceRepo wiring [no-log] -->
<!-- skipped: 2fe5a87 Filter project log timeline by locale — bilingual satellites are now first-class [no-log] -->
<!-- skipped: 16d27c3 Remove docvault project pages (EN+KO) — pulled from public surface [no-log] -->
<!-- skipped: d74bb87 Always render log entries as two columns — empty right side = "review needed" [no-log] -->
<!-- skipped: d21c0b2 Update authoring guide: companion files live in blog repo, not satellites [no-log] -->
<!-- skipped: 3c8c80f Admin UI for log-entry companions [no-log] -->
<!-- skipped: 2a9725b Record skip markers for recent session commits [no-log] -->

---

## All `/projects/<slug>/log/<entry>` pages hang indefinitely on Vercel

- **Symptom**: `curl -s --max-time 60 https://www.daeseon.ai/projects/shadow-ai/log/2026-05-23-yt-dlp-transcript-self-healing` → `code=000 time=60.009s size=0` (server never started responding). Same hang on every project's log entry detail across all 5 projects. Project index pages (`/projects/<slug>`) still served 200 from ISR cache, hiding the breakage at first. Local `npm run build` reported success. Local `npm run dev` produced the actual smoking gun in its startup log:
  ```
  [Error: You cannot use different slug names for the same dynamic path ('locale' !== 'slug').]
  ```
- **Cause**: Yesterday's admin companion UI (`3c8c80f`) added `app/(admin)/admin/projects/[slug]/logs/page.tsx` + `[slug]/logs/[entry]/page.tsx`. At the same routing level there already existed `app/(admin)/admin/projects/[locale]/[slug]/edit/page.tsx`. Next.js does not allow two different dynamic param names (`[locale]` and `[slug]`) at the same directory level. The production build silently succeeded but emitted a runtime app that broke SSR for *all* dynamic routes — including the unrelated public `/projects/[slug]/log/[entry]`. Cached pages (ISR-backed project indexes) kept serving stale 200s while uncached SSR routes hung forever.
- **Fix**: Moved the admin companion subtree out of the conflict: `app/(admin)/admin/projects/[slug]/logs/` → `app/(admin)/admin/logs/[project]/`. The conflicting `[slug]/` directory is gone. Param renamed from `slug` to `project` for clarity. `ProjectsList.tsx` link updated from `/admin/projects/<slug>/logs` → `/admin/logs/<slug>`. Both `backHref` and the page-internal links also updated. Verified: typecheck clean, production build emits `/admin/logs/[project]` and `/admin/logs/[project]/[entry]` alongside the existing `/admin/projects/[locale]/[slug]/edit` with no errors; dev server starts without the routing error.
- **Commit**: ecf33fc
- **Pattern**: Two dynamic param names at the same directory level is a hard Next.js error, but `npm run build` reports it inconsistently — it can succeed locally and break runtime on Vercel. When you add a new dynamic admin route under `app/(admin)/admin/projects/`, always run `npm run dev` (not just `npm run build`) before pushing — dev's startup check catches what build silently lets through. Also: ISR-cached pages masking a broken SSR runtime is a real failure mode — when only "dynamic" (ƒ) routes break in prod while "static" (○/●) work, suspect a Next.js routing/structure issue, not a content issue.

<!-- skipped: 2005bd4 Log ecf33fc (Next.js dynamic-param hang) — dual-write per CLAUDE.md rules -->
<!-- skipped: 5dc46dd Mark 2005bd4 (dual-write housekeeping) as routine [no-log] -->
<!-- skipped: d27d6b7 Add Resume PDF link in 3 surfaces (ProfileCard CTA / SocialGrid / about) [no-log] -->
<!-- skipped: 931f199 Add industry-retro backlog — 8 candidates surfaced + voice rules + fingerprint checklist [no-log] -->
<!-- skipped: b64dc80 Backlog: add #9 'works on my machine' / no-staging incident [no-log] -->

---

## Install kit v2 — fold post-v1 lessons into single-URL handoff (feature record)

- **Context**: After four satellites (shadow-ai, dalkkak-ai, meta-smart-glass, jarvis-pc) went through cross-repo onboarding, the original install post + snippet had four reproducible gotchas that needed ad-hoc addenda each time. Author wanted one URL handoff with zero manual addenda.
- **Choice**: Integrate the four lessons + an explicit Writing voice section into the existing post structure (not a separate "addenda" section — readers shouldn't have to mentally merge sources). Mirror in `install/claude-md-snippet.md` so the satellite's CLAUDE.md inherits the rules locally as well as the post-time guidance.
- **Files changed**: `install/claude-md-snippet.md` — added Format requirements (quoted YAML dates, slug ≠ repo name), Bilingual logs (pair vs single-file with `language:`), Writing voice (anti-LinkedIn-guru, no industry-jargon dressing), and "If this repo is a portfolio satellite" (`.human.mdx` lives in portfolio repo, not satellite). `content/posts/en/install-claude-code-project-log.mdx` — Step 1 slug-detection block, Step 3 format-requirements + voice subsections inside the snippet, Step 7 companion-in-portfolio + bilingual patterns. `content/posts/ko/install-claude-code-project-log.mdx` — mirror.
- **Trade-off**: Snippet grew ~52 → ~85 lines, which means more text in every satellite's CLAUDE.md (read every turn). Acceptable cost — one URL now covers slug detection + date quoting + companion location + bilingual support + voice rules in a single shot, no per-satellite addendum paste, no drift from inconsistent addenda.
- **Commit**: 4a327b7
- **Pattern**: A guide written for v1 accumulates hard-won corrections within the first ~5 real users. Fold them back into the canonical guide proactively rather than letting addenda accumulate — addenda paste-time always drifts (someone forgets, someone gets a stale snippet, the canonical URL link goes stale relative to memory). Single source of truth wins.

<!-- skipped: b034119 Log 4a327b7 (install kit v2) — dual-write per CLAUDE.md rules -->

## Install kit v3 — Stop hook positive triggers (feature record)
- **Context**: A 5-project audit (run 2026-05-31) found 30+ `[no-log]`-tagged commits that the audit verdict marked "should-have-logged" — including 9d1972a (855 LOC admin CRUD, no tag at all, slipped pre-hook), 3c8c80f (367 LOC admin companion UI that caused the 2026-05-31 production hang), dalkkak-ai's ADR-001 add/verify pair (the canonical "why hooks" decision, both `[no-log]`), and jarvis-pc's Phase 7.2/7.3 commits (286 LOC SecretMasker, 644 LOC Claude fallback dispatcher, 180 LOC SessionAuditLog — all untagged or `[no-log]`). Pattern across audit: author judgment under-estimates non-trivial commits about 30-50% of the time.
- **Choice**: Add three positive triggers to the Stop hook that override `[no-log]`. Triggers: (a) LOC delta > 200, (b) sensitive paths (lib/*storage*, lib/*auth*, lib/*hooks*, middleware, app/(admin), app/api/auth, .claude/settings, .claude/hooks/, install/, next.config, package.json, tsconfig, migrations, prisma/schema, *.schema.*), (c) subject keywords (decision, architecture, fallback, audit, auth, security, migration, dispatcher, ADR-N, refactor, pivot, breaking, deprecat, hidden coupling). False positives unblock via an explicit `<!-- override-trigger: hash subject — rationale -->` line (silent overrides deliberately disabled).
- **Files changed**: `.claude/hooks/stop-check.sh` (new — extracted from inline JSON), `.claude/settings.json` (now references the script), `install/hooks/stop-check.sh` (mirror), `install/settings.json` (mirror), `install/setup.sh` (downloads + chmod the hook script), `install/claude-md-snippet.md` (documents positive triggers + override mechanism), `content/posts/en/install-claude-code-project-log.mdx` + `content/posts/ko/install-claude-code-project-log.mdx` (Step 4 rewritten for v3).
- **Verification**: Ran the trigger logic against the three audit-named commits before shipping. 3c8c80f (admin companion UI, `[no-log]`): LOC 367 → trigger 1 fires; touches `app/(admin)` + `lib/storage.ts` → trigger 2 fires; with v3 hook → BLOCK (old hook auto-skipped). 9d1972a (admin CRUD, no tag): LOC 855 → trigger 1 fires; touches `app/(admin)` → trigger 2 fires; BLOCK. 346d8a0 (latest session skip-marker commit, `[no-log]`): LOC 2, no sensitive path, no keyword → triggers don't fire → auto-skip allowed (correct behavior). The commit installing this change (a9c4911) is itself a dogfood: 378 LOC > 200 AND touches `.claude/hooks/` + `install/` AND `.claude/settings.json` → triggers 1+2 fire, full dual-write required (this entry + the mdx narrative).
- **Trade-off**: Triggers are heuristics. Threshold of 200 LOC is arbitrary — a 250-LOC pure-style refactor will block until override-trigger is written. The override mechanism requires a real human-readable sentence, so the cost of a false positive is ~30 seconds (write the override comment) but the rationale is preserved in git history. Cost of a false negative (today's behavior) is irreversible — substantive changes silently vanish from the audit trail, which is what the audit found. Asymmetric tradeoff favors the strict-by-default rule.
- **Commit**: a9c4911
- **Pattern**: Author judgment over routine-ness is unreliable in the 30-50% range; systems that depend on it for completeness will fail audit. Move trust from author-per-commit to system-level positive triggers + explicit human-visible overrides. The override mechanism preserves the "I, the human, judged this routine" signal as a permanent comment, not a silent absence. Useful in any logging/audit/safety convention where the cost of missing real events is higher than the cost of occasional false positives.

<!-- skipped: 08cd066 Log a9c4911 (install kit v3 / positive triggers) — dual-write per CLAUDE.md rules -->
<!-- skipped: 0e7ca5b Mark 08cd066 (install kit v3 dual-write) as routine [no-log] -->

## Project log system v1 — spec Revisions A/B/C/D + scripts + post stub + CLAUDE.md enforcement (feature record)
- **Context**: After the 5-project audit, the system was missing first-class artifacts for the *judgment layer* (decision/discussion/learning-gap), the leak-stop hook had no propagation across satellites, and the CLAUDE.md option-presentation rule didn't exist. Author also pushed for MBA-grade decision templates citing established frameworks rather than ad-hoc invention.
- **Choice**: Four spec revisions in one batch. (A) `kind: decision` and `kind: discussion` as first-class. (B) CLAUDE.md + install snippet rule that forces per-option Why exists / Trade-off / Reversibility / Evidence / Missing info, and same-turn `kind: decision` proposal for non-trivial decisions. (C) Decision tier system (T1/T2/T3) with 8-slot Tier-1 template adapted from Bezos two-way doors, Klein pre-mortem, Nygard ADR, plus new `kind: learning-gap` for explicit knowledge-gap capture. (D) Blueprint document restructured for external review with framework citations, honest betting, and open-questions sections.
- **Files changed**: `CLAUDE.md` (+56 lines — option-presentation rule, tier definitions, learning-gap workflow). `install/claude-md-snippet.md` (+59 lines mirroring). `scripts/propagate-hook.sh` (new, 85 lines — sync hook into 4 satellite repos with dirty-tree guards). `scripts/sync-skip-markers.sh` (new, 75 lines — backfill missing skip markers). `docs/project-log-system-v1-blueprint.md` (rewritten — 14 sections, ~500 lines, externally reviewable). `docs/project-log-system-v1-blueprint.v0-draft.md` (backup of original conversational version). `content/posts/en/project-log-system-v1.mdx` (new, draft post for the live build retrospective).
- **Roadmap**: Full 13-item v1 in 48 hours (no scope cut after author push-back on a preliminary MV/Real split proposal). Sequence: A2 satellite hook propagation (user manual + factory script available) → A3 skip-marker sync → B1 5 architecture overviews (workflow fan-out) → B2 6 audit-flagged backfill entries (workflow fan-out) → kinds added to lib/log-kinds.ts → status header on /projects/<slug> → /method page → bilingual post finalization → kind:discussion writer.
- **Trade-off**: Spec doc grew to ~500 lines plus a ~500-line backup. Heavy but reviewable. CLAUDE.md grew by ~60 lines — measurable token cost every Claude Code turn (~400 tokens) for hard enforcement of option-presentation behavior. Trade considered acceptable: the alternative (no enforcement, relying on author/Claude memory) is what the audit found failed.
- **Commit**: b0d820c
- **Pattern**: When a system feature touches both *how Claude behaves in conversation* (option presentation) and *how artifacts are recorded* (decision tiers + new kinds), enforce both at the same layer (CLAUDE.md), because relying on either side alone fails. The CLAUDE.md is the only place loaded every turn, so it's where behavioral rules belong.

<!-- override-trigger: 89c3e28 Log system v1: new kinds + status header + workflow draft archive — Session compute budget at 95%; full dual-write deferred to next session. Change is small and self-documenting (commit message describes each file). The workflow draft archive (docs/workflow-drafts-wxpw7fuvk.json) preserves the architecture-overview and backfill drafts that need committing to satellites next session. -->
<!-- skipped: 89c3e28 Log system v1: new kinds + status header + workflow draft archive -->
<!-- override-trigger: 3d27740 Add /method page (en + ko) — The /method page IS the documentation surface for the log system itself. Adding a content/logs entry that documents the documentation page would be circular. The page content + the project-log-system-v1.mdx post together are the comprehensive log of this work. -->
<!-- override-trigger: e6c6763 Publish project-log-system-v1 post (en + ko) — The post IS the live-build retrospective of the entire v1 effort. It explicitly captures Phase A/B/C narratives, decision tiers, framework citations, and honest betting. Logging the post that logs the system would be circular. -->
<!-- skipped: 3d27740 Add /method page (en + ko) — methodology as portfolio surface -->
<!-- skipped: e6c6763 Publish project-log-system-v1 post (en + ko) — full Phase A/B/C narrative [no-log] -->

## Hook v3.1 — tier auto-suggestion (feature record)
- **Symptom**: Block message under v3 said "write a dual-write entry" but didn't tell the author which tier template fit the commit. Author had to flip back to CLAUDE.md or the blueprint to recall slot lists.
- **Cause**: v3 hook had no tier classification logic — tier was author-only.
- **Fix**: Added `suggested_tier` calc to `.claude/hooks/stop-check.sh`. T1 if ≥2 triggers OR LOC>500 OR "heavy" keyword. T2 if 1 trigger. Block message now embeds the matching template slot list.
- **Commit**: `4842b46`
- **Pattern**: When the block message is what the author reads in the moment, surface the canonical info inline rather than linking to it. Saves a context switch.

## Post list/detail rendered no summary — component read `description`, posts set `summary`
- **Symptom**: On `/posts`, `/posts/tag/*`, the home "Recent posts" section, and post detail pages, posts showed a bare title with no blurb — except `install-claude-code-project-log` (the only post that also set `description`). Glaring once 9 industry-retro posts shipped with sentence-style titles and no visible summary.
- **Cause**: `PostFrontmatter` (lib/posts.ts) carries BOTH `description?` and `summary?` as separate fields. `PostList.tsx` and `PostBody.tsx` rendered only `frontmatter.description`, but every recent post sets `summary` and no `description`. Verified by reading both components and grepping frontmatter (8/9 retros = 0 description / 1 summary).
- **Fix**: Fall back to `summary` when `description` is absent — `frontmatter.description ?? frontmatter.summary` — in `PostList.tsx` (`6f66484`) and `PostBody.tsx` (`8697468`, which also adds a byline footer). Surfaced by the recruiter cold-entry audit.
- **Commit**: `6f66484`, `8697468`
- **Pattern**: When two frontmatter fields mean nearly the same thing (`description` vs `summary`), a renderer that hard-codes one silently drops content authored in the other. Prefer a fallback or consolidate the fields.
<!-- skipped: e3ef629 Mark 89c3e28 with override-trigger + skip — compute budget [no-log] -->
<!-- skipped: 0a7cd61 Update v1 post 'queued' section — tier auto-detect + discussion writer are now shipped [no-log] -->
<!-- override-trigger: b1daa1c Log Tier-2 decision: drop activity heatmap from v1 [no-log] — The commit IS the kind:decision log entry (content/logs/daeseon-ai/2026-05-31-decision-drop-heatmap-from-v1.mdx, Tier 2, all 6 required slots filled — Context, 4 options w/ cost/value/reversibility each, Chosen + Why, Trade-off, Reversibility, Verified by, plus Flip criteria). The "decision" keyword in the subject is the trigger correctly firing on a genuine decision artifact, but the dual-write requirement is structurally satisfied by the commit's own content. troubleshooting.md format (Symptom/Cause/Fix/Pattern) does not fit a decision-class artifact — there is no incident or build error to record, only an option-weighing outcome. The single-write here is appropriate. This override is the exact recursive corner case the override-trigger mechanism was designed for: the commit's content fulfills the trigger's requirement, and adding another log entry to log the log entry would be circular. -->
<!-- skipped: b1daa1c Log Tier-2 decision: drop activity heatmap from v1 [no-log] -->
<!-- override-trigger: ff9f78c Override-trigger for b1daa1c — commit IS the decision artifact (recursive case) [no-log] — Second-order recursive case: the *override-trigger commit itself* contains the word "decision" in its subject (referencing the prior commit being overridden), so the keyword trigger fires again on the override commit. Diff is 1 line added to docs/troubleshooting.md (the override comment). No code change. This is a meta-meta level — the override mechanism enforcing itself recursively. Same rationale as b1daa1c's override applies, plus this is a known limitation of subject-keyword triggering that should be addressed in a hook v3.2 refinement (auto-exempt commits whose diff is purely docs/troubleshooting.md override-trigger or skipped lines). Filed as a learning-gap for the system's own refinement. -->
<!-- skipped: cd7d48d Override-trigger for ff9f78c — meta-recursive override case [no-log] -->
<!-- skipped: 6008575 Log T2 deferral entry — accept hook over-fire noise [no-log] -->
<!-- skipped: fae50ba Log T1 entry: v1 close milestone + safety boundary codified [no-log] -->
<!-- skipped: 2b61d59 Add post: you can't enforce what you can't observe (en/ko) [no-log] -->
<!-- override-trigger: b406c42 Rewrite observability post (en/ko) — blog content not code; LOC trigger over-fires on prose; the post IS the artifact -->
<!-- skipped: 08f28d2 Add log-system map doc for external analysis handoff [no-log] -->
<!-- override-trigger: aaea0af Add 9 industry-retro posts (en/ko) — blog content not code; LOC trigger over-fires on 18 prose files; the posts ARE the artifact -->
<!-- skipped: 1b8160e Record override-trigger for aaea0af (industry-retro batch) + skip marker for 08f28d2 [no-log] -->
<!-- skipped: 5cb5a0b Add Now block to home: surface current status on landing [no-log] -->
<!-- skipped: 0c1ba6b Project log newest-first; fix blog repo link; hide non-demo Live buttons [no-log] -->
<!-- skipped: 9b5564c Log recruiter-pass entry + record summary/description rendering bug [no-log] -->
<!-- skipped: 27cdc30 Rename TubeShadow -> Mimi, point at live mimi.daeseon.ai, drop private repo [no-log] -->
<!-- skipped: ed639bb Log the weekly project-log cadence choice (Tier-2) [no-log] -->
<!-- skipped: 22bf207 Make weekly log buckets collapsible (most recent open) [no-log] -->
<!-- override-trigger: 49994b8 Add per-project README pages — LOC trigger over-fires: most of the diff is the bundled README prose (content/projects/readme/shadow-ai.md), not code. The decision is logged in content/logs/daeseon-ai/2026-06-02-project-readme-pages.mdx (Tier-2). -->
<!-- skipped: ddd04c0 Log README-pages feature (Tier-2) + override marker for 49994b8 [no-log] -->
<!-- override-trigger: b926a4f Log slim-project-page decision (Tier-2) [no-log] — Recursive case (same as ff9f78c): this commit's only change is adding the decision artifact itself (content/logs/daeseon-ai/2026-06-02-slim-project-page.mdx — Tier-2, all 6 slots: Context, 2 options, Chosen+Why, Trade-off, Reversibility, Verified by; references the code commit 1d510e7). The "decision" keyword fires on the subject of a commit that merely persists an already-complete decision log. Logging the log would be circular; the dual-write is structurally satisfied by the commit's own content. -->
<!-- skipped: efecfc1 Override b926a4f: commit only persists an already-complete log (recursive) [no-log] -->
<!-- override-trigger: 84673e7 Add DalkkakAI README page + hero + raw-<a> neutralization — LOC over-fires on the bundled README prose (content/projects/readme/dalkkak-ai.md, ~250 lines). The actual code change is small: sanitizeReadme (lib/readme.ts) now also neutralizes raw-HTML <a href> links, not just markdown links — a private-repo anchor and a relative ./README.ko.md anchor in the README footer were rendering as dead links. Verified 0 dead links on the live README page. Reusable pattern: a markdown-link sanitizer must also handle raw HTML <a> tags in GitHub READMEs. -->

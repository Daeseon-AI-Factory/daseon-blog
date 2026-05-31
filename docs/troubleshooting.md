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

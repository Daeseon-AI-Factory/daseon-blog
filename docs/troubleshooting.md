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
- **Commit**: see follow-up commit hash.
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

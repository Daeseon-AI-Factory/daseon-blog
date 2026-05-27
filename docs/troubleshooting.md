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

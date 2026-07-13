# Codex Comprehensive Repository Review

## Review Metadata

- Review date/time: 2026-05-30 23:29 local time (America/Toronto), from `date +%Y-%m-%d-%H%M`.
- Git branch: `main`.
- HEAD commit: `2a9725b96fc6040207ecc56b8e24008cedeb72c8`.
- Working tree status at start: `M docs/troubleshooting.md` was already modified before this review. This review did not edit it.
- Generated output directory: `codex_review/full/2026-05-30-2329/`.
- Review type: full repository verification review requested by the user. Weekly/monthly cadence was not specified, so this was treated as an ad hoc full review.
- Independence: no files under `claude_review/` were read, inspected, summarized, compared, or used.

## Review Scope

Inspected repository structure, project documentation, package/config files, environment example, app routes, API routes, middleware, auth/session code, GitHub-backed storage, MDX/content loaders, admin forms, public UI components, feed/sitemap/robots, install scripts, tests/test configuration presence, and operational scripts.

Not inspected: `.env.local` contents, to avoid exposing local secrets. No files under `claude_review/` were inspected. No previous review output was used as evidence. No production deployment dashboard, Vercel project settings, external GitHub token scopes, or live site behavior were verified. `next build` was not run because it would create/update `.next/`, violating the review-only constraint that only the two report files may be created.

## Executive Summary

The project is a TypeScript/Next.js personal site with public bilingual content, MDX-backed posts/wiki/projects, and a private password-gated admin surface that can write content through GitHub commits. Typecheck and lint passed. Based only on inspected evidence, the project appears partially production-ready: the core app structure is coherent, but production hardening is still needed around admin login abuse protection, companion-file path validation, SVG upload handling, crosspost result correctness, and automated test coverage.

No Critical or High issues were confirmed. The highest-priority confirmed issues are Medium severity.

## Project Overview

The app appears to be a bilingual personal portfolio/blog for Daeseon Yoo. Main stack:

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
- MDX content under `content/` for posts, knowledge/wiki entries, projects, project logs, and now pages.
- Admin pages under `/admin`, protected by middleware and a JWT session cookie.
- GitHub Contents API is used for production authoring when `GITHUB_TOKEN` and `GITHUB_REPO` are configured; local filesystem writes are used for development fallback.
- External integrations include GitHub, optional crosspost webhook, and a token-protected RAG manifest API.

No database, ORM, migration files, payment/billing code, queue, worker, or cron infrastructure was found in the inspected repository evidence.

## Key Findings Summary

| ID | Severity | Category | Title | Confidence |
|---|---|---|---|---|
| CDR-001 | Medium | Security/authentication | Admin password login has no confirmed rate limiting or lockout | High |
| CDR-002 | Medium | Security/data integrity | Log companion API accepts unvalidated path segments | High |
| CDR-003 | Medium | Security/file upload | Public upload path allows unsanitized SVG based on client-provided MIME type | Medium |
| CDR-004 | Medium | Integrations/error handling | Crosspost webhook reports HTTP 4xx/5xx responses as `sent` | High |
| CDR-005 | Medium | Testing | No automated test suite or test runner is configured | High |
| CDR-006 | Low | SEO/product completeness | Sitemap omits wiki index and knowledge-entry pages | High |
| CDR-007 | Low | Deployment/operations | Lint script uses deprecated `next lint` | High |
| CDR-008 | Low | Product completeness | Admin analytics route is present but intentionally not wired | High |
| CDR-009 | Low | Documentation/maintainability | Authoring guide is stale for companion admin support | High |
| CDR-010 | Low | Security/configuration | Session secret length policy is inconsistent between docs and code | High |

## Critical Issues

No Critical issues found from the inspected evidence.

## High-Priority Issues

No High severity issues found from the inspected evidence.

## Medium-Priority Issues

### CDR-001 - Admin password login has no confirmed rate limiting or lockout

- Severity: Medium
- Category: Security/authentication
- Evidence:
  - `middleware.ts:4-18` protects `/admin/:path*` and `/api/admin/:path*` with the admin session cookie.
  - `app/api/auth/login/route.ts:11-16` checks the submitted password and adds only a fixed 400 ms delay on failure.
  - `.env.example:1-5` documents password-based admin access through `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET`.
  - Search command `rg -n "rate|ratelimit|throttle|lockout|attempt|ip|redis|upstash|kv|captcha" app lib middleware.ts package.json -g '!claude_review/**'` found no concrete rate-limit or lockout implementation in the inspected app code.
- What is wrong: the public admin login accepts online password attempts with no repository-level rate limit, lockout, CAPTCHA, IP throttling, or audit trail in the inspected code.
- Why it matters: a guessed or brute-forced admin password gives access to content-writing API routes, upload routes, and GitHub-backed commits.
- Recommended fix: add server-side rate limiting keyed by IP and/or account, exponential backoff or temporary lockout, and login attempt logging. For production, consider OAuth/passkey-based admin auth or a provider-backed protection layer in front of `/admin`.
- Confidence: High.

### CDR-002 - Log companion API accepts unvalidated path segments

- Severity: Medium
- Category: Security/data integrity
- Evidence:
  - `app/api/admin/log-companion/route.ts:23-35` accepts `project`, `slug`, and `body` for save with only truthiness/type checks.
  - `app/api/admin/log-companion/route.ts:40-56` accepts `project` and `slug` for delete with only presence checks.
  - `lib/storage.ts:122` builds `content/logs/${project}/${slug}.human.mdx` directly.
  - `lib/storage.ts:129-131` writes the resulting path locally with `path.join(process.cwd(), rel)`.
  - `lib/storage.ts:144-153` uses the same direct interpolation for deletion.
  - A non-writing verification command showed normalization escapes the intended directory: `node -e "const path=require('node:path'); console.log(path.relative(process.cwd(), path.join(process.cwd(), 'content/logs/../../posts/en/example.human.mdx')));"` returned `posts/en/example.human.mdx`.
- What is wrong: unlike post/project routes that call `isValidSlug`, this API does not reject `..`, path separators, or malformed project/log identifiers before constructing repository paths.
- Why it matters: an authenticated admin request, compromised session, or future caller bug could write/delete `.human.mdx` files outside `content/logs/<project>/`. In GitHub-backed mode, the same unvalidated path string is passed to the commit layer.
- Recommended fix: validate both `project` and `slug` with the same slug policy used elsewhere, reject path separators and dot segments, centralize companion path construction, and assert the normalized path remains under `content/logs/<project>/` before local writes or GitHub commits.
- Confidence: High.

### CDR-003 - Public upload path allows unsanitized SVG based on client-provided MIME type

- Severity: Medium
- Category: Security/file upload
- Evidence:
  - `app/api/admin/upload/route.ts:8-14` includes `"image/svg+xml": "svg"` in the allowed upload types.
  - `app/api/admin/upload/route.ts:41-47` trusts `file.type` to choose the extension.
  - `app/api/admin/upload/route.ts:83-90` stores the uploaded bytes through `saveBinaryAsset`.
  - `lib/storage.ts:92-103` writes uploaded assets under `public...`.
  - `components/admin/PostEditor.tsx:458` allows SVG selection in the admin upload control.
- What is wrong: SVG files are stored under the public origin without repository evidence of sanitization, content sniffing, or response header hardening for active SVG content.
- Why it matters: SVG is an active document format. If unsafe SVG is uploaded and later opened or embedded in an unsafe context, it can create same-origin script/content injection risk. The endpoint is admin-gated, so this is not an unauthenticated upload issue, but the stored public asset is still security-sensitive.
- Recommended fix: either disallow SVG uploads, or sanitize SVG server-side with a maintained sanitizer, verify file signatures/content, and serve SVGs with restrictive headers such as `Content-Security-Policy: script-src 'none'` and `X-Content-Type-Options: nosniff`.
- Confidence: Medium.

### CDR-004 - Crosspost webhook reports HTTP 4xx/5xx responses as `sent`

- Severity: Medium
- Category: Integrations/error handling
- Evidence:
  - `lib/crosspost.ts:50-52` returns `{ status: "sent", httpStatus: res.status }` for every completed `fetch`, without checking `res.ok`.
  - `components/admin/PostEditor.tsx:206-210` displays `crosspost sent (...)` whenever `data.crosspost.status === "sent"`.
- What is wrong: webhook responses such as 400, 401, 429, or 500 are reported to the admin UI as successfully sent.
- Why it matters: publication/distribution automation can silently fail while the admin receives a success message. This is especially risky because crosspost happens at publish time and may not be retried manually.
- Recommended fix: treat non-2xx responses as errors, include status and a small response body snippet in the returned error, and update the UI copy to distinguish delivered vs failed webhook responses.
- Confidence: High.

### CDR-005 - No automated test suite or test runner is configured

- Severity: Medium
- Category: Testing
- Evidence:
  - `package.json:5-10` defines `dev`, `build`, `start`, `lint`, and `typecheck`, but no `test` script.
  - `find` searches for `*test*`, `*spec*`, and common test config files found no app test files or test configuration.
  - `rg -n "describe\\(|it\\(|test\\(|vitest|jest|playwright|cypress|testing-library|@testing" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` found no app test definitions.
- What is wrong: security-sensitive and content-mutating paths are not protected by automated tests in the inspected repository.
- Why it matters: routes such as login, upload, GitHub-backed saves/deletes, RAG manifest authorization, and public/private visibility filters can regress without a failing test signal.
- Recommended fix: add a focused test harness. Start with unit tests for `auth`, `slug`, `source`, `storage` path builders, `crosspost`, and `site-storage` validation; then add route-level tests for admin auth, upload rejection, companion path validation, RAG token handling, and public visibility behavior.
- Confidence: High.

## Low-Priority Issues

### CDR-006 - Sitemap omits wiki index and knowledge-entry pages

- Severity: Low
- Category: SEO/product completeness
- Evidence:
  - Wiki routes exist at `app/(public)/wiki/page.tsx:20-40`, `app/(public)/wiki/[slug]/page.tsx:11-45`, `app/(public)/ko/wiki/page.tsx:20-40`, and `app/(public)/ko/wiki/[slug]/page.tsx:11-45`.
  - `app/sitemap.ts:1-75` imports only `getPublishedPosts` and `getAllProjects`, lists static entries for home/about/projects/posts/now, and returns post/project entries. It does not include `/wiki`, `/ko/wiki`, or `knowledge` entries.
- What is wrong: public wiki surfaces are absent from the sitemap.
- Why it matters: search engines and crawlers get an incomplete map of the public content surface.
- Recommended fix: add `/wiki` and `/ko/wiki` static sitemap entries and include non-draft, non-private `knowledge` entries with correct localized alternates.
- Confidence: High.

### CDR-007 - Lint script uses deprecated `next lint`

- Severity: Low
- Category: Deployment/operations
- Evidence:
  - `package.json:9` defines `"lint": "next lint"`.
  - `npm run lint` passed but printed: "`next lint` is deprecated and will be removed in Next.js 16."
- What is wrong: the lint command depends on a deprecated Next.js CLI subcommand.
- Why it matters: a future Next.js upgrade can break CI/local linting even if source code is unchanged.
- Recommended fix: migrate to the ESLint CLI, for example with the official codemod mentioned by the command output, and update the script to an `eslint` invocation.
- Confidence: High.

### CDR-008 - Admin analytics route is present but intentionally not wired

- Severity: Low
- Category: Product completeness
- Evidence:
  - `components/admin/AdminNav.tsx:13` exposes an `Analytics` admin nav item.
  - `app/(admin)/admin/analytics/page.tsx:7-22` renders "Not wired up yet" and suggestions for future analytics.
  - `CLAUDE.md:7` and `CLAUDE.md:181-186` describe admin analytics/distribution as part of the admin product goal.
- What is wrong: an admin workflow is surfaced in navigation but currently has no working analytics behavior.
- Why it matters: it is a visible incomplete product area for the owner/admin experience.
- Recommended fix: either hide or label the route as planned until implemented, or wire minimal analytics such as Vercel Web Analytics/Plausible and show per-post views/referrers.
- Confidence: High.

### CDR-009 - Authoring guide is stale for companion admin support

- Severity: Low
- Category: Documentation/maintainability
- Evidence:
  - `docs/blog-guide.md:389-392` says log entries and `.human.mdx` companions are direct-MDX only and that Admin does not support companions.
  - `docs/blog-guide.ko.md:392-394` says the same in Korean.
  - Admin support exists in `app/(admin)/admin/projects/[slug]/logs/page.tsx:37-64`, `app/(admin)/admin/projects/[slug]/logs/[entry]/page.tsx:47-54`, and `components/admin/CompanionEditor.tsx:26-39`.
- What is wrong: documentation contradicts implemented admin functionality.
- Why it matters: stale authoring docs can push the owner toward slower direct edits and can mislead future maintainers about supported workflows.
- Recommended fix: update both English and Korean guides to describe the admin companion workflow and clarify which actions still require direct MDX edits.
- Confidence: High.

### CDR-010 - Session secret length policy is inconsistent between docs and code

- Severity: Low
- Category: Security/configuration
- Evidence:
  - `.env.example:4-5` asks for `ADMIN_SESSION_SECRET=replace-with-a-32+character-random-string`.
  - `lib/auth.ts:8-12` throws only when the secret is missing or shorter than 16 characters, while the error message says "32+ char random string."
- What is wrong: the documented minimum and runtime enforcement do not match.
- Why it matters: production can start with a 16-31 character secret even though the configuration guidance says 32+.
- Recommended fix: enforce the documented minimum in code, preferably `raw.length < 32`, and keep the error message and `.env.example` synchronized.
- Confidence: High.

## Product Completeness Review

The public content flows are mostly present: home, posts, tags, projects, project log details, wiki, now, about, RSS, robots, sitemap, and bilingual routes exist. Admin flows exist for posts, projects, site profile, distribution checklist, image upload, and companion editing.

Confirmed gaps:

- CDR-008: analytics is linked in admin navigation but is explicitly not wired.
- CDR-009: authoring documentation is stale for admin companion support.
- CDR-006: wiki content exists as a public surface but is missing from the sitemap.

No concrete issue found from inspected evidence for payment, billing, subscription, credit, database-backed workflows, queues, cron jobs, or worker flows because those systems were not present in the repository.

## Architecture Review

The architecture is simple and understandable: content loaders live in `lib/`, public pages consume typed loaders, admin routes call storage helpers, and GitHub-backed production writes are separated from local dev filesystem writes. The `lib/source.ts` abstraction matches the documented production model in `docs/architecture.md`.

Confirmed architecture/data-boundary issue:

- CDR-002: companion path construction bypasses the validation patterns used by post and project routes.

No concrete issue found from inspected evidence for module boundaries between public pages, admin pages, content loaders, and storage helpers beyond the companion path validation gap.

## Security Review

Confirmed security issues:

- CDR-001: admin password login lacks repository-level rate limiting/lockout.
- CDR-002: companion path segments are not validated before write/delete path construction.
- CDR-003: SVG uploads are accepted and stored publicly without repository evidence of sanitization.
- CDR-010: session secret minimum length enforcement is weaker than the documented 32+ character policy.

Positive evidence:

- Admin pages and `/api/admin/*` are protected by middleware in `middleware.ts:4-18`.
- Admin session cookies are `httpOnly`, `sameSite: "lax"`, path `/`, and `secure` in production in `lib/auth.ts:36-44`.
- RAG manifest authorization uses a bearer token and constant-time-style comparison in `app/api/rag/manifest/route.ts:10-25`.
- `.gitignore:31-40` excludes `.env`, `.env*.local`, TypeScript build info, and `next-env.d.ts`.

Not verified: external deployment protection, WAF/rate limiting, GitHub token scopes, and `.env.local` secret quality.

## Data and API Review

No database schema, ORM, migrations, seed files, or database API were found. Data is content-file based.

Confirmed data/API issues:

- CDR-002 affects write/delete boundaries for companion files.
- CDR-004 affects crosspost API result correctness.

No concrete issue found from inspected evidence in post/project create/update validation for locale and slug: the inspected post/project API routes call `isLocale` and `isValidSlug`.

## Frontend and UX Review

The frontend has public routes for major reader workflows and admin UI for common owner workflows. Loading/error/empty states are present in several places, including post/wiki empty lists, admin feedback messages, upload progress, and distribution local-storage loading.

Confirmed UX/product issues:

- CDR-008: analytics is visible but placeholder-only.
- CDR-009: docs conflict with the current admin companion UI.
- CDR-004: crosspost UI can show success for failed webhook HTTP responses.

Not verified: rendered responsive layout in a browser. No browser/dev-server run was performed because that would require build/dev artifacts outside the review output directory.

## Testing Review

Confirmed issue:

- CDR-005: no automated tests or test runner were found.

Commands run:

- `npm run typecheck -- --incremental false` passed.
- `npm run lint` passed with a deprecation warning for `next lint`.

Recommended test cases:

- Login success/failure, missing env behavior, and rate-limit behavior once added.
- Companion path validation rejects `..`, slashes, encoded separators, and empty identifiers.
- Upload rejects SVG or sanitizes it; upload rejects mismatched MIME/content.
- Crosspost treats non-2xx responses as failure.
- RAG manifest rejects missing/short/wrong bearer tokens and includes expected fields for authorized calls.
- Public routes hide draft/private posts and logs.
- Sitemap includes posts, projects, wiki indexes, and public knowledge entries.

## Performance and Scalability Review

The GitHub content source uses `fetch` with `next: { revalidate: 30 }`, which bounds repeated remote reads in production. For a small personal site this is reasonable.

Potential scaling risk, not filed as a confirmed issue: list pages read directory entries and then read content files with `Promise.all` (`lib/posts.ts:103-108`, `lib/projects.ts:74-79`, `lib/logs.ts:64-85`). This is acceptable at current scale, but could become a GitHub API/raw fetch pressure point if content grows substantially or caches are cold.

No concrete performance blocker found from inspected evidence.

## Deployment and Operations Review

Confirmed operations issues:

- CDR-007: lint command uses deprecated `next lint`.
- `next build` was not run because it would write `.next/`; build status is not verified in this review.

Positive evidence:

- `.env.example` documents the main runtime variables.
- `docs/architecture.md` documents the Vercel/GitHub runtime model.
- `package-lock.json` exists with lockfile version 3.
- Typecheck and lint passed.

Not verified: production Vercel settings, deployment protection, environment variable presence/quality, GitHub token scopes, and live runtime behavior.

## Maintainability Review

The codebase is relatively small and modular. Content parsing and storage helpers are centralized. Existing docs are unusually detailed for the deployment/content model.

Confirmed maintainability issues:

- CDR-005: lack of tests increases regression risk.
- CDR-009: authoring docs are stale.
- CDR-010: config docs and enforcement differ.

No concrete issue found from inspected evidence for excessive duplication or unbounded complexity in the core code paths.

## Recommended Fix Plan

Must-fix before broader production exposure:

1. Add admin login rate limiting/lockout and logging (CDR-001).
2. Validate companion `project` and `slug` and enforce path containment (CDR-002).
3. Fix crosspost non-2xx handling so failed webhooks are not reported as sent (CDR-004).
4. Add focused tests around auth, storage path validation, upload handling, crosspost, and visibility filtering (CDR-005).
5. Decide whether to ban or sanitize SVG uploads, then enforce that policy (CDR-003).

Later improvements:

1. Add wiki pages and public knowledge entries to the sitemap (CDR-006).
2. Migrate `npm run lint` away from `next lint` (CDR-007).
3. Hide/label or implement admin analytics (CDR-008).
4. Update both authoring guides for companion admin support (CDR-009).
5. Enforce the documented 32+ character session secret minimum (CDR-010).

## Assumptions and Not Verified

- `.env.local` exists but was not read; secret values and production env configuration are not verified.
- No files under `claude_review/` were read or used.
- Production deployment settings, Vercel protection, WAF/rate limiting, and live domain behavior are not verified.
- GitHub token permissions and branch protection are not verified.
- `next build` was not run because it would write `.next/`.
- Browser rendering, accessibility with assistive technology, and responsive screenshots were not verified.
- No database/payment/queue/cron systems were found; absence is based on repository searches, not external infrastructure.

## Commands Run

All commands were run from `/Users/daeseonyoo/Documents/GitHub/ai-product/daseon-blog`. All searches excluded `claude_review/` either with `-g '!claude_review/**'` or `find ... -path './claude_review' -prune`.

| Command | Purpose | Result |
|---|---|---|
| `pwd` | Confirm working directory | Passed |
| `date +%Y-%m-%d-%H%M` | Capture initial timestamp | Passed |
| `git branch --show-current` | Capture branch | Passed |
| `git rev-parse HEAD` | Capture HEAD commit | Passed |
| `git status --short` | Capture initial working tree status | Passed |
| `rg --files -g '!claude_review/**'` | List repository files excluding `claude_review/` | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -maxdepth 3 -type d -print` | Inspect directory structure | Passed |
| `find codex_review/full -maxdepth 1 -type d -print` | Check existing review dirs | Failed: directory did not exist |
| `rg --files --hidden -g '!claude_review/**' -g '!.git/**' -g '!node_modules/**' -g '!.next/**'` | Include hidden config files in file inventory | Passed |
| `rg -n "TODO|FIXME|HACK|XXX|SECURITY|BUG|REVIEW" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | Search known issue markers | Passed |
| `rg -n "process\\.env|NEXT_PUBLIC_|ADMIN_|GITHUB_|TOKEN|SECRET|PASSWORD|COOKIE|JWT|SESSION" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | Search env/secrets/auth references | Passed |
| `rg --files -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**' -g '*test*' -g '*spec*'` | Search test/spec files | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name '.env*' -print` | Find env files | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name '*schema*' -o -name '*migration*' -o -name '*prisma*' -o -name '*drizzle*' -print` | Search schema/migration/ORM files | Passed; no relevant files found |
| `nl -ba package.json` | Inspect package scripts/dependencies | Passed |
| `nl -ba next.config.mjs` | Inspect Next config | Passed |
| `nl -ba tsconfig.json` | Inspect TypeScript config | Passed |
| `nl -ba middleware.ts` | Inspect auth middleware | Passed |
| `nl -ba README.md` | Inspect README | Passed |
| `nl -ba docs/architecture.md` | Inspect architecture docs | Passed |
| `nl -ba docs/project-log-spec.md` | Inspect project log spec | Passed |
| `nl -ba .env.example` | Inspect env example | Passed |
| `nl -ba .eslintrc.json` | Inspect lint config | Passed |
| `nl -ba .gitignore` | Inspect ignore rules | Passed |
| `nl -ba lib/auth.ts` | Inspect auth helpers | Passed |
| `nl -ba app/api/auth/login/route.ts` | Inspect login API | Passed |
| `nl -ba app/api/auth/logout/route.ts` | Inspect logout API | Passed |
| `nl -ba app/api/admin/posts/route.ts` | Inspect post create API | Passed |
| `nl -ba app/api/admin/posts/[locale]/[slug]/route.ts` | Inspect post edit/delete API | Failed: shell glob required quoting |
| `nl -ba app/api/admin/upload/route.ts` | Inspect upload API | Passed |
| `nl -ba 'app/api/admin/posts/[locale]/[slug]/route.ts'` | Inspect post edit/delete API with quoted path | Passed |
| `nl -ba app/api/admin/projects/route.ts` | Inspect project create API | Passed |
| `nl -ba 'app/api/admin/projects/[locale]/[slug]/route.ts'` | Inspect project edit/delete API | Passed |
| `nl -ba app/api/admin/site/route.ts` | Inspect site admin API | Passed |
| `nl -ba app/api/admin/log-companion/route.ts` | Inspect companion API | Passed |
| `nl -ba app/api/rag/manifest/route.ts` | Inspect RAG manifest API | Passed |
| `nl -ba lib/storage.ts` | Inspect storage helpers | Passed |
| `nl -ba lib/project-storage.ts` | Inspect project storage helpers | Passed |
| `nl -ba lib/site-storage.ts` | Inspect site storage helpers | Passed |
| `nl -ba lib/github.ts` | Inspect GitHub commit helpers | Passed |
| `nl -ba lib/source.ts` | Inspect content source abstraction | Passed |
| `nl -ba lib/slug.ts` | Inspect slug validation | Passed |
| `nl -ba lib/posts.ts` | Inspect content loaders | Passed |
| `nl -ba lib/projects.ts` | Inspect project loaders | Passed |
| `nl -ba lib/logs.ts` | Inspect log loaders | Passed |
| `nl -ba lib/now.ts` | Inspect now loader | Passed |
| `nl -ba lib/mdx.ts` | Inspect MDX rendering | Passed |
| `nl -ba lib/serialize-mdx.ts` | Inspect MDX serialization | Passed |
| `nl -ba 'app/(public)/projects/[slug]/page.tsx'` | Inspect EN project detail | Passed |
| `nl -ba 'app/(public)/ko/projects/[slug]/page.tsx'` | Inspect KO project detail | Passed |
| `nl -ba 'app/(public)/projects/[slug]/log/[entry]/page.tsx'` | Inspect EN log detail | Passed |
| `nl -ba 'app/(public)/ko/projects/[slug]/log/[entry]/page.tsx'` | Inspect KO log detail | Passed |
| `nl -ba components/LogTimeline.tsx` | Inspect log timeline component | Passed |
| `nl -ba components/ProjectBody.tsx` | Inspect project body/log filtering | Passed |
| `nl -ba 'app/(public)/posts/page.tsx'` | Inspect EN posts index | Passed |
| `nl -ba 'app/(public)/posts/[slug]/page.tsx'` | Inspect EN post detail | Passed |
| `nl -ba 'app/(public)/ko/posts/page.tsx'` | Inspect KO posts index | Passed |
| `nl -ba 'app/(public)/ko/posts/[slug]/page.tsx'` | Inspect KO post detail | Passed |
| `nl -ba 'app/(public)/wiki/page.tsx'` | Inspect EN wiki index | Passed |
| `nl -ba 'app/(public)/wiki/[slug]/page.tsx'` | Inspect EN wiki detail | Passed |
| `nl -ba 'app/(public)/ko/wiki/page.tsx'` | Inspect KO wiki index | Passed |
| `nl -ba 'app/(public)/ko/wiki/[slug]/page.tsx'` | Inspect KO wiki detail | Passed |
| `nl -ba 'app/(public)/posts/tag/[tag]/page.tsx'` | Inspect EN tag route | Passed |
| `nl -ba 'app/(public)/ko/posts/tag/[tag]/page.tsx'` | Inspect KO tag route | Passed |
| `nl -ba 'app/(public)/projects/page.tsx'` | Inspect EN projects index | Passed |
| `nl -ba 'app/(public)/ko/projects/page.tsx'` | Inspect KO projects index | Passed |
| `nl -ba components/admin/LoginForm.tsx` | Inspect login UI | Passed |
| `nl -ba components/admin/PostEditor.tsx` | Inspect post editor/upload UI | Passed |
| `nl -ba components/admin/ProjectEditor.tsx` | Inspect project editor | Passed |
| `nl -ba components/admin/SiteForm.tsx` | Inspect site form/upload UI | Passed |
| `nl -ba 'app/(admin)/admin/login/page.tsx'` | Inspect admin login page | Passed |
| `nl -ba 'app/(admin)/admin/layout.tsx'` | Inspect admin layout | Passed |
| `nl -ba 'app/(admin)/admin/page.tsx'` | Inspect admin overview | Passed |
| `nl -ba components/admin/AdminNav.tsx` | Inspect admin navigation | Passed |
| `nl -ba components/admin/DeletePostButton.tsx` | Inspect delete UI | Passed |
| `nl -ba components/admin/CompanionEditor.tsx` | Inspect companion editor | Passed |
| `nl -ba 'app/(admin)/admin/posts/page.tsx'` | Inspect admin posts list | Passed |
| `nl -ba 'app/(admin)/admin/posts/new/page.tsx'` | Inspect new post page | Passed |
| `nl -ba 'app/(admin)/admin/posts/[locale]/[slug]/edit/page.tsx'` | Inspect edit post page | Passed |
| `nl -ba 'app/(admin)/admin/projects/page.tsx'` | Inspect admin projects list | Passed |
| `nl -ba 'app/(admin)/admin/projects/new/page.tsx'` | Inspect new project page | Passed |
| `nl -ba 'app/(admin)/admin/projects/[locale]/[slug]/edit/page.tsx'` | Inspect edit project page | Passed |
| `nl -ba components/admin/ProjectsList.tsx` | Inspect project list actions | Passed |
| `nl -ba 'app/(admin)/admin/projects/[slug]/logs/page.tsx'` | Inspect admin project logs page | Passed |
| `nl -ba 'app/(admin)/admin/projects/[slug]/logs/[entry]/page.tsx'` | Inspect admin companion edit page | Passed |
| `nl -ba 'app/(admin)/admin/distribution/page.tsx'` | Inspect distribution page | Passed |
| `nl -ba components/admin/DistributionChecklist.tsx` | Inspect distribution checklist | Passed |
| `nl -ba 'app/(admin)/admin/analytics/page.tsx'` | Inspect analytics placeholder | Passed |
| `nl -ba lib/feed.ts` | Inspect feed builder | Passed |
| `nl -ba 'app/(public)/feed.xml/route.ts'` | Inspect EN feed route | Passed |
| `nl -ba 'app/(public)/ko/feed.xml/route.ts'` | Inspect KO feed route | Passed |
| `nl -ba app/sitemap.ts` | Inspect sitemap | Passed |
| `nl -ba app/robots.ts` | Inspect robots | Passed |
| `nl -ba lib/site.ts` | Inspect site config constant | Passed |
| `nl -ba content/site.json` | Inspect public site profile config | Passed |
| `nl -ba app/layout.tsx` | Inspect root layout metadata | Passed |
| `nl -ba 'app/(public)/layout.tsx'` | Inspect public layout | Passed |
| `nl -ba 'app/(public)/page.tsx'` | Inspect EN home | Passed |
| `nl -ba 'app/(public)/ko/page.tsx'` | Inspect KO home | Passed |
| `nl -ba app/globals.css` | Inspect global CSS | Passed |
| `nl -ba components/Header.tsx` | Inspect header/navigation | Passed |
| `nl -ba components/ProfileCard.tsx` | Inspect profile card | Passed |
| `nl -ba components/ProfileHeader.tsx` | Inspect profile header | Passed |
| `nl -ba components/Avatar.tsx` | Inspect avatar component | Passed |
| `nl -ba components/PostBody.tsx` | Inspect post detail body | Passed |
| `nl -ba components/mdx-components.tsx` | Inspect MDX component mapping | Passed |
| `nl -ba components/Mermaid.tsx` | Inspect Mermaid rendering | Passed |
| `nl -ba lib/remark-mermaid.ts` | Inspect Mermaid remark plugin | Passed |
| `nl -ba lib/remark-wiki-link.ts` | Inspect wiki-link plugin | Passed |
| `nl -ba lib/i18n.ts` | Inspect i18n helpers/copy | Passed |
| `nl -ba tailwind.config.ts` | Inspect Tailwind config | Passed |
| `nl -ba postcss.config.mjs` | Inspect PostCSS config | Passed |
| `test -d node_modules` | Confirm dependencies are present locally | Passed |
| `test -x node_modules/.bin/tsc` | Confirm local TypeScript binary | Passed |
| `test -x node_modules/.bin/next` | Confirm local Next binary | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name 'next-env.d.ts' -print` | Check generated Next type file presence | Passed |
| `npm run typecheck -- --incremental false` | Run non-writing TypeScript check | Passed |
| `npm run lint` | Run lint | Passed with deprecation warning |
| `git status --short` | Confirm verification commands did not alter source | Passed |
| `sed -n '1,80p' package-lock.json` | Inspect lockfile header/deps | Passed |
| `nl -ba install/README.md` | Inspect installer docs | Passed |
| `nl -ba install/setup.sh` | Inspect installer script | Passed |
| `nl -ba install/settings.json` | Inspect hook settings template | Passed |
| `nl -ba CLAUDE.md` | Inspect project instructions/docs | Passed |
| `nl -ba docs/troubleshooting.md` | Inspect troubleshooting docs | Passed |
| `rg -n "^#|^##|Admin|Environment|Deploy|Vercel|test|TODO|missing|Not wired" docs/blog-guide.md docs/blog-guide.ko.md -g '!claude_review/**'` | Inspect authoring guide structure and admin docs | Passed |
| `rg -n "describe\\(|it\\(|test\\(|vitest|jest|playwright|cypress|testing-library|@testing" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | Search test definitions/config references | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f -name '*test*' -print` | Search test files | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f -name '*spec*' -print` | Search spec files | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name 'vitest.config.*' -o -name 'jest.config.*' -o -name 'playwright.config.*' -o -name 'cypress.config.*' -print` | Search test runner configs | Passed; no configs found |
| `rg -n "analytics|Plausible|Vercel Web Analytics|console\\.|logger|Sentry|monitor|telemetry" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | Search observability/analytics references | Passed |
| `node -e "const path=require('node:path'); console.log(path.relative(process.cwd(), path.join(process.cwd(), 'content/logs/../../posts/en/example.human.mdx')));"` | Demonstrate path normalization outside intended companion directory | Passed |
| `date +%Y-%m-%d-%H%M` | Capture report directory timestamp | Passed |
| `test -e codex_review/full/2026-05-30-2329` | Check output directory collision | Passed with exit 1 meaning no collision |
| `mkdir -p codex_review/full/2026-05-30-2329` | Create review output directory | Passed |
| `rg -n "rate|ratelimit|throttle|lockout|attempt|ip|redis|upstash|kv|captcha" app lib middleware.ts package.json -g '!claude_review/**'` | Search auth abuse protections | Passed |
| `rg -n "image/svg\\+xml|ALLOWED|file\\.type|saveBinaryAsset|dangerouslySetInnerHTML|sanitize" app/api components lib -g '!claude_review/**'` | Search upload/SVG handling | Passed |
| `rg -n "log-companion|saveHumanCompanion|deleteHumanCompanion|content/logs/\\$\\{project\\}|isValidSlug" app lib components -g '!claude_review/**'` | Compare companion validation with other slug validation | Passed |
| `rg -n "wiki|knowledge|sitemap|getPublishedPosts|getAllProjects|staticEntries" app/sitemap.ts app/'(public)' lib -g '!claude_review/**'` | Compare wiki routes with sitemap | Passed |
| `nl -ba lib/crosspost.ts` | Inspect crosspost integration | Passed |
| `nl -ba components/SocialGrid.tsx` | Inspect social links | Passed |
| `nl -ba components/Footer.tsx` | Inspect footer | Passed |
| `nl -ba components/WikiBody.tsx` | Inspect wiki body | Passed |
| `nl -ba components/WikiList.tsx` | Inspect wiki list | Passed |
| `nl -ba components/PostList.tsx` | Inspect post list | Passed |
| `test -f codex_review/full/2026-05-30-2329/comprehensive-review.en.md` | Verify English report exists | Passed |
| `test -f codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify Korean report exists | Passed |
| `find codex_review/full/2026-05-30-2329 -maxdepth 1 -type f -print` | Verify only the two report files exist in the output directory | Passed |
| `rg -o "CDR-[0-9]{3}" codex_review/full/2026-05-30-2329/comprehensive-review.en.md` | Verify English finding IDs | Passed |
| `rg -o "CDR-[0-9]{3}" codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify Korean finding IDs match the English report | Passed |
| `rg -n "\\| CDR-001 \\||\\| CDR-002 \\||\\| CDR-003 \\||\\| CDR-004 \\||\\| CDR-005 \\||\\| CDR-006 \\||\\| CDR-007 \\||\\| CDR-008 \\||\\| CDR-009 \\||\\| CDR-010 \\|" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify both key finding summary tables contain the same ten IDs | Passed |
| `git status --short` | Check final working tree status after report creation | Passed |
| `find codex_review -type f -print` | Confirm review-created files are limited to the new output reports | Passed |
| `rg -n "severity: Critical|severity: High|severity: Medium|severity: Low|Severity: Critical|Severity: High|Severity: Medium|Severity: Low" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify severity entries exist and match by count | Passed |
| `rg -n "Evidence:|Evidence" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify every confirmed issue section includes evidence | Passed |
| `rg -n "claude_review" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Verify reports explicitly state `claude_review/` was excluded | Passed |
| `wc -l codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Compare report lengths during parity verification | Passed |

## Files Inspected

Important inspected files and directories included:

- Root/config: `package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`, `.eslintrc.json`, `.gitignore`, `.env.example`, `tailwind.config.ts`, `postcss.config.mjs`, `middleware.ts`.
- Documentation: `README.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/project-log-spec.md`, `docs/troubleshooting.md`, `docs/blog-guide.md`, `docs/blog-guide.ko.md`, `install/README.md`, `install/setup.sh`, `install/settings.json`.
- App routes: `app/(public)/**`, `app/(admin)/**`, `app/api/**`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/globals.css`.
- Libraries: `lib/auth.ts`, `lib/source.ts`, `lib/storage.ts`, `lib/github.ts`, `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/crosspost.ts`, `lib/site-storage.ts`, `lib/mdx.ts`, `lib/serialize-mdx.ts`, `lib/slug.ts`, `lib/i18n.ts`, remark plugins.
- Components: public components under `components/` and admin components under `components/admin/`.
- Content/config: `content/site.json`, representative `content/**` structure, `public/**` asset structure.

`claude_review/` was not read, inspected, summarized, or used.

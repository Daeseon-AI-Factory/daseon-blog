# Codex Comprehensive Repository Review

## Review Metadata

- Review date/time: 2026-06-18 13:15:01 EDT
- Git branch: `main`
- HEAD commit: `a65e5945d7051180f3865a7d610dd5a7f6bcac7b`
- Working tree status before report files: `docs/troubleshooting.md` modified; `claude_review/`, `codex_review/`, `docs/simlab-design.md`, and `docs/trainer-design.md` untracked.
- Generated output directory: `codex_review/full/2026-06-18-1308/`
- Full weekly/monthly review: full repository review requested as a one-off Codex review. A weekly/monthly cadence was not verified.

## Review Scope

Inspected repository structure, root docs, package/config files, environment examples, Next.js app routes, API routes, auth/session code, file/GitHub-backed storage, MDX rendering, admin UI components, public UI components, scripts, install kit, content loaders, sitemap/feed/robots, tests/test configuration, and non-destructive command results.

Not inspected or used: anything under `claude_review/`. Previous `codex_review/` report contents were not used as evidence. `.env.local` contents were intentionally not printed or inspected because it can contain live secrets. `node_modules` source was not manually reviewed; dependency evidence came from `npm audit` and `npm ls`. `npm run build` was not run because it writes build output and the task restricts modifications to the review output directory.

## Executive Summary

The project is a mostly coherent personal portfolio/blog application with a clear file-backed content model, bilingual public routes, admin authoring, GitHub-backed publishing, and useful architecture documentation. Based on inspected evidence, the public read path appears structurally sound and TypeScript/lint checks pass.

The project is partially ready, but not production-hardened for a public admin surface. The highest-priority gaps are admin login brute-force protection, uploaded SVG handling, log-companion path validation, production dependency advisories, and the absence of automated tests around the security-sensitive content write paths.

## Project Overview

The app appears to be a Next.js 15 App Router site using React 19, TypeScript, Tailwind CSS, MDX content, and GitHub as a content source of truth. Public pages include posts, projects, project logs, wiki entries, about/now/method pages, RSS, sitemap, and Korean mirrors. Admin pages support login, post/project/site editing, uploads, distribution checklist, log companions, and an analytics placeholder.

Major components:

- `app/(public)/...`: public localized routes.
- `app/(admin)/admin/...`: admin UI.
- `app/api/admin/...`: authenticated write APIs.
- `lib/source.ts`: local filesystem vs GitHub Raw/Contents read abstraction.
- `lib/storage.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/github.ts`: content persistence.
- `lib/auth.ts`, `middleware.ts`: password + JWT cookie admin session.
- `lib/mdx.ts`, `components/Mermaid.tsx`: MDX and diagram rendering.
- `content/...`: file-backed posts, projects, logs, wiki, and site config.

## Key Findings Summary

| ID | Severity | Category | Title | Confidence |
|---|---|---|---|---|
| F-001 | High | Security/Auth | Public admin login has no real rate limit or lockout | High |
| F-002 | Medium | Security/Uploads | SVG uploads are accepted and published as raw same-origin public files | High |
| F-003 | Medium | Security/API/Data | Log companion API accepts unvalidated path segments before write/delete | High |
| F-004 | Medium | Security/Dependencies | `npm audit --omit=dev` reports production dependency advisories | High |
| F-005 | Medium | Testing | No automated test suite or `npm test` script exists | High |
| F-006 | Low | Frontend/Accessibility | Korean pages inherit hard-coded `<html lang="en">` | High |
| F-007 | Low | Product/Ops | Admin Analytics page is linked but intentionally not implemented | High |
| F-008 | Low | Tooling/Maintainability | Lint script uses deprecated `next lint` | High |
| F-009 | Low | Documentation/Ops | Root README lacks usable setup/deployment guidance | High |
| F-010 | Low | Security/Configuration | Example admin password is weak and secret length enforcement is weaker than docs | High |

## Critical Issues

No Critical issues found from the inspected evidence.

## High-Priority Issues

### F-001: Public admin login has no real rate limit or lockout

- Severity: High
- Category: Security/Auth
- Evidence: `middleware.ts:4-5` protects `/admin/*` and `/api/admin/*`, while `app/api/auth/login/route.ts` is outside that matcher; `app/api/auth/login/route.ts:11-15` checks the password and only adds a fixed 400 ms delay on failure; `lib/auth.ts:47-55` compares a single `ADMIN_PASSWORD`.
- What is wrong: The public login endpoint has no per-IP throttling, account lockout, exponential backoff, attempt logging, CAPTCHA, deployment protection, or second factor. The only slowdown is a fixed delay.
- Why it matters: This admin session can reach write APIs for posts, projects, site config, uploads, and GitHub commits. A single public password gate without rate limiting is exposed to online guessing.
- Recommended fix: Add server-side rate limiting keyed by IP and normalized client identity, use exponential backoff or temporary lockout, log failed attempts, reject known default passwords, and consider GitHub OAuth/2FA or upstream deployment protection for `/admin`.
- Confidence: High

## Medium-Priority Issues

### F-002: SVG uploads are accepted and published as raw same-origin public files

- Severity: Medium
- Category: Security/Uploads
- Evidence: `app/api/admin/upload/route.ts:7-14` includes `"image/svg+xml": "svg"` in the allow-list; `app/api/admin/upload/route.ts:83-90` saves the uploaded bytes without sanitization; `components/admin/PostEditor.tsx:443` and `components/admin/PostEditor.tsx:458` advertise/accept SVG uploads.
- What is wrong: SVG is active XML content and can carry scripts, external references, or confusing markup. The route stores it under `public/...` as a same-origin file.
- Why it matters: Even though upload is admin-gated, a malicious or copied SVG can become same-origin public content. This increases stored-XSS/content-spoofing risk and makes later content reuse unsafe.
- Recommended fix: Remove SVG from the default allow-list, or sanitize SVG server-side with a hardened sanitizer and serve SVG with strict CSP/`Content-Disposition` where possible. Prefer rasterizing SVG to PNG/WebP before publishing.
- Confidence: High

### F-003: Log companion API accepts unvalidated path segments before write/delete

- Severity: Medium
- Category: Security/API/Data
- Evidence: `app/api/admin/log-companion/route.ts:23-29` only checks that `project`, `slug`, and `body` are present; `app/api/admin/log-companion/route.ts:44-49` only checks query parameter presence on delete; `lib/storage.ts:122` and `lib/storage.ts:144` construct `content/logs/${project}/${slug}.human.mdx`; `lib/storage.ts:129-153` writes/deletes via `path.join(process.cwd(), rel)` in local mode.
- What is wrong: `project` and `slug` are accepted as arbitrary strings instead of validated slugs or checked against known log entries. In local mode, `../` segments can escape the intended `content/logs/<project>/` directory.
- Why it matters: This is an authenticated admin endpoint, but it broadens a narrow companion-file action into an arbitrary path write/delete primitive in local mode and potentially unexpected GitHub API paths in production.
- Recommended fix: Validate both fields with `isValidSlug`, reject dots and slashes, resolve the final path and assert it remains under `content/logs`, and preferably require the companion target to correspond to an existing log entry.
- Confidence: High for the local path behavior; production GitHub handling of traversal-like paths was not verified.

### F-004: `npm audit --omit=dev` reports production dependency advisories

- Severity: Medium
- Category: Security/Dependencies
- Evidence: `npm audit --audit-level=moderate --omit=dev` failed with 5 moderate vulnerabilities. `npm ls dompurify js-yaml postcss gray-matter next` showed `mermaid@11.15.0 -> dompurify@3.4.7`, `gray-matter@4.0.3 -> js-yaml@3.14.2`, and `next@15.5.18 -> postcss@8.4.31`.
- What is wrong: The production dependency graph includes advisories for DOMPurify, js-yaml, and PostCSS.
- Why it matters: This app renders admin-authored MDX and Mermaid diagrams, parses YAML frontmatter, and builds CSS through framework tooling. The exact exploitability depends on input trust boundaries, but the vulnerable packages are in runtime/build paths that matter.
- Recommended fix: Upgrade direct dependencies to versions that resolve the transitive advisories where possible. Because audit suggests some forced fixes are breaking, test upgrades in a branch, especially `next`, `mermaid`, and `gray-matter` behavior around MDX/frontmatter.
- Confidence: High

### F-005: No automated test suite or `npm test` script exists

- Severity: Medium
- Category: Testing
- Evidence: `package.json:5-11` defines `dev`, `build`, `start`, `lint`, and `typecheck`, but no `test`; `rg --files ... | rg '(__tests__|\\.test\\.|\\.spec\\.)'` found no test files; `npm test` failed with `Missing script: "test"`.
- What is wrong: The repository has no automated tests for auth, upload validation, path safety, content visibility, MDX rendering, or admin write APIs.
- Why it matters: The highest-risk code paths are small enough to test and easy to regress: password/session handling, upload allow-list, GitHub/local storage routing, visibility filtering, and log companion paths.
- Recommended fix: Add focused unit tests for `lib/auth`, `lib/slug`, storage path helpers, upload validation, and content visibility; add route-handler tests for admin APIs; add one Playwright smoke path for public pages and admin login if feasible.
- Confidence: High

## Low-Priority Issues

### F-006: Korean pages inherit hard-coded `<html lang="en">`

- Severity: Low
- Category: Frontend/Accessibility
- Evidence: `app/layout.tsx:33-36` always renders `<html lang="en">`; `find app -path '*layout.tsx'` found only `app/layout.tsx`, `app/(public)/layout.tsx`, and `app/(admin)/admin/layout.tsx`; `app/(public)/layout.tsx:1-2` does not override language.
- What is wrong: `/ko/...` pages render Korean content under an English document language.
- Why it matters: Screen readers, translation tools, browser language heuristics, and search engines use the document language as a signal.
- Recommended fix: Introduce a locale segment layout that can set `lang="ko"` for Korean routes, or restructure routes under a dynamic locale segment with per-locale metadata/layout handling.
- Confidence: High

### F-007: Admin Analytics page is linked but intentionally not implemented

- Severity: Low
- Category: Product/Ops
- Evidence: `components/admin/AdminNav.tsx:7-13` includes an `Analytics` nav item; `app/(admin)/admin/analytics/page.tsx:7-17` renders "Not wired up yet" and describes future Plausible/Vercel/roll-your-own options.
- What is wrong: A visible admin workflow leads to a placeholder.
- Why it matters: This is not a runtime bug, but it weakens operational readiness and can mislead the owner into expecting traffic/referral insight that does not exist.
- Recommended fix: Either remove/hide the nav item until implemented, or add the chosen analytics provider and document the privacy/runtime behavior.
- Confidence: High

### F-008: Lint script uses deprecated `next lint`

- Severity: Low
- Category: Tooling/Maintainability
- Evidence: `package.json:9` defines `"lint": "next lint"`; `npm run lint` passed but printed that `next lint` is deprecated and will be removed in Next.js 16.
- What is wrong: The lint command is on a deprecation path.
- Why it matters: A future Next.js upgrade can turn a currently passing verification command into a broken script.
- Recommended fix: Migrate to the ESLint CLI with an explicit ESLint config and update the `lint` script accordingly.
- Confidence: High

### F-009: Root README lacks usable setup/deployment guidance

- Severity: Low
- Category: Documentation/Ops
- Evidence: `README.md:1-2` contains only the project name; `.env.example:1-28`, `docs/architecture.md`, and `docs/blog-guide.md` contain important setup/architecture information, but the root README does not point a new maintainer through it.
- What is wrong: The first documentation entry point does not explain stack, local setup, environment variables, scripts, deployment model, or where the real docs live.
- Why it matters: Onboarding and production recovery depend on discoverable operational docs.
- Recommended fix: Expand `README.md` with quick start, required/optional env vars, command list, content model, admin model, deployment notes, and links to `docs/architecture.md` and `docs/blog-guide.md`.
- Confidence: High

### F-010: Example admin password is weak and secret length enforcement is weaker than docs

- Severity: Low
- Category: Security/Configuration
- Evidence: `.env.example:1-5` uses `ADMIN_PASSWORD=changeme` and says the session secret should be a 32+ character random string; `lib/auth.ts:7-12` only rejects secrets shorter than 16 characters; `lib/auth.ts:47-55` does not reject weak/default admin passwords.
- What is wrong: A copied example can configure a weak live admin password, and the code accepts a shorter session secret than the documentation states.
- Why it matters: This compounds F-001. A weak default plus a public login endpoint increases online guessing risk.
- Recommended fix: Leave `ADMIN_PASSWORD` blank in `.env.example`, add runtime rejection for known defaults and short passwords, and enforce the documented 32+ character minimum for `ADMIN_SESSION_SECRET`.
- Confidence: High

## Product Completeness Review

The public product surface is broad: home, posts, tags, projects, project logs, project README/architecture pages, wiki, now, about, method, RSS, sitemap, and bilingual Korean mirrors were present in `app/(public)/...`. The admin surface covers content, projects, site settings, distribution checklist, log companions, and login.

Confirmed completeness gaps:

- F-007: Analytics is visible but not implemented.
- F-009: root onboarding docs are incomplete.

No concrete issue found from the inspected evidence for public post/project/wiki rendering completeness beyond the findings above.

## Architecture Review

The architecture is simple and mostly consistent: content lives as files, reads go through `lib/source.ts`, writes go through storage helpers and GitHub Contents API when configured, and public/admin route groups are separated. `docs/architecture.md` accurately explains the runtime GitHub Raw read path and production filesystem constraint.

Confirmed architecture/data boundary issue:

- F-003: the log companion route bypasses the slug/path discipline used elsewhere.

No database/ORM/migration architecture was found. This appears intentional because the app is file/GitHub-backed.

## Security Review

Confirmed security issues:

- F-001: no real admin login rate limiting.
- F-002: SVG upload risk.
- F-003: log companion path validation gap.
- F-004: production dependency advisories.
- F-010: weak example password and secret length mismatch.

Positive evidence:

- `middleware.ts:4-5` gates `/admin/*` and `/api/admin/*`.
- `lib/auth.ts:36-44` uses `httpOnly`, `sameSite: "lax"`, `secure` in production, and `maxAge`.
- `.gitignore:31-33` ignores env files, and `git ls-files .env.local .env.example` showed only `.env.example` is tracked.
- `app/api/rag/manifest/route.ts:10-25` uses a bearer token and constant-length comparison logic before returning full content.

No concrete issue found from inspected evidence for committed live secrets.

## Data and API Review

The app has no database schema, ORM files, migrations, or seed files from inspected file searches. Data is stored as MDX, Markdown, JSON, and public assets.

Confirmed issues:

- F-003: companion write/delete path validation.
- F-005: lack of route/storage tests.

The main admin post/project APIs validate locale and slug with `isLocale`/`isValidSlug` before writing (`app/api/admin/posts/route.ts:47-50`, `app/api/admin/projects/route.ts:36-42`), which is a good pattern the companion API should reuse.

## Frontend and UX Review

The frontend uses server components for content pages and client components for admin forms. Admin forms include loading/feedback states for uploads and saves, and public pages include basic empty states in list views.

Confirmed frontend/accessibility issue:

- F-006: Korean pages use English document language.

Not verified: visual responsiveness through browser screenshots. A dev server/browser run was not performed because the task was review-only and build/dev workflows can write generated files.

## Testing Review

Confirmed testing issue:

- F-005: no automated tests or test script.

TypeScript passed with `npm run typecheck -- --incremental false`. ESLint passed with `npm run lint`, but the lint command itself is deprecated (F-008).

Recommended first tests:

- Auth: password mismatch, missing env, secret length, cookie options.
- Upload: MIME allow-list, size cap, SVG rejection/sanitization.
- Log companion: project/slug validation and path containment.
- Content visibility: draft/private/unlisted behavior in list and detail loaders.
- RAG manifest: missing/invalid/valid bearer token.

## Performance and Scalability Review

No concrete performance blocker found from inspected evidence. The content loaders generally use `Promise.all` for file reads and `lib/source.ts` uses `next: { revalidate: 30 }` for GitHub Raw/Contents fetches.

Potential but not confirmed: large content growth can increase GitHub API calls across list pages because each list reads directory entries and then individual files. This is an assumption, not a confirmed current issue.

## Deployment and Operations Review

Confirmed deployment/ops issues:

- F-004: dependency audit advisories.
- F-007: analytics/monitoring not implemented.
- F-008: deprecated lint command.
- F-009: root README lacks setup/deployment guidance.
- F-010: env example/default hardening gap.

`npm run build` was not run because it writes `.next/` output and the review instructions prohibited modifications outside the report directory. Typecheck and lint passed.

## Maintainability Review

The codebase is small and readable. The public/admin/source/storage boundaries are understandable. The strongest maintainability risks are missing tests (F-005), deprecated lint tooling (F-008), and documentation discoverability (F-009).

No concrete duplication or complexity issue found from inspected evidence that deserves a separate finding.

## Concrete Bugs or Likely Regressions

Confirmed likely regressions/bugs:

- F-003 can write/delete outside the intended companion directory in local mode.
- F-006 causes incorrect document language for Korean routes.
- F-008 will become a tooling break when `next lint` is removed.

## Highest-Priority Fixes Before Production

1. Add real admin login throttling/lockout and reject default/weak credentials (F-001, F-010).
2. Remove or sanitize SVG uploads before storing them under `public/` (F-002).
3. Validate and contain log companion paths (F-003).
4. Resolve or explicitly triage the production dependency advisories (F-004).
5. Add a minimum automated test suite around auth, upload, storage, and visibility paths (F-005).

## Recommended Fix Plan

Must-fix before production hardening:

1. Implement rate limiting and credential hardening for `/api/auth/login`.
2. Remove SVG from upload allow-list or sanitize/rasterize it.
3. Validate `project` and `slug` in `app/api/admin/log-companion/route.ts`.
4. Upgrade dependencies to address `npm audit --omit=dev`.
5. Add route/helper tests for the changed security-sensitive paths.

Later improvements:

1. Set correct document language for Korean pages.
2. Decide whether analytics should be implemented or hidden.
3. Migrate linting off `next lint`.
4. Expand the root README.

## Assumptions and Not Verified

- `claude_review/` was not read, inspected, summarized, compared, or used.
- `.env.local` contents were not inspected.
- `npm run build` was not run because it writes generated build output.
- Browser-based UX/responsiveness was not verified with screenshots.
- Production behavior of GitHub Contents API for traversal-like paths was not verified; the local filesystem path behavior is confirmed from code.
- No current private/draft content exposure was verified; `content/notes` only contained `.gitkeep`, and the status/visibility grep did not find active draft/private frontmatter.
- No payment, billing, database, queues, cron jobs, or background worker implementation was found in inspected source.

## Commands Run

| Command | Purpose | Result |
|---|---|---|
| `date +%Y-%m-%d-%H%M` | Generate review directory timestamp. | Passed: `2026-06-18-1308`. |
| `git branch --show-current` | Capture branch. | Passed: `main`. |
| `git rev-parse HEAD` | Capture HEAD commit. | Passed: `a65e5945d7051180f3865a7d610dd5a7f6bcac7b`. |
| `git status --short` | Capture initial working tree state. | Passed; showed pre-existing dirty/untracked files. |
| `find codex_review/full -maxdepth 1 -type d -name '2026-06-18-1308*'` | Ensure output directory would not overwrite existing review. | Passed; no existing match. |
| `mkdir -p codex_review/full/2026-06-18-1308` | Create review output directory. | Passed. |
| `rg --files -g '!claude_review/**'` | Inventory repository files while excluding `claude_review/`. | Passed. |
| `find . -maxdepth 2 -type d -not -path './claude_review*' -not -path './codex_review*' -not -path './.git*'` | Inspect top-level directory structure. | Passed. |
| `nl -ba package.json` | Inspect package scripts/dependencies with line numbers. | Passed. |
| `nl -ba README.md` | Inspect root README. | Passed. |
| `nl -ba next.config.mjs` | Inspect Next config. | Passed. |
| `nl -ba tsconfig.json` | Inspect TypeScript config. | Passed. |
| `rg -n "TODO|FIXME|XXX|HACK|@ts-ignore|dangerouslySetInnerHTML|process\\.env|cookies\\(|NextResponse|fetch\\(|localStorage|eval\\(|innerHTML|JWT|jwt|token|password|secret|upload|writeFile|mkdir|unlink|rename|rm\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | Search security-sensitive and known-risk code patterns. | Passed. |
| `rg -n "export async function (GET|POST|PUT|PATCH|DELETE)|generateStaticParams|generateMetadata|revalidate|dynamic" app lib components -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | Inventory route handlers/dynamic rendering. | Passed. |
| `rg -n "describe\\(|it\\(|test\\(|expect\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | Initial broad test search. | Passed but produced false positives from `.test(...)` regex calls. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' -g '*test*' -g '*spec*'` | Search test/spec filenames. | Passed; no actual test files found. |
| `rg -n "\\b(describe|it|test|expect)\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | Refined test symbol search. | Passed; remaining matches were implementation regex calls, not tests. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' \| rg '(__tests__|\\.test\\.|\\.spec\\.)'` | Confirm absence of conventional test files. | Failed with exit 1 because no matches were found. |
| `find . -maxdepth 3 -name '.env*' -not -path './claude_review/*' -not -path './codex_review/*' -not -path './node_modules/*' -not -path './.next/*'` | Locate env files without reading `.env.local`. | Passed; found `.env.local` and `.env.example`. |
| `find . -maxdepth 4 -type f -name '*schema*' -o -name '*migration*' -o -name '*seed*'` | Initial schema/migration/seed search. | Passed but included node_modules due command precedence. |
| `nl -ba .env.example` | Inspect documented env vars. | Passed. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' \| rg '(schema|migration|seed)'` | Refined schema/migration/seed search. | Failed with exit 1 because no matches were found. |
| `nl -ba middleware.ts` | Inspect admin/API middleware. | Passed. |
| `nl -ba lib/auth.ts` | Inspect session/password logic. | Passed. |
| `nl -ba app/api/auth/login/route.ts` | Inspect login endpoint. | Passed. |
| `nl -ba app/api/auth/logout/route.ts` | Inspect logout endpoint. | Passed. |
| `nl -ba components/admin/LoginForm.tsx` | Inspect login client behavior. | Passed. |
| `nl -ba app/(admin)/admin/login/page.tsx` | Inspect login page search param flow. | Passed. |
| `nl -ba lib/storage.ts` | Inspect post/binary/companion storage. | Passed. |
| `nl -ba lib/project-storage.ts` | Inspect project storage. | Passed. |
| `nl -ba lib/site-storage.ts` | Inspect site config storage/validation. | Passed. |
| `nl -ba lib/github.ts` | Inspect GitHub commit/delete helpers. | Passed. |
| `nl -ba lib/slug.ts` | Inspect slug validation. | Passed. |
| `nl -ba app/api/admin/posts/route.ts` | Inspect create post API. | Passed. |
| `nl -ba app/api/admin/posts/[locale]/[slug]/route.ts` | Inspect update/delete post API. | Passed. |
| `nl -ba app/api/admin/projects/route.ts` | Inspect create project API. | Passed. |
| `nl -ba app/api/admin/projects/[locale]/[slug]/route.ts` | Inspect update/delete project API. | Passed. |
| `nl -ba app/api/admin/log-companion/route.ts` | Inspect companion API. | Passed. |
| `nl -ba app/api/admin/upload/route.ts` | Inspect upload API. | Passed. |
| `nl -ba lib/serialize-mdx.ts` | Inspect MDX serialization. | Passed. |
| `nl -ba lib/mdx.ts` | Inspect MDX rendering pipeline. | Passed. |
| `nl -ba components/mdx-components.tsx` | Inspect custom MDX components/links. | Passed. |
| `nl -ba components/Mermaid.tsx` | Inspect Mermaid rendering. | Passed. |
| `nl -ba lib/remark-mermaid.ts` | Inspect Mermaid remark transform. | Passed. |
| `nl -ba lib/source.ts` | Inspect content source abstraction. | Passed. |
| `nl -ba lib/posts.ts` | Inspect post/content loader. | Passed. |
| `nl -ba lib/projects.ts` | Inspect project loader. | Passed. |
| `nl -ba lib/logs.ts` | Inspect project log loader. | Passed. |
| `nl -ba lib/now.ts` | Inspect now-page loader. | Passed. |
| `nl -ba app/(public)/posts/[slug]/page.tsx` | Inspect EN post detail route. | Passed. |
| `nl -ba app/(public)/ko/posts/[slug]/page.tsx` | Inspect KO post detail route. | Passed. |
| `nl -ba app/(public)/wiki/[slug]/page.tsx` | Inspect EN wiki route. | Passed. |
| `nl -ba app/(public)/ko/wiki/[slug]/page.tsx` | Inspect KO wiki route. | Passed. |
| `nl -ba app/(public)/posts/page.tsx` | Inspect posts index route. | Passed. |
| `rg -n "status:\\s*(draft|published)|visibility:\\s*(private|unlisted|public)" content -g '!claude_review/**' -g '!codex_review/**'` | Search current content visibility/status. | Passed. |
| `find content/notes -maxdepth 3 -type f` | Inspect notes content presence. | Passed; only `.gitkeep` files. |
| `nl -ba app/api/rag/manifest/route.ts` | Inspect RAG manifest auth/data behavior. | Passed. |
| `nl -ba app/sitemap.ts` | Inspect sitemap generation. | Passed. |
| `nl -ba app/robots.ts` | Inspect robots rules. | Passed. |
| `nl -ba app/(public)/feed.xml/route.ts` | Inspect RSS route. | Passed. |
| `nl -ba lib/feed.ts` | Inspect feed generation. | Passed. |
| `nl -ba app/(admin)/admin/layout.tsx` | Inspect admin layout. | Passed. |
| `nl -ba app/(admin)/admin/page.tsx` | Inspect admin overview. | Passed. |
| `nl -ba app/(admin)/admin/posts/page.tsx` | Inspect admin content list. | Passed. |
| `nl -ba app/(admin)/admin/projects/page.tsx` | Inspect admin projects list page. | Passed. |
| `nl -ba app/(admin)/admin/site/page.tsx` | Inspect admin site settings page. | Passed. |
| `nl -ba components/admin/PostEditor.tsx` | Inspect post editor. | Passed. |
| `nl -ba components/admin/ProjectEditor.tsx` | Inspect project editor. | Passed. |
| `nl -ba components/admin/SiteForm.tsx` | Inspect site editor. | Passed. |
| `nl -ba components/Header.tsx` | Inspect public navigation. | Passed. |
| `nl -ba components/PostBody.tsx` | Inspect post body rendering. | Passed. |
| `nl -ba components/WikiBody.tsx` | Inspect wiki body rendering. | Passed. |
| `nl -ba components/ProjectBody.tsx` | Inspect project page rendering/log loading. | Passed. |
| `nl -ba app/globals.css` | Inspect global CSS. | Passed. |
| `nl -ba docs/architecture.md` | Inspect architecture docs. | Passed. |
| `nl -ba docs/troubleshooting.md` | Inspect troubleshooting docs. | Passed. |
| `nl -ba docs/blog-guide.md` | Inspect authoring guide. | Passed. |
| `nl -ba docs/project-log-spec.md` | Inspect project-log spec. | Passed. |
| `nl -ba install/README.md` | Inspect install kit docs. | Passed. |
| `nl -ba install/setup.sh` | Inspect install bootstrap script. | Passed. |
| `nl -ba install/hooks/stop-check.sh` | Inspect stop hook. | Passed. |
| `nl -ba scripts/propagate-hook.sh` | Inspect hook propagation script. | Passed. |
| `nl -ba scripts/sync-skip-markers.sh` | Inspect marker sync script. | Passed. |
| `nl -ba scripts/new-discussion.sh` | Inspect discussion stub script. | Passed. |
| `nl -ba lib/crosspost.ts` | Inspect crosspost integration. | Passed. |
| `nl -ba app/layout.tsx` | Inspect root layout/metadata. | Passed. |
| `nl -ba lib/site.ts` | Inspect site constants/types. | Passed. |
| `nl -ba content/site.json` | Inspect public site config. | Passed. |
| `nl -ba lib/i18n.ts` | Inspect localization helpers. | Passed. |
| `nl -ba app/(public)/layout.tsx` | Inspect public layout. | Passed. |
| `find app -path '*layout.tsx' -not -path './claude_review/*' -not -path './codex_review/*' -print` | Confirm available layout files. | Passed. |
| `find app lib components content docs install scripts public -type f -not -path './claude_review/*' -not -path './codex_review/*' \| wc -l` | Count reviewed project files. | Passed: 238. |
| `find app lib components -type f \| wc -l` | Count app/lib/component files. | Passed: 111. |
| `find content -type f \| wc -l` | Count content files. | Passed: 92. |
| `find app/api -type f -name 'route.ts' \| sort` | Inventory API routes. | Passed. |
| `find app -type f -name 'page.tsx' \| sort` | Inventory pages. | Passed. |
| `npm run typecheck -- --incremental false` | TypeScript verification without tsbuildinfo writes. | Passed. |
| `npm run lint` | Lint verification. | Passed, with `next lint` deprecation warning. |
| `npm audit --audit-level=moderate --omit=dev` | Production dependency audit. | Failed: 5 moderate vulnerabilities. |
| `npm ls dompurify js-yaml postcss gray-matter next` | Trace vulnerable dependency paths. | Passed. |
| `git ls-files .env.local .env.example` | Check env tracking. | Passed; only `.env.example` tracked. |
| `git check-ignore -v .env.local` | Confirm `.env.local` ignored. | Passed. |
| `nl -ba .gitignore` | Inspect ignore rules. | Passed. |
| `git status --short` | Check whether verification changed worktree. | Passed; only pre-existing dirty/untracked state plus review output directory. |
| `npm test` | Check test script. | Failed: missing `test` script. |
| `nl -ba lib/log-kinds.ts` | Inspect log kind definitions. | Passed. |
| `nl -ba app/(admin)/admin/analytics/page.tsx` | Inspect analytics placeholder. | Passed. |
| `nl -ba app/(admin)/admin/distribution/page.tsx` | Inspect distribution page. | Passed. |
| `nl -ba components/admin/DistributionChecklist.tsx` | Inspect distribution checklist. | Passed. |
| `nl -ba components/admin/AdminNav.tsx` | Inspect admin navigation. | Passed. |
| `nl -ba lib/readme.ts` | Inspect README rendering/sanitization. | Passed. |
| `nl -ba lib/architecture.ts` | Inspect architecture content loader. | Passed. |
| `nl -ba app/(public)/projects/[slug]/readme/page.tsx` | Inspect project README route. | Passed. |
| `nl -ba app/(public)/projects/[slug]/architecture/page.tsx` | Inspect project architecture route. | Passed. |
| `nl -ba app/(public)/projects/[slug]/log/[entry]/page.tsx` | Inspect project log detail route. | Passed. |
| `date '+%Y-%m-%d %H:%M:%S %Z'` | Capture report time. | Passed: `2026-06-18 13:15:01 EDT`. |
| `test -f codex_review/full/2026-06-18-1308/comprehensive-review.en.md` | Verify English report exists. | Passed. |
| `test -f codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Verify Korean report exists. | Passed. |
| `find codex_review/full/2026-06-18-1308 -maxdepth 1 -type f -print` | Verify only the two expected files are in the output directory. | Passed; listed English and Korean reports. |
| `rg -n "^### F-[0-9]{3}:" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Verify both reports contain F-001 through F-010 finding sections. | Passed. |
| `git status --short` | Verify final working tree status after report creation. | Passed; only pre-existing dirty/untracked paths plus `codex_review/`. |
| `rg -n "\\| F-[0-9]{3} \\|" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Verify Key Findings tables contain matching IDs, severities, categories, and confidence values. | Passed. |
| `rg -n "claude_review" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Verify reports explicitly state the `claude_review/` exclusion. | Passed. |

## Files Inspected

Important inspected files/directories:

- Root/config: `package.json`, `package-lock.json` via audit/ls, `README.md`, `.env.example`, `.gitignore`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`.
- App routes: `app/layout.tsx`, `app/(public)/**/page.tsx`, `app/(admin)/admin/**/page.tsx`, `app/api/**/route.ts`, `middleware.ts`.
- Libraries: `lib/auth.ts`, `lib/source.ts`, `lib/storage.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/github.ts`, `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/log-kinds.ts`, `lib/mdx.ts`, `lib/readme.ts`, `lib/architecture.ts`, `lib/crosspost.ts`, `lib/feed.ts`, `lib/i18n.ts`, `lib/slug.ts`.
- Components: `components/Header.tsx`, `components/PostBody.tsx`, `components/ProjectBody.tsx`, `components/WikiBody.tsx`, `components/Mermaid.tsx`, `components/admin/*.tsx`.
- Content/docs/scripts: `content/**`, `docs/architecture.md`, `docs/troubleshooting.md`, `docs/blog-guide.md`, `docs/project-log-spec.md`, `install/**`, `scripts/**`.

No files under `claude_review/` were read, inspected, summarized, or used.

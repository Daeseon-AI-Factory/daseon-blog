# Claude Comprehensive Repository Review

## Review Metadata

| Field | Value |
|---|---|
| Review date/time | 2026-05-30 23:23 (local, America/Toronto, UTC-04:00) |
| Git branch | `main` |
| HEAD commit | `2a9725b96fc6040207ecc56b8e24008cedeb72c8` — "Record skip markers for recent session commits [no-log]" |
| Working tree status | `M docs/troubleshooting.md` (pre-existing before this review; **not** modified by this task) |
| Output directory | `claude_review/full/2026-05-30-2323/` |
| Review type | Ad-hoc full-repository review (not a scheduled weekly/monthly run) |
| Method | 8 read-only dimension audits → independent adversarial verification of every finding → completeness critic. 43 subagents, all read-only (no edit/write capability). |
| `codex_review/` | Not present; not read, inspected, or used. |

**Independence statement:** This review used only the repository's own source code, configs, docs, tests, build/lint/typecheck output, and git metadata as evidence. No other model's review was read or relied upon. `codex_review/` was not consulted.

---

## Review Scope

**Inspected:** the full Next.js application — `app/` (public + admin routes, API route handlers), `lib/` (auth, storage, source, github, content loaders, i18n, feed, remark plugins), `components/` (public + admin), `content/` (posts, projects, knowledge, logs, notes, now, site.json), `middleware.ts`, build/lint/type configs (`next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `postcss.config.mjs`, `package.json`), `.env.example`, `.gitignore`, and `docs/`. Deterministic commands were run: `tsc --noEmit`, `next lint`, `next build`.

**Not inspected / not verified:** runtime behavior on Vercel (no live deploy was exercised); the actual values of secrets in `.env.local` (file is git-ignored and was not read); the external crosspost webhook receiver and the RAG consumer (separate projects, not in this repo); third-party library internals; `node_modules`. There is **no automated test suite** in the repository, so no test run was possible (see Testing Review).

---

## Executive Summary

**Verdict: partially production-ready.** The application builds cleanly (`next build` exits 0), passes `tsc --noEmit` with no errors, and passes `next lint` with no warnings. The architecture is sound and its two hard constraints are respected (no `fs.writeFile` reachable in production; no `"use client"` component imports `lib/source.ts`/`lib/storage.ts`). Auth, content loading, i18n, and admin form-state handling are generally well implemented.

**There are no Critical (production-blocker / unauthenticated-RCE / data-loss / broken-build) issues by the strict severity rubric.** The two genuine security findings (path traversal in `log-companion`, draft/private content exposure via the RAG manifest) are both gated behind admin authentication or a secret bearer token in a single-owner application, so they are rated **High**, not Critical — but they should still be fixed because the fixes are small and the failure modes are real.

The single most urgent item before sharing the site publicly is **content, not code**: a placeholder post `asdasd` (body: "asd") is published and live at `/posts/asdasd` (confirmed in the build route table). For a portfolio/job-hunting site, that is the highest-priority fix.

The remaining High items are small, well-scoped, and mostly defensive: an open-redirect on the login `from` parameter, a login 500-on-misconfig, missing `try/catch` in one route, a hardcoded `lang="en"` on Korean pages, and weak/absent env-var validation. None blocks the build; all are fixable in well under a day in total.

**Counts:** 0 Critical · 9 High · 6 Medium · 14 Low (29 distinct confirmed defects after de-duplication). 1 candidate finding was rejected on verification. The completeness critic found no additional concrete issues.

---

## Project Overview

A bilingual (English default, Korean secondary) personal blog + portfolio with a private, auth-gated admin dashboard, built on **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind**, deployed to Vercel. Distinctive design points:

- **GitHub-backed content store.** Content lives as MDX in the repo. Writes go through the GitHub Contents API via Octokit (`lib/storage.ts` → `lib/github.ts`); reads go through `fetch` to `raw.githubusercontent.com` with ISR caching (`lib/source.ts`), decoupling content lifecycle from the build (`docs/architecture.md`). This is necessary because the Vercel production filesystem is read-only.
- **Content types:** `post`, `note`, `knowledge` (rendered as `/wiki`), plus `project` and cross-repo `log` entries.
- **Auth:** env-based admin password + a `jose` HS256 JWT session cookie (`lib/auth.ts`), enforced by `middleware.ts` on `/admin/*` and `/api/admin/*`.
- **Integrations:** an optional crosspost webhook (HMAC-SHA256 signed) and an optional token-gated `/api/rag/manifest` endpoint intended to feed a RAG/crosspost bot.

Major components: public pages (`app/(public)`), admin pages (`app/(admin)`), API handlers (`app/api`), content libraries (`lib/`), and presentational components (`components/`).

---

## Key Findings Summary

| ID | Sev | Category | Title | Confidence |
|---|---|---|---|---|
| H1 | High | Security / Open redirect | Unvalidated `from` param echoed to `router.push` enables open redirect | High |
| H2 | High | Availability / Error handling | Login crashes (500) if `ADMIN_SESSION_SECRET` is missing/short | High |
| H3 | High | Security / Path traversal | `log-companion` writes files from unvalidated `project`/`slug` | High |
| H4 | High | Security / Data exposure | RAG manifest returns full body of draft + private content to token holder | High |
| H5 | High | Error handling | `log-companion` POST/DELETE lack `try/catch` (uncaught 500s) | High |
| H6 | High | Accessibility / SEO | Root layout hardcodes `lang="en"` for all `/ko/*` pages | High |
| H7 | High | Ops / Env validation | No runtime validation of `GITHUB_TOKEN`/`GITHUB_REPO`; silent local-FS fallback fails on Vercel | High |
| H8 | High | Ops / Env validation | `ADMIN_SESSION_SECRET` enforced at 16 chars, docs say 32+ | High |
| H9 | High | Content quality | Placeholder post `asdasd` is published and live at `/posts/asdasd` | High |
| M1 | Medium | Incomplete feature | `note` content type has no public route (orphaned) | High |
| M2 | Medium | Caching / SEO | Feed + sitemap not revalidated on post/project mutations | High |
| M3 | Medium | Partial failure | Crosspost webhook failure still returns `ok: true` | High |
| M4 | Medium | Correctness / Idempotency | `deleteFile` returns 500 (not 404/410) when file already gone | High |
| M5 | Medium | Ops / Env validation | Missing `ADMIN_PASSWORD` causes silent login failure | High |
| M6 | Medium | Ops / Config | `NEXT_PUBLIC_SITE_URL` falls back to hardcoded `https://daeseon.ai` | High |
| L1 | Low | Security hygiene | Logout cookie omits `sameSite` (auditor rated Medium; see note) | High |
| L2 | Low | Security | No session rotation/revocation; 30-day TTL | High |
| L3 | Low | Security / CSRF | `sameSite=lax` + no CSRF tokens (defense-in-depth) | Medium |
| L4 | Low | Security / Timing | Length check precedes constant-time compare (password + RAG token) | High |
| L5 | Low | Security / SSRF | Crosspost webhook URL unvalidated (env-controlled) | High |
| L6 | Low | Race condition | Get-SHA-before-PUT race → 500 on concurrent write (no data loss) | High |
| L7 | Low | API consistency | 409 vs 400 status inconsistency for duplicate slug | High |
| L8 | Low | Security headers | No CSP / security response headers | High |
| L9 | Low | Performance | Raw `<img>` (no `next/image`) in 2 spots | High |
| L10 | Low | Ops / Scaling | No `maxDuration` on `feed.xml` route (timeout risk at scale) | High |
| L11 | Low | Dependencies | Caret ranges; majors behind (lockfile mitigates) | High |
| L12 | Low | Docs | `README.md` is ~26 bytes | High |
| L13 | Low | Cleanup | Junk private note `content/notes/en/asdasd.mdx` | High |
| L14 | Low | Type safety | Redundant `as` cast on `locale` (well-guarded; informational) | Medium |

> **Severity notes / divergences from the raw audit, stated transparently:**
> - **H9 (`asdasd` post):** one dimension auditor rated this **Critical**. I rate it **High**: by the strict rubric, Critical is reserved for production blockers / security / data loss / broken builds, and a junk post does not make the app unusable. It is nonetheless the *highest-priority* fix before sharing the site (job-hunting/portfolio context).
> - **H3, H4 (path traversal, RAG exposure):** real security issues, but both require an authenticated admin or a secret token in a single-owner app, so rated High rather than Critical.
> - **L1 (logout `sameSite`):** the verifier kept Medium; I downgrade to **Low** because browsers default an omitted `sameSite` to `Lax`, which matches the login cookie's intent — so the practical impact is a consistency/maintenance hazard, not a functional bug.

---

## Critical Issues

**None.** No production blocker, no unauthenticated remote-code-execution, no data loss, no broken auth, and no broken build was found from the inspected evidence. `next build`, `tsc --noEmit`, and `next lint` all pass.

---

## High-Priority Issues

### H1 — Open redirect via unvalidated `from` parameter
- **Severity:** High · **Confidence:** High · **Category:** Security / Open redirect
- **Evidence:** `app/api/auth/login/route.ts:17` returns `{ ok: true, redirect: body.from ?? "/admin" }` with no validation of `body.from`; `components/admin/LoginForm.tsx:27` calls `router.push(data.redirect ?? "/admin")`; `app/(admin)/admin/login/page.tsx:12,17` passes the raw `from` query param into `<LoginForm from={from} />`.
- **What is wrong:** The `from` value flows unvalidated from the login URL query → `LoginForm` → POST body → echoed back → `router.push`. An attacker can craft `/admin/login?from=https://evil.com`. `middleware.ts:22` only ever sets `from` to a relative pathname, but that single control point is bypassable by POSTing directly or by crafting the URL.
- **Why it matters:** After a successful login (victim must enter the correct password), the browser is redirected to an attacker-controlled URL — a phishing/credential-harvest vector. Narrow in a single-admin app (the target is the owner), but trivial to fix.
- **Recommended fix:** Accept only same-origin relative paths: `const safe = typeof body.from === "string" && body.from.startsWith("/") && !body.from.startsWith("//") ? body.from : "/admin";` return `safe`.

### H2 — Login endpoint crashes (500) if `ADMIN_SESSION_SECRET` is misconfigured
- **Severity:** High · **Confidence:** High · **Category:** Availability / Error handling
- **Evidence:** `app/api/auth/login/route.ts:16` `const token = await createSessionToken();` has no `try/catch`; `lib/auth.ts:9-12` `secret()` throws `Error("ADMIN_SESSION_SECRET must be set ...")` when the env var is missing or `< 16` chars, and `createSessionToken()` (`lib/auth.ts:19-25`) calls `secret()`.
- **What is wrong:** A correct password followed by token creation throws an unhandled exception, returning a generic 500. `middleware.ts` handles the verify path gracefully (`verifySessionToken` catches), but the login/create path does not.
- **Why it matters:** A misconfigured production environment makes admin login fail with an opaque 500 rather than a clear error — a self-inflicted availability/DoS of the admin panel.
- **Recommended fix:** Wrap `createSessionToken()` in `try/catch` returning `{ ok: false, error: "Server misconfigured" }` with status 500, and/or validate `ADMIN_SESSION_SECRET` at startup.

### H3 — Path traversal in `/api/admin/log-companion` via unvalidated `project`/`slug`
- **Severity:** High · **Confidence:** High · **Category:** Security / Path traversal (consolidates the path-traversal and missing-validation findings for this route)
- **Evidence:** `app/api/admin/log-companion/route.ts:24` destructures `{ project, slug, body }`; the only guard is `if (!project || !slug || typeof body !== "string")` (line 24, presence only). These flow to `saveHumanCompanion()`, which builds `lib/storage.ts:122` `` const rel = `content/logs/${project}/${slug}.human.mdx`; `` and `lib/storage.ts:129` `path.join(process.cwd(), rel)`. `path.join` resolves `..`. Contrast `isValidSlug()` (`lib/slug.ts:14` regex `/^[a-z0-9ㄱ-힝]+(?:-[a-z0-9ㄱ-힝]+)*$/`) which the posts/projects routes apply but this route does not.
- **What is wrong:** An authenticated admin can supply `project="../../something"` to write/commit a `.human.mdx` file outside `content/logs/`.
- **Why it matters:** Arbitrary-path file write in the repo (and, in production, an arbitrary GitHub commit). Constrained to authenticated admins — in a single-owner app, that is the owner — so this is insider-misuse/footgun rather than external RCE, hence High not Critical.
- **Recommended fix:** Validate both `project` and `slug` with `isValidSlug()` (or a `/^[a-z0-9_-]+$/` check) and reject with 400 before any path construction, in both the POST and DELETE handlers.

### H4 — RAG manifest exposes full body of draft and private content to any token holder
- **Severity:** High · **Confidence:** High · **Category:** Security / Data exposure
- **Evidence:** `app/api/rag/manifest/route.ts:36` `const all = await getAllContentAcrossTypes();` (no visibility/status filter); line ~43 computes `isPublic` only to decide the `url` field (line ~60 `url: isPublic ? ... : null`), but line ~63 returns `content: p.content` **unconditionally** for every item, and lines ~49-50 also expose `visibility`/`status`.
- **What is wrong:** With a valid `RAG_API_TOKEN`, a caller receives the full text of draft posts, `private` notes, and all knowledge entries — including the junk private note `content/notes/en/asdasd.mdx`. The `isPublic` gate only nulls the URL; it does not withhold the body.
- **Why it matters:** A leaked/compromised RAG token, or an over-broad RAG consumer, exposes unpublished writing. The endpoint's purpose (feed *public* content to a crosspost/RAG bot) clearly should not include private material.
- **Recommended fix:** Filter to public/published items before serializing (e.g. drop `status === "draft"`, `visibility !== "public"`), or return only metadata for non-public items.

### H5 — `log-companion` POST/DELETE lack `try/catch` (uncaught 500s)
- **Severity:** High · **Confidence:** High · **Category:** Error handling
- **Evidence:** `app/api/admin/log-companion/route.ts` POST (lines ~30-37) and DELETE (lines ~50-56) call `saveHumanCompanion()`/`deleteHumanCompanion()` with no `try/catch`. Those call `commitFile`/`deleteFile` (`lib/github.ts`), which throw on Octokit/network errors and on `Path is not a file` (`lib/github.ts:122`). Every other admin route (e.g. `app/api/admin/posts/route.ts:97-128`) wraps its storage call in `try/catch` and returns `{ ok: false, error }`.
- **What is wrong:** A GitHub/network failure in this route surfaces as an unstructured 500 with an unhandled rejection, inconsistent with the rest of the API.
- **Why it matters:** No structured error to the admin UI; noisy server logs; harder recovery. Pairs with H3 — this route is the weakest-validated and weakest-handled of the admin surface.
- **Recommended fix:** Wrap both handlers' storage calls in `try/catch` matching the posts/projects pattern.

### H6 — Korean pages are served with `lang="en"`
- **Severity:** High · **Confidence:** High · **Category:** Accessibility / SEO
- **Evidence:** `app/layout.tsx:35` `<html lang="en" suppressHydrationWarning>`. There is no `app/(public)/ko/layout.tsx` (only the root layout can render `<html>` in App Router), and `/ko/*` page components only pass a `locale="ko"` prop to children, which cannot change the `<html lang>` attribute. The metadata `alternates.languages` only emits `hreflang` link tags, not the document `lang`.
- **What is wrong:** Every `/ko/*` route declares English as its language.
- **Why it matters:** Screen-reader pronunciation, browser translation heuristics, and search engines all key off `lang`; Korean content mislabeled as English degrades accessibility and i18n SEO — directly relevant for a bilingual site.
- **Recommended fix:** Set `lang` per locale. Options: a route-group layout that renders `<html lang>` per segment, or compute `lang` from the pathname/segment in the root layout, or adopt Next.js i18n routing.

### H7 — No runtime validation of `GITHUB_TOKEN`/`GITHUB_REPO`; silent local-FS fallback fails on Vercel
- **Severity:** High · **Confidence:** High · **Category:** Ops / Env validation
- **Evidence:** `lib/github.ts:9-16` `repoConfig()` returns `null` if `GITHUB_REPO`/token are missing; `lib/source.ts:23-32` does the same. Write errors only throw at call time (`lib/github.ts:45,113`). `lib/storage.ts:48` comment: `"Vercel production is read-only — never reach here in prod"` — an operational assumption, not an enforced guarantee.
- **What is wrong:** A production deploy missing the GitHub vars silently falls back to local-filesystem paths, which then fail (read-only FS / EROFS, per `docs/troubleshooting.md`) at the first write — surfacing as a runtime 500 rather than a clear boot-time configuration error.
- **Why it matters:** Misconfiguration manifests as confusing intermittent 500s instead of a fail-fast signal. This is the operational counterpart to H2/M5.
- **Recommended fix:** Add a boot-time/first-request assertion: when `NODE_ENV === "production"`, require `GITHUB_TOKEN` and `GITHUB_REPO` (and fail loudly if absent) rather than relying on the read-only-FS side effect.

### H8 — `ADMIN_SESSION_SECRET` enforced at 16 chars while docs/error say 32+
- **Severity:** High · **Confidence:** High · **Category:** Ops / Env validation
- **Evidence:** `lib/auth.ts:9` `if (!raw || raw.length < 16)` but the thrown message says `"32+ char random string"` and `.env.example:5` says `replace-with-a-32+character-random-string`.
- **What is wrong:** The HS256 signing key may be as short as 16 chars (128 bits) while the documentation promises 256-bit-class entropy. Per RFC 7518, HMAC-SHA256 keys should be ≥ 256 bits.
- **Why it matters:** A weaker-than-documented JWT secret reduces the safety margin against session-token forgery. Low likelihood (the owner controls the secret) but a real contradiction between code and contract.
- **Recommended fix:** Change the check to `< 32` to match the documented minimum (or update the docs/message if 16 is intentional — but matching up is safer).

### H9 — Placeholder post `asdasd` is published and publicly live
- **Severity:** High (one auditor: Critical) · **Confidence:** High · **Category:** Content quality
- **Evidence:** `content/posts/en/asdasd.mdx` frontmatter: `title: asdasd`, `status: published`, `visibility: public`, body `asd`. `lib/posts.ts:111-118` `isPublic()` returns true (public + not draft), so `getPublishedPosts()` includes it; `app/(public)/posts/[slug]/page.tsx:11-14` generates its static params. **Independently confirmed by `next build`:** the route table lists `/posts/asdasd` as a prerendered (SSG) page.
- **What is wrong:** A nonsense placeholder post is live, indexed in the post list, sitemap, and RSS feed.
- **Why it matters:** This is a portfolio / job-hunting site; a junk post on the public surface is the most reputationally damaging item found, even though it is not a technical blocker.
- **Recommended fix:** Delete `content/posts/en/asdasd.mdx` or set `status: draft` / `visibility: private`.

---

## Medium-Priority Issues

### M1 — `note` content type has no public route (orphaned feature)
- **Severity:** Medium · **Confidence:** High · **Category:** Incomplete feature
- **Evidence:** `lib/posts.ts:7` `type ContentType = "post" | "note" | "knowledge"`; `lib/posts.ts` `TYPE_DIRS.note = "notes"`; admin supports creation (`app/(admin)/admin/posts/page.tsx` "+ Note" → `/admin/posts/new?type=note`). No `app/(public)/notes` route exists; `app/sitemap.ts` and `lib/feed.ts` only use `getPublishedPosts()` (post type only). Confirmed by `next build`: no `/notes` route in the route table. `note` defaults to `visibility: private` (`lib/posts.ts:50`).
- **What is wrong:** Notes can be created and stored but have no public surface. Either it is an intentional private scratchpad (then the admin "+ Note" affordance is misleading) or an unfinished feature.
- **Why it matters:** Ambiguous/unreachable feature; risk of authoring content that silently goes nowhere. (Rated Medium rather than the auditor's High: nothing breaks; it is an incompleteness, not a defect.)
- **Recommended fix:** Decide intent — either add `/notes/[slug]` (EN+KO) with visibility filtering, or remove the `note` type and its admin affordance, and document the decision in `CLAUDE.md`.

### M2 — Feed and sitemap not revalidated on content mutations
- **Severity:** Medium · **Confidence:** High · **Category:** Caching / SEO
- **Evidence:** Post/project create/update/delete handlers call `revalidatePath` for home/list/detail (e.g. `app/api/admin/posts/route.ts:100-104`) but never for `/feed.xml`, `/ko/feed.xml`, or the sitemap. `app/(public)/feed.xml/route.ts:3` `export const revalidate = 3600` (1-hour ISR); `app/sitemap.ts` has no `revalidate` (static at build).
- **What is wrong:** New/edited/deleted posts can be missing from or stale in the RSS feeds for up to an hour, and absent from the sitemap until the next redeploy.
- **Why it matters:** Feed subscribers and search engines see stale discovery surfaces — relevant to the site's distribution/SEO goals.
- **Recommended fix:** Add `revalidatePath("/feed.xml")` and `revalidatePath("/ko/feed.xml")` to all mutation handlers; make the sitemap dynamic (add `revalidate`) or revalidate it on mutation. *(Note: confirm `revalidatePath` invalidates the time-based ISR route as intended in your Next version; otherwise switch the feeds to tag-based revalidation with `revalidateTag`.)*

### M3 — Crosspost webhook failure still returns `ok: true`
- **Severity:** Medium · **Confidence:** High · **Category:** Partial failure handling
- **Evidence:** `app/api/admin/posts/route.ts:106-118` (and the PUT analog) call `notifyCrosspost()` after a successful commit; `lib/crosspost.ts:50-55` catches all errors and returns `{ status: "error", ... }`. The route returns `{ ok: true, ..., crosspost: crosspostResult }` with HTTP 200 even when the webhook failed.
- **What is wrong:** The commit succeeds but the cross-post never fires, while the response says `ok: true`.
- **Why it matters:** The admin may believe distribution succeeded when it silently did not. Misleading for the planned crosspost workflow.
- **Recommended fix:** Surface the webhook status distinctly in the UI (it is already present in the payload as `crosspost.status`), and/or treat a webhook error as a non-fatal warning shown to the user rather than swallowed.

### M4 — `deleteFile` returns 500 (not 404/410) when the file is already gone
- **Severity:** Medium · **Confidence:** High · **Category:** Correctness / Idempotency
- **Evidence:** `lib/github.ts:115` `getContent()` in `deleteFile` is not wrapped in `try/catch`; a missing file throws 404 from Octokit, which propagates through `lib/storage.ts:69` to the DELETE handler (`app/api/admin/posts/[locale]/[slug]/route.ts:158-159`) which returns a generic 500. The local-FS path deliberately swallows missing-file errors (`lib/storage.ts:75-79`), and `commitRaw` already handles 404 (`lib/github.ts:60` `if (status !== 404) throw err`).
- **What is wrong:** Deleting an already-deleted file errors with 500 instead of succeeding idempotently (or returning 404/410).
- **Why it matters:** Breaks DELETE idempotency; retries and monitoring see false 500s.
- **Recommended fix:** Catch the 404 in `deleteFile` and either succeed silently (matching the local-FS behavior) or surface a 404/410 to the handler.

### M5 — Missing `ADMIN_PASSWORD` causes silent login failure
- **Severity:** Medium · **Confidence:** High · **Category:** Ops / Env validation
- **Evidence:** `lib/auth.ts:48-49` `passwordMatches()` returns `false` when `ADMIN_PASSWORD` is unset — no error, no log. Contrast `secret()` (`lib/auth.ts:9-12`) which throws for a missing secret.
- **What is wrong:** With no admin password configured, every login attempt is rejected as "Invalid password" with no indication that the env var is missing.
- **Why it matters:** Hard-to-diagnose operational failure; inconsistent with the secret's fail-fast handling.
- **Recommended fix:** Throw or log a clear startup/first-use error when `ADMIN_PASSWORD` is unset in production.

### M6 — `NEXT_PUBLIC_SITE_URL` falls back to a hardcoded domain
- **Severity:** Medium · **Confidence:** High · **Category:** Ops / Config (auditor: High; downgraded — single-owner, fallback matches the real domain)
- **Evidence:** `lib/site.ts:30` `url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://daeseon.ai"`, consumed by `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx` `metadataBase`, and canonical/hreflang URLs.
- **What is wrong:** A deploy without `NEXT_PUBLIC_SITE_URL` set silently emits SEO metadata, canonicals, sitemap, and robots pointing at `daeseon.ai` regardless of the actual host.
- **Why it matters:** Breaks staging/preview deploys and would become a configuration trap if the project is ever reused as a template. Low impact on the single production domain today.
- **Recommended fix:** Require the env var in production (throw if missing) or document the fallback as production-only.

---

## Low-Priority Issues

- **L1 — Logout cookie omits `sameSite`.** `app/api/auth/logout/route.ts:6-12` clears the cookie without `sameSite`, while login uses `adminCookieOptions()` with `sameSite: "lax"` (`lib/auth.ts:40`). Browsers default omitted `sameSite` to `Lax`, so behavior matches today; the risk is a future drift if `adminCookieOptions()` changes. *(Auditor rated Medium; downgraded to Low.)* **Fix:** reuse the shared cookie options on logout. Confidence: High.
- **L2 — No session rotation/revocation; 30-day TTL.** `lib/auth.ts:5` `SESSION_TTL_SECONDS = 30 days`; `createSessionToken` does not invalidate prior tokens and `verifySessionToken` only checks signature+expiry; logout clears the cookie client-side only. A stolen token stays valid up to 30 days. **Fix:** shorten TTL and/or add a `loginAt`/version claim checked server-side. Confidence: High.
- **L3 — `sameSite=lax` + no CSRF tokens.** `lib/auth.ts:40`; admin mutations are JSON `fetch` with no CSRF token. Not exploitable for JSON APIs (cross-origin `fetch` does not send the cookie; form posts cannot send JSON), so this is defense-in-depth. **Fix:** consider `sameSite: "strict"` and/or CSRF tokens. Confidence: Medium.
- **L4 — Length check precedes constant-time compare (two places).** `lib/auth.ts:50` (`passwordMatches`) and `app/api/rag/manifest/route.ts:19` (RAG bearer) both early-return on length mismatch before the XOR loop, leaking length via timing. The login path masks this with a fixed 400ms delay (`app/api/auth/login/route.ts:13`); the RAG path has no such delay, but high-entropy tokens + network jitter make exploitation impractical. **Fix:** use `crypto.timingSafeEqual` on equal-length buffers. Confidence: High.
- **L5 — SSRF: crosspost webhook URL unvalidated.** `lib/crosspost.ts:15,51` fetches `CROSSPOST_WEBHOOK_URL` with no scheme/host validation or timeout. Env-controlled, not user input, so low risk. **Fix:** require HTTPS, reject private-IP hosts, add a fetch timeout. Confidence: High.
- **L6 — Get-SHA-before-PUT race.** `lib/github.ts:49-71` reads SHA then writes; a concurrent commit yields a 409 that is not specifically handled (caught generically as 500 by the API layer — no data loss, the competing write wins). **Fix:** catch 409 and retry with fresh SHA or return a friendly conflict message. Confidence: High.
- **L7 — 409 vs 400 status inconsistency.** Duplicate-slug returns 409 (`app/api/admin/posts/route.ts:71`) while other validation errors return 400; clients (`PostEditor.tsx:196-204`) treat all non-2xx identically. Cosmetic. **Fix:** document or normalize. Confidence: High.
- **L8 — No CSP / security headers.** `next.config.mjs` has no `headers()`; `middleware.ts` sets none; no CSP/X-Frame-Options/X-Content-Type-Options anywhere. **Fix:** add a `headers()` config or middleware to set baseline security headers. Confidence: High.
- **L9 — Raw `<img>` without `next/image`.** `app/(public)/about/page.tsx:154` and `components/admin/SiteForm.tsx:62` (+ `PostEditor.tsx:475`, `Avatar.tsx:14`) use `<img>` with `eslint-disable`. Reasonable for dynamic/uploaded URLs; misses lazy-load/responsive optimization on the public about page. **Fix:** add `loading="lazy"` + explicit dimensions, or `next/image` where the source is static. Confidence: High.
- **L10 — No `maxDuration` on `feed.xml`.** `app/(public)/feed.xml/route.ts` exports only `revalidate`; `buildFeed()` iterates all posts with no pagination. Negligible at the current ~3 posts; a theoretical Vercel-10s-timeout risk at scale. **Fix:** add `export const maxDuration = 30` and/or cache. Confidence: High.
- **L11 — Caret dependency ranges; majors behind.** `package.json` uses `^` throughout; `next` 15→16, `tailwindcss` 3→4, `typescript` 5→6, etc. are available. The committed `package-lock.json` + Vercel `npm ci` pin actual installs, so the practical risk is low. **Fix:** keep the lockfile committed; schedule deliberate major upgrades. Confidence: High.
- **L12 — `README.md` ~26 bytes.** Only `# daseon-blog\ndaseon-blog`. Most project info lives in `CLAUDE.md` + `docs/`, so impact is low, but a near-empty README is a poor first impression on a portfolio repo. **Fix:** write a short README (purpose, stack, run, deploy). Confidence: High.
- **L13 — Junk private note `content/notes/en/asdasd.mdx`.** `visibility: private`, body `asdasd`; not publicly reachable but clutters content and is exposed via the RAG manifest (see H4). **Fix:** delete it. Confidence: High.
- **L14 — Redundant `as` cast on `locale` (informational).** `app/api/admin/posts/route.ts:65` / `projects/route.ts:47` cast after an `isLocale()` type guard (`lib/i18n.ts:5-7`) that already narrows the type, so the cast is redundant, not unsafe. **Fix:** optional — drop the cast. Confidence: Medium.

---

## Product Completeness Review

The core authoring → publish → render loop is complete and works end-to-end for the `post`, `project`, `knowledge`, and `log` types: admin editors POST to API routes, which commit via GitHub and revalidate the relevant paths; public routes render via ISR'd GitHub-raw fetches. `next build` produced static/SSG pages for all of these (route table confirms `/posts/[slug]`, `/projects/[slug]`, `/wiki/[slug]`, tag pages, feeds, sitemap, robots).

Gaps:
- **Junk content on the live surface (H9, L13):** the `asdasd` post and private note are placeholder artifacts; the post is publicly live.
- **Orphaned `note` type (M1):** creatable in admin, unreachable publicly.
- **Documented-incomplete features:** the **analytics page is a placeholder** (verified — it does not render real data, consistent with the project log), and the **distribution checklist persists only to `localStorage`** (`components/admin/DistributionChecklist.tsx`), so its state is per-browser/per-device and does not survive a different device or storage clear. These match the v1 scope in `CLAUDE.md` but are worth noting as "not yet real."
- All `project` files carry the required `url` frontmatter (the `CLAUDE.md` hard rule) — verified across `content/projects/{en,ko}`.

---

## Architecture Review

The build-vs-runtime split (`docs/architecture.md`) is implemented faithfully and is the strongest part of the codebase. Reads (`lib/source.ts`) and writes (`lib/storage.ts` → `lib/github.ts`) are cleanly separated; the GitHub-first-with-local-fallback strategy and ISR caching are coherent. Both hard constraints hold:

- **No `fs.writeFile` reachable in production** — writes go through Octokit; the local-FS branch is guarded by an operational assumption (see H7 for the gap: it is not *enforced*).
- **No `"use client"` component imports `lib/source.ts`/`lib/storage.ts`** — verified for the public client components (`Mermaid.tsx`, `LogTimeline.tsx`) and the admin client components; none pull server-only modules into the client bundle (this is the `node:` URI bundling constraint from `troubleshooting.md`).

Module boundaries are otherwise clean: content loaders in `lib/`, presentational components in `components/`, route handlers thin over the storage layer. The main architectural soft spots are operational, not structural: configuration is read ad hoc from `process.env` across `lib/auth.ts`, `lib/github.ts`, `lib/source.ts`, `lib/site.ts`, `lib/crosspost.ts` with inconsistent validation (some throw, some return null, some silently default) — see H2, H7, H8, M5, M6. A single typed config module that validates all env at boot would remove that whole class of issue.

---

## Security Review

**Auth core is solid.** `middleware.ts` correctly gates `/admin/*` and `/api/admin/*`, exempts `/admin/login`, returns 401 JSON for API and redirects for pages; the JWT algorithm is pinned to HS256; cookies are `httpOnly` and `secure` in production; admin routes correctly rely on middleware without redundant checks; the RAG token and password comparisons use a constant-time XOR core. The upload route is **well defended** — `isLocale` + `isValidSlug` + a type whitelist + `sanitizeBase()` filename sanitization (the one path-traversal candidate raised against it was **rejected** on verification).

**Real issues** cluster in three places:
- **`/api/admin/log-companion`** is the weakest admin endpoint: no input validation (H3 path traversal) and no error handling (H5).
- **`/api/rag/manifest`** leaks unpublished content bodies to any token holder (H4).
- **Login flow**: open redirect (H1) and a 500-on-misconfig (H2).

**Lower-risk hygiene:** session TTL/rotation (L2), CSRF defense-in-depth (L3), timing-channel length checks (L4), SSRF on the env webhook (L5), and missing security headers (L8). Secrets handling is correct: `.env.local` is git-ignored and untracked; only `.env.example` (with placeholders) is committed; no secrets appear in source.

---

## Data and API Review

The admin API is consistent and reasonably validated for posts and projects (locale/slug/title/body checks, 400/409 statuses, `try/catch` with `{ ok, error }` envelopes). Weaknesses:
- **Validation/handling gaps** isolated to `log-companion` (H3, H5).
- **Revalidation coverage** misses feeds and sitemap (M2).
- **Partial-failure semantics**: webhook errors are swallowed into `ok: true` (M3); delete is non-idempotent on missing files (M4); concurrent writes race to a 500 (L6).
- **Status-code consistency** is cosmetic (L7).

The GitHub Contents API usage (get-SHA-then-PUT, base64 content, commit messages) is correct; the only data-integrity concern is the unhandled 409 race (L6), which fails safe (no clobber, no data loss). No SQL/ORM/migrations exist — content is the "database," versioned in git, which sidesteps a large class of schema/migration risk.

---

## Frontend and UX Review

**Public:** Next 15 async `params` are awaited correctly throughout; dynamic routes call `notFound()` for missing/draft/private slugs; `generateMetadata` emits canonical + `hreflang` alternates for both locales; images carry `alt` text; heading structure is present. The one real defect is **H6 (`lang="en"` on Korean pages)**. Minor: `next/image` not used in a couple of spots (L9).

**Admin:** form-state handling is a strong point — components use explicit error/loading/success states, disable submit buttons during in-flight requests (preventing double-submit in `PostEditor`), surface API errors to the user via an `err`-toned feedback area, and the `DistributionChecklist` initializes empty then loads from `localStorage` in `useEffect` to avoid hydration mismatch. The intentional sequential upload (`no-await-in-loop` with an `eslint-disable` and a comment) is deliberate. The notable UX gaps are product-level: the analytics page is a placeholder, and distribution state is `localStorage`-only (per-device) — see Product Completeness.

No accessibility blockers beyond H6 were found; no empty/loading/error-state omissions were found on the inspected pages.

---

## Testing Review

**There is no automated test suite.** `package.json` defines no `test` script; there is no test runner (Jest/Vitest/Playwright) in dependencies and no `*.test.*`/`*.spec.*`/`__tests__` files in the repo. The only automated guards are `tsc --noEmit` and `next lint` (both passing) and the build.

Given the GitHub-backed, mostly-static architecture this is defensible for v1, but the highest-value tests to add — small and targeted — are:
1. **Auth unit tests:** `passwordMatches` (length mismatch, equal-length mismatch, exact match, missing env), `verifySessionToken` (valid/expired/tampered/wrong-secret), and the open-redirect guard once H1 is fixed.
2. **Path/slug validation:** `isValidSlug` and the `log-companion` `project`/`slug` guards (H3) — table-driven, including traversal inputs.
3. **Content loaders:** `getPublishedPosts` visibility/draft filtering (would have caught H9), `translationKey` pairing, and the project `url`-required filter.
4. **RAG manifest:** assert draft/private bodies are not returned (H4).
5. A minimal **smoke build/route test** in CI.

---

## Performance and Scalability Review

For a personal blog at current scale (~3 posts, 5 projects, 4 wiki terms), performance is a non-issue and the build confirms small first-load JS (~103 kB shared). The relevant scaling considerations are all minor and forward-looking:
- **Feed/sitemap generation** iterates all content unpaginated with no `maxDuration` (L10) — fine now, worth bounding before content grows large or if GitHub-raw latency spikes.
- **ISR + `revalidatePath`** caching is well-designed; the one gap is feed/sitemap invalidation (M2).
- **GitHub-raw fetch per render** is bounded by ISR (`revalidate: 30`) — appropriate.
- **Image optimization** (L9) is the only client-perf item, and it is minor.

No N+1 patterns, unbounded loops, or heavy synchronous work were found in the request path.

---

## Deployment and Operations Review

**Build/CI:** `next build`, `tsc --noEmit`, `next lint` all pass; the committed `package-lock.json` + Vercel `npm ci` give reproducible installs (L11 mitigated).

**The operational risk is configuration, not code.** Env handling is inconsistent and under-validated:
- `GITHUB_TOKEN`/`GITHUB_REPO` missing → silent fallback that fails on Vercel's read-only FS (H7).
- `ADMIN_SESSION_SECRET` missing → login 500 (H2); accepted at 16 chars vs documented 32 (H8).
- `ADMIN_PASSWORD` missing → silent login failure (M5).
- `NEXT_PUBLIC_SITE_URL` missing → hardcoded domain in all SEO surfaces (M6).

A single boot-time config validator (e.g. a typed schema in `lib/`) would convert all of these from latent runtime surprises into fail-fast startup errors. **Observability** is minimal: no structured logging, error tracking (e.g. Sentry), or analytics wiring beyond the placeholder admin page — acceptable for v1 but worth a note. **Security headers** are absent (L8).

---

## Maintainability Review

Code is consistently styled, typed, and small-module-organized; naming is clear; the `lib/` separation is good. Duplication is low and mostly intentional (parallel EN/KO route trees). The notable maintainability themes:
- **Config access is scattered** across modules with three different missing-value behaviors (throw / null / default) — centralizing would reduce H2/H7/H8/M5/M6 to one well-tested module.
- **Cookie options are duplicated** between login (shared helper) and logout (inline) — L1 is a symptom; reuse the helper.
- **Validation is applied inconsistently** — `isValidSlug` guards posts/projects but not `log-companion` (H3).
- **No tests** means refactors rely on `tsc` + manual checking (see Testing Review).

None of these are structural debt; they are convergence opportunities. The project log discipline (`docs/troubleshooting.md` + `content/logs/`) is a genuine maintainability asset.

---

## Recommended Fix Plan

**Must-fix before sharing the site publicly (fast, high-value):**
1. **H9** — delete/unpublish `content/posts/en/asdasd.mdx` (and **L13** the junk note). *(minutes)*
2. **H6** — set `lang` per locale on `/ko/*`. *(small)*
3. **H1** — validate the login `from` redirect to same-origin paths only. *(small)*
4. **H3 + H5** — add `isValidSlug` validation **and** `try/catch` to `log-companion` POST/DELETE. *(small)*
5. **H4** — filter draft/private content out of the RAG manifest body. *(small)*

**Before/at production hardening:**
6. **H2, H7, H8, M5, M6** — introduce one boot-time env validator; fix the 16→32 secret length and the `GITHUB_*`/`ADMIN_PASSWORD`/`SITE_URL` cases together. *(small-medium)*
7. **M2** — revalidate feeds + sitemap on mutations. *(small)*
8. **M3, M4** — surface webhook failures to the UI; make delete idempotent on 404. *(small)*

**Later / nice-to-have:**
9. **M1** — decide and document the `note` type (route it or remove it).
10. **L2–L12** — session TTL/rotation, CSRF strict + tokens, `timingSafeEqual`, SSRF guard, 409 retry, security headers, `next/image`, `maxDuration`, dependency upgrade cadence, README.
11. Add the targeted test suite from the Testing Review (start with auth + validation + loader filtering).

---

## Assumptions and Not Verified

- **Runtime/production behavior on Vercel was not exercised** — findings about read-only-FS failure (H7) and the architecture are inferred from code + `docs/architecture.md` + `docs/troubleshooting.md`, not from a live deploy.
- **Secret values were not read** — `.env.local` is git-ignored and was not opened; env-validation findings are about the *code paths*, not the actual deployed values.
- **`router.push` external-navigation behavior (H1):** the open-redirect chain is verified by code reading; the exact client-navigation outcome of `router.push("https://…")` depends on the Next.js/React runtime version and was not exercised in a browser. The fix is warranted regardless.
- **`revalidatePath` vs time-based ISR (M2):** whether `revalidatePath` fully purges the `revalidate = 3600` feed route in this Next version was not runtime-verified; the staleness gap is real either way (the sitemap is static).
- **External services** (crosspost webhook receiver, RAG consumer) are out of repo and were not assessed.
- **`note` type intent (M1):** whether notes are an intentional private store or an unfinished feature could not be determined from the repo; flagged for the owner to decide.
- **One rejected candidate:** an upload-route path-traversal claim was raised and then **rejected** on verification (validation is comprehensive — see below); it is intentionally excluded from the findings.

---

## Commands Run

| Command | Purpose | Result |
|---|---|---|
| `date "+%Y-%m-%d-%H%M"` | Output-dir timestamp | Passed (`2026-05-30-2323`) |
| `git branch --show-current`, `git rev-parse HEAD`, `git log -1`, `git status` | Review metadata | Passed |
| `ls -la`, `find … (source files)` | Repository structure | Passed |
| `npm run typecheck` (`tsc --noEmit`) | Type correctness | **Passed** (exit 0, no errors) |
| `npm run lint` (`next lint`) | Lint | **Passed** (no warnings/errors; `next lint` deprecation notice only) |
| `npm run build` (`next build`) | Production build + route table | **Passed** (exit 0); confirmed `/posts/asdasd` is SSG-prerendered and no `/notes` route exists |
| `grep -niE "TODO\|FIXME\|HACK\|@ts-ignore\|eslint-disable" …` | Known-issue / suppression markers | Passed (only `eslint-disable` for `<img>` and the intentional `no-await-in-loop`) |
| `cat .env.example`, `cat .gitignore`, `git ls-files \| grep .env` | Secrets/env hygiene | Passed (only `.env.example` tracked; `.env.local` ignored) |
| `mkdir -p claude_review/full/2026-05-30-2323` | Create output dir | Passed |
| `git status --short` (post-setup) | Confirm no source modified | Passed (only pre-existing `M docs/troubleshooting.md`) |
| Workflow `full-repo-review` (43 read-only subagents) | 8-dimension audit + adversarial verification + completeness critic | Completed (34 raw → 33 confirmed/downgraded, 1 rejected, 0 new) |

No tests were run because the repository contains no test suite. No dependencies were installed; no lockfile or package-manager state was changed; no destructive commands were run.

---

## Files Inspected

**Read directly by the reviewer:** `docs/architecture.md`, `lib/auth.ts`, `middleware.ts`, `package.json`, `.env.example`, `.gitignore`, the `next build` route table, plus repository structure.

**Inspected by the read-only audit subagents (with line-level evidence quoted in findings):**
- **Auth/security:** `lib/auth.ts`, `middleware.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `components/admin/LoginForm.tsx`, `app/(admin)/admin/login/page.tsx`, `app/(admin)/admin/layout.tsx`.
- **API/storage:** `app/api/admin/posts/route.ts`, `app/api/admin/posts/[locale]/[slug]/route.ts`, `app/api/admin/projects/route.ts`, `app/api/admin/projects/[locale]/[slug]/route.ts`, `app/api/admin/site/route.ts`, `app/api/admin/upload/route.ts`, `app/api/admin/log-companion/route.ts`, `app/api/rag/manifest/route.ts`, `lib/storage.ts`, `lib/source.ts`, `lib/github.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/serialize-mdx.ts`, `lib/mdx.ts`, `lib/crosspost.ts`, `lib/slug.ts`.
- **Content/i18n:** `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/i18n.ts`, `lib/format.ts`, `lib/feed.ts`, `lib/now.ts`, `lib/site.ts`, `lib/log-kinds.ts`, `lib/remark-wiki-link.ts`, `lib/remark-mermaid.ts`, `app/(public)/feed.xml/route.ts`, `app/(public)/ko/feed.xml/route.ts`, `app/sitemap.ts`, `app/robots.ts`.
- **Public frontend:** `app/layout.tsx`, `app/(public)/layout.tsx`, `app/(public)/page.tsx` and `posts`/`projects`/`wiki`/`about`/`now` routes (EN + `/ko`), `app/not-found.tsx`, and `components/` (Header, Footer, PostBody, PostList, ProjectBody, ProjectCard, ProjectList, WikiBody, WikiList, LogBody, LogTimeline, Mermaid, mdx-components, HomeSection, ProfileCard, ProfileHeader, SocialGrid, Avatar).
- **Admin frontend:** all `app/(admin)/admin/**` pages and `components/admin/*` (AdminNav, CompanionEditor, DeletePostButton, DistributionChecklist, LoginForm, PostEditor, ProjectEditor, ProjectsList, SiteForm).
- **Content & config:** `content/posts/{en,ko}/*`, `content/notes/en/asdasd.mdx`, `content/projects/{en,ko}/*`, `content/knowledge/en/*`, `content/now/*`, `content/site.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `postcss.config.mjs`, `README.md`, `CLAUDE.md`, `docs/troubleshooting.md`, `docs/architecture.md`.

**Rejected candidate (excluded from findings):** `app/api/admin/upload/route.ts` path-traversal claim — verification confirmed comprehensive validation (`isLocale`, `isValidSlug`, type whitelist, `sanitizeBase()` filename stripping, `path.join` normalization), so no traversal is possible.

**Not read:** anything under `codex_review/` (absent; intentionally ignored), `.env.local` (git-ignored secrets), `node_modules/`.

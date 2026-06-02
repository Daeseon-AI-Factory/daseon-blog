<div align="center">

<img src="public/og.jpg" alt="곁 · Beside — an open locket holding the people you love" width="640" />

# 곁 · Beside

**The people in your corner, kept close — a private box you open on the hard days**

<sub>Full-stack installable PWA · one codebase that runs locally with **zero external accounts** and flips to full production infrastructure **by environment variable alone**</sub>

[**🌐 Live demo → beside.daeseon.ai**](https://beside.daeseon.ai)

**English** · [한국어](./README.ko.md)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Postgres-Drizzle%20ORM-4169E1?logo=postgresql&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Web%20Push-5A0FC8?logo=pwa&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Terraform](https://img.shields.io/badge/IaC-Terraform-7B42BC?logo=terraform&logoColor=white)

</div>

---

> **TL;DR.** A full-stack, installable PWA. **The same code runs locally with zero external accounts — embedded DB, local files, auto-generated keys — and flips to full production infrastructure (PostgreSQL, S3/R2, Web Push) by environment variable alone.** The product keeps the encouragement of the people who love you — a voice note, a photo, a kind line, a short clip — and surfaces it, calmly one at a time, when you need strength; loved ones can add a message through a link **without signing up**. Built from a single written spec in one focused session, then independently reviewed by a multi-agent adversarial security pass (six findings fixed).

## Table of contents

- [What is 곁?](#what-is-곁)
- [Why this project](#why-this-project)
- [Product walkthrough](#product-walkthrough)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Security & privacy](#security--privacy)
- [Data model & API](#data-model--api)
- [Run it locally](#run-it-locally)
- [Deployment](#deployment)
- [Engineering log](#engineering-log)
- [Honest limitations](#honest-limitations)
- [Project layout](#project-layout)

---

## What is 곁?

<img src="public/art/hero.webp" alt="A locket opening, a handwritten note and a photo drifting out" width="100%" />

*곁 (gyeot)* is the Korean word for *the space right beside you*. The north star is a **locket** — small, private, and holding something precious. Open it and the things that steady you are right there: your mother's voice, a friend's photo, a line from a book you love, a twenty-second clip of someone telling you it's going to be okay.

There are **two ways to fill the box** and **one way to open it**:

1. **You add things yourself** — record a voice note, keep a photo, write a line (with an optional source, for a quote from a book or a character).
2. **Someone who loves you adds through a link** — they open it, leave one message, type their name, and they're done. **No account, no install.**
3. **You open it** — the *surfacing moment*: calm, one item at a time, in a fresh order each time, like opening a locket. Or get a gentle push reminder at a time you choose.

Because *you* can fill it, the box is **useful from day one even if no one else ever contributes** — a deliberate answer to the cold-start problem.

---

## Why this project

> *For reviewers in a hurry — the engineering this repo demonstrates.*

- **🔀 Env-gated dual-mode architecture.** The *same code* runs locally with **zero external accounts** and switches to real infrastructure **per env var, per key** — `DATABASE_URL` → node-postgres, `S3_BUCKET` → S3/R2 presigned URLs, `VAPID_*` → fixed push keys, no rebuild. Both database drivers are *lazy dynamic imports* (dev never bundles `pg` or the AWS SDK) and the connection is globally memoized to survive Next's multi-worker build.
- **🛡️ Security-reviewed.** A multi-agent adversarial pass found and fixed **six** real issues: a production auth bypass, a service worker leaking private HTML across accounts, a media route that broke iOS audio by ignoring HTTP `Range`, missing CSRF checks, an upload MIME allow-list against stored XSS, and public-endpoint rate-limiting plus an early `Content-Length` DoS guard.
- **📱 Real platform depth.** iOS Web Push only works from an installed PWA → an Add-to-Home-Screen guide; `MediaRecorder` MIME types differ across browsers → capability-probed capture plus an optional server transcode; iOS evicts PWA storage after seven days → the server, never the browser, is the source of truth.
- **🏗️ Production-shaped.** Multi-tenant isolation with access-controlled media that is never served from a public URL, two correct HTTP range strategies (`206` / presigned redirect), idempotency keys, rate limiting, data export (zip) plus full account deletion, **Terraform** IaC for AWS RDS, a **Dockerfile** with ffmpeg, and two documented deploy paths.
- **🧭 Decisions are written down.** Every non-trivial fix or call is dual-written to a troubleshooting index and a dated narrative — including an architecture record that argues *against* a premature multi-region DB split (shard for compliance, not for unmeasured latency).
- **🌏 Bilingual (ko/en)** with a cookie-driven locale and SSR, and warm, non-clinical copy for a genuinely sensitive domain.

---

## Product walkthrough

| Flow | What happens |
|---|---|
| **Sign in** | Social OAuth (Kakao / Google) in production; a name-only dev login for local browsing. A box is auto-created on first login. |
| **Add it yourself** | Voice (30s) · photo · words (+ optional source) · video (20s). |
| **Ask for a note** | Mint an unguessable link → share it. The other person opens `/c/:token`, leaves one item plus a name, done — no signup. |
| **Open one** | The *surfacing moment* — one item at a time, a fresh order each time, a locket-opening tone. |
| **Reminders** | Pick times → a gentle Web Push ("what you've kept is here"). |
| **Manage** | Hide / unhide / delete (media is really deleted), export everything as a zip, or delete the whole account. |

<img src="public/art/onboarding.webp" alt="The locket open on a nightstand at night — the surfacing moment" width="100%" />

---

## Tech stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 (App Router, React 19, TypeScript 5) — UI + API + server in one app |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL + Drizzle ORM — **dev:** PGlite (embedded WASM Postgres) · **prod:** node-postgres (`pg`) |
| **Object storage** | S3-compatible (`@aws-sdk/client-s3` + presigner) — **dev:** local disk · **prod:** S3 / Cloudflare R2 with 5-min presigned URLs |
| **Auth** | Signed httpOnly cookie session (SameSite=Lax) + Kakao & Google OAuth (per-provider modules: `lib/oauth/kakao.ts`, `google.ts`) |
| **Web Push** | `web-push` (VAPID) — keys auto-generated, or fixed via env |
| **Scheduler** | `node-cron` (persistent host) **or** external cron → `/api/cron/reminders` (serverless) |
| **PWA** | Hand-written Web App Manifest + Service Worker (push, notification click, app-shell cache, offline fallback) |
| **Validation / safety** | `zod` schemas · MIME allow-list · in-memory rate-limit & idempotency · `crypto.randomBytes` tokens |
| **Media** | Optional server-side `ffmpeg` transcode (webm/ogg → AAC/MP4) for cross-device audio |
| **Infra / deploy** | **Terraform** (AWS RDS Postgres, Seoul) · **Docker** (Next standalone + ffmpeg) · Vercel + AWS, or Railway / Render / Fly |
| **i18n** | `ko` / `en` dictionaries, cookie locale, SSR |

> **Note.** `typescript` and `tailwindcss` are dev-dependencies; `drizzle-kit` is present, but the schema is bootstrapped at runtime from a hand-written, idempotent SQL DDL (`lib/db/init.ts`) rather than from generated migration files.

---

## Architecture

**One codebase, two worlds.** The core idea: the app boots with sensible local defaults and *upgrades itself* when you hand it real infrastructure — each capability gated on a single env var, decided at the seam, not sprinkled through the code.

```
                        ┌──────────────────── same code, env-gated ────────────────────┐
                        │                                                              │
  Browser  ──────▶  Next.js (App Router)  ──────▶  lib/db ── DATABASE_URL? ──▶ node-postgres (prod)
  (PWA + SW)          UI · API routes · proxy.ts          └─ else ─────────▶ PGlite embedded (dev)
      │                     │
      │                     ├──▶ lib/storage ── S3_BUCKET? ──▶ S3 / R2 + presigned URL (prod)
      │                     │                   └─ else ─────▶ local disk .data/media (dev)
      │                     │
      │                     ├──▶ lib/env ── VAPID_*/SESSION_SECRET set? ──▶ use them
      │                     │               └─ else ──────────────────────▶ generate + persist (.data/secrets.json)
      │                     │
      ▼                     └──▶ reminders: VERCEL? ──▶ external cron → /api/cron/reminders
  Service Worker                              └─ else ─▶ node-cron in-process (instrumentation.ts)
  push · notificationclick · app-shell cache
```

**Key decisions**

- **Driver selection at the seam.** `lib/db/index.ts` picks node-postgres when `DATABASE_URL` is set, otherwise lazily opens embedded PGlite at `.data/pglite` — the Drizzle query API is identical both ways; `lib/storage/index.ts` switches on `S3_BUCKET`. Both drivers are dynamic-imported and the connection is globally memoized, so dev never loads `pg` / the AWS SDK and Next's parallel build workers don't each re-open the DB.
- **Self-provisioning secrets.** `lib/env.ts` generates a `SESSION_SECRET` and VAPID keys on first boot and persists them to `.data/secrets.json`, with per-key env overrides — plus a fast path that skips disk entirely when all three are supplied.
- **Graceful boot anywhere.** On a read-only filesystem (e.g. a first Vercel deploy before env is set), secret writes fall back to in-memory and `instrumentation.ts` wraps `getSecrets()` / `getDb()` in try/catch so the server never crash-loops.
- **A scheduler that fits the host.** A persistent Node host runs `node-cron` every minute; on Vercel it's skipped and an external scheduler (AWS EventBridge) hits the same `/api/cron/reminders` handler.

---

## Security & privacy

This handles real people's voices and faces, so access control and abuse-resistance were primary, not afterthoughts. The list below was driven by a multi-agent adversarial review run *after* the build.

| Concern | Implementation |
|---|---|
| **Auth bypass** | The local-only dev login returns `404` when `NODE_ENV === production` (`app/api/auth/dev-login/route.ts`). |
| **Media access** | No public URLs. The media route gates on a validated session cookie (`401` if missing) **and** box ownership (`404` if it isn't yours); production serves 5-minute presigned S3 URLs. |
| **iOS audio** | Two correct range strategies: on the disk-backed path the route serves HTTP `Range` → `206`/`416` itself; on S3/R2 it `302`-redirects to a short-lived presigned URL and object storage serves the bytes. iOS Safari needs ranged responses to play and seek `<audio>`. |
| **CSRF** | `proxy.ts` (Next 16's renamed middleware) rejects mutating `/api/*` requests that carry a *cross-origin* `Origin` header with `403`; requests with no `Origin` rely on the `SameSite=Lax`, httpOnly, signed session cookie. |
| **Stored XSS** | An upload MIME allow-list (`lib/constants.ts`, enforced in `lib/items.ts`) accepts only known image/audio/video types — `svg`/`html` excluded — plus `X-Content-Type-Options: nosniff`. |
| **Private SW cache** | The service worker is network-only for navigations (it never caches the owner's rendered HTML); only the app shell is precached; the cache version is bumped to purge old entries. |
| **Public-endpoint abuse** | `POST /api/c/:token` is rate-limited per IP (20/min) and per token (60/hr), bounded by an early `Content-Length` check, and idempotency-keyed against double submits. |
| **Tokens** | Contribution links are 256-bit `crypto.randomBytes(32)` base64url tokens — unguessable, indexed for O(log n) lookup; the session cookie's HMAC signature is verified with `timingSafeEqual` (constant-time). |
| **Your data is yours** | Export everything as a zip; delete the account and every item (FK-cascade + real media deletion). |

---

## Data model & API

**Six tables** (`lib/db/schema.ts`): `users`, `boxes` (one per user — `owner_id` unique), `items`, `contribution_links` (unique indexed `token`), `reminder_schedules`, `push_subscriptions`.

`items` carries `type` (`audio | photo | text | video`), `media_key`, `media_mime`, `text_content`, `source` (quote attribution), `origin` (`owner | contributor`), `contributor_name`, `is_hidden`, `created_at`, and is indexed on `(box_id, created_at)`. The `type` / `origin` value constraints are enforced by a **DB CHECK in raw SQL** (`lib/db/init.ts`), with compile-time TypeScript unions in the Drizzle schema.

**API surface** (`app/api/**`) — a clean split between the authenticated owner area and the public contribution area:

```
Public (no auth, rate-limited)   GET·POST  /api/c/[token]
Owner items                      POST /api/items · PATCH·DELETE /api/items/[id] · GET /api/items/[id]/media
Owner box / links / reminders    GET /api/box · GET /api/box/items · GET·POST /api/links
                                 GET·POST /api/reminders · PATCH·DELETE /api/reminders/[id]
Push                             POST·DELETE /api/push/subscribe · POST /api/push/test · GET /api/push/vapid
Auth                             GET /api/auth/{kakao,google}(+/callback) · POST /api/auth/logout
Account / data                   GET /api/export (zip) · DELETE /api/account
Scheduler                        GET·POST /api/cron/reminders   (Bearer CRON_SECRET / x-vercel-cron)
Dev only (404 in production)     POST /api/auth/dev-login · POST /api/dev/seed
```

---

## Run it locally

**No accounts, no keys.** An embedded DB, local media storage, and auto-generated secrets mean it runs immediately.

```bash
npm install      # first time
npm run dev      # → http://localhost:3000
```

**See the seeded demo**

1. On the login screen, sign in with the email **`demo@example.com`** (any name).
2. The box comes pre-filled with a received voice note, a photo, and a few written lines.
3. Press **"Open one now"** to feel the surfacing moment — the core interaction.

> Start clean any time: `rm -rf .data && npm run dev` (secrets and the demo regenerate; reseed with `curl -X POST localhost:3000/api/dev/seed`).
>
> *On the live site `demo@example.com` won't work — dev login is disabled in production by design; use social sign-in there.*

---

## Deployment

Two supported models — the code adapts to both.

**1) Serverless — Vercel + AWS** *(the live deployment)*
App on Vercel; PostgreSQL on AWS RDS (Seoul); media on S3 (private bucket, 5-minute presigned URLs); reminders fired by AWS EventBridge Scheduler hitting `/api/cron/reminders` every minute. The infrastructure is codified in **Terraform** under `infra/`.

**2) Persistent host — Railway / Render / Fly**
The provided **Dockerfile** (Next standalone + ffmpeg) runs `node-cron` in-process and stores media on R2/S3. ffmpeg on this path enables webm→AAC/MP4 audio transcoding for guaranteed cross-device playback.

The full env matrix and checklists live in [`DEPLOY.md`](./DEPLOY.md).

---

## Engineering log

This repo keeps a disciplined, anti-hallucination log: every non-trivial fix or decision is **dual-written** — a terse, problem-indexed reference and a dated narrative — with literal error text, verified causes, and post-commit hashes.

- [`docs/troubleshooting.md`](./docs/troubleshooting.md) — PGlite WASM corruption recovery, Turbopack mangling an external module, `process.on` under the Edge runtime, Kakao OAuth `KOE006`/`KOE010`, a favicon override, three of the six security-review fixes (with curl/repro evidence), and the multi-region DB record.
- [`content/logs/motivation/`](./content/logs/motivation/) — narrative entries: the overnight build, stack decisions, the adversarial security review (all six findings), "trust by feeling", the video fourth type, locket artwork & warm copy, and the deferred multi-region split.
- [`work.md`](./work.md) — the single deep spec the whole MVP was built from.
- [`PROGRESS.md`](./PROGRESS.md) — morning handoff: what's done, what's mocked, what needs real keys.

**Verified by running it (manual observations logged in `PROGRESS.md`, not a test suite)** — a one-off 30-concurrent-write check with 0 DB conflicts; the media gate `200` with a cookie / `401` without; an idempotent resubmit → `duplicate`; a clean production build (22 API routes, 32 total app routes).

---

## Honest limitations

> Stated plainly, because knowing the edges is part of the engineering.

- **No automated tests** — verification has been manual (runtime checks + a clean build). A test suite is the obvious next investment.
- **Rate-limit, idempotency, and reminder-dedupe are in-memory** — correct for a single instance; multi-instance needs a durable store (Redis) and a persisted dedupe marker.
- **ffmpeg only on the persistent/Docker path** — Vercel functions have no ffmpeg, so a webm clip recorded on desktop Chrome may not play on iOS (same-device playback is fine).
- **The Terraform infra is a dev posture** — public RDS + open security group, with the hardening path noted in comments (RDS Proxy / private subnet / IP allow-list for production).
- **`scripts/gen-art.mjs` depends on `sharp`** (a heavy native lib, present only transitively); `gen-icons.mjs` / `gen-sample-photo.mjs` are pure-Node.

---

## Project layout

```
app/
  page.tsx                    entry → /box or /login
  login/  box/{add,links,surface,settings}/  c/[token]/   owner screens + public contributor landing
  api/**                      auth · box · items(+media) · links · c/[token] · reminders · push · cron · export · account
lib/
  db/{index,schema,init}      env-gated PGlite↔Postgres · Drizzle schema · raw-SQL DDL bootstrap
  storage/  auth/  oauth/     local↔S3 driver · cookie session · Kakao & Google OAuth
  env.ts  scheduler.ts  push.ts  audio.ts            self-provisioning secrets · node-cron · web-push · ffmpeg
  validation.ts  constants.ts  ratelimit.ts  tokens.ts  copy.ts  i18n*    zod · MIME allow-list · limits · crypto tokens · ko/en
components/                   AudioRecorder · VideoRecorder · PhotoPicker · SurfaceClient · ContributeClient · InstallGuide …
public/                       manifest.webmanifest · sw.js · icons/ · art/
infra/                        Terraform — AWS RDS PostgreSQL (Seoul)
instrumentation.ts            boot: secrets → DB → scheduler (Node runtime only)
proxy.ts                      Next 16 proxy — CSRF / same-origin guard on /api/*
Dockerfile                    Next standalone + ffmpeg
```

---

<div align="center">

**[곁 · Beside](https://beside.daeseon.ai)** — built with care for the days you need it most.

<sub>Repo: [Daeseon-AI-Factory/motivation](https://github.com/Daeseon-AI-Factory/motivation) · Live: [beside.daeseon.ai](https://beside.daeseon.ai) · [한국어 README](./README.ko.md)</sub>

</div>

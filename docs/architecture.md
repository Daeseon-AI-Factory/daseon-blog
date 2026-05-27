# Deployment architecture — how publishing actually works

If you've ever wondered "wait, the build takes 60s, why does the post appear in 3s?", this doc is for you. It explains the moving parts: build vs runtime, filesystem vs `fetch`, GitHub Raw, ISR caching, and CDN invalidation.

---

## TL;DR

```
You hit "Publish"
   ↓
API route (Vercel Serverless Function)
   ↓
Octokit → GitHub Contents API           ─── (commit to repo)
   ↓
revalidatePath("/posts/<slug>")         ─── (invalidate ISR cache)
   ↓
Response back to admin UI               ─── 1-2s elapsed
   ↓
GitHub fires webhook to Vercel          ─── starts a new build in the background
                                            (60s, you don't wait for it)
   ↓
Reader visits /posts/<slug>
   ↓
Next.js renders page
   ↓
lib/source.ts → fetch raw.githubusercontent.com/.../<slug>.mdx
                with `next: { revalidate: 30 }`
   ↓
Fresh content rendered                  ─── ~3-5s total since publish
```

The reader **never waits for the Vercel build**. The build runs in the background; nothing about the live response depends on it.

---

## The two timelines: build vs runtime

There are two completely separate moments in a Next.js deploy:

### Build time (happens once per deploy)

When you `git push`, Vercel:

1. Spins up a build container
2. Runs `npm install`, `next build`
3. Compiles TypeScript, bundles client JS, prerenders static pages
4. Packages the result into a deployment "slot"
5. When the slot is healthy, flips the traffic to it

This takes 30–90s. The output is **frozen** — a snapshot of code + files at that moment.

### Runtime (happens on every request)

When a user hits a URL:

1. Vercel's edge network looks up the route
2. Static pages → served straight from CDN (the prerendered HTML from build time)
3. Dynamic pages → Vercel boots a Serverless Function that runs your code
4. Your code does whatever it does — reads files, calls APIs, queries DBs — and returns HTML

Runtime can do things build time can't: read live data, hit external APIs, respond to per-request state. But it has a budget (Vercel Hobby = 10s function timeout).

---

## Filesystem in production: a build-time snapshot

When `next build` packages your deployment, it includes the `content/` directory as it existed **at the moment of the build**. That directory ships inside the function bundle at `/var/task/content/`.

Production filesystem behavior:

- **Read-only**: cannot `fs.writeFile` from inside a Serverless Function (this is the EROFS error we hit — see `troubleshooting.md`).
- **Frozen at build time**: any commit that happens *after* the build doesn't appear in this fs. The deployment is sealed; future commits trigger *new* deployments with their own snapshot.

So if your code does `fs.readFile("content/posts/en/foo.mdx")` in production, you only see files that existed when the current deployment was built. New posts → invisible until next build → 60s wait.

This is the bug we hit in commit `559da07`'s aftermath. The fix is below.

---

## `fetch` vs `fs.readFile`

These look interchangeable but have totally different lifetimes:

| | `fs.readFile` | `fetch` to GitHub Raw |
|---|---|---|
| Reads from | Build-time fs snapshot | Live HTTP — current state of remote |
| New content visible when? | After next build (60s) | On next request (~1s) |
| Works in dev | Yes (local fs is live) | Yes (hits real GitHub) |
| Works in prod | Yes — but stale | Yes — and fresh |
| Network cost | Zero | One round trip per call (cacheable) |

`fetch` in Next.js is also wrapped by **ISR caching** automatically (see next section), so the network cost is bounded.

This is why `lib/source.ts` uses `fetch`:

```ts
const res = await fetch(
  `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
  {
    headers: { Authorization: `token ${token}` },
    next: { revalidate: 30 },          // ← ISR: cache for 30 seconds
  },
);
```

The `next: { revalidate: 30 }` is the key bit. Without it, every page request would round-trip to GitHub. With it, Next.js memoizes the response for 30s in its data cache.

---

## ISR (Incremental Static Regeneration), in one paragraph

Next.js caches the result of every `fetch()` call (and every page render) in a layered cache. When you pass `next: { revalidate: N }`, you're saying: serve from cache for up to N seconds, then on the next request after that window, re-fetch in the background and refresh the cache. Readers in the meantime continue seeing the previous version. This is "stale-while-revalidate" — fast for readers, eventually consistent.

In our case:
- `revalidate: 30` on the GitHub Raw fetch → at most 30s lag for new content via cache expiry alone
- `revalidatePath("/posts/<slug>")` on publish → **explicit, immediate** invalidation of that specific cache entry → reader sees fresh content on the very next request

The combination is why publish-to-live is ~3-5s, not 30s and not 60s.

---

## CDN caching layer

There's one more cache above ISR: Vercel's edge CDN. When a Serverless Function returns HTML, the response is cached at the edge for some time (depending on headers). When `revalidatePath` runs, it invalidates the CDN cache for that path too. Next request → fresh from origin → new content.

Two caches, both invalidated, both fresh-on-next-request:

```
Reader → CDN edge cache → ISR data cache → fetch to GitHub Raw → source of truth (GitHub)
            (Vercel)        (Next.js)         (live HTTP)            (eventually consistent)
```

---

## What the Vercel rebuild actually does after a publish

When you publish and GitHub sends Vercel a webhook, Vercel kicks off a fresh build. That build:

1. Updates the `content/` snapshot in `/var/task/`
2. Re-runs `generateStaticParams` for `/posts/[slug]` — new slugs get prerendered HTML
3. Reseats the deployment slot

Once it finishes (~60s), the *next* requests to slugs that already existed in the previous build keep working as before (no behavior change — they were already reading from GitHub Raw via `lib/source.ts`). The genuine difference: prerendered HTML for the new slug now exists at the CDN edge, so the very first request to it is slightly faster than the runtime-rendered version was.

**You almost never notice this rebuild as a reader.** The runtime path already served the new post; the rebuild just incrementally improves cold-cache latency for that one slug.

---

## Why builds still happen on every publish (and what to do about it)

Vercel's GitHub integration watches `main`. Every push triggers a build, including the auto-commits from publishing posts. That's:

- ~60s of build time per publish (counted against the 6000 min/month free tier — fine for solo use)
- A new entry in Vercel's Deployments dashboard per publish (noisy if you publish often)

If you want to suppress this, the cleanest move is to make the admin API append `[skip ci]` (or `[vercel skip]`) to commit messages it creates. Vercel skips builds on commits whose message contains `[skip ci]`. Since reading already happens through `lib/source.ts` and not from the build snapshot, skipping the build has no functional cost — only the small "prerender new slug" win is lost (and that page just gets runtime-rendered until something else triggers a real build).

We haven't enabled this yet. It's a one-line change in `lib/storage.ts` (the commit message string).

---

## When does the Vercel rebuild actually matter?

You **do** want a Vercel rebuild when:

- Code changed (`lib/`, `app/`, `components/`, `package.json`, configs)
- New env vars added
- `next.config.mjs` changed

You **don't really need** a rebuild when:

- Only `content/` files changed (new post, edited frontmatter, new image)
- Only `content/site.json` changed

The current setup rebuilds either way. If we add `[skip ci]` to admin commits, content-only changes will skip the build, while code commits (you typing `git commit`) keep building as normal.

---

## Quick mental model recap

- **Build time** = a sealed snapshot of code + content. Read-only filesystem in production.
- **Runtime** = live code running per-request. Can `fetch` remote things.
- **`fs.readFile` in production** = reads the build-time snapshot (stale for content added after).
- **`fetch` to GitHub Raw** = reads the current state of the repo (fresh).
- **ISR (`next: { revalidate }`)** = bounded caching of `fetch` results; bounded staleness.
- **`revalidatePath(...)`** = surgical, immediate cache invalidation for one route.
- **CDN cache** = Vercel's edge cache, also invalidated by `revalidatePath`.

For this site: code lives in the build, content lives in git, and the runtime fetches content from git on demand. Build and content lifecycles are decoupled — that's why publish-to-live is fast even though a rebuild is also happening behind the scenes.

# daseon-blog authoring guide

> 한국어 버전: [blog-guide.ko.md](./blog-guide.ko.md)

The handbook you keep open while writing for this blog. Where to put what, which frontmatter to set, and when a push goes live.

Screenshots are in `docs/blog-guide-screens/`, captured against live `daeseon.ai` on 2026-05-30.

---

## 1. The map — where things go

| What you're writing | Directory | Live URL |
|---|---|---|
| **Blog post** (retro, essay, concept) | `content/posts/en/<slug>.mdx` (or `/ko/`) | `/posts/<slug>` |
| **Wiki entry** (a principle and its instances) | `content/knowledge/en/<slug>.mdx` | `/wiki/<slug>` |
| **This blog's project timeline** | `content/logs/daeseon-ai/<date>-<slug>.mdx` | `/projects/daeseon-ai` timeline |
| **A satellite project's timeline** (shadow-ai · dalkkak-ai · docvault) | the satellite repo's `content/logs/<slug>/<date>-<slug>.mdx` | `/projects/<slug>` timeline |
| **Human commentary on an existing AI log** | the same directory, `<date>-<slug>.human.mdx` | right column of the entry's detail page |

Everything is direct mdx editing (Admin UI is optional — see §10).

---

## 2. Writing a blog post

### Where

`content/posts/en/2026-05-30-<slug>.mdx`

`slug` is the last URL segment. Filename = slug. Use only letters, digits, and hyphens.

### Frontmatter — Format B (default for retros/recaps)

```yaml
---
title: "One concrete line"
description: "1–2 sentences. Used by search and social previews."
date: "2026-05-30"        # quoted, always
language: "en"
format: "before-after"
handwritten: true          # set when you wrote it yourself, no AI
tags: ["industry-retro", "backend"]
---
```

### Frontmatter — Format A (4-tone multi-register for concept posts)

```yaml
---
title: "..."
description: "..."
date: "2026-05-30"
language: "en"
format: "multi-register"
handwritten: true
tags: ["concept", "..."]
---
```

### Body — Format B structure (5–10 sentences total)

```mdx
## What I did
one line

## What it looked like before
concrete (numbers / stack / failure mode)

## What I changed
the decision

## What happened
measurable result

## What it doesn't do / what's next
the limit
```

Format A — Raw / Marketing / Professional / Big-picture sections. See "Post Formats" in `CLAUDE.md`.

### What it looks like

Listing page:

![Posts list](./blog-guide-screens/posts-list.png)

Detail page:

![Post detail](./blog-guide-screens/post-detail.png)

If `handwritten: true` is set, a small "BY HAND" label appears in the meta row.

---

## 3. Writing a wiki entry (fundamentals)

The wiki is a set of **principles**, not a vocabulary list. The thesis is *"not 'what is Kafka' — what's the engineering principle, and Kafka is one instance of it."* English-first.

### Where

`content/knowledge/en/<slug>.mdx`

`slug` is the principle name in kebab-case (e.g. `append-only-log`, `idempotent`).

### Frontmatter

```yaml
---
title: "Append-only log"
description: "One line — what the principle is."
date: "2026-05-30"
language: "en"
type: "knowledge"          # required
tags: ["principle", "..."]
instances: ["Kafka", "Redis Streams", "Postgres WAL", "event sourcing"]
handwritten: true
---
```

The `instances` array is exactly "the tools / patterns that are instances of this principle" — rendered as a chip block above the body.

### Body — five sections (recommended)

```mdx
## The principle
What it is, mechanically.

## How it maps to practice
- **Kafka** — ...
- **Redis Streams** — ...
(Each instance of the principle. The `instances` chip block summarizes; this section explains how each one *is* the principle.)

## How it gets buried
The buzzwords / marketing-speak that hide the principle.

## Say it clearly
One sentence. No buzzwords.

## In Korean
The EN ↔ KO translation nuance — what's lost going either way.
```

### Cross-linking entries

`[[term]]` or `[[display text|slug]]`:

```mdx
Because this is a [[race-condition]], you need a [[distributed lock|distributed-lock]].
```

Resolves automatically to `/wiki/race-condition` and `/wiki/distributed-lock`. The slug must exist (or it renders as a dead link — wiki "red link").

### What it looks like

Wiki list (alphabetical):

![Wiki list](./blog-guide-screens/wiki-list.png)

Wiki detail (Instances chip block + body):

![Wiki detail with Instances](./blog-guide-screens/wiki-detail.png)

The chip block under the title is the `instances` frontmatter visualized.

---

## 4. Adding a project timeline entry

Record the events you encounter while working on a project — troubleshoots, decisions, retros, milestones — in chronological order.

### Where

| Project | Path |
|---|---|
| **daseon-ai** (this blog's own retros) | this repo, `content/logs/daeseon-ai/<date>-<slug>.mdx` |
| **shadow-ai** | the `Daeseon-AI-Factory/shadow-ai` repo, `content/logs/shadow-ai/<date>-<slug>.mdx` |
| **dalkkak-ai** | the `Daeseon-AI-Factory/ddalkkak` repo, `content/logs/dalkkak-ai/<date>-<slug>.mdx` (slug ≠ repo name — heads up) |
| **docvault** | the `Daeseon-AI-Factory/docvault` repo, `content/logs/docvault/<date>-<slug>.mdx` |

For satellites: commit and push in *that* repo. The blog fetches it via the 30-second ISR cache.

### Frontmatter

```yaml
---
title: "One concrete line"
date: "2026-05-30"
project: "shadow-ai"        # exact slug
kind: "troubleshoot"        # see table below
visibility: "public"        # `business` and `monetization` default to "private"
language: "en"
summary: "One or two sentences — shown on the timeline card"
tags: ["..."]
handwritten: true           # set when you wrote it yourself
---
```

### Picking `kind`

| kind | When |
|---|---|
| `troubleshoot` | A specific bug / incident / debug story |
| `tech-retro` | A technical decision retrospective (architecture, stack choice) |
| `ux-retro` | A UX / design decision retrospective |
| `business` | Strategy / business decision (defaults to private) |
| `monetization` | Pricing / revenue decision (defaults to private) |
| `update` | A release / milestone |

When in doubt, `update` is the safest default.

### Anti-hallucination — the 7 rules (apply even when writing by hand)

From `CLAUDE.md`, in short:
1. **Symptom literal** — quote the actual error/output verbatim.
2. **Cause verified** — only what you read in the code or ran. Guessing? Mark it `Hypothesis:` + `Verified by:`.
3. **Fix names actual files** (per `git show`).
4. **Commit hash is real** — must exist in the repo.
5. **Date from git** or today.
6. **Pattern only if obvious** — no padding.
7. **No fabricated metrics** — "about 60s" only when you saw 60s.

### What it looks like

The project page (top is from the project mdx; the timeline below is built from log entries):

![Project detail with timeline](./blog-guide-screens/project-detail.png)

---

## 5. Adding human commentary to an existing AI log (`.human.mdx`)

The AI entry stays untouched; your perspective sits **side by side** with it.

### Where

**Always in this blog repo**, not in the satellite. The AI entry is satellite history; the companion is blog content (your view of it). One repo to edit, regardless of which satellite the AI entry came from.

```
daseon-blog/content/logs/shadow-ai/
└ 2026-05-23-yt-dlp-transcript-self-healing.human.mdx   ← your take (this repo, new file)

# The AI entry stays in its own repo:
shadow-ai/content/logs/shadow-ai/
└ 2026-05-23-yt-dlp-transcript-self-healing.mdx          ← don't touch
```

### Writing

**No frontmatter needed.** Body only:

```mdx
It was 3 AM when the timedtext URLs started returning empty.

I was hesitant about pulling yt-dlp in — a subprocess complicates deploys —
but the self-healing import pattern paid back more than it cost: ...

(your voice, your specifics, your feeling)
```

### What it looks like (screenshot pending until the first companion exists)

Desktop (`md+`):

```
┌────────────────────┬────────────────────┐
│  AI VERSION        │  BY HAND           │
│                    │                    │
│  (AI body)         │  (your body)       │
│                    │                    │
└────────────────────┴────────────────────┘
```

Mobile: stacked, AI first then your version.

Entries without a companion render unchanged (single column).

### Starting

Pick the event you remember best. shadow-ai's yt-dlp story or dalkkak-ai's v0.1.0 ship are both good starters.

---

## 6. Tags and filtering

### How to tag

Every frontmatter above takes `tags: [...]`. The point is consistent tags across entries:

- `industry-retro` — your former-employer retro series
- `principle` — wiki principle entries (most carry this automatically)
- Your own series tags — name them what you want

### Tag URL

`/posts/tag/<tag>` collects every post with that tag. For example:

- https://daeseon.ai/posts/tag/industry-retro — every former-employer retro
- https://daeseon.ai/posts/tag/claude-code — claude-code posts

Drop this URL into LinkedIn or your résumé and a recruiter sees one cluster at a time.

### What it looks like

![Tag filter](./blog-guide-screens/tag-filter.png)

Tag chips appear under each post card; clicking one navigates to that tag's collection.

---

## 7. The `handwritten` marker — yours vs AI's

One line in frontmatter:

```yaml
handwritten: true
```

Adds a small "BY HAND" (en) / "직접" (ko) label in the meta row — monospace, lowercase weight, *not* a chip (intentionally restrained).

**Where it renders:**
- `/posts` detail + list cards
- `/wiki` detail
- Project log timeline cards

For AI-assisted entries, just omit the field (no label). Be conservative — the rarer the marker, the stronger the signal.

---

## 8. EN/KO — English first

The blog is bilingual at the infra level. But **your default is English**.

| Content | Approach |
|---|---|
| Wiki entries | English only. Korean goes inside the English entry as an `## In Korean` section. |
| Blog posts | English first. KO mirror is possible (`content/posts/ko/`, paired via `translationKey`) if you really want both. |
| Project logs | English (matches the satellite-repo convention). |

**Do not create KO mirror pages for the wiki.** Korean is a *supplementary section*, not a parallel page.

The KO routes exist (`/ko/posts`, `/ko/wiki`, etc.) but stay empty unless you publish KO content — that's fine, not an error.

---

## 9. Publishing & live timing

### Flow

```bash
# write
vim content/posts/en/2026-05-30-my-first-retro.mdx

# (optional) check the build locally
npm run build

# commit and push
git add content/posts/en/2026-05-30-my-first-retro.mdx
git commit -m "post: <slug>"
git push origin main
```

### When does it go live

- **Log entries in satellite repos**: push → blog fetches via 30-second ISR → live.
- **Posts / wiki / logs in *this* repo**: push → Vercel rebuilds (~1–2 min) → live.

Existing pages cache for 30 seconds (ISR); the first visitor after that triggers a fresh fetch.

### Preview locally before pushing

```bash
npm run dev
# http://localhost:3000
```

Dev server hot-reloads on file changes.

---

## 10. Admin UI vs direct mdx

`/admin` is a form-based editor for posts and projects. Which is better when:

| Task | Recommendation |
|---|---|
| Spin up a new project mdx fast | Admin (form is quicker) |
| Write or edit a post | **Direct mdx** (Admin's editor is plain text only) |
| Add a log entry | **Direct mdx** (Admin has no form for this) |
| Add a `.human.mdx` companion | **Direct mdx only** (Admin doesn't support this) |

Short version: **posts, logs, and companions = mdx by hand. Projects-only = Admin saves time.**

Admin access: `http://localhost:3000/admin` → enter `ADMIN_PASSWORD` from `.env.local`. (Production uses the same URL and password.)

---

## 11. Retro confidentiality — fingerprint checklist

Run through this before publishing every former-employer retro:

| Area | Safe ✅ | Risky ❌ |
|---|---|---|
| Company name | "a large Korean SI" | "SK AX" |
| Customer | not named at all | the actual name |
| System | "MES", "cost ledger" | internal product names |
| Scale | order of magnitude ("~10K RPS") | exact figures, revenue |
| Tech stack | Spring · Oracle · Java (public tech) | internal proprietary libs |
| Architecture | "staging-table + batch-worker pattern" | actual deploy topology, server specs |
| Your own decisions and trade-offs | free to write | — |

**Fingerprint test**: *"Would a former coworker reading this know which project it is?"* If yes, abstract further.

**The floor**: details already on your résumé (8 sites, 7,700-line PL/SQL, etc.) are safe. Anything more specific than the résumé — stop and reconsider.

Before publishing the first one, have a trusted former colleague read it. You're the most blind to your own fingerprint.

---

## 12. Common traps

1. **YAML dates must be quoted.** `date: "2026-05-30"`, not `date: 2026-05-30`. Unquoted ISO dates parse as `Date` objects and break the build (we guarded against this in `c3517f5`, but quoting is cleaner).

2. **A project mdx without `url` is filtered out.** Empty string falsy → loader drops it → the page never builds. If no live deploy, point `url` at the GitHub repo URL at minimum.

3. **Wiki `[[term]]` must match a slug.** `[[Append-only log]]` is fine *as display text*, but the slug it resolves to is `append-only-log` (lowercased, hyphenated). Use `[[display|target-slug]]` when display and target differ. A typo'd slug renders as a dead link.

4. **Satellite repo slug ≠ repo name sometimes.** dalkkak-ai's repo is `ddalkkak` but the slug is `dalkkak-ai`. Lock the slug in the satellite's `CLAUDE.md` before writing entries.

5. **Leave `content/knowledge/ko/` empty** (English-first). No KO mirror entries for the wiki.

6. **`.human.mdx` doesn't need frontmatter.** If you add some, it's ignored. Body only.

7. **Adding content doesn't trigger the dual-write requirement.** Dual-write is for *code changes and non-trivial decisions* (see `CLAUDE.md`). Publishing a post, wiki entry, or log entry is routine — just commit and push.

---

## 13. The exact five-step recipe for your first retro post

```bash
# 1. create the file
touch content/posts/en/2026-05-30-<your-slug>.mdx

# 2. write the body (use the template below for frontmatter)
```

```yaml
---
title: "..."
description: "..."
date: "2026-05-30"
language: "en"
format: "before-after"
handwritten: true
tags: ["industry-retro"]
---

## What I did
...

## What it looked like before
...

## What I changed
...

## What happened
...

## What it doesn't do / what's next
...
```

```bash
# 3. preview locally (optional)
npm run dev
# → http://localhost:3000/posts/2026-05-30-<your-slug>

# 4. verify the build (optional)
npm run build

# 5. push
git add content/posts/en/2026-05-30-<your-slug>.mdx
git commit -m "post: <slug>"
git push origin main
```

1–2 minutes later:
- The post: `https://daeseon.ai/posts/2026-05-30-<slug>`
- The tag cluster: `https://daeseon.ai/posts/tag/industry-retro`
- The listing: `https://daeseon.ai/posts` (your post shows "BY HAND" in the meta row)

---

## 14. Live pages for visual reference

| Page | URL |
|---|---|
| Home | https://daeseon.ai/ |
| Posts | https://daeseon.ai/posts |
| Post detail (example) | https://daeseon.ai/posts/install-claude-code-project-log |
| Tag filter | https://daeseon.ai/posts/tag/claude-code |
| Wiki list | https://daeseon.ai/wiki |
| Wiki detail (example) | https://daeseon.ai/wiki/append-only-log |
| Project (example) | https://daeseon.ai/projects/shadow-ai |
| About | https://daeseon.ai/about |

![Home](./blog-guide-screens/home.png)
![About](./blog-guide-screens/about-page.png)

---

## 15. Maintaining this guide

Edit this file directly. To re-capture screenshots:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless --disable-gpu --hide-scrollbars \
  --window-size=1280,1800 \
  --screenshot=docs/blog-guide-screens/<name>.png \
  "https://daeseon.ai/<path>"
```

When the design changes meaningfully (i.e., after the 5-post threshold redesign), re-capture everything in one pass.

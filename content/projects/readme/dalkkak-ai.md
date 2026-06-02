<div align="center">

<img src="landing/images/web/banner.jpg" alt="DalkkakAI — a relaxed robot-sloth running every dashboard from one hammock" width="720" />

# DalkkakAI · 딸깍AI

**One window for every startup you're running — a native, multi-pane command deck for the solo founder who brings their own AI**

<sub>A lightweight **Tauri + Rust** desktop app. Many live terminal panes, across **many startups at once**, each pane a persistent `tmux` session — plus a connective layer that turns your git history and your own Claude Code sessions into a **cross-startup pulse of real work**. It never calls an LLM itself: **you bring your own Claude Code / Codex.**</sub>

[**🌐 Live site → ddalkkak.daeseon.ai**](https://ddalkkak.daeseon.ai)

**English** · [한국어](./README.ko.md)

![Tauri](https://img.shields.io/badge/Tauri-2.x-FFC131?logo=tauri&logoColor=black)
![Rust](https://img.shields.io/badge/Rust-portable--pty%20%2B%20tokio-000000?logo=rust&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![xterm.js](https://img.shields.io/badge/terminal-xterm.js%206%20%2B%20tmux-4E9A06)
![platform](https://img.shields.io/badge/platform-macOS%20Apple%20Silicon-black?logo=apple)
![status](https://img.shields.io/badge/status-v0.2.0%20beta%20·%20unsigned-orange)
![license](https://img.shields.io/badge/license-MIT-green)

</div>

---

> **TL;DR.** A native macOS (Apple Silicon) **multi-pane terminal workspace built around running several startups at once.** Every pane is a live shell backed by a persistent `tmux` session; every *startup* is a first-class workspace with its own pane layout and its own granted project folder. On top of that terminal substrate, DalkkakAI builds a **connective layer**: a 20-second worker turns the git history of the repos you grant into a per-startup *change graph*, and your own Claude Code sessions are read — through Claude Code **hooks** and **transcripts**, never by faking data — into a cross-startup **Pulse** of effort, momentum and friction (**tokens as a measure of effort, never a dollar bill**). DalkkakAI **does not call any AI itself** — you bring your own Claude Code / Codex. Shipped as an **unsigned v0.2.0 beta with zero production users**; the cloud backend, auth and billing are scaffolds or roadmap. Every bug and decision is captured in a disciplined in-repo system of six-section post-mortems, ADRs, and a dated build log published to a blog.

## Table of contents

- [What is DalkkakAI?](#what-is-dalkkakai)
- [Why this project](#why-this-project)
- [Product walkthrough](#product-walkthrough)
- [The multi-startup model & the connective layer](#the-multi-startup-model--the-connective-layer)
- [The augmentation layer](#the-augmentation-layer)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Engineering discipline](#engineering-discipline)
- [Monetization](#monetization)
- [Security & privacy](#security--privacy)
- [Run it locally](#run-it-locally)
- [Honest limitations](#honest-limitations)
- [Project layout](#project-layout)

---

## What is DalkkakAI?

<img src="landing/shots/cockpit.jpg" alt="The DalkkakAI cockpit: a startup sidebar on the left, four live terminal panes running Claude Code and OpenAI Codex side by side" width="100%" />

*딸깍 (ddalkkak)* is the Korean word for the small *click* of a switch — the sound of a thing just getting done. The mascot is a sloth in a hammock running every dashboard at once, because the AI is doing the clicking.

DalkkakAI is the answer to one concrete, measured pain: its author runs **roughly 12 macOS desktops at the same time** while building services — about *1–3 startups × ~4 tools (Claude Code, an editor, a browser, a terminal)* — and the day is spent in Mission Control, losing context and never knowing at a glance which AI session is working, idle, or stuck (`docs/BLUEPRINT.md §2`).

So the product is **one native window** that holds:

1. **Many startups, side by side.** A left sidebar lists your startups (workspaces); each one owns its own grid of terminal panes and its own granted project folder. Switch with `⌃1–9`. This is the organizing axis of the whole app — *N startups in one workspace, not one project at a time* (`docs/BLUEPRINT.md §1, §4`).
2. **Many live shells, in a resizable grid.** Each pane is a real PTY backed by a persistent `tmux` session, so your running `claude` or `codex` survives a layout change *and* an app restart.
3. **A connective layer on top.** DalkkakAI watches the repos you explicitly grant and reads your AI sessions, then surfaces — *honestly, with provenance* — what actually changed across your whole portfolio this week.

The terminal grid is the **substrate**; the connective layer across startups is the **product**. The stated north-star is *"everything a one-person founder needs to **start → build → manage → operate** new services — across several startups at once"* (`docs/BLUEPRINT.md §1`, refined 2026-05-30).

> The screenshot above is real: six startups in the sidebar (`Dalkkak`, `Mimi`, `ki-clash`, `daeseonblog`, `EnglishGlass`, `BackendPlatform`), four panes running the author's own **Claude Code (Opus)** and **OpenAI Codex** sessions — the three Claude Code panes each showing a `done` status and a `✦ Summarize` action. DalkkakAI supplies the workspace around those tools — it does not run them for you.

---

## Why this project

> *For reviewers in a hurry — the engineering this repo actually demonstrates, each line traceable to a file.*

<sub>*File paths are relative to the repo root: the Rust backend lives under `apps/desktop/src-tauri/src/`, the React renderer under `apps/desktop/src/`.*</sub>

- **🏢 Multi-startup as a first-class primitive — shipped, not slideware.** A `Startup` is a real model (`id / name / emoji / layout / optional path-grant`) persisted to `localStorage`; each startup carries its own `react-mosaic` pane-layout tree and its own granted folder, switchable by `⌃1–9` / `⌃Tab` / `⌘⌥↑↓` (`apps/desktop/src/startups.ts`, `App.tsx`, `Sidebar.tsx`). This is the product's defensible wedge and the one claim I'll lean on hardest.
- **🧬 A connective layer over the whole portfolio.** A 20-second Rust worker shells out **read-only** to `git` in each granted repo and appends new commits as validated, append-only JSONL *graph nodes* (`<startup>/change/<hash>`, provenance = `confirmed`), which a panel then reads cross-startup (`src-tauri/src/capture.rs`, `packages/shared/src/graph.ts`, `GraphPanel.tsx`).
- **📊 Read-time, zero-storage cross-startup metrics with honest units.** A "Pulse" rolls up a 14-day window from three real sources — Claude Code hooks, session transcripts, and git change-nodes — into six views (effort / momentum / fan-out / explore-vs-produce / friction / shipped-vs-thrash). It stores nothing and **never shows a dollar figure** — output tokens are reported as a proxy for *effort*, explicitly *"not a $ bill (subscription)"* (`src-tauri/src/pulse.rs`, `docs/USAGE_PULSE.md`).
- **🔌 Systems-level debugging under a GUI sandbox.** A Tauri GUI bundle inherits a near-empty environment, which produced concrete, documented bugs: `claude --resume` froze ~15s (missing `TERM`/locale), `tmux` silently failed (Homebrew off `PATH`), and `codex` became "command not found" because a leaked `npm_config_prefix` stopped `nvm` from loading. The fix sets `TERM`/`COLORTERM`/locale, *augments* `PATH`, **strips every `npm_config_*`**, and wraps spawns in `bash` so failures print instead of freezing (`src-tauri/src/pty.rs`; post-mortems in `docs/ISSUES.md`).
- **🧱 A non-obvious architecture call.** Terminals and PTYs live in a **module-level registry outside React**, so `react-mosaic` remounts (which fire on every split) don't kill your running session — the pattern VS Code uses to host its terminals (`apps/desktop/src/terminalRegistry.ts`).
- **🤖 Reliability over cleverness.** Per-pane session status is driven by **Claude Code hook events**, not by scraping the TUI — after an honest admission that a hand-rolled stream parser captured *zero* real events (`src-tauri/src/hooks.rs`, `sessionStatus.ts`; `content/logs/.../streamparser-hardcoded-admission.mdx`).
- **🧭 BYO, by principle.** Almost the entire app is pure local logic; the only outbound AI call is the user's *own* `claude -p` for an on-demand summary, in a single Rust module (`src-tauri/src/summarize.rs`). DalkkakAI never marks up tokens and never proxies your keys (`docs/BLUEPRINT.md §5`).
- **📓 Documentation discipline that's unusual for a solo project.** 10 dated post-mortems, 8 ADRs, 23 problem-indexed troubleshooting entries, and 40 dated build-log narratives — under anti-hallucination rules codified in `CLAUDE.md` (see [Engineering discipline](#engineering-discipline)).
- **🗣️ Honest communication.** This README leads with what *isn't* built; every number above is traceable to a file or a `git` measurement.

---

## Product walkthrough

| Flow | What happens | Status |
|---|---|---|
| **Run many startups** | A sidebar of workspaces; each has its own pane layout + granted folder. `⌃1–9` switch, `⌃Tab` cycle, `⌘⌥↑↓` walk. | **shipped** |
| **Open & arrange panes** | A `react-mosaic` grid of live shells. `⌘D` split · `⌘⇧D` stack · `⌘W` close · Reset · `⌘1–9` focus · `⌘[ ⌘]` cycle. | **shipped** |
| **Persistent sessions** | Each pane is a `tmux` session (`dalkkak-<id>`) on a private socket — survives splits and app relaunch; orphans are GC'd on launch. | **shipped** |
| **See what each AI is doing** | A per-pane status bar driven by Claude Code **hook** events: thinking / tool-call / blocked / done. | **shipped** |
| **Summarize a session** (`✨` / `⌘I`) | Reads the session **transcript** and shows token accounting + the latest self-summary card. | **shipped** |
| **Read the conversation** (`⌘L`) | Renders the raw scrollback into a clean, scrollable chat log (recent 800 entries), with copy buttons. | **shipped** |
| **Cross-startup Pulse** (`📊 Graph → Pulse`) | Six read-time views of effort, momentum, fan-out, explore/produce, friction, shipped-vs-thrash across all startups. | **shipped** |
| **Change graph** | Grant a folder → your git commits become a per-startup / cross-startup graph (React Flow), within ~20s. No LLM. | **shipped** |
| **Scroll & copy** | `⌘↑` enters `tmux` scroll mode (no mouse mode); selecting text or clicking a colored token auto-copies. | **shipped** |
| **Shortcuts & language** | `⌘/` opens the shortcut guide; a `🌐` toggle switches the augmentation UI between `en` / `ko`. | **shipped** |

---

## The multi-startup model & the connective layer

> This is the heart of the project — the thing that makes it *a solo founder's operating layer* rather than "another terminal." Everything here is shipped code with citations; the broader operator vision is flagged honestly in [Honest limitations](#honest-limitations).

### A startup is a first-class workspace

A `Startup` is `{ id, name, emoji, createdAt, grant? }`, persisted under `dalkkak.startups.v1`. Each startup gets:

- **its own pane layout** — a separate `react-mosaic` tree under `dalkkak.layout.<startupId>.v1`, loaded when you switch to it;
- **its own granted project folder** — an explicit, confirmed path grant (see [Security](#security--privacy)), used as the `cwd` for that startup's panes and as the only directory the connective layer is allowed to read;
- **its own keyboard slot** — `⌃1–9`, plus `⌃Tab` / `⌘⌥↑↓` to cycle.

(`apps/desktop/src/startups.ts`, `App.tsx`, `Sidebar.tsx`, `pathGrant.ts`.)

### The connective layer — "commits-first" v0

The thesis (`docs/BLUEPRINT.md §5.5`, `docs/CONNECTIVE_LAYER.md`) is that the panes and sessions are where work *happens and data is born*, and a **living cross-portfolio graph** is what binds them into one operating layer. The shipped v0 is deliberately narrow and honest:

- A **20-second Tokio worker** runs `git -C <granted-root> log/show` (read-only subprocess, no `git2`) over each startup you've granted (`src-tauri/src/capture.rs`).
- New commits become **append-only JSONL `change` nodes** — deterministic `node_id = <startup>/change/<hash>`, `provenance = confirmed`, validated on write (non-empty title; confirmed nodes must carry evidence). The schema is **versioned and locked** (`SCHEMA_VERSION = 1`) with `confirmed | inferred | hypothesis` provenance so an inferred node can never masquerade as a fact (`packages/shared/src/graph.ts`, `validate.ts`).
- A read surface (`GraphPanel.tsx`, *"deliberately dumb — its job is to prove capture → store → read end-to-end"*) shows the nodes **per-startup or aggregated across all startups**, as a recap list, an Activity view, or a React Flow dependency graph grouped by the code area each commit touched.

The non-negotiable design rule, in the author's words: *"logging and standards must **never distort the work**"* — so the commit→recap transform uses the real subject and real `--stat` file/line counts and **refuses to invent** a next-step or an added/edited/deleted tag a `--stat` can't prove (`apps/desktop/src/viz/nodeToRecap.ts`).

### The cross-startup Pulse

<img src="landing/shots/pulse.jpg" alt="The Pulse dashboard: six cards comparing effort, momentum, fan-out, explore-vs-produce, friction, and shipped-vs-thrash across every startup" width="100%" />

The **Pulse** (`📊 Graph → Pulse`) is the clearest expression of the multi-startup thesis. A Rust command (`src-tauri/src/pulse.rs`, ADR-005) does a **read-time, zero-storage** rollup over a 14-day window, attributing each session to a startup by longest-path-prefix (ambiguous → the literal `unassigned`, never a guess), from three real sources — the hook stream, each session's transcript, and the git change-nodes. Six views:

| View | Plain-language question it answers |
|---|---|
| **Effort split** | How much did the AI generate in each startup this week? (output tokens = effort, *not* a bill) |
| **Momentum** | How many of the last 14 days did you move this startup? (a long gap = it's stalling) |
| **Fan-out / scope** | Internal steps per question — higher than usual = a big task or a vague ask |
| **Explore vs produce** | Is the AI mostly reading/searching, or editing/running? |
| **Friction** | Where the flow stalls — times the AI paused waiting on you, plus tool errors |
| **Shipped vs thrash** | Asks vs commits that day — many asks → 0 commits = churn |

Every unit is honest: *"output tokens / active days / counts — **never a `$`**."* On a Max subscription there is no per-token bill, so DalkkakAI never fabricates a dollar figure (`apps/desktop/src/viz/PulsePanel.tsx`, `usagePulse.ts`).

---

## The augmentation layer

Around the BYO terminal, a set of React renderers turn raw session output into something legible — **on demand**, read from the transcript, never by faking live data.

<table>
<tr>
<td width="50%"><img src="landing/shots/summary.jpg" alt="Session summary modal with token accounting and a concept card explaining caching" width="100%" /></td>
<td width="50%"><img src="landing/shots/log.jpg" alt="Conversation log modal rendering a Claude session as a clean transcript" width="100%" /></td>
</tr>
<tr>
<td align="center"><sub><b>Session summary</b> — real token accounting (output / input / cache; no $) plus the latest self-summary card.</sub></td>
<td align="center"><sub><b>Conversation log</b> — raw scrollback rendered as a readable chat, with decisions and code-block copy.</sub></td>
</tr>
</table>

- **The `<dk-summary>` protocol.** DalkkakAI installs a *its-own-only* `claude` wrapper (`src-tauri/src/inline.rs`) that appends a system-prompt directive asking the model to end each reply with a small `<dk-summary>{…}</dk-summary>` JSON block — one of `recap | plan | question | concept | note`. The block stays visible in the terminal; the **card is read reliably from the transcript** (`read_inline_summary`), not by parsing the mangled TUI stream (ADR-003 / ADR-004).
- **Cards.** Six renderers exist, each pulling typed data from `@ddalkkak/shared`. Five — `RecapCard`, `PlanCard`, `QuestionCard`, `ConceptCard`, `NoteCard` — render the on-demand summary (the `<dk-summary>` directive emits exactly those five kinds); `MermaidCard` (sanitizes LLM diagrams with `securityLevel: 'strict'`, zoom/pan-able, *requires* a plain-language caption) is currently wired only into the in-app viz demo.
- **Token accounting, honestly.** `session_usage` sums the **real** per-message `usage` from the transcript into a session total and a current-turn total (input / output / cache) — *"so we report tokens, not dollars (no fabricated $)."*
- **Reliable status from hooks.** Live per-pane status comes from Claude Code **hook events** (`hooks.rs` tails `session-events.jsonl` → a `session-hook` event → coarse states), which replaced an earlier stream-scraping parser that didn't work on real output.

> **Be precise:** the summary cards appear **on demand** (`✨` / `⌘I`), read from the transcript — *not* as live cards streaming inline as the model types (that wiring exists in code but is deliberately not connected). `diff` / `metric` / `trend` kinds are in the locked vocabulary but **have no renderer yet**.

---

## Tech stack

| Layer | Choice |
|---|---|
| **Desktop runtime** | Tauri 2.x (`ai.ddalkkak.desktop`) |
| **Local backend** | Rust — `portable-pty` 0.9, `tokio` 1.52, `tracing` + `tracing-appender`, `chrono`, `dirs`, `serde` · **2,106 LOC / 10 files** |
| **Renderer** | React 19 + TypeScript 5.8 + Vite 7 · **40 files / ~5,274 LOC** |
| **Terminal** | `xterm.js` 6 + `fit` / `clipboard` addons (WebGL addon present but **parked** — it broke Korean IME) |
| **Pane layout** | `react-mosaic-component` 6.1.1 (pinned) |
| **Graph / diagrams** | `@xyflow/react` (React Flow) 12 · `mermaid` 11 · `framer-motion` 12 · `react-zoom-pan-pinch` |
| **Markdown** | `react-markdown` + `remark-gfm` |
| **Sessions** | `tmux` system daemon — private socket `-L dalkkak`, one session `dalkkak-<pane-id>` per pane |
| **IPC** | **19 Tauri commands** + **2 event streams** (`pty-output`, `session-hook`) |
| **The AI (BYO)** | the user's *own* Claude Code / OpenAI Codex run inside panes; the on-demand summary shells out to the user's `claude -p` (`claude-haiku-4-5`) with API-key env vars stripped to force subscription auth |
| **i18n** | `ko` / `en` for the augmentation UI (dependency-free), default `en` |
| **Monorepo / tooling** | pnpm 9.12 workspaces · Biome 1.9 · Node ≥ 22 |
| **Bundle** | Apple-Silicon `.app` + `.dmg` (the v0.2.0 download is **~8.9 MB**), **unsigned** |

**Why Tauri, not Electron or a web app.** A browser can't spawn a PTY, and spawning the user's local `claude`/`codex` binary is the entire point — a web app is *technically incapable* of solving the problem (`docs/BLUEPRINT.md §6`). Tauri gives a small bundle on the system WebKit with a Rust backend that owns the process tree. **Why not Swift:** it would rule out a future Linux/Windows build for no feature gain.

> The internal monorepo also defines `@ddalkkak/{advisor, platform-client, skills, viz}` — these are **named placeholders** (a one-line export each), reserved for roadmap layers. Only `@ddalkkak/augmentor` and `@ddalkkak/shared` contain real, imported code.

---

## Architecture

```
                         ┌──────────────── one native window (Tauri) ────────────────┐
                         │                                                            │
  ┌─────────┐   ⌃1–9     │   ┌────────── React renderer (40 files) ──────────┐        │
  │ Startup │ ───────────┼──▶│  Sidebar · Mosaic grid · per-startup layout    │        │
  │ sidebar │            │   │  terminalRegistry (xterm + PTY live OUTSIDE     │        │
  └─────────┘            │   │  React, survives mosaic remounts)              │        │
                         │   └───────────────┬───────────────┬────────────────┘        │
                         │   19 commands ▲    │ pty-output    │ session-hook            │
                         │   ───────────┘     ▼ (event)       ▼ (event)                 │
  Granted repo  ◀── read-only git ──┐   ┌──────────────── Rust backend ───────────────┐ │
  (per startup)                     │   │ pty.rs   spawn /bin/bash → tmux(-L dalkkak)  │ │
        │                           │   │          env hygiene · visible EOF marker    │ │
        ▼  every 20s                └──▶│ capture.rs  git log/show → append-only JSONL  │ │
  GraphStore (.../DalkkakAI/graph/<startup>.jsonl)  │  graph nodes (confirmed)          │ │
        │                               │ hooks.rs  tail session-events.jsonl → status  │ │
        ├──▶ GraphPanel (per-startup / cross-startup)│ summarize.rs  transcript → usage /  │ │
        └──▶ Pulse (read-time 14-day rollup, no $)   │   inline card / readable log; or    │ │
                                                     │   user's own `claude -p` (BYO)      │ │
                                        paths.rs  PathAllowlist — hard-refuse ungranted    │ │
                                        entitlement.rs  trial/paywall gate (local STUB)    │ │
                                        └──────────────────────────────────────────────────┘ │
                                                                                              │
   Layer-2 logging: Rust `tracing` → ~/Library/Logs/DalkkakAI/runtime.log.<date> (daily)      │
   └──────────────────────────────────────────────────────────────────────────────────────┘
```

**Key decisions** (each is an ADR or a documented post-mortem):

- **Terminal lifetime is decoupled from React.** `react-mosaic` keys panes by their path in the layout tree, so a split looks like an unmount and a naive build kills the PTY. xterm + PTY live in a module-level registry; the React component only re-parents the terminal's DOM node (`terminalRegistry.ts`).
- **Persistence is tmux, not a bespoke protocol.** Each pane attaches `tmux new-session -A -D -s dalkkak-<id>` on a private `-L dalkkak` socket; the daemon outlives the app, so panes re-attach on relaunch. The layout tree itself is JSON in `localStorage`.
- **Subprocesses get an explicit environment.** Set `TERM`/`COLORTERM`/locale, *augment* `PATH` with Homebrew, **strip all `npm_config_*`** (so `nvm` loads and `codex` resolves), and wrap the spawn in `bash` so a failure prints a readable line instead of a frozen pane (RULE #5b–#5d; `pty.rs`).
- **Status from hooks, not scraping.** Reliable signal comes from Claude Code's hook events, not the TUI byte stream (ADR-001).
- **Metrics are a read-time *pulse*, not a telemetry pipeline.** Nothing is stored; everything is rolled up on read, in honest units (ADR-005).
- **The filesystem reach is a single chokepoint.** `PathAllowlist` canonicalizes + symlink-resolves a granted path and **hard-refuses** anything ungranted — it never falls back to `$HOME` for capture (`paths.rs`).

---

## Engineering discipline

This is, deliberately, half the point of the project — turning every bug and decision into a reusable asset. All of the following are real files on disk, not aspirations:

- **[`docs/ISSUES.md`](docs/ISSUES.md)** — **10 dated post-mortems** (9 in the full six-section structure — *Symptom / Root cause / Fix / was-the-instruction-at-fault / was-it-avoidable / Lessons* — plus one follow-up), each scored on a prompt-quality and an avoidability rubric, with **verified commit hashes**. Bug classes include Korean/CJK IME in WKWebView, the `npm_config_prefix` → `nvm` → `codex` trap, a `tmux` mouse-mode scrollback regression, a React error-boundary whiteout, and a `useEffect` persistence race.
- **[`docs/DECISIONS.md`](docs/DECISIONS.md)** — **8 ADRs (ADR-001 → ADR-008)** with real status discipline (`Accepted`, `Superseded`, `Proposed / Not adopted`): per-session status via hooks (001), the inline-summary fast path (003) and reading it from the transcript (004), the read-time pulse (005), the v3 blueprint recorded as a *non-adopted draft* (006), opt-in worktree concurrency (007), and monetization v1 (008).
- **[`docs/troubleshooting.md`](docs/troubleshooting.md)** — **23 terse, problem-indexed entries** (*Symptom / Cause / Fix / Commit / Pattern*).
- **[`content/logs/dalkkak-ai/`](content/logs/dalkkak-ai/)** — **40 dated narrative build-log entries** (`.mdx` with YAML frontmatter), published to the cross-repo timeline at [daeseon.ai/projects/dalkkak-ai](https://daeseon.ai/projects/dalkkak-ai).
- **[`docs/MILESTONES.md`](docs/MILESTONES.md)** — 15 milestone entries, each written in three registers (🔧 Engineering / 💬 Raw / 📣 Marketing).

The protocol is codified in [`CLAUDE.md`](CLAUDE.md) (the agent operating rules for this repo): RULE #6 *"Issues are assets — patching and moving on is forbidden,"* a two-layer logging rule, and a dual-write logging contract with **non-negotiable anti-hallucination rules** (literal symptom, verified cause, fix names actual files, commit hash *after* committing). These are house rules written into `CLAUDE.md` rather than machine-enforced.

---

## Monetization

The business model is **ADR-008** (`docs/DECISIONS.md`, *Accepted 2026-06-02*): a hard **14-day free trial → paid subscription**, no perpetual free tier. Pricing, verified in code (`apps/desktop/src/entitlement.ts`) and on the landing page:

- **$96 / year** (headline) or **$12 / month**, USD — annual is ~33% off the monthly run-rate to absorb the merchant-of-record fee.
- **0% token markup** — bring your own Claude / Codex; DalkkakAI never marks up tokens.
- Two AI modes are *planned* — **BYO** (build first) and a future **Managed** mode framed explicitly as an infrastructure + learning investment, *not* a margin bet.

**What is actually wired today (and what isn't):** the entitlement **gate** is real and end-to-end — a Rust `get_entitlement` command, called once on launch, hard-locks the whole workspace behind a `<Paywall>` when not entitled. But the entitlement **backend is an explicitly-labeled local STUB**: a spoofable file-based trial clock plus a `DALKKAK_ENTITLEMENT` dev override, **failing *open*** on error by design. **No payment is wired** — the checkout button opens the placeholder `https://polar.sh/REPLACE_ME`; Polar is the intended merchant-of-record and Supabase the intended source-of-truth, both roadmap (`src-tauri/src/entitlement.rs`, `Paywall.tsx`).

---

## Security & privacy

DalkkakAI runs your shells and reads your repos, so its reach is constrained deliberately (`docs/BLUEPRINT.md §5.5`, `docs/CONNECTIVE_LAYER.md`).

| Concern | Implementation |
|---|---|
| **Filesystem reach** | Per-project **path grants** only. A native folder picker feeds the path to `grant_project_path`, which canonicalizes + symlink-resolves it; a single `PathAllowlist` chokepoint **hard-refuses any ungranted path** and never falls back to `$HOME` for capture (`paths.rs`). |
| **No scary OS permissions** | The model is tuned to what an ordinary user will grant — no blanket Full Disk Access. Our *automation* only ever touches confirmed project paths (the raw shell you type into is governed by normal OS prompts). |
| **Git reads are read-only** | Capture shells out to `git log` / `git show` only — it never writes to your repos. |
| **Provenance, not guesses** | Every graph node carries `confirmed / inferred / hypothesis`; confirmed nodes must carry evidence, and recap cards refuse to invent facts a `git --stat` can't prove. |
| **No fabricated money** | Token counts are reported as effort; the app never invents a dollar figure for a flat-rate subscription. |
| **Your keys stay yours** | DalkkakAI makes no AI calls of its own; the one summary feature runs *your* `claude` binary and strips `ANTHROPIC_API_KEY` to force your own subscription auth. |
| **Logging never logs secrets** | Two-layer logging records IDs, counts and lifecycle events — never passwords, tokens, keys or PII (CLAUDE.md). |

---

## Run it locally

**Requirements:** macOS (Apple Silicon), the Rust toolchain, Node ≥ 22, pnpm, and `tmux` (`brew install tmux`).

```bash
pnpm install
cd apps/desktop && pnpm tauri dev   # opens the native window
```

Production build / typecheck / lint:

```bash
pnpm --filter appsdesktop build      # tsc + vite (frontend) — passes clean (chunk-size warning only)
pnpm --filter appsdesktop typecheck  # tsc --noEmit
pnpm lint                            # biome check .
cd apps/desktop && pnpm tauri build  # produces the .app + .dmg (Apple Silicon)
```

**Or just download it.** The v0.2.0 Apple-Silicon `.dmg` (~8.9 MB) is linked from **[ddalkkak.daeseon.ai](https://ddalkkak.daeseon.ai)**. It's an **unsigned beta**, so the first launch needs right-click → Open (or `xattr -cr`).

---

## Honest limitations

> Stated plainly — knowing the edges is part of the engineering, and this repo's house rule is to lead with what *isn't* done.

- **No automated tests.** There is **zero** test code today (no Vitest, no `cargo test`), even though `CLAUDE.md` mandates both. Verification has been manual + a clean production build. This is the most obvious next investment.
- **Unsigned, macOS Apple Silicon only.** No code-signing, notarization, or auto-updater; no Windows/Linux build pipeline. First launch shows an "unidentified developer" warning.
- **Zero production users; the formal one-week dogfood test hasn't run.** The MVP success criterion — *replace 12 desktops with one app for a full week* — is a goal, not a result. (Informal daily dogfooding is happening.)
- **The cloud half of the blueprint is not built.** No cloud backend (`apps/cloud` doesn't exist), no Supabase auth/DB, no Java billing platform, no multi-device sync. Layout/state is `localStorage`-only, single-user, single-machine.
- **No managed-AI control plane.** The "managed mode" / request-routing-and-metering layer is a single *learning-track* bullet in ADR-008 — **no code, no dedicated spec.** (If older notes reference `docs/AI_REQUEST_CONTROL.md` or an `ADR-009`, those do not exist on disk.)
- **Monetization is a scaffold.** Real billing is not wired; the trial clock is a spoofable local stub and checkout is a placeholder URL (see [Monetization](#monetization)).
- **GPU rendering is parked.** The xterm WebGL addon broke Korean (CJK) IME in WKWebView, so all panes use the slower DOM renderer; the attach/detach code is dead until that's solved. Relatedly, Korean IME is still broken in the *first* pane of a window (workaround: split into a fresh pane) — an unresolved WKWebView issue.
- **The augmentor stream-parser is a known-broken prototype.** It's kept on a dev-logging-only path; reliable status comes from hooks instead.
- **The grand "operator across a portfolio" vision is an explicitly non-adopted v3 draft.** A 2026-06-01 strategic review concluded the BYO terminal + augmentation *substrate* is becoming first-party table-stakes (e.g. Anthropic's own desktop tooling). The bet that stays differentiated — and what this README emphasizes — is the **cross-startup connective layer**; the advisor agent, uptime/metrics monitoring, and architecture viz of that vision are **not built** (`content/logs/.../blueprint-v3-reckoning.mdx`).
- **Version drift to be aware of.** The shipped product is **v0.2.0** (desktop `package.json` + `tauri.conf.json` + git tag); the repo-root `package.json` is `0.0.0` (a monorepo placeholder) and `Cargo.toml` is an un-bumped `0.1.0`.

---

## Project layout

```
apps/desktop/
  src/                      React renderer (40 files / ~5,274 LOC)
    App.tsx                 mosaic layout · startups · shortcuts · paywall gate
    terminalRegistry.ts     xterm + PTY registry (lives OUTSIDE React)
    TerminalPane.tsx        thin DOM attachment point + status bar
    Sidebar.tsx  startups.ts  pathGrant.ts   multi-startup model + per-startup grants
    GraphPanel.tsx          connective-layer read surface (per/cross-startup)
    entitlement.ts  Paywall.tsx                ADR-008 trial/subscription gate
    sessionStatus.ts  summary*.ts  usagePulse.ts  logModal.ts   augmentation glue
    viz/                    card renderers · PulsePanel · LogPanel · GraphView · OrchestrationView
    i18n/                   ko / en dictionaries (augmentation UI)
  src-tauri/src/            Rust backend (2,106 LOC / 10 files) — 19 commands, 2 events
    pty.rs                  PTY + tmux, env hygiene, visible EOF marker
    capture.rs              20s git→graph-node worker (read-only)
    hooks.rs                tail session-events.jsonl → session-hook events
    summarize.rs            transcript → usage / inline card / readable log; BYO `claude -p`
    pulse.rs                read-time, zero-storage cross-startup rollups
    inline.rs               installs the DalkkakAI-only claude wrapper (<dk-summary>)
    paths.rs                PathAllowlist chokepoint
    entitlement.rs          trial/paywall gate (local STUB)
    lib.rs                  Tauri entry · command registry · two-layer logging
packages/
  augmentor/  shared/       real, used libs (PTY-output parser · graph schema + viz vocab)
  advisor/ platform-client/ skills/ viz/   named placeholders (roadmap)
landing/                    static bilingual landing page (ddalkkak.daeseon.ai) + screenshots + .dmg
docs/                       BLUEPRINT · CONNECTIVE_LAYER · ROADMAP · ISSUES · DECISIONS · MILESTONES · …
content/logs/dalkkak-ai/    40 dated build-log entries (rendered on the blog)
old_repo/                   frozen v1 (Python/FastAPI), read-only reference
CLAUDE.md                   agent operating rules for this repo
```

---

<div align="center">

**[DalkkakAI · 딸깍AI](https://ddalkkak.daeseon.ai)** — one window for every startup you're running.

<sub>Repo: <a href="https://github.com/Daeseon-AI-Factory/ddalkkak">Daeseon-AI-Factory/ddalkkak</a> · Live: <a href="https://ddalkkak.daeseon.ai">ddalkkak.daeseon.ai</a> · Build log: <a href="https://daeseon.ai/projects/dalkkak-ai">daeseon.ai/projects/dalkkak-ai</a> · <a href="./README.ko.md">한국어 README</a> · MIT</sub>

</div>

# Project Log System v1 — Blueprint

Saved verbatim from the 2026-05-31 design discussion. This document captures the *target shape* of the system at v1 completion. Updated as the spec evolves (the `## Revisions` section at the bottom tracks changes).

---

## 1. Visible surfaces (daseon.ai)

### 1.1 `daseon.ai/projects/<slug>` — per-project page

```
┌────────────────────────────────────────────────────────────────────┐
│  TubeShadow (shadow-ai)                                            │
│  YouTube clip mining + shadowing trainer · Java 21 / Spring Boot   │
│                                                                    │
│  ┌─ Status (auto-rendered) ──────────────────────────────────────┐ │
│  │ v0.4 shipped · 98 commits · 30 logged (31%) · 12 skip-marked │ │
│  │ Last update 2026-05-31 · Architecture snapshot 2026-05      │ │
│  │ [Architecture overview ↓] [Latest snapshot ↓]               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ Activity heatmap ───────────────────────────────────────────┐ │
│  │  May ████░██░░█░░██░██░█░██░░░█░██░░█░░░█░██░██░░██░██░██░██ │ │
│  │       ↑ troubleshoot  ↑ tech-retro  ↑ ux-retro  ↑ snapshot  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ── Timeline (newest first) ───────────────────────────────────    │
│                                                                    │
│  ┌─ 2026-05-31 ── tech-retro ──────────────────────────────────┐  │
│  │ Leitner SRS for drills — practice_card table          [AI] │  │
│  │ ───────────────────────────────────────────────────  [✎  ] │  │
│  │ AI entry text...                          | Human note (1주 │  │
│  │ Why: drill streak was localStorage,       | 뒤 적음)        │  │
│  │ disappeared on browser clear...           | "재미있게도..." │  │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ 2026-05-30 ── ux-retro ────────────────────────────────────┐  │
│  │ Preposition spotlight — no fake diagrams      [AI]          │  │
│  │ ──────────────────────────────────────  REVIEW NEEDED       │  │
│  │ AI entry text...                          | (empty — render │  │
│  │ "Don't fabricate a picture for...         | placeholder)    │  │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ...                                                              │
└────────────────────────────────────────────────────────────────────┘
```

**구성요소**:
- **Status header** (Phase C1): 자동 집계. commit total / logged 수 / skip marker 수 / 마지막 업데이트 / 마지막 architecture snapshot 링크.
- **Activity heatmap** (Phase C2): 달력 형태, 색상 = entry kind. hover시 그 날 entry 제목 tooltip.
- **Timeline**: 너가 이미 만든 두 컬럼 (AI / Human commentary). companion 없으면 "REVIEW NEEDED" 자리 비움.
- **Architecture overview 링크**: status header에서 클릭하면 해당 프로젝트의 architecture overview entry로 점프.

### 1.2 `daseon.ai/method` — methodology as portfolio piece

```
┌────────────────────────────────────────────────────────────────────┐
│  Method: how I record AI-pair-programmed work                      │
│  ────────────────────────────────────────────────────────          │
│                                                                    │
│  Why this exists                                                   │
│  (1 short paragraph — the problem of AI delegation +              │
│   traceability)                                                    │
│                                                                    │
│  The four properties                                               │
│  • Nothing missed by default (positive triggers)                  │
│  • AI-author + human-annotator (REVIEW NEEDED)                    │
│  • Cross-repo aggregation (logSourceRepo)                          │
│  • Methodology as portfolio (this page)                           │
│                                                                    │
│  The pieces                                                        │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ ▸ Stop hook v3 (positive triggers)        → /posts/install-claude... │
│  │ ▸ Dual-write spine                        → /posts/install-claude... │
│  │ ▸ Cross-repo aggregation                 → /posts/install-claude... │
│  │ ▸ .human.mdx companion                   → see below          │
│  │ ▸ Architecture snapshot ritual           → see below          │
│  │ ▸ Chat-capture writer (v2)               → queued             │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Try it in your own repo                                           │
│  (one-line install + pointer to /posts/install-...)                │
│                                                                    │
│  Live build journal                                                │
│  • /posts/project-log-system-v1 (this build)                       │
│  • Audit report (when published, link)                             │
└────────────────────────────────────────────────────────────────────┘
```

Header 메뉴에 `Method` 항목 추가, About에서도 link.

### 1.3 `daseon.ai/posts/project-log-system-v1` — live build post

이게 너가 말한 "별도 플젝 post". 빌드 *과정 자체*를 기록. 최종 형태:

- Why (AI delegation + traceability)
- 4 properties (위 /method 와 동일)
- Phase A1 (positive triggers) — 어떻게 만들었는지, 어떻게 검증했는지, dogfood
- Phase A2/A3 (propagation, skip sync)
- Phase B (architecture overviews + audit backfill)
- Phase C (status header + heatmap)
- Phase D (snapshot 의식)
- Phase E (`/method` 페이지)
- 미완성 / 다음 sprint
- Code repo + install URL

길이: ~600-800줄 mdx. 각 phase가 자기 *결정 + trade-off + 결과* 포함.

---

## 2. Repo files per project

### 2.1 Satellite directory layout

```
shadow-ai/
├── .claude/
│   ├── hooks/
│   │   └── stop-check.sh           # v3 positive-trigger hook
│   └── settings.json                # hook 연결
├── CLAUDE.md                        # snippet 포함
├── docs/
│   └── troubleshooting.md           # 문제별 grep 캐시 + skip markers
└── content/
    └── logs/
        └── shadow-ai/
            ├── 2026-05-31-architecture-overview.mdx       # 한 번 작성, 큰 변경 시 갱신
            ├── 2026-05-31-monthly-snapshot.mdx            # 매월 (kind: snapshot)
            ├── 2026-05-31-leitner-srs-for-drills.mdx      # 일반 tech-retro
            ├── 2026-05-30-jwt-revocation-token-version.mdx
            └── 2026-05-29-strategic-call-paddle-vs-portone.mdx  # kind: business (visibility: private)
```

### 2.2 Hub directory layout

```
daseon-blog/
├── content/
│   ├── logs/
│   │   ├── daeseon-ai/                       # hub's own logs
│   │   │   ├── 2026-05-31-stop-hook-v3.mdx
│   │   │   └── ...
│   │   ├── shadow-ai/                        # human companion files for satellite logs
│   │   │   └── 2026-05-31-leitner-srs-for-drills.human.mdx
│   │   ├── ddalkkak/
│   │   │   └── 2026-05-30-connective-layer.human.mdx
│   │   └── meta-smart-glass/
│   │       └── 2026-05-30-look-feature.human.mdx
│   ├── projects/{en,ko}/
│   ├── posts/{en,ko}/
│   │   ├── project-log-system-v1.mdx         # 라이브 빌드 포스트
│   │   └── install-claude-code-project-log.mdx
│   └── ...
├── scripts/
│   ├── propagate-hook.sh                     # ← v3 hook을 4 satellite로 동기화
│   └── sync-skip-markers.sh                  # ← skip marker 일괄 reconcile
└── install/
    ├── setup.sh
    ├── hooks/stop-check.sh
    ├── settings.json
    └── claude-md-snippet.md
```

### 2.3 Sample — general log entry (`<event>.mdx`)

```mdx
---
title: "Leitner SRS for drills — moved streak from localStorage to account"
date: "2026-05-31"
project: "shadow-ai"
kind: "tech-retro"
visibility: "public"
language: "en"
summary: "Drill streak on localStorage was disappearing on browser clear. Moved to practice_progress table keyed on user_id."
tags: ["srs", "leitner", "drill"]
---

## What I did
practice_progress 테이블 추가, 기존 localStorage 키 마이그레이션.

## Before
streak가 localStorage('drill_streak')에 저장. 사파리 데이터 삭제 / 시크릿 모드 = 0으로 리셋.

## Change
practice_progress(user_id, last_session, streak_days, ...) — JWT 인증 후 server 응답.
localStorage 한 번만 읽어서 서버로 마이그레이션, 이후 localStorage 무시.

## Result
스트릭 안전. 5명 베타 유저 중 2명이 즉시 "어 내 스트릭 살아있네" 반응.

## Doesn't / next
다중 디바이스 같은 streak 처리만 함. 시간대별 cutoff 정책 모호 — '하루'가 사용자 timezone 기준인지 server UTC인지 v0.4에선 server UTC. 사용자 피드백 받고 조정 예정.

## Commit
`fa8f1d3` — Move drill streak to practice_progress, deprecate localStorage path.
```

### 2.4 Sample — Human companion (`<event>.human.mdx`)

(블로그 repo의 `content/logs/shadow-ai/2026-05-31-leitner-srs-for-drills.human.mdx`)

```mdx
실은 이거 디버깅하는데 30분 걸렸음. AI가 testcontainer 없이 H2로 테스트 짰는데 H2의 NULL ordering이 PostgreSQL이랑 달라서 streak 비교에서 다른 결과 나왔다.

다음에 비슷한 SRS류 작업 할 때는 *처음부터* PostgreSQL testcontainer로 가는 게 맞음. AI가 H2 제안하면 거절.

UI 측면에서 — 스트릭 표시를 "🔥 5" 같은 게이지 아니라 그냥 숫자로 둔 게 좋았다. 게이미피케이션 톤이 이 앱에 안 맞음.
```

→ 두 컬럼 렌더링: 왼쪽 AI entry, 오른쪽 이 commentary.

### 2.5 Sample — Architecture overview (Phase B1, 프로젝트당 1개)

```mdx
---
title: "Architecture overview — TubeShadow (shadow-ai) as of 2026-05-31"
date: "2026-05-31"
project: "shadow-ai"
kind: "snapshot"
visibility: "public"
language: "en"
summary: "Backend: Spring Boot 3.3 on JDK 21. Frontend: Next.js 16. Postgres 15. JWT + token_version revocation. Gemini default with Claude fallback. Deployed: backend ECS, frontend Vercel. Built 2026-05-23 → present."
---

## System shape

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Next.js 16      │───▶│  Spring Boot 3.3 │───▶│  Postgres 15     │
│  Vercel          │    │  ECS Fargate     │    │  RDS             │
│                  │    │  JDK 21          │    │  V14 migrations  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Gemini / Claude │
                       │  AiAnalysisClient│
                       └──────────────────┘
```

## Key libs / modules
- `backend/app/analysis` — async pipeline, JSONB-cached
- `backend/app/practice` — Leitner SRS for drills, SM-2 for clips
- `backend/app/auth` — JWT + token_version revocation (since 2026-05-30)
- `frontend/lib/youtube` — clip mining + transcript merging
- `frontend/app/practice/` — patterns + collocations + prepositions hub

## Why these choices
- Spring Boot over Node: 6년 Java 백엔드 익숙. async pipeline에 @Async 충분.
- Next.js: i18n + ISR + Vercel free.
- Gemini default: 비용 0/month. Claude는 429일 때 fallback.
- ECS: backend가 자체 컨테이너 필요 (yt-dlp 시스템 의존).

## Boundaries
- `BLUEPRINT.md` — long-term roadmap
- `docs/troubleshooting.md` — problem-indexed grep cache (this repo, 32 entries)
- `content/logs/shadow-ai/` — dated narrative (30 entries)
- `docs/INFRA_DEEP_DIVE.md` — pre-log-system architecture doc (still authoritative)

## State of completion
v0.4 shipped. Production-ready in /personal-use sense. Live deploy + payment integration deferred (private memo).
```

### 2.6 Sample — Monthly snapshot (Phase D)

architecture overview는 *한 번 작성 + 큰 변경 시 갱신*. monthly snapshot은 *매월* — 더 짧고 차분한 변경 summary.

```mdx
---
title: "TubeShadow — May 2026 snapshot"
date: "2026-05-31"
project: "shadow-ai"
kind: "snapshot"
visibility: "public"
language: "en"
period: "2026-05"
summary: "May focus: SRS for drills + AI composition mode + hardening batch. Default LLM switched to Gemini due to Anthropic credit exhaustion."
---

## Headline changes this month
1. Drill Leitner SRS shipped (was: localStorage streak only)
2. AI composition (영작) mode added
3. Hardening batch — bounded async pool, JWT revocation, request-id MDC

## Decisions reversed
- localStorage streak → server-side (data loss bug forced this)

## In-flight
- Production deploy on ECS (CI built, not yet live)
- Paddle/PortOne monetization (private memo, no code)

## Next month likely
- Live deploy
- Recruiter outreach (post-deploy)
```

### 2.7 Sample — Chat-capture (Phase F, queued in original blueprint, promoted to v1 in Revision A)

```mdx
---
title: "Strategy chat — drill UX direction"
date: "2026-06-02"
project: "shadow-ai"
kind: "discussion"
visibility: "private"
source: "claude.ai chat"
language: "en"
summary: "Brainstormed three drill UX directions (gamified / minimal / dictation-style). Decided on minimal for v1 — gamified felt off-brand for the audience (Korean adult learners, not kids)."
---

## Context
Claude.ai 대화. 30분.

## What we discussed
세 가지 옵션 비교:
1. **Gamified** — XP bar, 🔥 streak emoji, level-up sounds. 빠른 dopamine.
2. **Minimal** — 숫자만, 색 변화 없음. 학습자 self-driven.
3. **Dictation-style** — 듣고 받아쓰기 우선, 시각 효과 0.

## Decision
Minimal. 이유:
- 타겟 = 한국 성인 학습자 (자기계발 진지하게). 게이미피케이션 톤 안 맞음.
- 미니멀이 *오래 보는* 디자인. 1주 안엔 화려한 게 매력적이지만 1달 후엔 짐.
- Dictation은 v2로. 마이크 권한 onboarding 추가 비용.

## What I'll implement
"🔥 5" → "5일째" plain text. 색 변화 없음. 한 줄.

## Files to touch (estimate)
`frontend/components/StreakBadge.tsx`, `frontend/app/practice/page.tsx`
```

### 2.8 Sample — `docs/troubleshooting.md` 엔트리

```markdown
## Drill streak disappearing on browser clear

- **Symptom**: 베타 유저 2명이 "어제까지 5일이었는데 오늘 0인데?" 보고. 사파리 사용. 브라우저 데이터 삭제 후 발생.
- **Cause**: streak가 localStorage('drill_streak')에 저장됐고, 사파리 데이터 삭제 / 시크릿 모드 = 즉시 0으로 리셋. ITP(Intelligent Tracking Prevention) 영향도 (7일 후 자동 삭제).
- **Fix**: practice_progress 테이블 추가. JWT 인증된 user_id로 streak 서버 저장. localStorage는 마이그레이션 후 무시. 파일: `app/practice/PracticeProgressEntity.kt`, `app/practice/PracticeProgressService.kt`, `frontend/lib/practice-api.ts`.
- **Commit**: `fa8f1d3`
- **Pattern**: localStorage는 sticky가 아님. 사파리 ITP, 사용자 데이터 삭제, 시크릿 모드 다 reset. *지속성 의도가 있는* 데이터는 서버로.
```

---

## 3. Automation — hook + scripts

### 3.1 Stop hook decision flow

```
commit happens
   │
   ▼
hook fires (3분 이내인지 체크)
   │
   ├─ Yes → 해시 logged? ─── Yes ─→ pass ✓
   │             │
   │             No
   │             ▼
   │       positive trigger fired?
   │             │
   │             ├─ Yes ─→ [no-log] tag? ─── Yes ─→ block (override 필요)
   │             │              │
   │             │              No ─→ block (full dual-write 필요)
   │             │
   │             └─ No ──→ [no-log] tag? ─── Yes ─→ auto-skip marker ✓
   │                            │
   │                            No ─→ block (dual-write 또는 [no-log])
   │
   └─ No → pass ✓
```

이미 구현됨.

### 3.2 Sample block message (positive trigger fires)

```
Commit a9c4911 (Install kit v3...) was tagged [no-log] but the positive trigger fired:
  - diff is 378 LOC (>200 threshold)
  - touches sensitive path: .claude/hooks/stop-check.sh install/setup.sh

Author judgment is overridden. Per CLAUDE.md, this kind of change must be 
logged regardless of tag.

Write BOTH:
  1. docs/troubleshooting.md entry
  2. content/logs/<project>/<date>-<slug>.mdx narrative

If false positive, append: <!-- override-trigger: a9c4911 ... — reason -->
```

### 3.3 `scripts/propagate-hook.sh`

너가 `install/hooks/stop-check.sh` 수정 → 이 스크립트 한 번 실행 → 4 satellite 자동 동기화. 다음번 hook 고도화부터 1줄로 끝.

### 3.4 `scripts/sync-skip-markers.sh`

각 satellite git log에서 `[no-log]` 커밋 찾아서 누락된 skip marker 일괄 추가.

---

## 4. Operational cycle

| 시점 | 작업 | 누가 | 산출물 |
|---|---|---|---|
| **매 commit (CC)** | Stop hook이 자동 판단 | Claude Code | dual-write entry 또는 skip marker |
| **매 chat 후** | 결정 또는 통찰 있으면 chat-capture | 너 (CC slash command) | `content/logs/<slug>/<date>-discussion-<slug>.mdx` |
| **매주 일요일 1시간** | `.human.mdx` annotation 라운드 | 너 | 그 주 entry들 옆에 사람 commentary |
| **매월 마지막 주말** | Monthly snapshot 5개 | 너 (AI 도움) | `<slug>/<date>-snapshot.mdx` × 5 |
| **큰 아키텍처 변경 시** | architecture overview 갱신 | AI가 초안, 너가 검토 | `<slug>/<date>-architecture-overview.mdx` 새 버전 |
| **hook 고도화 시** | propagate-hook.sh 1번 실행 | 너 | 4 satellite 자동 동기화 |
| **분기마다** | audit re-run | 너 (오늘 audit 과정 재현) | 새 audit report mdx |

---

## 5. Deferred to v2 (originally)

| 항목 | 왜 v2 | 언제 |
|---|---|---|
| Activity heatmap (Phase C2) | 데이터 viz 4-6시간 작업. v1엔 status header만 | 다음 sprint |
| Daily snapshot kind | monthly 우선. daily는 cadence 부담 | 필요해지면 |
| Chat-capture writer 풀구현 | spec 정해야 (admin UI vs CC slash) | 다음 sprint |
| Decision graph 시각화 | 멋있지만 cost 큼 | v3 |
| Global hook (~/.claude/global-hooks/) | factory script로 당장 충분 | 다중 머신 되면 |
| `/wiki` ↔ log entry backlink 자동화 | 수동 [[]]로 충분 | 필요해지면 |
| Audit auto-runner (분기 자동 실행) | 수동이 더 신중 | 의식이 자리잡으면 |

---

## 6. Completion criteria (v1)

✅ 가 되는 조건:

1. 5개 프로젝트 모두 v3 hook 작동
2. 5개 프로젝트 모두 skip marker 동기화 완료
3. 5개 프로젝트 각 architecture overview 1개씩 작성
4. Audit이 찾은 top 6 누락 커밋 backfill
5. `/projects/<slug>` 페이지에 status header 표시
6. `/method` 페이지 published
7. `/posts/project-log-system-v1` published (라이브 빌드 기록 완성)
8. 이중언어 (en + ko) 둘 다

→ 이거 다 끝나면 너는 *완성된 시스템을 portfolio piece로* 들고 다닐 수 있음.

---

## Revisions

### Revision A — 2026-05-31 (decision/discussion as first-class)

**문제**: 원래 spec에선 `tech-retro` entry 안에 "Why" 섹션으로 결정/trade-off가 *섞여 들어감*. 별도 surface 없음. AI 엔지니어 portfolio의 핵심 신호(*판단*)가 묻힘.

**추가**:

1. **`kind: decision`** — first-class. ADR-style.
   - 필수 섹션:
     - Context (상황/제약)
     - Options (A, B, C, 각 pros/cons)
     - Chosen + Why
     - Trade-off accepted (포기한 것)
     - Reversibility (easy / hard / one-way)
     - Status (proposed / accepted / superseded)
     - Verified by (테스트, dogfood, audit)
     - Discussion artifacts (관련 chat-capture 링크)
   - 위치: `content/logs/<slug>/<date>-decision-<slug>.mdx`

2. **`kind: discussion`** — v2에서 v1로 promote.
   - 필수 섹션:
     - Source (claude.ai / in-person / slack / etc)
     - Participants
     - Context
     - What we discussed (옵션 surface)
     - Outcome (decision 또는 다음 step)
     - What I rejected from AI suggestion (있다면)
     - Linked decision entry (있다면)
   - 위치: `content/logs/<slug>/<date>-discussion-<slug>.mdx`

3. **Updated taxonomy**:
   - `troubleshoot` — 문제 + fix
   - `tech-retro` — 기술 변화 recap (what shipped)
   - `ux-retro` — UX 변화 recap
   - `decision` — NEW — 옵션 weighing artifact (ADR-style)
   - `discussion` — PROMOTED — 대화 artifact
   - `business` — 전략 (private 기본)
   - `monetization` — 수익 결정
   - `update` — 일반 업데이트
   - `snapshot` — 정기 state capture (월간 또는 architecture)

4. **Status header**에 *decision count*가 별도로 표시됨 (AI 엔지니어 portfolio 신호):
   ```
   v0.4 · 98 commits · 30 logged · 12 decisions · 8 discussions
   ```

5. **`/method` 페이지**에 "Decision log" 섹션 — 각 프로젝트의 결정 흐름을 별도 묶음으로 보여줌.

### Sample — `kind: decision` (Revision A 산출물)

```mdx
---
title: "Default LLM for analysis pipeline — Gemini over Claude"
date: "2026-05-27"
project: "shadow-ai"
kind: "decision"
visibility: "public"
language: "en"
status: "accepted"
reversibility: "easy"
summary: "Anthropic credit zeroed mid-session; switched default to Gemini 2.5 Flash. AiAnalysisClient interface keeps Claude as fallback. ~$200/month cost saved; one abstraction layer added."
tags: ["llm", "vendor-choice", "cost", "architecture"]
---

## Context
Anthropic credit zeroed mid-session. Need to keep the analysis pipeline running for ~3 weeks of dogfooding. Personal budget tight ($0 ops cost target).

## Options considered

### A. Top up Anthropic credit + continue with Claude
- ✓ Familiar; no integration work
- ✗ ~$200/month at current usage. Personal budget tight.
- ✗ Locks in vendor; harder to switch later under pressure

### B. Switch to Gemini 2.5 Flash as default
- ✓ Free tier 250 RPD (later corrected to 20 RPD per docs, but ample at decision time)
- ✓ Forces AiAnalysisClient abstraction → cleaner architecture
- ✗ Different JSON contract; need adapter
- ✗ Output quality unknown empirically — risk of worse 직독직해

### C. Switch to Groq + Llama
- ✓ Free fast inference
- ✗ Output quality for structured analysis worse in initial benchmark (76s vs Claude's 41s, Gemini's 8-15s, and lower fidelity)
- ✗ Less reliable for production

## Chosen
**B** — Gemini default, Claude as fallback via AiAnalysisClient interface.

## Trade-off accepted
- Vendor migration time (~3 days) for ~$200/month savings
- One more abstraction layer (AiAnalysisClient interface — but argued this would help anyway)
- Quality risk — Gemini may produce worse 직독직해 analysis. Mitigation: ship + measure within 1 week.

## Reversibility
Easy. AiAnalysisClient interface means swap default via `@ConditionalOnProperty`. 환경 변수 한 줄로 reverse 가능.

## Status
Accepted 2026-05-27. Empirically validated 2026-05-28 — Gemini's 직독직해 quality acceptable after `thinkingBudget: 0` tuning. Latency 8-15s acceptable.

## Verified by
- 4 test suites under `backend/test/analysis/`
- 4 days personal dogfood usage
- Empirical benchmark in `2026-05-27-vision-dispatcher-bench.mdx`

## Discussion artifacts
- None at decision time (solo)
- Follow-up benchmark `content/logs/shadow-ai/2026-05-27-vision-dispatcher-bench.mdx`

## Commit
`<hash>` — Introduce AiAnalysisClient interface, default to Gemini.
```

### Sample — `kind: discussion` (chat-capture, promoted to v1)

```mdx
---
title: "Drill UX direction — gamified vs minimal vs dictation"
date: "2026-06-02"
project: "shadow-ai"
kind: "discussion"
visibility: "public"
language: "en"
source: "claude.ai chat (30min)"
participants: ["me", "Claude Opus 4.7 (chat)"]
summary: "Discussed three drill UX directions with Claude. Claude defaulted to gamified; I rejected based on audience fit (Korean adult learners). Converged on minimal."
linked_decision: "2026-06-02-drill-ux-minimal.mdx"
tags: ["ux", "drill", "audience"]
---

## Context
1주 베타에서 사용자 2명이 "drill 좀 더 motivating하게" 피드백. UX 방향 결정 필요.

## What we discussed

Three options surfaced:

1. **Gamified** — XP bar, 🔥 streak emoji, level-up sounds. 빠른 dopamine 보상.
2. **Minimal** — 숫자만, 색 변화 없음. 학습자 self-driven.
3. **Dictation-style** — 듣고 받아쓰기 우선, 시각 효과 0.

Claude의 초안 추천: **gamified**. 흔한 English learning app 패턴이라.

## What I rejected from AI suggestion

- 🔥 streak emoji → 한국 성인 자기계발 톤 안 맞음 (kid-style 게이미피케이션이라 reads childish)
- Level-up sounds → 학습 흐름 끊김 + 공공장소 사용 어려움
- XP bar → 게이미피케이션이 *learning intention* 약화시킴. 학습 자체가 보상이어야지 외적 보상에 의존하면 보상 빠지자마자 동기 떨어짐 (long-term learning에 역효과)

Claude과 이 이유로 push-back. Claude 동의 후 minimal로 수렴.

Dictation은 별도 모드로 v2 검토 (mic permission onboarding 추가 비용 + minimal로도 충분한 학습 효과 가설).

## Outcome

**Decision: minimal UX.**

별도 decision 엔트리 작성: `2026-06-02-drill-ux-minimal.mdx`.

## Why this matters

The AI's default suggestion (gamification) is the most common pattern in 영어학습 앱 — exactly what an off-the-shelf AI agent would code. Rejecting it required *audience knowledge* (한국 성인 학습자 self-development culture). That rejection IS the AI engineer artifact — not the implementation that came after.

## Next steps

1. Write decision entry (today)
2. Implement minimal in `frontend/components/StreakBadge.tsx`
3. A/B test minimal vs current after 2 weeks if signal unclear
```

### Why Revision A matters

AI 시대 엔지니어의 차별 신호 = *판단의 흔적*. 누구나 AI에게 코드 시킬 수 있음. 차이는:

- AI의 첫 제안 어디서 거절했는가?
- 어떤 trade-off를 의식적으로 받아들였는가?
- 무엇을 *안 선택*했고 왜인가?

이걸 *별도 surface로* 모으는 게 portfolio의 핵심. tech-retro 안에 섞여 들어가면 grep 안 됨. recruiter 눈에 안 들어옴.

→ `kind: decision` + `kind: discussion`이 v1 core. v2 미루기 X.

---

## Revision log

- **2026-05-31 (Revision A)**: `kind: decision` 추가, `kind: discussion` v2→v1 promote, status header에 decision/discussion count 별도 표시, /method 페이지에 Decision log 섹션 추가.
- **2026-05-31 (Revision B — judgment-layer enforcement)**: CLAUDE.md + install snippet에 "Presenting options to the human" 규칙 추가. Claude Code가 옵션 제시할 때마다 (per-option) Why exists / Trade-off / Reversibility / Evidence / Missing info 5개 슬롯 강제. 단일 추천 시에도 Alternatives 고려 / 수용한 trade-off / 추천 뒤집을 만한 정보 명시 강제. Non-trivial 결정은 같은 turn에 `kind: decision` entry 작성 propose. 이유: AI 엔지니어의 차별 신호 = code 위의 판단 layer. 옵션을 *bare list*로 받으면 그 layer가 약화됨. 시스템이 매 turn 자동 enforce 하도록 CLAUDE.md에 박음 (snippet으로 위성 repo도 동일 적용).
- **2026-05-31 (Revision C — tiered decision templates + learning-gap kind)**: 결정 무게에 따라 3 tier로 분리. Tier 1 (substantial — architecture/vendor/monetization/security/data model/major refactor/LOC>500): MBA-grade 11-slot 템플릿 (Context & constraints · Goals ranked · Options considered ≥3 with cost/reversibility/risk/evidence each · Trade-off accepted · Pre-mortem 3 scenarios · Second-order effects · Stakeholders DACI-lite · Decision criteria to flip · Success measure · Verified by · Reversal plan). Tier 2 (notable — feature direction/UX/dependency upgrade/LOC 200-500): 6-slot 템플릿. Tier 3 (trivial — rename/style/typo): 템플릿 없음, 그냥 commit. Tier 결정은 positive trigger + 키워드로 자동 판정 (architecture/security/monetization/migration/breaking → T1; trigger ≥2 또는 LOC>500 → T1; trigger 1 또는 LOC 200-500 → T2; else → T3). 추가: `kind: learning-gap` — 사용자가 *몰랐던 것*을 명시 기록하는 새 kind. 슬롯: What I didn't understand · Where the gap came from · What clicked · Still confused · Related wiki. 시간 흐르면서 사용자 지식 evolution timeline이 됨. wiki entry는 현재 final understanding, learning-gap entry는 학습 과정. 이유: 누구나 잘 안 거 적음, *못 안 거* 명시 기록하는 사람이 1%. AI 시대 차별 신호는 judgment + learning trail 둘이지 코드 아님.
- Future revisions will be appended here as the spec evolves.

## Tier table (Revision C)

| Tier | When | Required slots | Authoring time |
|---|---|---|---|
| **T1 (substantial)** | architecture / vendor / monetization / security / data model / major refactor / LOC>500 / positive triggers ≥2 | Context & constraints · Goals (ranked) · Options considered (≥3 incl. "do nothing") with Cost/Reversibility/Risk/Evidence each · Trade-off accepted · Pre-mortem (3 scenarios) · Second-order effects (enables / forecloses) · Stakeholders (DACI-lite) · Decision criteria to flip · Success measure · Verified by · Reversal plan | 20-30 min |
| **T2 (notable)** | feature direction / UX call / dependency upgrade / LOC 200-500 / 1 positive trigger | Context · Options considered (≥2) · Chosen + Why · Trade-off · Reversibility · Verified by | 5-10 min |
| **T3 (trivial)** | rename / style / typo / formatting / dep bump without behavior change | (none — just commit, optional tech-retro entry) | 0 min |

Tier is auto-suggested by the Stop hook based on positive triggers; author can override with `:tier-1` / `:tier-2` / `:tier-3` in the commit subject (override needs a one-line reason if upgrading from auto-T3 or downgrading from auto-T1).

## `kind: learning-gap` schema

Frontmatter:
```yaml
kind: "learning-gap"
title: "<topic and confusion>"
date: "YYYY-MM-DD"
project: "<slug>"  # or "general" for non-project-specific
related_wiki: ["<term1>", "<term2>"]  # wiki entries to update
visibility: "public" | "unlisted" | "private"
```

Required sections:
- What I (initially) didn't understand
- Where the gap came from (mental model, prior assumption, missing context)
- What clicked
- Still confused (if anything remains)
- Related wiki (entries to update to reflect new understanding)

Workflow: when a re-ask happens or a confusion is acknowledged in conversation, Claude Code proposes a `kind: learning-gap` entry in the same turn. The owner reviews and commits. Quarterly: walk through learning-gap entries and consolidate into wiki updates.

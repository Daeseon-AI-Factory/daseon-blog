# Opendoor 인터뷰 대비 Trainer — 설계 문서

> 이 문서는 처음부터 다시 시작할 수 있도록 쓰였다. simlab의 엔진 결정을 재유도하지 않고 재사용한다(`docs/simlab-design.md` 참조). 새 레포에서 시니어 엔지니어 한 사람이 혼자 빌드한다는 전제다.

---

## 1. 한 줄 정의 · 이름 후보 · simlab과의 관계

**한 줄 정의:** Opendoor 인터뷰의 must-code 문제 각각을 deterministic state-machine simulator로 빌드하면서, 그 빌드 행위 자체가 해당 문제의 코딩 rep이 되도록 만든, 본인 전용 인터뷰 대비 trainer.

핵심은 단순하다. 인터뷰가 임박했으므로 "도구를 만드는 것"과 "시험 공부"가 분리되면 도구는 prep 시간을 잡아먹는 procrastination이 된다. 그래서 이 trainer의 유일한 설계 원칙은 **모든 빌드 작업이 동시에 특정 must-code 문제의 구체적 rep이어야 한다**는 것이다(§3).

**이름 후보 (working name — 나중에 바꿔도 됨):**

1. **`offerlab`** — simlab의 sibling임을 이름으로 드러낸다. 도메인(offer/transaction)이 박혀 있어 정체성이 분명하다. 단점: 인터뷰 후 simlab으로 흡수되면 이름이 좁아진다.
2. **`repbench`** — "rep을 쌓는 bench"라는 도구의 본질을 드러낸다. 도메인 중립이라 인터뷰 후 일반 prep 도구로 확장해도 이름이 살아남는다. 단점: simlab과의 혈연 관계가 이름에 안 드러난다.
3. **`prep-sim`** — 가장 설명적이고 안전한 이름. 단점: 밋밋함.

추천은 `offerlab`(인터뷰 시점의 정체성이 가장 분명) 또는 `repbench`(인터뷰 후 수명이 가장 길다) 둘 중 하나. 이름은 one-way가 아니므로(레포 rename은 two-way door) 지금 확정하지 않아도 빌드를 막지 않는다 — §15의 confirm 목록에 둔다.

**simlab과의 관계 (throwaway가 아니다):**

이 trainer가 빌드하는 Offer / Task-board / Transaction-event state machine은 **그 자체가 Opendoor 도메인에 맞춘 simlab-style simulator**다. simlab의 코어 — pure deterministic TS reducer → SVG renderer, one-way layer 분리 — 를 "circuit breaker physics"에서 "business-event state machine"으로 re-point한 것일 뿐, 같은 엔진이다. 따라서 인터뷰 대비로 만든 엔진이 곧 simlab의 코어다. 인터뷰 후 simlab = 이 세 도메인 머신 옆에 circuit-breaker physics를 다시 끼우는 re-skin 작업이다. **빌드한 코드는 버려지지 않는다.**

---

## 2. Context & Constraints

- **인터뷰가 임박했다.** 정확한 날짜는 레포에 없고 "very soon / imminent"로만 적혀 있다. 이 날짜가 master variable이다(§15). <7일이면 kill-switch가 이미 발동된 상태고, trainer 코드는 한 줄도 쓰면 안 된다(§12).
- **primary user = 본인, 지금.** 공개 제품이 아니라 본인이 인터뷰를 준비하는 도구다. 사용자 수·수익은 success measure가 아니다(§13).
- **빌드가 prep을 겸해야 한다.** 이게 전체 설계의 척추다(§3).
- **Cursor에서 코딩한다.** trainer 안에 code editor를 넣지 않는다 — Cursor가 이미 그 역할을 하고, in-trainer editor는 "더 나쁜 Cursor"가 된다(§7).
- **solo.** 리뷰어·협업자 없음. 단순함과 안정성을 기능 수보다 우선한다.
- **Vercel.** 블로그와 동일하게 static 배포. backend/DB/account 없음(§9).
- **스택은 블로그 재사용.** Next.js 15 / TS / Tailwind / MDX / Vercel(§9). 새 학습 곡선 없음.
- **6년차 백엔드+AI 엔지니어(ex-SK AX), ESL.** 도메인 브리지: 제조/재고/원가/금융 → homes/offers/pricing/transactions, 같은 engineering shape.
- **톤: 담담한, anti-guru.** ExplainCard의 gold answer도 차분한 시니어 영어로.

---

## 3. The Reconciliation Principle (척추 — 크게 외쳐둔다)

> **모든 빌드 작업 = 특정 must-code 문제의 구체적 prep rep이다.**
>
> 빌드 시간이 prep reps으로 환산되지 않는 기능은 cut하거나 defer한다. 예외는 단 하나 — Stage-0 clock de-risk(§11 step 0), 그리고 그조차 1일(다운그레이드 후 ~1시간)로 timebox한다.

이 원칙이 막으려는 실패 모드는 명확하다: **도구를 만드는 일이, 그 도구가 봉사하기로 한 prep 시간을 잡아먹는 procrastination이 되는 것.** "좋은 추상화"는 시니어 craft처럼 느껴지기 때문에 가장 위험한 형태의 procrastination이다(§12 tripwire #2, §14 failure b').

매 reconciliation 체크 질문 (매일):
**"오늘의 빌드가 인터뷰에서 *말로 할 수 있는* 무언가를 만들었는가? (transition rule 하나, edge case 하나, 영어 문장 하나)"** 아니라면 오늘은 procrastination이었고, 내일은 Cursor 대신 CoderPad를 연다.

---

## 4. Goals (랭크) · Non-Goals

### Goals (우선순위 순)

1. **인터뷰의 가장 높은 가중치 라운드를 준비시킨다.** 인터뷰 루프: (1) recruiter screen, (2) 60분 past-project deep-dive [the crux], (3) 두 개의 60분 pairing(AI-disabled / AI-enabled) + system design. deep-dive(Round 2)와 pairing(Round 3)이 기술 신호의 전부다.
2. **must-code 문제를 더 빠르고 깔끔하게 코딩·설명하게 만든다.** 빌드가 곧 reps.
3. **deep-dive(SK AX SELECT-lock incident) 서사를 영어로 매끄럽게 말하게 만든다.** 가장 underweighted된 라운드 — 의도적으로 overweight한다(§8, §14 failure a).
4. **빌드한 엔진이 버려지지 않게 한다** — simlab 코어의 seed가 되도록(§1). 단, 이건 post-interview upside일 뿐 pre-interview에 시간을 더 쓸 이유는 아니다(§14 failure d).

### Non-Goals

- **지금은 공개 제품이 아니다.** account/sharing/marketing copy 없음.
- **Java IDE가 아니다.** in-browser code execution 없음, code editor 없음(§7). Java는 Cursor / CoderPad / 종이에서 짠다.
- **account/auth/DB/persistence 없음.** first user는 본인. URL state로 sharing 대체.
- **generic engine을 먼저 만들지 않는다.** boil-the-ocean `StateMachine<S,E>` framework는 premature abstraction(§9 rejected, §12 tripwire #2). Offer reducer 하나를 hardcode한다.

---

## 5. Feature map

각 feature → 어느 prep-doc 섹션에서 나왔는가 → 어느 must-code rep을 겸하는가 → v1/later.

| Feature | prep-doc 출처 | 겸하는 must-code rep | tier |
|---|---|---|---|
| **Offer / Transaction FSM simulator** (FLAGSHIP) | Problem #4 (CREATED→SENT→ACCEPTED→CLOSED + EXPIRED/CANCELLED, invalid transition, audit) + API 템플릿(POST `/offers/{id}/transitions`, 409/422/404) | Problem #4 end-to-end + "status change is a business event" API 템플릿 + 409-invalid-transition 에러 모델 | **v1** |
| **KeyValueStore-with-TTL warmup** (logical-time primitive) | Problem #1 (TTL with logical time, not sleep — "canonical Opendoor screen") | Problem #1 + 모든 문제가 의존하는 logical-time-not-sleep 기법. clock primitive를 de-risk한다 | **v1** |
| **ExplainCard** (영어 explain-back 패널) | ENGLISH(speaking template, recording, phrase precision) + pairing-round communication 채점 | "explain L5 out loud"(45분) + "English recording"(30분) 일일 블록. Part-3 communication 리허설 | **v1** |
| **PredictGate** (reveal 전 prediction commit) | simlab §5 PredictGate + L2/L3 drill ladder | dup eventId / out-of-order / invalid transition을 *보기 전에* 예측 → AI-disabled round이 채점하는 edge-case reasoning | **v1** |
| **Deep-dive rehearsal** (SK AX SELECT-lock, MDX + timer) | INTERVIEW LOOP Round-2 [the crux] + RESUME 매핑 | Round-2 past-project 서사 reps. **가장 높은 가중치이므로 Day 0-1에 빌드한다**(§11, §14 a) | **v1** |
| **Catch-the-bug drill** (curated buggy Java 스니펫) | AI-ENABLED workflow("진짜 시험되는 건 wrong AI output을 잡는 것") | 각 스니펫 저작 = 정답 재유도 + 구두 catch 리허설. AI-enabled round | **v1 (라이트)** |
| **System-design component overlay** (정적 SVG + PredictGate) | SYSTEM DESIGN(CORE-9 컴포넌트 + core sentence) | SD opening-components drill + core sentence를 *방금 빌드한 시스템*에 대고 리허설 | later |
| **Task / Job Board simulator** | Problem #3 (worker claim, stale claim, audit) + SD "Ops Task Board" | Problem #3. **두 번째 머신 → generic seam을 강제하는 지점**(§6). pre-interview엔 CoderPad로만 drill | later |
| **Transaction Event Processor simulator** | Problem #5 (sort by ts, dedup eventId, per-home final state, out-of-order) + SD "Home Transaction Workflow" | Problem #5. #4 reducer를 import해 composable 증명 | later |
| **Pricing Rule Engine module** | Problem #7 (base+renovation+risk+market, breakdown/explainability, Strategy/Factory) | Problem #7. clock 안 쓰는 static evaluator 경로 | later |
| **Inventory Financial Reconciler module** | Problem #6 ("maps to his resume", staging-table+batch-worker) | Problem #6 + deep-dive ammo | later |
| **LRU/TTL Cache · Rate Limiter · Idempotency Store · Home Search** (insurance bench) | Problem #2, #8, Insurance | 나머지 must-code bench. v1 lesson 템플릿이 반복 가능함이 증명된 후에만(GATE-4) | later |
| **AI feedback / scoring / `lib/ai/`** | AI-ENABLED round | **빌드 안 함(stub조차).** AI-enabled 연습은 Cursor에서 이 lesson들을 빌드하며 실제로 일어난다(§7) | 안 함 |

**최고 레버리지 feature:** Offer/Transaction FSM simulator. 이유: (1) Opendoor에 가장 가까운 문제 — status-change-as-business-event FSM with invalid-transition/audit/idempotency, 이는 #3·#4·#5·#8의 공통 척추다. (2) pure reducer + audit log를 빌드하면 deep-dive·pairing이 캐는 L5 production 관심사(optimistic lock, idempotencyKey, actorId, audit-in-one-tx)를 그대로 연습한다. (3) API 템플릿(separate `/transitions`, 409 on invalid)과 SD core sentence를 부수 효과로 실어 나른다. (4) §1의 bridge대로 이 엔진이 곧 simlab 코어 — throwaway 제로. **단, KV-TTL warmup을 가장 먼저(first commit) 빌드한다** — load-bearing logical clock을 de-risk하고 그 자체가 canonical screen 문제이기 때문. 최고 레버리지가 *내려앉는* 곳은 Offer FSM, 가장 먼저 *손대는* 곳은 KV-TTL.

---

## 6. Core engine — deterministic state-machine simulators

> simlab 아키텍처를 재유도하지 않고 재사용한다. 새로 결정하는 것은 도메인 머신의 states/transitions/guards/audit/idempotency뿐.

**엔진 = simlab의 pure reducer를 business-event state machine으로 re-point한 것.** load-bearing 시니어 신호는 그대로다: `(input, seed)`가 출력을 완전히 결정한다. React/DOM 의존 제로. Vitest로 unit-testable. web≡mobile by construction (mulberry32 seeded PRNG + logical time). 이건 CSS animation이 아니라 진짜 FSM이고, 그게 신호다.

**v1 규율 (simlab pre-mortem #1을 여기서도 적용):** 첫 머신은 **HARDCODED**. generic `StateMachine<S,E>` framework는 두 번째 머신(Task-board)이 seam을 강제하기 전엔 만들지 않는다. "generic on paper, hardcoded in code"로 해소한다 — 모양은 generic하게 *설명할 수 있게* 설계하되("I'd model this as a reducer over a transition table"), 실제로는 손으로 쓴 reducer를 ship한다. **table-driven 엔진 추출은 Drill L4("requirement change: add a new state")인데, v1에서는 이 L4를 종이/MDX에 Java로 쓴다 — TS 엔진을 refactor하지 않는다**(§14 failure b' — 이 L4-as-build 정당화를 v1에서 죽인다).

### Canonical shape (`lib/engine/`, pure TS, React 없음)

```ts
type Ts  = number;            // logical timestamp, NOT Date.now()
type Rng = () => number;      // mulberry32(seed) — Math.random 금지

type Result<S> =
  | { ok: true;  state: S; event: AuditEntry }
  | { ok: false; code: 409 | 422 | 400 | 404; reason: string; state: S };

interface AuditEntry {
  ts: Ts; from: Status; to: Status;
  actorId: string; reason: string;
  idempotencyKey?: string; eventId?: string;
}

// the reducer. PURE. 시니어가 "진짜 FSM"으로 알아보는 artifact.
function transition(state: S, cmd: Command, ctx: { ts: Ts; rng: Rng }): Result<S>;
```

### 모든 도메인 머신이 encode해야 하는 5가지 메커니즘 (각각 Drill level과 1:1 → 메커니즘 빌드 = prep reps)

1. **STATES** — closed enum. SVG 노드로 렌더, 현재 상태가 light up. *(Drill L1 — simplest correct version.)*
2. **TRANSITIONS** — transition table `Map<[Status, CmdType], Status>`. 테이블에 없는 command는 `{ok:false, code:409}` 반환 — throw도 아니고 silent no-op도 아니다. **가장 interview-load-bearing한 한 줄:** "an invalid transition is a 409, a business event, not an assertion." *(L2/L3.)*
3. **GUARDS** — *형태는 합법인* transition을 거부하는 predicate: offer already expired(`ts > expiresAt`), 이미 claim된 task, `amount <= 0`. Guard는 422/400 반환. "no such transition"(409)과 구별한다. **409-vs-422 분리를 가르치는 것이 의도된 시니어 신호.** *(L2/L3.)*
4. **AUDIT** — 성공한 transition마다 immutable `AuditEntry` append. **audit log는 STATE의 일부지 side effect가 아니다** — pure reducer엔 side effect가 없으니까. core sentence "every state transition validated, idempotent, and auditable"를 그대로 리허설. *(L3.)*
5. **IDEMPOTENCY** — reducer가 `seen: Set<idempotencyKey | eventId>`를 들고 다닌다. 이미 `seen`에 있는 key의 반복 command는 *같은 결과*(이전 state + "replayed" 마커)를 반환, 절대 double-apply 안 함. deep-dive ammo(PK-only payload + idempotency keys + outbox)를 보이고 클릭 가능하게 만든 것. *(L3 + L5.)*

**Logical time이 keystone:** TTL/expiry/stale-claim 전부 tick counter를 쓰고 real sleep을 절대 안 쓴다. 이게 must-code 제약 "KV-TTL with logical time not real sleep"과 정확히 같다 — Stage 0에서 de-risk한 clock이 곧 문제 #1·#3·#4·#8의 TTL primitive다. **하나의 de-risk가 네 문제를 봉사한다.**

### v1 clock 다운그레이드 (hard cut, suggestion 아님 — §14 failure b 강제)

도메인 sim은 event-driven이다(command 탭 → transition 하나), circuit-breaker처럼 continuous request flow가 아니다. 그래서:

- **v1엔 rAF loop 없음.** state 변화는 버튼 누르면 즉시.
- logical clock은 버튼/슬라이더로 증가하는 **integer**.
- **animated event ball 없음.** edge는 클릭 시 CSS class 토글로 green/red flash — clock 불필요.
- `useSimClock`(rAF + fixed-timestep accumulator, StrictMode-safe)은 **빌드 안 함**. full clock은 어떤 sim이 진짜 continuous animation을 필요로 할 때까지 defer(v1엔 아마 없음).

이 결정이 simlab의 single biggest technical unknown(pre-mortem #2: clock hook은 블로그 Mermaid island에서 재사용 불가 — 확인됨: `components/Mermaid.tsx`는 string을 `dangerouslySetInnerHTML`로 한 번만 렌더, live loop 없음)을 critical path에서 제거한다. Stage-0 de-risk가 1일에서 ~1시간으로 collapse된다.

### Mobile = tap (free)

같은 renderer가 web/mobile 둘 다 돈다(pure state에 대한 SVG일 뿐). 유일한 차이는 ControlPanel 입력 modality — desktop은 버튼+텍스트필드+슬라이더, mobile은 big tap target + tap-to-advance-clock, 텍스트 입력 없음, code editor 없음. simlab의 "controls-only mobile, web≡mobile engine path" 결정을 그대로 상속 — mobile-specific 엔진 코드 제로.

### 도메인 머신 정의

**Offer / Transaction State Machine (#4 — flagship, 가장 먼저 빌드):**
States: `CREATED, SENT, ACCEPTED, CLOSED, EXPIRED, CANCELLED`.
Legal: `CREATED→SENT`, `SENT→ACCEPTED`, `SENT→EXPIRED`(guard: `ts > expiresAt`), `SENT→CANCELLED`, `ACCEPTED→CLOSED`, `ACCEPTED→CANCELLED`, `CREATED→CANCELLED`. 나머지 전부 → 409.
Guards: Accept after expiry → 422. Close before Accept → 409. 같은 idempotencyKey로 double-Accept → replay(no-op, same result). 새 key로 double-Accept → 409(이미 ACCEPTED). **at most one ACTIVE offer per home**(GET `/homes/{id}/active-offer` invariant) → guard로 강제.
가르치는 것: separate `/transitions` endpoint(status change = business event, validation+idempotencyKey+actorId+reason+audit in one tx), 409/422/404 taxonomy, State 패턴, "one active offer per home" invariant.

**Task / Job Board (#3 — 두 번째, generic seam을 강제하는 머신):**
States: `CREATED, ASSIGNED, IN_PROGRESS, COMPLETED, FAILED, CANCELLED`.
Legal: `CREATED→ASSIGNED`(claim, guard: unclaimed OR prior claim stale), `ASSIGNED→IN_PROGRESS`, `IN_PROGRESS→COMPLETED`, `IN_PROGRESS→FAILED`, `ASSIGNED→CANCELLED`, `CREATED→CANCELLED`.
Guards: fresh claim된 task를 다시 claim → 409. `claimedAt + timeout < now`면 stale reclaim 허용(steal로 audit). 소유하지 않은 task complete(workerId mismatch) → 422. 같은 requestId claim → replay.
가르치는 것: worker claim / stale-claim / lease-timeout(distributed-job-lock — 이력서의 ShedLock/row-lock), optimistic-lock 직관(fresh-claim 체크 = version guard). **두 번째 머신이므로 duplicated transition-table 코드가 충분히 아파져 generic reducer 추출이 legitimate Drill-L4 reps이 되는 지점.**

**Transaction Event Processor (#5 — 세 번째, deterministic-replay 쇼케이스):**
한 머신이 아니라 FANOUT: 이벤트를 ts로 stable sort → homeId별로 #4 reducer를 통해 fold(**REUSE — #4 reducer를 import해 엔진이 composable함을 증명**). Dedup: seen eventId의 Set, 두 번째 발생 → 무시 + rejected tray에 로깅. invalid type 또는 per-home 머신이 거부하는 transition(409/422) → rejected tray. sort 후에도 legal한 out-of-order → apply. final state = per-home fold 결과.
가르치는 것: event sourcing / fold-to-final-state, sort-by-ts, dedup by eventId, idempotent replay, out-of-order tolerance. STREAM에 대한 "deterministic + idempotent + auditable"의 가장 깨끗한 증명.

### Viz: SVG, not Canvas (simlab 결정 그대로)

declarative, diff-friendly(React 19), accessible, retina-crisp, 블로그 Tailwind ink/paper/accent 토큰으로 themeable, DevTools에서 inspect 가능(본인이 자기 reducer를 디버그할 때 중요). 도메인 머신은 노드 수십 개 — Canvas는 문서화된 escape hatch지만 v1엔 도달 안 함.

Renderer contract: `(state) => <svg>`. renderer는 reducer 출력 state만 읽는다 — mutate 불가, tick 불가. content → engine → renderer one-way 화살표가 곧 portfolio artifact.

4개 visual primitive(한 번 빌드, 세 sim 공유): **STATE NODES**(active = accent fill, reachable-next = outline, unreachable = dim), **TRANSITION EDGES**(성공 = green flash, illegal = red flash via CSS class — clock 불필요), **AUDIT LOG**(SVG 아래 monospace append-only 리스트: `ts | from→to | actor | reason | key` — "auditable"의 가시적 증명이자 말하면서 가리킬 대상), **REJECTED TRAY**(event-processor용 — 409/422/dup reason 표시).

---

## 7. In-browser code-execution 결정 (RESOLVED) + coding-drill harness

### 결정: v1은 브라우저에서 Java를 실행하지 않는다. No-exec + 구조화된 self-check. **code editor 없음.**

각 옵션의 reasoning을 명시한다(bare list 금지 — CLAUDE.md 규칙).

**OPTION A — No-exec + self-check (채택).**
- *존재 이유:* 인터뷰가 임박했고 trainer의 유일한 일은 must-code를 더 빠르게, 말로 더 또렷하게 만드는 것. Java를 실행해도 둘 다에 기여하지 않는다. 실제 시험(pairing)은 CoderPad/Cursor에서 일어나지 trainer 안에서가 아니다.
- *포기하는 것:* trainer 안에서 "run" 눌러 Java가 테스트 통과하는 걸 못 본다. 대신 Cursor(이미 거기 산다) 또는 CoderPad(실제 인터뷰 surface)에서 돌린다 — 이게 *더 나은* prep이다.
- *Reversibility:* two-way. self-check은 data일 뿐(체크리스트 + reference solution + test-case list). 나중에 실행을 추가하는 건 boundary 하나 뒤의 additive 작업.
- *Evidence:* simlab이 이미 "no code-execution, no sandbox, controls-only"로 결정했고 모든 executor(Sandpack/Monaco/WebContainers)를 v1 REJECTED로 명시. CheerpJ/TeaVM/Judge0/Piston은 그 reject된 class의 Java판. verified 결정을 재사용하는 건 공짜.
- *flip 조건:* pairing이 trainer 안에서 일어나거나(아님), Java 돌릴 다른 곳이 없거나(Cursor 있음).

**OPTION B — Judge0 / Piston backend (서버사이드 compile+run).**
- *존재 이유:* 진짜 javac, 진짜 test 실행, 언어 정확.
- *포기하는 것:* backend 재도입(latency, attack surface, rate-limit/cost, ops) — simlab이 설계 내내 *제거한* 것들. 게다가 잘못된 것을 리허설한다: 인터뷰가 시험하는 건 "wrong AI output 잡기"와 trade-off 말하기지 "내 코드가 컴파일되나"(Cursor가 200ms에 알려줌)가 아니다.
- *Reversibility:* hard-ish(server infra, secrets, hosting).
- *Evidence:* simlab이 "server-side simulation execution / any backend"를 cost+attack-surface+latency로 명시 reject.
- *flip 조건:* post-interview에 auto-graded 제출이 있는 공개 coding-practice 제품으로 pivot. v1 아님.

**OPTION C — CheerpJ / TeaVM (Java → WASM/JS, 브라우저 실행).**
- *존재 이유:* backend 없이 in-browser Java, static-site 자세 유지.
- *포기하는 것:* heavy bundle(CheerpJ JVM은 multi-MB — mobile-fast Lighthouse-90 bar 파괴), freeze/infinite-loop class를 Worker에서 sandbox해야 함, immature DX, 시험되지 않는 기능에 며칠. TeaVM은 Java에 build step이 필요해 one-file-no-Spring 제약과 충돌.
- *Reversibility:* two-way지만 통합 후 제거 비용 큼.
- *Evidence:* simlab이 Sandpack/Monaco/WebContainers를 "RCE/freeze class + heavy bundle"로 reject. CheerpJ는 더 무겁다.
- *flip 조건:* desktop-only post-interview "edit-and-run" 강화 — simlab이 이미 CodeMirror를 kill-gated v2, desktop-only로 선반에 둠. 같은 선반.

**v1에 code editor가 필요한가? No.** Cursor에서 코딩한다. in-trainer editor는 "더 나쁜 Cursor"이자 잘못된 근육을 리허설한다. v1은 editor 제로를 ship. harness는 problem + L1→L5 ladder + reference + checklist를 READ/REVEAL 콘텐츠로 제시. 실제 Java는 Cursor(AI-enabled day) 또는 종이/CoderPad(AI-disabled day)에서 짠 뒤 self-check를 tick한다. **trainer는 SPEC + COACH지 IDE가 아니다.**

**Reconciliation 체크:** Option A의 모든 작업이 prep을 겸한다(Offer sim 빌드 = Offer 문제 학습, self-check 체크리스트 = L1→L5 plan). Option B·C는 reconciliation 원칙을 정면으로 위반(prep reps이 아닌 순수 tooling time)하므로 v1 cut, simlab이 Sandpack을 두는 같은 post-interview 선반으로 defer.

### Coding-drill harness (trainer의 두 번째 surface — sim이 첫 번째)

pure content-as-data — MDX 파일 + matching sim id. 새 엔지니어링 거의 제로, 블로그 MDX 파이프라인 상속. **SPEC + COACH지 editor가 아니다.** Cursor와의 관계: harness가 한 화면(랩탑/폰)에서 *무엇을 빌드하고 어떻게 self-check하는지*를 말해주고, 다른 화면 Cursor에서 Java를 친다. AI-disabled 리허설 날엔 harness를 읽고 Cursor AI를 끄고 기억으로 짠다.

각 must-code 문제의 UX, top→bottom:

1. **PROBLEM STATEMENT** — interviewer 목소리 한 문단 + 그가 되말해야 할 한 줄("So I'm building an in-memory store with per-key TTL using a logical clock, not wall time — correct?"). speaking template 첫 박자("Let me clarify the requirements first") 리허설.

2. **L1→L5 LADDER** — 점진적 REVEAL (PredictGate 메커닉). 각 rung은 collapsed; 펼치기 전에 한 줄 plan을 commit("L3가 뭘 추가하지?")해야 함.
   - **L1 basic** — simplest correct version. Reveals: required methods + happy-path test 1개.
   - **L2 edge** — null/empty/boundary/expiry. Reveals: edge test list.
   - **L3 dup/invalid/audit** — idempotency key, invalid transition → 409, audit append. Reveals: 409-vs-422 taxonomy + audit shape. *(이 rung은 매칭 SIMULATOR로 직접 연결 — Offer sim으로 flip해 곧 코딩할 409를 WATCH.)*
   - **L4 requirement change** — interviewer가 문제 중간에 state/rule 추가. Reveals: 바뀐 spec + "네 설계가 싸게 흡수했나?" **v1에서 이 rung은 종이/MDX에 Java로 쓴다 — TS 엔진을 refactor하지 않는다**(§6, §14 b').
   - **L5 production** — Postgres source-of-truth, row/optimistic lock, outbox, idempotency store, metrics. Reveals: production checklist + core sentence + SD component list.

3. **FOLLOW-UP CHECKLIST** — 자기 Cursor 코드에 대고 돌리는 tick-box(auto-grading 없음 — self-check이 핵심이자 backend-free 유지). 문제 간 재사용되는 구체 항목:
   `[ ] invalid op returns 409 not exception`
   `[ ] idempotency key replayed, not double-applied`
   `[ ] every mutation appends an audit entry`
   `[ ] logical clock, no Thread.sleep`
   `[ ] one transaction per state change`
   `[ ] guard vs not-found distinguished (422 vs 404)`
   `[ ] at-most-one-active invariant holds`
   각 unchecked box는 알려진 interview 실패 모드.

4. **SPEAKING-RHYTHM PROMPTS** — ESL pillar(simlab ExplainCard graft). rung별로 코딩하며 말할 고정 문구 + phrase bank + 틀린 ESL cross-out: "I'll start with the simplest correct version" / "Now I'll add the edge cases" / "A status change is a business event, so I validate, write the audit row, and the idempotency key in one transaction" (✓ "in one transaction" / ✗ "in one time"). 문제당 90초 "explain the trade-off" prompt + Loom self-recording 슬롯 1개. AI-enabled workflow prompt는 고정 ribbon으로: restate → data model → ask AI for skeleton+test-plan ONLY → implement core self → ask AI for edge cases/review → final judgment. 문제당 한 rung은 plausibly-wrong AI skeleton을 보여주고 "what's the bug?"를 묻는다.

**Anti-procrastination reconciliation (load-bearing):** harness는 drill하면서 저작한다, 미리 저작하지 않는다. Day 1의 산출물은 KV-TTL harness 페이지 *그리고* KV-TTL reps — 같은 sitting. **drill하는 날보다 앞서서 harness 페이지를 빌드하면 안 된다** — 이 규칙이 도구가 prep을 먹는 것에 대한 firewall. 실제 drill 중에 못 쓰는 harness feature는 cut. 최소 shippable harness = 문제 하나(Offer #4)의 L1→L5 + checklist + speaking prompts, Offer sim에 wired. 나머지는 그 고정 템플릿의 fill-in-the-blank 반복.

---

## 8. Non-coding drills

### English explain-back (`<ExplainCard>`, 그의 API 템플릿으로 seed)

generic OOP 암송이 아니라 AI-disabled pairing + deep-dive에서 설명해야 할 4개 Opendoor artifact에 wired. content-as-data: `content/comms/{en,ko}/`의 MDX, 그의 기존 `🧠 (Korean concept) → 🗣️ (English script)` 2줄 포맷(`04-oop-english.md`, `10-rest-api.md`) 미러링.

Data model (한 prompt = 한 MDX): `id`, `topic`(api-design | transition-endpoint | errors | state-machine | concurrency), `prompt_en`, `concept_ko`(🧠), `gold_en`(🗣️), `must_hit_phrases[]`(채점 present/absent), `time_budget_s`(30/60/90).

세 seed prompt (그의 API EXPLANATION TEMPLATE에서 직접):

**(A) transition-endpoint — the crux.** gold_en, 그의 rhythm:
> "I separate the transition from the create. POST /offers creates the offer. POST /offers/{id}/transitions changes its status. I do this because a status change is a business event, not a field update. So in one transaction I validate the transition, check the idempotency key, record who did it — the actor id — and why — the reason — and write the audit row. If the transition is not allowed, I return 409. If the offer is missing, 404. If the body is bad, 400."
must_hit: `business event / one transaction / idempotencyKey / actorId / reason / audit / 409 / 404 / 400`.

**(B) api-design:** "I expose GET /offers/{id} for one offer and GET /homes/{id}/active-offer for the current offer on a home. The server is stateless. Each request carries the actor in the header."

**(C) errors:** "404 means the offer does not exist. 409 means the transition is not valid for the current state — for example accepting an already-closed offer. 400 means the request body is wrong. I never return 500 for a business rule; 500 is only a real server fault."

Scoring (deterministic, v1엔 AI 없음): 1) time_budget_s에 대고 self-record. 2) 녹음 후 must_hit_phrases 체크리스트 reveal — 실제로 말한 phrase를 탭. score = hit/total (PredictGate reveal-after-commit과 동일 메커닉). 3) fail 조건은 그의 EXPLAIN_EN 규칙 그대로: "Korean filler를 쓰거나 2초 이상 멈췄으면 다시."

v1 scope: 3 MDX prompt, hardcoded ExplainCard(generic scoring engine 없음, AI 없음). transcript phrase-detection은 v2.

### AI-pair catch-the-bug

핵심 통찰: "진짜 시험되는 건 wrong AI output을 catch/verify하는 것이지 prompt craft가 아니다." 그래서 drill은 코드를 *생성*하지 않고, plausible-but-wrong Java를 보여주고 결함을 얼마나 빨리 명명하는지 잰다. 그의 `R1_NaiveQueueWorker.java`의 "flaws left in ON PURPOSE" 패턴 재사용.

v1 — curated buggy 스니펫(hardcoded, AI call 없음). content-as-data(MDX + id). Data model: `id`, `problem_ref`, `buggy_code`(Java one-file), `defect_class`, `gold_diagnosis_en`(SVO rhythm), `time_budget_s`(<60s 목표).

Seed 스니펫(각각 그의 실제 문제의 진짜 실패 모드):
1. **LRU/TTL (#2):** AI가 `new LinkedHashMap<>(16, 0.75f)` 반환 — `accessOrder=true` 세 번째 인자 MISSING, insertion order로 evict. naive put/get test는 통과, "get A then evict B"에서 fail. gold: "This evicts the oldest inserted, not the least recently used. accessOrder is false here. I need the third constructor argument true, and removeEldestEntry."
2. **Offer FSM (#4):** `transition()`이 target state가 enum에 있는지만 검사하고 CURRENT state는 안 봄 — `CLOSED → ACCEPTED` 허용. gold: "It checks the new state is valid but not that the transition from the current state is legal. Accepting a closed offer should be a 409. I need a transition table keyed on (from, to)."
3. **Event processor (#5):** ts로 sort하지만 Set을 전체 event로 key — 같은 eventId 다른 payload 둘 다 apply. gold: "Dedup is on the object, not the eventId. A retried event with a tweaked field slips through. The key must be eventId only."
4. **Idempotency store (#8):** lock 획득 → 작업 → return하는데 release가 return 뒤/finally 밖 — 예외 시 stale lock 영원. gold: "The lock is never released on failure. No finally. A stale RUNNING row blocks every retry. I need finally, plus a timeout so a dead owner's lock expires."
5. **Job queue (#3):** exception swallow 후 task drop — retry/DLQ/requeue 없음. gold: "On failure the task is lost. There's no retry and no dead-letter. The catch just logs and moves on."

메커닉: 스니펫 read-only 렌더 → diagnosis 구술(timer) → "reveal" 탭 → gold + one-line fix(PredictGate). 옵션 "fixed?" 토글로 correct 버전 diff.

v2 (deferred): API key + server route가 필요해 v1 "static site, no backend"를 위반하므로 gate. curated가 reproducible/screenshot-stable(determinism), AI는 아님. Reversibility easy — v1 MDX 포맷이 같은 모양, v2는 buggy_code 소스만 swap.

### System-design canvas

**v1 simpler form (이걸 먼저 ship):** drag-and-drop canvas가 아니다(그건 build-tool 작업이고 직접 prep value 제로 + procrastination 위험 高 — 정확히 막아야 할 실패 모드). 대신 PredictGate를 앞에 둔 **정적 SVG diagram**:
- prompt가 topic 표시, 예: "Design the Ops Task Board with realtime fanout."
- reference reveal 전에 어떤 컴포넌트를 둘지 commit(구술 + 탭).
- canonical SVG 아키텍처 diagram 렌더(CORE-9 항상 present, topic add-on highlight). **블로그의 `components/Mermaid.tsx`(static diagram용, clock/rAF 위험 없음) 재사용.**
- CORE SENTENCE를 옆에 verbal anchor로 렌더.

palette = 그의 컴포넌트 리스트, 두 tier 그대로:
- **CORE (항상 이 순서로 시작):** Client/Internal Tool → API Layer → Core Domain Service → Postgres (source of truth) → State Machine → Audit Log → Outbox/Queue → Async Workers → Monitoring.
- **ADD-ON (prompt가 필요로 할 때):** WebSocket/SSE, Human Review, Pricing/ML, Cache, Notification, External Vendor.

5개 SD topic = 5 preset + required-component 체크리스트:
1. Ops Task Board / Job Queue (realtime fanout) → CORE + WebSocket/SSE + Cache.
2. Home Transaction Workflow → CORE + Human Review.
3. Pricing / Offer Generation → CORE + Pricing/ML + External Vendor.
4. Reconciliation System → CORE + External Vendor (record feeds).
5. Real-time Updates → CORE + WebSocket/SSE + Notification.

drag canvas는 인터뷰 후로 defer(generic framework abstraction을 강제 — v1 금지). v1 → v2 reversibility easy: palette tile data model이 동일, v2는 interaction만 추가.

### Round-1 deep-dive rehearsal (SK AX SELECT-lock, AI-default woven in)

> **§14 failure a 대응으로 이 drill을 Day 0-1에 가장 먼저 빌드한다 — 기술 위험 제로(MDX + 말하기 + timer), 가장 높은 가중치 라운드.**

simulator가 아니라 scripted narrative drill. content-as-data: `content/deepdive/{en,ko}/sk-ax-select-lock.mdx`, 구조화된 슬롯을 채우고 timer에 대고 리허설.

Story spine (Format B를 구술 incident에 적용 — Before/Change/Result/Limit):
- **Situation (1줄):** 부하 하의 production SELECT가 lock에 contention, real-money transaction에 DB-at-scale로 영향.
- **Diagnosis:** 관찰한 symptom, SELECT-lock 상호작용으로 격리한 방법.
- **Fix:** 이력서 ammo와 연결 — row-level-lock id generator, distributed/job lock, staging-table + batch-worker, PK-only payload + fresh-state retrieval. 실제 메커니즘을 명명.
- **Result:** 측정 가능한 결과 — **실제 숫자를 본인이 공급**(anti-hallucination, 지어낸 metric 금지). 숫자가 없으면 literal placeholder `[VERIFY: pull the actual metric]`.
- **Limit:** 아직 못 다루는 것(시니어-정직 블록, simlab "notModeled" 규율 그대로).

Rehearsal 메커닉(ExplainCard + PredictGate 재사용): DRILL DECK — interviewer의 likely follow-up probe 고정 세트, 각각 🧠 concept line + 🗣️ gold answer(SVO rhythm). time_budget_s에 대고 구술 후 reveal. Seed probe:
- "Why a SELECT-lock and not optimistic locking?"
- "How did you confirm the lock was the cause, not the symptom?"
- "What was the blast radius — how much money / how many transactions?"
- "If you did it again at Opendoor scale, what changes?"
- "Walk me through the row-level-lock id generator." (이력서 artifact)

DOMAIN-BRIDGE 카드(positioning을 speakable하게): "At SK AX this was inventory/financial records. At Opendoor it's homes, offers, and transactions — same engineering shape: data correctness and transaction integrity affecting real business outcomes."

**AI-default woven in** (그의 명시 지시): 각 probe 카드에 "AI-default addendum" 슬롯 — 같은 incident를 지금 AI를 loop에 넣어 어떻게 접근할지. 예: "Today I'd paste the lock trace and the query plan to Claude to enumerate candidate causes, then verify each against the actual EXPLAIN output myself — AI narrows the hypothesis set, I confirm with the real data." narration은 "the judgment was mine; AI compressed the search."로 끝난다. 이게 Round-1(past project)과 AI-enabled pairing round를 잇는 다리 — 같은 스킬(verify AI output)을 trick이 아니라 habit으로.

deep-dive reps counter를 surface해 underweighted된 라운드에 명시적 일일 시간을 준다. v1 scope: MDX 1개(이 incident), ExplainCard + timer 재사용, 새 컴포넌트 없음.

**Seeded 원본 (모두 검증됨, absolute path):**
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/cmic-interview-prep/04-oop-english.md` (🧠→🗣️ 포맷 + SVO rhythm)
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/cmic-interview-prep/10-rest-api.md` (API/status-code 템플릿 + 🗣️ scripts)
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/cmic-interview-prep/11-concurrency.md` (concurrency phrase-bank)
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/cmic-interview-prep/practice/Problem05_SimpleCache_Solution.java` (LRU gold — accessOrder buggy 스니펫 출처)
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/system-design-deep-dive/01-queue-worker/EXPLAIN_EN.md` (30-sec answer + filler-kill rule + "flaws on purpose")
- `/Users/daeseonyoo/Documents/GitHub/JavaFactory/system-design-deep-dive/01-queue-worker/reference/R1_NaiveQueueWorker.java` (catch-bug drill의 "flaws left in ON PURPOSE" 모델)

---

## 9. Tech stack + repo layout + REJECTED approaches

### Stack (블로그 그대로 재사용)

Next.js 15 (App Router) / TypeScript / Tailwind (ink/paper/accent 토큰 verbatim, locked-design 규칙) / MDX (next-mdx-remote + remark-gfm + rehype-pretty-code + `<Sim>`용 remark fenced-block→JSX trick) / Vercel static. i18n는 `lib/i18n.ts` shape 재사용(`DEFAULT_LOCALE = "en"`, `t()`, `localizedPath()` — 모두 확인됨). 새 npm dep은 ~10줄 mulberry32 외 없음.

### Repo layout (새 레포, concrete file tree)

```
offerlab/                          # (working name)
├── app/
│   ├── layout.tsx
│   ├── page.tsx                   # lesson index (EN-only v1)
│   ├── lessons/[slug]/page.tsx    # <Sim> + harness MDX 조립
│   ├── deepdive/[slug]/page.tsx   # SK AX 리허설 페이지 (Day 0-1)
│   └── comms/[slug]/page.tsx      # ExplainCard prompt
├── components/
│   ├── Sim.tsx                    # <Sim id="offer"/> — sim 등록·렌더
│   ├── ControlPanel.tsx           # spec-driven (controls = data) — simlab 재사용
│   ├── AuditLog.tsx               # append-only monospace readout
│   ├── ExplainCard.tsx            # prompt + gold + phrase bank + Loom + reveal
│   ├── PredictGate.tsx            # commit-before-reveal (~30 LOC)
│   ├── CatchBug.tsx               # read-only Java + diagnosis reveal
│   ├── DrillTimer.tsx             # time_budget_s 카운트다운
│   └── Mermaid.tsx                # 블로그에서 복사 — SD 정적 diagram용 (clock 없음)
├── lib/
│   ├── engine/
│   │   ├── prng.ts                # mulberry32 (~10 LOC)
│   │   ├── types.ts               # Ts, Rng, Result<S>, AuditEntry, Command
│   │   ├── offerMachine.ts        # #4 reducer — HARDCODED (첫 빌드)
│   │   ├── taskBoard.ts           # #3 — later (generic seam 강제 지점)
│   │   └── eventProcessor.ts      # #5 — later (offerMachine import)
│   ├── render/
│   │   ├── stateNodes.tsx         # (state) => <svg> primitive
│   │   └── offerRenderer.tsx      # Offer 전용 renderer
│   └── i18n.ts                    # 블로그에서 복사
├── content/
│   ├── lessons/en/offer.mdx       # L1→L5 ladder + checklist + speaking + notModeled
│   ├── comms/en/transition-endpoint.mdx
│   ├── comms/en/api-design.mdx
│   ├── comms/en/errors.mdx
│   └── deepdive/en/sk-ax-select-lock.mdx
├── docs/
│   └── trainer-design.md          # 이 문서
└── (tests)
    └── lib/engine/offerMachine.test.ts   # Vitest — deterministic suite
```

명시적으로 **없는 것:** `lib/source.ts`, `lib/storage.ts`, GitHub-Raw fetch, Octokit, NextAuth admin (블로그엔 있지만 trainer는 static, no publish, no admin), `lib/ai/`(stub조차 없음), code editor, backend route.

### REJECTED approaches

| 거부한 것 | 존재 이유 | 거부 사유 | Reversibility |
|---|---|---|---|
| **React Native / Flutter** | "진짜 mobile app" | mobile은 SVG-over-pure-state로 *공짜로* 얻는다(같은 renderer, ControlPanel만 tap target). 별도 앱은 새 스택·새 스토어·prep을 안 겸함 | one-way (스택 commit) |
| **in-browser Java (CheerpJ/TeaVM) v1** | backend 없이 in-browser 실행 | heavy bundle, freeze class, immature DX, 시험되지 않는 스킬에 며칠. Java는 Cursor/CoderPad에서 돈다 | two-way (post-interview desktop-only 선반) |
| **server-side exec (Judge0/Piston)** | 진짜 javac | backend 재도입(latency/attack surface/ops), 잘못된 것 리허설, prep 시간 경쟁 | hard |
| **account / auth / DB** | multi-user, persistence | first user = 본인. URL state로 sharing 대체 | hard |
| **generic engine-first (`StateMachine<S,E>`, registry)** | duplication 제거, "senior craft" 느낌 | premature abstraction(pre-mortem #1). v1은 sim 하나만 ship — 추출할 seam이 없다. 가장 위험한 procrastination | two-way지만 발동 시 STOP |
| **circuit-breaker lesson (simlab 원래 flagship)** | 좋은 resilience 설명 | Opendoor must-code 리스트에 없음 → prep을 안 겸함. post-interview simlab Stage-4+ | — |

---

## 10. v1 Scope (가차없이) + CUT LIST

### v1 (ship 하는 것)

1. **Offer/Transaction FSM** — pure-TS reducer (`lib/engine/offerMachine.ts`), hardcoded. `init(params, seed)`, `transition(state, cmd, ctx)`, transition table이 illegal을 REJECT하고 accepted마다 audit entry emit. **reducer 작성 = state machine drill.**
2. **3-layer 아키텍처 verbatim:** content(MDX) → engine(pure TS, mulberry32, logical time) → SVG renderer. one-way. framework-free, Vitest-tested. **빌드 = determinism/idempotency/reproducibility drill = L5.**
3. **Deterministic Vitest suite** — 모든 legal/illegal transition, dup eventId ignore, invalid-transition 409, audit emission, "same seed+params → same trace". **테스트 작성 = #4의 L2/L3 (edge/dup/invalid/audit) drill.**
4. **Per-FSM SVG renderer** — light되는 라벨 state node, valid/invalid/dup 색상 edge flash(CSS class, clock 없음), live audit-log 패널.
5. **Spec-driven ControlPanel** — event 주입(send/accept/expire/cancel) + logical time(integer tick) advance.
6. **ExplainCard** (static MDX, AI 없음) — interview prompt 1개, 그의 영어 gold answer(trade-off + limit), 5-8 chunk phrase bank(KO nuance), 영어 설명 Loom 1개.
7. **`notModeled` honesty block** (frontmatter field, DoD blocker) — toy FSM이 생략한 것(Postgres row-lock 없음, outbox 없음, real idempotency store 없음). **작성 = L5 production-hardening reps + deep-dive ammo.**
8. **Deep-dive rehearsal MDX** (SK AX SELECT-lock) + probe deck + timer — **Day 0-1 최우선.**
9. **Catch-the-bug** — curated buggy 스니펫 라이트(5개 seed).
10. **shareable-URL state** (`?seed=&params`, ~20 LOC) — screenshot-stable, linkable.
11. **Live Vercel 배포 Day 0부터**, EN-only UI 문자열.

### CUT LIST (명시적으로 v1에서 뺀 것)

- **Task Board #3, Event Processor #5, Pricing #7, Reconciler #6, LRU #2, Idempotency #8, Rate Limiter, Home Search** — pre-interview엔 CoderPad에서 plain Java로 drill, simulator로 빌드하지 않는다. visual FSM에 가장 깨끗이 매핑되는 *하나*(Offer #4)만 full sim treatment를 받는다 — 빌드 = drill이기 때문.
- **generic `Pattern<P,S>` framework / RenderModel vocabulary / sim registry** — premature abstraction. Offer FSM은 hardcoded one-off. 추출은 두 번째 머신이 seam을 강제할 때만(post-interview).
- **AI feedback / scoring / `lib/ai/`** (stub조차) — empty boundary가 foothold. AI 연습은 Cursor에서 실제 문제에 대고.
- **account / auth / login / DB / persistence backend** — first user 본인. URL state로 충분. Postgres는 notModeled 블록과 SD talk track에만, v1 코드엔 없음.
- **STT / pronunciation scoring / in-app recorder** — Loom 링크 1개 + static gold answer로 대체. 녹음은 reps 하나지 feature가 아님.
- **localStorage attempt-tracking, replay/scrubbing, 2-3개 넘는 scenario library, graph/backlink view** — determinism이 "공짜처럼 보이게" 만드는 기능들, 전부 prep 시간을 먹는다.
- **Korean layer (UI 문자열 + KO Format-A)** — fast-follow로 defer. 인터뷰는 영어, KO는 prep을 안 겸함. EN-only가 pre-interview window의 valid ship.
- **rAF loop / animated event ball / `useSimClock`** — §6 다운그레이드. v1엔 instant state change + integer tick 버튼만.
- **custom design system / ~10줄 mulberry32 넘는 새 dep** — 블로그 Tailwind 토큰 verbatim.
- **Format-A 4-tone 풀 라이트업 (marketing/big-picture tone)** — Raw + Professional tone만 deep-dive/pairing prep을 겸한다. 나머지는 인터뷰가 이미 편하게 준비됐을 때만.

---

## 11. BUILD ORDER = PREP PLAN (핵심 테이블 — 그의 10-day plan 추적)

> **불변 규칙: 일일 floor가 먼저다.** 매일, 어떤 Cursor 세션보다 먼저 — **45분 deep-dive reps + 타임드 cold problem 1개(AI off, blank editor).** 빌드는 floor를 채운 *후의 surplus*만 소비할 수 있다. **Day 10은 mock 전용 — Day 10에 코드 쓰면 그 자체가 tripwire(§12).**

| step | build task | yields (prep reps) | estimate |
|---|---|---|---|
| **0a** | **Deep-dive spine 작성** — SK AX SELECT-lock의 Before/Change/Result/Limit를 `content/deepdive/en/sk-ax-select-lock.mdx`에 쓰고 그가 말하는 첫 Loom 녹화. Result 슬롯엔 실제 숫자 또는 `[VERIFY: pull the actual metric]` | **Round-2 deep-dive [the crux] 첫 full pass.** 기술 위험 제로, 가장 높은 가중치. **simulator 코드 한 줄 쓰기 전에 이게 먼저** | Day 0 오전 (~반나절) |
| **0b** | **Stage-0 clock de-risk (THROWAWAY, NOT prep)** — 버튼이 integer를 증가시키고 SVG에 렌더(다운그레이드 후 rAF 없음). mulberry32 seeded reducer, live Vercel URL 배포, 실제 폰에서 열기, 첫 determinism unit test | **NONE — 정직한 단 하나의 예외.** clock은 가장 큰 기술 unknown이고 어떤 must-code에도 안 매핑됨. prep이 아니라서 fence + hard timebox(§12) | Day 0 오후, **HARD CAP 1일**(다운그레이드로 ~1시간). 끝까지 green 아니면 빌드 전면 STOP, 종이 drill |
| **1** | **Offer FSM을 pure reducer로** — `lib/engine/offerMachine.ts`: states, `init(params,seed)`, `transition(state,cmd,ctx)`에 illegal을 REJECT하고 accepted마다 audit emit하는 transition table. hardcoded, no generics | **Must-code #4 L1→L2** — canonical Offer/Transaction state machine, basic + illegal-transition. transition table 손으로 쓰기 = drill. deep-dive line "a status change is a business event"에 직결 | Day 1-2 (~2일). 10-day plan Day1-2 추적. 2-3h/day |
| **2** | **Vitest suite** — 모든 legal path, illegal → rejection, dup eventId ignore, out-of-order by logical tick, audit assert. same seed+params → same trace 증명 | **Must-code #4 L2→L3** (edge/dup/invalid/audit). test 파일 = edge-case enumeration drill. **#5(dup eventId, out-of-order, per-home final state)도 같은 머신에서 리허설 — 두 must-code, 한 reps** | Day 3 (~1일). Day3 추적. 60분 "one problem" 블록 = 이 테스트 소리 내어 쓰기 |
| **3** | **SVG renderer + ControlPanel** — light되는 state node, valid/invalid/dup 색상 edge flash(CSS class), live audit-log 패널. event 주입 + logical tick(real sleep 아님) | **#1(KV-TTL "logical time not real sleep")을 tick control로 리허설**, audit-log-as-business-event 프레이밍을 시각적으로 강제 — deep-dive에서 *말해야* 하는 바로 그것 | Day 4-5 (~2일). Day4-5 추적. recruiter-legibility front-load |
| **4** | **notModeled + Professional + Raw tone 라이트업** (lesson MDX) — toy FSM이 생략한 것(Postgres row-lock/outbox/idempotency store/optimistic-lock 없음)과 추가 방법. API 템플릿(POST `/offers/{id}/transitions`, 409, idempotencyKey+actorId+reason+audit in one tx) 포함 | **Must-code #4 L4→L5** (requirement change + production hardening) + SD talk track("Postgres as source of truth, every transition validated/idempotent/auditable"). gap을 소리 내어 쓰기 = deep-dive + SD 리허설. API 템플릿 = pairing LLD reps | Day 6-7 (~2일). Day6-7 추적. **가장 높은 interview-value 블록** |
| **5** | **ExplainCard 저작** — prompt("Why a separate /transitions endpoint? What breaks if a transition isn't idempotent?"), 영어 gold answer(차분, trade-off + limit, anti-guru fingerprint pass), 5-8 chunk phrase bank(KO nuance), 영어 Loom 1개 | **AI-DISABLED pairing round** (communication + edge cases 구술) + deep-dive 영어 전달 직접 리허설. phrase bank + Loom = "30분 English recording" 블록 | Day 8 (~1일). Day8(English recording) 추적. defer-proof: 녹음 1개지 feature 아님 |
| **6** | **2-3 named preset** (healthy-offer-lifecycle / expired-then-resent / invalid-transition-attempt) + shareable-URL state. **단 §14 d 준수: pre-interview엔 Lighthouse/resume polish에 시간 쓰지 않는다** | preset = 인터뷰에서 라이브로 띄울 deep-dive scenario. shareable URL = linkable artifact | Day 9 (~1일). Day9 추적. **포트폴리오 polish는 post-interview** |
| **—** | **Day 10 = full SD mock만.** 코드 작성 금지 | mock interview reps | Day 10 |

**Ship philosophy:** Day 0부터 always-usable, big-bang 아님. Day 0에 배포(live URL이 무언가를 렌더), 이후 매 step이 같은 live URL에 push("ship each change live", 그의 기존 습관). prep value는 엔진에 front-load돼 Day 3엔 존재한다. 인터뷰가 일찍 떨어져도 그때 live한 것은 이미 (a) 작동하는 prep trainer이자 (b) linkable artifact. **엔진이 prep이고, 나머지는 presentation이며, presentation은 prep을 절대 gate하지 않는다.**

---

## 12. Procrastination guardrail + tripwires + KILL-SWITCH

**HARD RULE:** 빌드는 현재 step의 yield가 must-code reps일 때만 카운트된다. Step 0b(clock)가 유일하게 허용된 non-prep 빌드이며 정확히 1일을 받는다.

### Tripwires (= STOP BUILDING, JUST DRILL)

1. **Step-0b clock이 다운그레이드된 scope(instant state change + integer tick 버튼, rAF 없음)로도 Day 0 끝까지 live URL에서 green이 아니면** → STOP, sim 전제가 unverified. 남은 window 동안 #1-#8을 CoderPad에서 plain Java로 drill, 아무것도 ship 안 함.
2. **Offer FSM lesson이 배포되고 클릭 가능해지기 전에 generic `Pattern<P,S>` interface / registry / 두 번째 simulator reducer를 쓰고 있는 자신을 발견하면** → STOP, 전부 inline. premature-abstraction procrastination. **그의 documented anti-scope-creep 본능이 여기선 Trojan horse다 — "good abstraction"이 시니어 craft처럼 *느껴지면서* prep을 먹는다.**
3. **어느 단일 build step이 추정치를 >50% 초과하면** → renderer/visual polish 버리고 reducer + tests만 유지(reducer가 reps, SVG는 gravy), 다음으로.
4. **recruiter prep email이 오거나 인터뷰 날짜가 *안으로* 당겨지면** → 마지막으로 clean하게 통과한 gate에서 도구를 freeze, 100% CoderPad/interviewing.io로 남은 must-code + SK AX deep-dive drill.
5. **일일 체크:** 오늘의 빌드가 인터뷰에서 *말할 수 있는* 것(transition rule, edge case, 영어 phrase)을 만들었나? No면 오늘은 procrastination — 내일은 Cursor 대신 CoderPad.
6. **Day 10은 mock 전용.** Day 10에 코드 쓰면 그 자체가 tripwire.

### KILL-SWITCH (빌드를 버리고 남은 window를 pure-drill — 아래 중 하나라도 발동 시)

1. **인터뷰가 7 calendar day 이하** — 그 범위엔 net-new clock/renderer/SVG 코드를 위한 slack이 없다(레포에 재사용 가능한 sim infra 제로 확인됨). Cursor 말고 CoderPad를 연다.
2. **Stage-0 state primitive가 다운그레이드 scope로도 1시간 내 live URL에서 clean하지 않으면** — 그 trivial 버전조차 싸우면 sim 전제 unverified, 버린다.
3. **Offer lesson 하나가 배포·클릭 가능해지기 전에 generic `StateMachine<S,E>` / `Pattern<P,S>` / registry / 두 번째 simulator reducer가 존재하면** — "good abstraction" Trojan horse 발동, STOP, refactor 말고 drill.
4. **어느 단일 날 빌드가 일일 drilling floor(45분 deep-dive + 타임드 cold problem)를 밀어냈으면** — 하루는 경고, 이틀 연속이면 도구가 prep을 먹는 것: 마지막 clean commit에서 repo freeze, 남은 window 100% CoderPad/interviewing.io.
5. **recruiter prep email 도착 또는 날짜 당겨짐** — 즉시 freeze, 100% drill.
6. **어느 단일 step이 추정 >50% 초과** — 모든 renderer/visual polish 버리고 reducer + tests만, 다음 drill로.

**Governing rule:** 엔진이 prep이다. presentation은 prep을 절대 gate하지 않는다. 그리고 **결과를 가를 가능성이 가장 높은 라운드는 simulator가 아니라 deep-dive 서사다.**

---

## 13. Success measures (인터뷰 결과 프레임 — 사용자/수익 아님)

이 도구의 성공은 사용자 수도, 수익도, 포트폴리오 클릭 수도 아니다.

- **(주) 인터뷰 결과:** Opendoor 인터뷰의 deep-dive와 두 pairing round를 통과한다.
- **빌드가 이해를 깊게 했다 — 측정 가능한 형태로:**
  - 인터뷰 전 최소 **4번의 cold blank-editor Java reps**(Cursor 없음, autocomplete 없음, 소리 내어)를 완료했다. 못 했으면 도구는 자기 일을 실패한 것(§14 a').
  - Offer FSM의 transition table·guard·audit·idempotency를 **종이에서 막힘 없이 재현**할 수 있다.
  - transition-endpoint gold answer를 **time_budget 내, Korean filler 없이, 2초 넘는 pause 없이** 말할 수 있다(그의 EXPLAIN_EN 규칙).
  - SK AX SELECT-lock deep-dive를 **follow-up probe 압박 하에 영어로** 말할 수 있고, AI-default addendum을 자연스럽게 엮는다.
  - 5개 catch-the-bug 스니펫의 defect를 각 **<60초**에 명명한다.
- **(부, post-interview upside일 뿐):** 빌드한 엔진이 simlab 코어의 seed가 된다 — pre-interview에 시간을 더 쓸 이유는 절대 아니다(§14 d).

---

## 14. Pre-mortem (실패 시나리오 + mitigation)

**(a) deep-dive(Round 2, the crux)를 떨어졌다 — 빌드가 prep 시간을 먹어서. 가장 가능성 높은 실패.**
설계가 Days 0-9를 Offer FSM(코딩 reps)에 붓지만 deep-dive는 SK AX SELECT-lock에 대한 *구술 past-project 서사* — 완전히 다른 근육. 빌드는 FSM-coding fluency를 훈련하지 ESL로 follow-up 압박 하에 60분 incident story 하는 걸 훈련하지 않는다.
**Mitigation:** 시간 배분을 뒤집는다. deep-dive 리허설을 **clock de-risk보다 먼저, Day 0-1에 가장 먼저** 빌드 — 기술 위험 제로(MDX + 말하기 + timer), 가장 높은 가중치. 첫 full spoken pass가 존재한 *후에만* simulator 코드를 쓴다. **일일 floor: build 진척과 무관하게 매일 45분 deep-dive + probe reps.** 어느 날 빌드가 deep-dive reps을 밀어냈으면 그 날은 reconciliation test 실패.

**(a') AI-DISABLED pairing round를 떨어졌다 — trainer가 잘못된 것을 리허설해서.**
trainer 전제는 "Cursor에서 sim 빌드 = 코딩 reps." 하지만 AI-disabled round는 AI OFF, CoderPad/종이, 사람이 보는 앞, 영어로 narrate하는 pure logic. Cursor에서 TS reducer 빌드(autocomplete + AI 있음 + 사람 없음 + clock 압박 없음 + Java 아닌 TS)는 거의 반대 환경. 아름다운 Offer simulator를 ship하고도 blank CoderPad에서 기억으로 Java 쓰며 freeze할 수 있다.
**Mitigation:** "build reps"과 "exam-condition reps"을 명시 분리하고 후자를 보호한다. simulator 빌드는 DESIGN/edge-case reps으로만 카운트. **하루 걸러 한 번은 타임드, AI-OFF, blank-CoderPad, 소리 내어 Java reps을 must-code에 대고** — Cursor 없음, autocomplete 없음, 가능하면 친구/interviewing.io peer가 지켜보며. trainer의 L1→L5 ladder + 7-item checklist가 그 bare 환경에서 코딩하는 SPEC. **인터뷰 전 최소 4번의 cold blank-editor Java reps을 안 했으면 trainer는 유일한 일을 실패.**

**(b) clock/renderer가 sinkhole이라 trainer가 반쯤 빌드된 엔진 rabbit-hole.**
코드베이스 확인됨: 기존 sim/clock/host/control 컴포넌트 없음(`find`로 확인), `components/Mermaid.tsx`는 `dangerouslySetInnerHTML`로 한 번만 렌더 live loop 없음 — rAF/fixed-timestep clock, StrictMode double-invoke, SVG event-ball interpolation 전부 100% net-new, 재사용 제로. 설계의 mitigation(rAF를 manual tick으로 다운그레이드)은 옳지만 prose에만 있고 강제하는 게 없다. "event ball animates along the edge"가 continuous animation을 슬쩍 재도입.
**Mitigation:** clock 다운그레이드를 suggestion이 아니라 hard cut으로 강제(§6): v1엔 rAF loop 전무 — state 변화는 버튼 누르면 즉시, logical clock은 버튼이 증가시키는 integer, **animated event ball 없음**(edge는 클릭 시 CSS class 토글로 green/red flash). "event ball animates along the edge"를 v1 scope에서 삭제. Stage-0 throwaway가 trivial(버튼이 SVG의 숫자 증가)해져 1일이 ~1시간으로. requestAnimationFrame / accumulator / `useSimClock`을 쓰고 있으면 tripwire #2 발동 — STOP, inline.

**(b') "good abstraction" rabbit hole (그의 documented Trojan horse).**
anti-scope-creep 본능이 역설적으로 clean한 generic `StateMachine<S,E>` / transition-table 엔진 / sim registry를 green-light한다 — 시니어 craft처럼 *느껴지고* "duplication을 줄이니까". 설계가 이걸 pre-mortem #1로 명명하면서도 "design the SHAPE to be generic on paper"와 "extracting the table-driven engine is itself Drill L4"로 rationalization을 seed — 그 L4 프레이밍이 v1에서 sim 하나만 ship하는 도구에 2일짜리 abstraction detour를 정당화할 intellectual cover다.
**Mitigation:** L4-extraction-as-build 정당화를 v1에서 outright 죽인다. v1은 inline transition table을 가진 hardcoded Offer reducer 정확히 하나만 ship — 두 번째 simulator 없음 → 추출할 seam 없음 → **"L4 requirement change" drill은 종이에서**(어떻게 state를 추가할지 Java로 MDX에 쓴다), TS 엔진을 refactor하지 않음. 구체 tripwire: `engine/StateMachine.ts` 류 파일, `Pattern<P,S>` 타입, registry map, 두 번째 sim reducer가 Offer lesson 배포·클릭 가능 전에 존재하면 STOP, inline. generic shape는 인터뷰에서 *말하는* 것("I'd model this as a reducer over a transition table")이지 v1에서 *빌드하는* 게 아니다.

**(c) diffuse-effort 실패: simulator 60% + 문제 60% drill, 둘 다 mediocre.**
8 must-code + 5 SD topic + 5 drill module + deep-dive + 풀 simulator — 빌드에 0시간 가도 2주가 못 담는 surface. rabbit hole 하나가 아니라 breadth로 인한 death: 모든 것 조금, 마스터 제로.
**Mitigation:** 작업 전에 rank하고 절단. 가장 나올 법한 3-4 must-code만 골라 L5까지 drill — KV-TTL("canonical Opendoor screen"), Offer/Transaction FSM #4(도메인 척추), Task Board #3, Event Processor #5. **#6 #7 #8 + insurance 둘은 pre-interview window엔 "spec 한 번 읽고 코딩 안 함"** 상태로 cut. simulator는 고른 문제 중 정확히 하나(Offer #4)만 커버. 그 하나 simulator 너머는 전부 plain-Java-on-CoderPad, 빌드 아님.

**(d) simulator는 기술적으로 done인데 portfolio/resume artifact로는 무가치 → 빌드 시간이 reps 외엔 아무것도 못 삼.**
EN-only, 실제 인터뷰어가 결정 2주 전 resume 링크를 클릭할 리 없고, code execution 없는 single-FSM toy는 system이 아니라 demo로 읽힌다. "durable simlab seed" 정당화는 post-interview 이득으로 pre-interview 시간을 정당화하는 category error.
**Mitigation:** portfolio/resume value를 인터뷰 전 빌드 이유로 카운트하지 않는다. reconciliation 원칙을 통과하는 유일한 pre-interview 정당화는 "이 시간이 coding/design/speaking reps"뿐. linkable artifact와 simlab seed는 순수 post-interview upside — 떨어지면 좋고, polish 시간을 더할 이유는 절대 아님. 구체: **Day 9를 Lighthouse≥90, presets-as-polish, shareable-URL, resume 게재에 쓰지 않는다** — 그 전부 post-interview 작업. Day 9·Day 10은 mock interview와 cold reps.

---

## 15. Open decisions to confirm (빌드 시작 전)

> 이 중 첫째가 **master variable**이다. 나머지는 그것에 종속.

1. **정확한 인터뷰 날짜 (또는 recruiter의 명시 window).** 레포에 없음("very soon"만). **<7일이면 kill-switch가 이미 발동 — trainer 코드 한 줄도 금지(§12).** 이 숫자를 *가장 먼저* 정한다. "build"가 테이블에 올라올지 자체를 결정.
2. **이름.** `offerlab` / `repbench` / `prep-sim` 중. two-way door(레포 rename)이라 빌드를 막진 않지만 첫 commit 전에 정하면 깔끔.
3. **code-exec yes/no.** 본 문서는 **no-exec**로 RESOLVED(§7). 인터뷰 후 desktop-only "edit-and-run"으로 flip 가능하나 v1 아님 — 이 결정을 확정만.
4. **Round 가중치 + cut list.** 어느 라운드가 최고 레버리지인지(설계는 deep-dive Round 2가 crux), 어느 3-4 must-code가 L5 drill을 받고 어느 게 read-once로 cut되는지 *글로 commit*. ranking 없으면 breadth가 죽인다(§14 c). cut은 명시·dated.
5. **deep-dive에 실제 숫자가 있는가.** 실제 SK AX 프로젝트 노트/이력서를 열어 측정 가능한 Result(latency 감소, lock-wait 감소, unblocked transaction)가 있는지 확인. 없으면 deep-dive prep이 emergency지 trainer가 아니다 — 빌드 전에 결정.
6. **clock의 hard v1 cut.** v1엔 rAF loop 없음, animated event ball 없음, `useSimClock` 없음 — instant state change + integer tick 버튼만. 글로 적어 Stage 0가 1일→1시간으로 collapse(§6, §14 b). Stage 0 전에 확정.
7. **일일 non-negotiable floor.** 45분 deep-dive reps + 타임드 cold problem 1개, 매일, Cursor 세션보다 먼저. floor와 순서(drill 먼저, build 나중)를 정해 빌드가 floor 충족 후 surplus만 소비하게 — 도구가 prep을 먹는 것에 대한 structural firewall.
8. **exam-condition reps은 어디서, 사람이 끼는가.** interviewing.io / peer mock 2-3 세션(AI-disabled pairing + SD mock)을 *지금* 예약. trainer는 압박 하에 지켜보는 사람을 simulate 못 한다(§14 a'). 예약 안 하면 빌드는 시험보다 strictly 쉬운 환경을 리허설하는 것.

---

## 16. Logging system — 블로그와 동일하게 (dual-write + satellite 집계)

> 요구사항(owner): "블로그 로깅시스템은 똑같이 돌아가게 해야 한다." 아래는 메모리가 아니라 블로그 실제 구현(`.claude/hooks/stop-check.sh`, `lib/source.ts`, `lib/logs.ts`, `install/setup.sh`)을 읽고 확정한 것.

### 두 control plane을 그대로 이식

| Plane | 무엇 | 속성 |
|---|---|---|
| **Harness (코드)** | `.claude/hooks/stop-check.sh` (Stop hook) | 항상 실행. 최신 commit 해시가 `docs/troubleshooting.md` 또는 `content/logs/`에 없으면 턴을 **hard-block**. positive trigger(LOC>200 / 민감경로 / subject 키워드)는 `[no-log]`도 override |
| **Prompt (텍스트)** | `CLAUDE.md`의 "Project log (required, dual-write)" 규칙 | 매 턴 읽힘, 강제 못 함(asks). hook이 강제하는 부분의 안내문 |

**설치:** 블로그의 `install/setup.sh`를 새 repo에서 한 번 실행 → hook + `.claude/settings.json`(Stop hook 등록) + `CLAUDE.md` 스니펫 + `docs/troubleshooting.md` starter가 주입된다. (주의: `scripts/propagate-hook.sh`는 `settings.json`을 통째로 덮어쓰는 알려진 결함이 있으니, trainer가 satellite-specific hook을 갖게 되면 그건 쓰지 말 것 — v1엔 custom hook 없으니 무관.)

### Dual-write 형식 동일

- `docs/troubleshooting.md` — 머신용 flat index. Symptom / Cause / Fix / Commit / Pattern. `<!-- skipped: HASH -->`, `<!-- override-trigger: HASH ... -->` 마커도 동일.
- `content/logs/<slug>/<YYYY-MM-DD>-<short-slug>.mdx` — 사람용 dated narrative. frontmatter: `title, date, project, kind, visibility, language, summary, tags` + kind별(`tier, status, reversibility, source, participants, linked_decision, ...`). kind 집합도 동일(`troubleshoot · tech-retro · ux-retro · decision · discussion · business · monetization · update · snapshot · learning-gap`).

### Satellite로 블로그에 자동 집계 (포트폴리오 surface)

블로그 `lib/source.ts`가 프로젝트 frontmatter의 `logSourceRepo`를 보고 **GitHub API로 위성 repo의 `content/logs/<slug>/`를 끌어와** `/projects/<slug>`에 렌더한다(`listProjectLogs`/`getProjectLog`). 온보딩 3스텝:

1. 새 repo에 `content/logs/<slug>/*.mdx`를 쌓는다 (위 형식).
2. **블로그**에 `content/projects/{en,ko}/<slug>.mdx`를 만들고 frontmatter에 **`url`(라이브 링크 — 필수, 없으면 loader가 필터링) + `logSourceRepo: <github-owner/repo>`**를 세팅.
3. push → ISR(~3-5s) 후 trainer의 개발 히스토리(decision/troubleshoot 엔트리)가 daeseon.ai에 timeline으로 노출. → 이 도구의 *빌드 과정 자체*가 구직 포트폴리오가 된다(단 §14 d: 이건 post-interview upside, pre-interview에 polish 시간 쓸 이유 아님).

- **bilingual 로그 지원:** `<event>.en.mdx` + `<event>.ko.mdx` 또는 `language` frontmatter로 페어링(`listProjectLogs`의 locale 필터). EN-only로 시작해도 됨(fallback이 전부 보여줌).
- **slug ≠ reponame** 가능하지만 일관 유지 (위성 onboarding gotcha).
- `*.human.mdx` companion은 **블로그 repo에만** 둔다(위성 아님) — AI 엔트리는 위성 히스토리, companion은 블로그 관점의 주석.

### 안전 경계 + 10-day 스프린트와의 화해

- **위성 repo에 내(Claude)가 명시적 승인 없이 자동 commit 하지 않는다** (project-log 7-property #6). Stop hook이 켜져 있으면 Claude Code로 trainer를 빌드할 때 매 commit마다 dual-write 또는 `[no-log]`를 요구하니, 같은 규율이 그대로 적용됨.
- **스프린트 중엔 로깅을 가볍게.** routine commit(렌더러 색 조정, 카피 수정 등)은 `[no-log]`로, full dual-write는 진짜 decision일 때만 — 이 설계 자체가 이미 그 decision 로그의 원재료다. 로깅이 §11 일일 floor(deep-dive + cold problem)를 잡아먹으면 그게 §12 tripwire.

### repo tree에 추가되는 파일 (§9 보강)

```
offerlab/
├── .claude/
│   ├── settings.json            # Stop hook 등록 (install/setup.sh가 주입)
│   └── hooks/stop-check.sh      # 블로그와 byte-identical
├── CLAUDE.md                    # project-log 규칙 스니펫 (+ trainer 고유 규칙)
├── docs/troubleshooting.md      # 머신용 dual-write index
└── content/logs/<slug>/*.mdx    # 사람용 dual-write narrative (블로그가 집계)
```

---

## 17. Status

**Proposed** · sibling of `docs/simlab-design.md` · Author: Claude (workflow-synthesized) · Date 2026-06-07 · 로깅 섹션(§16)은 블로그 실제 구현 확인 후 추가

# simlab — Interactive Backend-Pattern Playground (Architecture & Design)

> **Status:** Proposed · supersedes `docs/interactive-playground-architecture.md` (the earlier Antigravity doc) · **Author:** Claude (workflow-synthesized) · **Tier:** 1 (substantial — new repo, new product surface, architecture + content + monetization-posture decisions) · **Date:** 2026-06-07

This document is itself a portfolio artifact. It is written to be read by a senior engineer (the owner) and, indirectly, by a hiring manager who finds it in the repo. It commits to a single buildable v1, names what is cut, and bakes the owner's anti-scope-creep discipline into the file layout and the gates — not into willpower.

---

## 1. 제품 한 줄 정의 + 이름 후보

**한 줄 정의:** backend resilience 패턴에 부하와 장애를 직접 주입하고, 상태·지연이 실시간으로 어떻게 반응하는지 watch 하는 양방향(KO-first) 학습 playground. 차분한(담담한) senior 엔지니어의 목소리로 서술하고("이 모델이 *담지 못하는* 것은 다음과 같다"), 그 패턴을 영어로 설명하는 interview 연습이 같은 lesson 안에 붙어 있다.

이름은 calm·anti-guru여야 하고, 짧고, subdomain으로 깔끔해야 한다(`*.daeseon.ai`). 후보:

| 후보 | 근거 | trade-off |
|---|---|---|
| **simlab** (추천) | "simulation lab" — 학습/실험 뉘앙스, guru 냄새 없음, `sim.daeseon.ai` 깔끔 | 약간 generic |
| **patterns** | `patterns.daeseon.ai` — 내용이 곧 이름, 검색 친화 | 너무 넓어 보일 수 있음 |
| **failmode** | 차별점(장애 주입)을 직접 가리킴, 기억에 남음 | 부정적 어감, KO 청중엔 덜 직관적 |

이 문서는 `simlab`을 placeholder로 쓴다. owner가 자유롭게 rename — 코드/route는 어차피 subdomain + repo 이름에만 묶여 있어 reversibility는 **easy**.

---

## 2. Context & Constraints

- **목적 = job-hunt 우선.** Toronto에서 구직 중인 6년차 backend+AI senior(ex-SK AX, ESL). 이 빌드의 1차 가치는 매출이 아니라 **senior 판단력을 60초 안에 검증 가능한 형태로 보여주는 것**, 그리고 owner 본인이 (a) simulator를 만들며 system-design을 깊게 익히고 (b) interview communication과 실무 영어를 연습하는 vehicle.
- **ICP가 곧 owner.** v1의 "사용자"는 owner 본인 + recruiter 둘뿐. audience 검증 부담이 낮아지므로 audience-first 제약은 풀린다 — 대신 recruiter-legibility가 모든 결정의 tie-breaker.
- **mobile = controls-only (이미 결정됨).** code editing이 native component로 포팅되지 않는다는 사실(Sandpack/Monaco/WebContainers는 React-DOM browser artifact; react-native-web은 RN→web 단방향)에 근거. core engine은 parameter-driven deterministic simulator + SVG renderer로, web/mobile-web에서 **동일 코드 경로**로 돈다. sandbox·코드 실행 없음 → RCE/freeze 위협 class가 설계상 존재하지 않는다.
- **solo.** mobile-native 경험 없음. 검증된 stack(Next.js 15 / TS / Tailwind / Vercel / MDX)만 사용.
- **Vercel free (Hobby) tier.** v1은 사실상 정적 사이트 — API route 없음, DB 없음, server function 없음. build ~60s, 6000 build-min/month 한참 아래.
- **NON-NEGOTIABLE guardrail.** 유일한 실패 모드는 over-scope → half-finished → **최악의 interview artifact**. 3개의 70%짜리 simulator는 1개의 완성품보다 hiring manager에게 *나쁘게* 읽힌다(판단력 부재 신호). 따라서 ruthless scope + staged kill-gate가 이 설계의 척추다.

---

## 3. Goals (ranked) + Non-Goals

### Goals — 우선순위 순 (위가 아래를 지배)

1. **고정 ship date 안에 polished v1을 라이브로 올린다.** half-finished가 유일한 진짜 실패. 이 목표가 나머지 전부를 이긴다.
2. **하나의 lesson에서 senior 판단력을 증명한다.** deterministic·unit-tested state machine + "이 모델이 담지 못하는 것" honesty block. generated code가 흉내 못 내는 신호.
3. **build = system-design 학습 = interview 영어 연습**을 하나의 mechanic으로 융합한다(별도 트랙 X). predict → simulate → explain.
4. **KO-first bilingual로 검증된 빈 niche를 점유한다.** Korean-first interactive system-design 콘텐츠는 verifiably empty.

### Non-Goals — 이건 무엇이 *아닌가* (명시적으로 거부)

- **NeetCode/LeetCode clone이 아니다.** DSA practice는 solo로 방어 불가능한 포화 시장. 진입 안 함.
- **v1에서 revenue SaaS가 아니다.** monetization은 v1 driver가 아닌 *나중의 가능성*. 성공 지표에서 pageviews/signups/DAU/revenue는 **명시적으로 제외**.
- **mobile에서 code-execution 없음.** controls-only. sandbox/Worker/`new Function` 없음 → RCE/freeze class를 v1에서 영구히 부재시킨다.
- **v1에 account가 없다.** auth/login/DB/server-side persistence 없음. URL query param이 유일한 공유 상태.
- **AI-mock-feedback 레인에 진입하지 않는다(v1).** research가 "filling fast / 포화 중"으로 flag. v1은 human-authored static comms. AI scoring은 gated v2 후보.
- **generic "any-pattern" framework가 아니다(v1).** abstraction은 두 번째 패턴이 강제할 때 *추출*하는 것이지, 미리 설계하는 것이 아니다.

---

## 4. The Differentiation Thesis — 왜 포화 시장에서 방어 가능한가

검증된 saturation map:

| 영역 | 포화도 | 결론 |
|---|---|---|
| DSA practice | very-high | solo 방어 불가 → 진입 안 함 |
| system-design **static** content | high | 또 하나의 산문 페이지 → 안 함 |
| AI-mock-feedback layer | filling fast | v1 진입 안 함, v2 후보로만 |
| interactive **backend-pattern explainers** | **LOW / supply-constrained** | 진입 |
| TRUE simulation (부하/장애 주입, 지연 watch) | **largely open** | 핵심 베팅 |
| **Circuit Breaker** interactive | **단일 SPARSEST** (rate-limiter·consistent-hashing은 이미 incumbent 존재) | **v1 flagship** |
| **Korean-first** interactive system-design | **verifiably EMPTY** | niche moat |

adversarial verification을 통과한 차별점 네 가지, 그리고 각각이 *왜 카피되기 어려운가*:

**(a) bilingual EN/KO, KO-first 콘텐츠.** 시장이 검증상 비어 있다. incumbent가 이 niche에 들어오려면 한국어 senior 엔지니어 저자가 필요한데, 그게 곧 진입 장벽이다.

**(b) owner의 calm anti-guru voice가 widget에 융합됨.** 헐벗은 simulator는 voice를 카피할 수 없다. daeseon.ai의 4-tone(날것/마케팅/전문가/큰그림) 컨벤션이 그대로 lesson 위에 얹힌다. simulator는 commodity가 될 수 있어도, simulator + 이 목소리는 아니다.

**(c) narrow-deep single-mechanism + senior honesty.** 한 메커니즘을 깊게 파고, "**이 모델이 담지 못하는 것**"을 명시한다(실제 CB는 sliding-window percentile·per-host bulkhead·slow-call threshold를 쓰지 단일 global counter가 아니다 — owner의 실제 ops 경험에서 나온 honesty). 이 정직함 자체가 senior 신호다. 헐벗은 incumbent는 이걸 못 한다(경험이 없으니까).

**(d) ESL senior를 위한 communication/실무 영어 연습.** unserved 교집합: Pramp/interviewing.io는 기술 답만 채점하고 native라 가정한다; Speak/ELSA는 도메인 깊이가 0(`idempotent`를 올바로 썼는지 판정 못 함); 해커스/1:1 튜터는 비싸고 느리며 senior 도메인 판단이 없다. **"circuit breaker가 뭔지는 안다. 90초 안에 'um, how to say' 없이 영어로 crisp하게 설명하고 싶다"** 를 아무도 서빙하지 않는다. owner가 literal ICP이므로 user need를 추측 없이 저작할 수 있다.

**Thesis:** owner의 모든 제약(solo, ESL, mobile-native 무경험, no audience)이 *차별화 신호로 전환*된다. 헐벗은 simulator는 (b)(c)(d)를 못 베끼고, incumbent는 (a)에 못 들어온다. 그리고 ruthless single-lesson scope 자체가 가장 희귀한 senior 자질 — "작은 것을 끝까지 ship 한다" — 을 증명한다.

---

## 5. Core Architecture

세 개의 hard-separated layer. 의존성 화살표는 단방향: **content → engine → renderer** (위로 import하는 layer 없음). 이 seam이 portfolio artifact다.

> **중요한 v1 규율 (pre-mortem #1 + #6 must-fix):** 아래 인터페이스는 **TARGET 상태이지 v1 ship의 gate가 아니다.** v1에서 Circuit Breaker는 **one-off로 하드코딩**한다 — generic `Pattern<P,S>` 없음, `RenderModel` vocabulary 없음, registry 없음(단일 import이면 충분). abstraction은 *두 번째 패턴(Retry)이 seam을 강제할 때* 추출한다(rule of three, one-and-a-half에서 적용). Tripwire: Stage-0/1 timebox 끝에 `lib/sim/types.ts`에 generic `Pattern` interface가 존재하는데 Circuit Breaker가 deploy/clickable 상태가 아니면 → **STOP, 전부 inline.**

### Layer 1 — ENGINE (pure, framework-free, zero React/DOM)

`lib/sim/`에 사는 순수 TypeScript. React import 없음, DOM 없음 → 어디서나 동일 실행, plain Vitest로 테스트.

```ts
// lib/sim/types.ts  (v1: CB에 맞춰 구체적으로 시작; 일반화는 나중)
type Tick = number;                       // 정수 논리 틱 (frame rate와 분리)
type Rng  = () => number;                 // mulberry32, seeded — Math.random 금지

// v1 구체형. 두 번째 패턴이 강제하면 여기서 Pattern<P,S>로 추출한다.
interface CircuitBreakerState { /* mode, counters, inFlight[], rolling metrics */ }
interface CircuitBreakerParams { requestRate; failureRate; failureThreshold; openTimeoutMs; halfOpenTrials; }

function init(params: CircuitBreakerParams, seed: number): CircuitBreakerState;
function step(state: CircuitBreakerState, params: CircuitBreakerParams, rng: Rng, tick: Tick): CircuitBreakerState;  // PURE reducer
```

핵심 속성: **fixed-timestep + seeded PRNG** ⇒ `(params, seed)`가 출력을 *완전히* 결정한다. 이 결정성이 세 가지를 한꺼번에 산다 — (1) reproducible(URL-shareable, screenshot-stable), (2) trivially unit-testable(`동일 seed+params ⇒ 동일 trace`), (3) web ≡ mobile-web(그냥 산술, platform API 없음). **이 unit test가 repo 안에서 load-bearing senior 신호다** — simulator가 CSS 애니메이션이 아니라 진짜 finite state machine이라는 증거.

### Layer 2 — RENDER + CONTROLS + LOOP (유일하게 React-aware한 부분)

- **`<SimHost>`** — clock의 주인. `requestAnimationFrame` 위에 **fixed-timestep accumulator**(느린 폰에서도 논리 틱이 정확하도록 frame rate와 분리), pause/step/reset, React-19 StrictMode double-invoke 안전한 cleanup. params를 state로 들고 있다가 engine에 먹이고, 결과 state를 renderer에 넘긴다.
  > ⚠️ **pre-mortem #2 (verified):** 이 clock hook은 blog의 Mermaid pattern으로 *재사용 불가*. `Mermaid.tsx`는 `[chart]`에 keyed된 useEffect에서 정적 문자열을 *한 번* 렌더해 `dangerouslySetInnerHTML`로 던진다. simulator는 그게 아니라 살아있는 rAF lifecycle이 필요하다. 이 hook을 **단일 최대 unknown**으로 취급하고 Stage 0에서 throwaway로 de-risk한다(§9 GATE 0).
- **`<ControlPanel>`** — spec-driven. 각 control은 *데이터*(`{ kind: "slider"|"toggle"|"select", id, min, max, step, default, label_en, label_ko }`). 한 번 만들면 모든 패턴 재사용. mobile에선 sliders가 세로로 stack, 작은 화면에선 tick loop가 step-on-tap으로 떨어져 controls-only 인터랙션에 맞춤.
- **per-pattern SVG renderer** `(state) => <svg>`. v1은 **SVG, not Canvas**: declarative, diff-friendly(React 19), accessible, retina-crisp, Tailwind 테마로 바로 스타일. CB-class 다이어그램은 요소가 수십 개라 SVG의 per-node DOM 비용이 문제 안 됨. (Canvas는 1000+ particle이 필요한 가상의 미래 패턴용 documented escape hatch로만 남긴다.)

### Lesson model — content-as-data

하나의 lesson = **MDX 파일 + registered simulator id**. lesson은 코드가 아니라 데이터:

```
content/lessons/{en,ko}/circuit-breaker.mdx
---
slug: circuit-breaker
language: en            # 한 lesson = 한 언어 (blog 규칙 그대로)
translationKey: circuit-breaker   # EN↔KO cross-link
simulator: circuit-breaker
title, summary, difficulty
predictPrompt: "..."    # PredictGate가 읽음 (Arch-B graft)
notModeled:             # 구조화된 honesty 필드 (Arch-B graft) — DoD blocker
  - "단일 global counter — 실제 CB는 sliding-window percentile"
  - "per-host bulkhead 없음"
  - "half-open probe concurrency limit 없음"
---
```

MDX 본문은 4-tone 산문을 담고, simulator는 단일 MDX 컴포넌트 `<Sim id="circuit-breaker" />`로 드롭인된다. 이건 blog의 fetch/MDX/`translationKey` 컨벤션을 그대로 미러해 owner가 muscle memory를 재사용하게 한다.

### Page 조립

```
LessonPage = 산문 컬럼  +  sticky sim 패널[ ControlPanel + SimHost(SVG renderer) ]
             + PredictGate(reveal 잠금)  +  ExplainCard(explain-back)
```

**PredictGate (Arch-B graft, 최고 leverage):** simulator의 첫 reveal을 학습자가 *예측을 commit*할 때까지 잠근다. ~30 LOC의 client state, backend 없음. passive watching을 active recall(generation effect)로 전환하고, repo를 읽는 hiring manager에게 "의도된 learning-design 결정"으로 읽힌다 — 단순 애니메이션이 아니라. recruiter가 그냥 보고 싶을 땐 named preset 한 탭으로 우회 가능(§6, §8).

### Directory / repo layout (구체적 이름)

```
simlab/                                  # 새 repo, Next 15 App Router
  app/
    (site)/page.tsx                      # lesson index (EN default; KO toggle)
    (site)/lessons/[slug]/page.tsx       # EN lesson
    (site)/ko/lessons/[slug]/page.tsx    # KO lesson
    (site)/about/page.tsx                # who/why, daeseon.ai 역링크
    (site)/about-the-build/page.tsx      # 아키텍처 narration (Arch-C graft) — 추출 AFTER
    layout.tsx, globals.css
  lib/
    sim/
      clock.ts        # useSimClock: rAF + fixed-timestep + pause/step/reset
      prng.ts         # mulberry32 (~10 lines, no dep)
      circuitBreaker.ts   # v1: init/step + defaults + controls (하드코딩, generic 아님)
      __tests__/circuitBreaker.test.ts  # 결정성 증명: 동일 seed+params ⇒ 동일 trace
      url-state.ts    # ?seed=&params... 직렬화 (Arch-C graft, ~20 LOC)
    lessons.ts        # blog에서 thin port
    i18n.ts           # t()/COPY shape verbatim port (DEFAULT_LOCALE='en' 유지 — §13)
  components/
    sim/
      SimHost.tsx           # clock + control 배선
      ControlPanel.tsx      # spec-driven (Slider/Toggle/Select)
      PredictGate.tsx       # reveal 잠금 (Arch-B)
      ExplainCard.tsx       # explain-back retrieval (Arch-B)
      NotModeled.tsx        # 구조화된 honesty box (Arch-B)
      renderers/CircuitBreaker.tsx   # v1: 전용 SVG (generic SimCanvas 아님)
    Mermaid.tsx             # blog에서 그대로 재사용 (정적 다이어그램용)
    mdx-components.tsx       # <Sim> 등록
  content/
    lessons/{en,ko}/circuit-breaker.mdx
    comms/{en,ko}/circuit-breaker.mdx   # explain-back 콘텐츠 (gold answer, phrase bank)
  docs/                     # architecture.md, troubleshooting.md, project-log (dual-write 승계)
  tailwind.config.ts, next.config.mjs, tsconfig.json
  # /api 없음, /admin 없음, lib/ai/ 없음 (stub조차 — pre-mortem)
```

**Lesson template (반복 단위 — 고정):** PART 1 visualizer(3–5 control 상한, 3 preset, instrumentation 패널) · PART 2 Format-A 4섹션 + required honesty block · PART 3 comms drill. 이 shape를 고정하는 것이 anti-scope-creep mechanism이다 — lesson N+1은 redesign이 아니라 fill-in-the-blanks.

---

## 6. The Communication + Practical-English Pillar

**핵심 통찰(Arch-B, 양대 judge가 winner로 꼽음):** communication pillar는 별도 feature가 아니라 **learning loop의 retrieval-practice 단계**다. explain-back이 곧 highest-retention active mechanism이고, 동시에 owner의 영어 interview 리허설이며, 추가 아키텍처 비용이 ~0이다. 두 1차 목표(학습 + 영어)가 *경쟁*하지 않고 *서로 강화*한다.

> **graceful-degradation 계약 (Arch-A graft):** comms pillar는 v1에서 **순수 콘텐츠**(MDX + 데이터 + Loom 링크 하나)다 — 엔지니어링 시간과 경쟁할 수 없다. GATE-1이 미끄러지면 pillar는 prompt + 녹화 클립 하나로 collapse한다. feature가 아니라서 ship date를 위협할 수 없다.

### v1 mechanic — AI 없음, static only

같은 circuit-breaker lesson에 붙는 `<ExplainCard>`, 네 조각 전부 MDX/데이터:

1. **INTERVIEW PROMPT** — owner가 저작한 질문 하나. *"An interviewer asks: why a circuit breaker over plain retries, and what's the failure mode if you set the threshold wrong? ~60s."*
2. **MODEL ANSWER (기본 접힘)** — owner 본인의 gold answer, calm한 실무 영어 3–5문장, trade-off + limit("what it does NOT solve") 명시, load-bearing 구문 bold. ESL senior가 *어떻게 들려야 하는가*의 writing sample 역할도 한다.
3. **PHRASE BANK** — 5–8개의 high-confidence canonical collocation + 일회용 영어 → 잘못-틀린-ESL 버전 cross-out: `"trips open" ✓ / "the circuit goes off" ✗`, `fail fast`, `degrade gracefully`, `back-pressure`, `half-open`, `cooldown`. 각각 KO nuance 노트. **이게 가장 cheap·high-leverage 영어 훈련** — 아는 개념을 *말할 수 있는 구문*으로 전환. (verified self-check 못 하는 ESL 한계 → v1은 reference로 검증 가능한 canonical만; 불확실한 건 defer.)
4. **녹화 reference 클립 하나 (Arch-A graft, recruiter money-shot)** — owner가 패턴을 영어로 설명하는 Loom/mp4 **링크**(in-app recorder 아님). dogfooding 증거 + 단일 가장 recruiter-legible한 "이 사람은 영어로 communicate 한다" 신호. 이건 feature가 아니라 녹화 한 번이므로 **defer 금지.**

PredictGate가 강제하는 self-attempt → ExplainCard가 gold standard를 reveal → 학습자 self-compare. localStorage attempt-tracking조차 v1엔 없음(empty stub도 foothold). "소리 내어 말한 뒤 reveal" 루프는 녹화 없이도 동작한다.

### Later mechanic — AI feedback (deferred, gated)

명시적 opt-in 뒤에 darkened된 "Get feedback" 버튼. **written-first**(저렴): 학습자가 textarea에 설명 입력 → gold answer/rubric에 anchored된 단일 Claude 호출이 4축 diff 반환 — (1) 기술 정확성(trade-off·limit 말했나, 틀린 주장 flag) (2) 영어 phrasing(`"open the circuit"` → `"trip the breaker"`) (3) jargon 정밀도 (4) concision. **spoken**(이후): MediaRecorder blob을 Whisper-class로 transcribe 후 동일 rubric + filler-word count + pace. rubric-anchored이라 cheap·on-voice(Haiku-class면 축 2–4 충분). recruiter 트래픽이 paid call을 trigger 못 하도록 opt-in + localStorage rate-limit. **AI는 채점만, 절대 저작 안 함** — AI 저작은 guru tone을 주입해 (b)(c) 차별점을 파괴한다. 모델 ID/가격은 `claude-api` skill로 확인 후 wiring, memory에서 하드코딩 금지.

### One session UX flow (v1)

1. 학습자가 위 simulator로 이미 놀았다 — failure-rate 슬라이더 끌어 breaker가 trip open → half-open으로 복구하는 걸 봤다. 메커니즘이 fresh·concrete.
2. "Now explain it" 패널로 스크롤. tab row: `[Interview] [Design doc] [PR comment] [Standup]`, 기본 Interview.
3. prompt 카드 읽음. (PredictGate가 이미 commit을 강제했으므로 학습자는 mental model을 보유.)
4. 소리 내어 답한다(녹화는 선택, 절대 load-bearing 아님; MediaRecorder 부재/거부 시 silent fallback "rehearse then reveal").
5. "Reveal model answer" 탭 → gold answer 확장, trade-off·limit bold, 옆에 phrase bank.
6. self-rate 1–3(rough/okay/clean). v1은 비저장(또는 단순 localStorage flag — 후순위).
7. (선택) Design-doc 탭으로 전환해 같은 결정을 *타이핑*으로 작성, 해당 register의 model answer와 비교.

세션 = 패턴당 3–6분. later flow는 6과 5 사이에 "Get feedback (beta)" 한 단계 삽입.

**tie-in:** simulator가 공유 mental model을 공급하므로 설명이 *무엇에 관한 것*인지 갖는다. "trade-off를 설명하라"를 진공에서 연습할 수 없다 — 방금 조작한 그것에 관해 연습한다.

---

## 7. Tech Stack

| 영역 | 선택 | 근거 |
|---|---|---|
| Framework | **Next.js 15 App Router + TypeScript + Tailwind**, 정적 prerender, Vercel | blog와 동일 major → 새 framework 학습 0. 판단 예산을 sim+산문에 몰빵. |
| Viz layer | **SVG-first**, pure deterministic reducer ↔ thin React/SVG renderer 엄격 분리 | declarative·accessible·retina·Tailwind 테마. 요소 수십 개라 SVG로 충분. |
| 결정성 | **mulberry32 seeded PRNG (~10줄, no dep)** | reproducible·testable·web≡mobile. shareable-URL 무료. |
| Clock | **`useSimClock`** (rAF + fixed-timestep accumulator + pause/step/reset, StrictMode-safe) | engine은 clock을 안 만짐 → Vitest로 N틱 step 후 assert 가능. |
| Controls UI | **spec-driven `<ControlPanel>`** (control = 데이터) | 패턴 추가 시 control-UI 코드 0. web≡mobile, no-RCE를 by construction 확보. |
| i18n | **`t(locale,key)` COPY shape verbatim port**, `DEFAULT_LOCALE='en'` 유지 | shape는 portable. **default locale 반전은 port가 아님(§13).** 콘텐츠는 per-locale 저작(no MT), control label은 spec에 bilingual. hreflang ko/en/x-default + per-locale sitemap. 금칙어(혁신/패러다임/시너지 + EN guru) 적용. |
| AI plug points | **v1 ZERO** — `lib/ai/` 디렉터리 *없음*(stub조차 안 만듦) | empty boundary도 foothold. 콘텐츠 폴백이 v1 설계이지 degraded path가 아님. |
| Hosting | **Vercel free (Hobby)** — API route·DB·server fn 없음, 정적 + client JS | build ~60s. 커스텀 subdomain `sim.daeseon.ai`로 브랜드 연결. |

### blog에서 그대로 lift

1. **Mermaid client-island 패턴** (`components/Mermaid.tsx`) — `<Sim>` hydration island의 템플릿으로 *구조만* 차용(단, lifecycle은 완전히 다름 — §5/pre-mortem #2). Mermaid 자체는 정적 아키텍처 다이어그램에 그대로 재사용.
2. **MDX pipeline** — `next-mdx-remote` + `remark-gfm` + `rehype-pretty-code`(shiki) + `rehype-slug`, 그리고 `remark-mermaid.ts`의 fenced-block→JSX 치환 trick을 `<Sim/>` directive에 미러.
3. **Tailwind 테마 토큰 verbatim** — ink/paper/accent 팔레트, `font-sans`/`font-mono`, `@tailwindcss/typography` prose override. 새 사이트는 daeseon.ai의 visual sibling(design 재논의 0 — locked-design 규칙 준수).
4. **i18n shape** — `t()`/`localizedPath`/`otherLocale` (단 default는 EN 유지).
5. **docs/ dual-write 로그 규율** + `troubleshooting.md` 포맷.

**재사용 안 함:** `lib/source.ts` / `lib/storage.ts` / GitHub-Raw runtime fetch / Octokit publish / NextAuth admin — v1에 live-publish도 admin도 없음. (이 둘이 client import 그래프에 들어가면 안 된다는 hard constraint도 controls-only/static 선택으로 자동 회피.)

### REJECTED approaches (이유 포함)

- **React Native / Expo** — owner mobile-native 무경험. "mobile" 요구는 responsive mobile-web으로 충족. native는 audience 이득 0의 두 번째 플랫폼 유지비 → 순수 scope-creep, ship-fast guardrail 위반.
- **Flutter** — 새 언어(Dart) + framework, Next/TS stack 재사용 0, polished web app 대비 recruiter 신호 upside 없음.
- **react-native-web으로 컴포넌트 "공유"** — RN→web 단방향. 원하지도 않는 native 타깃을 쫓아 RN primitive로 저작 강제. 없는 문제를 푼다.
- **Sandpack / Monaco / WebContainers (v1)** — React-DOM browser artifact라 native로 안 됨, RCE/freeze class와 무거운 번들(mobile 악화) 재도입. mobile=controls는 이미 결정. → **desktop-only, kill-gated v2 enhancement(CodeMirror, not Monaco)** 로 defer.
- **server-side simulation 실행 / 모든 backend sim engine** — sim은 client에서 완벽히 도는 pure reducer. server는 비용·attack surface·latency만 추가, web≡mobile·no-RCE·Vercel-free 속성 파괴.
- **account / auth / persistence (v1)** — 첫 사용자는 owner + recruiter. saved-progress/profile은 DB+auth+privacy surface를 v1 가치 0으로 추가. param state는 URL에(shareable·reproducible).
- **Canvas/WebGL 기본 renderer** — CB-class(수십 요소)엔 부당. a11y·retina·테마·디버깅 손해. per-pattern escape hatch로만 documented.
- **Framer Motion / d3-selection을 timing/state driver로** — 둘 다 time/DOM 소유하려 들어 결정성·web≡mobile·testability 깨뜨림. Framer는 discrete state-badge transition sugar로만 허용 가능, d3는 pure math 모듈(scale/shape)만.
- **blog repo에 embed** — owner가 이미 거부. 별도 repo가 blog의 publish/admin/ISR 아키텍처를 분리하고 빌드를 clean standalone artifact로 만든다.
- **multi-pattern v1 launch** — 주된 over-scope 실패 모드. kill-gate = 하나의 polished 패턴(CB) 라이브 후에야 두 번째 시작. rate-limiter/consistent-hashing은 incumbent 존재로 차별성도 낮다.

---

## 8. v1 Scope — 정확히 무엇이 ship 되는가

**ship 되는 것 (전부 + 그 이상 없음):**

1. **완성된 simulator 하나 — Circuit Breaker**(CLOSED/OPEN/HALF_OPEN). live controls: request rate, downstream failure-rate 주입, error threshold(count), open-timeout(ms), half-open trial count — **상한 5개**. visual: 크게 라벨된 3 state 노드가 *눈에 띄게 점등*, success/fail/rejected 색의 request balls, in-flight, 그리고 rolling latency/success readout(instrumentation 패널).
2. **web ≡ mobile-web 동일 동작** — controls-only, viz auto-update, code editor 없음, sandbox 없음.
3. **2–3개 named preset (Arch-C graft):** `healthy` / `flapping dependency` / `hard outage` — recruiter가 아무것도 안 만지고 3클릭으로 3개의 *명백히 다른* 동작을 본다.
4. **PredictGate (Arch-B graft)** — reveal 전 예측 commit 강제.
5. **bilingual lesson 페이지, 4-tone voice** (날것/마케팅/전문가/큰그림) + **required "이 모델이 담지 못하는 것" honesty block**(구조화된 `notModeled` 필드로 렌더 — DoD blocker).
6. **deterministic seeded engine + 작은 unit-test** (`동일 seed+params ⇒ 동일 trace`) — repo 안 visible senior 신호.
7. **comms pillar, static only:** ExplainCard(prompt + collapsed gold answer + 5-chunk phrase bank + Loom 클립 하나). recorder/scoring/STT 없음.
8. **shareable-URL state (Arch-C graft, ~20 LOC):** `?seed=&params...` — screenshot-stable, recruiter가 owner가 보여주려는 정확한 failure scenario에 landing.
9. **lesson index home + about 페이지**(daeseon.ai 역링크), SEO 기본(hreflang, per-lesson OG image, sitemap).
10. **`sim.daeseon.ai`로 Vercel 배포.**

### CUT LIST (명시적 — 되돌리려면 visible·deliberate decision + `kind:decision` 로그)

- **두 번째 simulator** — GATE-3가 첫 번째의 genuine done을 확인한 *후에만*. (rate-limiter/consistent-hashing은 incumbent 있음 — CB가 sparse win.)
- **Sandpack / Monaco / 모든 code-editing** — desktop-only later enhancement로 defer.
- **모든 code-execution sandbox / Worker / `new Function`** — controls-only로 불필요, no-RCE posture 무료 유지.
- **account / auth / login / persistence backend.**
- **STT / pronunciation scoring / recording UI** — static model answer + Loom 링크로 대체.
- **`lib/ai/` 디렉터리(stub조차)** — empty boundary도 foothold.
- **localStorage attempt-tracking** — v1 불필요.
- **shareable replay / scrubbing / scenario 라이브러리(3 preset 초과) / graph·backlink view.**
- **커스텀 design system** — blog Tailwind 토큰 verbatim. Framer Motion(SVG+CSS transition으로 충분), CMS/admin(git의 MDX가 CMS).
- **새 npm dep** — 목표: SVG + plain rAF interpolation + ~10줄 mulberry32, 그 외 `package.json`에 *아무것도* 안 더함. (d3-scale/d3-shape, Framer "그냥 badge용", CodeMirror 각각 "작은 yes"가 boring-stack 규율을 침식한다.)

---

## 9. Staged Roadmap — measurable KILL-GATES

> **TIME GATE (모든 feature gate를 override):** Stage 0에서 **hard calendar ship date** 설정(권장 3–4주). 그 날짜가 오면 마지막으로 cleanly 통과한 gate 너머의 것이 **AS-IS로 ship**되고 in-flight는 전부 CUT. 작은 polished를 정시에 > 큰 것을 늦게. 날짜는 안 움직인다; scope가 날짜에 맞춰 flex down.

| Stage | 내용 | KILL-GATE (사이) |
|---|---|---|
| **Stage 0** | repo + **clock hook de-risk** (throwaway): 슬라이더 1개 → 움직이는 SVG circle 1개, seeded deterministic reducer, 실제 Vercel URL 배포, **owner 실제 폰**에서 열기. CB 로직 0. 결정성 unit test도 여기서 작성. | **GATE 0→1 (전체 아이디어 kill 지점):** placeholder가 public Vercel URL에 LIVE **AND** one-slider SVG가 폰·데스크탑에서 동일 반응 **AND** loop가 깨끗이 pause/resume. 깨졌거나 timebox 내 미배포 → **STOP, 전제 미검증.** 콘텐츠 작업 금지. |
| **Stage 1** | CB visualizer: CLOSED/OPEN/HALF_OPEN reducer + SVG renderer + 3–5 control + 3 preset + instrumentation. UI 문자열 EN-only. recruiter가 클릭하는 바로 그것. | **GATE 1→2:** 3 preset이 *눈에 띄게 다른* 동작 산출 **AND** 폰-web 동작 **AND** lesson 페이지 Lighthouse mobile ≥ 90. perf<90이거나 preset 미차별 → 산문 한 줄 쓰기 전에 fix/simplify(control 하나 drop). |
| **Stage 2** | CB write-up(Format-A 4섹션 + honesty block) + 3-part comms drill + Loom 클립, **EN**. visualizer 페이지에 wire. PredictGate/ExplainCard 가동. **이 시점 v1-EN이 shippable.** | **GATE 2→3 (SHIP 결정 gate):** EN lesson이 full Definition-of-Done 통과. **DECISION:** EN-only가 이미 충분히 강한 artifact면 — calendar 위험 시 **EN-only ship, KO를 fast-follow로 강등.** *KO가 v1 날짜를 놓치는 이유가 되어선 안 된다.* |
| **Stage 3** | CB의 **Korean layer**: UI 문자열 + KO Format-A + KO drill gloss. verified-empty niche 점유. **v1 PROPER = bilingual CB lesson, fully polished — DEFENDED SHIP LINE.** | **GATE 3→4 (가장 중요한 anti-scope-creep gate):** "이걸 딱 ship하고 더 안 만들어도, 내 이력서 *맨 위*에 둘 piece인가?" YES 아니면 — 허용되는 유일한 행동은 두 번째 시작이 아니라 **첫 번째 polish.** 두 번째 topic은 첫 번째가 genuinely done일 때만. |
| **Stage 4 (post-v1)** | **Retry + Exponential Backoff** lesson, Stage-0/1 engine 재사용. Stage 3 통과 후 시작. 템플릿 repeatability 증명. **이 패턴이 generic seam 추출을 강제 — 여기서 abstraction을 추출한다(미리 X).** | **GATE 4→5:** Retry가 bilingual ship **AND** shared engine을 demonstrably 재사용(두 번째가 첫 번째보다 materially 적은 노력). engine 재설계가 필요했다면 → STOP, 세 번째 전에 abstraction refactor. (leaky template = 모든 미래 lesson이 full price = repeatability 신호 사망.) |
| **Stage 5 (optional)** | Token-Bucket Rate Limiter, **또는** 기존 lesson에 desktop-only Sandpack code-edit. 최저 우선순위. energy + job-hunt 이유가 남을 때만. | — |

---

## 10. Success Measures (job-hunt-framed, NOT revenue)

1. **applications에 linkable:** bilingual CB lesson이 v1 ship date 내에 clean public URL 보유, 지원서·LinkedIn·이력서에 붙임. (binary: 정시 shipped / not.)
2. **<60초 recruiter-legible:** 비전문가가 폰에서 산문 안 읽고 preset 클릭만으로 3개의 다른 동작을 *본다* — 실제 2–3명(recruiter/peer)이 지시 없이 확인.
3. **interview-readiness (self + external):** owner가 Part-3 whiteboard 답을 영어로 ~90초에 말하고 curveball follow-up을 받아침 — 실제/mock interview에서 CB 주제가 나왔을 때 검증되면 ideal.
4. **depth-of-learning artifact:** honesty block에 owner가 실제 ops 경험으로만 알 수 있는 specifics ≥3개(slow-call threshold, bulkhead, half-open concurrency) — 빌드가 이해를 deepen했다는 증거.
5. **ESL-English 진척, measurable:** phrase bank가 shipped lesson당 ≥5개 reusable senior-register chunk + KO nuance 노트 — owner가 실제 리허설하는 개인 corpus 성장.
6. **repeatability 증명:** Stage 4까지 두 번째 lesson이 첫 번째보다 materially 적은 시간에 ship — clean reusable engine(good abstraction, anti-over-engineering)을 repo history로 보임.
7. **niche 점유:** lesson이 Korean-first interactive system-design 콘텐츠로 discoverable — 최소 indexed + hreflang-correct.
8. **NON-METRIC 명시적 제외:** pageviews / signups / revenue / DAU는 v1 성공 지표 *아님*. 첫 사용자는 owner + recruiter; v1에서 트래픽 최적화는 scope-creep trap.

---

## 11. Pre-mortem (failure scenarios + mitigations) + scope-creep guardrails

세 architecture 설계가 모두 "가장 큰 risk"로 같은 것을 지목했다 = 그건 가설이 아니라 *살아있는 유혹*이다.

**Scenario 1 — ENGINE-AS-FRAMEWORK FIRST (premature abstraction).** owner가 repo를 senior하게 보이려고 generic 3-layer seam(`Pattern<P,S>`, `RenderModel` vocabulary, schema-driven panel, registry)을 *구체 CB가 seam을 강제하기 전에* 만든다. 6개월 뒤 elegant empty framework + half-wired 패턴 하나 — 정확히 "판단력 부재" 신호.
→ **Mitigation:** file layout으로 강제(willpower 아님). CB를 one-off로 — `circuitBreaker.ts`가 init/step + 전용 SVG renderer를 하드코딩, generic 없음, registry 없음(단일 import OK). abstraction은 Retry가 강제할 때 추출. **Tripwire:** Stage-0/1 끝에 generic `Pattern` interface 존재 + CB 미배포 → STOP, 전부 inline. `/about-the-build`는 *추출 후*에 작성(실제로 earned된 seam을 서술).

**Scenario 2 — rAF lifecycle ≠ Mermaid 패턴 (core engine 노력 과소평가).** "engine은 쉽다, Mermaid island가 `<Sim>` 템플릿"이라는 가정이 false. `Mermaid.tsx`는 정적 문자열 1회 렌더. simulator는 fixed-timestep rAF loop, pause/step/reset, mid-run param 변경(clock reset 없이), StrictMode-safe cleanup이 필요 — blog에 *없다*. week 1에 clock hook이 timebox를 먹고 GATE-1이 slip.
→ **Mitigation:** clock hook을 단일 최대 unknown으로 취급, Stage 0 throwaway로 de-risk(GATE 0을 literal 첫 commit으로). "slider→SVG 동일 반응 + 깨끗한 pause/resume"이 green 되기 전엔 CB 로직 0. clock hook을 hours 아닌 days로 budget. 결정성 unit test도 Stage 0에.

**Scenario 3 — Model-answer / KO 저작 stall (parallelize 불가능한 human bottleneck).** simulator는 ship됐는데 100% owner 손인 부분(4-tone 산문, honesty block, EN whiteboard 답 + phrase bank + KO nuance)이 멈춘다. Format-A가 AI 저작 금지(guru tone), owner는 ESL이라 영어 gold를 fully self-verify 못 함. 6개월 뒤 polished widget + 얇거나 guru-leaking 산문 → (b)(c)(d) 전부 파괴.
→ **Mitigation:** "shippable"을 정확히 정의 = interview prompt 1 + gold answer 1 + honesty block + phrase chunk 5. 나머지 register(design-doc/PR/standup)는 additive, lag 허용. 콘텐츠는 visualizer가 Lighthouse 통과 *후* 별도 gate(GATE 1→2). honesty block 없는 lesson은 ship 안 함(DoD blocker). ESL phrasing 갭: v1 phrase bank는 high-confidence canonical collocation만, 불확실한 건 defer. gold answer를 blog의 **anti-guru fingerprint pass**(mTLS/network-runbook leak를 잡은 그것)에 통과시킨 뒤 publish. **Loom 클립은 가장 cheap·legible "communicates in English" 증거 — defer 금지(녹화 한 번, feature 아님).**

**Scenario 4 — 시각적으로 illegible한 simulator (기술적으론 맞는데 recruiter-opaque).** state machine은 맞고 unit-tested인데 SVG가 60초 안에 못 읽는 tangle — control 너무 많음, 점등 안 보임, ball이 success/fail/rejected로 안 읽힘, preset이 visibly 안 다름. 성공지표 #2 실패 = portfolio엔 simulator 없는 것과 동등.
→ **Mitigation:** CB를 고른 이유가 3-state FSM이 inherently visual이라서다 — chart-first 말고 *크게 라벨된 3 노드 점등* layout. control 3–5 hard cap, visible state를 바꾸는 param 쪽으로 cut. 3 preset이 3클릭·0독서로 *명백히* 구분 → GATE 1→2 blocker. 실제 2–3명이 폰에서 지시 없이 확인. SVG over Canvas로 inspectable·themeable.

**Scenario 5 — INDEFINITE POLISH / 날짜 없음 (perfectionism stall — calm-brand solo builder의 silent killer).** scope-creep의 반대. 외부 deadline 없음(대기 user 없음, monetization 아님)이라 owner의 "do it right" 본능이 SVG·결정성·voice를 무한 refine, never done. job hunt는 ACTIVE NOW — 6개월에 ship되는 piece는 강화하려던 지원들을 이미 놓침.
→ **Mitigation:** **코드 한 줄 전에 calendar ship date를 FIRST로 설정**, Stage-0 TIME GATE에 기입. EN-only ship 허용(GATE 2→3). concrete external commitment에 묶기 — 그 날 특정 job application에 URL 붙이거나 daeseon.ai 블로그에서 게시("ship each change live" 습관). 성공 = binary "정시 shipped/not" → "더 polish"가 "더 성공"으로 위장 못 함.

### 추가 scope-creep guardrails

- **이 owner의 documented anti-scope-creep 본능 자체가 함정의 트로이목마다.** "generic seam을 만든다"가 good-abstraction senior craft(그가 prize하는 것)로 *읽혀* 자기 판단 reflex가 premature-abstraction을 green-light한다. senior 신호는 코드가 *earned*한 abstraction을 추출하는 것이지 미리 설계하는 게 아니다.
- **feature doc이 cut된 것(MediaRecorder, 4축 AI rubric, Whisper, filler/pace)에 위험하게 detailed하다.** fully-specified cut feature는 foothold — 각 조각이 harmless해 보인다. v1에 `lib/ai/`를 stub으로도 만들지 마라.
- **"bilingual KO-first"는 차별점이자 scope multiplier** — 모든 산문·phrase bank·UI 문자열을 2배로 만든다. deadline에 가장 incomplete할 후보. EN-only가 valid ship이고 KO는 fast-follow임을 미리 결정.
- **세 개의 full architecture 제안이 ONE lesson을 위해 존재한다.** "세 개의 best를 synthesize"는 meta-scope-creep. leanest concrete path(하드코딩 CB + clock hook + SVG + static comms, EN-first)를 고르고 나머지 둘을 deferred backlog로 처리.
- **결정성이 enable하는 인접 "free-looking" feature(replay, scenario 라이브러리, scrubbing, graph view)를 defer.** 3 preset만 ship.

---

## 12. Reversibility / Reversal Plan

reversibility framing: Bezos two-way / one-way door.

| 결정 | reversibility | reversal plan |
|---|---|---|
| 별도 repo + subdomain | **two-way** | repo 삭제 또는 blog에 흡수 가능. 비용 ~0. |
| 이름(`simlab`) | **two-way** | subdomain + repo 이름만 변경. route는 안 묶임. |
| controls-only (no code-exec) | **two-way (확장 방향)** | desktop-only Sandpack은 *additive* — control spec이 미래 code-edit가 tweak할 동일 surface라 rewrite 아닌 add. |
| SVG renderer | **two-way (per-pattern)** | high-particle 미래 패턴 한 개만 동일 engine interface 뒤에서 Canvas로 swap. draw fn만 다름. |
| CB one-off (no generic engine) | **two-way** | Retry가 강제하면 seam 추출. 미리 안 만든 게 오히려 reversal 비용을 낮춤. |
| no account / no DB / static | **two-way** | account는 v2 결정. URL state가 지금 공유를 커버. |
| no AI (v1) | **two-way** | AI는 단일 `lib/ai/` boundary 뒤 feature flag로 add — 콘텐츠 폴백이 이미 동작. |
| **DEFAULT_LOCALE='en' 유지** | **hard** (route·hreflang·canonical 전부 영향) → §13에서 deliberate decision으로 처리 |

전체적으로 v1은 거의 모든 문이 two-way다 — 이게 ship-fast guardrail과 부합한다. 유일한 hard door는 canonical locale(아래).

---

## 13. Open Decisions — owner 확인 필요

각 항목은 trade-off / reversibility / 빠진 정보를 포함한다(bare option 금지).

**(1) 이름.** `simlab` / `patterns` / `failmode` 중. — *왜 결정 필요:* subdomain + repo 이름이 묶임. *trade-off:* simlab=generic하나 안전, failmode=기억에 남으나 부정 어감·KO 덜 직관. *reversibility:* easy. *빠진 정보:* owner의 브랜드 직감.

**(2) v1에 account가 하나라도?** — **추천: 없음.** *왜:* 첫 사용자는 owner + recruiter. account는 DB+auth+privacy를 v1 가치 0으로 추가. *고려한 대안:* "self-rate 저장"용 localStorage flag만 — 이것도 v1엔 cut 추천(empty stub도 foothold). *reversibility:* easy(v2 add). *빠진 정보:* owner가 cross-device progress를 실제로 원하는가(현재 신호 없음).

**(3) canonical default locale (가장 load-bearing — `kind:decision` Tier-2로 로그할 것).** — *검증됨:* `lib/i18n.ts`는 `DEFAULT_LOCALE='en'` + `localizedPath`가 EN을 unprefixed로 둔다. KO-root로 반전하면 모든 route group·`generateStaticParams`·hreflang/x-default·internal link helper·canonical이 뒤집힌다(blog에 이걸 하는 middleware 없음). **추천: unprefixed root = ENGLISH 유지, KO를 prominent toggle + correct hreflang로.** *왜:* recruiter(영어 시장)가 1차 v1 audience이고 job-hunt 목적이 지배 — recruiter를 Korean root에 default시키는 건 1차 목적에 역행. "Korean-first" market 포지셔닝은 KO 콘텐츠가 *존재하고 indexed + hreflang-correct*면 충족(성공지표 #7이 요구하는 전부)이지 URL root가 KO일 필요는 없음. *trade-off:* "KO-first"의 문자적 의미가 콘텐츠 점유로 완화됨(URL root 아님). *reversibility:* **hard**(route 전체 영향) — 그래서 지금 deliberate하게 결정. *대안:* KO-root을 정말 원하면 Stage-3 별도 gated task로(EN reachable / x-default set / recruiter-lands-on-EN 검증), Stage-0 "port"로는 절대 안 함. *port 가능한 것:* `t()`/COPY shape는 verbatim; routing은 fresh로 작성.

**(4) AI-feedback 타이밍.** — **추천: v1 ZERO, gated v2.** *왜:* AI-mock-feedback 레인은 research상 포화 중; v1 진입은 방어 가능 niche를 saturated로 교환. *gate 조건:* v1 fully live **AND** owner가 ≥10 personal practice session **AND** `claude-api` skill로 현재 model-id/pricing 확인(memory 하드코딩 금지). *순서:* written-first(저렴) → spoken(이후). *reversibility:* easy(flag 뒤 add). *빠진 정보:* dogfooding 후 owner가 feedback을 실제로 원하는지의 usage 신호.

**(5) ship date(이 5개 중 가장 시급 — 코드 전에).** — 추천 3–4주(GATE-1 ~week1, GATE-2 ~week2, GATE-3 ~week3–4). 날짜는 안 움직이고 scope가 flex down. *빠진 정보:* owner의 현재 지원 캘린더 — 가장 임박한 application이 자연스러운 deadline.

---

## 14. Status

**Proposed** · supersedes `docs/interactive-playground-architecture.md` (the earlier Antigravity doc) · **Author:** Claude (workflow-synthesized) · **Tier:** 1 · **Reversibility:** 대부분 two-way; canonical locale만 hard(§13에서 결정) · **Date:** 2026-06-07

**Verified-by:** `lib/i18n.ts` 직접 확인 — `DEFAULT_LOCALE='en'`, `localizedPath`가 EN unprefixed (pre-mortem의 i18n 주장 정확). `components/Mermaid.tsx` + `lib/remark-mermaid.ts` 존재 확인 (client-island 재사용 주장 valid, lifecycle 차이는 §5/pre-mortem #2에 명시).

**Next action:** §13의 5개 open decision 확정 → Stage 0(clock hook de-risk + GATE 0)을 literal 첫 commit으로. 두 번째 architecture 두 개는 deferred-ideas backlog. 이 결정을 `content/logs/simlab/<date>-architecture.mdx` (`kind: decision`, status: proposed, reversibility 위 표대로) + `docs/troubleshooting.md`에 dual-write로 기록할 것.
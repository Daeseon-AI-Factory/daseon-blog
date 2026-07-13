# Claude 종합 저장소 리뷰

## 리뷰 메타데이터

| 항목 | 값 |
|---|---|
| 리뷰 일시 | 2026-05-30 23:23 (현지 시각, America/Toronto, UTC-04:00) |
| Git 브랜치 | `main` |
| HEAD 커밋 | `2a9725b96fc6040207ecc56b8e24008cedeb72c8` — "Record skip markers for recent session commits [no-log]" |
| 워킹 트리 상태 | `M docs/troubleshooting.md` (이 리뷰 시작 전부터 존재하던 변경. 이 작업이 수정한 것이 **아님**) |
| 출력 디렉터리 | `claude_review/full/2026-05-30-2323/` |
| 리뷰 유형 | 임시 전체 저장소 리뷰 (예약된 주간/월간 실행 아님) |
| 방법 | 8개 영역 읽기 전용 감사 → 모든 발견사항을 독립적·적대적으로 재검증 → 완전성 비평가. 서브에이전트 43개, 전부 읽기 전용(편집/쓰기 권한 없음). |
| `codex_review/` | 존재하지 않음. 읽거나 검사하거나 사용하지 않음. |

**독립성 선언:** 본 리뷰는 저장소 자체의 소스 코드, 설정, 문서, 테스트, 빌드/린트/타입체크 출력, git 메타데이터만을 증거로 사용했습니다. 다른 모델의 리뷰는 읽거나 의존하지 않았습니다. `codex_review/`는 참조하지 않았습니다.

---

## 리뷰 범위

**검사한 것:** 전체 Next.js 애플리케이션 — `app/`(공개 + 어드민 라우트, API 라우트 핸들러), `lib/`(인증, 저장, 소스, github, 콘텐츠 로더, i18n, 피드, remark 플러그인), `components/`(공개 + 어드민), `content/`(posts, projects, knowledge, logs, notes, now, site.json), `middleware.ts`, 빌드/린트/타입 설정(`next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `postcss.config.mjs`, `package.json`), `.env.example`, `.gitignore`, `docs/`. 결정적(deterministic) 명령을 실행함: `tsc --noEmit`, `next lint`, `next build`.

**검사하지 않음 / 미검증:** Vercel 상의 런타임 동작(실 배포를 구동하지 않음); `.env.local`의 실제 비밀값(파일은 git 무시 대상이며 열지 않음); 외부 크로스포스트 웹훅 수신처와 RAG 소비자(별도 프로젝트, 본 저장소 외부); 서드파티 라이브러리 내부; `node_modules`. 저장소에 **자동화된 테스트 스위트가 없으므로** 테스트 실행은 불가능했습니다(테스팅 리뷰 참고).

---

## 총평 (Executive Summary)

**판정: 부분적으로 프로덕션 준비됨(partially production-ready).** 애플리케이션은 깨끗하게 빌드되고(`next build` 종료 코드 0), `tsc --noEmit`를 오류 없이 통과하며, `next lint`를 경고 없이 통과합니다. 아키텍처는 견고하고 두 가지 하드 제약을 준수합니다(프로덕션에서 도달 가능한 `fs.writeFile` 없음, `"use client"` 컴포넌트가 `lib/source.ts`/`lib/storage.ts`를 임포트하지 않음). 인증, 콘텐츠 로딩, i18n, 어드민 폼 상태 처리는 대체로 잘 구현되어 있습니다.

**엄격한 심각도 기준에서 Critical(프로덕션 차단/미인증 RCE/데이터 손실/빌드 깨짐) 이슈는 없습니다.** 실제 보안 발견 2건(`log-companion` 경로 탐색, RAG 매니페스트를 통한 초안/비공개 콘텐츠 노출)은 모두 단일 소유자 애플리케이션에서 어드민 인증 또는 비밀 베어러 토큰 뒤에 위치하므로 Critical이 아닌 **High**로 평가했습니다. 그래도 수정은 작고 실패 양상은 실제이므로 고쳐야 합니다.

사이트를 공개적으로 공유하기 전 가장 시급한 항목은 **코드가 아니라 콘텐츠**입니다: 플레이스홀더 게시물 `asdasd`(본문: "asd")가 발행되어 `/posts/asdasd`에 라이브 상태입니다(빌드 라우트 표에서 확인). 포트폴리오/구직 사이트에서 이것이 최우선 수정 대상입니다.

나머지 High 항목들은 작고, 범위가 명확하며, 대부분 방어적입니다: 로그인 `from` 파라미터의 오픈 리다이렉트, 설정 오류 시 로그인 500, 한 라우트의 `try/catch` 누락, 한국어 페이지의 하드코딩된 `lang="en"`, 약하거나 없는 환경변수 검증. 어느 것도 빌드를 막지 않으며, 전부 합쳐 하루가 채 안 되는 작업으로 고칠 수 있습니다.

**집계:** Critical 0 · High 9 · Medium 6 · Low 14 (중복 제거 후 고유 확정 결함 29건). 후보 발견 1건은 검증에서 기각됨. 완전성 비평가는 추가 구체 이슈를 찾지 못함.

---

## 프로젝트 개요

영어 기본 / 한국어 보조의 이중언어 개인 블로그 + 포트폴리오이며, 비공개 인증 게이트 어드민 대시보드를 갖추고 **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind**로 구축되어 Vercel에 배포됩니다. 특징적 설계:

- **GitHub 기반 콘텐츠 저장소.** 콘텐츠는 저장소 안에 MDX로 존재. 쓰기는 Octokit을 통한 GitHub Contents API(`lib/storage.ts` → `lib/github.ts`), 읽기는 ISR 캐싱과 함께 `raw.githubusercontent.com`로의 `fetch`(`lib/source.ts`)로 이루어져 콘텐츠 수명주기와 빌드를 분리합니다(`docs/architecture.md`). Vercel 프로덕션 파일시스템이 읽기 전용이므로 필요한 설계입니다.
- **콘텐츠 타입:** `post`, `note`, `knowledge`(`/wiki`로 렌더), 그리고 `project`와 저장소 간(cross-repo) `log` 엔트리.
- **인증:** 환경변수 기반 어드민 비밀번호 + `jose` HS256 JWT 세션 쿠키(`lib/auth.ts`), `middleware.ts`가 `/admin/*`과 `/api/admin/*`에서 강제.
- **연동:** 선택적 크로스포스트 웹훅(HMAC-SHA256 서명)과, RAG/크로스포스트 봇에 공급하기 위한 선택적 토큰 게이트 `/api/rag/manifest` 엔드포인트.

주요 구성요소: 공개 페이지(`app/(public)`), 어드민 페이지(`app/(admin)`), API 핸들러(`app/api`), 콘텐츠 라이브러리(`lib/`), 프레젠테이션 컴포넌트(`components/`).

---

## 핵심 발견 요약

| ID | 심각도 | 분류 | 제목 | 신뢰도 |
|---|---|---|---|---|
| H1 | High | 보안 / 오픈 리다이렉트 | 미검증 `from` 파라미터를 `router.push`로 그대로 전달 → 오픈 리다이렉트 | High |
| H2 | High | 가용성 / 오류 처리 | `ADMIN_SESSION_SECRET` 누락/짧음 시 로그인 크래시(500) | High |
| H3 | High | 보안 / 경로 탐색 | `log-companion`이 미검증 `project`/`slug`로 파일을 씀 | High |
| H4 | High | 보안 / 데이터 노출 | RAG 매니페스트가 초안+비공개 콘텐츠 본문 전체를 토큰 보유자에게 반환 | High |
| H5 | High | 오류 처리 | `log-companion` POST/DELETE에 `try/catch` 없음(미처리 500) | High |
| H6 | High | 접근성 / SEO | 루트 레이아웃이 모든 `/ko/*` 페이지에 `lang="en"` 하드코딩 | High |
| H7 | High | 운영 / 환경변수 검증 | `GITHUB_TOKEN`/`GITHUB_REPO` 런타임 검증 없음; 조용한 로컬 FS 폴백이 Vercel에서 실패 | High |
| H8 | High | 운영 / 환경변수 검증 | `ADMIN_SESSION_SECRET`를 16자로 강제, 문서는 32+ | High |
| H9 | High | 콘텐츠 품질 | 플레이스홀더 게시물 `asdasd`가 발행되어 `/posts/asdasd`에 라이브 | High |
| M1 | Medium | 미완성 기능 | `note` 콘텐츠 타입에 공개 라우트가 없음(고아 상태) | High |
| M2 | Medium | 캐싱 / SEO | 게시물/프로젝트 변경 시 피드+사이트맵 재검증 안 됨 | High |
| M3 | Medium | 부분 실패 | 크로스포스트 웹훅 실패에도 `ok: true` 반환 | High |
| M4 | Medium | 정확성 / 멱등성 | 파일이 이미 없을 때 `deleteFile`이 404/410 대신 500 반환 | High |
| M5 | Medium | 운영 / 환경변수 검증 | `ADMIN_PASSWORD` 누락 시 로그인 조용히 실패 | High |
| M6 | Medium | 운영 / 설정 | `NEXT_PUBLIC_SITE_URL`이 하드코딩 `https://daeseon.ai`로 폴백 | High |
| L1 | Low | 보안 위생 | 로그아웃 쿠키에 `sameSite` 누락(감사자는 Medium, 주석 참고) | High |
| L2 | Low | 보안 | 세션 회전/폐기 없음; 30일 TTL | High |
| L3 | Low | 보안 / CSRF | `sameSite=lax` + CSRF 토큰 없음(심층 방어) | Medium |
| L4 | Low | 보안 / 타이밍 | 상수시간 비교 전에 길이 검사 선행(비밀번호 + RAG 토큰) | High |
| L5 | Low | 보안 / SSRF | 크로스포스트 웹훅 URL 미검증(환경변수 제어) | High |
| L6 | Low | 경쟁 상태 | Get-SHA-후-PUT 경쟁 → 동시 쓰기 시 500(데이터 손실 없음) | High |
| L7 | Low | API 일관성 | 중복 슬러그에 409 vs 400 상태 불일치 | High |
| L8 | Low | 보안 헤더 | CSP / 보안 응답 헤더 없음 | High |
| L9 | Low | 성능 | 2곳에서 원시 `<img>` 사용(`next/image` 미사용) | High |
| L10 | Low | 운영 / 확장성 | `feed.xml` 라우트에 `maxDuration` 없음(대규모 시 타임아웃 위험) | High |
| L11 | Low | 의존성 | 캐럿 범위; 메이저 버전 뒤처짐(락파일이 완화) | High |
| L12 | Low | 문서 | `README.md`가 약 26바이트 | High |
| L13 | Low | 정리 | 쓰레기 비공개 노트 `content/notes/en/asdasd.mdx` | High |
| L14 | Low | 타입 안전성 | `locale`에 불필요한 `as` 캐스트(이미 가드됨; 정보성) | Medium |

> **원시 감사 대비 심각도 조정/차이를 투명하게 명시:**
> - **H9 (`asdasd` 게시물):** 한 영역 감사자는 이를 **Critical**로 평가. 본 리뷰는 **High**로 평가합니다. 엄격한 기준상 Critical은 프로덕션 차단/보안/데이터 손실/빌드 깨짐에 한정되며, 쓰레기 게시물은 앱을 사용 불가로 만들지 않습니다. 그럼에도 사이트 공유 전 *최우선* 수정 대상입니다(구직/포트폴리오 맥락).
> - **H3, H4 (경로 탐색, RAG 노출):** 실제 보안 이슈이나, 단일 소유자 앱에서 둘 다 인증된 어드민 또는 비밀 토큰을 요구하므로 Critical이 아닌 High로 평가.
> - **L1 (로그아웃 `sameSite`):** 검증자는 Medium 유지. 본 리뷰는 **Low**로 하향합니다. 브라우저는 `sameSite` 생략 시 기본값을 `Lax`로 적용하여 로그인 쿠키 의도와 일치하므로, 실제 영향은 기능 결함이 아닌 일관성/유지보수 위험입니다.

---

## Critical 이슈

**없음.** 검사된 증거상 프로덕션 차단, 미인증 원격 코드 실행, 데이터 손실, 인증 깨짐, 빌드 깨짐은 발견되지 않았습니다. `next build`, `tsc --noEmit`, `next lint` 모두 통과합니다.

---

## High 우선순위 이슈

### H1 — 미검증 `from` 파라미터를 통한 오픈 리다이렉트
- **심각도:** High · **신뢰도:** High · **분류:** 보안 / 오픈 리다이렉트
- **증거:** `app/api/auth/login/route.ts:17`은 `body.from` 검증 없이 `{ ok: true, redirect: body.from ?? "/admin" }`을 반환; `components/admin/LoginForm.tsx:27`은 `router.push(data.redirect ?? "/admin")` 호출; `app/(admin)/admin/login/page.tsx:12,17`은 원시 `from` 쿼리 파라미터를 `<LoginForm from={from} />`로 전달.
- **무엇이 잘못됐나:** `from` 값이 로그인 URL 쿼리 → `LoginForm` → POST 본문 → 그대로 반환 → `router.push`로 검증 없이 흐름. 공격자는 `/admin/login?from=https://evil.com`을 만들 수 있음. `middleware.ts:22`는 `from`을 상대 경로로만 설정하지만, 직접 POST하거나 URL을 조작하면 그 단일 통제점을 우회 가능.
- **왜 중요한가:** 로그인 성공 후(피해자가 올바른 비밀번호를 입력해야 함) 브라우저가 공격자 통제 URL로 리다이렉트됨 — 피싱/자격증명 탈취 벡터. 단일 어드민 앱에서는 좁지만(대상이 소유자 본인), 수정은 매우 간단함.
- **권장 수정:** 동일 출처 상대 경로만 허용: `const safe = typeof body.from === "string" && body.from.startsWith("/") && !body.from.startsWith("//") ? body.from : "/admin";` 후 `safe` 반환.

### H2 — `ADMIN_SESSION_SECRET` 설정 오류 시 로그인 엔드포인트 크래시(500)
- **심각도:** High · **신뢰도:** High · **분류:** 가용성 / 오류 처리
- **증거:** `app/api/auth/login/route.ts:16` `const token = await createSessionToken();`에 `try/catch` 없음; `lib/auth.ts:9-12` `secret()`은 환경변수가 없거나 `< 16`자면 `Error("ADMIN_SESSION_SECRET must be set ...")`를 던지고, `createSessionToken()`(`lib/auth.ts:19-25`)이 `secret()`을 호출.
- **무엇이 잘못됐나:** 올바른 비밀번호 입력 후 토큰 생성에서 미처리 예외가 발생해 일반적인 500을 반환. `middleware.ts`는 검증 경로를 우아하게 처리(`verifySessionToken`이 catch)하지만, 로그인/생성 경로는 그렇지 않음.
- **왜 중요한가:** 설정이 잘못된 프로덕션 환경에서 어드민 로그인이 명확한 오류 대신 불투명한 500으로 실패 — 어드민 패널의 자초된 가용성/DoS.
- **권장 수정:** `createSessionToken()`을 `try/catch`로 감싸 상태 500과 함께 `{ ok: false, error: "Server misconfigured" }` 반환, 그리고/또는 시작 시 `ADMIN_SESSION_SECRET` 검증.

### H3 — `/api/admin/log-companion`의 미검증 `project`/`slug`를 통한 경로 탐색
- **심각도:** High · **신뢰도:** High · **분류:** 보안 / 경로 탐색 (이 라우트의 경로 탐색 + 검증 누락 발견을 통합)
- **증거:** `app/api/admin/log-companion/route.ts:24`는 `{ project, slug, body }`를 구조분해; 유일한 가드는 `if (!project || !slug || typeof body !== "string")`(24행, 존재 여부만). 이 값들이 `saveHumanCompanion()`로 흐르고, 이는 `lib/storage.ts:122` `` const rel = `content/logs/${project}/${slug}.human.mdx`; ``와 `lib/storage.ts:129` `path.join(process.cwd(), rel)`를 구성. `path.join`은 `..`을 해석함. posts/projects 라우트가 적용하는 `isValidSlug()`(`lib/slug.ts:14` 정규식 `/^[a-z0-9ㄱ-힝]+(?:-[a-z0-9ㄱ-힝]+)*$/`)를 이 라우트는 적용하지 않음.
- **무엇이 잘못됐나:** 인증된 어드민이 `project="../../something"`을 제공해 `content/logs/` 밖에 `.human.mdx` 파일을 쓰거나 커밋할 수 있음.
- **왜 중요한가:** 저장소 내 임의 경로 파일 쓰기(프로덕션에서는 임의 GitHub 커밋). 인증된 어드민 — 단일 소유자 앱에서는 소유자 — 로 제한되므로 외부 RCE가 아닌 내부자 오용/풋건이며 따라서 Critical이 아닌 High.
- **권장 수정:** POST와 DELETE 핸들러 모두에서 어떤 경로 구성보다 먼저 `project`와 `slug`를 `isValidSlug()`(또는 `/^[a-z0-9_-]+$/` 검사)로 검증하고 400으로 거부.

### H4 — RAG 매니페스트가 초안·비공개 콘텐츠 본문 전체를 토큰 보유자에게 노출
- **심각도:** High · **신뢰도:** High · **분류:** 보안 / 데이터 노출
- **증거:** `app/api/rag/manifest/route.ts:36` `const all = await getAllContentAcrossTypes();`(가시성/상태 필터 없음); 약 43행은 `isPublic`을 계산하나 이는 `url` 필드 결정에만 사용(약 60행 `url: isPublic ? ... : null`), 그러나 약 63행은 모든 항목에 대해 `content: p.content`를 **무조건** 반환하며 약 49-50행은 `visibility`/`status`도 노출.
- **무엇이 잘못됐나:** 유효한 `RAG_API_TOKEN`만 있으면 호출자는 초안 게시물, `private` 노트, 모든 knowledge 엔트리의 전체 텍스트를 받음 — 쓰레기 비공개 노트 `content/notes/en/asdasd.mdx` 포함. `isPublic` 게이트는 URL만 null로 만들 뿐 본문을 막지 않음.
- **왜 중요한가:** RAG 토큰 유출/탈취 또는 과도하게 넓은 RAG 소비자가 미발행 글을 노출. 엔드포인트의 목적(크로스포스트/RAG 봇에 *공개* 콘텐츠 공급)상 비공개 자료는 포함되어서는 안 됨.
- **권장 수정:** 직렬화 전에 공개/발행 항목만 필터링(예: `status === "draft"`, `visibility !== "public"` 제외), 또는 비공개 항목에는 메타데이터만 반환.

### H5 — `log-companion` POST/DELETE에 `try/catch` 없음(미처리 500)
- **심각도:** High · **신뢰도:** High · **분류:** 오류 처리
- **증거:** `app/api/admin/log-companion/route.ts`의 POST(약 30-37행)와 DELETE(약 50-56행)는 `try/catch` 없이 `saveHumanCompanion()`/`deleteHumanCompanion()` 호출. 이들은 `commitFile`/`deleteFile`(`lib/github.ts`)을 호출하며, Octokit/네트워크 오류 및 `Path is not a file`(`lib/github.ts:122`)에서 예외를 던짐. 다른 모든 어드민 라우트(예: `app/api/admin/posts/route.ts:97-128`)는 저장 호출을 `try/catch`로 감싸고 `{ ok: false, error }`를 반환.
- **무엇이 잘못됐나:** 이 라우트의 GitHub/네트워크 실패가 미처리 거부와 함께 구조 없는 500으로 표면화되어 나머지 API와 불일치.
- **왜 중요한가:** 어드민 UI에 구조화된 오류가 전달되지 않음; 시끄러운 서버 로그; 복구 어려움. H3과 짝을 이룸 — 이 라우트는 어드민 표면 중 검증과 처리가 가장 약함.
- **권장 수정:** 두 핸들러의 저장 호출을 posts/projects 패턴에 맞춰 `try/catch`로 감쌈.

### H6 — 한국어 페이지가 `lang="en"`으로 제공됨
- **심각도:** High · **신뢰도:** High · **분류:** 접근성 / SEO
- **증거:** `app/layout.tsx:35` `<html lang="en" suppressHydrationWarning>`. `app/(public)/ko/layout.tsx`가 없으며(App Router에서 `<html>`은 루트 레이아웃만 렌더 가능), `/ko/*` 페이지 컴포넌트는 자식에 `locale="ko"` prop만 전달할 뿐 `<html lang>` 속성을 바꿀 수 없음. 메타데이터 `alternates.languages`는 `hreflang` 링크 태그만 방출할 뿐 문서 `lang`은 아님.
- **무엇이 잘못됐나:** 모든 `/ko/*` 라우트가 자신의 언어를 영어로 선언함.
- **왜 중요한가:** 스크린리더 발음, 브라우저 번역 휴리스틱, 검색엔진이 모두 `lang`을 기준으로 동작; 한국어 콘텐츠가 영어로 잘못 표기되면 접근성과 i18n SEO가 저하됨 — 이중언어 사이트에 직접적으로 중요.
- **권장 수정:** 로케일별로 `lang` 설정. 옵션: 세그먼트별 `<html lang>`을 렌더하는 라우트 그룹 레이아웃, 또는 루트 레이아웃에서 경로/세그먼트로 `lang` 계산, 또는 Next.js i18n 라우팅 채택.

### H7 — `GITHUB_TOKEN`/`GITHUB_REPO` 런타임 검증 없음; 조용한 로컬 FS 폴백이 Vercel에서 실패
- **심각도:** High · **신뢰도:** High · **분류:** 운영 / 환경변수 검증
- **증거:** `lib/github.ts:9-16` `repoConfig()`는 `GITHUB_REPO`/토큰이 없으면 `null` 반환; `lib/source.ts:23-32`도 동일. 쓰기 오류는 호출 시점에만 던져짐(`lib/github.ts:45,113`). `lib/storage.ts:48` 주석: `"Vercel production is read-only — never reach here in prod"` — 코드로 강제된 보장이 아니라 운영상의 가정.
- **무엇이 잘못됐나:** GitHub 환경변수가 빠진 프로덕션 배포는 조용히 로컬 파일시스템 경로로 폴백하고, 이는 첫 쓰기에서 실패함(읽기 전용 FS / EROFS, `docs/troubleshooting.md` 참조) — 명확한 부팅 시점 설정 오류가 아닌 런타임 500으로 표면화.
- **왜 중요한가:** 설정 오류가 빠른 실패 신호 대신 혼란스러운 간헐적 500으로 나타남. H2/M5의 운영 측 대응물.
- **권장 수정:** 부팅/첫 요청 시 단언 추가: `NODE_ENV === "production"`일 때 `GITHUB_TOKEN`과 `GITHUB_REPO`를 요구(없으면 크게 실패)하고 읽기 전용 FS 부작용에 의존하지 않음.

### H8 — `ADMIN_SESSION_SECRET`를 16자로 강제하지만 문서/오류 메시지는 32+
- **심각도:** High · **신뢰도:** High · **분류:** 운영 / 환경변수 검증
- **증거:** `lib/auth.ts:9` `if (!raw || raw.length < 16)`인데 던지는 메시지는 `"32+ char random string"`, `.env.example:5`는 `replace-with-a-32+character-random-string`.
- **무엇이 잘못됐나:** HS256 서명 키가 16자(128비트)만큼 짧을 수 있는데 문서는 256비트급 엔트로피를 약속함. RFC 7518에 따르면 HMAC-SHA256 키는 ≥ 256비트여야 함.
- **왜 중요한가:** 문서보다 약한 JWT 비밀은 세션 토큰 위조에 대한 안전 마진을 줄임. 가능성은 낮으나(소유자가 비밀을 통제) 코드와 계약 간의 실제 모순.
- **권장 수정:** 검사를 `< 32`로 변경해 문서화된 최소값에 맞춤(또는 16이 의도라면 문서/메시지 갱신 — 단, 일치시키는 쪽이 더 안전).

### H9 — 플레이스홀더 게시물 `asdasd`가 발행되어 공개 라이브 상태
- **심각도:** High (한 감사자: Critical) · **신뢰도:** High · **분류:** 콘텐츠 품질
- **증거:** `content/posts/en/asdasd.mdx` 프론트매터: `title: asdasd`, `status: published`, `visibility: public`, 본문 `asd`. `lib/posts.ts:111-118` `isPublic()`이 true 반환(public + 비초안)하므로 `getPublishedPosts()`가 포함; `app/(public)/posts/[slug]/page.tsx:11-14`이 정적 파라미터 생성. **`next build`로 독립 확인:** 라우트 표에 `/posts/asdasd`가 사전 렌더(SSG) 페이지로 표시됨.
- **무엇이 잘못됐나:** 의미 없는 플레이스홀더 게시물이 라이브 상태이며 게시물 목록, 사이트맵, RSS 피드에 색인됨.
- **왜 중요한가:** 이것은 포트폴리오/구직 사이트임; 공개 표면의 쓰레기 게시물은 발견된 항목 중 평판상 가장 손해이며, 기술적 차단 요인은 아님.
- **권장 수정:** `content/posts/en/asdasd.mdx`를 삭제하거나 `status: draft` / `visibility: private`로 설정.

---

## Medium 우선순위 이슈

### M1 — `note` 콘텐츠 타입에 공개 라우트 없음(고아 기능)
- **심각도:** Medium · **신뢰도:** High · **분류:** 미완성 기능
- **증거:** `lib/posts.ts:7` `type ContentType = "post" | "note" | "knowledge"`; `lib/posts.ts` `TYPE_DIRS.note = "notes"`; 어드민은 생성 지원(`app/(admin)/admin/posts/page.tsx`의 "+ Note" → `/admin/posts/new?type=note`). `app/(public)/notes` 라우트는 없음; `app/sitemap.ts`와 `lib/feed.ts`는 `getPublishedPosts()`(post 타입만) 사용. `next build`로 확인: 라우트 표에 `/notes` 라우트 없음. `note`는 기본 `visibility: private`(`lib/posts.ts:50`).
- **무엇이 잘못됐나:** 노트는 생성·저장될 수 있으나 공개 표면이 없음. 의도적 비공개 스크래치패드이거나(그렇다면 어드민 "+ Note" 어포던스가 오해를 줌) 미완성 기능.
- **왜 중요한가:** 모호하고 도달 불가한 기능; 작성한 콘텐츠가 조용히 아무 데도 안 가는 위험. (감사자의 High 대신 Medium으로 평가: 깨지는 것은 없고 결함이 아닌 미완성임.)
- **권장 수정:** 의도 결정 — 가시성 필터링과 함께 `/notes/[slug]`(EN+KO)를 추가하거나, `note` 타입과 어드민 어포던스를 제거하고 결정을 `CLAUDE.md`에 문서화.

### M2 — 콘텐츠 변경 시 피드와 사이트맵이 재검증되지 않음
- **심각도:** Medium · **신뢰도:** High · **분류:** 캐싱 / SEO
- **증거:** 게시물/프로젝트 생성/수정/삭제 핸들러는 홈/목록/상세에 대해 `revalidatePath`를 호출(예: `app/api/admin/posts/route.ts:100-104`)하지만 `/feed.xml`, `/ko/feed.xml`, 사이트맵에 대해서는 호출하지 않음. `app/(public)/feed.xml/route.ts:3` `export const revalidate = 3600`(1시간 ISR); `app/sitemap.ts`에는 `revalidate` 없음(빌드 시 정적).
- **무엇이 잘못됐나:** 새/수정/삭제된 게시물이 RSS 피드에서 최대 1시간 누락되거나 낡을 수 있고, 다음 재배포 전까지 사이트맵에 없음.
- **왜 중요한가:** 피드 구독자와 검색엔진이 낡은 발견 표면을 보게 됨 — 사이트의 배포/SEO 목표와 관련됨.
- **권장 수정:** 모든 변경 핸들러에 `revalidatePath("/feed.xml")`와 `revalidatePath("/ko/feed.xml")` 추가; 사이트맵을 동적으로(`revalidate` 추가) 만들거나 변경 시 재검증. *(주의: 사용 중인 Next 버전에서 `revalidatePath`가 시간 기반 ISR 라우트를 의도대로 무효화하는지 확인; 아니라면 피드를 `revalidateTag` 태그 기반 재검증으로 전환.)*

### M3 — 크로스포스트 웹훅 실패에도 `ok: true` 반환
- **심각도:** Medium · **신뢰도:** High · **분류:** 부분 실패 처리
- **증거:** `app/api/admin/posts/route.ts:106-118`(및 PUT 대응)은 커밋 성공 후 `notifyCrosspost()` 호출; `lib/crosspost.ts:50-55`는 모든 오류를 잡아 `{ status: "error", ... }` 반환. 라우트는 웹훅이 실패해도 HTTP 200과 함께 `{ ok: true, ..., crosspost: crosspostResult }` 반환.
- **무엇이 잘못됐나:** 커밋은 성공하나 크로스포스트가 발화되지 않았는데 응답은 `ok: true`라고 말함.
- **왜 중요한가:** 어드민이 배포가 성공했다고 믿지만 실제로는 조용히 실패. 계획된 크로스포스트 워크플로에 오해를 줌.
- **권장 수정:** 웹훅 상태를 UI에 별도로 표면화(이미 페이로드에 `crosspost.status`로 존재), 그리고/또는 웹훅 오류를 삼키지 말고 사용자에게 보여주는 비치명적 경고로 처리.

### M4 — 파일이 이미 없을 때 `deleteFile`이 404/410 대신 500 반환
- **심각도:** Medium · **신뢰도:** High · **분류:** 정확성 / 멱등성
- **증거:** `lib/github.ts:115` `deleteFile`의 `getContent()`는 `try/catch`로 감싸지지 않음; 없는 파일은 Octokit에서 404를 던지고 이는 `lib/storage.ts:69`를 거쳐 DELETE 핸들러(`app/api/admin/posts/[locale]/[slug]/route.ts:158-159`)로 전파되어 일반 500 반환. 로컬 FS 경로는 없는 파일 오류를 의도적으로 삼킴(`lib/storage.ts:75-79`), `commitRaw`는 이미 404를 처리함(`lib/github.ts:60` `if (status !== 404) throw err`).
- **무엇이 잘못됐나:** 이미 삭제된 파일을 삭제하면 멱등적으로 성공(또는 404/410 반환)하는 대신 500으로 오류남.
- **왜 중요한가:** DELETE 멱등성을 깨뜨림; 재시도와 모니터링이 거짓 500을 봄.
- **권장 수정:** `deleteFile`에서 404를 잡아 조용히 성공(로컬 FS 동작과 일치)하거나 핸들러에 404/410을 표면화.

### M5 — `ADMIN_PASSWORD` 누락 시 로그인 조용히 실패
- **심각도:** Medium · **신뢰도:** High · **분류:** 운영 / 환경변수 검증
- **증거:** `lib/auth.ts:48-49` `passwordMatches()`는 `ADMIN_PASSWORD`가 설정 안 되면 `false` 반환 — 오류도 로그도 없음. 누락 시 던지는 `secret()`(`lib/auth.ts:9-12`)과 대조됨.
- **무엇이 잘못됐나:** 어드민 비밀번호가 설정되지 않으면 모든 로그인 시도가 "Invalid password"로 거부되며 환경변수 누락에 대한 표시가 없음.
- **왜 중요한가:** 진단하기 어려운 운영 실패; 비밀의 빠른 실패 처리와 불일치.
- **권장 수정:** 프로덕션에서 `ADMIN_PASSWORD`가 설정 안 되면 명확한 시작/최초 사용 오류를 던지거나 로깅.

### M6 — `NEXT_PUBLIC_SITE_URL`이 하드코딩된 도메인으로 폴백
- **심각도:** Medium · **신뢰도:** High · **분류:** 운영 / 설정 (감사자: High; 하향 — 단일 소유자, 폴백이 실제 도메인과 일치)
- **증거:** `lib/site.ts:30` `url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://daeseon.ai"`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`의 `metadataBase`, 캐노니컬/hreflang URL에서 소비됨.
- **무엇이 잘못됐나:** `NEXT_PUBLIC_SITE_URL`이 설정 안 된 배포는 실제 호스트와 무관하게 `daeseon.ai`를 가리키는 SEO 메타데이터, 캐노니컬, 사이트맵, robots를 조용히 방출.
- **왜 중요한가:** 스테이징/프리뷰 배포를 깨뜨리고, 프로젝트가 템플릿으로 재사용되면 설정 함정이 됨. 오늘날 단일 프로덕션 도메인에서는 영향 낮음.
- **권장 수정:** 프로덕션에서 환경변수를 요구(없으면 던짐)하거나 폴백을 프로덕션 전용으로 문서화.

---

## Low 우선순위 이슈

- **L1 — 로그아웃 쿠키에 `sameSite` 누락.** `app/api/auth/logout/route.ts:6-12`는 `sameSite` 없이 쿠키를 지우는 반면, 로그인은 `adminCookieOptions()`로 `sameSite: "lax"` 사용(`lib/auth.ts:40`). 브라우저는 생략된 `sameSite`를 `Lax`로 기본 적용하므로 현재 동작은 일치; 위험은 `adminCookieOptions()`가 향후 바뀔 때의 드리프트. *(감사자는 Medium, Low로 하향.)* **수정:** 로그아웃에서 공유 쿠키 옵션 재사용. 신뢰도: High.
- **L2 — 세션 회전/폐기 없음; 30일 TTL.** `lib/auth.ts:5` `SESSION_TTL_SECONDS = 30일`; `createSessionToken`은 이전 토큰을 무효화하지 않고 `verifySessionToken`은 서명+만료만 검사; 로그아웃은 클라이언트 측 쿠키만 지움. 탈취된 토큰은 최대 30일 유효. **수정:** TTL 단축, 그리고/또는 서버 측에서 검사하는 `loginAt`/버전 클레임 추가. 신뢰도: High.
- **L3 — `sameSite=lax` + CSRF 토큰 없음.** `lib/auth.ts:40`; 어드민 변경은 CSRF 토큰 없는 JSON `fetch`. JSON API에는 악용 불가(교차 출처 `fetch`는 쿠키를 안 보내고, 폼 전송은 JSON을 못 보냄)하므로 심층 방어 사안. **수정:** `sameSite: "strict"` 그리고/또는 CSRF 토큰 고려. 신뢰도: Medium.
- **L4 — 상수시간 비교 전 길이 검사 선행(두 곳).** `lib/auth.ts:50`(`passwordMatches`)과 `app/api/rag/manifest/route.ts:19`(RAG 베어러) 모두 XOR 루프 전에 길이 불일치로 조기 반환하여 타이밍으로 길이를 누출. 로그인 경로는 고정 400ms 지연으로 이를 가림(`app/api/auth/login/route.ts:13`); RAG 경로는 그런 지연이 없으나 고엔트로피 토큰 + 네트워크 지터로 악용은 비현실적. **수정:** 동일 길이 버퍼에 `crypto.timingSafeEqual` 사용. 신뢰도: High.
- **L5 — SSRF: 크로스포스트 웹훅 URL 미검증.** `lib/crosspost.ts:15,51`은 스킴/호스트 검증이나 타임아웃 없이 `CROSSPOST_WEBHOOK_URL`을 fetch. 환경변수 제어이며 사용자 입력 아니므로 위험 낮음. **수정:** HTTPS 요구, 사설 IP 호스트 거부, fetch 타임아웃 추가. 신뢰도: High.
- **L6 — Get-SHA-후-PUT 경쟁.** `lib/github.ts:49-71`이 SHA를 읽은 뒤 씀; 동시 커밋이 409를 발생시키나 특별히 처리되지 않음(API 계층에서 일반 500으로 잡힘 — 데이터 손실 없음, 경쟁하는 쓰기가 이김). **수정:** 409를 잡아 새 SHA로 재시도하거나 친화적 충돌 메시지 반환. 신뢰도: High.
- **L7 — 409 vs 400 상태 불일치.** 중복 슬러그는 409 반환(`app/api/admin/posts/route.ts:71`)인데 다른 검증 오류는 400 반환; 클라이언트(`PostEditor.tsx:196-204`)는 모든 비2xx를 동일하게 처리. 외형적 사안. **수정:** 문서화 또는 정규화. 신뢰도: High.
- **L8 — CSP / 보안 헤더 없음.** `next.config.mjs`에 `headers()` 없음; `middleware.ts`는 아무것도 설정 안 함; 어디에도 CSP/X-Frame-Options/X-Content-Type-Options 없음. **수정:** `headers()` 설정이나 미들웨어로 기본 보안 헤더 설정. 신뢰도: High.
- **L9 — `next/image` 없는 원시 `<img>`.** `app/(public)/about/page.tsx:154`와 `components/admin/SiteForm.tsx:62`(+ `PostEditor.tsx:475`, `Avatar.tsx:14`)가 `eslint-disable`과 함께 `<img>` 사용. 동적/업로드 URL에는 합리적이나 공개 about 페이지에서 지연 로드/반응형 최적화를 놓침. **수정:** `loading="lazy"` + 명시적 치수 추가, 또는 소스가 정적인 곳에 `next/image`. 신뢰도: High.
- **L10 — `feed.xml`에 `maxDuration` 없음.** `app/(public)/feed.xml/route.ts`는 `revalidate`만 export; `buildFeed()`는 페이지네이션 없이 모든 게시물 순회. 현재 약 3개 게시물에서는 무시할 수준; 대규모 시 이론적 Vercel-10초-타임아웃 위험. **수정:** `export const maxDuration = 30` 추가 그리고/또는 캐시. 신뢰도: High.
- **L11 — 캐럿 의존성 범위; 메이저 뒤처짐.** `package.json`은 전반적으로 `^` 사용; `next` 15→16, `tailwindcss` 3→4, `typescript` 5→6 등 사용 가능. 커밋된 `package-lock.json` + Vercel `npm ci`가 실제 설치를 고정하므로 실질 위험은 낮음. **수정:** 락파일을 커밋 유지; 의도적 메이저 업그레이드 일정화. 신뢰도: High.
- **L12 — `README.md` 약 26바이트.** `# daseon-blog\ndaseon-blog`만 있음. 대부분 프로젝트 정보는 `CLAUDE.md` + `docs/`에 있어 영향은 낮으나, 거의 빈 README는 포트폴리오 저장소의 첫인상으로 나쁨. **수정:** 짧은 README 작성(목적, 스택, 실행, 배포). 신뢰도: High.
- **L13 — 쓰레기 비공개 노트 `content/notes/en/asdasd.mdx`.** `visibility: private`, 본문 `asdasd`; 공개적으로 도달 불가하나 콘텐츠를 어지럽히고 RAG 매니페스트로 노출됨(H4 참조). **수정:** 삭제. 신뢰도: High.
- **L14 — `locale`에 불필요한 `as` 캐스트(정보성).** `app/api/admin/posts/route.ts:65` / `projects/route.ts:47`이 이미 타입을 좁히는 `isLocale()` 타입 가드(`lib/i18n.ts:5-7`) 뒤에서 캐스트하므로 캐스트는 불필요(안전하지 않은 것은 아님). **수정:** 선택 — 캐스트 제거. 신뢰도: Medium.

---

## 제품 완성도 리뷰

핵심 작성 → 발행 → 렌더 루프는 `post`, `project`, `knowledge`, `log` 타입에 대해 처음부터 끝까지 완성되어 동작함: 어드민 에디터가 API 라우트로 POST하면 GitHub로 커밋하고 관련 경로를 재검증; 공개 라우트는 ISR된 GitHub-raw fetch로 렌더. `next build`가 이들 모두에 대해 정적/SSG 페이지를 생성함(라우트 표가 `/posts/[slug]`, `/projects/[slug]`, `/wiki/[slug]`, 태그 페이지, 피드, 사이트맵, robots 확인).

빈틈:
- **라이브 표면의 쓰레기 콘텐츠(H9, L13):** `asdasd` 게시물과 비공개 노트는 플레이스홀더 산물; 게시물은 공개 라이브.
- **고아 `note` 타입(M1):** 어드민에서 생성 가능하나 공개적으로 도달 불가.
- **문서상 미완성 기능:** **분석 페이지는 플레이스홀더**(검증됨 — 실제 데이터를 렌더하지 않음, 프로젝트 로그와 일치), **배포 체크리스트는 `localStorage`에만 영속**(`components/admin/DistributionChecklist.tsx`)하므로 상태가 브라우저/기기별이며 다른 기기나 저장소 초기화에서 살아남지 못함. 이는 `CLAUDE.md`의 v1 범위와 일치하나 "아직 실제 아님"으로 기록할 가치가 있음.
- 모든 `project` 파일은 필수 `url` 프론트매터(`CLAUDE.md` 하드 룰)를 가짐 — `content/projects/{en,ko}` 전반에서 검증됨.

---

## 아키텍처 리뷰

빌드-대-런타임 분리(`docs/architecture.md`)가 충실히 구현되어 있으며 코드베이스에서 가장 강한 부분임. 읽기(`lib/source.ts`)와 쓰기(`lib/storage.ts` → `lib/github.ts`)가 깔끔히 분리됨; GitHub-우선-로컬-폴백 전략과 ISR 캐싱이 일관됨. 두 하드 제약 모두 유지됨:

- **프로덕션에서 도달 가능한 `fs.writeFile` 없음** — 쓰기는 Octokit을 거침; 로컬 FS 분기는 운영상 가정으로 가드됨(빈틈은 H7 참조: *강제*되지 않음).
- **`"use client"` 컴포넌트가 `lib/source.ts`/`lib/storage.ts`를 임포트하지 않음** — 공개 클라이언트 컴포넌트(`Mermaid.tsx`, `LogTimeline.tsx`)와 어드민 클라이언트 컴포넌트에 대해 검증됨; 어느 것도 서버 전용 모듈을 클라이언트 번들로 끌어오지 않음(`troubleshooting.md`의 `node:` URI 번들링 제약).

그 외 모듈 경계는 깨끗함: `lib/`의 콘텐츠 로더, `components/`의 프레젠테이션 컴포넌트, 저장 계층 위의 얇은 라우트 핸들러. 주요 아키텍처 약점은 구조적이지 않고 운영적임: 설정이 `lib/auth.ts`, `lib/github.ts`, `lib/source.ts`, `lib/site.ts`, `lib/crosspost.ts` 전반에서 `process.env`로부터 일관성 없는 검증과 함께 즉석으로 읽힘(일부는 throw, 일부는 null 반환, 일부는 조용히 기본값) — H2, H7, H8, M5, M6 참조. 부팅 시 모든 환경변수를 검증하는 단일 타입드 설정 모듈이 이 부류 전체를 제거할 것임.

---

## 보안 리뷰

**인증 코어는 견고함.** `middleware.ts`는 `/admin/*`과 `/api/admin/*`을 올바르게 게이트하고, `/admin/login`을 제외하며, API에는 401 JSON을 반환하고 페이지에는 리다이렉트; JWT 알고리즘은 HS256으로 고정; 쿠키는 프로덕션에서 `httpOnly`이며 `secure`; 어드민 라우트는 중복 검사 없이 미들웨어에 올바르게 의존; RAG 토큰과 비밀번호 비교는 상수시간 XOR 코어 사용. 업로드 라우트는 **잘 방어됨** — `isLocale` + `isValidSlug` + 타입 화이트리스트 + `sanitizeBase()` 파일명 정화(이에 대해 제기된 단 하나의 경로 탐색 후보는 검증에서 **기각됨**).

**실제 이슈**는 세 곳에 몰림:
- **`/api/admin/log-companion`**이 가장 약한 어드민 엔드포인트: 입력 검증 없음(H3 경로 탐색), 오류 처리 없음(H5).
- **`/api/rag/manifest`**가 미발행 콘텐츠 본문을 토큰 보유자에게 노출(H4).
- **로그인 흐름**: 오픈 리다이렉트(H1)와 설정 오류 시 500(H2).

**저위험 위생:** 세션 TTL/회전(L2), CSRF 심층 방어(L3), 타이밍 채널 길이 검사(L4), 환경변수 웹훅의 SSRF(L5), 보안 헤더 부재(L8). 비밀 처리는 올바름: `.env.local`은 git 무시 대상이며 추적되지 않음; 플레이스홀더가 든 `.env.example`만 커밋됨; 소스에 비밀이 나타나지 않음.

---

## 데이터 및 API 리뷰

어드민 API는 posts와 projects에 대해 일관되고 합리적으로 검증됨(locale/slug/title/body 검사, 400/409 상태, `{ ok, error }` 봉투의 `try/catch`). 약점:
- **검증/처리 빈틈**이 `log-companion`에 국한됨(H3, H5).
- **재검증 범위**가 피드와 사이트맵을 놓침(M2).
- **부분 실패 시맨틱**: 웹훅 오류가 `ok: true`로 삼켜짐(M3); 삭제가 없는 파일에 멱등하지 않음(M4); 동시 쓰기가 500으로 경쟁(L6).
- **상태 코드 일관성**은 외형적(L7).

GitHub Contents API 사용(get-SHA-후-PUT, base64 콘텐츠, 커밋 메시지)은 올바름; 유일한 데이터 무결성 우려는 미처리 409 경쟁(L6)이며, 이는 안전하게 실패함(덮어쓰기 없음, 데이터 손실 없음). SQL/ORM/마이그레이션이 없음 — 콘텐츠가 git에 버전 관리되는 "데이터베이스"이며, 이는 큰 부류의 스키마/마이그레이션 위험을 회피함.

---

## 프론트엔드 및 UX 리뷰

**공개:** Next 15 비동기 `params`가 전반적으로 올바르게 await됨; 동적 라우트가 누락/초안/비공개 슬러그에 `notFound()` 호출; `generateMetadata`가 두 로케일에 캐노니컬 + `hreflang` 대안 방출; 이미지에 `alt` 텍스트 존재; 헤딩 구조 존재. 유일한 실제 결함은 **H6(한국어 페이지의 `lang="en"`)**. 사소: 몇 곳에서 `next/image` 미사용(L9).

**어드민:** 폼 상태 처리가 강점 — 컴포넌트가 명시적 오류/로딩/성공 상태 사용, 진행 중 요청 동안 제출 버튼 비활성화(`PostEditor`의 이중 제출 방지), `err` 톤 피드백 영역으로 API 오류를 사용자에게 표면화, `DistributionChecklist`는 빈 상태로 초기화한 뒤 `useEffect`에서 `localStorage`를 로드해 하이드레이션 불일치 회피. 의도적 순차 업로드(`no-await-in-loop`과 `eslint-disable` 및 주석)는 고의적. 주목할 UX 빈틈은 제품 수준: 분석 페이지가 플레이스홀더, 배포 상태가 `localStorage` 전용(기기별) — 제품 완성도 참조.

H6 외에 접근성 차단 요인은 없었고, 검사한 페이지에서 빈/로딩/오류 상태 누락은 없었음.

---

## 테스팅 리뷰

**자동화된 테스트 스위트가 없음.** `package.json`에 `test` 스크립트가 정의되어 있지 않음; 의존성에 테스트 러너(Jest/Vitest/Playwright)가 없고 저장소에 `*.test.*`/`*.spec.*`/`__tests__` 파일이 없음. 유일한 자동 가드는 `tsc --noEmit`와 `next lint`(둘 다 통과)와 빌드.

GitHub 기반의 대부분 정적 아키텍처를 감안하면 v1로서 변명 가능하나, 추가할 가치가 가장 높은(작고 표적화된) 테스트는:
1. **인증 단위 테스트:** `passwordMatches`(길이 불일치, 동일 길이 불일치, 정확 일치, 환경변수 누락), `verifySessionToken`(유효/만료/변조/잘못된 비밀), H1 수정 후 오픈 리다이렉트 가드.
2. **경로/슬러그 검증:** `isValidSlug`와 `log-companion`의 `project`/`slug` 가드(H3) — 탐색 입력을 포함한 테이블 주도.
3. **콘텐츠 로더:** `getPublishedPosts` 가시성/초안 필터링(H9를 잡았을 것), `translationKey` 페어링, 프로젝트 `url`-필수 필터.
4. **RAG 매니페스트:** 초안/비공개 본문이 반환되지 않음을 단언(H4).
5. CI에 최소 **스모크 빌드/라우트 테스트**.

---

## 성능 및 확장성 리뷰

현재 규모의 개인 블로그(약 3 게시물, 5 프로젝트, 4 위키 용어)에서 성능은 비이슈이며 빌드가 작은 초기 로드 JS(공유 약 103kB)를 확인함. 관련 확장 고려사항은 모두 사소하고 미래 지향적임:
- **피드/사이트맵 생성**이 페이지네이션 없이 모든 콘텐츠를 순회하며 `maxDuration` 없음(L10) — 지금은 괜찮으나 콘텐츠가 커지거나 GitHub-raw 지연이 튀기 전에 한계를 둘 가치 있음.
- **ISR + `revalidatePath`** 캐싱이 잘 설계됨; 유일한 빈틈은 피드/사이트맵 무효화(M2).
- **렌더당 GitHub-raw fetch**는 ISR(`revalidate: 30`)로 제한됨 — 적절.
- **이미지 최적화**(L9)가 유일한 클라이언트 성능 항목이며 사소함.

요청 경로에서 N+1 패턴, 무한 루프, 무거운 동기 작업은 발견되지 않음.

---

## 배포 및 운영 리뷰

**빌드/CI:** `next build`, `tsc --noEmit`, `next lint` 모두 통과; 커밋된 `package-lock.json` + Vercel `npm ci`가 재현 가능한 설치 제공(L11 완화).

**운영 위험은 코드가 아니라 설정임.** 환경변수 처리가 일관성 없고 검증이 부족함:
- `GITHUB_TOKEN`/`GITHUB_REPO` 누락 → Vercel 읽기 전용 FS에서 실패하는 조용한 폴백(H7).
- `ADMIN_SESSION_SECRET` 누락 → 로그인 500(H2); 문서 32 대비 16자로 수용(H8).
- `ADMIN_PASSWORD` 누락 → 조용한 로그인 실패(M5).
- `NEXT_PUBLIC_SITE_URL` 누락 → 모든 SEO 표면에 하드코딩된 도메인(M6).

단일 부팅 시 설정 검증기(예: `lib/`의 타입드 스키마)가 이 모두를 잠재 런타임 의외성에서 빠른 실패 시작 오류로 전환할 것임. **관측성**은 최소: 구조화 로깅, 오류 추적(예: Sentry), 플레이스홀더 어드민 페이지 너머의 분석 연동 없음 — v1로 수용 가능하나 기록할 가치 있음. **보안 헤더**가 부재(L8).

---

## 유지보수성 리뷰

코드는 일관되게 스타일링·타입화·소규모 모듈로 구성됨; 명명이 명확; `lib/` 분리가 좋음. 중복은 낮고 대부분 의도적(EN/KO 병렬 라우트 트리). 주목할 유지보수성 테마:
- **설정 접근이 흩어져 있음** — 세 가지 다른 누락값 동작(throw / null / 기본값)으로 모듈 전반에 분산. 중앙화하면 H2/H7/H8/M5/M6을 잘 테스트된 하나의 모듈로 축소.
- **쿠키 옵션이 중복됨** — 로그인(공유 헬퍼)과 로그아웃(인라인) 사이; L1이 증상. 헬퍼 재사용.
- **검증이 비일관적으로 적용됨** — `isValidSlug`가 posts/projects는 가드하나 `log-companion`은 아님(H3).
- **테스트 없음** — 리팩터가 `tsc` + 수동 확인에 의존(테스팅 리뷰 참조).

이 중 구조적 부채는 없음; 수렴 기회임. 프로젝트 로그 규율(`docs/troubleshooting.md` + `content/logs/`)은 진정한 유지보수성 자산.

---

## 권장 수정 계획

**사이트를 공개적으로 공유하기 전 반드시 수정(빠르고 가치 높음):**
1. **H9** — `content/posts/en/asdasd.mdx` 삭제/비발행(그리고 **L13** 쓰레기 노트). *(수 분)*
2. **H6** — `/ko/*`에 로케일별 `lang` 설정. *(소)*
3. **H1** — 로그인 `from` 리다이렉트를 동일 출처 경로로만 검증. *(소)*
4. **H3 + H5** — `log-companion` POST/DELETE에 `isValidSlug` 검증 **및** `try/catch` 추가. *(소)*
5. **H4** — RAG 매니페스트 본문에서 초안/비공개 콘텐츠 필터링. *(소)*

**프로덕션 하드닝 시점/이전:**
6. **H2, H7, H8, M5, M6** — 단일 부팅 시 환경변수 검증기 도입; 16→32 비밀 길이와 `GITHUB_*`/`ADMIN_PASSWORD`/`SITE_URL` 사례를 함께 수정. *(소-중)*
7. **M2** — 변경 시 피드 + 사이트맵 재검증. *(소)*
8. **M3, M4** — 웹훅 실패를 UI에 표면화; 삭제를 404에 멱등하게. *(소)*

**나중에 / 있으면 좋음:**
9. **M1** — `note` 타입 결정 및 문서화(라우트 추가 또는 제거).
10. **L2–L12** — 세션 TTL/회전, CSRF strict + 토큰, `timingSafeEqual`, SSRF 가드, 409 재시도, 보안 헤더, `next/image`, `maxDuration`, 의존성 업그레이드 주기, README.
11. 테스팅 리뷰의 표적 테스트 스위트 추가(인증 + 검증 + 로더 필터링부터 시작).

---

## 가정 및 미검증 사항

- **Vercel 상의 런타임/프로덕션 동작을 구동하지 않음** — 읽기 전용 FS 실패(H7)와 아키텍처에 관한 발견은 실 배포가 아니라 코드 + `docs/architecture.md` + `docs/troubleshooting.md`로부터 추론됨.
- **비밀값을 읽지 않음** — `.env.local`은 git 무시 대상이며 열지 않음; 환경변수 검증 발견은 실제 배포된 값이 아니라 *코드 경로*에 관한 것.
- **`router.push` 외부 내비게이션 동작(H1):** 오픈 리다이렉트 체인은 코드 읽기로 검증됨; `router.push("https://…")`의 정확한 클라이언트 내비게이션 결과는 Next.js/React 런타임 버전에 의존하며 브라우저에서 구동하지 않음. 수정은 무관하게 정당함.
- **`revalidatePath` vs 시간 기반 ISR(M2):** 이 Next 버전에서 `revalidatePath`가 `revalidate = 3600` 피드 라우트를 완전히 무효화하는지는 런타임 검증하지 않음; 낡음 간격은 어느 쪽이든 실재(사이트맵은 정적).
- **외부 서비스**(크로스포스트 웹훅 수신처, RAG 소비자)는 저장소 외부이며 평가하지 않음.
- **`note` 타입 의도(M1):** 노트가 의도적 비공개 저장소인지 미완성 기능인지 저장소에서 판단 불가; 소유자 결정을 위해 표시함.
- **기각된 후보 1건:** 업로드 라우트 경로 탐색 주장이 제기되었으나 검증에서 **기각**됨(검증이 포괄적 — 아래 참조); 의도적으로 발견에서 제외.

---

## 실행한 명령

| 명령 | 목적 | 결과 |
|---|---|---|
| `date "+%Y-%m-%d-%H%M"` | 출력 디렉터리 타임스탬프 | 통과 (`2026-05-30-2323`) |
| `git branch --show-current`, `git rev-parse HEAD`, `git log -1`, `git status` | 리뷰 메타데이터 | 통과 |
| `ls -la`, `find … (소스 파일)` | 저장소 구조 | 통과 |
| `npm run typecheck` (`tsc --noEmit`) | 타입 정확성 | **통과** (종료 0, 오류 없음) |
| `npm run lint` (`next lint`) | 린트 | **통과** (경고/오류 없음; `next lint` 폐기 예정 안내만) |
| `npm run build` (`next build`) | 프로덕션 빌드 + 라우트 표 | **통과** (종료 0); `/posts/asdasd`가 SSG 사전 렌더이고 `/notes` 라우트 부재 확인 |
| `grep -niE "TODO\|FIXME\|HACK\|@ts-ignore\|eslint-disable" …` | 알려진 이슈/억제 마커 | 통과 (`<img>`용 `eslint-disable`과 의도적 `no-await-in-loop`만) |
| `cat .env.example`, `cat .gitignore`, `git ls-files \| grep .env` | 비밀/환경변수 위생 | 통과 (`.env.example`만 추적; `.env.local` 무시됨) |
| `mkdir -p claude_review/full/2026-05-30-2323` | 출력 디렉터리 생성 | 통과 |
| `git status --short` (설정 후) | 소스 미수정 확인 | 통과 (기존 `M docs/troubleshooting.md`만) |
| 워크플로 `full-repo-review` (읽기 전용 서브에이전트 43개) | 8영역 감사 + 적대적 검증 + 완전성 비평가 | 완료 (원시 34 → 확정/하향 33, 기각 1, 신규 0) |

저장소에 테스트 스위트가 없어 테스트는 실행하지 않음. 의존성을 설치하지 않음; 락파일이나 패키지 매니저 상태를 변경하지 않음; 파괴적 명령을 실행하지 않음.

---

## 검사한 파일

**리뷰어가 직접 읽음:** `docs/architecture.md`, `lib/auth.ts`, `middleware.ts`, `package.json`, `.env.example`, `.gitignore`, `next build` 라우트 표, 그리고 저장소 구조.

**읽기 전용 감사 서브에이전트가 검사함(발견에 라인 단위 증거 인용):**
- **인증/보안:** `lib/auth.ts`, `middleware.ts`, `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `components/admin/LoginForm.tsx`, `app/(admin)/admin/login/page.tsx`, `app/(admin)/admin/layout.tsx`.
- **API/저장:** `app/api/admin/posts/route.ts`, `app/api/admin/posts/[locale]/[slug]/route.ts`, `app/api/admin/projects/route.ts`, `app/api/admin/projects/[locale]/[slug]/route.ts`, `app/api/admin/site/route.ts`, `app/api/admin/upload/route.ts`, `app/api/admin/log-companion/route.ts`, `app/api/rag/manifest/route.ts`, `lib/storage.ts`, `lib/source.ts`, `lib/github.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/serialize-mdx.ts`, `lib/mdx.ts`, `lib/crosspost.ts`, `lib/slug.ts`.
- **콘텐츠/i18n:** `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/i18n.ts`, `lib/format.ts`, `lib/feed.ts`, `lib/now.ts`, `lib/site.ts`, `lib/log-kinds.ts`, `lib/remark-wiki-link.ts`, `lib/remark-mermaid.ts`, `app/(public)/feed.xml/route.ts`, `app/(public)/ko/feed.xml/route.ts`, `app/sitemap.ts`, `app/robots.ts`.
- **공개 프론트엔드:** `app/layout.tsx`, `app/(public)/layout.tsx`, `app/(public)/page.tsx` 및 `posts`/`projects`/`wiki`/`about`/`now` 라우트(EN + `/ko`), `app/not-found.tsx`, 그리고 `components/`(Header, Footer, PostBody, PostList, ProjectBody, ProjectCard, ProjectList, WikiBody, WikiList, LogBody, LogTimeline, Mermaid, mdx-components, HomeSection, ProfileCard, ProfileHeader, SocialGrid, Avatar).
- **어드민 프론트엔드:** 모든 `app/(admin)/admin/**` 페이지와 `components/admin/*`(AdminNav, CompanionEditor, DeletePostButton, DistributionChecklist, LoginForm, PostEditor, ProjectEditor, ProjectsList, SiteForm).
- **콘텐츠 & 설정:** `content/posts/{en,ko}/*`, `content/notes/en/asdasd.mdx`, `content/projects/{en,ko}/*`, `content/knowledge/en/*`, `content/now/*`, `content/site.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.json`, `postcss.config.mjs`, `README.md`, `CLAUDE.md`, `docs/troubleshooting.md`, `docs/architecture.md`.

**기각된 후보(발견에서 제외):** `app/api/admin/upload/route.ts` 경로 탐색 주장 — 검증 결과 포괄적 검증(`isLocale`, `isValidSlug`, 타입 화이트리스트, `sanitizeBase()` 파일명 제거, `path.join` 정규화)이 확인되어 탐색 불가.

**읽지 않음:** `codex_review/` 하위 일체(부재; 의도적으로 무시), `.env.local`(git 무시 비밀), `node_modules/`.

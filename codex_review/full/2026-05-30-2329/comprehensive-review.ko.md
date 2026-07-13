# Codex Comprehensive Repository Review

## Review Metadata

- 리뷰 일시: 2026-05-30 23:29 현지 시간(America/Toronto), `date +%Y-%m-%d-%H%M` 기준.
- Git 브랜치: `main`.
- HEAD 커밋: `2a9725b96fc6040207ecc56b8e24008cedeb72c8`.
- 시작 시점 working tree 상태: `docs/troubleshooting.md`가 이미 수정된 상태(`M`)였습니다. 이 리뷰는 해당 파일을 수정하지 않았습니다.
- 생성된 출력 디렉터리: `codex_review/full/2026-05-30-2329/`.
- 리뷰 유형: 사용자가 요청한 전체 저장소 검증 리뷰입니다. 주간/월간 주기는 명시되지 않았으므로 ad hoc 전체 리뷰로 처리했습니다.
- 독립성: `claude_review/` 아래의 파일은 읽거나, 검사하거나, 요약하거나, 비교하거나, 근거로 사용하지 않았습니다.

## Review Scope

저장소 구조, 프로젝트 문서, 패키지/설정 파일, 환경 변수 예시, 앱 라우트, API 라우트, 미들웨어, 인증/세션 코드, GitHub 기반 저장소 코드, MDX/콘텐츠 로더, 관리자 폼, 공개 UI 컴포넌트, feed/sitemap/robots, 설치 스크립트, 테스트/테스트 설정 존재 여부, 운영 스크립트를 검사했습니다.

검사하지 않은 것: 로컬 비밀값 노출을 피하기 위해 `.env.local` 내용은 읽지 않았습니다. `claude_review/` 아래 파일은 검사하지 않았습니다. 이전 리뷰 결과는 근거로 사용하지 않았습니다. 프로덕션 배포 대시보드, Vercel 프로젝트 설정, 외부 GitHub 토큰 권한, 실제 라이브 사이트 동작은 검증하지 않았습니다. `next build`는 `.next/`를 생성/갱신하므로, 두 리포트 파일 외에는 생성하지 말라는 리뷰 전용 제약 때문에 실행하지 않았습니다.

## Executive Summary

이 프로젝트는 공개 이중언어 콘텐츠, MDX 기반 posts/wiki/projects, 그리고 GitHub commit으로 콘텐츠를 쓰는 비밀번호 기반 관리자 화면을 가진 TypeScript/Next.js 개인 사이트입니다. Typecheck와 lint는 통과했습니다. 검사한 근거만 기준으로 보면 프로젝트는 부분적으로 production-ready입니다. 핵심 앱 구조는 일관적이지만, 관리자 로그인 남용 방지, companion 파일 경로 검증, SVG 업로드 처리, crosspost 결과 판정, 자동화 테스트 측면의 production hardening이 아직 필요합니다.

Critical 또는 High 이슈는 확인되지 않았습니다. 가장 우선순위가 높은 확인 이슈는 Medium severity입니다.

## Project Overview

이 앱은 Daeseon Yoo의 이중언어 개인 포트폴리오/블로그로 보입니다. 주요 스택은 다음과 같습니다.

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS.
- `content/` 아래 MDX 콘텐츠: posts, knowledge/wiki entries, projects, project logs, now pages.
- `/admin` 아래 관리자 페이지는 미들웨어와 JWT 세션 쿠키로 보호됩니다.
- `GITHUB_TOKEN`과 `GITHUB_REPO`가 설정된 production authoring 경로에서는 GitHub Contents API를 사용하고, 개발 환경 fallback으로 로컬 파일시스템 쓰기를 사용합니다.
- 외부 연동은 GitHub, optional crosspost webhook, token-protected RAG manifest API입니다.

검사한 저장소 근거에서는 데이터베이스, ORM, migration, payment/billing 코드, queue, worker, cron 인프라를 찾지 못했습니다.

## Key Findings Summary

| ID | Severity | Category | Title | Confidence |
|---|---|---|---|---|
| CDR-001 | Medium | Security/authentication | 관리자 비밀번호 로그인에 확인 가능한 rate limit/lockout이 없음 | High |
| CDR-002 | Medium | Security/data integrity | Log companion API가 검증되지 않은 경로 조각을 받음 | High |
| CDR-003 | Medium | Security/file upload | 공개 업로드 경로가 client-provided MIME 기반으로 unsanitized SVG를 허용함 | Medium |
| CDR-004 | Medium | Integrations/error handling | Crosspost webhook이 HTTP 4xx/5xx 응답도 `sent`로 보고함 | High |
| CDR-005 | Medium | Testing | 자동화 테스트 스위트 또는 test runner가 설정되어 있지 않음 | High |
| CDR-006 | Low | SEO/product completeness | Sitemap이 wiki index와 knowledge entry 페이지를 누락함 | High |
| CDR-007 | Low | Deployment/operations | Lint script가 deprecated `next lint`를 사용함 | High |
| CDR-008 | Low | Product completeness | 관리자 analytics 라우트가 존재하지만 의도적으로 미연결 상태임 | High |
| CDR-009 | Low | Documentation/maintainability | Authoring guide가 companion admin 지원과 맞지 않게 오래됨 | High |
| CDR-010 | Low | Security/configuration | Session secret 길이 정책이 문서와 코드에서 불일치함 | High |

## Critical Issues

검사한 근거에서 Critical 이슈는 발견되지 않았습니다.

## High-Priority Issues

검사한 근거에서 High severity 이슈는 발견되지 않았습니다.

## Medium-Priority Issues

### CDR-001 - 관리자 비밀번호 로그인에 확인 가능한 rate limit/lockout이 없음

- Severity: Medium
- Category: Security/authentication
- Evidence:
  - `middleware.ts:4-18`이 `/admin/:path*`와 `/api/admin/:path*`를 admin session cookie로 보호합니다.
  - `app/api/auth/login/route.ts:11-16`은 제출된 비밀번호를 확인하고 실패 시 고정 400 ms delay만 추가합니다.
  - `.env.example:1-5`는 `ADMIN_PASSWORD`와 `ADMIN_SESSION_SECRET` 기반 관리자 접근을 문서화합니다.
  - `rg -n "rate|ratelimit|throttle|lockout|attempt|ip|redis|upstash|kv|captcha" app lib middleware.ts package.json -g '!claude_review/**'` 검색에서 검사한 앱 코드 안의 구체적인 rate-limit 또는 lockout 구현을 찾지 못했습니다.
- What is wrong: 공개 관리자 로그인은 repository-level rate limit, lockout, CAPTCHA, IP throttling, audit trail 없이 온라인 비밀번호 시도를 받습니다.
- Why it matters: 관리자 비밀번호가 추측되거나 brute-force되면 콘텐츠 작성 API, 업로드 API, GitHub-backed commit 경로에 접근할 수 있습니다.
- Recommended fix: IP 및/또는 account 기준 server-side rate limit, exponential backoff 또는 temporary lockout, login attempt logging을 추가하세요. Production에서는 OAuth/passkey 기반 admin auth 또는 `/admin` 앞단 provider protection도 고려하세요.
- Confidence: High.

### CDR-002 - Log companion API가 검증되지 않은 경로 조각을 받음

- Severity: Medium
- Category: Security/data integrity
- Evidence:
  - `app/api/admin/log-companion/route.ts:23-35`는 save 요청의 `project`, `slug`, `body`를 truthiness/type check만으로 받습니다.
  - `app/api/admin/log-companion/route.ts:40-56`는 delete 요청의 `project`, `slug`를 presence check만으로 받습니다.
  - `lib/storage.ts:122`가 `content/logs/${project}/${slug}.human.mdx`를 직접 구성합니다.
  - `lib/storage.ts:129-131`은 그 결과 경로를 `path.join(process.cwd(), rel)`로 로컬에 씁니다.
  - `lib/storage.ts:144-153`은 삭제에도 같은 직접 interpolation을 사용합니다.
  - 쓰기 없는 검증 명령 `node -e "const path=require('node:path'); console.log(path.relative(process.cwd(), path.join(process.cwd(), 'content/logs/../../posts/en/example.human.mdx')));"`의 출력은 `posts/en/example.human.mdx`였고, 의도한 디렉터리 밖으로 normalize됨을 보였습니다.
- What is wrong: `isValidSlug`를 호출하는 post/project route와 달리 이 API는 repository path를 구성하기 전에 `..`, path separator, malformed project/log identifier를 거부하지 않습니다.
- Why it matters: 인증된 관리자 요청, 탈취된 세션, 또는 future caller bug가 `content/logs/<project>/` 밖의 `.human.mdx` 파일을 쓰거나 삭제할 수 있습니다. GitHub-backed mode에서도 같은 unvalidated path string이 commit layer로 전달됩니다.
- Recommended fix: `project`와 `slug` 모두를 다른 곳에서 쓰는 slug policy로 검증하고, path separator와 dot segment를 거부하며, companion path construction을 중앙화하고, local write 또는 GitHub commit 전에 normalized path가 `content/logs/<project>/` 아래에 남는지 assert하세요.
- Confidence: High.

### CDR-003 - 공개 업로드 경로가 client-provided MIME 기반으로 unsanitized SVG를 허용함

- Severity: Medium
- Category: Security/file upload
- Evidence:
  - `app/api/admin/upload/route.ts:8-14`는 allowed upload types에 `"image/svg+xml": "svg"`를 포함합니다.
  - `app/api/admin/upload/route.ts:41-47`은 extension 선택에 `file.type`을 신뢰합니다.
  - `app/api/admin/upload/route.ts:83-90`은 업로드 bytes를 `saveBinaryAsset`으로 저장합니다.
  - `lib/storage.ts:92-103`은 업로드 asset을 `public...` 아래에 씁니다.
  - `components/admin/PostEditor.tsx:458`은 관리자 업로드 컨트롤에서 SVG 선택을 허용합니다.
- What is wrong: SVG 파일이 sanitization, content sniffing, active SVG content에 대한 response header hardening 근거 없이 public origin 아래에 저장됩니다.
- Why it matters: SVG는 active document format입니다. 안전하지 않은 SVG가 업로드된 뒤 직접 열리거나 안전하지 않은 context에 embed되면 same-origin script/content injection 위험이 생길 수 있습니다. 이 endpoint는 admin-gated이므로 unauthenticated upload 문제는 아니지만, 저장된 공개 asset은 여전히 security-sensitive합니다.
- Recommended fix: SVG 업로드를 금지하거나, maintained sanitizer로 server-side sanitize하고 file signature/content를 검증하며, SVG 응답에 `Content-Security-Policy: script-src 'none'`, `X-Content-Type-Options: nosniff` 같은 restrictive header를 적용하세요.
- Confidence: Medium.

### CDR-004 - Crosspost webhook이 HTTP 4xx/5xx 응답도 `sent`로 보고함

- Severity: Medium
- Category: Integrations/error handling
- Evidence:
  - `lib/crosspost.ts:50-52`는 `res.ok` 확인 없이 완료된 모든 `fetch`에 대해 `{ status: "sent", httpStatus: res.status }`를 반환합니다.
  - `components/admin/PostEditor.tsx:206-210`은 `data.crosspost.status === "sent"`이면 `crosspost sent (...)`를 표시합니다.
- What is wrong: webhook 응답이 400, 401, 429, 500이어도 관리자 UI에는 성공적으로 sent된 것처럼 표시됩니다.
- Why it matters: publish/distribution automation이 조용히 실패했는데 admin은 success message를 받을 수 있습니다. Crosspost는 publish 시점에 일어나므로 수동 재시도 없이 누락될 가능성이 있습니다.
- Recommended fix: non-2xx 응답을 error로 처리하고, status와 짧은 response body snippet을 반환 error에 포함하며, UI copy도 delivered와 failed webhook response를 구분하게 바꾸세요.
- Confidence: High.

### CDR-005 - 자동화 테스트 스위트 또는 test runner가 설정되어 있지 않음

- Severity: Medium
- Category: Testing
- Evidence:
  - `package.json:5-10`에는 `dev`, `build`, `start`, `lint`, `typecheck`만 있고 `test` script가 없습니다.
  - `*test*`, `*spec*`, common test config 파일을 찾는 `find` 검색에서 앱 테스트 파일 또는 테스트 설정을 찾지 못했습니다.
  - `rg -n "describe\\(|it\\(|test\\(|vitest|jest|playwright|cypress|testing-library|@testing" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` 검색에서 앱 테스트 정의를 찾지 못했습니다.
- What is wrong: security-sensitive 및 content-mutating 경로가 검사한 저장소에서 자동화 테스트로 보호되지 않습니다.
- Why it matters: login, upload, GitHub-backed save/delete, RAG manifest authorization, public/private visibility filter 같은 route가 regression되어도 실패 신호가 없습니다.
- Recommended fix: focused test harness를 추가하세요. `auth`, `slug`, `source`, `storage` path builder, `crosspost`, `site-storage` validation unit test부터 시작하고, admin auth, upload rejection, companion path validation, RAG token handling, public visibility behavior route-level test를 추가하세요.
- Confidence: High.

## Low-Priority Issues

### CDR-006 - Sitemap이 wiki index와 knowledge-entry 페이지를 누락함

- Severity: Low
- Category: SEO/product completeness
- Evidence:
  - Wiki route가 `app/(public)/wiki/page.tsx:20-40`, `app/(public)/wiki/[slug]/page.tsx:11-45`, `app/(public)/ko/wiki/page.tsx:20-40`, `app/(public)/ko/wiki/[slug]/page.tsx:11-45`에 존재합니다.
  - `app/sitemap.ts:1-75`는 `getPublishedPosts`와 `getAllProjects`만 import하고, static entries도 home/about/projects/posts/now만 나열하며, post/project entries만 반환합니다. `/wiki`, `/ko/wiki`, `knowledge` entries는 포함하지 않습니다.
- What is wrong: 공개 wiki surface가 sitemap에서 빠져 있습니다.
- Why it matters: search engine과 crawler가 공개 콘텐츠 surface의 불완전한 map을 받습니다.
- Recommended fix: `/wiki`, `/ko/wiki` static sitemap entries를 추가하고, draft/private가 아닌 `knowledge` entries를 올바른 localized alternates와 함께 포함하세요.
- Confidence: High.

### CDR-007 - Lint script가 deprecated `next lint`를 사용함

- Severity: Low
- Category: Deployment/operations
- Evidence:
  - `package.json:9`는 `"lint": "next lint"`를 정의합니다.
  - `npm run lint`는 통과했지만 "`next lint` is deprecated and will be removed in Next.js 16." 경고를 출력했습니다.
- What is wrong: lint command가 deprecated Next.js CLI subcommand에 의존합니다.
- Why it matters: 향후 Next.js upgrade에서 source code 변화 없이도 CI/local linting이 깨질 수 있습니다.
- Recommended fix: 명령 출력에서 안내한 official codemod 등을 사용해 ESLint CLI로 migration하고, script를 `eslint` invocation으로 업데이트하세요.
- Confidence: High.

### CDR-008 - 관리자 analytics 라우트가 존재하지만 의도적으로 미연결 상태임

- Severity: Low
- Category: Product completeness
- Evidence:
  - `components/admin/AdminNav.tsx:13`은 `Analytics` admin nav item을 노출합니다.
  - `app/(admin)/admin/analytics/page.tsx:7-22`는 "Not wired up yet"과 future analytics 제안을 렌더링합니다.
  - `CLAUDE.md:7`과 `CLAUDE.md:181-186`은 admin analytics/distribution을 admin product goal로 설명합니다.
- What is wrong: 관리자 workflow가 navigation에 노출되어 있지만 현재 working analytics behavior가 없습니다.
- Why it matters: owner/admin experience에서 보이는 incomplete product area입니다.
- Recommended fix: 구현 전까지 route를 숨기거나 planned 상태로 명확히 표시하고, 아니면 Vercel Web Analytics/Plausible 같은 최소 analytics를 연결해 per-post views/referrers를 표시하세요.
- Confidence: High.

### CDR-009 - Authoring guide가 companion admin 지원과 맞지 않게 오래됨

- Severity: Low
- Category: Documentation/maintainability
- Evidence:
  - `docs/blog-guide.md:389-392`는 log entry와 `.human.mdx` companion이 direct-MDX only이고 Admin이 companion을 지원하지 않는다고 말합니다.
  - `docs/blog-guide.ko.md:392-394`도 한국어로 같은 내용을 말합니다.
  - Admin 지원은 `app/(admin)/admin/projects/[slug]/logs/page.tsx:37-64`, `app/(admin)/admin/projects/[slug]/logs/[entry]/page.tsx:47-54`, `components/admin/CompanionEditor.tsx:26-39`에 구현되어 있습니다.
- What is wrong: 문서가 구현된 admin 기능과 모순됩니다.
- Why it matters: 오래된 authoring docs는 owner를 더 느린 direct edit로 유도하고, future maintainer에게 지원 workflow를 잘못 알려줄 수 있습니다.
- Recommended fix: English/Korean guide 모두 admin companion workflow를 설명하도록 업데이트하고, 여전히 direct MDX edit가 필요한 작업을 분명히 구분하세요.
- Confidence: High.

### CDR-010 - Session secret 길이 정책이 문서와 코드에서 불일치함

- Severity: Low
- Category: Security/configuration
- Evidence:
  - `.env.example:4-5`는 `ADMIN_SESSION_SECRET=replace-with-a-32+character-random-string`를 요구합니다.
  - `lib/auth.ts:8-12`는 secret이 없거나 16자 미만인 경우에만 throw하지만, error message는 "32+ char random string."이라고 말합니다.
- What is wrong: 문서화된 minimum과 runtime enforcement가 일치하지 않습니다.
- Why it matters: 설정 안내는 32+라고 말하지만 production이 16-31자 secret으로도 시작될 수 있습니다.
- Recommended fix: 코드에서 문서화된 minimum을 강제하세요. 예: `raw.length < 32`. Error message와 `.env.example`도 함께 동기화하세요.
- Confidence: High.

## Product Completeness Review

공개 콘텐츠 흐름은 대체로 갖춰져 있습니다. home, posts, tags, projects, project log details, wiki, now, about, RSS, robots, sitemap, 이중언어 routes가 존재합니다. Admin 흐름도 posts, projects, site profile, distribution checklist, image upload, companion editing에 대해 존재합니다.

확인된 gap:

- CDR-008: analytics는 admin navigation에 연결되어 있지만 명시적으로 미구현입니다.
- CDR-009: authoring documentation이 admin companion support와 맞지 않습니다.
- CDR-006: wiki content는 공개 surface로 존재하지만 sitemap에서 빠져 있습니다.

Payment, billing, subscription, credit, database-backed workflow, queue, cron, worker flow에 대해서는 해당 시스템이 저장소에 존재하지 않았으므로 검사한 근거에서 구체적인 이슈를 찾지 못했습니다.

## Architecture Review

아키텍처는 단순하고 이해 가능합니다. Content loader는 `lib/`에 있고, public page는 typed loader를 사용하며, admin route는 storage helper를 호출합니다. GitHub-backed production write는 local dev filesystem write와 분리되어 있습니다. `lib/source.ts` abstraction은 `docs/architecture.md`에 문서화된 production model과 일치합니다.

확인된 architecture/data-boundary 이슈:

- CDR-002: companion path construction이 post/project route에서 쓰는 validation pattern을 우회합니다.

Companion path validation gap 외에는 public pages, admin pages, content loaders, storage helpers 사이의 module boundary에서 구체적인 이슈를 찾지 못했습니다.

## Security Review

확인된 security 이슈:

- CDR-001: admin password login에 repository-level rate limiting/lockout이 없습니다.
- CDR-002: companion path segment가 write/delete path construction 전에 검증되지 않습니다.
- CDR-003: SVG upload가 허용되고 sanitization 근거 없이 public에 저장됩니다.
- CDR-010: session secret minimum length enforcement가 문서화된 32+ character policy보다 약합니다.

긍정적 근거:

- `middleware.ts:4-18`이 admin pages와 `/api/admin/*`를 보호합니다.
- `lib/auth.ts:36-44`에서 admin session cookie는 `httpOnly`, `sameSite: "lax"`, path `/`, production `secure`를 사용합니다.
- `app/api/rag/manifest/route.ts:10-25`에서 RAG manifest authorization은 bearer token과 constant-time-style comparison을 사용합니다.
- `.gitignore:31-40`은 `.env`, `.env*.local`, TypeScript build info, `next-env.d.ts`를 제외합니다.

Not verified: 외부 deployment protection, WAF/rate limiting, GitHub token scope, `.env.local` secret quality.

## Data and API Review

데이터베이스 schema, ORM, migration, seed file, database API는 발견되지 않았습니다. 데이터는 content-file 기반입니다.

확인된 data/API 이슈:

- CDR-002는 companion file write/delete boundary에 영향을 줍니다.
- CDR-004는 crosspost API result correctness에 영향을 줍니다.

Post/project create/update validation에서는 검사한 post/project API route가 `isLocale`과 `isValidSlug`를 호출하므로 구체적인 이슈를 찾지 못했습니다.

## Frontend and UX Review

Frontend에는 주요 reader workflow를 위한 public route와 owner workflow를 위한 admin UI가 있습니다. 여러 곳에 loading/error/empty state가 존재합니다. 예: post/wiki empty list, admin feedback message, upload progress, distribution local-storage loading.

확인된 UX/product 이슈:

- CDR-008: analytics가 보이지만 placeholder-only입니다.
- CDR-009: 문서가 현재 admin companion UI와 충돌합니다.
- CDR-004: crosspost UI가 실패한 webhook HTTP response를 success처럼 표시할 수 있습니다.

Not verified: 브라우저에서 렌더링된 responsive layout. Review output 외 artifact 생성을 피하기 위해 dev server/browser 검증은 수행하지 않았습니다.

## Testing Review

확인된 이슈:

- CDR-005: 자동화 테스트 또는 test runner를 찾지 못했습니다.

실행한 검증 명령:

- `npm run typecheck -- --incremental false` 통과.
- `npm run lint` 통과, 단 `next lint` deprecation warning 출력.

권장 테스트 케이스:

- Login success/failure, missing env behavior, rate-limit behavior once added.
- Companion path validation이 `..`, slash, encoded separator, empty identifier를 거부하는지.
- Upload가 SVG를 거부하거나 sanitize하는지, MIME/content mismatch를 거부하는지.
- Crosspost가 non-2xx response를 failure로 처리하는지.
- RAG manifest가 missing/short/wrong bearer token을 거부하고 authorized call에 expected field를 포함하는지.
- Public route가 draft/private posts/logs를 숨기는지.
- Sitemap이 posts, projects, wiki indexes, public knowledge entries를 포함하는지.

## Performance and Scalability Review

GitHub content source는 `fetch`에 `next: { revalidate: 30 }`을 사용해 production에서 반복 remote read를 제한합니다. 작은 개인 사이트 규모에서는 합리적입니다.

잠재적 scaling risk이며 confirmed issue로 등록하지는 않았습니다: list page가 directory entries를 읽은 뒤 `Promise.all`로 content files를 읽습니다(`lib/posts.ts:103-108`, `lib/projects.ts:74-79`, `lib/logs.ts:64-85`). 현재 규모에서는 괜찮지만, content가 크게 늘거나 cache가 cold일 때 GitHub API/raw fetch 압박이 될 수 있습니다.

검사한 근거에서 구체적인 performance blocker는 발견되지 않았습니다.

## Deployment and Operations Review

확인된 operations 이슈:

- CDR-007: lint command가 deprecated `next lint`를 사용합니다.
- `next build`는 `.next/`를 쓰기 때문에 실행하지 않았습니다. 따라서 build status는 이 리뷰에서 검증되지 않았습니다.

긍정적 근거:

- `.env.example`이 주요 runtime variables를 문서화합니다.
- `docs/architecture.md`가 Vercel/GitHub runtime model을 문서화합니다.
- `package-lock.json`이 존재하고 lockfile version 3입니다.
- Typecheck와 lint가 통과했습니다.

Not verified: production Vercel settings, deployment protection, environment variable presence/quality, GitHub token scopes, live runtime behavior.

## Maintainability Review

Codebase는 비교적 작고 모듈화되어 있습니다. Content parsing과 storage helper가 중앙화되어 있습니다. Deployment/content model에 관한 문서도 자세합니다.

확인된 maintainability 이슈:

- CDR-005: 테스트 부재가 regression risk를 높입니다.
- CDR-009: authoring docs가 오래되었습니다.
- CDR-010: config docs와 enforcement가 다릅니다.

핵심 코드 경로에서 과도한 duplication 또는 unbounded complexity에 대한 구체적인 이슈는 발견되지 않았습니다.

## Recommended Fix Plan

더 넓은 production exposure 전에 must-fix:

1. Admin login rate limiting/lockout/logging 추가(CDR-001).
2. Companion `project`, `slug` validation과 path containment 강제(CDR-002).
3. Crosspost non-2xx handling 수정으로 실패한 webhook을 sent로 보고하지 않기(CDR-004).
4. Auth, storage path validation, upload handling, crosspost, visibility filtering 중심의 focused tests 추가(CDR-005).
5. SVG upload를 금지할지 sanitize할지 결정하고 해당 정책 강제(CDR-003).

이후 개선:

1. Sitemap에 wiki pages와 public knowledge entries 추가(CDR-006).
2. `npm run lint`를 `next lint`에서 migration(CDR-007).
3. Admin analytics를 숨기거나 planned label을 붙이거나 구현(CDR-008).
4. Companion admin support에 맞춰 English/Korean authoring guide 업데이트(CDR-009).
5. 문서화된 32+ character session secret minimum을 코드에서 강제(CDR-010).

## Assumptions and Not Verified

- `.env.local`은 존재하지만 읽지 않았습니다. Secret values와 production env configuration은 검증되지 않았습니다.
- `claude_review/` 아래 파일은 읽거나 사용하지 않았습니다.
- Production deployment settings, Vercel protection, WAF/rate limiting, live domain behavior는 검증되지 않았습니다.
- GitHub token permissions와 branch protection은 검증되지 않았습니다.
- `next build`는 `.next/`를 쓰기 때문에 실행하지 않았습니다.
- Browser rendering, assistive technology accessibility, responsive screenshot은 검증되지 않았습니다.
- Database/payment/queue/cron system은 발견되지 않았습니다. 이 부재는 repository search 기준이며 외부 인프라는 확인하지 않았습니다.

## Commands Run

모든 명령은 `/Users/daeseonyoo/Documents/GitHub/ai-product/daseon-blog`에서 실행했습니다. 모든 검색은 `-g '!claude_review/**'` 또는 `find ... -path './claude_review' -prune` 방식으로 `claude_review/`를 제외했습니다.

| Command | Purpose | Result |
|---|---|---|
| `pwd` | 작업 디렉터리 확인 | Passed |
| `date +%Y-%m-%d-%H%M` | 초기 timestamp 확인 | Passed |
| `git branch --show-current` | 브랜치 확인 | Passed |
| `git rev-parse HEAD` | HEAD commit 확인 | Passed |
| `git status --short` | 초기 working tree 상태 확인 | Passed |
| `rg --files -g '!claude_review/**'` | `claude_review/` 제외 파일 목록 확인 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -maxdepth 3 -type d -print` | 디렉터리 구조 검사 | Passed |
| `find codex_review/full -maxdepth 1 -type d -print` | 기존 review dir 확인 | Failed: directory did not exist |
| `rg --files --hidden -g '!claude_review/**' -g '!.git/**' -g '!node_modules/**' -g '!.next/**'` | hidden config 포함 파일 inventory | Passed |
| `rg -n "TODO|FIXME|HACK|XXX|SECURITY|BUG|REVIEW" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | known issue marker 검색 | Passed |
| `rg -n "process\\.env|NEXT_PUBLIC_|ADMIN_|GITHUB_|TOKEN|SECRET|PASSWORD|COOKIE|JWT|SESSION" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | env/secrets/auth reference 검색 | Passed |
| `rg --files -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**' -g '*test*' -g '*spec*'` | test/spec file 검색 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name '.env*' -print` | env file 확인 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name '*schema*' -o -name '*migration*' -o -name '*prisma*' -o -name '*drizzle*' -print` | schema/migration/ORM 파일 검색 | Passed; relevant file not found |
| `nl -ba package.json` | package scripts/dependencies 검사 | Passed |
| `nl -ba next.config.mjs` | Next config 검사 | Passed |
| `nl -ba tsconfig.json` | TypeScript config 검사 | Passed |
| `nl -ba middleware.ts` | auth middleware 검사 | Passed |
| `nl -ba README.md` | README 검사 | Passed |
| `nl -ba docs/architecture.md` | architecture docs 검사 | Passed |
| `nl -ba docs/project-log-spec.md` | project log spec 검사 | Passed |
| `nl -ba .env.example` | env example 검사 | Passed |
| `nl -ba .eslintrc.json` | lint config 검사 | Passed |
| `nl -ba .gitignore` | ignore rules 검사 | Passed |
| `nl -ba lib/auth.ts` | auth helper 검사 | Passed |
| `nl -ba app/api/auth/login/route.ts` | login API 검사 | Passed |
| `nl -ba app/api/auth/logout/route.ts` | logout API 검사 | Passed |
| `nl -ba app/api/admin/posts/route.ts` | post create API 검사 | Passed |
| `nl -ba app/api/admin/posts/[locale]/[slug]/route.ts` | post edit/delete API 검사 | Failed: shell glob required quoting |
| `nl -ba app/api/admin/upload/route.ts` | upload API 검사 | Passed |
| `nl -ba 'app/api/admin/posts/[locale]/[slug]/route.ts'` | quoted path로 post edit/delete API 검사 | Passed |
| `nl -ba app/api/admin/projects/route.ts` | project create API 검사 | Passed |
| `nl -ba 'app/api/admin/projects/[locale]/[slug]/route.ts'` | project edit/delete API 검사 | Passed |
| `nl -ba app/api/admin/site/route.ts` | site admin API 검사 | Passed |
| `nl -ba app/api/admin/log-companion/route.ts` | companion API 검사 | Passed |
| `nl -ba app/api/rag/manifest/route.ts` | RAG manifest API 검사 | Passed |
| `nl -ba lib/storage.ts` | storage helper 검사 | Passed |
| `nl -ba lib/project-storage.ts` | project storage helper 검사 | Passed |
| `nl -ba lib/site-storage.ts` | site storage helper 검사 | Passed |
| `nl -ba lib/github.ts` | GitHub commit helper 검사 | Passed |
| `nl -ba lib/source.ts` | content source abstraction 검사 | Passed |
| `nl -ba lib/slug.ts` | slug validation 검사 | Passed |
| `nl -ba lib/posts.ts` | content loader 검사 | Passed |
| `nl -ba lib/projects.ts` | project loader 검사 | Passed |
| `nl -ba lib/logs.ts` | log loader 검사 | Passed |
| `nl -ba lib/now.ts` | now loader 검사 | Passed |
| `nl -ba lib/mdx.ts` | MDX rendering 검사 | Passed |
| `nl -ba lib/serialize-mdx.ts` | MDX serialization 검사 | Passed |
| `nl -ba 'app/(public)/projects/[slug]/page.tsx'` | EN project detail 검사 | Passed |
| `nl -ba 'app/(public)/ko/projects/[slug]/page.tsx'` | KO project detail 검사 | Passed |
| `nl -ba 'app/(public)/projects/[slug]/log/[entry]/page.tsx'` | EN log detail 검사 | Passed |
| `nl -ba 'app/(public)/ko/projects/[slug]/log/[entry]/page.tsx'` | KO log detail 검사 | Passed |
| `nl -ba components/LogTimeline.tsx` | log timeline component 검사 | Passed |
| `nl -ba components/ProjectBody.tsx` | project body/log filtering 검사 | Passed |
| `nl -ba 'app/(public)/posts/page.tsx'` | EN posts index 검사 | Passed |
| `nl -ba 'app/(public)/posts/[slug]/page.tsx'` | EN post detail 검사 | Passed |
| `nl -ba 'app/(public)/ko/posts/page.tsx'` | KO posts index 검사 | Passed |
| `nl -ba 'app/(public)/ko/posts/[slug]/page.tsx'` | KO post detail 검사 | Passed |
| `nl -ba 'app/(public)/wiki/page.tsx'` | EN wiki index 검사 | Passed |
| `nl -ba 'app/(public)/wiki/[slug]/page.tsx'` | EN wiki detail 검사 | Passed |
| `nl -ba 'app/(public)/ko/wiki/page.tsx'` | KO wiki index 검사 | Passed |
| `nl -ba 'app/(public)/ko/wiki/[slug]/page.tsx'` | KO wiki detail 검사 | Passed |
| `nl -ba 'app/(public)/posts/tag/[tag]/page.tsx'` | EN tag route 검사 | Passed |
| `nl -ba 'app/(public)/ko/posts/tag/[tag]/page.tsx'` | KO tag route 검사 | Passed |
| `nl -ba 'app/(public)/projects/page.tsx'` | EN projects index 검사 | Passed |
| `nl -ba 'app/(public)/ko/projects/page.tsx'` | KO projects index 검사 | Passed |
| `nl -ba components/admin/LoginForm.tsx` | login UI 검사 | Passed |
| `nl -ba components/admin/PostEditor.tsx` | post editor/upload UI 검사 | Passed |
| `nl -ba components/admin/ProjectEditor.tsx` | project editor 검사 | Passed |
| `nl -ba components/admin/SiteForm.tsx` | site form/upload UI 검사 | Passed |
| `nl -ba 'app/(admin)/admin/login/page.tsx'` | admin login page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/layout.tsx'` | admin layout 검사 | Passed |
| `nl -ba 'app/(admin)/admin/page.tsx'` | admin overview 검사 | Passed |
| `nl -ba components/admin/AdminNav.tsx` | admin navigation 검사 | Passed |
| `nl -ba components/admin/DeletePostButton.tsx` | delete UI 검사 | Passed |
| `nl -ba components/admin/CompanionEditor.tsx` | companion editor 검사 | Passed |
| `nl -ba 'app/(admin)/admin/posts/page.tsx'` | admin posts list 검사 | Passed |
| `nl -ba 'app/(admin)/admin/posts/new/page.tsx'` | new post page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/posts/[locale]/[slug]/edit/page.tsx'` | edit post page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/projects/page.tsx'` | admin projects list 검사 | Passed |
| `nl -ba 'app/(admin)/admin/projects/new/page.tsx'` | new project page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/projects/[locale]/[slug]/edit/page.tsx'` | edit project page 검사 | Passed |
| `nl -ba components/admin/ProjectsList.tsx` | project list actions 검사 | Passed |
| `nl -ba 'app/(admin)/admin/projects/[slug]/logs/page.tsx'` | admin project logs page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/projects/[slug]/logs/[entry]/page.tsx'` | admin companion edit page 검사 | Passed |
| `nl -ba 'app/(admin)/admin/distribution/page.tsx'` | distribution page 검사 | Passed |
| `nl -ba components/admin/DistributionChecklist.tsx` | distribution checklist 검사 | Passed |
| `nl -ba 'app/(admin)/admin/analytics/page.tsx'` | analytics placeholder 검사 | Passed |
| `nl -ba lib/feed.ts` | feed builder 검사 | Passed |
| `nl -ba 'app/(public)/feed.xml/route.ts'` | EN feed route 검사 | Passed |
| `nl -ba 'app/(public)/ko/feed.xml/route.ts'` | KO feed route 검사 | Passed |
| `nl -ba app/sitemap.ts` | sitemap 검사 | Passed |
| `nl -ba app/robots.ts` | robots 검사 | Passed |
| `nl -ba lib/site.ts` | site config constant 검사 | Passed |
| `nl -ba content/site.json` | public site profile config 검사 | Passed |
| `nl -ba app/layout.tsx` | root layout metadata 검사 | Passed |
| `nl -ba 'app/(public)/layout.tsx'` | public layout 검사 | Passed |
| `nl -ba 'app/(public)/page.tsx'` | EN home 검사 | Passed |
| `nl -ba 'app/(public)/ko/page.tsx'` | KO home 검사 | Passed |
| `nl -ba app/globals.css` | global CSS 검사 | Passed |
| `nl -ba components/Header.tsx` | header/navigation 검사 | Passed |
| `nl -ba components/ProfileCard.tsx` | profile card 검사 | Passed |
| `nl -ba components/ProfileHeader.tsx` | profile header 검사 | Passed |
| `nl -ba components/Avatar.tsx` | avatar component 검사 | Passed |
| `nl -ba components/PostBody.tsx` | post detail body 검사 | Passed |
| `nl -ba components/mdx-components.tsx` | MDX component mapping 검사 | Passed |
| `nl -ba components/Mermaid.tsx` | Mermaid rendering 검사 | Passed |
| `nl -ba lib/remark-mermaid.ts` | Mermaid remark plugin 검사 | Passed |
| `nl -ba lib/remark-wiki-link.ts` | wiki-link plugin 검사 | Passed |
| `nl -ba lib/i18n.ts` | i18n helpers/copy 검사 | Passed |
| `nl -ba tailwind.config.ts` | Tailwind config 검사 | Passed |
| `nl -ba postcss.config.mjs` | PostCSS config 검사 | Passed |
| `test -d node_modules` | local dependency 존재 확인 | Passed |
| `test -x node_modules/.bin/tsc` | local TypeScript binary 확인 | Passed |
| `test -x node_modules/.bin/next` | local Next binary 확인 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name 'next-env.d.ts' -print` | generated Next type file 존재 확인 | Passed |
| `npm run typecheck -- --incremental false` | non-writing TypeScript check 실행 | Passed |
| `npm run lint` | lint 실행 | Passed with deprecation warning |
| `git status --short` | 검증 명령이 source를 바꾸지 않았는지 확인 | Passed |
| `sed -n '1,80p' package-lock.json` | lockfile header/deps 검사 | Passed |
| `nl -ba install/README.md` | installer docs 검사 | Passed |
| `nl -ba install/setup.sh` | installer script 검사 | Passed |
| `nl -ba install/settings.json` | hook settings template 검사 | Passed |
| `nl -ba CLAUDE.md` | project instructions/docs 검사 | Passed |
| `nl -ba docs/troubleshooting.md` | troubleshooting docs 검사 | Passed |
| `rg -n "^#|^##|Admin|Environment|Deploy|Vercel|test|TODO|missing|Not wired" docs/blog-guide.md docs/blog-guide.ko.md -g '!claude_review/**'` | authoring guide 구조와 admin docs 검사 | Passed |
| `rg -n "describe\\(|it\\(|test\\(|vitest|jest|playwright|cypress|testing-library|@testing" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | test definitions/config references 검색 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f -name '*test*' -print` | test file 검색 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -type f -name '*spec*' -print` | spec file 검색 | Passed |
| `find . -path './claude_review' -prune -o -path './node_modules' -prune -o -path './.next' -prune -o -path './.git' -prune -o -name 'vitest.config.*' -o -name 'jest.config.*' -o -name 'playwright.config.*' -o -name 'cypress.config.*' -print` | test runner config 검색 | Passed; no configs found |
| `rg -n "analytics|Plausible|Vercel Web Analytics|console\\.|logger|Sentry|monitor|telemetry" -g '!claude_review/**' -g '!node_modules/**' -g '!.next/**'` | observability/analytics reference 검색 | Passed |
| `node -e "const path=require('node:path'); console.log(path.relative(process.cwd(), path.join(process.cwd(), 'content/logs/../../posts/en/example.human.mdx')));"` | 의도한 companion directory 밖으로 path normalization되는지 확인 | Passed |
| `date +%Y-%m-%d-%H%M` | report directory timestamp 확인 | Passed |
| `test -e codex_review/full/2026-05-30-2329` | output directory collision 확인 | Passed with exit 1 meaning no collision |
| `mkdir -p codex_review/full/2026-05-30-2329` | review output directory 생성 | Passed |
| `rg -n "rate|ratelimit|throttle|lockout|attempt|ip|redis|upstash|kv|captcha" app lib middleware.ts package.json -g '!claude_review/**'` | auth abuse protection 검색 | Passed |
| `rg -n "image/svg\\+xml|ALLOWED|file\\.type|saveBinaryAsset|dangerouslySetInnerHTML|sanitize" app/api components lib -g '!claude_review/**'` | upload/SVG handling 검색 | Passed |
| `rg -n "log-companion|saveHumanCompanion|deleteHumanCompanion|content/logs/\\$\\{project\\}|isValidSlug" app lib components -g '!claude_review/**'` | companion validation과 다른 slug validation 비교 | Passed |
| `rg -n "wiki|knowledge|sitemap|getPublishedPosts|getAllProjects|staticEntries" app/sitemap.ts app/'(public)' lib -g '!claude_review/**'` | wiki route와 sitemap 비교 | Passed |
| `nl -ba lib/crosspost.ts` | crosspost integration 검사 | Passed |
| `nl -ba components/SocialGrid.tsx` | social links 검사 | Passed |
| `nl -ba components/Footer.tsx` | footer 검사 | Passed |
| `nl -ba components/WikiBody.tsx` | wiki body 검사 | Passed |
| `nl -ba components/WikiList.tsx` | wiki list 검사 | Passed |
| `nl -ba components/PostList.tsx` | post list 검사 | Passed |
| `test -f codex_review/full/2026-05-30-2329/comprehensive-review.en.md` | English report 존재 확인 | Passed |
| `test -f codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Korean report 존재 확인 | Passed |
| `find codex_review/full/2026-05-30-2329 -maxdepth 1 -type f -print` | output directory 안에 두 report file만 있는지 확인 | Passed |
| `rg -o "CDR-[0-9]{3}" codex_review/full/2026-05-30-2329/comprehensive-review.en.md` | English finding ID 확인 | Passed |
| `rg -o "CDR-[0-9]{3}" codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | Korean finding ID가 English report와 일치하는지 확인 | Passed |
| `rg -n "\\| CDR-001 \\||\\| CDR-002 \\||\\| CDR-003 \\||\\| CDR-004 \\||\\| CDR-005 \\||\\| CDR-006 \\||\\| CDR-007 \\||\\| CDR-008 \\||\\| CDR-009 \\||\\| CDR-010 \\|" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | 두 key finding summary table이 같은 10개 ID를 포함하는지 확인 | Passed |
| `git status --short` | report 생성 후 최종 working tree status 확인 | Passed |
| `find codex_review -type f -print` | review task가 만든 파일이 새 output report로 제한되는지 확인 | Passed |
| `rg -n "severity: Critical|severity: High|severity: Medium|severity: Low|Severity: Critical|Severity: High|Severity: Medium|Severity: Low" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | severity entry 존재와 count matching 확인 | Passed |
| `rg -n "Evidence:|Evidence" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | 모든 confirmed issue section에 evidence가 있는지 확인 | Passed |
| `rg -n "claude_review" codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | report가 `claude_review/` 제외를 명시하는지 확인 | Passed |
| `wc -l codex_review/full/2026-05-30-2329/comprehensive-review.en.md codex_review/full/2026-05-30-2329/comprehensive-review.ko.md` | parity verification 중 report length 비교 | Passed |

## Files Inspected

중요 검사 파일과 디렉터리는 다음을 포함합니다.

- Root/config: `package.json`, `package-lock.json`, `next.config.mjs`, `tsconfig.json`, `.eslintrc.json`, `.gitignore`, `.env.example`, `tailwind.config.ts`, `postcss.config.mjs`, `middleware.ts`.
- Documentation: `README.md`, `CLAUDE.md`, `docs/architecture.md`, `docs/project-log-spec.md`, `docs/troubleshooting.md`, `docs/blog-guide.md`, `docs/blog-guide.ko.md`, `install/README.md`, `install/setup.sh`, `install/settings.json`.
- App routes: `app/(public)/**`, `app/(admin)/**`, `app/api/**`, `app/sitemap.ts`, `app/robots.ts`, `app/layout.tsx`, `app/globals.css`.
- Libraries: `lib/auth.ts`, `lib/source.ts`, `lib/storage.ts`, `lib/github.ts`, `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/crosspost.ts`, `lib/site-storage.ts`, `lib/mdx.ts`, `lib/serialize-mdx.ts`, `lib/slug.ts`, `lib/i18n.ts`, remark plugins.
- Components: `components/` 아래 public components와 `components/admin/` 아래 admin components.
- Content/config: `content/site.json`, representative `content/**` structure, `public/**` asset structure.

`claude_review/`는 읽거나, 검사하거나, 요약하거나, 사용하지 않았습니다.

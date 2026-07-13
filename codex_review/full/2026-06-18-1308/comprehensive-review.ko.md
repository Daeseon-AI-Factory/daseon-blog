# Codex Comprehensive Repository Review

## Review Metadata

- 리뷰 일시: 2026-06-18 13:15:01 EDT
- Git 브랜치: `main`
- HEAD 커밋: `a65e5945d7051180f3865a7d610dd5a7f6bcac7b`
- 리포트 작성 전 작업 트리 상태: `docs/troubleshooting.md` 수정됨; `claude_review/`, `codex_review/`, `docs/simlab-design.md`, `docs/trainer-design.md` 미추적.
- 생성된 출력 디렉터리: `codex_review/full/2026-06-18-1308/`
- 주간/월간 전체 리뷰 여부: 사용자가 요청한 일회성 전체 저장소 리뷰입니다. 정기 주간/월간 리뷰인지는 확인되지 않았습니다.

## Review Scope

저장소 구조, 루트 문서, 패키지/설정 파일, 환경 변수 예시, Next.js 앱 라우트, API 라우트, 인증/세션 코드, 파일/GitHub 기반 저장 계층, MDX 렌더링, 관리자 UI 컴포넌트, 공개 UI 컴포넌트, 스크립트, 설치 키트, 콘텐츠 로더, sitemap/feed/robots, 테스트 설정, 비파괴 명령 결과를 검사했습니다.

검사하거나 사용하지 않은 것: `claude_review/` 아래의 모든 파일. 이전 `codex_review/` 리포트 내용도 증거로 사용하지 않았습니다. `.env.local`은 실제 비밀값을 포함할 수 있으므로 내용을 출력하거나 검사하지 않았습니다. `node_modules` 소스는 수동 검토하지 않았고, 의존성 증거는 `npm audit` 및 `npm ls` 결과만 사용했습니다. `npm run build`는 빌드 산출물을 쓰기 때문에, 보고서 디렉터리 외 수정 금지 조건에 따라 실행하지 않았습니다.

## Executive Summary

이 프로젝트는 개인 포트폴리오/블로그 앱으로서 파일 기반 콘텐츠 모델, bilingual 공개 라우트, 관리자 작성 기능, GitHub 기반 발행 흐름, 유용한 아키텍처 문서를 갖춘 비교적 일관된 구조입니다. 검사한 증거 기준으로 공개 읽기 경로의 구조는 대체로 건전하며 TypeScript와 lint 검사는 통과했습니다.

다만 공개 관리자 표면을 운영하기에는 아직 production-hardened 상태가 아닙니다. 최우선 보완점은 관리자 로그인 brute-force 방어, 업로드 SVG 처리, log companion 경로 검증, 프로덕션 의존성 보안 권고, 보안 민감 쓰기 경로에 대한 자동 테스트 부재입니다.

## Project Overview

이 앱은 React 19, TypeScript, Tailwind CSS, MDX 콘텐츠, GitHub를 콘텐츠 source of truth로 사용하는 Next.js 15 App Router 사이트로 보입니다. 공개 페이지는 posts, projects, project logs, wiki, about/now/method, RSS, sitemap, 한국어 mirror를 포함합니다. 관리자 페이지는 로그인, 글/프로젝트/사이트 편집, 업로드, 배포 체크리스트, log companion, analytics placeholder를 포함합니다.

주요 구성:

- `app/(public)/...`: 공개 localized 라우트.
- `app/(admin)/admin/...`: 관리자 UI.
- `app/api/admin/...`: 인증된 쓰기 API.
- `lib/source.ts`: 로컬 파일시스템과 GitHub Raw/Contents 읽기 추상화.
- `lib/storage.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/github.ts`: 콘텐츠 저장.
- `lib/auth.ts`, `middleware.ts`: 비밀번호 + JWT 쿠키 관리자 세션.
- `lib/mdx.ts`, `components/Mermaid.tsx`: MDX 및 diagram 렌더링.
- `content/...`: 파일 기반 posts, projects, logs, wiki, site config.

## Key Findings Summary

| ID | Severity | Category | Title | Confidence |
|---|---|---|---|---|
| F-001 | High | Security/Auth | 공개 관리자 로그인에 실질적인 rate limit 또는 lockout이 없음 | High |
| F-002 | Medium | Security/Uploads | SVG 업로드가 허용되고 same-origin 공개 파일로 원본 저장됨 | High |
| F-003 | Medium | Security/API/Data | Log companion API가 쓰기/삭제 전에 경로 segment를 검증하지 않음 | High |
| F-004 | Medium | Security/Dependencies | `npm audit --omit=dev`가 프로덕션 의존성 보안 권고를 보고함 | High |
| F-005 | Medium | Testing | 자동 테스트 suite 또는 `npm test` 스크립트가 없음 | High |
| F-006 | Low | Frontend/Accessibility | 한국어 페이지가 hard-coded `<html lang="en">`을 상속함 | High |
| F-007 | Low | Product/Ops | 관리자 Analytics 페이지가 링크되어 있지만 구현되지 않음 | High |
| F-008 | Low | Tooling/Maintainability | Lint 스크립트가 deprecated `next lint`를 사용함 | High |
| F-009 | Low | Documentation/Ops | 루트 README에 실질적인 setup/deployment 안내가 없음 | High |
| F-010 | Low | Security/Configuration | 예시 관리자 비밀번호가 약하고 secret 길이 강제가 문서보다 약함 | High |

## Critical Issues

검사한 증거 기준으로 Critical 이슈는 발견되지 않았습니다.

## High-Priority Issues

### F-001: 공개 관리자 로그인에 실질적인 rate limit 또는 lockout이 없음

- Severity: High
- Category: Security/Auth
- Evidence: `middleware.ts:4-5`는 `/admin/*` 및 `/api/admin/*`를 보호하지만 `app/api/auth/login/route.ts`는 해당 matcher 밖에 있습니다. `app/api/auth/login/route.ts:11-15`는 비밀번호를 확인하고 실패 시 고정 400 ms 지연만 적용합니다. `lib/auth.ts:47-55`는 단일 `ADMIN_PASSWORD`와 비교합니다.
- What is wrong: 공개 로그인 endpoint에 IP별 throttling, 계정 lockout, exponential backoff, 시도 로그, CAPTCHA, 배포 보호, 2차 인증이 없습니다. 유일한 감속 장치는 고정 지연입니다.
- Why it matters: 이 관리자 세션은 posts, projects, site config, uploads, GitHub commit 쓰기 API에 접근할 수 있습니다. 공개 단일 비밀번호 gate에 rate limiting이 없으면 온라인 추측 공격에 노출됩니다.
- Recommended fix: IP와 정규화된 client identity 기준의 서버 측 rate limiting, exponential backoff 또는 임시 lockout, 실패 시도 로깅, 기본 비밀번호 거부를 추가하고 `/admin`에 GitHub OAuth/2FA 또는 upstream deployment protection을 고려하세요.
- Confidence: High

## Medium-Priority Issues

### F-002: SVG 업로드가 허용되고 same-origin 공개 파일로 원본 저장됨

- Severity: Medium
- Category: Security/Uploads
- Evidence: `app/api/admin/upload/route.ts:7-14`의 allow-list에 `"image/svg+xml": "svg"`가 포함되어 있습니다. `app/api/admin/upload/route.ts:83-90`은 업로드 바이트를 sanitization 없이 저장합니다. `components/admin/PostEditor.tsx:443` 및 `components/admin/PostEditor.tsx:458`은 SVG 업로드를 안내/허용합니다.
- What is wrong: SVG는 script, 외부 reference, 혼동을 유발하는 markup을 포함할 수 있는 active XML content입니다. 라우트는 이를 `public/...` 아래 same-origin 파일로 저장합니다.
- Why it matters: 업로드가 관리자 인증 뒤에 있더라도 악의적이거나 복사해 온 SVG가 same-origin 공개 콘텐츠가 될 수 있습니다. stored-XSS/content-spoofing 위험이 커지고 이후 콘텐츠 재사용도 안전하지 않습니다.
- Recommended fix: 기본 allow-list에서 SVG를 제거하거나, 서버 측에서 강화된 sanitizer로 SVG를 정화하고 가능한 경우 엄격한 CSP/`Content-Disposition`으로 제공하세요. SVG를 PNG/WebP로 rasterize한 뒤 공개하는 방식을 우선 고려하세요.
- Confidence: High

### F-003: Log companion API가 쓰기/삭제 전에 경로 segment를 검증하지 않음

- Severity: Medium
- Category: Security/API/Data
- Evidence: `app/api/admin/log-companion/route.ts:23-29`는 `project`, `slug`, `body` 존재 여부만 검사합니다. `app/api/admin/log-companion/route.ts:44-49`는 delete query parameter 존재 여부만 검사합니다. `lib/storage.ts:122` 및 `lib/storage.ts:144`는 `content/logs/${project}/${slug}.human.mdx`를 구성합니다. `lib/storage.ts:129-153`은 local mode에서 `path.join(process.cwd(), rel)`로 쓰기/삭제합니다.
- What is wrong: `project`와 `slug`가 검증된 slug나 알려진 log entry가 아니라 임의 문자열로 허용됩니다. local mode에서는 `../` segment가 의도한 `content/logs/<project>/` 디렉터리 밖으로 벗어날 수 있습니다.
- Why it matters: 인증된 관리자 endpoint이긴 하지만, 좁은 companion-file 작업이 local mode에서 임의 경로 쓰기/삭제 primitive로 확장되고 production에서는 예상 밖 GitHub API path를 만들 수 있습니다.
- Recommended fix: 두 필드 모두 `isValidSlug`로 검증하고 dot/slash를 거부하세요. 최종 경로를 resolve한 뒤 `content/logs` 아래에 남는지 assert하고, 가능하면 companion target이 실제 log entry에 대응해야 하도록 제한하세요.
- Confidence: local 경로 동작은 코드상 High. traversal-like path에 대한 production GitHub 동작은 확인하지 않았습니다.

### F-004: `npm audit --omit=dev`가 프로덕션 의존성 보안 권고를 보고함

- Severity: Medium
- Category: Security/Dependencies
- Evidence: `npm audit --audit-level=moderate --omit=dev`가 5개 moderate vulnerability로 실패했습니다. `npm ls dompurify js-yaml postcss gray-matter next`는 `mermaid@11.15.0 -> dompurify@3.4.7`, `gray-matter@4.0.3 -> js-yaml@3.14.2`, `next@15.5.18 -> postcss@8.4.31` 경로를 보여주었습니다.
- What is wrong: 프로덕션 의존성 그래프에 DOMPurify, js-yaml, PostCSS 보안 권고가 포함되어 있습니다.
- Why it matters: 이 앱은 관리자 작성 MDX와 Mermaid diagram을 렌더링하고, YAML frontmatter를 파싱하며, framework tooling으로 CSS를 빌드합니다. 실제 악용 가능성은 입력 신뢰 경계에 따라 다르지만 취약 패키지가 중요한 runtime/build 경로에 있습니다.
- Recommended fix: 가능한 범위에서 transitive advisory를 해소하는 direct dependency 버전으로 올리세요. audit가 일부 강제 수정은 breaking이라고 표시하므로 `next`, `mermaid`, `gray-matter`의 MDX/frontmatter 동작을 branch에서 테스트하세요.
- Confidence: High

### F-005: 자동 테스트 suite 또는 `npm test` 스크립트가 없음

- Severity: Medium
- Category: Testing
- Evidence: `package.json:5-11`은 `dev`, `build`, `start`, `lint`, `typecheck`만 정의하고 `test`는 없습니다. `rg --files ... | rg '(__tests__|\\.test\\.|\\.spec\\.)'`는 테스트 파일을 찾지 못했습니다. `npm test`는 `Missing script: "test"`로 실패했습니다.
- What is wrong: auth, upload validation, path safety, content visibility, MDX rendering, admin write API에 대한 자동 테스트가 없습니다.
- Why it matters: 가장 위험한 코드 경로는 작고 테스트하기 쉽습니다. password/session handling, upload allow-list, GitHub/local storage routing, visibility filtering, log companion path는 regression 가능성이 큽니다.
- Recommended fix: `lib/auth`, `lib/slug`, storage path helper, upload validation, content visibility에 대한 focused unit test를 추가하세요. admin API route-handler test와 가능한 경우 public page/admin login Playwright smoke test를 추가하세요.
- Confidence: High

## Low-Priority Issues

### F-006: 한국어 페이지가 hard-coded `<html lang="en">`을 상속함

- Severity: Low
- Category: Frontend/Accessibility
- Evidence: `app/layout.tsx:33-36`은 항상 `<html lang="en">`을 렌더링합니다. `find app -path '*layout.tsx'` 결과 layout은 `app/layout.tsx`, `app/(public)/layout.tsx`, `app/(admin)/admin/layout.tsx`뿐이었습니다. `app/(public)/layout.tsx:1-2`는 language를 override하지 않습니다.
- What is wrong: `/ko/...` 페이지가 한국어 콘텐츠를 영어 document language로 렌더링합니다.
- Why it matters: screen reader, 번역 도구, 브라우저 언어 heuristic, 검색 엔진은 document language를 신호로 사용합니다.
- Recommended fix: 한국어 라우트에 `lang="ko"`를 설정할 수 있는 locale segment layout을 도입하거나, dynamic locale segment 아래로 라우트를 재구성해 locale별 metadata/layout 처리를 하세요.
- Confidence: High

### F-007: 관리자 Analytics 페이지가 링크되어 있지만 구현되지 않음

- Severity: Low
- Category: Product/Ops
- Evidence: `components/admin/AdminNav.tsx:7-13`에 `Analytics` nav item이 있습니다. `app/(admin)/admin/analytics/page.tsx:7-17`은 "Not wired up yet"을 렌더링하고 향후 Plausible/Vercel/자체 구현 옵션을 설명합니다.
- What is wrong: 보이는 관리자 workflow가 placeholder로 연결됩니다.
- Why it matters: runtime bug는 아니지만 운영 준비도를 약화시키고, owner가 실제로 존재하지 않는 traffic/referral insight를 기대하게 할 수 있습니다.
- Recommended fix: 구현 전까지 nav item을 제거/숨기거나, 선택한 analytics provider를 추가하고 privacy/runtime 동작을 문서화하세요.
- Confidence: High

### F-008: Lint 스크립트가 deprecated `next lint`를 사용함

- Severity: Low
- Category: Tooling/Maintainability
- Evidence: `package.json:9`는 `"lint": "next lint"`를 정의합니다. `npm run lint`는 통과했지만 `next lint`가 deprecated이고 Next.js 16에서 제거될 것이라는 경고를 출력했습니다.
- What is wrong: lint 명령이 deprecation 경로에 있습니다.
- Why it matters: 향후 Next.js 업그레이드에서 현재 통과하는 검증 명령이 깨진 스크립트가 될 수 있습니다.
- Recommended fix: 명시적 ESLint config와 ESLint CLI로 migration하고 `lint` script를 갱신하세요.
- Confidence: High

### F-009: 루트 README에 실질적인 setup/deployment 안내가 없음

- Severity: Low
- Category: Documentation/Ops
- Evidence: `README.md:1-2`는 프로젝트 이름만 포함합니다. `.env.example:1-28`, `docs/architecture.md`, `docs/blog-guide.md`에는 중요한 설정/아키텍처 정보가 있지만 root README는 새 maintainer를 안내하지 않습니다.
- What is wrong: 첫 문서 진입점이 stack, local setup, environment variables, scripts, deployment model, 실제 문서 위치를 설명하지 않습니다.
- Why it matters: onboarding과 production recovery는 찾기 쉬운 운영 문서에 의존합니다.
- Recommended fix: `README.md`에 quick start, 필수/선택 env var, command list, content model, admin model, deployment notes, `docs/architecture.md`와 `docs/blog-guide.md` 링크를 추가하세요.
- Confidence: High

### F-010: 예시 관리자 비밀번호가 약하고 secret 길이 강제가 문서보다 약함

- Severity: Low
- Category: Security/Configuration
- Evidence: `.env.example:1-5`는 `ADMIN_PASSWORD=changeme`를 사용하고 session secret은 32+ character random string이어야 한다고 설명합니다. `lib/auth.ts:7-12`는 16자보다 짧은 secret만 거부합니다. `lib/auth.ts:47-55`는 weak/default admin password를 거부하지 않습니다.
- What is wrong: 예시를 그대로 복사하면 약한 live admin password가 설정될 수 있고, 코드는 문서보다 짧은 session secret을 허용합니다.
- Why it matters: 이는 F-001을 악화시킵니다. 약한 기본값과 공개 로그인 endpoint 조합은 온라인 추측 위험을 높입니다.
- Recommended fix: `.env.example`에서 `ADMIN_PASSWORD`를 비워 두고, 알려진 기본값과 짧은 password를 runtime에서 거부하며, `ADMIN_SESSION_SECRET`에 문서화된 32+ character minimum을 강제하세요.
- Confidence: High

## Product Completeness Review

공개 product surface는 넓습니다. home, posts, tags, projects, project logs, project README/architecture pages, wiki, now, about, method, RSS, sitemap, bilingual Korean mirror가 `app/(public)/...`에 존재합니다. 관리자 surface는 content, projects, site settings, distribution checklist, log companions, login을 다룹니다.

확인된 completeness gap:

- F-007: Analytics가 보이지만 구현되지 않았습니다.
- F-009: root onboarding docs가 부족합니다.

위 findings 외에 공개 post/project/wiki rendering completeness에서 concrete issue는 발견되지 않았습니다.

## Architecture Review

아키텍처는 단순하고 대체로 일관됩니다. 콘텐츠는 파일에 있고, 읽기는 `lib/source.ts`를 통하며, 쓰기는 storage helper와 GitHub Contents API를 통합니다. public/admin route group도 분리되어 있습니다. `docs/architecture.md`는 runtime GitHub Raw read path와 production filesystem 제약을 잘 설명합니다.

확인된 architecture/data boundary issue:

- F-003: log companion route가 다른 경로에서 쓰는 slug/path discipline을 우회합니다.

검사한 범위에서 database/ORM/migration architecture는 발견되지 않았습니다. 파일/GitHub 기반 앱이므로 의도된 구조로 보입니다.

## Security Review

확인된 보안 이슈:

- F-001: 관리자 로그인에 실질적인 rate limiting이 없습니다.
- F-002: SVG 업로드 위험이 있습니다.
- F-003: log companion path validation gap이 있습니다.
- F-004: production dependency advisory가 있습니다.
- F-010: weak example password와 secret length mismatch가 있습니다.

긍정적 증거:

- `middleware.ts:4-5`는 `/admin/*` 및 `/api/admin/*`를 gate합니다.
- `lib/auth.ts:36-44`는 `httpOnly`, `sameSite: "lax"`, production `secure`, `maxAge`를 사용합니다.
- `.gitignore:31-33`은 env file을 ignore하고, `git ls-files .env.local .env.example` 결과 `.env.example`만 tracked입니다.
- `app/api/rag/manifest/route.ts:10-25`는 full content 반환 전에 bearer token과 constant-length comparison logic을 사용합니다.

검사한 증거 기준으로 commit된 live secret 문제는 발견되지 않았습니다.

## Data and API Review

검사한 파일 검색 결과 database schema, ORM file, migration, seed file은 없었습니다. 데이터는 MDX, Markdown, JSON, public asset으로 저장됩니다.

확인된 이슈:

- F-003: companion write/delete path validation.
- F-005: route/storage tests 부재.

주요 admin post/project API는 쓰기 전에 `isLocale`/`isValidSlug`로 locale과 slug를 검증합니다(`app/api/admin/posts/route.ts:47-50`, `app/api/admin/projects/route.ts:36-42`). companion API도 이 패턴을 재사용해야 합니다.

## Frontend and UX Review

프론트엔드는 콘텐츠 페이지에 server component를, 관리자 form에 client component를 사용합니다. 관리자 form은 upload/save에 대한 loading/feedback state를 포함하고, 공개 list view에는 기본 empty state가 있습니다.

확인된 frontend/accessibility issue:

- F-006: 한국어 페이지가 영어 document language를 사용합니다.

Not verified: 브라우저 screenshot 기반 visual responsiveness는 검증하지 않았습니다. 작업이 review-only였고 build/dev workflow가 generated file을 쓸 수 있어 dev server/browser run은 수행하지 않았습니다.

## Testing Review

확인된 테스트 이슈:

- F-005: automated test 또는 test script가 없습니다.

`npm run typecheck -- --incremental false`는 통과했습니다. `npm run lint`도 통과했지만 lint command 자체는 deprecated입니다(F-008).

권장 첫 테스트:

- Auth: password mismatch, missing env, secret length, cookie options.
- Upload: MIME allow-list, size cap, SVG rejection/sanitization.
- Log companion: project/slug validation and path containment.
- Content visibility: draft/private/unlisted behavior in list/detail loaders.
- RAG manifest: missing/invalid/valid bearer token.

## Performance and Scalability Review

검사한 증거 기준으로 concrete performance blocker는 발견되지 않았습니다. 콘텐츠 로더는 대체로 file read에 `Promise.all`을 사용하고, `lib/source.ts`는 GitHub Raw/Contents fetch에 `next: { revalidate: 30 }`을 사용합니다.

가능하지만 확인되지 않은 점: 콘텐츠가 크게 늘어나면 list page가 directory entries와 개별 파일을 읽기 때문에 GitHub API call이 증가할 수 있습니다. 이는 현재 확인된 issue가 아니라 assumption입니다.

## Deployment and Operations Review

확인된 deployment/ops 이슈:

- F-004: dependency audit advisories.
- F-007: analytics/monitoring 미구현.
- F-008: deprecated lint command.
- F-009: root README setup/deployment guide 부족.
- F-010: env example/default hardening gap.

`npm run build`는 `.next/` output을 쓰기 때문에 review 지시상 실행하지 않았습니다. Typecheck와 lint는 통과했습니다.

## Maintainability Review

코드베이스는 작고 읽기 쉽습니다. public/admin/source/storage boundary도 이해하기 쉽습니다. 가장 큰 maintainability risk는 missing tests(F-005), deprecated lint tooling(F-008), documentation discoverability(F-009)입니다.

별도 finding으로 올릴 만큼 concrete한 duplication 또는 complexity issue는 발견되지 않았습니다.

## Concrete Bugs or Likely Regressions

확인된 likely regression/bug:

- F-003은 local mode에서 의도한 companion directory 밖으로 쓰기/삭제할 수 있습니다.
- F-006은 Korean route의 document language를 잘못 설정합니다.
- F-008은 `next lint` 제거 시 tooling break가 됩니다.

## Highest-Priority Fixes Before Production

1. 관리자 로그인 throttling/lockout을 추가하고 default/weak credential을 거부하세요(F-001, F-010).
2. `public/` 아래 저장 전에 SVG 업로드를 제거하거나 sanitize하세요(F-002).
3. log companion path를 검증하고 containment를 보장하세요(F-003).
4. production dependency advisory를 해결하거나 명시적으로 triage하세요(F-004).
5. auth, upload, storage, visibility path에 대한 최소 자동 테스트 suite를 추가하세요(F-005).

## Recommended Fix Plan

Production hardening 전 must-fix:

1. `/api/auth/login`에 rate limiting과 credential hardening을 구현합니다.
2. SVG를 upload allow-list에서 제거하거나 sanitize/rasterize합니다.
3. `app/api/admin/log-companion/route.ts`의 `project`, `slug`를 검증합니다.
4. `npm audit --omit=dev` advisory를 해결하도록 의존성을 upgrade합니다.
5. 변경된 보안 민감 경로에 route/helper test를 추가합니다.

Later improvements:

1. 한국어 페이지의 document language를 올바르게 설정합니다.
2. analytics를 구현할지 숨길지 결정합니다.
3. linting을 `next lint`에서 migration합니다.
4. root README를 확장합니다.

## Assumptions and Not Verified

- `claude_review/`는 읽거나, 검사하거나, 요약하거나, 비교하거나, 사용하지 않았습니다.
- `.env.local` 내용은 검사하지 않았습니다.
- `npm run build`는 generated build output을 쓰기 때문에 실행하지 않았습니다.
- 브라우저 기반 UX/responsiveness screenshot 검증은 수행하지 않았습니다.
- traversal-like path에 대한 GitHub Contents API의 production 동작은 확인하지 않았습니다. local filesystem path 동작은 코드로 확인했습니다.
- 현재 private/draft content 노출은 확인되지 않았습니다. `content/notes`에는 `.gitkeep`만 있었고, status/visibility grep에서 활성 draft/private frontmatter를 찾지 못했습니다.
- 검사한 source에서 payment, billing, database, queue, cron job, background worker 구현은 발견되지 않았습니다.

## Commands Run

| Command | Purpose | Result |
|---|---|---|
| `date +%Y-%m-%d-%H%M` | 리뷰 디렉터리 timestamp 생성. | Passed: `2026-06-18-1308`. |
| `git branch --show-current` | 브랜치 확인. | Passed: `main`. |
| `git rev-parse HEAD` | HEAD commit 확인. | Passed: `a65e5945d7051180f3865a7d610dd5a7f6bcac7b`. |
| `git status --short` | 초기 작업 트리 상태 확인. | Passed; 기존 dirty/untracked 파일 확인. |
| `find codex_review/full -maxdepth 1 -type d -name '2026-06-18-1308*'` | 출력 디렉터리 overwrite 방지 확인. | Passed; 기존 동일 디렉터리 없음. |
| `mkdir -p codex_review/full/2026-06-18-1308` | 리뷰 출력 디렉터리 생성. | Passed. |
| `rg --files -g '!claude_review/**'` | `claude_review/` 제외 파일 inventory. | Passed. |
| `find . -maxdepth 2 -type d -not -path './claude_review*' -not -path './codex_review*' -not -path './.git*'` | 상위 디렉터리 구조 검사. | Passed. |
| `nl -ba package.json` | package scripts/dependencies line-number 검사. | Passed. |
| `nl -ba README.md` | root README 검사. | Passed. |
| `nl -ba next.config.mjs` | Next config 검사. | Passed. |
| `nl -ba tsconfig.json` | TypeScript config 검사. | Passed. |
| `rg -n "TODO|FIXME|XXX|HACK|@ts-ignore|dangerouslySetInnerHTML|process\\.env|cookies\\(|NextResponse|fetch\\(|localStorage|eval\\(|innerHTML|JWT|jwt|token|password|secret|upload|writeFile|mkdir|unlink|rename|rm\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | 보안 민감/known-risk pattern 검색. | Passed. |
| `rg -n "export async function (GET|POST|PUT|PATCH|DELETE)|generateStaticParams|generateMetadata|revalidate|dynamic" app lib components -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | route handler/dynamic rendering inventory. | Passed. |
| `rg -n "describe\\(|it\\(|test\\(|expect\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | 초기 broad test 검색. | Passed but `.test(...)` regex call false positive 발생. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' -g '*test*' -g '*spec*'` | test/spec filename 검색. | Passed; 실제 test file 없음. |
| `rg -n "\\b(describe|it|test|expect)\\(" -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**'` | refined test symbol 검색. | Passed; 남은 match는 implementation regex call, test 아님. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' \| rg '(__tests__|\\.test\\.|\\.spec\\.)'` | conventional test file 부재 확인. | Failed with exit 1 because no matches were found. |
| `find . -maxdepth 3 -name '.env*' -not -path './claude_review/*' -not -path './codex_review/*' -not -path './node_modules/*' -not -path './.next/*'` | `.env.local` 내용을 읽지 않고 env file 위치 확인. | Passed; `.env.local`, `.env.example` 발견. |
| `find . -maxdepth 4 -type f -name '*schema*' -o -name '*migration*' -o -name '*seed*'` | 초기 schema/migration/seed 검색. | Passed but command precedence로 node_modules 포함. |
| `nl -ba .env.example` | documented env vars 검사. | Passed. |
| `rg --files -g '!claude_review/**' -g '!codex_review/**' -g '!node_modules/**' -g '!.next/**' \| rg '(schema|migration|seed)'` | refined schema/migration/seed 검색. | Failed with exit 1 because no matches were found. |
| `nl -ba middleware.ts` | admin/API middleware 검사. | Passed. |
| `nl -ba lib/auth.ts` | session/password logic 검사. | Passed. |
| `nl -ba app/api/auth/login/route.ts` | login endpoint 검사. | Passed. |
| `nl -ba app/api/auth/logout/route.ts` | logout endpoint 검사. | Passed. |
| `nl -ba components/admin/LoginForm.tsx` | login client behavior 검사. | Passed. |
| `nl -ba app/(admin)/admin/login/page.tsx` | login page search param flow 검사. | Passed. |
| `nl -ba lib/storage.ts` | post/binary/companion storage 검사. | Passed. |
| `nl -ba lib/project-storage.ts` | project storage 검사. | Passed. |
| `nl -ba lib/site-storage.ts` | site config storage/validation 검사. | Passed. |
| `nl -ba lib/github.ts` | GitHub commit/delete helper 검사. | Passed. |
| `nl -ba lib/slug.ts` | slug validation 검사. | Passed. |
| `nl -ba app/api/admin/posts/route.ts` | create post API 검사. | Passed. |
| `nl -ba app/api/admin/posts/[locale]/[slug]/route.ts` | update/delete post API 검사. | Passed. |
| `nl -ba app/api/admin/projects/route.ts` | create project API 검사. | Passed. |
| `nl -ba app/api/admin/projects/[locale]/[slug]/route.ts` | update/delete project API 검사. | Passed. |
| `nl -ba app/api/admin/log-companion/route.ts` | companion API 검사. | Passed. |
| `nl -ba app/api/admin/upload/route.ts` | upload API 검사. | Passed. |
| `nl -ba lib/serialize-mdx.ts` | MDX serialization 검사. | Passed. |
| `nl -ba lib/mdx.ts` | MDX rendering pipeline 검사. | Passed. |
| `nl -ba components/mdx-components.tsx` | custom MDX components/links 검사. | Passed. |
| `nl -ba components/Mermaid.tsx` | Mermaid rendering 검사. | Passed. |
| `nl -ba lib/remark-mermaid.ts` | Mermaid remark transform 검사. | Passed. |
| `nl -ba lib/source.ts` | content source abstraction 검사. | Passed. |
| `nl -ba lib/posts.ts` | post/content loader 검사. | Passed. |
| `nl -ba lib/projects.ts` | project loader 검사. | Passed. |
| `nl -ba lib/logs.ts` | project log loader 검사. | Passed. |
| `nl -ba lib/now.ts` | now-page loader 검사. | Passed. |
| `nl -ba app/(public)/posts/[slug]/page.tsx` | EN post detail route 검사. | Passed. |
| `nl -ba app/(public)/ko/posts/[slug]/page.tsx` | KO post detail route 검사. | Passed. |
| `nl -ba app/(public)/wiki/[slug]/page.tsx` | EN wiki route 검사. | Passed. |
| `nl -ba app/(public)/ko/wiki/[slug]/page.tsx` | KO wiki route 검사. | Passed. |
| `nl -ba app/(public)/posts/page.tsx` | posts index route 검사. | Passed. |
| `rg -n "status:\\s*(draft|published)|visibility:\\s*(private|unlisted|public)" content -g '!claude_review/**' -g '!codex_review/**'` | 현재 content visibility/status 검색. | Passed. |
| `find content/notes -maxdepth 3 -type f` | notes content 존재 확인. | Passed; `.gitkeep`만 있음. |
| `nl -ba app/api/rag/manifest/route.ts` | RAG manifest auth/data behavior 검사. | Passed. |
| `nl -ba app/sitemap.ts` | sitemap generation 검사. | Passed. |
| `nl -ba app/robots.ts` | robots rules 검사. | Passed. |
| `nl -ba app/(public)/feed.xml/route.ts` | RSS route 검사. | Passed. |
| `nl -ba lib/feed.ts` | feed generation 검사. | Passed. |
| `nl -ba app/(admin)/admin/layout.tsx` | admin layout 검사. | Passed. |
| `nl -ba app/(admin)/admin/page.tsx` | admin overview 검사. | Passed. |
| `nl -ba app/(admin)/admin/posts/page.tsx` | admin content list 검사. | Passed. |
| `nl -ba app/(admin)/admin/projects/page.tsx` | admin projects list page 검사. | Passed. |
| `nl -ba app/(admin)/admin/site/page.tsx` | admin site settings page 검사. | Passed. |
| `nl -ba components/admin/PostEditor.tsx` | post editor 검사. | Passed. |
| `nl -ba components/admin/ProjectEditor.tsx` | project editor 검사. | Passed. |
| `nl -ba components/admin/SiteForm.tsx` | site editor 검사. | Passed. |
| `nl -ba components/Header.tsx` | public navigation 검사. | Passed. |
| `nl -ba components/PostBody.tsx` | post body rendering 검사. | Passed. |
| `nl -ba components/WikiBody.tsx` | wiki body rendering 검사. | Passed. |
| `nl -ba components/ProjectBody.tsx` | project page rendering/log loading 검사. | Passed. |
| `nl -ba app/globals.css` | global CSS 검사. | Passed. |
| `nl -ba docs/architecture.md` | architecture docs 검사. | Passed. |
| `nl -ba docs/troubleshooting.md` | troubleshooting docs 검사. | Passed. |
| `nl -ba docs/blog-guide.md` | authoring guide 검사. | Passed. |
| `nl -ba docs/project-log-spec.md` | project-log spec 검사. | Passed. |
| `nl -ba install/README.md` | install kit docs 검사. | Passed. |
| `nl -ba install/setup.sh` | install bootstrap script 검사. | Passed. |
| `nl -ba install/hooks/stop-check.sh` | stop hook 검사. | Passed. |
| `nl -ba scripts/propagate-hook.sh` | hook propagation script 검사. | Passed. |
| `nl -ba scripts/sync-skip-markers.sh` | marker sync script 검사. | Passed. |
| `nl -ba scripts/new-discussion.sh` | discussion stub script 검사. | Passed. |
| `nl -ba lib/crosspost.ts` | crosspost integration 검사. | Passed. |
| `nl -ba app/layout.tsx` | root layout/metadata 검사. | Passed. |
| `nl -ba lib/site.ts` | site constants/types 검사. | Passed. |
| `nl -ba content/site.json` | public site config 검사. | Passed. |
| `nl -ba lib/i18n.ts` | localization helper 검사. | Passed. |
| `nl -ba app/(public)/layout.tsx` | public layout 검사. | Passed. |
| `find app -path '*layout.tsx' -not -path './claude_review/*' -not -path './codex_review/*' -print` | layout file 확인. | Passed. |
| `find app lib components content docs install scripts public -type f -not -path './claude_review/*' -not -path './codex_review/*' \| wc -l` | reviewed project files count. | Passed: 238. |
| `find app lib components -type f \| wc -l` | app/lib/component file count. | Passed: 111. |
| `find content -type f \| wc -l` | content file count. | Passed: 92. |
| `find app/api -type f -name 'route.ts' \| sort` | API route inventory. | Passed. |
| `find app -type f -name 'page.tsx' \| sort` | page inventory. | Passed. |
| `npm run typecheck -- --incremental false` | tsbuildinfo write 없이 TypeScript 검증. | Passed. |
| `npm run lint` | lint 검증. | Passed, `next lint` deprecation warning 있음. |
| `npm audit --audit-level=moderate --omit=dev` | production dependency audit. | Failed: 5 moderate vulnerabilities. |
| `npm ls dompurify js-yaml postcss gray-matter next` | vulnerable dependency path 추적. | Passed. |
| `git ls-files .env.local .env.example` | env tracking 확인. | Passed; `.env.example`만 tracked. |
| `git check-ignore -v .env.local` | `.env.local` ignore 확인. | Passed. |
| `nl -ba .gitignore` | ignore rule 검사. | Passed. |
| `git status --short` | verification이 worktree를 변경했는지 확인. | Passed; 기존 dirty/untracked 상태와 review output directory만 존재. |
| `npm test` | test script 확인. | Failed: missing `test` script. |
| `nl -ba lib/log-kinds.ts` | log kind definition 검사. | Passed. |
| `nl -ba app/(admin)/admin/analytics/page.tsx` | analytics placeholder 검사. | Passed. |
| `nl -ba app/(admin)/admin/distribution/page.tsx` | distribution page 검사. | Passed. |
| `nl -ba components/admin/DistributionChecklist.tsx` | distribution checklist 검사. | Passed. |
| `nl -ba components/admin/AdminNav.tsx` | admin navigation 검사. | Passed. |
| `nl -ba lib/readme.ts` | README rendering/sanitization 검사. | Passed. |
| `nl -ba lib/architecture.ts` | architecture content loader 검사. | Passed. |
| `nl -ba app/(public)/projects/[slug]/readme/page.tsx` | project README route 검사. | Passed. |
| `nl -ba app/(public)/projects/[slug]/architecture/page.tsx` | project architecture route 검사. | Passed. |
| `nl -ba app/(public)/projects/[slug]/log/[entry]/page.tsx` | project log detail route 검사. | Passed. |
| `date '+%Y-%m-%d %H:%M:%S %Z'` | report time 확인. | Passed: `2026-06-18 13:15:01 EDT`. |
| `test -f codex_review/full/2026-06-18-1308/comprehensive-review.en.md` | English report 존재 확인. | Passed. |
| `test -f codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Korean report 존재 확인. | Passed. |
| `find codex_review/full/2026-06-18-1308 -maxdepth 1 -type f -print` | 출력 디렉터리에 예상한 두 파일만 있는지 확인. | Passed; English/Korean report listed. |
| `rg -n "^### F-[0-9]{3}:" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | 두 리포트 모두 F-001부터 F-010 finding section을 포함하는지 확인. | Passed. |
| `git status --short` | report 작성 후 최종 작업 트리 상태 확인. | Passed; 기존 dirty/untracked path와 `codex_review/`만 있음. |
| `rg -n "\\| F-[0-9]{3} \\|" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | Key Findings table의 ID, severity, category, confidence 값 parity 확인. | Passed. |
| `rg -n "claude_review" codex_review/full/2026-06-18-1308/comprehensive-review.en.md codex_review/full/2026-06-18-1308/comprehensive-review.ko.md` | 리포트가 `claude_review/` exclusion을 명시하는지 확인. | Passed. |

## Files Inspected

주요 검사 파일/디렉터리:

- Root/config: `package.json`, `package-lock.json` via audit/ls, `README.md`, `.env.example`, `.gitignore`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`.
- App routes: `app/layout.tsx`, `app/(public)/**/page.tsx`, `app/(admin)/admin/**/page.tsx`, `app/api/**/route.ts`, `middleware.ts`.
- Libraries: `lib/auth.ts`, `lib/source.ts`, `lib/storage.ts`, `lib/project-storage.ts`, `lib/site-storage.ts`, `lib/github.ts`, `lib/posts.ts`, `lib/projects.ts`, `lib/logs.ts`, `lib/log-kinds.ts`, `lib/mdx.ts`, `lib/readme.ts`, `lib/architecture.ts`, `lib/crosspost.ts`, `lib/feed.ts`, `lib/i18n.ts`, `lib/slug.ts`.
- Components: `components/Header.tsx`, `components/PostBody.tsx`, `components/ProjectBody.tsx`, `components/WikiBody.tsx`, `components/Mermaid.tsx`, `components/admin/*.tsx`.
- Content/docs/scripts: `content/**`, `docs/architecture.md`, `docs/troubleshooting.md`, `docs/blog-guide.md`, `docs/project-log-spec.md`, `install/**`, `scripts/**`.

`claude_review/` 아래 파일은 읽거나, 검사하거나, 요약하거나, 사용하지 않았습니다.

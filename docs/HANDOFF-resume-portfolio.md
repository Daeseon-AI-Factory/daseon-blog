# 핸드오프 — 이력서·포트폴리오 시스템 (Claude → Codex)

> 작성 2026-07-15. daseon-blog repo 안에서 유대선(Jason)의 취업용 이력서·포트폴리오를
> 만드는 작업. 이 문서 = 다음 에이전트가 이어받는 지점. **모든 커밋 로컬만, 미푸시(ahead 13+).**

## 0. 지금 상태 한 줄
케이스 필름 5부작 + 데이터 기반 이력서(영문 ATS PDF·한국 노션풍·한국 토스풍) + 당근 지원용
기여 매핑까지 **로컬에 완성·커밋됨**. **아직 배포(git push) 안 함.** 다음 큰 덩어리 =
개인 서비스(Talkak·Mimi·DocVault) 카드를 '실물 증거'로 승격 + 당근 자소서.

## 1. 무엇을 만들었나 (전부 로컬 커밋, `git log` 참조)

### 포트폴리오 = 케이스 필름 (SK AX 업무를 애니메이션으로)
- 라우트: `/portfolio` — `app/(public)/portfolio/page.tsx`
- 엔진: `components/casefilm/{primitives.tsx, player.tsx}` (framer-motion + @number-flow/react)
- 5편: `components/casefilm/cases/{erp-mes,gateway,payload-413,row-level-lock,costing}.tsx`
- 각 편 = 장면 스텝(SETUP→BEFORE→FAILURE→DECISION→AFTER→PEOPLE→IMPACT) before/after 다이어그램.
  IntersectionObserver로 뷰 진입 시 자동재생. IMPACT에서 number-flow 숫자 롤링 + faangforge 딥다이브 링크.
- **사실 원천**: 이력서 PDF + `~/GitHub/ai-product/ds-forge/SKAX/*.md` (STAR 노트). 숫자 충돌 시 이력서 우선.
  협업 기록 없는 편(row-lock)은 PEOPLE 장면 없음 — **날조 금지 원칙**.
- mp4/GIF 렌더: `scripts/capture-films.mjs` (headless Chrome 무대 캡처 ~24fps) → ffmpeg.
  산출물은 `~/Downloads/case0N-film.{mp4,gif}` + `public/films/` (gitignore됨).

### 이력서 = 데이터 1개 → 여러 표면 (핵심 설계)
- **단일 원본**: `lib/resumeData.ts` (영문, 2026-06-24 PDF 원문) / `lib/resumeDataKo.ts` (한국어, 숫자 동일)
- **영문 ATS**: `/resume` (`app/(public)/resume/page.tsx`) → `scripts/build-resume-pdf.mjs`로 1페이지 PDF.
  전화번호는 `RESUME_PHONE` env로만 주입(공개 repo 미반입). 검증: pdfinfo 1p, pdftotext 추출 OK.
- **한국 노션풍**: `/ko/resume` — 커버·속성테이블·콜아웃·파스텔 태그·토글(안에 케이스 필름 GIF 재생).
- **한국 토스풍 (본선)**: `/ko/resume/toss` — Pretendard(CDN), 검정 모노톤, "숫자로 보는 6년" 스탯 카드 6장,
  여백 구획. → `scripts/build-ko-resume-pdf.mjs`로 A4 PDF(`~/Downloads/유대선_이력서_토스풍.pdf`, 3p).
- **지원사별 기여 매핑 오버레이**: `lib/resumeTargets.ts` + `/ko/resume/toss?target=karrot`.
  스탯 카드 다음/경력 앞에 "이 회사에 이렇게 기여합니다" 섹션(공고 니즈→케이스, 정직 갭 명시).
  현재 `karrot`(당근 Local Jobs) 하나 있음.

## 2. 확정된 결정 (되돌리지 말 것)
- **한국 본선 = 토스풍**, 노션풍은 보조(안 클릭하는 독자용). 영문 ATS PDF는 북미용 별개.
- **포인트 컬러 검정 모노톤** (토스 본인 지원 리스크 회피 + 숫자가 주인공).
- **이력서 링크는 상대경로**(`/portfolio`) — 로컬·프로덕션 양립. 외부(faangforge·GitHub)만 절대경로.
- **순서 원칙 = 증거(숫자)→매핑(주장)→이력(확인)**. 매핑을 맨 위 맨몸으로 두지 말 것(주제넘음).
- **개인 서비스는 다이어그램 아니라 실물로** (아래 3번). 업무 케이스만 다이어그램(못 보여주니까).
- **정직 계약**: 상태 있는 그대로(개발중은 개발중), 회사 니즈·수치 날조 금지.

## 3. 다음 할 일 (미완, 우선순위)
1. **개인 서비스 카드 승격** — 현재 `/ko/resume/toss`의 "직접 만든 것들"은 텍스트 카드.
   → 라이브 데모 링크 + 실 UI 스크린샷/GIF + 위조불가 증거(DocVault 40명 사용 / Talkak=이 세션 / Mimi 라이브) + GitHub로.
   **필요 입력(Jason)**: 각 서비스 라이브 URL·공개 여부·GitHub 공개 여부. (URL 주면 스크린샷 캡처해 박기)
   daseon-blog엔 이미 `content/projects/{en,ko}/*.mdx`(url 필수) 시스템 있음 — 연계 검토.
2. **당근 자소서** — 자유양식/문항 여부 미확인. 문화 매칭(창업자·AI제품·전직군·데이터)은 사실이라 초안 가능,
   단 "왜 당근"(진짜 동기)은 Jason만 채울 수 있음. `lib/resumeTargets.ts`의 karrot 매핑 재사용.
3. **GraphQL 갭** — 당근 헤드라인 기술인데 경험 0(공고상 '더 좋아요' 가산점). 권장: Mimi/DocVault 위에
   작은 GraphQL 레이어(스키마+리졸버+DataLoader N+1) 만들어 갭→증거 전환. 미착수.
4. **사이트 네비 연결** — `/ko/resume/toss`·`/resume`·`/portfolio`가 헤더/About에서 미링크(고아 라우트).
5. **모바일 육안 미확정** — 코드는 반응형(grid-cols-2 sm:3, flex-wrap). 브라우저 리사이즈가 스크린샷에
   미반영이라 실기기 확인 필요. `public/phone-preview.html`(gitignore)에 390px 아이폰 프레임 프리뷰 있음.
6. **배포** — `git push` 시 daeseon.ai에 라이브. 결정 필요: 필름 GIF(~9MB) repo 포함 여부(현재 gitignore).

## 4. 실행/검증 명령
```bash
npm run dev                       # :3000
npm run build                     # 프로덕션 (배포 전 필수) — dev와 동시 실행 금지(.next 캐시 충돌 사고 전력)
node scripts/build-resume-pdf.mjs      # 영문 ATS PDF (RESUME_PHONE env로 전화번호)
node scripts/build-ko-resume-pdf.mjs   # 토스풍 한국 PDF
node scripts/capture-films.mjs         # 필름 프레임 캡처(→ ffmpeg 인코딩, 스크립트 헤더 참조)
```
- 로컬 확인 시 "안 보임" 나오면: ① dev 서버 응답 지연(재시작) ② 옛 PWA 서비스워커 하이재킹(`getRegistrations().unregister()` + caches 삭제 + 하드리로드) — 둘 다 이번 세션 실제 사고.

## 5. 함정(이번 세션 실제로 밟음)
- framer-motion이 애니메이션하는 엘리먼트에 Tailwind translate 주면 덮어씀 → 포지셔닝은 래퍼 div로.
- 장면 상태 불리언은 `scenes.length-1`에서 유도(복사한 리터럴 `s===6` 쓰면 6장면 필름 결말 안 뜸).
- `mdls` 페이지 수는 Spotlight 캐시라 재생성 PDF에 거짓말 → `pdfinfo` 신뢰.
- ECharts visualMap은 기본 마지막 차원으로 색 매김(asset_manage 쪽 교훈).

## 6. 관련 위치
- 이력 사실 원천: `~/GitHub/ai-product/ds-forge/SKAX/*.md`, 이력서 PDF(`DaeseonYoo_Resume.pdf` 여러 사본 — 6/29판이 최신, 단일화 미완).
- faangforge 딥다이브(라이브): https://faangforge.daeseon.ai/story/{erp-mes,gateway,payload-413,row-level-lock,costing,...}
- 당근 Local Jobs 공고 원문: 이 세션 대화에 붙여져 있음(자소서·매핑 근거).

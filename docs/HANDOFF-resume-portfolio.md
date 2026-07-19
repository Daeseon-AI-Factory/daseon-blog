# 핸드오프 — 이력서·포트폴리오 시스템

> 작성 2026-07-15. daseon-blog repo 안에서 유대선(Jason)의 취업용 이력서·포트폴리오를
> 만드는 작업. 이 문서 = 다음 에이전트가 이어받는 지점. 기존 커밋은 로컬만 미푸시 상태이고,
> 2026-07-15 범용 한국 서비스기업판 후속 변경은 아직 미커밋 상태다.

## 0. 지금 상태 한 줄
한국 서비스기업 본선은 **2쪽 제출용 PDF + 증거 전용 한국어 웹 포트폴리오**로 재설계했다.
PDF 1쪽은 대표 결과와 경력, 2쪽은 Mimi·DocVault·추가 성과·기술·학력이다. `/ko/portfolio`는
Talkak·Mimi·DocVault 실제 화면과 대표 운영 사례 3개를 먼저 보여주고, 영문 `/portfolio`는 기존
5개 케이스 필름 아카이브를 유지한다. **아직 커밋·push·배포하지 않았다.**

## 1. 무엇을 만들었나 (전부 로컬 커밋, `git log` 참조)

### 포트폴리오 = 케이스 필름 (SK AX 업무를 애니메이션으로)
- 라우트: `/portfolio`, `/ko/portfolio` — 공용 `components/casefilm/portfolio-showcase.tsx`
- 엔진: `components/casefilm/{primitives.tsx, player.tsx}` (framer-motion + @number-flow/react)
- 영문은 5편 전체, 한국어는 대표 3편(ERP↔MES·행 잠금·HTTP 413)과 나머지 2편의 긴 글 링크.
- 5편 원본: `components/casefilm/cases/{erp-mes,gateway,payload-413,row-level-lock,costing}.tsx`
- 각 편 = 장면 스텝(SETUP→BEFORE→FAILURE→DECISION→AFTER→PEOPLE→IMPACT) before/after 다이어그램.
  IntersectionObserver로 뷰 진입 시 자동재생. IMPACT에서 number-flow 숫자 롤링 + faangforge 딥다이브 링크.
- **사실 원천**: 이력서 PDF + `~/GitHub/ai-product/ds-forge/SKAX/*.md` (STAR 노트). 숫자 충돌 시 이력서 우선.
  협업 기록 없는 편(row-lock)은 PEOPLE 장면 없음 — **날조 금지 원칙**.
- mp4/GIF 렌더: `scripts/capture-films.mjs` (headless Chrome 무대 캡처 ~24fps) → ffmpeg.
  산출물은 `~/Downloads/case0N-film.{mp4,gif}` + `public/films/` (gitignore됨).

### 이력서 = 언어별 데이터 → 여러 표면 (핵심 설계)
- **언어별 원본**: `lib/resumeData.ts`(영문) / `lib/resumeDataKo.ts`(한국어). 두 파일은 독립 객체이므로
  수치·기간을 바꿀 때 교차 검사가 필요하다.
- **영문 ATS**: `/resume` (`app/(public)/resume/page.tsx`) → `scripts/build-resume-pdf.mjs`로 1페이지 PDF.
  전화번호는 `RESUME_PHONE` env로만 주입(공개 repo 미반입). 검증: pdfinfo 1p, pdftotext 추출 OK.
- **한국 노션풍**: `/ko/resume` — 커버·속성테이블·콜아웃·파스텔 태그·토글(안에 케이스 필름 GIF 재생).
- **한국 서비스기업 본선**: `/ko/resume/toss` — 검정 모노톤 고정 A4 2쪽. 1쪽은 정체성·대표 결과 3개·
  SK AX 핵심 5개·Dure Info, 2쪽은 Mimi·DocVault·추가 성과 2개·검증된 기술·학력·포트폴리오 CTA.
  생성기는 `scripts/build-ko-resume-pdf.mjs`, 작업공간 제출본은
  `output/pdf/유대선_이력서_서비스기업_2p.pdf`, 복사본은
  `~/Downloads/유대선_이력서_서비스기업_2p.pdf`.
- PDF 생성기는 로컬 렌더 origin과 제출 링크 origin을 분리한다. 제출본은 `--base-url https://daeseon.ai` 필수.
- **지원사별 기여 매핑 오버레이**: `lib/resumeTargets.ts` + `/ko/resume/toss?target=karrot`.
  스탯 카드 다음/경력 앞에 "이 회사에 이렇게 기여합니다" 섹션(공고 니즈→케이스, 정직 갭 명시).
  현재 `karrot`(당근 Local Jobs) 하나 있음.

## 2. 확정된 결정 (되돌리지 말 것)
- **한국 본선 = 2쪽 제출 문서 + 증거 웹**, 노션풍은 보조. 영문 ATS PDF는 북미용 별개.
- **포인트 컬러 검정 모노톤** (토스 본인 지원 리스크 회피 + 숫자가 주인공).
- **이력서 링크는 상대경로**(`/ko/portfolio`) — 로컬·프로덕션 양립. PDF 생성 단계에서만 공개 origin으로 변환.
- **PDF 순서 = 대표 결과→경력→개인 제품→추가 성과→기술·학력**. 지원사 매핑은 화면에서만 노출하고
  범용 PDF의 2쪽 구조를 깨지 않는다.
- **개인 서비스는 다이어그램 아니라 실물로** (아래 3번). 업무 케이스만 다이어그램(못 보여주니까).
- **정직 계약**: 상태 있는 그대로(개발중은 개발중), 회사 니즈·수치 날조 금지.

## 3. 다음 할 일 (미완, 우선순위)
1. **모바일 실물 검증** — 390px 인앱 브라우저 백엔드가 이번 세션에서 `[]`라 실제 렌더를 확인하지 못했다.
   브라우저가 연결되면 `/ko/resume/toss`와 `/ko/portfolio`의 가로 넘침·터치 타깃·필름 무대를 확인한다.
2. **DocVault 40인 범위 확인** — 프로젝트 문서의 "40인 팀 실사용"과 "첫 실제 고객 PC 설치는 추가 검증 필요"가
   함께 있어 범위가 불명확하다. 본선과 영문 이력서에서는 제거했다. 계정/설치/운영 중 무엇을 뜻하는지와
   독립 증거를 확인한 뒤 복구 여부를 결정한다.
3. **당근 자소서** — 자유양식/문항 여부 미확인. 문화 매칭(창업자·AI제품·전직군·데이터)은 사실이라 초안 가능,
   단 "왜 당근"(진짜 동기)은 Jason만 채울 수 있음. `lib/resumeTargets.ts`의 karrot 매핑 재사용.
4. **GraphQL 갭** — 당근 헤드라인 기술인데 경험 0(공고상 '더 좋아요' 가산점). 권장: Mimi/DocVault 위에
   작은 GraphQL 레이어(스키마+리졸버+DataLoader N+1) 만들어 갭→증거 전환. 미착수.
5. **배포** — 본선은 tracked JPG를 사용해 ignored GIF에 의존하지 않는다. 노션풍 `/ko/resume`만
   `/films/*.gif`를 참조하므로 그 보조 라우트를 배포할 때 GIF 전달 방식을 별도로 결정한다. 2026-07-15
   현재 공개 `https://daeseon.ai/ko/portfolio`와 `/portfolio`는 `www` 리다이렉트 뒤 404이므로,
   새 PDF는 한국어 포트폴리오 배포·공개 URL 재확인 전 제출하지 않는다.
6. **제출 전 실전 검증** — 실제 지원 사이트 ATS 업로드·텍스트 파싱과 채용자 10초 스캔은 아직 측정하지 않았다.
   PDF 내부 구조와 렌더만 통과한 상태이므로, 첫 제출 전에 대표 ATS 한 곳에서 업로드 결과를 확인한다.

## 4. 실행/검증 명령
```bash
npm run dev                       # :3000
npm run build                     # 프로덕션 (배포 전 필수) — dev와 동시 실행 금지(.next 캐시 충돌 사고 전력)
node scripts/build-resume-pdf.mjs      # 영문 ATS PDF (RESUME_PHONE env로 전화번호)
node scripts/build-ko-resume-pdf.mjs --base-url https://daeseon.ai --output ./resume-ko.pdf
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

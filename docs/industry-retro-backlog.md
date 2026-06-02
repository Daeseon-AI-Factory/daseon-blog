# Industry retro backlog

회고 글 후보. 한 줄씩 surface, 시간 무관, 인상 강한 순서. 본인이 더 떠올리면 위에 그냥 추가.

`docs/` 안에 있으므로 사이트 surface에 노출되지 않음. repo 안에서 본인 + GitHub viewer로만 보임.

## Surfaced (작성 대기)

(전부 초안 발행됨 — 아래 Shipped. 본인이 더 떠올리면 여기 추가)

## Drafted (작성 중)

(없음)

## Shipped (발행됨)

2026-06-02, AI 초안 9개 EN+KO 동시 발행 (handwritten 미설정 = AI 작성). 본인 검수·수정 대기. translationKey = slug. tag: `industry-retro` + 토픽 태그 1개. URL: `daeseon.ai/posts/tag/industry-retro`.

- [x] **Production SELECT lock** → `production-select-lock` (strong) — 검증 안 된 20K row SELECT, 라이브러리 캐시 락, 해외 공장 설비 stop, 자기 세션 인지에 15-20분.
- [x] **SSL/TLS 인증서 미갱신** → `expired-tls-certificate` (strong) — 검증 단계서 "mutually authenticated"(mTLS) 보안 디테일 누출 잡아 제거함.
- [x] **UI 저장 버튼 컬럼 인덱스 박힘** → `hardcoded-column-index` (strong) — positional index vs stable field key.
- [x] **설비 통신 모드 변경** (push → request-response) → `equipment-protocol-change` (thin — 한 failure mode 평탄 서술, 숫자/탐지 디테일 없음) — 계약 변경 양쪽 미조율.
- [x] **폐쇄망 안드로이드 빌드** → `closed-network-android-build` (medium).
- [x] **PDA FA망 접속** → `device-onto-locked-network` (medium) — ⚠️ 원본에 MAC예외→고정IP→방화벽→SSID 인증 *순서 런북*(보안 메커니즘 누출) 있었음 → "독립된 접근 제어 계층 여러 개"로 추상화. fingerprint 위험 제거.
- [x] **SOTI MDM** → `mdm-locked-down-devices` (**thin — 사건 아니라 셋업 작업, 첫판에 됨. 잘라낼 후보**).
- [x] **ERP 트랜잭션 인터페이스** → `erp-interface-false-success` (strong) — 플래그 = "요청 보냄" 시점, idempotent 로깅 부재.
- [x] **"내 로컬/dev에선 됩니다"** → `works-on-my-machine-no-staging` (medium) — staging 부재, 환경 parity.

cut 후보: `mdm-locked-down-devices` (thin, 셋업 작업). 검수 후 약하면 파일 삭제.

---

## Voice / 작성 규칙 (까먹지 말 것)

- **담담한 기록** — *이런 게 있었다* 5-10 문장. 끝.
- 깨달음·교훈 coda 안 적음. *"I learned that..."* 절대 금지.
- 산업 표준 어휘 (SCADA, ISA-95, DAQ, "primitive obsession", "supply chain hardening" 등) puffery 안 함. 일반 명사로 충분.
- 시스템 구조는 boxes-and-arrows in prose ("A → B → C"). 도메인 어휘 박을 필요 X.
- 분노/짜증은 *증발한 후 남은 평탄한 묘사*로. 분노 그 자체를 쓰지 말고, 분노가 본인 안에서 가라앉은 다음 남은 사실만.

## Fingerprint 체크리스트 (발행 전 매번)

- [ ] 회사명 (SK AX / SK 계열사 어떤 형태로든) 안 나옴
- [ ] 고객사명 직접·간접 안 나옴 (산업 archetype까지만)
- [ ] 내부 제품·시스템·코드명 → 카테고리("MES", "원가 관리 시스템")로 abstracted
- [ ] 정확한 수치 → 자리수만
- [ ] 기술 스택 → 공개 기술만 (Spring/Oracle OK / 자사 내부 라이브러리 OUT)
- [ ] 아키텍처 → 패턴명만 / 실제 토폴로지·서버 사양 OUT
- [ ] 보안 메커니즘 전체 OUT
- [ ] 사람 이름 → 역할만 ("PM", "DBA")
- [ ] Fingerprint 테스트: 옛 동료가 어떤 프로젝트인지 알아볼 수 있나? Yes → 더 abstract
- [ ] Resume floor: 이력서보다 더 구체적인 디테일 있나? 있으면 stop

## 면접 prep과의 분리

같은 사건의 STAR 버전 (lessons learned 포함, "I learned two things..." 형태) 은 **private 노트**에. 블로그엔 안 옮김. 같은 사건, 다른 가공.

## Frontmatter 템플릿 (각 글 작성 시)

```yaml
---
title: "구체적 한 줄"
description: "1-2 문장 요약"
date: "YYYY-MM-DD"
language: "en"
format: "before-after"
handwritten: true
tags: ["industry-retro"]
---
```

본인이 직접 쓴 거면 `handwritten: true`. URL: `daeseon.ai/posts/tag/industry-retro`로 자동 집계.

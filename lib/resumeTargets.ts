/** 지원 회사별 기여 매핑 오버레이 — 베이스 이력서(resumeDataKo)는 회사 무관,
 *  지원할 때 이 오버레이를 얹는다. 각 매핑은 회사의 '실제 공고 문구' → 유대선의
 *  '실제 케이스'를 잇는다. 회사 니즈를 지어내지 않는다 — 전부 공고 원문에서 인용.
 *  캡션 끝의 caseFilm은 /portfolio#case-0N 앵커(주장→아래 경력에서 확인). */

export interface Contribution {
  need: string; // 공고 원문에서 온 그들의 니즈
  how: string; // 내가 실제로 한 것 (case 기반, 날조 금지)
  film?: string; // case-0N (증거 링크)
}

export interface ResumeTarget {
  company: string;
  team: string;
  headline: string;
  contributions: Contribution[];
  honestGap: string; // 정직: 직접 경험 없는 부분 + 왜 전이 가능한지
}

export const RESUME_TARGETS: Record<string, ResumeTarget> = {
  karrot: {
    company: "당근",
    team: "Local Jobs · 백엔드",
    headline: "동네 이웃을 안전하게 잇는 일 — 제가 6년간 지킨 건 정확히 '연결이 실패해도 상태가 무너지지 않게'였습니다.",
    contributions: [
      {
        need: "초당 수천 요청·메시지 트래픽을 Event-Driven으로 안정 처리",
        how: "외부 호출을 메인 트랜잭션 밖으로 빼 스테이징+배치 워커로 처리했습니다. Mimi에서는 AFTER_COMMIT·bounded @Async로 LLM 호출을 DB 트랜잭션 밖에서 실행하고 상태 기록만 짧은 트랜잭션으로 남겼습니다.",
        film: "case-01",
      },
      {
        need: "복잡한 인프라의 동시성 이슈 · 지연 시간 최적화",
        how: "다중 인스턴스 ID 충돌을 오늘 날짜 행만 잠그는 FOR UPDATE로 해결하고, 잠금 구간을 원자적 UPDATE 한 문장으로 축소했습니다.",
        film: "case-04",
      },
      {
        need: "Microservice 간 연결 · Downtime 없는 안정성",
        how: "MES↔ERP 연동을 재설계해 ERP 장애가 MES 핵심 상태를 롤백하지 못하도록 경계를 분리했습니다. 서버 간 중복 실행은 분산 락으로 제거했습니다.",
        film: "case-01",
      },
      {
        need: "GraphQL을 유연하고 강력한 '인터페이스'로 설계",
        how: "46개 미들웨어 엔드포인트를 리플렉션 디스패처 기반 공통 API로 통합해 사이트별 변경 범위를 줄였습니다.",
        film: "case-02",
      },
    ],
    honestGap:
      "GraphQL과 초당 수천 QPS의 소비자 트래픽은 직접 운영한 경험이 아닙니다. 제조 시스템에서 외부 연동, 동시성 제어, 중복 실행을 다뤘지만 트래픽 규모와 제품 도메인은 다릅니다.",
  },
};

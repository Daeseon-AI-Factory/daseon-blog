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
        how: "외부 호출을 메인 트랜잭션 밖으로 빼 스테이징+배치 워커로 비동기 처리(아웃박스). 별도 프로젝트에선 AFTER_COMMIT·bounded @Async로 커넥션 풀 고갈까지 제거.",
        film: "case-01",
      },
      {
        need: "복잡한 인프라의 동시성 이슈 · 지연 시간 최적화",
        how: "다중 인스턴스 ID 충돌을 오늘 날짜 행만 잠그는 FOR UPDATE로 해결하고, 잠금 시간을 원자적 UPDATE 한 문장으로 축소 — 정확성과 지연을 동시에.",
        film: "case-04",
      },
      {
        need: "Microservice 간 연결 · Downtime 없는 안정성",
        how: "MES↔ERP 연동을 재설계 — 한 시스템의 장애가 다른 시스템의 핵심 상태를 롤백하지 못하게 경계를 절단. 서버 간 중복 실행은 분산 락으로 제거.",
        film: "case-01",
      },
      {
        need: "GraphQL을 유연하고 강력한 '인터페이스'로 설계",
        how: "46개 미들웨어 엔드포인트를 리플렉션 디스패처 단일 인터페이스로 통합 — 레거시가 바뀌어도 인터페이스는 그대로. '엔드포인트가 아닌 인터페이스로' 사고한 경험.",
        film: "case-02",
      },
    ],
    honestGap:
      "GraphQL과 소비자 스케일(초당 수천 QPS) 트래픽은 직접 운영 경험이 아닙니다 — 제 동시성은 정확성이 생명인 제조 현장이었지, 대규모 소비자 트래픽은 아니었어요. 다만 그 아래의 엔진(이벤트 드리븐·동시성 제어·무중단·서비스 간 신뢰성)은 6년간 매일 풀던 문제입니다. 도메인은 새롭지만 엔진은 같고, GraphQL은 빠르게 익힐 준비가 돼 있습니다.",
  },
};

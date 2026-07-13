/** 한국용 이력서 데이터 — 사실·숫자는 영문 resumeData.ts(=2026-06-24 PDF)와
 *  동일, 문장만 한국어. 노션풍 /ko/resume 페이지가 이 파일에서 생성된다. */

export interface KoBullet {
  text: string;
  filmId?: string; // /portfolio#case-0N + /films/case0N-film.gif
  deepDive?: string; // faangforge slug
  toggle?: string; // 토글 안 한 줄 부연
}

export const TAG_COLORS = [
  "#fadec9", // orange
  "#dbeddb", // green
  "#d3e5ef", // blue
  "#e8deee", // purple
  "#fdecc8", // yellow
  "#ffe2dd", // red
  "#eee0da", // brown
  "#f5e0e9", // pink
] as const;

export const RESUME_KO = {
  name: "유대선",
  emoji: "⚙️",
  title: "Backend Engineer",
  tagline: "트랜잭션 무결성 · 동시성 제어 · 시스템 신뢰성 — 제조 현장의 데이터 무결성을 6년간 지켰습니다.",
  properties: [
    { icon: "🌍", label: "위치", value: "Toronto, ON (캐나다 취업 가능)" },
    { icon: "✉️", label: "이메일", value: "showep12@gmail.com", href: "mailto:showep12@gmail.com" },
    { icon: "🐙", label: "GitHub", value: "Daeseon-AI-Factory", href: "https://github.com/Daeseon-AI-Factory" },
    { icon: "📝", label: "블로그", value: "daeseon.ai", href: "https://daeseon.ai" },
    { icon: "🎬", label: "케이스 필름", value: "daeseon.ai/portfolio", href: "https://daeseon.ai/portfolio" },
  ],
  callout:
    "글로벌 제조(EV 배터리) 환경에서 데이터가 무거운 엔터프라이즈 시스템을 설계·운영한 6년차 백엔드 엔지니어입니다. 지금은 그 장애 내성 패턴(비동기 워크플로우·재시도/백오프·상태머신)을 AI 애플리케이션 인프라에 적용하고 있습니다. 아래 경력의 ▶ 필름을 누르면 각 문제를 before/after 애니메이션으로 볼 수 있습니다.",
  skillGroups: [
    { group: "언어", tags: ["Python", "Java", "Go", "TypeScript", "C#", "SQL"] },
    { group: "백엔드", tags: ["Spring Boot", "FastAPI", ".NET", "JPA", "MyBatis", "REST", "gRPC"] },
    { group: "데이터·메시징", tags: ["PostgreSQL", "Oracle", "Redis", "Kafka", "RabbitMQ", "SQL 튜닝"] },
    { group: "인프라·테스트", tags: ["Docker", "AWS", "GitHub Actions", "Terraform", "k6", "Testcontainers", "Playwright"] },
    { group: "AI", tags: ["LLM API", "RAG", "임베딩", "벡터 검색", "function calling", "MCP"] },
  ],
  experience: [
    {
      company: "SK AX",
      role: "Software Engineer",
      period: "2021.09 – 2026.05",
      summary: "EV 배터리 제조 시스템(MES·WMS·코스팅)의 백엔드 — 트랜잭션·동시성·연동이 매일의 전장",
      bullets: [
        {
          text: "MES↔ERP 연동의 트랜잭션 경계를 스테이징 테이블 + 배치 워커 구조로 재설계 — 평균 처리시간 60% 단축, 월 ~20건 수동 재처리를 0에 수렴시킴",
          filmId: "case-01",
          deepDive: "erp-mes",
          toggle: "외부 시스템(ERP)의 실패가 내 시스템(MES)의 완공 기록까지 롤백시키던 구조를 절단 — LOT 번호를 멱등키로, 실패는 재시도≤3 + 백로그 UI로.",
        },
        {
          text: "미들웨어 엔드포인트 46개를 리플렉션 기반 단일 공통 API로 통합, 8개 사이트 배포 — 미들웨어 전담 1 FTE 확보, 출시 후 미들웨어 장애 0건",
          filmId: "case-02",
          deepDive: "gateway",
          toggle: "시니어의 보안 우려에 PoC(7개 API·3개 화면·재배포 0으로 신규 2개 추가)로 답했고, 그가 rate limiter를 얹어 방어를 완성 — 건강한 반박의 케이스.",
        },
        {
          text: "모바일 스캔 HTTP 413을 인프라 변경 없이 해결 — 전체 상태 대신 PK만 전송 + 서버측 최신 조회로 배치 30 → 80, 재고 정확성 유지",
          filmId: "case-03",
          deepDive: "payload-413",
          toggle: "공유 서버의 한도 증설(쉬운 수선)을 기각 — 낡은 클라이언트 데이터가 저장되던 숨은 버그까지 함께 제거.",
        },
        {
          text: "다중 인스턴스 환경의 LOT ID 중복 발급을 Oracle 행 단위 잠금(FOR UPDATE)으로 해결 — 데이터 이상·생산 라인 중단 방지",
          filmId: "case-04",
          deepDive: "row-level-lock",
          toggle: "오늘 날짜 행 하나만 잠그고, 잠금 시간을 원자적 UPDATE 한 문장으로 축소 — 테이블 전체 직렬화 없이 유일성 확보.",
        },
        {
          text: "7.7K줄 PL/SQL 모놀리스 쿼리를 공정별 CTE로 리팩토링 — 코드 57% 감축, 5개 하위 공정 분리, 주간 원가 티켓 처리량 4 → 7건",
          filmId: "case-05",
          deepDive: "costing",
          toggle: "신뢰가 무너진 프로젝트에 테크리드로 합류 — 요청 창구 단일화(anchor)·셀프서비스 페이지 후 리팩토링, 매 변경을 고객과 검증. 7개월차에 고객사 공식 감사 서신.",
        },
        {
          text: "분산 락(ShedLock/job_lock)으로 서버 간 중복 실행 제거, 스케줄러-실행을 @Async로 분리해 월말 플랜트 마감 작업을 병렬화",
          deepDive: "distributed-lock",
        },
        {
          text: "사이트별 로직을 하드코딩 분기 없이 동적 디스패치하는 다형성 구조 구현 — 중앙 인력 증원 없이 8개 플랜트로 확장",
          deepDive: "multi-plant",
        },
      ] as KoBullet[],
    },
    {
      company: "Dure Info",
      role: "Software Developer",
      period: "2020.06 – 2021.09",
      summary: "제조 현장 클라이언트(PC·PDA·키오스크)를 위한 .NET TCP 소켓 서버",
      bullets: [
        {
          text: "TCP 부분 수신을 위한 애플리케이션 레벨 메시지 프레이밍, 서버측 저장 프로시저 실행, DB 자격증명 격리를 구현 — 시스템 신뢰성 개선, 클라이언트 연결 오류 감소",
          deepDive: "dure-tcp",
        },
      ] as KoBullet[],
    },
  ],
  projects: [
    {
      name: "Talkak (딸깍)",
      emoji: "🖥️",
      tagline: "AI 에이전트 워크스페이스 + 운영 메모리 시스템",
      stack: ["Rust", "Tauri", "React", "tmux"],
      lines: [
        "tmux 세션으로 장수명 서브프로세스 상태를 React 리마운트·앱 내비게이션에서도 보존하는 데스크톱 프로세스 매니저",
        "작업·결정·증거·승인·검증 영수증을 담는 append-only 로컬 JSONL 이벤트/그래프 저장소",
      ],
    },
    {
      name: "Mimi",
      emoji: "🎧",
      tagline: "유튜브 클립 영어 쉐도잉 트레이너",
      stack: ["Spring Boot", "Next.js", "PostgreSQL", "AWS"],
      lines: [
        "Spring AFTER_COMMIT + bounded @Async로 LLM 호출을 DB 트랜잭션 밖으로 — 커넥션 풀 고갈 제거 (PENDING → READY/FAILED 상태머신)",
        "429/5xx에 대한 멀티 프로바이더 폴백 + 재시도/백오프 — 프로바이더 스로틀링을 워크플로우에서 격리",
      ],
    },
    {
      name: "DocVault",
      emoji: "🔐",
      tagline: "Windows 엔드포인트 감사 플랫폼 — 40인 팀이 실사용 중",
      stack: ["Go", "PostgreSQL", "Windows Agent"],
      lines: [
        "일회용 설치 토큰·하트비트·텔레메트리 자가진단을 갖춘 에이전트 온보딩",
        "osquery + PostgreSQL 해시체인 로그로 위변조 흔적이 남는 감사 워크플로우, RBAC 파일 볼트",
      ],
    },
  ],
  education: {
    school: "금오공과대학교",
    degree: "산업공학 학·석사",
    period: "2012.03 – 2019.02",
  },
} as const;

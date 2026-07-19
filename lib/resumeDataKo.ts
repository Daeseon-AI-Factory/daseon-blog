/** 한국어 이력서의 단일 데이터 원본.
 *  /ko/resume와 /ko/resume/toss가 이 파일을 공유한다.
 *  공개 링크와 수치는 저장소의 프로젝트 문서·영문 이력서 원천에 맞춘다. */

export interface KoBullet {
  label?: string;
  text: string;
  filmId?: string; // /portfolio#case-0N + /films/case0N-film.gif
  deepDive?: string; // faangforge slug
  toggle?: string; // 토글 안 한 줄 부연
}

export interface KoOutcome {
  value: string;
  label: string;
  filmId: string;
}

export interface KoProject {
  name: string;
  emoji: string;
  tagline: string;
  stack: readonly string[];
  signal: string;
  image: string;
  imageAlt: string;
  imageNote?: string;
  liveUrl: string;
  liveLabel: string;
  repoUrl?: string;
  detailPath: string;
  lines: readonly string[];
  showInResume: boolean;
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
  tagline: "외부 연동 실패와 중복 실행을 트랜잭션 경계·잠금·멱등성으로 해결해 왔습니다.",
  summary:
    "6년간 EV 배터리 제조 시스템의 백엔드를 설계·운영했습니다. 제조 현장에서 적용한 동시성·장애 격리 설계를 Mimi의 비동기 처리와 DocVault의 감사 로그로 확장했습니다.",
  links: {
    email: "mailto:showep12@gmail.com",
    linkedin: "https://www.linkedin.com/in/daeseon-yoo",
    github: "https://github.com/Daeseon-AI-Factory",
    portfolio: "/ko/portfolio",
  },
  properties: [
    { icon: "🌍", label: "위치", value: "Toronto, ON (캐나다 취업 가능)" },
    { icon: "✉️", label: "이메일", value: "showep12@gmail.com", href: "mailto:showep12@gmail.com" },
    { icon: "🐙", label: "GitHub", value: "Daeseon-AI-Factory", href: "https://github.com/Daeseon-AI-Factory" },
    { icon: "📝", label: "블로그", value: "daeseon.ai", href: "https://daeseon.ai" },
    { icon: "🎬", label: "케이스 필름", value: "daeseon.ai/portfolio", href: "https://daeseon.ai/portfolio" },
  ],
  callout:
    "트랜잭션 경계, 행 잠금, 분산 락으로 상태 정합성을 지켰고, 같은 원칙을 개인 제품의 비동기 상태 전이와 변조 추적 로그에 적용했습니다.",
  outcomes: [
    { value: "60% 단축 · 월 약 20건 → 거의 0", label: "외부 장애와 핵심 상태의 경계 분리", filmId: "case-01" },
    { value: "46 → 1 · 8개 사이트", label: "미들웨어 변경 표면 통합", filmId: "case-02" },
    { value: "30 → 80", label: "PK만 전송하고 최신 상태 재조회", filmId: "case-03" },
  ] as const satisfies readonly KoOutcome[],
  skillGroups: [
    { group: "언어", tags: ["Java", "C#", "Go", "TypeScript", "SQL"] },
    { group: "백엔드", tags: ["Spring Boot", ".NET", "JPA", "MyBatis", "REST"] },
    { group: "데이터", tags: ["Oracle", "PostgreSQL", "트랜잭션 설계", "SQL 튜닝"] },
    { group: "제품·운영", tags: ["Next.js", "Rust", "Tauri", "Docker", "AWS", "GitHub Actions"] },
  ],
  experience: [
    {
      company: "SK AX",
      role: "Software Engineer",
      period: "2021.09 - 2026.05",
      summary: "EV 배터리 제조 시스템(MES·WMS·원가)의 백엔드 설계·운영",
      bullets: [
        {
          label: "경계 분리",
          text: "MES↔ERP 연동을 스테이징 테이블과 배치 워커로 분리해 평균 처리시간을 60% 단축하고, 월 약 20건이던 수동 재처리를 거의 없앰",
          filmId: "case-01",
          deepDive: "erp-mes",
          toggle: "ERP 실패가 MES 완공 기록을 롤백하지 않도록 경계를 분리하고, LOT 번호를 멱등키로 사용해 실패 요청을 재처리.",
        },
        {
          label: "행 잠금",
          text: "다중 인스턴스에서 발생한 LOT ID 중복 발급을 Oracle 행 단위 잠금(FOR UPDATE)으로 해결해 ID 유일성을 보장하고 생산 라인 중단을 방지",
          filmId: "case-04",
          deepDive: "row-level-lock",
          toggle: "오늘 날짜의 카운터 행 하나만 잠그고, 잠금 구간을 원자적 UPDATE 한 문장으로 축소.",
        },
        {
          label: "중복 실행",
          text: "분산 락(ShedLock/job_lock)으로 서버 간 중복 실행을 제거하고, 스케줄러와 실행을 @Async로 분리해 월말 플랜트 마감 작업을 병렬화",
          deepDive: "distributed-lock",
        },
        {
          label: "입력 모델",
          text: "모바일 스캔 요청을 전체 상태 전송에서 PK 전송·서버 최신 조회로 바꿔 HTTP 413을 해결하고, 배치 크기를 30에서 80으로 높임",
          filmId: "case-03",
          deepDive: "payload-413",
          toggle: "공유 서버 한도 증설 대신 요청 모델을 줄여, 저장 시점에 낡은 클라이언트 상태가 반영되는 문제도 함께 제거.",
        },
        {
          label: "변경 표면",
          text: "미들웨어 엔드포인트 46개를 리플렉션 기반 단일 공통 API로 통합해 8개 사이트에 배포하고, 재배포 의존성을 없애 미들웨어 전담 1 FTE를 확보",
          filmId: "case-02",
          deepDive: "gateway",
          toggle: "작은 PoC로 허용 범위를 검증한 뒤 rate limit을 추가하고 사이트별 호출을 공통 인터페이스로 통합.",
        },
        {
          label: "레거시 분해",
          text: "7.7K줄 PL/SQL 모놀리스 쿼리를 공정별 CTE로 리팩토링해 코드를 57% 줄이고, 주간 원가 티켓 처리량을 4건에서 7건으로 높임",
          filmId: "case-05",
          deepDive: "costing",
          toggle: "요청 창구와 검증 절차를 먼저 정리한 뒤 공정별로 분리하고, 변경마다 현업 사용자와 결과를 확인.",
        },
        {
          label: "멀티 사이트",
          text: "사이트별 로직을 하드코딩 분기 없이 동적 디스패치하는 다형성 구조로 구현해 중앙 인력 증원 없이 8개 플랜트로 확장",
          deepDive: "multi-plant",
        },
      ] as KoBullet[],
    },
    {
      company: "Dure Info",
      role: "Software Developer",
      period: "2020.06 - 2021.09",
      summary: "제조 현장 클라이언트(PC·PDA·키오스크)를 위한 .NET TCP 소켓 서버",
      bullets: [
        {
          label: "TCP 프로토콜",
          text: "TCP 부분 수신을 위한 애플리케이션 레벨 메시지 프레이밍, 서버측 저장 프로시저 실행, DB 자격증명 격리를 구현",
          deepDive: "dure-tcp",
        },
      ] as KoBullet[],
    },
  ],
  projects: [
    {
      name: "Talkak (딸깍)",
      emoji: "🖥️",
      tagline: "여러 AI·CLI 작업을 한 창에서 운영·승인·검증하는 macOS 앱",
      stack: ["Rust", "Tauri", "React", "tmux"],
      signal: "실제 macOS 앱 화면",
      image: "/images/projects/talkak.jpg",
      imageAlt: "Talkak macOS 대시보드 실제 화면",
      imageNote: undefined,
      liveUrl: "https://talkak.daeseon.ai/",
      liveLabel: "제품 보기",
      repoUrl: undefined,
      detailPath: "/ko/projects/talkak",
      showInResume: false,
      lines: [
        "tmux 세션으로 장수명 서브프로세스 상태를 React 리마운트·앱 내비게이션에서도 보존하는 데스크톱 프로세스 매니저",
        "작업·결정·증거·승인·검증 영수증을 담는 append-only 로컬 JSONL 이벤트/그래프 저장소",
      ],
    },
    {
      name: "Mimi",
      emoji: "🎧",
      tagline: "YouTube 클립을 영어 쉐도잉 훈련으로 바꾸는 iOS 앱",
      stack: ["Spring Boot", "Next.js", "PostgreSQL", "AWS"],
      signal: "iOS App Store 출시",
      image: "/images/projects/mimi.jpg",
      imageAlt: "Mimi iOS 앱의 쉐도잉 학습 화면",
      imageNote: undefined,
      liveUrl: "https://apps.apple.com/us/app/mimi-english-shadowing/id6780742714",
      liveLabel: "App Store",
      repoUrl: "https://github.com/Daeseon-AI-Factory/shadow-ai",
      detailPath: "/ko/projects/shadow-ai",
      showInResume: true,
      lines: [
        "Spring AFTER_COMMIT + bounded @Async로 LLM 호출을 DB 트랜잭션 밖에서 실행 - PENDING → READY/FAILED를 짧은 트랜잭션으로 기록",
        "429·5xx·timeout만 최대 3회 제한 재시도하고, 영구 실패는 즉시 중단",
      ],
    },
    {
      name: "DocVault",
      emoji: "🔐",
      tagline: "소규모 팀을 위한 Windows 엔드포인트 감사 플랫폼",
      stack: ["Go", "PostgreSQL", "Windows Agent"],
      signal: "PostgreSQL 트리거 감사 체인",
      image: "/images/projects/docvault.jpg",
      imageAlt: "DocVault 포트폴리오 데모 대시보드 화면",
      imageNote: "포트폴리오 데모 화면 · 표시 수치는 시드 데이터",
      liveUrl: "https://docvault.daeseon.ai",
      liveLabel: "로그인 화면",
      repoUrl: "https://github.com/Daeseon-AI-Factory/docvault",
      detailPath: "/ko/projects/docvault",
      showInResume: true,
      lines: [
        "일회용 설치 토큰·하트비트·텔레메트리 자가진단을 갖춘 에이전트 온보딩",
        "osquery + PostgreSQL 해시체인 로그로 위변조 흔적이 남는 감사 워크플로우, RBAC 파일 볼트",
      ],
    },
  ] as const satisfies readonly KoProject[],
  education: {
    school: "금오공과대학교",
    degree: "산업공학 학·석사",
    period: "2012.03 - 2019.02",
  },
} as const;

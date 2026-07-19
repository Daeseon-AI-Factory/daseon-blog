/** Resume as data — single source of truth.
 *  Facts are verbatim from DaeseonYoo_Resume.pdf (2026-06-24 revision).
 *  Every render surface (web /resume, generated PDF, 경력기술서) derives
 *  from this file. Edit HERE, then regenerate — never edit outputs.
 *  `phone` is injected only into the PDF build (never on the public web). */

export interface Bullet {
  text: string;
  filmId?: string; // /portfolio#case-0N anchor
  deepDive?: string; // faangforge slug
}

export const RESUME = {
  name: "Daeseon Yoo",
  title: "Software Engineer",
  authorization: "Authorized to work in Canada",
  location: "Toronto, ON",
  email: "showep12@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/daeseon-yoo",
    github: "https://github.com/Daeseon-AI-Factory",
    blog: "https://daeseon.ai",
    portfolio: "https://daeseon.ai/portfolio",
  },
  summary:
    "Backend Engineer with 6 years of experience designing and operating data-heavy enterprise systems in global manufacturing environments. Specialized in ensuring transaction integrity, concurrency control, and system reliability using Java, C#, and SQL. Currently applying production-grade fault tolerance—such as async workflows, retry/backoff, and state-machine execution—to build robust infrastructure for AI-enabled applications.",
  skills: [
    { group: "Languages", items: "Python, Java, Go, TypeScript, C#, SQL" },
    { group: "Backend", items: "Spring Boot, FastAPI, .NET, JPA, MyBatis, REST APIs, gRPC" },
    { group: "Frontend", items: "React, Next.js, Tailwind CSS" },
    {
      group: "Data, Search & Messaging",
      items: "PostgreSQL, Oracle, Redis, Kafka, RabbitMQ, SQL performance tuning",
    },
    {
      group: "Infra & Testing",
      items: "Docker, AWS, GitHub Actions, Terraform, k6, Testcontainers, Playwright, Vitest",
    },
    { group: "AI", items: "LLM APIs, RAG, embeddings, vector search, function calling, MCP" },
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "SK AX",
      period: "Sep. 2021 – May 2026",
      bullets: [
        {
          text: "Redesigned transaction boundaries between manufacturing operations and financial systems using a staging-table and batch-worker pattern, cutting processing time by 60% and reducing reprocessing from 20 monthly cases to near zero.",
          filmId: "case-01",
          deepDive: "erp-mes",
        },
        {
          text: "Eliminated cross-server duplicate execution with a distributed lock (ShedLock/job_lock table), and decoupled the scheduler from execution via @Async so both month-end plant-close jobs run in parallel.",
          deepDive: "distributed-lock",
        },
        {
          text: "Resolved duplicate ID generation across multi-instance manufacturing execution services by implementing Oracle row-level locks (FOR UPDATE), preventing data anomalies and manufacturing downtime.",
          filmId: "case-04",
          deepDive: "row-level-lock",
        },
        {
          text: "Consolidated 46 middleware endpoints into a single unified API using a reflection-based RPC dispatcher, deployed across 8 sites — freeing 1 FTE of middleware development by eliminating redeployments.",
          filmId: "case-02",
          deepDive: "gateway",
        },
        {
          text: "Resolved HTTP 413 failures in mobile scan flows without infrastructure changes by replacing full payload submissions with PK-only requests and server-side fresh-state retrieval, raising batch size from 30 to 80 while keeping inventory accurate.",
          filmId: "case-03",
          deepDive: "payload-413",
        },
        {
          text: "Implemented a polymorphic architecture to dynamically dispatch site-specific logic without hardcoded conditionals, scaling execution across 8 plants with no added central headcount.",
          deepDive: "multi-plant",
        },
        {
          text: "Refactored a 7.7K-line monolithic CASE-based PL/SQL query into per-process CTEs, reducing query size by 57%, isolating 5 sub-processes, and raising weekly cost-ledger ticket throughput from 4 to 7.",
          filmId: "case-05",
          deepDive: "costing",
        },
      ] as Bullet[],
    },
    {
      role: "Software Developer",
      company: "Dure Info",
      period: "Jun. 2020 – Sep. 2021",
      bullets: [
        {
          text: "Built and supported TCP socket server workflows for PC, PDA, and kiosk clients using .NET, with server-side stored procedure execution, DB credential isolation, and application-level message framing for partial TCP reads.",
          deepDive: "dure-tcp",
        },
      ] as Bullet[],
    },
  ],
  projects: [
    {
      name: "Talkak",
      tagline: "AI-agent workspace and operating-memory system",
      stack: "Rust · Tauri · React · tmux",
      bullets: [
        {
          text: "Developed a Tauri/Rust desktop process manager for AI/CLI workflows, using tmux sessions to preserve long-running subprocess state across React component remounts and app navigation.",
        },
        {
          text: "Built an append-only local JSONL event/graph store for work tracking, storing work items, actions, decisions, evidence, approvals, and verification receipts with project-scoped retrieval.",
        },
      ] as Bullet[],
    },
    {
      name: "Mimi",
      tagline: "YouTube-clip English shadowing trainer",
      stack: "Spring Boot · Next.js · PostgreSQL · AWS",
      bullets: [
        {
          text: "Built an event-driven async LLM pipeline using Spring AFTER_COMMIT and bounded @Async so provider calls run outside DB transactions, with short transactions recording PENDING to READY/FAILED states.",
        },
        {
          text: "Implemented multi-provider fallback with retry/backoff for 429/5xx failures, isolating provider throttling from workflows.",
        },
      ] as Bullet[],
    },
    {
      name: "DocVault",
      tagline: "Windows endpoint audit platform",
      stack: "Go · PostgreSQL · Windows Agent",
      bullets: [
        {
          text: "Built Windows agent onboarding with single-use install tokens, server-side token provisioning, automatic host-user mapping, heartbeat checks, and telemetry self-tests.",
        },
        {
          text: "Implemented tamper-evident endpoint audit workflows using osquery and custom endpoint telemetry, PostgreSQL hash-chained logs, RBAC file-vault access, alert rules, and admin views for offline, unassigned, and unverified PCs.",
        },
      ] as Bullet[],
    },
  ],
  education: {
    degree: "M.S. & B.S. Industrial Engineering",
    school: "Kumoh National Institute of Technology, South Korea",
    period: "Mar. 2012 – Feb. 2019",
  },
} as const;

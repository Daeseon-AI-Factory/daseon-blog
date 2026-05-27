import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { SocialGrid } from "@/components/SocialGrid";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "소개",
  description: `${SITE.author.nameKo} — ${SITE.author.roleKo}, ${SITE.author.locationKo}.`,
  alternates: { canonical: "/ko/about", languages: { en: "/about", ko: "/ko/about" } },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-paper-line py-6">
      <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
        {title}
      </h2>
      <div className="text-ink">{children}</div>
    </section>
  );
}

export default function AboutKO() {
  return (
    <>
      <Header locale="ko" currentPath="/ko/about" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Avatar size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
              {SITE.author.nameKo}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {SITE.author.roleKo} · {SITE.author.locationKo}
            </p>
            {SITE.author.available ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-paper-line bg-white px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                구직 중 · 원격 또는 토론토
              </p>
            ) : null}
          </div>
        </header>

        <p className="text-lg leading-relaxed text-ink">
          제조·물류·금융 분야의 미션크리티컬 엔터프라이즈 시스템을 5년 이상
          만들고 현대화해온 백엔드 엔지니어. 백엔드 로직, SQL/PL-SQL, 트랜잭션
          설계, 시스템 간 통합에 강합니다. 현재는 Java/Spring 백엔드 플랫폼과
          AI 보조 제품 엔지니어링에 집중 — 견고한 백엔드와 실제로 쓰이는 AI
          도구를 함께 만듭니다.
        </p>

        <Section title={t("ko", "about.currently")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>SK AX, 토론토 (2021.9 – 현재). Java/Spring + AI-assisted product engineering.</li>
            <li>Daeseon AI Factory를 만드는 중 — 제품을 빠르게 출시하기 위한 재사용 가능한 백엔드 + AI 코어.</li>
            <li>Senior / Staff 백엔드 또는 AI 엔지니어 포지션을 찾고 있습니다. 원격 또는 토론토 현지.</li>
            <li>
              지금 무엇을 하고 있는지는{" "}
              <Link href="/ko/now" className="text-accent underline">
                /now
              </Link>
              에 있습니다.
            </li>
          </ul>
        </Section>

        <Section title={t("ko", "about.previously")}>
          <ul className="space-y-4 text-[0.95rem]">
            <li>
              <p className="font-medium text-ink">SK AX · Software Engineer</p>
              <p className="text-xs text-ink-muted">2021.9 – 2026.5</p>
              <p className="mt-1 text-ink-muted">
                제조 원가 관리 시스템, 8개 사이트에 걸친 엔터프라이즈 모바일 웹
                플랫폼, 실시간 MES. Java/Spring 백엔드, Oracle PL/SQL, 재무
                시스템과의 트랜잭션 재설계.
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">Dure Info · Software Developer</p>
              <p className="text-xs text-ink-muted">2020.6 – 2021.9</p>
              <p className="mt-1 text-ink-muted">
                네트워크 패킷 단편화로 인한 데이터 손실 버그를 커스텀 버퍼링
                레이어(MemoryStream)와 애플리케이션 레벨 프로토콜 검증으로
                해결.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="주요 성과">
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>PL/SQL 원가 계산 코어를 ~7,000줄 → ~3,000줄로 리팩터. 주간 티켓 처리량 4 → 7.</li>
            <li>엔드포인트별 40개 미들웨어 API를 단일 게이트웨이로 통합. 연 $100K+ 운영 비용 절감.</li>
            <li>제조 운영과 재무 시스템 사이의 트랜잭션 경계를 staging-table + batch-worker 패턴으로 재설계. 처리 시간 -60%, 월 20건 재처리 → ~0건.</li>
            <li>멀티 인스턴스 환경에서 원가 계산 작업 중복을 막는 커스텀 DB 락 메커니즘 구현.</li>
            <li>실시간 MES 장비 메시지 처리를 4초 타임아웃 SLA에 맞게 최적화.</li>
          </ul>
        </Section>

        <Section title={t("ko", "about.writingAbout")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>LLM 시스템 패턴 — RAG, eval, tool use, agent loop (LangGraph).</li>
            <li>백엔드 시스템 — 트랜잭션 설계, 락, 시스템 간 통합.</li>
            <li>before / change / result / limit 형식의 프로젝트 회고.</li>
          </ul>
        </Section>

        <Section title={t("ko", "about.stack")}>
          <dl className="grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="text-ink-muted">언어</dt>
            <dd>Java, Python, SQL/PL-SQL, C#, TypeScript</dd>
            <dt className="text-ink-muted">백엔드</dt>
            <dd>Spring Boot, FastAPI, REST APIs, .NET</dd>
            <dt className="text-ink-muted">프론트</dt>
            <dd>Next.js, React</dd>
            <dt className="text-ink-muted">AI / LLM</dt>
            <dd>RAG, Agent Workflows, LangGraph, AI-assisted dev</dd>
            <dt className="text-ink-muted">DB</dt>
            <dd>PostgreSQL, MongoDB, Oracle</dd>
            <dt className="text-ink-muted">인프라</dt>
            <dd>Docker, Docker Compose, Git, Linux, AWS basics, CI/CD</dd>
          </dl>
        </Section>

        <Section title="학력">
          <p className="text-[0.95rem]">
            산업공학 석사 · 학사 — 금오공과대학교, 한국 구미 (2012–2019).
          </p>
        </Section>

        {SITE.author.hobbyKo || SITE.author.hobbyPhotos.length > 0 ? (
          <Section title="일 외에는">
            {SITE.author.hobbyKo ? (
              <p className="text-[0.95rem] text-ink">{SITE.author.hobbyKo}</p>
            ) : null}
            {SITE.author.hobbyPhotos.length > 0 ? (
              <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SITE.author.hobbyPhotos.map((p) => (
                  <li key={p.url}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.url}
                      alt={p.alt}
                      className="aspect-square w-full rounded-md border border-paper-line object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </Section>
        ) : null}

        <Section title={t("ko", "about.contact")}>
          <SocialGrid variant="footer" rssHref="/ko/feed.xml" />
          <p className="mt-3 text-sm text-ink-muted">
            가장 빠른 방법은 이메일:{" "}
            <a className="underline" href={`mailto:${SITE.author.email}`}>
              {SITE.author.email}
            </a>
          </p>
        </Section>
      </main>
      <Footer locale="ko" />
    </>
  );
}

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
          제조·물류·금융 분야의 복잡한 프로덕션 시스템을 6년간 현대화하며
          측정 가능한 결과를 만들어온 소프트웨어 엔지니어 — 처리 속도 60%
          단축, 월간 재처리 거의 0건, 7,700줄 핵심 쿼리 57% 축소. API·데이터
          레이어 설계, 트랜잭션 정합성, 분산 멀티서버 환경의 동시성에
          깊습니다. Java/Spring, C#/.NET, SQL/PL-SQL 사용. 현재 토론토에서
          Spring 서비스와 LLM 기반 개발자 도구를 만들고 있습니다.
        </p>

        <Section title={t("ko", "about.currently")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>SK AX(한국, 2021.9 – 2026.5)에서 약 5년 근무를 최근 마무리. 현재 토론토 거주.</li>
            <li>LLM 기반 개발자 도구 — TubeShadow, Talkak — 과 이 사이트를 Daeseon AI Factory 아래에서 제작 중.</li>
            <li>Senior 백엔드 또는 AI 엔지니어 포지션을 찾고 있습니다. 토론토 또는 원격.</li>
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
              <p className="font-medium text-ink">SK AX · Software Engineer · 한국</p>
              <p className="text-xs text-ink-muted">2021.9 – 2026.5</p>
              <p className="mt-1 text-ink-muted">
                제조 원가 관리, 8개 사이트에 걸친 엔터프라이즈 모바일 웹
                플랫폼, 실시간 MES. Java/Spring·JPA 백엔드, Oracle PL/SQL,
                제조·재무 시스템 간 트랜잭션 재설계.
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">Dure Info · Software Developer · 한국</p>
              <p className="text-xs text-ink-muted">2020.6 – 2021.9</p>
              <p className="mt-1 text-ink-muted">
                PC/PDA/Kiosk 클라이언트의 DB 접근을 중계하는 멀티 클라이언트
                TCP 소켓 서버(Windows Service). 부분 TCP 수신으로 인한 XML
                역직렬화 실패를 애플리케이션 레벨 메시지 프레이밍으로 해결 —
                구분자로 끝나는 완전한 메시지가 도착할 때까지 바이트를 버퍼링.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="주요 성과">
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>엔드포인트별 40개 미들웨어 API를 단일 리버스 프록시(리플렉션 기반 RPC 디스패처)로 통합, 8개 사이트 배포 — 엔드포인트별 재배포 제거로 약 1 FTE 절감.</li>
            <li>제조·재무 시스템 간 트랜잭션 경계를 staging-table + batch-worker 패턴으로 재설계. 처리 시간 −60%, 월 20건 재처리 → 거의 0건.</li>
            <li>7,700줄 모놀리식 CASE 기반 PL/SQL 쿼리를 프로세스별 CTE로 리팩터(−57%), 5개 서브프로세스를 격리해 변경 전파 차단. 주간 원가원장 처리량 4 → 7건.</li>
            <li>모바일 WMS 스캔의 HTTP 413 오류를 PK-only 페이로드 + 최신 상태 조회로 해결 — 인프라 변경 없음. 스캔 배치 크기 30 → 60, 재고 정확도 유지.</li>
            <li>분산 락(ShedLock / job_lock 테이블)으로 서버 간 중복 실행 제거, @Async로 스케줄러와 실행을 분리해 양 공장 마감을 병렬 안전 처리.</li>
            <li>멀티 인스턴스 MES의 중복 ID 생성을 Oracle 행 단위 락(FOR UPDATE)으로 방지, 데이터 이상·다운타임 제거.</li>
          </ul>
        </Section>

        <Section title={t("ko", "about.writingAbout")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>LLM 앱 패턴 — 비동기 분석 파이프라인, 프로바이더 추상화, 프롬프트 엔지니어링.</li>
            <li>백엔드 시스템 — 트랜잭션 설계, 락, 동시성, 시스템 간 통합.</li>
            <li>before / change / result / limit 형식의 프로젝트 회고.</li>
          </ul>
        </Section>

        <Section title={t("ko", "about.stack")}>
          <dl className="grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="text-ink-muted">언어</dt>
            <dd>Java, Python, SQL/PL-SQL, C#, TypeScript</dd>
            <dt className="text-ink-muted">백엔드</dt>
            <dd>Spring Boot, JPA, FastAPI, REST APIs, .NET</dd>
            <dt className="text-ink-muted">프론트</dt>
            <dd>Next.js, React</dd>
            <dt className="text-ink-muted">AI / LLM</dt>
            <dd>Claude &amp; Gemini API, prompt engineering, async LLM pipeline</dd>
            <dt className="text-ink-muted">DB</dt>
            <dd>PostgreSQL, Oracle</dd>
            <dt className="text-ink-muted">인프라</dt>
            <dd>Docker, Git, Linux, AWS, CI/CD (GitHub Actions), JUnit</dd>
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
            . 이력서:{" "}
            <a className="underline" href={SITE.author.resumeUrl} target="_blank" rel="noopener noreferrer">
              {SITE.author.resumeUrl}
            </a>
          </p>
        </Section>
      </main>
      <Footer locale="ko" />
    </>
  );
}

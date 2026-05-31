import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Avatar } from "@/components/Avatar";
import { SocialGrid } from "@/components/SocialGrid";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "About",
  description: `${SITE.author.name} — ${SITE.author.role}, ${SITE.author.location}.`,
  alternates: { canonical: "/about", languages: { en: "/about", ko: "/ko/about" } },
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

export default function AboutEN() {
  return (
    <>
      <Header locale="en" currentPath="/about" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <Avatar size="lg" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
              {SITE.author.name}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              {SITE.author.role} · {SITE.author.location}
            </p>
            {SITE.author.available ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-paper-line bg-white px-3 py-1 font-mono text-[0.7rem] uppercase tracking-widest text-ink-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                Open to roles · Remote or Toronto
              </p>
            ) : null}
          </div>
        </header>

        <p className="text-lg leading-relaxed text-ink">
          Software engineer with 6 years modernizing complex production systems
          across manufacturing, warehouse, and financial operations, and
          shipping measurable results: processing 60% faster, monthly
          reprocessing cut to near zero, a 7,700-line core query reduced 57%.
          Deep in API and data-layer design, transaction integrity, and
          concurrency across distributed multi-server systems — in Java/Spring,
          C#/.NET, and SQL/PL-SQL. Now in Toronto, building Spring services and
          LLM-powered developer tools.
        </p>

        <Section title={t("en", "about.currently")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>Recently wrapped up ~5 years at SK AX (Korea, Sep 2021 – May 2026). Now based in Toronto.</li>
            <li>Building LLM-powered developer tools — TubeShadow and Dalkkak — and this site, under the Daeseon AI Factory umbrella.</li>
            <li>Open to senior backend or AI engineer roles. Toronto or remote.</li>
            <li>
              What I&apos;m on right now lives at{" "}
              <Link href="/now" className="text-accent underline">
                /now
              </Link>
              .
            </li>
          </ul>
        </Section>

        <Section title={t("en", "about.previously")}>
          <ul className="space-y-4 text-[0.95rem]">
            <li>
              <p className="font-medium text-ink">SK AX · Software Engineer · Korea</p>
              <p className="text-xs text-ink-muted">Sep 2021 – May 2026</p>
              <p className="mt-1 text-ink-muted">
                Manufacturing cost management, an enterprise mobile web platform
                across 8 sites, and real-time MES. Backend Java/Spring, JPA,
                PL/SQL on Oracle, and transaction redesign across manufacturing
                and financial systems.
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">Dure Info · Software Developer · Korea</p>
              <p className="text-xs text-ink-muted">Jun 2020 – Sep 2021</p>
              <p className="mt-1 text-ink-muted">
                Multi-client TCP socket server (Windows Service) brokering DB
                access for PC/PDA/Kiosk clients. Fixed XML deserialization
                failures from partial TCP reads with application-level message
                framing — buffering bytes until a complete delimiter-terminated
                message arrived.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="Selected impact">
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>Consolidated 40 endpoint-specific middleware APIs into one reverse proxy (reflection-based RPC dispatcher), deployed across 8 sites — freeing ~1 FTE by eliminating per-endpoint redeployments.</li>
            <li>Redesigned transaction boundaries between manufacturing and financial systems with a staging-table + batch-worker pattern. Processing time −60%; reprocessing from 20 cases/month to near zero.</li>
            <li>Refactored a 7,700-line monolithic CASE-based PL/SQL query into per-process CTEs (−57%), isolating 5 sub-processes so changes stop cascading. Weekly cost-ledger throughput 4 → 7 tickets.</li>
            <li>Fixed HTTP 413 errors on mobile WMS scans with PK-only payloads + fresh-state retrieval — no infra change. Scan batch size 30 → 60, inventory stayed accurate.</li>
            <li>Eliminated cross-server duplicate execution with a distributed lock (ShedLock / job_lock table) and decoupled scheduler from execution via @Async, so parallel plant closes run safely.</li>
            <li>Prevented duplicate ID generation across multi-instance MES with Oracle row-level locks (FOR UPDATE), avoiding data anomalies and downtime.</li>
          </ul>
        </Section>

        <Section title={t("en", "about.writingAbout")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>LLM app patterns — async analysis pipelines, provider abstraction, prompt engineering.</li>
            <li>Backend systems — transaction design, locking, concurrency, cross-system integration.</li>
            <li>Project recaps in the before / change / result / limit format.</li>
          </ul>
        </Section>

        <Section title={t("en", "about.stack")}>
          <dl className="grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="text-ink-muted">Languages</dt>
            <dd>Java, Python, SQL/PL-SQL, C#, TypeScript</dd>
            <dt className="text-ink-muted">Backend</dt>
            <dd>Spring Boot, JPA, FastAPI, REST APIs, .NET</dd>
            <dt className="text-ink-muted">Frontend</dt>
            <dd>Next.js, React</dd>
            <dt className="text-ink-muted">AI / LLM</dt>
            <dd>Claude &amp; Gemini API, prompt engineering, async LLM pipeline</dd>
            <dt className="text-ink-muted">Databases</dt>
            <dd>PostgreSQL, Oracle</dd>
            <dt className="text-ink-muted">Infra</dt>
            <dd>Docker, Git, Linux, AWS, CI/CD (GitHub Actions), JUnit</dd>
          </dl>
        </Section>

        <Section title="Education">
          <p className="text-[0.95rem]">
            M.S. &amp; B.S. in Industrial Engineering · Kumoh National
            Institute of Technology, Gumi, South Korea (2012–2019).
          </p>
        </Section>

        {SITE.author.hobby || SITE.author.hobbyPhotos.length > 0 ? (
          <Section title="Outside of work">
            {SITE.author.hobby ? (
              <p className="text-[0.95rem] text-ink">{SITE.author.hobby}</p>
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

        <Section title={t("en", "about.contact")}>
          <SocialGrid variant="footer" />
          <p className="mt-3 text-sm text-ink-muted">
            Email is fastest:{" "}
            <a className="underline" href={`mailto:${SITE.author.email}`}>
              {SITE.author.email}
            </a>
            . Résumé:{" "}
            <a className="underline" href={SITE.author.resumeUrl} target="_blank" rel="noopener noreferrer">
              {SITE.author.resumeUrl}
            </a>
            .
          </p>
        </Section>
      </main>
      <Footer locale="en" />
    </>
  );
}

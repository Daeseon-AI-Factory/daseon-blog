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
          Backend engineer with 5+ years building and modernizing
          mission-critical enterprise systems across manufacturing, warehouse,
          and financial operations. Strong in backend logic, SQL/PL-SQL,
          transaction design, and cross-system integration. Currently focused
          on Java/Spring backend platforms and AI-assisted product engineering
          — reliable backends plus practical AI-powered tools.
        </p>

        <Section title={t("en", "about.currently")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>SK AX, Toronto (Sep 2021 – present). Java/Spring + AI-assisted product engineering.</li>
            <li>Building the Daeseon AI Factory — reusable backend and AI cores for shipping product faster.</li>
            <li>Open to senior / staff backend or AI engineer roles. Remote or Toronto local.</li>
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
              <p className="font-medium text-ink">SK AX · Software Engineer</p>
              <p className="text-xs text-ink-muted">Sep 2021 – May 2026</p>
              <p className="mt-1 text-ink-muted">
                Manufacturing cost management system, enterprise mobile web
                platform across 8 sites, and real-time MES. Backend Java/Spring,
                PL/SQL on Oracle, transaction redesign across financial systems.
              </p>
            </li>
            <li>
              <p className="font-medium text-ink">Dure Info · Software Developer</p>
              <p className="text-xs text-ink-muted">Jun 2020 – Sep 2021</p>
              <p className="mt-1 text-ink-muted">
                Solved a critical data-loss bug from network packet
                fragmentation by implementing a custom buffering layer
                (MemoryStream) with application-level protocol validation.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="Selected impact">
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>Refactored the PL/SQL costing core from ~7,000 to ~3,000 lines; weekly ticket throughput 4 → 7.</li>
            <li>Consolidated 40 endpoint-specific middleware APIs into a single common gateway. $100K+/year in operational savings.</li>
            <li>Redesigned transaction boundaries between manufacturing operations and financial systems using a staging-table + batch-worker pattern. Processing time -60%, reprocessing 20 monthly cases → near zero.</li>
            <li>Implemented a custom database-backed locking mechanism to prevent duplicate costing jobs across multiple application instances.</li>
            <li>Optimized real-time MES equipment message handling to meet a strict 4-second timeout SLA.</li>
          </ul>
        </Section>

        <Section title={t("en", "about.writingAbout")}>
          <ul className="space-y-1.5 text-[0.95rem]">
            <li>LLM systems patterns — RAG, evals, tool use, agent loops (LangGraph).</li>
            <li>Backend systems — transaction design, locking, cross-system integration.</li>
            <li>Project recaps in the before / change / result / limit format.</li>
          </ul>
        </Section>

        <Section title={t("en", "about.stack")}>
          <dl className="grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="text-ink-muted">Languages</dt>
            <dd>Java, Python, SQL/PL-SQL, C#, TypeScript</dd>
            <dt className="text-ink-muted">Backend</dt>
            <dd>Spring Boot, FastAPI, REST APIs, .NET</dd>
            <dt className="text-ink-muted">Frontend</dt>
            <dd>Next.js, React</dd>
            <dt className="text-ink-muted">AI / LLM</dt>
            <dd>RAG, Agent Workflows, LangGraph, AI-assisted dev</dd>
            <dt className="text-ink-muted">Databases</dt>
            <dd>PostgreSQL, MongoDB, Oracle</dd>
            <dt className="text-ink-muted">Infra</dt>
            <dd>Docker, Docker Compose, Git, Linux, AWS basics, CI/CD</dd>
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
            .
          </p>
        </Section>
      </main>
      <Footer locale="en" />
    </>
  );
}

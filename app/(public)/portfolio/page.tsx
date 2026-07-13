import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CostingFilm } from "@/components/casefilm/cases/costing";
import { ErpMesFilm } from "@/components/casefilm/cases/erp-mes";
import { GatewayFilm } from "@/components/casefilm/cases/gateway";
import { Payload413Film } from "@/components/casefilm/cases/payload-413";
import { RowLockFilm } from "@/components/casefilm/cases/row-level-lock";

export const metadata: Metadata = {
  title: "Portfolio — case films",
  description:
    "Production systems I redesigned, shown as animated before/after diagrams instead of paragraphs.",
  alternates: { canonical: "/portfolio" },
};

export default function PortfolioEN() {
  return (
    <>
      <Header locale="en" currentPath="/portfolio" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Case films</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Real production incidents and redesigns, played as scenes: the flow before, where it
            broke, what I changed, who I aligned with, and the measured result. Minimal text —
            the diagrams do the talking. Each film links to a full deep-dive with code and
            trade-offs.
          </p>
        </header>

        <nav className="mb-2 flex flex-wrap gap-2 text-xs">
          {[
            ["#case-01", "01 · ERP↔MES outbox"],
            ["#case-02", "02 · 46→1 gateway"],
            ["#case-03", "03 · HTTP 413"],
            ["#case-04", "04 · row lock"],
            ["#case-05", "05 · trust + CTEs"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-full border border-paper-line px-3 py-1 text-ink-muted hover:text-ink"
            >
              {label}
            </a>
          ))}
        </nav>

        <div id="case-01">
          <ErpMesFilm />
        </div>
        <div id="case-02">
          <GatewayFilm />
        </div>
        <div id="case-03">
          <Payload413Film />
        </div>
        <div id="case-04">
          <RowLockFilm />
        </div>
        <div id="case-05">
          <CostingFilm />
        </div>

        <section className="border-t border-paper-line py-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
            More cases — deep-dives already written
          </h2>
          <p className="text-sm text-ink">
            Distributed lock (month-end close), multi-plant template method, shared validation,
            TCP framing at Dure — full write-ups with code and follow-ups live at{" "}
            <a
              href="https://faangforge.daeseon.ai/story/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              faangforge.daeseon.ai/story
            </a>
            . Films for them come next.
          </p>
        </section>
      </main>
      <Footer locale="en" />
    </>
  );
}

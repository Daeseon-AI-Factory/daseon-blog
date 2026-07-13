import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ErpMesFilm } from "@/components/casefilm/cases/erp-mes";

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

        <ErpMesFilm />

        <section className="border-t border-paper-line py-6">
          <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
            In production — storyboards next
          </h2>
          <ul className="space-y-1.5 text-sm text-ink">
            <li>
              Case 02 · 46 middleware endpoints → 1 reflection-based gateway (8 sites, freed 1 FTE)
            </li>
            <li>Case 03 · HTTP 413 on mobile scans → PK-only payloads (batch 30 → 80)</li>
            <li>Case 04 · Duplicate IDs across instances → Oracle FOR UPDATE row locks</li>
            <li>Case 05 · 7.7K-line PL/SQL monolith → per-process CTEs (−57%)</li>
          </ul>
          <p className="mt-3 text-xs text-ink-subtle">
            Deep-dives for all cases already live at{" "}
            <a
              href="https://faangforge.daeseon.ai/story/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              faangforge.daeseon.ai/story
            </a>
            .
          </p>
        </section>
      </main>
      <Footer locale="en" />
    </>
  );
}

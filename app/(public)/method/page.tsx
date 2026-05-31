import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How I record AI-pair-programmed work — positive-trigger commit hook, tiered decision templates (Bezos / Klein / Nygard), AI-author + human-annotator dual columns, cross-repo aggregation. The system I use across daseon.ai and four satellite projects.",
  alternates: { canonical: "/method", languages: { en: "/method", ko: "/ko/method" } },
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

export default function MethodEN() {
  return (
    <>
      <Header locale="en" currentPath="/method" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">
            Method
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            How I record AI-pair-programmed work
          </p>
        </header>

        <p className="text-lg leading-relaxed text-ink">
          In a world where anyone can ship code with AI, the differentiator for
          engineers is the judgment layer above it — what you choose to build,
          what trade-offs you accept, what AI suggestions you reject, what gaps
          in your own understanding you notice and close. None of this lives in
          the code. It lives in records, or it disappears. This is the system I
          use to keep mine from disappearing.
        </p>

        <Section title="Four properties">
          <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
            <li>
              <span className="font-medium">Nothing missed by default.</span> A
              positive-trigger layer in the commit hook overrides{" "}
              <code className="font-mono text-xs">[no-log]</code> tags when a
              commit exceeds 200 LOC, touches sensitive paths, or carries
              architecture-flavored keywords. Author judgment slips on what is
              &ldquo;trivial&rdquo; about a third of the time; the system catches it.
            </li>
            <li>
              <span className="font-medium">AI-author + human-annotator.</span>{" "}
              Every AI-written log entry has a sibling{" "}
              <code className="font-mono text-xs">.human.mdx</code> slot,
              rendered side-by-side. Empty slots render as &ldquo;REVIEW
              NEEDED&rdquo; — the absence is visible, not silent.
            </li>
            <li>
              <span className="font-medium">Cross-repo aggregation.</span> Five
              projects (this hub plus four satellite repos) feed one portfolio
              timeline via pull-on-demand. No sync, no second source of truth.
            </li>
            <li>
              <span className="font-medium">Tiered decision capture.</span>{" "}
              Decisions are recorded with templates scaled to weight (Tier 1
              substantial → 8-slot MBA-grade template; Tier 2 notable → 6-slot;
              Tier 3 trivial → no template). Plus a{" "}
              <code className="font-mono text-xs">learning-gap</code> kind for
              what I didn&apos;t initially understand — the growth artifact most
              systems omit.
            </li>
          </ol>
        </Section>

        <Section title="Decision tiers">
          <p className="text-[0.95rem] text-ink-muted">
            Adapted from established frameworks. The point is to use templates
            that have been load-bearing in real organizations, not to invent
            new slots.
          </p>
          <ul className="mt-3 space-y-3 text-[0.95rem]">
            <li>
              <p className="font-medium">
                Tier 1 — substantial (architecture, vendor, monetization,
                security, data model, major refactor)
              </p>
              <p className="text-ink-muted">
                8 slots: Context & constraints · Goals ranked · Options
                considered (≥3 incl. &ldquo;do nothing&rdquo;) with
                Cost/Reversibility/Risk/Evidence each · Trade-off accepted ·
                Pre-mortem (3 failure scenarios at 6 months) · Decision
                criteria to flip · Success measure · Reversal plan.
              </p>
              <p className="mt-1 text-xs text-ink-subtle">
                Authoring time: 20–30 min when done thoroughly. Target: 3–5
                entries per month.
              </p>
            </li>
            <li>
              <p className="font-medium">Tier 2 — notable (feature direction, UX call, dependency upgrade)</p>
              <p className="text-ink-muted">
                6 slots: Context · Options considered (≥2) · Chosen + Why ·
                Trade-off · Reversibility · Verified by. ~5–10 min.
              </p>
            </li>
            <li>
              <p className="font-medium">Tier 3 — trivial (renames, lint, formatting, dep bumps with no behavior change)</p>
              <p className="text-ink-muted">
                No decision entry. Just commit.
              </p>
            </li>
          </ul>
        </Section>

        <Section title="The judgment-layer kinds">
          <p className="text-[0.95rem] text-ink-muted">
            Three log kinds carry the AI engineer&apos;s differentiating signal:
          </p>
          <dl className="mt-3 grid gap-3 text-[0.95rem] sm:grid-cols-[8rem_1fr]">
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              decision
            </dt>
            <dd>
              ADR-style record of an option-weighing moment. Tiered. Required
              fields include reversibility (Bezos two-way / one-way door framing).
            </dd>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              discussion
            </dt>
            <dd>
              Conversation that surfaced options — with Claude.ai, with a
              person, brainstorm. Captures what I rejected from AI&apos;s default
              suggestion.
            </dd>
            <dt className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
              learning-gap
            </dt>
            <dd>
              What I didn&apos;t initially understand, where the gap came from,
              what clicked, what&apos;s still confused. Paired with wiki entries
              to track the growth of a mental model over time.
            </dd>
          </dl>
        </Section>

        <Section title="Try it in your own repo">
          <p className="text-[0.95rem]">
            The hook script, install kit, and CLAUDE.md snippet are all open.
            One-line install bootstraps the dual-write convention plus the
            positive-trigger hook on any git repo.
          </p>
          <Link
            href="/posts/install-claude-code-project-log"
            className="mt-3 inline-flex items-center gap-2 text-accent hover:underline"
          >
            Install guide → /posts/install-claude-code-project-log
          </Link>
        </Section>

        <Section title="The live build">
          <p className="text-[0.95rem]">
            The system was built incrementally and documented as it shipped.
            The post below records the actual sequence — what was tried, what
            broke, what shipped.
          </p>
          <Link
            href="/posts/project-log-system-v1"
            className="mt-3 inline-flex items-center gap-2 text-accent hover:underline"
          >
            Building the project log system → /posts/project-log-system-v1
          </Link>
        </Section>

        <Section title="Frameworks the system draws on">
          <ul className="space-y-1.5 text-[0.9rem] text-ink-muted">
            <li>Michael Nygard, <em>Documenting Architecture Decisions</em>, 2011 — the ADR pattern.</li>
            <li>Jeff Bezos, 1997 shareholder letter — two-way / one-way door framing for reversibility.</li>
            <li>Gary Klein, &ldquo;Performing a Project Premortem,&rdquo; <em>Harvard Business Review</em>, 2007.</li>
            <li>Atlassian DACI — decision-roles framework (used in lightweight form for solo work).</li>
            <li>Andy Grove, <em>High Output Management</em>, 1983 — structured information capture as management leverage.</li>
            <li>Salvatore Sanfilippo (antirez) — devlog tradition for high-signal individual engineering writing.</li>
            <li>Obsidian / Logseq — linked atomic notes (the <code className="font-mono text-xs">[[wiki-link]]</code> syntax is adapted from these).</li>
          </ul>
        </Section>

        <Section title="What this isn't">
          <ul className="space-y-1.5 text-[0.9rem] text-ink-muted">
            <li>Not a CMS. Logs are MDX files; the rendering layer just reads them.</li>
            <li>Not a sync system. The hub pulls satellite logs on demand; no second source of truth.</li>
            <li>Not bureaucracy. Tier 3 is &ldquo;just commit, no entry&rdquo; — most commits stay there.</li>
            <li>Not a substitute for code review. It records reasoning; it doesn&apos;t evaluate it.</li>
          </ul>
        </Section>

        <p className="mt-10 text-sm text-ink-muted">
          The spec is reviewable at <code className="font-mono text-xs">docs/project-log-system-v1-blueprint.md</code> in the{" "}
          <a
            href="https://github.com/Daeseon-AI-Factory/daseon-blog/blob/main/docs/project-log-system-v1-blueprint.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            repo
          </a>
          . External critique welcome.
        </p>
      </main>
      <Footer locale="en" />
    </>
  );
}

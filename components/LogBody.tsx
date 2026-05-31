import Link from "next/link";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { LogEntry } from "@/lib/logs";
import { LOG_KIND_LABELS } from "@/lib/logs";

export async function LogBody({
  entry,
  locale,
  humanContent,
}: {
  entry: LogEntry;
  locale: Locale;
  humanContent?: string | null;
}) {
  const aiRendered = await renderMdx(entry.content);
  const humanRendered = humanContent ? await renderMdx(humanContent) : null;
  const fm = entry.frontmatter;
  const hasCompanion = humanRendered !== null;
  const aiLabel = locale === "ko" ? "AI 버전" : "AI version";
  const humanLabel = locale === "ko" ? "직접" : "By hand";
  const reviewLabel = locale === "ko" ? "리뷰 필요" : "Review needed";
  const reviewHint =
    locale === "ko"
      ? "내 시각이 아직 안 들어간 entry."
      : "No human review on this entry yet.";

  return (
    <article className="mx-auto max-w-6xl px-5 py-12">
      <Link
        href={localizedPath(locale, `/projects/${entry.project}`)}
        className="font-mono text-xs uppercase tracking-widest text-ink-subtle hover:text-ink"
      >
        ← {locale === "ko" ? "프로젝트로" : "Back to project"}
      </Link>

      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
          <time dateTime={fm.date}>{formatDate(fm.date, locale)}</time>
          <span>·</span>
          <span className="rounded-full bg-paper-line/60 px-2 py-0.5 text-ink">
            {LOG_KIND_LABELS[entry.kind][locale]}
          </span>
          <span>·</span>
          <span>
            {entry.readingMinutes} {locale === "ko" ? "분" : "min"}
          </span>
          {fm.handwritten ? (
            <>
              <span>·</span>
              <span>{humanLabel}</span>
            </>
          ) : null}
          {!hasCompanion && !fm.handwritten ? (
            <>
              <span>·</span>
              <span>{reviewLabel}</span>
            </>
          ) : null}
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {fm.title}
        </h1>
        {fm.summary ? (
          <p className="mt-3 text-lg text-ink-muted">{fm.summary}</p>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        <section>
          <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
            {aiLabel}
          </h2>
          <div className="prose">{aiRendered}</div>
        </section>
        <section className="md:border-l md:border-paper-line md:pl-12">
          <h2 className="mb-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
            {hasCompanion ? humanLabel : reviewLabel}
          </h2>
          {hasCompanion ? (
            <div className="prose">{humanRendered}</div>
          ) : (
            <p className="text-sm text-ink-subtle">{reviewHint}</p>
          )}
        </section>
      </div>
    </article>
  );
}

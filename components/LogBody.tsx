import Link from "next/link";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { LogEntry } from "@/lib/logs";
import { LOG_KIND_LABELS } from "@/lib/logs";

export async function LogBody({
  entry,
  locale,
}: {
  entry: LogEntry;
  locale: Locale;
}) {
  const rendered = await renderMdx(entry.content);
  const fm = entry.frontmatter;
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
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
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {fm.title}
        </h1>
        {fm.summary ? (
          <p className="mt-3 text-lg text-ink-muted">{fm.summary}</p>
        ) : null}
      </header>

      <div className="prose">{rendered}</div>
    </article>
  );
}

import Link from "next/link";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/posts";

export function WikiList({ entries, locale }: { entries: Post[]; locale: Locale }) {
  if (entries.length === 0) {
    return <p className="text-ink-muted">{t(locale, "wiki.empty")}</p>;
  }
  return (
    <ul className="divide-y divide-paper-line border-t border-paper-line">
      {entries.map((e) => (
        <li key={e.slug}>
          <Link
            href={localizedPath(locale, `/wiki/${e.slug}`)}
            className="group block py-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-medium text-ink group-hover:text-accent">
                {e.frontmatter.title}
              </h2>
              {e.frontmatter.tags?.[0] ? (
                <span className="shrink-0 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                  {e.frontmatter.tags[0]}
                </span>
              ) : null}
            </div>
            {e.frontmatter.description ? (
              <p className="mt-1 text-sm text-ink-muted">{e.frontmatter.description}</p>
            ) : null}
            {e.frontmatter.date ? (
              <p className="mt-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                {formatDate(e.frontmatter.date, locale)}
              </p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

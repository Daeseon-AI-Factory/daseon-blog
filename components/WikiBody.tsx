import Link from "next/link";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

export async function WikiBody({
  entry,
  translation,
  locale,
}: {
  entry: Post;
  translation: Post | null;
  locale: Locale;
}) {
  const rendered = await renderMdx(entry.content, {
    wikiLinkBase: localizedPath(locale, "/wiki"),
  });
  const shownDate = entry.frontmatter.updated ?? entry.frontmatter.date;
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
          <Link href={localizedPath(locale, "/wiki")} className="hover:text-ink">
            {t(locale, "wiki.heading")}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {entry.frontmatter.title}
        </h1>
        {entry.frontmatter.description ? (
          <p className="mt-3 text-lg text-ink-muted">{entry.frontmatter.description}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
          <time dateTime={shownDate}>{formatDate(shownDate, locale)}</time>
          {entry.frontmatter.tags && entry.frontmatter.tags.length > 0 ? (
            <>
              <span>·</span>
              <span>{entry.frontmatter.tags.join(" · ")}</span>
            </>
          ) : null}
          {translation ? (
            <>
              <span>·</span>
              <Link
                href={localizedPath(translation.locale, `/wiki/${translation.slug}`)}
                className="text-accent hover:underline"
              >
                {t(locale, "post.translation")}
              </Link>
            </>
          ) : null}
        </div>
      </header>
      <div className="prose">{rendered}</div>
    </article>
  );
}

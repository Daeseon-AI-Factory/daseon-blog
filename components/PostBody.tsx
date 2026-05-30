import Link from "next/link";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

export async function PostBody({
  post,
  translation,
  locale,
}: {
  post: Post;
  translation: Post | null;
  locale: Locale;
}) {
  const rendered = await renderMdx(post.content);
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {post.frontmatter.title}
        </h1>
        {post.frontmatter.description ? (
          <p className="mt-3 text-lg text-ink-muted">
            {post.frontmatter.description}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
          <time dateTime={post.frontmatter.date}>
            {formatDate(post.frontmatter.date, locale)}
          </time>
          <span>·</span>
          <span>
            {post.readingMinutes} {t(locale, "post.readingTime")}
          </span>
          {post.frontmatter.handwritten ? (
            <>
              <span>·</span>
              <span>{t(locale, "post.handwritten")}</span>
            </>
          ) : null}
          {translation ? (
            <>
              <span>·</span>
              <Link
                href={localizedPath(translation.locale, `/posts/${translation.slug}`)}
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

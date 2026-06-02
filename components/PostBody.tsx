import Link from "next/link";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import type { Post } from "@/lib/posts";
import { SITE } from "@/lib/site";

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
        {post.frontmatter.description ?? post.frontmatter.summary ? (
          <p className="mt-3 text-lg text-ink-muted">
            {post.frontmatter.description ?? post.frontmatter.summary}
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

      <footer className="mt-16 border-t border-paper-line pt-8 text-sm">
        <p className="font-medium text-ink">
          {locale === "ko" ? SITE.author.nameKo : SITE.author.name}
        </p>
        <p className="mt-0.5 text-ink-muted">
          {locale === "ko" ? SITE.author.roleKo : SITE.author.role} ·{" "}
          {locale === "ko" ? SITE.author.locationKo : SITE.author.location}
          {SITE.author.available
            ? locale === "ko"
              ? " · 구직 중"
              : " · Open to roles"
            : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-4">
          <Link
            href={localizedPath(locale, "/about")}
            className="text-accent hover:underline"
          >
            {locale === "ko" ? "소개 →" : "About →"}
          </Link>
          {SITE.author.resumeUrl ? (
            <a
              href={SITE.author.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {locale === "ko" ? "이력서 (PDF) ↓" : "Resume (PDF) ↓"}
            </a>
          ) : null}
          <Link
            href={localizedPath(locale, "/posts")}
            className="text-accent hover:underline"
          >
            {locale === "ko" ? "다른 글 →" : "More posts →"}
          </Link>
        </div>
      </footer>
    </article>
  );
}

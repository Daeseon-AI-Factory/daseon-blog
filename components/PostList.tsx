import Link from "next/link";
import { type Locale, localizedPath, t } from "@/lib/i18n";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/posts";

export function PostList({ posts, locale }: { posts: Post[]; locale: Locale }) {
  if (posts.length === 0) {
    return <p className="text-ink-muted">{t(locale, "home.empty")}</p>;
  }

  return (
    <ul className="divide-y divide-paper-line">
      {posts.map((post) => (
        <li key={`${post.locale}-${post.slug}`} className="py-5">
          <Link
            href={localizedPath(locale, `/posts/${post.slug}`)}
            className="group block"
          >
            <h2 className="text-base font-medium text-ink group-hover:text-accent md:text-lg">
              {post.frontmatter.title}
            </h2>
            {post.frontmatter.description ? (
              <p className="mt-1 text-sm text-ink-muted">
                {post.frontmatter.description}
              </p>
            ) : null}
            <div className="mt-2 flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
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
            </div>
          </Link>
          {post.frontmatter.tags && post.frontmatter.tags.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {post.frontmatter.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={localizedPath(locale, `/posts/tag/${encodeURIComponent(tag)}`)}
                    className="rounded-full border border-paper-line px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-ink-muted hover:border-accent hover:text-ink"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

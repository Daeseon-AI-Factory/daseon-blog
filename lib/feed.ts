import { Feed } from "feed";
import { type Locale } from "./i18n";
import { getPublishedPosts } from "./posts";
import { SITE } from "./site";

export async function buildFeed(locale: Locale): Promise<string> {
  const posts = await getPublishedPosts(locale);
  const base = SITE.url.replace(/\/$/, "");
  const prefix = locale === "en" ? "" : `/${locale}`;
  const feedUrl = `${base}${prefix}/feed.xml`;
  const siteUrl = `${base}${prefix}`;

  const feed = new Feed({
    title: locale === "en" ? `${SITE.author.name} — notes` : `${SITE.author.name} — 메모`,
    description:
      locale === "en"
        ? "Notes on building, shipping, and learning AI engineering in public."
        : "AI 엔지니어링을 만들고, 출시하고, 공개적으로 배우는 기록.",
    id: siteUrl,
    link: siteUrl,
    language: locale,
    copyright: `© ${new Date().getFullYear()} ${SITE.author.name}`,
    feedLinks: { atom: feedUrl, rss: feedUrl },
    author: {
      name: SITE.author.name,
      email: SITE.author.email,
      link: SITE.url,
    },
  });

  for (const p of posts) {
    const url = `${base}${prefix}/posts/${p.slug}`;
    feed.addItem({
      title: p.frontmatter.title,
      id: url,
      link: url,
      description: p.frontmatter.description,
      date: new Date(p.frontmatter.date),
      author: [{ name: SITE.author.name, email: SITE.author.email, link: SITE.url }],
    });
  }

  return feed.rss2();
}

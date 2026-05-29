import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { getPublishedPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

type Params = Promise<{ tag: string }>;

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedPosts("en");
  const tags = new Set<string>();
  for (const p of posts) {
    p.frontmatter.tags?.forEach((tag) => tags.add(tag));
  }
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const url = `${SITE.url}/posts/tag/${encodeURIComponent(tag)}`;
  return {
    title: `Tagged: ${tag}`,
    description: `Posts tagged "${tag}".`,
    alternates: {
      canonical: url,
      languages: {
        en: `/posts/tag/${encodeURIComponent(tag)}`,
        ko: `/ko/posts/tag/${encodeURIComponent(tag)}`,
      },
    },
  };
}

export default async function TaggedPostsEN({ params }: { params: Params }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const allPosts = await getPublishedPosts("en");
  const posts = allPosts.filter((p) => p.frontmatter.tags?.includes(tag));
  if (posts.length === 0) notFound();
  return (
    <>
      <Header locale="en" currentPath={`/posts/tag/${rawTag}`} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-subtle">Tagged</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">{tag}</h1>
          <p className="mt-2 text-ink-muted">
            {posts.length} {posts.length === 1 ? "post" : "posts"}.
          </p>
        </header>
        <PostList posts={posts} locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}

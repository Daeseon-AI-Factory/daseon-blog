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
  const posts = await getPublishedPosts("ko");
  const tags = new Set<string>();
  for (const p of posts) {
    p.frontmatter.tags?.forEach((tag) => tags.add(tag));
  }
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const url = `${SITE.url}/ko/posts/tag/${encodeURIComponent(tag)}`;
  return {
    title: `태그: ${tag}`,
    description: `"${tag}" 태그가 붙은 글.`,
    alternates: {
      canonical: url,
      languages: {
        en: `/posts/tag/${encodeURIComponent(tag)}`,
        ko: `/ko/posts/tag/${encodeURIComponent(tag)}`,
      },
    },
  };
}

export default async function TaggedPostsKO({ params }: { params: Params }) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);
  const allPosts = await getPublishedPosts("ko");
  const posts = allPosts.filter((p) => p.frontmatter.tags?.includes(tag));
  if (posts.length === 0) notFound();
  return (
    <>
      <Header locale="ko" currentPath={`/ko/posts/tag/${rawTag}`} />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-subtle">태그</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight md:text-3xl">{tag}</h1>
          <p className="mt-2 text-ink-muted">글 {posts.length}개.</p>
        </header>
        <PostList posts={posts} locale="ko" />
      </main>
      <Footer locale="ko" />
    </>
  );
}

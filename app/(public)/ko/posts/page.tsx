import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "글",
  description: "전체 글 목록.",
  alternates: { canonical: "/ko/posts", languages: { en: "/posts", ko: "/ko/posts" } },
};

export default async function PostsIndexKO() {
  const posts = await getPublishedPosts("ko");
  return (
    <>
      <Header locale="ko" currentPath="/ko/posts" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">글</h1>
          <p className="mt-2 text-ink-muted">전체 글, 최신순.</p>
        </header>
        <PostList posts={posts} locale="ko" />
      </main>
      <Footer locale="ko" />
    </>
  );
}

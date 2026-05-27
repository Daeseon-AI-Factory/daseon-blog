import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostList } from "@/components/PostList";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writing",
  description: "All posts.",
  alternates: { canonical: "/posts", languages: { en: "/posts", ko: "/ko/posts" } },
};

export default async function PostsIndexEN() {
  const posts = await getPublishedPosts("en");
  return (
    <>
      <Header locale="en" currentPath="/posts" />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-medium tracking-tight md:text-3xl">Writing</h1>
          <p className="mt-2 text-ink-muted">All posts, newest first.</p>
        </header>
        <PostList posts={posts} locale="en" />
      </main>
      <Footer locale="en" />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { findTranslation, getPost, getPublishedPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPublishedPosts("ko");
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("ko", slug);
  if (!post) return {};
  const translation = await findTranslation(post);
  const url = `${SITE.url}/ko/posts/${slug}`;
  const languages: Record<string, string> = { ko: `/ko/posts/${slug}` };
  if (translation) languages.en = `/posts/${translation.slug}`;
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.description,
      url,
      type: "article",
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.updated,
    },
  };
}

export default async function PostPageKO({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost("ko", slug);
  if (!post || post.frontmatter.status === "draft" || post.frontmatter.visibility === "private") {
    notFound();
  }
  const translation = await findTranslation(post);

  return (
    <>
      <Header locale="ko" currentPath={`/ko/posts/${slug}`} />
      <PostBody post={post} translation={translation} locale="ko" />
      <Footer locale="ko" />
    </>
  );
}

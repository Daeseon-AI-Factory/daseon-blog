import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { findTranslation, getPost, getPublishedPosts } from "@/lib/posts";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const posts = await getPublishedPosts("en");
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost("en", slug);
  if (!post) return {};
  const translation = await findTranslation(post);
  const url = `${SITE.url}/posts/${slug}`;
  const languages: Record<string, string> = { en: `/posts/${slug}` };
  if (translation) languages.ko = `/ko/posts/${translation.slug}`;
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

export default async function PostPageEN({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost("en", slug);
  if (!post || post.frontmatter.status === "draft" || post.frontmatter.visibility === "private") {
    notFound();
  }
  const translation = await findTranslation(post);

  return (
    <>
      <Header locale="en" currentPath={`/posts/${slug}`} />
      <PostBody post={post} translation={translation} locale="en" />
      <Footer locale="en" />
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WikiBody } from "@/components/WikiBody";
import { findTranslation, getContentItem, listContent } from "@/lib/posts";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const entries = await listContent("knowledge", "en");
  return entries.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getContentItem("knowledge", "en", slug);
  if (!entry) return {};
  const translation = await findTranslation(entry);
  const url = `${SITE.url}/wiki/${slug}`;
  const languages: Record<string, string> = { en: `/wiki/${slug}` };
  if (translation) languages.ko = `/ko/wiki/${translation.slug}`;
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    alternates: { canonical: url, languages },
  };
}

export default async function WikiEntryEN({ params }: { params: Params }) {
  const { slug } = await params;
  const entry = await getContentItem("knowledge", "en", slug);
  if (!entry || entry.frontmatter.status === "draft" || entry.frontmatter.visibility === "private") {
    notFound();
  }
  const translation = await findTranslation(entry);
  return (
    <>
      <Header locale="en" currentPath={`/wiki/${slug}`} />
      <WikiBody entry={entry} translation={translation} locale="en" />
      <Footer locale="en" />
    </>
  );
}

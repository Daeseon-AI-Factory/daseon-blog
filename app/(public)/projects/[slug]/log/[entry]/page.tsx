import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogBody } from "@/components/LogBody";
import { getProjectLog } from "@/lib/logs";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string; entry: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, entry } = await params;
  const log = await getProjectLog(slug, entry);
  if (!log) return {};
  if (log.frontmatter.visibility === "private") return { robots: { index: false, follow: false } };
  return {
    title: log.frontmatter.title,
    description: log.frontmatter.summary,
    alternates: { canonical: `${SITE.url}/projects/${slug}/log/${entry}` },
    robots: log.frontmatter.visibility === "unlisted" ? { index: false, follow: false } : undefined,
  };
}

export default async function ProjectLogEntryEN({ params }: { params: Params }) {
  const { slug, entry } = await params;
  const log = await getProjectLog(slug, entry);
  if (!log) notFound();
  if (log.frontmatter.visibility === "private") notFound();

  return (
    <>
      <Header locale="en" currentPath={`/projects/${slug}/log/${entry}`} />
      <LogBody entry={log} locale="en" />
      <Footer locale="en" />
    </>
  );
}

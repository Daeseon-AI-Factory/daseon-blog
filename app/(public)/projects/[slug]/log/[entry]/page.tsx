import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogBody } from "@/components/LogBody";
import { getHumanCompanion, getProjectLog } from "@/lib/logs";
import { getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string; entry: string }>;

async function resolveLogSource(slug: string): Promise<{ repo?: string; dir: string }> {
  const project = (await getProject("en", slug)) ?? (await getProject("ko", slug));
  return {
    repo: project?.frontmatter.logSourceRepo,
    dir: project?.frontmatter.logSourceDir ?? slug,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, entry } = await params;
  const { repo, dir } = await resolveLogSource(slug);
  const log = await getProjectLog(dir, entry, repo);
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
  const { repo, dir } = await resolveLogSource(slug);
  const log = await getProjectLog(dir, entry, repo);
  if (!log) notFound();
  if (log.frontmatter.visibility === "private") notFound();
  const humanContent = await getHumanCompanion(slug, entry);

  return (
    <>
      <Header locale="en" currentPath={`/projects/${slug}/log/${entry}`} />
      <LogBody entry={log} locale="en" humanContent={humanContent} />
      <Footer locale="en" />
    </>
  );
}

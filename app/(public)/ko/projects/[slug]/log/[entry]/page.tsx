import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LogBody } from "@/components/LogBody";
import { getHumanCompanion, getProjectLog } from "@/lib/logs";
import { getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string; entry: string }>;

async function resolveLogSourceRepo(slug: string): Promise<string | undefined> {
  const project = (await getProject("ko", slug)) ?? (await getProject("en", slug));
  return project?.frontmatter.logSourceRepo;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, entry } = await params;
  const sourceRepo = await resolveLogSourceRepo(slug);
  const log = await getProjectLog(slug, entry, sourceRepo);
  if (!log) return {};
  if (log.frontmatter.visibility === "private") return { robots: { index: false, follow: false } };
  return {
    title: log.frontmatter.title,
    description: log.frontmatter.summary,
    alternates: { canonical: `${SITE.url}/ko/projects/${slug}/log/${entry}` },
    robots: log.frontmatter.visibility === "unlisted" ? { index: false, follow: false } : undefined,
  };
}

export default async function ProjectLogEntryKO({ params }: { params: Params }) {
  const { slug, entry } = await params;
  const sourceRepo = await resolveLogSourceRepo(slug);
  const log = await getProjectLog(slug, entry, sourceRepo);
  if (!log) notFound();
  if (log.frontmatter.visibility === "private") notFound();
  const humanContent = await getHumanCompanion(slug, entry);

  return (
    <>
      <Header locale="ko" currentPath={`/ko/projects/${slug}/log/${entry}`} />
      <LogBody entry={log} locale="ko" humanContent={humanContent} />
      <Footer locale="ko" />
    </>
  );
}

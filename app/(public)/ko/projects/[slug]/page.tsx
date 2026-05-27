import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectBody } from "@/components/ProjectBody";
import { findProjectTranslation, getAllProjects, getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const all = await getAllProjects("ko");
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject("ko", slug);
  if (!project) return {};
  const t = await findProjectTranslation(project);
  const languages: Record<string, string> = { ko: `/ko/projects/${slug}` };
  if (t) languages.en = `/projects/${t.slug}`;
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
    alternates: { canonical: `${SITE.url}/ko/projects/${slug}`, languages },
  };
}

export default async function ProjectPageKO({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject("ko", slug);
  if (!project) notFound();
  const translation = await findProjectTranslation(project);
  return (
    <>
      <Header locale="ko" currentPath={`/ko/projects/${slug}`} />
      <ProjectBody project={project} translation={translation} locale="ko" />
      <Footer locale="ko" />
    </>
  );
}

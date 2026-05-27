import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProjectBody } from "@/components/ProjectBody";
import { findProjectTranslation, getAllProjects, getProject } from "@/lib/projects";
import { SITE } from "@/lib/site";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  const all = await getAllProjects("en");
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject("en", slug);
  if (!project) return {};
  const t = await findProjectTranslation(project);
  const languages: Record<string, string> = { en: `/projects/${slug}` };
  if (t) languages.ko = `/ko/projects/${t.slug}`;
  return {
    title: project.frontmatter.title,
    description: project.frontmatter.description,
    alternates: { canonical: `${SITE.url}/projects/${slug}`, languages },
  };
}

export default async function ProjectPageEN({ params }: { params: Params }) {
  const { slug } = await params;
  const project = await getProject("en", slug);
  if (!project) notFound();
  const translation = await findProjectTranslation(project);
  return (
    <>
      <Header locale="en" currentPath={`/projects/${slug}`} />
      <ProjectBody project={project} translation={translation} locale="en" />
      <Footer locale="en" />
    </>
  );
}

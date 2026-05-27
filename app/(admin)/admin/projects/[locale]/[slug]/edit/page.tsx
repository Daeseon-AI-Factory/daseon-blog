import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/admin/ProjectEditor";
import { getProject } from "@/lib/projects";
import { isLocale } from "@/lib/i18n";
import { githubConfigured } from "@/lib/github";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; slug: string }>;

export default async function EditProjectPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const project = await getProject(locale, slug);
  if (!project) notFound();

  return (
    <ProjectEditor
      mode="edit"
      savingVia={githubConfigured() ? "github" : "local"}
      initial={{
        locale,
        slug,
        title: project.frontmatter.title,
        description: project.frontmatter.description,
        date: project.frontmatter.date,
        translationKey: project.frontmatter.translationKey ?? "",
        status: project.frontmatter.status,
        featured: project.frontmatter.featured,
        url: project.frontmatter.url,
        repo: project.frontmatter.repo ?? "",
        logSourceRepo: project.frontmatter.logSourceRepo ?? "",
        tags: (project.frontmatter.tags ?? []).join(", "),
        stack: (project.frontmatter.stack ?? []).join(", "),
        role: project.frontmatter.role ?? "",
        body: project.content,
      }}
    />
  );
}

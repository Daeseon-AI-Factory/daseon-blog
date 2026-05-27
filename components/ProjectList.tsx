import { ProjectCard } from "@/components/ProjectCard";
import type { Project } from "@/lib/projects";
import type { Locale } from "@/lib/i18n";

export function ProjectList({ projects, locale }: { projects: Project[]; locale: Locale }) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        {locale === "ko" ? "아직 등록된 프로젝트가 없습니다." : "No projects yet."}
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map((p) => (
        <ProjectCard key={`${p.locale}-${p.slug}`} project={p} locale={locale} />
      ))}
    </div>
  );
}

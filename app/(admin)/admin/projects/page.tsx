import Link from "next/link";
import { getAllProjectsAcrossLocales } from "@/lib/projects";
import { ProjectsList, type ProjectRow } from "@/components/admin/ProjectsList";
import { githubConfigured } from "@/lib/github";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const all = await getAllProjectsAcrossLocales();
  const rows: ProjectRow[] = all
    .map((p) => ({
      locale: p.locale,
      slug: p.slug,
      title: p.frontmatter.title,
      status: p.frontmatter.status,
      featured: p.frontmatter.featured,
      url: p.frontmatter.url,
    }))
    .sort((a, b) => (a.featured === b.featured ? a.title.localeCompare(b.title) : a.featured ? -1 : 1));

  const featuredCount = rows.filter((r) => r.featured).length;
  const gh = githubConfigured();

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Projects</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {gh ? "Saves via GitHub commit." : "Saving to local file system (no GITHUB_TOKEN set)."}{" "}
            Featured: {featuredCount}/3 (home cap). All projects: {rows.length}.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink/85"
        >
          New project
        </Link>
      </header>

      <ProjectsList projects={rows} />
    </div>
  );
}

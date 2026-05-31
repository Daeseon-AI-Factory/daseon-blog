import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { listProjectLogs, listHumanCompanions } from "@/lib/logs";

export const dynamic = "force-dynamic";

type Params = Promise<{ project: string }>;

export default async function AdminProjectLogsPage({ params }: { params: Params }) {
  const { project: projectSlug } = await params;
  const project = (await getProject("en", projectSlug)) ?? (await getProject("ko", projectSlug));
  if (!project) notFound();

  // Pull every entry the satellite has (or this repo for daseon-ai), no locale filter
  // — admin needs to see everything so a companion can be added to either-language entry.
  const entries = await listProjectLogs(projectSlug, project.frontmatter.logSourceRepo);
  const haveCompanion = await listHumanCompanions(projectSlug);

  const withCount = entries.filter((e) => haveCompanion.has(e.slug)).length;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/admin/projects"
          className="font-mono text-xs uppercase tracking-widest text-ink-subtle hover:text-ink"
        >
          ← Projects
        </Link>
        <h1 className="text-xl font-medium">{project.frontmatter.title} · Logs</h1>
        <p className="text-sm text-ink-muted">
          {entries.length} entries · {withCount} with a hand-written companion · {entries.length - withCount} need review.
        </p>
      </header>

      <ul className="divide-y divide-paper-line border-y border-paper-line">
        {entries.map((e) => {
          const has = haveCompanion.has(e.slug);
          return (
            <li key={e.slug} className="py-3">
              <Link
                href={`/admin/logs/${projectSlug}/${encodeURIComponent(e.slug)}`}
                className="group flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                    {e.frontmatter.date} · {e.kind}
                    {e.frontmatter.language ? ` · ${e.frontmatter.language}` : ""}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink group-hover:text-accent">
                    {e.frontmatter.title}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest ${
                    has
                      ? "border-accent/40 text-accent"
                      : "border-paper-line text-ink-subtle"
                  }`}
                >
                  {has ? "✓ companion" : "+ add"}
                </span>
              </Link>
            </li>
          );
        })}
        {entries.length === 0 ? (
          <li className="py-6 text-sm text-ink-muted">No log entries yet for this project.</li>
        ) : null}
      </ul>
    </div>
  );
}

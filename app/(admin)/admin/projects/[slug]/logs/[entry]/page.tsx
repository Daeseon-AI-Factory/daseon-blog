import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";
import { getHumanCompanion, getProjectLog } from "@/lib/logs";
import { CompanionEditor } from "@/components/admin/CompanionEditor";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string; entry: string }>;

export default async function AdminCompanionEditPage({ params }: { params: Params }) {
  const { slug, entry } = await params;
  const project = (await getProject("en", slug)) ?? (await getProject("ko", slug));
  if (!project) notFound();

  const log = await getProjectLog(slug, entry, project.frontmatter.logSourceRepo);
  if (!log) notFound();

  const existing = await getHumanCompanion(slug, entry);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href={`/admin/projects/${slug}/logs`}
          className="font-mono text-xs uppercase tracking-widest text-ink-subtle hover:text-ink"
        >
          ← {project.frontmatter.title} logs
        </Link>
        <h1 className="text-xl font-medium">Companion · {log.frontmatter.title}</h1>
        <p className="text-sm text-ink-muted">
          {log.frontmatter.date} · {log.kind}
          {log.frontmatter.language ? ` · ${log.frontmatter.language}` : ""}
          {existing ? " · companion exists" : " · review needed"}
        </p>
      </header>

      <section className="rounded-md border border-paper-line bg-white p-4">
        <p className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
          AI entry (preview)
        </p>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-ink-muted">
{log.content.trim()}
        </pre>
      </section>

      <CompanionEditor
        project={slug}
        slug={entry}
        initialBody={existing ?? ""}
        existed={existing !== null}
        backHref={`/admin/projects/${slug}/logs`}
        publicHref={`/projects/${slug}/log/${entry}`}
      />
    </div>
  );
}

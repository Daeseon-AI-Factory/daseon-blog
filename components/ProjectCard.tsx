import Link from "next/link";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

const STATUS_COPY = {
  en: { active: "active", shipped: "shipped", archived: "archived" },
  ko: { active: "진행 중", shipped: "출시됨", archived: "종료" },
} as const;

export function ProjectCard({ project, locale }: { project: Project; locale: Locale }) {
  const fm = project.frontmatter;
  const externals: { label: string; href: string }[] = [];
  if (fm.url) externals.push({ label: locale === "ko" ? "사이트" : "Live", href: fm.url });
  if (fm.repo) externals.push({ label: "Repo", href: fm.repo });

  return (
    <article className="rounded-md border border-paper-line bg-white p-5 transition hover:border-accent">
      <header className="flex items-start justify-between gap-3">
        <Link
          href={localizedPath(locale, `/projects/${project.slug}`)}
          className="text-base font-medium text-ink hover:text-accent md:text-lg"
        >
          {fm.title}
        </Link>
        <span className="shrink-0 rounded-full border border-paper-line bg-paper-line/40 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-ink-muted">
          {STATUS_COPY[locale][fm.status]}
        </span>
      </header>
      <p className="mt-2 text-sm text-ink-muted">{fm.description}</p>
      {fm.stack && fm.stack.length > 0 ? (
        <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
          {fm.stack.join(" · ")}
        </p>
      ) : null}
      {externals.length > 0 ? (
        <div className="mt-3 flex gap-3 text-xs">
          {externals.map((e) => (
            <a
              key={e.href}
              href={e.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {e.label} ↗
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}

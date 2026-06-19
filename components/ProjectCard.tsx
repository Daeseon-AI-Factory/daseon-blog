import Link from "next/link";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

const STATUS_COPY = {
  en: { active: "active", shipped: "shipped", archived: "archived" },
  ko: { active: "진행 중", shipped: "출시됨", archived: "종료" },
} as const;

export function ProjectCard({
  project,
  locale,
  prominent = false,
}: {
  project: Project;
  locale: Locale;
  prominent?: boolean;
}) {
  const fm = project.frontmatter;
  const href = localizedPath(locale, `/projects/${project.slug}`);
  const isLive = Boolean(fm.url && fm.url !== fm.repo);
  const externals: { label: string; href: string }[] = [];
  if (isLive) externals.push({ label: locale === "ko" ? "사이트" : "Live", href: fm.url });
  if (fm.repo) externals.push({ label: "Repo", href: fm.repo });

  return (
    <article className="group flex flex-col overflow-hidden rounded-md border border-paper-line bg-white transition hover:border-accent">
      {fm.image ? (
        <Link
          href={href}
          aria-label={fm.title}
          className="block overflow-hidden border-b border-paper-line bg-paper-line/20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fm.image}
            alt={fm.title}
            loading="lazy"
            className={`w-full object-cover transition duration-300 group-hover:scale-[1.02] ${
              prominent ? "aspect-[1200/630]" : "aspect-[2/1]"
            }`}
          />
        </Link>
      ) : null}
      <div className={prominent ? "p-6" : "p-5"}>
        <header className="flex items-start justify-between gap-3">
          <Link
            href={href}
            className={`font-medium text-ink hover:text-accent ${
              prominent ? "text-lg md:text-xl" : "text-base md:text-lg"
            }`}
          >
            {fm.title}
          </Link>
          <span className="flex shrink-0 items-center gap-1.5">
            {isLive ? (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden
              />
            ) : null}
            <span className="rounded-full border border-paper-line bg-paper-line/40 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-ink-muted">
              {isLive && fm.status === "active"
                ? locale === "ko"
                  ? "라이브"
                  : "live"
                : STATUS_COPY[locale][fm.status]}
            </span>
          </span>
        </header>
        <p className="mt-2 text-sm text-ink-muted">{fm.description}</p>
        {fm.stack && fm.stack.length > 0 ? (
          <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
            {(prominent ? fm.stack : fm.stack.slice(0, 6)).join(" · ")}
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
      </div>
    </article>
  );
}

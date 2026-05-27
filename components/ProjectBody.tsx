import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import Link from "next/link";

const STATUS_COPY = {
  en: { active: "Active", shipped: "Shipped", archived: "Archived" },
  ko: { active: "진행 중", shipped: "출시됨", archived: "종료" },
} as const;

export async function ProjectBody({
  project,
  translation,
  locale,
}: {
  project: Project;
  translation: Project | null;
  locale: Locale;
}) {
  const rendered = await renderMdx(project.content);
  const fm = project.frontmatter;
  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
          {STATUS_COPY[locale][fm.status]} · {formatDate(fm.date, locale)}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {fm.title}
        </h1>
        <p className="mt-3 text-lg text-ink-muted">{fm.description}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
          {fm.url ? (
            <a
              href={fm.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-ink px-3 py-1.5 font-medium text-paper hover:bg-ink/85"
            >
              {locale === "ko" ? "사이트 보기" : "Visit site"} ↗
            </a>
          ) : null}
          {fm.repo ? (
            <a
              href={fm.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md border border-paper-line bg-white px-3 py-1.5 text-ink hover:border-accent"
            >
              GitHub ↗
            </a>
          ) : null}
          {translation ? (
            <Link
              href={localizedPath(translation.locale, `/projects/${translation.slug}`)}
              className="text-accent hover:underline"
            >
              {locale === "ko" ? "English version →" : "한국어 버전 →"}
            </Link>
          ) : null}
        </div>
        {(fm.stack && fm.stack.length > 0) || fm.role ? (
          <dl className="mt-6 grid gap-2 text-sm sm:grid-cols-[6rem_1fr]">
            {fm.role ? (
              <>
                <dt className="text-ink-muted">{locale === "ko" ? "역할" : "Role"}</dt>
                <dd>{fm.role}</dd>
              </>
            ) : null}
            {fm.stack && fm.stack.length > 0 ? (
              <>
                <dt className="text-ink-muted">{locale === "ko" ? "스택" : "Stack"}</dt>
                <dd className="font-mono text-[0.85rem]">{fm.stack.join(" · ")}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </header>
      <div className="prose">{rendered}</div>
    </article>
  );
}

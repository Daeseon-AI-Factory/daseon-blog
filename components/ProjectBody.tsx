import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/format";
import { type Locale, localizedPath } from "@/lib/i18n";
import type { Project } from "@/lib/projects";
import { listProjectLogs } from "@/lib/logs";
import { hasProjectReadme } from "@/lib/readme";
import { LogTimeline } from "@/components/LogTimeline";
import { ProjectStatusHeader } from "@/components/ProjectStatusHeader";
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
  const allLogs = await listProjectLogs(project.slug, fm.logSourceRepo, locale);
  const publicLogs = allLogs.filter((e) => e.frontmatter.visibility === "public");
  const readmeExists = await hasProjectReadme(project.slug, locale);
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
          {fm.url && fm.url !== fm.repo ? (
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
          {readmeExists ? (
            <Link
              href={localizedPath(locale, `/projects/${project.slug}/readme`)}
              className="rounded-md border border-paper-line bg-white px-3 py-1.5 text-ink hover:border-accent"
            >
              {locale === "ko" ? "전체 README →" : "Full README →"}
            </Link>
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

      {publicLogs.length > 0 ? (
        <section className="mt-16 border-t border-paper-line pt-10">
          <header className="mb-6">
            <h2 className="text-xl font-medium tracking-tight">
              {locale === "ko" ? "프로젝트 로그" : "Project log"}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {locale === "ko"
                ? "이 프로젝트를 만들면서 남긴 트러블슈팅 · 회고 · 업데이트의 시간순 기록."
                : "Chronological record of troubleshooting, retros, and updates while building this."}
            </p>
            <ProjectStatusHeader
              project={project.slug}
              entries={publicLogs}
              locale={locale}
            />
          </header>
          <LogTimeline project={project.slug} entries={publicLogs} locale={locale} />
        </section>
      ) : null}
    </article>
  );
}

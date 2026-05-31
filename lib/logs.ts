import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "./i18n";
import { listDirs, listFiles, readText } from "./source";
import {
  type LogKind,
  type LogEntry,
  type LogFrontmatter,
  type LogVisibility,
  LOG_KINDS,
  LOG_KIND_LABELS,
} from "./log-kinds";

export { LOG_KINDS, LOG_KIND_LABELS };
export type { LogKind, LogEntry, LogFrontmatter, LogVisibility };

type Visibility = LogVisibility;

const LOG_ROOT = "content/logs";

function defaultLogVisibility(kind: LogKind): Visibility {
  if (kind === "business" || kind === "monetization") return "private";
  return "public";
}

async function readLogFile(project: string, fileName: string, sourceRepo?: string): Promise<LogEntry | null> {
  if (!fileName.endsWith(".mdx")) return null;
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = await readText(`${LOG_ROOT}/${project}/${fileName}`, sourceRepo ? { repo: sourceRepo } : undefined);
  if (!raw) return null;
  const { data, content } = matter(raw);
  const fm = data as Partial<Omit<LogFrontmatter, "date">> & { date?: unknown };
  if (!fm.title || !fm.date || !fm.kind) return null;
  const dateStr =
    typeof fm.date === "string"
      ? fm.date
      : fm.date instanceof Date
        ? fm.date.toISOString().slice(0, 10)
        : null;
  if (!dateStr) return null;
  const kind = fm.kind as LogKind;
  if (!LOG_KINDS.includes(kind)) return null;
  const frontmatter: LogFrontmatter = {
    title: fm.title,
    date: dateStr,
    language: (fm.language as Locale) ?? "en",
    project,
    kind,
    visibility: (fm.visibility as Visibility) ?? defaultLogVisibility(kind),
    summary: fm.summary,
    tags: fm.tags,
    handwritten: fm.handwritten,
  };
  return {
    project,
    slug,
    kind,
    frontmatter,
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

export async function listProjectLogs(
  project: string,
  sourceRepo?: string,
  locale?: Locale,
): Promise<LogEntry[]> {
  const entries = await listFiles(`${LOG_ROOT}/${project}`, sourceRepo ? { repo: sourceRepo } : undefined);
  // Exclude `.human.mdx` companion files — they attach to a sibling entry, not stand alone.
  const items = await Promise.all(
    entries
      .filter((f) => !f.endsWith(".human.mdx"))
      .map((f) => readLogFile(project, f, sourceRepo)),
  );
  const all = items.filter((e): e is LogEntry => Boolean(e));
  // Locale filter: bilingual satellites pair `<event>.en.mdx` + `<event>.ko.mdx`
  // (or use `language` frontmatter). Show only entries matching the requested locale.
  // Fallback: if the satellite has no entries in the requested locale, show everything
  // (covers English-only satellites being viewed on a KO project page).
  const filtered = locale
    ? all.filter((e) => (e.frontmatter.language ?? "en") === locale)
    : all;
  const result = filtered.length > 0 ? filtered : all;
  return result.sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? -1 : 1));
}

export async function getProjectLog(project: string, slug: string, sourceRepo?: string): Promise<LogEntry | null> {
  return readLogFile(project, `${slug}.mdx`, sourceRepo);
}

/**
 * Lists every slug that has a `<slug>.human.mdx` companion in this blog repo
 * for the given project. Used by the admin UI to mark "has companion / add companion."
 * Returns a Set of slugs (without `.human.mdx`).
 */
export async function listHumanCompanions(project: string): Promise<Set<string>> {
  const files = await listFiles(`${LOG_ROOT}/${project}`);
  const slugs = new Set<string>();
  for (const f of files) {
    if (f.endsWith(".human.mdx")) {
      slugs.add(f.replace(/\.human\.mdx$/, ""));
    }
  }
  return slugs;
}

/**
 * Reads the optional `<slug>.human.mdx` companion for a log entry.
 *
 * Important: companions live in THIS BLOG REPO, never in the satellite. The AI
 * entry is satellite development history; the companion is *blog content* —
 * how the author sees that entry from the blog's perspective. So the AI body
 * is fetched from the satellite (via `getProjectLog`'s sourceRepo) but the
 * companion always comes from this repo at `content/logs/<project>/<slug>.human.mdx`.
 *
 * Body-only — frontmatter (if any) is stripped. Returns null if no companion exists.
 */
export async function getHumanCompanion(
  project: string,
  slug: string,
): Promise<string | null> {
  const raw = await readText(`${LOG_ROOT}/${project}/${slug}.human.mdx`);
  if (!raw) return null;
  const { content } = matter(raw);
  return content.trim() ? content : null;
}

export async function listAllLogs(): Promise<LogEntry[]> {
  const projects = await listDirs(LOG_ROOT);
  const lists = await Promise.all(projects.map((p) => listProjectLogs(p)));
  return lists.flat();
}

export function logRepoPath(project: string, slug: string): string {
  return `${LOG_ROOT}/${project}/${slug}.mdx`;
}

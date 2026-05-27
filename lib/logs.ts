import matter from "gray-matter";
import readingTime from "reading-time";
import type { Locale } from "./i18n";
import { listDirs, listFiles, readText } from "./source";
import type { Visibility } from "./posts";
import { type LogKind, LOG_KINDS, LOG_KIND_LABELS } from "./log-kinds";

export { LOG_KINDS, LOG_KIND_LABELS };
export type { LogKind };

export type LogFrontmatter = {
  title: string;
  date: string;
  language: Locale;
  project: string;
  kind: LogKind;
  visibility: Visibility;
  summary?: string;
  tags?: string[];
};

export type LogEntry = {
  project: string;
  slug: string;
  kind: LogKind;
  frontmatter: LogFrontmatter;
  content: string;
  readingMinutes: number;
};

const LOG_ROOT = "content/logs";

function defaultLogVisibility(kind: LogKind): Visibility {
  if (kind === "business" || kind === "monetization") return "private";
  return "public";
}

async function readLogFile(project: string, fileName: string): Promise<LogEntry | null> {
  if (!fileName.endsWith(".mdx")) return null;
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = await readText(`${LOG_ROOT}/${project}/${fileName}`);
  if (!raw) return null;
  const { data, content } = matter(raw);
  const fm = data as Partial<LogFrontmatter>;
  if (!fm.title || !fm.date || !fm.kind) return null;
  const kind = fm.kind as LogKind;
  if (!LOG_KINDS.includes(kind)) return null;
  const frontmatter: LogFrontmatter = {
    title: fm.title,
    date: fm.date,
    language: (fm.language as Locale) ?? "en",
    project,
    kind,
    visibility: (fm.visibility as Visibility) ?? defaultLogVisibility(kind),
    summary: fm.summary,
    tags: fm.tags,
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

export async function listProjectLogs(project: string): Promise<LogEntry[]> {
  const entries = await listFiles(`${LOG_ROOT}/${project}`);
  const items = await Promise.all(entries.map((f) => readLogFile(project, f)));
  return items
    .filter((e): e is LogEntry => Boolean(e))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export async function getProjectLog(project: string, slug: string): Promise<LogEntry | null> {
  return readLogFile(project, `${slug}.mdx`);
}

export async function listAllLogs(): Promise<LogEntry[]> {
  const projects = await listDirs(LOG_ROOT);
  const lists = await Promise.all(projects.map((p) => listProjectLogs(p)));
  return lists.flat();
}

export function logRepoPath(project: string, slug: string): string {
  return `${LOG_ROOT}/${project}/${slug}.mdx`;
}

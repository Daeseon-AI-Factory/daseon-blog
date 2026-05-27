import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { type Locale, LOCALES } from "./i18n";

export type ProjectStatus = "active" | "shipped" | "archived";

export type ProjectFrontmatter = {
  title: string;
  description: string;
  date: string;
  language: Locale;
  translationKey?: string;
  status: ProjectStatus;
  featured: boolean;
  url?: string;
  repo?: string;
  tags?: string[];
  stack?: string[];
  role?: string;
};

export type Project = {
  slug: string;
  locale: Locale;
  frontmatter: ProjectFrontmatter;
  content: string;
};

const ROOT = path.join(process.cwd(), "content", "projects");

async function readProjectFile(locale: Locale, fileName: string): Promise<Project | null> {
  if (!fileName.endsWith(".mdx")) return null;
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = await fs.readFile(path.join(ROOT, locale, fileName), "utf-8");
  const { data, content } = matter(raw);
  const fm = data as Partial<ProjectFrontmatter>;
  if (!fm.title || !fm.date || !fm.description) return null;
  const frontmatter: ProjectFrontmatter = {
    title: fm.title,
    description: fm.description,
    date: fm.date,
    language: (fm.language as Locale) ?? locale,
    translationKey: fm.translationKey,
    status: (fm.status as ProjectStatus) ?? "active",
    featured: Boolean(fm.featured),
    url: fm.url,
    repo: fm.repo,
    tags: fm.tags,
    stack: fm.stack,
    role: fm.role,
  };
  return { slug, locale, frontmatter, content };
}

async function listLocale(locale: Locale): Promise<Project[]> {
  const dir = path.join(ROOT, locale);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const projects = await Promise.all(entries.map((f) => readProjectFile(locale, f)));
  return projects
    .filter((p): p is Project => Boolean(p))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

export async function getAllProjects(locale: Locale): Promise<Project[]> {
  return listLocale(locale);
}

export async function getFeaturedProjects(locale: Locale, limit = 3): Promise<Project[]> {
  const all = await listLocale(locale);
  const featured = all.filter((p) => p.frontmatter.featured);
  return featured.slice(0, limit);
}

export async function getProject(locale: Locale, slug: string): Promise<Project | null> {
  const all = await listLocale(locale);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function findProjectTranslation(p: Project): Promise<Project | null> {
  const key = p.frontmatter.translationKey;
  if (!key) return null;
  const other: Locale = p.locale === "en" ? "ko" : "en";
  const candidates = await listLocale(other);
  return candidates.find((c) => c.frontmatter.translationKey === key) ?? null;
}

export async function getAllProjectsAcrossLocales(): Promise<Project[]> {
  const lists = await Promise.all(LOCALES.map((l) => listLocale(l)));
  return lists.flat();
}

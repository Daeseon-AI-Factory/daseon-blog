import matter from "gray-matter";
import { type Locale, LOCALES } from "./i18n";
import { listFiles, readText } from "./source";

export type ProjectStatus = "active" | "shipped" | "archived";

export type ProjectFrontmatter = {
  title: string;
  description: string;
  date: string;
  language: Locale;
  translationKey?: string;
  status: ProjectStatus;
  featured: boolean;
  url: string; // required — live service link, shown as the primary CTA
  repo?: string;
  /** Optional hero screenshot — path in /public or an absolute URL. */
  image?: string;
  /**
   * "owner/name" — if set, the project log timeline is fetched from this repo's
   * content/logs/<slug>/ directory instead of this blog's. Lets each project
   * keep its own dual-write log in its own repo while the blog aggregates.
   */
  logSourceRepo?: string;
  /**
   * Directory name inside the satellite repo's content/logs/ to read from.
   * Defaults to the project slug. Set this when the satellite stores its logs
   * under a name that differs from the blog slug (slug != reponame != logdir).
   */
  logSourceDir?: string;
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

function relativeDir(locale: Locale): string {
  return `content/projects/${locale}`;
}

async function readProjectFile(locale: Locale, fileName: string): Promise<Project | null> {
  if (!fileName.endsWith(".mdx")) return null;
  const slug = fileName.replace(/\.mdx$/, "");
  const raw = await readText(`${relativeDir(locale)}/${fileName}`);
  if (!raw) return null;
  const { data, content } = matter(raw);
  const fm = data as Partial<Omit<ProjectFrontmatter, "date">> & { date?: unknown };
  // Required: title, date, description, AND live url (Live link is non-negotiable).
  // Repo is encouraged but optional (some projects ship before source is public).
  if (!fm.title || !fm.date || !fm.description || !fm.url) return null;
  const dateStr =
    typeof fm.date === "string"
      ? fm.date
      : fm.date instanceof Date
        ? fm.date.toISOString().slice(0, 10)
        : null;
  if (!dateStr) return null;
  const frontmatter: ProjectFrontmatter = {
    title: fm.title,
    description: fm.description,
    date: dateStr,
    language: (fm.language as Locale) ?? locale,
    translationKey: fm.translationKey,
    status: (fm.status as ProjectStatus) ?? "active",
    featured: Boolean(fm.featured),
    url: fm.url,
    repo: fm.repo,
    image: fm.image,
    logSourceRepo: fm.logSourceRepo,
    logSourceDir: fm.logSourceDir,
    tags: fm.tags,
    stack: fm.stack,
    role: fm.role,
  };
  return { slug, locale, frontmatter, content };
}

async function listLocale(locale: Locale): Promise<Project[]> {
  const entries = await listFiles(relativeDir(locale));
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
  return readProjectFile(locale, `${slug}.mdx`);
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

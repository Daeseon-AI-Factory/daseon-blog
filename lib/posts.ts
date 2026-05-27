import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { type Locale, LOCALES } from "./i18n";

export type ContentType = "post" | "note" | "knowledge";
export type Visibility = "public" | "unlisted" | "private";
export type PostStatus = "draft" | "published";
export type Confidence = "fact" | "opinion" | "exploration";

export type PostFrontmatter = {
  title: string;
  description?: string;
  date: string;
  updated?: string;
  language: Locale;
  translationKey?: string;
  tags?: string[];
  status?: PostStatus;
  format?: "multi-register" | "before-after" | "note";
  distribution?: Record<string, boolean>;
  type?: ContentType;
  visibility?: Visibility;
  summary?: string;
  sources?: string[];
  confidence?: Confidence;
};

export type Post = {
  slug: string;
  locale: Locale;
  type: ContentType;
  frontmatter: PostFrontmatter;
  content: string;
  readingMinutes: number;
};

const CONTENT_ROOT = path.join(process.cwd(), "content");

const TYPE_DIRS: Record<ContentType, string> = {
  post: "posts",
  note: "notes",
  knowledge: "knowledge",
};

function defaultVisibility(type: ContentType): Visibility {
  if (type === "note") return "private";
  if (type === "knowledge") return "unlisted";
  return "public";
}

function rootFor(type: ContentType): string {
  return path.join(CONTENT_ROOT, TYPE_DIRS[type]);
}

async function readContentFile(type: ContentType, locale: Locale, fileName: string): Promise<Post | null> {
  if (!fileName.endsWith(".mdx")) return null;
  const slug = fileName.replace(/\.mdx$/, "");
  const filePath = path.join(rootFor(type), locale, fileName);
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  const fm = data as Partial<PostFrontmatter>;
  if (!fm.title || !fm.date) return null;

  const frontmatter: PostFrontmatter = {
    title: fm.title,
    description: fm.description,
    date: fm.date,
    updated: fm.updated,
    language: (fm.language as Locale) ?? locale,
    translationKey: fm.translationKey,
    tags: fm.tags,
    status: fm.status ?? "published",
    format: fm.format,
    distribution: fm.distribution,
    type: (fm.type as ContentType) ?? type,
    visibility: (fm.visibility as Visibility) ?? defaultVisibility(type),
    summary: fm.summary,
    sources: fm.sources,
    confidence: fm.confidence as Confidence | undefined,
  };

  return {
    slug,
    locale,
    type,
    frontmatter,
    content,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
  };
}

async function listLocaleType(type: ContentType, locale: Locale): Promise<Post[]> {
  const dir = path.join(rootFor(type), locale);
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  const items = await Promise.all(entries.map((f) => readContentFile(type, locale, f)));
  return items
    .filter((p): p is Post => Boolean(p))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));
}

function isPublic(p: Post): boolean {
  return (p.frontmatter.visibility ?? "public") === "public" && p.frontmatter.status !== "draft";
}

export async function getPublishedPosts(locale: Locale): Promise<Post[]> {
  const all = await listLocaleType("post", locale);
  return all.filter(isPublic);
}

export async function getAllPosts(): Promise<Post[]> {
  const lists = await Promise.all(LOCALES.map((l) => listLocaleType("post", l)));
  return lists.flat();
}

export async function getDraftPosts(): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.frontmatter.status === "draft");
}

export async function getPost(locale: Locale, slug: string): Promise<Post | null> {
  const all = await listLocaleType("post", locale);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function findTranslation(post: Post): Promise<Post | null> {
  const key = post.frontmatter.translationKey;
  if (!key) return null;
  const otherLocale: Locale = post.locale === "en" ? "ko" : "en";
  const candidates = await listLocaleType(post.type, otherLocale);
  return candidates.find((p) => p.frontmatter.translationKey === key) ?? null;
}

export async function getContentItem(
  type: ContentType,
  locale: Locale,
  slug: string,
): Promise<Post | null> {
  const all = await listLocaleType(type, locale);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function listContent(type: ContentType, locale: Locale): Promise<Post[]> {
  return listLocaleType(type, locale);
}

export async function getAllContentAcrossTypes(): Promise<Post[]> {
  const types: ContentType[] = ["post", "note", "knowledge"];
  const lists = await Promise.all(
    types.flatMap((t) => LOCALES.map((l) => listLocaleType(t, l))),
  );
  return lists.flat();
}

export function relativePathFor(type: ContentType, locale: Locale, slug: string): string {
  return `content/${TYPE_DIRS[type]}/${locale}/${slug}.mdx`;
}

export function absolutePathFor(type: ContentType, locale: Locale, slug: string): string {
  return path.join(rootFor(type), locale, `${slug}.mdx`);
}

export { TYPE_DIRS };

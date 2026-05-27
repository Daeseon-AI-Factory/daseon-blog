import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { commitFile, deleteFile, githubConfigured } from "./github";
import type { Locale } from "./i18n";
import type { ProjectFrontmatter } from "./projects";

function relativeFile(locale: Locale, slug: string): string {
  return `content/projects/${locale}/${slug}.mdx`;
}

function absolutePath(locale: Locale, slug: string): string {
  return path.join(process.cwd(), relativeFile(locale, slug));
}

export async function projectFileExists(locale: Locale, slug: string): Promise<boolean> {
  try {
    await fs.access(absolutePath(locale, slug));
    return true;
  } catch {
    return false;
  }
}

export function serializeProjectMdx(frontmatter: ProjectFrontmatter, body: string): string {
  const trimmedBody = body.endsWith("\n") ? body : `${body}\n`;
  const data: Record<string, unknown> = {
    title: frontmatter.title,
    description: frontmatter.description,
    date: frontmatter.date,
    language: frontmatter.language,
    translationKey: frontmatter.translationKey || undefined,
    status: frontmatter.status,
    featured: frontmatter.featured,
    url: frontmatter.url,
    repo: frontmatter.repo || undefined,
    tags: frontmatter.tags && frontmatter.tags.length > 0 ? frontmatter.tags : undefined,
    stack: frontmatter.stack && frontmatter.stack.length > 0 ? frontmatter.stack : undefined,
    role: frontmatter.role || undefined,
  };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return matter.stringify(trimmedBody, data);
}

export type ProjectSaveResult = {
  path: string;
  via: "github" | "local";
  commitUrl?: string;
};

export async function saveProject({
  locale,
  slug,
  content,
  message,
}: {
  locale: Locale;
  slug: string;
  content: string;
  message: string;
}): Promise<ProjectSaveResult> {
  const rel = relativeFile(locale, slug);

  if (githubConfigured()) {
    const res = await commitFile({ path: rel, content, message });
    return { path: rel, via: "github", commitUrl: res.commitUrl };
  }

  const abs = absolutePath(locale, slug);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, "utf-8");
  return { path: rel, via: "local" };
}

export async function deleteProject({
  locale,
  slug,
  message,
}: {
  locale: Locale;
  slug: string;
  message: string;
}): Promise<ProjectSaveResult> {
  const rel = relativeFile(locale, slug);

  if (githubConfigured()) {
    await deleteFile({ path: rel, message });
    return { path: rel, via: "github" };
  }

  const abs = absolutePath(locale, slug);
  try {
    await fs.unlink(abs);
  } catch {
    /* may already be gone */
  }
  return { path: rel, via: "local" };
}

import matter from "gray-matter";
import type { PostFrontmatter } from "./posts";

export function serializeMdx(frontmatter: PostFrontmatter, body: string): string {
  const trimmedBody = body.endsWith("\n") ? body : `${body}\n`;
  const data: Record<string, unknown> = {
    title: frontmatter.title,
    description: frontmatter.description ?? undefined,
    date: frontmatter.date,
    updated: frontmatter.updated ?? undefined,
    language: frontmatter.language,
    translationKey: frontmatter.translationKey ?? undefined,
    tags: frontmatter.tags && frontmatter.tags.length > 0 ? frontmatter.tags : undefined,
    status: frontmatter.status ?? "published",
    format: frontmatter.format ?? undefined,
    type: frontmatter.type ?? undefined,
    visibility: frontmatter.visibility ?? undefined,
    summary: frontmatter.summary ?? undefined,
    sources: frontmatter.sources && frontmatter.sources.length > 0 ? frontmatter.sources : undefined,
    confidence: frontmatter.confidence ?? undefined,
  };
  Object.keys(data).forEach((k) => data[k] === undefined && delete data[k]);
  return matter.stringify(trimmedBody, data);
}

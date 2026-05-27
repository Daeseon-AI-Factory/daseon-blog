import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getContentItem, type ContentType } from "@/lib/posts";
import { isLocale } from "@/lib/i18n";
import { githubConfigured } from "@/lib/github";
import { crosspostConfigured } from "@/lib/crosspost";

export const dynamic = "force-dynamic";

type Params = Promise<{ locale: string; slug: string }>;

const TYPES: ContentType[] = ["post", "note", "knowledge"];

export default async function EditPostPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  let found: Awaited<ReturnType<typeof getContentItem>> = null;
  for (const t of TYPES) {
    found = await getContentItem(t, locale, slug);
    if (found) break;
  }
  if (!found) notFound();
  const post = found;

  return (
    <PostEditor
      mode="edit"
      crosspostAvailable={crosspostConfigured()}
      savingVia={githubConfigured() ? "github" : "local"}
      initial={{
        locale,
        slug,
        type: post.type,
        visibility: post.frontmatter.visibility ?? "public",
        title: post.frontmatter.title,
        description: post.frontmatter.description ?? "",
        date: post.frontmatter.date,
        translationKey: post.frontmatter.translationKey ?? "",
        tags: (post.frontmatter.tags ?? []).join(", "),
        status: post.frontmatter.status ?? "published",
        format: (post.frontmatter.format ?? "") as "" | "multi-register" | "before-after" | "note",
        summary: post.frontmatter.summary ?? "",
        sources: (post.frontmatter.sources ?? []).join("\n"),
        confidence: (post.frontmatter.confidence ?? "") as "" | "fact" | "opinion" | "exploration",
        body: post.content,
      }}
    />
  );
}

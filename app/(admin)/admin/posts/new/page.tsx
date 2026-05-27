import { PostEditor } from "@/components/admin/PostEditor";
import { githubConfigured } from "@/lib/github";
import { crosspostConfigured } from "@/lib/crosspost";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ type?: string }>;

const VALID = new Set(["post", "note", "knowledge"]);

export default async function NewPostPage({ searchParams }: { searchParams: SearchParams }) {
  const { type: requested } = await searchParams;
  const type = (requested && VALID.has(requested) ? requested : "post") as "post" | "note" | "knowledge";

  const visibility = type === "note" ? "private" : type === "knowledge" ? "unlisted" : "public";

  return (
    <PostEditor
      mode="new"
      crosspostAvailable={crosspostConfigured()}
      savingVia={githubConfigured() ? "github" : "local"}
      initial={{
        locale: "en",
        slug: "",
        type,
        visibility,
        title: "",
        description: "",
        date: new Date().toISOString().slice(0, 10),
        translationKey: "",
        tags: "",
        status: "draft",
        format: "",
        summary: "",
        sources: "",
        confidence: "",
        body: "",
      }}
    />
  );
}

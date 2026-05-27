import Link from "next/link";
import { getAllContentAcrossTypes, type ContentType } from "@/lib/posts";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { githubConfigured } from "@/lib/github";
import { crosspostConfigured } from "@/lib/crosspost";

export const revalidate = 0;

type SearchParams = Promise<{ type?: ContentType; visibility?: "public" | "unlisted" | "private"; status?: "draft" | "published" }>;

export default async function PostsPage({ searchParams }: { searchParams: SearchParams }) {
  const { type, visibility, status } = await searchParams;
  const all = await getAllContentAcrossTypes();
  const filtered = all
    .filter((p) => (type ? p.type === type : true))
    .filter((p) => (visibility ? (p.frontmatter.visibility ?? "public") === visibility : true))
    .filter((p) => (status ? (p.frontmatter.status ?? "published") === status : true))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1));

  const gh = githubConfigured();
  const cp = crosspostConfigured();

  function chipHref(next: Partial<{ type: ContentType; visibility: "public" | "unlisted" | "private"; status: "draft" | "published" }>): string {
    const q = new URLSearchParams();
    if (next.type ?? type) q.set("type", (next.type ?? type) as string);
    if (next.visibility ?? visibility) q.set("visibility", (next.visibility ?? visibility) as string);
    if (next.status ?? status) q.set("status", (next.status ?? status) as string);
    const s = q.toString();
    return s ? `/admin/posts?${s}` : "/admin/posts";
  }

  function chipClassActive(active: boolean) {
    return `rounded-full border px-3 py-1 text-xs ${active ? "border-ink bg-ink text-paper" : "border-paper-line text-ink-muted hover:border-accent"}`;
  }

  const counts = {
    post: all.filter((p) => p.type === "post").length,
    note: all.filter((p) => p.type === "note").length,
    knowledge: all.filter((p) => p.type === "knowledge").length,
    draft: all.filter((p) => p.frontmatter.status === "draft").length,
    published: all.filter((p) => p.frontmatter.status !== "draft").length,
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">Content</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Posts, notes, and knowledge cards.{" "}
            {gh ? "Saves via GitHub commit." : "Saving to local file system (no GITHUB_TOKEN set)."}
            {cp ? " Crosspost webhook configured." : " No crosspost webhook configured."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/posts/new?type=note"
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink hover:border-accent"
          >
            + Note
          </Link>
          <Link
            href="/admin/posts/new?type=knowledge"
            className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink hover:border-accent"
          >
            + Knowledge
          </Link>
          <Link
            href="/admin/posts/new"
            className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink/85"
          >
            + Post
          </Link>
        </div>
      </header>

      <div className="flex flex-wrap gap-4">
        <nav className="flex flex-wrap gap-2">
          <span className="self-center font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">type</span>
          <Link href={chipHref({ type: undefined })} className={chipClassActive(!type)}>
            All ({all.length})
          </Link>
          <Link href={chipHref({ type: "post" })} className={chipClassActive(type === "post")}>
            Posts ({counts.post})
          </Link>
          <Link href={chipHref({ type: "note" })} className={chipClassActive(type === "note")}>
            Notes ({counts.note})
          </Link>
          <Link href={chipHref({ type: "knowledge" })} className={chipClassActive(type === "knowledge")}>
            Knowledge ({counts.knowledge})
          </Link>
        </nav>
        <nav className="flex flex-wrap gap-2">
          <span className="self-center font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">status</span>
          <Link href={chipHref({ status: undefined })} className={chipClassActive(!status)}>
            Any
          </Link>
          <Link href={chipHref({ status: "published" })} className={chipClassActive(status === "published")}>
            Published ({counts.published})
          </Link>
          <Link href={chipHref({ status: "draft" })} className={chipClassActive(status === "draft")}>
            Draft ({counts.draft})
          </Link>
        </nav>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-paper-line bg-white p-6 text-sm text-ink-muted">
          No items match.
        </p>
      ) : (
        <ul className="divide-y divide-paper-line rounded-md border border-paper-line bg-white">
          {filtered.map((p) => {
            const vis = p.frontmatter.visibility ?? "public";
            return (
              <li key={`${p.type}-${p.locale}-${p.slug}`} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/admin/posts/${p.locale}/${p.slug}/edit`}
                    className="block truncate font-medium text-ink hover:text-accent"
                  >
                    {p.frontmatter.title}
                  </Link>
                  <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
                    {p.type} · {p.locale} · {p.frontmatter.status ?? "published"} · {vis} · {p.frontmatter.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {p.type === "post" && vis === "public" && p.frontmatter.status !== "draft" ? (
                    <Link
                      href={p.locale === "en" ? `/posts/${p.slug}` : `/${p.locale}/posts/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-ink-muted hover:text-ink"
                    >
                      View
                    </Link>
                  ) : null}
                  <Link
                    href={`/admin/posts/${p.locale}/${p.slug}/edit`}
                    className="text-xs text-accent hover:underline"
                  >
                    Edit
                  </Link>
                  <DeletePostButton locale={p.locale} slug={p.slug} title={p.frontmatter.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

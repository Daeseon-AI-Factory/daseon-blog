import Link from "next/link";
import { getAllPosts, getDraftPosts } from "@/lib/posts";

export const revalidate = 0;

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const inner = (
    <div className="rounded-md border border-paper-line bg-white p-5">
      <p className="font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">{label}</p>
      <p className="mt-2 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function AdminHome() {
  const [all, drafts] = await Promise.all([getAllPosts(), getDraftPosts()]);
  const published = all.filter((p) => p.frontmatter.status !== "draft");
  const en = published.filter((p) => p.locale === "en").length;
  const ko = published.filter((p) => p.locale === "ko").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium">Overview</h1>
        <p className="mt-1 text-sm text-ink-muted">
          What&apos;s in the repo right now.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Published EN" value={en} href="/admin/posts?filter=published" />
        <Stat label="Published KO" value={ko} href="/admin/posts?filter=published" />
        <Stat label="Drafts" value={drafts.length} href="/admin/posts?filter=draft" />
        <Stat label="Total posts" value={all.length} href="/admin/posts" />
      </section>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-subtle">
          Recent
        </h2>
        <ul className="divide-y divide-paper-line rounded-md border border-paper-line bg-white">
          {all.slice(0, 8).map((p) => (
            <li key={`${p.locale}-${p.slug}`} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{p.frontmatter.title}</p>
                <p className="font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
                  {p.locale} · {p.frontmatter.status} · {p.frontmatter.date}
                </p>
              </div>
              <Link
                href={`/admin/posts/${p.locale}/${p.slug}/edit`}
                className="text-xs text-accent hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

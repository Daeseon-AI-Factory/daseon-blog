import { getAllPosts } from "@/lib/posts";
import { DistributionChecklist } from "@/components/admin/DistributionChecklist";

export const revalidate = 0;

const CHANNELS = ["LinkedIn", "X / Twitter", "Dev.to", "Hacker News", "Reddit r/MachineLearning"];

export default async function DistributionPage() {
  const all = await getAllPosts();
  const published = all.filter((p) => p.frontmatter.status !== "draft");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Distribution</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Per-post cross-posting checklist. State is stored in your browser only
          for v1 — replace with KV later if you need multi-device.
        </p>
      </div>
      <DistributionChecklist
        posts={published.map((p) => ({
          key: `${p.locale}:${p.slug}`,
          title: p.frontmatter.title,
          locale: p.locale,
          date: p.frontmatter.date,
        }))}
        channels={CHANNELS}
      />
    </div>
  );
}

import { SiteForm } from "@/components/admin/SiteForm";
import { loadSiteConfig } from "@/lib/site-storage";
import { githubConfigured } from "@/lib/github";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage() {
  const initial = await loadSiteConfig();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-medium">Site</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Profile, avatar, and social links shown across the site. Changes write
          to <code className="font-mono text-xs">content/site.json</code>.
        </p>
      </header>
      <SiteForm initial={initial} savingVia={githubConfigured() ? "github" : "local"} />
    </div>
  );
}

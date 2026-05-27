export const revalidate = 0;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Analytics</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Not wired up yet.
        </p>
      </div>
      <div className="rounded-md border border-paper-line bg-white p-6 text-sm">
        <p className="text-ink">
          v1: deliberately empty. When traffic is enough to bother measuring,
          add Plausible or Vercel Web Analytics here and surface per-post views
          + referral source. Don&apos;t add tracking before there&apos;s anything
          to track.
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-ink-muted">
          <li>Plausible: drop a script tag in <code>app/layout.tsx</code>, query the API per slug.</li>
          <li>Vercel Web Analytics: <code>@vercel/analytics</code>, no API yet.</li>
          <li>Roll-your-own: tiny edge route that logs to KV or Postgres.</li>
        </ul>
      </div>
    </div>
  );
}

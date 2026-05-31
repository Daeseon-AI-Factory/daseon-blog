"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type ProjectRow = {
  locale: "en" | "ko";
  slug: string;
  title: string;
  status: "active" | "shipped" | "archived";
  featured: boolean;
  url: string;
};

export function ProjectsList({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function toggleFeatured(p: ProjectRow) {
    const key = `${p.locale}-${p.slug}`;
    setPending(key);
    try {
      const res = await fetch(`/api/admin/projects/${p.locale}/${p.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: p.title,
          description: " ", // server preserves existing if blank, but title/url already required by validation
          url: p.url,
          featured: !p.featured,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.error ?? res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function remove(p: ProjectRow) {
    if (!confirm(`Delete project "${p.title}" (${p.locale}/${p.slug})? This commits a deletion to GitHub if configured.`)) return;
    setPending(`${p.locale}-${p.slug}`);
    try {
      const res = await fetch(`/api/admin/projects/${p.locale}/${p.slug}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`Failed: ${data.error ?? res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (projects.length === 0) {
    return (
      <p className="rounded-md border border-paper-line bg-white p-6 text-sm text-ink-muted">
        No projects yet. Click <strong>New project</strong> to create one.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-paper-line rounded-md border border-paper-line bg-white">
      {projects.map((p) => {
        const key = `${p.locale}-${p.slug}`;
        const isPending = pending === key;
        return (
          <li key={key} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <div className="min-w-0 flex-1">
              <Link
                href={`/admin/projects/${p.locale}/${p.slug}/edit`}
                className="block truncate font-medium text-ink hover:text-accent"
              >
                {p.title}
              </Link>
              <p className="mt-0.5 font-mono text-[0.7rem] uppercase tracking-widest text-ink-subtle">
                {p.locale} · {p.status} · {p.url}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleFeatured(p)}
                disabled={isPending}
                className={`rounded-full border px-3 py-1 text-xs ${
                  p.featured
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-paper-line text-ink-muted hover:border-accent"
                } disabled:opacity-50`}
                title={p.featured ? "Click to unfeature" : "Click to mark featured (shown on home)"}
              >
                {isPending ? "…" : p.featured ? "★ Featured" : "Mark featured"}
              </button>
              <Link
                href={p.locale === "en" ? `/projects/${p.slug}` : `/${p.locale}/projects/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-ink-muted hover:text-ink"
              >
                View
              </Link>
              <Link
                href={`/admin/projects/${p.locale}/${p.slug}/edit`}
                className="text-xs text-accent hover:underline"
              >
                Edit
              </Link>
              <Link
                href={`/admin/projects/${p.slug}/logs`}
                className="text-xs text-ink-muted hover:text-accent"
                title="Manage hand-written companions for this project's log entries"
              >
                Logs
              </Link>
              <button
                type="button"
                onClick={() => remove(p)}
                disabled={isPending}
                className="text-xs text-ink-subtle hover:text-accent disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function CompanionEditor({
  project,
  slug,
  initialBody,
  existed,
  backHref,
  publicHref,
}: {
  project: string;
  slug: string;
  initialBody: string;
  existed: boolean;
  backHref: string;
  publicHref: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    setMessage(null);
    const res = await fetch("/api/admin/log-companion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, slug, body }),
    });
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "Save failed.");
      return;
    }
    setMessage("Saved.");
    startTransition(() => router.refresh());
  }

  async function onDelete() {
    if (!existed) return;
    if (!confirm("Delete this companion?")) return;
    setMessage(null);
    const res = await fetch(
      `/api/admin/log-companion?project=${encodeURIComponent(project)}&slug=${encodeURIComponent(slug)}`,
      { method: "DELETE" },
    );
    const data = (await res.json()) as { ok: boolean; error?: string };
    if (!res.ok || !data.ok) {
      setMessage(data.error ?? "Delete failed.");
      return;
    }
    setMessage("Deleted.");
    startTransition(() => router.push(backHref));
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
        File: <code>content/logs/{project}/{slug}.human.mdx</code>
      </p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={20}
        placeholder="Your take on this entry. Markdown allowed. Body only — no frontmatter needed."
        className="block w-full rounded-md border border-paper-line bg-white p-3 font-mono text-sm text-ink"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
        >
          {existed ? "Update companion" : "Add companion"}
        </button>
        {existed ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-paper-line px-3 py-2 text-sm text-ink-muted hover:border-accent hover:text-ink"
          >
            Delete
          </button>
        ) : null}
        <a
          href={publicHref}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs uppercase tracking-widest text-ink-subtle hover:text-ink"
        >
          View on site ↗
        </a>
        {message ? <span className="text-sm text-ink-muted">{message}</span> : null}
      </div>
    </div>
  );
}

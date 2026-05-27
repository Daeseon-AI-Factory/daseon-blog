"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeletePostButton({ locale, slug, title }: { locale: string; slug: string; title: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (!confirm(`Delete "${title}"? This commits a deletion to GitHub if configured.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/posts/${locale}/${slug}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(`Failed: ${data.error ?? res.status}`);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-xs text-ink-subtle hover:text-accent disabled:opacity-50"
    >
      {busy ? "..." : "Delete"}
    </button>
  );
}

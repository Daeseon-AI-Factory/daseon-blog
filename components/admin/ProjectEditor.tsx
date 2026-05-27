"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/slug";

export type ProjectEditorShape = {
  locale: "en" | "ko";
  slug: string;
  title: string;
  description: string;
  date: string;
  translationKey: string;
  status: "active" | "shipped" | "archived";
  featured: boolean;
  url: string;
  repo: string;
  tags: string;
  stack: string;
  role: string;
  body: string;
};

type Props = {
  mode: "new" | "edit";
  initial: ProjectEditorShape;
  savingVia: "github" | "local";
};

const EMPTY_BODY = `Write a project page in MDX.

Conventions:

- Open with one sentence on what the project does + who it's for.
- Add sections like "Why", "What it does", "Status", "What's next".
- Avoid LinkedIn-guru words ("revolutionary", "game changer").
- Include concrete numbers when you have them.
`;

export function ProjectEditor({ mode, initial, savingVia }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectEditorShape>(initial);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");

  useEffect(() => {
    if (slugManuallyEdited) return;
    if (mode !== "new") return;
    const next = slugify(project.title);
    if (next !== project.slug) setProject((p) => ({ ...p, slug: next }));
  }, [project.title, project.slug, slugManuallyEdited, mode]);

  function update<K extends keyof ProjectEditorShape>(key: K, value: ProjectEditorShape[K]) {
    setProject((p) => ({ ...p, [key]: value }));
  }

  async function submit() {
    setBusy(true);
    setFeedback(null);

    const tags = project.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const stack = project.stack.split(",").map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...(mode === "new" ? { locale: project.locale, slug: project.slug } : {}),
      title: project.title,
      description: project.description,
      date: project.date || undefined,
      translationKey: project.translationKey || undefined,
      status: project.status,
      featured: project.featured,
      url: project.url,
      repo: project.repo || undefined,
      tags,
      stack,
      role: project.role || undefined,
      body: project.body,
    };

    try {
      const url =
        mode === "new"
          ? "/api/admin/projects"
          : `/api/admin/projects/${project.locale}/${project.slug}`;
      const method = mode === "new" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ tone: "err", text: data.error ?? `Failed (${res.status})` });
        return;
      }
      setFeedback({
        tone: "ok",
        text: data.commitUrl ? `Saved via ${data.via} · commit logged` : `Saved via ${data.via}`,
      });
      if (mode === "new") {
        router.push(`/admin/projects/${project.locale}/${project.slug}/edit`);
      }
      router.refresh();
    } catch (e) {
      setFeedback({ tone: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">
            {mode === "new" ? "New project" : "Edit project"}
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            Saving via <strong>{savingVia}</strong>
          </p>
        </div>
        <Link href="/admin/projects" className="text-sm text-ink-muted hover:text-ink">
          ← Projects
        </Link>
      </div>

      <input
        type="text"
        value={project.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Project title"
        className="w-full border-b border-paper-line bg-transparent py-2 text-2xl font-medium tracking-tight outline-none focus:border-accent"
      />

      <textarea
        value={project.description}
        onChange={(e) => update("description", e.target.value)}
        placeholder="One-line description shown on cards and meta tags"
        rows={2}
        className="w-full rounded-md border border-paper-line bg-white p-3 text-sm outline-none focus:border-accent"
      />

      <div className="grid gap-4 sm:grid-cols-[7rem_1fr_8rem_8rem]">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Language
          <select
            value={project.locale}
            onChange={(e) => update("locale", e.target.value as "en" | "ko")}
            disabled={mode === "edit"}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm disabled:bg-paper-line/40"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Slug
          <input
            type="text"
            value={project.slug}
            onChange={(e) => {
              setSlugManuallyEdited(true);
              update("slug", e.target.value);
            }}
            disabled={mode === "edit"}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm disabled:bg-paper-line/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Date
          <input
            type="date"
            value={project.date}
            onChange={(e) => update("date", e.target.value)}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Status
          <select
            value={project.status}
            onChange={(e) => update("status", e.target.value as ProjectEditorShape["status"])}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          >
            <option value="active">active</option>
            <option value="shipped">shipped</option>
            <option value="archived">archived</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Live URL <span className="text-accent">*</span>
          <input
            type="url"
            value={project.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://your-project.com"
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          />
          <span className="text-[0.7rem] text-ink-subtle">Required. Use a coming-soon page if not shipped.</span>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Repo URL (optional)
          <input
            type="url"
            value={project.repo}
            onChange={(e) => update("repo", e.target.value)}
            placeholder="https://github.com/you/repo"
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Stack (comma-separated)
          <input
            type="text"
            value={project.stack}
            onChange={(e) => update("stack", e.target.value)}
            placeholder="Next.js 15, TypeScript, PostgreSQL"
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Tags (comma-separated)
          <input
            type="text"
            value={project.tags}
            onChange={(e) => update("tags", e.target.value)}
            placeholder="ai, platform"
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Role
          <input
            type="text"
            value={project.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="Solo · Lead engineer · etc."
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Translation key (optional)
          <input
            type="text"
            value={project.translationKey}
            onChange={(e) => update("translationKey", e.target.value)}
            placeholder="Same value on EN+KO links them"
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={project.featured}
          onChange={(e) => update("featured", e.target.checked)}
          className="h-4 w-4 accent-ink"
        />
        <span>
          <strong>Featured</strong> — show on the home page Featured projects section (max 3)
        </span>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        Body (MDX)
        <textarea
          value={project.body}
          onChange={(e) => update("body", e.target.value)}
          rows={20}
          className="rounded-md border border-paper-line bg-white p-3 font-mono text-sm leading-6 outline-none focus:border-accent"
          placeholder={EMPTY_BODY}
          spellCheck={false}
        />
      </label>

      <div className="flex items-center justify-between rounded-md border border-paper-line bg-white p-4">
        {feedback ? (
          <p className={`text-sm ${feedback.tone === "ok" ? "text-ink" : "text-accent"}`}>
            {feedback.text}
          </p>
        ) : (
          <span className="text-xs text-ink-subtle">
            Saving writes content/projects/&lt;locale&gt;/&lt;slug&gt;.mdx via{" "}
            {savingVia === "github" ? "GitHub commit" : "local file system"}.
          </span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !project.title.trim() || !project.slug.trim() || !project.url.trim() || !project.description.trim() || !project.body.trim()}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
        >
          {busy ? "Saving…" : mode === "new" ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

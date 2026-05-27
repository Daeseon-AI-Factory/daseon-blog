"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/slug";

export type EditorPostShape = {
  locale: "en" | "ko";
  slug: string;
  type: "post" | "note" | "knowledge";
  visibility: "public" | "unlisted" | "private";
  title: string;
  description: string;
  date: string;
  translationKey: string;
  tags: string;
  status: "draft" | "published";
  format: "" | "multi-register" | "before-after" | "note";
  summary: string;
  sources: string;
  confidence: "" | "fact" | "opinion" | "exploration";
  body: string;
};

type Props = {
  mode: "new" | "edit";
  initial: EditorPostShape;
  crosspostAvailable: boolean;
  savingVia: "github" | "local";
};

const EMPTY_BODY_TEMPLATE = `Write here in MDX.

Use \`\`\`ts code blocks, > quotes, and **markdown** as usual. JSX components like <Callout> and <ToneLabel> are available.
`;

export function PostEditor({ mode, initial, crosspostAvailable, savingVia }: Props) {
  const router = useRouter();
  const [post, setPost] = useState<EditorPostShape>(initial);
  const [crosspost, setCrosspost] = useState(false);
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(mode === "edit");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [zoneDragOver, setZoneDragOver] = useState(false);
  const [recentUploads, setRecentUploads] = useState<Array<{ url: string; name: string; size: number; via: string }>>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function insertAtCursor(snippet: string) {
    const el = textareaRef.current;
    setPost((p) => {
      if (!el) return { ...p, body: `${p.body}\n${snippet}` };
      const start = el.selectionStart ?? p.body.length;
      const end = el.selectionEnd ?? start;
      const before = p.body.slice(0, start);
      const after = p.body.slice(end);
      const needLeadingNewline = before.length > 0 && !before.endsWith("\n");
      const inserted = `${needLeadingNewline ? "\n" : ""}${snippet}\n`;
      const next = `${before}${inserted}${after}`;
      const newCursor = before.length + inserted.length;
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newCursor, newCursor);
        }
      });
      return { ...p, body: next };
    });
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setFeedback({ tone: "err", text: `Skipping ${file.name}: not an image` });
      return;
    }
    setUploading(true);
    setFeedback(null);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      if (post.slug) fd.append("slug", post.slug);
      if (post.locale) fd.append("locale", post.locale);
      if (post.type) fd.append("type", post.type);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ tone: "err", text: data.error ?? `Upload failed (${res.status})` });
        return;
      }
      const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      insertAtCursor(`![${alt}](${data.url})`);
      setRecentUploads((prev) => [
        { url: data.url, name: file.name, size: data.size, via: data.via },
        ...prev.slice(0, 4),
      ]);
      setFeedback({
        tone: "ok",
        text: `Uploaded ${file.name} → ${data.url} (${(data.size / 1024).toFixed(0)} KB · ${data.via})`,
      });
    } catch (e) {
      setFeedback({ tone: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setUploading(false);
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    for (const f of arr) {
      // eslint-disable-next-line no-await-in-loop
      await uploadFile(f);
    }
  }

  function onBodyPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    const images: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === "file" && it.type.startsWith("image/")) {
        const f = it.getAsFile();
        if (f) images.push(f);
      }
    }
    if (images.length > 0) {
      e.preventDefault();
      void uploadFiles(images);
    }
  }

  function onBodyDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      void uploadFiles(files);
    }
  }

  useEffect(() => {
    if (slugManuallyEdited) return;
    if (mode !== "new") return;
    const next = slugify(post.title);
    if (next !== post.slug) setPost((p) => ({ ...p, slug: next }));
  }, [post.title, post.slug, slugManuallyEdited, mode]);

  const wordCount = useMemo(() => post.body.trim().split(/\s+/).filter(Boolean).length, [post.body]);
  const showCrosspost = post.type === "post" && post.visibility === "public";

  function update<K extends keyof EditorPostShape>(key: K, value: EditorPostShape[K]) {
    setPost((p) => {
      const next = { ...p, [key]: value };
      if (key === "type" && mode === "new") {
        if (value === "note") next.visibility = "private";
        else if (value === "knowledge") next.visibility = "unlisted";
        else next.visibility = "public";
      }
      return next;
    });
  }

  async function submit(target: "draft" | "publish") {
    setBusy(target);
    setFeedback(null);

    const status = target === "publish" ? "published" : "draft";
    const tags = post.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const sources = post.sources.split("\n").map((s) => s.trim()).filter(Boolean);

    const payload = {
      ...(mode === "new" ? { locale: post.locale, slug: post.slug, type: post.type } : {}),
      visibility: post.visibility,
      title: post.title,
      description: post.description || undefined,
      date: post.date || undefined,
      translationKey: post.translationKey || undefined,
      tags,
      status,
      format: post.format || undefined,
      summary: post.summary || undefined,
      sources,
      confidence: post.confidence || undefined,
      body: post.body,
      crosspost: target === "publish" && showCrosspost ? crosspost : false,
    };

    try {
      const url = mode === "new"
        ? "/api/admin/posts"
        : `/api/admin/posts/${post.locale}/${post.slug}`;
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
      const bits = [
        `Saved via ${data.via}`,
        data.commitUrl ? `commit logged` : null,
        data.crosspost && data.crosspost.status === "sent" ? `crosspost sent (${data.crosspost.httpStatus})` : null,
        data.crosspost && data.crosspost.status === "error" ? `crosspost failed: ${data.crosspost.message}` : null,
      ].filter(Boolean);
      setFeedback({ tone: "ok", text: bits.join(" · ") });
      if (mode === "new") {
        router.push(`/admin/posts/${post.locale}/${post.slug}/edit`);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (e) {
      setFeedback({ tone: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium">{mode === "new" ? "New" : "Edit"} {post.type}</h1>
          <p className="mt-1 text-xs text-ink-muted">
            Saving via <strong>{savingVia}</strong> · {wordCount.toLocaleString()} words
          </p>
        </div>
        <Link href="/admin/posts" className="text-sm text-ink-muted hover:text-ink">
          ← Posts
        </Link>
      </div>

      <input
        type="text"
        value={post.title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Title"
        className="w-full border-b border-paper-line bg-transparent py-2 text-2xl font-medium tracking-tight outline-none focus:border-accent"
      />

      <div className="grid gap-4 sm:grid-cols-[7rem_7rem_1fr_8rem_8rem]">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Type
          <select
            value={post.type}
            onChange={(e) => update("type", e.target.value as EditorPostShape["type"])}
            disabled={mode === "edit"}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm disabled:bg-paper-line/40"
          >
            <option value="post">post</option>
            <option value="note">note</option>
            <option value="knowledge">knowledge</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Language
          <select
            value={post.locale}
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
            value={post.slug}
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
            value={post.date}
            onChange={(e) => update("date", e.target.value)}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Visibility
          <select
            value={post.visibility}
            onChange={(e) => update("visibility", e.target.value as EditorPostShape["visibility"])}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
          >
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
            <option value="private">private</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Description (optional)
          <input
            type="text"
            value={post.description}
            onChange={(e) => update("description", e.target.value)}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
            placeholder="One-line summary used in lists + OG tags"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-ink-muted">
          Tags (comma-separated)
          <input
            type="text"
            value={post.tags}
            onChange={(e) => update("tags", e.target.value)}
            className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm"
            placeholder="llm, rag, eval"
          />
        </label>
      </div>

      <details className="group rounded-md border border-paper-line bg-white p-4">
        <summary className="cursor-pointer text-sm font-medium text-ink">
          RAG metadata <span className="text-xs font-normal text-ink-muted">— summary, sources, confidence (optional)</span>
        </summary>
        <div className="mt-4 space-y-3">
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Summary (used by RAG retrieval; can be LLM-generated)
            <textarea
              value={post.summary}
              onChange={(e) => update("summary", e.target.value)}
              rows={2}
              className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm outline-none focus:border-accent"
              placeholder="One or two sentences capturing the gist."
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Sources (one URL per line)
              <textarea
                value={post.sources}
                onChange={(e) => update("sources", e.target.value)}
                rows={3}
                className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-xs outline-none focus:border-accent"
                placeholder={"https://arxiv.org/abs/...\nhttps://example.com/post"}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-ink-muted">
              Confidence
              <select
                value={post.confidence}
                onChange={(e) => update("confidence", e.target.value as EditorPostShape["confidence"])}
                className="rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
              >
                <option value="">(unset)</option>
                <option value="fact">fact</option>
                <option value="opinion">opinion</option>
                <option value="exploration">exploration</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Translation key (optional · matching value on EN and KO cross-links them)
            <input
              type="text"
              value={post.translationKey}
              onChange={(e) => update("translationKey", e.target.value)}
              className="rounded-md border border-paper-line bg-white px-2 py-1.5 font-mono text-sm"
              placeholder="embeddings"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Format
            <select
              value={post.format}
              onChange={(e) => update("format", e.target.value as EditorPostShape["format"])}
              className="w-fit rounded-md border border-paper-line bg-white px-2 py-1.5 text-sm"
            >
              <option value="">(none)</option>
              <option value="multi-register">multi-register</option>
              <option value="before-after">before-after</option>
              <option value="note">note</option>
            </select>
          </label>
        </div>
      </details>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="post-body" className="text-xs text-ink-muted">
            Body (MDX)
          </label>
          <span className="text-[0.7rem] text-ink-subtle">
            {wordCount.toLocaleString()} words
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setZoneDragOver(true);
          }}
          onDragLeave={() => setZoneDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setZoneDragOver(false);
            const files = e.dataTransfer?.files;
            if (files && files.length > 0) void uploadFiles(files);
          }}
          className={`rounded-md border-2 border-dashed p-4 transition ${
            zoneDragOver
              ? "border-accent bg-accent/5"
              : uploading
                ? "border-accent/40 bg-white"
                : "border-paper-line bg-white"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-md bg-paper-line/50 text-ink-muted">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-ink">
                  {uploading ? "Uploading…" : "Add an image"}
                </p>
                <p className="text-xs text-ink-muted">
                  Drag from Finder · paste from clipboard · or use the button. PNG/JPG/WEBP/GIF/SVG, max 5 MB.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
            >
              Choose from Mac…
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  void uploadFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />
          </div>

          {recentUploads.length > 0 ? (
            <ul className="mt-4 divide-y divide-paper-line border-t border-paper-line">
              {recentUploads.map((u) => (
                <li key={u.url} className="flex items-center justify-between gap-3 py-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u.url} alt="" className="h-8 w-8 rounded border border-paper-line object-cover" />
                    <span className="truncate font-mono text-ink-muted">{u.url}</span>
                  </div>
                  <div className="flex items-center gap-3 whitespace-nowrap text-ink-subtle">
                    <span>{(u.size / 1024).toFixed(0)} KB · {u.via}</span>
                    <button
                      type="button"
                      onClick={() => insertAtCursor(`![${u.name.replace(/\.[^.]+$/, "")}](${u.url})`)}
                      className="text-accent hover:underline"
                    >
                      Insert
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          void navigator.clipboard.writeText(`![](${u.url})`);
                        }
                      }}
                      className="hover:text-ink"
                    >
                      Copy MD
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <textarea
          id="post-body"
          ref={textareaRef}
          value={post.body}
          onChange={(e) => update("body", e.target.value)}
          onPaste={onBodyPaste}
          onDrop={onBodyDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          rows={24}
          className={`rounded-md border bg-white p-3 font-mono text-sm leading-6 outline-none focus:border-accent ${
            dragOver ? "border-accent ring-2 ring-accent/20" : "border-paper-line"
          }`}
          placeholder={EMPTY_BODY_TEMPLATE}
          spellCheck={false}
        />
        <p className="text-[0.7rem] text-ink-subtle">
          Paste a screenshot directly into the body (Cmd+V) — inserts `![](url)` at cursor.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-paper-line bg-white p-4">
        <label className={`flex items-center gap-2 text-sm ${showCrosspost ? "" : "opacity-40"}`}>
          <input
            type="checkbox"
            checked={crosspost && showCrosspost}
            onChange={(e) => setCrosspost(e.target.checked)}
            disabled={!crosspostAvailable || !showCrosspost}
            className="h-4 w-4 accent-ink"
          />
          <span>
            Crosspost on publish
            {!showCrosspost ? " (only public posts)" : !crosspostAvailable ? " (set CROSSPOST_WEBHOOK_URL to enable)" : ""}
          </span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => submit("draft")}
            disabled={busy !== null || !post.title.trim() || !post.slug.trim() || !post.body.trim()}
            className="rounded-md border border-paper-line bg-white px-4 py-2 text-sm text-ink hover:border-accent disabled:opacity-50"
          >
            {busy === "draft" ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => submit("publish")}
            disabled={busy !== null || !post.title.trim() || !post.slug.trim() || !post.body.trim()}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
          >
            {busy === "publish" ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>

      {feedback ? (
        <p
          className={`rounded-md border p-3 text-sm ${
            feedback.tone === "ok"
              ? "border-paper-line bg-white text-ink"
              : "border-accent/40 bg-accent/5 text-accent"
          }`}
        >
          {feedback.text}
        </p>
      ) : null}
    </div>
  );
}

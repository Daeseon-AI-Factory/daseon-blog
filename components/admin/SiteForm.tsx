"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteAuthor, SitePhoto } from "@/lib/site";

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
};

function Field({ label, value, onChange, placeholder, type = "text", hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-ink-muted">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      {hint ? <span className="text-[0.7rem] text-ink-subtle">{hint}</span> : null}
    </label>
  );
}

type ImageUploadProps = {
  label: string;
  hint?: string;
  preview?: string;
  uploading: boolean;
  onPick: (file: File) => void;
};

function ImageUploader({ label, hint, preview, uploading, onPick }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer?.files?.[0];
        if (f) onPick(f);
      }}
      className={`flex items-center gap-4 rounded-md border-2 border-dashed p-4 transition ${
        dragOver ? "border-accent bg-accent/5" : "border-paper-line bg-white"
      }`}
    >
      {preview ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={preview}
          alt="preview"
          className="h-16 w-16 rounded-full border border-paper-line object-cover"
        />
      ) : (
        <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-line text-xs text-ink-subtle">
          none
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{label}</p>
        {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
      >
        {uploading ? "Uploading…" : "Choose from Mac…"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            onPick(f);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
}

export function SiteForm({ initial, savingVia }: { initial: SiteAuthor; savingVia: "github" | "local" }) {
  const router = useRouter();
  const [data, setData] = useState<SiteAuthor>(initial);
  const [busy, setBusy] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  function update<K extends keyof SiteAuthor>(key: K, value: SiteAuthor[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function uploadImage(file: File, target: "avatar" | "hobby"): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file, file.name);
    fd.append("target", target);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const out = await res.json();
      if (!res.ok) {
        setFeedback({ tone: "err", text: out.error ?? `Upload failed (${res.status})` });
        return null;
      }
      return out.url as string;
    } catch (e) {
      setFeedback({ tone: "err", text: e instanceof Error ? e.message : String(e) });
      return null;
    }
  }

  async function pickAvatar(file: File) {
    setAvatarUploading(true);
    setFeedback(null);
    const url = await uploadImage(file, "avatar");
    setAvatarUploading(false);
    if (url) {
      update("avatar", url);
      setFeedback({ tone: "ok", text: `Avatar uploaded: ${url}. Click Save to apply.` });
    }
  }

  async function pickHobbyPhoto(file: File) {
    setPhotoUploading(true);
    setFeedback(null);
    const url = await uploadImage(file, "hobby");
    setPhotoUploading(false);
    if (url) {
      const next: SitePhoto[] = [...data.hobbyPhotos, { url, alt: "" }].slice(0, 6);
      update("hobbyPhotos", next);
      setFeedback({ tone: "ok", text: `Photo added (${data.hobbyPhotos.length + 1}/6). Click Save to apply.` });
    }
  }

  function removePhoto(idx: number) {
    update("hobbyPhotos", data.hobbyPhotos.filter((_, i) => i !== idx));
  }

  function updatePhotoAlt(idx: number, alt: string) {
    update(
      "hobbyPhotos",
      data.hobbyPhotos.map((p, i) => (i === idx ? { ...p, alt } : p)),
    );
  }

  async function submit() {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json();
      if (!res.ok) {
        setFeedback({ tone: "err", text: out.error ?? `Failed (${res.status})` });
        return;
      }
      setFeedback({
        tone: "ok",
        text: out.commitUrl ? `Saved via ${out.via} · commit logged` : `Saved via ${out.via}`,
      });
      router.refresh();
    } catch (e) {
      setFeedback({ tone: "err", text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink-muted">
        Saving via <strong>{savingVia}</strong>.
        {savingVia === "local"
          ? " (No GITHUB_TOKEN — changes only persist on this machine.)"
          : " Changes commit to content/site.json and Vercel redeploys automatically."}
      </p>

      <section className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
          Identity
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Name (EN)" value={data.name} onChange={(v) => update("name", v)} />
          <Field label="Name (KO)" value={data.nameKo} onChange={(v) => update("nameKo", v)} />
          <Field label="Role (EN)" value={data.role} onChange={(v) => update("role", v)} placeholder="AI Engineer" />
          <Field label="Role (KO)" value={data.roleKo} onChange={(v) => update("roleKo", v)} placeholder="AI 엔지니어" />
          <Field label="Location (EN)" value={data.location} onChange={(v) => update("location", v)} />
          <Field label="Location (KO)" value={data.locationKo} onChange={(v) => update("locationKo", v)} />
          <Field
            label="Handle"
            value={data.handle}
            onChange={(v) => update("handle", v)}
            hint="Used in Twitter card meta. Without the @."
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border-2 border-accent/30 bg-accent/[0.03] p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-accent">
            ★ Main profile photo (avatar)
          </h2>
          <span className="text-[0.7rem] text-ink-subtle">Shown in header, sidebar, About header</span>
        </div>
        <ImageUploader
          label="Profile photo — drop or click here to change avatar"
          hint="This is the single round photo of you. Square crop works best."
          preview={data.avatar || undefined}
          uploading={avatarUploading}
          onPick={pickAvatar}
        />
        <div className="flex flex-wrap items-center gap-4">
          <Field
            label="Avatar path (auto-filled by upload)"
            value={data.avatar}
            onChange={(v) => update("avatar", v)}
            placeholder="/avatar-placeholder.svg"
            hint="You can also type a path manually."
          />
          <label className="flex items-center gap-2 self-end pb-1 text-sm">
            <input
              type="checkbox"
              checked={data.available}
              onChange={(e) => update("available", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Show &quot;Open to roles&quot;
          </label>
          <label className="flex items-center gap-2 self-end pb-1 text-sm">
            <input
              type="checkbox"
              checked={Boolean(data.showReviewNeeded)}
              onChange={(e) => update("showReviewNeeded", e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Show &quot;Review needed&quot; on log entries
          </label>
        </div>
        <p className="text-xs text-ink-subtle">
          Off: entries without a human companion render single-column, main content only — no
          review marker anywhere public.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
          Links
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Email"
            value={data.email}
            onChange={(v) => update("email", v)}
            type="email"
            placeholder="you@example.com"
          />
          <Field
            label="GitHub URL"
            value={data.github}
            onChange={(v) => update("github", v)}
            placeholder="https://github.com/yourname"
          />
          <Field
            label="LinkedIn URL"
            value={data.linkedin}
            onChange={(v) => update("linkedin", v)}
            placeholder="https://www.linkedin.com/in/yourname"
          />
          <Field
            label="X / Twitter URL"
            value={data.twitter}
            onChange={(v) => update("twitter", v)}
            placeholder="https://x.com/yourhandle"
          />
          <Field
            label="YouTube URL"
            value={data.youtube}
            onChange={(v) => update("youtube", v)}
            placeholder="https://youtube.com/@yourhandle"
            hint="Leave blank to hide the icon."
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-paper-line bg-paper-line/20 p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
            Outside of work — separate from avatar
          </h2>
          <span className="text-[0.7rem] text-ink-subtle">Shown at bottom of /about only</span>
        </div>
        <p className="text-xs text-ink-muted">
          Optional gallery shown at the bottom of /about. Different from the
          main avatar above. Keep it short — one hobby line + 1-3 photos.
          Conference/maker/workspace shots work best.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Hobby (EN)
            <textarea
              value={data.hobby}
              onChange={(e) => update("hobby", e.target.value)}
              rows={2}
              className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              placeholder="Off the keyboard: hiking around Toronto, terrible film photography, slow coffee."
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-ink-muted">
            Hobby (KO)
            <textarea
              value={data.hobbyKo}
              onChange={(e) => update("hobbyKo", e.target.value)}
              rows={2}
              className="rounded-md border border-paper-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              placeholder="키보드 밖에서는: 토론토 근처 등산, 어설픈 필름 사진, 느린 커피."
            />
          </label>
        </div>

        <ImageUploader
          label={`Personal photos (${data.hobbyPhotos.length}/6)`}
          hint="Conference / maker / workspace shots work best. Skip family/vacation."
          uploading={photoUploading}
          onPick={pickHobbyPhoto}
        />

        {data.hobbyPhotos.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.hobbyPhotos.map((p, idx) => (
              <li key={`${p.url}-${idx}`} className="rounded-md border border-paper-line bg-white p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.alt} className="aspect-square w-full rounded object-cover" />
                <input
                  type="text"
                  value={p.alt}
                  onChange={(e) => updatePhotoAlt(idx, e.target.value)}
                  placeholder="Alt text (accessibility)"
                  className="mt-2 w-full rounded border border-paper-line bg-white px-2 py-1 text-xs outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="mt-2 text-xs text-ink-subtle hover:text-accent"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="flex items-center justify-between rounded-md border border-paper-line bg-white p-4">
        {feedback ? (
          <p
            className={`text-sm ${feedback.tone === "ok" ? "text-ink" : "text-accent"}`}
          >
            {feedback.text}
          </p>
        ) : (
          <span className="text-xs text-ink-subtle">
            Saving updates the JSON file and triggers a redeploy if GitHub-backed.
          </span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink/85 disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

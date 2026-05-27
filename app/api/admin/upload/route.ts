import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { isLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import { saveBinaryAsset } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function sanitizeBase(name: string): string {
  const stem = name.replace(/\.[^.]+$/, "");
  return stem
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 40) || "image";
}

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ ok: false, error: "Missing 'file' field" }, { status: 400 });
  }

  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: `Unsupported type: ${file.type}. Allowed: png/jpg/webp/gif/svg.` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 5 MB.` },
      { status: 413 },
    );
  }

  const localeField = form.get("locale");
  const slugField = form.get("slug");
  const typeField = form.get("type");
  const nameField = form.get("name");
  const targetField = form.get("target");

  const locale = typeof localeField === "string" && isLocale(localeField) ? localeField : null;
  const slug = typeof slugField === "string" && isValidSlug(slugField) ? slugField : null;
  const type = typeof typeField === "string" && ["post", "note", "knowledge"].includes(typeField) ? typeField : null;
  const target = typeof targetField === "string" ? targetField : null;
  const originalName = typeof nameField === "string" ? nameField : (file as File).name ?? "image";

  const stem = sanitizeBase(originalName);
  const hash = crypto.randomBytes(3).toString("hex");
  const filename = `${stem}-${hash}.${ext}`;

  let segments: string[];
  if (target === "avatar") {
    segments = ["avatars", `me-${hash}.${ext}`];
  } else if (target === "hobby") {
    segments = ["personal", filename];
  } else if (type && locale && slug) {
    segments = ["images", type, locale, slug, filename];
  } else {
    segments = ["images", "uploads", new Date().toISOString().slice(0, 10), filename];
  }
  const publicPath = `/${segments.join("/")}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const saved = await saveBinaryAsset({
      publicPath,
      buffer,
      message: `Upload ${filename}`,
    });
    return NextResponse.json({
      ok: true,
      url: publicPath,
      path: saved.path,
      via: saved.via,
      commitUrl: saved.commitUrl,
      size: buffer.length,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

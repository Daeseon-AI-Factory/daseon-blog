import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import { savePost, deletePost, fileExists } from "@/lib/storage";
import { serializeMdx } from "@/lib/serialize-mdx";
import { notifyCrosspost, crosspostConfigured } from "@/lib/crosspost";
import { getContentItem } from "@/lib/posts";
import type {
  Confidence,
  ContentType,
  PostFrontmatter,
  PostStatus,
  Visibility,
} from "@/lib/posts";

type Params = Promise<{ locale: string; slug: string }>;

type UpdateBody = {
  type?: ContentType;
  visibility?: Visibility;
  title?: string;
  description?: string;
  date?: string;
  translationKey?: string;
  tags?: string[];
  status?: PostStatus;
  format?: PostFrontmatter["format"];
  summary?: string;
  sources?: string[];
  confidence?: Confidence;
  body?: string;
  crosspost?: boolean;
};

const VALID_TYPES: ContentType[] = ["post", "note", "knowledge"];
const VALID_VIS: Visibility[] = ["public", "unlisted", "private"];

async function findExisting(locale: "en" | "ko", slug: string) {
  for (const t of VALID_TYPES) {
    const existing = await getContentItem(t, locale, slug);
    if (existing) return existing;
  }
  return null;
}

export async function PUT(req: Request, { params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return NextResponse.json({ ok: false, error: "Bad locale" }, { status: 400 });
  if (!isValidSlug(slug)) return NextResponse.json({ ok: false, error: "Bad slug" }, { status: 400 });

  let payload: UpdateBody;
  try {
    payload = (await req.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!payload.title?.trim()) return NextResponse.json({ ok: false, error: "title required" }, { status: 400 });
  if (!payload.body?.trim()) return NextResponse.json({ ok: false, error: "body required" }, { status: 400 });

  const existing = await findExisting(locale, slug);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });
  }
  const type: ContentType =
    payload.type && VALID_TYPES.includes(payload.type) ? payload.type : existing.type;
  if (type !== existing.type) {
    return NextResponse.json(
      { ok: false, error: "Changing type would move files between directories; delete + create instead" },
      { status: 400 },
    );
  }

  if (!(await fileExists(type, locale, slug))) {
    return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
  }

  const status: PostStatus = payload.status ?? existing.frontmatter.status ?? "draft";
  const visibility: Visibility =
    payload.visibility && VALID_VIS.includes(payload.visibility)
      ? payload.visibility
      : existing.frontmatter.visibility ?? "public";

  const wasPublished = existing.frontmatter.status === "published";
  const justPublished = !wasPublished && status === "published";

  const frontmatter: PostFrontmatter = {
    title: payload.title!.trim(),
    description: payload.description?.trim() || undefined,
    date: payload.date?.trim() || existing.frontmatter.date,
    updated: wasPublished ? new Date().toISOString().slice(0, 10) : undefined,
    language: locale,
    translationKey: payload.translationKey?.trim() || undefined,
    tags: payload.tags?.filter(Boolean),
    status,
    format: payload.format ?? existing.frontmatter.format,
    type,
    visibility,
    summary: payload.summary?.trim() || undefined,
    sources: payload.sources?.filter(Boolean),
    confidence: payload.confidence,
  };

  const mdx = serializeMdx(frontmatter, payload.body!);
  const verb = justPublished ? "Publish" : status === "published" ? "Update" : "Draft";
  const message = `${verb} ${type}: ${frontmatter.title} (${locale}/${slug})`;

  try {
    const saved = await savePost({ type, locale, slug, content: mdx, message });
    revalidatePath("/");
    revalidatePath("/ko");
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/ko/posts/${slug}`);
    revalidatePath("/admin/posts");

    let crosspostResult = null;
    if (
      type === "post" &&
      visibility === "public" &&
      justPublished &&
      payload.crosspost &&
      crosspostConfigured()
    ) {
      const fresh = await getContentItem("post", locale, slug);
      if (fresh) crosspostResult = await notifyCrosspost(fresh);
    }
    return NextResponse.json({
      ok: true,
      path: saved.path,
      via: saved.via,
      commitUrl: saved.commitUrl,
      crosspost: crosspostResult,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return NextResponse.json({ ok: false, error: "Bad locale" }, { status: 400 });
  if (!isValidSlug(slug)) return NextResponse.json({ ok: false, error: "Bad slug" }, { status: 400 });

  const existing = await findExisting(locale, slug);
  if (!existing) return NextResponse.json({ ok: false, error: "Item not found" }, { status: 404 });

  try {
    const result = await deletePost({
      type: existing.type,
      locale,
      slug,
      message: `Delete ${existing.type}: ${locale}/${slug}`,
    });
    revalidatePath("/");
    revalidatePath("/ko");
    revalidatePath("/admin/posts");
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

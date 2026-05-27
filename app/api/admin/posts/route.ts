import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import { savePost, fileExists } from "@/lib/storage";
import { serializeMdx } from "@/lib/serialize-mdx";
import { notifyCrosspost, crosspostConfigured } from "@/lib/crosspost";
import { getContentItem } from "@/lib/posts";
import type {
  ContentType,
  Confidence,
  PostFrontmatter,
  PostStatus,
  Visibility,
} from "@/lib/posts";

type CreateBody = {
  locale?: string;
  slug?: string;
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

export async function POST(req: Request) {
  let payload: CreateBody;
  try {
    payload = (await req.json()) as CreateBody;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const errors: string[] = [];
  if (!payload.locale || !isLocale(payload.locale)) errors.push("locale must be 'en' or 'ko'");
  if (!payload.slug || !isValidSlug(payload.slug)) errors.push("slug must be lowercase kebab-case");
  if (!payload.title?.trim()) errors.push("title is required");
  if (!payload.body?.trim()) errors.push("body is required");
  const type: ContentType = payload.type && VALID_TYPES.includes(payload.type) ? payload.type : "post";
  const visibility: Visibility =
    payload.visibility && VALID_VIS.includes(payload.visibility)
      ? payload.visibility
      : type === "note"
        ? "private"
        : type === "knowledge"
          ? "unlisted"
          : "public";
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: errors.join("; ") }, { status: 400 });
  }

  const locale = payload.locale as PostFrontmatter["language"];
  const slug = payload.slug!;
  const status: PostStatus = payload.status ?? "draft";
  const date = payload.date?.trim() || new Date().toISOString().slice(0, 10);

  if (await fileExists(type, locale, slug)) {
    return NextResponse.json(
      { ok: false, error: `A ${type} already exists at ${locale}/${slug}.mdx — use the edit page` },
      { status: 409 },
    );
  }

  const frontmatter: PostFrontmatter = {
    title: payload.title!.trim(),
    description: payload.description?.trim() || undefined,
    date,
    language: locale,
    translationKey: payload.translationKey?.trim() || undefined,
    tags: payload.tags?.filter(Boolean),
    status,
    format: payload.format,
    type,
    visibility,
    summary: payload.summary?.trim() || undefined,
    sources: payload.sources?.filter(Boolean),
    confidence: payload.confidence,
  };

  const mdx = serializeMdx(frontmatter, payload.body!);
  const verb = status === "published" ? "Publish" : "Draft";
  const commitMessage = `${verb} ${type}: ${frontmatter.title} (${locale}/${slug})`;

  try {
    const saved = await savePost({ type, locale, slug, content: mdx, message: commitMessage });

    revalidatePath("/");
    revalidatePath("/ko");
    revalidatePath(`/posts/${slug}`);
    revalidatePath(`/ko/posts/${slug}`);
    revalidatePath("/admin/posts");

    let crosspostResult = null;
    if (
      type === "post" &&
      status === "published" &&
      visibility === "public" &&
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
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

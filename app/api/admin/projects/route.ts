import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import { projectFileExists, saveProject, serializeProjectMdx } from "@/lib/project-storage";
import type { ProjectFrontmatter, ProjectStatus } from "@/lib/projects";

type CreateBody = {
  locale?: string;
  slug?: string;
  title?: string;
  description?: string;
  date?: string;
  translationKey?: string;
  status?: ProjectStatus;
  featured?: boolean;
  url?: string;
  repo?: string;
  logSourceRepo?: string;
  tags?: string[];
  stack?: string[];
  role?: string;
  body?: string;
};

const VALID_STATUS: ProjectStatus[] = ["active", "shipped", "archived"];

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
  if (!payload.description?.trim()) errors.push("description is required");
  if (!payload.url?.trim()) errors.push("url is required (live link). Use a coming-soon page if not shipped.");
  if (!payload.body?.trim()) errors.push("body is required");
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, error: errors.join("; ") }, { status: 400 });
  }

  const locale = payload.locale as ProjectFrontmatter["language"];
  const slug = payload.slug!;

  if (await projectFileExists(locale, slug)) {
    return NextResponse.json(
      { ok: false, error: `A project already exists at ${locale}/${slug}.mdx — use the edit page` },
      { status: 409 },
    );
  }

  const status = payload.status && VALID_STATUS.includes(payload.status) ? payload.status : "active";

  const frontmatter: ProjectFrontmatter = {
    title: payload.title!.trim(),
    description: payload.description!.trim(),
    date: payload.date?.trim() || new Date().toISOString().slice(0, 10),
    language: locale,
    translationKey: payload.translationKey?.trim() || undefined,
    status,
    featured: Boolean(payload.featured),
    url: payload.url!.trim(),
    repo: payload.repo?.trim() || undefined,
    logSourceRepo: payload.logSourceRepo?.trim() || undefined,
    tags: payload.tags?.filter(Boolean),
    stack: payload.stack?.filter(Boolean),
    role: payload.role?.trim() || undefined,
  };

  const mdx = serializeProjectMdx(frontmatter, payload.body!);
  const message = `Create project: ${frontmatter.title} (${locale}/${slug})`;

  try {
    const saved = await saveProject({ locale, slug, content: mdx, message });
    revalidatePath("/");
    revalidatePath("/ko");
    revalidatePath("/projects");
    revalidatePath("/ko/projects");
    revalidatePath(`/projects/${slug}`);
    revalidatePath(`/ko/projects/${slug}`);
    revalidatePath("/admin/projects");
    return NextResponse.json({
      ok: true,
      path: saved.path,
      via: saved.via,
      commitUrl: saved.commitUrl,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

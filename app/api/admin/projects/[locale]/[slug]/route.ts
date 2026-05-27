import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/lib/i18n";
import { isValidSlug } from "@/lib/slug";
import {
  deleteProject,
  projectFileExists,
  saveProject,
  serializeProjectMdx,
} from "@/lib/project-storage";
import { getProject } from "@/lib/projects";
import type { ProjectFrontmatter, ProjectStatus } from "@/lib/projects";

type Params = Promise<{ locale: string; slug: string }>;

type UpdateBody = {
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

function bust(slug: string) {
  revalidatePath("/");
  revalidatePath("/ko");
  revalidatePath("/projects");
  revalidatePath("/ko/projects");
  revalidatePath(`/projects/${slug}`);
  revalidatePath(`/ko/projects/${slug}`);
  revalidatePath("/admin/projects");
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

  const existing = await getProject(locale, slug);
  if (!existing) return NextResponse.json({ ok: false, error: "Project not found" }, { status: 404 });
  if (!(await projectFileExists(locale, slug))) {
    return NextResponse.json({ ok: false, error: "File not found" }, { status: 404 });
  }

  const title = payload.title?.trim() || existing.frontmatter.title;
  const description = payload.description?.trim() || existing.frontmatter.description;
  const url = payload.url?.trim() || existing.frontmatter.url;
  if (!title || !description || !url) {
    return NextResponse.json({ ok: false, error: "title, description, url all required" }, { status: 400 });
  }
  const body = payload.body?.trim() ?? existing.content;
  if (!body) return NextResponse.json({ ok: false, error: "body required" }, { status: 400 });

  const status = payload.status && VALID_STATUS.includes(payload.status) ? payload.status : existing.frontmatter.status;

  const frontmatter: ProjectFrontmatter = {
    title,
    description,
    date: payload.date?.trim() || existing.frontmatter.date,
    language: locale,
    translationKey: payload.translationKey?.trim() || existing.frontmatter.translationKey,
    status,
    featured: typeof payload.featured === "boolean" ? payload.featured : existing.frontmatter.featured,
    url,
    repo: payload.repo?.trim() ?? existing.frontmatter.repo,
    logSourceRepo: payload.logSourceRepo?.trim() ?? existing.frontmatter.logSourceRepo,
    tags: payload.tags?.filter(Boolean) ?? existing.frontmatter.tags,
    stack: payload.stack?.filter(Boolean) ?? existing.frontmatter.stack,
    role: payload.role?.trim() ?? existing.frontmatter.role,
  };

  const mdx = serializeProjectMdx(frontmatter, body);
  const message = `Update project: ${title} (${locale}/${slug})`;

  try {
    const saved = await saveProject({ locale, slug, content: mdx, message });
    bust(slug);
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

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return NextResponse.json({ ok: false, error: "Bad locale" }, { status: 400 });
  if (!isValidSlug(slug)) return NextResponse.json({ ok: false, error: "Bad slug" }, { status: 400 });

  try {
    const result = await deleteProject({ locale, slug, message: `Delete project: ${locale}/${slug}` });
    bust(slug);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

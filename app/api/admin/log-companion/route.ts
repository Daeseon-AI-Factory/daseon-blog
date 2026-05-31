import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { deleteHumanCompanion, saveHumanCompanion } from "@/lib/storage";

export const dynamic = "force-dynamic";

function bumpRelevantPaths(project: string, slug: string) {
  // The entry detail page (both locales) and the project page renders that depend
  // on companion presence. Revalidate them so changes show within a request.
  revalidatePath(`/projects/${project}/log/${slug}`);
  revalidatePath(`/ko/projects/${project}/log/${slug}`);
  revalidatePath(`/projects/${project}`);
  revalidatePath(`/ko/projects/${project}`);
}

export async function POST(req: Request) {
  let payload: { project?: string; slug?: string; body?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { project, slug, body } = payload;
  if (!project || !slug || typeof body !== "string") {
    return NextResponse.json(
      { ok: false, error: "Missing project, slug, or body" },
      { status: 400 },
    );
  }
  const result = await saveHumanCompanion({
    project,
    slug,
    body: body.endsWith("\n") ? body : `${body}\n`,
    message: `companion: ${project}/${slug}`,
  });
  bumpRelevantPaths(project, slug);
  return NextResponse.json({ ok: true, ...result });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const project = url.searchParams.get("project");
  const slug = url.searchParams.get("slug");
  if (!project || !slug) {
    return NextResponse.json(
      { ok: false, error: "Missing project or slug" },
      { status: 400 },
    );
  }
  const result = await deleteHumanCompanion({
    project,
    slug,
    message: `companion: delete ${project}/${slug}`,
  });
  bumpRelevantPaths(project, slug);
  return NextResponse.json({ ok: true, ...result });
}

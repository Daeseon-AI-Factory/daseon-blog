import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { loadSiteConfig, saveSiteConfig, validateSiteConfig } from "@/lib/site-storage";

export async function GET() {
  const data = await loadSiteConfig();
  return NextResponse.json({ ok: true, data });
}

export async function PUT(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const result = validateSiteConfig(raw as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }
  try {
    const saved = await saveSiteConfig(result.data);
    revalidatePath("/");
    revalidatePath("/ko");
    revalidatePath("/about");
    revalidatePath("/ko/about");
    revalidatePath("/admin/site");
    return NextResponse.json({ ok: true, ...saved });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

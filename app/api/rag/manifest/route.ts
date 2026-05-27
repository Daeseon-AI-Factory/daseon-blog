import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getAllContentAcrossTypes } from "@/lib/posts";
import { SITE } from "@/lib/site";

function unauthorized(reason: string) {
  return NextResponse.json({ ok: false, error: reason }, { status: 401 });
}

function authorize(req: Request): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.RAG_API_TOKEN;
  if (!expected || expected.length < 16) {
    return { ok: false, reason: "RAG_API_TOKEN not configured on server" };
  }
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return { ok: false, reason: "Missing Bearer token" };
  const provided = match[1].trim();
  if (provided.length !== expected.length) return { ok: false, reason: "Invalid token" };
  let diff = 0;
  for (let i = 0; i < provided.length; i++) {
    diff |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) return { ok: false, reason: "Invalid token" };
  return { ok: true };
}

function hash(content: string): string {
  return crypto.createHash("sha256").update(content, "utf-8").digest("hex");
}

export async function GET(req: Request) {
  const auth = authorize(req);
  if (!auth.ok) return unauthorized(auth.reason);

  const all = await getAllContentAcrossTypes();
  const base = SITE.url.replace(/\/$/, "");

  const items = all.map((p) => {
    const publicPath = p.locale === "en" ? `/posts/${p.slug}` : `/${p.locale}/posts/${p.slug}`;
    const visibility = p.frontmatter.visibility ?? "public";
    const isPublic =
      p.type === "post" && visibility === "public" && p.frontmatter.status !== "draft";
    return {
      id: `${p.type}:${p.locale}:${p.slug}`,
      type: p.type,
      slug: p.slug,
      locale: p.locale,
      visibility,
      status: p.frontmatter.status ?? "published",
      title: p.frontmatter.title,
      description: p.frontmatter.description ?? null,
      summary: p.frontmatter.summary ?? null,
      confidence: p.frontmatter.confidence ?? null,
      sources: p.frontmatter.sources ?? [],
      tags: p.frontmatter.tags ?? [],
      translationKey: p.frontmatter.translationKey ?? null,
      date: p.frontmatter.date,
      updated: p.frontmatter.updated ?? null,
      url: isPublic ? `${base}${publicPath}` : null,
      contentHash: hash(p.content),
      readingMinutes: p.readingMinutes,
      content: p.content,
    };
  });

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    count: items.length,
    site: { url: base, author: SITE.author.name },
    items,
  });
}

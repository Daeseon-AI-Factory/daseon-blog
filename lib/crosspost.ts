import crypto from "node:crypto";
import type { Post } from "./posts";
import { SITE } from "./site";

export type CrosspostResult =
  | { status: "skipped"; reason: string }
  | { status: "sent"; httpStatus: number }
  | { status: "error"; message: string };

export function crosspostConfigured(): boolean {
  return Boolean(process.env.CROSSPOST_WEBHOOK_URL);
}

export async function notifyCrosspost(post: Post): Promise<CrosspostResult> {
  const url = process.env.CROSSPOST_WEBHOOK_URL;
  if (!url) return { status: "skipped", reason: "CROSSPOST_WEBHOOK_URL not set" };

  const base = SITE.url.replace(/\/$/, "");
  const publicUrl = post.locale === "en"
    ? `${base}/posts/${post.slug}`
    : `${base}/${post.locale}/posts/${post.slug}`;

  const payload = {
    event: "post.published",
    sentAt: new Date().toISOString(),
    post: {
      slug: post.slug,
      locale: post.locale,
      title: post.frontmatter.title,
      description: post.frontmatter.description ?? null,
      url: publicUrl,
      tags: post.frontmatter.tags ?? [],
      publishedAt: post.frontmatter.date,
      translationKey: post.frontmatter.translationKey ?? null,
    },
  };

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": `${SITE.name}-publisher/1.0`,
  };

  const secret = process.env.CROSSPOST_WEBHOOK_SECRET;
  if (secret) {
    const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
    headers["X-Signature-256"] = `sha256=${sig}`;
  }

  try {
    const res = await fetch(url, { method: "POST", headers, body });
    return { status: "sent", httpStatus: res.status };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : String(e) };
  }
}

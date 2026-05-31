import { promises as fs } from "node:fs";
import path from "node:path";
import { commitBinary, commitFile, deleteFile, githubConfigured } from "./github";
import type { Locale } from "./i18n";
import {
  type ContentType,
  TYPE_DIRS,
  absolutePathFor,
  relativePathFor,
} from "./posts";

export type SaveResult = {
  path: string;
  via: "github" | "local";
  commitUrl?: string;
};

export async function fileExists(type: ContentType, locale: Locale, slug: string): Promise<boolean> {
  try {
    await fs.access(absolutePathFor(type, locale, slug));
    return true;
  } catch {
    return false;
  }
}

export async function savePost({
  type,
  locale,
  slug,
  content,
  message,
}: {
  type: ContentType;
  locale: Locale;
  slug: string;
  content: string;
  message: string;
}): Promise<SaveResult> {
  const rel = relativePathFor(type, locale, slug);

  if (githubConfigured()) {
    const result = await commitFile({ path: rel, content, message });
    return { path: rel, via: "github", commitUrl: result.commitUrl };
  }

  // Local FS only when GitHub is not configured (dev mode).
  // Vercel production is read-only — never reach here in prod.
  const abs = absolutePathFor(type, locale, slug);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, content, "utf-8");
  return { path: rel, via: "local" };
}

export async function deletePost({
  type,
  locale,
  slug,
  message,
}: {
  type: ContentType;
  locale: Locale;
  slug: string;
  message: string;
}): Promise<SaveResult> {
  const rel = relativePathFor(type, locale, slug);

  if (githubConfigured()) {
    await deleteFile({ path: rel, message });
    return { path: rel, via: "github" };
  }

  // Local FS only when GitHub is not configured (dev mode).
  const abs = absolutePathFor(type, locale, slug);
  try {
    await fs.unlink(abs);
  } catch {
    /* may already be gone */
  }
  return { path: rel, via: "local" };
}

export async function saveBinaryAsset({
  publicPath,
  buffer,
  message,
}: {
  publicPath: string;
  buffer: Buffer;
  message: string;
}): Promise<SaveResult> {
  const rel = `public${publicPath.startsWith("/") ? "" : "/"}${publicPath}`;

  if (githubConfigured()) {
    const result = await commitBinary({ path: rel, buffer, message });
    return { path: rel, via: "github", commitUrl: result.commitUrl };
  }

  // Local FS only when GitHub is not configured (dev mode).
  const abs = path.join(process.cwd(), rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, buffer);
  return { path: rel, via: "local" };
}

/**
 * Saves a `<slug>.human.mdx` companion in this blog repo at
 * `content/logs/<project>/<slug>.human.mdx`. Companions live here, not in the
 * satellite repo (see lib/logs.ts:getHumanCompanion).
 */
export async function saveHumanCompanion({
  project,
  slug,
  body,
  message,
}: {
  project: string;
  slug: string;
  body: string;
  message: string;
}): Promise<SaveResult> {
  const rel = `content/logs/${project}/${slug}.human.mdx`;

  if (githubConfigured()) {
    const result = await commitFile({ path: rel, content: body, message });
    return { path: rel, via: "github", commitUrl: result.commitUrl };
  }

  const abs = path.join(process.cwd(), rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, body, "utf-8");
  return { path: rel, via: "local" };
}

export async function deleteHumanCompanion({
  project,
  slug,
  message,
}: {
  project: string;
  slug: string;
  message: string;
}): Promise<SaveResult> {
  const rel = `content/logs/${project}/${slug}.human.mdx`;

  if (githubConfigured()) {
    await deleteFile({ path: rel, message });
    return { path: rel, via: "github" };
  }

  const abs = path.join(process.cwd(), rel);
  try {
    await fs.unlink(abs);
  } catch {
    /* may already be gone */
  }
  return { path: rel, via: "local" };
}

export { TYPE_DIRS };

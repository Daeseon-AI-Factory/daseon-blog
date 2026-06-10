import { readText } from "./source";
import type { Locale } from "./i18n";

function candidatePaths(slug: string, locale: Locale): string[] {
  const base = `content/projects/architecture/${slug}`;
  return locale === "en"
    ? [`${base}.mdx`]
    : [`${base}.${locale}.mdx`, `${base}.mdx`]; // fall back to the English deep-dive
}

/**
 * Architecture deep-dives are authored in this repo (unlike READMEs, which
 * are mirrored from the project repo), so no sanitization pass is needed —
 * they are written as blog-ready MDX.
 */
export async function getProjectArchitecture(slug: string, locale: Locale): Promise<string | null> {
  for (const p of candidatePaths(slug, locale)) {
    const raw = await readText(p);
    if (raw) return raw;
  }
  return null;
}

export async function hasProjectArchitecture(slug: string, locale: Locale): Promise<boolean> {
  for (const p of candidatePaths(slug, locale)) {
    if (await readText(p)) return true;
  }
  return false;
}

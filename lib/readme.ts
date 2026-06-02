import { readText } from "./source";
import type { Locale } from "./i18n";

function candidatePaths(slug: string, locale: Locale): string[] {
  const base = `content/projects/readme/${slug}`;
  return locale === "en"
    ? [`${base}.md`]
    : [`${base}.${locale}.md`, `${base}.md`]; // fall back to the default README
}

/**
 * A stored README is rendered through the MDX pipeline, so it must be made
 * MDX-safe and free of links that 404 on the blog:
 *   - strip HTML chrome (centering divs, sub/sup/br) MDX can't reliably parse,
 *   - neutralize relative + private-repo links to plain text (keep in-page
 *     anchors, our own daeseon.ai links, and shield badges).
 */
function sanitizeReadme(md: string): string {
  let s = md;
  // Drop HTML wrappers/inline tags that MDX would treat as JSX, plus raw
  // <img>/<table> chrome (READMEs use repo-relative image paths that 404 on
  // the blog, and HTML tables that are just image layout). GFM "| ... |"
  // markdown tables are untouched.
  s = s.replace(
    /<\/?(div|sub|sup|br|p|span|picture|source|center|img|table|thead|tbody|tr|td|th)\b[^>]*>/gi,
    "",
  );
  // A couple of common HTML entities → text.
  s = s.replace(/&nbsp;/g, " ").replace(/&middot;/g, "·");
  // Neutralize raw HTML <a href="..."> links (footers etc.) by the same rule:
  // keep in-page anchors, daeseon.ai, and shield badges; strip the rest to text.
  s = s.replace(/<a\b[^>]*?href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (full, url, text) => {
    const u = String(url).trim();
    const keep =
      u.startsWith("#") ||
      /^https?:\/\/([a-z0-9-]+\.)?daeseon\.ai(\/|$|\?)/i.test(u) ||
      /^https?:\/\/img\.shields\.io\//i.test(u);
    return keep ? full : text;
  });
  // Neutralize markdown links that won't resolve for a visitor.
  s = s.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (full, text, url) => {
    const u = String(url).trim();
    if (u.startsWith("#")) return full; // in-page anchor
    if (/^https?:\/\/([a-z0-9-]+\.)?daeseon\.ai(\/|$|\?)/i.test(u)) return full; // own domain
    if (/^https?:\/\/img\.shields\.io\//i.test(u)) return full; // badge image
    return text; // strip relative / private-repo links, keep the text
  });
  return s;
}

export async function getProjectReadme(slug: string, locale: Locale): Promise<string | null> {
  for (const p of candidatePaths(slug, locale)) {
    const raw = await readText(p);
    if (raw) return sanitizeReadme(raw);
  }
  return null;
}

export async function hasProjectReadme(slug: string, locale: Locale): Promise<boolean> {
  for (const p of candidatePaths(slug, locale)) {
    if (await readText(p)) return true;
  }
  return false;
}

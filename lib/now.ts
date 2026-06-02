import matter from "gray-matter";
import type { Locale } from "./i18n";
import { readText } from "./source";

export type NowDoc = {
  updated: string;
  headline: string;
  content: string;
};

export async function getNow(locale: Locale): Promise<NowDoc | null> {
  const raw = await readText(`content/now/${locale}.mdx`);
  if (!raw) return null;
  const { data, content } = matter(raw);
  return {
    updated: typeof data.updated === "string" ? data.updated : "",
    headline: typeof data.headline === "string" ? data.headline : "",
    content,
  };
}

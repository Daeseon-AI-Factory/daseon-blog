import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Locale } from "./i18n";

export type NowDoc = {
  updated: string;
  content: string;
};

const NOW_ROOT = path.join(process.cwd(), "content", "now");

export async function getNow(locale: Locale): Promise<NowDoc | null> {
  const filePath = path.join(NOW_ROOT, `${locale}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return {
    updated: typeof data.updated === "string" ? data.updated : "",
    content,
  };
}

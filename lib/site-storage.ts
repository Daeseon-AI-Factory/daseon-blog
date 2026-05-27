import { promises as fs } from "node:fs";
import path from "node:path";
import { commitFile, githubConfigured } from "./github";
import { readText } from "./source";
import siteJson from "@/content/site.json";
import type { SiteAuthor } from "./site";

const REL_PATH = "content/site.json";
const ABS_PATH = path.join(process.cwd(), REL_PATH);

export async function loadSiteConfig(): Promise<SiteAuthor> {
  const raw = await readText(REL_PATH);
  if (!raw) return siteJson as SiteAuthor;
  try {
    return JSON.parse(raw) as SiteAuthor;
  } catch {
    return siteJson as SiteAuthor;
  }
}

export async function saveSiteConfig(next: SiteAuthor): Promise<{ via: "github" | "local"; commitUrl?: string }> {
  const content = `${JSON.stringify(next, null, 2)}\n`;

  if (githubConfigured()) {
    const res = await commitFile({
      path: REL_PATH,
      content,
      message: "Update site config (admin)",
    });
    return { via: "github", commitUrl: res.commitUrl };
  }

  // Local FS only when GitHub is not configured (dev mode).
  await fs.writeFile(ABS_PATH, content, "utf-8");
  return { via: "local" };
}

export function validateSiteConfig(input: Partial<SiteAuthor>): { ok: true; data: SiteAuthor } | { ok: false; error: string } {
  const required: Array<keyof SiteAuthor> = ["name", "nameKo", "role", "roleKo", "location", "locationKo", "email", "avatar", "handle"];
  for (const key of required) {
    const v = input[key];
    if (typeof v !== "string" || !v.trim()) return { ok: false, error: `Field "${key}" is required` };
  }

  const urlFields: Array<keyof SiteAuthor> = ["github", "linkedin", "twitter", "youtube"];
  for (const key of urlFields) {
    const v = input[key];
    if (v === undefined || v === "") continue;
    if (typeof v !== "string" || !/^https?:\/\//.test(v)) return { ok: false, error: `Field "${key}" must be a URL or blank` };
  }

  if (input.avatar && !/^\/|^https?:\/\//.test(input.avatar as string)) {
    return { ok: false, error: `"avatar" must start with / or http(s)://` };
  }
  if (input.email && !/^.+@.+\..+$/.test(input.email as string)) {
    return { ok: false, error: `"email" looks invalid` };
  }

  return {
    ok: true,
    data: {
      name: input.name as string,
      nameKo: input.nameKo as string,
      role: input.role as string,
      roleKo: input.roleKo as string,
      location: input.location as string,
      locationKo: input.locationKo as string,
      email: input.email as string,
      avatar: input.avatar as string,
      available: Boolean(input.available),
      github: (input.github as string) ?? "",
      linkedin: (input.linkedin as string) ?? "",
      twitter: (input.twitter as string) ?? "",
      youtube: (input.youtube as string) ?? "",
      handle: input.handle as string,
      hobby: (input.hobby as string) ?? "",
      hobbyKo: (input.hobbyKo as string) ?? "",
      hobbyPhotos: Array.isArray(input.hobbyPhotos)
        ? (input.hobbyPhotos as Array<{ url?: string; alt?: string }>)
            .filter((p) => p && typeof p.url === "string" && p.url.length > 0)
            .map((p) => ({ url: p.url as string, alt: (p.alt as string) ?? "" }))
            .slice(0, 6)
        : [],
    },
  };
}

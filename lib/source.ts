import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Content source abstraction.
 *
 * In production (when GITHUB_TOKEN + GITHUB_REPO are set), reads come from
 * GitHub Raw / Contents API — so the moment a commit lands, the next request
 * sees fresh data without waiting for a Vercel rebuild.
 *
 * In dev (no GitHub config), reads fall back to the local filesystem.
 */

const REVALIDATE_SECONDS = 30;

type RepoConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

function repoConfig(slugOverride?: string): RepoConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const rawSlug = slugOverride ?? process.env.GITHUB_REPO;
  const slug = rawSlug?.trim().replace(/\/+$/, "");
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!token || !slug || !slug.includes("/")) return null;
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) return null;
  return { owner, repo, branch, token };
}

export type SourceOptions = {
  /** "owner/name" — fetch from this repo instead of the current one. */
  repo?: string;
};

export function sourceIsGithub(): boolean {
  return repoConfig() !== null;
}

function localAbsPath(repoRelativePath: string): string {
  return path.join(process.cwd(), repoRelativePath);
}

export async function readText(repoRelativePath: string, opts: SourceOptions = {}): Promise<string | null> {
  const cfg = repoConfig(opts.repo);
  if (cfg) {
    const url = `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${repoRelativePath}`;
    const res = await fetch(url, {
      headers: { Authorization: `token ${cfg.token}` },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`GitHub raw fetch failed: ${res.status} ${url}`);
    }
    return await res.text();
  }

  if (opts.repo) {
    // Cross-repo requested but no token — can't fall back to local fs (wrong repo)
    return null;
  }

  try {
    return await fs.readFile(localAbsPath(repoRelativePath), "utf-8");
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return null;
    throw e;
  }
}

export async function listFiles(repoRelativeDir: string, opts: SourceOptions = {}): Promise<string[]> {
  const cfg = repoConfig(opts.repo);
  if (cfg) {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${repoRelativeDir}?ref=${cfg.branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.status === 404) return [];
    if (!res.ok) {
      throw new Error(`GitHub contents fetch failed: ${res.status} ${url}`);
    }
    const data = (await res.json()) as Array<{ name: string; type: string }> | unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((d) => d.type === "file").map((d) => d.name);
  }

  if (opts.repo) return [];

  try {
    return await fs.readdir(localAbsPath(repoRelativeDir));
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return [];
    throw e;
  }
}

export async function listDirs(repoRelativeDir: string, opts: SourceOptions = {}): Promise<string[]> {
  const cfg = repoConfig(opts.repo);
  if (cfg) {
    const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${repoRelativeDir}?ref=${cfg.branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${cfg.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (res.status === 404) return [];
    if (!res.ok) {
      throw new Error(`GitHub contents fetch failed: ${res.status} ${url}`);
    }
    const data = (await res.json()) as Array<{ name: string; type: string }> | unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((d) => d.type === "dir").map((d) => d.name);
  }

  if (opts.repo) return [];

  try {
    const entries = await fs.readdir(localAbsPath(repoRelativeDir), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return [];
    throw e;
  }
}

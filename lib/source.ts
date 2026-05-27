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

function repoConfig(): RepoConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const slug = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!token || !slug || !slug.includes("/")) return null;
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) return null;
  return { owner, repo, branch, token };
}

export function sourceIsGithub(): boolean {
  return repoConfig() !== null;
}

function localAbsPath(repoRelativePath: string): string {
  return path.join(process.cwd(), repoRelativePath);
}

export async function readText(repoRelativePath: string): Promise<string | null> {
  const cfg = repoConfig();
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

  try {
    return await fs.readFile(localAbsPath(repoRelativePath), "utf-8");
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return null;
    throw e;
  }
}

export async function listFiles(repoRelativeDir: string): Promise<string[]> {
  const cfg = repoConfig();
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

  try {
    return await fs.readdir(localAbsPath(repoRelativeDir));
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "ENOENT") return [];
    throw e;
  }
}

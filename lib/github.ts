import { Octokit } from "@octokit/rest";

type RepoConfig = {
  owner: string;
  repo: string;
  branch: string;
};

function repoConfig(): RepoConfig | null {
  const slug = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!slug || !slug.includes("/")) return null;
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) return null;
  return { owner, repo, branch };
}

function octokit(): Octokit | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  return new Octokit({ auth: token });
}

export function githubConfigured(): boolean {
  return Boolean(octokit() && repoConfig());
}

export type CommitResult = {
  path: string;
  commitUrl?: string;
  sha?: string;
};

async function commitRaw({
  path,
  base64,
  message,
}: {
  path: string;
  base64: string;
  message: string;
}): Promise<CommitResult> {
  const client = octokit();
  const cfg = repoConfig();
  if (!client || !cfg) throw new Error("GitHub not configured (GITHUB_TOKEN / GITHUB_REPO missing).");

  let existingSha: string | undefined;
  try {
    const existing = await client.repos.getContent({
      owner: cfg.owner,
      repo: cfg.repo,
      path,
      ref: cfg.branch,
    });
    if (!Array.isArray(existing.data) && existing.data.type === "file") {
      existingSha = existing.data.sha;
    }
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status !== 404) throw err;
  }

  const res = await client.repos.createOrUpdateFileContents({
    owner: cfg.owner,
    repo: cfg.repo,
    path,
    message,
    content: base64,
    branch: cfg.branch,
    sha: existingSha,
  });

  return {
    path,
    commitUrl: res.data.commit.html_url,
    sha: res.data.content?.sha,
  };
}

export function commitFile({
  path,
  content,
  message,
}: {
  path: string;
  content: string;
  message: string;
}): Promise<CommitResult> {
  return commitRaw({ path, base64: Buffer.from(content, "utf-8").toString("base64"), message });
}

export function commitBinary({
  path,
  buffer,
  message,
}: {
  path: string;
  buffer: Buffer;
  message: string;
}): Promise<CommitResult> {
  return commitRaw({ path, base64: buffer.toString("base64"), message });
}

export async function deleteFile({
  path,
  message,
}: {
  path: string;
  message: string;
}): Promise<void> {
  const client = octokit();
  const cfg = repoConfig();
  if (!client || !cfg) throw new Error("GitHub not configured.");

  const existing = await client.repos.getContent({
    owner: cfg.owner,
    repo: cfg.repo,
    path,
    ref: cfg.branch,
  });
  if (Array.isArray(existing.data) || existing.data.type !== "file") {
    throw new Error(`Path is not a file: ${path}`);
  }
  await client.repos.deleteFile({
    owner: cfg.owner,
    repo: cfg.repo,
    path,
    message,
    sha: existing.data.sha,
    branch: cfg.branch,
  });
}

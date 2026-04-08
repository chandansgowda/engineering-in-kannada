const REPO_OWNER = "chandansgowda";
const REPO_NAME = "engineering-in-kannada";
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string;

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
};

export interface GitHubContributor {
  github: string;
  name: string;
  prs: number;
  issues: number;
  commits: number;
  githubProfile: string;
  profileImage: string;
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${url}`);
  return res.json();
}

async function fetchAllPages<T>(baseUrl: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  while (true) {
    const data = await get<T[]>(`${baseUrl}${baseUrl.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    results.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return results;
}

export async function fetchLeaderboardData(): Promise<GitHubContributor[]> {
  const base = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}`;

  // Fetch all three in parallel
  const [prs, issues, commitContributors] = await Promise.all([
    fetchAllPages<any>(`${base}/pulls?state=all`),
    fetchAllPages<any>(`${base}/issues?state=closed`),
    fetchAllPages<any>(`${base}/contributors`),
  ]);

  const prCounts: Record<string, number> = {};
  const issueCounts: Record<string, number> = {};
  const commitCounts: Record<string, number> = {};
  const profiles: Record<string, { avatar: string; name: string }> = {};

  // Count merged/open PRs (exclude bots)
  for (const pr of prs) {
    const login = pr.user?.login;
    if (!login || login.includes('[bot]')) continue;
    if (pr.merged_at || pr.state === 'open') {
      prCounts[login] = (prCounts[login] ?? 0) + 1;
      profiles[login] = { avatar: pr.user.avatar_url, name: login };
    }
  }

  // Count closed issues (not PRs)
  for (const issue of issues) {
    if (issue.pull_request) continue; // skip PRs listed as issues
    const login = issue.user?.login;
    if (!login || login.includes('[bot]')) continue;
    if (issue.state === 'closed') {
      issueCounts[login] = (issueCounts[login] ?? 0) + 1;
      profiles[login] = profiles[login] ?? { avatar: issue.user.avatar_url, name: login };
    }
  }

  // Commit counts from contributors endpoint
  for (const c of commitContributors) {
    const login = c.login;
    if (!login || login.includes('[bot]')) continue;
    commitCounts[login] = c.contributions ?? 0;
    profiles[login] = profiles[login] ?? { avatar: c.avatar_url, name: login };
  }

  // Merge all known users
  const allUsers = new Set([
    ...Object.keys(prCounts),
    ...Object.keys(issueCounts),
    ...Object.keys(commitCounts),
  ]);

  const contributors: GitHubContributor[] = Array.from(allUsers).map((login) => ({
    github: login,
    name: profiles[login]?.name ?? login,
    prs: prCounts[login] ?? 0,
    issues: issueCounts[login] ?? 0,
    commits: commitCounts[login] ?? 0,
    githubProfile: `https://github.com/${login}`,
    profileImage: profiles[login]?.avatar ?? `https://github.com/${login}.png`,
  }));

  return contributors
    .sort((a, b) => (b.prs + b.issues + b.commits) - (a.prs + a.issues + a.commits))
    .slice(0, 10);
}

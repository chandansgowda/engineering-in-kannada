export const REPO_OWNER = "chandansgowda";
export const REPO_NAME = "engineering-in-kannada";
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

const API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const CACHE_KEY = "eik-leaderboard-v2";
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const TOP_N = 10;

interface GitHubUser {
  login: string;
  avatar_url: string;
  type?: string;
  name?: string | null;
}

interface GitHubPullRequest {
  user: GitHubUser | null;
  state: "open" | "closed";
  merged_at: string | null;
}

interface GitHubIssue {
  user: GitHubUser | null;
  assignee: GitHubUser | null;
  assignees?: GitHubUser[];
  state: "open" | "closed";
  pull_request?: unknown;
}

interface GitHubRepoContributor extends GitHubUser {
  contributions: number;
}

export interface GitHubContributor {
  github: string;
  name: string;
  prs: number;
  issues: number;
  commits: number;
  score: number;
  githubProfile: string;
  profileImage: string;
}

export interface LeaderboardResult {
  contributors: GitHubContributor[];
  fetchedAt: number;
  stale?: boolean;
}

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
};

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const limited = res.status === 403 || res.status === 429;
    throw new Error(limited ? "rate-limited" : `GitHub request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function getAllPages<T>(url: string, maxPages = 5): Promise<T[]> {
  const out: T[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await get<T[]>(`${url}${url.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) break;
  }
  return out;
}

const isBot = (u: GitHubUser | null | undefined) =>
  !u || u.type === "Bot" || u.login.endsWith("[bot]");

function readCache(): LeaderboardResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LeaderboardResult) : null;
  } catch {
    return null;
  }
}

function writeCache(result: LeaderboardResult) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(result));
  } catch {
    /* storage full or blocked */
  }
}

/** Returns a cached leaderboard instantly if one exists (fresh or not). */
export function getCachedLeaderboard(): LeaderboardResult | null {
  const cached = readCache();
  if (!cached) return null;
  return { ...cached, stale: Date.now() - cached.fetchedAt > CACHE_TTL };
}

/**
 * Builds the contributor leaderboard with ~15 API requests (down from one request
 * per pull request), which keeps anonymous visitors well within GitHub's
 * 60 requests/hour limit. Results are cached for an hour.
 *
 * - PRs: open or merged pull requests authored by the user
 * - Issues: closed issues the user opened and was assigned to
 * - Commits: commits on the default branch (GitHub contributors API)
 */
export async function fetchLeaderboard({ force = false } = {}): Promise<LeaderboardResult> {
  const cached = getCachedLeaderboard();
  if (cached && !cached.stale && !force) return cached;

  try {
    const [pulls, issues, repoContributors] = await Promise.all([
      getAllPages<GitHubPullRequest>(`${API}/pulls?state=all`),
      getAllPages<GitHubIssue>(`${API}/issues?state=closed`, 3),
      getAllPages<GitHubRepoContributor>(`${API}/contributors`, 2),
    ]);

    const stats = new Map<string, { prs: number; issues: number; avatar: string }>();
    const bump = (user: GitHubUser, key: "prs" | "issues") => {
      const entry = stats.get(user.login) ?? { prs: 0, issues: 0, avatar: user.avatar_url };
      entry[key] += 1;
      stats.set(user.login, entry);
    };

    for (const pr of pulls) {
      if (isBot(pr.user)) continue;
      if (pr.state === "open" || pr.merged_at) bump(pr.user!, "prs");
    }

    for (const issue of issues) {
      if (issue.pull_request || isBot(issue.user)) continue;
      const author = issue.user!.login;
      const assigned =
        issue.assignee?.login === author || issue.assignees?.some((a) => a.login === author);
      if (issue.state === "closed" && assigned) bump(issue.user!, "issues");
    }

    const commits = new Map(repoContributors.map((c) => [c.login, c.contributions]));

    const ranked = Array.from(stats.entries())
      .map(([login, s]) => {
        const c = commits.get(login) ?? 0;
        return {
          github: login,
          name: login,
          prs: s.prs,
          issues: s.issues,
          commits: c,
          score: s.prs + s.issues + c,
          githubProfile: `https://github.com/${login}`,
          profileImage: s.avatar,
        };
      })
      .sort((a, b) => b.score - a.score || b.prs - a.prs || a.github.localeCompare(b.github))
      .slice(0, TOP_N);

    // Display names are a nicety, so fetch them only for the people we show.
    await Promise.all(
      ranked.map(async (c) => {
        try {
          const user = await get<GitHubUser>(`https://api.github.com/users/${c.github}`);
          if (user.name) c.name = user.name;
        } catch {
          /* fall back to the login */
        }
      })
    );

    const result = { contributors: ranked, fetchedAt: Date.now() };
    writeCache(result);
    return result;
  } catch (err) {
    if (cached) return { ...cached, stale: true };
    throw err;
  }
}

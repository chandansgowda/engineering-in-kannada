const REPO_OWNER = "chandansgowda";
const REPO_NAME = "engineering-in-kannada";
const GITHUB_API_BASE = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string;

if (!GITHUB_TOKEN) {
  console.warn(
    "VITE_GITHUB_TOKEN is not set. GitHub API requests will be unauthenticated and may be rate-limited, affecting leaderboard functionality."
  );
}

interface GitHubUser {
  login: string;
  avatar_url: string;
  name?: string;
}

interface GitHubPullRequest {
  user: GitHubUser;
  commits_url: string;
  state: "open" | "closed";
  merged_at: string | null;
}

interface GitHubIssue {
  user: GitHubUser;
  assignee: GitHubUser | null;
  assignees: GitHubUser[];
  state: "open" | "closed";
  pull_request?: {
    url: string;
  };
  closed_at: string | null;
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
  };
}

export interface GitHubContributor {
  github: string;
  prs: number;
  issues: number;
  commits: number;
  githubProfile: string;
  profileImage: string;
  name?: string;
}

const headers: Record<string, string> = {
  Accept: "application/vnd.github.v3+json",
  ...(GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {}),
};

async function fetchPullRequests(): Promise<GitHubPullRequest[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=all&per_page=100`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch pull requests");
  return await response.json();
}

async function fetchIssues(): Promise<GitHubIssue[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/issues?state=closed&per_page=100`,
    { headers }
  );
  if (!response.ok) throw new Error("Failed to fetch issues");
  return await response.json();
}

async function fetchCommitsForPR(commitsUrl: string): Promise<GitHubCommit[]> {
  const response = await fetch(commitsUrl, { headers });
  if (!response.ok) throw new Error("Failed to fetch PR commits");
  return await response.json();
}

async function fetchUserProfile(login: string): Promise<GitHubUser> {
  const response = await fetch(`${GITHUB_API_BASE}/users/${login}`, {
    headers,
  });
  if (!response.ok)
    throw new Error(`Failed to fetch user profile for ${login}`);
  return await response.json();
}

async function processPullRequests(
  prsData: GitHubPullRequest[],
  prCounts: Record<string, number>,
  commitCounts: Record<string, number>,
  userProfiles: Record<string, { avatar: string; name?: string }>
) {
  const processPromises = prsData.map(async (pr) => {
    if (pr.user?.login && (pr.state === "open" || pr.merged_at)) {
      const login = pr.user.login;
      prCounts[login] = (prCounts[login] || 0) + 1;

      // Fetch commits count for the PR
      const commitsData = await fetchCommitsForPR(pr.commits_url);
      commitCounts[login] = (commitCounts[login] || 0) + commitsData.length;

      // Fetch user profile if not already fetched
      if (!userProfiles[login]) {
        const userData = await fetchUserProfile(login);
        userProfiles[login] = {
          avatar: userData.avatar_url,
          name: userData.name,
        };
      }
    }
  });

  await Promise.all(processPromises);
}

function processIssues(
  issuesData: GitHubIssue[],
  issueCounts: Record<string, number>
) {
  issuesData.forEach((issue) => {
    if (issue.pull_request || !issue.user?.login) return;

    if (
      issue.state === "closed" &&
      (issue.assignee?.login === issue.user.login ||
        issue.assignees.some((assignee) => assignee.login === issue.user.login))
    ) {
      const login = issue.user.login;
      issueCounts[login] = (issueCounts[login] || 0) + 1;
    }
  });
}

function prepareContributorsData(
  prCounts: Record<string, number>,
  issueCounts: Record<string, number>,
  commitCounts: Record<string, number>,
  userProfiles: Record<string, { avatar: string; name?: string }>
): GitHubContributor[] {
  const allUsers = new Set([
    ...Object.keys(prCounts),
    ...Object.keys(issueCounts),
  ]);

  return Array.from(allUsers).map((login) => ({
    github: login,
    name: userProfiles[login]?.name || login,
    prs: prCounts[login] || 0,
    issues: issueCounts[login] || 0,
    commits: commitCounts[login] || 0,
    githubProfile: `https://github.com/${login}`,
    profileImage: userProfiles[login]?.avatar || "",
  }));
}

export async function fetchLeaderboardData(): Promise<GitHubContributor[]> {
  try {
    const [prsData, issuesData] = await Promise.all([
      fetchPullRequests(),
      fetchIssues(),
    ]);

    const prCounts: Record<string, number> = {};
    const issueCounts: Record<string, number> = {};
    const commitCounts: Record<string, number> = {};
    const userProfiles: Record<string, { avatar: string; name?: string }> = {};

    await processPullRequests(prsData, prCounts, commitCounts, userProfiles);
    processIssues(issuesData, issueCounts);

    const contributors = prepareContributorsData(
      prCounts,
      issueCounts,
      commitCounts,
      userProfiles
    );

    return contributors.sort(
      (a, b) => b.prs + b.issues + b.commits - (a.prs + a.issues + a.commits)
    );
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
}

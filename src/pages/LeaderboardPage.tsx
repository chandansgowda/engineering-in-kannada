import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop";
import { Github, Loader2, AlertCircle } from "lucide-react";
import { fetchLeaderboardData, GitHubContributor } from "../services/github";

const MEDAL = ["🥇", "🥈", "🥉"];

export function LeaderboardPage() {
  const [contributors, setContributors] = React.useState<GitHubContributor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchLeaderboardData()
      .then(setContributors)
      .catch((err) => {
        console.error(err);
        setError("Failed to load contributor data. GitHub API rate limit may have been hit — add VITE_GITHUB_TOKEN to your .env to increase the limit.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop />
      <Header />

      <main className="mx-auto max-w-4xl px-4 pt-28 pb-16 page-enter">
        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Contributor Leaderboard</h1>
          <p className="mt-1 text-sm text-gray-400">
            Top contributors who help make engineering education accessible in Kannada
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6 flex gap-3 items-start">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : contributors.length === 0 ? (
          <div className="rounded-2xl bg-dark-2 border border-white/10 p-12 text-center">
            <p className="text-gray-400">No contributors found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contributors.map((c, i) => (
              <div
                key={c.github}
                className="flex items-center gap-4 rounded-2xl bg-dark-2 border border-white/10 px-5 py-4
                           hover:border-primary/30 hover:bg-dark-3 transition-all duration-200"
              >
                {/* Rank */}
                <div className="w-8 text-center shrink-0">
                  {i < 3
                    ? <span className="text-xl">{MEDAL[i]}</span>
                    : <span className="text-sm font-semibold text-gray-500">#{i + 1}</span>
                  }
                </div>

                {/* Avatar */}
                <img
                  src={c.profileImage}
                  alt={c.name}
                  className="h-10 w-10 rounded-full shrink-0 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1a1a2e&color=f59e0b`;
                  }}
                />

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-500">@{c.github}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <Stat label="PRs" value={c.prs} />
                  <Stat label="Issues" value={c.issues} />
                  <Stat label="Commits" value={c.commits} />
                </div>

                {/* GitHub link */}
                <a
                  href={c.githubProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-primary transition-colors shrink-0"
                  aria-label={`${c.name} on GitHub`}
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center hidden sm:block">
      <p className="text-xs text-gray-500">{label}</p>
      <span className="text-sm font-semibold text-primary">{value}</span>
    </div>
  );
}

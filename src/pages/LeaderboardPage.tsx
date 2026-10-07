import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Crown, GitCommitHorizontal, GitPullRequest, Github, RotateCw, CircleDot, Users } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import {
  fetchLeaderboard,
  getCachedLeaderboard,
  GitHubContributor,
  LeaderboardResult,
  REPO_URL,
} from "../lib/github";
import { cn } from "../lib/cn";

function timeAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`;
}

function avatarFallback(c: GitHubContributor) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || c.github)}&background=FFD700&color=1A1A1A&bold=true`;
}

function Avatar({ c, className }: { c: GitHubContributor; className: string }) {
  const [src, setSrc] = useState(c.profileImage ? `${c.profileImage}${c.profileImage.includes("?") ? "&" : "?"}s=160` : avatarFallback(c));
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      className={cn("rounded-full bg-dark-600 object-cover", className)}
      onError={() => src !== avatarFallback(c) && setSrc(avatarFallback(c))}
    />
  );
}

export function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchLeaderboard({ force }));
    } catch (err) {
      setError(
        (err as Error).message === "rate-limited"
          ? "GitHub's API rate limit was reached. Please try again in a little while."
          : "Failed to load contributor data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Show any cached result immediately, then refresh if it is stale.
    const cached = getCachedLeaderboard();
    if (cached) setData(cached);
    if (!cached || cached.stale) load();
    else setLoading(false);
  }, [load]);

  const list = data?.contributors ?? [];
  const podium = list.slice(0, 3);
  const rest = list.slice(3);

  return (
    <>
      <PageHeader
        eyebrow="Open source"
        title={
          <>
            Contributor <span className="text-gradient-gold">Leaderboard</span>
          </>
        }
        description="Celebrating our amazing contributors who help make engineering education accessible in Kannada."
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Github className="h-4 w-4" /> Start contributing
          </a>
          <button onClick={() => load(true)} disabled={loading} className="btn-secondary">
            <RotateCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
          </button>
          {data && (
            <span className="text-xs text-neutral-500">
              Updated {timeAgo(data.fetchedAt)}
              {data.stale && !loading && " · showing saved results"}
            </span>
          )}
        </div>
      </PageHeader>

      <div className="container-page pt-12">
        {error && !list.length ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load the leaderboard"
            action={
              <button onClick={() => load(true)} className="btn-primary">
                <RotateCw className="h-4 w-4" /> Try again
              </button>
            }
          >
            {error}
          </EmptyState>
        ) : !list.length && loading ? (
          <LeaderboardSkeleton />
        ) : !list.length ? (
          <EmptyState icon={Users} title="No contributors yet">
            Be the first: open a pull request!
          </EmptyState>
        ) : (
          <>
            <ol className="grid items-end gap-4 sm:grid-cols-3">
              {[podium[1], podium[0], podium[2]].map((c, i) => {
                if (!c) return <li key={i} className="hidden sm:block" />;
                const rank = list.indexOf(c) + 1;
                return <PodiumCard key={c.github} c={c} rank={rank} />;
              })}
            </ol>

            {rest.length > 0 && (
              <ol className="card mt-6 divide-y divide-white/[0.06] overflow-hidden">
                {rest.map((c, i) => (
                  <li key={c.github}>
                    <a
                      href={c.githubProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-white/[0.03] sm:px-6"
                    >
                      <span className="w-6 text-center text-sm font-bold text-neutral-500">{i + 4}</span>
                      <Avatar c={c} className="h-10 w-10" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white">{c.name}</span>
                        <span className="block truncate text-xs text-neutral-500">@{c.github}</span>
                      </span>
                      <Stats c={c} className="hidden md:flex" />
                      <span className="text-right">
                        <span className="block text-lg font-extrabold text-primary">{c.score}</span>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-500">points</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-6 text-center text-xs text-neutral-500">
              Points = merged/open PRs + closed self-assigned issues + commits on the main branch. Top 10 shown.
            </p>
          </>
        )}
      </div>
    </>
  );
}

function Stats({ c, className }: { c: GitHubContributor; className?: string }) {
  return (
    <span className={cn("items-center gap-4 text-xs text-neutral-400", className)}>
      <span className="inline-flex items-center gap-1.5" title="Pull requests">
        <GitPullRequest className="h-3.5 w-3.5 text-primary" /> {c.prs}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Issues">
        <CircleDot className="h-3.5 w-3.5 text-primary" /> {c.issues}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Commits">
        <GitCommitHorizontal className="h-3.5 w-3.5 text-primary" /> {c.commits}
      </span>
    </span>
  );
}

const MEDAL = [
  "",
  "from-primary/25 border-primary/50 sm:pb-10 sm:pt-10",
  "from-neutral-300/15 border-neutral-300/30",
  "from-amber-700/20 border-amber-700/40",
];
const MEDAL_TEXT = ["", "bg-primary text-dark", "bg-neutral-300 text-dark", "bg-amber-600 text-dark"];

function PodiumCard({ c, rank }: { c: GitHubContributor; rank: number }) {
  return (
    <li className={cn(rank === 1 ? "order-first sm:order-none" : "")}>
      <a
        href={c.githubProfile}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "relative flex animate-fade-up flex-col items-center rounded-2xl border bg-gradient-to-b to-transparent px-5 pb-6 pt-8 text-center transition hover:-translate-y-1",
          MEDAL[rank]
        )}
      >
        {rank === 1 && <Crown className="absolute -top-4 h-8 w-8 fill-primary text-primary drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]" />}
        <div className="relative">
          <Avatar c={c} className={cn("ring-4 ring-dark", rank === 1 ? "h-24 w-24" : "h-20 w-20")} />
          <span
            className={cn(
              "absolute -bottom-2 left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full text-sm font-extrabold ring-4 ring-dark",
              MEDAL_TEXT[rank]
            )}
          >
            {rank}
          </span>
        </div>
        <p className="mt-5 max-w-full truncate text-lg font-bold text-white">{c.name}</p>
        <p className="max-w-full truncate text-xs text-neutral-500">@{c.github}</p>
        <p className="mt-3 text-3xl font-extrabold text-primary">{c.score}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">points</p>
        <Stats c={c} className="mt-4 flex" />
      </a>
    </li>
  );
}

function LeaderboardSkeleton() {
  return (
    <div aria-label="Loading leaderboard">
      <div className="grid items-end gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("skeleton rounded-2xl", i === 1 ? "h-72" : "h-64")} />
        ))}
      </div>
      <div className="card mt-6 space-y-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <div className="skeleton h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-40" />
              <div className="skeleton h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

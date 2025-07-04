import React from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ScrollToTop } from "../components/ScrollToTop"; 
import { Github, Loader2 } from "lucide-react";
import { fetchLeaderboardData, GitHubContributor } from "../services/github";
import { useTranslation } from 'react-i18next'; // Import useTranslation

export function LeaderboardPage() {
  const { t } = useTranslation(); // Initialize useTranslation
  const [contributors, setContributors] = React.useState<GitHubContributor[]>(
    []
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchLeaderboardData();
        setContributors(data);
      } catch (err) {
        setError(t('leaderboardError')); // Use translated error
        console.error("Error loading contributors:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop /> {/* 🟢 Add ScrollToTop component */}
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t('leaderboardTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            {t('leaderboardSubtitle')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            {/* Optionally, add a loading text: <p className="ml-2 text-white">{t('loading')}</p> */}
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-500/10 rounded-xl border border-red-500/20">
            <p className="text-red-400">{error}</p> {/* Error is already translated from useEffect */}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-white"
                    >
                      {t('leaderboardRank')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-sm font-semibold text-white"
                    >
                      {t('leaderboardContributor')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-white"
                    >
                      {t('leaderboardPRs')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-white"
                    >
                      {t('leaderboardIssues')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-center text-sm font-semibold text-white"
                    >
                      {t('leaderboardCommits')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-sm font-semibold text-white"
                    >
                      {t('leaderboardProfile')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {contributors.map((contributor, index) => (
                    <tr key={contributor.github} className="hover:bg-white/5">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <span
                            className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${
                              index === 0
                                ? "bg-yellow-500/20 text-yellow-500"
                                : index === 1
                                ? "bg-gray-400/20 text-gray-400"
                                : index === 2
                                ? "bg-amber-600/20 text-amber-600"
                                : "bg-white/10 text-gray-400"
                            } text-sm font-semibold`}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={contributor.profileImage}
                            alt={contributor.name}
                            className="h-10 w-10 rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                contributor.name || contributor.github
                              )}&background=random`;
                            }}
                          />
                          <div className="ml-4">
                            <div className="font-medium text-white">
                              {contributor.name || contributor.github}
                            </div>
                            <div className="text-sm text-gray-400">
                              @{contributor.github}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-300">
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-sm font-medium text-primary">
                          {contributor.prs}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-300">
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-sm font-medium text-primary">
                          {contributor.issues}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-300">
                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-sm font-medium text-primary">
                          {contributor.commits}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-300">
                        <div className="flex items-center justify-end space-x-3">
                          <a
                            href={contributor.githubProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
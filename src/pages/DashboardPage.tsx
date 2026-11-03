import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bookmark, Flame } from "lucide-react";
import { ContinueLearning } from "../components/dashboard/ContinueLearning";
import { CourseProgress } from "../components/dashboard/CourseProgress";
import { LearningLibrary } from "../components/dashboard/LearningLibrary";
import { LearningStats } from "../components/dashboard/LearningStats";
import { LearningStreak } from "../components/dashboard/LearningStreak";
import { ProgressTransfer } from "../components/dashboard/ProgressTransfer";
import { RecommendedLessons } from "../components/dashboard/RecommendedLessons";
import { StudentProfile } from "../components/dashboard/StudentProfile";
import { WeeklyGoals } from "../components/dashboard/WeeklyGoals";
import { allLessons, courses } from "../lib/catalog";
import { getEnrolledCourses, getRecommendedLessons } from "../lib/dashboard";
import { useDashboardStore } from "../store/dashboard";
import { useProgressStore } from "../store/progress";

const sectionLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#goals", label: "Weekly goals" },
  { href: "#continue", label: "Continue learning" },
  { href: "#recommendations", label: "Recommendations" },
  { href: "#courses", label: "Courses" },
  { href: "#saved-lessons", label: "Saved lessons" },
  { href: "#starred-courses", label: "Starred courses" },
];

export function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const profile = useDashboardStore((state) => state.profile);
  const saveProfile = useDashboardStore((state) => state.saveProfile);
  const completedVideoIds = useProgressStore((state) => state.completedVideos);
  const starredVideoIds = useProgressStore((state) => state.starredVideos);
  const recentlyAccessed = useProgressStore((state) => state.recentlyAccessed);
  const activityByDate = useProgressStore((state) => state.activityByDate);

  useEffect(() => setMounted(true), []);

  const knownCompletedIds = useMemo(() => {
    const knownIds = new Set(allLessons.map(({ video }) => video.id));
    return completedVideoIds.filter((id) => knownIds.has(id));
  }, [completedVideoIds]);
  const enrolledCourses = useMemo(
    () => getEnrolledCourses(knownCompletedIds, recentlyAccessed),
    [knownCompletedIds, recentlyAccessed]
  );
  const recommendations = useMemo(
    () => getRecommendedLessons(knownCompletedIds, starredVideoIds, recentlyAccessed, profile),
    [knownCompletedIds, starredVideoIds, recentlyAccessed, profile]
  );
  const completedCourses = enrolledCourses.filter((course) => {
    const lessonIds = allLessons.filter((lesson) => lesson.course.id === course.id);
    return lessonIds.length > 0 && lessonIds.every(({ video }) => knownCompletedIds.includes(video.id));
  }).length;
  const overallProgress = allLessons.length
    ? Math.round((knownCompletedIds.length / allLessons.length) * 100)
    : 0;
  if (!mounted) return <DashboardSkeleton />;

  return (
    <div className="container-page py-8 sm:py-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">My learning</p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
            Your learning progress, goals and next steps, all in one place. Progress is saved in this browser.
          </p>
        </div>
        <a href="#saved-lessons" className="btn-secondary self-start sm:self-auto">
          <Bookmark className="h-4 w-4" /> Saved lessons <ArrowRight className="h-4 w-4" />
        </a>
      </div>

      <nav aria-label="Progress sections" className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {sectionLinks.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-neutral-300 transition hover:border-primary/30 hover:text-primary"
          >
            {label}
          </a>
        ))}
      </nav>

      <div id="overview" className="scroll-mt-24">
        <StudentProfile profile={profile} onSave={saveProfile} />
      </div>

      <div className="mt-8">
        <LearningStats
          stats={{
            enrolledCourses: enrolledCourses.length,
            completedCourses,
            completedLessons: knownCompletedIds.length,
            overallProgress,
          }}
        />
      </div>

      <div id="goals" className="mt-8 grid scroll-mt-24 gap-4 lg:grid-cols-2">
        <WeeklyGoals />
        <LearningStreak activityByDate={activityByDate} />
      </div>

      <div id="continue" className="mt-10 scroll-mt-24">
        <ContinueLearning recentlyAccessed={recentlyAccessed} completedVideoIds={knownCompletedIds} />
      </div>

      <div id="recommendations" className="mt-10 scroll-mt-24">
        <RecommendedLessons lessons={recommendations} personalized={Boolean(profile)} />
      </div>

      <div id="courses" className="mt-10 scroll-mt-24">
        <CourseProgress
          courses={enrolledCourses}
          completedVideoIds={knownCompletedIds}
          recentlyAccessed={recentlyAccessed}
        />
      </div>

      <div className="mt-10">
        <LearningLibrary />
      </div>

      {!courses.length && (
        <div className="mt-8 rounded-xl border border-orange-400/20 bg-orange-400/[0.05] p-4 text-sm text-orange-200">
          <Flame className="mr-2 inline h-4 w-4" />
          Course data is not available right now. Your saved profile and learning activity are still here.
        </div>
      )}

      <div className="mt-10">
        <ProgressTransfer />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-page space-y-6 py-10" aria-label="Loading student dashboard" aria-busy="true">
      <div className="skeleton h-44 rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton h-28 rounded-2xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-72 rounded-2xl" />
        <div className="skeleton h-72 rounded-2xl" />
      </div>
    </div>
  );
}

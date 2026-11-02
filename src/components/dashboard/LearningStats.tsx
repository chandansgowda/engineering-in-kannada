import { BookOpenCheck, CheckCircle2, Clock3, GraduationCap, Layers3 } from "lucide-react";

export interface LearningStatistics {
  enrolledCourses: number;
  completedCourses: number;
  completedLessons: number;
  overallProgress: number;
  learningHours: number;
}

export function LearningStats({ stats }: { stats: LearningStatistics }) {
  const cards = [
    { label: "Courses started", value: stats.enrolledCourses, icon: GraduationCap },
    { label: "Courses completed", value: stats.completedCourses, icon: BookOpenCheck },
    { label: "Lessons completed", value: stats.completedLessons, icon: CheckCircle2 },
    { label: "Overall progress", value: `${stats.overallProgress}%`, icon: Layers3 },
    { label: "Study hours", value: `${stats.learningHours.toFixed(1)}h`, icon: Clock3 },
  ];

  return (
    <section aria-labelledby="learning-stats-title">
      <div className="mb-4">
        <p className="eyebrow">Your progress</p>
        <h2 id="learning-stats-title" className="mt-2 text-xl font-extrabold text-white">Learning at a glance</h2>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card card-hover p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-xs font-semibold leading-snug text-neutral-400">{label}</dt>
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            </div>
            <dd className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

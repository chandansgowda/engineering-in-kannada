import { Award, Flame, LockKeyhole, Sparkles } from "lucide-react";
import { getCurrentWeekKeys, getLearningStreak, localDateKey } from "../../lib/dashboard";

const milestones = [
  { days: 7, name: "One-week streak", reward: "7 days" },
  { days: 30, name: "One-month streak", reward: "30 days" },
];
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function LearningStreak({ activityByDate }: { activityByDate: Record<string, string[]> }) {
  const { current, longest } = getLearningStreak(activityByDate);
  const todayKey = localDateKey(new Date());
  const week = getCurrentWeekKeys();

  return (
    <section className="card h-full p-5 sm:p-6" aria-labelledby="streak-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">One day at a time</p>
          <h2 id="streak-title" className="mt-2 text-xl font-extrabold text-white">Learning streak</h2>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-300">
          <Flame className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <p className="text-4xl font-extrabold leading-none text-white">{current}</p>
        <p className="pb-0.5 text-sm font-medium text-neutral-400">{current === 1 ? "day" : "days"} in a row</p>
        <p className="ml-auto text-xs text-neutral-500">Best: {longest}</p>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1.5" aria-label="This week's completed learning days">
        {week.map((date, index) => {
          const completed = (activityByDate[date]?.length ?? 0) > 0;
          const today = date === todayKey;
          return (
            <div key={date} className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-neutral-500">{weekdays[index]}</span>
              <span
                title={`${date}${completed ? ", learning activity completed" : ""}`}
                aria-label={`${weekdays[index]}${today ? ", today" : ""}${completed ? ", active" : ", no activity"}`}
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                  completed ? "bg-primary text-dark" : "bg-white/[0.05] text-neutral-600",
                  today ? "ring-2 ring-primary/50 ring-offset-2 ring-offset-dark" : "",
                ].join(" ")}
              >
                {new Date(`${date}T00:00:00`).getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-white/[0.07] pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <Award className="h-4 w-4 text-primary" /> Streak achievements
          </div>
          <span className="text-[11px] text-neutral-500">
            {milestones.filter(({ days }) => longest >= days).length}/{milestones.length} earned
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {milestones.map(({ days, name, reward }) => {
            const earned = longest >= days;
            return (
              <div
                key={days}
                title={earned ? `${name} badge earned` : `Reach a ${days}-day streak to earn this badge`}
                className={[
                  "flex items-center gap-2 rounded-xl border p-3 transition-colors",
                  earned
                    ? "border-primary/30 bg-primary/[0.08] text-primary"
                    : "border-white/[0.07] bg-white/[0.02] text-neutral-500",
                ].join(" ")}
              >
                <span className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                  earned ? "bg-primary/15" : "bg-white/[0.05]",
                ].join(" ")}>
                  {earned ? <Sparkles className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold">{name}</span>
                  <span className="mt-0.5 block text-[10px] text-neutral-500">
                    {earned ? "Badge earned" : `${reward} to unlock`}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Opening a lesson counts as activity, but YouTube viewing isn't verified. Days use your device's local timezone.
        </p>
      </div>
    </section>
  );
}

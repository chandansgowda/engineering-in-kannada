import { useEffect, useState, type FormEvent } from "react";
import { Check, CalendarDays, Pencil } from "lucide-react";
import { getCurrentWeekKeys, getWeeklyActivity } from "../../lib/dashboard";
import { useDashboardStore, type WeeklyGoals as WeeklyGoalsData } from "../../store/dashboard";
import { useProgressStore } from "../../store/progress";
import { ProgressBar } from "../ProgressRing";

function GoalProgress({ label, current, target, suffix }: { label: string; current: number; target: number; suffix: string }) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const remaining = Math.max(0, target - current);
  const precision = suffix === "h" ? 1 : 0;
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs font-medium text-neutral-400">
          <span className="text-white">{current.toFixed(precision)}{suffix}</span> / {target}{suffix}
        </p>
      </div>
      <ProgressBar percent={percent} className="h-2" />
      <p className="mt-2 text-xs text-neutral-500">
        {remaining ? `${remaining.toFixed(precision)}${suffix} left this week` : "Weekly goal complete"}
      </p>
    </div>
  );
}

export function WeeklyGoals() {
  const goals = useDashboardStore((state) => state.weeklyGoals);
  const setGoals = useDashboardStore((state) => state.setWeeklyGoals);
  const lessonActivityByDate = useProgressStore((state) => state.activityByDate);
  const learningDaysByDate = useProgressStore((state) => state.learningDaysByDate);
  const lessonActivity = getWeeklyActivity(lessonActivityByDate, {}).lessons;
  const [editing, setEditing] = useState(false);
  const [lessonTarget, setLessonTarget] = useState(String(goals.lessons));
  const [learningDaysTarget, setLearningDaysTarget] = useState(String(goals.learningDays));
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const weekKeys = getCurrentWeekKeys(today);
  const activeLearningDays = weekKeys.filter(
    (date) => Boolean(learningDaysByDate[date]) || (lessonActivityByDate[date]?.length ?? 0) > 0
  ).length;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updated: WeeklyGoalsData = {
      lessons: Number(lessonTarget),
      learningDays: Number(learningDaysTarget),
    };
    if (!Number.isInteger(updated.lessons) || !Number.isInteger(updated.learningDays)) return;
    setGoals(updated);
    setEditing(false);
  };

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="weekly-goals-title">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Build your rhythm</p>
          <h2 id="weekly-goals-title" className="mt-2 text-xl font-extrabold text-white">Weekly goals</h2>
        </div>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="icon-btn"
          aria-label={editing ? "Close goal editor" : "Edit weekly goals"}
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {editing ? (
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <label className="text-sm text-neutral-300">
            Lessons per week
            <input
              type="number"
              min={1}
              max={100}
              required
              value={lessonTarget}
              onChange={(event) => setLessonTarget(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white"
            />
          </label>
          <label className="text-sm text-neutral-300">
            Learning days per week
            <input
              type="number"
              min={1}
              max={7}
              required
              value={learningDaysTarget}
              onChange={(event) => setLearningDaysTarget(event.target.value)}
              className="mt-1.5 h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white"
            />
          </label>
          <button type="submit" className="btn-primary mt-1"><Check className="h-4 w-4" /> Save goals</button>
        </form>
      ) : (
        <div className="mt-6 space-y-6">
          <GoalProgress label="Lessons completed" current={lessonActivity} target={goals.lessons} suffix="" />
          <GoalProgress
            label="Learning Days This Week"
            current={activeLearningDays}
            target={goals.learningDays}
            suffix=" days"
          />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">One active day per calendar day</p>
            <p className="text-xs text-neutral-500">Open a lesson video to count today</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          Learning days
        </span>
      </div>
    </section>
  );
}

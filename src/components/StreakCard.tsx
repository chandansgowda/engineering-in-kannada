import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, CheckCircle2, Flame, Sparkles, Trophy } from "lucide-react";
import { useProgressStore } from "../store/progress";
import { findLesson, lessonTitle } from "../lib/catalog";
import {
  HeatmapDay,
  STREAK_MILESTONES,
  addDays,
  applyLocalDateChange,
  calculateStreakStats,
  formatActivityDate,
  getActivityHeatmap,
  getKalikeRank,
  getStreakPrompt,
  msUntilNextLocalMidnight,
  toLocalDateString,
} from "../lib/streak";
import { cn } from "../lib/cn";

const WEEKDAY_SHORT = ["M", "T", "W", "T", "F", "S", "S"] as const;
const WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const INTENSITY_CLASSES: Record<HeatmapDay["intensity"], string> = {
  0: "border-white/10 bg-white/[0.03] text-neutral-300 hover:border-white/30 hover:text-white",
  1: "border-primary/45 bg-primary/20 text-primary-100 hover:border-primary/75",
  2: "border-primary/75 bg-primary/65 font-bold text-dark hover:border-primary",
  3: "border-primary bg-primary font-extrabold text-dark hover:border-primary-200",
};

function dayAriaLabel(day: HeatmapDay, isSelected: boolean): string {
  const countText =
    day.count === 0
      ? "No lessons completed"
      : `${day.count} ${day.count === 1 ? "lesson" : "lessons"} completed`;
  const parts = [day.label];
  if (day.isToday) parts.push("today");
  if (isSelected) parts.push("selected");
  return `${parts.join(", ")}: ${countText}`;
}

export function StreakCard() {
  const dailyCompletions = useProgressStore((s) => s.dailyCompletions);
  const [todayStr, setTodayStr] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selectedDateRef = useRef<string | null>(null);
  const todayStrRef = useRef<string | null>(null);
  selectedDateRef.current = selectedDate;
  todayStrRef.current = todayStr;

  // Defer local date until after mount (SSR hydration), then refresh past midnight without a full reload.
  useEffect(() => {
    let timeoutId = 0;

    const refresh = () => {
      const now = toLocalDateString();
      const next = applyLocalDateChange(todayStrRef.current, now, selectedDateRef.current);
      todayStrRef.current = next.todayStr;
      selectedDateRef.current = next.selectedDate;
      setTodayStr(next.todayStr);
      setSelectedDate(next.selectedDate);
    };

    const scheduleMidnight = () => {
      timeoutId = window.setTimeout(() => {
        refresh();
        scheduleMidnight();
      }, msUntilNextLocalMidnight() + 250);
    };

    refresh();
    scheduleMidnight();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const stats = useMemo(
    () => (todayStr ? calculateStreakStats(dailyCompletions, todayStr) : null),
    [dailyCompletions, todayStr]
  );

  const heatmap = useMemo(
    () => (todayStr ? getActivityHeatmap(dailyCompletions, todayStr, 28) : []),
    [dailyCompletions, todayStr]
  );

  const weekDays = useMemo(() => {
    if (!todayStr) return [];
    const [y, m, d] = todayStr.split("-").map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayStr = addDays(todayStr, offsetToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(mondayStr, i);
      const count = dailyCompletions[date]?.length ?? 0;
      return {
        date,
        shortLabel: WEEKDAY_SHORT[i],
        fullName: WEEKDAY_NAMES[i],
        formattedDate: formatActivityDate(date),
        count,
        isToday: date === todayStr,
        isFuture: date > todayStr,
      };
    });
  }, [dailyCompletions, todayStr]);

  // Pad the 28-day window to full Monday-Sunday rows so every cell aligns with its weekday column.
  const calendarCells = useMemo(() => {
    if (heatmap.length === 0) return [];
    const firstWeekday = heatmap[0].weekday;
    const leadingEmpty = firstWeekday === 0 ? 6 : firstWeekday - 1;
    const lastWeekday = heatmap[heatmap.length - 1].weekday;
    const trailingEmpty = lastWeekday === 0 ? 0 : 7 - lastWeekday;

    return [
      ...Array.from({ length: leadingEmpty }, () => null),
      ...heatmap,
      ...Array.from({ length: trailingEmpty }, () => null),
    ];
  }, [heatmap]);

  const activeDayPreview = useMemo(() => {
    if (heatmap.length === 0) return null;
    if (selectedDate) {
      const match = heatmap.find((d) => d.date === selectedDate);
      if (match) return match;
    }
    return heatmap[heatmap.length - 1];
  }, [heatmap, selectedDate]);

  const activeDayLessons = useMemo(() => {
    if (!activeDayPreview) return [];
    const ids = dailyCompletions[activeDayPreview.date] ?? [];
    return ids
      .map((id) => findLesson(id))
      .filter((ref): ref is NonNullable<typeof ref> => ref !== undefined);
  }, [activeDayPreview, dailyCompletions]);

  if (!stats) {
    return (
      <section aria-label="Learning streak" className="card p-5 sm:p-7">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <div className="skeleton h-12 w-48" />
            <div className="skeleton h-12 w-72" />
            <div className="skeleton h-4 w-full max-w-sm" />
          </div>
          <div className="skeleton h-64 w-full max-w-[336px] rounded-xl" />
        </div>
      </section>
    );
  }

  const rank = getKalikeRank(stats.longestStreak);
  const prompt = getStreakPrompt(stats);
  const hasActivity = stats.totalActiveDays > 0;

  const nextMilestone = STREAK_MILESTONES.find((m) => m > stats.currentStreak) ?? null;
  const nextMilestoneRank = nextMilestone !== null ? getKalikeRank(nextMilestone) : null;
  const prevMilestone = [...STREAK_MILESTONES].reverse().find((m) => m <= stats.currentStreak) ?? 0;
  const milestonePercent =
    nextMilestone === null
      ? 100
      : Math.round(((stats.currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100);

  const firstMonth = heatmap[0]?.label.split(" ")[1] ?? "";
  const lastParts = heatmap[heatmap.length - 1]?.label.split(" ") ?? [];
  const lastMonth = lastParts[1] ?? "";
  const lastYear = lastParts[2] ?? "";
  const monthContext =
    firstMonth && lastMonth
      ? firstMonth === lastMonth
        ? `${lastMonth} ${lastYear}`
        : `${firstMonth} – ${lastMonth} ${lastYear}`
      : "";

  return (
    <section aria-labelledby="streak-heading" className="card p-5 sm:p-7">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_auto] lg:gap-10">
        {/* LEFT PANEL — Streak Hero */}
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="eyebrow">Learning Streak</p>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold leading-normal",
                  stats.longestStreak > 0
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/15 bg-white/[0.04] text-neutral-100"
                )}
                aria-label={
                  stats.longestStreak > 0
                    ? `Lifetime rank ${rank}, from your best streak of ${stats.longestStreak} days`
                    : `Lifetime rank ${rank}. Rank uses your longest streak, not your current streak.`
                }
              >
                {rank}
                <span className="font-normal text-neutral-300">lifetime best</span>
              </span>
            </div>
            {stats.isActiveToday ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold leading-normal text-emerald-300 ring-1 ring-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Active today
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-semibold leading-normal text-neutral-200">
                {stats.currentStreak > 0 ? "Keep it alive today" : "Start today"}
              </span>
            )}
          </div>

          {/* Primary Streak Focal Point */}
          <div className="mt-4 flex items-center gap-4">
            <div
              className={cn(
                "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 transition motion-reduce:transition-none",
                stats.currentStreak > 0
                  ? "bg-primary/15 text-primary ring-primary/35 shadow-glow"
                  : "bg-white/[0.04] text-neutral-300 ring-white/10"
              )}
            >
              <Flame className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="streak-heading"
                className="flex items-baseline gap-2 text-4xl font-extrabold tracking-tight text-white tabular-nums sm:text-5xl"
              >
                <span>{stats.currentStreak}</span>
                <span className="text-lg font-semibold leading-normal tracking-normal text-neutral-200 sm:text-xl">
                  {stats.currentStreak === 1 ? "day" : "days"}
                </span>
              </h2>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal leading-normal text-neutral-300 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  Lifetime best:{" "}
                  <strong className="font-semibold tabular-nums text-neutral-100">{stats.longestStreak}d</strong>
                </span>
                <span aria-hidden="true" className="text-neutral-500">·</span>
                <span>
                  Total:{" "}
                  <strong className="font-semibold tabular-nums text-neutral-100">{stats.totalActiveDays}</strong>{" "}
                  {stats.totalActiveDays === 1 ? "active day" : "active days"}
                </span>
              </p>
            </div>
          </div>

          {/* Adaptive Comeback & Personal Record Prompt */}
          <p className="mt-4 flex flex-wrap items-center gap-2 text-sm leading-relaxed text-neutral-200">
            {prompt.highlight && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-bold leading-normal text-primary ring-1 ring-primary/30">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                {prompt.highlight}
              </span>
            )}
            <span>{prompt.message}</span>
          </p>

          {/* Monday–Sunday Weekly Journey */}
          <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between text-xs leading-normal sm:text-sm">
              <span className="font-semibold text-neutral-200">This week</span>
              <span className="font-bold tabular-nums text-neutral-100">
                <span className="text-primary">{stats.weeklyConsistency}</span> / 7 days
              </span>
            </div>
            <ol
              className="mt-3.5 grid grid-cols-7 gap-1.5 sm:gap-2"
              aria-label="Weekly learning journey from Monday to Sunday"
            >
              {weekDays.map((day) => {
                const done = day.count > 0;
                const label = day.isFuture
                  ? `${day.fullName}, ${day.formattedDate}: Upcoming`
                  : done
                    ? `${day.fullName}, ${day.formattedDate}: ${day.count} ${day.count === 1 ? "lesson" : "lessons"} completed`
                    : `${day.fullName}, ${day.formattedDate}${day.isToday ? " (Today)" : ""}: No lessons completed`;

                return (
                  <li key={day.date} className="flex flex-col items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 motion-reduce:transition-none",
                        done
                          ? "bg-primary text-dark shadow-sm"
                          : day.isToday
                            ? "border-2 border-emerald-400/80 bg-emerald-500/10 text-emerald-300"
                            : day.isFuture
                              ? "border border-dashed border-white/20 text-neutral-400"
                              : "border border-white/15 bg-white/[0.04] text-neutral-300"
                      )}
                    >
                      {done ? (
                        <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      ) : day.isToday ? (
                        <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                      ) : (
                        <span className="text-xs leading-none">·</span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-xs font-semibold leading-normal",
                        day.isToday ? "text-emerald-300" : done ? "text-neutral-100" : "text-neutral-300"
                      )}
                    >
                      {day.shortLabel}
                    </span>
                    <span className="sr-only">{label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Compact 5-Node Milestone Journey (current streak, not lifetime rank) */}
          <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs leading-normal sm:text-sm">
              {nextMilestone !== null && nextMilestoneRank ? (
                <>
                  <span className="font-medium text-neutral-300">
                    Current streak journey · next{" "}
                    <strong className="font-bold tabular-nums text-white">{nextMilestone}d</strong>{" "}
                    <span className="text-neutral-300">·</span>{" "}
                    <span className="text-neutral-200">{nextMilestoneRank}</span>
                  </span>
                  <span className="font-semibold tabular-nums text-primary">
                    {nextMilestone - stats.currentStreak}{" "}
                    {nextMilestone - stats.currentStreak === 1 ? "day" : "days"} left
                  </span>
                </>
              ) : (
                <>
                  <span className="font-semibold text-emerald-300">
                    Current streak journey: all milestones unlocked
                  </span>
                  <span className="font-bold text-primary">100+ days</span>
                </>
              )}
            </div>

            <div
              className="sr-only"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={nextMilestone ?? 100}
              aria-valuenow={Math.min(stats.currentStreak, nextMilestone ?? 100)}
              aria-valuetext={
                nextMilestone !== null
                  ? `Current streak ${stats.currentStreak} of ${nextMilestone} days toward the next milestone`
                  : `Current streak ${stats.currentStreak} days. All streak milestones reached.`
              }
            />

            {/* 5-node milestone track */}
            <ol
              className="mt-3.5 grid grid-cols-5 gap-2"
              aria-label="Current streak milestones at 7, 14, 30, 60 and 100 days"
            >
              {STREAK_MILESTONES.map((milestone) => {
                const reached = stats.currentStreak >= milestone;
                const isTarget = nextMilestone === milestone;
                const milestoneRank = getKalikeRank(milestone);
                const status = reached ? "reached" : isTarget ? "next" : "upcoming";

                return (
                  <li key={milestone} className="flex flex-col items-center gap-1.5">
                    <div
                      className="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-white/[0.08]"
                      aria-hidden="true"
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
                          reached ? "w-full bg-primary" : isTarget ? "bg-primary" : "w-0"
                        )}
                        style={isTarget ? { width: `${milestonePercent}%` } : undefined}
                      />
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold leading-normal tabular-nums",
                        reached
                          ? "bg-primary/15 text-primary"
                          : isTarget
                            ? "border border-white/20 bg-white/[0.05] text-white"
                            : "text-neutral-300"
                      )}
                    >
                      {reached && <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />}
                      <span aria-hidden="true">{milestone}d</span>
                      <span className="sr-only">
                        {milestone} day current-streak milestone, {milestoneRank}, {status}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* RIGHT PANEL — Compact 28-Day Activity Calendar & Lesson Log */}
        <div
          className={cn(
            "mx-auto w-full max-w-[336px] rounded-xl border p-3.5 transition sm:p-4 lg:mx-0",
            hasActivity
              ? "border-white/[0.08] bg-dark-900/70"
              : "border-white/[0.05] bg-dark-900/40"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Wide tracking is relaxed on Kannada pages so conjuncts stay joined. */}
              <p className="text-xs font-bold uppercase leading-normal tracking-wider text-neutral-200 [html.translated-ltr_&]:tracking-normal [html[lang=kn]_&]:tracking-normal">
                Last 28 days
              </p>
              {monthContext && (
                <p className="mt-0.5 text-xs font-medium leading-normal text-neutral-300">{monthContext}</p>
              )}
            </div>
            <div
              className={cn(
                "flex items-center gap-1.5 pt-0.5 text-xs font-medium leading-normal text-neutral-300",
                !hasActivity && "opacity-90"
              )}
              aria-label="Activity intensity: from zero lessons to four or more"
            >
              <span>Less</span>
              <span className="h-3 w-3 rounded-[3px] border border-white/10 bg-white/[0.03]" aria-hidden="true" />
              <span className="h-3 w-3 rounded-[3px] border border-primary/45 bg-primary/20" aria-hidden="true" />
              <span className="h-3 w-3 rounded-[3px] border border-primary/75 bg-primary/65" aria-hidden="true" />
              <span className="h-3 w-3 rounded-[3px] border border-primary bg-primary" aria-hidden="true" />
              <span>More</span>
            </div>
          </div>

          <div className="mt-3.5" role="group" aria-label="28-day learning activity calendar">
            <div
              className="grid grid-cols-7 gap-1.5 sm:gap-2"
              aria-hidden="true"
            >
              {WEEKDAY_SHORT.map((day, idx) => (
                <div key={`${day}-${idx}`} className="pb-1 text-center text-xs font-semibold leading-normal text-neutral-300">
                  {day}
                </div>
              ))}
            </div>
            <ul className="mt-0 grid list-none grid-cols-7 gap-1.5 p-0 sm:gap-2">
              {calendarCells.map((day, idx) => {
                if (!day) {
                  return (
                    <li key={`empty-${idx}`} aria-hidden="true" className="aspect-square w-full list-none" />
                  );
                }
                const dayNumber = Number(day.date.slice(8, 10));
                const isMonthStart = dayNumber === 1;
                const isSelected = activeDayPreview?.date === day.date;

                return (
                  <li key={day.date} className="list-none">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(day.date)}
                      onFocus={() => setSelectedDate(day.date)}
                      aria-label={dayAriaLabel(day, isSelected)}
                      aria-current={day.isToday ? "date" : undefined}
                      aria-pressed={isSelected}
                      className={cn(
                        "relative flex aspect-square min-h-[24px] min-w-[24px] w-full flex-col items-center justify-center rounded-lg border text-[13px] font-semibold tabular-nums transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-dark-900 sm:text-sm",
                        hasActivity
                          ? INTENSITY_CLASSES[day.intensity]
                          : "border-white/[0.06] bg-white/[0.02] text-neutral-300 hover:border-white/25 hover:text-white",
                        isMonthStart && day.weekday !== 1 && "border-l-2 border-l-white/30",
                        isSelected && "ring-2 ring-white ring-offset-1 ring-offset-dark-900"
                      )}
                    >
                      {day.isToday && (
                        <span
                          aria-hidden="true"
                          className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-400"
                        />
                      )}
                      <span aria-hidden="true" className="leading-none">
                        {dayNumber}
                      </span>
                      {day.count > 0 && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-0.5 h-1 w-1 rounded-full",
                            day.intensity >= 2 ? "bg-dark" : "bg-primary"
                          )}
                        />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Selected-day readout: no aria-live so hover/focus across cells is not announced repeatedly */}
          <div className="mt-3.5 border-t border-white/[0.08] pt-3 text-xs text-neutral-300">
            {activeDayPreview && (
              <>
                <p className="font-medium leading-relaxed text-neutral-200">
                  <span className="font-bold text-white">{activeDayPreview.label}</span>
                  {activeDayPreview.isToday && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-bold leading-normal text-emerald-300">
                      Today
                    </span>
                  )}
                  :{" "}
                  {activeDayPreview.count === 0
                    ? "No lessons completed on this day."
                    : `${activeDayPreview.count} ${activeDayPreview.count === 1 ? "lesson" : "lessons"} completed`}
                </p>
                {!hasActivity && activeDayPreview.count === 0 && (
                  <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                    Your completed lessons will light up this calendar.
                  </p>
                )}
                {activeDayLessons.length > 0 && (
                  <ul
                    className="mt-2.5 max-h-32 space-y-1.5 overflow-y-auto pr-1"
                    aria-label={`Lessons completed on ${activeDayPreview.label}`}
                  >
                    {activeDayLessons.map(({ course, video }) => (
                      <li key={video.id}>
                        <Link
                          to={`/course/${course.id}#lesson-${video.id}`}
                          className="group flex items-start justify-between gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-2 transition hover:border-primary/45 hover:bg-white/[0.06]"
                        >
                          <span className="min-w-0 flex-1">
                            {/* leading-relaxed + py keep tall Kannada glyphs from clipping inside truncate */}
                            <span className="block truncate py-0.5 text-xs font-semibold leading-relaxed text-neutral-100 group-hover:text-primary">
                              {lessonTitle(video.title)}
                            </span>
                            <span className="block truncate py-0.5 text-xs leading-relaxed text-neutral-300">
                              {course.title}
                            </span>
                          </span>
                          <ArrowUpRight
                            className="mt-1 h-3.5 w-3.5 shrink-0 text-neutral-300 transition group-hover:text-primary"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
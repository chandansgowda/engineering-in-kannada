import { useEffect, useState, type FormEvent } from "react";
import { Pencil, UserRound } from "lucide-react";
import {
  ENGINEERING_BRANCHES,
  type StudentProfile as StudentProfileData,
} from "../../store/dashboard";

interface StudentProfileProps {
  profile: StudentProfileData | null;
  onSave: (profile: StudentProfileData) => void;
}

export function StudentProfile({ profile, onSave }: StudentProfileProps) {
  const [editing, setEditing] = useState(!profile);
  const [greeting, setGreeting] = useState("Welcome");
  const [name, setName] = useState(profile?.name ?? "");
  const [branch, setBranch] = useState<StudentProfileData["branch"]>(profile?.branch ?? "CSE");
  const [semester, setSemester] = useState(profile?.semester ?? 1);
  const [college, setCollege] = useState(profile?.college ?? "");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening");
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      name: trimmedName,
      branch,
      semester,
      ...(college.trim() ? { college: college.trim() } : {}),
    });
    setEditing(false);
  };

  if (!editing && profile) {
    const initials = profile.name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return (
      <section className="card relative overflow-hidden p-6 sm:p-8" aria-labelledby="dashboard-welcome">
        <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div
              aria-label={`${profile.name}'s avatar`}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-dark ring-4 ring-primary/10"
            >
              {initials || <UserRound className="h-7 w-7" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{greeting},</p>
              <h1 id="dashboard-welcome" className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {profile.name}
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                {profile.branch} · Semester {profile.semester}
                {profile.college && <> · {profile.college}</>}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => setEditing(true)} className="btn-secondary self-start sm:self-center">
            <Pencil className="h-4 w-4" /> Edit profile
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="card p-6 sm:p-8" aria-labelledby="profile-form-title">
      <div className="mb-6">
        <p className="eyebrow">{profile ? "Your profile" : "A little about you"}</p>
        <h1 id="profile-form-title" className="mt-2 text-2xl font-extrabold text-white">
          {profile ? "Edit your profile" : "Make this space yours"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">
          {profile
            ? "Update your details to tune your dashboard and lesson picks."
            : "Tell us your name, branch and semester to personalize your learning dashboard. Your profile stays in this browser."}
        </p>
      </div>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-neutral-300">
          Your name
          <input
            required
            maxLength={60}
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-white placeholder:text-neutral-600"
            placeholder="e.g. John Doe"
          />
        </label>
        <label className="text-sm font-medium text-neutral-300">
          Engineering branch
          <select
            value={branch}
            onChange={(event) => setBranch(event.target.value as StudentProfileData["branch"])}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-dark px-3 text-white"
          >
            {ENGINEERING_BRANCHES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-300">
          Current semester
          <select
            value={semester}
            onChange={(event) => setSemester(Number(event.target.value))}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-dark px-3 text-white"
          >
            {Array.from({ length: 8 }, (_, index) => index + 1).map((item) => (
              <option key={item} value={item}>Semester {item}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-neutral-300">
          College <span className="font-normal text-neutral-500">(optional)</span>
          <input
            maxLength={100}
            autoComplete="organization"
            value={college}
            onChange={(event) => setCollege(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-white placeholder:text-neutral-600"
            placeholder="College name"
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary">
            {profile ? "Save changes" : "Save profile"}
          </button>
          {profile && (
            <button type="button" onClick={() => setEditing(false)} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

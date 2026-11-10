import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  MessageSquareQuote,
  PenLine,
  Quote,
  Search,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { useTestimonialsStore } from "../store/testimonials";
import { courses } from "../lib/catalog";
import { toast } from "../store/toast";
import { cn } from "../lib/cn";

export function TestimonialsPage() {
  const testimonials = useTestimonialsStore((s) => s.testimonials);
  const hasSubmitted = useTestimonialsStore((s) => s.hasSubmitted);
  const userTestimonialId = useTestimonialsStore((s) => s.userTestimonialId);
  const addTestimonial = useTestimonialsStore((s) => s.addTestimonial);
  const removeOwnTestimonial = useTestimonialsStore((s) => s.removeOwnTestimonial);

  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Form state
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [companyOrCollege, setCompanyOrCollege] = useState("");
  const [course, setCourse] = useState(courses[0]?.title ?? "General");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availableCourses = useMemo(() => {
    const list = Array.from(new Set(testimonials.map((t) => t.course))).filter(Boolean);
    return list;
  }, [testimonials]);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return testimonials.filter((t) => {
      const hay = `${t.name} ${t.role ?? ""} ${t.companyOrCollege ?? ""} ${t.course} ${t.quote}`.toLowerCase();
      const matchesTerms = terms.every((term) => hay.includes(term));
      const matchesCourse = courseFilter === "all" || t.course === courseFilter;
      return matchesTerms && matchesCourse;
    });
  }, [testimonials, query, courseFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast("Please enter your name", "error");
      return;
    }
    if (quote.trim().length < 10) {
      toast("Please share at least a few words (10+ characters)", "error");
      return;
    }

    setSubmitting(true);
    const ok = addTestimonial({
      name: name.trim(),
      role: role.trim() || undefined,
      companyOrCollege: companyOrCollege.trim() || undefined,
      course,
      rating,
      quote: quote.trim(),
    });

    setSubmitting(false);

    if (ok) {
      try {
        const { default: confetti } = await import("canvas-confetti");
        confetti({
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C"],
        });
      } catch {
        /* Confetti is optional */
      }
      toast("Thank you! Your testimonial has been posted.", "success");
      setModalOpen(false);
      setName("");
      setRole("");
      setCompanyOrCollege("");
      setQuote("");
    } else {
      toast("You have already submitted a testimonial.", "error");
    }
  };

  const handleRemoveOwn = () => {
    if (window.confirm("Are you sure you want to remove your testimonial? You will be able to post a new one.")) {
      removeOwnTestimonial();
      toast("Your testimonial has been removed.", "default");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Community Reviews"
        title={
          <>
            Learner <span className="text-gradient-gold">Testimonials</span>
          </>
        }
        description="Authentic feedback and stories from engineers and students learning tech in Kannada."
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {!hasSubmitted ? (
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <PenLine className="h-4 w-4" /> Add your testimonial
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> You have shared your testimonial
            </div>
          )}
          <span className="text-xs text-neutral-400">
            {testimonials.length === 1
              ? "1 genuine review"
              : `${testimonials.length} genuine reviews`}
          </span>
        </div>
      </PageHeader>

      <div className="container-page pt-10 pb-20">
        {/* Filters and search if testimonials exist */}
        {testimonials.length > 0 && (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
              <button
                onClick={() => setCourseFilter("all")}
                aria-pressed={courseFilter === "all"}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                  courseFilter === "all"
                    ? "border-primary bg-primary text-dark"
                    : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"
                )}
              >
                All reviews ({testimonials.length})
              </button>
              {availableCourses.map((c) => (
                <button
                  key={c}
                  onClick={() => setCourseFilter(c)}
                  aria-pressed={courseFilter === c}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                    courseFilter === c
                      ? "border-primary bg-primary text-dark"
                      : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>

            <label className="relative block w-full md:w-72">
              <span className="sr-only">Search testimonials</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reviews…"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/10 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
          </div>
        )}

        {/* Content list or Empty State */}
        {results.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((t) => {
              const isOwn = t.id === userTestimonialId;
              const initials = t.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              return (
                <article
                  key={t.id}
                  className={cn(
                    "card card-hover group relative flex flex-col justify-between overflow-hidden p-6 transition duration-300",
                    isOwn && "ring-1 ring-primary/40 bg-primary/[0.03]"
                  )}
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <StarRating value={t.rating} />
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwn && (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            Your Review
                          </span>
                        )}
                        <span className="chip text-[11px] font-medium">{t.course}</span>
                      </div>
                    </div>

                    <div className="relative mt-4">
                      <Quote className="h-6 w-6 text-primary/30" />
                      <p className="mt-2 text-sm leading-relaxed text-neutral-200 whitespace-pre-line">
                        “{t.quote}”
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-gradient-to-br from-primary/20 to-primary/5 text-xs font-bold text-primary">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{t.name}</p>
                        {(t.role || t.companyOrCollege) && (
                          <p className="truncate text-xs text-neutral-400">
                            {[t.role, t.companyOrCollege].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {isOwn && (
                      <button
                        onClick={handleRemoveOwn}
                        className="icon-btn text-neutral-500 hover:text-red-400"
                        title="Remove your testimonial"
                        aria-label="Remove your testimonial"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={MessageSquareQuote}
              title="No testimonials yet"
              description="Be the first learner to share your experience learning with Engineering in Kannada!"
              action={
                !hasSubmitted ? (
                  <button onClick={() => setModalOpen(true)} className="btn-primary text-sm">
                    <PenLine className="h-4 w-4" /> Write the first testimonial
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="py-12">
            <EmptyState
              icon={Search}
              title="No reviews match your search"
              description="Try adjusting your keyword or course filter."
              action={
                <button
                  onClick={() => {
                    setQuery("");
                    setCourseFilter("all");
                  }}
                  className="btn-secondary text-sm"
                >
                  Clear filters
                </button>
              }
            />
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} label="Add your testimonial">
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-white">Share your experience</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="icon-btn text-neutral-400 hover:text-white"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-neutral-400">
              Only genuine reviews from real learners are featured. Each visitor can submit once.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Your Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g.  Chandan Gowda"
                  maxLength={50}
                  className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Role / Occupation
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. CS Student / SDE"
                    maxLength={40}
                    className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    College / City
                  </label>
                  <input
                    type="text"
                    value={companyOrCollege}
                    onChange={(e) => setCompanyOrCollege(e.target.value)}
                    placeholder="e.g. VTU / Bengaluru"
                    maxLength={40}
                    className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Course Learned
                  </label>
                  <div className="relative mt-1.5 max-w-sm">
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-dark-600 pl-4 pr-10 text-sm text-white focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition cursor-pointer"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.title} className="bg-dark text-white py-1">
                          {c.title}
                        </option>
                      ))}
                      <option value="General Community / All Courses" className="bg-dark text-white py-1">
                        General / All Courses
                      </option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Rating
                  </label>
                  <div className="mt-1.5 flex h-11 items-center">
                    <StarRatingInput value={rating} onChange={setRating} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Your Review / Experience <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Share how Engineering in Kannada helped you understand concepts, prepare for exams, or learn coding..."
                  maxLength={500}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
                <div className="mt-1 flex justify-between text-[11px] text-neutral-500">
                  <span>At least 10 characters</span>
                  <span>{quote.length}/500</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-sm px-6"
                >
                  {submitting ? "Posting..." : "Submit Testimonial"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5 text-primary" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillAmount = Math.max(0, Math.min(1, value - (starIndex - 1)));
        return (
          <div key={starIndex} className="relative h-4 w-4 shrink-0">
            <Star className="h-4 w-4 text-neutral-700" />
            {fillAmount > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <Star className="h-4 w-4 fill-primary text-primary" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const activeVal = hoverVal ?? value;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div
        className="flex items-center gap-1 py-1"
        onMouseLeave={() => setHoverVal(null)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const fillAmount = Math.max(0, Math.min(1, activeVal - (star - 1)));

          return (
            <div key={star} className="relative h-6 w-6 select-none group">
              <Star className="h-6 w-6 text-neutral-700 pointer-events-none" />
              {fillAmount > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ width: `${fillAmount * 100}%` }}
                >
                  <Star className="h-6 w-6 fill-primary text-primary" />
                </div>
              )}

              {/* Left half clickable for .5 (e.g. 4.5) */}
              <button
                type="button"
                onClick={() => onChange(star - 0.5)}
                onMouseEnter={() => setHoverVal(star - 0.5)}
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer z-10 focus:outline-none"
                aria-label={`${star - 0.5} stars`}
              />

              {/* Right half clickable for whole star (e.g. 5.0) */}
              <button
                type="button"
                onClick={() => onChange(star)}
                onMouseEnter={() => setHoverVal(star)}
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer z-10 focus:outline-none"
                aria-label={`${star} stars`}
              />
            </div>
          );
        })}
      </div>

      <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-lg">
        {value.toFixed(1)} / 5
      </span>
    </div>
  );
}


import { ArrowUpRight } from "lucide-react";
import linksData from "../data/links.json";
import { LinkCategory, Link as LinkItem } from "../types";
import { NamedIcon } from "../components/icons";
import { SOCIALS } from "../lib/socials";
import { Img } from "../components/Img";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { totalLessons, courses } from "../lib/catalog";

const categories = linksData.categories as LinkCategory[];

const BRAND: Record<string, string> = {
  Youtube: "from-red-600/40",
  Instagram: "from-pink-600/40",
  Twitter: "from-neutral-400/30",
  Github: "from-neutral-500/30",
  Linkedin: "from-sky-600/40",
};

export function LinksPage() {
  useDocumentTitle("Links");

  return (
    <div className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />

      <div className="container-page relative max-w-5xl pt-14 sm:pt-20">
        <div className="flex animate-fade-up flex-col items-center text-center">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-700 p-[3px] shadow-glow">
            <img src="/images/logo.jpg" alt="" width={96} height={96} className="h-24 w-24 rounded-[1.6rem] object-cover" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient-gold">Connect With Me</span>
          </h1>
          <p className="mt-3 text-neutral-400">Find all my profiles and resources in one place</p>
          <p className="mt-4 text-xs font-semibold text-neutral-500">
            {courses.length} free courses · {totalLessons} lessons · <span className="font-kannada">ಕನ್ನಡದಲ್ಲಿ</span>
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-300 transition hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-dark"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-16 space-y-14">
          {categories.map((category) => (
            <section key={category.id}>
              <h2 className="mb-5 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-neutral-400">
                <span className="h-px w-6 bg-primary" />
                {category.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.links.map((link, i) => (
                  <LinkCard key={link.id} link={link} index={i} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function LinkCard({ link, index }: { link: LinkItem; index: number }) {
  const tint = (link.icon && BRAND[link.icon]) || "from-primary/30";
  const fallback = (
    <div className={`h-full w-full bg-gradient-to-br ${tint} via-dark-600 to-dark-700`}>
      <div className="flex h-full items-center justify-center">
        <NamedIcon name={link.icon} className="h-12 w-12 text-white/30" />
      </div>
    </div>
  );

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-hover group flex animate-fade-up flex-col overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="relative">
        <div className="relative h-36 overflow-hidden bg-dark-600">
          {link.coverImage ? (
            <Img
              src={link.coverImage}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              fallback={fallback}
            />
          ) : (
            fallback
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
        </div>
        <span className="absolute bottom-0 left-5 flex h-12 w-12 translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-dark-700 text-primary shadow-xl transition group-hover:bg-primary group-hover:text-dark">
          <NamedIcon name={link.icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="flex flex-1 items-end justify-between gap-3 px-5 pb-5 pt-9">
        <div className="min-w-0">
          <h3 className="font-bold text-white">{link.title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{link.description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-neutral-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </a>
  );
}

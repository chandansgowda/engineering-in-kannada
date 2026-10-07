import { Link } from "react-router-dom";
import { Github, Heart } from "lucide-react";
import { LogoMark } from "./Logo";
import { SOCIALS } from "../lib/socials";
import { NAV } from "../lib/nav";
import { REPO_URL } from "../lib/github";
import { courses } from "../lib/catalog";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/[0.06] bg-dark-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark className="h-10 w-10" />
            <div className="flex flex-col gap-2 notranslate" translate="no">
              <p className="font-extrabold leading-none text-white">Engineering in Kannada</p>
              <p className="font-kannada text-xs font-semibold leading-none text-neutral-500">ಕನ್ನಡದಲ್ಲಿ ಎಂಜಿನಿಯರಿಂಗ್</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            Empowering Kannada-speaking students with quality engineering education. Learn at your
            own pace, in the language you think in.
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-neutral-400 transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol title="Explore">
          {NAV.map((n) => (
            <FooterLink key={n.to} to={n.to}>
              {n.label}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Courses">
          {courses.map((c) => (
            <FooterLink key={c.id} to={`/course/${c.id}`}>
              {c.title}
            </FooterLink>
          ))}
        </FooterCol>

        <FooterCol title="Open source">
          <li>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-primary"
            >
              <Github className="h-4 w-4" /> Contribute on GitHub
            </a>
          </li>
          <FooterLink to="/leaderboard">Contributors</FooterLink>
          <li>
            <a
              href={`${REPO_URL}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-neutral-400 transition hover:text-primary"
            >
              Report an issue
            </a>
          </li>
        </FooterCol>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-neutral-500 sm:flex-row">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>© {new Date().getFullYear()} Engineering in Kannada. All rights reserved.</span>
            <Link to="/terms" className="transition hover:text-primary">
              Terms
            </Link>
            <Link to="/privacy" className="transition hover:text-primary">
              Privacy
            </Link>
          </p>
          <p className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" /> for the Kannada tech community
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{title}</p>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link to={to} className="text-sm text-neutral-400 transition hover:text-primary">
        {children}
      </Link>
    </li>
  );
}

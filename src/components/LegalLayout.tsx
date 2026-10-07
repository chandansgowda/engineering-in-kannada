import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalLayout({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  other,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  updated: string;
  sections: LegalSection[];
  other: { to: string; label: string };
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro}>
        <p className="mt-6 text-sm text-neutral-500">Last updated: {updated}</p>
      </PageHeader>
      <div className="container-page grid gap-10 pt-12 lg:grid-cols-[220px_1fr] lg:gap-16">
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">On this page</p>
            <ol className="space-y-2 border-l border-white/[0.08]">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-sm text-neutral-400 transition hover:border-primary hover:text-white">
                    {i + 1}. {s.title}
                  </a>
                </li>
              ))}
            </ol>
            <Link to={other.to} className="mt-8 inline-block text-sm font-semibold text-primary hover:underline">
              {other.label} →
            </Link>
          </div>
        </nav>
        <article className="prose prose-invert max-w-3xl prose-headings:scroll-mt-24 prose-headings:font-extrabold prose-h2:mt-12 prose-h2:text-2xl first:prose-h2:mt-0 prose-p:leading-7 prose-li:my-1">
          {sections.map((s, i) => (
            <section key={s.id} aria-labelledby={s.id}>
              <h2 id={s.id}>
                <span className="mr-2 text-primary">{i + 1}.</span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}

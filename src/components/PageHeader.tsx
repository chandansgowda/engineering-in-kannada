import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="container-page relative py-14 sm:py-20">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
          {description && <p className="mt-4 text-lg leading-relaxed text-neutral-400">{description}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}

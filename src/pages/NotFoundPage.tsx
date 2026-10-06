import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useUIStore } from "../store/ui";

export function NotFoundPage({
  title = "Page not found",
  message = "The page you're looking for doesn't exist or has moved.",
}: {
  title?: string;
  message?: string;
}) {
  useDocumentTitle(title);
  const openSearch = useUIStore((s) => s.setSearchOpen);
  return (
    <section className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-gradient-gold text-8xl font-extrabold tracking-tighter sm:text-9xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md text-neutral-400">{message}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft className="h-4 w-4" /> Back to courses
        </Link>
        <button onClick={() => openSearch(true)} className="btn-secondary">
          <Search className="h-4 w-4" /> Search the site
        </button>
      </div>
    </section>
  );
}

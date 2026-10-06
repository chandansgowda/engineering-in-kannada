import { lazy, Suspense, useEffect, useState } from "react";
import { AlertTriangle, ExternalLink, FileText, RotateCw, X } from "lucide-react";
import { Modal } from "./Modal";

const Markdown = lazy(() => import("./Markdown"));

const cache = new Map<string, string>();

function toRawUrl(url: string) {
  return url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/");
}

interface NotesViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export function NotesViewer({ url, title, onClose }: NotesViewerProps) {
  const [content, setContent] = useState<string | null>(cache.get(url) ?? null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (cache.has(url)) return;
    const controller = new AbortController();
    setError(false);
    fetch(toRawUrl(url), { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.text();
      })
      .then((text) => {
        cache.set(url, text);
        setContent(text);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [url, attempt]);

  return (
    <Modal open onClose={onClose} label={`Notes: ${title}`} className="flex h-[88vh] max-w-4xl flex-col sm:h-[85vh]">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Notes</p>
          <p className="truncate text-sm font-semibold text-white">{title}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost hidden px-3 py-2 sm:inline-flex"
        >
          <ExternalLink className="h-4 w-4" /> Open on GitHub
        </a>
        <button onClick={onClose} className="icon-btn" aria-label="Close notes">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-10 sm:py-8">
        {error ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <AlertTriangle className="h-8 w-8 text-red-400" />
            <p className="mt-3 font-semibold text-white">Couldn't load these notes</p>
            <p className="mt-1 text-sm text-neutral-400">Check your connection and try again.</p>
            <div className="mt-5 flex gap-2">
              <button className="btn-primary" onClick={() => setAttempt((a) => a + 1)}>
                <RotateCw className="h-4 w-4" /> Retry
              </button>
              <a className="btn-secondary" href={url} target="_blank" rel="noopener noreferrer">
                Open on GitHub
              </a>
            </div>
          </div>
        ) : content === null ? (
          <NotesSkeleton />
        ) : (
          <article className="prose prose-invert max-w-none prose-headings:scroll-mt-4 prose-img:rounded-xl">
            <Suspense fallback={<NotesSkeleton />}>
              <Markdown>{content}</Markdown>
            </Suspense>
          </article>
        )}
      </div>
    </Modal>
  );
}

function NotesSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading notes">
      <div className="skeleton h-8 w-1/2" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-11/12" />
      <div className="skeleton h-4 w-4/5" />
      <div className="skeleton mt-6 h-32 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4" />
    </div>
  );
}

import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";
import { formatDate, getBlogSummary, loadBlogContent, readingTime, blogPosts } from "../lib/blog";
import { shareLink } from "../lib/share";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { NotFoundPage } from "./NotFoundPage";

const Markdown = lazy(() => import("../components/Markdown"));

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-0 z-[55] h-0.5">
      <div className="h-full bg-primary shadow-[0_0_10px_rgba(255,215,0,0.7)]" style={{ width: `${progress}%` }} />
    </div>
  );
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogSummary(slug);
  const [content, setContent] = useState<string | null>(null);
  useDocumentTitle(post?.metadata.title ?? "Post not found");

  useEffect(() => {
    if (!post) return;
    let alive = true;
    setContent(null);
    loadBlogContent(post.slug)?.then((c) => alive && setContent(c));
    return () => {
      alive = false;
    };
  }, [post]);

  if (!post) {
    return <NotFoundPage title="Blog post not found" message="This post may have moved. Check out our other blogs instead." />;
  }

  const m = post.metadata;
  const others = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const initials = m.author
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <ReadingProgress />
      <article>
        <header className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
          <div className="container-page relative max-w-4xl py-10 sm:py-16">
            <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-400 transition hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> All blogs
            </Link>
            <div className="mt-8 flex flex-wrap gap-2">
              {m.tags.map((t) => (
                <span key={t} className="chip">
                  #{t}
                </span>
              ))}
            </div>
            <h1 className="mt-5 animate-fade-up text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              {m.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-neutral-400">{m.description}</p>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-extrabold text-dark">
                  {initials}
                </span>
                <div>
                  <p className="font-semibold text-white">
                    {m.authorUrl ? (
                      <a href={m.authorUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        {m.author}
                      </a>
                    ) : (
                      m.author
                    )}
                  </p>
                  <p className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(m.date)}
                    </span>
                    {content && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {readingTime(content)} min read
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button onClick={() => shareLink(m.title, window.location.href)} className="btn-secondary">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
        </header>

        <div className="container-page max-w-4xl pt-10 sm:pt-14">
          {content === null ? (
            <ArticleSkeleton />
          ) : (
            <div className="prose prose-invert max-w-none prose-headings:font-extrabold prose-headings:tracking-tight prose-h2:mt-12 prose-p:leading-8 sm:prose-lg">
              <Suspense fallback={<ArticleSkeleton />}>
                <Markdown>{content}</Markdown>
              </Suspense>
            </div>
          )}
        </div>
      </article>

      <div className="container-page max-w-4xl pt-16">
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-white">Enjoyed this post?</p>
            <p className="text-sm text-neutral-400">Share it with a friend who's learning to code.</p>
          </div>
          <button onClick={() => shareLink(m.title, window.location.href)} className="btn-primary">
            <Share2 className="h-4 w-4" /> Share post
          </button>
        </div>
        {others.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-white">More from the blog</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link key={p.slug} to={`/blogs/${p.slug}`} className="card card-hover p-5">
                  <p className="font-semibold text-white">{p.metadata.title}</p>
                  <p className="mt-1 text-xs text-neutral-500">{formatDate(p.metadata.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 pb-6">
          <div className="skeleton h-7 w-2/3" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-11/12" />
          <div className="skeleton h-4 w-4/5" />
        </div>
      ))}
    </div>
  );
}

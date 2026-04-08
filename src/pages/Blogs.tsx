import { Link } from 'react-router-dom';
import { getBlogPosts } from '../utils/blogUtils';
import { truncateWords } from '../utils/textUtils';
import { Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';

export function Blogs() {
  const blogs = getBlogPosts();

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop />
      <Header />

      <div className="mx-auto max-w-5xl px-4 pt-28 pb-16 page-enter">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Blogs</h1>
          <p className="mt-1 text-sm text-gray-400">
            Articles, guides and tutorials from the community
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="rounded-2xl bg-dark-2 border border-white/10 p-12 text-center">
            <p className="text-gray-400">No blogs published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                to={`/blogs/${blog.slug}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4
                           rounded-2xl bg-dark-2 border border-white/10 px-6 py-5
                           hover:border-primary/40 hover:bg-dark-3 transition-all duration-200"
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {blog.metadata.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-base font-semibold text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {truncateWords(blog.metadata.title, 12)}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                    {truncateWords(blog.metadata.description, 20)}
                  </p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {blog.metadata.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.metadata.date).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

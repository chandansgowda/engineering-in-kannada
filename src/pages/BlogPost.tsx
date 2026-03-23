import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost, getRelatedBlogs } from '../utils/blogUtils';
import { truncateWords } from '../utils/textUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop'; // 🟢 Import ScrollToTop component
import { ArrowLeft, Clock, Calendar, User, Tag } from 'lucide-react';
import { LikeButton } from '../components/LikeButton';


export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const blog = slug ? getBlogPost(slug) : null;
  const relatedBlogs = slug ? getRelatedBlogs(slug, 3) : [];

  if (!blog) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <ScrollToTop /> {/* 🟢 Add ScrollToTop component */}
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <Link to="/blogs" className="text-primary hover:underline">
            ← Back to Blogs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <ScrollToTop /> {/* 🟢 Add ScrollToTop component */}
      <Header />
      <div className="container mx-auto px-4 py-6">
        <Link 
          to="/blogs"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-4">
              {blog.metadata.domain && (
                <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-sm font-bold uppercase tracking-wider border border-primary/30">
                  {blog.metadata.domain}
                </span>
              )}
              {blog.metadata.difficulty && (
                <span className={`inline-block py-1 px-3 rounded-full text-sm font-bold uppercase tracking-wider ${
                  blog.metadata.difficulty === 'Beginner' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  blog.metadata.difficulty === 'Intermediate' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {blog.metadata.difficulty}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold mb-6 font-display">{blog.metadata.title}</h1>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>
                By{' '}
                {blog.metadata.authorUrl ? (
                  <a
                    href={blog.metadata.authorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {blog.metadata.author}
                  </a>
                ) : (
                  blog.metadata.author
                )}
              </span>
              <span>{new Date(blog.metadata.date).toLocaleDateString()}</span>
              {blog.metadata.readTime && (
                <div className="flex items-center gap-1.5 border-l border-gray-600 pl-6">
                  <Clock className="h-4 w-4" />
                  <span>{blog.metadata.readTime}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="h-px bg-white/10 mb-6"></div>
          <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-code:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </article>
          {slug && <LikeButton slug={slug} />}

          {/* Related Blogs Section */}
          {relatedBlogs.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <h2 className="text-3xl font-bold mb-8">Related Blogs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map(related => (
                  <Link
                    key={related.slug}
                    to={`/blogs/${related.slug}`}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20 flex flex-col"
                  >
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="flex items-center justify-between mb-3">
                        {related.metadata.domain && (
                          <span className="inline-flex py-1 px-2 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 rounded-full bg-primary/10">
                            {related.metadata.domain}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight flex-grow">
                        {truncateWords(related.metadata.title, 8)}
                      </h3>
                      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-primary" />
                          <span>{related.metadata.author}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span>{new Date(related.metadata.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-white/10">
                        {related.metadata.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                        {related.metadata.tags.length > 2 && (
                          <span className="text-[10px] text-gray-400">+{related.metadata.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};
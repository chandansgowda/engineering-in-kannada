import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPost } from '../utils/blogUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation


export const BlogPost: React.FC = () => {
  const { t } = useTranslation(); 
  const { slug } = useParams<{ slug: string }>();
  const blog = slug ? getBlogPost(slug) : null;

  if (!blog) {
    return (
      <div className="min-h-screen bg-dark text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <Link to="/blogs" className="text-primary hover:underline">
            {t('backToCourses')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <Link 
          to="/blogs" 
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blogs
        </Link>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.metadata.title}</h1>
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
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.metadata.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="h-px bg-white/10 mb-12"></div>
          <article className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-code:text-primary">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
      <Footer />
    </div>
  );
}; 

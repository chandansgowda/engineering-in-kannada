import { Link } from 'react-router-dom';
import { getBlogPosts } from '../utils/blogUtils';
import { truncateWords } from '../utils/textUtils';
import { Calendar, User, Tag, BookOpen } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useTranslation } from 'react-i18next'; // Import useTranslation


export function Blogs() {
  const { t } = useTranslation();
  const blogs = getBlogPosts();

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-0.5 w-12 bg-primary/50"></div>
            <BookOpen className="h-6 w-6 text-primary" />
            <div className="h-0.5 w-12 bg-primary/50"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent pb-2">
            {t('blogPageHeader')}
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link
              key={blog.slug}
              to={`/blogs/${blog.slug}`}
              className="group cursor-pointer overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:bg-white/20"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 text-gray-400 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span>{blog.metadata.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(blog.metadata.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {truncateWords(blog.metadata.title, 10)}
                </h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {truncateWords(blog.metadata.description, 20)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {blog.metadata.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
} 

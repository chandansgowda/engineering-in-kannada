import { Link } from 'react-router-dom';
import { User, Tag, Clock, Heart } from 'lucide-react';
import { BlogPost } from '../../types';
import { truncateWords } from '../../utils/textUtils';
import { Highlighter } from './Highlighter';

interface BlogCardProps {
  readonly blog: BlogPost;
  readonly searchTerm?: string;
}

const getDifficultyColors = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-500/10 text-green-400 border-green-500/10';
    case 'Intermediate':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/10';
    default:
      return 'bg-red-500/10 text-red-400 border-red-500/10';
  }
};

export function BlogCard({ blog, searchTerm = "" }: BlogCardProps) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="group relative flex flex-col h-full overflow-hidden rounded-xl md:rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] transition-all duration-700 hover:bg-white/[0.05] hover:border-primary/30 hover:-translate-y-1 shadow-lg hover:shadow-[0_15px_30px_-8px_rgba(250,204,21,0.08)]"
    >
      <div className="p-3 md:p-5 flex flex-col flex-grow relative z-10">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          {blog.metadata.domain && (
            <span className="inline-flex px-2 py-0.5 rounded-md bg-primary/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20">
              {blog.metadata.domain}
            </span>
          )}
          {blog.metadata.difficulty && (
            <span className={`inline-flex px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${getDifficultyColors(blog.metadata.difficulty)}`}>
              {blog.metadata.difficulty}
            </span>
          )}
        </div>
        
        <h3 className="text-sm md:text-base font-bold text-white mb-1 md:mb-2 group-hover:text-primary transition-colors leading-snug tracking-normal line-clamp-2">
          <Highlighter text={truncateWords(blog.metadata.title, 12)} highlight={searchTerm} />
        </h3>
        <p className="text-[10px] md:text-xs text-gray-600 mb-2 md:mb-3 leading-relaxed line-clamp-2 font-medium opacity-50 group-hover:opacity-100 transition-opacity">
          <Highlighter text={blog.metadata.description} highlight={searchTerm} />
        </p>
        
        <div className="mt-auto pt-2 md:pt-3 border-t border-white/[0.05]">
          <div className="flex items-center justify-between text-[8px] md:text-[9px] text-gray-700 font-bold mb-1 md:mb-2">
            <div className="flex items-center gap-1.5 md:gap-2">
              <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-colors">
                <User className="h-2 md:h-2.5 w-2 md:w-2.5 text-gray-500 group-hover:text-primary" />
              </div>
              <span className="group-hover:text-gray-400">{blog.metadata.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                <Heart className={`h-2 md:h-2.5 w-2 md:w-2.5 ${JSON.parse(localStorage.getItem('likedPosts') || '{}')[blog.slug] ? 'text-primary fill-primary' : 'text-primary/60'}`} />
                <span className="tracking-tighter opacity-70 group-hover:opacity-100">{(blog.slug.split('').reduce((acc, char) => acc + (char.codePointAt(0) || 0), 0) % 3) + 10 + (JSON.parse(localStorage.getItem('likedPosts') || '{}')[blog.slug] ? 1 : 0)}</span>
              </div>
              {blog.metadata.readTime && (
                <div className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md bg-white/[0.03] border border-white/[0.05]">
                  <Clock className="h-2 md:h-2.5 w-2 md:w-2.5 text-primary/60" />
                  <span className="tracking-tighter opacity-70 group-hover:opacity-100">{blog.metadata.readTime}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 md:gap-1.5">
            {blog.metadata.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-white/[0.02] border border-white/[0.05] px-2 py-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-gray-600 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300"
              >
                <Tag className="h-2 w-2 opacity-30" />
                <Highlighter text={tag} highlight={searchTerm} className="bg-primary/20 text-primary rounded-sm px-0.5" />
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary/5 blur-[30px] md:blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-700"></div>
    </Link>
  );
}


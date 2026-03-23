import { useState, useMemo } from 'react';
import { getBlogPosts } from '../utils/blogUtils';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { BlogHeader } from '../components/blogs/BlogHeader';
import { BlogSection } from '../components/blogs/BlogSection';
import { EmptyState } from '../components/blogs/EmptyState';

export function Blogs() {
  const allBlogs = useMemo(() => getBlogPosts(), []);
  
  // Extract unique domains
  const domains = useMemo(() => 
    ['All', ...Array.from(new Set(allBlogs.map(b => b.metadata.domain).filter(Boolean)))].sort((a, b) => a.localeCompare(b)),
    [allBlogs]
  );

  const [selectedDomain, setSelectedDomain] = useState('All');

  // Filter logic
  const filteredBlogs = useMemo(() => 
    allBlogs.filter((b) => {
      return selectedDomain === 'All' || b.metadata.domain === selectedDomain;
    }),
    [allBlogs, selectedDomain]
  );

  const handleReset = () => {
    setSelectedDomain('All');
  };

  const visibleDomains = domains.filter(d => d !== 'All').filter(domain => {
    if (selectedDomain !== 'All' && selectedDomain !== domain) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 selection:bg-primary/30">
      <ScrollToTop />
      <Header />
      
      <BlogHeader />

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 pb-12 min-h-[50vh]">
        <div className="flex flex-col gap-4 md:gap-6 max-w-6xl mx-auto">
          {visibleDomains.map(domain => (
            <BlogSection
              key={domain}
              domain={domain}
              blogs={filteredBlogs.filter(b => b.metadata.domain === domain)}
              isExpanded={selectedDomain === domain}
              searchTerm=""
              onToggle={() => {
                if (selectedDomain === domain) setSelectedDomain('All');
                else setSelectedDomain(domain);
              }}
            />
          ))}

          {/* Empty State */}
          {filteredBlogs.length === 0 && (
            <EmptyState searchTerm="" onClear={handleReset} />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
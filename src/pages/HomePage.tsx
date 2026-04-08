import { useState } from 'react';
import { Search } from 'lucide-react';
import coursesData from '../data/courses.json';
import { CourseCard } from '../components/CourseCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { ScrollToTop } from '../components/ScrollToTop';
import { Course } from '../types';
import { useSearchStore } from '../store/search';

export function HomePage() {
  const { query, setQuery } = useSearchStore();
  const [showSearch, setShowSearch] = useState(false);

  const filteredCourses = (coursesData.courses as Course[]).filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop />
      <Header />

      <main className="mx-auto max-w-6xl px-4 pt-28 pb-8 sm:px-6 lg:px-8 page-enter">
        {/* Hero */}
        <section className="text-center py-12">
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.png"
              alt="Engineering in Kannada"
              className="h-32 w-auto"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x80?text=EK'; }}
            />
          </div>
          <p className="mx-auto max-w-xl text-base text-gray-300 leading-relaxed">
            Quality technical education in Kannada, accessible to everyone.
            Start your learning journey today with free, carefully curated content.
          </p>
        </section>

        {/* Announcement */}
        <div className="mb-12">
          <AnnouncementBanner />
        </div>

        {/* Courses section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Available Courses</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearch((v) => !v)}
                className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-white/5 transition-colors"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              {showSearch && (
                <input
                  type="text"
                  placeholder="Search courses..."
                  autoFocus
                  className="rounded-full px-4 py-1.5 bg-dark-2 text-white text-sm border border-white/10
                             focus:outline-none focus:border-primary/50 transition-colors w-48"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              )}
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-12">No courses found.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

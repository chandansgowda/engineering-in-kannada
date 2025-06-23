import { useState, useEffect } from 'react'; // Added useEffect for data loading
import { CourseCard } from '../components/CourseCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { Course } from '../types';
import { useSearchStore } from '../store/search';
import { useTranslation } from 'react-i18next'; // Import useTranslation

export function HomePage() {
  const { t, i18n } = useTranslation(); // Initialize useTranslation
  const { query, setQuery } = useSearchStore();
  const [showSearch, setShowSearch] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]); // State for courses
  const [loading, setLoading] = useState(true); // State for loading

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      let loadedCoursesData;
      const lang = i18n.language;

      try {
        if (lang === 'kn') {
          try {
            loadedCoursesData = (await import('../data/courses.kn.json')).default;
          } catch (knError) {
            console.warn("Failed to load courses.kn.json, falling back to default.", knError);
            loadedCoursesData = (await import('../data/courses.json')).default;
          }
        } else {
          // For 'en' or any other language, load the default courses.json
          loadedCoursesData = (await import('../data/courses.json')).default;
        }
        setCourses(loadedCoursesData.courses || []);
      } catch (error) {
        console.error("Failed to load courses, attempting absolute fallback:", error);
        // Absolute fallback if primary logic fails catastrophically
        try {
          const fallbackData = (await import('../data/courses.json')).default;
          setCourses(fallbackData.courses || []);
        } catch (defaultError) {
          console.error("Failed to load default courses.json as absolute fallback:", defaultError);
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [i18n.language]); // Reload courses when language changes

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(query.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(query.toLowerCase()))
  );

  // No changes needed for the return part from the previous static text translation step
  // just ensuring the useEffect for data loading is now correctly placed.

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src="/images/logo.png" 
              alt={t('engineeringInKannada')}
              className="h-50 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/200x50?text=Engineering+in+Kannada';
              }}
            />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            {t('homePageTagline')}
          </p>
        </div>

        <div className="mt-8">
          <AnnouncementBanner />
        </div>

        <div className="mt-16">
        <div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold text-white">{t('availableCourses')}</h2>
  <div className="flex items-center space-x-2">
    <button
      onClick={() => setShowSearch((prev) => !prev)}
      className="text-white hover:text-yellow-400 text-xl"
      aria-label={t('searchPlaceholder')}
    >
      🔍
    </button>
    {showSearch && (
      <input
        type="text"
        placeholder={t('searchPlaceholder')}
        className="rounded-md px-3 py-1 bg-gray-800 text-white border border-gray-600 focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    )}
  </div>
</div>

          {/* This part will be updated when dynamic course loading is re-implemented */}
          {loading ? (
            <p className="mt-4 text-center text-gray-400">{t('loading')}</p>
          ) : filteredCourses.length > 0 ? (
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-center text-gray-400">{t('noCoursesFound')}</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

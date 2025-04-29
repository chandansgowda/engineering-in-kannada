import React, { useState } from 'react';
import coursesData from '../data/courses.json';
import { CourseCard } from '../components/CourseCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { Course } from '../types';
import { Search } from 'lucide-react';
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchTerm(searchQuery);
  };

  const filteredCourses = (coursesData.courses as Course[]).filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex justify-center">
            <img 
              src="/images/logo.png" 
              alt="Engineering in Kannada" 
              className="h-50 w-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/200x50?text=Engineering+in+Kannada';
              }}
            />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            Quality technical education in Kannada, 
            accessible to everyone. Start your learning journey today with my 
            free and carefully curated content.
          </p>
        </div>

        <div className="mt-8">
          <AnnouncementBanner />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white">Available Courses</h2>

          <div className="mb-8 mt-8 flex items-center max-w-md mx-auto border border-yellow-300 rounded-md px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-yellow-400">
            <Search className="text-yellow-300 mr-2" /> 
            <input
              type="text"
              placeholder="Search for a course..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="flex-grow bg-transparent outline-none text-white placeholder-yellow-200"
            />
            <button
              onClick={handleSearchSubmit}
              className="ml-2 px-3 py-1 rounded-md bg-yellow-400 text-dark font-semibold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Search
            </button>
          </div>

          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <p className="text-center text-gray-400 col-span-full">
                No courses found.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
import React from 'react';
import { useTranslation } from 'react-i18next';
import coursesData from '../data/courses.json';
import { CourseCard } from '../components/CourseCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { Course } from '../types';

export function HomePage() {
  const { t } = useTranslation();

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
                target.src = `https://via.placeholder.com/200x50?text=${t('engineeringInKannada')}`;
              }}
            />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            {t('homePageDescription')}
          </p>
        </div>

        <div className="mt-8">
          <AnnouncementBanner />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white">{t('allCourses')}</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(coursesData.courses as Course[]).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
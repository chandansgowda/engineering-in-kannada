import React, { Suspense, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import coursesData from '../data/courses.json'; // To be loaded dynamically
import { MetaTags } from '../components/MetaTags'; // Import MetaTags
import { VideoCard } from '../components/VideoCard';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import ShareButton from '../components/ShareButton'; // Import the new ShareButton
import { useProgressStore } from '../store/progress';
import { Video, Course } from '../types'; // Added Course type
import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// VideoList Component (with localization for video data)
const VideoList = React.lazy(() => {
  const VideoListComponent = ({ courseId }: { courseId: string }) => {
    const { i18n, t } = useTranslation();
    const [videos, setVideos] = React.useState<Video[]>([]);
    const { completedVideos } = useProgressStore();
    
    React.useEffect(() => {
      const loadVideos = async () => {
        let videoDataModule;
        const lang = i18n.language;
        try {
          if (lang === 'kn') {
            try {
              videoDataModule = await import(`../data/videos/${courseId}.kn.json`);
            } catch (knError) {
              console.warn(`Failed to load videos ${courseId}.kn.json, falling back to default.`, knError);
              videoDataModule = await import(`../data/videos/${courseId}.json`);
            }
          } else {
            // For 'en' or any other language, load the default .json
            videoDataModule = await import(`../data/videos/${courseId}.json`);
          }
          setVideos(videoDataModule.default?.videos || videoDataModule.videos || []);
        } catch (error) {
          console.error(`Failed to load videos for ${courseId}, attempting absolute fallback:`, error);
          try {
            const fallbackVideoData = await import(`../data/videos/${courseId}.json`);
            setVideos(fallbackVideoData.default?.videos || fallbackVideoData.videos || []);
          } catch (defaultError) {
            console.error(`Failed to load default videos for ${courseId}.json as absolute fallback:`, defaultError);
            setVideos([]);
          }
        }
      };
      loadVideos();
    }, [courseId, i18n.language]);
    
    const completedCount = videos.filter(video => completedVideos.includes(video.id)).length;
    const progress = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t('progress')}: {Math.round(progress)}%</h3>
          <div className="h-2 w-32 rounded-full bg-white/10">
          <ToastContainer toastClassName={'custom-toast'} />
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {videos.map((video: Video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    );
  };
  return Promise.resolve({ default: VideoListComponent });
});

// CoursePage Component (with localization for course details and static text)
export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t, i18n } = useTranslation();
  const [course, setCourse] = useState<Course | null | undefined>(undefined);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;
      setCourse(undefined); // Loading state
      let loadedCoursesData;
      const lang = i18n.language;
      try {
        if (lang === 'kn') {
          try {
            loadedCoursesData = (await import('../data/courses.kn.json')).default;
          } catch (knError) {
            console.warn(`Failed to load courses.kn.json for ${courseId}, falling back to default.`, knError);
            loadedCoursesData = (await import('../data/courses.json')).default;
          }
        } else {
          // For 'en' or any other language, load the default courses.json
          loadedCoursesData = (await import('../data/courses.json')).default;
        }
        const foundCourse = loadedCoursesData.courses.find((c: Course) => c.id === courseId);
        setCourse(foundCourse || null);
      } catch (error) {
        console.error(`Failed to load course details for ${courseId}, attempting absolute fallback:`, error);
        try {
            const fallbackData = (await import('../data/courses.json')).default;
            const foundCourse = fallbackData.courses.find((c: Course) => c.id === courseId);
            setCourse(foundCourse || null);
        } catch (defaultError) {
            console.error(`Failed to load default courses.json as absolute fallback for ${courseId}:`, defaultError);
            setCourse(null);
        }
      }
    };
    fetchCourseDetails();
  }, [courseId, i18n.language]);

  if (course === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <Header />
        <p className="text-white text-xl">{t('loading', 'Loading course details...')}</p>
        <Footer />
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <Header />
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{t('courseNotFound')}</h2>
          <Link to="/" className="mt-4 text-primary hover:text-primary/80">
            {t('returnToHomepage')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <MetaTags
        title={course.title}
        description={course.description}
        imageUrl={course.thumbnail} // Assuming 'thumbnail' is part of Course type and holds an absolute URL or relative path
        url={window.location.href}
      />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToCourses')}
          </Link>
        </div>
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl flex items-center gap-3">
              {course.title}
              <ShareButton url={window.location.href} title={course.title} />
           </h1>
            <p className="mt-2 text-white/60">{course.description}</p>
          </div>
        </div>
        
        <Suspense fallback={<div className="text-white">{t('loadingVideos')}</div>}>
          {courseId && <VideoList courseId={courseId} />} {/* Ensure courseId is passed */}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

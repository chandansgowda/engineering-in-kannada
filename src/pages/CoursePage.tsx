import React, { Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import coursesData from '../data/courses.json';
import { VideoCard } from '../components/VideoCard';
import { ArrowLeft } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useProgressStore } from '../store/progress';
import { Video } from '../types';
import { ToastContainer } from 'react-toastify';

// Create a component to render the video list
const VideoList = React.lazy(() => {
  const VideoListComponent = ({ courseId }: { courseId: string }) => {
    const { t } = useTranslation();
    const [videos, setVideos] = React.useState<Video[]>([]);
    const { completedVideos } = useProgressStore();
    
    React.useEffect(() => {
      const loadVideos = async () => {
        try {
          const videoData = await import(`../data/videos/${courseId}.json`);
          setVideos(videoData.videos);
        } catch (error) {
          console.error("Failed to load videos:", error);
          setVideos([]); // Set to empty array on error
        }
      };
      
      loadVideos();
    }, [courseId]);
    
    const completedCount = videos.filter(video => completedVideos.includes(video.id)).length;
    const progress = videos.length > 0 ? (completedCount / videos.length) * 100 : 0;
    
    if (videos.length === 0) {
      return <div className="text-white">{t('noVideosFound')}</div>;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t('progress', { progress: Math.round(progress) })}</h3>
          <div className="h-2 w-32 rounded-full bg-white/10">
          <ToastContainer
          toastClassName={'custom-toast'}
          />
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

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { t, i18n } = useTranslation(); // Make sure to get i18n instance
  const course = coursesData.courses.find((c) => c.id === courseId);
  
  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{t('courseNotFound')}</h2>
          <Link to="/" className="mt-4 text-primary hover:text-primary/80">
            {t('returnToHomepage')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {i18n.language === 'kn' && course.title_kn ? course.title_kn : course.title}
          </h1>
          <p className="mt-2 text-white/60">
            {i18n.language === 'kn' && course.description_kn ? course.description_kn : course.description}
          </p>
        </div>
        <Suspense fallback={<div className="text-white">{t('loadingVideos')}</div>}>
          <VideoList courseId={courseId!} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
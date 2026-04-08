import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Share2, BookmarkCheck,
  ChevronDown, ChevronUp, CheckCircle, List, Loader2,
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { getCourseConfig } from '../config/courses';
import { fetchPlaylistVideos, loadLocalVideos, PlaylistVideo } from '../services/youtube';
import coursesData from '../data/courses.json';

// ── localStorage helpers ──────────────────────────────────────────────────────
const lsGet = (key: string) => localStorage.getItem(key);
const lsSet = (key: string, val: string) => localStorage.setItem(key, val);

// ── Sidebar item ──────────────────────────────────────────────────────────────
function SidebarItem({
  video, index, isActive, onClick,
}: {
  video: PlaylistVideo; index: number; isActive: boolean; onClick: () => void;
}) {
  const done = lsGet(`done_${video.videoId}`) === 'true';

  return (
    <button
      onClick={onClick}
      className={`w-full flex gap-3 p-3 text-left transition-colors rounded-lg
        ${isActive
          ? 'bg-white/10 border-l-2 border-primary'
          : 'hover:bg-white/5 border-l-2 border-transparent'
        }`}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-24 h-14 rounded overflow-hidden">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        {done && (
          <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-primary fill-primary/30" />
          </div>
        )}
        <span className="absolute bottom-1 right-1 bg-dark/80 text-white text-[10px] px-1 rounded">
          {index + 1}
        </span>
      </div>
      {/* Title */}
      <p className={`text-xs leading-snug line-clamp-3 ${isActive ? 'text-white font-medium' : 'text-gray-400'}`}>
        {video.title}
      </p>
    </button>
  );
}

// ── Main CoursePage ───────────────────────────────────────────────────────────
export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const courseConfig = getCourseConfig(courseId ?? '');
  const courseData = coursesData.courses.find((c) => c.id === courseId);

  const [videos, setVideos] = useState<PlaylistVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(true); // mobile toggle
  const [doneMap, setDoneMap] = useState<Record<string, boolean>>({});

  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement>(null);

  // Current video from URL ?v= param
  const currentVideoId = searchParams.get('v') ?? '';

  const currentVideo = videos.find((v) => v.videoId === currentVideoId) ?? videos[0];
  const currentIndex = videos.findIndex((v) => v.videoId === currentVideo?.videoId);

  // Load playlist — use YouTube API if key is set, else fall back to local JSON
  useEffect(() => {
    if (!courseConfig) return;
    setLoading(true);
    setError(null);

    const hasApiKey = !!import.meta.env.VITE_YOUTUBE_API_KEY;

    const loader = hasApiKey
      ? fetchPlaylistVideos(courseConfig.playlistId)
      : loadLocalVideos(courseConfig.id);

    loader
      .then((vids) => {
        setVideos(vids);
        if (!searchParams.get('v') && vids.length > 0) {
          setSearchParams({ v: vids[0].videoId }, { replace: true });
        }
      })
      .catch(() => setError('Failed to load videos. Please try again.'))
      .finally(() => setLoading(false));
  }, [courseConfig?.playlistId]);

  // Restore done state from localStorage
  useEffect(() => {
    const map: Record<string, boolean> = {};
    videos.forEach((v) => {
      map[v.videoId] = lsGet(`done_${v.videoId}`) === 'true';
    });
    setDoneMap(map);
  }, [videos]);

  // Auto-scroll sidebar to active item
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentVideoId]);

  const selectVideo = useCallback((videoId: string) => {
    setSearchParams({ v: videoId });
    setDescExpanded(false);
  }, [setSearchParams]);

  const handleShare = async () => {
    const url = `${window.location.origin}/course/${courseId}?v=${currentVideo?.videoId ?? ''}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied! ಶೇರ್ ಮಾಡಿ 🔗', { theme: 'dark', toastClassName: 'custom-toast', progressClassName: 'custom-progress', autoClose: 2000 });
    } catch {
      toast('Failed to copy link', { theme: 'dark', toastClassName: 'custom-toast', autoClose: 2000 });
    }
  };

  const toggleDone = () => {
    if (!currentVideo) return;
    const next = !doneMap[currentVideo.videoId];
    lsSet(`done_${currentVideo.videoId}`, String(next));
    setDoneMap((prev) => ({ ...prev, [currentVideo.videoId]: next }));
  };

  const isDone = currentVideo ? (doneMap[currentVideo.videoId] ?? false) : false;

  // ── Not found ──
  if (!courseConfig || !courseData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Course not found</h2>
          <Link to="/" className="text-primary hover:underline">Return to homepage</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <ScrollToTop />
      <Header />
      <ToastContainer toastClassName="custom-toast" progressClassName="custom-progress" />

      <main className="mx-auto max-w-[1400px] px-4 pt-24 pb-4 page-enter">
        {/* Back */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* ── LEFT: Player (70%) ── */}
            <div className="flex-1 min-w-0">
              {/* iframe */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
                {currentVideo && (
                  <iframe
                    key={currentVideo.videoId}
                    src={`https://www.youtube-nocookie.com/embed/${currentVideo.videoId}?autoplay=1&rel=0`}
                    title={currentVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>

              {/* Video title */}
              <h1 className="mt-4 text-lg font-bold text-white leading-snug">
                {currentVideo?.title ?? courseData.title}
              </h1>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {/* Share */}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10
                             text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>

                {/* Done */}
                <button
                  onClick={toggleDone}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors
                    ${isDone
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <BookmarkCheck className={`h-4 w-4 ${isDone ? 'fill-primary/30' : ''}`} />
                  {isDone ? '✓ Done' : 'ಮುಗಿಸಿದೆ'}
                </button>

              </div>

              {/* Description */}
              {currentVideo?.description && (
                <div className="mt-4 rounded-xl bg-dark-2 border border-white/5 p-4">
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full text-left"
                  >
                    {descExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    Description
                  </button>
                  {descExpanded && (
                    <p className="mt-3 text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                      {currentVideo.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ── RIGHT: Playlist sidebar (30%) ── */}
            <div className="lg:w-80 xl:w-96 shrink-0">
              {/* Mobile toggle */}
              <button
                onClick={() => setPlaylistOpen((v) => !v)}
                className="lg:hidden w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-dark-2 border border-white/10 text-sm text-gray-300 mb-2"
              >
                <span className="flex items-center gap-2">
                  <List className="h-4 w-4 text-primary" />
                  Playlist ({videos.length} videos)
                </span>
                {playlistOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {(playlistOpen) && (
                <div
                  ref={sidebarRef}
                  className="rounded-2xl bg-dark-2 border border-white/10 overflow-y-auto lg:max-h-[calc(100vh-120px)] max-h-96"
                >
                  {/* Sidebar header */}
                  <div className="sticky top-0 bg-dark-2 px-4 py-3 border-b border-white/5 z-10">
                    <p className="text-sm font-semibold text-white">{courseData.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {currentIndex + 1} / {videos.length} · {Math.round(Object.values(doneMap).filter(Boolean).length / Math.max(videos.length, 1) * 100)}% done
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${Object.values(doneMap).filter(Boolean).length / Math.max(videos.length, 1) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Video list */}
                  <div className="p-2 space-y-0.5">
                    {videos.map((video, i) => (
                      <div
                        key={video.videoId}
                        ref={video.videoId === currentVideo?.videoId ? activeItemRef : undefined}
                      >
                        <SidebarItem
                          video={video}
                          index={i}
                          isActive={video.videoId === currentVideo?.videoId}
                          onClick={() => selectVideo(video.videoId)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

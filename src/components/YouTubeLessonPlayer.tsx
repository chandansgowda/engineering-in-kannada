import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { youtubeId } from "../lib/catalog";
import { localDateKey } from "../lib/dashboard";
import { useDashboardStore } from "../store/dashboard";
import type { Video } from "../types";

interface YouTubePlayer {
  destroy: () => void;
}

interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars?: Record<string, number | string>;
      events: {
        onStateChange: (event: { data: number }) => void;
        onError: () => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: {
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    ENDED: number;
  };
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YouTube player API did not initialize."));
    };

    let script = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
    script.onerror = () => reject(new Error("Unable to load the YouTube player."));
  });

  return youtubeApiPromise;
}

export function YouTubeLessonPlayer({
  video,
  onEnded,
}: {
  video: Video;
  onEnded: () => void;
}) {
  const videoId = youtubeId(video.youtubeUrl);
  const playerElement = useRef<HTMLDivElement>(null);
  const lastTick = useRef<number | null>(null);
  const isPlaying = useRef(false);
  const addStudySeconds = useDashboardStore((state) => state.addStudySeconds);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoId || !playerElement.current) return;
    let player: YouTubePlayer | null = null;
    let interval = 0;
    let disposed = false;

    const recordPlayback = (countElapsed = document.visibilityState === "visible") => {
      const now = Date.now();
      const start = lastTick.current;
      lastTick.current = now;
      if (start === null || !countElapsed) return;

      let cursor = start;
      while (cursor < now) {
        const date = new Date(cursor);
        const nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).getTime();
        const segmentEnd = Math.min(now, nextDay);
        const seconds = Math.floor((segmentEnd - cursor) / 1000);
        if (seconds > 0) addStudySeconds(localDateKey(date), seconds);
        cursor = segmentEnd;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordPlayback(true);
      } else if (isPlaying.current) {
        lastTick.current = Date.now();
      }
    };

    loadYouTubeApi()
      .then((api) => {
        if (disposed || !playerElement.current) return;
        player = new api.Player(playerElement.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
          },
          events: {
            onStateChange: ({ data }) => {
              if (!window.YT) return;
              if (data === window.YT.PlayerState.PLAYING) {
                isPlaying.current = true;
                lastTick.current = Date.now();
                window.clearInterval(interval);
                interval = window.setInterval(recordPlayback, 10_000);
              } else if (
                data === window.YT.PlayerState.PAUSED ||
                data === window.YT.PlayerState.BUFFERING
              ) {
                recordPlayback();
                isPlaying.current = false;
                window.clearInterval(interval);
              } else if (data === window.YT.PlayerState.ENDED) {
                recordPlayback();
                isPlaying.current = false;
                window.clearInterval(interval);
                onEnded();
              }
            },
            onError: () => {
              isPlaying.current = false;
              window.clearInterval(interval);
              setError(true);
            },
          },
        });
      })
      .catch(() => {
        youtubeApiPromise = null;
        if (!disposed) setError(true);
      });

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      disposed = true;
      recordPlayback();
      isPlaying.current = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      player?.destroy();
    };
  }, [videoId, addStudySeconds, onEnded]);

  if (!videoId) {
    return (
      <div className="flex aspect-video items-center justify-center bg-dark-600 p-6 text-center text-sm text-neutral-400">
        This lesson does not have a playable YouTube video yet.
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <p className="text-sm text-neutral-300">The embedded video could not be loaded.</p>
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Open on YouTube <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      ) : (
        <div ref={playerElement} className="absolute inset-0 h-full w-full" title={video.title} />
      )}
    </div>
  );
}

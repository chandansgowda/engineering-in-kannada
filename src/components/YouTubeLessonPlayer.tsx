import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { youtubeId } from "../lib/catalog";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!videoId || !playerElement.current) return;
    let player: YouTubePlayer | null = null;
    let disposed = false;

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
              if (window.YT && data === window.YT.PlayerState.ENDED) onEnded();
            },
            onError: () => {
              setError(true);
            },
          },
        });
      })
      .catch(() => {
        youtubeApiPromise = null;
        if (!disposed) setError(true);
      });

    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [videoId, onEnded]);

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

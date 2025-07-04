import React, { useState } from "react";
import { Video } from "../types";
import { PlayCircle, FileText, CheckCircle, Star, Code, Share2 } from "lucide-react";
import { useProgressStore } from "../store/progress";
import confetti from "canvas-confetti";
import { toastWithCustomMessages } from "../utils/toastWithCustomMessages"; // Changed import
import { useBreakpoint } from "../utils/useBreakPoint";
import { NotesViewer } from "./NotesViewer";
import EmbedVideoComponent from "./EmbedVideoComponent";

interface VideoCardProps {
  video: Video;
}

export function VideoCard({ video }: VideoCardProps) {
  const {
    isVideoCompleted,
    markVideoComplete,
    markVideoIncomplete,
    toggleVideoStarred,
    isVideoStarred,
  } = useProgressStore();
  const completed = isVideoCompleted(video.id);
  const starred = isVideoStarred(video.id);
  const checkboxRef = React.useRef<HTMLButtonElement>(null);
  const isDesktop = useBreakpoint();
  const [showNotes, setShowNotes] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const playCelebrationSound = () => {
    const audioContext = new (window.AudioContext ||
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)();

    // Create multiple oscillators for a more celebratory sound
    const frequencies = [800, 1000, 1200];
    const oscillators = frequencies.map((freq) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);

      return { osc, gain };
    });

    // Start all oscillators
    oscillators.forEach(({ osc }) => osc.start());

    // Create a fade out effect
    oscillators.forEach(({ gain }) => {
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );
    });

    // Stop all oscillators after the sound completes
    setTimeout(() => {
      oscillators.forEach(({ osc }) => osc.stop());
    }, 500);
  };

  const handleComplete = () => {
    if (!completed) {
      markVideoComplete(video.id);
      playCelebrationSound();

      // Multiple confetti bursts
      const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["star"],
        colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
      };

      function shoot() {
        confetti({
          ...defaults,
          particleCount: 40,
          scalar: 1.2,
          shapes: ["star"],
        });

        confetti({
          ...defaults,
          particleCount: 10,
          scalar: 0.75,
          shapes: ["circle"],
        });
      }

      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
    } else {
      markVideoIncomplete(video.id);
    }
  };

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleVideoStarred(video.id);
  };

  const handleShare = async () => {
    if (!video.youtubeUrl) {
      dispatchToast(
        "Video not available yet!",
        isDesktop ? "top-right" : "bottom-center"
      );
      return;
    }

    // Extract video ID and create watch URL
    const videoId = video.youtubeUrl
      .replace('https://www.youtube.com/embed/', '')
      .split('?')[0];
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Always copy to clipboard first
    try {
      await navigator.clipboard.writeText(watchUrl);
      dispatchToast(
        "Link copied to clipboard!",
        isDesktop ? "top-right" : "bottom-center"
      );
    } catch (err) {
      dispatchToast(
        "Failed to copy link",
        isDesktop ? "top-right" : "bottom-center"
      );
    }

    // Then try to open share modal
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          url: watchUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          dispatchToast(
            "Share failed",
            isDesktop ? "top-right" : "bottom-center"
          );
        }
      }
    }
  };

  const handleNotesAndVideoClick = (uri: string | undefined) => {
    if (!uri) {
      toastWithCustomMessages.showInfo( // Changed to showInfo
        "🚀 Coming Soon! Stay tuned.",
        isDesktop ? "top-right" : "bottom-center"
      );
      return;
    }

    // Check if it's a GitHub markdown URL
    if (uri.includes("github.com") && uri.includes(".md")) {
      setShowNotes(true);
    } else {
      open(uri);
    }
  };

  return (
    <>
      <div className="rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 p-4 sm:p-6 transition-all duration-300 hover:bg-white/20">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-white sm:text-lg">
                {video.title}
              </h3>
            </div>
            <span className="mt-1 inline-flex items-center rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary sm:px-3">
              {video.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="rounded-full p-2 bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
              aria-label="Share video"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleStar}
              className={`rounded-full p-2 transition-colors ${
                starred
                  ? "bg-primary/20 text-primary"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              aria-label={
                starred ? "Remove from bookmarks" : "Add to bookmarks"
              }
            >
              <Star
                className="h-5 w-5"
                fill={starred ? "currentColor" : "none"}
              />
            </button>
            <button
              ref={checkboxRef}
              onClick={handleComplete}
              className={`rounded-full p-2 transition-colors ${
                completed
                  ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
              aria-label={completed ? "Mark as incomplete" : "Mark as complete"}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-4">
          <button
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-dark transition-colors hover:bg-primary/80"
            onClick={() => {
              if (!video.youtubeUrl) {
                toastWithCustomMessages.showInfo( // Changed to showInfo
                  "Video coming soon!",
                  isDesktop ? "top-right" : "bottom-center"
                );
                return;
              }
              setShowVideo(true);
            }}
          >
            <PlayCircle className="h-4 w-4" />
            Watch Video
          </button>
          <button
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            onClick={() => handleNotesAndVideoClick(video.notesUrl)}
          >
            <FileText className="h-4 w-4" />
            View Notes
          </button>
          {video.codingQuestionUrl && (
            <a
              href={video.codingQuestionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <Code className="h-4 w-4" />
              Practice
            </a>
          )}
        </div>
      </div>
      {showVideo && video.youtubeUrl && (
        <EmbedVideoComponent
          url={video.youtubeUrl}
          onClose={() => setShowVideo(false)}
        />
      )}

      {showNotes && video.notesUrl && (
        <NotesViewer url={video.notesUrl} onClose={() => setShowNotes(false)} />
      )}
    </>
  );
}

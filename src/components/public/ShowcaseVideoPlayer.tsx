"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Maximize2 } from "lucide-react";

interface ShowcaseVideoPlayerProps {
  src: string;
  poster?: string;
  label?: string;
}

export function ShowcaseVideoPlayer({
  src,
  poster,
  label = "GARVIX Software Showcase",
}: ShowcaseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userPaused, setUserPaused] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!el) return;
        if (entry.isIntersecting) {
          if (!userPaused) {
            el.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        } else {
          el.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [userPaused]);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      setUserPaused(false);
      el.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      setUserPaused(true);
      el.pause();
      setIsPlaying(false);
    }
  };

  const openFullscreen = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="relative group bg-[#f5f5f7] select-none">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onClick={togglePlay}
        className="w-full h-auto block cursor-pointer"
      />

      {/* Minimal Apple Frosted Controls Overlay */}
      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause showcase video" : "Play showcase video"}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f]/80 hover:bg-[#1d1d1f] text-white backdrop-blur-md px-3.5 py-1.5 text-xs font-medium shadow-md transition"
        >
          {isPlaying ? (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={openFullscreen}
          aria-label="Watch video fullscreen"
          title="Fullscreen"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1d1d1f]/80 hover:bg-[#1d1d1f] text-white backdrop-blur-md shadow-md transition"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

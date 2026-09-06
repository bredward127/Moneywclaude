"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { VideoConfig } from "@/lib/videos";
import { IntroCover } from "./IntroCover";
import { PlayerControls } from "./PlayerControls";
import { WatermarkBadge } from "./WatermarkBadge";

type PlayerState = "cover" | "starting" | "playing" | "paused" | "ended";

function waitForEvent(
  target: HTMLMediaElement,
  event: "loadedmetadata" | "seeked"
): Promise<void> {
  return new Promise((resolve) => {
    target.addEventListener(event, () => resolve(), { once: true });
  });
}

export interface VideoPlayerProps extends VideoConfig {
  className?: string;
}

export function VideoPlayer({
  src,
  startOffset,
  endOffset,
  titleCardText,
  showIntroCard,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stateRef = useRef<PlayerState>("cover");
  const [state, setState] = useState<PlayerState>("cover");
  const [isMuted, setIsMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const effectiveDuration = Math.max(0, endOffset - startOffset);

  const updateState = useCallback((next: PlayerState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const handlePlay = useCallback(async () => {
    if (stateRef.current !== "cover") return;
    const video = videoRef.current;
    if (!video) return;

    updateState("starting");

    video.src = src;
    video.load();
    await waitForEvent(video, "loadedmetadata");

    video.currentTime = startOffset;
    await waitForEvent(video, "seeked");

    updateState("playing");

    try {
      await video.play();
    } catch {
      video.muted = true;
      setIsMuted(true);
      await video.play().catch(() => {});
    }
  }, [src, startOffset, updateState]);

  const handleReplay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = startOffset;
    await waitForEvent(video, "seeked");
    updateState("playing");
    video.play().catch(() => {});
  }, [startOffset, updateState]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.currentTime >= endOffset) {
      video.pause();
      video.currentTime = startOffset;
      updateState("ended");
      setElapsed(0);
      return;
    }

    setElapsed(Math.max(0, video.currentTime - startOffset));
  }, [endOffset, startOffset, updateState]);

  const handleNativePause = useCallback(() => {
    if (stateRef.current === "playing") updateState("paused");
  }, [updateState]);

  const handleNativePlay = useCallback(() => {
    if (stateRef.current === "paused") updateState("playing");
  }, [updateState]);

  const handleError = useCallback(() => {
    if (stateRef.current === "starting") updateState("cover");
  }, [updateState]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const seekTo = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      const clamped = Math.min(Math.max(value, 0), effectiveDuration);
      video.currentTime = startOffset + clamped;
      setElapsed(clamped);
    },
    [effectiveDuration, startOffset]
  );

  const showCover = state === "cover" || state === "starting";
  const showControls = state === "playing" || state === "paused";
  const showReplay = state === "ended";

  return (
    <div
      className={`relative aspect-[9/16] w-full overflow-hidden rounded-2xl bg-slate-900 @container ${className ?? ""}`}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        playsInline
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onPause={handleNativePause}
        onPlay={handleNativePlay}
        onError={handleError}
      >
        <track kind="captions" />
      </video>

      <IntroCover
        visible={showCover}
        isLoading={state === "starting"}
        variant={showIntroCard ? "card" : "minimal"}
        titleCardText={titleCardText}
        durationSeconds={effectiveDuration}
        onPlay={handlePlay}
      />

      {showReplay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/70">
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Replay video"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white @[280px]:h-14 @[280px]:w-14"
          >
            <RotateCcw className="h-5 w-5 @[280px]:h-6 @[280px]:w-6" aria-hidden="true" />
          </button>
          <span className="text-xs font-semibold text-white @[280px]:text-sm">Replay Video</span>
        </div>
      )}

      {showControls && (
        <PlayerControls
          isPaused={state === "paused"}
          isMuted={isMuted}
          elapsed={elapsed}
          duration={effectiveDuration}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onSeek={seekTo}
        />
      )}

      {!showCover && <WatermarkBadge />}
    </div>
  );
}

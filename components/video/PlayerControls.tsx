"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerControls({
  isPaused,
  isMuted,
  elapsed,
  duration,
  onTogglePlay,
  onToggleMute,
  onSeek,
}: {
  isPaused: boolean;
  isMuted: boolean;
  elapsed: number;
  duration: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onSeek: (value: number) => void;
}) {
  const clampedElapsed = Math.min(elapsed, duration);
  const progressPercent = duration > 0 ? (clampedElapsed / duration) * 100 : 0;

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-2.5 pt-8 pb-2.5 @[220px]:px-3.5 @[220px]:pb-3">
      <div className="mb-1.5 flex items-center gap-2 @[220px]:mb-2">
        <span className="w-7 shrink-0 text-[10px] text-white/90 tabular-nums @[220px]:text-[11px]">
          {formatTime(clampedElapsed)}
        </span>
        <div className="relative h-1.5 flex-1 rounded-full bg-white/25">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-blue-500"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={clampedElapsed}
            onChange={(e) => onSeek(Number(e.target.value))}
            aria-label="Seek video"
            className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
          />
        </div>
        <span className="w-7 shrink-0 text-right text-[10px] text-white/90 tabular-nums @[220px]:text-[11px]">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-1 @[220px]:gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={isPaused ? "Play" : "Pause"}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 @[220px]:h-8 @[220px]:w-8"
        >
          {isPaused ? (
            <Play className="h-3.5 w-3.5 fill-current @[220px]:h-4 @[220px]:w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-3.5 w-3.5 fill-current @[220px]:h-4 @[220px]:w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute" : "Mute"}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 @[220px]:h-8 @[220px]:w-8"
        >
          {isMuted ? (
            <VolumeX className="h-3.5 w-3.5 @[220px]:h-4 @[220px]:w-4" aria-hidden="true" />
          ) : (
            <Volume2 className="h-3.5 w-3.5 @[220px]:h-4 @[220px]:w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}

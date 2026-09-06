"use client";

import { Loader2, Play } from "lucide-react";
import { StarMark } from "@/components/ui/Logo";

function formatMinutesLabel(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} Min`;
}

export function IntroCover({
  visible,
  isLoading,
  variant,
  titleCardText,
  durationSeconds,
  onPlay,
}: {
  visible: boolean;
  isLoading: boolean;
  variant: "card" | "minimal";
  titleCardText: string;
  durationSeconds: number;
  onPlay: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 overflow-hidden p-4 text-center transition-opacity duration-300 motion-reduce:transition-none @[280px]:gap-5 ${
        visible ? "cursor-pointer opacity-100" : "pointer-events-none opacity-0"
      } ${
        variant === "card"
          ? "bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950"
          : "bg-slate-900"
      }`}
    >
      {variant === "card" && (
        <span
          aria-hidden="true"
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20 @[280px]:h-14 @[280px]:w-14"
        >
          <span className="absolute inset-0 rounded-full bg-blue-500/40 blur-md" />
          <StarMark className="relative h-6 w-6 @[280px]:h-8 @[280px]:w-8" />
        </span>
      )}

      {variant === "card" && (
        <h3
          aria-hidden="true"
          className="max-w-[90%] text-lg font-extrabold tracking-tight text-white @[280px]:text-2xl @[360px]:text-3xl"
        >
          {titleCardText}
        </h3>
      )}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
        disabled={isLoading}
        tabIndex={visible ? 0 : -1}
        aria-label={`Play video: ${titleCardText}`}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-950/40 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:hover:scale-100 @[280px]:h-16 @[280px]:w-16"
      >
        {!isLoading && (
          <span className="absolute inset-0 rounded-full bg-blue-500 opacity-40 motion-safe:animate-ping motion-reduce:hidden" />
        )}
        {isLoading ? (
          <Loader2 className="relative h-5 w-5 animate-spin @[280px]:h-7 @[280px]:w-7" aria-hidden="true" />
        ) : (
          <Play className="relative ml-0.5 h-5 w-5 fill-current @[280px]:h-7 @[280px]:w-7" aria-hidden="true" />
        )}
      </button>

      <p
        aria-hidden="true"
        className="text-xs font-semibold text-white/90 @[280px]:text-sm"
      >
        {isLoading
          ? "Loading…"
          : variant === "card"
            ? `Tap to Play (${formatMinutesLabel(durationSeconds)})`
            : `${titleCardText} · ${formatMinutesLabel(durationSeconds)}`}
      </p>
    </div>
  );
}

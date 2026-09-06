"use client";

import { Volume2 } from "lucide-react";

/**
 * One-time upfront choice, shown before any voice prompt would otherwise
 * play. Voice prompts default to silent (see useSpeechSynthesis) -- this is
 * the explicit "opt in" path; a small mute/unmute icon stays available on
 * every step afterward for changing that choice later.
 */
export function AudioOptInPrompt({ onChoose }: { onChoose: (wantsAudio: boolean) => void }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="flex items-center gap-3">
        <Volume2 className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
        <p className="text-sm text-slate-700">Want us to read each question out loud as you go?</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => onChoose(true)}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Yes, read to me
        </button>
        <button
          type="button"
          onClick={() => onChoose(false)}
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 hover:border-slate-400"
        >
          No thanks
        </button>
      </div>
    </div>
  );
}

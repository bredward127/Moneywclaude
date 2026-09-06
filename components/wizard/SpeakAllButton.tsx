"use client";

import { useState } from "react";
import { Mic, Square } from "lucide-react";
import { useVoiceDictation } from "@/lib/speech";

/**
 * Tap-to-talk button for answering several fields from one continuous
 * description, instead of one field per step. Fires onTranscript once per
 * pause in speech (see useVoiceDictation), so callers should merge each
 * chunk's matches into existing answers rather than replacing everything.
 */
export function SpeakAllButton({
  label = "Speak your answer",
  onTranscript,
}: {
  label?: string;
  onTranscript: (transcript: string) => void;
}) {
  const [lastHeard, setLastHeard] = useState("");
  const { isSupported, isListening, toggle } = useVoiceDictation({
    onFinalResult: (transcript) => {
      setLastHeard(transcript);
      onTranscript(transcript);
    },
  });

  if (!isSupported) return null;

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={isListening}
        aria-label={isListening ? "Stop speaking" : label}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          isListening
            ? "border-rose-500 bg-rose-50 text-rose-600"
            : "border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100"
        }`}
      >
        {isListening ? (
          <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        ) : (
          <Mic className="h-4 w-4" aria-hidden="true" />
        )}
        {isListening ? "Listening — tap to stop" : label}
      </button>
      {isListening && (
        <p className="mt-2 text-xs text-slate-500">
          {lastHeard ? `Heard: "${lastHeard}"` : "Speak naturally — say as much as you'd like."}
        </p>
      )}
    </div>
  );
}

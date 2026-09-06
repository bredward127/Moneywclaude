"use client";

import { Mic, Square } from "lucide-react";
import { useVoiceDictation } from "@/lib/speech";
import { textareaClass } from "./styles";

export function VoiceTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const { isSupported, isListening, toggle } = useVoiceDictation({
    onFinalResult: (transcript) => {
      onChange(value ? `${value} ${transcript}` : transcript);
    },
  });

  return (
    <div>
      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${textareaClass} ${isSupported ? "pr-12" : ""}`}
        />
        {isSupported && (
          <button
            type="button"
            onClick={toggle}
            aria-pressed={isListening}
            aria-label={isListening ? "Stop voice dictation" : "Start voice dictation"}
            className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
              isListening
                ? "bg-red-500 text-white"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            {isListening ? (
              <Square className="h-3 w-3 fill-current" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {isSupported && (
        <p className="mt-1.5 text-xs text-slate-500">
          {isListening ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-blue-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" />
              Listening — speak naturally
            </span>
          ) : (
            "Tap the mic to speak instead of typing"
          )}
        </p>
      )}
    </div>
  );
}

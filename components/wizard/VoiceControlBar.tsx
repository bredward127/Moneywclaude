"use client";

import { useState } from "react";
import { Mic, Check, RotateCcw, AlertCircle } from "lucide-react";

export function VoiceControlBar({
  isSupported,
  isListening,
  transcript,
  permissionDenied,
  onStart,
  onStop,
  onApply,
  previewMatch,
  placeholder,
}: {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  permissionDenied: boolean;
  onStart: () => void;
  onStop: () => void;
  onApply: (text: string) => void;
  previewMatch?: (text: string) => string | null;
  placeholder?: string;
}) {
  const [draftText, setDraftText] = useState("");
  const [wasListening, setWasListening] = useState(isListening);

  if (isListening !== wasListening) {
    setWasListening(isListening);
    if (wasListening && !isListening) {
      setDraftText(transcript);
    }
  }

  if (!isSupported) return null;

  const phase: "idle" | "listening" | "review" = isListening
    ? "listening"
    : draftText
      ? "review"
      : "idle";

  const preview = phase === "review" ? (previewMatch?.(draftText) ?? null) : null;

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            if (!permissionDenied) onStart();
          }}
          onPointerUp={onStop}
          onPointerLeave={() => {
            if (isListening) onStop();
          }}
          onPointerCancel={onStop}
          disabled={permissionDenied}
          aria-pressed={isListening}
          aria-label={
            isListening ? "Recording — release to stop" : "Press and hold to answer with your voice"
          }
          className={`relative flex h-14 w-14 shrink-0 touch-none items-center justify-center rounded-full text-white shadow-lg transition-colors select-none disabled:cursor-not-allowed disabled:opacity-50 ${
            isListening ? "bg-rose-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isListening && (
            <span
              className="absolute inset-0 rounded-full bg-rose-400 opacity-60 motion-safe:animate-ping motion-reduce:hidden"
              aria-hidden="true"
            />
          )}
          <Mic className="relative h-6 w-6" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          {permissionDenied ? (
            <p className="flex items-center gap-1.5 text-sm text-slate-600">
              <AlertCircle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
              Microphone access is off — just type your answer below.
            </p>
          ) : phase === "idle" ? (
            <p className="text-sm font-medium text-slate-700">
              Press and hold the mic to answer with your voice.
              {placeholder && <span className="block text-slate-500">{placeholder}</span>}
            </p>
          ) : phase === "listening" ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-600" aria-hidden="true" />
              Listening — speak now
            </p>
          ) : (
            <p className="text-sm font-medium text-slate-700">Got it — review before applying:</p>
          )}
        </div>
      </div>

      {phase === "listening" && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
          <p className="min-h-6 text-base text-slate-900">
            {transcript || <span className="text-slate-400">…</span>}
          </p>
        </div>
      )}

      {phase === "review" && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-white p-4">
          <label htmlFor="voice-draft" className="mb-1.5 block text-xs font-medium text-slate-500">
            Heard (edit if needed)
          </label>
          <textarea
            id="voice-draft"
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {preview && (
            <p className="mt-2 text-sm text-blue-700">
              Will select: <span className="font-semibold">{preview}</span>
            </p>
          )}
          {previewMatch && !preview && draftText.trim() && (
            <p className="mt-2 text-sm text-slate-500">
              Couldn&apos;t match that to an option — edit the text above or choose manually below.
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onApply(draftText);
                setDraftText("");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Use this answer
            </button>
            <button
              type="button"
              onClick={() => setDraftText("")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

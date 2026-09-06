"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { getSpeechRecognitionConstructor, type SpeechRecognitionLike } from "./speech-types";

function subscribeToNothing() {
  return () => {};
}

function getRecognitionSupportSnapshot() {
  return getSpeechRecognitionConstructor() !== null;
}

function getSynthesisSupportSnapshot() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerUnsupportedSnapshot() {
  return false;
}

export function useSpeechRecognition() {
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    getRecognitionSupportSnapshot,
    getServerUnsupportedSnapshot
  );
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTranscriptRef = useRef("");

  const start = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    finalTranscriptRef.current = "";
    setTranscript("");

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscriptRef.current = `${finalTranscriptRef.current} ${result[0].transcript}`.trim();
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(`${finalTranscriptRef.current} ${interim}`.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setPermissionDenied(true);
      }
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return { isSupported, isListening, transcript, permissionDenied, start, stop, reset };
}

export function useSpeechSynthesis() {
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    getSynthesisSupportSnapshot,
    getServerUnsupportedSnapshot
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Opt-out by default: voice prompts stay silent until the person explicitly
  // asks for guided audio (see AudioOptInPrompt). speak() below already
  // no-ops while muted, so this default alone is what makes read-aloud
  // opt-in instead of automatic.
  const [isMuted, setIsMuted] = useState(true);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, options?: { force?: boolean }) => {
      if (
        (isMuted && !options?.force) ||
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      )
        return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  const toggleMuted = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) cancel();
      return next;
    });
  }, [cancel]);

  const setMuted = useCallback(
    (muted: boolean) => {
      setIsMuted(muted);
      if (muted) cancel();
    },
    [cancel]
  );

  return { isSupported, isSpeaking, isMuted, toggleMuted, setMuted, speak, cancel };
}

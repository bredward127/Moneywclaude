"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getSpeechRecognitionConstructor, type SpeechRecognitionLike } from "./speech-types";

function subscribeToNothing() {
  return () => {};
}

function getSupportSnapshot() {
  return getSpeechRecognitionConstructor() !== null;
}

function getServerSupportSnapshot() {
  return false;
}

export function useVoiceDictation({
  onFinalResult,
}: {
  onFinalResult: (transcript: string) => void;
}) {
  const isSupported = useSyncExternalStore(
    subscribeToNothing,
    getSupportSnapshot,
    getServerSupportSnapshot
  );
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
  });

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          transcript += result[0].transcript;
        }
      }
      if (transcript.trim()) {
        onFinalResultRef.current(transcript.trim());
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  }, [isListening, start, stop]);

  return { isSupported, isListening, toggle };
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Web Speech API helpers (voice search + TTS).
 * Why feature-detect? Not all browsers support it (Firefox, iOS limitations).
 * We gracefully hide the mic/speaker buttons if unsupported.
 */

export function useSpeechRecognition(onResult: (transcript: string) => void) {
  const [supported] = useState(() => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window));
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  const start = useCallback(() => {
    const SR = (window as unknown as Record<string, unknown>).SpeechRecognition || (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SR) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec: any = new (SR as any)();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: { results: { transcript: string }[][] }) => onResult(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }, [onResult]);

  const stop = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (recognitionRef.current as any)?.stop?.();
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}

export function useSpeechSynthesis() {
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, [supported]);

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return { supported, speaking, speak, cancel };
}

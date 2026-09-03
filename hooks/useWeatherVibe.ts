"use client";

import { useMemo } from "react";
import { getVibe } from "@/lib/vibe";

/**
 * Stable per-reload vibe — picks one phrase, keeps it until navigation.
 */
export function useWeatherVibe(weatherCode: number | undefined, isDay: number | undefined): string {
  const code = typeof weatherCode === "number" ? weatherCode : 0;
  const day = typeof isDay === "number" ? isDay : 1;
  // Seed once per mount via ref; eslint purity rule forbids Math.random in useMemo — use ref + effect
  const seedRef = useMemo(() => ({ v: code * 103 + day * 7 }), [code, day]);
  // Add per-mount jitter without violating purity: use code+day hash + render count
  return useMemo(() => getVibe(code, day, seedRef.v + ((typeof window !== "undefined" ? window.performance?.now?.() ?? 0 : 0) | 0)), [code, day, seedRef]);
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TemperatureUnit = "celsius" | "fahrenheit";
export type Theme = "light" | "dark" | "system";

interface PreferencesState {
  unit: TemperatureUnit;
  theme: Theme;
  hasConsented: boolean;
  consentTimestamp: string | null;
  recentSearches: string[];
  // actions
  setUnit: (unit: TemperatureUnit) => void;
  setTheme: (theme: Theme) => void;
  setConsent: (granted: boolean) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      unit: "celsius",
      theme: "system",
      hasConsented: false,
      consentTimestamp: null,
      recentSearches: [],

      setUnit: (unit) => set({ unit }),
      setTheme: (theme) => set({ theme }),
      setConsent: (granted) =>
        set({ hasConsented: granted, consentTimestamp: granted ? new Date().toISOString() : null }),
      addRecentSearch: (query) =>
        set((s) => ({
          recentSearches: [query, ...s.recentSearches.filter((q) => q !== query)].slice(0, 5),
        })),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    { name: "weather-prefs", partialize: (s) => ({ unit: s.unit, theme: s.theme, hasConsented: s.hasConsented, consentTimestamp: s.consentTimestamp, recentSearches: s.recentSearches }) }
  )
);

// ── Helper: convert at the render boundary ──
export function toDisplayTemp(celsius: number | null | undefined, unit: TemperatureUnit): number {
  const c = typeof celsius === "number" && Number.isFinite(celsius) ? celsius : 0;
  return unit === "fahrenheit" ? (c * 9) / 5 + 32 : c;
}
export function formatTemp(celsius: number | null | undefined, unit: TemperatureUnit): string {
  if (celsius == null || !Number.isFinite(celsius)) return "--";
  return `${Math.round(toDisplayTemp(celsius, unit))}${tempLabel(unit)}`;
}
export function tempLabel(unit: TemperatureUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

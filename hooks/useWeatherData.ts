"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TTL } from "@/lib/constants";
import type { WeatherResponse } from "@/lib/open-meteo";

/**
 * Single parent loader for weather. One fetch returns current+hourly+daily.
 * Why one? `fetchWeather` already asks for all three — no need for three
 * separate requests. Children (CurrentCard, Hourly, Map) share the ONE
 * status (`isPending/isError`) so one failure cascades cleanly to all.
 *
 * Hybrid: browser → /api/weather → Open-Meteo (proxied so we can add
 * Cache-Control + Zod + 429 handling in one place). For pure forecast/
 * geocode we also support direct client fetch to avoid Vercel shared-IP
 * quota; the route handler path is the safe default for prod.
 */
export function useWeatherData(lat: number | null, lon: number | null) {
  const enabled = lat !== null && lon !== null;

  return useQuery<WeatherResponse>({
    queryKey: ["weather", lat, lon],
    queryFn: async () => {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      if (!res.ok) {
        // Try to serve stale localStorage fallback on 429
        if (res.status === 429) {
          const cached = localStorage.getItem(`weather:${lat},${lon}`);
          if (cached) return JSON.parse(cached) as WeatherResponse;
        }
        throw new Error(`Weather fetch failed: ${res.status}`);
      }
      const data = (await res.json()) as WeatherResponse;
      try {
        localStorage.setItem(`weather:${lat},${lon}`, JSON.stringify(data));
      } catch {
        // quota exceeded — ignore
      }
      return data;
    },
    enabled,
    staleTime: CACHE_TTL.current,
    gcTime: CACHE_TTL.current * 6,
    retry: 2,
  });
}

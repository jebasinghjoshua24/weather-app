"use client";

import { useQuery } from "@tanstack/react-query";
import { TWIN_CITIES, scoreTwin, filterFarCities, type TwinCity } from "@/lib/weatherTwin";
import type { WeatherResponse } from "@/lib/open-meteo";

interface TwinResult {
  city: TwinCity;
  score: number;
  weather: { temp: number; humidity?: number | null; wind?: number | null; code?: number | null };
}

export function useWeatherTwin(lat: number | null, lon: number | null, weather: WeatherResponse | null | undefined) {
  return useQuery({
    queryKey: ["twin", lat, lon, weather?.current.temperature],
    queryFn: async (): Promise<TwinResult[]> => {
      if (lat == null || lon == null || !weather) return [];
      const user = {
        temp: weather.current.temperature,
        humidity: (weather.current as unknown as { humidity?: number }).humidity ?? 50,
        wind: weather.current.windSpeed,
        code: weather.current.weatherCode,
      };
      const candidates = filterFarCities(lat, lon, TWIN_CITIES).slice(0, 18);
      const latStr = candidates.map((c) => c.lat).join(",");
      const lonStr = candidates.map((c) => c.lon).join(",");
      const params = new URLSearchParams({
        latitude: latStr,
        longitude: lonStr,
        current: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code",
        timezone: "auto",
      });
      // Open-Meteo returns array when multiple coordinates; but our proxy handles single — fall back to parallel fetches
      // For now, fetch via our /api/weather in parallel (18 calls would be heavy) — so use direct Open-Meteo batch
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
      if (!res.ok) throw new Error("Twin fetch failed");
      const data = await res.json();
      // Batch returns array, single returns object — normalize
      const arr: Array<Record<string, unknown>> = Array.isArray(data) ? data : [data];
      const results: TwinResult[] = [];
      for (let i = 0; i < candidates.length; i++) {
        const city = candidates[i];
        const raw = arr[i] as Record<string, unknown> | undefined;
        const cur = raw?.current as Record<string, unknown> | undefined;
        if (!cur) continue;
        const cand = {
          temp: (cur.temperature_2m ?? cur.temperature) as number,
          humidity: (cur.relative_humidity_2m as number) ?? null,
          wind: (cur.wind_speed_10m as number) ?? null,
          code: (cur.weather_code as number) ?? null,
        };
        const score = scoreTwin(user, cand);
        results.push({ city, score, weather: cand });
      }
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 3);
    },
    enabled: lat != null && lon != null && !!weather,
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

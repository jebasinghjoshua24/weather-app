"use client";

import { useQuery } from "@tanstack/react-query";

/**
 * Reverse-geocode query for map clicks.
 * Why TanStack: dedupes rapid clicks, caches 24h (city name stable).
 */
export function useReverseGeocode(lat: number | null, lon: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ["reverse", lat, lon],
    queryFn: async (): Promise<{ name: string | null; country: string | null }> => {
      const res = await fetch(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Reverse geocode failed");
      return res.json() as Promise<{ name: string | null; country: string | null }>;
    },
    enabled: enabled && lat !== null && lon !== null,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
    retry: 1,
  });
}

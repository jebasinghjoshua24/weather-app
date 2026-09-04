"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TTL } from "@/lib/constants";

export interface AirQualityData {
  current?: {
    us_aqi?: number;
    alder_pollen?: number;
    birch_pollen?: number;
    grass_pollen?: number;
    mugwort_pollen?: number;
    olive_pollen?: number;
    ragweed_pollen?: number;
  };
}

export function useAirQuality(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ["air-quality", lat, lon],
    queryFn: async (): Promise<AirQualityData> => {
      const res = await fetch(`/api/air-quality?lat=${lat}&lon=${lon}`);
      if (!res.ok) throw new Error("Air quality unavailable");
      return res.json() as Promise<AirQualityData>;
    },
    enabled: lat != null && lon != null,
    staleTime: CACHE_TTL.airQuality,
    gcTime: CACHE_TTL.airQuality * 2,
    retry: 1,
  });
}

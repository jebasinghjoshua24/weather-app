"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TTL } from "@/lib/constants";
import { haversineKm, eventLatLon, isSevere, type EonetEvent, type EonetResponse } from "@/lib/eonet";

const NEAR_KM = 500;

/**
 * Location-filtered EONET query.
 * Why client filter? EONET has no lat/lon query — fetch global 20 then keep ≤500km.
 */
export function useEonet(location: { lat: number; lon: number } | null, category?: string) {
  const query = useQuery<EonetResponse>({
    queryKey: ["eonet", category ?? "all"],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "open", limit: "20" });
      if (category) params.set("category", category);
      const res = await fetch(`/api/eonet?${params}`);
      if (!res.ok) throw new Error("EONET unavailable");
      return res.json() as Promise<EonetResponse>;
    },
    staleTime: CACHE_TTL.eonet,
    gcTime: CACHE_TTL.eonet * 2,
    retry: 1,
  });

  const filtered =
    query.data && location
      ? {
          ...query.data,
          events: query.data.events.filter((ev: EonetEvent) => {
            const pos = eventLatLon(ev);
            if (!pos) return false;
            return haversineKm(location.lat, location.lon, pos.lat, pos.lon) <= NEAR_KM;
          }),
        }
      : query.data;

  const bannerEvent = filtered?.events.find((ev: EonetEvent) => isSevere(ev)) ?? null;

  return { ...query, data: filtered, bannerEvent };
}

"use client";

import { useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { CACHE_TTL, DEBOUNCE_MS } from "@/lib/constants";
import type { GeocodeResult } from "@/lib/open-meteo";

/**
 * Autocomplete: debounces typing on the client, then fetches via /api/geocode.
 * Why client debounce? The server can't debounce — by the time the request
 * arrives the network call already happened. So we wait 300ms after the user
 * stops typing, then fire ONE request (13 keystrokes → 1 fetch).
 */
export function useSearchAutocomplete(rawQuery: string) {
  const query = rawQuery.trim();
  const debounced = useDebouncedValue(query, DEBOUNCE_MS);

  return useQuery({
    queryKey: ["geocode", debounced],
    queryFn: async (): Promise<GeocodeResult[]> => {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) throw new Error("Geocode failed");
      const data = (await res.json()) as { results: GeocodeResult[] };
      return data.results ?? [];
    },
    enabled: debounced.length >= 2,
    staleTime: CACHE_TTL.geocode,
    gcTime: CACHE_TTL.geocode * 2,
    retry: 1,
  });
}

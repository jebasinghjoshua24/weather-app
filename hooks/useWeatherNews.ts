"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TTL } from "@/lib/constants";

const COUNTRY_TO_REGION: Record<string, string> = {
  India: "IN",
  "United States": "US",
  "United Kingdom": "GB",
  Japan: "JP",
  Australia: "AU",
};

function toRegion(country?: string | null): string {
  if (!country) return "global";
  return COUNTRY_TO_REGION[country] ?? "global";
}

export function useWeatherNews(country?: string | null) {
  const region = toRegion(country);
  return useQuery({
    queryKey: ["rss", region],
    queryFn: async (): Promise<{ items: { title: string; link: string; pubDate: string }[] }> => {
      const res = await fetch(`/api/rss?region=${region}`);
      if (!res.ok) throw new Error("News unavailable");
      return res.json() as Promise<{ items: { title: string; link: string; pubDate: string }[] }>;
    },
    staleTime: CACHE_TTL.rss,
    gcTime: CACHE_TTL.rss * 2,
    retry: 1,
  });
}

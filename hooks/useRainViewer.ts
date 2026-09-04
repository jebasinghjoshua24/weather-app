"use client";

import { useQuery } from "@tanstack/react-query";
import { CACHE_TTL } from "@/lib/constants";
import { fetchRainViewer, type RainViewerData } from "@/lib/rainviewer";

export function useRainViewer() {
  return useQuery<RainViewerData>({
    queryKey: ["rainviewer"],
    queryFn: fetchRainViewer,
    staleTime: CACHE_TTL.radar,
    gcTime: CACHE_TTL.radar * 2,
    retry: 1,
  });
}

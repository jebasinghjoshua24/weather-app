"use client";

import { suggestOutfit } from "@/lib/whatToWear";
import { Badge } from "@/components/ui/badge";

export function WhatToWear({
  temperature,
  windSpeed,
  precipitation,
  weatherCode,
}: {
  temperature?: number | null;
  windSpeed?: number | null;
  precipitation?: number | null;
  weatherCode?: number | null;
}) {
  const { layers, tip } = suggestOutfit({ temperature, windSpeed, precipitation, weatherCode });
  if (layers.length === 0) return null;
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md" aria-live="polite">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">What to Wear</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {layers.map((l) => (
          <Badge key={l} className="bg-white/10 text-white border-white/10">{l}</Badge>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-300">{tip}</p>
    </div>
  );
}

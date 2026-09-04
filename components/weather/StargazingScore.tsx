"use client";

import { useMemo } from "react";
import { stargazingScore, stargazingLabel } from "@/lib/stargazing";

export function StargazingScore({
  cloudCover,
  isDay,
}: {
  cloudCover?: number | null;
  isDay?: number | null;
}) {
  const score = useMemo(() => stargazingScore({ cloudCover, isDay, date: new Date() }), [cloudCover, isDay]);
  const label = stargazingLabel(score);
  const pct = Math.max(0, Math.min(100, score));
  const dash = `${pct} ${100 - pct}`;

  return (
    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md" aria-label={`Stargazing score ${pct} percent, ${label}`}>
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="hsl(221 83% 53%)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={dash}
            strokeDashoffset="25"
            className="transition-all duration-700"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-[var(--font-slab)] text-xl font-black text-white">{pct}%</span>
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-white">{label} night for stars</p>
        <p className="text-xs text-slate-300">{isDay === 1 ? "Wait for nightfall" : cloudCover != null ? `Cloud ${Math.round(cloudCover)}%` : "Cloud data unavailable"}</p>
      </div>
    </div>
  );
}

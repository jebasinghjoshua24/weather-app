"use client";

import { useEffect, useMemo, useState } from "react";
import { horizonPalette, solarElevation } from "@/lib/horizon";

export function HorizonSimulator({
  lat,
  lon,
  timezone,
  cloudCover,
  isDay,
}: {
  lat: number;
  lon: number;
  timezone?: string;
  cloudCover?: number;
  isDay?: number;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const palette = useMemo(() => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const { elevation } = solarElevation(lat, lon, now, timezone);
    const derivedIsDay = elevation > -6 ? 1 : 0;
    const effectiveIsDay = isDay ?? derivedIsDay;
    return { ...horizonPalette(elevation, cloudCover, effectiveIsDay), elevation, derivedIsDay, now };
  }, [lat, lon, timezone, cloudCover, isDay, now]);

  if (!palette) return null;

  const { top, mid, horizon, glow, elevation, derivedIsDay } = palette as ReturnType<typeof horizonPalette> & {
    elevation: number;
    derivedIsDay: number;
    now: Date;
  };
  const quote =
    elevation > 60
      ? "High noon — shadows small"
      : elevation > 12
        ? "Bright day — sky wide open"
        : elevation > 6
          ? "Golden hour — light turns amber"
          : elevation > -4
            ? "Blue hour — horizon glows"
            : elevation > -12
              ? "Twilight — day slips away"
              : "Deep night — horizon rests";

  return (
    <div className="relative h-[180px] w-full overflow-hidden rounded-3xl border border-white/15 shadow-xl" aria-label={`Horizon at ${elevation.toFixed(0)} degrees elevation`}>
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${top} 0%, ${mid} 55%, ${horizon} 100%)`,
        }}
      />
      {elevation > -6 && (
        <div
          className="absolute left-1/2 top-[58%] h-[140px] w-[520px] -translate-x-1/2 rounded-full blur-[18px]"
          style={{ background: `radial-gradient(60% 50% at 50% 50%, ${glow}, transparent 72%)` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/20" />
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2">
        <div className="rounded-full bg-black/30 px-3 py-1 text-xs font-mono text-white backdrop-blur">
          {elevation.toFixed(1)}° · {derivedIsDay === 0 ? "Night" : "Day"}
          {isDay != null && derivedIsDay !== isDay && <span className="opacity-60"> (API: {isDay === 0 ? "Night" : "Day"})</span>}
        </div>
        <div className="max-w-[60%] rounded-full bg-white/80 px-3 py-1 text-xs italic text-slate-800 backdrop-blur">
          “{quote}”
        </div>
      </div>
    </div>
  );
}

"use client";

import { useWeatherTwin } from "@/hooks/useWeatherTwin";
import type { WeatherResponse } from "@/lib/open-meteo";
import { wmoToDescription } from "@/lib/open-meteo";

export function WeatherTwin({
  lat,
  lon,
  weather,
}: {
  lat: number | null;
  lon: number | null;
  weather?: WeatherResponse | null;
}) {
  const { data, isPending, isError } = useWeatherTwin(lat, lon, weather ?? null);

  if (isPending) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md text-sm text-slate-400">Finding twins…</div>;
  }
  if (isError) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md text-sm text-slate-400">Twins unavailable</div>;
  }
  const twins = data ?? [];
  if (twins.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">Weather Twin — Feels like</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {twins.map((t) => (
          <div key={`${t.city.name}-${t.city.lat}`} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="font-semibold text-white">{t.city.name}</p>
            <p className="text-xs text-slate-300">{t.city.country} · {t.score}% match</p>
            <p className="mt-2 text-sm text-slate-200">{Math.round(t.weather.temp)}° · {wmoToDescription(t.weather.code ?? 0)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

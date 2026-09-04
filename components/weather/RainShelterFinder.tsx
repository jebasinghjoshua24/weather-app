"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { LatLngExpression } from "leaflet";

function isRaining(code?: number | null, precip?: number | null): boolean {
  const c = code ?? -1;
  return [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(c) || (typeof precip === "number" && precip > 0.3);
}

export function RainShelterFinder({
  lat,
  lon,
  weatherCode,
  precipitation,
  onRoute,
  onShelters,
}: {
  lat: number | null;
  lon: number | null;
  weatherCode?: number | null;
  precipitation?: number | null;
  onRoute?: (geometry: LatLngExpression[]) => void;
  onShelters?: (shelters: Array<{ id: string; lat: number; lon: number; name: string }>) => void;
}) {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);

  const sheltersQ = useQuery({
    queryKey: ["shelters", lat, lon],
    queryFn: async (): Promise<Array<{ id: string; lat: number; lon: number; name: string }>> => {
      const res = await fetch(`/api/shelters?lat=${lat}&lon=${lon}&radius=800`);
      if (!res.ok) throw new Error("No shelters");
      const data = (await res.json()) as { shelters: Array<{ id: string; lat: number; lon: number; name: string }> };
      // sort by haversine
      const toRad = (d: number) => (d * Math.PI) / 180;
      const hav = (la1: number, lo1: number, la2: number, lo2: number) => {
        const R = 6371;
        const dLa = toRad(la2 - la1);
        const dLo = toRad(lo2 - lo1);
        const a = Math.sin(dLa / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLo / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };
      return (data.shelters ?? [])
        .map((s) => ({ ...s, km: hav(lat!, lon!, s.lat, s.lon) }))
        .sort((a, b) => (a as unknown as { km: number }).km - (b as unknown as { km: number }).km)
        .slice(0, 5) as Array<{ id: string; lat: number; lon: number; name: string }>;
    },
    enabled: active && lat != null && lon != null,
    staleTime: 60_000,
    retry: 1,
  });

  const routeQ = useQuery({
    queryKey: ["route", lat, lon, selected?.lat, selected?.lon],
    queryFn: async (): Promise<LatLngExpression[]> => {
      if (!selected || lat == null || lon == null) return [];
      const res = await fetch(`/api/route?from=${lat},${lon}&to=${selected.lat},${selected.lon}`);
      if (!res.ok) {
        // fallback straight line
        return [
          [lat, lon],
          [selected.lat, selected.lon],
        ] as LatLngExpression[];
      }
      const data = (await res.json()) as { geometry: LatLngExpression[] };
      return data.geometry;
    },
    enabled: !!selected && lat != null && lon != null,
  });

  useEffect(() => {
    if (routeQ.data && onRoute) onRoute(routeQ.data);
  }, [routeQ.data, onRoute]);

  useEffect(() => {
    if (sheltersQ.data && onShelters) onShelters(sheltersQ.data);
  }, [sheltersQ.data, onShelters]);

  if (!isRaining(weatherCode, precipitation)) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3">
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">Rain Shelter Finder</h3>
      <p className="text-xs text-slate-300">Find a covered spot within 800m and the shortest walk.</p>
      <button
        onClick={() => setActive((v) => !v)}
        className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-900 hover:bg-slate-100"
      >
        {active ? "Hide shelters" : "Find shelter nearby"}
      </button>

      {active && sheltersQ.isPending && <p className="text-sm text-slate-400">Searching shelters…</p>}
      {active && sheltersQ.isError && <p className="text-sm text-rose-300">No shelters found nearby.</p>}
      {active && sheltersQ.data && sheltersQ.data.length === 0 && <p className="text-sm text-slate-400">No covered stops within 800m.</p>}
      {active && sheltersQ.data && sheltersQ.data.length > 0 && (
        <div className="space-y-2">
          {sheltersQ.data.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected({ lat: s.lat, lon: s.lon })}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${selected?.lat === s.lat ? "bg-amber-400 text-slate-900 border-amber-300" : "bg-white/10 text-white border-white/10 hover:bg-white/20"}`}
            >
              <div className="font-semibold">{s.name}</div>
              <div className="text-xs opacity-70">{s.lat.toFixed(4)}, {s.lon.toFixed(4)}</div>
            </button>
          ))}
          {selected && routeQ.isPending && <p className="text-xs text-slate-400">Calculating route…</p>}
        </div>
      )}
    </div>
  );
}

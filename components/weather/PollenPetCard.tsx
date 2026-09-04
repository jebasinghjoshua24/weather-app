"use client";

import { useAirQuality } from "@/hooks/useAirQuality";
import { aqiLevel, pollenLevel, pavementTemp, pawStatus } from "@/lib/pollenPet";

export function PollenPetCard({
  lat,
  lon,
  temperature,
  isDay,
}: {
  lat: number | null;
  lon: number | null;
  temperature?: number | null;
  isDay?: number | null;
}) {
  const { data, isPending, isError } = useAirQuality(lat, lon);
  const aqi = data?.current?.us_aqi;
  const aq = aqiLevel(aqi as number);
  const pollens = [
    data?.current?.alder_pollen,
    data?.current?.birch_pollen,
    data?.current?.grass_pollen,
    data?.current?.mugwort_pollen,
    data?.current?.olive_pollen,
    data?.current?.ragweed_pollen,
  ].filter((v): v is number => typeof v === "number") as number[];
  const maxPollen = pollens.length ? Math.max(...pollens) : null;
  const pollen = pollenLevel(maxPollen);
  const pavement = pavementTemp(temperature ?? null, isDay ?? null);
  const paw = pawStatus(pavement);

  if (isPending) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md text-sm text-slate-400">Loading pollen & pet…</div>;
  }
  if (isError) {
    return <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md text-sm text-slate-400">Pollen & pet unavailable</div>;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md space-y-3" aria-label={`Air ${aq.label}, Pollen ${pollen}, Paw ${paw}`}>
      <h3 className="font-[var(--font-slab)] text-base font-bold text-white">Pollen & Pet Safety</h3>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs uppercase tracking-wider font-mono text-slate-400">AQI</p>
          <p className={`font-bold ${aq.color}`}>{aqi ?? "--"}</p>
          <p className="text-xs text-slate-300">{aq.label}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Pollen</p>
          <p className="font-bold text-white">{pollen}</p>
          <p className="text-xs text-slate-300">{maxPollen != null ? maxPollen.toFixed(1) : "--"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Pavement</p>
          <p className="font-bold text-white">{pavement != null ? `${Math.round(pavement)}°` : "--"}</p>
          <p className={`text-xs ${pavement != null && pavement > 45 ? "text-rose-400 font-bold" : "text-slate-300"}`}>{paw}</p>
        </div>
      </div>
      <p className="text-xs text-slate-400">Asphalt +12°C day / -2°C night vs air temp</p>
    </div>
  );
}

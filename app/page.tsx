"use client";

import { useEffect } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeatherData } from "@/hooks/useWeatherData";
import { usePreferencesStore, tempLabel } from "@/store/usePreferencesStore";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { SearchBar } from "@/components/weather/SearchBar";
import { CurrentWeatherCard, HourlyForecastRow } from "@/components/weather/WeatherCards";
import { RegionalClock } from "@/components/weather/RegionalClock";
import { WeatherBackground } from "@/components/weather/WeatherBackground";
import { WeatherVibe } from "@/components/weather/WeatherVibe";
import { NewsFeed } from "@/components/weather/NewsFeed";
import { DisasterAlerts } from "@/components/disaster/DisasterAlerts";
import { LazyMap } from "@/lib/feature-registry";
import type { EonetEvent } from "@/lib/eonet";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { location, setLocation, setError } = useWeatherStore();
  const { coords, error: geoError, loading: geoLoading, request } = useGeolocation();
  const unit = usePreferencesStore((s) => s.unit);
  const setUnit = usePreferencesStore((s) => s.setUnit);

  // On mount, auto-detect; fallback to DEFAULT_LOCATION
  useEffect(() => {
    if (!location && !coords) request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords && !location) {
      setLocation({ lat: coords.lat, lon: coords.lon, name: "Your location" });
    }
  }, [coords, location, setLocation]);

  useEffect(() => {
    if (geoError) setError(geoError);
  }, [geoError, setError]);

  const lat = location?.lat ?? null;
  const lon = location?.lon ?? null;
  const name = location?.name ?? DEFAULT_LOCATION.name;
  const { data, isPending, isError } = useWeatherData(lat, lon);
  const handleFlyTo = (ev: EonetEvent) => {
    const g = ev.geometry[0];
    if (!g) return;
    const pos = Array.isArray(g.coordinates) && typeof g.coordinates[0] === "number"
      ? { lat: (g.coordinates as number[])[1], lon: (g.coordinates as number[])[0] }
      : null;
    if (pos) setLocation({ lat: pos.lat, lon: pos.lon, name: ev.title });
  };

  return (
    <div className="atmos-scrim">
      <WeatherBackground weatherCode={data?.current.weatherCode} isDay={data?.current.isDay} />
      {/* Floating island nav — high-end: detached pill, not edge-to-edge */}
      <header className="sticky top-6 z-20 mx-auto flex w-[min(100%-1.5rem,72rem)] flex-col gap-3 rounded-[2rem] border border-white/20 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl px-5 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Atmos <span className="ml-2 font-bold normal-case tracking-tighter text-foreground text-xl">Weather, beautifully</span></h1>
        <div className="flex items-center gap-2">
          <SearchBar onPick={(lat, lon, name) => setLocation({ lat, lon, name })} />
          <Button variant="outline" onClick={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")} aria-label="Toggle temperature unit">
            {tempLabel(unit)}
          </Button>
          <Button variant="ghost" onClick={request} disabled={geoLoading} aria-label="Use my location">
            {geoLoading ? "…" : "My location"}
          </Button>
        </div>
      </header>

      <main className="relative mx-auto flex min-h-screen max-w-[72rem] flex-col gap-8 px-4 py-10 md:px-6 md:py-12">
        {location ? (
          <div className="grid grid-cols-12 gap-6">
            {/* Vibe — full width, no eyebrow, headline carries weight */}
            {data && (
              <div className="col-span-12 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)]">
                <WeatherVibe weatherCode={data.current.weatherCode} isDay={data.current.isDay} />
              </div>
            )}

            {/* Asymmetrical bento: Current 8 + Clock 4 */}
            <div className="col-span-12 lg:col-span-8 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_100ms_both]">
              <CurrentWeatherCard data={data} name={name} pending={isPending} error={isError} />
            </div>
            <div className="col-span-12 lg:col-span-4 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_180ms_both]">
              <RegionalClock timeZone={data?.timezone ?? location.timezone} name={name} />
            </div>

            {/* Hourly — full width */}
            {data && (
              <div className="col-span-12 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_260ms_both]">
                <HourlyForecastRow data={data} />
              </div>
            )}

            {/* Map 7 + Disaster 5 — bento rhythm, not two same-size cards */}
            <div className="col-span-12 lg:col-span-7 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_340ms_both]">
              <LazyMap lat={lat!} lon={lon!} name={name} onPick={(a, b, n) => setLocation({ lat: a, lon: b, name: n })} />
            </div>
            <div className="col-span-12 lg:col-span-5 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_420ms_both]">
              <DisasterAlerts location={lat != null && lon != null ? { lat, lon } : null} onFlyTo={handleFlyTo} />
            </div>

            {/* News — full width */}
            <div className="col-span-12 animate-[fadeIn_700ms_cubic-bezier(0.32,0.72,0,1)_500ms_both]">
              <NewsFeed country={location.country ?? null} />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center py-24">
            <p className="text-muted-foreground max-w-[65ch]">Enable location or search for a city to see the weather.</p>
            <Button onClick={() => setLocation({ lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon, name: DEFAULT_LOCATION.name })}>
              Show {DEFAULT_LOCATION.name}
            </Button>
          </div>
        )}

        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center text-xs text-muted-foreground">
          Data by <a className="underline underline-offset-4" href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> (CC BY 4.0) · Mumbai ap-south-1 · Built with Next 16 + RLS
        </footer>
      </main>

      <style>{`@keyframes fadeIn { from { opacity:0; transform: translateY(16px); filter: blur(6px); } to { opacity:1; transform: translateY(0); filter: blur(0); } }`}</style>
    </div>
  );
}

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
      <main className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-6 p-4 md:p-8">
      <header className="sticky top-0 z-20 -mx-4 -mt-4 mb-2 flex flex-col gap-3 border-b border-white/20 bg-white/55 dark:bg-zinc-900/55 backdrop-blur-xl px-4 py-4 sm:-mx-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Atmos <span className="font-bold normal-case tracking-tight text-foreground text-lg ml-2">Weather, beautifully</span></h1>
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

      {location ? (
        <>
          {data && <WeatherVibe weatherCode={data.current.weatherCode} isDay={data.current.isDay} />}
          <CurrentWeatherCard data={data} name={name} pending={isPending} error={isError} />
          <RegionalClock timeZone={data?.timezone ?? location.timezone} name={name} />
          {data && <HourlyForecastRow data={data} />}
          <DisasterAlerts location={lat != null && lon != null ? { lat, lon } : null} onFlyTo={handleFlyTo} />
          <LazyMap lat={lat!} lon={lon!} name={name} onPick={(a, b, n) => setLocation({ lat: a, lon: b, name: n })} />
          <NewsFeed country={location.country ?? null} />
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">Enable location or search for a city to see the weather.</p>
          <Button onClick={() => setLocation({ lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon, name: DEFAULT_LOCATION.name })}>
            Show {DEFAULT_LOCATION.name}
          </Button>
        </div>
      )}

      <footer className="mt-auto border-t border-white/20 pt-4 text-center text-xs text-muted-foreground">
        Data by <a className="underline" href="https://open-meteo.com" target="_blank" rel="noreferrer">Open-Meteo</a> (CC BY 4.0) · Mumbai ap-south-1 · Built with Next 16 + RLS
      </footer>
      </main>
    </div>
  );
}

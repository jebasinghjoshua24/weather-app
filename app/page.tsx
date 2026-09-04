"use client";

import { useEffect, useState } from "react";
import { useWeatherStore } from "@/store/useWeatherStore";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeatherData } from "@/hooks/useWeatherData";
import { usePreferencesStore } from "@/store/usePreferencesStore";
import { DEFAULT_LOCATION } from "@/lib/constants";
import { SearchBar } from "@/components/weather/SearchBar";
import { RegionalClock } from "@/components/weather/RegionalClock";
import { WeatherVibe } from "@/components/weather/WeatherVibe";
import { NewsFeed } from "@/components/weather/NewsFeed";
import { DisasterAlerts } from "@/components/disaster/DisasterAlerts";
import { HorizonSimulator } from "@/components/weather/HorizonSimulator";
import { StargazingScore } from "@/components/weather/StargazingScore";
import { WhatToWear } from "@/components/weather/WhatToWear";
import { LazyMap, LazyAura } from "@/lib/feature-registry";
import { WeatherCanvas, getConditionKey } from "@/components/weather/WeatherCanvas";
import { wmoToDescription } from "@/lib/open-meteo";
import { Button } from "@/components/ui/button";
import {
  Wind,
  Droplets,
  Sun,
  Thermometer,
  Eye,
  MapPin,
  Volume2,
  VolumeX,
  Star,
  Navigation,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

const POPULAR_CITIES = [
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "New York", country: "United States", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357 },
];

function getBackgroundGradient(key: string) {
  switch (key) {
    case "clear_day":
      return "from-sky-400 via-amber-300/40 to-blue-600";
    case "clear_night":
      return "from-slate-950 via-indigo-950 to-sky-900";
    case "partly_cloudy_day":
      return "from-blue-500 via-sky-300 to-slate-600";
    case "partly_cloudy_night":
      return "from-slate-900 via-indigo-900 to-slate-800";
    case "cloudy":
      return "from-slate-700 via-slate-600 to-slate-800";
    case "rain":
      return "from-slate-900 via-blue-950 to-slate-800";
    case "thunderstorm":
      return "from-zinc-950 via-purple-950 to-slate-900";
    case "snow":
      return "from-slate-400 via-cyan-900 to-slate-800";
    case "fog":
      return "from-slate-600 via-zinc-500 to-slate-700";
    default:
      return "from-sky-500 to-indigo-900";
  }
}

function formatTemp(c: number | undefined | null, unit: string) {
  if (c == null) return "--";
  return unit === "F" ? Math.round((c * 9) / 5 + 32) : Math.round(c);
}

export default function HomePage() {
  const { location, setLocation, setError } = useWeatherStore();
  const { coords, error: geoError, request } = useGeolocation();
  const unitPref = usePreferencesStore((s) => s.unit);
  const setUnitPref = usePreferencesStore((s) => s.setUnit);
  const unit = unitPref === "fahrenheit" ? "F" : "C";

  const [isAudioMuted] = useState(true);
  const [favorites, setFavorites] = useState(() => {
    if (typeof window === "undefined") return [DEFAULT_LOCATION];
    try {
      const saved = localStorage.getItem("atmos_favs");
      return saved ? JSON.parse(saved) : [DEFAULT_LOCATION];
    } catch {
      return [DEFAULT_LOCATION];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("atmos_favs", JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    if (!location && !coords) request();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (coords && !location) setLocation({ lat: coords.lat, lon: coords.lon, name: "Your location" });
  }, [coords, location, setLocation]);

  useEffect(() => {
    if (geoError) setError(geoError);
  }, [geoError, setError]);

  const lat = location?.lat ?? null;
  const lon = location?.lon ?? null;
  const name = location?.name ?? DEFAULT_LOCATION.name;
  const { data, isPending, isError } = useWeatherData(lat, lon);

  const conditionKey = data ? getConditionKey(data.current.weatherCode, data.current.isDay) : "clear_day";
  const gradient = getBackgroundGradient(conditionKey);

  const toggleFavorite = () => {
    if (!location) return;
    const exists = favorites.some((f: { name: string }) => f.name === location.name);
    if (exists) setFavorites(favorites.filter((f: { name: string }) => f.name !== location.name));
    else setFavorites([...favorites, { name: location.name, lat: location.lat, lon: location.lon }]);
  };
  const isFav = location ? favorites.some((f: { name: string }) => f.name === location.name) : false;

  return (
    <div className={`min-h-screen relative font-[var(--font-display)] text-slate-100 overflow-x-hidden bg-gradient-to-br ${gradient} transition-all duration-1000 selection:bg-amber-400 selection:text-slate-900`}>
      <WeatherCanvas conditionKey={conditionKey} />
      <LazyAura weatherCode={data?.current.weatherCode} isDay={data?.current.isDay} />

      {(conditionKey.includes("cloud") || conditionKey === "rain" || conditionKey === "thunderstorm") && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-30">
          <div className="absolute -top-20 -left-20 h-[600px] w-[600px] rounded-full bg-slate-300 blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 -right-20 h-[700px] w-[700px] rounded-full bg-slate-400 blur-[140px] animate-pulse" style={{ animationDuration: "8s" }} />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-amber-300">
              <Sun className="h-7 w-7 animate-[spin_18s_linear_infinite]" style={{ animationDuration: "18s" }} />
            </div>
            <div>
              <h1 className="font-[var(--font-slab)] text-2xl font-black tracking-tight text-white">
                ATMOSPHERE
              </h1>
              <p className="text-xs uppercase tracking-wider text-slate-300 font-medium">Dynamic Weather Engine</p>
            </div>
          </div>

          <div className="relative w-full md:w-96">
            <SearchBar onPick={(a, b, n) => setLocation({ lat: a, lon: b, name: n })} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-950/40 p-1 rounded-2xl border border-white/10" role="group" aria-label="Temperature unit">
              <button onClick={() => setUnitPref("celsius")} aria-pressed={unit === "C"} className={`min-h-[32px] px-3 py-2 rounded-xl text-xs font-bold transition-colors duration-200 ${unit === "C" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:text-white"}`}>°C</button>
              <button onClick={() => setUnitPref("fahrenheit")} aria-pressed={unit === "F"} className={`min-h-[32px] px-3 py-2 rounded-xl text-xs font-bold transition-colors duration-200 ${unit === "F" ? "bg-amber-400 text-slate-900 shadow-md" : "text-slate-200 hover:text-white"}`}>°F</button>
            </div>
            <button aria-label="Toggle ambient weather sound" className={`p-3 rounded-2xl border transition-colors duration-200 ${!isAudioMuted ? "bg-amber-400 text-slate-900 border-amber-300" : "bg-slate-900/40 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white"}`}>
              {!isAudioMuted ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button onClick={toggleFavorite} aria-label={isFav ? "Remove from favorites" : "Save location"} aria-pressed={isFav} className={`p-3 rounded-2xl border transition-colors duration-200 ${isFav ? "bg-rose-500 text-white border-rose-400 shadow-lg" : "bg-slate-900/40 text-slate-200 border-white/10 hover:bg-white/10 hover:text-white"}`}>
              <Star className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>
        </header>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="flex items-center gap-1 text-xs uppercase tracking-widest text-slate-300/80 font-mono">
            <MapPin className="h-3.5 w-3.5 text-amber-300" /> Presets:
          </span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c.name}
              onClick={() => setLocation({ lat: c.lat, lon: c.lon, name: c.name })}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-semibold backdrop-blur-md border ${location?.name === c.name ? "bg-white text-slate-900 border-white font-bold shadow-lg scale-105" : "bg-slate-900/30 text-slate-200 border-white/10 hover:bg-white/10"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {isPending && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-slate-900/30 backdrop-blur-md">
            <RefreshCw className="h-10 w-10 animate-spin text-amber-300" />
            <p className="font-[var(--font-slab)] text-lg text-slate-200">Fetching live weather dynamics...</p>
          </div>
        )}

        {isError && (
          <div className="space-y-3 rounded-3xl border border-rose-500/30 bg-rose-950/60 p-6 text-center backdrop-blur-md">
            <ShieldAlert className="mx-auto h-10 w-10 text-rose-400" />
            <h3 className="font-[var(--font-slab)] text-xl font-bold">Unable to load weather data</h3>
            <p className="text-sm text-slate-300">Please try another location.</p>
          </div>
        )}

        {!isPending && !isError && data && location && (
          <div className="space-y-8">
            {data && <WeatherVibe weatherCode={data.current.weatherCode} isDay={data.current.isDay} />}

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-300 font-mono">
                        <Navigation className="h-4 w-4" /> {location.country || "Global"}
                      </div>
                      <h2 className="font-[var(--font-slab)] text-4xl sm:text-6xl font-black tracking-tight text-white">{location.name}</h2>
                      <RegionalClock timeZone={data.timezone ?? location.timezone} name={name} />
                      <div className="flex items-baseline gap-4">
                        <span className="text-7xl sm:text-8xl font-extrabold tracking-tighter text-white font-[var(--font-slab)]">
                          {formatTemp(data.current.temperature, unit)}°
                        </span>
                        <div className="space-y-1">
                          <p className="text-xl font-medium capitalize text-slate-200">{wmoToDescription(data.current.weatherCode)}</p>
                          <p className="text-sm text-slate-300">Feels like <span className="font-bold text-white">{formatTemp(data.current.apparentTemperature ?? data.current.temperature, unit)}°{unit}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6">
                      <Sun className="h-28 w-28 text-amber-300 drop-shadow-[0_10px_25px_rgba(251,191,36,0.3)] animate-pulse" style={{ animationDuration: "4s" }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-300"><span className="text-xs uppercase tracking-wider font-mono">Humidity</span><Droplets className="h-4 w-4 text-sky-400" /></div>
                    <div className="mt-3 font-[var(--font-slab)] text-3xl font-extrabold">{data.current.humidity ?? "--"}%</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-300"><span className="text-xs uppercase tracking-wider font-mono">Wind</span><Wind className="h-4 w-4 text-emerald-400" /></div>
                    <div className="mt-3 font-[var(--font-slab)] text-3xl font-extrabold">{Math.round(data.current.windSpeed)}<span className="text-xs font-sans font-normal text-slate-400"> km/h</span></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-300"><span className="text-xs uppercase tracking-wider font-mono">Pressure</span><Thermometer className="h-4 w-4 text-indigo-400" /></div>
                    <div className="mt-3 font-[var(--font-slab)] text-3xl font-extrabold">{data.current.pressure ? Math.round(data.current.pressure) : "--"}<span className="text-xs font-normal text-slate-400"> hPa</span></div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 backdrop-blur-md">
                    <div className="flex items-center justify-between text-slate-300"><span className="text-xs uppercase tracking-wider font-mono">Cloud</span><Eye className="h-4 w-4 text-slate-300" /></div>
                    <div className="mt-3 font-[var(--font-slab)] text-3xl font-extrabold">{data.current.cloudCover ?? "--"}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-span-12">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/30 backdrop-blur-md">
                    <HorizonSimulator lat={lat!} lon={lon!} timezone={data.timezone} cloudCover={data.current.cloudCover} isDay={data.current.isDay} />
                  </div>
                </div>
                <div className="lg:col-span-4 space-y-6">
                  <StargazingScore cloudCover={data.current.cloudCover} isDay={data.current.isDay} />
                  <WhatToWear
                    temperature={data.current.temperature}
                    windSpeed={data.current.windSpeed}
                    precipitation={data.current.precipitation}
                    weatherCode={data.current.weatherCode}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-7">
                <LazyMap lat={lat!} lon={lon!} name={name} onPick={(a, b, n) => setLocation({ lat: a, lon: b, name: n })} />
              </div>
              <div className="col-span-12 lg:col-span-5">
                <DisasterAlerts location={lat != null && lon != null ? { lat, lon } : null} onFlyTo={(ev) => {
                  const g = ev.geometry[0];
                  if (!g) return;
                  const pos = Array.isArray(g.coordinates) && typeof g.coordinates[0] === "number" ? { lat: (g.coordinates as number[])[1], lon: (g.coordinates as number[])[0] } : null;
                  if (pos) setLocation({ lat: pos.lat, lon: pos.lon, name: ev.title });
                }} />
              </div>
            </div>

            <NewsFeed country={location.country ?? null} />
          </div>
        )}

        {!location && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
            <p className="max-w-[65ch] text-slate-200">Enable location or search for a city to see the weather.</p>
            <Button onClick={() => setLocation({ lat: DEFAULT_LOCATION.lat, lon: DEFAULT_LOCATION.lon, name: DEFAULT_LOCATION.name })}>
              Show {DEFAULT_LOCATION.name}
            </Button>
          </div>
        )}

        <footer className="border-t border-white/10 py-6 text-center font-mono text-xs text-slate-400">ATMOSPHERE • Live Interactive Weather Engine • Open-Meteo Integration</footer>
      </div>
    </div>
  );
}

/**
 * App-wide constants.
 * Why centralize? So "why is the cache 5 minutes?" has one answer, in one place.
 */

// ── API endpoints (proxied via Next.js route handlers where needed) ──
export const OPEN_METEO_BASE = "https://api.open-meteo.com/v1";
export const OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1";
export const RAINVIEWER_API = "https://api.rainviewer.com/public/weather-maps.json";
export const EONET_API = "https://eonet.gsfc.nasa.gov/api/v3";

// ── Cache TTLs (React Query staleTime, in ms) ──
// Think: how long before we ask the server again?
// Current weather changes fast → 5 min. Daily forecast → 1 hour.
export const CACHE_TTL = {
  current: 5 * 60 * 1000,
  hourly: 15 * 60 * 1000,
  daily: 60 * 60 * 1000,
  geocode: 10 * 60 * 1000,
  airQuality: 30 * 60 * 1000,
  eonet: 10 * 60 * 1000,
  rss: 10 * 60 * 1000,
  radar: 5 * 60 * 1000,
} as const;

// ── UI ──
export const DEFAULT_LOCATION = { lat: 40.7128, lon: -74.006, name: "New York" } as const;
export const DEBOUNCE_MS = 300;
export const MAX_RECENT_SEARCHES = 5;
export const MAX_FAVORITES = 10;

// ── Supabase ──
export const SUPABASE_TABLES = {
  profiles: "profiles",
  savedLocations: "saved_locations",
  weatherHistory: "weather_history",
} as const;

// ── Feature flags (flip to true as each feature ships) ──
export const FEATURES = {
  localWeather: true,
  search: true,
  hourlyForecast: true,
  map: true,
  clock: false,
  news: false,
  eonet: false,
  vibe: false,
  aura: false,
  horizon: false,
  stargazing: false,
  whatToWear: false,
  pollenPet: false,
  weatherTwin: false,
  playlist: false,
  radar: false,
  voice: false,
  tts: false,
  postcard: false,
  globe: false,
  pwaDiary: false,
} as const;

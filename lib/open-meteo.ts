/**
 * Open-Meteo client + shared weather types.
 * Why one file? So every feature speaks the same "weather language".
 * If Open-Meteo fields change, we fix them here once.
 */

import { OPEN_METEO_BASE, OPEN_METEO_GEOCODE } from "./constants";

// ── Types ──
export type WeatherCode = number; // 0-99 per WMO

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: WeatherCode;
  isDay: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  weatherCode: number[];
  precipitation: number[];
  humidity: number[];
  windSpeed: number[];
}

export interface DailyForecast {
  time: string[];
  weatherCode: number[];
  tempMax: number[];
  tempMin: number[];
  sunrise: string[];
  sunset: string[];
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  // Optional companions
  airQuality?: Record<string, unknown>;
}

export interface GeocodeResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

// ── Fetcher (server-side or client-side friendly) ──
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day",
    hourly: "temperature_2m,weather_code,precipitation,relative_humidity_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
  });
  return fetchJson<WeatherResponse>(`${OPEN_METEO_BASE}/forecast?${params}`);
}

export async function geocodeSearch(query: string, count = 5): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({ name: query, count: String(count), language: "en", format: "json" });
  const data = await fetchJson<{ results?: GeocodeResult[] }>(`${OPEN_METEO_GEOCODE}/search?${params}`);
  return data.results ?? [];
}

// ── Helpers ──
export function wmoToDescription(code: WeatherCode): string {
  const map: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return map[code] ?? `Weather code ${code}`;
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { coordinatesSchema } from "@/lib/validations";

const querySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const coordCheck = coordinatesSchema.safeParse(parsed.data);
  if (!coordCheck.success) {
    return NextResponse.json({ error: coordCheck.error.issues[0].message }, { status: 422 });
  }
  const { lat, lon } = coordCheck.data;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,surface_pressure",
    hourly: "temperature_2m,weather_code,precipitation,relative_humidity_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max",
    timezone: "auto",
    forecast_days: "7",
  });
  const upstream = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(upstream, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Upstream weather unavailable" }, { status: 502 });
  }
  const raw = (await res.json()) as Record<string, unknown>;
  // Map Open-Meteo raw keys (temperature_2m, wind_speed_10m…) to our friendly shape
  const c = (raw.current ?? {}) as Record<string, unknown>;
  const h = (raw.hourly ?? {}) as Record<string, unknown>;
  const d = (raw.daily ?? {}) as Record<string, unknown>;
  const mapped = {
    latitude: raw.latitude,
    longitude: raw.longitude,
    timezone: raw.timezone ?? "UTC",
    current: {
      temperature: c.temperature_2m ?? c.temperature,
      windSpeed: c.wind_speed_10m ?? c.windSpeed,
      windDirection: c.wind_direction_10m ?? c.windDirection,
      weatherCode: c.weather_code ?? c.weatherCode,
      isDay: c.is_day ?? c.isDay,
      time: c.time,
      humidity: c.relative_humidity_2m,
      apparentTemperature: c.apparent_temperature,
      cloudCover: c.cloud_cover,
      pressure: c.surface_pressure,
      precipitation: c.precipitation,
    },
    hourly: {
      time: h.time ?? [],
      temperature: h.temperature_2m ?? h.temperature ?? [],
      weatherCode: h.weather_code ?? h.weatherCode ?? [],
      precipitation: h.precipitation ?? [],
      humidity: h.relative_humidity_2m ?? h.humidity ?? [],
      windSpeed: h.wind_speed_10m ?? h.windSpeed ?? [],
    },
    daily: {
      time: d.time ?? [],
      weatherCode: d.weather_code ?? d.weatherCode ?? [],
      tempMax: d.temperature_2m_max ?? d.tempMax ?? [],
      tempMin: d.temperature_2m_min ?? d.tempMin ?? [],
      sunrise: d.sunrise ?? [],
      sunset: d.sunset ?? [],
      uvIndexMax: (d as Record<string, unknown>).uv_index_max,
      precipitationSum: (d as Record<string, unknown>).precipitation_sum,
    },
  };
  return NextResponse.json(mapped, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "CDN-Cache-Control": "public, s-maxage=600",
    },
  });
}

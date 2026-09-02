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
    current: "temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day",
    hourly: "temperature_2m,weather_code,precipitation,relative_humidity_2m,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset",
    timezone: "auto",
    forecast_days: "7",
  });
  const upstream = `https://api.open-meteo.com/v1/forecast?${params}`;
  const res = await fetch(upstream, { next: { revalidate: 300 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Upstream weather unavailable" }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "CDN-Cache-Control": "public, s-maxage=600",
    },
  });
}

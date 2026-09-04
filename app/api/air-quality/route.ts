import { NextResponse } from "next/server";
import { z } from "zod";
import { coordinatesSchema } from "@/lib/validations";

const querySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ lat: searchParams.get("lat"), lon: searchParams.get("lon") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const coord = coordinatesSchema.safeParse(parsed.data);
  if (!coord.success) return NextResponse.json({ error: coord.error.issues[0].message }, { status: 422 });
  const { lat, lon } = coord.data;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen",
    timezone: "auto",
    forecast_days: "4",
  });
  const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return NextResponse.json({ error: "Air-quality unavailable" }, { status: 502 });
  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=1800" },
  });
}

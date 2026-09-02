import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  if (!lat || !lon) return NextResponse.json({ error: "lat+lon required" }, { status: 400 });
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
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

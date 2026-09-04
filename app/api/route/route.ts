import { NextResponse } from "next/server";
import { z } from "zod";
import { coordinatesSchema } from "@/lib/validations";

const querySchema = z.object({
  from: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
  to: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ from: searchParams.get("from"), to: searchParams.get("to") });
  if (!parsed.success) return NextResponse.json({ error: "from/to as lat,lon required" }, { status: 400 });
  const [fromLat, fromLon] = parsed.data.from.split(",").map(Number);
  const [toLat, toLon] = parsed.data.to.split(",").map(Number);
  // Range check — prevent 999,999 → upstream DoS
  for (const c of [
    { lat: fromLat, lon: fromLon },
    { lat: toLat, lon: toLon },
  ]) {
    const r = coordinatesSchema.safeParse(c);
    if (!r.success) return NextResponse.json({ error: r.error.issues[0].message }, { status: 422 });
  }

  const url = `https://router.project-osrm.org/route/v1/foot/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return NextResponse.json({ error: "Route unavailable" }, { status: 502 });
  const data = await res.json();
  const route = (data as { routes?: Array<{ geometry: { coordinates: number[][] } }> }).routes?.[0];
  if (!route) return NextResponse.json({ error: "No route" }, { status: 404 });
  // OSRM returns [lon,lat] → Leaflet needs [lat,lon]
  const latlons = route.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
  return NextResponse.json({ geometry: latlons }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" } });
}

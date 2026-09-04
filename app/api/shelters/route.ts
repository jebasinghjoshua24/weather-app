import { NextResponse } from "next/server";
import { z } from "zod";
import { coordinatesSchema } from "@/lib/validations";

const querySchema = z.object({
  lat: z.coerce.number(),
  lon: z.coerce.number(),
  radius: z.coerce.number().int().min(100).max(2000).default(800),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    lat: searchParams.get("lat"),
    lon: searchParams.get("lon"),
    radius: searchParams.get("radius") ?? undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const c = coordinatesSchema.safeParse(parsed.data);
  if (!c.success) return NextResponse.json({ error: c.error.issues[0].message }, { status: 422 });
  const { lat, lon, radius } = parsed.data;

  const query = `[out:json][timeout:10];(node["amenity"="shelter"](around:${radius},${lat},${lon});way["amenity"="shelter"](around:${radius},${lat},${lon});node["building"](around:${radius},${lat},${lon})["shelter"="yes"];way["shelter"="yes"](around:${radius},${lat},${lon});node["covered"="yes"](around:${radius},${lat},${lon}););out center 10;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 30 },
  });
  if (!res.ok) return NextResponse.json({ error: "Shelter service unavailable" }, { status: 502 });
  const data = (await res.json()) as { elements?: Array<Record<string, unknown>> };
  const shelters = (data.elements ?? []).slice(0, 10).map((el) => {
    const e = el as Record<string, unknown>;
    const center = e.center as { lat?: number; lon?: number } | undefined;
    const lat2 = (e.lat as number) ?? center?.lat;
    const lon2 = (e.lon as number) ?? center?.lon;
    const tags = (e.tags ?? {}) as Record<string, string>;
    const name = tags.name || tags.shelter || tags.amenity || "Shelter";
    return { id: String(e.id), lat: lat2, lon: lon2, name, tags };
  }).filter((s) => typeof s.lat === "number" && typeof s.lon === "number");

  return NextResponse.json({ shelters }, { headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } });
}

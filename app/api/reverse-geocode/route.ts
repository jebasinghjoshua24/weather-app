import { NextResponse } from "next/server";
import { coordinatesSchema } from "@/lib/validations";

const NAME_RE = /^[\p{L}\p{N}\s,\-'.]+$/u;

/**
 * Reverse-geocode lat/lon → city name via Open-Meteo.
 * Why same host as forward geocode: one fair-use pool, no new provider.
 * Cache 86400 — city names don't change often.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");

  const parsed = coordinatesSchema.safeParse({
    lat: latRaw ? Number(latRaw) : undefined,
    lon: lonRaw ? Number(lonRaw) : undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }
  const { lat, lon } = parsed.data;

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    language: "en",
  });
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?${params}`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) {
    // Fallback to coords label upstream — don't fail the click
    return NextResponse.json(
      { name: null, country: null },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  }
  const data = (await res.json()) as {
    results?: Array<{ name: string; country?: string }>;
  };
  const first = data.results?.[0];
  let name: string | null = first?.name ?? null;
  // Sanitize — reject payloads with HTML/script
  if (name && !NAME_RE.test(name)) name = null;
  const country = first?.country ?? null;

  return NextResponse.json(
    { name, country },
    { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" } }
  );
}

import { NextResponse } from "next/server";
import { searchQuerySchema } from "@/lib/validations";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const parsed = searchQuerySchema.safeParse(q);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const params = new URLSearchParams({
    name: parsed.data,
    count: "5",
    language: "en",
    format: "json",
  });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, {
    next: { revalidate: 600 },
  });
  if (!res.ok) return NextResponse.json({ error: "Geocode unavailable" }, { status: 502 });
  const data = (await res.json()) as { results?: unknown[] };
  return NextResponse.json(
    { results: data.results ?? [] },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}

import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=20", {
    next: { revalidate: 600 },
  });
  if (!res.ok) return NextResponse.json({ error: "EONET unavailable" }, { status: 502 });
  const data = await res.json();
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" },
  });
}

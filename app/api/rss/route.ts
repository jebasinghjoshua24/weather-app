import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

// Minimal region-aware RSS: global fallback + sanitized.
// Why /api/rss? CORS + XML→JSON + HTML sanitization happen server-side.
const FEEDS: Record<string, string> = {
  global: "https://news.google.com/rss/search?q=weather&hl=en&gl=US&ceid=US:en",
};

export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region") ?? "global";
  const url = FEEDS[region] ?? FEEDS.global;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return NextResponse.json({ error: "RSS unavailable" }, { status: 502 });
  const xml = await res.text();
  // Very small XML→items parser (avoid heavy rss-parser in edge).
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8).map((m) => {
    const block = m[1];
    const get = (tag: string) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "";
    const title = sanitizeHtml(get("title"), { allowedTags: [], allowedAttributes: {} }).trim();
    const link = get("link").trim();
    const pubDate = get("pubDate").trim();
    return { title, link, pubDate };
  });
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}

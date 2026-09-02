import { NextResponse } from "next/server";
import sanitizeHtml from "sanitize-html";

// Region-aware RSS: global fallback + sanitized.
// Why /api/rss? CORS + XML→JSON + HTML sanitization happen server-side.
const FEEDS: Record<string, string> = {
  global: "https://news.google.com/rss/search?q=weather&hl=en&gl=US&ceid=US:en",
  IN: "https://news.google.com/rss/search?q=weather+India&hl=en&gl=IN&ceid=IN:en",
  US: "https://news.google.com/rss/search?q=weather+USA&hl=en&gl=US&ceid=US:en",
  GB: "https://news.google.com/rss/search?q=weather+UK&hl=en&gl=GB&ceid=GB:en",
  JP: "https://news.google.com/rss/search?q=weather+Japan&hl=en&gl=JP&ceid=JP:en",
  AU: "https://news.google.com/rss/search?q=weather+Australia&hl=en&gl=AU&ceid=AU:en",
};

export async function GET(request: Request) {
  const region = new URL(request.url).searchParams.get("region") ?? "global";
  const url = FEEDS[region] ?? FEEDS.global;
  const res = await fetch(url, { next: { revalidate: 600 } });
  if (!res.ok) return NextResponse.json({ error: "RSS unavailable" }, { status: 502 });
  const xml = await res.text();
  // Very small XML→items parser (avoid heavy rss-parser in edge).
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, 5)
    .map((m) => {
      const block = m[1];
      const get = (tag: string) => block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "";
      const title = sanitizeHtml(get("title"), { allowedTags: [], allowedAttributes: {} }).trim();
      const link = get("link").trim();
      // Only allow https links (block javascript: etc)
      if (!link.startsWith("https://")) return null;
      const pubDate = get("pubDate").trim();
      if (!title) return null;
      return { title, link, pubDate };
    })
    .filter(Boolean) as { title: string; link: string; pubDate: string }[];
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}

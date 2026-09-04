import { NextResponse } from "next/server";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { EONET_API } from "@/lib/constants";
import { EONET_CATEGORIES } from "@/lib/eonet";

const querySchema = z.object({
  status: z.enum(["open", "closed", "all"]).default("open"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.enum(EONET_CATEGORIES as unknown as [string, ...string[]]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    category: searchParams.get("category") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { status, limit, category } = parsed.data;

  const params = new URLSearchParams({ status, limit: String(limit) });
  if (category) params.set("category", category);

  const res = await fetch(`${EONET_API}/events?${params}`, { next: { revalidate: 600 } });
  if (!res.ok) return NextResponse.json({ error: "EONET unavailable" }, { status: 502 });

  const data = (await res.json()) as { events?: unknown[]; title?: string; description?: string; link?: string };
  const events = (Array.isArray(data.events) ? data.events : []) as Array<Record<string, unknown>>;

  // Sanitize + https-guard (like rss:16) — title, description, categories
  const sanitized = events
    .map((ev) => {
      const title = typeof ev.title === "string" ? sanitizeHtml(ev.title, { allowedTags: [], allowedAttributes: {} }).trim() : "";
      if (!title) return null;
      const description =
        typeof ev.description === "string" ? sanitizeHtml(ev.description, { allowedTags: [], allowedAttributes: {} }).trim() : null;
      const categories = Array.isArray(ev.categories)
        ? (ev.categories as Array<Record<string, unknown>>).map((c) => ({
            ...c,
            title: typeof c.title === "string" ? sanitizeHtml(c.title as string, { allowedTags: [], allowedAttributes: {} }).trim() : c.title,
          }))
        : ev.categories;
      const sources = Array.isArray(ev.sources)
        ? (ev.sources as Array<Record<string, unknown>>).filter((s) => typeof s.url === "string" && (s.url as string).startsWith("https://"))
        : [];
      return { ...ev, title, description, categories, sources };
    })
    .filter(Boolean);

  return NextResponse.json(
    { ...data, events: sanitized },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=600" } }
  );
}

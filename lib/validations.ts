import { z } from "zod";

/**
 * Input validation with Zod.
 * Why: Every piece of data that comes from a user or URL could be bad.
 * Validating at the door stops bugs and attacks before they get inside.
 * Think: a bouncer checks your ID before you enter the club.
 */

// ── Coordinates ──
export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

// ── Search ──
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "Search cannot be empty")
  .max(100, "Search too long")
  .regex(/^[\p{L}\p{N}\s,\-'.]+$/u, "Search contains invalid characters");

// ── Geocode result ──
export const geocodeResultSchema = z.object({
  id: z.number(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  timezone: z.string().optional(),
});

// ── Weather history / diary ──
export const diaryEntrySchema = z.object({
  locationName: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  snapshot: z.record(z.unknown()), // validated loosely; typed elsewhere
  mood: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
});

// ── Saved location ──
export const savedLocationSchema = z.object({
  name: z.string().min(1).max(100),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  isFavorite: z.boolean().optional(),
});

// ── API query helpers ──
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues.map((i) => i.message).join(", ") };
}

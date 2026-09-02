/**
 * EONET types + helpers — mirrors lib/open-meteo.ts single source of truth.
 * Live shape: events[] with categories, geometry [lon,lat], magnitudeValue/Unit, sources[].url
 */

export const EONET_CATEGORIES = [
  "drought",
  "dustHaze",
  "earthquakes",
  "floods",
  "landslides",
  "manmade",
  "seaLakeIce",
  "severeStorms",
  "snow",
  "tempExtremes",
  "volcanoes",
  "waterColor",
  "wildfires",
] as const;
export type EonetCategoryId = (typeof EONET_CATEGORIES)[number];

export interface EonetGeometry {
  date: string;
  type: "Point" | "Polygon";
  coordinates: number[] | number[][][]; // Point [lon,lat], Polygon [[[lon,lat]…]]
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
}

export interface EonetCategory {
  id: EonetCategoryId;
  title: string;
}

export interface EonetSource {
  id: string;
  url: string;
}

export interface EonetEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  closed: string | null;
  categories: EonetCategory[];
  sources: EonetSource[];
  geometry: EonetGeometry[];
}

export interface EonetResponse {
  title: string;
  description: string;
  link: string;
  events: EonetEvent[];
}

// ── Haversine (km) — why here? Client-side distance filter (EONET has no lat/lon query) ──
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function eventLatLon(ev: EonetEvent): { lat: number; lon: number } | null {
  const g = ev.geometry[0];
  if (!g) return null;
  if (g.type === "Point" && Array.isArray(g.coordinates) && typeof g.coordinates[0] === "number") {
    const [lon, lat] = g.coordinates as number[];
    if (typeof lat === "number" && typeof lon === "number") return { lat, lon };
  }
  if (g.type === "Polygon" && Array.isArray(g.coordinates)) {
    // First ring first point as centroid fallback
    const ring = (g.coordinates as number[][][])[0];
    const first = ring?.[0];
    if (first && typeof first[0] === "number") return { lat: first[1], lon: first[0] };
  }
  return null;
}

export function isSevere(ev: EonetEvent): boolean {
  const g = ev.geometry[0];
  if (!g || g.magnitudeValue == null || !g.magnitudeUnit) return false;
  if (g.magnitudeUnit === "kts" && g.magnitudeValue >= 64) return true; // hurricane-force
  if (g.magnitudeUnit === "acres" && g.magnitudeValue >= 1000) return true;
  return false;
}

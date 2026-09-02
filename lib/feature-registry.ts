"use client";

import dynamic from "next/dynamic";
import { FEATURES } from "@/lib/constants";

/**
 * Feature registry — the ONLY place that couples a feature flag to a
 * `dynamic()` import. Why? A static `import { Globe }` would bundle the
 * 500kB `three` + `globe.gl` into the home page even when FEATURES.globe
 * is false. This registry keeps the flag and the lazy boundary together,
 * so `next build` tree-shakes the heavy chunk until the user visits /globe.
 *
 * Think: a warehouse door that only opens when you actually need the forklift.
 */

// ── Leaflet map (home page, Phase 1) — ssr:false because Leaflet touches `window`
export const LazyMap = FEATURES.map
  ? dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
      ssr: false,
      loading: () => null,
    })
  : () => null;

// ── Globe (full-screen /globe, Phase 4) — also window-only
export const LazyGlobe = FEATURES.globe
  ? dynamic(() => import("@/components/globe/GlobeView").then((m) => m.GlobeView), {
      ssr: false,
      loading: () => null,
    })
  : () => null;

// ── Radar ( /radar route, Phase 4)
export const LazyRadar = FEATURES.radar
  ? dynamic(() => import("@/components/radar/RadarView").then((m) => m.RadarView), {
      ssr: false,
      loading: () => null,
    })
  : () => null;

// ── Aura / particles (Phase 2) — light, but still lazy
export const LazyAura = FEATURES.aura
  ? dynamic(() => import("@/components/weather/AtmosphericAura").then((m) => m.AtmosphericAura), {
      ssr: false,
      loading: () => null,
    })
  : () => null;

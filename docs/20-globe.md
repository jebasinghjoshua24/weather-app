# 20 — 3D Mini-Globe (globe.gl) (60-sec)

**In 60 seconds:** A small interactive globe shows your city pin. Drag to spin, scroll to zoom. No key, lazy-loaded so home stays fast.

## How it works

1. `components/globe/GlobeView.tsx` uses `globe.gl` (Three.js) via `dynamic(ssr:false)`. On mount, `Globe()(ref).globeImageUrl(...).pointsData([{lat,lon}])`.
2. `LazyGlobe` in `lib/feature-registry` ensures `500kB` three only loads on `/globe` or when toggled, not on home.

## Why

- `globe.gl` over raw Three.js: 10 lines vs 200 lines for same globe, auto handles texture, controls, points.

## Algorithm

1. `useEffect` → `const globe = Globe()(el).globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg").pointLat("lat").pointLng("lon")`.
2. `globe.controls().autoRotate = true`.

## What could go wrong

| Case | What we do |
|---|---|
| No WebGL | Show "Globe unavailable" |

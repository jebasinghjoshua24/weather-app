# 04 — Interactive Location Map + Reverse-Geocode (60-sec)

**In 60 seconds:** You see a small Leaflet map pinned at your weather location. Search Mumbai → pin flies to Mumbai. Tap anywhere on the map → it asks "What city is this?" (reverse-geocode), then weather + clock update to that spot. The map is lazy — it only loads when the flag is on, so the home page stays fast.

## How it works

1. `FEATURES.map` (default `false`) → `lib/feature-registry.ts:17` `LazyMap = FEATURES.map ? dynamic(MapView, {ssr:false}) : () => null` — Leaflet touches `window`, so `ssr:false` is required. When `false`, home never bundles Leaflet.
2. `app/page.tsx:61` renders `<LazyMap lat lon name onPick={setLocation} />` as child of `useWeatherData` cascade (same store as F1/F5).
3. `MapView` mounts `MapContainer([lat,lon], zoom 10)` → `TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")` → `Marker([lat,lon])` + `Popup(name)`. On `lat/lon` prop change → `map.flyTo([lat,lon], 10)`.
4. On map click: `useMapEvents({click(e){ onPick debounced }})` → `hooks/useReverseGeocode.ts:4` fetches `GET /api/reverse-geocode?lat&lon` → `app/api/reverse-geocode:7` validates `coordinatesSchema:11`, calls `https://geocoding-api.open-meteo.com/v1/reverse?latitude=&longitude=&language=en`, sanitizes `name` via same regex as `searchQuerySchema:17`, caches `86400` (city names don't change), returns `{name, country}` or `{name:null}` → fallback `"Map pin 19.07, 72.87"`.
5. `onPick(lat,lon, reverseName)` → `useWeatherStore.setLocation` → `useWeatherData` + `useRegionalClock` refetch → cards + clock update.

## Every function

| Function | What | Inputs | Outputs | File |
|---|---|---|---|---|
| `LazyMap` | Flag-gated `dynamic()` import | `FEATURES.map` | Component or `null` | `lib/feature-registry.ts:17` |
| `MapView({lat,lon,name,onPick})` | Leaflet map + flyTo + click | `lat,lon,name,onPick` | JSX | `components/map/MapView.tsx:1` |
| `GET /api/reverse-geocode` | Validates → reverse fetch → sanitize → cache | `lat,lon` | `{name, country} \| {name:null}` | `app/api/reverse-geocode/route.ts:7` |
| `useReverseGeocode(lat,lon,enabled)` | Query wrapper for click | `lat,lon,enabled` | `{data,isPending}` | `hooks/useReverseGeocode.ts:4` |

## Why we built it this way

### Problem
We need a visual anchor that lets users explore. Mapbox/Google need API keys + billing + token proxy; static image tiles need no key but must not bloat the bundle.

### Options

| Option | Key | Bundle | Cost | Verdict |
|---|---|---|---|---|
| Mapbox GL | required | `~500kB` | 50k free then $ | heavy, needs proxy |
| Google Maps | required | `~300kB` | pay-go | key leak risk |
| **`Leaflet+OSM` (chosen)** | **none** | **`~140kB` + `15kB` CSS** | **free** | `react-leaflet@5.0.0` supports React 19, no key, CSP already done |

### Why reverse via Open-Meteo `v1/reverse`
Same host as forward geocode (`geocoding-api.open-meteo.com`), same fair-use 600/min, no new provider. `Nominatim` would be second host + stricter `1/s` rate limit. Fallback to coords label keeps UX instant even if reverse 502.

### Real-world (5-year-old)
Like a wall map with a pin. Move the pin, the teacher tells you the city name, and the weather report updates.

## Algorithm (click)

1. `map.on("click", e => { lat=e.latlng.lat; lon=e.latlng.lng })`.
2. Debounce 400ms (avoid drag-click storm).
3. `fetch(/api/reverse-geocode?lat&lon)` → `coordinatesSchema` validate → `GET https://geocoding-api.open-meteo.com/v1/reverse?latitude=&longitude=&language=en&count=1` → `revalidate:86400`.
4. Sanitize `name` via `/^[\p{L}\p{N}\s,\-'.]+$/u` → if fail or empty → `null`.
5. `onPick(lat,lon, name ?? \`${lat.toFixed(2)}, ${lon.toFixed(2)}\`)`.

## What could go wrong

| Case | What we do |
|---|---|
| `lat/lon` NaN / out-of-range | Don't mount Leaflet, show skeleton "Map unavailable" |
| Reverse 502 / no results | Use coords label, still update weather |
| `name` contains `<svg onload>` | Regex rejects → fallback coords label (never `innerHTML`) |
| `FEATURES.map:false` | `LazyMap` is `() => null` (never bundles) |
| Attribution | Leaflet's OSM attribution kept visible (license) |
| Mobile tap vs drag | 400ms debounce distinguishes |

## How we stay safe

- No `dangerouslySetInnerHTML` in popups (React escapes `name`).
- `coordinatesSchema:11` rejects `lat>90`/`lon>180` before upstream.
- CSP `next.config.mjs:25` already allow-lists `*.tile.openstreetmap.org`.
- OSM tiles are public, no key to leak.

## How we test it

- Unit `reverse-geocode.test.ts`: valid → `{name}`, out-of-range → 422, upstream 502.
- Integration `MapView.test.tsx`: `onPick` called with correct latlng.
- E2E `map.spec.ts`: search Mumbai → pin near `19.07,72.87`; click map → location name updates to reverse result or coords.
